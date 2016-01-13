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
    // create fake file
    // -id: Integer id
    //  *  -baseUrl: String ‘directory/containing/the/files’
    //  *  -imgType: String neuroimage type. Any of the possible values returned by rendererjs.Renderer.imgType
    //  *  -files: Array of HTML5 File objects or custom file objects with properties:
    //  *     -remote: a boolean indicating whether the file has not been read locally (with a filepicker)
    //  *     -url the file's url
    //  *     -cloudId: the id of the file in a cloud storage system if stored in the cloud
    //  *     -name: file name
    //  *  The files array contains a single file for imgType different from 'dicom' or 'dicomzip'
    //  *  -thumbnail: Optional HTML5 File or custom file object (optional jpg file for a thumbnail image)
    //  *  -json: Optional HTML5 or custom File object (optional json file with the mri info for imgType different from 'dicom')
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhVWNSVEtlUlY0Vzg/nico.nii.gz'
    });
    // load atlases
    this.view.addData(imgFileArr);
  };

  return mi2b2;
});