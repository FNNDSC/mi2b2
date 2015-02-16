/**
 * This module takes care of all image visualization and user interface.
 *
 * An object of the Viewer class expects an array of image file objects where
 * each object contains the following properties:
 * -baseUrl: String ‘directory/containing/the/files’
 * -thumbnail: HTML5 File object (for a thumbnail image)
 * -imgType: String neuroimage type. Any of the possible values returned by viewer.Viewer.imgType
 * -files: Array of HTML5 File objects (it contains a single file for formats other than DICOM)
 */

// Provide a namespace
var viewer = viewer || {};

  viewer.Viewer = function(imgFileArr, containerID) {

    this.version = 0.0;
    // array of image file objects
    this.imgFileArr = imgFileArr;
    // assign an id to each array elem
    for (var i=0; i<this.imgFileArr.length; i++) {
      this.imgFileArr[i].id = i;
    }
    // viewer container's ID
    this.wholeContID = containerID;
    // thumbnail container's ID
    this.thumbnailContID = 'viewthumbnail';
    // renderers container's ID
    this.rendersContID =  'viewrenders';
    // 2D renderers
    this.renders2D = [];
    // maximum number of renderers
    this.maxNumOfRenders = 4;
    // insert initial html
    this._initInterface();

  };


  /**
   * Append initial html interface to the viewer container.
   */
  viewer.Viewer.prototype._initInterface = function() {
    var self = this;

    // Initially the interface only contains the renderers container which in turn contains a
    // renderer that loads and displays the first volume in this.imgFileArr

    $('#' + this.wholeContID).css({ position: "relative" }).append(
      '<div id="' + this.rendersContID + '"></div>' );

    // jQuery UI options object for droppable elems
    // ui-droppable CSS class is by default added to the element
    var drop_opts = {
      scope: self.rendersContID, // restrict dropping only for draggable items that have the same scope str
      // hoverClass: string representing one or more CSS classes to be added  when an accepted
      // elem moves into it

      //event handlers
      // ui.helper is the jQuery obj of the dropped elem
      // ui.draggable is the jQuery object of the clicked elem (but not necessarily the elem that moves)
      drop: function(evt, ui) {
        // a dropped thumbnail returns to its initial pos and disappears from thumbnail bar
        $(ui.draggable).css({ display:"none", left: 0 });
      }
    };
    // make the renderers container droppable and sortable
    $('#' + this.rendersContID).droppable(drop_opts).sortable();

    // jQuery UI options object for draggable elems
    // ui-draggable CSS class is added to movable elems and ui-draggable-dragging is
    // added to the elem being moved
    var drag_opts = {
      cursor: 'pointer',
      scope: self.thumbnailContID, // restrict drop only on items that have the same scope str
      revert: 'invalid', // returns if dropped on an element that does not accept it
      axis: 'x', // displacement only possible in x (horizontal) direction
      containment: self.wholeContID, // within which elem the displacement takes place
    };
    // make div elems within the renderers container draggable
    $('#' + this.rendersContID + ' div').draggable(drag_opts);

    // load and render the first volume in the list
    for (var i=0; i<this.imgFileArr.length; i++) {
      if (this.imgFileArr[i].imgType==='vol' || this.imgFileArr[i].imgType==='dicom') {
        this.add2DRender(this.imgFileArr[i], 'Y');
        var jqThObj = $('#viewth' + this.imgFileArr[i].id);
        // if there is a thumbnail for this vol then hide it from the thumbnail bar
        if (jqThObj.length) {
          jqThObj.css({ display:"none"});
        }
      }
      break;
    }

  };

  /**
   * Create and add thumbnail bar to the viewer container.
   */
  viewer.Viewer.prototype.addThumbnailBar = function() {
    var self = this;

    if ($('#' + this.thumbnailContID).length) {
      return; // thumbnailbar already exists
    }

    // define function to read the thumbnails' url so it can be assigned to the src of <img>
    function readThumbnailUrl(imgFileObj, callback) {
      var fileObj = imgFileObj.thumbnail;
      var reader = new FileReader();

      reader.onload = function() {
        callback(imgFileObj.id, fileObj.name, reader.result);
      };

      reader.readAsDataURL(fileObj);
    }

    // callback to append new img elem
    function createImgElm(id, altText, url) {
      if (url === undefined) {
        url = ' ';
      }
      $('#' + self.thumbnailContID).append(
          '<img id="viewth' + id + '" src="' + url + '" alt="' + altText.substr(-8) + '" title="' + altText + '">'
      );
    }

    // append thumbnail div to the whole container
    $('#' + this.wholeContID).append(
      '<div id="' + this.thumbnailContID + '"></div>'
    );

    var drop_opts = {
      scope: self.thumbnailContID,
      /*drop: function(evt, ui) {

      }*/
    };
    // make the thumbnails container droppable and sortable
    $('#' + this.thumbnailContID).droppable(drop_opts).sortable();

    var drag_opts = {
      cursor: 'pointer',
      scope: self.rendersContID,
      revert: 'invalid',
      axis: 'x',
      containment: self.wholeContID,
    };
    // make img elems within the thumbnails container draggable
    $('#' + this.thumbnailContID + ' img').draggable(drag_opts);

    var imgFileObj;
    for (var i=0; i<this.imgFileArr.length; i++) {
      imgFileObj = this.imgFileArr[i];
      if (imgFileObj.thumbnail) {
        readThumbnailUrl(imgFileObj, createImgElm);
      } else {
        createImgElm(imgFileObj.id, imgFileObj.files[0].name);
      }
    }

    // make space for the thumbnail window
    $('#' + this.rendersContID).css({ width: "calc(100% - 112px)" });

  };

  /**
   * Create and add 2D renderer with a loaded volume to the UI.
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.add2DRender = function(imgFileObj, orientation) {
    var render, containerID;
    var filedata = [];
    var numFiles = 0;

    // define function to read a file into filedata array
    function readFile(fileObj, pos) {
      var reader = new FileReader();

      reader.onload = function() {
        filedata[pos] = reader.result;
        ++numFiles;
        if (numFiles===imgFileObj.files.length) {
          render.volume.filedata = filedata;
          render.add(render.volume);
          // start the rendering
          render.render();

        }
      };
      reader.readAsArrayBuffer(fileObj);
    }

    if (this.renders2D.length < this.maxNumOfRenders) {
      render = new X.renderer2D();
      containerID = 'viewrender2D' + imgFileObj.id;

      $('#' + this.rendersContID).append('<div id="' + containerID + '"></div>');
      this.positionRenders();
      render.container = containerID;
      render.bgColor = [0.2, 0.2, 0.2];
      render.orientation = orientation;
      render.init();
      render.volume = new X.volume();
      render.volume.reslicing = 'false';

      // read all neuroimage files in imgFileObj.files
      for (var i=0; i<imgFileObj.files.length; i++) {
        readFile(imgFileObj.files[i], i);
      }
      // add 2D renderer to the list of current UI renders
      this.renders2D.push(render);
    }

  };

  /**
   * Remove 2D renderer from the UI.
   *
   * @param {String} renderer's container.
   */
  viewer.Viewer.prototype.remove2DRender = function(containerID) {

    for (var i=0; i<this.renders2D.length; i++) {
      if (this.renders2D[i].container === containerID) {
        this.renders2D[i].remove(this.renders2D[i].volume);
        this.renders2D[i].destroy();
        this.renders2D.splice(i, 1);
        $('#' + containerID).remove();
        this.positionRenders();
        break;
      }
    }

  };


  /**
   * Destroy all objects and remove html interface
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.destroy = function() {

    // destroy XTK renderers
    for (var i=0; i<this.renders2D.length; i++) {
      this.renders2D[i].destroy();
    }
    this.renders2D = [];

    // remove html
    $('#' + this.wholeContID).empty();
  };


  /**
   * Static method to determine if a File object is a supported neuroimage type.
   * Return the type of the image: 'dicom', 'vol', 'fibers', 'mesh', 'thumbnail'
   * or 'unsupported'
   *
   * @param {Object} HTML5 File object
   */
  viewer.Viewer.imgType = function(fileObj) {
    var ext = {};
    var type;

    // dicom extensions
    ext.DICOM = ['.dcm', '.ima', '.DCM', '.IMA'];
    // volume extensions
    ext.VOL = ['.mgh', '.mgz', '.nrrd', '.nii', '.nii.gz'];
    // fibers extension is .trk
    ext.FIBERS = ['.trk'];
    // geometric model extensions
    ext.MESH = ['obj', 'vtk', 'stl'];
    // thumbnail extensions
    ext.THUMBNAIL = ['png', 'gif'];

    if (viewer.strEndsWith(fileObj.name, ext.DICOM)) {
      type = 'dicom';
    } else if (viewer.strEndsWith(fileObj.name, ext.VOL)) {
      type = 'vol';
    } else if (viewer.strEndsWith(fileObj.name, ext.FIBERS)) {
      type = 'fibers';
    } else if (viewer.strEndsWith(fileObj.name, ext.MESH)) {
      type = 'mesh';
    } else if (viewer.strEndsWith(fileObj.name, ext.MESH)) {
      type = 'thumbnail';
    } else {
      type = 'unsupported';
    }

    return type;
  };

  /**
   * Module utility function. Return true if the string str ends with any of the
   * specified suffixes in arrayOfStr otherwise return false
   *
   * @param {String} input string
   * @param {Array} array of string suffixes
   */
  viewer.strEndsWith = function(str, arrayOfStr) {
    var index;

    for (var i=0; i<arrayOfStr.length; i++) {
      index = str.lastIndexOf(arrayOfStr[i]);
      if ((index !== -1) && ((str.length-index) === arrayOfStr[i].length)) {
        return true;
      }
    }
    return false;
  };
