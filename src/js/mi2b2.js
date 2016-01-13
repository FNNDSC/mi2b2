/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a viewerjs.Viewer object for visualization and collaboration.
 * The app can contain several viewerjs.Viewer objects which will be displayed in different tabs.
 * A new viewer tab can also be started by joining an existing realtime collaboration among
 * remote viewerjs.Viewer instances.
 */

// define a new module
define(['utiljs', 'gcjs', 'viewerjs'], function(util, cjs, viewerjs) {

  // Provide a namespace
  var mi2b2 = mi2b2 || {};

  mi2b2.App = function() {
    // Client ID from the Google's developer console
    this.CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';
    this.collaborator = new cjs.GDriveCollab(this.CLIENT_ID);

    // Create a new viewerjs.Viewer object
    // A collaborator object is only required if we want to enable realtime collaboration.
    this.view = new viewerjs.Viewer('viewercontainer', this.collaborator);
  };

  mi2b2.App.prototype.init = function() {
    this.view.init();
    var imgFileArr = [];
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhVWNSVEtlUlY0Vzg/nico.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhVWNSVEtlUlY0Vzg/nico.nii.json'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhVWNSVEtlUlY0Vzg/nico.nii.jpg'
    });
    // load atlases
    this.view.addData(imgFileArr);
  };

  return mi2b2;
});