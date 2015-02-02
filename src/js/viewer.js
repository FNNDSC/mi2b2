/**
 * This object takes care of all the visualization:
 *
 * FEATURES
 * - Give it a JSON object which represents the 'scene'
 * - Allows users to selects elements of the scene to be rendered
 */

// Provide a namespace
var viewer = viewer || {};

  viewer.Viewer = function(source, containerID) {

    this.version = 0.0;

    // insert the Viewer html interface
    this.containerID = containerID;
    document.getElementById(containerID).insertAdjacentHTML('afterbegin',
    viewer.Viewer.getHTMLTemplate());

    // fancytree json object
    this.source = source;

  };



  viewer.Viewer.prototype.create2DRenderer = function(container, orientation) {
    this[container] = new X.renderer2D();
    this[container].container = container;
    this[container].bgColor = [0.2, 0.2, 0.2];
    this[container].orientation = orientation;
    this[container].init();
  };
