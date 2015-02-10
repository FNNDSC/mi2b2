/**
 * This module takes care of all image visualization and user interface.
 *
 * An object of the Viewer class expects an array of image file objects where
 * each object contains the following properties:
 * -id: String unique identifier
 * -baseUrl: String ‘directory/containing/the/files’
 * -thumbnail: HTML5 File object (for a thumbnail image)
 * -imgType: String neuroimage type. Any of the possible values returned by viewer.Viewer.imgType
 * -files: Array of HTML5 File objects (it contains a single file for formats
 *  other than DICOM)
 */

// Provide a namespace
var viewer = viewer || {};

  viewer.Viewer = function(imgFileArr, containerID) {

    this.version = 0.0;
    // array of image file objects
    this.imgFileArr = imgFileArr;
    // viewer container's ID
    this.wholeContID = containerID;
    // insert initial html
    this._initInterface();
    // thumbnail container's ID
    this.thumbnailContID = 'viewthumbnail';
    // renderers container's ID
    this.rendersContID =  'viewrenders';
    // Initially the interface only contains the renderers container
    $('#' + this.wholeContID).css({ position: "relative" }).append(
      '<div id="viewrenders"></div>' );
    // 2D renderers
    this.renders2D = [];


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
   * Create and add thumbnail bar to the UI.
   */
  viewer.Viewer.prototype.addThumbnailBar = function() {

    if ($('#' + this.thumbnailContID).length) {
      return; // thumbnailbar already exists
    }

    // read the thumbnail url so it can be assigned to the src attribute of <img>
    function readThumbnailUrl(fileObj, callback) {
      var reader = new FileReader();

      reader.onload = function() {
        callback(reader.result);
      };

      reader.readAsDataURL(fileObj);
    }

    $('#' + this.wholeContID).append(
      '<div id="' + this.thumbnailContID + '">' +
        '<ul> </ul>' +
      '</div>'
    );

    var jqUl = $('#' + this.thumbnailContID).css({ width: "10%" }).draggable().
    droppable().resizable().children("ul");

    function createImgElm(url) {
      jqUl.append(
        '<li>' +
          '<img src=>"' + url + '" alt=' + imgFile.thumbnail.name + '>' +
        '</li>' );
    }

    for (var imgFile in this.imgFileArr) {
      readThumbnailUrl(imgFile.thumbnail, createImgElm);
    }

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
