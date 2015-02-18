
// set variable to store the X position
var xpos;
var numRenderDivs = 0;

// ui-draggable CSS class is added to movable elems and ui-draggable-dragging is
// added to elem being moved
$('#viewthumbnail img').draggable ({
  cursor: 'pointer',
  //scroll: false,
  scope: 'viewrenders', // restrict drop only on items that have the same scope str
  revert: 'invalid', // returns if dropped on an element that does not accept it
  axis: 'x', // displacement only possible in x (horizontal) direction
  containment: '#viewercontainer', // within which the displacement takes place
  helper: 'clone',
  //zIndex: 999,
  appendTo: '#viewrenders',

  //event handlers
  // ui.helper is the jQuery obj of the dragged elem
  start: function(evt, ui) {
    xpos = ui.position.left;
    ypos = ui.position.top;
    var j = $(this);
    var h = j.css("height");
    var w = j.css("width");
    ui.helper.css( {height: h, width: w} );
  },

  drag: function(evt, ui) {

  },

  stop: function(evt, ui) {
    //this.style.display="";
  }
});


// ui-droppable CSS class is by default added to the element
$('#viewthumbnail').droppable ({
  scope: 'viewthumbnail', // restrict dropping only for draggable items that have the same scope str

  // hoverClass: string representing one or more CSS classes to be added  when an accepted
  // element moves into it

  //event handlers
  // ui.helper is the jQuery obj of the dropped elem
  // ui.draggable is the jQuery object of the clicked elem (but not necessarily the elem that moves)
  drop: function(evt, ui) {
    var id = $(ui.draggable).attr("id");
    $(ui.draggable).remove();
    $('#' + id.replace("viewrender2D", "img")).css({ display:"block" });
    --numRenderDivs;
    positionRenders();
  }

}).sortable();

function makeRenderDraggable(renderID) {

  $('#' + renderID).draggable ({
    cursor: 'pointer',
    //scroll: false,
    scope: 'viewthumbnail', // restrict drop only on items that have the same scope str
    revert: 'invalid', // returns if dropped on an element that does not accept it
    axis: 'x', // displacement only possible in x (horizontal) direction
    containment: '#viewercontainer', // within which the displacement takes place
    helper: 'clone',
    //zIndex: 999,
    appendTo: '#viewthumbnail',

    //event handlers
    // ui.helper is the jQuery obj of the dragged elem
    start: function(evt, ui) {
      var jqTh = $('#' + renderID.replace("viewrender2D", "img"));
      var h = jqTh.css("height");
      var w = jqTh.css("width");
      ui.helper.css( {height: h, width: w} );
    },

    drag: function(evt, ui) {

    },

    stop: function(evt, ui) {
      //this.style.display="";
    }
  });

};



// ui-droppable CSS class is by default added to the element
$('#viewrenders').droppable({
  scope: 'viewrenders', // restrict dropping only for draggable items that have the same scope str

  // hoverClass: string representing one or more CSS classes to be added  when an accepted
  // element moves into it

  //event handlers
  // ui.helper is the jQuery obj of the dropped elem
  // ui.draggable is the jQuery object of the clicked elem (but not necessarily the elem that moves)
  drop: function(evt, ui) {
    if (numRenderDivs<4) {
      ++numRenderDivs;
      var id = 'viewrender2D' + $(ui.draggable).css({ display:"none"}).attr("id").replace("img","");
      $('#viewrenders').append(
      '<div id="' + id + '"></div>' );
      $('#' + id).css({
        "border-style": "solid",
        "box-sizing": "border-box",
        "float": "left"
      });
      makeRenderDraggable(id);
      positionRenders();
    } else {
      alert('Reached maximum number of renders allow which is 4. You must drag a render out ' +
       'of the viewer window and drop it into the thumbnails bar to make a render available');
    }

  //  .draggable ("disable")
  //  .css ({ opacity : 1 });
  }

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
