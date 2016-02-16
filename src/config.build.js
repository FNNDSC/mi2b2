require.config({
  baseUrl: '.',
  paths: {
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min', 'jquery/dist/jquery.min'],
    jquery_ui: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min', 'jquery-ui/jquery-ui.min'],
    mi2b2: 'js/mi2b2.min'
  }
});

require(['mi2b2', 'jquery', 'jquery_ui'], function(mi2b2, $) {
  // Entry point
  var app = new mi2b2.App();
  app.init();
});
