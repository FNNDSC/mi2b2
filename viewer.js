
// set variable to store the X position
var xpos;
var numRenderDivs = 0;

// ui-sortable CSS class is by default added to the element
// element being moved is assigned the ui-sortable-helper class
$('#viewthumbnail').sortable({
  cursor: 'pointer',
  containment: '#viewercontainer', // within which the displacement takes place
  helper: 'clone',
  //zIndex: 999,
  appendTo: '#viewrenders',
  connectWith: ".sortable",
  dropOnEmpty: true,
  /*start: function(event, ui) {
      item = ui.item;
      newList = oldList = ui.item.parent().parent();
  },*/
  beforeStop: function(event, ui) {
    //alert("Moved " + item.text() + " from " + oldList.attr('id') + " to " + newList.attr('id'));

    if (ui.placeholder.parent().attr("id") === "viewrenders") {
      $(this).sortable("cancel");
      if (numRenderDivs<4) {
        ++numRenderDivs;
        var id = 'viewrender2D' + ui.item.css({ display:"none"}).attr("id").replace("img","");
        $('#viewrenders').append(
        '<div id="' + id + '"></div>' );
        $('#' + id).css({
          "border-style": "solid",
          "box-sizing": "border-box",
          "float": "left"
        });
        positionRenders();
      } else {
        alert('Reached maximum number of renders allow which is 4. You must drag a render out ' +
         'of the viewer window and drop it into the thumbnails bar to make a render available');
      }
    }
  }
/*,
    change: function(event, ui) {
      if(ui.sender) newList = ui.placeholder.parent().parent();
  }*/
});


$('#viewrenders').sortable({
  cursor: 'pointer',
  containment: '#viewercontainer', // within which the displacement takes place
  helper: 'clone',
  //zIndex: 999,
  appendTo: '#viewthumbnail',
  connectWith: ".sortable",
  dropOnEmpty: true,

  beforeStop: function(event, ui) {
    if (ui.placeholder.parent().attr("id") === "viewthumbnail") {
      $(this).sortable("cancel");
      var id = ui.item.attr("id");
      $(ui.item).remove();
      $('#' + id.replace("viewrender2D", "img")).css({ display:"block" });
      --numRenderDivs;
      positionRenders();
    }
  }
  /*receive: function(event, ui) {

  }*/

}).css({ float: "left" });


function positionRenders() {
  var jqRenders = $('#viewrenders div');

  switch(numRenderDivs) {
    case 1:
      jqRenders.css({
        width: "100%",
        height: "100%",
      });
    break;

    case 2:
      jqRenders.css({
        width: "50%",
        height: "100%",
      });
    break;

    case 3:
      jqRenders.css({
        width: "50%",
        height: "50%",
      });

      jqRenders[2].style.width = "100%";
    break;

    case 4:
      jqRenders.css({
        width: "50%",
        height: "50%",
      });
    break;
  }
}
