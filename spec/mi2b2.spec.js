/**
 * This module implements the mi2b2's specification (tests).
 *
 */

define(['mi2b2'], function(mi2b2) {

  describe('mi2b2', function() {

    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    // append a container for the whole viewer
    var container = $('<div id="viewercontainer"></div>');
    $(document.body).append(container);

    var app;

    beforeEach(function() {

      app = new mi2b2.App();
      app.init();
    });

    afterEach(function() {

      app.destroy();
    });

    it('mi2b2.appendAll appends a new volume file obj',

      function() {

        app.appendAll(
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
        );

        expect(app.imgFileArr[0]).toEqual({
            url: 'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii.gz'
          });
      }
    );

    it('mi2b2.init starts a viewer with a renderers box',

      function() {

        expect(app.view.rBox).not.toBeNull();
      }
    );

    it('mi2b2.init starts a viewer with a toolbar',

      function() {

        expect(app.view.toolBar).not.toBeNull();
      }
    );

    it('mi2b2.init starts a viewer with a thumbnails bar',

      function() {

        expect(app.view.thBars.length).toBeGreaterThan(0);
      }
    );

  });
});
