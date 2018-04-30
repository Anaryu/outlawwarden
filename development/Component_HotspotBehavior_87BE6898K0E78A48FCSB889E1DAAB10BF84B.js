var Component_HotspotBehavior, HotspotShape,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HotspotShape = (function() {
  function HotspotShape() {}

  HotspotShape.RECTANGLE = "rect";

  HotspotShape.PIXEL = "pixel";

  return HotspotShape;

})();

gs.HotspotShape = HotspotShape;

Component_HotspotBehavior = (function(superClass) {
  extend(Component_HotspotBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_HotspotBehavior.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * Adds a hotspot-behavior to a game object. That allows a game object
  * to respond to mouse/touch actions by firing an action-event or changing
  * the game object's image.
  *
  * @module gs
  * @class Component_HotspotBehavior
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_HotspotBehavior(params) {

    /**
    * The shape used to detect if a hotspot is clicked, hovered, etc.
    * @property shape
    * @type boolean
     */
    var ref;
    this.shape = gs.HotspotShape.RECTANGLE;

    /**
    * Indicates if the hotspot is selected.
    * @property selected
    * @type boolean
     */
    this.selected = false;

    /**
    * Indicates if the hotspot is enabled.
    * @property enabled
    * @type boolean
     */
    this.enabled = true;

    /**
    * @property imageHandling
    * @type number
    * @protected
     */
    this.imageHandling = 0;

    /**
    * Indicates if the mouse/touch pointer is inside the hotspot bounds.
    * @property contains
    * @type boolean
    * @protected
     */
    this.containsPointer = false;

    /**
    * Indicates if the action-button was pressed before.
    * @property buttonUp
    * @type boolean
    * @protected
     */
    this.buttonUp = false;

    /**
    * Indicates if the action-button is pressed.
    * @property buttonDown
    * @type boolean
    * @protected
     */
    this.buttonDown = false;

    /**
    * @property actionButtons
    * @type Object
    * @protected
     */
    this.actionButtons = {
      "left": Input.Mouse.BUTTON_LEFT,
      "right": Input.Mouse.BUTTON_RIGHT,
      "middle": Input.Mouse.BUTTON_MIDDLE
    };

    /**
    * The default action-button. By default the left-button is used.
    *
    * @property actionButton
    * @type number
     */
    this.actionButton = this.actionButtons[(ref = params != null ? params.actionButton : void 0) != null ? ref : "left"];

    /**
    * The sound played if the hotspot action is executed.
    * @property sound
    * @type Object
     */
    this.sound = params != null ? params.sound : void 0;

    /**
    * <p>The sounds played depending on the hotspot state.</p>
    * <ul>
    * <li>0 = Select Sound</li>
    * <li>1 = Unselect Sound</li>
    * </ul>
    * @property sounds
    * @type Object[]
     */
    this.sounds = (params != null ? params.sounds : void 0) || [];
  }


  /**
  * Gets the render-index of the object associated with the hotspot component. This 
  * implementation is necessary to be able to act as an owner for gs.EventEmitter.on 
  * event registration. 
  *
  * @property rIndex
  * @type number
   */

  Component_HotspotBehavior.accessors("rIndex", {
    get: function() {
      return this.object.rIndex;
    }
  });


  /**
  * Sets up event handlers.
  *
  * @method setupEventHandlers
   */

  Component_HotspotBehavior.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this);
    gs.GlobalEventManager.offByOwner("mouseMoved", this);
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var contains, mx, my;
        if (!_this.object.visible) {
          return;
        }
        mx = Input.Mouse.x - _this.object.origin.x;
        my = Input.Mouse.y - _this.object.origin.y;
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, mx, my);
        if (contains) {
          contains = _this.checkShape(mx - _this.object.dstRect.x, my - _this.object.dstRect.y);
          if (contains) {
            _this.containsPointer = contains;
            _this.updateInput();
            _this.updateEvents();
            _this.object.needsUpdate = true;
            return e.breakChain = true;
          }
        }
      };
    })(this)), null, this);
    if (this.object.images || true) {
      return gs.GlobalEventManager.on("mouseMoved", ((function(_this) {
        return function(e) {
          var contains, mx, my;
          if (!_this.object.visible) {
            return;
          }
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (contains) {
            mx = Input.Mouse.x - _this.object.origin.x;
            my = Input.Mouse.y - _this.object.origin.y;
            contains = _this.checkShape(mx - _this.object.dstRect.x, my - _this.object.dstRect.y);
          }
          if (_this.containsPointer !== contains) {
            _this.containsPointer = contains;
            _this.object.needsUpdate = true;
            if (contains) {
              _this.object.events.emit("enter", _this);
            } else {
              _this.object.events.emit("leave", _this);
            }
          }
          return _this.updateInput();
        };
      })(this)), null, this);
    }
  };


  /**
  * Initializes the hotspot component.
  *
  * @method setup
   */

  Component_HotspotBehavior.prototype.setup = function() {
    var i, j, len, ref, sound;
    Component_HotspotBehavior.__super__.setup.apply(this, arguments);
    this.sound = ui.Component_FormulaHandler.fieldValue(this.object, this.sound);
    if (this.sounds != null) {
      ref = this.sounds;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        sound = ref[i];
        this.sounds[i] = ui.Component_FormulaHandler.fieldValue(this.object, sound);
      }
    } else {
      this.sounds = [];
    }
    return this.setupEventHandlers();
  };


  /**
  * Disposes the component.
  *
  * @method dispose
   */

  Component_HotspotBehavior.prototype.dispose = function() {
    Component_HotspotBehavior.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("mouseUp", this);
    return gs.GlobalEventManager.offByOwner("mouseMoved", this);
  };


  /**
  * Checks if the specified point is inside of the hotspot's shape.
  *
  * @method checkShape
  * @param x - The x-coordinate of the point.
  * @param y - The y-coordinate of the point.
  * @return If <b>true</b> the point is inside of the hotspot's shape. Otherwise <b>false</b>.
   */

  Component_HotspotBehavior.prototype.checkShape = function(x, y) {
    var ref, result;
    result = true;
    switch (this.shape) {
      case gs.HotspotShape.PIXEL:
        if (this.object.bitmap) {
          result = this.object.bitmap.isPixelSet(x, y);
        } else {
          result = (ref = this.object.target) != null ? ref.bitmap.isPixelSet(x, y) : void 0;
        }
    }
    return result;
  };


  /**
  * Updates the image depending on the hotspot state.
  *
  * @method updateImage
  * @protected
   */

  Component_HotspotBehavior.prototype.updateImage = function() {
    var baseImage, object;
    object = this.object.target || this.object;
    if (this.object.images != null) {
      baseImage = this.enabled ? this.object.images[4] || this.object.images[0] : this.object.images[0];
      if (this.containsPointer) {
        if (this.object.selected || this.selected) {
          object.image = this.object.images[3] || this.object.images[2] || baseImage;
        } else {
          object.image = this.object.images[1] || baseImage;
        }
      } else {
        if (this.object.selected || this.selected) {
          object.image = this.object.images[2] || this.object.images[4] || baseImage;
        } else {
          object.image = baseImage;
        }
      }
      if (!object.image) {
        return object.bitmap = null;
      }
    }
  };


  /**
  * Updates the hotspot position and size from an other target game object. For example, 
  * that is useful for adding a hotspot to an other moving game object.
  *
  * @method updateFromTarget
  * @protected
   */

  Component_HotspotBehavior.prototype.updateFromTarget = function() {
    if (this.object.target != null) {
      this.object.dstRect.x = this.object.target.dstRect.x;
      this.object.dstRect.y = this.object.target.dstRect.y;
      this.object.dstRect.width = this.object.target.dstRect.width;
      this.object.dstRect.height = this.object.target.dstRect.height;
      this.object.offset.x = this.object.target.offset.x;
      this.object.offset.y = this.object.target.offset.y;
      this.object.origin.x = this.object.target.origin.x;
      return this.object.origin.y = this.object.target.origin.y;
    }
  };


  /**
  * Updates the event-handling and fires necessary events.
  *
  * @method updateEvents
  * @protected
   */

  Component_HotspotBehavior.prototype.updateEvents = function() {
    var group, j, len, object;
    if (this.buttonUp && this.object.enabled && this.enabled && this.object.visible) {
      if (this.object.selectable) {
        group = gs.ObjectManager.current.objectsByGroup(this.object.group);
        for (j = 0, len = group.length; j < len; j++) {
          object = group[j];
          if (object !== this.object) {
            object.selected = false;
          }
        }
        if (this.object.group) {
          this.selected = true;
        } else {
          this.selected = !this.selected;
        }
        if (this.selected) {
          AudioManager.playSound(this.sounds[0] || this.sound);
        } else {
          AudioManager.playSound(this.sounds[1] || this.sound);
        }
        this.object.events.emit("click", this);
        return this.object.events.emit("stateChanged", this.object);
      } else {
        AudioManager.playSound(this.sounds[0] || this.sound);
        this.object.events.emit("click", this);
        return this.object.events.emit("action", this);
      }
    }
  };


  /**
  * Updates the game object's color depending on the state of the hotspot.
  *
  * @method updateColor
  * @protected
   */

  Component_HotspotBehavior.prototype.updateColor = function() {
    if (!this.object.enabled) {
      return this.object.color.set(0, 0, 0, 100);
    } else {
      return this.object.color.set(0, 0, 0, 0);
    }
  };


  /**
  * Stores current states of mouse/touch pointer and buttons.
  *
  * @method updateInput
  * @protected
   */

  Component_HotspotBehavior.prototype.updateInput = function() {
    this.buttonUp = Input.Mouse.buttons[this.actionButton] === 2 && this.containsPointer;
    return this.buttonDown = Input.Mouse.buttons[this.actionButton] === 1 && this.containsPointer;
  };


  /**
  * Updates the hotspot component.
  *
  * @method update
   */

  Component_HotspotBehavior.prototype.update = function() {
    if (!this.object.visible) {
      return;
    }
    this.updateColor();
    this.updateFromTarget();
    return this.updateImage();
  };

  return Component_HotspotBehavior;

})(gs.Component);

