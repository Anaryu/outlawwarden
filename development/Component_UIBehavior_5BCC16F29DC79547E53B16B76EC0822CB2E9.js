var Component_UIBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_UIBehavior = (function(superClass) {
  extend(Component_UIBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_UIBehavior.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * @module ui
  * @class Component_UIBehavior
  * @extends gs.Component
  * @memberof ui
  * @constructor
   */

  function Component_UIBehavior() {
    this.breakChainAt = null;
    this.containsPointer = false;
    this.isAnimating = false;
    this.viewData_ = [true, false, false, true, false];
    this.nextKeyObjectId = "";
    this.nextKeyObject_ = null;
    this.prevKeyObject_ = null;
  }

  Component_UIBehavior.accessors("nextKeyObject", {
    set: function(v) {
      this.nextKeyObject_ = v;
      if (v) {
        return v.ui.prevKeyObject_ = this.object;
      }
    },
    get: function() {
      return this.nextKeyObject_;
    }
  });

  Component_UIBehavior.accessors("prevKeyObject", {
    set: function(v) {
      this.prevKeyObject_ = v;
      if (v) {
        return v.ui.nextKeyObject_ = this.object;
      }
    },
    get: function() {
      return this.prevKeyObject_;
    }
  });

  Component_UIBehavior.accessors("selected", {
    set: function(v) {
      if (v !== this.viewData_[2]) {
        this.viewData_[2] = v;
        return this.updateStyle();
      }
    },
    get: function() {
      return this.viewData_[2];
    }
  });

  Component_UIBehavior.accessors("hover", {
    set: function(v) {
      if (v !== this.viewData_[1]) {
        this.viewData_[1] = v;
        return this.updateStyle();
      }
    },
    get: function() {
      return this.viewData_[1];
    }
  });

  Component_UIBehavior.accessors("enabled", {
    set: function(v) {
      if (v !== this.viewData_[3]) {
        this.viewData_[3] = v;
        return this.updateStyle();
      }
    },
    get: function() {
      return this.viewData_[3];
    }
  });

  Component_UIBehavior.accessors("focused", {
    set: function(v) {
      if (v !== this.viewData_[4]) {
        this.viewData_[4] = v;
        return this.updateStyle();
      }
    },
    get: function() {
      return this.viewData_[4];
    }
  });

  Component_UIBehavior.accessors("viewData", {
    set: function(v) {
      if (v !== this.viewData_) {
        this.viewData_ = v;
        return this.updateStyle();
      }
    },
    get: function() {
      return this.viewData_;
    }
  });


  /**
  * Prepares the UI-Object for display. This method should be called
  * before a new created UI-Object will be displayed to position all
  * sub-elements correctly.
  *
  * @method prepare
   */

  Component_UIBehavior.prototype.prepare = function() {
    debugger;
    var scene;
    scene = SceneManager.scene;
    scene.preparing = true;
    this.object.update();
    this.object.update();
    scene.preparing = false;
    return this.object.events.emit("uiPrepareFinish");
  };


  /**
  * Executes an animation defined for the specified event. Each UI-Object
  * can have animations for certain events defined in JSON.
  *
  * @param {string} event - The event to execute the animation for such as "onTerminate" or "onInitialize". If
  * no animation has been defined for the specified event, nothing will happen and the callback will be called 
  * immediately.
  * @param {Function} callback - An optional callback function called when the animation ends.
  * @method executeAnimation
   */

  Component_UIBehavior.prototype.executeAnimation = function(event, callback) {
    var animation, i, len, object, ref, ref1;
    this.isAnimating = true;
    this.disappearCounter = this.object.subObjects.length + 1;
    this.disappearCallback = callback;
    ref = this.object.subObjects;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      if (object.ui) {
        object.ui.executeAnimation(event, (function(_this) {
          return function(sender) {
            _this.disappearCounter--;
            if (_this.disappearCounter === 0) {
              _this.isAnimating = false;
              return typeof _this.disappearCallback === "function" ? _this.disappearCallback(_this.object) : void 0;
            }
          };
        })(this));
      } else {
        this.disappearCounter--;
      }
    }
    animation = (ref1 = this.object.animations) != null ? ref1.first(function(a) {
      return a.events.indexOf(event) !== -1;
    }) : void 0;
    if (animation) {
      return this.object.animationExecutor.execute(animation, (function(_this) {
        return function(sender) {
          _this.disappearCounter--;
          if (_this.disappearCounter === 0) {
            _this.isAnimating = false;
            return typeof _this.disappearCallback === "function" ? _this.disappearCallback(_this.object) : void 0;
          }
        };
      })(this));
    } else {
      this.disappearCounter--;
      if (this.disappearCounter === 0) {
        this.isAnimating = false;
        return typeof this.disappearCallback === "function" ? this.disappearCallback(this.object) : void 0;
      }
    }
  };


  /**
  * Executes the animation defined for the "onInitialize" event. Each UI-Object
  * can have animations for certain events defined in JSON.
  *
  * @param {Function} callback - An optional callback function called when the animation ends.
  * @method appear
   */

  Component_UIBehavior.prototype.appear = function(callback) {
    var cb;
    gs.GlobalEventManager.emit("uiAnimationStart");
    cb = (function(_this) {
      return function(sender) {
        gs.GlobalEventManager.emit("uiAnimationFinish");
        return typeof callback === "function" ? callback(sender) : void 0;
      };
    })(this);
    return this.executeAnimation("onInitialize", cb);
  };


  /**
  * Executes the animation defined for the "onTerminate" event. Each UI-Object
  * can have animations for certain events defined in JSON.
  *
  * @param {Function} callback - An optional callback function called when the animation ends.
  * @method disappear
   */

  Component_UIBehavior.prototype.disappear = function(callback) {
    var cb;
    gs.GlobalEventManager.emit("uiAnimationStart");
    cb = (function(_this) {
      return function(sender) {
        gs.GlobalEventManager.emit("uiAnimationFinish");
        return typeof callback === "function" ? callback(sender) : void 0;
      };
    })(this);
    return this.executeAnimation("onTerminate", cb);
  };


  /**
  * Disposes the component.
  *
  * @method dispose
   */

  Component_UIBehavior.prototype.dispose = function() {
    Component_UIBehavior.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("objectGotFocus", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseDown", this.object);
    return gs.GlobalEventManager.offByOwner("mouseMoved", this.object);
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_UIBehavior.prototype.setupEventHandlers = function() {
    if (this.object.focusable) {
      gs.GlobalEventManager.on("objectGotFocus", ((function(_this) {
        return function(e) {
          if (e.sender !== _this.object) {
            return _this.blur();
          }
        };
      })(this)), null, this.object);
      gs.GlobalEventManager.on("keyUp", ((function(_this) {
        return function(e) {
          if (_this.focused) {
            if (_this.nextKeyObject && (Input.release(Input.KEY_DOWN) || Input.release(Input.KEY_RIGHT))) {
              _this.nextKeyObject.ui.focus();
              return e.breakChain = true;
            } else if (_this.prevKeyObject && (Input.release(Input.KEY_UP) || Input.release(Input.KEY_LEFT))) {
              _this.prevKeyObject.ui.focus();
              return e.breakChain = true;
            }
          }
        };
      })(this)), null, this.object);
    }
    if (this.object.styles.first((function(s) {
      return s.selector === 1;
    }))) {
      gs.GlobalEventManager.on("mouseMoved", ((function(_this) {
        return function(e) {
          var contains;
          if (!_this.enabled) {
            return;
          }
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (_this.containsPointer !== contains || (_this.hover && !contains)) {
            _this.containsPointer = contains;
            _this.object.needsUpdate = true;
            _this.hover = contains;
            _this.updateParentStyle();
            _this.updateChildrenStyle();
          }
          return null;
        };
      })(this)), null, this.object);
    }
    if (this.object.focusable || this.object.styles.first((function(s) {
      return s.selector === 2 || s.selector === 4;
    }))) {
      return gs.GlobalEventManager.on("mouseDown", ((function(_this) {
        return function(e) {
          var contains, group, i, len, object;
          if (!_this.enabled || Input.Mouse.buttons[Input.Mouse.LEFT] !== 1) {
            return;
          }
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (contains) {
            _this.object.needsUpdate = true;
            _this.focus();
            if (_this.object.selectable) {
              if (_this.object.group) {
                _this.selected = true;
                group = gs.ObjectManager.current.objectsByGroup(_this.object.group);
                for (i = 0, len = group.length; i < len; i++) {
                  object = group[i];
                  if (object !== _this.object) {
                    object.ui.selected = false;
                  }
                }
              } else {
                _this.selected = !_this.selected;
              }
            } else {
              _this.updateStyle();
            }
            _this.updateParentStyle();
          }
          return null;
        };
      })(this)), null, this.object, 0);
    }
  };


  /**
  * Initializes the binding-handler.
  * 
  * @method setup
   */

  Component_UIBehavior.prototype.setup = function() {
    return this.setupEventHandlers();
  };


  /**
  * Gives the input focus to this UI object. If the UI object is not focusable, nothing will happen.
  * 
  * @method focus
   */

  Component_UIBehavior.prototype.focus = function() {
    if (this.object.focusable && !this.focused) {
      this.focused = true;
      this.updateChildrenStyle();
      return gs.GlobalEventManager.emit("objectGotFocus", this.object);
    }
  };


  /**
  * Removes the input focus from this UI object. If the UI object is not focusable, nothing will happen.
  * 
  * @method blur
   */

  Component_UIBehavior.prototype.blur = function() {
    if (this.object.focusable && this.focused) {
      this.focused = false;
      this.updateChildrenStyle();
      return gs.GlobalEventManager.emit("objectLostFocus", this.object);
    }
  };

  Component_UIBehavior.prototype.updateParentStyle = function() {
    var parent, ref;
    parent = this.object.parent;
    while (parent) {
      if ((ref = parent.ui) != null) {
        ref.updateStyle();
      }
      parent = parent.parent;
    }
    return null;
  };

  Component_UIBehavior.prototype.updateChildrenStyle = function() {
    var control, i, len, ref;
    if (this.object.controls) {
      ref = this.object.controls;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        if (control && control.ui) {
          control.ui.updateStyle();
          control.ui.updateChildrenStyle();
        }
      }
    }
    return null;
  };

  Component_UIBehavior.prototype.updateStyle = function() {
    var base, i, j, len, len1, object, objects, ref, ref1, style;
    if (this.object.styles) {
      ref = this.object.styles;
      for (i = 0, len = ref.length; i < len; i++) {
        style = ref[i];
        if (!this.viewData_[style.selector]) {
          style.revert(this.object);
        }
      }
      ref1 = this.object.styles;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        style = ref1[j];
        if (style.target === -1) {
          if (this.viewData_[style.selector]) {
            style.apply(this.object);
          }
        } else {
          objects = this.object.parentsByStyle[style.target];
          if (objects) {
            object = objects[0];
            if (object && object.ui.viewData_[style.selector]) {
              style.apply(this.object);
            }
          }
        }
      }
      if (this.object.font) {
        if (typeof (base = this.object.behavior).refresh === "function") {
          base.refresh();
        }
      }
    }
    return null;
  };


  /**
  * Updates the binding-handler.
  * 
  * @method update
   */

  Component_UIBehavior.prototype.update = function() {
    if (this.nextKeyObjectId && !this.nextKeyObject) {
      return this.nextKeyObject = gs.ObjectManager.current.objectById(this.nextKeyObjectId);
    }
  };

  return Component_UIBehavior;

})(gs.Component);

