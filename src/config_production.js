require.config({
    baseUrl: 'js',
    paths: {
        // the left side is the module ID, the right side is the path to
        // the file, relative to baseUrl.
        // Also, the path should NOT include the '.js' file extension.
        mi2b2: 'mi2b2',
    }
});

// 1st level dependencies
require(['mi2b2'], function() {

  // Entry point
  app.appObj = new app.App();

});
