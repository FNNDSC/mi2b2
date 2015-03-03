require.config({
    baseUrl: 'js',
    paths: {
        // the left side is the module ID, the right side is the path to
        // the file, relative to baseUrl.
        // Also, the path should NOT include the '.js' file extension.
        // This example is using jQuery located at
        // components/jquery/dist/jquery.min.js relative to the baseUrl.
        jquery: ['components/jquery/dist/jquery.min'],
        jquery_ui: 'components/jquery-ui/jquery-ui.min',
        dicomParser: 'lib/dicomParser.min',
        xtk: 'lib/xtk',
        viewer: 'viewer',
        app: 'app',
    }
});

// 1st level dependencies
require(['jquery', 'jquery_ui'], function() {
  // 2nd level dependencies
  require(['xtk', 'dicomParser'], function() {
    // 3rd level dependencies
    require(['viewer'], function() {
      require(['app'], function() {

        // Entry point
        app.appObj = new app.App();

      });
    });
  });
});