gs.Component_HotspotBehavior = Component_HotspotBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsdUNBQUE7RUFBQTs7O0FBQU07OztFQUNGLFlBQUMsQ0FBQSxTQUFELEdBQWE7O0VBQ2IsWUFBQyxDQUFBLEtBQUQsR0FBUzs7Ozs7O0FBQ2IsRUFBRSxDQUFDLFlBQUgsR0FBa0I7O0FBRVo7Ozs7QUFDRjs7Ozs7Ozs7O3NDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7O0VBV2EsbUNBQUMsTUFBRDs7QUFDVDs7Ozs7QUFBQSxRQUFBO0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDOztBQUV6Qjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFFbkI7Ozs7OztJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7OztJQU1BLElBQUMsQ0FBQSxVQUFELEdBQWM7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFBRSxNQUFBLEVBQVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUF0QjtNQUFtQyxPQUFBLEVBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUF4RDtNQUFzRSxRQUFBLEVBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUE1Rjs7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsYUFBYyx1RUFBdUIsTUFBdkI7O0FBRS9COzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELG9CQUFTLE1BQU0sQ0FBRTs7QUFFakI7Ozs7Ozs7OztJQVNBLElBQUMs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LEVBQTJCLENBQTNCLEVBSEo7O0VBRFM7OztBQU1iOzs7Ozs7O3NDQU1BLFdBQUEsR0FBYSxTQUFBO0lBQ1QsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxJQUFDLENBQUEsWUFBRCxDQUFwQixLQUFzQyxDQUF0QyxJQUE0QyxJQUFDLENBQUE7V0FDekQsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxJQUFDLENBQUEsWUFBRCxDQUFwQixLQUFzQyxDQUF0QyxJQUE0QyxJQUFDLENBQUE7RUFGbEQ7OztBQUliOzs7Ozs7c0NBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFHLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFmO0FBQTRCLGFBQTVCOztJQUVBLElBQUMsQ0FBQSxXQUFELENBQUE7SUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxXQUFELENBQUE7RUFMSTs7OztHQXRVNEIsRUFBRSxDQUFDOztBQTZVM0MsRUFBRSxDQUFDLHlCQUFILEdBQStCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfSG90c3BvdEJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIEhvdHNwb3RTaGFwZVxuICAgIEBSRUNUQU5HTEUgPSBcInJlY3RcIlxuICAgIEBQSVhFTCA9IFwicGl4ZWxcIlxuZ3MuSG90c3BvdFNoYXBlID0gSG90c3BvdFNoYXBlXG5cbmNsYXNzIENvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgYSBob3RzcG90LWJlaGF2aW9yIHRvIGEgZ2FtZSBvYmplY3QuIFRoYXQgYWxsb3dzIGEgZ2FtZSBvYmplY3RcbiAgICAqIHRvIHJlc3BvbmQgdG8gbW91c2UvdG91Y2ggYWN0aW9ucyBieSBmaXJpbmcgYW4gYWN0aW9uLWV2ZW50IG9yIGNoYW5naW5nXG4gICAgKiB0aGUgZ2FtZSBvYmplY3QncyBpbWFnZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0hvdHNwb3RCZWhhdmlvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAocGFyYW1zKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNoYXBlIHVzZWQgdG8gZGV0ZWN0IGlmIGEgaG90c3BvdCBpcyBjbGlja2VkLCBob3ZlcmVkLCBldGMuXG4gICAgICAgICogQHByb3BlcnR5IHNoYXBlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHNoYXBlID0gZ3MuSG90c3BvdFNoYXBlLlJFQ1RBTkdMRVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaG90c3BvdCBpcyBzZWxlY3RlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgc2VsZWN0ZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAc2VsZWN0ZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaG90c3BvdCBpcyBlbmFibGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBlbmFibGVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQGVuYWJsZWQgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VIYW5kbGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZUhhbmRsaW5nID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbW91c2UvdG91Y2ggcG9pbnRlciBpcyBpbnNpZGUgdGhlIGhvdHNwb3QgYm91bmRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250YWluc1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY29udGFpbnNQb2ludGVyID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGFjdGlvbi1idXR0b24gd2FzIHByZXNzZWQgYmVmb3JlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBidXR0b25VcFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAYnV0dG9uVXAgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgYWN0aW9uLWJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBidXR0b25Eb3duXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBidXR0b25Eb3duID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aW9uQnV0dG9uc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhY3Rpb25CdXR0b25zID0geyBcImxlZnRcIjogSW5wdXQuTW91c2UuQlVUVE9OX0xFRlQsIFwicmlnaHRcIjogSW5wdXQuTW91c2UuQlVUVE9OX1JJR0hULCBcIm1pZGRsZVwiOiBJbnB1dC5Nb3VzZS5CVVRUT05fTUlERExFIH1cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZGVmYXVsdCBhY3Rpb24tYnV0dG9uLiBCeSBkZWZhdWx0IHRoZSBsZWZ0LWJ1dHRvbiBpcyB1c2VkLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGFjdGlvbkJ1dHRvblxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQGFjdGlvbkJ1dHRvbiA9IEBhY3Rpb25CdXR0b25zW3BhcmFtcz8uYWN0aW9uQnV0dG9uID8gXCJsZWZ0XCJdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNvdW5kIHBsYXllZCBpZiB0aGUgaG90c3BvdCBhY3Rpb24gaXMgZXhlY3V0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNvdW5kXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc291bmQgPSBwYXJhbXM/LnNvdW5kXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIDxwPlRoZSBzb3VuZHMgcGxheWVkIGRlcGVuZGluZyBvbiB0aGUgaG90c3BvdCBzdGF0ZS48L3A+XG4gICAgICAgICogPHVsPlxuICAgICAgICAqIDxsaT4wID0gU2VsZWN0IFNvdW5kPC9saT5cbiAgICAgICAgKiA8bGk+MSA9IFVuc2VsZWN0IFNvdW5kPC9saT5cbiAgICAgICAgKiA8L3VsPlxuICAgICAgICAqIEBwcm9wZXJ0eSBzb3VuZHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHNvdW5kcyA9IHBhcmFtcz8uc291bmRzIHx8IFtdXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgcmVuZGVyLWluZGV4IG9mIHRoZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBob3RzcG90IGNvbXBvbmVudC4gVGhpcyBcbiAgICAqIGltcGxlbWVudGF0aW9uIGlzIG5lY2Vzc2FyeSB0byBiZSBhYmxlIHRvIGFjdCBhcyBhbiBvd25lciBmb3IgZ3MuRXZlbnRFbWl0dGVyLm9uIFxuICAgICogZXZlbnQgcmVnaXN0cmF0aW9uLiBcbiAgICAqXG4gICAgKiBAcHJvcGVydHkgckluZGV4XG4gICAgKiBAdHlwZSBudW1iZXJcbiAgICAjIyNcbiAgICBAYWNjZXNzb3JzIFwickluZGV4XCIsIFxuICAgICAgICBnZXQ6IC0+IEBvYmplY3QuckluZGV4XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgZXZlbnQgaGFuZGxlcnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgICBcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCB0aGlzKVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgdGhpcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlVXBcIiwgKChlKSA9PiBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3QgQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICBteCA9IElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54XG4gICAgICAgICAgICBteSA9IElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55XG4gICAgICAgICAgICBjb250YWlucyA9IFJlY3QuY29udGFpbnMoQG9iamVjdC5kc3RSZWN0LngsIEBvYmplY3QuZHN0UmVjdC55LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgbXgsIG15KVxuICAgICAgICAgICAgaWYgY29udGFpbnNcbiAgICAgICAgICAgICAgICBjb250YWlucyA9IEBjaGVja1NoYXBlKG14IC0gQG9iamVjdC5kc3RSZWN0LngsIG15IC0gQG9iamVjdC5kc3RSZWN0LnkpXG4gICAgICAgICAgICAgICAgaWYgY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRhaW5zUG9pbnRlciA9IGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGVJbnB1dCgpXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGVFdmVudHMoKVxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgICAgIGUuYnJlYWtDaGFpbiA9IHllc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG51bGwsIHRoaXNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LmltYWdlcyBvciB5ZXNcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlTW92ZWRcIiwgKChlKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiBub3QgQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29udGFpbnMgPSBSZWN0LmNvbnRhaW5zKEBvYmplY3QuZHN0UmVjdC54LCBAb2JqZWN0LmRzdFJlY3QueSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgIG14ID0gSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLnhcbiAgICAgICAgICAgICAgICAgICAgbXkgPSBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueVxuICAgICAgICAgICAgICAgICAgICBjb250YWlucyA9IEBjaGVja1NoYXBlKG14IC0gQG9iamVjdC5kc3RSZWN0LngsIG15IC0gQG9iamVjdC5kc3RSZWN0LnkpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBjb250YWluc1BvaW50ZXIgIT0gY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRhaW5zUG9pbnRlciA9IGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiZW50ZXJcIiwgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHMuZW1pdChcImxlYXZlXCIsIHRoaXMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHVwZGF0ZUlucHV0KClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBudWxsLCB0aGlzXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgaG90c3BvdCBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHNvdW5kID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoQG9iamVjdCwgQHNvdW5kKVxuICAgICAgICBcbiAgICAgICAgaWYgQHNvdW5kcz9cbiAgICAgICAgICAgIGZvciBzb3VuZCwgaSBpbiBAc291bmRzXG4gICAgICAgICAgICAgICAgQHNvdW5kc1tpXSA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKEBvYmplY3QsIHNvdW5kKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIEBzb3VuZHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICAgICAgICAgIFxuIFxuICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCB0aGlzKVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgdGhpcylcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgcG9pbnQgaXMgaW5zaWRlIG9mIHRoZSBob3RzcG90J3Mgc2hhcGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBjaGVja1NoYXBlXG4gICAgKiBAcGFyYW0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHBvaW50LlxuICAgICogQHBhcmFtIHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSBwb2ludC5cbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlIHBvaW50IGlzIGluc2lkZSBvZiB0aGUgaG90c3BvdCdzIHNoYXBlLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICMjIyAgXG4gICAgY2hlY2tTaGFwZTogKHgsIHkpIC0+XG4gICAgICAgIHJlc3VsdCA9IHllc1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBzaGFwZVxuICAgICAgICAgICAgd2hlbiBncy5Ib3RzcG90U2hhcGUuUElYRUxcbiAgICAgICAgICAgICAgICBpZiBAb2JqZWN0LmJpdG1hcFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBAb2JqZWN0LmJpdG1hcC5pc1BpeGVsU2V0KHgsIHkpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBAb2JqZWN0LnRhcmdldD8uYml0bWFwLmlzUGl4ZWxTZXQoeCwgeSlcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgaW1hZ2UgZGVwZW5kaW5nIG9uIHRoZSBob3RzcG90IHN0YXRlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSW1hZ2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICAgICAgXG4gICAgdXBkYXRlSW1hZ2U6IC0+XG4gICAgICAgIG9iamVjdCA9IEBvYmplY3QudGFyZ2V0IHx8IEBvYmplY3RcbiAgICAgICAgaWYgQG9iamVjdC5pbWFnZXM/XG4gICAgICAgICAgICBiYXNlSW1hZ2UgPSBpZiBAZW5hYmxlZCB0aGVuIEBvYmplY3QuaW1hZ2VzWzRdIHx8IEBvYmplY3QuaW1hZ2VzWzBdIGVsc2UgQG9iamVjdC5pbWFnZXNbMF1cbiAgICAgICAgICAgIGlmIEBjb250YWluc1BvaW50ZXJcbiAgICAgICAgICAgICAgICBpZiBAb2JqZWN0LnNlbGVjdGVkIG9yIEBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1szXSB8fCBAb2JqZWN0LmltYWdlc1syXSB8fCBiYXNlSW1hZ2VcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IEBvYmplY3QuaW1hZ2VzWzFdIHx8IGJhc2VJbWFnZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIEBvYmplY3Quc2VsZWN0ZWQgb3IgQHNlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IEBvYmplY3QuaW1hZ2VzWzJdIHx8IEBvYmplY3QuaW1hZ2VzWzRdIHx8IGJhc2VJbWFnZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gYmFzZUltYWdlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgIW9iamVjdC5pbWFnZVxuICAgICAgICAgICAgICAgIG9iamVjdC5iaXRtYXAgPSBudWxsXG5cbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBob3RzcG90IHBvc2l0aW9uIGFuZCBzaXplIGZyb20gYW4gb3RoZXIgdGFyZ2V0IGdhbWUgb2JqZWN0LiBGb3IgZXhhbXBsZSwgXG4gICAgKiB0aGF0IGlzIHVzZWZ1bCBmb3IgYWRkaW5nIGEgaG90c3BvdCB0byBhbiBvdGhlciBtb3ZpbmcgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVGcm9tVGFyZ2V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHVwZGF0ZUZyb21UYXJnZXQ6IC0+XG4gICAgICAgIGlmIEBvYmplY3QudGFyZ2V0P1xuICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LnggPSBAb2JqZWN0LnRhcmdldC5kc3RSZWN0LnhcbiAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC55ID0gQG9iamVjdC50YXJnZXQuZHN0UmVjdC55XG4gICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAb2JqZWN0LnRhcmdldC5kc3RSZWN0LndpZHRoXG4gICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG9iamVjdC50YXJnZXQuZHN0UmVjdC5oZWlnaHRcbiAgICAgICAgICAgIEBvYmplY3Qub2Zmc2V0LnggPSBAb2JqZWN0LnRhcmdldC5vZmZzZXQueFxuICAgICAgICAgICAgQG9iamVjdC5vZmZzZXQueSA9IEBvYmplY3QudGFyZ2V0Lm9mZnNldC55XG4gICAgICAgICAgICBAb2JqZWN0Lm9yaWdpbi54ID0gQG9iamVjdC50YXJnZXQub3JpZ2luLnhcbiAgICAgICAgICAgIEBvYmplY3Qub3JpZ2luLnkgPSBAb2JqZWN0LnRhcmdldC5vcmlnaW4ueSBcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZXZlbnQtaGFuZGxpbmcgYW5kIGZpcmVzIG5lY2Vzc2FyeSBldmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVFdmVudHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIHVwZGF0ZUV2ZW50czogLT5cbiAgICAgICAgaWYgQGJ1dHRvblVwIGFuZCBAb2JqZWN0LmVuYWJsZWQgYW5kIEBlbmFibGVkIGFuZCBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgICAgIGlmIEBvYmplY3Quc2VsZWN0YWJsZVxuICAgICAgICAgICAgICAgIGdyb3VwID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdHNCeUdyb3VwKEBvYmplY3QuZ3JvdXApXG4gICAgICAgICAgICAgICAgZm9yIG9iamVjdCBpbiBncm91cFxuICAgICAgICAgICAgICAgICAgICBpZiBvYmplY3QgIT0gQG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnNlbGVjdGVkID0gbm9cbiAgICAgICAgICAgICAgICBpZiBAb2JqZWN0Lmdyb3VwXG4gICAgICAgICAgICAgICAgICAgIEBzZWxlY3RlZCA9IHllc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNlbGVjdGVkID0gIUBzZWxlY3RlZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKEBzb3VuZHNbMF0gfHwgQHNvdW5kKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChAc291bmRzWzFdIHx8IEBzb3VuZClcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiY2xpY2tcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwic3RhdGVDaGFuZ2VkXCIsIEBvYmplY3QpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChAc291bmRzWzBdIHx8IEBzb3VuZClcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiY2xpY2tcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiYWN0aW9uXCIsIHRoaXMpXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZ2FtZSBvYmplY3QncyBjb2xvciBkZXBlbmRpbmcgb24gdGhlIHN0YXRlIG9mIHRoZSBob3RzcG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29sb3JcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIHVwZGF0ZUNvbG9yOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5lbmFibGVkXG4gICAgICAgICAgICBAb2JqZWN0LmNvbG9yLnNldCgwLCAwLCAwLCAxMDApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QuY29sb3Iuc2V0KDAsIDAsIDAsIDApXG4gICAgIFxuICAgICMjIypcbiAgICAqIFN0b3JlcyBjdXJyZW50IHN0YXRlcyBvZiBtb3VzZS90b3VjaCBwb2ludGVyIGFuZCBidXR0b25zLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSW5wdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIHVwZGF0ZUlucHV0OiAtPlxuICAgICAgICBAYnV0dG9uVXAgPSBJbnB1dC5Nb3VzZS5idXR0b25zW0BhY3Rpb25CdXR0b25dID09IDIgYW5kIEBjb250YWluc1BvaW50ZXJcbiAgICAgICAgQGJ1dHRvbkRvd24gPSBJbnB1dC5Nb3VzZS5idXR0b25zW0BhY3Rpb25CdXR0b25dID09IDEgYW5kIEBjb250YWluc1BvaW50ZXJcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgaG90c3BvdCBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGlmIG5vdCBAb2JqZWN0LnZpc2libGUgdGhlbiByZXR1cm5cblxuICAgICAgICBAdXBkYXRlQ29sb3IoKVxuICAgICAgICBAdXBkYXRlRnJvbVRhcmdldCgpXG4gICAgICAgIEB1cGRhdGVJbWFnZSgpXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X0hvdHNwb3RCZWhhdmlvciA9IENvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IiXX0=
//# sourceURL=Component_HotspotBehavior_19.js