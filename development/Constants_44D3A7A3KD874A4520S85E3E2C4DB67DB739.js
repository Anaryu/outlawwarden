var DesktopUIConstants, Helper;

DesktopUIConstants = (function() {
  function DesktopUIConstants() {}

  DesktopUIConstants.OPTION_BUTTON_W = 78;

  DesktopUIConstants.OPTION_BUTTON_H = 78;

  DesktopUIConstants.OPTION_BUTTON_L_IMAGE_ON = "m-diamond-large-on";

  DesktopUIConstants.OPTION_BUTTON_L_IMAGE_OFF = "m-diamond-large-off";

  DesktopUIConstants.OPTION_BUTTON_S_IMAGE_ON = "m-diamond-small-on";

  DesktopUIConstants.OPTION_BUTTON_S_IMAGE_OFF = "m-diamond-small-off";

  DesktopUIConstants.OPTION_BUTTON_MSG_IMAGE_ON = "msg-diamond-small-on";

  DesktopUIConstants.OPTION_BUTTON_MSG_IMAGE_OFF = "msg-diamond-small-off";

  DesktopUIConstants.SLIDER_TRACK_H = 3;

  DesktopUIConstants.TEXT_SIZE_SMALL = 20;

  DesktopUIConstants.TEXT_SIZE_MESSAGE = 28;

  DesktopUIConstants.TEXT_SIZE_MESSAGE_NAME = 30;

  DesktopUIConstants.LAYOUT_SETTINGS_WINDOW_X = 20;

  DesktopUIConstants.LAYOUT_SETTINGS_WINDOW_W = 630;

  DesktopUIConstants.LAYOUT_SETTINGS_VOICES_WINDOW_X = 720;

  DesktopUIConstants.LAYOUT_SETTINGS_VOICES_WINDOW_W = 540;

  DesktopUIConstants.LAYOUT_SETTINGS_WINDOW_LABEL_W = 80;

  DesktopUIConstants.CG_GALLERY_CONTENT_WIDTH = Math.floor((Graphics.width - 260 - (Graphics.width - (Graphics.width - 200))) / 175) * 175 + 20;

  DesktopUIConstants.MESSAGE_BOX_IDS = ["messageBox", "nvlMessageBox"];

  return DesktopUIConstants;

})();

Helper = (function() {

  /**
  * A helper class containing helper-functions like generating letter-descriptors
  * from database defined text-input pages.
  *
  * @module ui
  * @class Helper
  * @memberof ui
  * @constructor
   */
  function Helper() {}


  /**
  * Generates the text-input pages from database.
  *
  * @method generateTextInputPages
  * @return Object[] - Array of text-input pages. Each page is an array of ui.Letter descriptors.
   */

  Helper.prototype.generateTextInputPages = function() {
    var charset, charsets, defaults, i, j, k, len, pages, ref, ref1;
    pages = [];
    defaults = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "0123456789", ""];
    try {
      charsets = RecordManager.system.textInputPages.select(function(p) {
        return lcs(p);
      });
    } catch (error) {
      charsets = defaults;
    }
    for (i = j = 0, ref = charsets.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      charsets[i] = ((ref1 = charsets[i]) != null ? ref1 : defaults[i]) || "";
    }
    for (k = 0, len = charsets.length; k < len; k++) {
      charset = charsets[k];
      pages.push(this.generateTextInputPage(charset));
    }
    return pages;
  };


  /**
  * Generates an array of ui.Letter descriptors from the specified charset.
  *
  * @method generateTextInputPage
  * @param {string} charset - The charset to generate the ui.Letter descriptors from.
  * @return Object[] - Array of ui.Letter descriptors.
   */

  Helper.prototype.generateTextInputPage = function(charset) {
    var c, controls, j, len, letter;
    controls = [];
    for (j = 0, len = charset.length; j < len; j++) {
      c = charset[j];
      letter = {
        "type": "ui.Letter",
        "params": {
          "text": c,
          "target": new ui.Formula(function() {
            return 'textField.textInput';
          })
        }
      };
      controls.push(letter);
    }
    return controls;
  };

  return Helper;

})();

