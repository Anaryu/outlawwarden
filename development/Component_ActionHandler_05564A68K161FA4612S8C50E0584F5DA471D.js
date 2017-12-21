var Component_ActionHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_ActionHandler = (function(superClass) {
  extend(Component_ActionHandler, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_ActionHandler.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * An action-handler component allows a UI game object to execute
  * actions. An action can be a method-call of a component or of the scene which
  * always takes two parameters: Sender and Params. For more info about
  * UI actions, see help-file.
  * 
  * @module ui
  * @class Component_ActionHandler
  * @extends ui.Component_Handler
  * @memberof ui
  * @constructor
   */

  function Component_ActionHandler() {

    /**
    * @property initialized
    * @type boolean
    * @protected
     */
    this.initialized = false;

    /**
    * Counter for delayed/timed actions.
    * @property waitCounter
    * @type number
    * @protected
     */
    this.waitCounter = 0;

    /**
    * Indicates if the mouse/touch pointer is inside the UI object's bounds.
    * @property contains
    * @type boolean
    * @protected
     */
    this.containsPointer = false;
  }


  /**
  * Disposes the component.
  *
  * @method dispose
   */

  Component_ActionHandler.prototype.dispose = function() {
    Component_ActionHandler.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.offByOwner("mouseMoved", this.object);
  };


  /**
  * Adds event-handler for mouse/touch events to update the component only if 
  * a user-action happened.
  *
  * @method setupEventHandlers
   */

  Component_ActionHandler.prototype.setupEventHandlers = function() {
    var ref;
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseMoved", this.object);
    if (this.object.focusable) {
      gs.GlobalEventManager.on("keyUp", ((function(_this) {
        return function(e) {
          if (Input.release(Input.KEY_RETURN) && _this.object.ui.focused) {
            _this.object.needsUpdate = true;
            return _this.executeActions();
          }
        };
      })(this)), null, this.object);
    }
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var action, actions, contains, exec, i, len;
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
        if (contains) {
          exec = false;
          actions = actions || _this.object.actions;
          if (actions != null) {
            for (i = 0, len = actions.length; i < len; i++) {
              action = actions[i];
              exec = _this.checkAction(action) && !_this.checkActionWait(action);
              if (exec) {
                break;
              }
            }
          }
          if (exec) {
            e.breakChain = true;
            _this.executeActions();
          }
          return _this.object.needsUpdate = true;
        }
      };
    })(this)), null, this.object);
    if ((ref = this.object.actions) != null ? ref.first(function(a) {
      return a && (a.event === "onMouseEnter" || a.event === "onMouseLeave" || a.event === "onMouseHover");
    }) : void 0) {
      gs.GlobalEventManager.on("mouseMoved", ((function(_this) {
        return function(e) {
          var contains;
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (_this.containsPointer !== contains) {
            _this.containsPointer = contains;
            return _this.object.needsUpdate = true;
          }
        };
      })(this)), null, this.object);
    }
    return this.object.events.on("action", (function(_this) {
      return function(e) {
        if (e.actions || e.action) {
          return _this.executeAction(e.actions != null ? e.actions[0] : e.action);
        }
      };
    })(this));
  };


  /**
  * Sets up associated actions. Each action is validated and specific default values for the action-target
  * and other options are set if not specified.
  *
  * @method setupActions
   */

  Component_ActionHandler.prototype.setupActions = function() {
    var action, component, i, len, ref, results, target, targets;
    if (this.object.actions != null) {
      ref = this.object.actions;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (!action) {
          continue;
        }
        if (!action.event) {
          action.event = "onAction";
        }
        if (action.wait != null) {
          continue;
        }
        if (action.target == null) {
          action.target = this.object.controller;
        }
        if (typeof action.target === "string") {
          if (action.target.contains(".")) {
            action.target = ui.Component_FormulaHandler.fieldValue(this.object, action.target);
          }
          targets = action.target.split(".");
          target = gs.ObjectManager.current.objectById(targets[0]);
          if (target != null) {
            component = target.findComponentById(targets[1]);
            if (component == null) {
              target = target.components.where(function(v) {
                return typeof v[action.name] === "function";
              }).first();
            } else {
              target = component;
            }
          } else {
            target = this.object;
          }
          action.target = target;
        }
        if (action.condition != null) {
          action.conditions = [action.condition];
          results.push(delete action.condition);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Initializes the action-handler.
  * 
  * @method setup
   */

  Component_ActionHandler.prototype.setup = function() {
    this.initialized = true;
    this.setupEventHandlers();
    return this.setupActions();
  };


  /**
  * Updates the action-handler.
  * 
  * @method update
   */

  Component_ActionHandler.prototype.update = function() {};

  Component_ActionHandler.prototype.checkAction = function(action) {
    return ((action != null ? action.event : void 0) || (action != null ? action.events : void 0)) && this.checkObject(action);
  };

  Component_ActionHandler.prototype.checkActionWait = function(action) {
    var result;
    result = false;
    if ((action.wait != null) && action.wait > 0) {
      this.waitCounter = action.wait;
      action.wait = 0;
      result = true;
    }
    return result;
  };

  Component_ActionHandler.prototype.updateActionTarget = function(action) {
    var component, target, targets;
    if (action.target == null) {
      action.target = this.object.controller;
    }
    if (action.target.exec || typeof action.target === "string") {
      if (action.target.exec) {
        action.target = ui.Component_FormulaHandler.fieldValue(this.object, action.target);
      }
      targets = action.target.split(".");
      target = gs.ObjectManager.current.objectById(targets[0]);
      if (target != null) {
        component = target.findComponentById(targets[1]);
        if (component == null) {
          target = target.components.where(function(v) {
            return typeof v[action.name] === "function";
          }).first();
        } else {
          target = component;
        }
      } else {
        target = this.object;
      }
      return action.target = target;
    }
  };

  Component_ActionHandler.prototype.canExecuteActions = function() {
    return this.waitCounter <= 0 && this.object.ui.enabled && this.object.visible;
  };


  /**
  * Executes the specified actions. A single action is only executed if
  * all assigned events and conditions are true.
  * 
  * @method executeActions
  * @return If <b>true</b> there was at least one action executed. Otherwise <b>false</b>
   */

  Component_ActionHandler.prototype.executeActions = function(actions) {
    var action, i, len, result;
    if (!this.canExecuteActions()) {
      return;
    }
    result = false;
    actions = actions || this.object.actions;
    if (actions != null) {
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        if (!this.checkAction(action)) {
          continue;
        }
        if (this.checkActionWait(action)) {
          break;
        }
        this.updateActionTarget(action);
        this.executeAction(action);
        result = true;
      }
    }
    return result;
  };


  /**
  * Executes the specified action if all assigned events and conditions
  * are true.
  * 
  * @method executeAction
  * @param {Object} action The action to execute.
   */

  Component_ActionHandler.prototype.executeAction = function(action) {
    var name, target;
    target = action.target || this.object.target;
    if (target != null) {
      if (action.sound) {
        AudioManager.playSound(action.sound);
      }
      return typeof target[name = action.name] === "function" ? target[name](this.object, action.params) : void 0;
    }
  };

  return Component_ActionHandler;

})(ui.Component_Handler);

