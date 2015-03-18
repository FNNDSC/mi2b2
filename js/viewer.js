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
    // tool bar container's ID
    this.toolContID = 'viewtoolbar';
    // thumbnail container's ID
    this.thumbnailContID = 'viewthumbnailbar';
    // renderers container's ID
    this.rendersContID =  'viewrenders';
    // 2D renderer objects
    this.renders2D = [];
    // whether renderers' events are linked
    this.rendersLinked = false;
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

    $('#' + this.wholeContID).css({
      "position": "relative",
      "margin": 0,
      "-webkit-box-sizing": "border-box",
      "-moz-box-sizing": "border-box",
      "box-sizing": "border-box"
      }).append('<div id="' + this.rendersContID + '"></div>' );

    $('#' + this.rendersContID).addClass("sortable");

    // jQuery UI options object for sortable elems
    // ui-sortable CSS class is by default added to the containing elem
    // an elem being moved is assigned the ui-sortable-helper class
    var sort_opts = {
      cursor: 'move',
      //distance: '10', // required moving distance before the displacement is taken into account
      containment: '#' + this.wholeContID, // CSS selector within which elem the displacement is restricted
      appendTo: '#' + this.thumbnailContID, // CSS selector given the receiver container for the moved clone
      connectWith: ".sortable",
      dropOnEmpty: true,

      helper: function (evt, target) {
        var id = target.attr("id");
        var thWidth =  $('.view-thumbnail').css("width");
        var thHeight = $('.view-thumbnail').css("height");

        // the moving helper is a clone of the corresponding thumbnail
        return $('#' + id.replace("viewrender2D", "viewth")).clone().css({
          display:"block",
          width: thWidth,
          height: thHeight });
      },

      //event handlers
      start: function() {
        // thumbnails' scroll bar has to be removed to make the moving helper visible
        $('#' + self.thumbnailContID).css({ overflow: "visible" });
      },

      beforeStop: function(evt, ui) {
        if (ui.placeholder.parent().attr("id") === self.thumbnailContID) {
          $(this).sortable("cancel");
          var id = ui.item.attr("id");
          // display the dropped renderer's thumbnail
          $('#' + id.replace("viewrender2D", "viewth")).css({ display:"block" });
          self.remove2DRender(id);
        }
        // restore thumbnails' scroll bar
        $('#' + self.thumbnailContID).css({ overflow: "auto" });
      }
    };

    // make the renderers container sortable
    $('#' + this.rendersContID).sortable(sort_opts);

    // load and render the first volume in the list
    for (var i=0; i<this.imgFileArr.length; i++) {
      if (this.imgFileArr[i].imgType==='vol' || this.imgFileArr[i].imgType==='dicom') {
        this.add2DRender(this.imgFileArr[i], 'Z');
        break;
      }
    }

  };

  /**
   * Create and add a 2D renderer with a loaded volume to the UI.
   *
   * @param {Oject} Image file object.
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.add2DRender = function(imgFileObj, orientation) {
    var render, vol, containerID;
    var filedata = [];
    var numFiles = 0;
    var self = this;

    // append renderer div to the renderers container
    // the renderer's id is related to the imgFileObj's id
    containerID = 'viewrender2D' + imgFileObj.id;
    $('#' + this.rendersContID).append(
      '<div id="' + containerID + '" class="view-render">' +
        '<div class="view-render-info view-render-info-topleft"></div>' +
        '<div class="view-render-info view-render-info-topright"></div>' +
        '<div class="view-render-info view-render-info-bottomright"></div>' +
        '<div class="view-render-info view-render-info-bottomleft"></div>' +
      '</div>'
    );

    // rearrange layout
    ++this.numOfRenders;
    this.positionRenders();

    //
    // create xtk objects
    //
    render = this.create2DRender(containerID, orientation);
    // renderer's event handlers
    this.onRender2DScroll = function(evt) {
      var i;

      for (i=0; i<self.renders2D.length; i++) {
        if (self.renders2D[i].interactor === this) {
          // update slice number on the GUI
          $('.view-render-info-bottomleft', $(self.renders2D[i].container)).html(
            'slice: ' + self.renders2D[i].volume.indexZ + '/' + (self.renders2D[i].volume.range[2] - 1));
        }
      }
      if (self.rendersLinked && !evt.detail) {
        // scroll event triggered by the user
        evt.detail = true;
        for (i=0; i<self.renders2D.length; i++) {
          if (self.renders2D[i].interactor !== this) {
            // trigger the scroll event programatically on other renderers
            self.renders2D[i].interactor.dispatchEvent(evt);
          }
        }
      }
    };
    // bind onRender2DScroll method with the renderer's interactor 
    render.interactor.addEventListener(X.event.events.SCROLL, this.onRender2DScroll);

    // the onShowtime event handler gets executed after all files were fully loaded and
    // just before the first rendering attempt
    render.onShowtime = function() {
      //temporal demo code
      // define function to read the json file
      function readJson(fileObj, callback) {
        var reader = new FileReader();

        reader.onload = function() {
          var json = JSON.parse(reader.result);
          callback(json);
        };

        reader.readAsText(fileObj);
      }
      // read the json file
      readJson(imgFileObj.json, function(jsonObj) {
        var jqR = $('#' + containerID);

        $('.view-render-info-topleft', jqR).html(
          jsonObj.PatientName + '<br>' +
          jsonObj.PatientID + '<br>' +
          jsonObj.PatientBirthDate + '<br>' +
          jsonObj.PatientSex );

        $('.view-render-info-topright', jqR).html(
          jsonObj.SeriesDescription + '<br>' +
          jsonObj.Manufacturer + '<br>' +
          jsonObj.StudyDate + '<br>' +
          jsonObj.mri_info.dimensions + '<br>' +
          jsonObj.mri_info.voxelSizes );

        $('.view-render-info-bottomright', jqR).html(
          jsonObj.mri_info.orientation + '<br>' +
          jsonObj.mri_info.primarySliceDirection );

        $('.view-render-info-bottomleft', jqR).html(
          'slice: ' + vol.indexZ + '/' + (vol.range[2] - 1));
      });
    };

    // create xtk volume and link it to its render
    vol = this.createVolume(imgFileObj);
    render.volume = vol;

    // add xtk 2D renderer to the list of current UI renders
    this.renders2D.push(render);

    // define function to read an MRI file into filedata array
    function readMriFile(fileObj, pos) {
      var reader = new FileReader();

      reader.onload = function() {
        filedata[pos] = reader.result;
        ++numFiles;

        if (numFiles===imgFileObj.files.length) {
          vol.filedata = filedata;
          render.add(vol);
          // start the rendering
          render.render();
          viewer.documentRepaint();
        }
      };

      reader.readAsArrayBuffer(fileObj);
    }

    // read all neuroimage files in imgFileObj.files
    for (var i=0; i<imgFileObj.files.length; i++) {
      readMriFile(imgFileObj.files[i], i);
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
      if ($(this.renders2D[i].container).attr("id") === containerID) {
        this.renders2D[i].remove(this.renders2D[i].volume);
        this.renders2D[i].volume.destroy();
        this.renders2D[i].interactor.removeEventListener(X.event.events.SCROLL, this.onRender2DScroll);
        this.renders2D[i].destroy();
        this.renders2D.splice(i, 1);
        $('#' + containerID).remove();
        --this.numOfRenders;
        this.positionRenders();
        viewer.documentRepaint();
        break;
      }
    }

  };

  /**
   * Create an xtk 2D renderer object.
   *
   * @param {String} container id.
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.create2DRender = function(containerID, orientation) {
    var render;

    // create xtk object
    render = new X.renderer2D();
    render.container = containerID;
    render.bgColor = [0.2, 0.2, 0.2];
    render.orientation = orientation;
    render.init();
    return render;
  };

  /**
   * Create an xtk volume object.
   *
   * @param {Object} image file object
   */
  viewer.Viewer.prototype.createVolume = function(imgFileObj) {
    var fileNames = [];
    var vol;

    for (var i=0; i<imgFileObj.files.length; i++) {
      fileNames[i] = imgFileObj.files[i].name;
    }
    // create xtk object
    vol = new X.volume();
    vol.reslicing = 'false';
    vol.file = fileNames.sort().map(function(str) {
      return imgFileObj.baseUrl + str;});
    return vol;
  };

  /**
   * Rearrange renderers in the UI layout.
   */
  viewer.Viewer.prototype.positionRenders = function() {
    var jqRenders = $('div.view-render');

    switch(this.numOfRenders) {
      case 1:
        jqRenders.css({
          width: "100%",
          height: "100%",
          top: 0,
          left: 0
        });
      break;

      case 2:
        jqRenders.css({
          width: "50%",
          height: "100%",
          top: 0,
          left:0
        });
        jqRenders[1].style.left = "50%";
      break;

      case 3:
        jqRenders.css({
          width: "50%",
          height: "50%",
        });
        jqRenders[0].style.top = 0;
        jqRenders[0].style.left = 0;
        jqRenders[1].style.top = 0;
        jqRenders[1].style.left = "50%";
        jqRenders[2].style.top = "50%";
        jqRenders[2].style.left = 0;
        jqRenders[2].style.width = "100%";
      break;

      case 4:
        jqRenders.css({
          width: "50%",
          height: "50%",
        });
        jqRenders[0].style.top = 0;
        jqRenders[0].style.left = 0;
        jqRenders[1].style.top = 0;
        jqRenders[1].style.left = "50%";
        jqRenders[2].style.top = "50%";
        jqRenders[2].style.left = 0;
        jqRenders[3].style.top = "50%";
        jqRenders[3].style.left = "50%";
      break;
    }
  };

  /**
   * Create and add toolbar to the viewer container.
   */
  viewer.Viewer.prototype.addToolBar = function() {
    var self = this;

    if ($('#' + this.toolContID).length) {
      return; // toolbar already exists
    }

    // append toolbar div and it's buttons to the whole container
    $('#' + this.wholeContID).append(
      '<div id="' + this.toolContID + '">' +
        ' <button id="viewtoolbarlink" type="button" class="view-tool-button">Link views</button>' +
      '<div>'
    );

    // make space for the toolbar
    var jqToolCont = $('#' + this.toolContID);
    var rendersTopEdge = parseInt(jqToolCont.css("top")) + parseInt(jqToolCont.css("height")) + 5;
    $('#' + this.rendersContID).css({ height: "calc(100% - " + rendersTopEdge + "px)" });
    if ($('#' + this.thumbnailContID).length) {
      // there is a thumbnail bar so make space for it
      var jqThCont = $('#' + this.thumbnailContID);
      var toolLeftEdge = parseInt(jqThCont.css("left")) + parseInt(jqThCont.css("width")) + 5;
      jqToolCont.css({ width: "calc(100% - " + toolLeftEdge + "px)" });
    }

    //
    // event handlers
    //
    $('#viewtoolbarlink').click(function() {
      if (self.rendersLinked) {
        self.rendersLinked = false;
        $(this).text("Link views");
      } else {
        self.rendersLinked = true;
        $(this).text("Unlink views");
      }
    });

  };

  /**
   * Create and add thumbnail bar to the viewer container.
   */
  viewer.Viewer.prototype.addThumbnailBar = function() {
    var self = this;

    if (this.imgFileArr.length<2){
      return; // a single (or none) file doesn't need a thumbnail bar
    }

    if ($('#' + this.thumbnailContID).length){
      return; // thumbnail bar already exists
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

    // callback to append new thumbnail
    function createThumbnail(id, altText, url) {
      var info, title;
      // we assume the name of the thumbnail can be of the form:
      // 1.3.12.2.1107.5.2.32.35288.30000012092602261631200043880-AXIAL_RFMT_MPRAGE-Sag_T1_MEMPRAGE_1_mm_4e_nomoco.jpg
      if (altText.lastIndexOf('-')) {
        title = altText.substring(0, altText.lastIndexOf('.'));
        title = title.substring(title.lastIndexOf('-') + 1);
        info = title.substr(0, 10);
      } else {
        title = altText;
        info = altText.substring(0, altText.lastIndexOf('.')).substr(-10);
      }
      if (url === undefined) {
        url = ' ';
      }
      $('#' + self.thumbnailContID).append(
        '<div id="viewth' + id + '" class="view-thumbnail">' +
          '<img class="view-thumbnail-img" src="' + url + '" alt="' + altText.substr(-8) + '" title="' + title + '">' +
          '<div class="view-thumbnail-info">' + info + '</div>' +
        '</div>'
      );
      // if there is a corresponding renderer already in the UI then hide this thumbnail
      if ($('#viewrender2D' + id).length) {
        $('#viewth' + id).css({ display:"none" });
      }
    }

    // append thumbnailbar to the whole container
    $('#' + this.wholeContID).append(
      '<div id="' + this.thumbnailContID + '"></div>'
    );
    $('#' + this.thumbnailContID).addClass("sortable");

    // make the thumbnails container sortable
    var sort_opts = {
      cursor: 'move',
      containment: '#' + this.wholeContID,
      helper: 'clone',
      appendTo: '#' + this.rendersContID,
      connectWith: ".sortable",
      dropOnEmpty: true,

      //event handlers
      // beforeStop is called when the placeholder is still in the list
      beforeStop: function(event, ui) {
        if (ui.placeholder.parent().attr("id") === self.rendersContID) {
          $(this).sortable("cancel");
          if (self.numOfRenders < self.maxNumOfRenders) {
            // a dropped thumbnail disappears from thumbnail bar
            var id = parseInt(ui.item.css({ display:"none" }).attr("id").replace("viewth",""));
            // add a renderer to the UI
            self.add2DRender(self.getImgFileObject(id), 'Z');
          } else {
            alert('Reached maximum number of renders allow which is 4. You must drag a render out ' +
             'of the viewer window and drop it into the thumbnails bar to make a render available');
          }
        }
      }
    };

    $('#' + this.thumbnailContID).sortable(sort_opts);

    // load thumbnail images
    var imgFileObj;
    for (var i=0; i<this.imgFileArr.length; i++) {
      imgFileObj = this.imgFileArr[i];
      if (imgFileObj.thumbnail) {
        readThumbnailUrl(imgFileObj, createThumbnail);
      } else {
        createThumbnail(imgFileObj.id, imgFileObj.files[0].name);
      }
    }

    // make space for the thumbnail bar
    var jqThCont = $('#' + this.thumbnailContID);
    var rendersLeftEdge = parseInt(jqThCont.css("left")) + parseInt(jqThCont.css("width")) + 5;
    $('#' + this.rendersContID).css({ width: "calc(100% - " + rendersLeftEdge + "px)" });
    if ($('#' + this.toolContID).length) {
      // there is a toolbar
      $('#' + this.toolContID).css({ width: "calc(100% - " + rendersLeftEdge + "px)" });
    }

  };


  /**
   * Destroy all objects and remove html interface
   */
  viewer.Viewer.prototype.destroy = function() {
    // destroy XTK renderers
    for (var i=0; i<this.renders2D.length; i++) {
      this.remove2DRender($(this.renders2D[i].container).attr("id"));
    }
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
    ext.THUMBNAIL = ['png', 'gif', 'jpg'];
    // json extensions
    ext.JSON = ['json'];

    if (viewer.strEndsWith(fileObj.name, ext.DICOM)) {
      type = 'dicom';
    } else if (viewer.strEndsWith(fileObj.name, ext.VOL)) {
      type = 'vol';
    } else if (viewer.strEndsWith(fileObj.name, ext.FIBERS)) {
      type = 'fibers';
    } else if (viewer.strEndsWith(fileObj.name, ext.MESH)) {
      type = 'mesh';
    } else if (viewer.strEndsWith(fileObj.name, ext.THUMBNAIL)) {
      type = 'thumbnail';
    } else if (viewer.strEndsWith(fileObj.name, ext.JSON)) {
      // temporal demo code
      type = 'json';
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
