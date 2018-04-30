var Component_EventEmitter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_EventEmitter = (function(superClass) {
  extend(Component_EventEmitter, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_EventEmitter.prototype.onDataBundleRestore = function(data, context) {
    var handler, handlers, i, j, k, l, list, ref;
    for (k in this.handlers) {
      list = this.handlers[k];
      for (i = l = 0, ref = list.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        handlers = list[i];
        j = 0;
        while (j < handlers.length) {
          handler = handlers[j];
          if (!handler.handler || !handler.handler.$vnm_cb) {
            handlers.splice(j, 1);
          } else {
            j++;
          }
        }
      }
    }
    return null;
  };


  /**
  * A component which allow a game object to fire events and manage a list
  * of observers.
  *
  * @module gs
  * @class Component_EventEmitter
  * @extends gs.Component
  * @memberof gs
   */

  function Component_EventEmitter() {
    Component_EventEmitter.__super__.constructor.apply(this, arguments);

    /**
    * List of registered observers.
    *
    * @property handlers
    * @type Object
    * @private
     */
    this.handlers = {};

    /**
    * @property defaultData
    * @type Object
    * @private
     */
    this.defaultData = {};

    /**
    * @property chainInfo
    * @type Object
    * @private
     */
    this.chainInfo = {};

    /**
    * @property needsSort
    * @type boolean
    * @private
     */
    this.needsSort = {};

    /**
    * @property markedForRemove
    * @type Object[]
    * @private
     */
    this.markedForRemove = [];

    /**
    * @property isEmitting
    * @type number
    * @private
     */
    this.isEmitting = 0;
  }


  /**
  * Clears the event emitter by removing all handlers/listeners.
  *
  * @method clear
   */

  Component_EventEmitter.prototype.clear = function() {
    this.needsSort = {};
    this.handlers = {};
    return this.defaultData = {};
  };


  /**
  * Clears the event emitter by removing all handlers/listeners except those
  * which are associated with an owner in the specified owners array.
  *
  * @method clearExcept
  * @param {Object[]} owners - An array of owner objects. Only handlers/listeners which are not
  * associated with that owners are removed.
   */

  Component_EventEmitter.prototype.clearExcept = function(owners) {
    var event, events, handlerList, handlers, i, l, len, results;
    this.needsSort = {};
    this.defaultData = {};
    events = Object.keys(this.handlers);
    results = [];
    for (l = 0, len = events.length; l < len; l++) {
      event = events[l];
      handlers = this.handlers[event];
      results.push((function() {
        var len1, m, results1;
        results1 = [];
        for (i = m = 0, len1 = handlers.length; m < len1; i = ++m) {
          handlerList = handlers[i];
          handlerList = handlerList.filter(function(h) {
            return owners.indexOf(h.owner) !== 1;
          });
          results1.push(handlers[i] = handlerList);
        }
        return results1;
      })());
    }
    return results;
  };


  /**
  * Adds a new observer/listener for a specified event.
  *
  * @method on
  * @param {string} eventName - The event name.
  * @param {function} handler - The handler-function called when the event is fired.
  * @param {Object} [data={}] - An optional info-object passed to the handler-function.
  * @param {Object} [owner=null] - An optional owner-object associated with the observer/listener.
  * @param {number} priority - An optional priority level. An observer/listener with a higher level will receive the event before observers/listeners with a lower level.
  * @return {gs.EventObserver} - The added observer-object.
   */

  Component_EventEmitter.prototype.on = function(eventName, handler, data, owner, priority) {
    var handlerObject;
    priority = priority || 0;
    this.needsSort[eventName] = true;
    if (this.handlers[eventName] == null) {
      this.handlers[eventName] = [];
    }
    if (!this.handlers[eventName][priority]) {
      this.handlers[eventName][priority] = [];
    }
    handlerObject = {
      handler: handler,
      once: false,
      data: data,
      owner: owner,
      eventName: eventName,
      priority: priority
    };
    this.handlers[eventName][priority].push(handlerObject);
    return handlerObject;
  };


  /**
  * Adds a new observer/listener for a specified event and removes it
  * after the even has been emitted once.
  *
  * @method once
  * @param {string} eventName - The event name.
  * @param {function} handler - The handler-function called when the event is fired.
  * @param {Object} [data={}] - An optional info-object passed to the handler-function.
  * @param {Object} [owner=null] - An optional owner-object associated with the observer/listener.
  * @param {number} priority - An optional priority level. An observer/listener with a higher level will receive the event before observers/listeners with a lower level.
  * @return {gs.EventObserver} - The added observer-object.
   */

  Component_EventEmitter.prototype.once = function(eventName, handler, data, owner, priority) {
    var handlerObject;
    handlerObject = this.on(eventName, handler, data, owner, priority);
    handlerObject.once = true;
    return handlerObject;
  };


  /**
  * Removes an observer/listener from a specified event. If handler parameter
  * is null, all observers for the specified event are removed.
  *
  * @method off
  * @param {string} eventName - The event name.
  * @param {gs.EventObserver} [handler=null] - The observer-object to remove. 
  * If null, all observers for the specified event are removed.
   */

  Component_EventEmitter.prototype.off = function(eventName, handler) {
    var ref, ref1;
    if (this.isEmitting > 0 && handler) {
      return this.markedForRemove.push(handler);
    } else if (handler != null) {
      return (ref = this.handlers[eventName]) != null ? (ref1 = ref[handler.priority]) != null ? ref1.remove(handler) : void 0 : void 0;
    } else {
      return this.handlers[eventName] = [];
    }
  };


  /**
  * Removes all observers/listeners from an event which are belonging to the specified
  * owner.
  *
  * @method offByOwner
  * @param {string} eventName - The event name.
  * @param {Object} owner - The owner.
  * @return {number} Count of removed observers/listeners.
   */

  Component_EventEmitter.prototype.offByOwner = function(eventName, owner) {
    var handler, handlerList, handlers, l, len, len1, m, ref, ref1, results, results1;
    if (this.handlers[eventName]) {
      if (this.isEmitting > 0) {
        ref = this.handlers[eventName];
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          handlerList = ref[l];
          handlers = handlerList != null ? handlerList.where(function(x) {
            return x.owner === owner;
          }) : void 0;
          results.push((function() {
            var len1, m, results1;
            results1 = [];
            for (m = 0, len1 = handlers.length; m < len1; m++) {
              handler = handlers[m];
              results1.push(this.markedForRemove.push(handler));
            }
            return results1;
          }).call(this));
        }
        return results;
      } else {
        ref1 = this.handlers[eventName];
        results1 = [];
        for (m = 0, len1 = ref1.length; m < len1; m++) {
          handlerList = ref1[m];
          results1.push(handlerList.removeAll(function(x) {
            return x.owner === owner;
          }));
        }
        return results1;
      }
    }
  };


  /**
  * Emits the specified event. All observers/listeners registered for the
  * specified event are informed.
  *
  * @method emit
  * @param {string} eventName - The name of the event to fire.
  * @param {Object} [sender=null] - The sender of the event.
  * @param {Object} [data={}] - An optional object passed to each handler-function.
   */

  Component_EventEmitter.prototype.emit = function(eventName, sender, data) {
    var count, handler, handlerList, handlerLists, i, l, len, len1, m, n, ref;
    handlerLists = this.handlers[eventName];
    data = data != null ? data : {};
    if (handlerLists && this.needsSort[eventName]) {
      this.needsSort[eventName] = false;
      for (l = 0, len = handlerLists.length; l < len; l++) {
        handlerList = handlerLists[l];
        handlerList.sort(function(a, b) {
          if (a.owner && b.owner) {
            if (a.owner.rIndex > b.owner.rIndex) {
              return -1;
            } else if (a.owner.rIndex < b.owner.rIndex) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return -1;
          }
        });
      }
    }
    if (handlerLists != null) {
      for (m = handlerLists.length - 1; m >= 0; m += -1) {
        handlerList = handlerLists[m];
        if (!handlerList) {
          continue;
        }
        i = 0;
        count = handlerList.length;
        this.isEmitting++;
        while (i < count) {
          handler = handlerList[i];
          data.handler = handler;
          data.sender = sender;
          data.data = handler.data;
          if (!handler.owner || (handler.owner.visible == null) || handler.owner.visible) {
            handler.handler(data);
          }
          if (handler.once) {
            this.markedForRemove.push(handler);
          }
          if (data.breakChain) {
            break;
          }
          i++;
        }
        this.isEmitting--;
        if (data.breakChain) {
          data.breakChain = false;
          break;
        }
      }
      if (!this.isEmitting && this.markedForRemove.length > 0) {
        ref = this.markedForRemove;
        for (n = 0, len1 = ref.length; n < len1; n++) {
          handler = ref[n];
          this.handlers[handler.eventName][handler.priority].remove(handler);
        }
        this.markedForRemove = [];
      }
    }
    return null;
  };


  /**
  * Checks if an event-handler with a specified owner exists for the
  * given event.
  *
  * @method checkForOwner
  * @param {string} eventName - The event name.
  * @param {function} owner - The owner to search for.
  * @return {boolean} If <b>true</b>, an event-handler with the specified owner
  * exists for the given event. Otherwise <b>false</b>.
   */

  Component_EventEmitter.prototype.checkForOwner = function(eventName, owner) {
    var handler, l, len, ref, result;
    result = false;
    ref = this.handlers[eventName];
    for (l = 0, len = ref.length; l < len; l++) {
      handler = ref[l];
      if (handler.owner === owner) {
        result = true;
        break;
      }
    }
    return result;
  };


  /**
  * Checks if an event-handler with a specified handler-function exists for the
  * given event.
  *
  * @method checkForHandlerFunction
  * @param {string} eventName - The event name.
  * @param {function} handlerFunction - The handler-function to search for.
  * @return {boolean} If true, an observer witht he specified handler-function
  * exists for the given event. Otherwise false.
   */

  Component_EventEmitter.prototype.checkForHandlerFunction = function(eventName, handlerFunction) {
    var handler, l, len, ref, result;
    result = false;
    if (handlerFunction != null) {
      ref = this.handlers[eventName];
      for (l = 0, len = ref.length; l < len; l++) {
        handler = ref[l];
        if (handler.handler === handlerFunction) {
          result = true;
          break;
        }
      }
    }
    return result;
  };


  /**
  * Not implemented yet.
  * @method update
   */

  Component_EventEmitter.prototype.update = function() {
    return this.object.active = this.object.active && (!this.object.parent || this.object.parent.active);
  };

  return Component_EventEmitter;

})(gs.Component);

