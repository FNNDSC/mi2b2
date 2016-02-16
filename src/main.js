require(['./config'], function() {
  require(['mi2b2Package', 'jquery', 'jquery_ui'], function(mi2b2, $) {
    // Entry point
    var app = new mi2b2.App();
    app.init();
  });
});
