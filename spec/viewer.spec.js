/**
 * This module implements the viewer's specification (tests).
 *
 */

describe('viewer', function() {
  it('viewer.strEndsWith(str, arrayOfStr) verifies if str ends with any of the strings in arrayOfStr',
    function () {
      expect(viewer.strEndsWith('testfile.txt', ['.txt'])).toEqual(true);
    });
});
