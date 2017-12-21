var Component_ImageMap,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_ImageMap = (function(superClass) {
  extend(Component_ImageMap, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_ImageMap.prototype.onDataBundleRestore = function(data, context) {
    var bitmap, ground, h, j, len, ref, results;
    this.setupEventHandlers();
    this.object.addObject(this.ground);
    bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + this.object.images[0]);
    ground = new gs.Bitmap(bitmap.width, bitmap.height);
    ground.blt(0, 0, bitmap, new Rect(0, 0, bitmap.width, bitmap.height));
    this.ground.bitmap = ground;
    this.setupHotspots(this.hotspots);
    ref = this.hotspots;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      h = ref[j];
      results.push(this.object.addObject(h));
    }
    return results;
  };


  /**
  * A component which turns a game object into an interactive image-map.
  *
  * @module gs
  * @class Component_ImageMap
  * @extends gs.Component_Visual
  * @memberof gs
   */

  function Component_ImageMap() {
    Component_ImageMap.__super__.constructor.apply(this, arguments);

    /**
    * The ground/base image.
    * @property ground
    * @type gs.Object_Picture
    * @default null
     */
    this.ground = null;

    /**
    * An array of different hotspots.
    * @property hotspots
    * @type gs.Object_Picture[]
    * @default null
     */
    this.hotspots = null;

    /**
    * The variable context used if a hotspot needs to deal with local variables.
    * @property variableContext
    * @type Object
    * @default null
     */
    this.variableContext = null;

    /**
    * Indicates if the image-map is active. An in-active image-map doesn't respond
    * to any input-event. Hover effects are still working.
    * @property active
    * @type boolean
    * @default yes
     */
    this.active = true;
  }


  /**
  * Adds event-handler for mouse/touch events to update the component only if 
  * a user-action happened.
  *
  * @method setupEventHandlers
   */

  Component_ImageMap.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var contains, hotspot, j, len, ref, results;
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
        if (contains && _this.active) {
          ref = _this.hotspots;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            hotspot = ref[j];
            if (_this.checkHotspotAction(hotspot)) {
              e.breakChain = true;
              if (hotspot.data.bindToSwitch) {
                hotspot.selected = !hotspot.selected;
              }
              results.push(_this.executeHotspotAction(hotspot));
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      };
    })(this)), null, this.object);
  };


  /**
  * Initializes the image-map. Creates the background and hotspots.
  *
  * @method setup
   */

  Component_ImageMap.prototype.setup = function() {
    var bitmap, ground;
    this.setupEventHandlers();
    this.object.rIndex = 11000;
    bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + this.object.images[0]);
    bitmap.makeMutable();
    ground = new gs.Bitmap(bitmap.width, bitmap.height);
    ground.blt(0, 0, bitmap, new Rect(0, 0, bitmap.width, bitmap.height));
    this.ground = new gs.Object_Picture();
    this.ground.bitmap = ground;
    this.ground.image = null;
    this.ground.zIndex = this.object.zIndex;
    this.ground.imageHandling = gs.ImageHandling.CUSTOM_SIZE;
    this.object.addObject(this.ground);
    this.setupHotspots();
    this.ground.srcRect.set(0, 0, ground.width, ground.height);
    this.ground.dstRect.width = ground.width;
    this.ground.dstRect.height = ground.height;
    this.ground.update();
    this.object.dstRect.width = this.ground.dstRect.width;
    return this.object.dstRect.height = this.ground.dstRect.height;
  };


  /**
  * Sets up the hotspots on the image-map. Each hotspot is a gs.Object_ImageMapHotspot
  * object.
  *
  * @method setupHotspots
   */

  Component_ImageMap.prototype.setupHotspots = function(hotspots) {
    return this.hotspots = this.object.hotspots.select((function(_this) {
      return function(v, i) {
        var picture, ref, ref1, ref2, ref3;
        _this.ground.bitmap.clearRect(v.x, v.y, v.size.width, v.size.height);
        picture = new gs.Object_ImageMapHotspot();
        picture.fixedSize = true;
        picture.srcRect = new Rect(v.x, v.y, v.size.width, v.size.height);
        picture.dstRect = new Rect(v.x, v.y, v.size.width, v.size.height);
        picture.imageHandling = gs.ImageHandling.CUSTOM_SIZE;
        picture.zIndex = _this.object.zIndex + 1;
        picture.selected = (ref = hotspots != null ? (ref1 = hotspots[i]) != null ? ref1.selected : void 0 : void 0) != null ? ref : false;
        picture.enabled = (ref2 = hotspots != null ? (ref3 = hotspots[i]) != null ? ref3.enabled : void 0 : void 0) != null ? ref2 : true;
        picture.actions = v.data.actions;
        picture.data = v.data;
        picture.commonEventId = v.commonEventId;
        picture.anchor.set(0.5, 0.5);
        _this.object.addObject(picture);
        return picture;
      };
    })(this));
  };


  /**
  * Initializes the image-map. Frees ground image.
  *
  * @method dispose
   */

  Component_ImageMap.prototype.dispose = function() {
    Component_ImageMap.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return this.ground.bitmap.dispose();
  };


  /**
  * Executes a hotspot's associated action. Depending on the configuration a hotspot
  * can trigger a common-event or turn on a switch for example.
  *
  * @method executeHotspotAction
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @protected
   */

  Component_ImageMap.prototype.executeHotspotAction = function(hotspot) {
    var domain, ref, ref1, ref2, ref3;
    GameManager.variableStore.setupTempVariables(this.variableContext);
    if (hotspot.data.bindToSwitch) {
      domain = GameManager.variableStore.domain;
      GameManager.variableStore.setBooleanValueTo(hotspot.data["switch"], hotspot.selected);
    }
    if (hotspot.data.bindValueTo) {
      domain = GameManager.variableStore.domain;
      GameManager.variableStore.setNumberValueTo(hotspot.data.bindValueVariable, hotspot.data.bindValue);
    }
    switch (hotspot.data.action) {
      case 1:
        if ((ref = this.object.events) != null) {
          ref.emit("jumpTo", this.object, {
            label: hotspot.data.label
          });
        }
        break;
      case 2:
        if ((ref1 = this.object.events) != null) {
          ref1.emit("callCommonEvent", this.object, {
            commonEventId: hotspot.data.commonEventId,
            finish: hotspot.data.finish
          });
        }
        break;
      case 3:
        if ((ref2 = this.object.events) != null) {
          ref2.emit("action", this.object, {
            actions: hotspot.data.actions
          });
        }
    }
    if (hotspot.data.finish) {
      return (ref3 = this.object.events) != null ? ref3.emit("finish", this.object) : void 0;
    }
  };


  /**
  * Checks if a hotspot's associated action needs to be executed. Depending on the configuration a hotspot
  * can trigger a common-event or turn on a switch for example.
  *
  * @method updateHotspotAction
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @return {boolean} If <b>true</b> the hotspot's action needs to be executed. Otherwise <b>false</b>.
  * @protected
   */

  Component_ImageMap.prototype.checkHotspotAction = function(hotspot) {
    var hovered, result;
    result = false;
    hovered = hotspot.dstRect.contains(Input.Mouse.x - hotspot.origin.x, Input.Mouse.y - hotspot.origin.y);
    if (hovered && hotspot.enabled && Input.Mouse.buttons[Input.Mouse.LEFT] === 2) {
      result = true;
    }
    return result;
  };


  /**
  * Updates a hotspot's image. Depending on the state the image of a hotspot can
  * change for example if the mouse hovers over a hotspot.
  *
  * @method updateHotspotImage
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @param {boolean} hovered - Indicates if the hotspot is hovered by mouse/touch cursor.
  * @protected
   */

  Component_ImageMap.prototype.updateHotspotImage = function(hotspot, hovered) {
    var baseImage;
    baseImage = hotspot.enabled ? this.object.images[2] || this.object.images[0] : this.object.images[0];
    if (hovered && hotspot.enabled) {
      if (hotspot.selected) {
        return hotspot.image = this.object.images[4] || this.object.images[1] || baseImage;
      } else {
        return hotspot.image = this.object.images[1] || baseImage;
      }
    } else {
      if (hotspot.selected) {
        return hotspot.image = this.object.images[3] || baseImage;
      } else {
        return hotspot.image = baseImage;
      }
    }
  };


  /**
  * Updates a hotspot.
  *
  * @method updateHotspot
  * @param {gs.Object_Picture} hotspot - The hotspot to update.
  * @protected
   */

  Component_ImageMap.prototype.updateHotspot = function(hotspot) {
    var hovered;
    hotspot.visible = this.object.visible;
    hotspot.opacity = this.object.opacity;
    hotspot.tone.setFromObject(this.object.tone);
    hotspot.color.setFromObject(this.object.color);
    if (hotspot.data.bindEnabledState) {
      GameManager.variableStore.setupTempVariables(this.variableContext);
      hotspot.enabled = GameManager.variableStore.booleanValueOf(hotspot.data.enabledSwitch);
    }
    if (hotspot.data.bindToSwitch) {
      GameManager.variableStore.setupTempVariables(this.variableContext);
      hotspot.selected = GameManager.variableStore.booleanValueOf(hotspot.data["switch"]);
    }
    hovered = hotspot.dstRect.contains(Input.Mouse.x - hotspot.origin.x, Input.Mouse.y - hotspot.origin.y);
    this.updateHotspotImage(hotspot, hovered);
    return hotspot.update();
  };


  /**
  * Updates the ground-image.
  *
  * @method updateGround
  * @protected
   */

  Component_ImageMap.prototype.updateGround = function() {
    this.ground.visible = this.object.visible;
    this.ground.opacity = this.object.opacity;
    this.ground.anchor.x = 0.5;
    this.ground.anchor.y = 0.5;
    this.ground.tone.setFromObject(this.object.tone);
    this.ground.color.setFromObject(this.object.color);
    return this.ground.update();
  };


  /**
  * Updates the image-map's ground and all hotspots.
  *
  * @method update
   */

  Component_ImageMap.prototype.update = function() {
    var hotspot, j, len, ref;
    Component_ImageMap.__super__.update.call(this);
    this.updateGround();
    ref = this.hotspots;
    for (j = 0, len = ref.length; j < len; j++) {
      hotspot = ref[j];
      this.updateHotspot(hotspot);
    }
    return null;
  };

  return Component_ImageMap;

})(gs.Component_Visual);

