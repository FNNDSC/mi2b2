/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a Viewer object for visualization and collaboration.
 */

// Provide a namespace
var app = app || {};

  app.App = function() {

    // Init jQuery UI tabs
    $('#tabs').tabs();
    $('#tabs').tabs("disable", 1);

    // Source data array for the Viewer object
    this._imgFileArr = [];
    // Current number of files already added
    this._numFiles = 0;
    // Total number of files to be added
    this._totalNumFiles = 0;
    // Viewer object
    this.view = null;

    var self = this;

    // Event handler for the directory loader button
    var dirBtn = document.getElementById('dirbtn');
    dirBtn.onchange = function(e) {
      var files = e.target.files;
      var fileObj;

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

        if (entry.isFile) {
          entry.file(function(file){
            file.fullPath = entry.fullPath;
            files.push(file);
            readingDone();
          });
        } else if (entry.isDirectory) {
          //read all entries within this directory
          var dirEntries = [];
          var dirReader = entry.createReader();

          function read() {
            dirReader.readEntries(function(entries) {
              if (entries.length) {
                dirEntries = dirEntries.concat(entries);
                read(); //keep calling read recursively untill receiving an empty array
              } else {
                var idx = dirEntries.length; //manage empty dir
                while (idx--) { //recursively read last entry until all have been read
                  readFiles(dirEntries[idx]);
                }
                readingDone();
              }
            });
          }

          read();
        }
      }

      for (i = 0; i<e.dataTransfer.items.length; i++) {
        readFiles(e.dataTransfer.items[i].webkitGetAsEntry());
      }

    };


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
    var self = this;

    // Instantiate a new Viewer object
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
    this.view = new viewer.Viewer('viewercontainer');
    this.view.init(this._imgFileArr, function() {
      self.view.addThumbnailBar();
      self.view.addToolBar();
    });

    $('#tabs').tabs("enable", 1).tabs("option", "active", 1);
  };