ui.Component_ActionHandler = Component_ActionHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsdUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7O29DQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7OztFQVlhLGlDQUFBOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7OztJQU1BLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7OztJQU1BLElBQUMsQ0FBQSxlQUFELEdBQW1CO0VBdEJWOzs7QUF5QmI7Ozs7OztvQ0FLQSxPQUFBLEdBQVMsU0FBQTtJQUNMLHNEQUFBLFNBQUE7SUFFQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsT0FBakMsRUFBMEMsSUFBQyxDQUFBLE1BQTNDO0lBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLElBQUMsQ0FBQSxNQUE3QztXQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxZQUFqQyxFQUErQyxJQUFDLENBQUEsTUFBaEQ7RUFMSzs7O0FBUVQ7Ozs7Ozs7b0NBTUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLE9BQWpDLEVBQTBDLElBQUMsQ0FBQSxNQUEzQztJQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxTQUFqQyxFQUE0QyxJQUFDLENBQUEsTUFBN0M7SUFDQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsWUFBakMsRUFBK0MsSUFBQyxDQUFBLE1BQWhEO0lBR0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVg7TUFDSSxFQUFFLENBQUMsa0JBQWtCLENB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QUUsQ0FBQyx1QkFBSCxHQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0FjdGlvbkhhbmRsZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9BY3Rpb25IYW5kbGVyIGV4dGVuZHMgdWkuQ29tcG9uZW50X0hhbmRsZXJcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFuIGFjdGlvbi1oYW5kbGVyIGNvbXBvbmVudCBhbGxvd3MgYSBVSSBnYW1lIG9iamVjdCB0byBleGVjdXRlXG4gICAgKiBhY3Rpb25zLiBBbiBhY3Rpb24gY2FuIGJlIGEgbWV0aG9kLWNhbGwgb2YgYSBjb21wb25lbnQgb3Igb2YgdGhlIHNjZW5lIHdoaWNoXG4gICAgKiBhbHdheXMgdGFrZXMgdHdvIHBhcmFtZXRlcnM6IFNlbmRlciBhbmQgUGFyYW1zLiBGb3IgbW9yZSBpbmZvIGFib3V0XG4gICAgKiBVSSBhY3Rpb25zLCBzZWUgaGVscC1maWxlLlxuICAgICogXG4gICAgKiBAbW9kdWxlIHVpXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0FjdGlvbkhhbmRsZXJcbiAgICAqIEBleHRlbmRzIHVpLkNvbXBvbmVudF9IYW5kbGVyXG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGluaXRpYWxpemVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbml0aWFsaXplZCA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ291bnRlciBmb3IgZGVsYXllZC90aW1lZCBhY3Rpb25zLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1vdXNlL3RvdWNoIHBvaW50ZXIgaXMgaW5zaWRlIHRoZSBVSSBvYmplY3QncyBib3VuZHMuXG4gICAgICAgICogQHByb3BlcnR5IGNvbnRhaW5zXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb250YWluc1BvaW50ZXIgPSBub1xuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwia2V5VXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VNb3ZlZFwiLCBAb2JqZWN0KVxuICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXIgZm9yIG1vdXNlL3RvdWNoIGV2ZW50cyB0byB1cGRhdGUgdGhlIGNvbXBvbmVudCBvbmx5IGlmIFxuICAgICogYSB1c2VyLWFjdGlvbiBoYXBwZW5lZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRXZlbnRIYW5kbGVyc1xuICAgICMjIyBcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwia2V5VXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VNb3ZlZFwiLCBAb2JqZWN0KVxuICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5mb2N1c2FibGVcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcImtleVVwXCIsICgoZSkgPT4gXG4gICAgICAgICAgICAgICAgaWYgSW5wdXQucmVsZWFzZShJbnB1dC5LRVlfUkVUVVJOKSBhbmQgQG9iamVjdC51aS5mb2N1c2VkXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb25zKClcbiAgICAgICAgICAgICksIG51bGwsIEBvYmplY3RcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlVXBcIiwgKChlKSA9PiBcbiAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC5Nb3VzZS54IC0gQG9iamVjdC5vcmlnaW4ueCwgSW5wdXQuTW91c2UueSAtIEBvYmplY3Qub3JpZ2luLnkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgZXhlYyA9IG5vXG4gICAgICAgICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMgfHwgQG9iamVjdC5hY3Rpb25zXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9ucz9cbiAgICAgICAgICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjID0gQGNoZWNrQWN0aW9uKGFjdGlvbikgYW5kICFAY2hlY2tBY3Rpb25XYWl0KGFjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIGV4ZWNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4ZWNcbiAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9ucygpXG4gICAgICAgICAgICAgICAgQG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuYWN0aW9ucz8uZmlyc3QoKGEpIC0+IGEgYW5kIChhLmV2ZW50ID09IFwib25Nb3VzZUVudGVyXCIgb3IgYS5ldmVudCA9PSBcIm9uTW91c2VMZWF2ZVwiIG9yIGEuZXZlbnQgPT0gXCJvbk1vdXNlSG92ZXJcIikpXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZU1vdmVkXCIsICgoZSkgPT5cbiAgICAgICAgICAgICAgICBjb250YWlucyA9IFJlY3QuY29udGFpbnMoQG9iamVjdC5kc3RSZWN0LngsIEBvYmplY3QuZHN0UmVjdC55LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQGNvbnRhaW5zUG9pbnRlciAhPSBjb250YWluc1xuICAgICAgICAgICAgICAgICAgICBAY29udGFpbnNQb2ludGVyID0gY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG51bGwsIEBvYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vbiBcImFjdGlvblwiLCAoZSkgPT5cbiAgICAgICAgICAgIGlmIGUuYWN0aW9ucyBvciBlLmFjdGlvblxuICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKGlmIGUuYWN0aW9ucz8gdGhlbiBlLmFjdGlvbnNbMF0gZWxzZSBlLmFjdGlvbilcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBhc3NvY2lhdGVkIGFjdGlvbnMuIEVhY2ggYWN0aW9uIGlzIHZhbGlkYXRlZCBhbmQgc3BlY2lmaWMgZGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBhY3Rpb24tdGFyZ2V0XG4gICAgKiBhbmQgb3RoZXIgb3B0aW9ucyBhcmUgc2V0IGlmIG5vdCBzcGVjaWZpZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEFjdGlvbnNcbiAgICAjIyMgICAgICAgIFxuICAgIHNldHVwQWN0aW9uczogLT5cbiAgICAgICAgaWYgQG9iamVjdC5hY3Rpb25zP1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBAb2JqZWN0LmFjdGlvbnNcbiAgICAgICAgICAgICAgICBjb250aW51ZSB1bmxlc3MgYWN0aW9uXG4gICAgICAgICAgICAgICAgaWYgbm90IGFjdGlvbi5ldmVudCB0aGVuIGFjdGlvbi5ldmVudCA9IFwib25BY3Rpb25cIlxuICAgICAgICAgICAgICAgIGlmIGFjdGlvbi53YWl0PyB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFjdGlvbi50YXJnZXQ/IHRoZW4gYWN0aW9uLnRhcmdldCA9IEBvYmplY3QuY29udHJvbGxlclxuICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhY3Rpb24udGFyZ2V0ID09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgYWN0aW9uLnRhcmdldC5jb250YWlucyhcIi5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50YXJnZXQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhY3Rpb24udGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzID0gYWN0aW9uLnRhcmdldC5zcGxpdChcIi5cIilcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0c1swXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gdGFyZ2V0LmZpbmRDb21wb25lbnRCeUlkKHRhcmdldHNbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgY29tcG9uZW50P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5jb21wb25lbnRzLndoZXJlKCh2KSAtPiB0eXBlb2YgdlthY3Rpb24ubmFtZV0gPT0gXCJmdW5jdGlvblwiKS5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gY29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IEBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRhcmdldCA9IHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIGFjdGlvbi5jb25kaXRpb24/XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbi5jb25kaXRpb25zID0gW2FjdGlvbi5jb25kaXRpb25dXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhY3Rpb24uY29uZGl0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGFjdGlvbi1oYW5kbGVyLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBpbml0aWFsaXplZCA9IHllc1xuICAgICAgICBcbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEBzZXR1cEFjdGlvbnMoKSAgICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYWN0aW9uLWhhbmRsZXIuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuXG4gICAgICBcbiAgICBjaGVja0FjdGlvbjogKGFjdGlvbikgLT4gKGFjdGlvbj8uZXZlbnQgb3IgYWN0aW9uPy5ldmVudHMpIGFuZCBAY2hlY2tPYmplY3QoYWN0aW9uKVxuICAgIGNoZWNrQWN0aW9uV2FpdDogKGFjdGlvbikgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGlvbi53YWl0PyBhbmQgYWN0aW9uLndhaXQgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBhY3Rpb24ud2FpdFxuICAgICAgICAgICAgYWN0aW9uLndhaXQgPSAwXG4gICAgICAgICAgICByZXN1bHQgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgdXBkYXRlQWN0aW9uVGFyZ2V0OiAoYWN0aW9uKSAtPlxuICAgICAgICBpZiBub3QgYWN0aW9uLnRhcmdldD8gdGhlbiBhY3Rpb24udGFyZ2V0ID0gQG9iamVjdC5jb250cm9sbGVyXG4gICAgICAgIGlmIGFjdGlvbi50YXJnZXQuZXhlYyBvciB0eXBlb2YgYWN0aW9uLnRhcmdldCA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgICBpZiBhY3Rpb24udGFyZ2V0LmV4ZWNcbiAgICAgICAgICAgICAgIGFjdGlvbi50YXJnZXQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhY3Rpb24udGFyZ2V0KVxuICAgICAgICAgICAgdGFyZ2V0cyA9IGFjdGlvbi50YXJnZXQuc3BsaXQoXCIuXCIpXG4gICAgICAgICAgICB0YXJnZXQgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZCh0YXJnZXRzWzBdKVxuICAgICAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IHRhcmdldC5maW5kQ29tcG9uZW50QnlJZCh0YXJnZXRzWzFdKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBjb21wb25lbnQ/XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5jb21wb25lbnRzLndoZXJlKCh2KSAtPiB0eXBlb2YgdlthY3Rpb24ubmFtZV0gPT0gXCJmdW5jdGlvblwiKS5maXJzdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBjb21wb25lbnRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBAb2JqZWN0XG4gICAgICAgICAgICBhY3Rpb24udGFyZ2V0ID0gdGFyZ2V0XG4gICAgXG4gICAgY2FuRXhlY3V0ZUFjdGlvbnM6IC0+IEB3YWl0Q291bnRlciA8PSAwIGFuZCBAb2JqZWN0LnVpLmVuYWJsZWQgYW5kIEBvYmplY3QudmlzaWJsZSAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBzcGVjaWZpZWQgYWN0aW9ucy4gQSBzaW5nbGUgYWN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgaWZcbiAgICAqIGFsbCBhc3NpZ25lZCBldmVudHMgYW5kIGNvbmRpdGlvbnMgYXJlIHRydWUuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUFjdGlvbnNcbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlcmUgd2FzIGF0IGxlYXN0IG9uZSBhY3Rpb24gZXhlY3V0ZWQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyNcbiAgICBleGVjdXRlQWN0aW9uczogKGFjdGlvbnMpIC0+XG4gICAgICAgIHJldHVybiBpZiBub3QgQGNhbkV4ZWN1dGVBY3Rpb25zKClcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zIHx8IEBvYmplY3QuYWN0aW9uc1xuICAgICAgICBpZiBhY3Rpb25zP1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY29udGludWUgaWYgbm90IEBjaGVja0FjdGlvbihhY3Rpb24pXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgQGNoZWNrQWN0aW9uV2FpdChhY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB1cGRhdGVBY3Rpb25UYXJnZXQoYWN0aW9uKVxuICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKGFjdGlvbilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBzcGVjaWZpZWQgYWN0aW9uIGlmIGFsbCBhc3NpZ25lZCBldmVudHMgYW5kIGNvbmRpdGlvbnNcbiAgICAqIGFyZSB0cnVlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVBY3Rpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gVGhlIGFjdGlvbiB0byBleGVjdXRlLlxuICAgICMjIyAgICAgICAgICAgIFxuICAgIGV4ZWN1dGVBY3Rpb246IChhY3Rpb24pIC0+XG4gICAgICAgIHRhcmdldCA9IGFjdGlvbi50YXJnZXQgfHwgQG9iamVjdC50YXJnZXRcbiAgICAgICAgXG4gICAgICAgIGlmIHRhcmdldD8gXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKGFjdGlvbi5zb3VuZCkgaWYgYWN0aW9uLnNvdW5kXG4gICAgICAgICAgICB0YXJnZXRbYWN0aW9uLm5hbWVdPyhAb2JqZWN0LCBhY3Rpb24ucGFyYW1zKVxuICAgICAgICAgICAgXG51aS5Db21wb25lbnRfQWN0aW9uSGFuZGxlciA9IENvbXBvbmVudF9BY3Rpb25IYW5kbGVyIl19
//# sourceURL=Component_ActionHandler_125.js