ui.Helper = new Helper();

gs.DesktopUIConstants = DesktopUIConstants;

gs.UIConstants = DesktopUIConstants;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUE7O0FBQU07OztFQUNGLGtCQUFDLENBQUEsZUFBRCxHQUFtQjs7RUFDbkIsa0JBQUMsQ0FBQSxlQUFELEdBQW1COztFQUNuQixrQkFBQyxDQUFBLHdCQUFELEdBQTRCOztFQUM1QixrQkFBQyxDQUFBLHlCQUFELEdBQTZCOztFQUM3QixrQkFBQyxDQUFBLHdCQUFELEdBQTRCOztFQUM1QixrQkFBQyxDQUFBLHlCQUFELEdBQTZCOztFQUM3QixrQkFBQyxDQUFBLDBCQUFELEdBQThCOztFQUM5QixrQkFBQyxDQUFBLDJCQUFELEdBQStCOztFQUMvQixrQkFBQyxDQUFBLGNBQUQsR0FBa0I7O0VBQ2xCLGtCQUFDLENBQUEsZUFBRCxHQUFtQjs7RUFDbkIsa0JBQUMsQ0FBQSxpQkFBRCxHQUFxQjs7RUFDckIsa0JBQUMsQ0FBQSxzQkFBRCxHQUEwQjs7RUFDMUIsa0JBQUMsQ0FBQSx3QkFBRCxHQUE0Qjs7RUFDNUIsa0JBQUMsQ0FBQSx3QkFBRCxHQUE0Qjs7RUFDNUIsa0JBQUMsQ0FBQSwrQkFBRCxHQUFtQzs7RUFDbkMsa0JBQUMsQ0FBQSwrQkFBRCxHQUFtQzs7RUFDbkMsa0JBQUMsQ0FBQSw4QkFBRCxHQUFrQzs7RUFDbEMsa0JBQUMsQ0FBQSx3QkFBRCxHQUE0QixJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsUUFBUSxDQUFDLEtBQVQsR0FBZSxHQUFmLEdBQW1CLENBQUMsUUFBUSxDQUFDLEtBQVQsR0FBaUIsQ0FBQyxRQUFRLENBQUMsS0FBVCxHQUFpQixHQUFsQixDQUFsQixDQUFwQixDQUFBLEdBQWlFLEdBQTVFLENBQUEsR0FBbUYsR0FBbkYsR0FBeUY7O0VBQ3JILGtCQUFDLENBQUEsZUFBRCxHQUFtQixDQUFDLFlBQUQsRUFBZSxlQUFmOzs7Ozs7QUFFakI7O0FBQ0Y7Ozs7Ozs7OztFQVNhLGdCQUFBLEdBQUE7OztBQUViOzs7Ozs7O21CQU1BLHNCQUFBLEdBQXdCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLFFBQUEsR0FBVyxDQUNQLDRCQURPLEVBQ3VCLDRCQUR2QixFQUVQLFlBRk8sRUFFTyxFQUZQO0FBS1g7TUFDSSxRQUFBLEdBQVcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBcEMsQ0FBMkMsU0FBQyxDQUFEO2VBQU8sR0FBQSxDQUFJLENBQUo7TUFBUCxDQUEzQyxFQURmO0tBQUEsYUFBQTtNQUdJLFFBQUEsR0FBVyxTQUhmOztBQUtBLFNBQVMsd0ZBQVQ7TUFDSSxRQUFTLENBQUEsQ0FBQSxDQUFULDBDQUE0QixRQUFTLENBQUEsQ0FBQSxFQUF2QixJQUEyQjtBQUQ3QztBQUdBLFNBQUEsMENBQUE7O01BQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEscUJBQUQsQ0FBdUIsT0FBdkIsQ0FBWDtBQURKO0FBR0EsV0FBTztFQWxCYTs7O0FBb0J4Qjs7Ozs7Ozs7bUJBT0EscUJBQUEsR0FBdUIsU0FBQyxPQUFEO0FBQ25CLFFBQUE7SUFBQSxRQUFBLEdBQVc7QUFFWCxTQUFBLHlDQUFBOztNQUNJLE1BQUEsR0FBUztRQUFFLE1BQUEsRUFBUSxXQUFWO1FBQXVCLFFBQUEsRUFBVTtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsUUFBQSxFQUFjLElBQUEsRUFBRSxDQUFDLE9BQUgsQ0FBVyxTQUFBO21CQUFHO1VBQUgsQ0FBWCxDQUEzQjtTQUFqQzs7TUFDVCxRQUFRLENBQUMsSUFBVCxDQUFjLE1BQWQ7QUFGSjtBQUlBLFdBQU87RUFQWTs7Ozs7O0FBUzNCLEVBQUUsQ0FBQyxNQUFILEdBQWdCLElBQUEsTUFBQSxDQUFBOztBQUNoQixFQUFFLENBQUMsa0JBQUgsR0FBd0I7O0FBQ3hCLEVBQUUsQ0FBQyxXQUFILEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRGVza3RvcFVJQ29uc3RhbnRzXG4gICAgQE9QVElPTl9CVVRUT05fVyA9IDc4XG4gICAgQE9QVElPTl9CVVRUT05fSCA9IDc4XG4gICAgQE9QVElPTl9CVVRUT05fTF9JTUFHRV9PTiA9IFwibS1kaWFtb25kLWxhcmdlLW9uXCJcbiAgICBAT1BUSU9OX0JVVFRPTl9MX0lNQUdFX09GRiA9IFwibS1kaWFtb25kLWxhcmdlLW9mZlwiXG4gICAgQE9QVElPTl9CVVRUT05fU19JTUFHRV9PTiA9IFwibS1kaWFtb25kLXNtYWxsLW9uXCJcbiAgICBAT1BUSU9OX0JVVFRPTl9TX0lNQUdFX09GRiA9IFwibS1kaWFtb25kLXNtYWxsLW9mZlwiXG4gICAgQE9QVElPTl9CVVRUT05fTVNHX0lNQUdFX09OID0gXCJtc2ctZGlhbW9uZC1zbWFsbC1vblwiXG4gICAgQE9QVElPTl9CVVRUT05fTVNHX0lNQUdFX09GRiA9IFwibXNnLWRpYW1vbmQtc21hbGwtb2ZmXCJcbiAgICBAU0xJREVSX1RSQUNLX0ggPSAzXG4gICAgQFRFWFRfU0laRV9TTUFMTCA9IDIwXG4gICAgQFRFWFRfU0laRV9NRVNTQUdFID0gMjhcbiAgICBAVEVYVF9TSVpFX01FU1NBR0VfTkFNRSA9IDMwXG4gICAgQExBWU9VVF9TRVRUSU5HU19XSU5ET1dfWCA9IDIwXG4gICAgQExBWU9VVF9TRVRUSU5HU19XSU5ET1dfVyA9IDYzMFxuICAgIEBMQVlPVVRfU0VUVElOR1NfVk9JQ0VTX1dJTkRPV19YID0gNzIwXG4gICAgQExBWU9VVF9TRVRUSU5HU19WT0lDRVNfV0lORE9XX1cgPSA1NDBcbiAgICBATEFZT1VUX1NFVFRJTkdTX1dJTkRPV19MQUJFTF9XID0gODBcbiAgICBAQ0dfR0FMTEVSWV9DT05URU5UX1dJRFRIID0gTWF0aC5mbG9vcigoR3JhcGhpY3Mud2lkdGgtMjYwLShHcmFwaGljcy53aWR0aCAtIChHcmFwaGljcy53aWR0aCAtIDIwMCkpKSAvIDE3NSkgKiAxNzUgKyAyMFxuICAgIEBNRVNTQUdFX0JPWF9JRFMgPSBbXCJtZXNzYWdlQm94XCIsIFwibnZsTWVzc2FnZUJveFwiXVxuXG5jbGFzcyBIZWxwZXJcbiAgICAjIyMqXG4gICAgKiBBIGhlbHBlciBjbGFzcyBjb250YWluaW5nIGhlbHBlci1mdW5jdGlvbnMgbGlrZSBnZW5lcmF0aW5nIGxldHRlci1kZXNjcmlwdG9yc1xuICAgICogZnJvbSBkYXRhYmFzZSBkZWZpbmVkIHRleHQtaW5wdXQgcGFnZXMuXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIEhlbHBlclxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2VuZXJhdGVzIHRoZSB0ZXh0LWlucHV0IHBhZ2VzIGZyb20gZGF0YWJhc2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBnZW5lcmF0ZVRleHRJbnB1dFBhZ2VzXG4gICAgKiBAcmV0dXJuIE9iamVjdFtdIC0gQXJyYXkgb2YgdGV4dC1pbnB1dCBwYWdlcy4gRWFjaCBwYWdlIGlzIGFuIGFycmF5IG9mIHVpLkxldHRlciBkZXNjcmlwdG9ycy5cbiAgICAjIyNcbiAgICBnZW5lcmF0ZVRleHRJbnB1dFBhZ2VzOiAoKSAtPlxuICAgICAgICBwYWdlcyA9IFtdXG4gICAgICAgIGRlZmF1bHRzID0gW1xuICAgICAgICAgICAgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLCBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXG4gICAgICAgICAgICBcIjAxMjM0NTY3ODlcIiwgXCJcIlxuICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoYXJzZXRzID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0udGV4dElucHV0UGFnZXMuc2VsZWN0IChwKSAtPiBsY3MocClcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgIGNoYXJzZXRzID0gZGVmYXVsdHNcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLmNoYXJzZXRzLmxlbmd0aF1cbiAgICAgICAgICAgIGNoYXJzZXRzW2ldID0gY2hhcnNldHNbaV0gPyBkZWZhdWx0c1tpXXx8XCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBjaGFyc2V0IGluIGNoYXJzZXRzXG4gICAgICAgICAgICBwYWdlcy5wdXNoKEBnZW5lcmF0ZVRleHRJbnB1dFBhZ2UoY2hhcnNldCkpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHBhZ2VzXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBHZW5lcmF0ZXMgYW4gYXJyYXkgb2YgdWkuTGV0dGVyIGRlc2NyaXB0b3JzIGZyb20gdGhlIHNwZWNpZmllZCBjaGFyc2V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgZ2VuZXJhdGVUZXh0SW5wdXRQYWdlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcnNldCAtIFRoZSBjaGFyc2V0IHRvIGdlbmVyYXRlIHRoZSB1aS5MZXR0ZXIgZGVzY3JpcHRvcnMgZnJvbS5cbiAgICAqIEByZXR1cm4gT2JqZWN0W10gLSBBcnJheSBvZiB1aS5MZXR0ZXIgZGVzY3JpcHRvcnMuXG4gICAgIyMjICAgICAgXG4gICAgZ2VuZXJhdGVUZXh0SW5wdXRQYWdlOiAoY2hhcnNldCkgLT5cbiAgICAgICAgY29udHJvbHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgZm9yIGMgaW4gY2hhcnNldFxuICAgICAgICAgICAgbGV0dGVyID0geyBcInR5cGVcIjogXCJ1aS5MZXR0ZXJcIiwgXCJwYXJhbXNcIjogeyBcInRleHRcIjogYywgXCJ0YXJnZXRcIjogbmV3IHVpLkZvcm11bGEoLT4gJ3RleHRGaWVsZC50ZXh0SW5wdXQnKSB9IH1cbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2gobGV0dGVyKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sc1xuICAgICAgXG51aS5IZWxwZXIgPSBuZXcgSGVscGVyKCkgIFxuZ3MuRGVza3RvcFVJQ29uc3RhbnRzID0gRGVza3RvcFVJQ29uc3RhbnRzXG5ncy5VSUNvbnN0YW50cyA9IERlc2t0b3BVSUNvbnN0YW50cyJdfQ==
//# sourceURL=Constants_4.js