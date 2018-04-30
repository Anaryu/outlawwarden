var ObjectManager;

ObjectManager = (function() {

  /**
  * Stores the current default ObjectManager.
  * @property current
  * @type gs.ObjectManager
  * @static
   */
  ObjectManager.current = null;


  /**
  * Manages game objects by updating if necessary and offering
  * methods to add or remove game objects. All game objects are sorted by
  * the order-property to give control over the update-order.
  *
  * A game object can registered under a unique ID and then easily accessed using
  * that ID. If an object gets registered, a global variable $<ID> is created
  * as well. However, that global variable is only for the use in property-bindings
  * used for In-Game UI. See ui.Component_BindingHandler.
  *
  * In addition, a game object can be assigned to a group like for example
  * a set of UI toggle-buttons can be assigned to the same group and then
  * easily accessed later using gs.ObjectManager.objectsByGroup method.
  *
  * @module gs
  * @class ObjectManager
  * @memberof gs
  * @constructor
  * @see ui.Component_BindingHandler
   */

  function ObjectManager() {

    /**
    * All game objects to manage.
    * @property objects
    * @type gs.Object_Base[]
     */
    this.objects = [];

    /**
    * All game objects by ID.
    * @property objectsById
    * @type Object
     */
    this.objectsById = {};

    /**
    * All game objects by group.
    * @property objectsByGroup_
    * @type Object
     */
    this.objectsByGroup_ = {};

    /**
    * Indicates if the ObjectManager is active. If <b>false</b> the game objects are not updated.
    * @property active
    * @type boolean
     */
    this.active = true;

    /**
    * Indicates if the ObjectManager needs to sort the game objects.
    * @property active
    * @type boolean
     */
    this.needsSort = true;
  }


  /**
  * Disposes the manager and all assigned game objects.
  *
  * @method dispose
   */

  ObjectManager.prototype.dispose = function() {
    var j, len, object, ref, results;
    ref = this.objects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (!object.disposed) {
        results.push(object.dispose());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all assigned game objects.
  *
  * @method disposeObjects
   */

  ObjectManager.prototype.disposeObjects = function() {
    var j, k, keys, len, object, results;
    keys = Object.keys(this.objectsById);
    results = [];
    for (j = 0, len = keys.length; j < len; j++) {
      k = keys[j];
      object = this.objectsById[k];
      if (object && !object.disposed) {
        results.push(object.dispose());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Registers an object.
  *
  * @method registerObject
   */

  ObjectManager.prototype.registerObject = function(object) {
    if (object.id != null) {
      if (!this.objectsById[object.id]) {
        this.objectsById[object.id] = [];
      }
      this.objectsById[object.id].push(object);
      return window["$" + object.id] = object;
    }
  };


  /**
  * Unregisters an object.
  *
  * @method unregisterObject
   */

  ObjectManager.prototype.unregisterObject = function(object) {
    var objects;
    if ((object != null ? object.id : void 0) != null) {
      objects = this.objectsById[object.id];
      if (objects) {
        objects.remove(object);
        if (objects.length > 0) {
          window["$" + object.id] = objects.last();
        } else {
          delete window["$" + object.id];
        }
      }
    }
    return null;
  };


  /**
  * Adds a game object to the manager. The game object is then automatically updated by the manager.
  *
  * @method addObject
  * @param {gs.Object_Base} object - The game object to add.
   */

  ObjectManager.prototype.addObject = function(object) {
    return this.add(object);
  };


  /**
  * Removes a game object to the manager. The game object is then no longer automatically updated or disposed by the manager.
  *
  * @method removeObject
  * @param {gs.Object_Base} object - The game object to remove.
   */

  ObjectManager.prototype.removeObject = function(object) {
    return this.remove(object);
  };


  /**
  * Adds a game object to the manager. The game object is then automatically updated by the manager.
  *
  * @method add
  * @param {gs.Object_Base} object - The game object to add.
   */

  ObjectManager.prototype.add = function(object) {
    this.objects.push(object);
    this.needsSort = true;
    this.registerObject(object);
    return this.addToGroup(object, object.group);
  };


  /**
  * Removes a game object to the manager. The game object is then no longer automatically updated or disposed by the manager.
  *
  * @method remove
  * @param {gs.Object_Base} object - The game object to remove.
   */

  ObjectManager.prototype.remove = function(object) {
    var ref;
    if (object) {
      this.objects.remove(object);
      this.unregisterObject(object);
      if (object.group != null) {
        return (ref = this.objectsByGroup[object.group]) != null ? ref.remove(object) : void 0;
      }
    }
  };


  /**
  * Gets an object by ID.
  *
  * @method objectById
  * @param {String} id - The ID of the game object to get. 
  * @return {gs.Object_Base} The game object or <b>null</b> if no game object is registered for the specified ID.
   */

  ObjectManager.prototype.objectById = function(id) {
    var ref;
    return (ref = this.objectsById[id]) != null ? ref.last() : void 0;
  };


  /**
  * Gets an object by ID.
  *
  * @method byId
  * @param {String} id - The ID of the game object to get. 
  * @return {gs.Object_Base} The game object or <b>null</b> if no game object is registered for the specified ID.
   */

  ObjectManager.prototype.byId = function(id) {
    var ref;
    return (ref = this.objectsById[id]) != null ? ref.last() : void 0;
  };


  /**
  * Sets the object for an ID.
  *
  * @method setObjectById
  * @param {gs.Object_Base} object - The game object to set.
  * @param {String} id - The ID for the game object.
   */

  ObjectManager.prototype.setObjectById = function(object, id) {
    if (!id) {
      return;
    }
    object.id = id;
    if (!this.objectsById[id]) {
      this.objectsById[id] = [object];
    } else {
      this.objectsById[id].push(object);
    }
    return window["$" + id] = object;
  };


  /**
  * Adds an object to a specified object-group.
  *
  * @method addToGroup
  * @param {gs.Object_Base} object - The game object to add.
  * @param {String} group - The group to assign game object to.
   */

  ObjectManager.prototype.addToGroup = function(object, group) {
    var ref;
    if (group != null) {
      if ((ref = this.objectsByGroup_[object.group]) != null) {
        ref.remove(object);
      }
      if (!this.objectsByGroup_[group]) {
        this.objectsByGroup_[group] = [];
      }
      return this.objectsByGroup_[group].push(object);
    }
  };


  /**
  * Gets all object of a specified object-group.
  *
  * @method objectsByGroup
  * @param {String} group - The object-group.
  * @return {gs.Object_Base[]} The game objects belonging to the specified group.
   */

  ObjectManager.prototype.objectsByGroup = function(group) {
    return this.objectsByGroup_[group] || [];
  };


  /**
  * Updates the manager and all assigned game objects in the right order.
  *
  * @method update
   */

  ObjectManager.prototype.update = function() {
    var i, object;
    i = 0;
    if (this.needsSort) {
      this.objects.sort(function(a, b) {
        if (a.order < b.order) {
          return 1;
        } else if (a.order > b.order) {
          return -1;
        } else {
          return 0;
        }
      });
      this.needsSort = false;
    }
    while (i < this.objects.length) {
      object = this.objects[i];
      if (object.disposed) {
        this.removeObject(object);
      } else {
        if (object.active) {
          object.update();
        }
        i++;
      }
    }
    return null;
  };

  return ObjectManager;

})();

gs.ObjectManager = ObjectManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7OztFQU1BLGFBQUMsQ0FBQSxPQUFELEdBQVU7OztBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQmEsdUJBQUE7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7RUFsQ0o7OztBQW9DYjs7Ozs7OzBCQUtBLE9BQUEsR0FBUyxTQUFBO0FBQ0wsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7TUFDSSxJQUFHLENBQUksTUFBTSxDQUFDLFFBQWQ7cUJBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQSxHQURKO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFESzs7O0FBS1Q7Ozs7OzswQkFLQSxjQUFBLEdBQWdCLFNBQUE7QUFDWixRQUFBO0lBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFdBQWI7QUFDUDtTQUFBLHNDQUFBOztNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLENBQUE7TUFDdEIsSUFBRyxNQUFBLElBQVcsQ0FBSSxNQUFNLENBQUMsUUFBekI7cUJBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQSxHQURKO09BQUEsTUFBQTs2QkFBQTs7QUFGSjs7RUFGWTs7O0FBT2hCOzs7Ozs7MEJBS0EsY0FBQSxHQUFnQixTQUFDLE1BQUQ7SUFDWixJQUFHLGlCQUFIO01BQ0ksSUFBRyxDQUFDLElBQUMsQ0FBQSxXQUFZLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBakI7UUFDSSxJQUFDLENBQUEsV0FBWSxDQUFBLE1BQU0s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LENBQTZCLE1BQTdCLEVBSko7O0VBRFE7OztBQU9aOzs7Ozs7OzswQkFPQSxjQUFBLEdBQWdCLFNBQUMsS0FBRDtXQUFXLElBQUMsQ0FBQSxlQUFnQixDQUFBLEtBQUEsQ0FBakIsSUFBMkI7RUFBdEM7OztBQUdoQjs7Ozs7OzBCQUtBLE1BQUEsR0FBUSxTQUFBO0FBQ0osUUFBQTtJQUFBLENBQUEsR0FBSTtJQUVKLElBQUcsSUFBQyxDQUFBLFNBQUo7TUFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxTQUFDLENBQUQsRUFBSSxDQUFKO1FBQ1YsSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxLQUFmO0FBQ0ksaUJBQU8sRUFEWDtTQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxLQUFmO0FBQ0QsaUJBQU8sQ0FBQyxFQURQO1NBQUEsTUFBQTtBQUdELGlCQUFPLEVBSE47O01BSEssQ0FBZDtNQU9BLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFSakI7O0FBVUEsV0FBTSxDQUFBLEdBQUksSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFuQjtNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUE7TUFDbEIsSUFBRyxNQUFNLENBQUMsUUFBVjtRQUNJLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQURKO09BQUEsTUFBQTtRQUdJLElBQW1CLE1BQU0sQ0FBQyxNQUExQjtVQUFBLE1BQU0sQ0FBQyxNQUFQLENBQUEsRUFBQTs7UUFDQSxDQUFBLEdBSko7O0lBRko7QUFRQSxXQUFPO0VBckJIOzs7Ozs7QUF1QlosRUFBRSxDQUFDLGFBQUgsR0FBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdE1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdE1hbmFnZXJcbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgdGhlIGN1cnJlbnQgZGVmYXVsdCBPYmplY3RNYW5hZ2VyLlxuICAgICogQHByb3BlcnR5IGN1cnJlbnRcbiAgICAqIEB0eXBlIGdzLk9iamVjdE1hbmFnZXJcbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgXG4gICAgQGN1cnJlbnQ6IG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBNYW5hZ2VzIGdhbWUgb2JqZWN0cyBieSB1cGRhdGluZyBpZiBuZWNlc3NhcnkgYW5kIG9mZmVyaW5nXG4gICAgKiBtZXRob2RzIHRvIGFkZCBvciByZW1vdmUgZ2FtZSBvYmplY3RzLiBBbGwgZ2FtZSBvYmplY3RzIGFyZSBzb3J0ZWQgYnlcbiAgICAqIHRoZSBvcmRlci1wcm9wZXJ0eSB0byBnaXZlIGNvbnRyb2wgb3ZlciB0aGUgdXBkYXRlLW9yZGVyLlxuICAgICpcbiAgICAqIEEgZ2FtZSBvYmplY3QgY2FuIHJlZ2lzdGVyZWQgdW5kZXIgYSB1bmlxdWUgSUQgYW5kIHRoZW4gZWFzaWx5IGFjY2Vzc2VkIHVzaW5nXG4gICAgKiB0aGF0IElELiBJZiBhbiBvYmplY3QgZ2V0cyByZWdpc3RlcmVkLCBhIGdsb2JhbCB2YXJpYWJsZSAkPElEPiBpcyBjcmVhdGVkXG4gICAgKiBhcyB3ZWxsLiBIb3dldmVyLCB0aGF0IGdsb2JhbCB2YXJpYWJsZSBpcyBvbmx5IGZvciB0aGUgdXNlIGluIHByb3BlcnR5LWJpbmRpbmdzXG4gICAgKiB1c2VkIGZvciBJbi1HYW1lIFVJLiBTZWUgdWkuQ29tcG9uZW50X0JpbmRpbmdIYW5kbGVyLlxuICAgICpcbiAgICAqIEluIGFkZGl0aW9uLCBhIGdhbWUgb2JqZWN0IGNhbiBiZSBhc3NpZ25lZCB0byBhIGdyb3VwIGxpa2UgZm9yIGV4YW1wbGVcbiAgICAqIGEgc2V0IG9mIFVJIHRvZ2dsZS1idXR0b25zIGNhbiBiZSBhc3NpZ25lZCB0byB0aGUgc2FtZSBncm91cCBhbmQgdGhlblxuICAgICogZWFzaWx5IGFjY2Vzc2VkIGxhdGVyIHVzaW5nIGdzLk9iamVjdE1hbmFnZXIub2JqZWN0c0J5R3JvdXAgbWV0aG9kLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RNYW5hZ2VyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHNlZSB1aS5Db21wb25lbnRfQmluZGluZ0hhbmRsZXJcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBnYW1lIG9iamVjdHMgdG8gbWFuYWdlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBvYmplY3RzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0Jhc2VbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBvYmplY3RzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgZ2FtZSBvYmplY3RzIGJ5IElELlxuICAgICAgICAqIEBwcm9wZXJ0eSBvYmplY3RzQnlJZFxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBvYmplY3RzQnlJZCA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIGdhbWUgb2JqZWN0cyBieSBncm91cC5cbiAgICAgICAgKiBAcHJvcGVydHkgb2JqZWN0c0J5R3JvdXBfXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjIyBcbiAgICAgICAgQG9iamVjdHNCeUdyb3VwXyA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBPYmplY3RNYW5hZ2VyIGlzIGFjdGl2ZS4gSWYgPGI+ZmFsc2U8L2I+IHRoZSBnYW1lIG9iamVjdHMgYXJlIG5vdCB1cGRhdGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjIyBcbiAgICAgICAgQGFjdGl2ZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgT2JqZWN0TWFuYWdlciBuZWVkcyB0byBzb3J0IHRoZSBnYW1lIG9iamVjdHMuXG4gICAgICAgICogQHByb3BlcnR5IGFjdGl2ZVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjIFxuICAgICAgICBAbmVlZHNTb3J0ID0geWVzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBtYW5hZ2VyIGFuZCBhbGwgYXNzaWduZWQgZ2FtZSBvYmplY3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIGZvciBvYmplY3QgaW4gQG9iamVjdHNcbiAgICAgICAgICAgIGlmIG5vdCBvYmplY3QuZGlzcG9zZWRcbiAgICAgICAgICAgICAgICBvYmplY3QuZGlzcG9zZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIGFsbCBhc3NpZ25lZCBnYW1lIG9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlT2JqZWN0c1xuICAgICMjIyAgICAgICAgICAgXG4gICAgZGlzcG9zZU9iamVjdHM6IC0+XG4gICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhAb2JqZWN0c0J5SWQpXG4gICAgICAgIGZvciBrIGluIGtleXNcbiAgICAgICAgICAgIG9iamVjdCA9IEBvYmplY3RzQnlJZFtrXVxuICAgICAgICAgICAgaWYgb2JqZWN0IGFuZCBub3Qgb2JqZWN0LmRpc3Bvc2VkXG4gICAgICAgICAgICAgICAgb2JqZWN0LmRpc3Bvc2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlZ2lzdGVycyBhbiBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCByZWdpc3Rlck9iamVjdFxuICAgICMjI1xuICAgIHJlZ2lzdGVyT2JqZWN0OiAob2JqZWN0KSAtPlxuICAgICAgICBpZiBvYmplY3QuaWQ/XG4gICAgICAgICAgICBpZiAhQG9iamVjdHNCeUlkW29iamVjdC5pZF1cbiAgICAgICAgICAgICAgICBAb2JqZWN0c0J5SWRbb2JqZWN0LmlkXSA9IFtdXG4gICAgICAgICAgICBAb2JqZWN0c0J5SWRbb2JqZWN0LmlkXS5wdXNoKG9iamVjdClcbiAgICAgICAgICAgICMgRklYTUU6IFNob3VsZCBiZSBoYW5kbGVkIGJ5IFVpTWFuYWdlciBzaW5jZSBpdCBpcyBVSSBzcGVjaWZpYy5cbiAgICAgICAgICAgIHdpbmRvd1tcIiRcIitvYmplY3QuaWRdID0gb2JqZWN0XG4gICAgXG4gICAgIyMjKlxuICAgICogVW5yZWdpc3RlcnMgYW4gb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdW5yZWdpc3Rlck9iamVjdFxuICAgICMjIyAgICAgICAgXG4gICAgdW5yZWdpc3Rlck9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgaWYgb2JqZWN0Py5pZD9cbiAgICAgICAgICAgIG9iamVjdHMgPSBAb2JqZWN0c0J5SWRbb2JqZWN0LmlkXVxuICAgICAgICAgICAgaWYgb2JqZWN0c1xuICAgICAgICAgICAgICAgIG9iamVjdHMucmVtb3ZlKG9iamVjdClcbiAgICAgICAgICAgICAgICBpZiBvYmplY3RzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93W1wiJFwiK29iamVjdC5pZF0gPSBvYmplY3RzLmxhc3QoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvd1tcIiRcIitvYmplY3QuaWRdXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgdGhlIG1hbmFnZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjICAgICAgICBcbiAgICBhZGRPYmplY3Q6IChvYmplY3QpIC0+IEBhZGQob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBnYW1lIG9iamVjdCB0byB0aGUgbWFuYWdlci4gVGhlIGdhbWUgb2JqZWN0IGlzIHRoZW4gbm8gbG9uZ2VyIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBvciBkaXNwb3NlZCBieSB0aGUgbWFuYWdlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlbW92ZU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHJlbW92ZS5cbiAgICAjIyMgICAgICAgIFxuICAgIHJlbW92ZU9iamVjdDogKG9iamVjdCkgLT4gQHJlbW92ZShvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgdGhlIG1hbmFnZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjIFxuICAgIGFkZDogKG9iamVjdCkgLT4gXG4gICAgICAgICNAb2JqZWN0cy5zcGxpY2UoMCwgMCwgb2JqZWN0KVxuICAgICAgICBAb2JqZWN0cy5wdXNoKG9iamVjdClcbiAgICAgICAgQG5lZWRzU29ydCA9IHllc1xuICAgICAgICBAcmVnaXN0ZXJPYmplY3Qob2JqZWN0KVxuICAgICAgICBAYWRkVG9Hcm91cChvYmplY3QsIG9iamVjdC5ncm91cClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBubyBsb25nZXIgYXV0b21hdGljYWxseSB1cGRhdGVkIG9yIGRpc3Bvc2VkIGJ5IHRoZSBtYW5hZ2VyLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gcmVtb3ZlLlxuICAgICMjIyBcbiAgICByZW1vdmU6IChvYmplY3QpIC0+IFxuICAgICAgICBpZiBvYmplY3RcbiAgICAgICAgICAgIEBvYmplY3RzLnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICBAdW5yZWdpc3Rlck9iamVjdChvYmplY3QpXG4gICAgICAgICAgICBpZiBvYmplY3QuZ3JvdXA/XG4gICAgICAgICAgICAgICAgQG9iamVjdHNCeUdyb3VwW29iamVjdC5ncm91cF0/LnJlbW92ZShvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyBhbiBvYmplY3QgYnkgSUQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvYmplY3RCeUlkXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgSUQgb2YgdGhlIGdhbWUgb2JqZWN0IHRvIGdldC4gXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfQmFzZX0gVGhlIGdhbWUgb2JqZWN0IG9yIDxiPm51bGw8L2I+IGlmIG5vIGdhbWUgb2JqZWN0IGlzIHJlZ2lzdGVyZWQgZm9yIHRoZSBzcGVjaWZpZWQgSUQuXG4gICAgIyMjICAgICAgICAgXG4gICAgb2JqZWN0QnlJZDogKGlkKSAtPiBAb2JqZWN0c0J5SWRbaWRdPy5sYXN0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIGFuIG9iamVjdCBieSBJRC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJ5SWRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZ2FtZSBvYmplY3QgdG8gZ2V0LiBcbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9CYXNlfSBUaGUgZ2FtZSBvYmplY3Qgb3IgPGI+bnVsbDwvYj4gaWYgbm8gZ2FtZSBvYmplY3QgaXMgcmVnaXN0ZXJlZCBmb3IgdGhlIHNwZWNpZmllZCBJRC5cbiAgICAjIyMgXG4gICAgYnlJZDogKGlkKSAtPiBAb2JqZWN0c0J5SWRbaWRdPy5sYXN0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSBvYmplY3QgZm9yIGFuIElELlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0T2JqZWN0QnlJZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNldC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBJRCBmb3IgdGhlIGdhbWUgb2JqZWN0LiBcbiAgICAjIyMgXG4gICAgc2V0T2JqZWN0QnlJZDogKG9iamVjdCwgaWQpIC0+IFxuICAgICAgICBpZiAhaWQgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIG9iamVjdC5pZCA9IGlkXG4gICAgICAgIGlmICFAb2JqZWN0c0J5SWRbaWRdXG4gICAgICAgICAgICBAb2JqZWN0c0J5SWRbaWRdID0gW29iamVjdF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdHNCeUlkW2lkXS5wdXNoKG9iamVjdClcbiAgICAgICAgICAgIFxuICAgICAgICB3aW5kb3dbXCIkXCIraWRdID0gb2JqZWN0XG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhbiBvYmplY3QgdG8gYSBzcGVjaWZpZWQgb2JqZWN0LWdyb3VwLlxuICAgICpcbiAgICAqIEBtZXRob2QgYWRkVG9Hcm91cFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGFkZC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCAtIFRoZSBncm91cCB0byBhc3NpZ24gZ2FtZSBvYmplY3QgdG8uIFxuICAgICMjIyBcbiAgICBhZGRUb0dyb3VwOiAob2JqZWN0LCBncm91cCkgLT5cbiAgICAgICAgaWYgZ3JvdXA/XG4gICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW29iamVjdC5ncm91cF0/LnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICBpZiAhQG9iamVjdHNCeUdyb3VwX1tncm91cF1cbiAgICAgICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW2dyb3VwXSA9IFtdXG4gICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW2dyb3VwXS5wdXNoKG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIGFsbCBvYmplY3Qgb2YgYSBzcGVjaWZpZWQgb2JqZWN0LWdyb3VwLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb2JqZWN0c0J5R3JvdXBcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCAtIFRoZSBvYmplY3QtZ3JvdXAuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfQmFzZVtdfSBUaGUgZ2FtZSBvYmplY3RzIGJlbG9uZ2luZyB0byB0aGUgc3BlY2lmaWVkIGdyb3VwLlxuICAgICMjIyAgICAgICAgIFxuICAgIG9iamVjdHNCeUdyb3VwOiAoZ3JvdXApIC0+IEBvYmplY3RzQnlHcm91cF9bZ3JvdXBdIHx8IFtdXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgbWFuYWdlciBhbmQgYWxsIGFzc2lnbmVkIGdhbWUgb2JqZWN0cyBpbiB0aGUgcmlnaHQgb3JkZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgIFxuICAgIHVwZGF0ZTogLT4gXG4gICAgICAgIGkgPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBAbmVlZHNTb3J0XG4gICAgICAgICAgICBAb2JqZWN0cy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgICAgIGlmIGEub3JkZXIgPCBiLm9yZGVyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBhLm9yZGVyID4gYi5vcmRlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICBAbmVlZHNTb3J0ID0gbm9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgaSA8IEBvYmplY3RzLmxlbmd0aFxuICAgICAgICAgICAgb2JqZWN0ID0gQG9iamVjdHNbaV1cbiAgICAgICAgICAgIGlmIG9iamVjdC5kaXNwb3NlZFxuICAgICAgICAgICAgICAgIEByZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBvYmplY3QudXBkYXRlKCkgaWYgb2JqZWN0LmFjdGl2ZVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuZ3MuT2JqZWN0TWFuYWdlciA9IE9iamVjdE1hbmFnZXIgI25ldyBPYmplY3RNYW5hZ2VyKCkiXX0=
//# sourceURL=ObjectManager_2.js