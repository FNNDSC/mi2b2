/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a viewerjs.Viewer object for visualization and collaboration.
 * The app can contain several viewerjs.Viewer objects which will be displayed in different tabs.
 * A new viewer tab can also be started by joining an existing realtime collaboration among
 * remote viewerjs.Viewer instances.
 */

// define a new module
define(['utiljs', 'gcjs', 'viewerjs'], function(util, cjs, viewerjs) {

  // Provide a namespace
  var mi2b2 = mi2b2 || {};

  mi2b2.App = function() {

      // client ID from the Google's developer console
      this.CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';

      // Viewer object array
      this.views = [];
      this.nviews = 0;

      var self = this;

      // Init jQuery UI tabs

      self.tabs = $('#tabs').tabs({ beforeActivate: function() {

        for (var i=0; i<self.views.length; i++) {

          if (self.views[i] && self.views[i].chat && self.views[i].chat.isOpen()) {
            self.views[i].chat.close();
          }
        } }
      });

      self.tabs = $('#tabs').tabs({ activate: function(event, ui) {
        var viewId = ui.newPanel.attr('id');

        if (viewId!=='tabload') {
          var viewNum = parseInt(viewId.replace('tabviewer', ''));

          if (self.views[viewNum].chat) {
            self.views[viewNum].chat.open();
          }
        }

        util.documentRepaint();}
      });

      // close icon: removing the tab on click
      self.tabs.delegate( "span.ui-icon-close", "click", function() {

        var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
        var pStrL= panelId.length;
        var ix = parseInt(parseInt(panelId.charAt(pStrL-2)) ? panelId.substr(pStrL-2) : panelId.charAt(pStrL-1));

        self.views[ix].destroy();
        self.views[ix] = null;
        self.nviews--;
        
        $( "#" + panelId ).remove();
        self.tabs.tabs( "refresh" );
      });

      //directoryselection
      $('#directoryselection').on('dragenter', function () {
        $('.directory-btn').addClass('dragged');
      });
      $('#directoryselection').on('dragmonve', function () {
        $('.directory-btn').addClass('dragged');
      });
      $('#directoryselection').on('dragleave', function () {
        $('.directory-btn').removeClass('dragged');
      });

      // Event handler for the collab button
      $('#collabbutton').click(function() {

        $(this).hide();
        // show it
        $('.collab > .collab-input').css("display","inline-block");
        $('#roomId').focus();

        self.init();

        // create a collaborator object,
        var collab = new cjs.GDriveCollab(self.CLIENT_ID);

        // request GDrive authorization and load the realtime Api
        collab.authorizeAndLoadApi(true, function(granted) {
          var goButton = document.getElementById('gobutton');
          var roomIdInput = document.getElementById('roomId');

          if (granted && roomIdInput.value) {

            // realtime API ready.
            goButton.onclick = function() {
              $('.collab > .collab-input').hide();
              $(this).show();


              var view = self.addView(collab);

              // start the collaboration as an additional collaborator
              view.collab.joinRealtimeCollaboration(roomIdInput.value);
            };

          } else {

            goButton.onclick = function() {

              // start the authorization flow.
              collab.authorizeAndLoadApi(false, function(granted) {

                if (granted && roomIdInput.value) {

                  // realtime API ready.
                  var view = self.addView(collab);

                  // start the collaboration as an additional collaborator
                  view.collab.joinRealtimeCollaboration(roomIdInput.value);
                }
              });
            };
          }
        });
      });

      // Event handler for the README button
      $('#READMEbutton').click(function() {
        window.open('https://github.com/FNNDSC/mi2b2/blob/master/README.md');
      });

      // Event handler for the directory loader button
      var dirBtn = document.getElementById('dirbtn');

      dirBtn.onchange = function(e) {
        var files = e.target.files;
        var fileObj;

        self.changeUIonDataLoad('loading');
        self.init();
        self._totalNumFiles = files.length;

        for (var i=0; i<self._totalNumFiles; i++) {

          fileObj = files[i];

          if ('webkitRelativePath' in fileObj) {

            fileObj.fullPath = fileObj.webkitRelativePath;

          } else if (!('fullPath' in fileObj)) {

            fileObj.fullPath = fileObj.name;
          }

          self.addFile(fileObj);
        }
      };

      // Event handlers for the dropzone
      var dropzone = document.getElementById('tabload');

      dropzone.ondragenter = function(e) {
        e.preventDefault();
      };

      dropzone.ondragover = function(e) {
        e.preventDefault();
      };

      dropzone.ondrop = function(e) {
        var files = [];
        var fileObj;
        var i;

        e.preventDefault();
        self.changeUIonDataLoad('loading');
        self.init();

        if (!e.dataTransfer.items) {

          // browser is not chrome

          if (e.dataTransfer.files) {

            files = e.dataTransfer.files;
            self._totalNumFiles = files.length;

            for (i=0; i<self._totalNumFiles; i++) {

              fileObj = files[i];

              if (!('fullPath' in fileObj)) {
                fileObj.fullPath = fileObj.name;
              }

              if ((!fileObj.size) && (!fileObj.type)) {

                alert('It seems that a folder has been dropped: "'+ fileObj.name +
                '". Only the Chrome bowser supports dropping of folders. Files inside will be ignored!');
              }
              self.addFile(fileObj);
            }

          } else {

            alert('Unsuported browser');
          }

          return;
        }

        // chrome browser

        // array to control when the entire directory tree has been read. This
        // happens when all it's entries are different from zero
        var hasBeenRead = [];

        function readFiles(entry) {
          var pos = hasBeenRead.length;
          var dirEntries = [];

          hasBeenRead[pos] = 0;

          function readingDone() {
            hasBeenRead[pos] = 1;

            //check whether all files in the directory tree have already been added
            for (var i=0; i<hasBeenRead.length; i++) {

              if (hasBeenRead[i] === 0) {
                break;
              }
            }

            if (i >= hasBeenRead.length) {

              // all files have been read
              self._totalNumFiles = files.length;

              if (self._totalNumFiles) {

                for (var j=0; j<self._totalNumFiles; j++) {
                  self.addFile(files[j]);
                }

              } else{

                self.changeUIonDataLoad('loaded');
              }
            }
          }

          function read(dirReader) {

            dirReader.readEntries(function(entries) {

              if (entries.length) {

                dirEntries = dirEntries.concat(entries);
                read(dirReader); //keep calling read recursively untill receiving an empty array

              } else {

                var idx = dirEntries.length; //manage empty dir
                while (idx--) { //recursively read last entry until all have been read
                  readFiles(dirEntries[idx]);
                }
                readingDone();
              }
            });
          }

          if (entry.isFile) {

            entry.file(function(file){

              file.fullPath = entry.fullPath;
              files.push(file);
              readingDone();
            });

          } else if (entry.isDirectory) {

            var reader = entry.createReader();

            //read all entries within this directory
            read(reader);
          }
        }

        for (i = 0; i<e.dataTransfer.items.length; i++) {
          readFiles(e.dataTransfer.items[i].webkitGetAsEntry());
        }

      };

    };

    /**
     * Initilize the app internal data for a new Viewer object
     */
    mi2b2.App.prototype.init = function() {

      // Source data array for the new Viewer object
      this._imgFileArr = [];

      // Current number of files already added
      this._numFiles = 0;

      // Total number of files to be added
      this._totalNumFiles = 0;
    };

    /**
     * Add file into internal data structures
     *
     * @param {Object} HTML5 File object.
     */
    mi2b2.App.prototype.addFile = function(fileObj) {

      this._imgFileArr.push({
        'url': fileObj.fullPath,
        'file': fileObj
      });

      ++this._numFiles; // a new file was added

      if (this._numFiles === this._totalNumFiles) {

        // all files have been read, so add a new viewer
        // create a collaborator object to enable realtime collaboration
        var collab = new cjs.GDriveCollab(this.CLIENT_ID);

        this.addView(collab);
      }
    };

    /**
     * Add a new viewer to the list of viewers and append its GUI.
     *
     * @param {Object} optional collaborator object to enable realtime collaboration.
     */
    mi2b2.App.prototype.addView = function(collaborator) {

      var viewNum = this.views.length;
      var viewId = 'viewer' + viewNum;
      var tabContentId = 'tabviewer' + viewNum;

      // add a new tab with a close icon
      $('div#tabs ul').append('<li><a href="#' + tabContentId + '">' + 'Viewer' + (viewNum+1) +
        '</a><span class="ui-icon ui-icon-close" role=presentation>Remove Tab</span></li>');

      $('div#tabs').append('<div id="' + tabContentId  + '"></div>');

      $("div#tabs").tabs("refresh");

      // append viewer div
      $('#' + tabContentId).append('<div id="' + viewId + '" class="viewer-container">');

      // instantiate a new viewerjs.Viewer object
      // a collaborator object is only required if we want to enable realtime collaboration.
      var view = new viewerjs.Viewer(viewId, collaborator);

      if (this._imgFileArr.length) {

        // start the viewer
        view.init(this._imgFileArr);
        view.addThumbnailsBar();
        view.addToolBar();

        this.changeUIonDataLoad('loaded');
      }

      this.views.push(view);
      ++this.nviews;

      $('#tabs').tabs("option", "active", this.nviews);

      return view;
    };

    /**
     * Change UI elements to indicate a data loading state
     *
     * @param {String} state string ('loading', 'loaded').
     */
    mi2b2.App.prototype.changeUIonDataLoad = function(stateStr) {
      var buttonUIJq = $('.directory-btn');

      if (stateStr === 'loading') {

        buttonUIJq.text('Loading...');

      } else if (stateStr === 'loaded') {

        buttonUIJq.html('<i class="fa fa-download fa-2x"></i>');
        $('.directory-btn').removeClass('dragged');
      }
    };

  return mi2b2;
});
