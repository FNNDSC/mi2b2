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
    //
    // 0-1 weeks
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii.json'
    });

    //
    // quarter 0
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0hjTnRIaFZPWWM/q0.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0hjTnRIaFZPWWM/q0.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0hjTnRIaFZPWWM/q0.nii.json'
    });

    //
    // quarter 1
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhWS1heHNxYmp1eTA/q1.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhWS1heHNxYmp1eTA/q1.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhWS1heHNxYmp1eTA/q1.nii.json'
    });

    //
    // quarter 2
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhQnlxVC04ZUo4R1U/q2.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhQnlxVC04ZUo4R1U/q2.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhQnlxVC04ZUo4R1U/q2.nii.json'
    });

    // quarter 3
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0RpaTNCaXhDZWc/q3.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0RpaTNCaXhDZWc/q3.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhU0RpaTNCaXhDZWc/q3.nii.json'
    });

    //
    // year 1 to 2
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydheWpyem90LVloR1U/y1to2.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydheWpyem90LVloR1U/y1to2.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydheWpyem90LVloR1U/y1to2.nii.json'
    });

    //
    // year 2 to 3
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhalFfU0FFejlwWTA/y2to3.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhalFfU0FFejlwWTA/y2to3.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhalFfU0FFejlwWTA/y2to3.nii.json'
    });
    
    //
    // year 3 to 4
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhNDM1dTFYaUo3NjQ/y3to4.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhNDM1dTFYaUo3NjQ/y3to4.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhNDM1dTFYaUo3NjQ/y3to4.nii.json'
    });

    //
    // year 4 to 5
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhMmtBRThMUnV4Q2s/y4to5.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhMmtBRThMUnV4Q2s/y4to5.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhMmtBRThMUnV4Q2s/y4to5.nii.json'
    });

    //
    // year 5 to 6
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhZ2NPelRlLWlVRk0/y5to6.nii.gz'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhZ2NPelRlLWlVRk0/y5to6.nii.jpg'
    });
    imgFileArr.push({
      'url': 'http://www.googledrive.com/host/0B8u7h0aKnydhZ2NPelRlLWlVRk0/y5to6.nii.json'
    });
    
    // load atlases
    this.view.addData(imgFileArr);
  };

  return mi2b2;
});