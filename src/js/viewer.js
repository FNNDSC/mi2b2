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
    // current number of renderers
    this.numOfRenders = 0;
    // insert initial html
    this._initInterface();

  };


  /**
   * Append initial html interface to the viewer container.
   */
  viewer.Viewer.prototype._initInterface = function() {
    var self = this;

    // Initially the interface only contains the renderers' container which in turn contains a
    // single renderer that loads and displays the first volume in this.imgFileArr

    $('#' + this.wholeContID).css({ position: "relative" }).append(
      '<div id="' + this.rendersContID + '"></div>' );

    // jQuery UI options object for droppable elems
    // ui-droppable CSS class is by default added to the elem
    var drop_opts = {
      scope: this.rendersContID, // restrict dropping only for draggable items that have the same scope
      // hoverClass: string representing one or more CSS classes to be added  when an accepted
      // elem moves into it

      //event handlers
      // ui.helper is the jQuery obj of the dropped elem
      // ui.draggable is the jQuery object of the clicked elem (but not the elem that moves)
      drop: function(evt, ui) {

        if (self.numOfRenders < self.maxNumOfRenders) {
          // a dropped thumbnail image disappears from thumbnail bar
          var id = parseInt($(ui.draggable).css({ display:"none" }).attr("id").replace("viewth",""));
          // add a renderer to the UI
          self.add2DRender(self.getImgFileObject(id), 'Y');
        } else {
          alert('Reached maximum number of renders allow which is 4. You must drag a render out ' +
           'of the viewer window and drop it into the thumbnails bar to make a render available');
        }

      }
    };

    // make the renderers container droppable and float it so it can contain floated elems
    $('#' + this.rendersContID).droppable(drop_opts).css({ float: "left" });

    // load and render the first volume in the list
    for (var i=0; i<this.imgFileArr.length; i++) {
      if (this.imgFileArr[i].imgType==='vol' || this.imgFileArr[i].imgType==='dicom') {
        this.add2DRender(this.imgFileArr[i], 'Y');
      }
      break;
    }

  };

  /**
   * Create and add 2D renderer with a loaded volume to the UI.
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.add2DRender = function(imgFileObj, orientation) {
    var render, vol, containerID;
    var filedata = [];
    var numFiles = 0;
    var fileNames = [];

    // append render div to the renderers container
    containerID = 'viewrender2D' + imgFileObj.id;
    $('#' + this.rendersContID).append('<div id="' + containerID + '"></div>');

    // render div is floated within the renderers' container
    $('#' + containerID).css({
      "border-style": "solid",
      "box-sizing": "border-box",
      "float": "left"
    });

    // jQuery UI options object for draggable elems
    // ui-draggable CSS class is added to movable elems and ui-draggable-dragging is
    // added to the elem being moved
    var drag_opts = {
      cursor: 'pointer',
      scope: this.thumbnailContID, // restrict drop only on items that have the same scope str
      revert: 'invalid', // returns if dropped on an element that does not accept it
      axis: 'x', // displacement only possible in x (horizontal) direction
      containment: '#' + this.wholeContID, // CSS selector within which elem the displacement is restricted
      helper: 'clone', // We actually move a clone of the elem rather than the elem itself
      appendTo: '#' + this.thumbnailContID, // CSS selector given the receiver container for the moved clone

      //event handlers
      // ui.helper is the jQuery obj of the dragged elem
      start: function(evt, ui) {

        // make dimensions of the moving clone the same as the corresponding thumbnail img
        var jqTh = $('#' + containerID.replace("viewrender2D", "viewth"));
        var h = jqTh.css("height");
        var w = jqTh.css("width");
        ui.helper.css( {height: h, width: w} );
      }
    };

    // make div elem draggable
    $('#' + containerID).draggable(drag_opts);

    // rearrange layout
    ++this.numOfRenders;
    this.positionRenders();

    // create xtk objects
    render = new X.renderer2D();
    render.container = containerID;
    render.bgColor = [0.2, 0.2, 0.2];
    render.orientation = orientation;
    render.init();

    for (var i=0; i<imgFileObj.files.length; i++) {
      fileNames[i] = imgFileObj.files[i].name;
    }
    vol = new X.volume();
    vol.reslicing = 'false';
    vol.file = fileNames.sort().map(function(str) {
      return imgFileObj.baseUrl + str;});

    // add xtk 2D renderer to the list of current UI renders
    this.renders2D.push(render);

    // define function to read a file into filedata array
    function readFile(fileObj, pos) {
      var reader = new FileReader();

      reader.onload = function() {
        filedata[pos] = reader.result;
        ++numFiles;

        if (numFiles===imgFileObj.files.length) {
          vol.filedata = filedata;
          viewer.documentRepaint();
          render.add(vol);
          // start the rendering
          render.render();

        }
      };

      reader.readAsArrayBuffer(fileObj);
    }

    // read all neuroimage files in imgFileObj.files
    for (i=0; i<imgFileObj.files.length; i++) {
      readFile(imgFileObj.files[i], i);
    }

  };

  /**
   * Remove 2D renderer from the UI.
   *
   * @param {String} renderer's container.
   */
  viewer.Viewer.prototype.remove2DRender = function(containerID) {

    // find and destroy xtk objects and remove the renderer's div from the UI
    for (var i=0; i<this.renders2D.length; i++) {
      if (this.renders2D[i].q.id === containerID) {
        this.renders2D[i].destroy();
        this.renders2D.splice(i, 1);
        $('#' + containerID).remove();
        --this.numOfRenders;
        this.positionRenders();
        break;
      }
    }

  };

  /**
   * Rearrange renderers in the UI layout.
   */
  viewer.Viewer.prototype.positionRenders = function() {
    var jqRenders = $('#' + this.rendersContID + ' div');

    switch(this.numOfRenders) {
      case 1:
        jqRenders.css({
          width: "100%",
          height: "100%",
        });
      break;

      case 2:
        jqRenders.css({
          width: "50%",
          height: "100%",
        });
      break;

      case 3:
        jqRenders.css({
          width: "50%",
          height: "50%",
        });
        jqRenders[2].style.width = "100%";
      break;

      case 4:
        jqRenders.css({
          width: "50%",
          height: "50%",
        });
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

    // make the thumbnails container droppable and sortable
    var drop_opts = {
      scope: this.thumbnailContID,

      //event handlers
      // ui.helper is the jQuery obj of the dropped elem
      // ui.draggable is the jQuery object of the clicked elem (but not the elem that moves)
      drop: function(evt, ui) {

        var id = $(ui.draggable).attr("id");
        // display the dropped renderer's thumbnail
        $('#' + id.replace("viewrender2D", "viewth")).css({ display:"" });
        self.remove2DRender(id);

      }
    };

    $('#' + this.thumbnailContID).droppable(drop_opts).sortable();

    // load thumbnail images
    var imgFileObj;
    for (var i=0; i<this.imgFileArr.length; i++) {
      imgFileObj = this.imgFileArr[i];
      if (imgFileObj.thumbnail) {
        readThumbnailUrl(imgFileObj, createImgElm);
      } else {
        createImgElm(imgFileObj.id, imgFileObj.files[0].name);
      }
    }

    // make img elems within the thumbnails container draggable
    var drag_opts = {
      cursor: 'pointer',
      scope: this.rendersContID,
      revert: 'invalid',
      axis: 'x',
      containment: '#' + this.wholeContID,
      helper: 'clone',
      appendTo: '#' + this.rendersContID,

      //event handlers
      // ui.helper is the jQuery obj of the dragged elem
      start: function(evt, ui) {

        // make the moving clone with the same dimensions as the original
        var jqTh = $(this);
        var h = jqTh.css("height");
        var w = jqTh.css("width");
        ui.helper.css( {height: h, width: w} );
      }
    };

    $('#' + this.thumbnailContID + ' img').draggable(drag_opts);

    // if there is a renderer already loaded in the UI then hide its thumbnail image
    var thID = $('#' + this.rendersContID + ' div').attr("id").replace("viewrender2D", "viewth");
    $('#' + thID).css({ display:"none" });

    // make space for the thumbnail window
    $('#' + this.rendersContID).css({ width: "calc(100% - 112px)" });

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
   * Return image file object given its id
   *
   * @param {Number} Integer number between 0 and this.imgFileArr.length-1.
   */
  viewer.Viewer.prototype.getImgFileObject = function(id) {
    return this.imgFileArr[id];
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

  /**
   * Module utility function. Repaint the document
   */
  viewer.documentRepaint = function() {
    var ev = document.createEvent('Event');
    ev.initEvent('resize', true, true);
    window.dispatchEvent(ev);
  };
