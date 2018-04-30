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
    var domain, i, j, len, ref;
    this.persistentNumbersByDomain = {};
    this.persistentStringsByDomain = {};
    this.persistentBooleansByDomain = {};
    this.persistentListsByDomain = {};
    ref = this.domains;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      domain = ref[i];
      this.persistentNumbersByDomain[i] = new Array(10);
      this.persistentNumbersByDomain[domain] = this.persistentNumbers[i];
      this.persistentStringsByDomain[i] = new Array(10);
      this.persistentStringsByDomain[domain] = this.persistentStrings[i];
      this.persistentBooleansByDomain[i] = new Array(10);
      this.persistentBooleansByDomain[domain] = this.persistentBooleans[i];
      this.persistentListsByDomain[i] = new Array(10);
      this.persistentListsByDomain[domain] = this.persistentLists[i];
    }
    this.persistentNumbers = this.persistentNumbersByDomain[0];
    this.persistentStrings = this.persistentStringsByDomain[0];
    this.persistentBooleans = this.persistentBooleansByDomain[0];
    return this.persistentLists = this.persistentListsByDomain[0];
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
      return this.persistentNumbersByDomain[domain][index] = value;
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
      return this.persistentNumbersByDomain[variable.domain || 0][variable.index] = value;
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
      return this.persistentListsByDomain[variable.domain || 0][variable.index] = value;
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
      return this.persistentBooleansByDomain[variable.domain][variable.index] = value;
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
      return this.persistentBooleansByDomain[domain][index] = value;
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
      return this.persistentStringsByDomain[variable.domain][variable.index] = value;
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
      return this.persistentStringsByDomain[domain][index] = value;
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
        result = this.persistentListsByDomain[object.domain][object.index];
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
      result = this.persistentNumbersByDomain[domain][index];
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
        result = this.persistentNumbersByDomain[object.domain][object.index];
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
        result = this.persistentStringsByDomain[object.domain][object.index];
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
      result = this.persistentStringsByDomain[domain][index];
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
        result = this.persistentBooleansByDomain[object.domain][object.index] || false;
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
      result = this.persistenBooleansByDomain[domain][index] || false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07RUFDRixhQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxtQkFBRCxFQUFzQixtQkFBdEIsRUFBMkMsb0JBQTNDLEVBQWlFLGlCQUFqRTs7O0FBRXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXlCYSx1QkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsRUFBRDs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUNYOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBQ1o7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFDWDs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQjs7QUFFM0I7Ozs7O0lBS0EsSUFBQyxDQUFBLDJCQUFELEdBQStCOztBQUUvQjs7Ozs7SUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7O0FBQ3JCOzs7OztJQUtBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjs7QUFDckI7Ozs7O0lBS0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCOztBQUN0Qjs7Ozs7SUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFDbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBQ2hCOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUNoQjs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7QUFDakI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFDZDs7OztJQUlBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBQ2Y7Ozs7SUFJQSxJQUFDLENB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ZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWpDLElBQWtELE1BRDFEO09BQUEsTUFBQTtRQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWQsSUFBK0IsTUFIdkM7T0FIVDtLQUFBLE1BQUE7TUFTSSxNQUFBLEdBQVksTUFBSCxHQUFlLElBQWYsR0FBeUIsTUFUdEM7O0FBV0EsV0FBTztFQWJLOzs7QUFlaEI7Ozs7Ozs7OzswQkFRQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsTUFBZjtBQUNqQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBRVQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQTBCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxDQUFuQyxJQUE2QyxNQUQxRDtLQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNELE1BQUEsR0FBUyxJQUFDLENBQUEsZ0JBQWlCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxDQUExQixJQUFvQyxNQUQ1QztLQUFBLE1BQUE7TUFHRCxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQWEsQ0FBQSxLQUFBLENBQWQsSUFBd0IsTUFIaEM7O0FBS0wsV0FBTztFQVZVOzs7Ozs7QUFZekIsRUFBRSxDQUFDLGFBQUgsR0FBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IFZhcmlhYmxlU3RvcmVcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFZhcmlhYmxlU3RvcmVcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwZXJzaXN0ZW50TnVtYmVyc1wiLCBcInBlcnNpc3RlbnRTdHJpbmdzXCIsIFwicGVyc2lzdGVudEJvb2xlYW5zXCIsIFwicGVyc2lzdGVudExpc3RzXCJdXG4gICAgXG4gICAgIyMjKlxuICAgICogPHA+QSBzdG9yYWdlIGZvciBkaWZmZXJlbnQga2luZCBvZiBnYW1lIHZhcmlhYmxlcy4gVGhlIGZvbGxvd2luZyBzY29wZXNcbiAgICAqIGZvciB2YXJpYWJsZXMgZXhpc3Q6PC9wPlxuICAgICogXG4gICAgKiAtIExvY2FsIFZhcmlhYmxlcyAtPiBPbmx5IHZhbGlkIGZvciB0aGUgY3VycmVudCBzY2VuZS5cbiAgICAqIC0gR2xvYmFsIFZhcmlhYmxlcyAtPiBWYWxpZCBmb3IgdGhlIHdob2xlIGdhbWUgYnV0IGJvdW5kIHRvIGEgc2luZ2xlIHNhdmUtZ2FtZS5cbiAgICAqIC0gUGVyc2lzdGVudCBWYXJpYWJsZXMgLT4gVmFsaWQgZm9yIHRoZSB3aG9sZSBnYW1lIGluZGVwZW50ZW50IGZyb20gdGhlIHNhdmUtZ2FtZXMuXG4gICAgKiBcbiAgICAqIDxwPlRoZSBmb2xsb3dpbmcgZGF0YS10eXBlcyBleGlzdDo8L3A+XG4gICAgKiAtIFN0cmluZ3MgLT4gVmFyaWFibGVzIHN0b3JpbmcgdGV4dCBkYXRhLlxuICAgICogLSBOdW1iZXJzIC0+IFZhcmlhYmxlcyBzdG9yaW5nIGludGVnZXIgbnVtYmVyIHZhbHVlcy5cbiAgICAqIC0gQm9vbGVhbnMgLT4gVmFyaWFibGVzIHN0b3JpbmcgYm9vbGVhbiB2YWx1ZXMuIChDYWxsZWQgXCJTd2l0Y2hlc1wiIGZvciBlYXNpZXIgdW5kZXJzdGFuZGluZylcbiAgICAqIC0gTGlzdHMgLT4gVmFyaWFibGVzIHN0b3JpbmcgbXVsdGlwbGUgb3RoZXIgdmFyaWFibGVzLiBMaXN0cyBjYW4gYWxzbyBjb250YWluIExpc3RzLlxuICAgICogPHA+XG4gICAgKiBMb2NhbCB2YXJpYWJsZXMgYXJlIHN0b3JlZCBieSBzY2VuZSBVSUQuIEZvciBlYWNoIHNjZW5lIFVJRCBhIGxpc3Qgb2YgbG9jYWwgdmFyaWFibGVzIGlzIHN0b3JlZC48L3A+XG4gICAgKiBcbiAgICAqIDxwPkdsb2JhbCBhbmQgcGVyc2lzdGVudCB2YXJpYWJsZXMgYXJlIHN0b3JlZCBhbmQgYSBzcGVjaWZpYyBkb21haW4uIEEgZG9tYWluIGlzIGp1c3QgYSB1bmlxdWUgbmFtZSBzdWNoXG4gICAgKiBhcyA8aT5jb20uZXhhbXBsZS5nYW1lPC9pPiBmb3IgZXhhbXBsZS4gVGhlIGRlZmF1bHQgZG9tYWluIGlzIGFuIGVtcHR5IHN0cmluZy4gRG9tYWlucyBhcmUgdXNlZnVsIHRvIGF2b2lkXG4gICAgKiBvdmVybGFwcGluZyBvZiB2YXJpYWJsZSBudW1iZXJzIHdoZW4gc2hhcmluZyBjb250ZW50IHdpdGggb3RoZXIgdXNlcnMuIDwvcD5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgVmFyaWFibGVTdG9yZVxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgbG9jYWwgdmFyaWFibGUgY29udGV4dFxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY29udGV4dCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IGRvbWFpbiBmb3IgZ2xvYmFsIGFuZCBwZXJzaXN0ZW50IHZhcmlhYmxlcy4gRWFjaCBkb21haW4gaGFzIGl0cyBvd25cbiAgICAgICAgKiB2YXJpYWJsZXMuIFBsZWFzZSB1c2UgPGI+Y2hhbmdlRG9tYWluPC9iPiBtZXRob2QgdG8gY2hhbmdlIHRoZSBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IGRvbWFpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGRvbWFpbiA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBMaXN0IG9mIGF2YWlsYWJsZSBkb21haW5zIGZvciBnbG9iYWwgYW5kIHBlcnNpc3RlbnQgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkb21haW5zXG4gICAgICAgICogQHR5cGUgc3RyaW5nW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBkb21haW5zID0gW1wiXCJdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBudW1iZXIgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgbnVtYmVyc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjI1xuICAgICAgICBAbnVtYmVycyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnbG9iYWwgYm9vbGVhbiB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBib29sZWFuc1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5bXVxuICAgICAgICAjIyNcbiAgICAgICAgQGJvb2xlYW5zID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBzdHJpbmcgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAc3RyaW5ncyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnbG9iYWwgbGlzdCB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBsaXN0cyA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgc3RvcmFnZSBvZiBhbGwgZ2xvYmFsIHZhcmlhYmxlcyBieSBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IGdsb2JhbFZhcmlhYmxlc0J5RG9tYWluXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11bXVxuICAgICAgICAjIyNcbiAgICAgICAgQGdsb2JhbFZhcmlhYmxlc0J5RG9tYWluID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgc3RvcmFnZSBvZiBhbGwgcGVyc2lzdGVudCB2YXJpYWJsZXMgYnkgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50VmFyaWFibGVzQnlEb21haW5cbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcGVyc2lzdGVudCBudW1iZXIgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgcGVyc2lzdGVudE51bWJlcnNcbiAgICAgICAgKiBAdHlwZSBudW1iZXJbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzID0gW11cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBwZXJzaXN0ZW50IHN0cmluZyB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50U3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3MgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBlcnNpc3RlbnQgYm9vbGVhbiB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50Qm9vbGVhbnNcbiAgICAgICAgKiBAdHlwZSBib29sZWFuW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBlcnNpc3RlbnQgbGlzdCB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50TGlzdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudExpc3RzID0gW11cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBsb2NhbCBudW1iZXIgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb2NhbE51bWJlcnNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBsb2NhbE51bWJlcnMgPSB7fVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxvY2FsIHN0cmluZyB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsU3RyaW5nc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsU3RyaW5ncyA9IHt9XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbG9jYWwgYm9vbGVhbiB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsQm9vbGVhbnNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBsb2NhbEJvb2xlYW5zID0ge31cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBsb2NhbCBsaXN0IHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxMaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsTGlzdHMgPSB7fVxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBOdW1iZXJzXG4gICAgICAgICogQHR5cGUgbnVtYmVyW11cbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wTnVtYmVycyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSB0ZW1wU3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcFN0cmluZ3MgPSBudWxsXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxCb29sZWFuc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcEJvb2xlYW5zID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsTGlzdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcExpc3RzID0gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgZG9tYWlucyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIikuc2VsZWN0IChkKSAtPiBkLml0ZW1zLmRvbWFpblxuICAgICAgICBcbiAgICAgICAgZm9yIGRvbWFpbiwgaSBpbiBkb21haW5zXG4gICAgICAgICAgICBAbnVtYmVyc0J5RG9tYWluW2RvbWFpbl0gPSBAbnVtYmVyc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAc3RyaW5nc0J5RG9tYWluW2RvbWFpbl0gPSBAc3RyaW5nc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpbltkb21haW5dID0gQGJvb2xlYW5zQnlEb21haW5baV1cbiAgICAgICAgICAgIEBsaXN0c0J5RG9tYWluW2RvbWFpbl0gPSBAbGlzdHNCeURvbWFpbltpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICBcbiAgICBzZXR1cEdsb2JhbERvbWFpbnM6ICgpIC0+XG4gICAgICAgIEBudW1iZXJzQnlEb21haW4gPSBbXVxuICAgICAgICBAc3RyaW5nc0J5RG9tYWluID0gW11cbiAgICAgICAgQGJvb2xlYW5zQnlEb21haW4gPSBbXVxuICAgICAgICBAbGlzdHNCeURvbWFpbiA9IFtdXG4gICAgICAgIFxuICAgICAgICBmb3IgZG9tYWluLCBpIGluIEBkb21haW5zXG4gICAgICAgICAgICBAbnVtYmVyc0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAbnVtYmVyc0J5RG9tYWluW2RvbWFpbl0gPSBAbnVtYmVyc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAc3RyaW5nc0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAc3RyaW5nc0J5RG9tYWluW2RvbWFpbl0gPSBAc3RyaW5nc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpbltpXSA9IG5ldyBBcnJheSgxMDAwKVxuICAgICAgICAgICAgQGJvb2xlYW5zQnlEb21haW5bZG9tYWluXSA9IEBib29sZWFuc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpbltpXSA9IG5ldyBBcnJheSgxMDAwKVxuICAgICAgICAgICAgQGxpc3RzQnlEb21haW5bZG9tYWluXSA9IEBsaXN0c0J5RG9tYWluW2ldXG4gICAgICAgICAgICBcbiAgICAgICAgQG51bWJlcnMgPSBAbnVtYmVyc0J5RG9tYWluWzBdXG4gICAgICAgIEBzdHJpbmdzID0gQHN0cmluZ3NCeURvbWFpblswXVxuICAgICAgICBAYm9vbGVhbnMgPSBAYm9vbGVhbnNCeURvbWFpblswXVxuICAgICAgICBAbGlzdHMgPSBAbnVtYmVyc0J5RG9tYWluWzBdXG4gICAgICAgIFxuICAgIHNldHVwUGVyc2lzdGVudERvbWFpbnM6IChkb21haW5zKSAtPlxuICAgICAgICBAcGVyc2lzdGVudE51bWJlcnNCeURvbWFpbiA9IHt9XG4gICAgICAgIEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluID0ge31cbiAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluID0ge31cbiAgICAgICAgQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluID0ge31cbiAgICAgICAgXG4gICAgICAgIGZvciBkb21haW4sIGkgaW4gQGRvbWFpbnNcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwKVxuICAgICAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bZG9tYWluXSA9IEBwZXJzaXN0ZW50TnVtYmVyc1tpXVxuICAgICAgICAgICAgQHBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTApXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpbltkb21haW5dID0gQHBlcnNpc3RlbnRTdHJpbmdzW2ldXG4gICAgICAgICAgICBAcGVyc2lzdGVudEJvb2xlYW5zQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTApXG4gICAgICAgICAgICBAcGVyc2lzdGVudEJvb2xlYW5zQnlEb21haW5bZG9tYWluXSA9IEBwZXJzaXN0ZW50Qm9vbGVhbnNbaV1cbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TGlzdHNCeURvbWFpbltpXSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TGlzdHNCeURvbWFpbltkb21haW5dID0gQHBlcnNpc3RlbnRMaXN0c1tpXVxuICAgICAgICBcbiAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzID0gQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bMF1cbiAgICAgICAgQHBlcnNpc3RlbnRTdHJpbmdzID0gQHBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5bMF1cbiAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFucyA9IEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpblswXVxuICAgICAgICBAcGVyc2lzdGVudExpc3RzID0gQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluWzBdXG4gICAgICAgICAgICBcbiAgICBzZXR1cERvbWFpbnM6IChkb21haW5zKSAtPlxuICAgICAgICBAZG9tYWlucyA9IGRvbWFpbnNcbiAgICAgICAgQHNldHVwR2xvYmFsRG9tYWlucygpXG4gICAgICAgIEBzZXR1cFBlcnNpc3RlbnREb21haW5zKClcbiAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAqXG4gICAgKiBAZGVwcmVjYXRlZFxuICAgICogQG1ldGhvZCBjaGFuZ2VEb21haW5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgZG9tYWluIHRvIGNoYW5nZSB0by5cbiAgICAjIyMgXG4gICAgY2hhbmdlRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAZG9tYWluID0gZG9tYWluXG4gICAgICAgIGdsb2JhbFZhcmlhYmxlcyA9IEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbltkb21haW5dXG4gICAgICAgIHBlcnNpc3RlbnRWYXJpYWJsZXMgPSBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluW2RvbWFpbl1cbiAgICAgICAgXG4gICAgICAgIGlmICFnbG9iYWxWYXJpYWJsZXNcbiAgICAgICAgICAgIGdsb2JhbFZhcmlhYmxlcyA9IEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbltkb21haW5dID0geyBudW1iZXJzOiBuZXcgQXJyYXkoNTAwKSwgc3RyaW5nczogbmV3IEFycmF5KDUwMCksIGJvb2xlYW5zOiBuZXcgQXJyYXkoNTAwKSwgbGlzdHM6IG5ldyBBcnJheSg1MDApIH1cbiAgICAgICAgaWYgIXBlcnNpc3RlbnRWYXJpYWJsZXNcbiAgICAgICAgICAgIHBlcnNpc3RlbnRWYXJpYWJsZXMgPSBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluW2RvbWFpbl0gPSB7IG51bWJlcnM6IG5ldyBBcnJheSg1MDApLCBzdHJpbmdzOiBuZXcgQXJyYXkoNTAwKSwgYm9vbGVhbnM6IG5ldyBBcnJheSg1MDApLCBsaXN0czogbmV3IEFycmF5KDUwMCkgfSAgICBcbiAgICAgICAgXG4gICAgICAgIEBudW1iZXJzID0gZ2xvYmFsVmFyaWFibGVzLm51bWJlcnNcbiAgICAgICAgQHN0cmluZ3MgPSBnbG9iYWxWYXJpYWJsZXMuc3RyaW5nc1xuICAgICAgICBAYm9vbGVhbnMgPSBnbG9iYWxWYXJpYWJsZXMuYm9vbGVhbnNcbiAgICAgICAgQGxpc3RzID0gZ2xvYmFsVmFyaWFibGVzLmxpc3RzXG4gICAgICAgIEBwZXJzaXN0ZW50TnVtYmVycyA9IHBlcnNpc3RlbnRWYXJpYWJsZXMubnVtYmVyc1xuICAgICAgICBAcGVyc2lzdGVudEJvb2xlYW5zID0gcGVyc2lzdGVudFZhcmlhYmxlcy5ib29sZWFuc1xuICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3MgPSBwZXJzaXN0ZW50VmFyaWFibGVzLnN0cmluZ3NcbiAgICAgICAgQHBlcnNpc3RlbnRMaXN0cyA9IHBlcnNpc3RlbnRWYXJpYWJsZXMubGlzdHNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIGFsbCBnbG9iYWwgdmFyaWFibGVzXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckdsb2JhbFZhcmlhYmxlc1xuICAgICMjIyBcbiAgICBjbGVhckFsbEdsb2JhbFZhcmlhYmxlczogLT5cbiAgICAgICAgQHNldHVwR2xvYmFsRG9tYWlucygpXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZ2xvYmFsVmFyaWFibGVzID0gQGdsb2JhbFZhcmlhYmxlc0J5RG9tYWluW0Bkb21haW5dXG4gICAgICAgIEBudW1iZXJzQnlEb21haW4gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgZ2xvYmFsVmFyaWFibGVzLmJvb2xlYW5zID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgIGdsb2JhbFZhcmlhYmxlcy5zdHJpbmdzID0gbmV3IEFycmF5KDEwMDApXG4gICAgXG4gICAgICAgIEBudW1iZXJzID0gZ2xvYmFsVmFyaWFibGVzLm51bWJlcnNcbiAgICAgICAgQHN0cmluZ3MgPSBnbG9iYWxWYXJpYWJsZXMuc3RyaW5nc1xuICAgICAgICBAYm9vbGVhbnMgPSBnbG9iYWxWYXJpYWJsZXMuYm9vbGVhbnNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgYWxsIGxvY2FsIHZhcmlhYmxlcyBmb3IgYWxsIGNvbnRleHRzL3NjZW5lcy9jb21tb24tZXZlbnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJBbGxMb2NhbFZhcmlhYmxlc1xuICAgICMjIyBcbiAgICBjbGVhckFsbExvY2FsVmFyaWFibGVzOiAtPlxuICAgICAgICBAbG9jYWxOdW1iZXJzID0ge31cbiAgICAgICAgQGxvY2FsU3RyaW5ncyA9IHt9XG4gICAgICAgIEBsb2NhbEJvb2xlYW5zID0ge31cbiAgICAgICAgQGxvY2FsTGlzdHMgPSB7fVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgc3BlY2lmaWVkIHZhcmlhYmxlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcltdfSBudW1iZXJzIC0gVGhlIG51bWJlciB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzdHJpbmdzIC0gVGhlIHN0cmluZyB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW5bXX0gYm9vbGVhbnMgLSBUaGUgYm9vbGVhbiB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge0FycmF5W119IGxpc3RzIC0gVGhlIGxpc3QgdmFyaWFibGVzIHRvIGNsZWFyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBEZXRlcm1pbmVzIHdoYXQga2luZCBvZiB2YXJpYWJsZXMgc2hvdWxkIGJlIGNsZWFyZWQuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+MCA9IEFsbDwvbGk+XG4gICAgKiA8bGk+MSA9IFN3aXRjaGVzIC8gQm9vbGVhbnM8L2xpPlxuICAgICogPGxpPjIgPSBOdW1iZXJzPC9saT5cbiAgICAqIDxsaT4zID0gVGV4dHM8L2xpPlxuICAgICogPGxpPjQgPSBMaXN0czwvbGk+XG4gICAgKiA8L3VsPlxuICAgICogQHBhcmFtIHtPYmplY3R9IHJhbmdlIC0gVGhlIHZhcmlhYmxlIGlkLXJhbmdlIHRvIGNsZWFyLiBJZiA8Yj5udWxsPC9iPiBhbGwgc3BlY2lmaWVkIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyMgIFxuICAgIGNsZWFyVmFyaWFibGVzOiAobnVtYmVycywgc3RyaW5ncywgYm9vbGVhbnMsIGxpc3RzLCB0eXBlLCByYW5nZSkgLT5cbiAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIEFsbFxuICAgICAgICAgICAgICAgIG51bWJlcnM/LmZpbGwoMCwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgICAgICBzdHJpbmdzPy5maWxsKFwiXCIsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgYm9vbGVhbnM/LmZpbGwoZmFsc2UsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgbGlzdHM/LmZpbGwoW10sIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICBib29sZWFucz8uZmlsbChmYWxzZSwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgIHdoZW4gMiAjIE51bWJlclxuICAgICAgICAgICAgICAgIG51bWJlcnM/LmZpbGwoMCwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZClcbiAgICAgICAgICAgIHdoZW4gMyAjIFRleHRcbiAgICAgICAgICAgICAgICBzdHJpbmdzPy5maWxsKFwiXCIsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDQgIyBMaXN0XG4gICAgICAgICAgICAgICAgbGlzdHM/LmZpbGwoW10sIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIGFsbCBsb2NhbCB2YXJpYWJsZXMgZm9yIGEgc3BlY2lmaWVkIGNvbnRleHQuIElmIHRoZSBjb250ZXh0IGlzIG5vdCBzcGVjaWZpZWQsIGFsbFxuICAgICogbG9jYWwgdmFyaWFibGVzIGZvciBhbGwgY29udGV4dHMvc2NlbmVzL2NvbW1vbi1ldmVudHMgYXJlIGNsZWFyZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckxvY2FsVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0IHRvIGNsZWFyIHRoZSBsb2NhbCB2YXJpYWJsZXMgZm9yLiBJZiA8Yj5udWxsPC9iPiwgYWxsXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjICBcbiAgICBjbGVhckxvY2FsVmFyaWFibGVzOiAoY29udGV4dCwgdHlwZSwgcmFuZ2UpIC0+XG4gICAgICAgIGlmIGNvbnRleHQ/XG4gICAgICAgICAgICBpZHMgPSBbY29udGV4dC5pZF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWRzID0gT2JqZWN0LmtleXMoQGxvY2FsTnVtYmVycylcbiAgICAgICAgICAgIFxuICAgICAgICBpZiByYW5nZT9cbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogMCwgZW5kOiBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGlkIGluIGlkc1xuICAgICAgICAgICAgQGNsZWFyVmFyaWFibGVzKEBsb2NhbE51bWJlcnNbaWRdLCBAbG9jYWxTdHJpbmdzW2lkXSwgQGxvY2FsQm9vbGVhbnNbaWRdLCBAbG9jYWxMaXN0c1tpZF0sIHR5cGUsIHJhbmdlKVxuIFxuICAgICMjIypcbiAgICAqIENsZWFycyBnbG9iYWwgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJHbG9iYWxWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIC0gRGV0ZXJtaW5lcyB3aGF0IGtpbmQgb2YgdmFyaWFibGVzIHNob3VsZCBiZSBjbGVhcmVkLlxuICAgICogPHVsPlxuICAgICogPGxpPjAgPSBBbGw8L2xpPlxuICAgICogPGxpPjEgPSBTd2l0Y2hlcyAvIEJvb2xlYW5zPC9saT5cbiAgICAqIDxsaT4yID0gTnVtYmVyczwvbGk+XG4gICAgKiA8bGk+MyA9IFRleHRzPC9saT5cbiAgICAqIDxsaT40ID0gTGlzdHM8L2xpPlxuICAgICogPC91bD5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByYW5nZSAtIFRoZSB2YXJpYWJsZSBpZC1yYW5nZSB0byBjbGVhci4gSWYgPGI+bnVsbDwvYj4gYWxsIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyMgXG4gICAgY2xlYXJHbG9iYWxWYXJpYWJsZXM6ICh0eXBlLCByYW5nZSkgLT5cbiAgICAgICAgaWYgcmFuZ2U/XG4gICAgICAgICAgICByYW5nZSA9IHN0YXJ0OiByYW5nZS5zdGFydCwgZW5kOiByYW5nZS5lbmQgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IDAsIGVuZDogbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIEBjbGVhclZhcmlhYmxlcyhAbnVtYmVycywgQHN0cmluZ3MsIEBib29sZWFucywgQGxpc3RzLCB0eXBlLCByYW5nZSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHBlcnNpc3RlbnQgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjIFxuICAgIGNsZWFyUGVyc2lzdGVudFZhcmlhYmxlczogKHR5cGUsIHJhbmdlKSAtPlxuICAgICAgICBpZiByYW5nZT9cbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogMCwgZW5kOiBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgQGNsZWFyVmFyaWFibGVzKEBwZXJzaXN0ZW50TnVtYmVycywgQHBlcnNpc3RlbnRzdHJpbmdzLCBAcGVyc2lzdGVudEJvb2xlYW5zLCBAcGVyc2lzdGVudExpc3RzLCB0eXBlLCByYW5nZSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHZhcmlhYmxlcy4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VzLiAoTGlrZSBhZnRlciBhIHNjZW5lIGNoYW5nZSlcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpIG5lZWRlZCBmb3IgbG9jYWwgdmFyaWFibGVzLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjIyAgICAgXG4gICAgc2V0dXA6IChjb250ZXh0KSAtPlxuICAgICAgICBAc2V0dXBMb2NhbFZhcmlhYmxlcyhjb250ZXh0KVxuICAgICAgICBAc2V0dXBUZW1wVmFyaWFibGVzKGNvbnRleHQpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGxvY2FsIHZhcmlhYmxlcyBmb3IgdGhlIHNwZWNpZmllZCBjb250ZXh0LiBTaG91bGQgYmUgY2FsbGVkIG9uIGZpcnN0IHRpbWUgdXNlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBMb2NhbFZhcmlhYmxlc1xuICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBUaGUgY29udGV4dChjdXJyZW50IHNjZW5lKS4gTmVlZHMgaGF2ZSBhdCBsZWFzdCBhbiBpZC1wcm9wZXJ0eS5cbiAgICAjIyNcbiAgICBzZXR1cExvY2FsVmFyaWFibGVzOiAoY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwVmFyaWFibGVzKGNvbnRleHQsIFwibG9jYWxOdW1iZXJzXCIsIDApXG4gICAgICAgIEBzZXR1cFZhcmlhYmxlcyhjb250ZXh0LCBcImxvY2FsU3RyaW5nc1wiLCBcIlwiKVxuICAgICAgICBAc2V0dXBWYXJpYWJsZXMoY29udGV4dCwgXCJsb2NhbEJvb2xlYW5zXCIsIG5vKVxuICAgICAgICBAc2V0dXBWYXJpYWJsZXMoY29udGV4dCwgXCJsb2NhbExpc3RzXCIsIFtdKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc3BlY2lmaWVkIGtpbmQgb2YgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWYXJpYWJsZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gVGhlIGNvbnRleHQoY3VycmVudCBzY2VuZSkuIE5lZWRzIGhhdmUgYXQgbGVhc3QgYW4gaWQtcHJvcGVydHkuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBUaGUga2luZCBvZiB2YXJpYWJsZXMgKHByb3BlcnR5LW5hbWUpLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZSAtIFRoZSBkZWZhdWx0IHZhbHVlIGZvciBlYWNoIHZhcmlhYmxlLlxuICAgICMjIyAgXG4gICAgc2V0dXBWYXJpYWJsZXM6IChjb250ZXh0LCBwcm9wZXJ0eSwgZGVmYXVsdFZhbHVlKSAtPlxuICAgICAgICBpZiBub3QgdGhpc1twcm9wZXJ0eV1bY29udGV4dC5pZF0/XG4gICAgICAgICAgICB0aGlzW3Byb3BlcnR5XVtjb250ZXh0LmlkXSA9IFtdXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGN1cnJlbnQgdGVtcCB2YXJpYWJsZXMgZm9yIHRoZSBzcGVjaWZpZWQgY29udGV4dC4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VkLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBUZW1wVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjIyAgICBcbiAgICBzZXR1cFRlbXBWYXJpYWJsZXM6IChjb250ZXh0KSAtPlxuICAgICAgICBAY29udGV4dCA9IGNvbnRleHRcbiAgICAgICAgaWYgIUBsb2NhbE51bWJlcnNbY29udGV4dC5pZF1cbiAgICAgICAgICAgIEBzZXR1cExvY2FsVmFyaWFibGVzKGNvbnRleHQpXG4gICAgICAgICAgICBcbiAgICAgICAgQHRlbXBOdW1iZXJzID0gQGxvY2FsTnVtYmVyc1tjb250ZXh0LmlkXVxuICAgICAgICBAdGVtcFN0cmluZ3MgPSBAbG9jYWxTdHJpbmdzW2NvbnRleHQuaWRdXG4gICAgICAgIEB0ZW1wQm9vbGVhbnMgPSBAbG9jYWxCb29sZWFuc1tjb250ZXh0LmlkXVxuICAgICAgICBAdGVtcExpc3RzID0gQGxvY2FsTGlzdHNbY29udGV4dC5pZF1cbiAgICAgICAgXG4gICAgY2xlYXJUZW1wVmFyaWFibGVzOiAoY29udGV4dCkgLT5cbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZS4gSWYgYSB2YXJpYWJsZSB3aXRoIHRoYXRcbiAgICAqIG5hbWUgY2Fubm90IGJlIGZvdW5kLCB0aGUgaW5kZXggd2lsbCBiZSAwLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5kZXhPZlRlbXBWYXJpYWJsZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gZ2V0IHRoZSBpbmRleCBmb3IuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG5hbWU6IG51bWJlciwgc3RyaW5nLCBib29sZWFuIG9yIGxpc3QuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGU6IDAgPSBsb2NhbCwgMSA9IGdsb2JhbCwgMiA9IHBlcnNpc3RlbnQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluIC0gVGhlIHZhcmlhYmxlIGRvbWFpbiB0byBzZWFyY2ggaW4uIElmIG5vdCBzcGVjaWZpZWQsIHRoZSBkZWZhdWx0IGRvbWFpbiB3aWxsIGJlIHVzZWQuXG4gICAgIyMjICBcbiAgICBpbmRleE9mVmFyaWFibGU6IChuYW1lLCB0eXBlLCBzY29wZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggc2NvcGVcbiAgICAgICAgICAgIHdoZW4gMCAjIExvY2FsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGluZGV4T2ZUZW1wVmFyaWFibGUobmFtZSwgdHlwZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIEdsb2JhbFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mR2xvYmFsVmFyaWFibGUobmFtZSwgdHlwZSwgZG9tYWluKVxuICAgICAgICAgICAgd2hlbiAyICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mUGVyc2lzdGVudFZhcmlhYmxlKG5hbWUsIHR5cGUsIGRvbWFpbilcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgbG9jYWwgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICMjIyAgXG4gICAgaW5kZXhPZlRlbXBWYXJpYWJsZTogKG5hbWUsIHR5cGUpIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgXG4gICAgICAgIGlmIEBjb250ZXh0Py5vd25lclxuICAgICAgICAgICAgaWYgQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJWYXJpYWJsZXNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXggaWYgdmFyaWFibGU/XG4gICAgICAgICAgICBlbHNlIGlmIEBjb250ZXh0Lm93bmVyW3R5cGUgKyBcIlZhcmlhYmxlc1wiXVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXJbdHlwZSArIFwiVmFyaWFibGVzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHZhcmlhYmxlP1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YXJpYWJsZS5pbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmFyaWFibGUgcmVmZXJlbmNlZCBieSBuYW1lIG5vdCBmb3VuZDogXCIgKyBuYW1lICtcIihsb2NhbCwgXCIrdHlwZStcIilcIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSBnbG9iYWwgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAtIFRoZSB2YXJpYWJsZSBkb21haW4gdG8gc2VhcmNoIGluLiBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBkb21haW4gd2lsbCBiZSB1c2VkLlxuICAgICMjIyAgXG4gICAgaW5kZXhPZkdsb2JhbFZhcmlhYmxlOiAobmFtZSwgdHlwZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIHZhcmlhYmxlcyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIilcbiAgICAgICAgdmFyaWFibGVzRG9jdW1lbnQgPSB2YXJpYWJsZXMuZmlyc3QgKHYpIC0+IHYuaXRlbXMuZG9tYWluID09IGRvbWFpblxuICAgICAgICB2YXJpYWJsZXNEb2N1bWVudCA/PSB2YXJpYWJsZXNbMF1cbiAgICAgICAgXG4gICAgICAgIGlmIHZhcmlhYmxlc0RvY3VtZW50XG4gICAgICAgICAgICB2YXJpYWJsZSA9IHZhcmlhYmxlc0RvY3VtZW50Lml0ZW1zW3R5cGUgKyBcInNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICBpZiB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhcmlhYmxlLmluZGV4IFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlZhcmlhYmxlIHJlZmVyZW5jZWQgYnkgbmFtZSBub3QgZm91bmQ6ICN7bmFtZX0gKHBlcnNpc3RlbnQsICN7dHlwZX0pXCIpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgaW5kZXggZm9yIHRoZSBwZXJzaXN0ZW50IHZhcmlhYmxlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLiBJZiBhIHZhcmlhYmxlIHdpdGggdGhhdFxuICAgICogbmFtZSBjYW5ub3QgYmUgZm91bmQsIHRoZSBpbmRleCB3aWxsIGJlIDAuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbmRleE9mVGVtcFZhcmlhYmxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIGluZGV4IGZvci5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgbmFtZTogbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4gb3IgbGlzdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgdmFyaWFibGUgZG9tYWluIHRvIHNlYXJjaCBpbi4gSWYgbm90IHNwZWNpZmllZCwgdGhlIGRlZmF1bHQgZG9tYWluIHdpbGwgYmUgdXNlZC5cbiAgICAjIyMgICAgICBcbiAgICBpbmRleE9mUGVyc2lzdGVudFZhcmlhYmxlOiAobmFtZSwgdHlwZSwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIHZhcmlhYmxlcyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcInBlcnNpc3RlbnRfdmFyaWFibGVzXCIpXG4gICAgICAgIHZhcmlhYmxlc0RvY3VtZW50ID0gdmFyaWFibGVzLmZpcnN0ICh2KSAtPiB2Lml0ZW1zLmRvbWFpbiA9PSBkb21haW5cbiAgICAgICAgdmFyaWFibGVzRG9jdW1lbnQgPz0gdmFyaWFibGVzWzBdXG4gICAgICAgIFxuICAgICAgICBpZiB2YXJpYWJsZXNEb2N1bWVudFxuICAgICAgICAgICAgdmFyaWFibGUgPSB2YXJpYWJsZXNEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuICAgICAgICAgICAgaWYgdmFyaWFibGU/XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXggXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmFyaWFibGUgcmVmZXJlbmNlZCBieSBuYW1lIG5vdCBmb3VuZDogI3tuYW1lfSAocGVyc2lzdGVudCwgI3t0eXBlfSlcIilcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXROdW1iZXJWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiBzY29wZSA9PSAxXG4gICAgICAgICAgICBAbnVtYmVyc0J5RG9tYWluW2RvbWFpbnx8MF1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBOdW1iZXJzW2luZGV4XSA9IHZhbHVlXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBudW1iZXIgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXROdW1iZXJWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuIFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgIFxuICAgIHNldE51bWJlclZhbHVlVG86ICh2YXJpYWJsZSwgdmFsdWUpIC0+XG4gICAgICAgIGlmIHZhcmlhYmxlLnNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbnx8MF1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiB2YXJpYWJsZS5zY29wZSA9PSAxXG4gICAgICAgICAgICBAbnVtYmVyc0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbnx8MF1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBOdW1iZXJzW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBsaXN0IHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0TGlzdE9iamVjdFRvXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LiBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIHNldExpc3RPYmplY3RUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT5cbiAgICAgICAgaWYgdmFyaWFibGUuc2NvcGUgPT0gMlxuICAgICAgICAgICAgQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbnx8MF1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiB2YXJpYWJsZS5zY29wZSA9PSAxXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpblt2YXJpYWJsZS5kb21haW58fDBdW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wTGlzdHNbdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcblxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIGJvb2xlYW4gdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRCb29sZWFuVmFsdWVUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC4gXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgICAgICAgICAgICBcbiAgICBzZXRCb29sZWFuVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT5cbiAgICAgICAgaWYgdmFyaWFibGUuc2NvcGUgPT0gMlxuICAgICAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbl1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiB2YXJpYWJsZS5zY29wZSA9PSAxXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wQm9vbGVhbnNbdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBib29sZWFuIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRCb29sZWFuVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0LlxuICAgICMjIyAgICAgXG4gICAgc2V0Qm9vbGVhblZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgdmFsdWUsIGRvbWFpbikgLT5cbiAgICAgICAgaWYgc2NvcGUgPT0gMlxuICAgICAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiBzY29wZSA9PSAxXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wQm9vbGVhbnNbaW5kZXhdID0gdmFsdWVcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIHN0cmluZyB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldFN0cmluZ1ZhbHVlVG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuIFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICBcbiAgICBzZXRTdHJpbmdWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgdmFyaWFibGUuc2NvcGUgPT0gMVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wU3RyaW5nc1t2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHN0cmluZyB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0U3RyaW5nVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXRTdHJpbmdWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiBzY29wZSA9PSAxXG4gICAgICAgICAgICBAc3RyaW5nc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBTdHJpbmdzW2luZGV4XSA9IHZhbHVlXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBsaXN0IHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbGlzdE9iamVjdE9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIGxpc3QtdmFyaWFibGUvb2JqZWN0IHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGxpc3Qtb2JqZWN0LlxuICAgICMjIyAgIFxuICAgIGxpc3RPYmplY3RPZjogKG9iamVjdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gMFxuICAgICAgICBpZiBvYmplY3Q/IGFuZCBvYmplY3QuaW5kZXg/XG4gICAgICAgICAgICBpZiBvYmplY3Quc2NvcGUgPT0gMlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50TGlzdHNCeURvbWFpbltvYmplY3QuZG9tYWluXVtvYmplY3QuaW5kZXhdXG4gICAgICAgICAgICBlbHNlIGlmIG9iamVjdC5zY29wZSA9PSAxXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGxpc3RzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wTGlzdHNbb2JqZWN0LmluZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBvYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IFtdXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBudW1iZXIgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgIFxuICAgIG51bWJlclZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBzY29wZSA9PSAyXG4gICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudE51bWJlcnNCeURvbWFpbltkb21haW5dW2luZGV4XVxuICAgICAgICBlbHNlIGlmIHNjb3BlID09IDFcbiAgICAgICAgICAgIHJlc3VsdCA9IEBudW1iZXJzQnlEb21haW5bZG9tYWluXVtpbmRleF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBOdW1iZXJzW2luZGV4XVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBudW1iZXIgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG51bWJlciB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBudW1iZXJWYWx1ZU9mOiAob2JqZWN0KSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIGlmIG9iamVjdD8gYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIGlmIG9iamVjdC5zY29wZSA9PSAyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3Quc2NvcGUgPT0gMVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBudW1iZXJzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wTnVtYmVyc1tvYmplY3QuaW5kZXhdXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gb2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCAwXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgc3RyaW5nIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RyaW5nVmFsdWVPZlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmcgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgICAgXG4gICAgc3RyaW5nVmFsdWVPZjogKG9iamVjdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlxuICAgICAgICBpZiBvYmplY3Q/IGFuZCBvYmplY3QuaW5kZXg/XG4gICAgICAgICAgICBpZiBvYmplY3Quc2NvcGUgPT0gMlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAc3RyaW5nc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAdGVtcFN0cmluZ3Nbb2JqZWN0LmluZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBvYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IFwiXCJcbiAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzdHJpbmcgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1ZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmcgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgICAgXG4gICAgc3RyaW5nVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgcmVzdWx0ID0gQHN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBAdGVtcFN0cmluZ3NbaW5kZXhdXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBcIlwiXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgYm9vbGVhbiB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZU9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGJvb2xlYW4gdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgICBcbiAgICBib29sZWFuVmFsdWVPZjogKG9iamVjdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgb2JqZWN0LmluZGV4P1xuICAgICAgICAgICAgaWYgb2JqZWN0LnNjb3BlID09IDJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudEJvb2xlYW5zQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XSB8fCBub1xuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3Quc2NvcGUgPT0gMVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBib29sZWFuc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF0gfHwgbm9cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAdGVtcEJvb2xlYW5zW29iamVjdC5pbmRleF0gfHwgbm9cblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBpZiBvYmplY3QgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgYm9vbGVhbiB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2QgYm9vbGVhblZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSBUaGUgYm9vbGVhbiB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICAgICBcbiAgICBib29sZWFuVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIFxuICAgICAgICBpZiBzY29wZSA9PSAyXG4gICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVuQm9vbGVhbnNCeURvbWFpbltkb21haW5dW2luZGV4XSB8fCBub1xuICAgICAgICBlbHNlIGlmIHNjb3BlID09IDFcbiAgICAgICAgICAgIHJlc3VsdCA9IEBib29sZWFuc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdIHx8IG5vXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wQm9vbGVhbnNbaW5kZXhdIHx8IG5vXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbmdzLlZhcmlhYmxlU3RvcmUgPSBWYXJpYWJsZVN0b3JlIl19
//# sourceURL=VariableStore_82.js