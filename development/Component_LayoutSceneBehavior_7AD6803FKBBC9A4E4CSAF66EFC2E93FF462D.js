var Component_LayoutSceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_LayoutSceneBehavior = (function(superClass) {
  extend(Component_LayoutSceneBehavior, superClass);


  /**
  * The base class of all scene-behavior components. A scene-behavior component
  * define the logic of a single game scene. 
  *
  * @module gs
  * @class Component_LayoutSceneBehavior
  * @extends gs.Component_SceneBehavior
  * @memberof gs
   */

  function Component_LayoutSceneBehavior() {
    Component_LayoutSceneBehavior.__super__.constructor.call(this);
    this.objectManager = SceneManager;
    this.layout = null;
    this.resourceContext = null;
  }


  /**
  * Initializes the scene. 
  *
  * @method initialize
   */

  Component_LayoutSceneBehavior.prototype.initialize = function() {
    Component_LayoutSceneBehavior.__super__.initialize.apply(this, arguments);
    this.resourceContext = ResourceManager.createContext();
    ResourceManager.context = this.resourceContext;
    if (this.object.layoutData == null) {
      this.object.layoutData = {
        "type": "ui.FreeLayout",
        "controls": [],
        "frame": [0, 0, 1, 1]
      };
    }
    return LanguageManager.loadBundles();
  };


  /**
  * Disposes the scene. 
  *
  * @method dispose
   */

  Component_LayoutSceneBehavior.prototype.dispose = function() {
    return Component_LayoutSceneBehavior.__super__.dispose.apply(this, arguments);
  };


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_LayoutSceneBehavior.prototype.prepareData = function() {
    gs.ObjectManager.current = this.objectManager;
    if (!GameManager.initialized) {
      GameManager.initialize();
    }
    this.dataFields = ui.UiFactory.dataSources[this.object.layoutData.dataSource || "default"]();
    window.$dataFields = this.dataFields;
    this.music = ui.Component_FormulaHandler.fieldValue(this.object, this.object.layoutData.music);
    AudioManager.loadMusic(this.music);
    this.prepareTransition(RecordManager.system.menuTransition);
    ResourceLoader.loadUiTypesGraphics(ui.UiFactory.customTypes);
    ResourceLoader.loadUiLayoutGraphics(this.object.layoutData);
    if (this.dataFields != null) {
      ResourceLoader.loadUiDataFieldsGraphics(this.dataFields);
    }
    return ResourceManager.getBitmap("Graphics/Characters/JaneDate_Normal");
  };


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
   */

  Component_LayoutSceneBehavior.prototype.prepareVisual = function() {
    var scale, vocab;
    scale = Graphics.scale;
    vocab = RecordManager.vocabulary;
    if (this.layout == null) {
      this.dataObject = {};
      this.layout = ui.UiFactory.createFromDescriptor(this.object.layoutData, this.object);
      if (this.music != null) {
        AudioManager.changeMusic(this.music, 30);
      }
    }
    this.layout.ui.prepare();
    this.layout.ui.appear();
    this.layout.update();
    this.transition();
    if (SceneManager.previousScenes.length === 0) {
      if (GameManager.tempFields.isExitingGame) {
        GameManager.tempFields.isExitingGame = false;
        return gs.GameNotifier.postResetSceneChange(this.object.layoutName);
      } else {
        return gs.GameNotifier.postSceneChange(this.object.layoutName);
      }
    }
  };


  /**
  * Updates the scene's content.
  *
  * @method updateContent
   */

  Component_LayoutSceneBehavior.prototype.updateContent = function() {
    GameManager.update();
    return Graphics.viewport.update();
  };


  /**
  * Shows/Hides the current scene. A hidden scene is no longer shown and executed
  * but all objects and data is still there and be shown again anytime.
  *
  * @method show
  * @param {boolean} visible - Indicates if the scene should be shown or hidden.
   */

  Component_LayoutSceneBehavior.prototype.show = function(visible) {
    if (visible) {
      ResourceManager.context = this.resourceContext;
    }
    this.layout.visible = visible;
    this.layout.update();
    this.objectManager.active = visible;
    if (visible) {
      return gs.ObjectManager.current = SceneManager;
    }
  };


  /**
  * Action method which triggers a full refresh on the object returned by the specified binding-expression.
  * The params must be a direct binding-expression string.
  *
  * @method fullRefreshObject
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params -  The binding expression.
   */

  Component_LayoutSceneBehavior.prototype.fullRefreshObject = function(sender, object) {
    object = ui.Component_FormulaHandler.fieldValue(sender, object);
    return object != null ? object.fullRefresh() : void 0;
  };


  /**
  * Action method which triggers a refresh on the object returned by the specified binding-expression.
  * The params must be a direct binding-expression string.
  *
  * @method refreshObject
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params -  The binding expression.
   */

  Component_LayoutSceneBehavior.prototype.refreshObject = function(sender, object) {
    object = ui.Component_FormulaHandler.fieldValue(sender, object);
    return object != null ? object.needsUpdate = true : void 0;
  };

  Component_LayoutSceneBehavior.prototype.addStyle = function(sender, style) {
    var styleObject;
    styleObject = ui.UIManager.styles[style];
    if (styleObject != null) {
      styleObject.apply(sender);
    }
    sender.needsUpdate = true;
    if (styleObject != null ? styleObject.font : void 0) {
      return sender.behavior.refresh();
    }
  };

  Component_LayoutSceneBehavior.prototype.removeStyle = function(sender, style) {
    var i, len, ref, ref1, s, styleObject;
    styleObject = ui.UIManager.styles[style];
    if (styleObject != null) {
      styleObject.revert(sender);
    }
    sender.descriptor.styles.remove(style);
    ref = sender.descriptor.styles;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if ((ref1 = ui.UIManager.styles[s]) != null) {
        ref1.apply(sender);
      }
    }
    sender.needsUpdate = true;
    if (styleObject != null ? styleObject.font : void 0) {
      return sender.behavior.refresh();
    }
  };


  /**
  * Action method which executes the specified bindings.
  *
  * @method executeBindings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object[]} params -  An array of binding-definitions.
   */

  Component_LayoutSceneBehavior.prototype.executeBindings = function(sender, bindings) {
    var binding, i, len;
    for (i = 0, len = bindings.length; i < len; i++) {
      binding = bindings[i];
      ui.Component_FormulaHandler.executeBinding(sender, binding);
    }
    return null;
  };


  /**
  * Action method which executes the specified formulas.
  *
  * @method executeFormulas
  * @param {gs.Object_Base} sender - The sender object.
  * @param {ui.Formula[]} params -  An array of formula-definitions.
   */

  Component_LayoutSceneBehavior.prototype.executeFormulas = function(sender, formulas) {
    var formula, i, len, results;
    results = [];
    for (i = 0, len = formulas.length; i < len; i++) {
      formula = formulas[i];
      results.push(ui.Component_FormulaHandler.executeFormula(sender, formula));
    }
    return results;
  };


  /**
  * Action method which executes an animation on a specified target game object.
  *
  * @method executeAnimation
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params -  Contains target-id and animations: { target, animations }
   */

  Component_LayoutSceneBehavior.prototype.executeAnimation = function(sender, params) {
    var animation, object;
    object = ui.Component_FormulaHandler.fieldValue(sender, params.target);
    animation = object != null ? object.animations.first(function(a) {
      return a.event === params.event;
    }) : void 0;
    if (animation && object) {
      return object.animationExecutor.execute(animation);
    }
  };


  /**
  * Action method which emits the specified event.
  *
  * @method emitEvent
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains event name, source and data.
  * <ul>
  * <li>params.name - The name of the event to emit</li>
  * <li>params.source - A binding-expression to define the game object which should emit the event.</li>
  * <li>params.data - An object containing additional event specific data.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.emitEvent = function(sender, params) {
    var object;
    object = ui.Component_FormulaHandler.fieldValue(sender, params.source);
    return object != null ? object.events.emit(params.name, object, ui.Component_FormulaHandler.fieldValue(sender, params.data)) : void 0;
  };


  /**
  * Action method which changes the game's aspect ratio.
  *
  * @method executeBindings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params -  If <b>true</b> the game screen will stretched so that it fills the entire screen
  * of the player without any black borders. Otherwise the game screen stretches but keeps its ratio
  * so black borders are possible if the game resolution's ratio and the target display's ratio are not match. It can also
  * be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.adjustAspectRatio = function(sender, adjust) {
    adjust = ui.Component_FormulaHandler.fieldValue(sender, adjust);
    GameManager.settings.adjustAspectRatio = adjust;
    Graphics.keepRatio = !adjust;
    return Graphics.onResize();
  };


  /**
  * Action method which enters fullscreen mode.
  *
  * @method enterFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.enterFullScreen = function(sender, params) {
    gs.Graphics.enterFullscreen();
    return GameManager.settings.fullScreen = Graphics.isFullscreen();
  };


  /**
  * Action method which leaves fullscreen mode.
  *
  * @method leaveFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.leaveFullScreen = function() {
    gs.Graphics.leaveFullscreen();
    return GameManager.settings.fullScreen = Graphics.isFullscreen();
  };


  /**
  * Action method which toggles between window and fullscreen mode.
  *
  * @method toggleFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.toggleFullScreen = function(sender, params) {
    if (gs.Graphics.isFullscreen()) {
      gs.Graphics.leaveFullscreen();
    } else {
      gs.Graphics.enterFullscreen();
    }
    return GameManager.settings.fullScreen = gs.Graphics.isFullscreen();
  };


  /**
  * Action method which plays the specified sound.
  *
  * @method playSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - The sound to play.
   */

  Component_LayoutSceneBehavior.prototype.playSound = function(sender, params) {
    AudioManager.loadSound(params);
    return AudioManager.playSound(params);
  };


  /**
  * Action method which plays the specified voice.
  *
  * @method playVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - The voice to play.
   */

  Component_LayoutSceneBehavior.prototype.playVoice = function(sender, params) {
    AudioManager.loadSound(params);
    return AudioManager.playVoice(params);
  };


  /**
  * Action method which turns voice on or off.
  *
  * @method turnOnOffVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> voice will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffVoice = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnVoice();
    } else {
      return this.turnOffVoice();
    }
  };


  /**
  * Action method which turns music on or off.
  *
  * @method turnOnOffMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> music will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffMusic = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnMusic();
    } else {
      return this.turnOffMusic();
    }
  };


  /**
  * Action method which turns sound on or off.
  *
  * @method turnOnOffSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> sound will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffSound = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnSound();
    } else {
      return this.turnOffSound();
    }
  };


  /**
  * Action method which turns off voice.
  *
  * @method turnOffVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffVoice = function() {
    return AudioManager.stopAllVoices();
  };


  /**
  * Action method which turns off music.
  *
  * @method turnOffMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffMusic = function() {
    return AudioManager.stopMusic();
  };


  /**
  * Action method which turns off sound.
  *
  * @method turnOffSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffSound = function() {
    return AudioManager.stopAllSounds();
  };


  /**
  * Action method which turns on voice.
  *
  * @method turnOnVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnVoice = function() {};


  /**
  * Action method which turns on sound.
  *
  * @method turnOnSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnSound = function() {};


  /**
  * Action method which turns on music.
  *
  * @method turnOnMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnMusic = function() {
    return AudioManager.resumeMusic();
  };


  /**
  * Action method which selects the specified language.
  *
  * @method selectLanguage
  * @param {gs.Object_Base} sender - The sender object.
  * @param {number|string} params - Index of the language to set. Can be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.selectLanguage = function(sender, params) {
    var language;
    language = LanguageManager.languages[ui.Component_FormulaHandler.fieldValue(sender, params)];
    return LanguageManager.selectLanguage(language);
  };


  /**
  * Action method which resets global data storage.
  *
  * @method resetGlobalData
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.resetGlobalData = function(sender) {
    return GameManager.resetGlobalData();
  };


  /**
  * Action method which saves game settings.
  *
  * @method saveSettings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.saveSettings = function(sender) {
    return GameManager.saveSettings();
  };


  /**
  * Action method which prepares the game for saving by taking a snapshot of the current game state
  * and storing it in GameManager.saveGame.
  *
  * @method prepareSaveGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.prepareSaveGame = function(sender, params) {
    return GameManager.prepareSaveGame(params != null ? params.snapshot : void 0);
  };


  /**
  * Action method which saves the current game at the specified save slot.
  *
  * @method saveGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the slot-index where the game should be saved.
  * <ul>
  * <li>params.slot - The slot-index where the game should be saved. Can be a binding-expression.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.saveGame = function(sender, params) {
    return GameManager.save(ui.Component_FormulaHandler.fieldValue(sender, params.slot));
  };


  /**
  * Action method which loads the game from the specified save slot.
  *
  * @method loadGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the slot-index where the game should be loaded from.
  * <ul>
  * <li>params.slot - The slot-index where the game should be loaded from. Can be a binding-expression.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.loadGame = function(sender, params) {
    GameManager.tempSettings.skip = false;
    return GameManager.load(ui.Component_FormulaHandler.fieldValue(sender, params.slot));
  };


  /**
  * Action method which starts a new game.
  *
  * @method newGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.newGame = function(sender, params) {
    var scene;
    AudioManager.stopAllMusic(30);
    GameManager.newGame();
    scene = new vn.Object_Scene();
    SceneManager.clear();
    return SceneManager.switchTo(scene);
  };


  /**
  * Action method which exists the current game. It doesn't change the scene and
  * should be called before switching back to the title screen or main menu.
  *
  * @method exitGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.exitGame = function(sender, params) {
    return GameManager.exitGame();
  };


  /**
  * Action method which switches to another scene.
  *
  * @method switchScene
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the class name of the scene to switch to.
  * <ul>
  * <li>params.name - The class-name of the scene to switch to. The class must be defined in vn-namespace.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchScene = function(sender, params) {
    var f;
    f = (function(_this) {
      return function() {
        var scene;
        if (params.clear) {
          SceneManager.clear();
        }
        scene = new vn[params.name]();
        return SceneManager.switchTo(scene, params.savePrevious);
      };
    })(this);
    if (!params.savePrevious) {
      return this.layout.ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which switches to another game scene.
  *
  * @method switchGameScene
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the UID of the scene to switch to.
  * <ul>
  * <li>params.uid - The UID of the scene to switch to.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchGameScene = function(sender, params) {
    var f;
    f = (function(_this) {
      return function() {
        var newScene, sceneData, sceneDocument, sceneDocuments, uid;
        if (params.clear) {
          SceneManager.clear();
        }
        uid = params.uid;
        if (params.name) {
          sceneDocuments = DataManager.getDocumentsByType("vn.scene");
          sceneDocument = sceneDocuments.first(function(d) {
            return d.items.name === params.name;
          });
          if (sceneDocument) {
            uid = sceneDocument.uid;
          }
        }
        sceneData = {
          uid: uid,
          pictures: [],
          texts: []
        };
        GameManager.sceneData = sceneData;
        newScene = new vn.Object_Scene();
        newScene.sceneData = sceneData;
        return SceneManager.switchTo(newScene, params.savePrevious);
      };
    })(this);
    if (!params.savePrevious) {
      return (this.layout || this.object.layout).ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which switches to another layout.
  *
  * @method switchLayout
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the name of the layout to switch to.
  * <ul>
  * <li>params.name - The name of the layout to switch to.</li>
  * <li>params.savePrevious - Indicates if the current layout should not be erased but paused and hidden instead so
  * that it can be restored using <i>returnToPrevious</i> action.</li>
  * <li>params.dataFields - Defines the data of "$dataFields" binding-expression variable. Can be a binding-expression
  * or a direct object. Optional.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchLayout = function(sender, layout) {
    var f;
    f = (function(_this) {
      return function() {
        var dataFields, i, len, ref, scene, senderField;
        Graphics.freeze();
        if (layout.clear) {
          SceneManager.clear();
        }
        scene = new gs.Object_Layout(layout.name);
        dataFields = sender.dataFields;
        if (typeof layout.dataFields === "string") {
          dataFields = ui.Component_FormulaHandler.fieldValue(sender, layout.dataFields);
        } else if (layout.dataFields != null) {
          dataFields = layout.dataFields;
        }
        scene.dataFields = dataFields;
        scene.controllers = layout.controllers;
        if (layout.senderData != null) {
          ref = layout.senderData;
          for (i = 0, len = ref.length; i < len; i++) {
            senderField = ref[i];
            scene[senderField] = sender[senderField];
          }
        }
        return SceneManager.switchTo(scene, layout.savePrevious, layout.stack);
      };
    })(this);
    if (!layout.savePrevious) {
      return (this.layout || this.object.layout).ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which returns to previous layout. (If savePrevious was set to <b>true</b> on switchLayout.).
  *
  * @method previousLayout
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.previousLayout = function(sender) {
    return SceneManager.returnToPrevious();
  };


  /**
  * Action method which disposes the specified control.
  *
  * @method disposeControl
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - The ID of the control to dispose. Can be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.disposeControl = function(sender, id) {
    var control;
    control = this.objectManager.objectById(ui.Component_FormulaHandler.fieldValue(sender, id));
    return control != null ? control.ui.disappear(function(sender) {
      return sender.dispose();
    }) : void 0;
  };


  /**
  * Action method which creates a new control from the specified descriptor.
  *
  * @method createControl
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - Contains the descriptor and other data needed to construct the control.
  * <ul>
  * <li>params.descriptor - The control' descriptor. Can be a direct descriptor definition or a template name</li>
  * <li>params.parent - A binding-expression which returns the control's parent.</li>
  * <li>params.senderData - An object containing additional data merged into the control object.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.createControl = function(sender, data) {
    var control, descriptor, fieldName, i, len, parent, ref;
    if (typeof data.descriptor === "string") {
      descriptor = ui.UIManager.customTypes[data.descriptor];
    } else {
      descriptor = data.descriptor;
    }
    parent = ui.Component_FormulaHandler.fieldValue(sender, data.parent);
    control = ui.UiFactory._createFromDescriptor(descriptor, parent != null ? parent : this.object);
    if (data.senderData != null) {
      ref = data.senderData;
      for (i = 0, len = ref.length; i < len; i++) {
        fieldName = ref[i];
        control[fieldName] = sender[fieldName];
      }
    }
    control.ui.prepare();
    control.ui.appear();
    return control;
  };


  /**
  * Action method which quits the game.
  *
  * @method quitGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.quitGame = function(sender, data) {
    return SceneManager.switchTo(null);
  };

  return Component_LayoutSceneBehavior;

})(gs.Component_SceneBehavior);

gs.Component_LayoutSceneBehavior = Component_LayoutSceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7OztFQVNhLHVDQUFBO0lBQ1QsNkRBQUE7SUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLGVBQUQsR0FBbUI7RUFMVjs7O0FBT2I7Ozs7OzswQ0FLQSxVQUFBLEdBQVksU0FBQTtJQUNSLCtEQUFBLFNBQUE7SUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFlLENBQUMsYUFBaEIsQ0FBQTtJQUNuQixlQUFlLENBQUMsT0FBaEIsR0FBMEIsSUFBQyxDQUFBO0lBRTNCLElBQU8sOEJBQVA7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUI7UUFBRSxNQUFBLEVBQVEsZUFBVjtRQUEyQixVQUFBLEVBQVksRUFBdkM7UUFBMkMsT0FBQSxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwRDtRQUR6Qjs7V0FHQSxlQUFlLENBQUMsV0FBaEIsQ0FBQTtFQVRROzs7QUFXWjs7Ozs7OzBDQUtBLE9BQUEsR0FBUyxTQUFBO1dBQ0wsNERBQUEsU0FBQTtFQURLOzs7QUFHVDs7Ozs7OzswQ0FNQSxXQUFBLEdBQWEsU0FBQTtJQUNULEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBakIsR0FBMkIsSUFBQyxDQUFBO0lBRTVCLElBQUcsQ0FBSSxXQUFXLENBQUMsV0FBbkI7TUFDSSxXQUFXLENBQUMsVUFBWixDQUFBLEVBREo7O0lBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVksQ0FBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFuQixJQUFpQyxTQUFqQyxDQUF6QixDQUFBO0lBQ2QsTUFBTSxDQUFDLFdBQVAsR0FBcUIsSUFBQyxD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QXZDLEVBQStDLEVBQS9DLENBQTFCOzZCQUdWLE9BQU8sQ0FBRSxFQUFFLENBQUMsU0FBWixDQUFzQixTQUFDLE1BQUQ7YUFBWSxNQUFNLENBQUMsT0FBUCxDQUFBO0lBQVosQ0FBdEI7RUFKWTs7O0FBTWhCOzs7Ozs7Ozs7Ozs7OzBDQVlBLGFBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ1gsUUFBQTtJQUFBLElBQUcsT0FBTyxJQUFJLENBQUMsVUFBWixLQUEwQixRQUE3QjtNQUNJLFVBQUEsR0FBYSxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVksQ0FBQSxJQUFJLENBQUMsVUFBTCxFQUQxQztLQUFBLE1BQUE7TUFHSSxVQUFBLEdBQWEsSUFBSSxDQUFDLFdBSHRCOztJQU1BLE1BQUEsR0FBUyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBNUIsQ0FBdUMsTUFBdkMsRUFBK0MsSUFBSSxDQUFDLE1BQXBEO0lBQ1QsT0FBQSxHQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMscUJBQWIsQ0FBbUMsVUFBbkMsbUJBQStDLFNBQVMsSUFBQyxDQUFBLE1BQXpEO0lBRVYsSUFBRyx1QkFBSDtBQUNJO0FBQUEsV0FBQSxxQ0FBQTs7UUFDSSxPQUFRLENBQUEsU0FBQSxDQUFSLEdBQXFCLE1BQU8sQ0FBQSxTQUFBO0FBRGhDLE9BREo7O0lBR0EsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFYLENBQUE7SUFDQSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQVgsQ0FBQTtBQUVBLFdBQU87RUFoQkk7OztBQWtCZjs7Ozs7Ozs7MENBT0EsUUFBQSxHQUFVLFNBQUMsTUFBRCxFQUFTLElBQVQ7V0FDTixZQUFZLENBQUMsUUFBYixDQUFzQixJQUF0QjtFQURNOzs7O0dBOW5COEIsRUFBRSxDQUFDOztBQW1vQi9DLEVBQUUsQ0FBQyw2QkFBSCxHQUFtQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3LjgIBcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yIGV4dGVuZHMgZ3MuQ29tcG9uZW50X1NjZW5lQmVoYXZpb3JcbiAgIyAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wib2JqZWN0TWFuYWdlclwiXVxuICAgICMjIypcbiAgICAqIFRoZSBiYXNlIGNsYXNzIG9mIGFsbCBzY2VuZS1iZWhhdmlvciBjb21wb25lbnRzLiBBIHNjZW5lLWJlaGF2aW9yIGNvbXBvbmVudFxuICAgICogZGVmaW5lIHRoZSBsb2dpYyBvZiBhIHNpbmdsZSBnYW1lIHNjZW5lLiBcbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3JcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdE1hbmFnZXIgPSBTY2VuZU1hbmFnZXJcbiAgICAgICAgQGxheW91dCA9IG51bGxcbiAgICAgICAgQHJlc291cmNlQ29udGV4dCA9IG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc2NlbmUuIFxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjIyAgICBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHJlc291cmNlQ29udGV4dCA9IFJlc291cmNlTWFuYWdlci5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQgPSBAcmVzb3VyY2VDb250ZXh0XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQG9iamVjdC5sYXlvdXREYXRhP1xuICAgICAgICAgICAgQG9iamVjdC5sYXlvdXREYXRhID0geyBcInR5cGVcIjogXCJ1aS5GcmVlTGF5b3V0XCIsIFwiY29udHJvbHNcIjogW10sIFwiZnJhbWVcIjogWzAsIDAsIDEsIDFdIH1cbiAgICAgICAgICAgIFxuICAgICAgICBMYW5ndWFnZU1hbmFnZXIubG9hZEJ1bmRsZXMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgc2NlbmUuIFxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgIFxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGFsbCBkYXRhIGZvciB0aGUgc2NlbmUgYW5kIGxvYWRzIHRoZSBuZWNlc3NhcnkgZ3JhcGhpYyBhbmQgYXVkaW8gcmVzb3VyY2VzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZURhdGFcbiAgICAqIEBhYnN0cmFjdFxuICAgICMjIyAgICBcbiAgICBwcmVwYXJlRGF0YTogLT5cbiAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50ID0gQG9iamVjdE1hbmFnZXJcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBHYW1lTWFuYWdlci5pbml0aWFsaXplZFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgQGRhdGFGaWVsZHMgPSB1aS5VaUZhY3RvcnkuZGF0YVNvdXJjZXNbQG9iamVjdC5sYXlvdXREYXRhLmRhdGFTb3VyY2UgfHwgXCJkZWZhdWx0XCJdKClcbiAgICAgICAgd2luZG93LiRkYXRhRmllbGRzID0gQGRhdGFGaWVsZHNcbiAgICAgICAgQG11c2ljID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoQG9iamVjdCwgQG9iamVjdC5sYXlvdXREYXRhLm11c2ljKVxuICAgICAgICBBdWRpb01hbmFnZXIubG9hZE11c2ljKEBtdXNpYylcbiAgICAgICAgQHByZXBhcmVUcmFuc2l0aW9uKFJlY29yZE1hbmFnZXIuc3lzdGVtLm1lbnVUcmFuc2l0aW9uKVxuICAgICAgICBcbiAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpVHlwZXNHcmFwaGljcyh1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXMpXG4gICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaUxheW91dEdyYXBoaWNzKEBvYmplY3QubGF5b3V0RGF0YSlcbiAgICAgICAgXG4gICAgICAgIGlmIEBkYXRhRmllbGRzP1xuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpRGF0YUZpZWxkc0dyYXBoaWNzKEBkYXRhRmllbGRzKVxuICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy9KYW5lRGF0ZV9Ob3JtYWxcIilcbiAgICAgXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIHZpc3VhbCBnYW1lIG9iamVjdCBmb3IgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVZpc3VhbFxuICAgICMjIyAgICAgICAgIFxuICAgIHByZXBhcmVWaXN1YWw6IC0+XG4gICAgICAgIHNjYWxlID0gR3JhcGhpY3Muc2NhbGVcbiAgICAgICAgdm9jYWIgPSBSZWNvcmRNYW5hZ2VyLnZvY2FidWxhcnlcblxuICAgICAgICBpZiBub3QgQGxheW91dD9cbiAgICAgICAgICAgIEBkYXRhT2JqZWN0ID0ge31cbiAgICAgICAgICAgIEBsYXlvdXQgPSB1aS5VaUZhY3RvcnkuY3JlYXRlRnJvbURlc2NyaXB0b3IoQG9iamVjdC5sYXlvdXREYXRhLCBAb2JqZWN0KVxuICAgIFxuICAgICAgICAgICAgaWYgQG11c2ljP1xuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5jaGFuZ2VNdXNpYyhAbXVzaWMsIDMwKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQGxheW91dC51aS5wcmVwYXJlKClcbiAgICAgICAgQGxheW91dC51aS5hcHBlYXIoKVxuICAgICAgICBAbGF5b3V0LnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAdHJhbnNpdGlvbigpXG4gICAgICAgIFxuICAgICAgICBpZiBTY2VuZU1hbmFnZXIucHJldmlvdXNTY2VuZXMubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuaXNFeGl0aW5nR2FtZVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuaXNFeGl0aW5nR2FtZSA9IG5vXG4gICAgICAgICAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RSZXNldFNjZW5lQ2hhbmdlKEBvYmplY3QubGF5b3V0TmFtZSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdFNjZW5lQ2hhbmdlKEBvYmplY3QubGF5b3V0TmFtZSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjIyAgICBcbiAgICB1cGRhdGVDb250ZW50OiAtPlxuICAgICAgICBHYW1lTWFuYWdlci51cGRhdGUoKVxuICAgICAgICBHcmFwaGljcy52aWV3cG9ydC51cGRhdGUoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTaG93cy9IaWRlcyB0aGUgY3VycmVudCBzY2VuZS4gQSBoaWRkZW4gc2NlbmUgaXMgbm8gbG9uZ2VyIHNob3duIGFuZCBleGVjdXRlZFxuICAgICogYnV0IGFsbCBvYmplY3RzIGFuZCBkYXRhIGlzIHN0aWxsIHRoZXJlIGFuZCBiZSBzaG93biBhZ2FpbiBhbnl0aW1lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd1xuICAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlIC0gSW5kaWNhdGVzIGlmIHRoZSBzY2VuZSBzaG91bGQgYmUgc2hvd24gb3IgaGlkZGVuLlxuICAgICMjIyAgICAgICAgICBcbiAgICBzaG93OiAodmlzaWJsZSkgLT5cbiAgICAgICAgaWYgdmlzaWJsZVxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQgPSBAcmVzb3VyY2VDb250ZXh0XG4gICAgICAgIEBsYXlvdXQudmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgQGxheW91dC51cGRhdGUoKVxuICAgICAgICBAb2JqZWN0TWFuYWdlci5hY3RpdmUgPSB2aXNpYmxlXG4gICAgICAgIGlmIHZpc2libGVcbiAgICAgICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudCA9IFNjZW5lTWFuYWdlciAjQG9iamVjdE1hbmFnZXJcbiAgICAgICAgI0BvYmplY3RNYW5hZ2VyLnVwZGF0ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHJpZ2dlcnMgYSBmdWxsIHJlZnJlc2ggb24gdGhlIG9iamVjdCByZXR1cm5lZCBieSB0aGUgc3BlY2lmaWVkIGJpbmRpbmctZXhwcmVzc2lvbi5cbiAgICAqIFRoZSBwYXJhbXMgbXVzdCBiZSBhIGRpcmVjdCBiaW5kaW5nLWV4cHJlc3Npb24gc3RyaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgZnVsbFJlZnJlc2hPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtICBUaGUgYmluZGluZyBleHByZXNzaW9uLlxuICAgICMjIyAgICBcbiAgICBmdWxsUmVmcmVzaE9iamVjdDogKHNlbmRlciwgb2JqZWN0KSAtPlxuICAgICAgICBvYmplY3QgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIG9iamVjdClcbiAgICAgICAgb2JqZWN0Py5mdWxsUmVmcmVzaCgpXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHRyaWdnZXJzIGEgcmVmcmVzaCBvbiB0aGUgb2JqZWN0IHJldHVybmVkIGJ5IHRoZSBzcGVjaWZpZWQgYmluZGluZy1leHByZXNzaW9uLlxuICAgICogVGhlIHBhcmFtcyBtdXN0IGJlIGEgZGlyZWN0IGJpbmRpbmctZXhwcmVzc2lvbiBzdHJpbmcuXG4gICAgKlxuICAgICogQG1ldGhvZCByZWZyZXNoT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMgLSAgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbi5cbiAgICAjIyMgICAgXG4gICAgcmVmcmVzaE9iamVjdDogKHNlbmRlciwgb2JqZWN0KSAtPlxuICAgICAgICBvYmplY3QgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIG9iamVjdClcbiAgICAgICAgb2JqZWN0Py5uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICAgICAgXG4gICAgYWRkU3R5bGU6IChzZW5kZXIsIHN0eWxlKSAtPlxuICAgICAgICBzdHlsZU9iamVjdCA9IHVpLlVJTWFuYWdlci5zdHlsZXNbc3R5bGVdXG4gICAgICAgIHN0eWxlT2JqZWN0Py5hcHBseShzZW5kZXIpXG4gICAgICAgIHNlbmRlci5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICBpZiBzdHlsZU9iamVjdD8uZm9udFxuICAgICAgICAgICAgc2VuZGVyLmJlaGF2aW9yLnJlZnJlc2goKVxuICAgICAgICBcbiAgICByZW1vdmVTdHlsZTogKHNlbmRlciwgc3R5bGUpIC0+IFxuICAgICAgICBzdHlsZU9iamVjdCA9IHVpLlVJTWFuYWdlci5zdHlsZXNbc3R5bGVdXG4gICAgICAgIHN0eWxlT2JqZWN0Py5yZXZlcnQoc2VuZGVyKVxuICAgICAgICBzZW5kZXIuZGVzY3JpcHRvci5zdHlsZXMucmVtb3ZlKHN0eWxlKVxuICAgICAgICBcbiAgICAgICAgZm9yIHMgaW4gc2VuZGVyLmRlc2NyaXB0b3Iuc3R5bGVzXG4gICAgICAgICAgICB1aS5VSU1hbmFnZXIuc3R5bGVzW3NdPy5hcHBseShzZW5kZXIpXG4gICAgICAgIHNlbmRlci5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICBpZiBzdHlsZU9iamVjdD8uZm9udFxuICAgICAgICAgICAgc2VuZGVyLmJlaGF2aW9yLnJlZnJlc2goKVxuICAgICAgICAgICAgXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBleGVjdXRlcyB0aGUgc3BlY2lmaWVkIGJpbmRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUJpbmRpbmdzXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IHBhcmFtcyAtICBBbiBhcnJheSBvZiBiaW5kaW5nLWRlZmluaXRpb25zLlxuICAgICMjIyBcbiAgICBleGVjdXRlQmluZGluZ3M6IChzZW5kZXIsIGJpbmRpbmdzKSAtPlxuICAgICAgICBmb3IgYmluZGluZyBpbiBiaW5kaW5nc1xuICAgICAgICAgICAgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmV4ZWN1dGVCaW5kaW5nKHNlbmRlciwgYmluZGluZylcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggZXhlY3V0ZXMgdGhlIHNwZWNpZmllZCBmb3JtdWxhcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVGb3JtdWxhc1xuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge3VpLkZvcm11bGFbXX0gcGFyYW1zIC0gIEFuIGFycmF5IG9mIGZvcm11bGEtZGVmaW5pdGlvbnMuXG4gICAgIyMjICBcbiAgICBleGVjdXRlRm9ybXVsYXM6IChzZW5kZXIsIGZvcm11bGFzKSAtPlxuICAgICAgICBmb3IgZm9ybXVsYSBpbiBmb3JtdWxhc1xuICAgICAgICAgICAgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmV4ZWN1dGVGb3JtdWxhKHNlbmRlciwgZm9ybXVsYSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGV4ZWN1dGVzIGFuIGFuaW1hdGlvbiBvbiBhIHNwZWNpZmllZCB0YXJnZXQgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQW5pbWF0aW9uXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSAgQ29udGFpbnMgdGFyZ2V0LWlkIGFuZCBhbmltYXRpb25zOiB7IHRhcmdldCwgYW5pbWF0aW9ucyB9XG4gICAgIyMjICAgICAgICAgXG4gICAgZXhlY3V0ZUFuaW1hdGlvbjogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBvYmplY3QgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIHBhcmFtcy50YXJnZXQpXG4gICAgICAgIGFuaW1hdGlvbiA9IG9iamVjdD8uYW5pbWF0aW9ucy5maXJzdCAoYSkgLT4gYS5ldmVudCA9PSBwYXJhbXMuZXZlbnRcbiAgICAgICAgXG4gICAgICAgIGlmIGFuaW1hdGlvbiBhbmQgb2JqZWN0XG4gICAgICAgICAgICBvYmplY3QuYW5pbWF0aW9uRXhlY3V0b3IuZXhlY3V0ZShhbmltYXRpb24pXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBlbWl0RXZlbnRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIGV2ZW50IG5hbWUsIHNvdXJjZSBhbmQgZGF0YS5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT5wYXJhbXMubmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBlbWl0PC9saT5cbiAgICAqIDxsaT5wYXJhbXMuc291cmNlIC0gQSBiaW5kaW5nLWV4cHJlc3Npb24gdG8gZGVmaW5lIHRoZSBnYW1lIG9iamVjdCB3aGljaCBzaG91bGQgZW1pdCB0aGUgZXZlbnQuPC9saT5cbiAgICAqIDxsaT5wYXJhbXMuZGF0YSAtIEFuIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZXZlbnQgc3BlY2lmaWMgZGF0YS48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyMgICAgXG4gICAgZW1pdEV2ZW50OiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIG9iamVjdCA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLnNvdXJjZSlcbiAgICAgICAgb2JqZWN0Py5ldmVudHMuZW1pdChwYXJhbXMubmFtZSwgb2JqZWN0LCB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIHBhcmFtcy5kYXRhKSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGNoYW5nZXMgdGhlIGdhbWUncyBhc3BlY3QgcmF0aW8uXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQmluZGluZ3NcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMgLSAgSWYgPGI+dHJ1ZTwvYj4gdGhlIGdhbWUgc2NyZWVuIHdpbGwgc3RyZXRjaGVkIHNvIHRoYXQgaXQgZmlsbHMgdGhlIGVudGlyZSBzY3JlZW5cbiAgICAqIG9mIHRoZSBwbGF5ZXIgd2l0aG91dCBhbnkgYmxhY2sgYm9yZGVycy4gT3RoZXJ3aXNlIHRoZSBnYW1lIHNjcmVlbiBzdHJldGNoZXMgYnV0IGtlZXBzIGl0cyByYXRpb1xuICAgICogc28gYmxhY2sgYm9yZGVycyBhcmUgcG9zc2libGUgaWYgdGhlIGdhbWUgcmVzb2x1dGlvbidzIHJhdGlvIGFuZCB0aGUgdGFyZ2V0IGRpc3BsYXkncyByYXRpbyBhcmUgbm90IG1hdGNoLiBJdCBjYW4gYWxzb1xuICAgICogYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjXG4gICAgYWRqdXN0QXNwZWN0UmF0aW86IChzZW5kZXIsIGFkanVzdCkgLT5cbiAgICAgICAgYWRqdXN0ID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBhZGp1c3QpXG4gICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvID0gYWRqdXN0XG4gICAgICAgIEdyYXBoaWNzLmtlZXBSYXRpbyA9ICFhZGp1c3RcbiAgICAgICAgR3JhcGhpY3Mub25SZXNpemUoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGVudGVycyBmdWxsc2NyZWVuIG1vZGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBlbnRlckZ1bGxTY3JlZW5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj5cbiAgICAjIyNcbiAgICBlbnRlckZ1bGxTY3JlZW46IChzZW5kZXIsIHBhcmFtcykgLT4gXG4gICAgICAgIGdzLkdyYXBoaWNzLmVudGVyRnVsbHNjcmVlbigpXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBHcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggbGVhdmVzIGZ1bGxzY3JlZW4gbW9kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxlYXZlRnVsbFNjcmVlblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPlxuICAgICMjI1xuICAgIGxlYXZlRnVsbFNjcmVlbjogLT4gXG4gICAgICAgIGdzLkdyYXBoaWNzLmxlYXZlRnVsbHNjcmVlbigpXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBHcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHRvZ2dsZXMgYmV0d2VlbiB3aW5kb3cgYW5kIGZ1bGxzY3JlZW4gbW9kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvZ2dsZUZ1bGxTY3JlZW5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+XG4gICAgIyMjXG4gICAgdG9nZ2xlRnVsbFNjcmVlbjogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBpZiBncy5HcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuICAgICAgICAgICAgZ3MuR3JhcGhpY3MubGVhdmVGdWxsc2NyZWVuKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZ3MuR3JhcGhpY3MuZW50ZXJGdWxsc2NyZWVuKClcblxuICAgICAgICBHYW1lTWFuYWdlci5zZXR0aW5ncy5mdWxsU2NyZWVuID0gZ3MuR3JhcGhpY3MuaXNGdWxsc2NyZWVuKClcbiAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggcGxheXMgdGhlIHNwZWNpZmllZCBzb3VuZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBsYXlTb3VuZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gVGhlIHNvdW5kIHRvIHBsYXkuXG4gICAgIyMjXG4gICAgcGxheVNvdW5kOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQocGFyYW1zKVxuICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKHBhcmFtcylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBwbGF5cyB0aGUgc3BlY2lmaWVkIHZvaWNlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheVZvaWNlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgdm9pY2UgdG8gcGxheS5cbiAgICAjIyNcbiAgICBwbGF5Vm9pY2U6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChwYXJhbXMpXG4gICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5Vm9pY2UocGFyYW1zKVxuICAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgdm9pY2Ugb24gb3Igb2ZmLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9uT2ZmVm9pY2VcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gSWYgPGI+dHJ1ZTwvYj4gdm9pY2Ugd2lsbCBiZSB0dXJuZWQgb24uIE90aGVyd2lzZSBpdCB3aWxsIGJlIHR1cm5lZCBvZmYuIENhbiBhbHNvIGJlIGEgYmluZGluZy1leHByZXNzaW9uLlxuICAgICMjIyBcbiAgICB0dXJuT25PZmZWb2ljZTogKHNlbmRlciwgc3RhdGUpIC0+XG4gICAgICAgIGlmIHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgc3RhdGUpIHRoZW4gQHR1cm5PblZvaWNlKCkgZWxzZSBAdHVybk9mZlZvaWNlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCB0dXJucyBtdXNpYyBvbiBvciBvZmYuXG4gICAgKlxuICAgICogQG1ldGhvZCB0dXJuT25PZmZNdXNpY1xuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBJZiA8Yj50cnVlPC9iPiBtdXNpYyB3aWxsIGJlIHR1cm5lZCBvbi4gT3RoZXJ3aXNlIGl0IHdpbGwgYmUgdHVybmVkIG9mZi4gQ2FuIGFsc28gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjIFxuICAgIHR1cm5Pbk9mZk11c2ljOiAoc2VuZGVyLCBzdGF0ZSkgLT5cbiAgICAgICAgaWYgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBzdGF0ZSkgdGhlbiBAdHVybk9uTXVzaWMoKSBlbHNlIEB0dXJuT2ZmTXVzaWMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIHNvdW5kIG9uIG9yIG9mZi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5Pbk9mZlNvdW5kXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIElmIDxiPnRydWU8L2I+IHNvdW5kIHdpbGwgYmUgdHVybmVkIG9uLiBPdGhlcndpc2UgaXQgd2lsbCBiZSB0dXJuZWQgb2ZmLiBDYW4gYWxzbyBiZSBhIGJpbmRpbmctZXhwcmVzc2lvbi5cbiAgICAjIyMgXG4gICAgdHVybk9uT2ZmU291bmQ6IChzZW5kZXIsIHN0YXRlKSAtPlxuICAgICAgICBpZiB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIHN0YXRlKSB0aGVuIEB0dXJuT25Tb3VuZCgpIGVsc2UgQHR1cm5PZmZTb3VuZCgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgb2ZmIHZvaWNlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9mZlZvaWNlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAjIyMgXG4gICAgdHVybk9mZlZvaWNlOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcEFsbFZvaWNlcygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgb2ZmIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9mZk11c2ljXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAjIyMgXG4gICAgdHVybk9mZk11c2ljOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcE11c2ljKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCB0dXJucyBvZmYgc291bmQuXG4gICAgKlxuICAgICogQG1ldGhvZCB0dXJuT2ZmU291bmRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyBcbiAgICB0dXJuT2ZmU291bmQ6IC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsU291bmRzKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCB0dXJucyBvbiB2b2ljZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5PblZvaWNlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAjIyMgXG4gICAgdHVybk9uVm9pY2U6IC0+XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgb24gc291bmQuXG4gICAgKlxuICAgICogQG1ldGhvZCB0dXJuT25Tb3VuZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjIFxuICAgIHR1cm5PblNvdW5kOiAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIG9uIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9uTXVzaWNcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyBcbiAgICB0dXJuT25NdXNpYzogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnJlc3VtZU11c2ljKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzZWxlY3RzIHRoZSBzcGVjaWZpZWQgbGFuZ3VhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZWxlY3RMYW5ndWFnZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IHBhcmFtcyAtIEluZGV4IG9mIHRoZSBsYW5ndWFnZSB0byBzZXQuIENhbiBiZSBhIGJpbmRpbmctZXhwcmVzc2lvbi5cbiAgICAjIyMgXG4gICAgc2VsZWN0TGFuZ3VhZ2U6IChzZW5kZXIsIHBhcmFtcyktPlxuICAgICAgICBsYW5ndWFnZSA9IExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZXNbdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBwYXJhbXMpXVxuICAgICAgICBMYW5ndWFnZU1hbmFnZXIuc2VsZWN0TGFuZ3VhZ2UobGFuZ3VhZ2UpXG4gICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCByZXNldHMgZ2xvYmFsIGRhdGEgc3RvcmFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc2V0R2xvYmFsRGF0YVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyBcbiAgICByZXNldEdsb2JhbERhdGE6IChzZW5kZXIpIC0+IFxuICAgICAgICBHYW1lTWFuYWdlci5yZXNldEdsb2JhbERhdGEoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggc2F2ZXMgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNhdmVTZXR0aW5nc1xuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyBcbiAgICBzYXZlU2V0dGluZ3M6IChzZW5kZXIpIC0+IEdhbWVNYW5hZ2VyLnNhdmVTZXR0aW5ncygpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBwcmVwYXJlcyB0aGUgZ2FtZSBmb3Igc2F2aW5nIGJ5IHRha2luZyBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IGdhbWUgc3RhdGVcbiAgICAqIGFuZCBzdG9yaW5nIGl0IGluIEdhbWVNYW5hZ2VyLnNhdmVHYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVNhdmVHYW1lXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjIFxuICAgIHByZXBhcmVTYXZlR2FtZTogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBHYW1lTWFuYWdlci5wcmVwYXJlU2F2ZUdhbWUocGFyYW1zPy5zbmFwc2hvdClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzYXZlcyB0aGUgY3VycmVudCBnYW1lIGF0IHRoZSBzcGVjaWZpZWQgc2F2ZSBzbG90LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2F2ZUdhbWVcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBzbG90LWluZGV4IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT5wYXJhbXMuc2xvdCAtIFRoZSBzbG90LWluZGV4IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZC4gQ2FuIGJlIGEgYmluZGluZy1leHByZXNzaW9uLjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjIyBcbiAgICBzYXZlR2FtZTogKHNlbmRlciwgcGFyYW1zKSAtPiBHYW1lTWFuYWdlci5zYXZlKHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLnNsb3QpKVxuICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggbG9hZHMgdGhlIGdhbWUgZnJvbSB0aGUgc3BlY2lmaWVkIHNhdmUgc2xvdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRHYW1lXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDb250YWlucyB0aGUgc2xvdC1pbmRleCB3aGVyZSB0aGUgZ2FtZSBzaG91bGQgYmUgbG9hZGVkIGZyb20uXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLnNsb3QgLSBUaGUgc2xvdC1pbmRleCB3aGVyZSB0aGUgZ2FtZSBzaG91bGQgYmUgbG9hZGVkIGZyb20uIENhbiBiZSBhIGJpbmRpbmctZXhwcmVzc2lvbi48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyMgXG4gICAgbG9hZEdhbWU6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBHYW1lTWFuYWdlci5sb2FkKHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLnNsb3QpKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHN0YXJ0cyBhIG5ldyBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgbmV3R2FtZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+XG4gICAgIyMjIFxuICAgIG5ld0dhbWU6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygzMClcbiAgICAgICAgR2FtZU1hbmFnZXIubmV3R2FtZSgpXG4gICAgICAgIFxuICAgICAgICBzY2VuZSA9IG5ldyB2bi5PYmplY3RfU2NlbmUoKVxuICAgICAgICBTY2VuZU1hbmFnZXIuY2xlYXIoKVxuICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBleGlzdHMgdGhlIGN1cnJlbnQgZ2FtZS4gSXQgZG9lc24ndCBjaGFuZ2UgdGhlIHNjZW5lIGFuZFxuICAgICogc2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgc3dpdGNoaW5nIGJhY2sgdG8gdGhlIHRpdGxlIHNjcmVlbiBvciBtYWluIG1lbnUuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGl0R2FtZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+XG4gICAgIyMjIFxuICAgIGV4aXRHYW1lOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLmV4aXRHYW1lKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzd2l0Y2hlcyB0byBhbm90aGVyIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3dpdGNoU2NlbmVcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBjbGFzcyBuYW1lIG9mIHRoZSBzY2VuZSB0byBzd2l0Y2ggdG8uXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLm5hbWUgLSBUaGUgY2xhc3MtbmFtZSBvZiB0aGUgc2NlbmUgdG8gc3dpdGNoIHRvLiBUaGUgY2xhc3MgbXVzdCBiZSBkZWZpbmVkIGluIHZuLW5hbWVzcGFjZS48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyMgICAgIFxuICAgIHN3aXRjaFNjZW5lOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIGYgPSA9PlxuICAgICAgICAgICAgaWYgcGFyYW1zLmNsZWFyXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNjZW5lID0gbmV3IHZuW3BhcmFtcy5uYW1lXSgpXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIHBhcmFtcy5zYXZlUHJldmlvdXMpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIXBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIEBsYXlvdXQudWkuZGlzYXBwZWFyIChlKSA9PiBmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZigpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggc3dpdGNoZXMgdG8gYW5vdGhlciBnYW1lIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3dpdGNoR2FtZVNjZW5lXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDb250YWlucyB0aGUgVUlEIG9mIHRoZSBzY2VuZSB0byBzd2l0Y2ggdG8uXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLnVpZCAtIFRoZSBVSUQgb2YgdGhlIHNjZW5lIHRvIHN3aXRjaCB0by48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyMgICAgXG4gICAgc3dpdGNoR2FtZVNjZW5lOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIGYgPSA9PlxuICAgICAgICAgICAgaWYgcGFyYW1zLmNsZWFyXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHVpZCA9IHBhcmFtcy51aWRcbiAgICAgICAgICAgIGlmIHBhcmFtcy5uYW1lXG4gICAgICAgICAgICAgICAgc2NlbmVEb2N1bWVudHMgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJ2bi5zY2VuZVwiKVxuICAgICAgICAgICAgICAgIHNjZW5lRG9jdW1lbnQgPSBzY2VuZURvY3VtZW50cy5maXJzdCAoZCkgLT4gZC5pdGVtcy5uYW1lID09IHBhcmFtcy5uYW1lXG4gICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICB1aWQgPSBzY2VuZURvY3VtZW50LnVpZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzY2VuZURhdGEgPSB1aWQ6IHVpZCwgcGljdHVyZXM6IFtdLCB0ZXh0czogW11cbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lRGF0YSA9IHNjZW5lRGF0YVxuICAgICAgICAgICAgbmV3U2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKClcbiAgICAgICAgICAgIG5ld1NjZW5lLnNjZW5lRGF0YSA9IHNjZW5lRGF0YVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3U2NlbmUsIHBhcmFtcy5zYXZlUHJldmlvdXMpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIXBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIChAbGF5b3V0fHxAb2JqZWN0LmxheW91dCkudWkuZGlzYXBwZWFyIChlKSA9PiBmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZigpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzd2l0Y2hlcyB0byBhbm90aGVyIGxheW91dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN3aXRjaExheW91dFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ29udGFpbnMgdGhlIG5hbWUgb2YgdGhlIGxheW91dCB0byBzd2l0Y2ggdG8uXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLm5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbGF5b3V0IHRvIHN3aXRjaCB0by48L2xpPlxuICAgICogPGxpPnBhcmFtcy5zYXZlUHJldmlvdXMgLSBJbmRpY2F0ZXMgaWYgdGhlIGN1cnJlbnQgbGF5b3V0IHNob3VsZCBub3QgYmUgZXJhc2VkIGJ1dCBwYXVzZWQgYW5kIGhpZGRlbiBpbnN0ZWFkIHNvXG4gICAgKiB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCB1c2luZyA8aT5yZXR1cm5Ub1ByZXZpb3VzPC9pPiBhY3Rpb24uPC9saT5cbiAgICAqIDxsaT5wYXJhbXMuZGF0YUZpZWxkcyAtIERlZmluZXMgdGhlIGRhdGEgb2YgXCIkZGF0YUZpZWxkc1wiIGJpbmRpbmctZXhwcmVzc2lvbiB2YXJpYWJsZS4gQ2FuIGJlIGEgYmluZGluZy1leHByZXNzaW9uXG4gICAgKiBvciBhIGRpcmVjdCBvYmplY3QuIE9wdGlvbmFsLjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjIyAgICBcbiAgICBzd2l0Y2hMYXlvdXQ6IChzZW5kZXIsIGxheW91dCkgLT5cbiAgICAgICAgZiA9ID0+XG4gICAgICAgICAgICBHcmFwaGljcy5mcmVlemUoKVxuICAgICAgICAgICAgaWYgbGF5b3V0LmNsZWFyXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNjZW5lID0gbmV3IGdzLk9iamVjdF9MYXlvdXQobGF5b3V0Lm5hbWUpXG4gICAgICAgICAgXG4gICAgICAgICAgICBkYXRhRmllbGRzID0gc2VuZGVyLmRhdGFGaWVsZHNcbiAgICAgICAgICAgIGlmIHR5cGVvZiBsYXlvdXQuZGF0YUZpZWxkcyA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgICAgICAgZGF0YUZpZWxkcyA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgbGF5b3V0LmRhdGFGaWVsZHMpXG4gICAgICAgICAgICBlbHNlIGlmIGxheW91dC5kYXRhRmllbGRzP1xuICAgICAgICAgICAgICAgIGRhdGFGaWVsZHMgPSBsYXlvdXQuZGF0YUZpZWxkc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2NlbmUuZGF0YUZpZWxkcyA9IGRhdGFGaWVsZHNcbiAgICAgICAgICAgIHNjZW5lLmNvbnRyb2xsZXJzID0gbGF5b3V0LmNvbnRyb2xsZXJzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGxheW91dC5zZW5kZXJEYXRhP1xuICAgICAgICAgICAgICAgIGZvciBzZW5kZXJGaWVsZCBpbiBsYXlvdXQuc2VuZGVyRGF0YVxuICAgICAgICAgICAgICAgICAgICBzY2VuZVtzZW5kZXJGaWVsZF0gPSBzZW5kZXJbc2VuZGVyRmllbGRdXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIGxheW91dC5zYXZlUHJldmlvdXMsIGxheW91dC5zdGFjaylcbiAgICAgICAgXG4gICAgICAgIGlmICFsYXlvdXQuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICAoQGxheW91dHx8QG9iamVjdC5sYXlvdXQpLnVpLmRpc2FwcGVhciAoZSkgPT4gZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGYoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHJldHVybnMgdG8gcHJldmlvdXMgbGF5b3V0LiAoSWYgc2F2ZVByZXZpb3VzIHdhcyBzZXQgdG8gPGI+dHJ1ZTwvYj4gb24gc3dpdGNoTGF5b3V0LikuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmV2aW91c0xheW91dFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyAgICAgXG4gICAgcHJldmlvdXNMYXlvdXQ6IChzZW5kZXIpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5yZXR1cm5Ub1ByZXZpb3VzKClcbiAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggZGlzcG9zZXMgdGhlIHNwZWNpZmllZCBjb250cm9sLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZUNvbnRyb2xcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtIFRoZSBJRCBvZiB0aGUgY29udHJvbCB0byBkaXNwb3NlLiBDYW4gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjICAgIFxuICAgIGRpc3Bvc2VDb250cm9sOiAoc2VuZGVyLCBpZCkgLT5cbiAgICAgICAgY29udHJvbCA9IEBvYmplY3RNYW5hZ2VyLm9iamVjdEJ5SWQodWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBpZCkpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY29udHJvbD8udWkuZGlzYXBwZWFyIChzZW5kZXIpIC0+IHNlbmRlci5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29udHJvbCBmcm9tIHRoZSBzcGVjaWZpZWQgZGVzY3JpcHRvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUNvbnRyb2xcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBkZXNjcmlwdG9yIGFuZCBvdGhlciBkYXRhIG5lZWRlZCB0byBjb25zdHJ1Y3QgdGhlIGNvbnRyb2wuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLmRlc2NyaXB0b3IgLSBUaGUgY29udHJvbCcgZGVzY3JpcHRvci4gQ2FuIGJlIGEgZGlyZWN0IGRlc2NyaXB0b3IgZGVmaW5pdGlvbiBvciBhIHRlbXBsYXRlIG5hbWU8L2xpPlxuICAgICogPGxpPnBhcmFtcy5wYXJlbnQgLSBBIGJpbmRpbmctZXhwcmVzc2lvbiB3aGljaCByZXR1cm5zIHRoZSBjb250cm9sJ3MgcGFyZW50LjwvbGk+XG4gICAgKiA8bGk+cGFyYW1zLnNlbmRlckRhdGEgLSBBbiBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgbWVyZ2VkIGludG8gdGhlIGNvbnRyb2wgb2JqZWN0LjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjIyAgXG4gICAgY3JlYXRlQ29udHJvbDogKHNlbmRlciwgZGF0YSkgLT5cbiAgICAgICAgaWYgdHlwZW9mIGRhdGEuZGVzY3JpcHRvciA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdG9yID0gdWkuVUlNYW5hZ2VyLmN1c3RvbVR5cGVzW2RhdGEuZGVzY3JpcHRvcl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVzY3JpcHRvciA9IGRhdGEuZGVzY3JpcHRvclxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHBhcmVudCA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgZGF0YS5wYXJlbnQpXG4gICAgICAgIGNvbnRyb2wgPSB1aS5VaUZhY3RvcnkuX2NyZWF0ZUZyb21EZXNjcmlwdG9yKGRlc2NyaXB0b3IsIHBhcmVudCA/IEBvYmplY3QpXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhLnNlbmRlckRhdGE/XG4gICAgICAgICAgICBmb3IgZmllbGROYW1lIGluIGRhdGEuc2VuZGVyRGF0YVxuICAgICAgICAgICAgICAgIGNvbnRyb2xbZmllbGROYW1lXSA9IHNlbmRlcltmaWVsZE5hbWVdXG4gICAgICAgIGNvbnRyb2wudWkucHJlcGFyZSgpXG4gICAgICAgIGNvbnRyb2wudWkuYXBwZWFyKClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggcXVpdHMgdGhlIGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBxdWl0R2FtZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjIyBcbiAgICBxdWl0R2FtZTogKHNlbmRlciwgZGF0YSkgLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG51bGwpXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3IgPSBDb21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvciJdfQ==
//# sourceURL=Component_LayoutSceneBehavior_22.js