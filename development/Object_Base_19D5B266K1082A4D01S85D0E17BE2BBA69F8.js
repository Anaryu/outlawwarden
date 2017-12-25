var Object_Base;

Object_Base = (function() {

  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */
  Object_Base.prototype.onDataBundleRestore = function(data, context) {
    if (this.id) {
      return window["$" + this.id] = this;
    }
  };

  Object_Base.accessors("group", {
    set: function(g) {
      var ref;
      this.group_ = g;
      return (ref = gs.ObjectManager.current) != null ? ref.addToGroup(this, g) : void 0;
    },
    get: function() {
      return this.group_;
    }
  });

  Object_Base.accessors("order", {
    set: function(o) {
      var ref;
      if (o !== this.order_) {
        this.order_ = o;
        return (ref = this.parent) != null ? ref.needsSort = true : void 0;
      }
    },
    get: function() {
      return this.order_;
    }
  });

  Object_Base.accessors("needsUpdate", {
    set: function(v) {
      var parent;
      this.needsUpdate_ = v;
      parent = this.parent;
      while (parent) {
        parent.needsUpdate_ = true;
        parent = parent.parent;
      }
      if (v) {
        return this.requestSubUpdate();
      }
    },
    get: function() {
      return this.needsUpdate_ || SceneManager.scene.preparing;
    }
  });

  Object_Base.prototype.requestSubUpdate = function() {
    var j, len, object, ref;
    ref = this.subObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (object) {
        object.needsUpdate_ = true;
        object.requestSubUpdate();
      }
    }
    return null;
  };

  Object_Base.accessors("needsFullUpdate", {
    set: function(v) {
      var j, len, object, ref, results;
      this.needsUpdate = v;
      if (v) {
        ref = this.subObjects;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          object = ref[j];
          results.push(object.needsFullUpdate = v);
        }
        return results;
      }
    },
    get: function() {
      return this.needsUpdate_;
    }
  });


  /**
  * The base class for all game objects. A game object itself doesn't implement
  * any game logic but uses components and sub-objects for that.
  *
  * @module gs
  * @class Object_Base
  * @memberof gs
  * @constructor
   */

  function Object_Base() {

    /**
    * @property subObjects
    * @type gs.Object_Base[]
    * @default []
    * A list of game-objects grouped under this game object.
     */
    var ref;
    this.subObjects = [];

    /**
    * @property components
    * @type gs.Component[]
    * @default []
    * A list of components defining the logic/behavior and appearance of the game object.
     */
    this.components = [];

    /**
    * @property componentsById
    * @type Object
    * @default []
    * All associated components by their ID.
     */
    this.componentsById = {};

    /**
    * @property disposed
    * @type boolean
    * @default false
    * Indicates if the game object id disposed. A disposed game object cannot be used anymore.
     */
    this.disposed = false;

    /**
    * @property active
    * @default true
    * Indicates if the game object is active. An inactive game object will not be updated.
     */
    this.active = true;
    this.input = false;

    /**
    * @property id
    * @type string
    * @default null
    * The game object's UID (Unique ID)
     */
    this.id = null;

    /**
    * @property group
    * @default null
    * @type string
    * The game object's group. To get all object's of a specific group the gs.ObjectManager.objectsByGroup property can be used.
     */
    this.group = null;

    /**
    * @property parent
    * @type gs.Object_Base
    * @default null
    * The parent object if the game object is a sub-object of another game object.
     */
    this.parent = null;

    /**
    * @property order
    * @type number
    * @default 0
    * Controls the update-order. The smaller the value the earlier the game object is updated before other game objects are updated.
     */
    this.order = 0;

    /**
    * @property rIndex
    * @type number
    * @default 0
    * Holds the render-index if the game object has a graphical representation on screen. The render-index is the
    * index of the game object's graphic-object(gs.GraphicObject) in the current list of graphic-objects. The render-index
    * is read-only. Setting the render-index to a certain value has no effect.
     */
    this.rIndex = 0;

    /**
    * @property needsSort
    * @type boolean
    * @default true
    * Indicates if the list of sub-objects needs to be sorted by order because of a change.
     */
    this.needsSort = true;

    /**
    * @property needsSort
    * @type boolean
    * @default true
    * Indicates if the UI object needs to be updated.
     */
    this.needsUpdate = true;

    /**
    * @property initialized
    * @type boolean
    * @default true
    * Indicates if the game object and its components have been initialized.
     */
    this.initialized = false;

    /**
    * @property customData
    * @type Object
    * @default {}
    * A custom data object which can be used to add any custom data/fields to the game
    * object. It is an empty object by default.
     */
    this.customData = {};
    if ((ref = gs.ObjectManager.current) != null) {
      ref.registerObject(this);
    }
  }


  /**
  * Disposes the object with all its components and sub-objects. A disposed object will be
  * removed from the parent automatically.
  *
  * @method dispose
   */

  Object_Base.prototype.dispose = function() {
    var ref;
    if (!this.disposed) {
      this.disposed = true;
      this.disposeComponents();
      this.disposeObjects();
      if ((ref = gs.ObjectManager.current) != null) {
        ref.unregisterObject(this);
      }
    }
    return null;
  };


  /**
  * Disposes all sub-objects.
  *
  * @method disposeObjects
  * @protected
   */

  Object_Base.prototype.disposeObjects = function() {
    var j, len, ref, results, subObject;
    ref = this.subObjects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      subObject = ref[j];
      results.push(subObject != null ? typeof subObject.dispose === "function" ? subObject.dispose() : void 0 : void 0);
    }
    return results;
  };


  /**
  * Disposes all components
  *
  * @method disposeComponents
  * @protected
   */

  Object_Base.prototype.disposeComponents = function() {
    var component, j, len, ref, results;
    ref = this.components;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      results.push(component != null ? typeof component.dispose === "function" ? component.dispose() : void 0 : void 0);
    }
    return results;
  };


  /**
  * Calls setup-routine on all components.
  *
  * @method setup
   */

  Object_Base.prototype.setup = function() {
    var component, j, len, ref;
    ref = this.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (!(component != null ? component.isSetup : void 0)) {
        component.setup();
      }
    }
    this.initialized = true;
    return null;
  };


  /**
  * Deserializes components from a data-bundle object.
  * 
  * @method componentsFromDataBundle
  * @param {Object} data The data-bundle object.
   */

  Object_Base.prototype.componentsFromDataBundle = function(data) {
    var component, componentObject, j, len, ref;
    if (data != null ? data.components : void 0) {
      ref = data.components;
      for (j = 0, len = ref.length; j < len; j++) {
        component = ref[j];
        componentObject = new gs[component.className](component);
        this.addComponent(componentObject);
      }
      delete data.components;
    }
    return null;
  };


  /**
  * Serializes components of a specified type to a data-bundle. A component
  * needs to implement the toDataBundle method for correct serialization.
  *
  * @method componentsToDataBundle
  * @param {String} type - A component class name.
  * @return A data bundle.
   */

  Object_Base.prototype.componentsToDataBundle = function(type) {
    var bundle, component, components, j, len, ref;
    components = [];
    ref = this.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (component instanceof type) {
        if (component.toDataBundle == null) {
          continue;
        }
        bundle = component.toDataBundle();
        bundle.className = component.constructor.name;
        components.push(bundle);
      }
    }
    return components;
  };


  /**
  * Starts a full-refresh on all sub-objects
  *
  * @method fullRefresh
   */

  Object_Base.prototype.fullRefresh = function() {
    var j, len, object, ref;
    ref = this.subObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (object) {
        object.needsUpdate = true;
        object.fullRefresh();
      }
    }
    return null;
  };


  /**
  * Updates the object with all parent- and sub-objects. 
  *
  * @method fullUpdate
   */

  Object_Base.prototype.fullUpdate = function() {
    var j, len, object, parent, ref, results;
    parent = this;
    while (parent !== null) {
      parent.update();
      parent = parent.parent;
    }
    ref = this.subObjects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      results.push(object != null ? object.update() : void 0);
    }
    return results;
  };


  /**
  * Updates the object and all its components. This method is
  * called automatically by the parent or ObjectManager so in regular it is 
  * not necessary to call it manually.
  *
  * @method update
   */

  Object_Base.prototype.update = function() {
    var component, i;
    if (!this.active) {
      return;
    }
    i = 0;
    while (i < this.components.length) {
      component = this.components[i];
      if (!component.disposed) {
        component.update();
        i++;
      } else {
        this.components.splice(i, 1);
      }
    }
    if (this.input) {
      Input.clear();
    }
    this.input = false;
    return null;
  };


  /**
  * Searches for the first component with the specified class name.
  *
  * @method findComponent
  * @param {String} name The class name of the component.
  * @return {Component} The component or null if a component with the specified class name cannot be found.
   */

  Object_Base.prototype.findComponent = function(name) {
    return this.components.first(function(v) {
      return v.constructor.name === name;
    });
  };


  /**
  * Searches for all components with the specified class name.
  *
  * @method findComponents
  * @param {String} name The class name of the components.
  * @return {Array} The components or null if no component with the specified class name has been found.
   */

  Object_Base.prototype.findComponents = function(name) {
    return this.components.where(function(v) {
      return v.constructor.name === name;
    });
  };


  /**
  * Searches for the component with the specified ID.
  *
  * @method findComponentById
  * @param {String} id The unique identifier of the component.
  * @return {Component} The component or null if a component with the specified ID cannot be found.
   */

  Object_Base.prototype.findComponentById = function(id) {
    return this.componentsById[id];
  };


  /**
  * Adds an object to the list of sub-objects.
  *
  * @method addObject
  * @param {Object_Base} object The object which should be added.
   */

  Object_Base.prototype.addObject = function(object) {
    var ref, ref1;
    if ((ref = gs.ObjectManager.current) != null) {
      ref.remove(object);
    }
    if ((ref1 = object.parent) != null) {
      ref1.removeObject(object);
    }
    object.parent = this;
    this.subObjects.push(object);
    this.needsSort = true;
    this.needsUpdate = true;
    if (object.id != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Inserts an object into the list of sub-objects at the specified index.
  *
  * @method insertObject
  * @param {Object_Base} object The object which should be inserted.
  * @param {Number} index The index.
   */

  Object_Base.prototype.insertObject = function(object, index) {
    var ref;
    gs.ObjectManager.current.remove(object);
    if ((ref = object.parent) != null) {
      ref.removeObject(object);
    }
    object.parent = this;
    this.subObjects.splice(index, 0, object);
    if (object.id != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Sets sub-object at the specified index.
  *
  * @method setObject
  * @param {Object_Base} object The object.
  * @param {Number} index The index.
   */

  Object_Base.prototype.setObject = function(object, index) {
    var ref;
    if (object) {
      gs.ObjectManager.current.remove(object);
      if ((ref = object.parent) != null) {
        ref.removeObject(object);
      }
      object.parent = this;
    }
    this.subObjects[index] = object;
    if ((object != null ? object.id : void 0) != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Removes the specified object from the list of sub-objects.
  *
  * @method removeObject
  * @param {Object_Base} object The object which should be removed.
   */

  Object_Base.prototype.removeObject = function(object) {
    this.subObjects.remove(object);
    object.parent = null;
    return this.needsUpdate = true;
  };


  /**
  * Erases the object at the specified index. The list size
  * will not be changed but the the value at the index will be set to null.
  *
  * @method eraseObject
  * @param {Number} object The object which should be erased.
   */

  Object_Base.prototype.eraseObject = function(index) {
    var object;
    object = this.subObjects[index];
    if (object != null) {
      object.parent = null;
    }
    return this.subObjects[index] = null;
  };


  /**
  * Adds the specified component to the object.
  *
  * @method addComponent
  * @param {Component} component The component
  * @param {String} id An optional unique identifier for the component.
   */

  Object_Base.prototype.addComponent = function(component, id) {
    if (!this.components.contains(component)) {
      component.object = this;
      this.components.push(component);
      if (id != null) {
        return this.componentsById[id] = component;
      }
    }
  };


  /**
  * Inserts a component at the specified index.
  *
  * @method insertComponent
  * @param {Component} component The component.
  * @param {Number} index The index.
  * @param {String} id An optional unique identifier for the component.
   */

  Object_Base.prototype.insertComponent = function(component, index, id) {
    this.components.remove(component);
    component.object = this;
    this.components.splice(index, 0, component);
    if (id != null) {
      return this.componentsById[id] = component;
    }
  };


  /**
  * Removes a component from the object.
  *
  * @method removeComponent
  * @param {Component} component The component to remove.
   */

  Object_Base.prototype.removeComponent = function(component) {
    this.components.remove(component);
    if (typeof id !== "undefined" && id !== null) {
      return delete this.componentsById[id];
    }
  };

  return Object_Base;

})();

gs.Object_Base = Object_Base;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O3dCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7SUFDakIsSUFBRyxJQUFDLENBQUEsRUFBSjthQUNJLE1BQU8sQ0FBQSxHQUFBLEdBQUksSUFBQyxDQUFBLEVBQUwsQ0FBUCxHQUFrQixLQUR0Qjs7RUFEaUI7O0VBV3JCLFdBQUMsQ0FBQSxTQUFELENBQVcsT0FBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsQ0FBRDtBQUNELFVBQUE7TUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVOzJEQUNjLENBQUUsVUFBMUIsQ0FBcUMsSUFBckMsRUFBMkMsQ0FBM0M7SUFGQyxDQUFMO0lBSUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQUpMO0dBREo7O0VBY0EsV0FBQyxDQUFBLFNBQUQsQ0FBVyxPQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO0FBQ0QsVUFBQTtNQUFBLElBQUcsQ0FBQSxLQUFLLElBQUMsQ0FBQSxNQUFUO1FBQ0ksSUFBQyxDQUFBLE1BQUQsR0FBVTtnREFDSCxDQUFFLFNBQVQsR0FBcUIsY0FGekI7O0lBREMsQ0FBTDtJQUlBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FKTDtHQURKOztFQWVBLFdBQUMsQ0FBQSxTQUFELENBQVcsYUFBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsQ0FBRDtBQUNELFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUVoQixNQUFBLEdBQVMsSUFBQyxDQUFBO0FBQ1YsYUFBTSxNQUFOO1FBQ0ksTUFBTSxDQUFDLFlBQVAsR0FBc0I7UUFDdEIsTUFBQSxHQUFTLE1BQU0sQ0FBQztNQUZwQjtNQVNBLElBQUcsQ0FBSDtlQUNJLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBREo7O0lBYkMs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LFNBQUMsS0FBRDtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFVBQVcsQ0FBQSxLQUFBOztNQUNyQixNQUFNLENBQUUsTUFBUixHQUFpQjs7V0FDakIsSUFBQyxDQUFBLFVBQVcsQ0FBQSxLQUFBLENBQVosR0FBcUI7RUFIWjs7O0FBS2I7Ozs7Ozs7O3dCQU9BLFlBQUEsR0FBYyxTQUFDLFNBQUQsRUFBWSxFQUFaO0lBQ1YsSUFBRyxDQUFJLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixTQUFyQixDQUFQO01BQ0ksU0FBUyxDQUFDLE1BQVYsR0FBbUI7TUFDbkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFNBQWpCO01BQ0EsSUFBRyxVQUFIO2VBQ0ksSUFBQyxDQUFBLGNBQWUsQ0FBQSxFQUFBLENBQWhCLEdBQXNCLFVBRDFCO09BSEo7O0VBRFU7OztBQU1kOzs7Ozs7Ozs7d0JBUUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLEVBQW5CO0lBQ2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLFNBQW5CO0lBQ0EsU0FBUyxDQUFDLE1BQVYsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBQTZCLFNBQTdCO0lBQ0EsSUFBRyxVQUFIO2FBQ0ksSUFBQyxDQUFBLGNBQWUsQ0FBQSxFQUFBLENBQWhCLEdBQXNCLFVBRDFCOztFQUphOzs7QUFPakI7Ozs7Ozs7d0JBTUEsZUFBQSxHQUFpQixTQUFDLFNBQUQ7SUFDYixJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsU0FBbkI7SUFDQSxJQUFHLHdDQUFIO2FBQ0ksT0FBTyxJQUFDLENBQUEsY0FBZSxDQUFBLEVBQUEsRUFEM0I7O0VBRmE7Ozs7OztBQUtyQixFQUFFLENBQUMsV0FBSCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogT2JqZWN0X0Jhc2VcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9CYXNlXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIGlmIEBpZFxuICAgICAgICAgICAgd2luZG93W1wiJFwiK0BpZF0gPSB0aGlzXG4gICAgICAgICAgICBcbiAgICBcbiAgICAjXG4gICAgIyBHZXRzIG9yIHNldHMgdGhlIGdyb3VwIHRoZSBvYmplY3QgYmVsb25ncyB0by5cbiAgICAjXG4gICAgIyBAcHJvcGVydHkgZ3JvdXBcbiAgICAjIEB0eXBlIHN0cmluZ1xuICAgICNcbiAgICBAYWNjZXNzb3JzIFwiZ3JvdXBcIiwgXG4gICAgICAgIHNldDogKGcpIC0+IFxuICAgICAgICAgICAgQGdyb3VwXyA9IGdcbiAgICAgICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudD8uYWRkVG9Hcm91cCh0aGlzLCBnKVxuICAgICAgICAgICAgXG4gICAgICAgIGdldDogLT4gQGdyb3VwX1xuICAgICAgICBcbiAgICAjXG4gICAgIyBHZXRzIG9yIHNldHMgdGhlIG9yZGVyLWluZGV4IG9mIHRoZSBvYmplY3QuIFRoZSBsb3dlciB0aGUgaW5kZXgsIHRoZVxuICAgICMgZWFybGllciB0aGUgb2JqZWN0IHdpbGwgYmUgdXBkYXRlZCBpbiBhIGxpc3Qgb2Ygc3ViLW9iamVjdHMuXG4gICAgI1xuICAgICMgQHByb3BlcnR5IG9yZGVyXG4gICAgIyBAdHlwZSBudW1iZXJcbiAgICAjXG4gICAgQGFjY2Vzc29ycyBcIm9yZGVyXCIsXG4gICAgICAgIHNldDogKG8pIC0+XG4gICAgICAgICAgICBpZiBvICE9IEBvcmRlcl9cbiAgICAgICAgICAgICAgICBAb3JkZXJfID0gb1xuICAgICAgICAgICAgICAgIEBwYXJlbnQ/Lm5lZWRzU29ydCA9IHRydWVcbiAgICAgICAgZ2V0OiAtPiBAb3JkZXJfXG4gICAgICAgIFxuICAgICNcbiAgICAjIEdldHMgb3Igc2V0cyBpZiBhbiBvYmplY3RzIG5lZWRzIGFuIHVwZGF0ZS4gSWYgdHJ1ZSwgdGhlIHBhcmVudCB3aWxsIHVwZGF0ZVxuICAgICMgdGhlIG9iamVjdCBpbiB0aGUgbmV4dCB1cGRhdGUgYW5kIHJlc2V0cyB0aGUgbmVlZHNVcGRhdGUgcHJvcGVydHkgYmFja1xuICAgICMgdG8gZmFsc2UuXG4gICAgI1xuICAgICMgQHByb3BlcnR5IG5lZWRzVXBkYXRlXG4gICAgIyBAdHlwZSBib29sZWFuXG4gICAgI1xuICAgIEBhY2Nlc3NvcnMgXCJuZWVkc1VwZGF0ZVwiLCBcbiAgICAgICAgc2V0OiAodikgLT5cbiAgICAgICAgICAgIEBuZWVkc1VwZGF0ZV8gPSB2XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmVudCA9IEBwYXJlbnRcbiAgICAgICAgICAgIHdoaWxlIHBhcmVudFxuICAgICAgICAgICAgICAgIHBhcmVudC5uZWVkc1VwZGF0ZV8gPSB5ZXNcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjaWYgdlxuICAgICAgICAgICAgIyAgICBAcGFyZW50Py5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgI2lmIHZcbiAgICAgICAgICAgICMgICAgZm9yIG9iamVjdCBpbiBAc3ViT2JqZWN0c1xuICAgICAgICAgICAgIyAgICAgICAgb2JqZWN0Lm5lZWRzVXBkYXRlXyA9IHZcbiAgICAgICAgICAgIGlmIHZcbiAgICAgICAgICAgICAgICBAcmVxdWVzdFN1YlVwZGF0ZSgpXG4gICAgICAgIGdldDogLT4gcmV0dXJuIEBuZWVkc1VwZGF0ZV8gfHwgU2NlbmVNYW5hZ2VyLnNjZW5lLnByZXBhcmluZ1xuICAgICAgICBcbiAgICByZXF1ZXN0U3ViVXBkYXRlOiAtPlxuICAgICAgICBmb3Igb2JqZWN0IGluIEBzdWJPYmplY3RzXG4gICAgICAgICAgICBpZiBvYmplY3RcbiAgICAgICAgICAgICAgICBvYmplY3QubmVlZHNVcGRhdGVfID0geWVzXG4gICAgICAgICAgICAgICAgb2JqZWN0LnJlcXVlc3RTdWJVcGRhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICNcbiAgICAjIEdldHMgb3Igc2V0cyBpZiBhbiBvYmplY3QgbmVlZHMgYSBmdWxsIHVwZGF0ZS4gQSBmdWxsIHVwZGF0ZSB0cmlnZ2Vyc1xuICAgICMgYW4gdXBkYXRlIGZvciBhbGwgc3ViLW9iamVjdHMgcmVjdXJzaXZlbHkuIFxuICAgICNcbiAgICAjIEBwcm9wZXJ0eSBuZWVkc0Z1bGxVcGRhdGVcbiAgICAjIEB0eXBlIGJvb2xlYW5cbiAgICAjXG4gICAgQGFjY2Vzc29ycyBcIm5lZWRzRnVsbFVwZGF0ZVwiLCBcbiAgICAgICAgc2V0OiAodikgLT5cbiAgICAgICAgICAgIEBuZWVkc1VwZGF0ZSA9IHZcbiAgICAgICAgICAgIGlmIHZcbiAgICAgICAgICAgICAgICBmb3Igb2JqZWN0IGluIEBzdWJPYmplY3RzXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5uZWVkc0Z1bGxVcGRhdGUgPSB2XG4gICAgICAgIGdldDogLT4gQG5lZWRzVXBkYXRlX1xuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBnYW1lIG9iamVjdHMuIEEgZ2FtZSBvYmplY3QgaXRzZWxmIGRvZXNuJ3QgaW1wbGVtZW50XG4gICAgKiBhbnkgZ2FtZSBsb2dpYyBidXQgdXNlcyBjb21wb25lbnRzIGFuZCBzdWItb2JqZWN0cyBmb3IgdGhhdC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgT2JqZWN0X0Jhc2VcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgc3ViT2JqZWN0c1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9CYXNlW11cbiAgICAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAgICAqIEEgbGlzdCBvZiBnYW1lLW9iamVjdHMgZ3JvdXBlZCB1bmRlciB0aGlzIGdhbWUgb2JqZWN0LlxuICAgICAgICAjIyNcbiAgICAgICAgQHN1Yk9iamVjdHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRzXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50W11cbiAgICAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAgICAqIEEgbGlzdCBvZiBjb21wb25lbnRzIGRlZmluaW5nIHRoZSBsb2dpYy9iZWhhdmlvciBhbmQgYXBwZWFyYW5jZSBvZiB0aGUgZ2FtZSBvYmplY3QuXG4gICAgICAgICMjI1xuICAgICAgICBAY29tcG9uZW50cyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudHNCeUlkXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQGRlZmF1bHQgW11cbiAgICAgICAgKiBBbGwgYXNzb2NpYXRlZCBjb21wb25lbnRzIGJ5IHRoZWlyIElELlxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbXBvbmVudHNCeUlkID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgZGlzcG9zZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGdhbWUgb2JqZWN0IGlkIGRpc3Bvc2VkLiBBIGRpc3Bvc2VkIGdhbWUgb2JqZWN0IGNhbm5vdCBiZSB1c2VkIGFueW1vcmUuXG4gICAgICAgICMjI1xuICAgICAgICBAZGlzcG9zZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBnYW1lIG9iamVjdCBpcyBhY3RpdmUuIEFuIGluYWN0aXZlIGdhbWUgb2JqZWN0IHdpbGwgbm90IGJlIHVwZGF0ZWQuXG4gICAgICAgICMjI1xuICAgICAgICBAYWN0aXZlID0geWVzXG4gICAgICAgIFxuICAgICAgICBAaW5wdXQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgKiBUaGUgZ2FtZSBvYmplY3QncyBVSUQgKFVuaXF1ZSBJRClcbiAgICAgICAgIyMjXG4gICAgICAgIEBpZCA9IG51bGwgXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGdyb3VwXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIFRoZSBnYW1lIG9iamVjdCdzIGdyb3VwLiBUbyBnZXQgYWxsIG9iamVjdCdzIG9mIGEgc3BlY2lmaWMgZ3JvdXAgdGhlIGdzLk9iamVjdE1hbmFnZXIub2JqZWN0c0J5R3JvdXAgcHJvcGVydHkgY2FuIGJlIHVzZWQuXG4gICAgICAgICMjI1xuICAgICAgICBAZ3JvdXAgPSBudWxsIFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBwYXJlbnRcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQmFzZVxuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgKiBUaGUgcGFyZW50IG9iamVjdCBpZiB0aGUgZ2FtZSBvYmplY3QgaXMgYSBzdWItb2JqZWN0IG9mIGFub3RoZXIgZ2FtZSBvYmplY3QuXG4gICAgICAgICMjI1xuICAgICAgICBAcGFyZW50ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBvcmRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAgKiBDb250cm9scyB0aGUgdXBkYXRlLW9yZGVyLiBUaGUgc21hbGxlciB0aGUgdmFsdWUgdGhlIGVhcmxpZXIgdGhlIGdhbWUgb2JqZWN0IGlzIHVwZGF0ZWQgYmVmb3JlIG90aGVyIGdhbWUgb2JqZWN0cyBhcmUgdXBkYXRlZC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBvcmRlciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgckluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAqIEhvbGRzIHRoZSByZW5kZXItaW5kZXggaWYgdGhlIGdhbWUgb2JqZWN0IGhhcyBhIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiBvbiBzY3JlZW4uIFRoZSByZW5kZXItaW5kZXggaXMgdGhlXG4gICAgICAgICogaW5kZXggb2YgdGhlIGdhbWUgb2JqZWN0J3MgZ3JhcGhpYy1vYmplY3QoZ3MuR3JhcGhpY09iamVjdCkgaW4gdGhlIGN1cnJlbnQgbGlzdCBvZiBncmFwaGljLW9iamVjdHMuIFRoZSByZW5kZXItaW5kZXhcbiAgICAgICAgKiBpcyByZWFkLW9ubHkuIFNldHRpbmcgdGhlIHJlbmRlci1pbmRleCB0byBhIGNlcnRhaW4gdmFsdWUgaGFzIG5vIGVmZmVjdC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBySW5kZXggPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IG5lZWRzU29ydFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBsaXN0IG9mIHN1Yi1vYmplY3RzIG5lZWRzIHRvIGJlIHNvcnRlZCBieSBvcmRlciBiZWNhdXNlIG9mIGEgY2hhbmdlLlxuICAgICAgICAjIyNcbiAgICAgICAgQG5lZWRzU29ydCA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBuZWVkc1NvcnRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgVUkgb2JqZWN0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICMjI1xuICAgICAgICBAbmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaW5pdGlhbGl6ZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZ2FtZSBvYmplY3QgYW5kIGl0cyBjb21wb25lbnRzIGhhdmUgYmVlbiBpbml0aWFsaXplZC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBpbml0aWFsaXplZCA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGN1c3RvbURhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAZGVmYXVsdCB7fVxuICAgICAgICAqIEEgY3VzdG9tIGRhdGEgb2JqZWN0IHdoaWNoIGNhbiBiZSB1c2VkIHRvIGFkZCBhbnkgY3VzdG9tIGRhdGEvZmllbGRzIHRvIHRoZSBnYW1lXG4gICAgICAgICogb2JqZWN0LiBJdCBpcyBhbiBlbXB0eSBvYmplY3QgYnkgZGVmYXVsdC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXN0b21EYXRhID0ge31cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LnJlZ2lzdGVyT2JqZWN0KHRoaXMpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBvYmplY3Qgd2l0aCBhbGwgaXRzIGNvbXBvbmVudHMgYW5kIHN1Yi1vYmplY3RzLiBBIGRpc3Bvc2VkIG9iamVjdCB3aWxsIGJlXG4gICAgKiByZW1vdmVkIGZyb20gdGhlIHBhcmVudCBhdXRvbWF0aWNhbGx5LlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIGlmIG5vdCBAZGlzcG9zZWRcbiAgICAgICAgICAgIEBkaXNwb3NlZCA9IHllc1xuICAgICAgICAgICAgQGRpc3Bvc2VDb21wb25lbnRzKClcbiAgICAgICAgICAgIEBkaXNwb3NlT2JqZWN0cygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LnVucmVnaXN0ZXJPYmplY3QodGhpcylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIGFsbCBzdWItb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VPYmplY3RzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZGlzcG9zZU9iamVjdHM6IC0+XG4gICAgICAgIGZvciBzdWJPYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIHN1Yk9iamVjdD8uZGlzcG9zZT8oKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VDb21wb25lbnRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZGlzcG9zZUNvbXBvbmVudHM6IC0+XG4gICAgICAgIGZvciBjb21wb25lbnQgaW4gQGNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudD8uZGlzcG9zZT8oKVxuICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxzIHNldHVwLXJvdXRpbmUgb24gYWxsIGNvbXBvbmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBmb3IgY29tcG9uZW50IGluIEBjb21wb25lbnRzXG4gICAgICAgICAgICBjb21wb25lbnQuc2V0dXAoKSBpZiBub3QgY29tcG9uZW50Py5pc1NldHVwXG4gICAgICAgICAgICBcbiAgICAgICAgQGluaXRpYWxpemVkID0geWVzXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERlc2VyaWFsaXplcyBjb21wb25lbnRzIGZyb20gYSBkYXRhLWJ1bmRsZSBvYmplY3QuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgY29tcG9uZW50c0Zyb21EYXRhQnVuZGxlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YS1idW5kbGUgb2JqZWN0LlxuICAgICMjI1xuICAgIGNvbXBvbmVudHNGcm9tRGF0YUJ1bmRsZTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGE/LmNvbXBvbmVudHNcbiAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gZGF0YS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgY29tcG9uZW50T2JqZWN0ID0gbmV3IGdzW2NvbXBvbmVudC5jbGFzc05hbWVdKGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBAYWRkQ29tcG9uZW50KGNvbXBvbmVudE9iamVjdClcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyBjb21wb25lbnRzIG9mIGEgc3BlY2lmaWVkIHR5cGUgdG8gYSBkYXRhLWJ1bmRsZS4gQSBjb21wb25lbnRcbiAgICAqIG5lZWRzIHRvIGltcGxlbWVudCB0aGUgdG9EYXRhQnVuZGxlIG1ldGhvZCBmb3IgY29ycmVjdCBzZXJpYWxpemF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgY29tcG9uZW50c1RvRGF0YUJ1bmRsZVxuICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBBIGNvbXBvbmVudCBjbGFzcyBuYW1lLlxuICAgICogQHJldHVybiBBIGRhdGEgYnVuZGxlLlxuICAgICMjI1xuICAgIGNvbXBvbmVudHNUb0RhdGFCdW5kbGU6ICh0eXBlKSAtPlxuICAgICAgICBjb21wb25lbnRzID0gW11cbiAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBAY29tcG9uZW50c1xuICAgICAgICAgICAgaWYgY29tcG9uZW50IGluc3RhbmNlb2YgdHlwZVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBjb21wb25lbnQudG9EYXRhQnVuZGxlP1xuICAgICAgICAgICAgICAgIGJ1bmRsZSA9IGNvbXBvbmVudC50b0RhdGFCdW5kbGUoKVxuICAgICAgICAgICAgICAgIGJ1bmRsZS5jbGFzc05hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZVxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChidW5kbGUpXG4gICAgICAgIHJldHVybiBjb21wb25lbnRzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBhIGZ1bGwtcmVmcmVzaCBvbiBhbGwgc3ViLW9iamVjdHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGZ1bGxSZWZyZXNoXG4gICAgIyMjXG4gICAgZnVsbFJlZnJlc2g6IC0+XG4gICAgICAgIGZvciBvYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIGlmIG9iamVjdFxuICAgICAgICAgICAgICAgIG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgIG9iamVjdC5mdWxsUmVmcmVzaCgpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBvYmplY3Qgd2l0aCBhbGwgcGFyZW50LSBhbmQgc3ViLW9iamVjdHMuIFxuICAgICpcbiAgICAqIEBtZXRob2QgZnVsbFVwZGF0ZVxuICAgICMjI1xuICAgIGZ1bGxVcGRhdGU6IC0+XG4gICAgICAgIHBhcmVudCA9IHRoaXNcbiAgICAgICAgd2hpbGUgcGFyZW50ICE9IG51bGxcbiAgICAgICAgICAgIHBhcmVudC51cGRhdGUoKVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudFxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBvYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIG9iamVjdD8udXBkYXRlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgb2JqZWN0IGFuZCBhbGwgaXRzIGNvbXBvbmVudHMuIFRoaXMgbWV0aG9kIGlzXG4gICAgKiBjYWxsZWQgYXV0b21hdGljYWxseSBieSB0aGUgcGFyZW50IG9yIE9iamVjdE1hbmFnZXIgc28gaW4gcmVndWxhciBpdCBpcyBcbiAgICAqIG5vdCBuZWNlc3NhcnkgdG8gY2FsbCBpdCBtYW51YWxseS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgcmV0dXJuIGlmICFAYWN0aXZlXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBAY29tcG9uZW50cy5sZW5ndGhcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IEBjb21wb25lbnRzW2ldXG4gICAgICAgICAgICBpZiBub3QgY29tcG9uZW50LmRpc3Bvc2VkXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGNvbXBvbmVudHMuc3BsaWNlKGksIDEpXG5cblxuICAgICAgICBpZiBAaW5wdXQgdGhlbiBJbnB1dC5jbGVhcigpXG4gICAgICAgIEBpbnB1dCA9IG5vXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIHRoZSBmaXJzdCBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGNsYXNzIG5hbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kQ29tcG9uZW50XG4gICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgY2xhc3MgbmFtZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICogQHJldHVybiB7Q29tcG9uZW50fSBUaGUgY29tcG9uZW50IG9yIG51bGwgaWYgYSBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGNsYXNzIG5hbWUgY2Fubm90IGJlIGZvdW5kLlxuICAgICMjI1xuICAgIGZpbmRDb21wb25lbnQ6IChuYW1lKSAtPiBAY29tcG9uZW50cy5maXJzdCAodikgLT4gdi5jb25zdHJ1Y3Rvci5uYW1lID09IG5hbWVcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZWFyY2hlcyBmb3IgYWxsIGNvbXBvbmVudHMgd2l0aCB0aGUgc3BlY2lmaWVkIGNsYXNzIG5hbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kQ29tcG9uZW50c1xuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIGNsYXNzIG5hbWUgb2YgdGhlIGNvbXBvbmVudHMuXG4gICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGNvbXBvbmVudHMgb3IgbnVsbCBpZiBubyBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGNsYXNzIG5hbWUgaGFzIGJlZW4gZm91bmQuXG4gICAgIyMjXG4gICAgZmluZENvbXBvbmVudHM6IChuYW1lKSAtPiBAY29tcG9uZW50cy53aGVyZSAodikgLT4gdi5jb25zdHJ1Y3Rvci5uYW1lID09IG5hbWVcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZWFyY2hlcyBmb3IgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgSUQuXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kQ29tcG9uZW50QnlJZFxuICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29tcG9uZW50LlxuICAgICogQHJldHVybiB7Q29tcG9uZW50fSBUaGUgY29tcG9uZW50IG9yIG51bGwgaWYgYSBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAjIyNcbiAgICBmaW5kQ29tcG9uZW50QnlJZDogKGlkKSAtPiBAY29tcG9uZW50c0J5SWRbaWRdXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhbiBvYmplY3QgdG8gdGhlIGxpc3Qgb2Ygc3ViLW9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRPYmplY3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0X0Jhc2V9IG9iamVjdCBUaGUgb2JqZWN0IHdoaWNoIHNob3VsZCBiZSBhZGRlZC5cbiAgICAjIyNcbiAgICBhZGRPYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudD8ucmVtb3ZlKG9iamVjdClcbiAgICAgICAgb2JqZWN0LnBhcmVudD8ucmVtb3ZlT2JqZWN0KG9iamVjdClcbiAgICAgICAgb2JqZWN0LnBhcmVudCA9IHRoaXNcbiAgICAgICAgQHN1Yk9iamVjdHMucHVzaChvYmplY3QpXG4gICAgICAgIEBuZWVkc1NvcnQgPSB5ZXNcbiAgICAgICAgQG5lZWRzVXBkYXRlID0geWVzXG4gICAgXG4gICAgICAgIGlmIG9iamVjdC5pZD9cbiAgICAgICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5zZXRPYmplY3RCeUlkKG9iamVjdCwgb2JqZWN0LmlkKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbnNlcnRzIGFuIG9iamVjdCBpbnRvIHRoZSBsaXN0IG9mIHN1Yi1vYmplY3RzIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBpbnNlcnRPYmplY3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0X0Jhc2V9IG9iamVjdCBUaGUgb2JqZWN0IHdoaWNoIHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBUaGUgaW5kZXguXG4gICAgIyMjXG4gICAgaW5zZXJ0T2JqZWN0OihvYmplY3QsIGluZGV4KSAtPlxuICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQucmVtb3ZlKG9iamVjdClcbiAgICAgICAgb2JqZWN0LnBhcmVudD8ucmVtb3ZlT2JqZWN0KG9iamVjdClcbiAgICAgICAgb2JqZWN0LnBhcmVudCA9IHRoaXNcbiAgICAgICAgQHN1Yk9iamVjdHMuc3BsaWNlKGluZGV4LCAwLCBvYmplY3QpXG4gICAgICBcbiAgICAgICAgaWYgb2JqZWN0LmlkP1xuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50LnNldE9iamVjdEJ5SWQob2JqZWN0LCBvYmplY3QuaWQpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHN1Yi1vYmplY3QgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE9iamVjdFxuICAgICogQHBhcmFtIHtPYmplY3RfQmFzZX0gb2JqZWN0IFRoZSBvYmplY3QuXG4gICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4LlxuICAgICMjI1xuICAgIHNldE9iamVjdDogKG9iamVjdCwgaW5kZXgpIC0+XG4gICAgICAgIGlmIG9iamVjdFxuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50LnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICBvYmplY3QucGFyZW50Py5yZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgb2JqZWN0LnBhcmVudCA9IHRoaXNcbiAgICAgICAgICAgIFxuICAgICAgICBAc3ViT2JqZWN0c1tpbmRleF0gPSBvYmplY3RcbiAgICAgIFxuICAgICAgICBpZiBvYmplY3Q/LmlkP1xuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50LnNldE9iamVjdEJ5SWQob2JqZWN0LCBvYmplY3QuaWQpXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIG9iamVjdCBmcm9tIHRoZSBsaXN0IG9mIHN1Yi1vYmplY3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlT2JqZWN0XG4gICAgKiBAcGFyYW0ge09iamVjdF9CYXNlfSBvYmplY3QgVGhlIG9iamVjdCB3aGljaCBzaG91bGQgYmUgcmVtb3ZlZC5cbiAgICAjIyNcbiAgICByZW1vdmVPYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIEBzdWJPYmplY3RzLnJlbW92ZShvYmplY3QpXG4gICAgICAgIG9iamVjdC5wYXJlbnQgPSBudWxsXG4gICAgICAgIEBuZWVkc1VwZGF0ZSA9IHllc1xuICAgIFxuICAgICMjIypcbiAgICAqIEVyYXNlcyB0aGUgb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguIFRoZSBsaXN0IHNpemVcbiAgICAqIHdpbGwgbm90IGJlIGNoYW5nZWQgYnV0IHRoZSB0aGUgdmFsdWUgYXQgdGhlIGluZGV4IHdpbGwgYmUgc2V0IHRvIG51bGwuXG4gICAgKlxuICAgICogQG1ldGhvZCBlcmFzZU9iamVjdFxuICAgICogQHBhcmFtIHtOdW1iZXJ9IG9iamVjdCBUaGUgb2JqZWN0IHdoaWNoIHNob3VsZCBiZSBlcmFzZWQuXG4gICAgIyMjXG4gICAgZXJhc2VPYmplY3Q6IChpbmRleCkgLT5cbiAgICAgICAgb2JqZWN0ID0gQHN1Yk9iamVjdHNbaW5kZXhdXG4gICAgICAgIG9iamVjdD8ucGFyZW50ID0gbnVsbFxuICAgICAgICBAc3ViT2JqZWN0c1tpbmRleF0gPSBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGNvbXBvbmVudCB0byB0aGUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgYWRkQ29tcG9uZW50XG4gICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IFRoZSBjb21wb25lbnRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBBbiBvcHRpb25hbCB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICAjIyNcbiAgICBhZGRDb21wb25lbnQ6IChjb21wb25lbnQsIGlkKSAtPlxuICAgICAgICBpZiBub3QgQGNvbXBvbmVudHMuY29udGFpbnMoY29tcG9uZW50KVxuICAgICAgICAgICAgY29tcG9uZW50Lm9iamVjdCA9IHRoaXNcbiAgICAgICAgICAgIEBjb21wb25lbnRzLnB1c2goY29tcG9uZW50KVxuICAgICAgICAgICAgaWYgaWQ/XG4gICAgICAgICAgICAgICAgQGNvbXBvbmVudHNCeUlkW2lkXSA9IGNvbXBvbmVudFxuICAgICMjIypcbiAgICAqIEluc2VydHMgYSBjb21wb25lbnQgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluc2VydENvbXBvbmVudFxuICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBUaGUgY29tcG9uZW50LlxuICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBBbiBvcHRpb25hbCB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICAjIyMgICAgXG4gICAgaW5zZXJ0Q29tcG9uZW50OiAoY29tcG9uZW50LCBpbmRleCwgaWQpIC0+XG4gICAgICAgIEBjb21wb25lbnRzLnJlbW92ZShjb21wb25lbnQpXG4gICAgICAgIGNvbXBvbmVudC5vYmplY3QgPSB0aGlzXG4gICAgICAgIEBjb21wb25lbnRzLnNwbGljZShpbmRleCwgMCwgY29tcG9uZW50KVxuICAgICAgICBpZiBpZD9cbiAgICAgICAgICAgIEBjb21wb25lbnRzQnlJZFtpZF0gPSBjb21wb25lbnRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZW1vdmVzIGEgY29tcG9uZW50IGZyb20gdGhlIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudFxuICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIHJlbW92ZS5cbiAgICAjIyMgIFxuICAgIHJlbW92ZUNvbXBvbmVudDogKGNvbXBvbmVudCkgLT4gXG4gICAgICAgIEBjb21wb25lbnRzLnJlbW92ZShjb21wb25lbnQpXG4gICAgICAgIGlmIGlkP1xuICAgICAgICAgICAgZGVsZXRlIEBjb21wb25lbnRzQnlJZFtpZF1cblxuZ3MuT2JqZWN0X0Jhc2UgPSBPYmplY3RfQmFzZSJdfQ==
//# sourceURL=Object_Base_0.js