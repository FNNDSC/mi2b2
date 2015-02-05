/**
 *
 * mi2b2 app
 *
 */

// Provide a namespace
var app = app || {};

  app.App = function() {

    // Multidimensional associative array with ordered DICOM file names
    this._dcmData = {};
    // Number of DICOM files
    this._numDicoms = 0;
    // Number of files that are not DICOMs
    this._numNotDicoms = 0;
    // Source data array for the Viewer object
    this._imgFileArr = [];
    // Total number of files
    this._numFiles = 0;
    // Viewer object
    this.view = null;

    var self = this;

    // Event handler for the directory loader button
    var dirBtn = document.getElementById('dirbtn');
    dirBtn.onchange = function(e) {
      var files = e.target.files;
      var fileObj;

      self._numFiles = files.length;
      if (self._numFiles && !(('fullPath' in files[0]) ||
        ('webkitRelativePath' in files[0]) || ('mozFullPath' in files[0]))) {

        alert('Unsuported browser');
        return;
      }

      for (var i=0; i<self._numFiles; i++) {
        fileObj = files[i];
        if ('webkitRelativePath' in fileObj) {
          fileObj.fullPath = fileObj.webkitRelativePath;
        } else if ('mozFullPath' in fileObj) {
          fileObj.fullPath = fileObj.mozFullPath;
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
      e.preventDefault();

      if (!e.dataTransfer.items) {
          if(e.dataTransfer.files){
            var files = e.dataTransfer.files;
            var fileObj;

            self._numFiles = files.length;
            if (self._numFiles && !(('fullPath' in files[0]) || ('mozFullPath' in files[0]))) {
              alert('Unsuported browser');
              return;
            }
            for (var i=0; i<self._numFiles; i++) {
              fileObj = files[i];
              fileObj.fullPath = fileObj.mozFullPath;
              self.add(fileObj);
            }
          } else {
            alert('Unsuported browser');
          }
          return;
      }

      var length = e.dataTransfer.items.length;
      // array to control when the entire tree has been read. This happens when
      // all it's entries are different from zero
      var hasBeenRead = [];
      var files = [];

      function readFiles(entry) {
        var pos = hasBeenRead.length;
        hasBeenRead[pos] = 0;

        function readingDone() {
          hasBeenRead[pos] = 1;
          for (var i=0; i<hasBeenRead.length; i++) {
            if (hasBeenRead[i] == 0) {
              break;
            }
          }
          if (i >= hasBeenRead.length) {
            self._numFiles = files.length;
            for (i=0; i<self._numFiles; i++) {
              self.add(files[i]);
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
          var dirReader = entry.createReader();
          dirReader.readEntries(function(entries){
            var idx = entries.length; //manage empty dir
            while (idx--) { //read last entry until all have been read
              readFiles(entries[idx]);
            }
            readingDone();
          });
        }
      }

      for (var i = 0; i<length; i++) {
        readFiles(e.dataTransfer.items[i].webkitGetAsEntry());
      }

    }

  };

  /**
   * Add file into internal data structures
   *
   * @param {Object} HTML5 File object.
   */
  app.App.prototype.add = function(fileObj) {
    var path = fileObj.fullPath;
    var baseUrl = path.substring(0, path.lastIndexOf('/') + 1);
    var imgType = viewer.Viewer.imgType(fileObj);

    if (imgType !== 'unsupported') {
      if (imgType === 'dicom') {
        this.parseDicom(fileObj);
      } else {
        // push fibers, meshes and volumes into this._imgFileArr
        this._imgFileArr.push({
          'baseUrl': baseUrl,
          'thumbnail': fileObj.name,
          'imgType': imgType,
          'files': [fileObj]
        });
      }
      ++this._numNotDicoms;
      // if all files have been added then create view
      if (this._numDicoms + this._numNotDicoms == this._numFiles) {
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

    reader.onload = function(ev) {
      var arrayBuffer = reader.result;
      // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
      // Uint8Array so we create that here
      var byteArray = new Uint8Array(arrayBuffer);
      // Invoke the parseDicom function and get back a DataSet object with the contents
      var dataSet, patientID, studyInstanceUID, seriesInstanceUID, sopInstanceUID;
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
        if (!self._dcmData[patientID]) {
          self._dcmData[patientID] = {};
        }
        if (!self._dcmData[patientID][studyInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID] = {};
        }
        if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID] = {};
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['baseUrl'] = baseUrl;
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['files'] = [];
        }
        if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID]) {
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['files'].push(fileObj);
          self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID] = filename;
        }
        ++self._numDicoms;
        // if all files have been added then create view
        if (self._numDicoms + self._numNotDicoms == self._numFiles) {
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
    // Push ordered DICOMs into this._imgFileArr
    for (var patient in this._dcmData) {
      for (var study in this._dcmData[patient]) {
        for (var series in this._dcmData[patient][study]) {
          this._imgFileArr['volume'].push({
            'baseUrl': this._dcmData[patient][study][series]['baseUrl'],
            'thumbnail': this._dcmData[patient][study][series]['files'][0].name,
            'imgType': 'dicom',
            'files': this._dcmData[patient][study][series]['files']
          });
        }
      }
    }

    // Instantiate a new Viewer object
    if (this.view) {
      //this.view.destroy();
      this.view = null;
    }
    this.view = new viewer.Viewer(this._imgFileArr, 'viewercontainer');
    //app.view.connect(feedID);
  };
