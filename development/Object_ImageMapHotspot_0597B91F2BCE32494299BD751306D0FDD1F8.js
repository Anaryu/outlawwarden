var Object_ImageMapHotspot,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_ImageMapHotspot = (function(superClass) {
  extend(Object_ImageMapHotspot, superClass);

  Object_ImageMapHotspot.objectCodecBlackList = ["parent"];

  Object_ImageMapHotspot.fromDataBundle = function(data, context) {
    return data;
  };

  Object_ImageMapHotspot.toDataBundle = function(object, context) {
    return {
      enabled: object.enabled,
      selected: object.selected
    };
  };


  /**
  * A game object used for pictures in a scene.
  *
  * @module gs
  * @class Object_Picture
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_ImageMapHotspot() {
    Object_ImageMapHotspot.__super__.constructor.call(this);
  }

  return Object_ImageMapHotspot;

})(gs.Object_Picture);

gs.Object_ImageMapHotspot = Object_ImageMapHotspot;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLHNCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFEOztFQUV4QixzQkFBQyxDQUFBLGNBQUQsR0FBaUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNiLFdBQU87RUFETTs7RUFHakIsc0JBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNYLFdBQU87TUFDSCxPQUFBLEVBQVMsTUFBTSxDQUFDLE9BRGI7TUFFSCxRQUFBLEVBQVUsTUFBTSxDQUFDLFFBRmQ7O0VBREk7OztBQU1mOzs7Ozs7Ozs7O0VBU2EsZ0NBQUE7SUFDVCxzREFBQTtFQURTOzs7O0dBckJvQixFQUFFLENBQUM7O0FBd0J4QyxFQUFFLENBQUMsc0JBQUgsR0FBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9JbWFnZU1hcEhvdHNwb3RcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9JbWFnZU1hcEhvdHNwb3QgZXh0ZW5kcyBncy5PYmplY3RfUGljdHVyZVxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBhcmVudFwiXVxuICAgIFxuICAgIEBmcm9tRGF0YUJ1bmRsZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIFxuICAgIEB0b0RhdGFCdW5kbGU6IChvYmplY3QsIGNvbnRleHQpIC0+XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgICAgZW5hYmxlZDogb2JqZWN0LmVuYWJsZWRcbiAgICAgICAgICAgIHNlbGVjdGVkOiBvYmplY3Quc2VsZWN0ZWRcbiAgICAgICAgfVxuICAgXG4gICAgIyMjKlxuICAgICogQSBnYW1lIG9iamVjdCB1c2VkIGZvciBwaWN0dXJlcyBpbiBhIHNjZW5lLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RfUGljdHVyZVxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbmdzLk9iamVjdF9JbWFnZU1hcEhvdHNwb3QgPSBPYmplY3RfSW1hZ2VNYXBIb3RzcG90Il19
//# sourceURL=Object_ImageMapHotspot_122.js