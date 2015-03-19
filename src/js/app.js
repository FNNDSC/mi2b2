/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) and pass
 * them to a Viewer object for visualization and collaboration. DICOM files are
 * previously sorted by patientID, studyInstanceUID, seriesInstanceUID using
 * chafey's dicomParser: https://github.com/chafey/dicomParser.
 */

// Provide a namespace
var app = app || {};

  app.App = function() {

    // Init jQuery UI tabs
    $('#tabs').tabs();
    $('#tabs').tabs("disable", 1);

    // Multidimensional associative array with ordered DICOM files
    this._dcmData = {};
    // Number of DICOM files
    this._numDicoms = 0;
    // Number of files that are not DICOMs
    this._numNotDicoms = 0;
    // Source data array for the Viewer object
    this._imgFileArr = [];
    // Total number of files
    this._numFiles = 0;
    // Associative array of thumbnail image files
    this._thumbnails = {};
    // Viewer object
    this.view = null;

    // temporal demo code
    this._jsons = {};

    var self = this;

    // Event handler for the directory loader button
    var dirBtn = document.getElementById('dirbtn');
    dirBtn.onchange = function(e) {
      var files = e.target.files;
      var fileObj;

      self._numFiles = files.length;
      for (var i=0; i<self._numFiles; i++) {
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

        if(e.dataTransfer.files){
          files = e.dataTransfer.files;
          self._numFiles = files.length;
          for (i=0; i<self._numFiles; i++) {
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

      // array to control when the entire tree has been read. This happens when
      // all it's entries are different from zero
      var hasBeenRead = [];

      function readFiles(entry) {
        var pos = hasBeenRead.length;
        hasBeenRead[pos] = 0;

        function readingDone() {
          hasBeenRead[pos] = 1;
          for (var i=0; i<hasBeenRead.length; i++) {
            if (hasBeenRead[i] === 0) {
              break;
            }
          }
          if (i >= hasBeenRead.length) {
            self._numFiles = files.length;
            for (var j=0; j<self._numFiles; j++) {
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
                read(); //keep calling read untill receiving an empty array
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
    var path = fileObj.fullPath;
    var imgType = viewer.Viewer.imgType(fileObj);
    var dashIndex;

    if (imgType === 'dicom') {
      // parse the dicom file
      this.parseDicom(fileObj);
    } else {
      if (imgType === 'thumbnail') {
        // save thumbnail file in an associative array
        // array keys are the full path up to the first dash in the file name or the last period
        dashIndex = path.indexOf('-', path.lastIndexOf('/'));
        if (dashIndex === -1) {
          this._thumbnails[path.substring(0, path.lastIndexOf('.'))] = fileObj;
        } else {
          this._thumbnails[path.substring(0, dashIndex)] = fileObj;
        }
      } else if (imgType === 'json') {
        // temporal demo code
        // array keys are the full path with the extension trimmed
        this._jsons[path.substring(0, path.lastIndexOf('.'))] = fileObj;

      } else if (imgType !== 'unsupported') {
        // push fibers, meshes and volumes into this._imgFileArr
        this._imgFileArr.push({
          'baseUrl': path.substring(0, path.lastIndexOf('/') + 1),
          'imgType': imgType,
          'files': [fileObj]
        });
      }
      ++this._numNotDicoms;
      // if all files have been added then create view
      if (this._numDicoms + this._numNotDicoms === this._numFiles) {
        this.createView();
      }
    }

  };

  /**
   * Parse and organize DICOM files by patientID, studyInstanceUID,
   * seriesInstanceUID, sopInstanceUID
   *
   * @param {Object} HTML5 File object.
   */
  app.App.prototype.parseDicom = function(fileObj) {
    var reader = new FileReader();
    var self = this;

    reader.onload = function() {
      var arrayBuffer = reader.result;
      // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
      // Uint8Array so we create that here
      var byteArray = new Uint8Array(arrayBuffer);
      // Invoke the parseDicom function and get back a DataSet object with the contents
      var dataSet, patientID, studyInstanceUID, seriesInstanceUID, sopInstanceUID, dicomInfo;
      var path = fileObj.fullPath;
      var baseUrl = path.substring(0, path.lastIndexOf('/') + 1);
      var filename = fileObj.name;

      try {
        dataSet = dicomParser.parseDicom(byteArray);
        // Access any desire property using its tag
        patientID = dataSet.string('x00100020');
        studyInstanceUID = dataSet.string('x0020000d');
        seriesInstanceUID = dataSet.string('x0020000e');
        sopInstanceUID = dataSet.string('x00080018');
        dicomInfo = {
          patientName: dataSet.string('x00100010'),
          patientId: patientID,
          patientBirthDate: dataSet.string('x00100030'),
          patientAge: dataSet.string('x00101010'),
          patientSex: dataSet.string('x00100040'),
          seriesDescription: dataSet.string('x0008103e'),
          manufacturer: dataSet.string('x00080070'),
          studyDate: dataSet.string('x00080020'),
          //orientation: dataSet.string('x00200037'),
          //primarySliceDirection: dataSet.string('x00200032')
        }
        if (!self._dcmData[patientID]) {
          self._dcmData[patientID] = {};
        }
        if (!self._dcmData[patientID][studyInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID] = {};
        }
        if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID] = {};
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['baseUrl'] = baseUrl;
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['dicomInfo'] = dicomInfo;
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['files'] = [];
        }
        if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['files'].push(fileObj);
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID] = filename;
        }
        ++self._numDicoms;
        // if all files have been added then create view
        if (self._numDicoms + self._numNotDicoms === self._numFiles) {
          self.createView();
        }
      } catch(err) {
        alert('File ' + path + ' Error - ' + err);
      }
    };
    reader.readAsArrayBuffer(fileObj);
  };

  /**
   * Create Viewer object
   */
  app.App.prototype.createView = function() {
    var path, name;

    // Push ordered DICOMs into this._imgFileArr
    for (var patient in this._dcmData) {
      for (var study in this._dcmData[patient]) {
        for (var series in this._dcmData[patient][study]) {
          this._imgFileArr.push({
            'baseUrl': this._dcmData[patient][study][series]['baseUrl'],
            'imgType': 'dicom',
            'dicomInfo': this._dcmData[patient][study][series]['dicomInfo'],
            'files': this._dcmData[patient][study][series]['files']
          });
        }
      }
    }

    // Add thumbnail images
    for (var i = 0; i < this._imgFileArr.length; i++) {
      for (var j = 0; j < this._imgFileArr[i].files.length; j++) {
        // Search for a thumbnail with the same name as the current neuroimage file
        path = this._imgFileArr[i].files[j].fullPath;
        name = path.substring(0, path.lastIndexOf('.'));
        if (this._thumbnails.hasOwnProperty(name)) {
          this._imgFileArr[i].thumbnail = this._thumbnails[name];
        }

        //temporal demo code
        if(this._jsons.hasOwnProperty(name)) {
          this._imgFileArr[i].json = this._jsons[name];
        }

      }
    }
    // Instantiate a new Viewer object
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
    this.view = new viewer.Viewer(this._imgFileArr, 'viewercontainer');
    this.view.addThumbnailBar();
    this.view.addToolBar();
    $('#tabs').tabs("enable", 1).tabs("option", "active", 1);
    //app.view.connect(feedID);
  };
