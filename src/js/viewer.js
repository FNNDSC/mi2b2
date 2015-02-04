/**
 * This module takes care of all image visualization and user interface.
 *
 * An object of the Viewer class expects an array of objects where each object
 * contains the following properties:
 * -id: String unique identifier
 * -thumbnail: File object (for a thumbnail image)
 * -files: Array of File objects (it contains a single file for formats other
 *  than DICOM)
 */

// Provide a namespace
var viewer = viewer || {};

  viewer.Viewer = function(source, containerID) {

    this.version = 0.0;
    // data source
    this.source = source;
    // set the viewer container object
    this.wholeContainer = document.getElementById(containerID);
    $(this.wholeContainer).css({ position: "relative" });
    // insert the Viewer html interface
    this._initInterface();
    this.thumbnailBar = null;
    // 2D render
    this.rendrs2D = [];


  };

  /**
   * Create and add 2D renderer to the UI.
   *
   * @param {String} X, Y or Z orientation.
   */
  viewer.Viewer.prototype.add2DRenderer = function(orientation) {
    var rendr = new X.renderer2D();
    var rendrID = 'viewerrender2D' + this.renderers2D.length

    $(this.wholeContainer).append('<div id="' + rendrID + '"></div>');

    rendr.container = rendrID;
    rendr.bgColor = [0.2, 0.2, 0.2];
    rendr.orientation = orientation;
    rendr.init();
    this.position2DRendr(rendr.container);
    this.rendrs.push(rendr);
  };

  /**
   * Create and add thumbnail bar to the UI.
   */
  viewer.Viewer.prototype.addThumbnailBar = function() {
    if (!this.thumbnailBar) {
      $(this.wholeContainer).append(
        '<div id="viewerthumbnail"></div>'
      );
      this.thumbnailBar = document.getElementById("viewerthumbnail");
    }
  };