gs.Component_EventEmitter = Component_EventEmitter;

gs.EventEmitter = Component_EventEmitter;

gs.GlobalEventManager = new Component_EventEmitter();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7O21DQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtBQUFBLFNBQUEsa0JBQUE7TUFDSSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBO0FBQ2pCLFdBQVMsb0ZBQVQ7UUFDSSxRQUFBLEdBQVcsSUFBSyxDQUFBLENBQUE7UUFDaEIsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksUUFBUSxDQUFDLE1BQW5CO1VBQ0ksT0FBQSxHQUFVLFFBQVMsQ0FBQSxDQUFBO1VBRW5CLElBQUcsQ0FBQyxPQUFPLENBQUMsT0FBVCxJQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBeEM7WUFDSSxRQUFRLENBQUMsTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixFQURKO1dBQUEsTUFBQTtZQUdJLENBQUEsR0FISjs7UUFISjtBQUhKO0FBRko7QUFjQSxXQUFPO0VBZlU7OztBQWdCckI7Ozs7Ozs7Ozs7RUFTYSxnQ0FBQTtJQUNULHlEQUFBLFNBQUE7O0FBRUE7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7SUFLQSxJQUFDLENBQUEsVUFBRCxHQUFjO0VBN0NMOzs7QUErQ2I7Ozs7OzttQ0FLQSxLQUFBLEdBQU8sU0FBQTtJQUNILElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsUUFBRCxHQUFZO1dBQ1osSUFBQyxDQUFBLFdBQUQsR0FB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Ozs7Ozs7O21DQVVBLHVCQUFBLEdBQXlCLFNBQUMsU0FBRCxFQUFZLGVBQVo7QUFDckIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUVULElBQUcsdUJBQUg7QUFDSTtBQUFBLFdBQUEscUNBQUE7O1FBQ0ksSUFBRyxPQUFPLENBQUMsT0FBUixLQUFtQixlQUF0QjtVQUNJLE1BQUEsR0FBUztBQUNULGdCQUZKOztBQURKLE9BREo7O0FBTUEsV0FBTztFQVRjOzs7QUFXekI7Ozs7O21DQUtBLE1BQUEsR0FBUSxTQUFBO1dBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixJQUFtQixDQUFDLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFULElBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQW5DO0VBRGhDOzs7O0dBN1N5QixFQUFFLENBQUM7O0FBZ1R4QyxFQUFFLENBQUMsc0JBQUgsR0FBNEI7O0FBQzVCLEVBQUUsQ0FBQyxZQUFILEdBQWtCOztBQUNsQixFQUFFLENBQUMsa0JBQUgsR0FBNEIsSUFBQSxzQkFBQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfRXZlbnRFbWl0dGVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfRXZlbnRFbWl0dGVyIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgI0BvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcImhhbmRsZXJzXCJdXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIGZvciBrIG9mIEBoYW5kbGVyc1xuICAgICAgICAgICAgbGlzdCA9IEBoYW5kbGVyc1trXVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5saXN0Lmxlbmd0aF1cbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGxpc3RbaV1cbiAgICAgICAgICAgICAgICBqID0gMFxuICAgICAgICAgICAgICAgIHdoaWxlIGogPCBoYW5kbGVycy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2pdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAhaGFuZGxlci5oYW5kbGVyIG9yICFoYW5kbGVyLmhhbmRsZXIuJHZubV9jYlxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGosIDEpXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICNAaGFuZGxlcnMgPSB7fVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICMjIypcbiAgICAqIEEgY29tcG9uZW50IHdoaWNoIGFsbG93IGEgZ2FtZSBvYmplY3QgdG8gZmlyZSBldmVudHMgYW5kIG1hbmFnZSBhIGxpc3RcbiAgICAqIG9mIG9ic2VydmVycy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0V2ZW50RW1pdHRlclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBMaXN0IG9mIHJlZ2lzdGVyZWQgb2JzZXJ2ZXJzLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGhhbmRsZXJzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBoYW5kbGVycyA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGRlZmF1bHREYXRhXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBkZWZhdWx0RGF0YSA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGNoYWluSW5mb1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAY2hhaW5JbmZvID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbmVlZHNTb3J0XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAbmVlZHNTb3J0ID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbWFya2VkRm9yUmVtb3ZlXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQG1hcmtlZEZvclJlbW92ZSA9IFtdXG4gICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaXNFbWl0dGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAaXNFbWl0dGluZyA9IDBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgdGhlIGV2ZW50IGVtaXR0ZXIgYnkgcmVtb3ZpbmcgYWxsIGhhbmRsZXJzL2xpc3RlbmVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgIyMjIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBAbmVlZHNTb3J0ID0ge31cbiAgICAgICAgQGhhbmRsZXJzID0ge31cbiAgICAgICAgQGRlZmF1bHREYXRhID0ge31cbiAgICAgIFxuICAgICMjIypcbiAgICAqIENsZWFycyB0aGUgZXZlbnQgZW1pdHRlciBieSByZW1vdmluZyBhbGwgaGFuZGxlcnMvbGlzdGVuZXJzIGV4Y2VwdCB0aG9zZVxuICAgICogd2hpY2ggYXJlIGFzc29jaWF0ZWQgd2l0aCBhbiBvd25lciBpbiB0aGUgc3BlY2lmaWVkIG93bmVycyBhcnJheS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyRXhjZXB0XG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSBvd25lcnMgLSBBbiBhcnJheSBvZiBvd25lciBvYmplY3RzLiBPbmx5IGhhbmRsZXJzL2xpc3RlbmVycyB3aGljaCBhcmUgbm90XG4gICAgKiBhc3NvY2lhdGVkIHdpdGggdGhhdCBvd25lcnMgYXJlIHJlbW92ZWQuXG4gICAgIyMjICAgXG4gICAgY2xlYXJFeGNlcHQ6IChvd25lcnMpIC0+XG4gICAgICAgIEBuZWVkc1NvcnQgPSB7fVxuICAgICAgICBAZGVmYXVsdERhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgZXZlbnRzID0gT2JqZWN0LmtleXMoQGhhbmRsZXJzKVxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBoYW5kbGVycyA9IEBoYW5kbGVyc1tldmVudF1cbiAgICAgICAgICAgIGZvciBoYW5kbGVyTGlzdCwgaSBpbiBoYW5kbGVyc1xuICAgICAgICAgICAgICAgIGhhbmRsZXJMaXN0ID0gaGFuZGxlckxpc3QuZmlsdGVyIChoKSAtPiBvd25lcnMuaW5kZXhPZihoLm93bmVyKSAhPSAxXG4gICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyTGlzdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGEgbmV3IG9ic2VydmVyL2xpc3RlbmVyIGZvciBhIHNwZWNpZmllZCBldmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyIC0gVGhlIGhhbmRsZXItZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkLlxuICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhPXt9XSAtIEFuIG9wdGlvbmFsIGluZm8tb2JqZWN0IHBhc3NlZCB0byB0aGUgaGFuZGxlci1mdW5jdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3duZXI9bnVsbF0gLSBBbiBvcHRpb25hbCBvd25lci1vYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBvYnNlcnZlci9saXN0ZW5lci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eSAtIEFuIG9wdGlvbmFsIHByaW9yaXR5IGxldmVsLiBBbiBvYnNlcnZlci9saXN0ZW5lciB3aXRoIGEgaGlnaGVyIGxldmVsIHdpbGwgcmVjZWl2ZSB0aGUgZXZlbnQgYmVmb3JlIG9ic2VydmVycy9saXN0ZW5lcnMgd2l0aCBhIGxvd2VyIGxldmVsLlxuICAgICogQHJldHVybiB7Z3MuRXZlbnRPYnNlcnZlcn0gLSBUaGUgYWRkZWQgb2JzZXJ2ZXItb2JqZWN0LlxuICAgICMjIyAgICBcbiAgICBvbjogKGV2ZW50TmFtZSwgaGFuZGxlciwgZGF0YSwgb3duZXIsIHByaW9yaXR5KSAtPlxuICAgICAgICBwcmlvcml0eSA9IHByaW9yaXR5IHx8IDBcbiAgICAgICAgQG5lZWRzU29ydFtldmVudE5hbWVdID0gdHJ1ZVxuICAgICAgICBpZiBub3QgQGhhbmRsZXJzW2V2ZW50TmFtZV0/XG4gICAgICAgICAgICBAaGFuZGxlcnNbZXZlbnROYW1lXSA9IFtdXG4gICAgICAgIGlmIG5vdCBAaGFuZGxlcnNbZXZlbnROYW1lXVtwcmlvcml0eV1cbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdW3ByaW9yaXR5XSA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgaGFuZGxlck9iamVjdCA9IHsgaGFuZGxlcjogaGFuZGxlciwgb25jZTogbm8sIGRhdGE6IGRhdGEsIG93bmVyOiBvd25lciwgZXZlbnROYW1lOiBldmVudE5hbWUsIHByaW9yaXR5OiBwcmlvcml0eSB9XG4gICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdW3ByaW9yaXR5XS5wdXNoKGhhbmRsZXJPYmplY3QpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaGFuZGxlck9iamVjdFxuICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgYSBuZXcgb2JzZXJ2ZXIvbGlzdGVuZXIgZm9yIGEgc3BlY2lmaWVkIGV2ZW50IGFuZCByZW1vdmVzIGl0XG4gICAgKiBhZnRlciB0aGUgZXZlbiBoYXMgYmVlbiBlbWl0dGVkIG9uY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbmNlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyIC0gVGhlIGhhbmRsZXItZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkLlxuICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhPXt9XSAtIEFuIG9wdGlvbmFsIGluZm8tb2JqZWN0IHBhc3NlZCB0byB0aGUgaGFuZGxlci1mdW5jdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3duZXI9bnVsbF0gLSBBbiBvcHRpb25hbCBvd25lci1vYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBvYnNlcnZlci9saXN0ZW5lci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eSAtIEFuIG9wdGlvbmFsIHByaW9yaXR5IGxldmVsLiBBbiBvYnNlcnZlci9saXN0ZW5lciB3aXRoIGEgaGlnaGVyIGxldmVsIHdpbGwgcmVjZWl2ZSB0aGUgZXZlbnQgYmVmb3JlIG9ic2VydmVycy9saXN0ZW5lcnMgd2l0aCBhIGxvd2VyIGxldmVsLlxuICAgICogQHJldHVybiB7Z3MuRXZlbnRPYnNlcnZlcn0gLSBUaGUgYWRkZWQgb2JzZXJ2ZXItb2JqZWN0LlxuICAgICMjIyAgICAgICAgXG4gICAgb25jZTogKGV2ZW50TmFtZSwgaGFuZGxlciwgZGF0YSwgb3duZXIsIHByaW9yaXR5KSAtPlxuICAgICAgICBoYW5kbGVyT2JqZWN0ID0gQG9uKGV2ZW50TmFtZSwgaGFuZGxlciwgZGF0YSwgb3duZXIsIHByaW9yaXR5KVxuICAgICAgICBoYW5kbGVyT2JqZWN0Lm9uY2UgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBoYW5kbGVyT2JqZWN0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYW4gb2JzZXJ2ZXIvbGlzdGVuZXIgZnJvbSBhIHNwZWNpZmllZCBldmVudC4gSWYgaGFuZGxlciBwYXJhbWV0ZXJcbiAgICAqIGlzIG51bGwsIGFsbCBvYnNlcnZlcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYXJlIHJlbW92ZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvZmZcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgZXZlbnQgbmFtZS5cbiAgICAqIEBwYXJhbSB7Z3MuRXZlbnRPYnNlcnZlcn0gW2hhbmRsZXI9bnVsbF0gLSBUaGUgb2JzZXJ2ZXItb2JqZWN0IHRvIHJlbW92ZS4gXG4gICAgKiBJZiBudWxsLCBhbGwgb2JzZXJ2ZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGFyZSByZW1vdmVkLlxuICAgICMjIyAgICBcbiAgICBvZmY6IChldmVudE5hbWUsIGhhbmRsZXIpIC0+XG4gICAgICAgIGlmIEBpc0VtaXR0aW5nID4gMCBhbmQgaGFuZGxlclxuICAgICAgICAgICAgQG1hcmtlZEZvclJlbW92ZS5wdXNoKGhhbmRsZXIpXG4gICAgICAgIGVsc2UgaWYgaGFuZGxlcj9cbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdP1toYW5kbGVyLnByaW9yaXR5XT8ucmVtb3ZlKGhhbmRsZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdID0gW11cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYWxsIG9ic2VydmVycy9saXN0ZW5lcnMgZnJvbSBhbiBldmVudCB3aGljaCBhcmUgYmVsb25naW5nIHRvIHRoZSBzcGVjaWZpZWRcbiAgICAqIG93bmVyLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb2ZmQnlPd25lclxuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lLlxuICAgICogQHBhcmFtIHtPYmplY3R9IG93bmVyIC0gVGhlIG93bmVyLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBDb3VudCBvZiByZW1vdmVkIG9ic2VydmVycy9saXN0ZW5lcnMuXG4gICAgIyMjXG4gICAgb2ZmQnlPd25lcjogKGV2ZW50TmFtZSwgb3duZXIpIC0+XG4gICAgICAgIGlmIEBoYW5kbGVyc1tldmVudE5hbWVdXG4gICAgICAgICAgICBpZiBAaXNFbWl0dGluZyA+IDBcbiAgICAgICAgICAgICAgICBmb3IgaGFuZGxlckxpc3QgaW4gQGhhbmRsZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyTGlzdD8ud2hlcmUgKHgpIC0+IHgub3duZXIgPT0gb3duZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGhhbmRsZXIgaW4gaGFuZGxlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtYXJrZWRGb3JSZW1vdmUucHVzaChoYW5kbGVyKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBoYW5kbGVyTGlzdCBpbiBAaGFuZGxlcnNbZXZlbnROYW1lXVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTGlzdC5yZW1vdmVBbGwoKHgpIC0+IHgub3duZXIgPT0gb3duZXIpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuIEFsbCBvYnNlcnZlcnMvbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIHRoZVxuICAgICogc3BlY2lmaWVkIGV2ZW50IGFyZSBpbmZvcm1lZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGVtaXRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gZmlyZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbc2VuZGVyPW51bGxdIC0gVGhlIHNlbmRlciBvZiB0aGUgZXZlbnQuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGE9e31dIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHBhc3NlZCB0byBlYWNoIGhhbmRsZXItZnVuY3Rpb24uXG4gICAgIyMjICAgICAgXG4gICAgZW1pdDogKGV2ZW50TmFtZSwgc2VuZGVyLCBkYXRhKSAtPlxuICAgICAgICBoYW5kbGVyTGlzdHMgPSBAaGFuZGxlcnNbZXZlbnROYW1lXVxuICAgICAgICBkYXRhID0gZGF0YSA/IHt9ICNAZGVmYXVsdERhdGFcbiAgICAgICAgXG4gICAgICAgIGlmIGhhbmRsZXJMaXN0cyBhbmQgQG5lZWRzU29ydFtldmVudE5hbWVdXG4gICAgICAgICAgICBAbmVlZHNTb3J0W2V2ZW50TmFtZV0gPSBub1xuICAgICAgICAgICAgZm9yIGhhbmRsZXJMaXN0IGluIGhhbmRsZXJMaXN0c1xuICAgICAgICAgICAgICAgIGhhbmRsZXJMaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGEub3duZXIgYW5kIGIub3duZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGEub3duZXIuckluZGV4ID4gYi5vd25lci5ySW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGEub3duZXIuckluZGV4IDwgYi5vd25lci5ySW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgaGFuZGxlckxpc3RzP1xuICAgICAgICAgICAgZm9yIGhhbmRsZXJMaXN0IGluIGhhbmRsZXJMaXN0cyBieSAtMVxuICAgICAgICAgICAgICAgIGlmICFoYW5kbGVyTGlzdCB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgICAgICBjb3VudCA9IGhhbmRsZXJMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIEBpc0VtaXR0aW5nKytcbiAgICAgICAgICAgICAgICB3aGlsZSBpIDwgY291bnRcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJMaXN0W2ldXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBkYXRhLmhhbmRsZXIgPSBoYW5kbGVyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuc2VuZGVyID0gc2VuZGVyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZGF0YSA9IGhhbmRsZXIuZGF0YVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgIWhhbmRsZXIub3duZXIgb3IgIWhhbmRsZXIub3duZXIudmlzaWJsZT8gb3IgaGFuZGxlci5vd25lci52aXNpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmhhbmRsZXIoZGF0YSkgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgaGFuZGxlci5vbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAbWFya2VkRm9yUmVtb3ZlLnB1c2goaGFuZGxlcilcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBkYXRhLmJyZWFrQ2hhaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICBAaXNFbWl0dGluZy0tXG4gICAgICAgICAgICAgICAgaWYgZGF0YS5icmVha0NoYWluXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYnJlYWtDaGFpbiA9IG5vXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAhQGlzRW1pdHRpbmcgYW5kIEBtYXJrZWRGb3JSZW1vdmUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIGZvciBoYW5kbGVyIGluIEBtYXJrZWRGb3JSZW1vdmVcbiAgICAgICAgICAgICAgICAgICAgQGhhbmRsZXJzW2hhbmRsZXIuZXZlbnROYW1lXVtoYW5kbGVyLnByaW9yaXR5XS5yZW1vdmUoaGFuZGxlcilcbiAgICAgICAgICAgICAgICBAbWFya2VkRm9yUmVtb3ZlID0gW11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICBcblxuICAgICMjIypcbiAgICAqIENoZWNrcyBpZiBhbiBldmVudC1oYW5kbGVyIHdpdGggYSBzcGVjaWZpZWQgb3duZXIgZXhpc3RzIGZvciB0aGVcbiAgICAqIGdpdmVuIGV2ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hlY2tGb3JPd25lclxuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lLlxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3duZXIgLSBUaGUgb3duZXIgdG8gc2VhcmNoIGZvci5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IElmIDxiPnRydWU8L2I+LCBhbiBldmVudC1oYW5kbGVyIHdpdGggdGhlIHNwZWNpZmllZCBvd25lclxuICAgICogZXhpc3RzIGZvciB0aGUgZ2l2ZW4gZXZlbnQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj4uXG4gICAgIyMjICBcbiAgICBjaGVja0Zvck93bmVyOiAoZXZlbnROYW1lLCBvd25lcikgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgXG4gICAgICAgIGZvciBoYW5kbGVyIGluIEBoYW5kbGVyc1tldmVudE5hbWVdXG4gICAgICAgICAgICBpZiBoYW5kbGVyLm93bmVyID09IG93bmVyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0geWVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgYW4gZXZlbnQtaGFuZGxlciB3aXRoIGEgc3BlY2lmaWVkIGhhbmRsZXItZnVuY3Rpb24gZXhpc3RzIGZvciB0aGVcbiAgICAqIGdpdmVuIGV2ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hlY2tGb3JIYW5kbGVyRnVuY3Rpb25cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgZXZlbnQgbmFtZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJGdW5jdGlvbiAtIFRoZSBoYW5kbGVyLWZ1bmN0aW9uIHRvIHNlYXJjaCBmb3IuXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSBJZiB0cnVlLCBhbiBvYnNlcnZlciB3aXRodCBoZSBzcGVjaWZpZWQgaGFuZGxlci1mdW5jdGlvblxuICAgICogZXhpc3RzIGZvciB0aGUgZ2l2ZW4gZXZlbnQuIE90aGVyd2lzZSBmYWxzZS5cbiAgICAjIyMgIFxuICAgIGNoZWNrRm9ySGFuZGxlckZ1bmN0aW9uOiAoZXZlbnROYW1lLCBoYW5kbGVyRnVuY3Rpb24pIC0+IFxuICAgICAgICByZXN1bHQgPSBub1xuICAgICAgICBcbiAgICAgICAgaWYgaGFuZGxlckZ1bmN0aW9uP1xuICAgICAgICAgICAgZm9yIGhhbmRsZXIgaW4gQGhhbmRsZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgICAgICAgICBpZiBoYW5kbGVyLmhhbmRsZXIgPT0gaGFuZGxlckZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBOb3QgaW1wbGVtZW50ZWQgeWV0LlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgXG4gICAgIyBGSVhNRTogV2h5IHNob3VsZCBldmVudC1lbWl0dGVyIGluZmx1ZW5jZSB0aGUgYWN0aXZlLXByb3BlcnR5P1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgQG9iamVjdC5hY3RpdmUgPSBAb2JqZWN0LmFjdGl2ZSBhbmQgKCFAb2JqZWN0LnBhcmVudCBvciBAb2JqZWN0LnBhcmVudC5hY3RpdmUpXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlciA9IENvbXBvbmVudF9FdmVudEVtaXR0ZXJcbmdzLkV2ZW50RW1pdHRlciA9IENvbXBvbmVudF9FdmVudEVtaXR0ZXJcbmdzLkdsb2JhbEV2ZW50TWFuYWdlciA9IG5ldyBDb21wb25lbnRfRXZlbnRFbWl0dGVyKCkiXX0=
//# sourceURL=Component_EventEmitter_151.js