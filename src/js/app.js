/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a Viewer object for visualization and collaboration.
 * The app can contain several Viewer objects which will be displayed in different tabs.
 */

// Provide a namespace
var app = app || {};

  app.App = function() {

    // Viewer object array
    this.views = [];
    var self = this;

    // Init jQuery UI tabs
    this.tabs = $('#tabs').tabs({ activate: function() {viewer.documentRepaint();} });
    // close icon: removing the tab on click
    this.tabs.delegate( "span.ui-icon-close", "click", function() {
      var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
      var ix = parseInt(panelId.charAt(panelId.length-1));

      this.views[ix].destroy();
      this.views.splice(ix, 1);
      $( "#" + panelId ).remove();
      self.tabs.tabs( "refresh" );
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
        self.add(fileObj);
      }
    };

    // Event handlers for the dropzone
    var dropzone = document.getElementById('directoryselection');

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
            self.add(fileObj);
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
            for (var j=0; j<self._totalNumFiles; j++) {
              self.add(files[j]);
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
  app.App.prototype.init = function() {
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
  app.App.prototype.add = function(fileObj) {
    this._imgFileArr.push({
      'url': fileObj.fullPath,
      'file': fileObj
    });
    ++this._numFiles; //a new file was added
    if (this._numFiles === this._totalNumFiles) {
      // all files have been read, so create the viewer object
      this.createView();
    }
  };

  /**
   * Create Viewer object
   */
  app.App.prototype.createView = function() {
    var view;
    var nviews = this.views.length;
    var tabContentId = 'tabviewer' + nviews;
    var viewId = 'viewer' + nviews;

    // add a new tab with a close icon
    $('div#tabs ul').append('<li><a href="#' + tabContentId + '">' + 'Viewer' + (nviews + 1) +
      '</a><span class="ui-icon ui-icon-close" role=presentation>Remove Tab</span></li>');
    $('div#tabs').append('<div id="' + tabContentId  + '"></div>');
    $("div#tabs").tabs("refresh");

    // append viewer div
    $('#' + tabContentId).append('<div id="' + viewId + '" class="viewer-container tabcontent">');
    // Instantiate a new Viewer object
    view = new viewer.Viewer(this._imgFileArr, viewId);
    view.addThumbnailBar();
    view.addToolBar();
    this.views.push(view);
    this.changeUIonDataLoad('loaded');
    $('#tabs').tabs("option", "active", nviews + 1);
  };

  /**
   * Change UI elements to indicate a data loading state
   *
   * @param {String} state string ('loading', 'loaded').
   */
  app.App.prototype.changeUIonDataLoad = function(stateStr) {
    var buttonUIJq = $('.directory-btn');

    if (stateStr === 'loading') {
      buttonUIJq.text('Loading...');
    } else if (stateStr === 'loaded') {
      buttonUIJq.text('Drop a folder (or click)');
    }
  };
