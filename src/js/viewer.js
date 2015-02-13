/**
 * This module takes care of all image visualization and user interface.
 *
 * An object of the Viewer class expects an array of image file objects where
 * each object contains the following properties:
 * -id: String unique identifier
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
    // viewer container's ID
    this.wholeContID = containerID;
    // thumbnail container's ID
    this.thumbnailContID = 'viewthumbnail';
    // renderers container's ID
    this.rendersContID =  'viewrenders';
    // 2D renderers
    this.renders2D = [];
    // insert initial html
    this._initInterface();

  };


  /**
   * Append initial html interface to the viewer container.
   */
  viewer.Viewer.prototype._initInterface = function() {
    var self = this;

    // Initially the interface only contains the renderers container
    $('#' + this.wholeContID).css({ position: "relative" }).append(
      '<div id="' + this.rendersContID + '"></div>' );

    // jQuery UI options object for droppable elems
    // ui-droppable CSS class is by default added to the element
    var drop_opts = {
      scope: self.rendersContID, // restrict dropping only for draggable items that have the same scope str
      // hoverClass: string representing one or more CSS classes to be added  when an accepted
      // element moves into it

      //event handlers
      // ui.helper is the jQuery obj of the dropped elem
      // ui.draggable is the jQuery object of the clicked elem (but not necessarily the elem that moves)
      drop: function(evt, ui) {
        $(ui.draggable).css({ display:"none", left: 0 });
      }
    };
    // make the renderers container droppable and sortable
    $('#' + this.rendersContID).droppable(drop_opts).sortable();

  };

  /**
   * Create and add thumbnail bar to the viewer container.
   */
  viewer.Viewer.prototype.addThumbnailBar = function() {
    var self = this;

    if ($('#' + this.thumbnailContID).length) {
      return; // thumbnailbar already exists
    }

    // function to read the thumbnails'url so it can be assigned to the src of <img>
    function readThumbnailUrl(fileObj, callback) {
      var reader = new FileReader();

      reader.onload = function() {
        callback(reader.result, fileObj.name);
      };

      reader.readAsDataURL(fileObj);
    }

    // callback to append new img elem
    function createImgElm(url, altText) {
      $('#' + self.thumbnailContID).append(
          '<img src="' + url + '" alt="' + altText.substr(-8) + '" title="' + altText + '">'
      );
    }

    // append thumbnail div to the whole container
    $('#' + this.wholeContID).append(
      '<div id="' + this.thumbnailContID + '"></div>'
    );

    // jQuery UI options object for droppable elems
    var drop_opts = {
      scope: self.thumbnailContID,
      /*drop: function(evt, ui) {

      }*/
    };
    // make the thumbnails container droppable and sortable
    $('#' + this.thumbnailContID).droppable(drop_opts).sortable();

    // jQuery UI options object for draggable elems
    // ui-draggable CSS class is added to movable elems and ui-draggable-dragging is
    // added to elem being moved
    var drag_opts = {
      cursor: 'pointer',
      scope: self.rendersContID, // restrict drop only on items that have the same scope str
      revert: 'invalid', // returns if dropped on an element that does not accept it
      axis: 'x', // displacement only possible in x (horizontal) direction
      containment: self.wholeContID, // within which the displacement takes place
    };
    // make img elems within the thumbnails container draggable
    $('#' + this.thumbnailContID + ' img').draggable(drag_opts);

    var imgFileObj;
    for (var i=0; i<this.imgFileArr.length; i++) {
      imgFileObj = this.imgFileArr[i];
      if (imgFileObj.thumbnail) {
        readThumbnailUrl(imgFileObj.thumbnail, createImgElm);
      } else {
        createImgElm(' ', imgFileObj.files[0].name);
      }
    }

    // make space for the thumbnail window
    $('#' + this.rendersContID).css({ width: "calc(100% - 112px)" });

  };

  /**
   * Create and add 2D renderer to the UI.
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.add2DRender = function(orientation) {
    var render = new X.renderer2D();
    var renderID = 'viewrender2D' + this.renders2D.length;

    $('#' + this.rendersContID).append('<div id="' + renderID + '"></div>');
    render.container = renderID;
    render.bgColor = [0.2, 0.2, 0.2];
    render.orientation = orientation;
    render.init();
    this.position2DRender(render.container);
    this.renders2D.push(render);
  };


  /**
   * Destroy all objects and remove html interface
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.destroy = function() {

    // destroy XTK renderers
    for (var render in this.renders2D) {
      render.destroy();
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