ui.Component_UIBehavior = Component_UIBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsb0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7O2lDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7RUFPYSw4QkFBQTtJQUNULElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFDZixJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsSUFBRCxFQUFNLEtBQU4sRUFBVSxLQUFWLEVBQWMsSUFBZCxFQUFtQixLQUFuQjtJQUNiLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBQ2xCLElBQUMsQ0FBQSxjQUFELEdBQWtCO0VBUFQ7O0VBU2Isb0JBQUMsQ0FBQSxTQUFELENBQVcsZUFBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsQ0FBRDtNQUNELElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2xCLElBQUcsQ0FBSDtlQUNJLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBTCxHQUFzQixJQUFDLENBQUEsT0FEM0I7O0lBRkMsQ0FBTDtJQUlBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FKTDtHQURKOztFQU9BLG9CQUFDLENBQUEsU0FBRCxDQUFXLGVBQVgsRUFDSTtJQUFBLEdBQUEsRUFBSyxTQUFDLENBQUQ7TUFDRCxJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFHLENBQUg7ZUFDSSxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQUwsR0FBc0IsSUFBQyxDQUFBLE9BRDNCOztJQUZDLENBQUw7SUFJQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBSkw7R0FESjs7RUFPQSxv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QUFXLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLEtBQUssQ0FBQyxRQUFOLENBQWxDO2NBQ0ksS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFDLENBQUEsTUFBYixFQURKO2FBRko7V0FMSjs7QUFESjtNQVdBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFYOztjQUNvQixDQUFDO1NBRHJCO09BaEJKOztBQW1CQSxXQUFPO0VBcEJFOzs7QUFzQmI7Ozs7OztpQ0FLQSxNQUFBLEdBQVEsU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLGVBQUQsSUFBcUIsQ0FBQyxJQUFDLENBQUEsYUFBMUI7YUFDSSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyxJQUFDLENBQUEsZUFBckMsRUFEckI7O0VBREk7Ozs7R0F4VXVCLEVBQUUsQ0FBQzs7QUE2VXRDLEVBQUUsQ0FBQyxvQkFBSCxHQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X1N0eWxlSGFuZGxlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X1VJQmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtb2R1bGUgdWlcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfVUlCZWhhdmlvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBAYnJlYWtDaGFpbkF0ID0gbnVsbFxuICAgICAgICBAY29udGFpbnNQb2ludGVyID0gbm9cbiAgICAgICAgQGlzQW5pbWF0aW5nID0gbm9cbiAgICAgICAgQHZpZXdEYXRhXyA9IFt5ZXMsIG5vLCBubywgeWVzLCBub11cbiAgICAgICAgQG5leHRLZXlPYmplY3RJZCA9IFwiXCJcbiAgICAgICAgQG5leHRLZXlPYmplY3RfID0gbnVsbFxuICAgICAgICBAcHJldktleU9iamVjdF8gPSBudWxsXG4gICAgICAgIFxuICAgIEBhY2Nlc3NvcnMgXCJuZXh0S2V5T2JqZWN0XCIsIFxuICAgICAgICBzZXQ6ICh2KSAtPlxuICAgICAgICAgICAgQG5leHRLZXlPYmplY3RfID0gdlxuICAgICAgICAgICAgaWYgdlxuICAgICAgICAgICAgICAgIHYudWkucHJldktleU9iamVjdF8gPSBAb2JqZWN0XG4gICAgICAgIGdldDogLT4gQG5leHRLZXlPYmplY3RfXG4gICAgICAgIFxuICAgIEBhY2Nlc3NvcnMgXCJwcmV2S2V5T2JqZWN0XCIsIFxuICAgICAgICBzZXQ6ICh2KSAtPlxuICAgICAgICAgICAgQHByZXZLZXlPYmplY3RfID0gdlxuICAgICAgICAgICAgaWYgdlxuICAgICAgICAgICAgICAgIHYudWkubmV4dEtleU9iamVjdF8gPSBAb2JqZWN0XG4gICAgICAgIGdldDogLT4gQHByZXZLZXlPYmplY3RfXG4gICAgICAgICAgICAgICAgXG4gICAgQGFjY2Vzc29ycyBcInNlbGVjdGVkXCIsIFxuICAgICAgICBzZXQ6ICh2KSAtPiBcbiAgICAgICAgICAgIGlmIHYgIT0gQHZpZXdEYXRhX1syXVxuICAgICAgICAgICAgICAgIEB2aWV3RGF0YV9bMl0gPSB2XG4gICAgICAgICAgICAgICAgQHVwZGF0ZVN0eWxlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZ2V0OiAtPiBAdmlld0RhdGFfWzJdXG4gICAgICAgIFxuICAgIEBhY2Nlc3NvcnMgXCJob3ZlclwiLCBcbiAgICAgICAgc2V0OiAodikgLT4gXG4gICAgICAgICAgICBpZiB2ICE9IEB2aWV3RGF0YV9bMV1cbiAgICAgICAgICAgICAgICBAdmlld0RhdGFfWzFdID0gdlxuICAgICAgICAgICAgICAgIEB1cGRhdGVTdHlsZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGdldDogLT4gQHZpZXdEYXRhX1sxXVxuICAgICAgICBcbiAgICBAYWNjZXNzb3JzIFwiZW5hYmxlZFwiLFxuICAgICAgICBzZXQ6ICh2KSAtPiBcbiAgICAgICAgICAgIGlmIHYgIT0gQHZpZXdEYXRhX1szXVxuICAgICAgICAgICAgICAgIEB2aWV3RGF0YV9bM10gPSB2XG4gICAgICAgICAgICAgICAgQHVwZGF0ZVN0eWxlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZ2V0OiAtPiBAdmlld0RhdGFfWzNdXG4gICAgICAgIFxuICAgIEBhY2Nlc3NvcnMgXCJmb2N1c2VkXCIsXG4gICAgICAgIHNldDogKHYpIC0+XG4gICAgICAgICAgICBpZiB2ICE9IEB2aWV3RGF0YV9bNF1cbiAgICAgICAgICAgICAgICBAdmlld0RhdGFfWzRdID0gdlxuICAgICAgICAgICAgICAgIEB1cGRhdGVTdHlsZSgpXG4gICAgICAgIGdldDogLT4gQHZpZXdEYXRhX1s0XVxuICAgICAgICBcbiAgICBAYWNjZXNzb3JzIFwidmlld0RhdGFcIixcbiAgICAgICAgc2V0OiAodikgLT5cbiAgICAgICAgICAgIGlmIHYgIT0gQHZpZXdEYXRhX1xuICAgICAgICAgICAgICAgIEB2aWV3RGF0YV8gPSB2XG4gICAgICAgICAgICAgICAgQHVwZGF0ZVN0eWxlKClcbiAgICAgICAgZ2V0OiAtPiBAdmlld0RhdGFfXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgdGhlIFVJLU9iamVjdCBmb3IgZGlzcGxheS4gVGhpcyBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZFxuICAgICogYmVmb3JlIGEgbmV3IGNyZWF0ZWQgVUktT2JqZWN0IHdpbGwgYmUgZGlzcGxheWVkIHRvIHBvc2l0aW9uIGFsbFxuICAgICogc3ViLWVsZW1lbnRzIGNvcnJlY3RseS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVcbiAgICAjIyNcbiAgICBwcmVwYXJlOiAtPlxuICAgICAgICBkZWJ1Z2dlclxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5wcmVwYXJpbmcgPSB5ZXNcbiAgICAgICAgQG9iamVjdC51cGRhdGUoKSAjIEZpcnN0IFVwZGF0ZTogQnJpbmcgYWxsIHN1Yi1lbGVtZW50cyBpbiBjb3JyZWN0IHNpemVcbiAgICAgICAgQG9iamVjdC51cGRhdGUoKSAjIFNlY29uZCBVcGRhdGU6IENvcnJlY3QgbGF5b3V0XG4gICAgICAgIHNjZW5lLnByZXBhcmluZyA9IG5vXG4gICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQoXCJ1aVByZXBhcmVGaW5pc2hcIilcbiAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGFuIGFuaW1hdGlvbiBkZWZpbmVkIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LiBFYWNoIFVJLU9iamVjdFxuICAgICogY2FuIGhhdmUgYW5pbWF0aW9ucyBmb3IgY2VydGFpbiBldmVudHMgZGVmaW5lZCBpbiBKU09OLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIFRoZSBldmVudCB0byBleGVjdXRlIHRoZSBhbmltYXRpb24gZm9yIHN1Y2ggYXMgXCJvblRlcm1pbmF0ZVwiIG9yIFwib25Jbml0aWFsaXplXCIuIElmXG4gICAgKiBubyBhbmltYXRpb24gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlIHNwZWNpZmllZCBldmVudCwgbm90aGluZyB3aWxsIGhhcHBlbiBhbmQgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIFxuICAgICogaW1tZWRpYXRlbHkuXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAgICAqIEBtZXRob2QgZXhlY3V0ZUFuaW1hdGlvblxuICAgICMjI1xuICAgIGV4ZWN1dGVBbmltYXRpb246IChldmVudCwgY2FsbGJhY2spIC0+XG4gICAgICAgIEBpc0FuaW1hdGluZyA9IHllc1xuICAgICAgICBAZGlzYXBwZWFyQ291bnRlciA9IEBvYmplY3Quc3ViT2JqZWN0cy5sZW5ndGggKyAxXG4gICAgICAgIEBkaXNhcHBlYXJDYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIFxuICAgICAgICBmb3Igb2JqZWN0IGluIEBvYmplY3Quc3ViT2JqZWN0c1xuICAgICAgICAgICAgaWYgb2JqZWN0LnVpXG4gICAgICAgICAgICAgICAgb2JqZWN0LnVpLmV4ZWN1dGVBbmltYXRpb24oZXZlbnQsIChzZW5kZXIpID0+XG4gICAgICAgICAgICAgICAgICAgIEBkaXNhcHBlYXJDb3VudGVyLS1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIEBkaXNhcHBlYXJDb3VudGVyID09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpc0FuaW1hdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAZGlzYXBwZWFyQ2FsbGJhY2s/KEBvYmplY3QpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBkaXNhcHBlYXJDb3VudGVyLS1cbiAgICAgICAgIFxuICAgICAgICBhbmltYXRpb24gPSBAb2JqZWN0LmFuaW1hdGlvbnM/LmZpcnN0IChhKSAtPiBhLmV2ZW50cy5pbmRleE9mKGV2ZW50KSAhPSAtMVxuICAgICAgICBcbiAgICAgICAgaWYgYW5pbWF0aW9uXG4gICAgICAgICAgICBAb2JqZWN0LmFuaW1hdGlvbkV4ZWN1dG9yLmV4ZWN1dGUoYW5pbWF0aW9uLCAoc2VuZGVyKSA9PlxuICAgICAgICAgICAgICAgIEBkaXNhcHBlYXJDb3VudGVyLS1cbiAgICAgICAgICAgICAgICBpZiBAZGlzYXBwZWFyQ291bnRlciA9PSAwXG4gICAgICAgICAgICAgICAgICAgIEBpc0FuaW1hdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBkaXNhcHBlYXJDYWxsYmFjaz8oQG9iamVjdCkgXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaXNhcHBlYXJDb3VudGVyLS1cbiAgICAgICAgICAgIGlmIEBkaXNhcHBlYXJDb3VudGVyID09IDBcbiAgICAgICAgICAgICAgICBAaXNBbmltYXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEBkaXNhcHBlYXJDYWxsYmFjaz8oQG9iamVjdCkgXG4gICAgXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgdGhlIGFuaW1hdGlvbiBkZWZpbmVkIGZvciB0aGUgXCJvbkluaXRpYWxpemVcIiBldmVudC4gRWFjaCBVSS1PYmplY3RcbiAgICAqIGNhbiBoYXZlIGFuaW1hdGlvbnMgZm9yIGNlcnRhaW4gZXZlbnRzIGRlZmluZWQgaW4gSlNPTi5cbiAgICAqXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAgICAqIEBtZXRob2QgYXBwZWFyXG4gICAgIyMjICAgICAgICBcbiAgICBhcHBlYXI6IChjYWxsYmFjaykgLT4gXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwidWlBbmltYXRpb25TdGFydFwiKVxuICAgICAgICBjYiA9IChzZW5kZXIpID0+IFxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJ1aUFuaW1hdGlvbkZpbmlzaFwiKVxuICAgICAgICAgICAgY2FsbGJhY2s/KHNlbmRlcilcbiAgICAgICAgQGV4ZWN1dGVBbmltYXRpb24oXCJvbkluaXRpYWxpemVcIiwgY2IpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBhbmltYXRpb24gZGVmaW5lZCBmb3IgdGhlIFwib25UZXJtaW5hdGVcIiBldmVudC4gRWFjaCBVSS1PYmplY3RcbiAgICAqIGNhbiBoYXZlIGFuaW1hdGlvbnMgZm9yIGNlcnRhaW4gZXZlbnRzIGRlZmluZWQgaW4gSlNPTi5cbiAgICAqXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAgICAqIEBtZXRob2QgZGlzYXBwZWFyXG4gICAgIyMjICAgIFxuICAgIGRpc2FwcGVhcjogKGNhbGxiYWNrKSAtPiBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJ1aUFuaW1hdGlvblN0YXJ0XCIpXG4gICAgICAgIGNiID0gKHNlbmRlcikgPT4gXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInVpQW5pbWF0aW9uRmluaXNoXCIpXG4gICAgICAgICAgICBjYWxsYmFjaz8oc2VuZGVyKVxuICAgICAgICBAZXhlY3V0ZUFuaW1hdGlvbihcIm9uVGVybWluYXRlXCIsIGNiKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgY29tcG9uZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lciBcIm1vdXNlVXBcIiwgQG9iamVjdFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm9iamVjdEdvdEZvY3VzXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwia2V5VXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZURvd25cIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZU1vdmVkXCIsIEBvYmplY3QpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgZXZlbnQtaGFuZGxlcnMgZm9yIG1vdXNlL3RvdWNoIGV2ZW50c1xuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBFdmVudEhhbmRsZXJzXG4gICAgIyMjIFxuICAgIHNldHVwRXZlbnRIYW5kbGVyczogLT5cbiAgICAgICAgaWYgQG9iamVjdC5mb2N1c2FibGVcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm9iamVjdEdvdEZvY3VzXCIsICgoZSkgPT5cbiAgICAgICAgICAgICAgICBpZiBlLnNlbmRlciAhPSBAb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIEBibHVyKClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBudWxsLCBAb2JqZWN0XG5cbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcImtleVVwXCIsICgoZSkgPT5cbiAgICAgICAgICAgICAgICBpZiBAZm9jdXNlZFxuICAgICAgICAgICAgICAgICAgICBpZiBAbmV4dEtleU9iamVjdCBhbmQgKElucHV0LnJlbGVhc2UoSW5wdXQuS0VZX0RPV04pIG9yIElucHV0LnJlbGVhc2UoSW5wdXQuS0VZX1JJR0hUKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBuZXh0S2V5T2JqZWN0LnVpLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuYnJlYWtDaGFpbiA9IHllc1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBwcmV2S2V5T2JqZWN0IGFuZCAoSW5wdXQucmVsZWFzZShJbnB1dC5LRVlfVVApIG9yIElucHV0LnJlbGVhc2UoSW5wdXQuS0VZX0xFRlQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgQHByZXZLZXlPYmplY3QudWkuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbnVsbCwgQG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3Quc3R5bGVzLmZpcnN0ICgocykgLT4gcy5zZWxlY3RvciA9PSAxKVxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VNb3ZlZFwiLCAoKGUpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiAhQGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbnMgPSBSZWN0LmNvbnRhaW5zKEBvYmplY3QuZHN0UmVjdC54LCBAb2JqZWN0LmRzdFJlY3QueSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBAY29udGFpbnNQb2ludGVyICE9IGNvbnRhaW5zIG9yIChAaG92ZXIgYW5kICFjb250YWlucylcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb250YWluc1BvaW50ZXIgPSBjb250YWluc1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgQGhvdmVyID0gY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVBhcmVudFN0eWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVDaGlsZHJlblN0eWxlKClcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGwgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbnVsbCwgQG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuZm9jdXNhYmxlIG9yIEBvYmplY3Quc3R5bGVzLmZpcnN0ICgocykgLT4gcy5zZWxlY3RvciA9PSAyIHx8IHMuc2VsZWN0b3IgPT0gNClcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlRG93blwiLCAoKGUpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiAhQGVuYWJsZWQgb3IgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5MRUZUXSAhPSAxXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBmb2N1cygpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBvYmplY3Quc2VsZWN0YWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBvYmplY3QuZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNlbGVjdGVkID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdHNCeUdyb3VwKEBvYmplY3QuZ3JvdXApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBvYmplY3QgaW4gZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdCAhPSBAb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnVpLnNlbGVjdGVkID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZWxlY3RlZCA9ICFAc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlU3R5bGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVBhcmVudFN0eWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGwgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG51bGwsIEBvYmplY3QsIDBcbiAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgYmluZGluZy1oYW5kbGVyLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEdpdmVzIHRoZSBpbnB1dCBmb2N1cyB0byB0aGlzIFVJIG9iamVjdC4gSWYgdGhlIFVJIG9iamVjdCBpcyBub3QgZm9jdXNhYmxlLCBub3RoaW5nIHdpbGwgaGFwcGVuLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGZvY3VzXG4gICAgIyMjICAgICAgICAgICAgICAgXG4gICAgZm9jdXM6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuZm9jdXNhYmxlIGFuZCAhQGZvY3VzZWRcbiAgICAgICAgICAgIEBmb2N1c2VkID0geWVzXG4gICAgICAgICAgICBAdXBkYXRlQ2hpbGRyZW5TdHlsZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwib2JqZWN0R290Rm9jdXNcIiwgQG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZW1vdmVzIHRoZSBpbnB1dCBmb2N1cyBmcm9tIHRoaXMgVUkgb2JqZWN0LiBJZiB0aGUgVUkgb2JqZWN0IGlzIG5vdCBmb2N1c2FibGUsIG5vdGhpbmcgd2lsbCBoYXBwZW4uXG4gICAgKiBcbiAgICAqIEBtZXRob2QgYmx1clxuICAgICMjI1xuICAgIGJsdXI6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuZm9jdXNhYmxlIGFuZCBAZm9jdXNlZFxuICAgICAgICAgICAgQGZvY3VzZWQgPSBub1xuICAgICAgICAgICAgQHVwZGF0ZUNoaWxkcmVuU3R5bGUoKVxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJvYmplY3RMb3N0Rm9jdXNcIiwgQG9iamVjdClcbiAgICAgICAgICAgIFxuICAgIHVwZGF0ZVBhcmVudFN0eWxlOiAtPlxuICAgICAgICBwYXJlbnQgPSBAb2JqZWN0LnBhcmVudFxuICAgICAgICB3aGlsZSBwYXJlbnRcbiAgICAgICAgICAgIHBhcmVudC51aT8udXBkYXRlU3R5bGUoKVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgIHVwZGF0ZUNoaWxkcmVuU3R5bGU6ICgpIC0+XG4gICAgICAgIGlmIEBvYmplY3QuY29udHJvbHNcbiAgICAgICAgICAgIGZvciBjb250cm9sIGluIEBvYmplY3QuY29udHJvbHNcbiAgICAgICAgICAgICAgICBpZiBjb250cm9sIGFuZCBjb250cm9sLnVpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2wudWkudXBkYXRlU3R5bGUoKVxuICAgICAgICAgICAgICAgICAgICBjb250cm9sLnVpLnVwZGF0ZUNoaWxkcmVuU3R5bGUoKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICB1cGRhdGVTdHlsZTogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zdHlsZXNcbiAgICAgICAgICAgIGZvciBzdHlsZSBpbiBAb2JqZWN0LnN0eWxlc1xuICAgICAgICAgICAgICAgIGlmICFAdmlld0RhdGFfW3N0eWxlLnNlbGVjdG9yXVxuICAgICAgICAgICAgICAgICAgICBzdHlsZS5yZXZlcnQoQG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3Igc3R5bGUgaW4gQG9iamVjdC5zdHlsZXNcbiAgICAgICAgICAgICAgICBpZiBzdHlsZS50YXJnZXQgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgaWYgQHZpZXdEYXRhX1tzdHlsZS5zZWxlY3Rvcl1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlLmFwcGx5KEBvYmplY3QpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmplY3RzID0gQG9iamVjdC5wYXJlbnRzQnlTdHlsZVtzdHlsZS50YXJnZXRdXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IG9iamVjdHNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdCBhbmQgb2JqZWN0LnVpLnZpZXdEYXRhX1tzdHlsZS5zZWxlY3Rvcl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZS5hcHBseShAb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9iamVjdC5mb250XG4gICAgICAgICAgICAgICAgQG9iamVjdC5iZWhhdmlvci5yZWZyZXNoPygpICMgRklYTUU6IENyZWF0ZXMgYSBkZXBlbmRlbmN5IG9uIFRleHQtQmVoYXZpb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYmluZGluZy1oYW5kbGVyLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgaWYgQG5leHRLZXlPYmplY3RJZCBhbmQgIUBuZXh0S2V5T2JqZWN0XG4gICAgICAgICAgICBAbmV4dEtleU9iamVjdCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKEBuZXh0S2V5T2JqZWN0SWQpXG4gICAgICAgIFxuICAgICBcbnVpLkNvbXBvbmVudF9VSUJlaGF2aW9yID0gQ29tcG9uZW50X1VJQmVoYXZpb3IiXX0=
//# sourceURL=Component_UIBehavior_146.js