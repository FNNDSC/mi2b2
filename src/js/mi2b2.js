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

 var dependencies = [
/**
//
// NEEDS JQUERY AND JQUERY UI
/// LOADED @ APP LEVEL
//
*/

// bower
'../../../utiljs/src/js/utiljs',
'../../../gcjs/src/js/gcjs',
'../../../viewerjs/src/js/viewerjs',

];

// define a new module
define(dependencies, function(util, cjs, viewerjs) {

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

  mi2b2.App.prototype.appendAll = function(array, baseUrl){
    array.push({
      'url': baseUrl + '.gz'
    });
    array.push({
      'url': baseUrl + '.jpg'
    });
    array.push({
      'url': baseUrl + '.json'
    });
  };

  mi2b2.App.prototype.init = function() {
    this.view.init();
    var imgFileArr = [];
    //
    // 0-1 weeks
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
    );

    //
    // quarter 0
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhU0hjTnRIaFZPWWM/q0.nii'
    );

    //
    // quarter 1
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhWS1heHNxYmp1eTA/q1.nii'
    );

    //
    // quarter 2
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhQnlxVC04ZUo4R1U/q2.nii'
    );

    // quarter 3
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhU0RpaTNCaXhDZWc/q3.nii'
    );

    //
    // year 1 to 2
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydheWpyem90LVloR1U/y1to2.nii'
    );

    //
    // year 2 to 3
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhalFfU0FFejlwWTA/y2to3.nii'
    );
    
    //
    // year 3 to 4
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhNDM1dTFYaUo3NjQ/y3to4.nii'
    );

    //
    // year 4 to 5
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhMmtBRThMUnV4Q2s/y4to5.nii'
    );

    //
    // year 5 to 6
    this.appendAll(
      imgFileArr,
      'http://www.googledrive.com/host/0B8u7h0aKnydhZ2NPelRlLWlVRk0/y5to6.nii'
    );
    
    // load atlases
    this.view.addData(imgFileArr);
  };

  return mi2b2;
});