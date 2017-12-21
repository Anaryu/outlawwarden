var Component_CommonEventBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_CommonEventBehavior = (function(superClass) {
  extend(Component_CommonEventBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CommonEventBehavior.prototype.onDataBundleRestore = function(data, context) {
    var ref;
    if (this.object.rid != null) {
      this.object.record = RecordManager.commonEvents[this.object.rid];
      if ((ref = this.object.interpreter) != null) {
        ref.object = this;
      }
      this.object.commands = this.object.record.commands;
    }
    return this.setupEventHandlers();
  };


  /**
  * A component which allows a game object to execute common-events.
  *
  * @module gs
  * @class Component_CommonEventBehavior
  * @extends gs.Component
  * @memberof gs
   */

  function Component_CommonEventBehavior() {
    Component_CommonEventBehavior.__super__.constructor.call(this);

    /**
    * @property readyToStart
    * @type boolean
    * @private
     */
    this.readyToStart = false;

    /**
    * @property initialized
    * @type boolean
    * @private
     */
    this.initialized = false;
    this.callDepth = 0;
  }


  /**
  * Serializes the component into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Component_CommonEventBehavior.prototype.toDataBundle = function() {
    return {
      initialized: this.initialized,
      readyToStart: this.readyToStart
    };
  };


  /**
  * Restores the component from a data-bundle
  *
  * @method restore
  * @param {Object} bundle- The data-bundle.
   */

  Component_CommonEventBehavior.prototype.restore = function(data) {
    this.setup();
    this.readyToStart = data.readyToStart;
    return this.initialized = data.initialized;
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_CommonEventBehavior.prototype.setupEventHandlers = function() {
    if (!this.object.interpreter) {
      return;
    }
    if (this.object.record.startCondition === 1) {
      return this.object.interpreter.onFinish = (function(_this) {
        return function() {
          var ref;
          if (!_this.object.record.parallel) {
            return (ref = _this.object.events) != null ? ref.emit("finish", _this) : void 0;
          }
        };
      })(this);
    } else {
      if (this.object.record.parallel) {
        return this.object.interpreter.onFinish = (function(_this) {
          return function(sender) {
            return _this.object.removeComponent(sender);
          };
        })(this);
      } else {
        return this.object.interpreter.onFinish = (function(_this) {
          return function(sender) {
            return _this.object.events.emit("finish", _this);
          };
        })(this);
      }
    }
  };


  /**
  * Initializes the common-event.
  *
  * @method setup
   */

  Component_CommonEventBehavior.prototype.setup = function() {
    GameManager.variableStore.setupLocalVariables(this.object.record);
    this.object.record.parameters = this.object.record.parameters != null ? this.object.record.parameters : [];
    this.object.record.startCondition = this.object.record.startCondition != null ? this.object.record.startCondition : 0;
    this.object.record.parallel = this.object.record.parallel != null ? this.object.record.parallel : false;
    this.object.record.conditionSwitch = this.object.record.conditionSwitch != null ? this.object.record.conditionSwitch : null;
    this.object.record.conditionEnabled = this.object.record.conditionEnabled;
    if (this.object.record.startCondition === 1) {
      this.object.interpreter = new gs.Component_CommandInterpreter();
      this.object.interpreter.onFinish = (function(_this) {
        return function() {
          var ref;
          if (!_this.object.record.parallel) {
            return (ref = _this.object.events) != null ? ref.emit("finish", _this) : void 0;
          } else {
            return _this.restart();
          }
        };
      })(this);
      this.object.interpreter.context.set(this.object.record.index, this.object.record);
      this.object.addComponent(this.object.interpreter);
    }
    return this.initialized = true;
  };


  /**
  * Starts the common-event interpreter with the specified parameters.
  * 
  * @method start
  * @param {Object} parameters The common-event's parameters which can be configured in database.
   */

  Component_CommonEventBehavior.prototype.start = function(parameters) {
    var ref, ref1;
    this.startParameters = parameters;
    if ((this.object.interpreter != null) && !this.object.interpreter.isRunning) {
      this.object.commands = this.object.record.commands;
      this.readyToStart = true;
      if ((ref = this.object.events) != null) {
        ref.emit("start", this);
      }
    }
    if (this.object.record.startCondition === 0 && this.object.record.parallel) {
      return (ref1 = this.object.events) != null ? ref1.emit("finish", this) : void 0;
    }
  };


  /**
  * Initializes variable-store with the start-up parameters configured for the
  * common-event in Database.
  *
  * @method setupParameters
   */

  Component_CommonEventBehavior.prototype.setupParameters = function(parameters, parentContext) {
    var i, j, parameter, ref, results, value;
    if ((parameters != null) && (parameters.values != null)) {
      results = [];
      for (i = j = 0, ref = parameters.values.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        value = parameters.values[i];
        parameter = this.object.record.parameters[i];
        if ((parameter != null) && (value != null)) {
          GameManager.variableStore.setupTempVariables(parentContext);
          switch (parameter.type) {
            case 1:
              value = GameManager.variableStore.numberValueOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setNumberValueTo(parameter.numberVariable, value));
              break;
            case 2:
              value = GameManager.variableStore.booleanValueOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setBooleanValueTo(parameter.booleanVariable, value));
              break;
            case 3:
              value = GameManager.variableStore.stringValueOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setStringValueTo(parameter.stringVariable, value));
              break;
            default:
              results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Calls the common-event with the specified parameters.
  *
  * @method call
  * @param {Object} parameters The common-event's parameters which can be configured in database.
   */

  Component_CommonEventBehavior.prototype.call = function(parameters, settings, parentContext) {
    var interpreter;
    if (!this.object.record.singleInstance) {
      interpreter = new gs.Component_CommandInterpreter();
      interpreter.context.set(this.object.record.index + "_" + this.callDepth, this.object.record);
      GameManager.variableStore.clearTempVariables(interpreter.context);
      this.object.commands = this.object.record.commands;
      this.callDepth++;
    } else {
      interpreter = this.object.interpreter || new gs.Component_CommandInterpreter();
      interpreter.context.set(this.object.record.index, this.object.record);
      this.object.commands = this.object.record.commands;
    }
    interpreter.repeat = false;
    interpreter.object = this.object;
    if (settings) {
      interpreter.settings = settings;
    }
    this.object.interpreter = interpreter;
    GameManager.variableStore.setupTempVariables(interpreter.context);
    this.setupParameters(parameters, parentContext);
    if (this.object.record.parallel) {
      interpreter.onFinish = (function(_this) {
        return function(sender) {
          _this.object.removeComponent(sender);
          if (!_this.object.record.singleInstance) {
            return _this.callDepth--;
          }
        };
      })(this);
      interpreter.start();
      this.object.addComponent(interpreter);
      return null;
    } else {
      interpreter.onFinish = (function(_this) {
        return function(sender) {
          return _this.object.events.emit("finish", _this);
        };
      })(this);
      return interpreter;
    }
  };


  /**
  * Stops the common-event interpreter.
  *
  * @method stop
   */

  Component_CommonEventBehavior.prototype.stop = function() {
    var ref;
    if (this.object.interpreter != null) {
      this.object.interpreter.stop();
      return (ref = this.object.events) != null ? ref.emit("finish", this) : void 0;
    }
  };


  /**
  * Resumes a paused common-event interpreter.
  *
  * @method resume
   */

  Component_CommonEventBehavior.prototype.resume = function() {
    var ref, ref1;
    if (this.object.interpreter != null) {
      this.object.interpreter.resume();
      if ((ref = this.object.events) != null) {
        ref.emit("start", this);
      }
      return (ref1 = this.object.events) != null ? ref1.emit("resume", this) : void 0;
    }
  };


  /**
  * Restarts the common event. If the common event has a condition then the restart
  * will only happen if that condition is true.
  *
  * @method restart
   */

  Component_CommonEventBehavior.prototype.restart = function() {
    if (this.object.record.conditionEnabled) {
      if (GameManager.variableStore.booleanValueOf(this.object.record.conditionSwitch)) {
        return this.start();
      }
    } else {
      return this.start();
    }
  };


  /**
  * Restarts the common event if it is parallel and the conditions are met.
  *
  * @method restartIfNecessary
   */

  Component_CommonEventBehavior.prototype.restartIfNecessary = function() {
    if ((this.object.interpreter != null) && this.object.record.startCondition === 1 && !this.object.interpreter.isRunning) {
      return this.restart();
    }
  };


  /**
  * Updates the common-event interpreter.
  *
  * @method update
   */

  Component_CommonEventBehavior.prototype.update = function() {
    if (!this.initialized) {
      this.setup();
    }
    if ((this.object.interpreter != null) && this.readyToStart) {
      this.readyToStart = false;
      this.setupParameters(this.startParameters);
      this.object.interpreter.start();
    }
    return this.restartIfNecessary();
  };


  /**
  * Not implemented yet.
  *
  * @method erase
   */

  Component_CommonEventBehavior.prototype.erase = function() {};

  return Component_CommonEventBehavior;

})(gs.Component);

gs.Component_CommonEventBehavior = Component_CommonEventBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OzBDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUcsdUJBQUg7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsYUFBYSxDQUFDLFlBQWEsQ0FBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVI7O1dBQ3pCLENBQUUsTUFBckIsR0FBOEI7O01BQzlCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUh0Qzs7V0FJQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtFQUxpQjs7O0FBT3JCOzs7Ozs7Ozs7RUFRYSx1Q0FBQTtJQUNULDZEQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRWYsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQWpCSjs7O0FBbUJiOzs7Ozs7OzBDQU1BLFlBQUEsR0FBYyxTQUFBO0FBQ1YsV0FBTztNQUNILFdBQUEsRUFBYSxJQUFDLENBQUEsV0FEWDtNQUVILFlBQUEsRUFBYyxJQUFDLENBQUEsWUFGWjs7RUFERzs7O0FBTWQ7Ozs7Ozs7MENBTUEsT0FBQSxHQUFTLFNBQUMsSUFBRDtJQUNMLElBQUMsQ0FBQSxLQUFELENBQUE7SUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLENBQUM7V0FDckIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUM7RUFIZjs7O0FBS1Q7Ozs7OzswQ0FLQSxrQkFBQSxHQUFvQixTQUFBO0lBQ2hCLElBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVo7QUFBNkIsYUFBN0I7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFmLEtBQWlDLENBQXBDO2FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBcEIsR0FBK0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzNCLGNBQUE7VUFBQSxJQUFHLENBQUksS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBdEI7NERBQ2tCLENBQUUsSUFBaEIsQ0FBcUIsUUFBckIsRUFBK0IsS0FBL0IsV0FESjs7UUFEMkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEVBRG5DO0tBQUEsTUFBQTtNQUtJLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBbEI7ZUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFwQixHQUErQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7bUJBQVksS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLE1BQXhCO1VBQVo7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEVBRG5DO09BQUEsTUFBQTtlQUdJLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQXBCLEdBQStCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsTUFBRDttQkFBWSxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLFFBQXBCLEVBQThCLEtBQTlCO1VBQVo7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEVBSG5DO09BTEo7O0VBSGdCOzs7QUFhcEI7Ozs7OzswQ0FLQSxLQUFBLEdBQU8sU0FBQTtJQUNILFdBQVcsQ0FBQyxhQUFhLENBQUMsbUJBQTFCLENBQThDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBdEQ7SUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFmLEdBQStCLHFDQUFILEdBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQWxELEdBQWtFO0lBQzlGLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWYsR0FBbUMseUNBQUgsR0FBdUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBdEQsR0FBMEU7SUFDMUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZixHQUE2QixtQ0FBSCxHQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFoRCxHQUE4RDtJQUN4RixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFmLEdBQW9DLDBDQUFILEdBQXdDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQXZELEdBQTRFO0lBQzdHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFmLEdBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBRWpELElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBZixLQUFpQyxDQUFwQztNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUEwQixJQUFBLEVBQUUsQ0FBQyw0QkFBSCxDQUFBO01BQzFCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQXBCLEdBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUMzQixjQUFBO1VBQUEsSUFBRyxDQUFJLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQXRCOzREQUNrQixDQUFFLElBQWhCLENBQXFCLFFBQXJCLEVBQStCLEtBQS9CLFdBREo7V0FBQSxNQUFBO21CQUdJLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFISjs7UUFEMkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BTy9CLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUE1QixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUEvQyxFQUFzRCxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQTlEO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBN0IsRUFWSjs7V0FZQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBckJaOzs7QUF1QlA7Ozs7Ozs7MENBTUEsS0FBQSxHQUFPLFNBQUMsVUFBRDtBQUNILFFBQUE7SUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtJQUVuQixJQUFHLGlDQUFBLElBQXlCLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBcEQ7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUM7TUFDbEMsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O1dBQ0YsQ0FBRSxJQUFoQixDQUFxQixPQUFyQixFQUE4QixJQUE5QjtPQUhKOztJQUtBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBZixLQUFpQyxDQUFqQyxJQUF1QyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUF6RDt1REFDa0IsQ0FBRSxJQUFoQixDQUFxQixRQUFyQixFQUErQixJQUEvQixXQURKOztFQVJHOzs7QUFXUDs7Ozs7OzswQ0FNQSxlQUFBLEdBQWlCLFNBQUMsVUFBRCxFQUFhLGFBQWI7QUFDYixRQUFBO0lBQUEsSUFBRyxvQkFBQSxJQUFnQiwyQkFBbkI7QUFDSTtXQUFTLGlHQUFUO1FBQ0ksS0FBQSxHQUFRLFVBQVUsQ0FBQyxNQUFPLENBQUEsQ0FBQTtRQUMxQixTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVyxDQUFBLENBQUE7UUFDdEMsSUFBRyxtQkFBQSxJQUFlLGVBQWxCO1VBQ0ksV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsYUFBN0M7QUFDQSxrQkFBTyxTQUFTLENBQUMsSUFBakI7QUFBQSxpQkFDUyxDQURUO2NBRVEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBMUIsQ0FBd0MsS0FBeEM7Y0FDUixXQUFXLENBQUMsYUFBYSxDQUFDLGtCQUExQixDQUE2QyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFqRTsyQkFDQSxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUExQixDQUEyQyxTQUFTLENBQUMsY0FBckQsRUFBcUUsS0FBckU7QUFIQztBQURULGlCQUtTLENBTFQ7Y0FNUSxLQUFBLEdBQVEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUExQixDQUF5QyxLQUF6QztjQUNSLFdBQVcsQ0FBQyxhQUFhLENBQUMsa0JBQTFCLENBQTZDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWpFOzJCQUNBLFdBQVcsQ0FBQyxhQUFhLENBQUMsaUJBQTFCLENBQTRDLFNBQVMsQ0FBQyxlQUF0RCxFQUF1RSxLQUF2RTtBQUhDO0FBTFQsaUJBU1MsQ0FUVDtjQVVRLEtBQUEsR0FBUSxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQTFCLENBQXdDLEtBQXhDO2NBQ1IsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBakU7MkJBQ0EsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBMUIsQ0FBMkMsU0FBUyxDQUFDLGNBQXJELEVBQXFFLEtBQXJFO0FBSEM7QUFUVDs7QUFBQSxXQUZKO1NBQUEsTUFBQTsrQkFBQTs7QUFISjtxQkFESjs7RUFEYTs7O0FBb0JqQjs7Ozs7OzswQ0FNQSxJQUFBLEdBQU0sU0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixhQUF2QjtBQUNGLFFBQUE7SUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBdEI7TUFDSSxXQUFBLEdBQWtCLElBQUEsRUFBRSxDQUFDLDRCQUFILENBQUE7TUFDbEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFwQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFmLEdBQXVCLEdBQXZCLEdBQTZCLElBQUMsQ0FBQSxTQUF0RCxFQUFpRSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXpFO01BQ0EsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsV0FBVyxDQUFDLE9BQXpEO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDO01BQ2xDLElBQUMsQ0FBQSxTQUFELEdBTEo7S0FBQSxNQUFBO01BT0ksV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixJQUEyQixJQUFBLEVBQUUsQ0FBQyw0QkFBSCxDQUFBO01BQ3pDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBcEIsQ0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUF0RDtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQVR0Qzs7SUFXQSxXQUFXLENBQUMsTUFBWixHQUFxQjtJQUNyQixXQUFXLENBQUMsTUFBWixHQUFxQixJQUFDLENBQUE7SUFDdEIsSUFBbUMsUUFBbkM7TUFBQSxXQUFXLENBQUMsUUFBWixHQUF1QixTQUF2Qjs7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsR0FBc0I7SUFFdEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsV0FBVyxDQUFDLE9BQXpEO0lBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsVUFBakIsRUFBNkIsYUFBN0I7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWxCO01BQ0ksV0FBVyxDQUFDLFFBQVosR0FBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDbkIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLE1BQXhCO1VBQ0EsSUFBRyxDQUFJLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQXRCO21CQUNJLEtBQUMsQ0FBQSxTQUFELEdBREo7O1FBRm1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUl2QixXQUFXLENBQUMsS0FBWixDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCO0FBRUEsYUFBTyxLQVJYO0tBQUEsTUFBQTtNQVVJLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNuQixLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLFFBQXBCLEVBQThCLEtBQTlCO1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQUV2QixhQUFPLFlBWlg7O0VBcEJFOzs7QUFrQ047Ozs7OzswQ0FLQSxJQUFBLEdBQU0sU0FBQTtBQUNGLFFBQUE7SUFBQSxJQUFHLCtCQUFIO01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBcEIsQ0FBQTtxREFDYyxDQUFFLElBQWhCLENBQXFCLFFBQXJCLEVBQStCLElBQS9CLFdBRko7O0VBREU7OztBQUtOOzs7Ozs7MENBS0EsTUFBQSxHQUFRLFNBQUE7QUFDSixRQUFBO0lBQUEsSUFBRywrQkFBSDtNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQUE7O1dBQ2MsQ0FBRSxJQUFoQixDQUFxQixPQUFyQixFQUE4QixJQUE5Qjs7dURBQ2MsQ0FBRSxJQUFoQixDQUFxQixRQUFyQixFQUErQixJQUEvQixXQUhKOztFQURJOzs7QUFPUjs7Ozs7OzswQ0FNQSxPQUFBLEdBQVMsU0FBQTtJQUNELElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWxCO01BQ0ksSUFBRyxXQUFXLENBQUMsYUFBYSxDQUFDLGNBQTFCLENBQXlDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQXhELENBQUg7ZUFDSSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBREo7T0FESjtLQUFBLE1BQUE7YUFJSSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBSko7O0VBREM7OztBQU9UOzs7Ozs7MENBS0Esa0JBQUEsR0FBb0IsU0FBQTtJQUNoQixJQUFHLGlDQUFBLElBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWYsS0FBaUMsQ0FBMUQsSUFBZ0UsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUEzRjthQUNJLElBQUMsQ0FBQSxPQUFELENBQUEsRUFESjs7RUFEZ0I7OztBQUlwQjs7Ozs7OzBDQUtBLE1BQUEsR0FBUSxTQUFBO0lBQ0osSUFBRyxDQUFJLElBQUMsQ0FBQSxXQUFSO01BQ0ksSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQURKOztJQUdBLElBQUcsaUNBQUEsSUFBeUIsSUFBQyxDQUFBLFlBQTdCO01BQ0ksSUFBQyxDQUFBLFlBQUQsR0FBZ0I7TUFDaEIsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLGVBQWxCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBcEIsQ0FBQSxFQUhKOztXQUtBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0VBVEk7OztBQVdSOzs7Ozs7MENBS0EsS0FBQSxHQUFPLFNBQUEsR0FBQTs7OztHQXBRaUMsRUFBRSxDQUFDOztBQXNRL0MsRUFBRSxDQUFDLDZCQUFILEdBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfQ29tbW9uRXZlbnRCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgaWYgQG9iamVjdC5yaWQ/XG4gICAgICAgICAgICBAb2JqZWN0LnJlY29yZCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW0BvYmplY3QucmlkXVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlcj8ub2JqZWN0ID0gdGhpc1xuICAgICAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3QucmVjb3JkLmNvbW1hbmRzXG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgYSBnYW1lIG9iamVjdCB0byBleGVjdXRlIGNvbW1vbi1ldmVudHMuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9Db21tb25FdmVudEJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHJlYWR5VG9TdGFydFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQHJlYWR5VG9TdGFydCA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGluaXRpYWxpemVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAaW5pdGlhbGl6ZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgQGNhbGxEZXB0aCA9IDBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgY29tcG9uZW50IGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjIFxuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXRpYWxpemVkOiBAaW5pdGlhbGl6ZWQsXG4gICAgICAgICAgICByZWFkeVRvU3RhcnQ6IEByZWFkeVRvU3RhcnRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgY29tcG9uZW50IGZyb20gYSBkYXRhLWJ1bmRsZVxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZS0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgICBcbiAgICByZXN0b3JlOiAoZGF0YSkgLT5cbiAgICAgICAgQHNldHVwKClcbiAgICAgICAgQHJlYWR5VG9TdGFydCA9IGRhdGEucmVhZHlUb1N0YXJ0XG4gICAgICAgIEBpbml0aWFsaXplZCA9IGRhdGEuaW5pdGlhbGl6ZWRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBldmVudC1oYW5kbGVycyBmb3IgbW91c2UvdG91Y2ggZXZlbnRzXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5pbnRlcnByZXRlciB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vbkZpbmlzaCA9ID0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0LnJlY29yZC5wYXJhbGxlbFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImZpbmlzaFwiLCB0aGlzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAb2JqZWN0LnJlY29yZC5wYXJhbGxlbFxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIub25GaW5pc2ggPSAoc2VuZGVyKSA9PiBAb2JqZWN0LnJlbW92ZUNvbXBvbmVudChzZW5kZXIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vbkZpbmlzaCA9IChzZW5kZXIpID0+IEBvYmplY3QuZXZlbnRzLmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGNvbW1vbi1ldmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjICBcbiAgICBzZXR1cDogLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cExvY2FsVmFyaWFibGVzKEBvYmplY3QucmVjb3JkKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5yZWNvcmQucGFyYW1ldGVycyA9IGlmIEBvYmplY3QucmVjb3JkLnBhcmFtZXRlcnM/IHRoZW4gQG9iamVjdC5yZWNvcmQucGFyYW1ldGVycyBlbHNlIFtdXG4gICAgICAgIEBvYmplY3QucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID0gaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24/IHRoZW4gQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gZWxzZSAwXG4gICAgICAgIEBvYmplY3QucmVjb3JkLnBhcmFsbGVsID0gaWYgQG9iamVjdC5yZWNvcmQucGFyYWxsZWw/IHRoZW4gQG9iamVjdC5yZWNvcmQucGFyYWxsZWwgZWxzZSBub1xuICAgICAgICBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25Td2l0Y2ggPSBpZiBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25Td2l0Y2g/IHRoZW4gQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uU3dpdGNoIGVsc2UgbnVsbFxuICAgICAgICBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25FbmFibGVkID0gQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uRW5hYmxlZFxuICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlciA9IG5ldyBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyKClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIub25GaW5pc2ggPSA9PiBcbiAgICAgICAgICAgICAgICBpZiBub3QgQG9iamVjdC5yZWNvcmQucGFyYWxsZWxcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEByZXN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5yZWNvcmQuaW5kZXgsIEBvYmplY3QucmVjb3JkKVxuICAgICAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG9iamVjdC5pbnRlcnByZXRlcilcblxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIGNvbW1vbi1ldmVudCBpbnRlcnByZXRlciB3aXRoIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVycy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBzdGFydFxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtZXRlcnMgVGhlIGNvbW1vbi1ldmVudCdzIHBhcmFtZXRlcnMgd2hpY2ggY2FuIGJlIGNvbmZpZ3VyZWQgaW4gZGF0YWJhc2UuXG4gICAgIyMjICAgXG4gICAgc3RhcnQ6IChwYXJhbWV0ZXJzKSAtPlxuICAgICAgICBAc3RhcnRQYXJhbWV0ZXJzID0gcGFyYW1ldGVycyAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXI/IGFuZCBub3QgQG9iamVjdC5pbnRlcnByZXRlci5pc1J1bm5pbmdcbiAgICAgICAgICAgIEBvYmplY3QuY29tbWFuZHMgPSBAb2JqZWN0LnJlY29yZC5jb21tYW5kc1xuICAgICAgICAgICAgQHJlYWR5VG9TdGFydCA9IHllc1xuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJzdGFydFwiLCB0aGlzKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID09IDAgYW5kIEBvYmplY3QucmVjb3JkLnBhcmFsbGVsXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImZpbmlzaFwiLCB0aGlzKVxuICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB2YXJpYWJsZS1zdG9yZSB3aXRoIHRoZSBzdGFydC11cCBwYXJhbWV0ZXJzIGNvbmZpZ3VyZWQgZm9yIHRoZVxuICAgICogY29tbW9uLWV2ZW50IGluIERhdGFiYXNlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBQYXJhbWV0ZXJzXG4gICAgIyMjXG4gICAgc2V0dXBQYXJhbWV0ZXJzOiAocGFyYW1ldGVycywgcGFyZW50Q29udGV4dCkgLT5cbiAgICAgICAgaWYgcGFyYW1ldGVycz8gYW5kIHBhcmFtZXRlcnMudmFsdWVzP1xuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5wYXJhbWV0ZXJzLnZhbHVlcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJhbWV0ZXJzLnZhbHVlc1tpXVxuICAgICAgICAgICAgICAgIHBhcmFtZXRlciA9IEBvYmplY3QucmVjb3JkLnBhcmFtZXRlcnNbaV1cbiAgICAgICAgICAgICAgICBpZiBwYXJhbWV0ZXI/IGFuZCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMocGFyZW50Q29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtZXRlci50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZih2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAb2JqZWN0LmludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXROdW1iZXJWYWx1ZVRvKHBhcmFtZXRlci5udW1iZXJWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBCb29sZWFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZU9mKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZVRvKHBhcmFtZXRlci5ib29sZWFuVmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnN0cmluZ1ZhbHVlT2YodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQG9iamVjdC5pbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0U3RyaW5nVmFsdWVUbyhwYXJhbWV0ZXIuc3RyaW5nVmFyaWFibGUsIHZhbHVlKVxuICAgICMjIypcbiAgICAqIENhbGxzIHRoZSBjb21tb24tZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyBUaGUgY29tbW9uLWV2ZW50J3MgcGFyYW1ldGVycyB3aGljaCBjYW4gYmUgY29uZmlndXJlZCBpbiBkYXRhYmFzZS5cbiAgICAjIyMgXG4gICAgY2FsbDogKHBhcmFtZXRlcnMsIHNldHRpbmdzLCBwYXJlbnRDb250ZXh0KSAtPlxuICAgICAgICBpZiBub3QgQG9iamVjdC5yZWNvcmQuc2luZ2xlSW5zdGFuY2VcbiAgICAgICAgICAgIGludGVycHJldGVyID0gbmV3IGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIoKVxuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5yZWNvcmQuaW5kZXggKyBcIl9cIiArIEBjYWxsRGVwdGgsIEBvYmplY3QucmVjb3JkKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jbGVhclRlbXBWYXJpYWJsZXMoaW50ZXJwcmV0ZXIuY29udGV4dClcbiAgICAgICAgICAgIEBvYmplY3QuY29tbWFuZHMgPSBAb2JqZWN0LnJlY29yZC5jb21tYW5kc1xuICAgICAgICAgICAgQGNhbGxEZXB0aCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGludGVycHJldGVyID0gQG9iamVjdC5pbnRlcnByZXRlciB8fCBuZXcgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlcigpXG4gICAgICAgICAgICBpbnRlcnByZXRlci5jb250ZXh0LnNldChAb2JqZWN0LnJlY29yZC5pbmRleCwgQG9iamVjdC5yZWNvcmQpXG4gICAgICAgICAgICBAb2JqZWN0LmNvbW1hbmRzID0gQG9iamVjdC5yZWNvcmQuY29tbWFuZHNcbiAgICAgICAgICAgIFxuICAgICAgICBpbnRlcnByZXRlci5yZXBlYXQgPSBub1xuICAgICAgICBpbnRlcnByZXRlci5vYmplY3QgPSBAb2JqZWN0XG4gICAgICAgIGludGVycHJldGVyLnNldHRpbmdzID0gc2V0dGluZ3MgaWYgc2V0dGluZ3NcbiAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlciA9IGludGVycHJldGVyXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhpbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICBAc2V0dXBQYXJhbWV0ZXJzKHBhcmFtZXRlcnMsIHBhcmVudENvbnRleHQpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQucGFyYWxsZWxcbiAgICAgICAgICAgIGludGVycHJldGVyLm9uRmluaXNoID0gKHNlbmRlcikgPT4gXG4gICAgICAgICAgICAgICAgQG9iamVjdC5yZW1vdmVDb21wb25lbnQoc2VuZGVyKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0LnJlY29yZC5zaW5nbGVJbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICBAY2FsbERlcHRoLS1cbiAgICAgICAgICAgIGludGVycHJldGVyLnN0YXJ0KClcbiAgICAgICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KGludGVycHJldGVyKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbnRlcnByZXRlci5vbkZpbmlzaCA9IChzZW5kZXIpID0+IFxuICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlclxuICAgICAgIFxuICAgICMjIypcbiAgICAqIFN0b3BzIHRoZSBjb21tb24tZXZlbnQgaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wXG4gICAgIyMjICAgICAgXG4gICAgc3RvcDogLT5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlcj9cbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuc3RvcCgpXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImZpbmlzaFwiLCB0aGlzKVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgYSBwYXVzZWQgY29tbW9uLWV2ZW50IGludGVycHJldGVyLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdW1lXG4gICAgIyMjICAgICAgICAgICBcbiAgICByZXN1bWU6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXI/XG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnJlc3VtZSgpXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcInN0YXJ0XCIsIHRoaXMpXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcInJlc3VtZVwiLCB0aGlzKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RhcnRzIHRoZSBjb21tb24gZXZlbnQuIElmIHRoZSBjb21tb24gZXZlbnQgaGFzIGEgY29uZGl0aW9uIHRoZW4gdGhlIHJlc3RhcnRcbiAgICAqIHdpbGwgb25seSBoYXBwZW4gaWYgdGhhdCBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RhcnRcbiAgICAjIyMgIFxuICAgIHJlc3RhcnQ6IC0+XG4gICAgICAgICAgICBpZiBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25FbmFibGVkXG4gICAgICAgICAgICAgICAgaWYgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuVmFsdWVPZihAb2JqZWN0LnJlY29yZC5jb25kaXRpb25Td2l0Y2gpXG4gICAgICAgICAgICAgICAgICAgIEBzdGFydCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHN0YXJ0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0YXJ0cyB0aGUgY29tbW9uIGV2ZW50IGlmIGl0IGlzIHBhcmFsbGVsIGFuZCB0aGUgY29uZGl0aW9ucyBhcmUgbWV0LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdGFydElmTmVjZXNzYXJ5XG4gICAgIyMjICAgXG4gICAgcmVzdGFydElmTmVjZXNzYXJ5OiAtPlxuICAgICAgICBpZiBAb2JqZWN0LmludGVycHJldGVyPyBhbmQgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMSBhbmQgbm90IEBvYmplY3QuaW50ZXJwcmV0ZXIuaXNSdW5uaW5nXG4gICAgICAgICAgICBAcmVzdGFydCgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBjb21tb24tZXZlbnQgaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICBcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGlmIG5vdCBAaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgIEBzZXR1cCgpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlcj8gYW5kIEByZWFkeVRvU3RhcnRcbiAgICAgICAgICAgIEByZWFkeVRvU3RhcnQgPSBub1xuICAgICAgICAgICAgQHNldHVwUGFyYW1ldGVycyhAc3RhcnRQYXJhbWV0ZXJzKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5zdGFydCgpXG4gICAgICAgICAgICBcbiAgICAgICAgQHJlc3RhcnRJZk5lY2Vzc2FyeSgpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogTm90IGltcGxlbWVudGVkIHlldC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGVyYXNlXG4gICAgIyMjIFxuICAgIGVyYXNlOiAtPlxuICAgICAgICBcbmdzLkNvbXBvbmVudF9Db21tb25FdmVudEJlaGF2aW9yID0gQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3IiXX0=
//# sourceURL=Component_CommonEventBehavior_162.js