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
    var bitmap, ground;
    this.setupEventHandlers();
    this.object.addObject(this.ground);
    bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + this.object.images[0]);
    ground = new gs.Bitmap(bitmap.width, bitmap.height);
    ground.blt(0, 0, bitmap, new Rect(0, 0, bitmap.width, bitmap.height));
    this.ground.bitmap = ground;
    return this.setupHotspots(this.hotspots);
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
        picture.hovered = false;
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
    AudioManager.playSound(hotspot.data.onClickSound);
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
    if (hovered !== hotspot.hovered) {
      hotspot.hovered = hovered;
      if (hovered) {
        AudioManager.playSound(hotspot.data.onHoverSound);
      }
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OytCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxNQUFuQjtJQUVBLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUE5RDtJQUNULE1BQUEsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsTUFBTSxDQUFDLEtBQWpCLEVBQXdCLE1BQU0sQ0FBQyxNQUEvQjtJQUNiLE1BQU0sQ0FBQyxHQUFQLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsTUFBakIsRUFBNkIsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxNQUFNLENBQUMsS0FBbEIsRUFBeUIsTUFBTSxDQUFDLE1BQWhDLENBQTdCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCO1dBRWpCLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLFFBQWhCO0VBVGlCOzs7QUFXckI7Ozs7Ozs7OztFQVFhLDRCQUFBO0lBQ1QscURBQUEsU0FBQTs7QUFFQTs7Ozs7O0lBTUEsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7O0lBTUEsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7O0lBTUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7O0FBRW5COzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtFQWxDRDs7O0FBb0NiOzs7Ozs7OytCQU1BLGtCQUFBLEdBQW9CLFNBQUE7SUFDaEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLElBQUMsQ0FBQSxNQUE3QztXQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUF0QixDQUF5QixTQUF6QixFQUFvQyxDQUFDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO0FBQ2pDLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUE5QixFQUFpQyxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFqRCxFQUNFLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBRGxCLEVBQ3lCLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BRHpDLEVBRUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFaLEdBQWdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBRmpDLEVBRW9DLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBWixHQUFnQixLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUZuRTtRQUlYLElBQUcsUUFBQSxJQUFhLEtBQUMsQ0FBQSxNQUFqQjtBQUNJO0FBQUE7ZUFBQSxxQ0FBQTs7WUFDSSxJQUFHLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixPQUFwQixDQUFIO2NBQ0ksQ0FBQyxDQUFDLFVBQUYsR0FBZTtjQUNmLElBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFoQjtnQkFDSSxPQUFPLENBQUMsUUFBUixHQUFtQixDQUFDLE9BQU8sQ0FBQyxTQURoQzs7MkJBRUEsS0FBQyxDQUFBLG9CQUFELENBQXNCLE9BQXRCLEdBSko7YUFBQSxNQUFBO21DQUFBOztBQURKO3lCQURKOztNQUxpQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUFwQyxFQWFHLElBYkgsRUFhUyxJQUFDLENBQUEsTUFiVjtFQUZnQjs7O0FBa0JwQjs7Ozs7OytCQUtBLEtBQUEsR0FBTyxTQUFBO0FBQ0gsUUFBQTtJQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCO0lBQ2pCLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUE5RDtJQUNULE1BQU0sQ0FBQyxXQUFQLENBQUE7SUFDQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLE1BQU0sQ0FBQyxLQUFqQixFQUF3QixNQUFNLENBQUMsTUFBL0I7SUFDYixNQUFNLENBQUMsR0FBUCxDQUFXLENBQVgsRUFBYyxDQUFkLEVBQWlCLE1BQWpCLEVBQTZCLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsTUFBTSxDQUFDLEtBQWxCLEVBQXlCLE1BQU0sQ0FBQyxNQUFoQyxDQUE3QjtJQUVBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsY0FBSCxDQUFBO0lBQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCO0lBQ2pCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixHQUFnQjtJQUNoQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUN6QixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsR0FBd0IsRUFBRSxDQUFDLGFBQWEsQ0FBQztJQUN6QyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBa0IsSUFBQyxDQUFBLE1BQW5CO0lBRUEsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQWhCLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLE1BQU0sQ0FBQyxLQUFqQyxFQUF3QyxNQUFNLENBQUMsTUFBL0M7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixNQUFNLENBQUM7SUFDL0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsTUFBTSxDQUFDO0lBQ2hDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0lBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7V0FDeEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUF2QnRDOzs7QUF5QlA7Ozs7Ozs7K0JBTUEsYUFBQSxHQUFlLFNBQUMsUUFBRDtXQUNYLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBakIsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ2hDLFlBQUE7UUFBQSxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFmLENBQXlCLENBQUMsQ0FBQyxDQUEzQixFQUE4QixDQUFDLENBQUMsQ0FBaEMsRUFBbUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUExQyxFQUFpRCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQXhEO1FBQ0EsT0FBQSxHQUFjLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUE7UUFDZCxPQUFPLENBQUMsU0FBUixHQUFvQjtRQUNwQixPQUFPLENBQUMsT0FBUixHQUFzQixJQUFBLElBQUEsQ0FBSyxDQUFDLENBQUMsQ0FBUCxFQUFVLENBQUMsQ0FBQyxDQUFaLEVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUF0QixFQUE2QixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQXBDO1FBQ3RCLE9BQU8sQ0FBQyxPQUFSLEdBQXNCLElBQUEsSUFBQSxDQUFLLENBQUMsQ0FBQyxDQUFQLEVBQVUsQ0FBQyxDQUFDLENBQVosRUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQXRCLEVBQTZCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBcEM7UUFDdEIsT0FBTyxDQUFDLGFBQVIsR0FBd0IsRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUN6QyxPQUFPLENBQUMsTUFBUixHQUFpQixLQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUI7UUFDbEMsT0FBTyxDQUFDLFFBQVIsNkdBQTRDO1FBQzVDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO1FBQ2xCLE9BQU8sQ0FBQyxPQUFSLDhHQUEwQztRQUMxQyxPQUFPLENBQUMsT0FBUixHQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFSLEdBQWUsQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxhQUFSLEdBQXdCLENBQUMsQ0FBQztRQUMxQixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsR0FBeEI7UUFDQSxLQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBa0IsT0FBbEI7QUFFQSxlQUFPO01BakJ5QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7RUFERDs7O0FBb0JmOzs7Ozs7K0JBS0EsT0FBQSxHQUFTLFNBQUE7SUFDTCxpREFBQSxTQUFBO0lBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLElBQUMsQ0FBQSxNQUE3QztXQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQWYsQ0FBQTtFQUhLOzs7QUFLVDs7Ozs7Ozs7OytCQVFBLG9CQUFBLEdBQXNCLFNBQUMsT0FBRDtBQUNsQixRQUFBO0lBQUEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsSUFBQyxDQUFBLGVBQTlDO0lBQ0EsSUFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQWhCO01BQ0ksTUFBQSxHQUFTLFdBQVcsQ0FBQyxhQUFhLENBQUM7TUFDbkMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxpQkFBMUIsQ0FBNEMsT0FBTyxDQUFDLElBQUksRUFBQyxNQUFELEVBQXhELEVBQWlFLE9BQU8sQ0FBQyxRQUF6RSxFQUZKOztJQUdBLElBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFoQjtNQUNJLE1BQUEsR0FBUyxXQUFXLENBQUMsYUFBYSxDQUFDO01BQ25DLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQTFCLENBQTJDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQXhELEVBQTJFLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBeEYsRUFGSjs7SUFJQSxZQUFZLENBQUMsU0FBYixDQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQXBDO0FBQ0EsWUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQXBCO0FBQUEsV0FDUyxDQURUOzthQUVzQixDQUFFLElBQWhCLENBQXFCLFFBQXJCLEVBQStCLElBQUMsQ0FBQSxNQUFoQyxFQUF3QztZQUFFLEtBQUEsRUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQXRCO1dBQXhDOztBQURDO0FBRFQsV0FHUyxDQUhUOztjQUlzQixDQUFFLElBQWhCLENBQXFCLGlCQUFyQixFQUF3QyxJQUFDLENBQUEsTUFBekMsRUFBaUQ7WUFBRSxhQUFBLEVBQWUsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUE5QjtZQUE2QyxNQUFBLEVBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFsRTtXQUFqRDs7QUFEQztBQUhULFdBS1MsQ0FMVDs7Y0FNc0IsQ0FBRSxJQUFoQixDQUFxQixRQUFyQixFQUErQixJQUFDLENBQUEsTUFBaEMsRUFBd0M7WUFBRSxPQUFBLEVBQVMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUF4QjtXQUF4Qzs7QUFOUjtJQVFBLElBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFoQjt1REFDa0IsQ0FBRSxJQUFoQixDQUFxQixRQUFyQixFQUErQixJQUFDLENBQUEsTUFBaEMsV0FESjs7RUFsQmtCOzs7QUFzQnRCOzs7Ozs7Ozs7OytCQVNBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDtBQUNoQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBaEIsQ0FBeUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFaLEdBQWdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBeEQsRUFBMkQsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFaLEdBQWdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBMUY7SUFFVixJQUFHLE9BQUEsSUFBWSxPQUFPLENBQUMsT0FBcEIsSUFBZ0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLENBQXBCLEtBQXlDLENBQTVFO01BQ0ksTUFBQSxHQUFTLEtBRGI7O0FBR0EsV0FBTztFQVBTOzs7QUFTcEI7Ozs7Ozs7Ozs7K0JBU0Esa0JBQUEsR0FBb0IsU0FBQyxPQUFELEVBQVUsT0FBVjtBQUNoQixRQUFBO0lBQUEsU0FBQSxHQUFlLE9BQU8sQ0FBQyxPQUFYLEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBZixJQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTVELEdBQW9FLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUE7SUFDL0YsSUFBRyxPQUFBLElBQVksT0FBTyxDQUFDLE9BQXZCO01BQ0ksSUFBRyxPQUFPLENBQUMsUUFBWDtlQUNJLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBZixJQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXBDLElBQTBDLFVBRDlEO09BQUEsTUFBQTtlQUdJLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBZixJQUFxQixVQUh6QztPQURKO0tBQUEsTUFBQTtNQU1JLElBQUcsT0FBTyxDQUFDLFFBQVg7ZUFDSSxPQUFPLENBQUMsS0FBUixHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQWYsSUFBcUIsVUFEekM7T0FBQSxNQUFBO2VBR0ksT0FBTyxDQUFDLEtBQVIsR0FBZ0IsVUFIcEI7T0FOSjs7RUFGZ0I7OztBQWNwQjs7Ozs7Ozs7K0JBT0EsYUFBQSxHQUFlLFNBQUMsT0FBRDtBQUNYLFFBQUE7SUFBQSxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUM7SUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkM7SUFDQSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWQsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFwQztJQUNBLElBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBaEI7TUFDSSxXQUFXLENBQUMsYUFBYSxDQUFDLGtCQUExQixDQUE2QyxJQUFDLENBQUEsZUFBOUM7TUFDQSxPQUFPLENBQUMsT0FBUixHQUFrQixXQUFXLENBQUMsYUFBYSxDQUFDLGNBQTFCLENBQXlDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBdEQsRUFGdEI7O0lBR0EsSUFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQWhCO01BQ0ksV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsSUFBQyxDQUFBLGVBQTlDO01BQ0EsT0FBTyxDQUFDLFFBQVIsR0FBbUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUExQixDQUF5QyxPQUFPLENBQUMsSUFBSSxFQUFDLE1BQUQsRUFBckQsRUFGdkI7O0lBR0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBaEIsQ0FBeUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFaLEdBQWdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBeEQsRUFBMkQsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFaLEdBQWdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBMUY7SUFDVixJQUFHLE9BQUEsS0FBVyxPQUFPLENBQUMsT0FBdEI7TUFDSSxPQUFPLENBQUMsT0FBUixHQUFrQjtNQUNsQixJQUFxRCxPQUFyRDtRQUFBLFlBQVksQ0FBQyxTQUFiLENBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBcEMsRUFBQTtPQUZKOztJQUdBLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixPQUFwQixFQUE2QixPQUE3QjtXQUNBLE9BQU8sQ0FBQyxNQUFSLENBQUE7RUFoQlc7OztBQWtCZjs7Ozs7OzsrQkFNQSxZQUFBLEdBQWMsU0FBQTtJQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDO0lBQzFCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDO0lBQzFCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWYsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBZixHQUFtQjtJQUNuQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkM7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFkLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBcEM7V0FDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtFQVBVOzs7QUFTZDs7Ozs7OytCQUtBLE1BQUEsR0FBUSxTQUFBO0FBQ0osUUFBQTtJQUFBLDZDQUFBO0lBRUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtBQUVBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDSSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQWY7QUFESjtBQUdBLFdBQU87RUFSSDs7OztHQTlRcUIsRUFBRSxDQUFDOztBQXdScEMsRUFBRSxDQUFDLGtCQUFILEdBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfSW1hZ2VNYXBcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9JbWFnZU1hcCBleHRlbmRzIGdzLkNvbXBvbmVudF9WaXN1YWxcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEBvYmplY3QuYWRkT2JqZWN0KEBncm91bmQpXG4gICAgICAgIFxuICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tAb2JqZWN0LmltYWdlc1swXX1cIilcbiAgICAgICAgZ3JvdW5kID0gbmV3IGdzLkJpdG1hcChiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgIGdyb3VuZC5ibHQoMCwgMCwgYml0bWFwLCBuZXcgUmVjdCgwLCAwLCBiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpKVxuICAgICAgICBAZ3JvdW5kLmJpdG1hcCA9IGdyb3VuZFxuICAgICAgICBcbiAgICAgICAgQHNldHVwSG90c3BvdHMoQGhvdHNwb3RzKVxuXG4gICAgIyMjKlxuICAgICogQSBjb21wb25lbnQgd2hpY2ggdHVybnMgYSBnYW1lIG9iamVjdCBpbnRvIGFuIGludGVyYWN0aXZlIGltYWdlLW1hcC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0ltYWdlTWFwXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ3JvdW5kL2Jhc2UgaW1hZ2UuXG4gICAgICAgICogQHByb3BlcnR5IGdyb3VuZFxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9QaWN0dXJlXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAjIyNcbiAgICAgICAgQGdyb3VuZCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBhcnJheSBvZiBkaWZmZXJlbnQgaG90c3BvdHMuXG4gICAgICAgICogQHByb3BlcnR5IGhvdHNwb3RzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1BpY3R1cmVbXVxuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgIyMjXG4gICAgICAgIEBob3RzcG90cyA9IG51bGxcbiAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSB2YXJpYWJsZSBjb250ZXh0IHVzZWQgaWYgYSBob3RzcG90IG5lZWRzIHRvIGRlYWwgd2l0aCBsb2NhbCB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IHZhcmlhYmxlQ29udGV4dFxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgIyMjXG4gICAgICAgIEB2YXJpYWJsZUNvbnRleHQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbWFnZS1tYXAgaXMgYWN0aXZlLiBBbiBpbi1hY3RpdmUgaW1hZ2UtbWFwIGRvZXNuJ3QgcmVzcG9uZFxuICAgICAgICAqIHRvIGFueSBpbnB1dC1ldmVudC4gSG92ZXIgZWZmZWN0cyBhcmUgc3RpbGwgd29ya2luZy5cbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBkZWZhdWx0IHllc1xuICAgICAgICAjIyNcbiAgICAgICAgQGFjdGl2ZSA9IHllc1xuICAgICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgZXZlbnQtaGFuZGxlciBmb3IgbW91c2UvdG91Y2ggZXZlbnRzIHRvIHVwZGF0ZSB0aGUgY29tcG9uZW50IG9ubHkgaWYgXG4gICAgKiBhIHVzZXItYWN0aW9uIGhhcHBlbmVkLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBFdmVudEhhbmRsZXJzXG4gICAgIyMjIFxuICAgIHNldHVwRXZlbnRIYW5kbGVyczogLT5cbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlVXBcIiwgKChlKSA9PiBcbiAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC5Nb3VzZS54IC0gQG9iamVjdC5vcmlnaW4ueCwgSW5wdXQuTW91c2UueSAtIEBvYmplY3Qub3JpZ2luLnkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNvbnRhaW5zIGFuZCBAYWN0aXZlXG4gICAgICAgICAgICAgICAgZm9yIGhvdHNwb3QgaW4gQGhvdHNwb3RzXG4gICAgICAgICAgICAgICAgICAgIGlmIEBjaGVja0hvdHNwb3RBY3Rpb24oaG90c3BvdCkgXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmJyZWFrQ2hhaW4gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGhvdHNwb3QuZGF0YS5iaW5kVG9Td2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3RzcG90LnNlbGVjdGVkID0gIWhvdHNwb3Quc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBleGVjdXRlSG90c3BvdEFjdGlvbihob3RzcG90KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBpbWFnZS1tYXAuIENyZWF0ZXMgdGhlIGJhY2tncm91bmQgYW5kIGhvdHNwb3RzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEBvYmplY3QuckluZGV4ID0gMTEwMDAgIyBSZWNlaXZlIElucHV0IEV2ZW50cyBmaXJzdFxuICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tAb2JqZWN0LmltYWdlc1swXX1cIilcbiAgICAgICAgYml0bWFwLm1ha2VNdXRhYmxlKClcbiAgICAgICAgZ3JvdW5kID0gbmV3IGdzLkJpdG1hcChiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgIGdyb3VuZC5ibHQoMCwgMCwgYml0bWFwLCBuZXcgUmVjdCgwLCAwLCBiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpKVxuICAgICAgICBcbiAgICAgICAgQGdyb3VuZCA9IG5ldyBncy5PYmplY3RfUGljdHVyZSgpXG4gICAgICAgIEBncm91bmQuYml0bWFwID0gZ3JvdW5kXG4gICAgICAgIEBncm91bmQuaW1hZ2UgPSBudWxsXG4gICAgICAgIEBncm91bmQuekluZGV4ID0gQG9iamVjdC56SW5kZXhcbiAgICAgICAgQGdyb3VuZC5pbWFnZUhhbmRsaW5nID0gZ3MuSW1hZ2VIYW5kbGluZy5DVVNUT01fU0laRVxuICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChAZ3JvdW5kKVxuICAgICAgICBcbiAgICAgICAgQHNldHVwSG90c3BvdHMoKVxuICAgICAgICBcbiAgICAgICAgQGdyb3VuZC5zcmNSZWN0LnNldCgwLCAwLCBncm91bmQud2lkdGgsIGdyb3VuZC5oZWlnaHQpXG4gICAgICAgIEBncm91bmQuZHN0UmVjdC53aWR0aCA9IGdyb3VuZC53aWR0aFxuICAgICAgICBAZ3JvdW5kLmRzdFJlY3QuaGVpZ2h0ID0gZ3JvdW5kLmhlaWdodFxuICAgICAgICBAZ3JvdW5kLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAZ3JvdW5kLmRzdFJlY3Qud2lkdGhcbiAgICAgICAgQG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBncm91bmQuZHN0UmVjdC5oZWlnaHRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSBob3RzcG90cyBvbiB0aGUgaW1hZ2UtbWFwLiBFYWNoIGhvdHNwb3QgaXMgYSBncy5PYmplY3RfSW1hZ2VNYXBIb3RzcG90XG4gICAgKiBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEhvdHNwb3RzXG4gICAgIyMjXG4gICAgc2V0dXBIb3RzcG90czogKGhvdHNwb3RzKSAtPlxuICAgICAgICBAaG90c3BvdHMgPSBAb2JqZWN0LmhvdHNwb3RzLnNlbGVjdCAodiwgaSkgPT4gXG4gICAgICAgICAgICBAZ3JvdW5kLmJpdG1hcC5jbGVhclJlY3Qodi54LCB2LnksIHYuc2l6ZS53aWR0aCwgdi5zaXplLmhlaWdodClcbiAgICAgICAgICAgIHBpY3R1cmUgPSBuZXcgZ3MuT2JqZWN0X0ltYWdlTWFwSG90c3BvdCgpXG4gICAgICAgICAgICBwaWN0dXJlLmZpeGVkU2l6ZSA9IHRydWVcbiAgICAgICAgICAgIHBpY3R1cmUuc3JjUmVjdCA9IG5ldyBSZWN0KHYueCwgdi55LCB2LnNpemUud2lkdGgsIHYuc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QgPSBuZXcgUmVjdCh2LngsIHYueSwgdi5zaXplLndpZHRoLCB2LnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgcGljdHVyZS5pbWFnZUhhbmRsaW5nID0gZ3MuSW1hZ2VIYW5kbGluZy5DVVNUT01fU0laRVxuICAgICAgICAgICAgcGljdHVyZS56SW5kZXggPSBAb2JqZWN0LnpJbmRleCArIDFcbiAgICAgICAgICAgIHBpY3R1cmUuc2VsZWN0ZWQgPSBob3RzcG90cz9baV0/LnNlbGVjdGVkID8gbm9cbiAgICAgICAgICAgIHBpY3R1cmUuaG92ZXJlZCA9IG5vXG4gICAgICAgICAgICBwaWN0dXJlLmVuYWJsZWQgPSBob3RzcG90cz9baV0/LmVuYWJsZWQgPyB5ZXNcbiAgICAgICAgICAgIHBpY3R1cmUuYWN0aW9ucyA9IHYuZGF0YS5hY3Rpb25zXG4gICAgICAgICAgICBwaWN0dXJlLmRhdGEgPSB2LmRhdGFcbiAgICAgICAgICAgIHBpY3R1cmUuY29tbW9uRXZlbnRJZCA9IHYuY29tbW9uRXZlbnRJZFxuICAgICAgICAgICAgcGljdHVyZS5hbmNob3Iuc2V0KDAuNSwgMC41KVxuICAgICAgICAgICAgQG9iamVjdC5hZGRPYmplY3QocGljdHVyZSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBpY3R1cmVcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBpbWFnZS1tYXAuIEZyZWVzIGdyb3VuZCBpbWFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQG9iamVjdClcbiAgICAgICAgQGdyb3VuZC5iaXRtYXAuZGlzcG9zZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGEgaG90c3BvdCdzIGFzc29jaWF0ZWQgYWN0aW9uLiBEZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24gYSBob3RzcG90XG4gICAgKiBjYW4gdHJpZ2dlciBhIGNvbW1vbi1ldmVudCBvciB0dXJuIG9uIGEgc3dpdGNoIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUhvdHNwb3RBY3Rpb25cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X1BpY3R1cmV9IGhvdHNwb3QgLSBUaGUgaG90c3BvdCB3aGVyZSB0aGUgaW1hZ2Ugc2hvdWxkIGJlIHVwZGF0ZWQuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZXhlY3V0ZUhvdHNwb3RBY3Rpb246IChob3RzcG90KSAtPlxuICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAdmFyaWFibGVDb250ZXh0KVxuICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZFRvU3dpdGNoXG4gICAgICAgICAgICBkb21haW4gPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmRvbWFpblxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRCb29sZWFuVmFsdWVUbyhob3RzcG90LmRhdGEuc3dpdGNoLCBob3RzcG90LnNlbGVjdGVkKVxuICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZFZhbHVlVG9cbiAgICAgICAgICAgIGRvbWFpbiA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuZG9tYWluXG4gICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldE51bWJlclZhbHVlVG8oaG90c3BvdC5kYXRhLmJpbmRWYWx1ZVZhcmlhYmxlLCBob3RzcG90LmRhdGEuYmluZFZhbHVlKVxuICAgICAgICAgICAgXG4gICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoaG90c3BvdC5kYXRhLm9uQ2xpY2tTb3VuZClcbiAgICAgICAgc3dpdGNoIGhvdHNwb3QuZGF0YS5hY3Rpb25cbiAgICAgICAgICAgIHdoZW4gMSAjIEp1bXAgVG9cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImp1bXBUb1wiLCBAb2JqZWN0LCB7IGxhYmVsOiBob3RzcG90LmRhdGEubGFiZWwgfSlcbiAgICAgICAgICAgIHdoZW4gMiAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJjYWxsQ29tbW9uRXZlbnRcIiwgQG9iamVjdCwgeyBjb21tb25FdmVudElkOiBob3RzcG90LmRhdGEuY29tbW9uRXZlbnRJZCwgZmluaXNoOiBob3RzcG90LmRhdGEuZmluaXNoIH0pXG4gICAgICAgICAgICB3aGVuIDMgIyBVSSBBY3Rpb25cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImFjdGlvblwiLCBAb2JqZWN0LCB7IGFjdGlvbnM6IGhvdHNwb3QuZGF0YS5hY3Rpb25zIH0pXG4gICAgICAgIFxuICAgICAgICBpZiBob3RzcG90LmRhdGEuZmluaXNoXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImZpbmlzaFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIGEgaG90c3BvdCdzIGFzc29jaWF0ZWQgYWN0aW9uIG5lZWRzIHRvIGJlIGV4ZWN1dGVkLiBEZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24gYSBob3RzcG90XG4gICAgKiBjYW4gdHJpZ2dlciBhIGNvbW1vbi1ldmVudCBvciB0dXJuIG9uIGEgc3dpdGNoIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSG90c3BvdEFjdGlvblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfUGljdHVyZX0gaG90c3BvdCAtIFRoZSBob3RzcG90IHdoZXJlIHRoZSBpbWFnZSBzaG91bGQgYmUgdXBkYXRlZC5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IElmIDxiPnRydWU8L2I+IHRoZSBob3RzcG90J3MgYWN0aW9uIG5lZWRzIHRvIGJlIGV4ZWN1dGVkLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNoZWNrSG90c3BvdEFjdGlvbjogKGhvdHNwb3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIGhvdmVyZWQgPSBob3RzcG90LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIGhvdHNwb3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBob3RzcG90Lm9yaWdpbi55KVxuICAgICAgICBcbiAgICAgICAgaWYgaG92ZXJlZCBhbmQgaG90c3BvdC5lbmFibGVkIGFuZCBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdID09IDJcbiAgICAgICAgICAgIHJlc3VsdCA9IHllc1xuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYSBob3RzcG90J3MgaW1hZ2UuIERlcGVuZGluZyBvbiB0aGUgc3RhdGUgdGhlIGltYWdlIG9mIGEgaG90c3BvdCBjYW5cbiAgICAqIGNoYW5nZSBmb3IgZXhhbXBsZSBpZiB0aGUgbW91c2UgaG92ZXJzIG92ZXIgYSBob3RzcG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSG90c3BvdEltYWdlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9QaWN0dXJlfSBob3RzcG90IC0gVGhlIGhvdHNwb3Qgd2hlcmUgdGhlIGltYWdlIHNob3VsZCBiZSB1cGRhdGVkLlxuICAgICogQHBhcmFtIHtib29sZWFufSBob3ZlcmVkIC0gSW5kaWNhdGVzIGlmIHRoZSBob3RzcG90IGlzIGhvdmVyZWQgYnkgbW91c2UvdG91Y2ggY3Vyc29yLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHVwZGF0ZUhvdHNwb3RJbWFnZTogKGhvdHNwb3QsIGhvdmVyZWQpIC0+XG4gICAgICAgIGJhc2VJbWFnZSA9IGlmIGhvdHNwb3QuZW5hYmxlZCB0aGVuIEBvYmplY3QuaW1hZ2VzWzJdIHx8IEBvYmplY3QuaW1hZ2VzWzBdIGVsc2UgQG9iamVjdC5pbWFnZXNbMF0gXG4gICAgICAgIGlmIGhvdmVyZWQgYW5kIGhvdHNwb3QuZW5hYmxlZFxuICAgICAgICAgICAgaWYgaG90c3BvdC5zZWxlY3RlZFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1s0XSB8fCBAb2JqZWN0LmltYWdlc1sxXSB8fCBiYXNlSW1hZ2VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBob3RzcG90LmltYWdlID0gQG9iamVjdC5pbWFnZXNbMV0gfHwgYmFzZUltYWdlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGhvdHNwb3Quc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICBob3RzcG90LmltYWdlID0gQG9iamVjdC5pbWFnZXNbM10gfHwgYmFzZUltYWdlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZSA9IGJhc2VJbWFnZVxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYSBob3RzcG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSG90c3BvdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfUGljdHVyZX0gaG90c3BvdCAtIFRoZSBob3RzcG90IHRvIHVwZGF0ZS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICB1cGRhdGVIb3RzcG90OiAoaG90c3BvdCkgLT5cbiAgICAgICAgaG90c3BvdC52aXNpYmxlID0gQG9iamVjdC52aXNpYmxlXG4gICAgICAgIGhvdHNwb3Qub3BhY2l0eSA9IEBvYmplY3Qub3BhY2l0eVxuICAgICAgICBob3RzcG90LnRvbmUuc2V0RnJvbU9iamVjdChAb2JqZWN0LnRvbmUpXG4gICAgICAgIGhvdHNwb3QuY29sb3Iuc2V0RnJvbU9iamVjdChAb2JqZWN0LmNvbG9yKVxuICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZEVuYWJsZWRTdGF0ZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQHZhcmlhYmxlQ29udGV4dClcbiAgICAgICAgICAgIGhvdHNwb3QuZW5hYmxlZCA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2YoaG90c3BvdC5kYXRhLmVuYWJsZWRTd2l0Y2gpXG4gICAgICAgIGlmIGhvdHNwb3QuZGF0YS5iaW5kVG9Td2l0Y2hcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEB2YXJpYWJsZUNvbnRleHQpXG4gICAgICAgICAgICBob3RzcG90LnNlbGVjdGVkID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuVmFsdWVPZihob3RzcG90LmRhdGEuc3dpdGNoKVxuICAgICAgICBob3ZlcmVkID0gaG90c3BvdC5kc3RSZWN0LmNvbnRhaW5zKElucHV0Lk1vdXNlLnggLSBob3RzcG90Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gaG90c3BvdC5vcmlnaW4ueSlcbiAgICAgICAgaWYgaG92ZXJlZCAhPSBob3RzcG90LmhvdmVyZWRcbiAgICAgICAgICAgIGhvdHNwb3QuaG92ZXJlZCA9IGhvdmVyZWRcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoaG90c3BvdC5kYXRhLm9uSG92ZXJTb3VuZCkgaWYgaG92ZXJlZFxuICAgICAgICBAdXBkYXRlSG90c3BvdEltYWdlKGhvdHNwb3QsIGhvdmVyZWQpICAgICAgIFxuICAgICAgICBob3RzcG90LnVwZGF0ZSgpICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZ3JvdW5kLWltYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlR3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgdXBkYXRlR3JvdW5kOiAtPlxuICAgICAgICBAZ3JvdW5kLnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgQGdyb3VuZC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgIEBncm91bmQuYW5jaG9yLnggPSAwLjVcbiAgICAgICAgQGdyb3VuZC5hbmNob3IueSA9IDAuNVxuICAgICAgICBAZ3JvdW5kLnRvbmUuc2V0RnJvbU9iamVjdChAb2JqZWN0LnRvbmUpXG4gICAgICAgIEBncm91bmQuY29sb3Iuc2V0RnJvbU9iamVjdChAb2JqZWN0LmNvbG9yKVxuICAgICAgICBAZ3JvdW5kLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGltYWdlLW1hcCdzIGdyb3VuZCBhbmQgYWxsIGhvdHNwb3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlR3JvdW5kKClcbiAgICAgICAgXG4gICAgICAgIGZvciBob3RzcG90IGluIEBob3RzcG90c1xuICAgICAgICAgICAgQHVwZGF0ZUhvdHNwb3QoaG90c3BvdClcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgIFxuZ3MuQ29tcG9uZW50X0ltYWdlTWFwID0gQ29tcG9uZW50X0ltYWdlTWFwIl19
//# sourceURL=Component_ImageMap_110.js