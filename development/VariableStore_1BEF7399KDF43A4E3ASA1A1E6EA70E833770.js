var VariableStore;

VariableStore = (function() {
  VariableStore.objectCodecBlackList = ["persistentNumbers", "persistentStrings", "persistentBooleans", "persistentLists"];


  /**
  * <p>A storage for different kind of game variables. The following scopes
  * for variables exist:</p>
  * 
  * - Local Variables -> Only valid for the current scene.
  * - Global Variables -> Valid for the whole game but bound to a single save-game.
  * - Persistent Variables -> Valid for the whole game indepentent from the save-games.
  * 
  * <p>The following data-types exist:</p>
  * - Strings -> Variables storing text data.
  * - Numbers -> Variables storing integer number values.
  * - Booleans -> Variables storing boolean values. (Called "Switches" for easier understanding)
  * - Lists -> Variables storing multiple other variables. Lists can also contain Lists.
  * <p>
  * Local variables are stored by scene UID. For each scene UID a list of local variables is stored.</p>
  * 
  * <p>Global and persistent variables are stored and a specific domain. A domain is just a unique name such
  * as <i>com.example.game</i> for example. The default domain is an empty string. Domains are useful to avoid
  * overlapping of variable numbers when sharing content with other users. </p>
  *
  * @module gs
  * @class VariableStore
  * @memberof gs
  * @constructor
   */

  function VariableStore() {

    /**
    * Current local variable context
    * @property context
    * @type Object
     */
    this.context = null;

    /**
    * Current domain for global and persistent variables. Each domain has its own
    * variables. Please use <b>changeDomain</b> method to change the domain.
    * @property domain
    * @type Object
    * @readOnly
     */
    this.domain = "";

    /**
    * List of available domains for global and persistent variables.
    * @property domains
    * @type string[]
     */
    this.domains = [""];

    /**
    * The global number variables of the current domain.
    * @property numbers
    * @type number[]
     */
    this.numbers = null;

    /**
    * The global boolean variables of the current domain.
    * @property booleans
    * @type boolean[]
     */
    this.booleans = null;

    /**
    * The global string variables of the current domain.
    * @property strings
    * @type string[]
     */
    this.strings = null;

    /**
    * The global list variables of the current domain.
    * @property lists
    * @type Object[][]
     */
    this.lists = null;

    /**
    * The storage of all global variables by domain.
    * @property globalVariablesByDomain
    * @type Object[][]
     */
    this.globalVariablesByDomain = {};

    /**
    * The storage of all persistent variables by domain.
    * @property persistentVariablesByDomain
    * @type Object[][]
     */
    this.persistentVariablesByDomain = {};

    /**
    * The persistent number variables of the current domain.
    * @property persistentNumbers
    * @type number[]
     */
    this.persistentNumbers = [];

    /**
    * The persistent string variables of the current domain.
    * @property persistentStrings
    * @type string[]
     */
    this.persistentStrings = [];

    /**
    * The persistent boolean variables of the current domain.
    * @property persistentBooleans
    * @type boolean[]
     */
    this.persistentBooleans = [];

    /**
    * The persistent list variables of the current domain.
    * @property persistentLists
    * @type Object[][]
     */
    this.persistentLists = [];

    /**
    * The local number variables.
    * @property localNumbers
    * @type Object
     */
    this.localNumbers = {};

    /**
    * The local string variables.
    * @property localStrings
    * @type Object
     */
    this.localStrings = {};

    /**
    * The local boolean variables.
    * @property localBooleans
    * @type Object
     */
    this.localBooleans = {};

    /**
    * The local list variables.
    * @property localLists
    * @type Object
     */
    this.localLists = {};

    /**
    * @property tempNumbers
    * @type number[]
     */
    this.tempNumbers = null;

    /**
    * @property tempStrings
    * @type string[]
     */
    this.tempStrings = null;

    /**
    * @property localBooleans
    * @type number[]
     */
    this.tempBooleans = null;

    /**
    * @property localLists
    * @type Object[][]
     */
    this.tempLists = null;
  }


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  VariableStore.prototype.onDataBundleRestore = function(data, context) {
    var domain, domains, i, j, len;
    domains = DataManager.getDocumentsByType("global_variables").select(function(d) {
      return d.items.domain;
    });
    for (i = j = 0, len = domains.length; j < len; i = ++j) {
      domain = domains[i];
      this.numbersByDomain[domain] = this.numbersByDomain[i];
      this.stringsByDomain[domain] = this.stringsByDomain[i];
      this.booleansByDomain[domain] = this.booleansByDomain[i];
      this.listsByDomain[domain] = this.listsByDomain[i];
    }
    return null;
  };

  VariableStore.prototype.setupGlobalDomains = function() {
    var domain, i, j, len, ref;
    this.numbersByDomain = [];
    this.stringsByDomain = [];
    this.booleansByDomain = [];
    this.listsByDomain = [];
    ref = this.domains;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      domain = ref[i];
      this.numbersByDomain[i] = new Array(1000);
      this.numbersByDomain[domain] = this.numbersByDomain[i];
      this.stringsByDomain[i] = new Array(1000);
      this.stringsByDomain[domain] = this.stringsByDomain[i];
      this.booleansByDomain[i] = new Array(1000);
      this.booleansByDomain[domain] = this.booleansByDomain[i];
      this.listsByDomain[i] = new Array(1000);
      this.listsByDomain[domain] = this.listsByDomain[i];
    }
    this.numbers = this.numbersByDomain[0];
    this.strings = this.stringsByDomain[0];
    this.booleans = this.booleansByDomain[0];
    return this.lists = this.numbersByDomain[0];
  };

  VariableStore.prototype.setupPersistentDomains = function(domains) {
    var domain, i, j, len, ref, results;
    ref = this.domains;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      domain = ref[i];
      this.persistentNumbers[i] = new Array(10);
      this.persistentNumbers[domain] = this.persistentNumbers[i];
      this.persistentStrings[i] = new Array(10);
      this.persistentStrings[domain] = this.persistentStrings[i];
      this.persistentBooleans[i] = new Array(10);
      this.persistentBooleans[domain] = this.persistentBooleans[i];
      this.persistentLists[i] = new Array(10);
      results.push(this.persistentLists[domain] = this.persistentLists[i]);
    }
    return results;
  };

  VariableStore.prototype.setupDomains = function(domains) {
    this.domains = domains;
    this.setupGlobalDomains();
    return this.setupPersistentDomains();
  };


  /**
  * Changes the current domain.
  *
  * @deprecated
  * @method changeDomain
  * @param {string} domain - The domain to change to.
   */

  VariableStore.prototype.changeDomain = function(domain) {
    var globalVariables, persistentVariables;
    this.domain = domain;
    globalVariables = this.globalVariablesByDomain[domain];
    persistentVariables = this.persistentVariablesByDomain[domain];
    if (!globalVariables) {
      globalVariables = this.globalVariablesByDomain[domain] = {
        numbers: new Array(500),
        strings: new Array(500),
        booleans: new Array(500),
        lists: new Array(500)
      };
    }
    if (!persistentVariables) {
      persistentVariables = this.persistentVariablesByDomain[domain] = {
        numbers: new Array(500),
        strings: new Array(500),
        booleans: new Array(500),
        lists: new Array(500)
      };
    }
    this.numbers = globalVariables.numbers;
    this.strings = globalVariables.strings;
    this.booleans = globalVariables.booleans;
    this.lists = globalVariables.lists;
    this.persistentNumbers = persistentVariables.numbers;
    this.persistentBooleans = persistentVariables.booleans;
    this.persistentStrings = persistentVariables.strings;
    return this.persistentLists = persistentVariables.lists;
  };


  /**
  * Clears all global variables
  *
  * @method clearGlobalVariables
   */

  VariableStore.prototype.clearAllGlobalVariables = function() {
    var globalVariables;
    this.setupGlobalDomains();
    return;
    globalVariables = this.globalVariablesByDomain[this.domain];
    this.numbersByDomain = new Array(1000);
    globalVariables.booleans = new Array(1000);
    globalVariables.strings = new Array(1000);
    this.numbers = globalVariables.numbers;
    this.strings = globalVariables.strings;
    return this.booleans = globalVariables.booleans;
  };


  /**
  * Clears all local variables for all contexts/scenes/common-events.
  *
  * @method clearAllLocalVariables
   */

  VariableStore.prototype.clearAllLocalVariables = function() {
    this.localNumbers = {};
    this.localStrings = {};
    this.localBooleans = {};
    return this.localLists = {};
  };


  /**
  * Clears specified variables.
  *
  * @method clearVariables
  * @param {number[]} numbers - The number variables to clear.
  * @param {string[]} strings - The string variables to clear.
  * @param {boolean[]} booleans - The boolean variables to clear.
  * @param {Array[]} lists - The list variables to clear.
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all specified variables are cleared.
   */

  VariableStore.prototype.clearVariables = function(numbers, strings, booleans, lists, type, range) {
    switch (type) {
      case 0:
        if (numbers != null) {
          numbers.fill(0, range.start, range.end);
        }
        if (strings != null) {
          strings.fill("", range.start, range.end);
        }
        if (booleans != null) {
          booleans.fill(false, range.start, range.end);
        }
        return lists != null ? lists.fill([], range.start, range.end) : void 0;
      case 1:
        return booleans != null ? booleans.fill(false, range.start, range.end) : void 0;
      case 2:
        return numbers != null ? numbers.fill(0, range.start, range.end) : void 0;
      case 3:
        return strings != null ? strings.fill("", range.start, range.end) : void 0;
      case 4:
        return lists != null ? lists.fill([], range.start, range.end) : void 0;
    }
  };


  /**
  * Clears all local variables for a specified context. If the context is not specified, all
  * local variables for all contexts/scenes/common-events are cleared.
  *
  * @method clearLocalVariables
  * @param {Object} context - The context to clear the local variables for. If <b>null</b>, all
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearLocalVariables = function(context, type, range) {
    var id, ids, j, len, results;
    if (context != null) {
      ids = [context.id];
    } else {
      ids = Object.keys(this.localNumbers);
    }
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    results = [];
    for (j = 0, len = ids.length; j < len; j++) {
      id = ids[j];
      results.push(this.clearVariables(this.localNumbers[id], this.localStrings[id], this.localBooleans[id], this.localLists[id], type, range));
    }
    return results;
  };


  /**
  * Clears global variables.
  *
  * @method clearGlobalVariables
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearGlobalVariables = function(type, range) {
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    return this.clearVariables(this.numbers, this.strings, this.booleans, this.lists, type, range);
  };


  /**
  * Clears persistent variables.
  *
  * @method clearPersistentVariables
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearPersistentVariables = function(type, range) {
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    return this.clearVariables(this.persistentNumbers, this.persistentstrings, this.persistentBooleans, this.persistentLists, type, range);
  };


  /**
  * Initializes the variables. Should be called whenever the context changes. (Like after a scene change)
  *
  * @method setup
  * @param {Object} context - The context(current scene) needed for local variables. Needs have at least an id-property.
   */

  VariableStore.prototype.setup = function(context) {
    this.setupLocalVariables(context);
    return this.setupTempVariables(context);
  };


  /**
  * Initializes the local variables for the specified context. Should be called on first time use.
  *
  * @method setupLocalVariables
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
   */

  VariableStore.prototype.setupLocalVariables = function(context) {
    this.setupVariables(context, "localNumbers", 0);
    this.setupVariables(context, "localStrings", "");
    this.setupVariables(context, "localBooleans", false);
    return this.setupVariables(context, "localLists", []);
  };


  /**
  * Initializes the specified kind of variables.
  *
  * @method setupVariables                                       
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
  * @param {string} property - The kind of variables (property-name).
  * @param {Object} defaultValue - The default value for each variable.
   */

  VariableStore.prototype.setupVariables = function(context, property, defaultValue) {
    if (this[property][context.id] == null) {
      return this[property][context.id] = [];
    }
  };


  /**
  * Initializes the current temp variables for the specified context. Should be called whenever the context changed.
  *
  * @method setupTempVariables
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
   */

  VariableStore.prototype.setupTempVariables = function(context) {
    this.context = context;
    if (!this.localNumbers[context.id]) {
      this.setupLocalVariables(context);
    }
    this.tempNumbers = this.localNumbers[context.id];
    this.tempStrings = this.localStrings[context.id];
    this.tempBooleans = this.localBooleans[context.id];
    return this.tempLists = this.localLists[context.id];
  };

  VariableStore.prototype.clearTempVariables = function(context) {};


  /**
  * Gets the index for the variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {number} scope - The variable scope: 0 = local, 1 = global, 2 = persistent.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfVariable = function(name, type, scope, domain) {
    var result;
    result = 0;
    switch (scope) {
      case 0:
        result = this.indexOfTempVariable(name, type);
        break;
      case 1:
        result = this.indexOfGlobalVariable(name, type, domain);
        break;
      case 2:
        result = this.indexOfPersistentVariable(name, type, domain);
    }
    return result;
  };


  /**
  * Gets the index for the local variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
   */

  VariableStore.prototype.indexOfTempVariable = function(name, type) {
    var ref, result, variable;
    result = 0;
    if ((ref = this.context) != null ? ref.owner : void 0) {
      if (this.context.owner.sceneDocument) {
        variable = this.context.owner.sceneDocument.items[type + "Variables"].first(function(v) {
          return v.name === name;
        });
        if (variable != null) {
          result = variable.index;
        }
      } else if (this.context.owner[type + "Variables"]) {
        variable = this.context.owner[type + "Variables"].first(function(v) {
          return v.name === name;
        });
        if (variable != null) {
          result = variable.index;
        } else {
          console.warn("Variable referenced by name not found: " + name(+"(local, " + type + ")"));
        }
      }
    }
    return result;
  };


  /**
  * Gets the index for the global variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfGlobalVariable = function(name, type, domain) {
    var result, variable, variables, variablesDocument;
    result = 0;
    variables = DataManager.getDocumentsByType("global_variables");
    variablesDocument = variables.first(function(v) {
      return v.items.domain === domain;
    });
    if (variablesDocument == null) {
      variablesDocument = variables[0];
    }
    if (variablesDocument) {
      variable = variablesDocument.items[type + "s"].first(function(v) {
        return v.name === name;
      });
      if (variable) {
        result = variable.index;
      } else {
        console.warn("Variable referenced by name not found: " + name + " (persistent, " + type + ")");
      }
    }
    return result;
  };


  /**
  * Gets the index for the persistent variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfPersistentVariable = function(name, type, domain) {
    var result, variable, variables, variablesDocument;
    result = 0;
    variables = DataManager.getDocumentsByType("persistent_variables");
    variablesDocument = variables.first(function(v) {
      return v.items.domain === domain;
    });
    if (variablesDocument == null) {
      variablesDocument = variables[0];
    }
    if (variablesDocument) {
      variable = variablesDocument.items[type + "s"].first(function(v) {
        return v.name === name;
      });
      if (variable != null) {
        result = variable.index;
      } else {
        console.warn("Variable referenced by name not found: " + name + " (persistent, " + type + ")");
      }
    }
    return result;
  };


  /**
  * Sets the value of the number variable at the specified index.
  *
  * @method setNumberValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} type - The variable's index.
  * @param {number} value - The value to set.
   */

  VariableStore.prototype.setNumberValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentNumbers[domain][index] = value;
    } else if (scope === 1) {
      return this.numbersByDomain[domain || 0][index] = value;
    } else {
      return this.tempNumbers[index] = value;
    }
  };


  /**
  * Sets the value of a specified number variable.
  *
  * @method setNumberValueAtIndex
  * @param {number} variable - The variable to set. 
  * @param {number} value - The value to set.
   */

  VariableStore.prototype.setNumberValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentNumbers[variable.domain || 0][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.numbersByDomain[variable.domain || 0][variable.index] = value;
    } else {
      return this.tempNumbers[variable.index] = value;
    }
  };


  /**
  * Sets the value of a specified list variable.
  *
  * @method setListObjectTo
  * @param {Object} variable - The variable to set. 
  * @param {Object} value - The value to set.
   */

  VariableStore.prototype.setListObjectTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentLists[variable.domain || 0][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.listsByDomain[variable.domain || 0][variable.index] = value;
    } else {
      return this.tempLists[variable.index] = value;
    }
  };


  /**
  * Sets the value of a specified boolean variable.
  *
  * @method setBooleanValueTo
  * @param {Object} variable - The variable to set. 
  * @param {boolean} value - The value to set.
   */

  VariableStore.prototype.setBooleanValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentBooleans[variable.domain][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.booleansByDomain[variable.domain][variable.index] = value;
    } else {
      return this.tempBooleans[variable.index] = value;
    }
  };


  /**
  * Sets the value of the boolean variable at the specified index.
  *
  * @method setBooleanValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {boolean} value - The value to set.
   */

  VariableStore.prototype.setBooleanValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentBooleans[domain][index] = value;
    } else if (scope === 1) {
      return this.booleansByDomain[domain][index] = value;
    } else {
      return this.tempBooleans[index] = value;
    }
  };


  /**
  * Sets the value of a specified string variable.
  *
  * @method setStringValueTo
  * @param {Object} variable - The variable to set. 
  * @param {string} value - The value to set.
   */

  VariableStore.prototype.setStringValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentStrings[variable.domain][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.stringsByDomain[variable.domain][variable.index] = value;
    } else {
      return this.tempStrings[variable.index] = value;
    }
  };


  /**
  * Sets the value of the string variable at the specified index.
  *
  * @method setStringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {string} value - The value to set.
   */

  VariableStore.prototype.setStringValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentStrings[domain][index] = value;
    } else if (scope === 1) {
      return this.stringsByDomain[domain][index] = value;
    } else {
      return this.tempStrings[index] = value;
    }
  };


  /**
  * Gets the value of a specified list variable.
  *
  * @method listObjectOf
  * @param {Object} object - The list-variable/object to get the value from.
  * @return {Object} The list-object.
   */

  VariableStore.prototype.listObjectOf = function(object) {
    var result;
    result = 0;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentLists[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.listsByDomain[object.domain][object.index];
      } else {
        result = this.tempLists[object.index];
      }
    } else {
      result = object;
    }
    return result || [];
  };


  /**
  * Gets the value of a number variable at the specified index.
  *
  * @method numberValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {Object} The number value of the variable.
   */

  VariableStore.prototype.numberValueAtIndex = function(scope, index, domain) {
    var result;
    result = 0;
    if (scope === 2) {
      result = this.persistentNumbers[domain][index];
    } else if (scope === 1) {
      result = this.numbersByDomain[domain][index];
    } else {
      result = this.tempNumbers[index];
    }
    return result;
  };


  /**
  * Gets the value of a specified number variable.
  *
  * @method numberValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {Object} The number value of the variable.
   */

  VariableStore.prototype.numberValueOf = function(object) {
    var result;
    result = 0;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentNumbers[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.numbersByDomain[object.domain][object.index];
      } else {
        result = this.tempNumbers[object.index];
      }
    } else {
      result = object;
    }
    return result || 0;
  };


  /**
  * Gets the value of a specified string variable.
  *
  * @method stringValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {string} The string value of the variable.
   */

  VariableStore.prototype.stringValueOf = function(object) {
    var result;
    result = "";
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentStrings[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.stringsByDomain[object.domain][object.index];
      } else {
        result = this.tempStrings[object.index];
      }
    } else {
      result = object;
    }
    return result || "";
  };


  /**
  * Gets the value of a string variable at the specified index.
  *
  * @method stringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {string} The string value of the variable.
   */

  VariableStore.prototype.stringValueAtIndex = function(scope, index, domain) {
    var result;
    result = "";
    if (scope === 2) {
      result = this.persistentStrings[domain][index];
    } else if (scope === 1) {
      result = this.stringsByDomain[domain][index];
    } else {
      result = this.tempStrings[index];
    }
    return result || "";
  };


  /**
  * Gets the value of a specified boolean variable.
  *
  * @method booleanValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {Object} The boolean value of the variable.
   */

  VariableStore.prototype.booleanValueOf = function(object) {
    var result;
    result = false;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentBooleans[object.domain][object.index] || false;
      } else if (object.scope === 1) {
        result = this.booleansByDomain[object.domain][object.index] || false;
      } else {
        result = this.tempBooleans[object.index] || false;
      }
    } else {
      result = object ? true : false;
    }
    return result;
  };


  /**
  * Gets the value of a boolean variable at the specified index.
  *
  * @method booleanValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {boolean} The boolean value of the variable.
   */

  VariableStore.prototype.booleanValueAtIndex = function(scope, index, domain) {
    var result;
    result = false;
    if (scope === 2) {
      result = this.persistenBooleans[domain][index] || false;
    } else if (scope === 1) {
      result = this.booleansByDomain[domain][index] || false;
    } else {
      result = this.tempBooleans[index] || false;
    }
    return result;
  };

  return VariableStore;

})();

