require.config({
  paths: {
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min', '../../jquery/dist/jquery.min'],
    jquery_ui: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min', '../../jquery-ui/jquery-ui.min'],
  },
  packages:[
    // local packages
  {
    name: 'mi2b2Package', // used for mapping...
    location: '../js',   // relative to base url
    main: 'mi2b2'
  }
  ]
});