gs.Component_ImageMap = Component_ImageMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OytCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxNQUFuQjtJQUVBLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUE5RDtJQUNULE1BQUEsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsTUFBTSxDQUFDLEtBQWpCLEVBQXdCLE1BQU0sQ0FBQyxNQUEvQjtJQUNiLE1BQU0sQ0FBQyxHQUFQLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsTUFBakIsRUFBNkIsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxNQUFNLENBQUMsS0FBbEIsRUFBeUIsTUFBTSxDQUFDLE1BQWhDLENBQTdCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCO0lBRWpCLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLFFBQWhCO0FBQ0E7QUFBQTtTQUFBLHFDQUFBOzttQkFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBa0IsQ0FBbEI7QUFESjs7RUFWaUI7OztBQWFyQjs7Ozs7Ozs7O0VBUWEsNEJBQUE7SUFDVCxxREFBQSxTQUFBOztBQUVBOzs7Ozs7SUFNQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7Ozs7SUFNQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7Ozs7SUFNQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFFbkI7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVO0VB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K0JBTUEsWUFBQSxHQUFjLFNBQUE7SUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUMxQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUMxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFmLEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWYsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQW5DO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBZCxDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQXBDO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUE7RUFQVTs7O0FBU2Q7Ozs7OzsrQkFLQSxNQUFBLEdBQVEsU0FBQTtBQUNKLFFBQUE7SUFBQSw2Q0FBQTtJQUVBLElBQUMsQ0FBQSxZQUFELENBQUE7QUFFQTtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFmO0FBREo7QUFHQSxXQUFPO0VBUkg7Ozs7R0EzUXFCLEVBQUUsQ0FBQzs7QUFxUnBDLEVBQUUsQ0FBQyxrQkFBSCxHQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0ltYWdlTWFwXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfSW1hZ2VNYXAgZXh0ZW5kcyBncy5Db21wb25lbnRfVmlzdWFsXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChAZ3JvdW5kKVxuICAgICAgICBcbiAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7QG9iamVjdC5pbWFnZXNbMF19XCIpXG4gICAgICAgIGdyb3VuZCA9IG5ldyBncy5CaXRtYXAoYml0bWFwLndpZHRoLCBiaXRtYXAuaGVpZ2h0KVxuICAgICAgICBncm91bmQuYmx0KDAsIDAsIGJpdG1hcCwgbmV3IFJlY3QoMCwgMCwgYml0bWFwLndpZHRoLCBiaXRtYXAuaGVpZ2h0KSlcbiAgICAgICAgQGdyb3VuZC5iaXRtYXAgPSBncm91bmRcbiAgICAgICAgXG4gICAgICAgIEBzZXR1cEhvdHNwb3RzKEBob3RzcG90cylcbiAgICAgICAgZm9yIGggaW4gQGhvdHNwb3RzXG4gICAgICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBIGNvbXBvbmVudCB3aGljaCB0dXJucyBhIGdhbWUgb2JqZWN0IGludG8gYW4gaW50ZXJhY3RpdmUgaW1hZ2UtbWFwLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfSW1hZ2VNYXBcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9WaXN1YWxcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBncm91bmQvYmFzZSBpbWFnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgZ3JvdW5kXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1BpY3R1cmVcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBAZ3JvdW5kID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IG9mIGRpZmZlcmVudCBob3RzcG90cy5cbiAgICAgICAgKiBAcHJvcGVydHkgaG90c3BvdHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfUGljdHVyZVtdXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAjIyNcbiAgICAgICAgQGhvdHNwb3RzID0gbnVsbFxuICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHZhcmlhYmxlIGNvbnRleHQgdXNlZCBpZiBhIGhvdHNwb3QgbmVlZHMgdG8gZGVhbCB3aXRoIGxvY2FsIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgdmFyaWFibGVDb250ZXh0XG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAjIyNcbiAgICAgICAgQHZhcmlhYmxlQ29udGV4dCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGltYWdlLW1hcCBpcyBhY3RpdmUuIEFuIGluLWFjdGl2ZSBpbWFnZS1tYXAgZG9lc24ndCByZXNwb25kXG4gICAgICAgICogdG8gYW55IGlucHV0LWV2ZW50LiBIb3ZlciBlZmZlY3RzIGFyZSBzdGlsbCB3b3JraW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgeWVzXG4gICAgICAgICMjI1xuICAgICAgICBAYWN0aXZlID0geWVzXG4gICAgICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBldmVudC1oYW5kbGVyIGZvciBtb3VzZS90b3VjaCBldmVudHMgdG8gdXBkYXRlIHRoZSBjb21wb25lbnQgb25seSBpZiBcbiAgICAqIGEgdXNlci1hY3Rpb24gaGFwcGVuZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCAoKGUpID0+IFxuICAgICAgICAgICAgY29udGFpbnMgPSBSZWN0LmNvbnRhaW5zKEBvYmplY3QuZHN0UmVjdC54LCBAb2JqZWN0LmRzdFJlY3QueSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY29udGFpbnMgYW5kIEBhY3RpdmVcbiAgICAgICAgICAgICAgICBmb3IgaG90c3BvdCBpbiBAaG90c3BvdHNcbiAgICAgICAgICAgICAgICAgICAgaWYgQGNoZWNrSG90c3BvdEFjdGlvbihob3RzcG90KSBcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuYnJlYWtDaGFpbiA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaG90c3BvdC5kYXRhLmJpbmRUb1N3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvdHNwb3Quc2VsZWN0ZWQgPSAhaG90c3BvdC5zZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGV4ZWN1dGVIb3RzcG90QWN0aW9uKGhvdHNwb3QpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICksIG51bGwsIEBvYmplY3RcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGltYWdlLW1hcC4gQ3JlYXRlcyB0aGUgYmFja2dyb3VuZCBhbmQgaG90c3BvdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBAc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgQG9iamVjdC5ySW5kZXggPSAxMTAwMCAjIFJlY2VpdmUgSW5wdXQgRXZlbnRzIGZpcnN0XG4gICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je0BvYmplY3QuaW1hZ2VzWzBdfVwiKVxuICAgICAgICBiaXRtYXAubWFrZU11dGFibGUoKVxuICAgICAgICBncm91bmQgPSBuZXcgZ3MuQml0bWFwKGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodClcbiAgICAgICAgZ3JvdW5kLmJsdCgwLCAwLCBiaXRtYXAsIG5ldyBSZWN0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodCkpXG4gICAgICAgIFxuICAgICAgICBAZ3JvdW5kID0gbmV3IGdzLk9iamVjdF9QaWN0dXJlKClcbiAgICAgICAgQGdyb3VuZC5iaXRtYXAgPSBncm91bmRcbiAgICAgICAgQGdyb3VuZC5pbWFnZSA9IG51bGxcbiAgICAgICAgQGdyb3VuZC56SW5kZXggPSBAb2JqZWN0LnpJbmRleFxuICAgICAgICBAZ3JvdW5kLmltYWdlSGFuZGxpbmcgPSBncy5JbWFnZUhhbmRsaW5nLkNVU1RPTV9TSVpFXG4gICAgICAgIEBvYmplY3QuYWRkT2JqZWN0KEBncm91bmQpXG4gICAgICAgIFxuICAgICAgICBAc2V0dXBIb3RzcG90cygpXG4gICAgICAgIFxuICAgICAgICBAZ3JvdW5kLnNyY1JlY3Quc2V0KDAsIDAsIGdyb3VuZC53aWR0aCwgZ3JvdW5kLmhlaWdodClcbiAgICAgICAgQGdyb3VuZC5kc3RSZWN0LndpZHRoID0gZ3JvdW5kLndpZHRoXG4gICAgICAgIEBncm91bmQuZHN0UmVjdC5oZWlnaHQgPSBncm91bmQuaGVpZ2h0XG4gICAgICAgIEBncm91bmQudXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBncm91bmQuZHN0UmVjdC53aWR0aFxuICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQGdyb3VuZC5kc3RSZWN0LmhlaWdodFxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGhlIGhvdHNwb3RzIG9uIHRoZSBpbWFnZS1tYXAuIEVhY2ggaG90c3BvdCBpcyBhIGdzLk9iamVjdF9JbWFnZU1hcEhvdHNwb3RcbiAgICAqIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwSG90c3BvdHNcbiAgICAjIyNcbiAgICBzZXR1cEhvdHNwb3RzOiAoaG90c3BvdHMpIC0+XG4gICAgICAgIEBob3RzcG90cyA9IEBvYmplY3QuaG90c3BvdHMuc2VsZWN0ICh2LCBpKSA9PiBcbiAgICAgICAgICAgIEBncm91bmQuYml0bWFwLmNsZWFyUmVjdCh2LngsIHYueSwgdi5zaXplLndpZHRoLCB2LnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgcGljdHVyZSA9IG5ldyBncy5PYmplY3RfSW1hZ2VNYXBIb3RzcG90KClcbiAgICAgICAgICAgIHBpY3R1cmUuZml4ZWRTaXplID0gdHJ1ZVxuICAgICAgICAgICAgcGljdHVyZS5zcmNSZWN0ID0gbmV3IFJlY3Qodi54LCB2LnksIHYuc2l6ZS53aWR0aCwgdi5zaXplLmhlaWdodClcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdCA9IG5ldyBSZWN0KHYueCwgdi55LCB2LnNpemUud2lkdGgsIHYuc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICBwaWN0dXJlLmltYWdlSGFuZGxpbmcgPSBncy5JbWFnZUhhbmRsaW5nLkNVU1RPTV9TSVpFXG4gICAgICAgICAgICBwaWN0dXJlLnpJbmRleCA9IEBvYmplY3QuekluZGV4ICsgMVxuICAgICAgICAgICAgcGljdHVyZS5zZWxlY3RlZCA9IGhvdHNwb3RzP1tpXT8uc2VsZWN0ZWQgPyBub1xuICAgICAgICAgICAgcGljdHVyZS5lbmFibGVkID0gaG90c3BvdHM/W2ldPy5lbmFibGVkID8geWVzXG4gICAgICAgICAgICBwaWN0dXJlLmFjdGlvbnMgPSB2LmRhdGEuYWN0aW9uc1xuICAgICAgICAgICAgcGljdHVyZS5kYXRhID0gdi5kYXRhXG4gICAgICAgICAgICBwaWN0dXJlLmNvbW1vbkV2ZW50SWQgPSB2LmNvbW1vbkV2ZW50SWRcbiAgICAgICAgICAgIHBpY3R1cmUuYW5jaG9yLnNldCgwLjUsIDAuNSlcbiAgICAgICAgICAgIEBvYmplY3QuYWRkT2JqZWN0KHBpY3R1cmUpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBwaWN0dXJlXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgaW1hZ2UtbWFwLiBGcmVlcyBncm91bmQgaW1hZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIEBncm91bmQuYml0bWFwLmRpc3Bvc2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBFeGVjdXRlcyBhIGhvdHNwb3QncyBhc3NvY2lhdGVkIGFjdGlvbi4gRGVwZW5kaW5nIG9uIHRoZSBjb25maWd1cmF0aW9uIGEgaG90c3BvdFxuICAgICogY2FuIHRyaWdnZXIgYSBjb21tb24tZXZlbnQgb3IgdHVybiBvbiBhIHN3aXRjaCBmb3IgZXhhbXBsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVIb3RzcG90QWN0aW9uXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9QaWN0dXJlfSBob3RzcG90IC0gVGhlIGhvdHNwb3Qgd2hlcmUgdGhlIGltYWdlIHNob3VsZCBiZSB1cGRhdGVkLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGV4ZWN1dGVIb3RzcG90QWN0aW9uOiAoaG90c3BvdCkgLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQHZhcmlhYmxlQ29udGV4dClcbiAgICAgICAgaWYgaG90c3BvdC5kYXRhLmJpbmRUb1N3aXRjaFxuICAgICAgICAgICAgZG9tYWluID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5kb21haW5cbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0Qm9vbGVhblZhbHVlVG8oaG90c3BvdC5kYXRhLnN3aXRjaCwgaG90c3BvdC5zZWxlY3RlZClcbiAgICAgICAgaWYgaG90c3BvdC5kYXRhLmJpbmRWYWx1ZVRvXG4gICAgICAgICAgICBkb21haW4gPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmRvbWFpblxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXROdW1iZXJWYWx1ZVRvKGhvdHNwb3QuZGF0YS5iaW5kVmFsdWVWYXJpYWJsZSwgaG90c3BvdC5kYXRhLmJpbmRWYWx1ZSlcbiAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggaG90c3BvdC5kYXRhLmFjdGlvblxuICAgICAgICAgICAgd2hlbiAxICMgSnVtcCBUb1xuICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwianVtcFRvXCIsIEBvYmplY3QsIHsgbGFiZWw6IGhvdHNwb3QuZGF0YS5sYWJlbCB9KVxuICAgICAgICAgICAgd2hlbiAyICMgQ2FsbCBDb21tb24gRXZlbnRcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImNhbGxDb21tb25FdmVudFwiLCBAb2JqZWN0LCB7IGNvbW1vbkV2ZW50SWQ6IGhvdHNwb3QuZGF0YS5jb21tb25FdmVudElkLCBmaW5pc2g6IGhvdHNwb3QuZGF0YS5maW5pc2ggfSlcbiAgICAgICAgICAgIHdoZW4gMyAjIFVJIEFjdGlvblxuICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiYWN0aW9uXCIsIEBvYmplY3QsIHsgYWN0aW9uczogaG90c3BvdC5kYXRhLmFjdGlvbnMgfSlcbiAgICAgICAgXG4gICAgICAgIGlmIGhvdHNwb3QuZGF0YS5maW5pc2hcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiZmluaXNoXCIsIEBvYmplY3QpXG4gICAgICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgYSBob3RzcG90J3MgYXNzb2NpYXRlZCBhY3Rpb24gbmVlZHMgdG8gYmUgZXhlY3V0ZWQuIERlcGVuZGluZyBvbiB0aGUgY29uZmlndXJhdGlvbiBhIGhvdHNwb3RcbiAgICAqIGNhbiB0cmlnZ2VyIGEgY29tbW9uLWV2ZW50IG9yIHR1cm4gb24gYSBzd2l0Y2ggZm9yIGV4YW1wbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVIb3RzcG90QWN0aW9uXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9QaWN0dXJlfSBob3RzcG90IC0gVGhlIGhvdHNwb3Qgd2hlcmUgdGhlIGltYWdlIHNob3VsZCBiZSB1cGRhdGVkLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gSWYgPGI+dHJ1ZTwvYj4gdGhlIGhvdHNwb3QncyBhY3Rpb24gbmVlZHMgdG8gYmUgZXhlY3V0ZWQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj4uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY2hlY2tIb3RzcG90QWN0aW9uOiAoaG90c3BvdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgaG92ZXJlZCA9IGhvdHNwb3QuZHN0UmVjdC5jb250YWlucyhJbnB1dC5Nb3VzZS54IC0gaG90c3BvdC5vcmlnaW4ueCwgSW5wdXQuTW91c2UueSAtIGhvdHNwb3Qub3JpZ2luLnkpXG4gICAgICAgIFxuICAgICAgICBpZiBob3ZlcmVkIGFuZCBob3RzcG90LmVuYWJsZWQgYW5kIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTEVGVF0gPT0gMlxuICAgICAgICAgICAgcmVzdWx0ID0geWVzXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyBhIGhvdHNwb3QncyBpbWFnZS4gRGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSB0aGUgaW1hZ2Ugb2YgYSBob3RzcG90IGNhblxuICAgICogY2hhbmdlIGZvciBleGFtcGxlIGlmIHRoZSBtb3VzZSBob3ZlcnMgb3ZlciBhIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVIb3RzcG90SW1hZ2VcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X1BpY3R1cmV9IGhvdHNwb3QgLSBUaGUgaG90c3BvdCB3aGVyZSB0aGUgaW1hZ2Ugc2hvdWxkIGJlIHVwZGF0ZWQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhvdmVyZWQgLSBJbmRpY2F0ZXMgaWYgdGhlIGhvdHNwb3QgaXMgaG92ZXJlZCBieSBtb3VzZS90b3VjaCBjdXJzb3IuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlSG90c3BvdEltYWdlOiAoaG90c3BvdCwgaG92ZXJlZCkgLT5cbiAgICAgICAgYmFzZUltYWdlID0gaWYgaG90c3BvdC5lbmFibGVkIHRoZW4gQG9iamVjdC5pbWFnZXNbMl0gfHwgQG9iamVjdC5pbWFnZXNbMF0gZWxzZSBAb2JqZWN0LmltYWdlc1swXSBcbiAgICAgICAgaWYgaG92ZXJlZCBhbmQgaG90c3BvdC5lbmFibGVkXG4gICAgICAgICAgICBpZiBob3RzcG90LnNlbGVjdGVkXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZSA9IEBvYmplY3QuaW1hZ2VzWzRdIHx8IEBvYmplY3QuaW1hZ2VzWzFdIHx8IGJhc2VJbWFnZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1sxXSB8fCBiYXNlSW1hZ2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgaG90c3BvdC5zZWxlY3RlZFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1szXSB8fCBiYXNlSW1hZ2VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBob3RzcG90LmltYWdlID0gYmFzZUltYWdlXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyBhIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVIb3RzcG90XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9QaWN0dXJlfSBob3RzcG90IC0gVGhlIGhvdHNwb3QgdG8gdXBkYXRlLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgIFxuICAgIHVwZGF0ZUhvdHNwb3Q6IChob3RzcG90KSAtPlxuICAgICAgICBob3RzcG90LnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgaG90c3BvdC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgIGhvdHNwb3QudG9uZS5zZXRGcm9tT2JqZWN0KEBvYmplY3QudG9uZSlcbiAgICAgICAgaG90c3BvdC5jb2xvci5zZXRGcm9tT2JqZWN0KEBvYmplY3QuY29sb3IpXG4gICAgICAgIGlmIGhvdHNwb3QuZGF0YS5iaW5kRW5hYmxlZFN0YXRlXG4gICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAdmFyaWFibGVDb250ZXh0KVxuICAgICAgICAgICAgaG90c3BvdC5lbmFibGVkID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuVmFsdWVPZihob3RzcG90LmRhdGEuZW5hYmxlZFN3aXRjaClcbiAgICAgICAgaWYgaG90c3BvdC5kYXRhLmJpbmRUb1N3aXRjaFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQHZhcmlhYmxlQ29udGV4dClcbiAgICAgICAgICAgIGhvdHNwb3Quc2VsZWN0ZWQgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZU9mKGhvdHNwb3QuZGF0YS5zd2l0Y2gpXG4gICAgICAgIGhvdmVyZWQgPSBob3RzcG90LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIGhvdHNwb3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBob3RzcG90Lm9yaWdpbi55KVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZUhvdHNwb3RJbWFnZShob3RzcG90LCBob3ZlcmVkKSAgICAgICBcbiAgICAgICAgaG90c3BvdC51cGRhdGUoKSAgICAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGdyb3VuZC1pbWFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUdyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIHVwZGF0ZUdyb3VuZDogLT5cbiAgICAgICAgQGdyb3VuZC52aXNpYmxlID0gQG9iamVjdC52aXNpYmxlXG4gICAgICAgIEBncm91bmQub3BhY2l0eSA9IEBvYmplY3Qub3BhY2l0eVxuICAgICAgICBAZ3JvdW5kLmFuY2hvci54ID0gMC41XG4gICAgICAgIEBncm91bmQuYW5jaG9yLnkgPSAwLjVcbiAgICAgICAgQGdyb3VuZC50b25lLnNldEZyb21PYmplY3QoQG9iamVjdC50b25lKVxuICAgICAgICBAZ3JvdW5kLmNvbG9yLnNldEZyb21PYmplY3QoQG9iamVjdC5jb2xvcilcbiAgICAgICAgQGdyb3VuZC51cGRhdGUoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBpbWFnZS1tYXAncyBncm91bmQgYW5kIGFsbCBob3RzcG90cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZUdyb3VuZCgpXG4gICAgICAgIFxuICAgICAgICBmb3IgaG90c3BvdCBpbiBAaG90c3BvdHNcbiAgICAgICAgICAgIEB1cGRhdGVIb3RzcG90KGhvdHNwb3QpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICBcbmdzLkNvbXBvbmVudF9JbWFnZU1hcCA9IENvbXBvbmVudF9JbWFnZU1hcCJdfQ==
//# sourceURL=Component_ImageMap_110.js