gs.VariableStore = VariableStore;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07RUFDRixhQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxtQkFBRCxFQUFzQixtQkFBdEIsRUFBMkMsb0JBQTNDLEVBQWlFLGlCQUFqRTs7O0FBRXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXlCYSx1QkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsRUFBRDs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUNYOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBQ1o7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFDWDs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQjs7QUFFM0I7Ozs7O0lBS0EsSUFBQyxDQUFBLDJCQUFELEdBQStCOztBQUUvQjs7Ozs7SUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7O0FBQ3JCOzs7OztJQUtBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjs7QUFDckI7Ozs7O0lBS0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCOztBQUN0Qjs7Ozs7SUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFDbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBQ2hCOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUNoQjs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7QUFDakI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFDZDs7OztJQUlBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBQ2Y7Ozs7SUFJQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUNmOzs7O0lBSUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBQ2hCOzs7O0lBSUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQWxJSjs7O0FBb0liOzs7Ozs7Ozs7MEJBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0IsQ0FBa0QsQ0FBQyxNQUFuRCxDQUEwRCxTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQWYsQ0FBMUQ7QUFFVixTQUFBLGlEQUFBOztNQUNJLElBQUMsQ0FBQSxlQUFnQixDQUFBLE1BQUEsQ0FBakIsR0FBMkIsSUFBQyxDQUFBLGVBQWdCLENBQUEsQ0FBQTtNQUM1QyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQWpCLEdBQTJCLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7TUFDNUMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQUEsQ0FBbEIsR0FBNEIsSUFBQyxDQUFBLGdCQUFpQixDQUFBLENBQUE7TUFDOUMsSUFBQyxDQUFBLGFBQWMsQ0FBQSxNQUFBLENBQWYsR0FBeUIsSUFBQyxDQUFBLGFBQWMsQ0FBQSxDQUFBO0FBSjVDO0FBTUEsV0FBTztFQVRVOzswQkFXckIsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO0lBQ3BCLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBRWpCO0FBQUEsU0FBQSw2Q0FBQTs7TUFDSSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFBLENBQWpCLEdBQTBCLElBQUEsS0FBQSxDQUFNLElBQU47TUFDMUIsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBQSxDQUFqQixHQUEyQixJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFBO01BQzVDLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUEsQ0FBakIsR0FBMEIsSUFBQSxLQUFBLENBQU0sSUFBTjtNQUMxQixJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQWpCLEdBQTJCLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7TUFDNUMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLENBQUEsQ0FBbEIsR0FBMkIsSUFBQSxLQUFBLENBQU0sSUFBTjtNQUMzQixJQUFDLENBQUEsZ0JBQWlCLENBQUEsTUFBQSxDQUFsQixHQUE0QixJQUFDLENBQUEsZ0JBQWlCLENBQUEsQ0FBQTtNQUM5QyxJQUFDLENBQUEsYUFBYyxDQUFBLENBQUEsQ0FBZixHQUF3QixJQUFBLEtBQUEsQ0FBTSxJQUFOO01BQ3hCLElBQUMsQ0FBQSxhQUFjLENBQUEsTUFBQSxDQUFmLEdBQXlCLElBQUMsQ0FBQSxhQUFjLENBQUEsQ0FBQTtBQVI1QztJQVVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLGVBQWdCLENBQUEsQ0FBQTtJQUM1QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7SUFDNUIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsZ0JBQWlCLENBQUEsQ0FBQTtXQUM5QixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7RUFuQlY7OzBCQXFCcEIsc0JBQUEsR0FBd0IsU0FBQyxPQUFEO0FBQ3BCLFFBQUE7QUFBQTtBQUFBO1NBQUEsNkNBQUE7O01BQ0ksSUFBQyxDQUFBLGlCQUFrQixDQUFBLENBQUEsQ0FBbkIsR0FBNEIsSUFBQSxLQUFBLENBQU0sRUFBTjtNQUM1QixJQUFDLENBQUEsaUJBQWtCLENBQUEsTUFBQSxDQUFuQixHQUE2QixJQUFDLENBQUEsaUJBQWtCLENBQUEsQ0FBQTtNQUNoRCxJQUFDLENBQUEsaUJBQWtCLENBQUEsQ0FBQSxDQUFuQixHQUE0QixJQUFBLEtBQUEsQ0FBTSxFQUFOO01BQzVCLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFBLENBQW5CLEdBQTZCLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxDQUFBO01BQ2hELElBQUMsQ0FBQSxrQkFBbUIsQ0FBQSxDQUFBLENBQXBCLEdBQTZCLElBQUEsS0FBQSxDQUFNLEVBQU47TUFDN0IsSUFBQyxDQUFBLGtCQUFtQixDQUFBLE1BQUEsQ0FBcEIsR0FBOEIsSUFBQyxDQUFBLGtCQUFtQixDQUFBLENBQUE7TUFDbEQsSUFBQyxDQUFBLGVBQWdCLENBQUEsQ0FBQSxDQUFqQixHQUEwQixJQUFBLEtBQUEsQ0FBTSxFQUFOO21CQUMxQixJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQWpCLEdBQTJCLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7QUFSaEQ7O0VBRG9COzswQkFXeEIsWUFBQSxHQUFjLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsa0JBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO0VBSFU7OztBQU1kOzs7Ozs7OzswQkFPQSxZQUFBLEdBQWMsU0FBQyxNQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixlQUFBLEdBQWtCLElBQUMsQ0FBQSx1QkFBd0IsQ0FBQSxNQUFBO0lBQzNDLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSwyQkFBNEIsQ0FBQSxNQUFBO0lBRW5ELElBQUcsQ0FBQyxlQUFKO01BQ0ksZUFBQSxHQUFrQixJQUFDLENBQUEsdUJBQXdCLENBQUEsTUFBQSxDQUF6QixHQUFtQztRQUFFLE9BQUEsRUFBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQWY7UUFBMkIsT0FBQSxFQUFhLElBQUEsS0FBQSxDQUFNLEdBQU4sQ0FBeEM7UUFBb0QsUUFBQSxFQUFjLElBQUEsS0FBQSxDQUFNLEdBQU4sQ0FBbEU7UUFBOEUsS0FBQSxFQUFXLElBQUEsS0FBQSxDQUFNLEdBQU4sQ0FBekY7UUFEekQ7O0lBRUEsSUFBRyxDQUFDLG1CQUFKO01BQ0ksbUJBQUEsR0FBc0IsSUFBQyxDQUFBLDJCQUE0QixDQUFBLE1BQUEsQ0FBN0IsR0FBdUM7UUFBRSxPQUFBLEVBQWEsSUFBQSxLQUFBLENBQU0sR0FBTixDQUFmO1FBQTJCLE9BQUEsRUFBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQXhDO1FBQW9ELFFBQUEsRUFBYyxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQWxFO1FBQThFLEtBQUEsRUFBVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQXpGO1FBRGpFOztJQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsZUFBZSxDQUFDO0lBQzNCLElBQUMsQ0FBQSxPQUFELEdBQVcsZUFBZSxDQUFDO0lBQzNCLElBQUMsQ0FBQSxRQUFELEdBQVksZUFBZSxDQUFDO0lBQzVCLElBQUMsQ0FBQSxLQUFELEdBQVMsZUFBZSxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixtQkFBbUIsQ0FBQztJQUN6QyxJQUFDLENBQUEsa0JBQUQsR0FBc0IsbUJBQW1CLENBQUM7SUFDMUMsSUFBQyxDQUFBLGlCQUFELEdBQXFCLG1CQUFtQixDQUFDO1dBQ3pDLElBQUMsQ0FBQSxlQUFELEdBQW1CLG1CQUFtQixDQUFDO0VBakI3Qjs7O0FBbUJkOzs7Ozs7MEJBS0EsdUJBQUEsR0FBeUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsSUFBQyxDQUFBLGtCQUFELENBQUE7QUFDQTtJQUVBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLHVCQUF3QixDQUFBLElBQUMsQ0FBQSxNQUFEO0lBQzNDLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsS0FBQSxDQUFNLElBQU47SUFDdkIsZUFBZSxDQUFDLFFBQWhCLEdBQStCLElBQUEsS0FBQSxDQUFNLElBQU47SUFDL0IsZUFBZSxDQUFDLE9BQWhCLEdBQThCLElBQUEsS0FBQSxDQUFNLElBQU47SUFFOUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxlQUFlLENBQUM7SUFDM0IsSUFBQyxDQUFBLE9BQUQsR0FBVyxlQUFlLENBQUM7V0FDM0IsSUFBQyxDQUFBLFFBQUQsR0FBWSxlQUFlLENBQUM7RUFYUDs7O0FBYXpCOzs7Ozs7MEJBS0Esc0JBQUEsR0FBd0IsU0FBQTtJQUNwQixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUNoQixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUNoQixJQUFDLENBQUEsYUFBRCxHQUFpQjtXQUNqQixJQUFDLENBQUEsVUFBRCxHQUFjO0VBSk07OztBQU14Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFrQkEsY0FBQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLFFBQW5CLEVBQTZCLEtBQTdCLEVBQW9DLElBQXBDLEVBQTBDLEtBQTFDO0FBQ1osWUFBTyxJQUFQO0FBQUEsV0FDUyxDQURUOztVQUVRLE9BQU8sQ0FBRSxJQUFULENBQWMsQ0FBZCxFQUFpQixLQUFLLENBQUMsS0FBdkIsRUFBOEIsS0FBSyxDQUFDLEdBQXBDOzs7VUFDQSxPQUFPLENBQUUsSUFBVCxDQUFjLEVBQWQsRUFBa0IsS0FBSyxDQUFDLEtBQXhCLEVBQStCLEtBQUssQ0FBQyxHQUFyQzs7O1VBQ0EsUUFBUSxDQUFFLElBQVYsQ0FBZSxLQUFmLEVBQXNCLEtBQUssQ0FBQyxLQUE1QixFQUFtQyxLQUFLLENBQUMsR0FBekM7OytCQUNBLEtBQUssQ0FBRSxJQUFQLENBQVksRUFBWixFQUFnQixLQUFLLENBQUMsS0FBdEIsRUFBNkIsS0FBSyxDQUFDLEdBQW5DO0FBTFIsV0FNUyxDQU5UO2tDQU9RLFFBQVEsQ0FBRSxJQUFWLENBQWUsS0FBZixFQUFzQixLQUFLLENBQUMsS0FBNUIsRUFBbUMsS0FBSyxDQUFDLEdBQXpDO0FBUFIsV0FRUyxDQVJUO2lDQVNRLE9BQU8sQ0FBRSxJQUFULENBQWMsQ0FBZCxFQUFpQixLQUFLLENBQUMsS0FBdkIsRUFBOEIsS0FBSyxDQUFDLEdBQXBDO0FBVFIsV0FVUyxDQVZUO2lDQVdRLE9BQU8sQ0FBRSxJQUFULENBQWMsRUFBZCxFQUFrQixLQUFLLENBQUMsS0FBeEIsRUFBK0IsS0FBSyxDQUFDLEdBQXJDO0FBWFIsV0FZUyxDQVpUOytCQWFRLEtBQUssQ0FBRSxJQUFQLENBQVksRUFBWixFQUFnQixLQUFLLENBQUMsS0FBdEIsRUFBNkIsS0FBSyxDQUFDLEdBQW5DO0FBYlI7RUFEWTs7O0FBZ0JoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBZ0JBLG1CQUFBLEdBQXFCLFNBQUMsT0FBRCxFQUFVLElBQVYsRUFBZ0IsS0FBaEI7QUFDakIsUUFBQTtJQUFBLElBQUcsZUFBSDtNQUNJLEdBQUEsR0FBTSxDQUFDLE9BQU8sQ0FBQyxFQUFULEVBRFY7S0FBQSxNQUFBO01BR0ksR0FBQSxHQUFNLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFlBQWIsRUFIVjs7SUFLQSxJQUFHLGFBQUg7TUFDSSxLQUFBLEdBQVE7UUFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQWI7UUFBb0IsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBckM7UUFEWjtLQUFBLE1BQUE7TUFHSSxLQUFBLEdBQVE7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUFVLEdBQUEsRUFBSyxJQUFmO1FBSFo7O0FBS0E7U0FBQSxxQ0FBQTs7bUJBQ0ksSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFlBQWEsQ0FBQSxFQUFBLENBQTlCLEVBQW1DLElBQUMsQ0FBQSxZQUFhLENBQUEsRUFBQSxDQUFqRCxFQUFzRCxJQUFDLENBQUEsYUFBYyxDQUFBLEVBQUEsQ0FBckUsRUFBMEUsSUFBQyxDQUFBLFVBQVcsQ0FBQSxFQUFBLENBQXRGLEVBQTJGLElBQTNGLEVBQWlHLEtBQWpHO0FBREo7O0VBWGlCOzs7QUFjckI7Ozs7Ozs7Ozs7Ozs7OzswQkFjQSxvQkFBQSxHQUFzQixTQUFDLElBQUQsRUFBTyxLQUFQO0lBQ2xCLElBQUcsYUFBSDtNQUNJLEtBQUEsR0FBUTtRQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBYjtRQUFvQixHQUFBLEVBQUssS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFyQztRQURaO0tBQUEsTUFBQTtNQUdJLEtBQUEsR0FBUTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQVUsR0FBQSxFQUFLLElBQWY7UUFIWjs7V0FLQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsT0FBakIsRUFBMEIsSUFBQyxDQUFBLE9BQTNCLEVBQW9DLElBQUMsQ0FBQSxRQUFyQyxFQUErQyxJQUFDLENBQUEsS0FBaEQsRUFBdUQsSUFBdkQsRUFBNkQsS0FBN0Q7RUFOa0I7OztBQVF0Qjs7Ozs7Ozs7Ozs7Ozs7OzBCQWNBLHdCQUFBLEdBQTBCLFNBQUMsSUFBRCxFQUFPLEtBQVA7SUFDdEIsSUFBRyxhQUFIO01BQ0ksS0FBQSxHQUFRO1FBQUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUFiO1FBQW9CLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBTixHQUFZLENBQXJDO1FBRFo7S0FBQSxNQUFBO01BR0ksS0FBQSxHQUFRO1FBQUEsS0FBQSxFQUFPLENBQVA7UUFBVSxHQUFBLEVBQUssSUFBZjtRQUhaOztXQUtBLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxpQkFBakIsRUFBb0MsSUFBQyxDQUFBLGlCQUFyQyxFQUF3RCxJQUFDLENBQUEsa0JBQXpELEVBQTZFLElBQUMsQ0FBQSxlQUE5RSxFQUErRixJQUEvRixFQUFxRyxLQUFyRztFQU5zQjs7O0FBUTFCOzs7Ozs7OzBCQU1BLEtBQUEsR0FBTyxTQUFDLE9BQUQ7SUFDSCxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBckI7V0FDQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsT0FBcEI7RUFGRzs7O0FBS1A7Ozs7Ozs7MEJBTUEsbUJBQUEsR0FBcUIsU0FBQyxPQUFEO0lBQ2pCLElBQUMsQ0FBQSxjQUFELENBQWdCLE9BQWhCLEVBQXlCLGNBQXpCLEVBQXlDLENBQXpDO0lBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBaEIsRUFBeUIsY0FBekIsRUFBeUMsRUFBekM7SUFDQSxJQUFDLENBQUEsY0FBRCxDQUFnQixPQUFoQixFQUF5QixlQUF6QixFQUEwQyxLQUExQztXQUNBLElBQUMsQ0FBQSxjQUFELENBQWdCLE9BQWhCLEVBQXlCLFlBQXpCLEVBQXVDLEVBQXZDO0VBSmlCOzs7QUFNckI7Ozs7Ozs7OzswQkFRQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxFQUFVLFFBQVYsRUFBb0IsWUFBcEI7SUFDWixJQUFPLGtDQUFQO2FBQ0ksSUFBSyxDQUFBLFFBQUEsQ0FBVSxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBQWYsR0FBNkIsR0FEakM7O0VBRFk7OztBQUtoQjs7Ozs7OzswQkFNQSxrQkFBQSxHQUFvQixTQUFDLE9BQUQ7SUFDaEIsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUcsQ0FBQyxJQUFDLENBQUEsWUFBYSxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBQWxCO01BQ0ksSUFBQyxDQUFBLG1CQUFELENBQXFCLE9BQXJCLEVBREo7O0lBR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsWUFBYSxDQUFBLE9BQU8sQ0FBQyxFQUFSO0lBQzdCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFlBQWEsQ0FBQSxPQUFPLENBQUMsRUFBUjtJQUM3QixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsYUFBYyxDQUFBLE9BQU8sQ0FBQyxFQUFSO1dBQy9CLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxPQUFPLENBQUMsRUFBUjtFQVJUOzswQkFVcEIsa0JBQUEsR0FBb0IsU0FBQyxPQUFELEdBQUE7OztBQUdwQjs7Ozs7Ozs7Ozs7MEJBVUEsZUFBQSxHQUFpQixTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYixFQUFvQixNQUFwQjtBQUNiLFFBQUE7SUFBQSxNQUFBLEdBQVM7QUFFVCxZQUFPLEtBQVA7QUFBQSxXQUNTLENBRFQ7UUFFUSxNQUFBLEdBQVMsSUFBQyxDQUFBLG1CQUFELENBQXFCLElBQXJCLEVBQTJCLElBQTNCO0FBRFI7QUFEVCxXQUdTLENBSFQ7UUFJUSxNQUFBLEdBQVMsSUFBQyxDQUFBLHFCQUFELENBQXVCLElBQXZCLEVBQTZCLElBQTdCLEVBQW1DLE1BQW5DO0FBRFI7QUFIVCxXQUtTLENBTFQ7UUFNUSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUFELENBQTJCLElBQTNCLEVBQWlDLElBQWpDLEVBQXVDLE1BQXZDO0FBTmpCO0FBUUEsV0FBTztFQVhNOzs7QUFhakI7Ozs7Ozs7OzswQkFRQSxtQkFBQSxHQUFxQixTQUFDLElBQUQsRUFBTyxJQUFQO0FBQ2pCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFFVCxzQ0FBVyxDQUFFLGNBQWI7TUFDSSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWxCO1FBQ0ksUUFBQSxHQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFNLENBQUEsSUFBQSxHQUFPLFdBQVAsQ0FBbUIsQ0FBQyxLQUF2RCxDQUE2RCxTQUFDLENBQUQ7aUJBQU8sQ0FBQyxDQUFDLElBQUYsS0FBVTtRQUFqQixDQUE3RDtRQUNYLElBQTJCLGdCQUEzQjtVQUFBLE1BQUEsR0FBUyxRQUFRLENBQUMsTUFBbEI7U0FGSjtPQUFBLE1BR0ssSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQU0sQ0FBQSxJQUFBLEdBQU8sV0FBUCxDQUFsQjtRQUNELFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQU0sQ0FBQSxJQUFBLEdBQU8sV0FBUCxDQUFtQixDQUFDLEtBQW5DLENBQXlDLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsSUFBRixLQUFVO1FBQWpCLENBQXpDO1FBRVgsSUFBRyxnQkFBSDtVQUNJLE1BQUEsR0FBUyxRQUFRLENBQUMsTUFEdEI7U0FBQSxNQUFBO1VBR0ksT0FBTyxDQUFDLElBQVIsQ0FBYSx5Q0FBQSxHQUE0QyxJQUFBLENBQUssQ0FBQyxVQUFELEdBQVksSUFBWixHQUFpQixHQUF0QixDQUF6RCxFQUhKO1NBSEM7T0FKVDs7QUFZQSxXQUFPO0VBZlU7OztBQWlCckI7Ozs7Ozs7Ozs7MEJBU0EscUJBQUEsR0FBdUIsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE1BQWI7QUFDbkIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxXQUFXLENBQUMsa0JBQVosQ0FBK0Isa0JBQS9CO0lBQ1osaUJBQUEsR0FBb0IsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFSLEtBQWtCO0lBQXpCLENBQWhCOztNQUNwQixvQkFBcUIsU0FBVSxDQUFBLENBQUE7O0lBRS9CLElBQUcsaUJBQUg7TUFDSSxRQUFBLEdBQVcsaUJBQWlCLENBQUMsS0FBTSxDQUFBLElBQUEsR0FBTyxHQUFQLENBQVcsQ0FBQyxLQUFwQyxDQUEwQyxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsSUFBRixLQUFVO01BQWpCLENBQTFDO01BQ1gsSUFBRyxRQUFIO1FBQ0ksTUFBQSxHQUFTLFFBQVEsQ0FBQyxNQUR0QjtPQUFBLE1BQUE7UUFHSSxPQUFPLENBQUMsSUFBUixDQUFhLHlDQUFBLEdBQTBDLElBQTFDLEdBQStDLGdCQUEvQyxHQUErRCxJQUEvRCxHQUFvRSxHQUFqRixFQUhKO09BRko7O0FBT0EsV0FBTztFQWJZOzs7QUFldkI7Ozs7Ozs7Ozs7MEJBU0EseUJBQUEsR0FBMkIsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE1BQWI7QUFDdkIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxXQUFXLENBQUMsa0JBQVosQ0FBK0Isc0JBQS9CO0lBQ1osaUJBQUEsR0FBb0IsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFSLEtBQWtCO0lBQXpCLENBQWhCOztNQUNwQixvQkFBcUIsU0FBVSxDQUFBLENBQUE7O0lBRS9CLElBQUcsaUJBQUg7TUFDSSxRQUFBLEdBQVcsaUJBQWlCLENBQUMsS0FBTSxDQUFBLElBQUEsR0FBTyxHQUFQLENBQVcsQ0FBQyxLQUFwQyxDQUEwQyxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsSUFBRixLQUFVO01BQWpCLENBQTFDO01BQ1gsSUFBRyxnQkFBSDtRQUNJLE1BQUEsR0FBUyxRQUFRLENBQUMsTUFEdEI7T0FBQSxNQUFBO1FBR0ksT0FBTyxDQUFDLElBQVIsQ0FBYSx5Q0FBQSxHQUEwQyxJQUExQyxHQUErQyxnQkFBL0MsR0FBK0QsSUFBL0QsR0FBb0UsR0FBakYsRUFISjtPQUZKOztBQU9BLFdBQU87RUFiZ0I7OztBQWUzQjs7Ozs7Ozs7OzBCQVFBLHFCQUFBLEdBQXVCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLE1BQXRCO0lBQ25CLElBQUcsS0FBQSxLQUFTLENBQVo7YUFDSSxJQUFDLENBQUEsaUJBQWtCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxDQUEzQixHQUFvQyxNQUR4QztLQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUNELElBQUMsQ0FBQSxlQUFnQixDQUFBLE1BQUEsSUFBUSxDQUFSLENBQVcsQ0FBQSxLQUFBLENBQTVCLEdBQXFDLE1BRHBDO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFiLEdBQXNCLE1BSHJCOztFQUhjOzs7QUFRdkI7Ozs7Ozs7OzBCQU9BLGdCQUFBLEdBQWtCLFNBQUMsUUFBRCxFQUFXLEtBQVg7SUFDZCxJQUFHLFFBQVEsQ0FBQyxLQUFULEtBQWtCLENBQXJCO2FBQ0ksSUFBQyxDQUFBLGlCQUFrQixDQUFBLFFBQVEsQ0FBQyxNQUFULElBQWlCLENBQWpCLENBQW9CLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBdkMsR0FBeUQsTUFEN0Q7S0FBQSxNQUVLLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDRCxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxRQUFRLENBQUMsTUFBVCxJQUFpQixDQUFqQixDQUFvQixDQUFBLFFBQVEsQ0FBQyxLQUFULENBQXJDLEdBQXVELE1BRHREO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxXQUFZLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBYixHQUErQixNQUg5Qjs7RUFIUzs7O0FBUWxCOzs7Ozs7OzswQkFPQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLEtBQVg7SUFDYixJQUFHLFFBQVEsQ0FBQyxLQUFULEtBQWtCLENBQXJCO2FBQ0ksSUFBQyxDQUFBLGVBQWdCLENBQUEsUUFBUSxDQUFDLE1BQVQsSUFBaUIsQ0FBakIsQ0FBb0IsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFyQyxHQUF1RCxNQUQzRDtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxhQUFjLENBQUEsUUFBUSxDQUFDLE1BQVQsSUFBaUIsQ0FBakIsQ0FBb0IsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFuQyxHQUFxRCxNQURwRDtLQUFBLE1BQUE7YUFHRCxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQVEsQ0FBQyxLQUFULENBQVgsR0FBNkIsTUFINUI7O0VBSFE7OztBQVNqQjs7Ozs7Ozs7MEJBT0EsaUJBQUEsR0FBbUIsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNmLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEsa0JBQW1CLENBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBaUIsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFyQyxHQUF1RCxNQUQzRDtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxRQUFRLENBQUMsTUFBVCxDQUFpQixDQUFBLFFBQVEsQ0FBQyxLQUFULENBQW5DLEdBQXFELE1BRHBEO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZCxHQUFnQyxNQUgvQjs7RUFIVTs7O0FBUW5COzs7Ozs7Ozs7MEJBUUEsc0JBQUEsR0FBd0IsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEI7SUFDcEIsSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUNJLElBQUMsQ0FBQSxrQkFBbUIsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQTVCLEdBQXFDLE1BRHpDO0tBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxDQUFaO2FBQ0QsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBMUIsR0FBbUMsTUFEbEM7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFlBQWEsQ0FBQSxLQUFBLENBQWQsR0FBdUIsTUFIdEI7O0VBSGU7OztBQVF4Qjs7Ozs7Ozs7MEJBT0EsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNkLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEsaUJBQWtCLENBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBaUIsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFwQyxHQUFzRCxNQUQxRDtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxlQUFnQixDQUFBLFFBQVEsQ0FBQyxNQUFULENBQWlCLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBbEMsR0FBb0QsTUFEbkQ7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFdBQVksQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFiLEdBQStCLE1BSDlCOztFQUhTOzs7QUFRbEI7Ozs7Ozs7OzswQkFRQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixNQUF0QjtJQUNuQixJQUFHLEtBQUEsS0FBUyxDQUFaO2FBQ0ksSUFBQyxDQUFBLGlCQUFrQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBM0IsR0FBb0MsTUFEeEM7S0FBQSxNQUVLLElBQUcsS0FBQSxLQUFTLENBQVo7YUFDRCxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQXpCLEdBQWtDLE1BRGpDO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFiLEdBQXNCLE1BSHJCOztFQUhjOzs7QUFRdkI7Ozs7Ozs7OzBCQU9BLFlBQUEsR0FBYyxTQUFDLE1BQUQ7QUFDVixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBRyxnQkFBQSxJQUFZLHNCQUFmO01BQ0ksSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFEN0M7T0FBQSxNQUVLLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7UUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQWMsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFEdEM7T0FBQSxNQUFBO1FBR0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFVLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFIbkI7T0FIVDtLQUFBLE1BQUE7TUFRSSxNQUFBLEdBQVMsT0FSYjs7QUFVQSxXQUFPLE1BQUEsSUFBVTtFQVpQOzs7QUFjZDs7Ozs7Ozs7OzBCQVFBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxNQUFmO0FBQ2hCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFFVCxJQUFHLEtBQUEsS0FBUyxDQUFaO01BQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLEVBRHhDO0tBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxDQUFaO01BQ0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxlQUFnQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsRUFEakM7S0FBQSxNQUFBO01BR0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxFQUhyQjs7QUFLTCxXQUFPO0VBVlM7OztBQVlwQjs7Ozs7Ozs7MEJBT0EsYUFBQSxHQUFlLFNBQUMsTUFBRDtBQUNYLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUFHLGdCQUFBLElBQVksc0JBQWY7TUFDSSxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFEL0M7T0FBQSxNQUVLLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7UUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBRHhDO09BQUEsTUFBQTtRQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBSHJCO09BSFQ7S0FBQSxNQUFBO01BU0ksTUFBQSxHQUFTLE9BVGI7O0FBV0EsV0FBTyxNQUFBLElBQVU7RUFiTjs7O0FBZWY7Ozs7Ozs7OzBCQU9BLGFBQUEsR0FBZSxTQUFDLE1BQUQ7QUFDWCxRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBRyxnQkFBQSxJQUFZLHNCQUFmO01BQ0ksSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQWtCLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBRC9DO09BQUEsTUFFSyxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxlQUFnQixDQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWUsQ0FBQSxNQUFNLENBQUMsS0FBUCxFQUR4QztPQUFBLE1BQUE7UUFHRCxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVksQ0FBQSxNQUFNLENBQUMsS0FBUCxFQUhyQjtPQUhUO0tBQUEsTUFBQTtNQVFJLE1BQUEsR0FBUyxPQVJiOztBQVVBLFdBQU8sTUFBQSxJQUFVO0VBWk47OztBQWNmOzs7Ozs7Ozs7MEJBUUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7QUFDaEIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUVULElBQUcsS0FBQSxLQUFTLENBQVo7TUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLGlCQUFrQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsRUFEeEM7S0FBQSxNQUVLLElBQUcsS0FBQSxLQUFTLENBQVo7TUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxFQURqQztLQUFBLE1BQUE7TUFHRCxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVksQ0FBQSxLQUFBLEVBSHJCOztBQUtMLFdBQU8sTUFBQSxJQUFVO0VBVkQ7OztBQVlwQjs7Ozs7Ozs7MEJBT0EsY0FBQSxHQUFnQixTQUFDLE1BQUQ7QUFDWixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBRyxnQkFBQSxJQUFZLHNCQUFmO01BQ0ksSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsa0JBQW1CLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLENBQW5DLElBQW9ELE1BRGpFO09BQUEsTUFFSyxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBakMsSUFBa0QsTUFEMUQ7T0FBQSxNQUFBO1FBR0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFhLENBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBZCxJQUErQixNQUh2QztPQUhUO0tBQUEsTUFBQTtNQVNJLE1BQUEsR0FBWSxNQUFILEdBQWUsSUFBZixHQUF5QixNQVR0Qzs7QUFXQSxXQUFPO0VBYks7OztBQWVoQjs7Ozs7Ozs7OzBCQVFBLG1CQUFBLEdBQXFCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxNQUFmO0FBQ2pCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFFVCxJQUFHLEtBQUEsS0FBUyxDQUFaO01BQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQTNCLElBQXFDLE1BRGxEO0tBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxDQUFaO01BQ0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQTFCLElBQW9DLE1BRDVDO0tBQUEsTUFBQTtNQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBYSxDQUFBLEtBQUEsQ0FBZCxJQUF3QixNQUhoQzs7QUFLTCxXQUFPO0VBVlU7Ozs7OztBQVl6QixFQUFFLENBQUMsYUFBSCxHQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogVmFyaWFibGVTdG9yZVxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVmFyaWFibGVTdG9yZVxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBlcnNpc3RlbnROdW1iZXJzXCIsIFwicGVyc2lzdGVudFN0cmluZ3NcIiwgXCJwZXJzaXN0ZW50Qm9vbGVhbnNcIiwgXCJwZXJzaXN0ZW50TGlzdHNcIl1cbiAgICBcbiAgICAjIyMqXG4gICAgKiA8cD5BIHN0b3JhZ2UgZm9yIGRpZmZlcmVudCBraW5kIG9mIGdhbWUgdmFyaWFibGVzLiBUaGUgZm9sbG93aW5nIHNjb3Blc1xuICAgICogZm9yIHZhcmlhYmxlcyBleGlzdDo8L3A+XG4gICAgKiBcbiAgICAqIC0gTG9jYWwgVmFyaWFibGVzIC0+IE9ubHkgdmFsaWQgZm9yIHRoZSBjdXJyZW50IHNjZW5lLlxuICAgICogLSBHbG9iYWwgVmFyaWFibGVzIC0+IFZhbGlkIGZvciB0aGUgd2hvbGUgZ2FtZSBidXQgYm91bmQgdG8gYSBzaW5nbGUgc2F2ZS1nYW1lLlxuICAgICogLSBQZXJzaXN0ZW50IFZhcmlhYmxlcyAtPiBWYWxpZCBmb3IgdGhlIHdob2xlIGdhbWUgaW5kZXBlbnRlbnQgZnJvbSB0aGUgc2F2ZS1nYW1lcy5cbiAgICAqIFxuICAgICogPHA+VGhlIGZvbGxvd2luZyBkYXRhLXR5cGVzIGV4aXN0OjwvcD5cbiAgICAqIC0gU3RyaW5ncyAtPiBWYXJpYWJsZXMgc3RvcmluZyB0ZXh0IGRhdGEuXG4gICAgKiAtIE51bWJlcnMgLT4gVmFyaWFibGVzIHN0b3JpbmcgaW50ZWdlciBudW1iZXIgdmFsdWVzLlxuICAgICogLSBCb29sZWFucyAtPiBWYXJpYWJsZXMgc3RvcmluZyBib29sZWFuIHZhbHVlcy4gKENhbGxlZCBcIlN3aXRjaGVzXCIgZm9yIGVhc2llciB1bmRlcnN0YW5kaW5nKVxuICAgICogLSBMaXN0cyAtPiBWYXJpYWJsZXMgc3RvcmluZyBtdWx0aXBsZSBvdGhlciB2YXJpYWJsZXMuIExpc3RzIGNhbiBhbHNvIGNvbnRhaW4gTGlzdHMuXG4gICAgKiA8cD5cbiAgICAqIExvY2FsIHZhcmlhYmxlcyBhcmUgc3RvcmVkIGJ5IHNjZW5lIFVJRC4gRm9yIGVhY2ggc2NlbmUgVUlEIGEgbGlzdCBvZiBsb2NhbCB2YXJpYWJsZXMgaXMgc3RvcmVkLjwvcD5cbiAgICAqIFxuICAgICogPHA+R2xvYmFsIGFuZCBwZXJzaXN0ZW50IHZhcmlhYmxlcyBhcmUgc3RvcmVkIGFuZCBhIHNwZWNpZmljIGRvbWFpbi4gQSBkb21haW4gaXMganVzdCBhIHVuaXF1ZSBuYW1lIHN1Y2hcbiAgICAqIGFzIDxpPmNvbS5leGFtcGxlLmdhbWU8L2k+IGZvciBleGFtcGxlLiBUaGUgZGVmYXVsdCBkb21haW4gaXMgYW4gZW1wdHkgc3RyaW5nLiBEb21haW5zIGFyZSB1c2VmdWwgdG8gYXZvaWRcbiAgICAqIG92ZXJsYXBwaW5nIG9mIHZhcmlhYmxlIG51bWJlcnMgd2hlbiBzaGFyaW5nIGNvbnRlbnQgd2l0aCBvdGhlciB1c2Vycy4gPC9wPlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBWYXJpYWJsZVN0b3JlXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VycmVudCBsb2NhbCB2YXJpYWJsZSBjb250ZXh0XG4gICAgICAgICogQHByb3BlcnR5IGNvbnRleHRcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb250ZXh0ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgZG9tYWluIGZvciBnbG9iYWwgYW5kIHBlcnNpc3RlbnQgdmFyaWFibGVzLiBFYWNoIGRvbWFpbiBoYXMgaXRzIG93blxuICAgICAgICAqIHZhcmlhYmxlcy4gUGxlYXNlIHVzZSA8Yj5jaGFuZ2VEb21haW48L2I+IG1ldGhvZCB0byBjaGFuZ2UgdGhlIGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZG9tYWluXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAZG9tYWluID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIExpc3Qgb2YgYXZhaWxhYmxlIGRvbWFpbnMgZm9yIGdsb2JhbCBhbmQgcGVyc2lzdGVudCB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGRvbWFpbnNcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGRvbWFpbnMgPSBbXCJcIl1cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2xvYmFsIG51bWJlciB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBudW1iZXJzXG4gICAgICAgICogQHR5cGUgbnVtYmVyW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBudW1iZXJzID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBib29sZWFuIHZhcmlhYmxlcyBvZiB0aGUgY3VycmVudCBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IGJvb2xlYW5zXG4gICAgICAgICogQHR5cGUgYm9vbGVhbltdXG4gICAgICAgICMjI1xuICAgICAgICBAYm9vbGVhbnMgPSBudWxsXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2xvYmFsIHN0cmluZyB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzdHJpbmdzXG4gICAgICAgICogQHR5cGUgc3RyaW5nW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBzdHJpbmdzID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBsaXN0IHZhcmlhYmxlcyBvZiB0aGUgY3VycmVudCBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IGxpc3RzXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11bXVxuICAgICAgICAjIyNcbiAgICAgICAgQGxpc3RzID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBzdG9yYWdlIG9mIGFsbCBnbG9iYWwgdmFyaWFibGVzIGJ5IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZ2xvYmFsVmFyaWFibGVzQnlEb21haW5cbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAZ2xvYmFsVmFyaWFibGVzQnlEb21haW4gPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBzdG9yYWdlIG9mIGFsbCBwZXJzaXN0ZW50IHZhcmlhYmxlcyBieSBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IHBlcnNpc3RlbnRWYXJpYWJsZXNCeURvbWFpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50VmFyaWFibGVzQnlEb21haW4gPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBwZXJzaXN0ZW50IG51bWJlciB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50TnVtYmVyc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudE51bWJlcnMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBlcnNpc3RlbnQgc3RyaW5nIHZhcmlhYmxlcyBvZiB0aGUgY3VycmVudCBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IHBlcnNpc3RlbnRTdHJpbmdzXG4gICAgICAgICogQHR5cGUgc3RyaW5nW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50U3RyaW5ncyA9IFtdXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcGVyc2lzdGVudCBib29sZWFuIHZhcmlhYmxlcyBvZiB0aGUgY3VycmVudCBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IHBlcnNpc3RlbnRCb29sZWFuc1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5bXVxuICAgICAgICAjIyNcbiAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFucyA9IFtdXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcGVyc2lzdGVudCBsaXN0IHZhcmlhYmxlcyBvZiB0aGUgY3VycmVudCBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IHBlcnNpc3RlbnRMaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50TGlzdHMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxvY2FsIG51bWJlciB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsTnVtYmVyc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsTnVtYmVycyA9IHt9XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbG9jYWwgc3RyaW5nIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxTdHJpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAbG9jYWxTdHJpbmdzID0ge31cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBsb2NhbCBib29sZWFuIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxCb29sZWFuc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsQm9vbGVhbnMgPSB7fVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxvY2FsIGxpc3QgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb2NhbExpc3RzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAbG9jYWxMaXN0cyA9IHt9XG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgdGVtcE51bWJlcnNcbiAgICAgICAgKiBAdHlwZSBudW1iZXJbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHRlbXBOdW1iZXJzID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBTdHJpbmdzXG4gICAgICAgICogQHR5cGUgc3RyaW5nW11cbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wU3RyaW5ncyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb2NhbEJvb2xlYW5zXG4gICAgICAgICogQHR5cGUgbnVtYmVyW11cbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wQm9vbGVhbnMgPSBudWxsXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxMaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wTGlzdHMgPSBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICogXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBkb21haW5zID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwiZ2xvYmFsX3ZhcmlhYmxlc1wiKS5zZWxlY3QgKGQpIC0+IGQuaXRlbXMuZG9tYWluXG4gICAgICAgIFxuICAgICAgICBmb3IgZG9tYWluLCBpIGluIGRvbWFpbnNcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5bZG9tYWluXSA9IEBudW1iZXJzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBzdHJpbmdzQnlEb21haW5bZG9tYWluXSA9IEBzdHJpbmdzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBib29sZWFuc0J5RG9tYWluW2RvbWFpbl0gPSBAYm9vbGVhbnNCeURvbWFpbltpXVxuICAgICAgICAgICAgQGxpc3RzQnlEb21haW5bZG9tYWluXSA9IEBsaXN0c0J5RG9tYWluW2ldXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgIFxuICAgIHNldHVwR2xvYmFsRG9tYWluczogKCkgLT5cbiAgICAgICAgQG51bWJlcnNCeURvbWFpbiA9IFtdXG4gICAgICAgIEBzdHJpbmdzQnlEb21haW4gPSBbXVxuICAgICAgICBAYm9vbGVhbnNCeURvbWFpbiA9IFtdXG4gICAgICAgIEBsaXN0c0J5RG9tYWluID0gW11cbiAgICAgICAgXG4gICAgICAgIGZvciBkb21haW4sIGkgaW4gQGRvbWFpbnNcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5bZG9tYWluXSA9IEBudW1iZXJzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBzdHJpbmdzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgICAgIEBzdHJpbmdzQnlEb21haW5bZG9tYWluXSA9IEBzdHJpbmdzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBib29sZWFuc0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpbltkb21haW5dID0gQGJvb2xlYW5zQnlEb21haW5baV1cbiAgICAgICAgICAgIEBsaXN0c0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpbltkb21haW5dID0gQGxpc3RzQnlEb21haW5baV1cbiAgICAgICAgICAgIFxuICAgICAgICBAbnVtYmVycyA9IEBudW1iZXJzQnlEb21haW5bMF1cbiAgICAgICAgQHN0cmluZ3MgPSBAc3RyaW5nc0J5RG9tYWluWzBdXG4gICAgICAgIEBib29sZWFucyA9IEBib29sZWFuc0J5RG9tYWluWzBdXG4gICAgICAgIEBsaXN0cyA9IEBudW1iZXJzQnlEb21haW5bMF1cbiAgICAgICAgXG4gICAgc2V0dXBQZXJzaXN0ZW50RG9tYWluczogKGRvbWFpbnMpIC0+XG4gICAgICAgIGZvciBkb21haW4sIGkgaW4gQGRvbWFpbnNcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc1tpXSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc1tkb21haW5dID0gQHBlcnNpc3RlbnROdW1iZXJzW2ldXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NbaV0gPSBuZXcgQXJyYXkoMTApXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NbZG9tYWluXSA9IEBwZXJzaXN0ZW50U3RyaW5nc1tpXVxuICAgICAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc1tpXSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNbZG9tYWluXSA9IEBwZXJzaXN0ZW50Qm9vbGVhbnNbaV1cbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TGlzdHNbaV0gPSBuZXcgQXJyYXkoMTApXG4gICAgICAgICAgICBAcGVyc2lzdGVudExpc3RzW2RvbWFpbl0gPSBAcGVyc2lzdGVudExpc3RzW2ldXG4gICAgICAgICAgICBcbiAgICBzZXR1cERvbWFpbnM6IChkb21haW5zKSAtPlxuICAgICAgICBAZG9tYWlucyA9IGRvbWFpbnNcbiAgICAgICAgQHNldHVwR2xvYmFsRG9tYWlucygpXG4gICAgICAgIEBzZXR1cFBlcnNpc3RlbnREb21haW5zKClcbiAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAqXG4gICAgKiBAZGVwcmVjYXRlZFxuICAgICogQG1ldGhvZCBjaGFuZ2VEb21haW5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgZG9tYWluIHRvIGNoYW5nZSB0by5cbiAgICAjIyMgXG4gICAgY2hhbmdlRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAZG9tYWluID0gZG9tYWluXG4gICAgICAgIGdsb2JhbFZhcmlhYmxlcyA9IEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbltkb21haW5dXG4gICAgICAgIHBlcnNpc3RlbnRWYXJpYWJsZXMgPSBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluW2RvbWFpbl1cbiAgICAgICAgXG4gICAgICAgIGlmICFnbG9iYWxWYXJpYWJsZXNcbiAgICAgICAgICAgIGdsb2JhbFZhcmlhYmxlcyA9IEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbltkb21haW5dID0geyBudW1iZXJzOiBuZXcgQXJyYXkoNTAwKSwgc3RyaW5nczogbmV3IEFycmF5KDUwMCksIGJvb2xlYW5zOiBuZXcgQXJyYXkoNTAwKSwgbGlzdHM6IG5ldyBBcnJheSg1MDApIH1cbiAgICAgICAgaWYgIXBlcnNpc3RlbnRWYXJpYWJsZXNcbiAgICAgICAgICAgIHBlcnNpc3RlbnRWYXJpYWJsZXMgPSBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluW2RvbWFpbl0gPSB7IG51bWJlcnM6IG5ldyBBcnJheSg1MDApLCBzdHJpbmdzOiBuZXcgQXJyYXkoNTAwKSwgYm9vbGVhbnM6IG5ldyBBcnJheSg1MDApLCBsaXN0czogbmV3IEFycmF5KDUwMCkgfSAgICBcbiAgICAgICAgXG4gICAgICAgIEBudW1iZXJzID0gZ2xvYmFsVmFyaWFibGVzLm51bWJlcnNcbiAgICAgICAgQHN0cmluZ3MgPSBnbG9iYWxWYXJpYWJsZXMuc3RyaW5nc1xuICAgICAgICBAYm9vbGVhbnMgPSBnbG9iYWxWYXJpYWJsZXMuYm9vbGVhbnNcbiAgICAgICAgQGxpc3RzID0gZ2xvYmFsVmFyaWFibGVzLmxpc3RzXG4gICAgICAgIEBwZXJzaXN0ZW50TnVtYmVycyA9IHBlcnNpc3RlbnRWYXJpYWJsZXMubnVtYmVyc1xuICAgICAgICBAcGVyc2lzdGVudEJvb2xlYW5zID0gcGVyc2lzdGVudFZhcmlhYmxlcy5ib29sZWFuc1xuICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3MgPSBwZXJzaXN0ZW50VmFyaWFibGVzLnN0cmluZ3NcbiAgICAgICAgQHBlcnNpc3RlbnRMaXN0cyA9IHBlcnNpc3RlbnRWYXJpYWJsZXMubGlzdHNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIGFsbCBnbG9iYWwgdmFyaWFibGVzXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckdsb2JhbFZhcmlhYmxlc1xuICAgICMjIyBcbiAgICBjbGVhckFsbEdsb2JhbFZhcmlhYmxlczogLT5cbiAgICAgICAgQHNldHVwR2xvYmFsRG9tYWlucygpXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZ2xvYmFsVmFyaWFibGVzID0gQGdsb2JhbFZhcmlhYmxlc0J5RG9tYWluW0Bkb21haW5dXG4gICAgICAgIEBudW1iZXJzQnlEb21haW4gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgZ2xvYmFsVmFyaWFibGVzLmJvb2xlYW5zID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgIGdsb2JhbFZhcmlhYmxlcy5zdHJpbmdzID0gbmV3IEFycmF5KDEwMDApXG4gICAgXG4gICAgICAgIEBudW1iZXJzID0gZ2xvYmFsVmFyaWFibGVzLm51bWJlcnNcbiAgICAgICAgQHN0cmluZ3MgPSBnbG9iYWxWYXJpYWJsZXMuc3RyaW5nc1xuICAgICAgICBAYm9vbGVhbnMgPSBnbG9iYWxWYXJpYWJsZXMuYm9vbGVhbnNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgYWxsIGxvY2FsIHZhcmlhYmxlcyBmb3IgYWxsIGNvbnRleHRzL3NjZW5lcy9jb21tb24tZXZlbnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJBbGxMb2NhbFZhcmlhYmxlc1xuICAgICMjIyBcbiAgICBjbGVhckFsbExvY2FsVmFyaWFibGVzOiAtPlxuICAgICAgICBAbG9jYWxOdW1iZXJzID0ge31cbiAgICAgICAgQGxvY2FsU3RyaW5ncyA9IHt9XG4gICAgICAgIEBsb2NhbEJvb2xlYW5zID0ge31cbiAgICAgICAgQGxvY2FsTGlzdHMgPSB7fVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgc3BlY2lmaWVkIHZhcmlhYmxlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcltdfSBudW1iZXJzIC0gVGhlIG51bWJlciB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzdHJpbmdzIC0gVGhlIHN0cmluZyB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW5bXX0gYm9vbGVhbnMgLSBUaGUgYm9vbGVhbiB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge0FycmF5W119IGxpc3RzIC0gVGhlIGxpc3QgdmFyaWFibGVzIHRvIGNsZWFyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBEZXRlcm1pbmVzIHdoYXQga2luZCBvZiB2YXJpYWJsZXMgc2hvdWxkIGJlIGNsZWFyZWQuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+MCA9IEFsbDwvbGk+XG4gICAgKiA8bGk+MSA9IFN3aXRjaGVzIC8gQm9vbGVhbnM8L2xpPlxuICAgICogPGxpPjIgPSBOdW1iZXJzPC9saT5cbiAgICAqIDxsaT4zID0gVGV4dHM8L2xpPlxuICAgICogPGxpPjQgPSBMaXN0czwvbGk+XG4gICAgKiA8L3VsPlxuICAgICogQHBhcmFtIHtPYmplY3R9IHJhbmdlIC0gVGhlIHZhcmlhYmxlIGlkLXJhbmdlIHRvIGNsZWFyLiBJZiA8Yj5udWxsPC9iPiBhbGwgc3BlY2lmaWVkIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyMgIFxuICAgIGNsZWFyVmFyaWFibGVzOiAobnVtYmVycywgc3RyaW5ncywgYm9vbGVhbnMsIGxpc3RzLCB0eXBlLCByYW5nZSkgLT5cbiAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIEFsbFxuICAgICAgICAgICAgICAgIG51bWJlcnM/LmZpbGwoMCwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgICAgICBzdHJpbmdzPy5maWxsKFwiXCIsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgYm9vbGVhbnM/LmZpbGwoZmFsc2UsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgbGlzdHM/LmZpbGwoW10sIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICBib29sZWFucz8uZmlsbChmYWxzZSwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgIHdoZW4gMiAjIE51bWJlclxuICAgICAgICAgICAgICAgIG51bWJlcnM/LmZpbGwoMCwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgIHdoZW4gMyAjIFRleHRcbiAgICAgICAgICAgICAgICBzdHJpbmdzPy5maWxsKFwiXCIsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDQgIyBMaXN0XG4gICAgICAgICAgICAgICAgbGlzdHM/LmZpbGwoW10sIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIGFsbCBsb2NhbCB2YXJpYWJsZXMgZm9yIGEgc3BlY2lmaWVkIGNvbnRleHQuIElmIHRoZSBjb250ZXh0IGlzIG5vdCBzcGVjaWZpZWQsIGFsbFxuICAgICogbG9jYWwgdmFyaWFibGVzIGZvciBhbGwgY29udGV4dHMvc2NlbmVzL2NvbW1vbi1ldmVudHMgYXJlIGNsZWFyZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckxvY2FsVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0IHRvIGNsZWFyIHRoZSBsb2NhbCB2YXJpYWJsZXMgZm9yLiBJZiA8Yj5udWxsPC9iPiwgYWxsXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjICBcbiAgICBjbGVhckxvY2FsVmFyaWFibGVzOiAoY29udGV4dCwgdHlwZSwgcmFuZ2UpIC0+XG4gICAgICAgIGlmIGNvbnRleHQ/XG4gICAgICAgICAgICBpZHMgPSBbY29udGV4dC5pZF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWRzID0gT2JqZWN0LmtleXMoQGxvY2FsTnVtYmVycylcbiAgICAgICAgICAgIFxuICAgICAgICBpZiByYW5nZT9cbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogMCwgZW5kOiBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGlkIGluIGlkc1xuICAgICAgICAgICAgQGNsZWFyVmFyaWFibGVzKEBsb2NhbE51bWJlcnNbaWRdLCBAbG9jYWxTdHJpbmdzW2lkXSwgQGxvY2FsQm9vbGVhbnNbaWRdLCBAbG9jYWxMaXN0c1tpZF0sIHR5cGUsIHJhbmdlKVxuIFxuICAgICMjIypcbiAgICAqIENsZWFycyBnbG9iYWwgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJHbG9iYWxWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIC0gRGV0ZXJtaW5lcyB3aGF0IGtpbmQgb2YgdmFyaWFibGVzIHNob3VsZCBiZSBjbGVhcmVkLlxuICAgICogPHVsPlxuICAgICogPGxpPjAgPSBBbGw8L2xpPlxuICAgICogPGxpPjEgPSBTd2l0Y2hlcyAvIEJvb2xlYW5zPC9saT5cbiAgICAqIDxsaT4yID0gTnVtYmVyczwvbGk+XG4gICAgKiA8bGk+MyA9IFRleHRzPC9saT5cbiAgICAqIDxsaT40ID0gTGlzdHM8L2xpPlxuICAgICogPC91bD5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByYW5nZSAtIFRoZSB2YXJpYWJsZSBpZC1yYW5nZSB0byBjbGVhci4gSWYgPGI+bnVsbDwvYj4gYWxsIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyMgXG4gICAgY2xlYXJHbG9iYWxWYXJpYWJsZXM6ICh0eXBlLCByYW5nZSkgLT5cbiAgICAgICAgaWYgcmFuZ2U/XG4gICAgICAgICAgICByYW5nZSA9IHN0YXJ0OiByYW5nZS5zdGFydCwgZW5kOiByYW5nZS5lbmQgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IDAsIGVuZDogbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIEBjbGVhclZhcmlhYmxlcyhAbnVtYmVycywgQHN0cmluZ3MsIEBib29sZWFucywgQGxpc3RzLCB0eXBlLCByYW5nZSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHBlcnNpc3RlbnQgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjIFxuICAgIGNsZWFyUGVyc2lzdGVudFZhcmlhYmxlczogKHR5cGUsIHJhbmdlKSAtPlxuICAgICAgICBpZiByYW5nZT9cbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogMCwgZW5kOiBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgQGNsZWFyVmFyaWFibGVzKEBwZXJzaXN0ZW50TnVtYmVycywgQHBlcnNpc3RlbnRzdHJpbmdzLCBAcGVyc2lzdGVudEJvb2xlYW5zLCBAcGVyc2lzdGVudExpc3RzLCB0eXBlLCByYW5nZSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHZhcmlhYmxlcy4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VzLiAoTGlrZSBhZnRlciBhIHNjZW5lIGNoYW5nZSlcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpIG5lZWRlZCBmb3IgbG9jYWwgdmFyaWFibGVzLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjIyAgICAgXG4gICAgc2V0dXA6IChjb250ZXh0KSAtPlxuICAgICAgICBAc2V0dXBMb2NhbFZhcmlhYmxlcyhjb250ZXh0KVxuICAgICAgICBAc2V0dXBUZW1wVmFyaWFibGVzKGNvbnRleHQpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGxvY2FsIHZhcmlhYmxlcyBmb3IgdGhlIHNwZWNpZmllZCBjb250ZXh0LiBTaG91bGQgYmUgY2FsbGVkIG9uIGZpcnN0IHRpbWUgdXNlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBMb2NhbFZhcmlhYmxlc1xuICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBUaGUgY29udGV4dChjdXJyZW50IHNjZW5lKS4gTmVlZHMgaGF2ZSBhdCBsZWFzdCBhbiBpZC1wcm9wZXJ0eS5cbiAgICAjIyNcbiAgICBzZXR1cExvY2FsVmFyaWFibGVzOiAoY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwVmFyaWFibGVzKGNvbnRleHQsIFwibG9jYWxOdW1iZXJzXCIsIDApXG4gICAgICAgIEBzZXR1cFZhcmlhYmxlcyhjb250ZXh0LCBcImxvY2FsU3RyaW5nc1wiLCBcIlwiKVxuICAgICAgICBAc2V0dXBWYXJpYWJsZXMoY29udGV4dCwgXCJsb2NhbEJvb2xlYW5zXCIsIG5vKVxuICAgICAgICBAc2V0dXBWYXJpYWJsZXMoY29udGV4dCwgXCJsb2NhbExpc3RzXCIsIFtdKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc3BlY2lmaWVkIGtpbmQgb2YgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWYXJpYWJsZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gVGhlIGNvbnRleHQoY3VycmVudCBzY2VuZSkuIE5lZWRzIGhhdmUgYXQgbGVhc3QgYW4gaWQtcHJvcGVydHkuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBUaGUga2luZCBvZiB2YXJpYWJsZXMgKHByb3BlcnR5LW5hbWUpLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZSAtIFRoZSBkZWZhdWx0IHZhbHVlIGZvciBlYWNoIHZhcmlhYmxlLlxuICAgICMjIyAgXG4gICAgc2V0dXBWYXJpYWJsZXM6IChjb250ZXh0LCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlKSAtPlxuICAgICAgICBpZiBub3QgdGhpc1twcm9wZXJ0eV1bY29udGV4dC5pZF0/XG4gICAgICAgICAgICB0aGlzW3Byb3BlcnR5XVtjb250ZXh0LmlkXSA9IFtdXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGN1cnJlbnQgdGVtcCB2YXJpYWJsZXMgZm9yIHRoZSBzcGVjaWZpZWQgY29udGV4dC4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VkLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBUZW1wVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjIyAgICBcbiAgICBzZXR1cFRlbXBWYXJpYWJsZXM6IChjb250ZXh0KSAtPlxuICAgICAgICBAY29udGV4dCA9IGNvbnRleHRcbiAgICAgICAgaWYgIUBsb2NhbE51bWJlcnNbY29udGV4dC5pZF1cbiAgICAgICAgICAgIEBzZXR1cExvY2FsVmFyaWFibGVzKGNvbnRleHQpXG4gICAgICAgICAgICBcbiAgICAgICAgQHRlbXBOdW1iZXJzID0gQGxvY2FsTnVtYmVyc1tjb250ZXh0LmlkXVxuICAgICAgICBAdGVtcFN0cmluZ3MgPSBAbG9jYWxTdHJpbmdzW2NvbnRleHQuaWRdXG4gICAgICAgIEB0ZW1wQm9vbGVhbnMgPSBAbG9jYWxCb29sZWFuc1tjb250ZXh0LmlkXVxuICAgICAgICBAdGVtcExpc3RzID0gQGxvY2FsTGlzdHNbY29udGV4dC5pZF1cbiAgICAgICAgXG4gICAgY2xlYXJUZW1wVmFyaWFibGVzOiAoY29udGV4dCkgLT5cbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZS4gSWYgYSB2YXJpYWJsZSB3aXRoIHRoYXRcbiAgICAqIG5hbWUgY2Fubm90IGJlIGZvdW5kLCB0aGUgaW5kZXggd2lsbCBiZSAwLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5kZXhPZlRlbXBWYXJpYWJsZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gZ2V0IHRoZSBpbmRleCBmb3IuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG5hbWU6IG51bWJlciwgc3RyaW5nLCBib29sZWFuIG9yIGxpc3QuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGU6IDAgPSBsb2NhbCwgMSA9IGdsb2JhbCwgMiA9IHBlcnNpc3RlbnQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluIC0gVGhlIHZhcmlhYmxlIGRvbWFpbiB0byBzZWFyY2ggaW4uIElmIG5vdCBzcGVjaWZpZWQsIHRoZSBkZWZhdWx0IGRvbWFpbiB3aWxsIGJlIHVzZWQuXG4gICAgIyMjICBcbiAgICBpbmRleE9mVmFyaWFibGU6IChuYW1lLCB0eXBlLCBzY29wZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggc2NvcGVcbiAgICAgICAgICAgIHdoZW4gMCAjIExvY2FsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGluZGV4T2ZUZW1wVmFyaWFibGUobmFtZSwgdHlwZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIEdsb2JhbFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mR2xvYmFsVmFyaWFibGUobmFtZSwgdHlwZSwgZG9tYWluKVxuICAgICAgICAgICAgd2hlbiAyICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mUGVyc2lzdGVudFZhcmlhYmxlKG5hbWUsIHR5cGUsIGRvbWFpbilcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgbG9jYWwgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICMjIyAgXG4gICAgaW5kZXhPZlRlbXBWYXJpYWJsZTogKG5hbWUsIHR5cGUpIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgXG4gICAgICAgIGlmIEBjb250ZXh0Py5vd25lclxuICAgICAgICAgICAgaWYgQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJWYXJpYWJsZXNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXggaWYgdmFyaWFibGU/XG4gICAgICAgICAgICBlbHNlIGlmIEBjb250ZXh0Lm93bmVyW3R5cGUgKyBcIlZhcmlhYmxlc1wiXVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXJbdHlwZSArIFwiVmFyaWFibGVzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHZhcmlhYmxlP1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YXJpYWJsZS5pbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmFyaWFibGUgcmVmZXJlbmNlZCBieSBuYW1lIG5vdCBmb3VuZDogXCIgKyBuYW1lICtcIihsb2NhbCwgXCIrdHlwZStcIilcIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSBnbG9iYWwgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAtIFRoZSB2YXJpYWJsZSBkb21haW4gdG8gc2VhcmNoIGluLiBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBkb21haW4gd2lsbCBiZSB1c2VkLlxuICAgICMjIyAgXG4gICAgaW5kZXhPZkdsb2JhbFZhcmlhYmxlOiAobmFtZSwgdHlwZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIHZhcmlhYmxlcyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIilcbiAgICAgICAgdmFyaWFibGVzRG9jdW1lbnQgPSB2YXJpYWJsZXMuZmlyc3QgKHYpIC0+IHYuaXRlbXMuZG9tYWluID09IGRvbWFpblxuICAgICAgICB2YXJpYWJsZXNEb2N1bWVudCA/PSB2YXJpYWJsZXNbMF1cbiAgICAgICAgXG4gICAgICAgIGlmIHZhcmlhYmxlc0RvY3VtZW50XG4gICAgICAgICAgICB2YXJpYWJsZSA9IHZhcmlhYmxlc0RvY3VtZW50Lml0ZW1zW3R5cGUgKyBcInNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICBpZiB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhcmlhYmxlLmluZGV4IFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlZhcmlhYmxlIHJlZmVyZW5jZWQgYnkgbmFtZSBub3QgZm91bmQ6ICN7bmFtZX0gKHBlcnNpc3RlbnQsICN7dHlwZX0pXCIpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSBwZXJzaXN0ZW50IHZhcmlhYmxlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLiBJZiBhIHZhcmlhYmxlIHdpdGggdGhhdFxuICAgICogbmFtZSBjYW5ub3QgYmUgZm91bmQsIHRoZSBpbmRleCB3aWxsIGJlIDAuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbmRleE9mVGVtcFZhcmlhYmxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIGluZGV4IGZvci5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgbmFtZTogbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4gb3IgbGlzdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgdmFyaWFibGUgZG9tYWluIHRvIHNlYXJjaCBpbi4gSWYgbm90IHNwZWNpZmllZCwgdGhlIGRlZmF1bHQgZG9tYWluIHdpbGwgYmUgdXNlZC5cbiAgICAjIyMgICAgICBcbiAgICBpbmRleE9mUGVyc2lzdGVudFZhcmlhYmxlOiAobmFtZSwgdHlwZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIHZhcmlhYmxlcyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcInBlcnNpc3RlbnRfdmFyaWFibGVzXCIpXG4gICAgICAgIHZhcmlhYmxlc0RvY3VtZW50ID0gdmFyaWFibGVzLmZpcnN0ICh2KSAtPiB2Lml0ZW1zLmRvbWFpbiA9PSBkb21haW5cbiAgICAgICAgdmFyaWFibGVzRG9jdW1lbnQgPz0gdmFyaWFibGVzWzBdXG4gICAgICAgIFxuICAgICAgICBpZiB2YXJpYWJsZXNEb2N1bWVudFxuICAgICAgICAgICAgdmFyaWFibGUgPSB2YXJpYWJsZXNEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuICAgICAgICAgICAgaWYgdmFyaWFibGU/XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXggXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmFyaWFibGUgcmVmZXJlbmNlZCBieSBuYW1lIG5vdCBmb3VuZDogI3tuYW1lfSAocGVyc2lzdGVudCwgI3t0eXBlfSlcIilcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXROdW1iZXJWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc1tkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgQG51bWJlcnNCeURvbWFpbltkb21haW58fDBdW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wTnVtYmVyc1tpbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgbnVtYmVyIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0TnVtYmVyVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LiBcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXROdW1iZXJWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudE51bWJlcnNbdmFyaWFibGUuZG9tYWlufHwwXVt2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlIGlmIHZhcmlhYmxlLnNjb3BlID09IDFcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5bdmFyaWFibGUuZG9tYWlufHwwXVt2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcE51bWJlcnNbdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIGxpc3QgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRMaXN0T2JqZWN0VG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuIFxuICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgICAgICAgICAgXG4gICAgc2V0TGlzdE9iamVjdFRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudExpc3RzW3ZhcmlhYmxlLmRvbWFpbnx8MF1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiB2YXJpYWJsZS5zY29wZSA9PSAxXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpblt2YXJpYWJsZS5kb21haW58fDBdW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wTGlzdHNbdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcblxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIGJvb2xlYW4gdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRCb29sZWFuVmFsdWVUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC4gXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgICAgICAgICAgICBcbiAgICBzZXRCb29sZWFuVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT5cbiAgICAgICAgaWYgdmFyaWFibGUuc2NvcGUgPT0gMlxuICAgICAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc1t2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgdmFyaWFibGUuc2NvcGUgPT0gMVxuICAgICAgICAgICAgQGJvb2xlYW5zQnlEb21haW5bdmFyaWFibGUuZG9tYWluXVt2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcEJvb2xlYW5zW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgYm9vbGVhbiB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0Qm9vbGVhblZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgIFxuICAgIHNldEJvb2xlYW5WYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNbZG9tYWluXVtpbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlIGlmIHNjb3BlID09IDFcbiAgICAgICAgICAgIEBib29sZWFuc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBCb29sZWFuc1tpbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgc3RyaW5nIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0U3RyaW5nVmFsdWVUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC4gXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0LlxuICAgICMjIyAgIFxuICAgIHNldFN0cmluZ1ZhbHVlVG86ICh2YXJpYWJsZSwgdmFsdWUpIC0+XG4gICAgICAgIGlmIHZhcmlhYmxlLnNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50U3RyaW5nc1t2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgdmFyaWFibGUuc2NvcGUgPT0gMVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wU3RyaW5nc1t2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHN0cmluZyB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0U3RyaW5nVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXRTdHJpbmdWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50U3RyaW5nc1tkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wU3RyaW5nc1tpbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgbGlzdCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxpc3RPYmplY3RPZlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSBsaXN0LXZhcmlhYmxlL29iamVjdCB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBsaXN0LW9iamVjdC5cbiAgICAjIyMgICBcbiAgICBsaXN0T2JqZWN0T2Y6IChvYmplY3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgb2JqZWN0LmluZGV4P1xuICAgICAgICAgICAgaWYgb2JqZWN0LnNjb3BlID09IDJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudExpc3RzW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAbGlzdHNCeURvbWFpbltvYmplY3QuZG9tYWluXVtvYmplY3QuaW5kZXhdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBMaXN0c1tvYmplY3QuaW5kZXhdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgW11cbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIG51bWJlciB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2QgbnVtYmVyVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG51bWJlciB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICAgXG4gICAgbnVtYmVyVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgXG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50TnVtYmVyc1tkb21haW5dW2luZGV4XVxuICAgICAgICBlbHNlIGlmIHNjb3BlID09IDFcbiAgICAgICAgICAgIHJlc3VsdCA9IEBudW1iZXJzQnlEb21haW5bZG9tYWluXVtpbmRleF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBOdW1iZXJzW2luZGV4XVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBudW1iZXIgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG51bWJlciB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBudW1iZXJWYWx1ZU9mOiAob2JqZWN0KSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIGlmIG9iamVjdD8gYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIGlmIG9iamVjdC5zY29wZSA9PSAyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnROdW1iZXJzW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAbnVtYmVyc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAdGVtcE51bWJlcnNbb2JqZWN0LmluZGV4XVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgMFxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIHN0cmluZyB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1ZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgdmFyaWFibGUgdG8gZ2V0IHRoZSB2YWx1ZSBmcm9tLlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgICAgICAgIFxuICAgIHN0cmluZ1ZhbHVlT2Y6IChvYmplY3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IFwiXCJcbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgb2JqZWN0LmluZGV4P1xuICAgICAgICAgICAgaWYgb2JqZWN0LnNjb3BlID09IDJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudFN0cmluZ3Nbb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3Quc2NvcGUgPT0gMVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBzdHJpbmdzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wU3RyaW5nc1tvYmplY3QuaW5kZXhdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgXCJcIlxuICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHN0cmluZyB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RyaW5nVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICAgICBcbiAgICBzdHJpbmdWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIGRvbWFpbikgLT5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgaWYgc2NvcGUgPT0gMlxuICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnRTdHJpbmdzW2RvbWFpbl1baW5kZXhdXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgcmVzdWx0ID0gQHN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBAdGVtcFN0cmluZ3NbaW5kZXhdXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBcIlwiXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgYm9vbGVhbiB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZU9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGJvb2xlYW4gdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgICBcbiAgICBib29sZWFuVmFsdWVPZjogKG9iamVjdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgb2JqZWN0LmluZGV4P1xuICAgICAgICAgICAgaWYgb2JqZWN0LnNjb3BlID09IDJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudEJvb2xlYW5zW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF0gfHwgbm9cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAYm9vbGVhbnNCeURvbWFpbltvYmplY3QuZG9tYWluXVtvYmplY3QuaW5kZXhdIHx8IG5vXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBCb29sZWFuc1tvYmplY3QuaW5kZXhdIHx8IG5vXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gaWYgb2JqZWN0IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIGJvb2xlYW4gdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSBzY29wZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSB2YXJpYWJsZSdzIGluZGV4LlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGJvb2xlYW4gdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgICAgXG4gICAgYm9vbGVhblZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSBub1xuICAgICAgICBcbiAgICAgICAgaWYgc2NvcGUgPT0gMlxuICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbkJvb2xlYW5zW2RvbWFpbl1baW5kZXhdIHx8IG5vXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgcmVzdWx0ID0gQGJvb2xlYW5zQnlEb21haW5bZG9tYWluXVtpbmRleF0gfHwgbm9cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBCb29sZWFuc1tpbmRleF0gfHwgbm9cblxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIFxuZ3MuVmFyaWFibGVTdG9yZSA9IFZhcmlhYmxlU3RvcmUiXX0=
//# sourceURL=VariableStore_82.js