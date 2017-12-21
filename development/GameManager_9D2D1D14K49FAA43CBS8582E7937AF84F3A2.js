var GameManager;

GameManager = (function() {

  /**
  * Manages all general things around the game like holding the game settings,
  * manages the save/load of a game, etc.
  *
  * @module gs
  * @class GameManager
  * @memberof gs
  * @constructor
   */
  function GameManager() {

    /**
    * The current scene data.
    * @property sceneData
    * @type Object
     */
    this.sceneData = {};

    /**
    * The scene viewport containing all visual objects which are part of the scene and influenced
    * by the in-game camera.
    * @property sceneViewport
    * @type gs.Object_Viewport
     */
    this.sceneViewport = null;

    /**
    * The list of common events.
    * @property commonEvents
    * @type gs.Object_CommonEvent[]
     */
    this.commonEvents = [];

    /**
    * Indicates if the GameManager is initialized.
    * @property commonEvents
    * @type gs.Object_CommonEvent[]
     */
    this.initialized = false;

    /**
    * Temporary game settings.
    * @property tempSettings
    * @type Object
     */
    this.tempSettings = {
      skip: false,
      skipTime: 5,
      loadMenuAccess: true,
      menuAccess: true,
      backlogAccess: true,
      saveMenuAccess: true,
      messageFading: {
        animation: {
          type: 1
        },
        duration: 15,
        easing: null
      }

      /**
      * Temporary game fields.
      * @property tempFields
      * @type Object
       */
    };
    this.tempFields = null;

    /**
    * Stores default values for backgrounds, pictures, etc.
    * @property defaults
    * @type Object
     */
    this.defaults = {
      background: {
        "duration": 30,
        "origin": 0,
        "zOrder": 0,
        "loopVertical": 0,
        "loopHorizontal": 0,
        "easing": {
          "type": 0,
          "inOut": 1
        },
        "animation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      picture: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      character: {
        "expressionDuration": 0,
        "appearDuration": 40,
        "disappearDuration": 40,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 2,
          "inOut": 2
        },
        "disappearEasing": {
          "type": 1,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        },
        "changeAnimation": {
          "type": 1,
          "movement": 0,
          "fading": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "changeEasing": {
          "type": 2,
          "inOut": 2
        }
      },
      text: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "positionOrigin": 0,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      video: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      live2d: {
        "motionFadeInTime": 1000,
        "appearDuration": 30,
        "disappearDuration": 30,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        }
      },
      messageBox: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 0,
          "movement": 3,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 0,
          "movement": 3,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        }
      },
      audio: {
        "musicFadeInDuration": 0,
        "musicFadeOutDuration": 0,
        "musicVolume": 100,
        "musicPlaybackRate": 100,
        "soundVolume": 100,
        "soundPlaybackRate": 100,
        "voiceVolume": 100,
        "voicePlaybackRate": 100
      }
    };

    /**
    * The game's backlog.
    * @property backlog
    * @type Object[]
     */
    this.backlog = [];

    /**
    * Character parameters by character ID.
    * @property characterParams
    * @type Object[]
     */
    this.characterParams = [];

    /**
    * The game's chapter
    * @property chapters
    * @type gs.Document[]
     */
    this.chapters = [];

    /**
    * The game's current displayed messages. Especially in NVL mode the messages 
    * of the current page are stored here.
    * @property messages
    * @type Object[]
     */
    this.messages = [];

    /**
    * Count of save slots. Default is 100.
    * @property saveSlotCount
    * @type number
     */
    this.saveSlotCount = 100;

    /**
    * The index of save games. Contains the header-info for each save game slot.
    * @property saveGameSlots
    * @type Object[]
     */
    this.saveGameSlots = [];

    /**
    * Stores global data like the state of persistent game variables.
    * @property globalData
    * @type Object
     */
    this.globalData = null;

    /**
    * Indicates if the game runs in editor's live-preview.
    * @property inLivePreview
    * @type Object
     */
    this.inLivePreview = false;
  }


  /**
  * Initializes the GameManager, should be called before the actual game starts.
  *
  * @method initialize
   */

  GameManager.prototype.initialize = function() {
    var character, i, j, k, l, len, len1, param, ref, ref1, ref2, ref3, ref4, ref5, ref6;
    this.initialized = true;
    this.inLivePreview = $PARAMS.preview != null;
    this.saveSlotCount = RecordManager.system.saveSlotCount || 100;
    this.tempFields = new gs.GameTemp();
    window.$tempFields = this.tempFields;
    this.createSaveGameIndex();
    this.variableStore = new gs.VariableStore();
    this.variableStore.setupDomains(DataManager.getDocumentsByType("global_variables").select(function(v) {
      return v.items.domain || "";
    }));
    this.variableStore.persistentNumbers = (ref = this.globalData.persistentNumbers) != null ? ref : this.variableStore.persistentNumbers;
    this.variableStore.persistentBooleans = (ref1 = this.globalData.persistentBooleans) != null ? ref1 : this.variableStore.persistentBooleans;
    this.variableStore.persistentStrings = (ref2 = this.globalData.persistentStrings) != null ? ref2 : this.variableStore.persistentStrings;
    this.variableStore.persistentLists = (ref3 = this.globalData.persistentLists) != null ? ref3 : this.variableStore.persistentLists;
    this.sceneViewport = new gs.Object_Viewport(new Viewport(0, 0, Graphics.width, Graphics.height, Graphics.viewport));
    ref4 = RecordManager.charactersArray;
    for (j = 0, len = ref4.length; j < len; j++) {
      character = ref4[j];
      if (character != null) {
        this.characterParams[character.index] = {};
        if (character.params != null) {
          ref5 = character.params;
          for (k = 0, len1 = ref5.length; k < len1; k++) {
            param = ref5[k];
            this.characterParams[character.index][param.name] = param.value;
          }
        }
      }
    }
    this.setupCommonEvents();
    for (i = l = 0, ref6 = RecordManager.characters; 0 <= ref6 ? l < ref6 : l > ref6; i = 0 <= ref6 ? ++l : --l) {
      this.settings.voicesPerCharacter[i] = 100;
    }
    this.chapters = DataManager.getDocumentsByType("vn.chapter");
    return this.chapters.sort(function(a, b) {
      if (a.items.order > b.items.order) {
        return 1;
      } else if (a.items.order < b.items.order) {
        return -1;
      } else {
        return 0;
      }
    });
  };


  /**
  * Sets up common events.
  *
  * @method setupCommonEvents
   */

  GameManager.prototype.setupCommonEvents = function() {
    var event, j, k, len, len1, object, ref, ref1, results;
    ref = this.commonEvents;
    for (j = 0, len = ref.length; j < len; j++) {
      event = ref[j];
      if (event != null) {
        event.dispose();
      }
    }
    this.commonEvents = [];
    ref1 = RecordManager.commonEvents;
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      event = ref1[k];
      if (!event) {
        continue;
      }
      if (event.startCondition === 1 && event.autoPreload) {
        gs.ResourceLoader.loadEventCommandsGraphics(event.commands);
      }
      object = new gs.Object_CommonEvent();
      object.record = event;
      object.rid = event.index;
      this.commonEvents[event.index] = object;
      results.push(this.commonEvents.push(object));
    }
    return results;
  };


  /**
  * Sets up cursor depending on system settings.
  *
  * @method setupCursor
   */

  GameManager.prototype.setupCursor = function() {
    var bitmap, ref;
    if ((ref = RecordManager.system.cursor) != null ? ref.name : void 0) {
      bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + RecordManager.system.cursor.name);
      return Graphics.setCursorBitmap(bitmap, RecordManager.system.cursor.hx, RecordManager.system.cursor.hy);
    } else {
      return Graphics.setCursorBitmap(null);
    }
  };


  /**
  * Disposes the GameManager. Should be called before quit the game.
  *
  * @method dispose
   */

  GameManager.prototype.dispose = function() {};


  /**
  * Quits the game. The implementation depends on the platform. So for example on mobile
  * devices this method has no effect.
  *
  * @method exit
   */

  GameManager.prototype.exit = function() {
    return Application.exit();
  };


  /**
  * Resets the GameManager by disposing and re-initializing it.
  *
  * @method reset
   */

  GameManager.prototype.reset = function() {
    this.initialized = false;
    this.interpreter = null;
    this.dispose();
    return this.initialize();
  };


  /**
  * Starts a new game.
  *
  * @method newGame
   */

  GameManager.prototype.newGame = function() {
    this.messages = [];
    this.variableStore.clearAllGlobalVariables();
    this.variableStore.clearAllLocalVariables();
    this.tempSettings.skip = false;
    this.tempFields.clear();
    this.tempFields.inGame = true;
    this.setupCommonEvents();
    this.tempSettings.menuAccess = true;
    this.tempSettings.saveMenuAccess = true;
    this.tempSettings.loadMenuAccess = true;
    return this.tempSettings.backlogAccess = true;
  };


  /**
  * Exists the game and resets the GameManager which is important before going back to
  * the main menu or title screen.
  *
  * @method exitGame
   */

  GameManager.prototype.exitGame = function() {
    this.tempFields.inGame = false;
    return this.tempFields.isExitingGame = true;
  };


  /**
  * Updates the GameManager. Should be called once per frame.
  *
  * @method update
   */

  GameManager.prototype.update = function() {};


  /**
  * Creates the index of all save-games. Should be called whenever a new save game
  * is created.
  *
  * @method createSaveGameIndex
  * @protected
   */

  GameManager.prototype.createSaveGameIndex = function() {
    var chaper, chapter, header, i, image, j, ref, scene;
    this.saveGameSlots = [];
    for (i = j = 0, ref = this.saveSlotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (GameStorage.exists("SaveGame_" + i + "_Header")) {
        header = GameStorage.getObject("SaveGame_" + i + "_Header");
        chapter = DataManager.getDocument(header.chapterUid);
        scene = DataManager.getDocumentSummary(header.sceneUid);
        image = header.image;
      } else {
        header = null;
        chaper = null;
        scene = null;
      }
      if ((chapter != null) && (scene != null) && !this.inLivePreview) {
        this.saveGameSlots.push({
          date: header.date,
          chapter: chapter.items.name || "DELETED",
          scene: scene.items.name || "DELETED",
          image: image
        });
      } else {
        this.saveGameSlots.push({
          "date": "",
          "chapter": "",
          "scene": "",
          "image": null
        });
      }
    }
    return this.saveGameSlots;
  };


  /**
  * Resets the game's settings to its default values.
  *
  * @method resetSettings
   */

  GameManager.prototype.resetSettings = function() {
    var i, j, ref;
    this.settings = {
      version: 339,
      renderer: 0,
      filter: 1,
      confirmation: true,
      adjustAspectRatio: false,
      allowSkip: true,
      allowSkipUnreadMessages: true,
      allowVideoSkip: true,
      skipVoiceOnAction: true,
      allowChoiceSkip: false,
      voicesByCharacter: [],
      timeMessageToVoice: true,
      "autoMessage": {
        enabled: false,
        time: 0,
        waitForVoice: true,
        stopOnAction: false
      },
      "voiceEnabled": true,
      "bgmEnabled": true,
      "soundEnabled": true,
      "voiceVolume": 100,
      "bgmVolume": 100,
      "seVolume": 100,
      "messageSpeed": 4,
      "fullScreen": false,
      "aspectRatio": 0
    };
    this.saveGameSlots = [];
    for (i = j = 0, ref = this.saveSlotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      GameStorage.remove("SaveGame_" + i + "_Header");
      GameStorage.remove("SaveGame_" + i);
      this.saveGameSlots.push({
        "date": "",
        "chapter": "",
        "scene": "",
        "thumb": ""
      });
    }
    GameStorage.setObject("settings", this.settings);
    this.globalData = {
      messages: {},
      cgGallery: {}
    };
    return GameStorage.setObject("globalData", this.globalData);
  };


  /**
  * Saves current game settings.
  *
  * @method saveSettings
   */

  GameManager.prototype.saveSettings = function() {
    return GameStorage.setObject("settings", this.settings);
  };


  /**
  * Saves current global data.
  *
  * @method saveGlobalData
   */

  GameManager.prototype.saveGlobalData = function() {
    this.globalData.persistentNumbers = this.variableStore.persistentNumbers;
    this.globalData.persistentLists = this.variableStore.persistentLists;
    this.globalData.persistentBooleans = this.variableStore.persistentBooleans;
    this.globalData.persistentStrings = this.variableStore.persistentStrings;
    return GameStorage.setObject("globalData", this.globalData);
  };


  /**
  * Resets current global data. All stored data about read messages, persistent variables and
  * CG gallery will be deleted.
  *
  * @method resetGlobalData
   */

  GameManager.prototype.resetGlobalData = function() {
    var cg, i, j, len, ref;
    this.globalData = {
      messages: {},
      cgGallery: {},
      version: 339
    };
    ref = RecordManager.cgGalleryArray;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      cg = ref[i];
      if (cg != null) {
        this.globalData.cgGallery[cg.index] = {
          unlocked: false
        };
      }
    }
    return GameStorage.setObject("globalData", this.globalData);
  };

  GameManager.prototype.readSaveGame = function(saveGame) {};

  GameManager.prototype.writeSaveGame = function(saveGame) {};

  GameManager.prototype.prepareSaveGame = function(snapshot) {
    var context, messageBoxIds, messageBoxes, messageIds, messages, saveGame, sceneData;
    if (snapshot) {
      snapshot = ResourceManager.getCustomBitmap("$snapshot");
      if (snapshot != null) {
        snapshot.dispose();
      }
      ResourceManager.setCustomBitmap("$snapshot", Graphics.snapshot());
    }
    context = new gs.ObjectCodecContext();
    context.decodedObjectStore.push(Graphics.viewport);
    context.decodedObjectStore.push(this.scene);
    context.decodedObjectStore.push(this.scene.behavior);
    messageBoxIds = ["messageBox", "nvlMessageBox", "messageMenu"];
    messageIds = ["gameMessage_message", "nvlGameMessage_message"];
    messageBoxes = messageBoxIds.select((function(_this) {
      return function(id) {
        return _this.scene.behavior.objectManager.objectById(id);
      };
    })(this));
    messages = messageIds.select((function(_this) {
      return function(id) {
        return _this.scene.behavior.objectManager.objectById(id);
      };
    })(this));
    sceneData = {};
    saveGame = {};
    saveGame.encodedObjectStore = null;
    saveGame.sceneUid = this.scene.sceneDocument.uid;
    saveGame.data = {
      resourceContext: this.scene.behavior.resourceContext.toDataBundle(),
      currentCharacter: this.scene.currentCharacter,
      characterParams: this.characterParams,
      frameCount: Graphics.frameCount,
      tempFields: this.tempFields,
      viewport: this.scene.viewport,
      characters: this.scene.characters,
      characterNames: RecordManager.charactersArray.select(function(c) {
        return {
          name: c.name,
          index: c.index
        };
      }),
      backgrounds: this.scene.backgrounds,
      pictures: this.scene.pictureContainer.subObjectsByDomain,
      texts: this.scene.textContainer.subObjectsByDomain,
      videos: this.scene.videoContainer.subObjectsByDomain,
      viewports: this.scene.viewportContainer.subObjects,
      commonEvents: this.scene.commonEventContainer.subObjects,
      hotspots: this.scene.hotspotContainer.subObjectsByDomain,
      interpreter: this.scene.interpreter,
      messageBoxes: messageBoxes.select((function(_this) {
        return function(mb, i) {
          return {
            visible: mb.visible,
            id: mb.id,
            message: messages[i]
          };
        };
      })(this)),
      backlog: this.backlog,
      variableStore: this.variableStore,
      defaults: this.defaults,
      transitionData: SceneManager.transitionData,
      audio: {
        audioBuffers: AudioManager.audioBuffers,
        audioBuffersByLayer: AudioManager.audioBuffersByLayer,
        audioLayers: AudioManager.audioLayers,
        soundReferences: AudioManager.soundReferences
      },
      messageAreas: this.scene.messageAreaContainer.subObjectsByDomain
    };
    saveGame.data = gs.ObjectCodec.encode(saveGame.data, context);
    saveGame.encodedObjectStore = context.encodedObjectStore;
    return this.saveGame = saveGame;
  };

  GameManager.prototype.createSaveGameSlot = function(header) {
    var slot;
    slot = {
      "date": new Date().toDateString(),
      "chapter": this.scene.chapter.items.name,
      "scene": this.scene.sceneDocument.items.name,
      "image": header.image
    };
    return slot;
  };

  GameManager.prototype.createSaveGameHeader = function(thumbWidth, thumbHeight) {
    var header, thumbImage;
    thumbImage = this.createSaveGameThumbImage(thumbWidth, thumbHeight);
    header = {
      "date": new Date().toDateString(),
      "chapterUid": this.scene.chapter.uid,
      "sceneUid": this.scene.sceneDocument.uid,
      "image": thumbImage != null ? thumbImage.image.toDataURL() : void 0
    };
    if (thumbImage != null) {
      thumbImage.dispose();
    }
    return header;
  };

  GameManager.prototype.createSaveGameThumbImage = function(width, height) {
    var snapshot, thumbImage;
    snapshot = ResourceManager.getBitmap("$snapshot");
    thumbImage = null;
    if (snapshot) {
      if (width && height) {
        thumbImage = new Bitmap(width, height);
      } else {
        thumbImage = new Bitmap(Graphics.width / 8, Graphics.height / 8);
      }
      thumbImage.stretchBlt(new Rect(0, 0, thumbImage.width, thumbImage.height), snapshot, new Rect(0, 0, snapshot.width, snapshot.height));
    }
    return thumbImage;
  };

  GameManager.prototype.storeSaveGame = function(name, saveGame, header) {
    if (header) {
      GameStorage.setData(name + "_Header", JSON.stringify(header));
    }
    return GameStorage.setData(name, JSON.stringify(saveGame));
  };


  /**
  * Saves the current game at the specified slot.
  *
  * @method save
  * @param {number} slot - The slot where the game should be saved at.
  * @param {number} thumbWidth - The width for the snapshot-thumb. You can specify <b>null</b> or 0 to use an auto calculated width.
  * @param {number} thumbHeight - The height for the snapshot-thumb. You can specify <b>null</b> or 0 to use an auto calculated height.
   */

  GameManager.prototype.save = function(slot, thumbWidth, thumbHeight) {
    var header;
    if (this.saveGame) {
      header = this.createSaveGameHeader(thumbWidth, thumbHeight);
      this.saveGameSlots[slot] = this.createSaveGameSlot(header);
      this.storeSaveGame("SaveGame_" + slot, this.saveGame, header);
      this.sceneData = {};
      return this.saveGame;
    }
  };

  GameManager.prototype.restore = function(saveGame) {
    this.backlog = saveGame.data.backlog;
    this.defaults = saveGame.data.defaults;
    this.variableStore = saveGame.data.variableStore;
    this.sceneData = saveGame.data;
    this.saveGame = null;
    this.loadedSaveGame = null;
    this.tempFields = saveGame.data.tempFields;
    this.characterParams = saveGame.data.characterParams;
    window.$tempFields = this.tempFields;
    return window.$dataFields.backlog = this.backlog;
  };

  GameManager.prototype.prepareLoadGame = function() {
    return AudioManager.stopAllMusic(30);
  };


  /**
  * Loads the game from the specified save game slot. This method triggers
  * a automatic scene change.
  *
  * @method load
  * @param {number} slot - The slot where the game should be loaded from.
   */

  GameManager.prototype.load = function(slot) {
    if (!this.saveGameSlots[slot] || this.saveGameSlots[slot].date.trim().length === 0) {
      return;
    }
    this.prepareLoadGame();
    this.loadedSaveGame = this.loadSaveGame("SaveGame_" + slot);
    SceneManager.switchTo(new vn.Object_Scene());
    return SceneManager.clear();
  };

  GameManager.prototype.loadSaveGame = function(name) {
    return JSON.parse(GameStorage.getData(name));
  };


  /**
  * Gets the save game data for a specified slot.
  *
  * @method getSaveGame
  * @param {number} slot - The slot to get the save data from.
  * @return {Object} The save game data.
   */

  GameManager.prototype.getSaveGame = function(slot) {
    return JSON.parse(GameStorage.getData("SaveGame_" + slot));
  };

  return GameManager;

})();

window.GameManager = new GameManager();

gs.GameManager = window.GameManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7OztFQVNhLHFCQUFBOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7OztJQU1BLElBQUMsQ0FBQSxhQUFELEdBQWlCOztBQUVqQjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUFBLElBQUEsRUFBTSxLQUFOO01BQWEsUUFBQSxFQUFVLENBQXZCO01BQTBCLGNBQUEsRUFBZ0IsSUFBMUM7TUFBZ0QsVUFBQSxFQUFZLElBQTVEO01BQWtFLGFBQUEsRUFBZSxJQUFqRjtNQUF1RixjQUFBLEVBQWdCLElBQXZHO01BQTZHLGFBQUEsRUFBZTtRQUFFLFNBQUEsRUFBVztVQUFFLElBQUEsRUFBTSxDQUFSO1NBQWI7UUFBMEIsUUFBQSxFQUFVLEVBQXBDO1FBQXdDLE1BQUEsRUFBUSxJQUFoRDs7O0FBRTVJOzs7O1NBRmdCOztJQU9oQixJQUFDLENBQUEsVUFBRCxHQUFjOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDUixVQUFBLEVBQVk7UUFBRSxVQUFBLEVBQVksRUFBZDtRQUFrQixRQUFBLEVBQVUsQ0FBNUI7UUFBK0IsUUFBQSxFQUFVLENBQXpDO1FBQTRDLGNBQUEsRUFBZ0IsQ0FBNUQ7UUFBK0QsZ0JBQUEsRUFBa0IsQ0FBakY7UUFBb0YsUUFBQSxFQUFVO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBOUY7UUFBeUgsV0FBQSxFQUFhO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxVQUFBLEVBQVksQ0FBekI7VUFBNEIsTUFBQSxFQUFRO1lBQUUsU0FBQSxFQUFXLElBQWI7WUFBbUIsT0FB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WUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFBLENBQTFCO1dBQ0EsWUFBWSxDQUFDLEtBQWIsQ0FBQTtFQVJFOzt3QkFXTixZQUFBLEdBQWMsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFYO0VBQVY7OztBQUdkOzs7Ozs7Ozt3QkFPQSxXQUFBLEdBQWEsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixXQUFBLEdBQVksSUFBaEMsQ0FBWDtFQUFWOzs7Ozs7QUFFakIsTUFBTSxDQUFDLFdBQVAsR0FBeUIsSUFBQSxXQUFBLENBQUE7O0FBQ3pCLEVBQUUsQ0FBQyxXQUFILEdBQWlCLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogR2FtZU1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEdhbWVNYW5hZ2VyXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyBhbGwgZ2VuZXJhbCB0aGluZ3MgYXJvdW5kIHRoZSBnYW1lIGxpa2UgaG9sZGluZyB0aGUgZ2FtZSBzZXR0aW5ncyxcbiAgICAqIG1hbmFnZXMgdGhlIHNhdmUvbG9hZCBvZiBhIGdhbWUsIGV0Yy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgR2FtZU1hbmFnZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzY2VuZSBkYXRhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZURhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAc2NlbmVEYXRhID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgc2NlbmUgdmlld3BvcnQgY29udGFpbmluZyBhbGwgdmlzdWFsIG9iamVjdHMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIHNjZW5lIGFuZCBpbmZsdWVuY2VkXG4gICAgICAgICogYnkgdGhlIGluLWdhbWUgY2FtZXJhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZVZpZXdwb3J0XG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1ZpZXdwb3J0XG4gICAgICAgICMjI1xuICAgICAgICBAc2NlbmVWaWV3cG9ydCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGlzdCBvZiBjb21tb24gZXZlbnRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21tb25FdmVudHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29tbW9uRXZlbnRbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBjb21tb25FdmVudHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgR2FtZU1hbmFnZXIgaXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICogQHByb3BlcnR5IGNvbW1vbkV2ZW50c1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db21tb25FdmVudFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUZW1wb3JhcnkgZ2FtZSBzZXR0aW5ncy5cbiAgICAgICAgKiBAcHJvcGVydHkgdGVtcFNldHRpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjIyBcbiAgICAgICAgQHRlbXBTZXR0aW5ncyA9IHNraXA6IGZhbHNlLCBza2lwVGltZTogNSwgbG9hZE1lbnVBY2Nlc3M6IHRydWUsIG1lbnVBY2Nlc3M6IHRydWUsIGJhY2tsb2dBY2Nlc3M6IHRydWUsIHNhdmVNZW51QWNjZXNzOiB0cnVlLCBtZXNzYWdlRmFkaW5nOiB7IGFuaW1hdGlvbjogeyB0eXBlOiAxIH0sIGR1cmF0aW9uOiAxNSwgZWFzaW5nOiBudWxsIH1cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUZW1wb3JhcnkgZ2FtZSBmaWVsZHMuXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBGaWVsZHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAdGVtcEZpZWxkcyA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZGVmYXVsdCB2YWx1ZXMgZm9yIGJhY2tncm91bmRzLCBwaWN0dXJlcywgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGRlZmF1bHRzID0geyBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHsgXCJkdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJsb29wVmVydGljYWxcIjogMCwgXCJsb29wSG9yaXpvbnRhbFwiOiAwLCBcImVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHBpY3R1cmU6IHsgXCJhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJkaXNhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIGNoYXJhY3RlcjogeyBcImV4cHJlc3Npb25EdXJhdGlvblwiOiAwLCBcImFwcGVhckR1cmF0aW9uXCI6IDQwLCBcImRpc2FwcGVhckR1cmF0aW9uXCI6IDQwLCBcIm9yaWdpblwiOiAwLCBcInpPcmRlclwiOiAwLCBcImFwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAyLCBcImluT3V0XCI6IDIgfSwgXCJkaXNhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMSwgXCJpbk91dFwiOiAxIH0sIFwiYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcImRpc2FwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJtb3Rpb25CbHVyXCI6IHsgXCJlbmFibGVkXCI6IDAsIFwiZGVsYXlcIjogMiwgXCJvcGFjaXR5XCI6IDEwMCwgXCJkaXNzb2x2ZVNwZWVkXCI6IDMgfSwgXCJjaGFuZ2VBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcImZhZGluZ1wiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiY2hhbmdlRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDIsIFwiaW5PdXRcIjogMiB9IH0sXG4gICAgICAgICAgICB0ZXh0OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwicG9zaXRpb25PcmlnaW5cIjogMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHZpZGVvOiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwib3JpZ2luXCI6IDAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcIm1vdGlvbkJsdXJcIjogeyBcImVuYWJsZWRcIjogMCwgXCJkZWxheVwiOiAyLCBcIm9wYWNpdHlcIjogMTAwLCBcImRpc3NvbHZlU3BlZWRcIjogMyB9IH0sXG4gICAgICAgICAgICBsaXZlMmQ6IHsgXCJtb3Rpb25GYWRlSW5UaW1lXCI6IDEwMDAsIFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBtZXNzYWdlQm94OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMCwgXCJtb3ZlbWVudFwiOiAzLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDAsIFwibW92ZW1lbnRcIjogMywgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBhdWRpbzogeyBcIm11c2ljRmFkZUluRHVyYXRpb25cIjogMCwgXCJtdXNpY0ZhZGVPdXREdXJhdGlvblwiOiAwLCBcIm11c2ljVm9sdW1lXCI6IDEwMCwgXCJtdXNpY1BsYXliYWNrUmF0ZVwiOiAxMDAsIFwic291bmRWb2x1bWVcIjogMTAwLCBcInNvdW5kUGxheWJhY2tSYXRlXCI6IDEwMCwgXCJ2b2ljZVZvbHVtZVwiOiAxMDAsIFwidm9pY2VQbGF5YmFja1JhdGVcIjogMTAwIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnYW1lJ3MgYmFja2xvZy5cbiAgICAgICAgKiBAcHJvcGVydHkgYmFja2xvZ1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGJhY2tsb2cgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENoYXJhY3RlciBwYXJhbWV0ZXJzIGJ5IGNoYXJhY3RlciBJRC5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcmFjdGVyUGFyYW1zXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgIyMjIFxuICAgICAgICBAY2hhcmFjdGVyUGFyYW1zID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSdzIGNoYXB0ZXJcbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcHRlcnNcbiAgICAgICAgKiBAdHlwZSBncy5Eb2N1bWVudFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGNoYXB0ZXJzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSdzIGN1cnJlbnQgZGlzcGxheWVkIG1lc3NhZ2VzLiBFc3BlY2lhbGx5IGluIE5WTCBtb2RlIHRoZSBtZXNzYWdlcyBcbiAgICAgICAgKiBvZiB0aGUgY3VycmVudCBwYWdlIGFyZSBzdG9yZWQgaGVyZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBtZXNzYWdlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ291bnQgb2Ygc2F2ZSBzbG90cy4gRGVmYXVsdCBpcyAxMDAuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVTbG90Q291bnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjIFxuICAgICAgICBAc2F2ZVNsb3RDb3VudCA9IDEwMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBpbmRleCBvZiBzYXZlIGdhbWVzLiBDb250YWlucyB0aGUgaGVhZGVyLWluZm8gZm9yIGVhY2ggc2F2ZSBnYW1lIHNsb3QuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVHYW1lU2xvdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBzYXZlR2FtZVNsb3RzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZ2xvYmFsIGRhdGEgbGlrZSB0aGUgc3RhdGUgb2YgcGVyc2lzdGVudCBnYW1lIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgZ2xvYmFsRGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBnbG9iYWxEYXRhID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZ2FtZSBydW5zIGluIGVkaXRvcidzIGxpdmUtcHJldmlldy5cbiAgICAgICAgKiBAcHJvcGVydHkgaW5MaXZlUHJldmlld1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBpbkxpdmVQcmV2aWV3ID0gbm9cbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIEdhbWVNYW5hZ2VyLCBzaG91bGQgYmUgY2FsbGVkIGJlZm9yZSB0aGUgYWN0dWFsIGdhbWUgc3RhcnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjIyAgICBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICAgICAgQGluTGl2ZVByZXZpZXcgPSAkUEFSQU1TLnByZXZpZXc/XG4gICAgICAgIEBzYXZlU2xvdENvdW50ID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc2F2ZVNsb3RDb3VudCB8fCAxMDBcbiAgICAgICAgQHRlbXBGaWVsZHMgPSBuZXcgZ3MuR2FtZVRlbXAoKVxuICAgICAgICB3aW5kb3cuJHRlbXBGaWVsZHMgPSBAdGVtcEZpZWxkc1xuICAgICAgICBcbiAgICAgICAgQGNyZWF0ZVNhdmVHYW1lSW5kZXgoKVxuICAgICAgICBAdmFyaWFibGVTdG9yZSA9IG5ldyBncy5WYXJpYWJsZVN0b3JlKClcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUuc2V0dXBEb21haW5zKERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIikuc2VsZWN0ICh2KSAtPiB2Lml0ZW1zLmRvbWFpbnx8XCJcIilcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnMgPSBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TnVtYmVycyA/IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnROdW1iZXJzXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFucyA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRCb29sZWFucyA/IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFuc1xuICAgICAgICBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50U3RyaW5ncyA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRTdHJpbmdzID8gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudFN0cmluZ3NcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudExpc3RzID0gQGdsb2JhbERhdGEucGVyc2lzdGVudExpc3RzID8gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudExpc3RzXG4gICAgICAgIFxuICAgICAgICBAc2NlbmVWaWV3cG9ydCA9IG5ldyBncy5PYmplY3RfVmlld3BvcnQobmV3IFZpZXdwb3J0KDAsIDAsIEdyYXBoaWNzLndpZHRoLCBHcmFwaGljcy5oZWlnaHQsIEdyYXBoaWNzLnZpZXdwb3J0KSlcbiAgICAgICAgZm9yIGNoYXJhY3RlciBpbiBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNBcnJheVxuICAgICAgICAgICAgaWYgY2hhcmFjdGVyP1xuICAgICAgICAgICAgICAgIEBjaGFyYWN0ZXJQYXJhbXNbY2hhcmFjdGVyLmluZGV4XSA9IHt9XG4gICAgICAgICAgICAgICAgaWYgY2hhcmFjdGVyLnBhcmFtcz9cbiAgICAgICAgICAgICAgICAgICAgZm9yIHBhcmFtIGluIGNoYXJhY3Rlci5wYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjaGFyYWN0ZXJQYXJhbXNbY2hhcmFjdGVyLmluZGV4XVtwYXJhbS5uYW1lXSA9IHBhcmFtLnZhbHVlIFxuXG4gICAgICAgIFxuICAgICAgICBAc2V0dXBDb21tb25FdmVudHMoKVxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzXVxuICAgICAgICAgICAgQHNldHRpbmdzLnZvaWNlc1BlckNoYXJhY3RlcltpXSA9IDEwMFxuICAgICAgICAgICAgIFxuICAgICAgICBAY2hhcHRlcnMgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJ2bi5jaGFwdGVyXCIpXG4gICAgICAgIEBjaGFwdGVycy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgaWYgYS5pdGVtcy5vcmRlciA+IGIuaXRlbXMub3JkZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBhLml0ZW1zLm9yZGVyIDwgYi5pdGVtcy5vcmRlclxuICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgY29tbW9uIGV2ZW50cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQ29tbW9uRXZlbnRzXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgc2V0dXBDb21tb25FdmVudHM6IC0+XG4gICAgICAgIGZvciBldmVudCBpbiBAY29tbW9uRXZlbnRzXG4gICAgICAgICAgICBldmVudD8uZGlzcG9zZSgpXG4gICAgICAgIFxuICAgICAgICBAY29tbW9uRXZlbnRzID0gW10gICAgXG4gICAgICAgIGZvciBldmVudCBpbiBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgY29udGludWUgaWYgbm90IGV2ZW50XG4gICAgICAgICAgICBpZiBldmVudC5zdGFydENvbmRpdGlvbiA9PSAxIGFuZCBldmVudC5hdXRvUHJlbG9hZFxuICAgICAgICAgICAgICAgIGdzLlJlc291cmNlTG9hZGVyLmxvYWRFdmVudENvbW1hbmRzR3JhcGhpY3MoZXZlbnQuY29tbWFuZHMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmplY3QgPSBuZXcgZ3MuT2JqZWN0X0NvbW1vbkV2ZW50KClcbiAgICAgICAgICAgIG9iamVjdC5yZWNvcmQgPSBldmVudFxuICAgICAgICAgICAgb2JqZWN0LnJpZCA9IGV2ZW50LmluZGV4XG4gICAgICAgICAgICBAY29tbW9uRXZlbnRzW2V2ZW50LmluZGV4XSA9IG9iamVjdFxuICAgICAgICAgICAgQGNvbW1vbkV2ZW50cy5wdXNoKG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGN1cnNvciBkZXBlbmRpbmcgb24gc3lzdGVtIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBDdXJzb3JcbiAgICAjIyNcbiAgICBzZXR1cEN1cnNvcjogLT5cbiAgICAgICAgaWYgUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yPy5uYW1lXG4gICAgICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jdXJzb3IubmFtZX1cIilcbiAgICAgICAgICAgIEdyYXBoaWNzLnNldEN1cnNvckJpdG1hcChiaXRtYXAsIFJlY29yZE1hbmFnZXIuc3lzdGVtLmN1cnNvci5oeCwgUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yLmh5KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAobnVsbClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIEdhbWVNYW5hZ2VyLiBTaG91bGQgYmUgY2FsbGVkIGJlZm9yZSBxdWl0IHRoZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjIyAgICAgICAgICAgICAgIFxuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFF1aXRzIHRoZSBnYW1lLiBUaGUgaW1wbGVtZW50YXRpb24gZGVwZW5kcyBvbiB0aGUgcGxhdGZvcm0uIFNvIGZvciBleGFtcGxlIG9uIG1vYmlsZVxuICAgICogZGV2aWNlcyB0aGlzIG1ldGhvZCBoYXMgbm8gZWZmZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhpdFxuICAgICMjIyAgIFxuICAgIGV4aXQ6IC0+IEFwcGxpY2F0aW9uLmV4aXQoKVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc2V0cyB0aGUgR2FtZU1hbmFnZXIgYnkgZGlzcG9zaW5nIGFuZCByZS1pbml0aWFsaXppbmcgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXNldFxuICAgICMjIyAgICAgICAgICBcbiAgICByZXNldDogLT5cbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgQGludGVycHJldGVyID0gbnVsbFxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIEBpbml0aWFsaXplKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogU3RhcnRzIGEgbmV3IGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBuZXdHYW1lXG4gICAgIyMjICAgICAgXG4gICAgbmV3R2FtZTogLT5cbiAgICAgICAgQG1lc3NhZ2VzID0gW11cbiAgICAgICAgQHZhcmlhYmxlU3RvcmUuY2xlYXJBbGxHbG9iYWxWYXJpYWJsZXMoKVxuICAgICAgICBAdmFyaWFibGVTdG9yZS5jbGVhckFsbExvY2FsVmFyaWFibGVzKClcbiAgICAgICAgQHRlbXBTZXR0aW5ncy5za2lwID0gbm9cbiAgICAgICAgQHRlbXBGaWVsZHMuY2xlYXIoKVxuICAgICAgICBAdGVtcEZpZWxkcy5pbkdhbWUgPSB5ZXNcbiAgICAgICAgQHNldHVwQ29tbW9uRXZlbnRzKClcbiAgICAgICAgQHRlbXBTZXR0aW5ncy5tZW51QWNjZXNzID0geWVzXG4gICAgICAgIEB0ZW1wU2V0dGluZ3Muc2F2ZU1lbnVBY2Nlc3MgPSB5ZXNcbiAgICAgICAgQHRlbXBTZXR0aW5ncy5sb2FkTWVudUFjY2VzcyA9IHllc1xuICAgICAgICBAdGVtcFNldHRpbmdzLmJhY2tsb2dBY2Nlc3MgPSB5ZXNcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBFeGlzdHMgdGhlIGdhbWUgYW5kIHJlc2V0cyB0aGUgR2FtZU1hbmFnZXIgd2hpY2ggaXMgaW1wb3J0YW50IGJlZm9yZSBnb2luZyBiYWNrIHRvXG4gICAgKiB0aGUgbWFpbiBtZW51IG9yIHRpdGxlIHNjcmVlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4aXRHYW1lXG4gICAgIyMjICAgIFxuICAgIGV4aXRHYW1lOiAtPlxuICAgICAgICBAdGVtcEZpZWxkcy5pbkdhbWUgPSBubyAgICAgXG4gICAgICAgIEB0ZW1wRmllbGRzLmlzRXhpdGluZ0dhbWUgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBHYW1lTWFuYWdlci4gU2hvdWxkIGJlIGNhbGxlZCBvbmNlIHBlciBmcmFtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyAgICAgXG4gICAgdXBkYXRlOiAtPlxuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIGluZGV4IG9mIGFsbCBzYXZlLWdhbWVzLiBTaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIGEgbmV3IHNhdmUgZ2FtZVxuICAgICogaXMgY3JlYXRlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVNhdmVHYW1lSW5kZXhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY3JlYXRlU2F2ZUdhbWVJbmRleDogLT5cbiAgICAgICAgQHNhdmVHYW1lU2xvdHMgPSBbXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBzYXZlU2xvdENvdW50XVxuICAgICAgICAgICAgaWYgR2FtZVN0b3JhZ2UuZXhpc3RzKFwiU2F2ZUdhbWVfI3tpfV9IZWFkZXJcIilcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSBHYW1lU3RvcmFnZS5nZXRPYmplY3QoXCJTYXZlR2FtZV8je2l9X0hlYWRlclwiKVxuICAgICAgICAgICAgICAgIGNoYXB0ZXIgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChoZWFkZXIuY2hhcHRlclVpZClcbiAgICAgICAgICAgICAgICBzY2VuZSA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50U3VtbWFyeShoZWFkZXIuc2NlbmVVaWQpXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBoZWFkZXIuaW1hZ2VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSBudWxsXG4gICAgICAgICAgICAgICAgY2hhcGVyID0gbnVsbFxuICAgICAgICAgICAgICAgIHNjZW5lID0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2hhcHRlcj8gYW5kIHNjZW5lPyBhbmQgIUBpbkxpdmVQcmV2aWV3XG4gICAgICAgICAgICAgICAgQHNhdmVHYW1lU2xvdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGhlYWRlci5kYXRlLFxuICAgICAgICAgICAgICAgICAgICBjaGFwdGVyOiBjaGFwdGVyLml0ZW1zLm5hbWUgfHwgXCJERUxFVEVEXCJcbiAgICAgICAgICAgICAgICAgICAgc2NlbmU6IHNjZW5lLml0ZW1zLm5hbWUgfHwgXCJERUxFVEVEXCIsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZSAjY2hhcHRlci5pdGVtcy5jb21tYW5kc1swXS5wYXJhbXMuc2F2ZUdhbWVHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2F2ZUdhbWVTbG90cy5wdXNoKHsgXCJkYXRlXCI6IFwiXCIsIFwiY2hhcHRlclwiOiBcIlwiLCBcInNjZW5lXCI6IFwiXCIsIFwiaW1hZ2VcIjogbnVsbCB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBzYXZlR2FtZVNsb3RzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc2V0cyB0aGUgZ2FtZSdzIHNldHRpbmdzIHRvIGl0cyBkZWZhdWx0IHZhbHVlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc2V0U2V0dGluZ3NcbiAgICAjIyMgICAgICAgICAgICBcbiAgICByZXNldFNldHRpbmdzOiAtPlxuICAgICAgICBAc2V0dGluZ3MgPSB7IHZlcnNpb246IDMzOSwgcmVuZGVyZXI6IDAsIGZpbHRlcjogMSwgY29uZmlybWF0aW9uOiB5ZXMsIGFkanVzdEFzcGVjdFJhdGlvOiBubywgYWxsb3dTa2lwOiB5ZXMsIGFsbG93U2tpcFVucmVhZE1lc3NhZ2VzOiB5ZXMsICBhbGxvd1ZpZGVvU2tpcDogeWVzLCBza2lwVm9pY2VPbkFjdGlvbjogeWVzLCBhbGxvd0Nob2ljZVNraXA6IG5vLCB2b2ljZXNCeUNoYXJhY3RlcjogW10sIHRpbWVNZXNzYWdlVG9Wb2ljZTogdHJ1ZSwgIFwiYXV0b01lc3NhZ2VcIjogeyBlbmFibGVkOiBmYWxzZSwgdGltZTogMCwgd2FpdEZvclZvaWNlOiB5ZXMsIHN0b3BPbkFjdGlvbjogbm8gfSwgIFwidm9pY2VFbmFibGVkXCI6IHRydWUsIFwiYmdtRW5hYmxlZFwiOiB0cnVlLCBcInNvdW5kRW5hYmxlZFwiOiB0cnVlLCBcInZvaWNlVm9sdW1lXCI6IDEwMCwgXCJiZ21Wb2x1bWVcIjogMTAwLCBcInNlVm9sdW1lXCI6IDEwMCwgXCJtZXNzYWdlU3BlZWRcIjogNCwgXCJmdWxsU2NyZWVuXCI6IG5vLCBcImFzcGVjdFJhdGlvXCI6IDAgfVxuICAgICAgICBAc2F2ZUdhbWVTbG90cyA9IFtdXG4gICAgICAgIGZvciBpIGluIFswLi4uQHNhdmVTbG90Q291bnRdXG4gICAgICAgICAgICBHYW1lU3RvcmFnZS5yZW1vdmUoXCJTYXZlR2FtZV8je2l9X0hlYWRlclwiKVxuICAgICAgICAgICAgR2FtZVN0b3JhZ2UucmVtb3ZlKFwiU2F2ZUdhbWVfI3tpfVwiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2F2ZUdhbWVTbG90cy5wdXNoKHsgXCJkYXRlXCI6IFwiXCIsIFwiY2hhcHRlclwiOiBcIlwiLCBcInNjZW5lXCI6IFwiXCIsIFwidGh1bWJcIjogXCJcIiB9KVxuICAgICAgIFxuICAgICAgICBHYW1lU3RvcmFnZS5zZXRPYmplY3QoXCJzZXR0aW5nc1wiLCBAc2V0dGluZ3MpXG4gICAgICAgIEBnbG9iYWxEYXRhID0geyBtZXNzYWdlczoge30sIGNnR2FsbGVyeToge30gfVxuICAgICAgICBHYW1lU3RvcmFnZS5zZXRPYmplY3QoXCJnbG9iYWxEYXRhXCIsIEBnbG9iYWxEYXRhKVxuICAgIFxuICAgICMjIypcbiAgICAqIFNhdmVzIGN1cnJlbnQgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNhdmVTZXR0aW5nc1xuICAgICMjIyAgICAgXG4gICAgc2F2ZVNldHRpbmdzOiAtPlxuICAgICAgICBHYW1lU3RvcmFnZS5zZXRPYmplY3QoXCJzZXR0aW5nc1wiLCBAc2V0dGluZ3MpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNhdmVzIGN1cnJlbnQgZ2xvYmFsIGRhdGEuXG4gICAgKlxuICAgICogQG1ldGhvZCBzYXZlR2xvYmFsRGF0YVxuICAgICMjIyAgXG4gICAgc2F2ZUdsb2JhbERhdGE6IC0+XG4gICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnROdW1iZXJzID0gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNcbiAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudExpc3RzID0gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudExpc3RzXG4gICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRCb29sZWFucyA9IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFuc1xuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5ncyA9IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzXG4gICAgICAgIEdhbWVTdG9yYWdlLnNldE9iamVjdChcImdsb2JhbERhdGFcIiwgQGdsb2JhbERhdGEpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFJlc2V0cyBjdXJyZW50IGdsb2JhbCBkYXRhLiBBbGwgc3RvcmVkIGRhdGEgYWJvdXQgcmVhZCBtZXNzYWdlcywgcGVyc2lzdGVudCB2YXJpYWJsZXMgYW5kXG4gICAgKiBDRyBnYWxsZXJ5IHdpbGwgYmUgZGVsZXRlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc2V0R2xvYmFsRGF0YVxuICAgICMjIyAgICAgXG4gICAgcmVzZXRHbG9iYWxEYXRhOiAtPlxuICAgICAgICBAZ2xvYmFsRGF0YSA9IHsgbWVzc2FnZXM6IHt9LCBjZ0dhbGxlcnk6IHt9LCB2ZXJzaW9uOiAzMzkgfVxuICAgICAgICBcbiAgICAgICAgZm9yIGNnLCBpIGluIFJlY29yZE1hbmFnZXIuY2dHYWxsZXJ5QXJyYXlcbiAgICAgICAgICAgIGlmIGNnP1xuICAgICAgICAgICAgICAgIEBnbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF0gPSB7IHVubG9ja2VkOiBubyB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEdhbWVTdG9yYWdlLnNldE9iamVjdChcImdsb2JhbERhdGFcIiwgQGdsb2JhbERhdGEpIFxuICAgICBcbiAgICAgXG4gICAgcmVhZFNhdmVHYW1lOiAoc2F2ZUdhbWUpIC0+XG4gICAgd3JpdGVTYXZlR2FtZTogKHNhdmVHYW1lKSAtPlxuICAgICAgICBcbiAgICBwcmVwYXJlU2F2ZUdhbWU6IChzbmFwc2hvdCkgLT5cbiAgICAgICAgaWYgc25hcHNob3RcbiAgICAgICAgICAgIHNuYXBzaG90ID0gUmVzb3VyY2VNYW5hZ2VyLmdldEN1c3RvbUJpdG1hcChcIiRzbmFwc2hvdFwiKVxuICAgICAgICAgICAgc25hcHNob3Q/LmRpc3Bvc2UoKVxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnNldEN1c3RvbUJpdG1hcChcIiRzbmFwc2hvdFwiLCBHcmFwaGljcy5zbmFwc2hvdCgpKVxuICAgICAgICBcbiAgICAgICAgY29udGV4dCA9IG5ldyBncy5PYmplY3RDb2RlY0NvbnRleHQoKVxuICAgICAgICBjb250ZXh0LmRlY29kZWRPYmplY3RTdG9yZS5wdXNoKEdyYXBoaWNzLnZpZXdwb3J0KVxuICAgICAgICBjb250ZXh0LmRlY29kZWRPYmplY3RTdG9yZS5wdXNoKEBzY2VuZSlcbiAgICAgICAgY29udGV4dC5kZWNvZGVkT2JqZWN0U3RvcmUucHVzaChAc2NlbmUuYmVoYXZpb3IpXG4gIFxuICAgICAgICBtZXNzYWdlQm94SWRzID0gW1wibWVzc2FnZUJveFwiLCBcIm52bE1lc3NhZ2VCb3hcIiwgXCJtZXNzYWdlTWVudVwiXTtcbiAgICAgICAgbWVzc2FnZUlkcyA9IFtcImdhbWVNZXNzYWdlX21lc3NhZ2VcIiwgXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCJdO1xuICAgICAgICBtZXNzYWdlQm94ZXMgPSBtZXNzYWdlQm94SWRzLnNlbGVjdCAoaWQpID0+IEBzY2VuZS5iZWhhdmlvci5vYmplY3RNYW5hZ2VyLm9iamVjdEJ5SWQoaWQpXG4gICAgICAgIG1lc3NhZ2VzID0gbWVzc2FnZUlkcy5zZWxlY3QgKGlkKSA9PiBAc2NlbmUuYmVoYXZpb3Iub2JqZWN0TWFuYWdlci5vYmplY3RCeUlkKGlkKVxuICAgICAgICBcbiAgICAgICAgc2NlbmVEYXRhID0ge31cbiAgICAgICAgc2F2ZUdhbWUgPSB7fVxuICAgICAgICBzYXZlR2FtZS5lbmNvZGVkT2JqZWN0U3RvcmUgPSBudWxsXG4gICAgICAgIHNhdmVHYW1lLnNjZW5lVWlkID0gQHNjZW5lLnNjZW5lRG9jdW1lbnQudWlkXG4gICAgICAgIHNhdmVHYW1lLmRhdGEgPSB7XG4gICAgICAgICAgICByZXNvdXJjZUNvbnRleHQ6IEBzY2VuZS5iZWhhdmlvci5yZXNvdXJjZUNvbnRleHQudG9EYXRhQnVuZGxlKCksXG4gICAgICAgICAgICBjdXJyZW50Q2hhcmFjdGVyOiBAc2NlbmUuY3VycmVudENoYXJhY3RlcixcbiAgICAgICAgICAgIGNoYXJhY3RlclBhcmFtczogQGNoYXJhY3RlclBhcmFtcyxcbiAgICAgICAgICAgIGZyYW1lQ291bnQ6IEdyYXBoaWNzLmZyYW1lQ291bnQsXG4gICAgICAgICAgICB0ZW1wRmllbGRzOiBAdGVtcEZpZWxkcyxcbiAgICAgICAgICAgIHZpZXdwb3J0OiBAc2NlbmUudmlld3BvcnQsXG4gICAgICAgICAgICBjaGFyYWN0ZXJzOiBAc2NlbmUuY2hhcmFjdGVycyxcbiAgICAgICAgICAgIGNoYXJhY3Rlck5hbWVzOiBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNBcnJheS5zZWxlY3QoKGMpIC0+IHsgbmFtZTogYy5uYW1lLCBpbmRleDogYy5pbmRleCB9KSxcbiAgICAgICAgICAgIGJhY2tncm91bmRzOiBAc2NlbmUuYmFja2dyb3VuZHMsXG4gICAgICAgICAgICBwaWN0dXJlczogQHNjZW5lLnBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgdGV4dHM6IEBzY2VuZS50ZXh0Q29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbixcbiAgICAgICAgICAgIHZpZGVvczogQHNjZW5lLnZpZGVvQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbixcbiAgICAgICAgICAgIHZpZXdwb3J0czogQHNjZW5lLnZpZXdwb3J0Q29udGFpbmVyLnN1Yk9iamVjdHMsXG4gICAgICAgICAgICBjb21tb25FdmVudHM6IEBzY2VuZS5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLFxuICAgICAgICAgICAgaG90c3BvdHM6IEBzY2VuZS5ob3RzcG90Q29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbixcbiAgICAgICAgICAgIGludGVycHJldGVyOiBAc2NlbmUuaW50ZXJwcmV0ZXIsXG4gICAgICAgICAgICBtZXNzYWdlQm94ZXM6IG1lc3NhZ2VCb3hlcy5zZWxlY3QoKG1iLCBpKSA9PiB7IHZpc2libGU6IG1iLnZpc2libGUsIGlkOiBtYi5pZCwgbWVzc2FnZTogbWVzc2FnZXNbaV0gfSksXG4gICAgICAgICAgICBiYWNrbG9nOiBAYmFja2xvZyxcbiAgICAgICAgICAgIHZhcmlhYmxlU3RvcmU6IEB2YXJpYWJsZVN0b3JlLFxuICAgICAgICAgICAgZGVmYXVsdHM6IEBkZWZhdWx0cyxcbiAgICAgICAgICAgIHRyYW5zaXRpb25EYXRhOiBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEsXG4gICAgICAgICAgICBhdWRpbzogeyBhdWRpb0J1ZmZlcnM6IEF1ZGlvTWFuYWdlci5hdWRpb0J1ZmZlcnMsIGF1ZGlvQnVmZmVyc0J5TGF5ZXI6IEF1ZGlvTWFuYWdlci5hdWRpb0J1ZmZlcnNCeUxheWVyLCBhdWRpb0xheWVyczogQXVkaW9NYW5hZ2VyLmF1ZGlvTGF5ZXJzLCBzb3VuZFJlZmVyZW5jZXM6IEF1ZGlvTWFuYWdlci5zb3VuZFJlZmVyZW5jZXMgfSxcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhczogQHNjZW5lLm1lc3NhZ2VBcmVhQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpblxuICAgICAgICAgICMgIG1lc3NhZ2VBcmVhczogQHNjZW5lLm1lc3NhZ2VBcmVhcy5zZWxlY3QgKGYpIC0+XG4gICAgICAgICAgIyAgICAgIGlmIGYgXG4gICAgICAgICAgIyAgICAgICAgICB7IFxuICAgICAgICAgICMgICAgICAgICAgICAgIG1lc3NhZ2U6IGYubWVzc2FnZSwgXG4gICAgICAgICAgIyAgICAgICAgICAgICAgbGF5b3V0OiB7IGRzdFJlY3Q6IGdzLlJlY3QuZnJvbU9iamVjdChmLmxheW91dC5kc3RSZWN0KSB9IFxuICAgICAgICAgICMgICAgICAgICAgfSBcbiAgICAgICAgICAjICAgICAgZWxzZSBcbiAgICAgICAgICAjICAgICAgICAgIG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgI3NzID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgICAgIHNhdmVHYW1lLmRhdGEgPSBncy5PYmplY3RDb2RlYy5lbmNvZGUoc2F2ZUdhbWUuZGF0YSwgY29udGV4dClcbiAgICAgICAgI2NvbnNvbGUubG9nKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAtIHNzKVxuICAgICAgICBzYXZlR2FtZS5lbmNvZGVkT2JqZWN0U3RvcmUgPSBjb250ZXh0LmVuY29kZWRPYmplY3RTdG9yZVxuXG4gICAgICAgIEBzYXZlR2FtZSA9IHNhdmVHYW1lXG4gICAgICBcbiAgICBjcmVhdGVTYXZlR2FtZVNsb3Q6IChoZWFkZXIpIC0+XG4gICAgICAgIHNsb3QgPSB7XG4gICAgICAgICAgICBcImRhdGVcIjogbmV3IERhdGUoKS50b0RhdGVTdHJpbmcoKSxcbiAgICAgICAgICAgIFwiY2hhcHRlclwiOiBAc2NlbmUuY2hhcHRlci5pdGVtcy5uYW1lLFxuICAgICAgICAgICAgXCJzY2VuZVwiOiBAc2NlbmUuc2NlbmVEb2N1bWVudC5pdGVtcy5uYW1lLFxuICAgICAgICAgICAgXCJpbWFnZVwiOiBoZWFkZXIuaW1hZ2VcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHNsb3Q7XG4gICAgICAgIFxuICAgIGNyZWF0ZVNhdmVHYW1lSGVhZGVyOiAodGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQpIC0+XG4gICAgICAgIHRodW1iSW1hZ2UgPSBAY3JlYXRlU2F2ZUdhbWVUaHVtYkltYWdlKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgaGVhZGVyID0ge1xuICAgICAgICAgICAgXCJkYXRlXCI6IG5ldyBEYXRlKCkudG9EYXRlU3RyaW5nKCksXG4gICAgICAgICAgICBcImNoYXB0ZXJVaWRcIjogQHNjZW5lLmNoYXB0ZXIudWlkLFxuICAgICAgICAgICAgXCJzY2VuZVVpZFwiOiBAc2NlbmUuc2NlbmVEb2N1bWVudC51aWQsXG4gICAgICAgICAgICBcImltYWdlXCI6IHRodW1iSW1hZ2U/LmltYWdlLnRvRGF0YVVSTCgpIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aHVtYkltYWdlPy5kaXNwb3NlKClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBoZWFkZXJcbiAgICAgICAgXG4gICAgY3JlYXRlU2F2ZUdhbWVUaHVtYkltYWdlOiAod2lkdGgsIGhlaWdodCkgLT5cbiAgICAgICAgc25hcHNob3QgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiJHNuYXBzaG90XCIpXG4gICAgICAgIHRodW1iSW1hZ2UgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBzbmFwc2hvdFxuICAgICAgICAgICAgaWYgd2lkdGggYW5kIGhlaWdodFxuICAgICAgICAgICAgICAgIHRodW1iSW1hZ2UgPSBuZXcgQml0bWFwKHdpZHRoLCBoZWlnaHQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGh1bWJJbWFnZSA9IG5ldyBCaXRtYXAoR3JhcGhpY3Mud2lkdGggLyA4LCBHcmFwaGljcy5oZWlnaHQgLyA4KVxuICAgICAgICAgICAgdGh1bWJJbWFnZS5zdHJldGNoQmx0KG5ldyBSZWN0KDAsIDAsIHRodW1iSW1hZ2Uud2lkdGgsIHRodW1iSW1hZ2UuaGVpZ2h0KSwgc25hcHNob3QsIG5ldyBSZWN0KDAsIDAsIHNuYXBzaG90LndpZHRoLCBzbmFwc2hvdC5oZWlnaHQpKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiB0aHVtYkltYWdlXG4gICAgICBcbiAgICBzdG9yZVNhdmVHYW1lOiAobmFtZSwgc2F2ZUdhbWUsIGhlYWRlcikgLT5cbiAgICAgICAgaWYgaGVhZGVyXG4gICAgICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKFwiI3tuYW1lfV9IZWFkZXJcIiwgSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSlcbiAgICAgICAgICAgIFxuICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKG5hbWUsIEpTT04uc3RyaW5naWZ5KHNhdmVHYW1lKSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2F2ZXMgdGhlIGN1cnJlbnQgZ2FtZSBhdCB0aGUgc3BlY2lmaWVkIHNsb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBzYXZlXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2xvdCAtIFRoZSBzbG90IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZCBhdC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aHVtYldpZHRoIC0gVGhlIHdpZHRoIGZvciB0aGUgc25hcHNob3QtdGh1bWIuIFlvdSBjYW4gc3BlY2lmeSA8Yj5udWxsPC9iPiBvciAwIHRvIHVzZSBhbiBhdXRvIGNhbGN1bGF0ZWQgd2lkdGguXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdGh1bWJIZWlnaHQgLSBUaGUgaGVpZ2h0IGZvciB0aGUgc25hcHNob3QtdGh1bWIuIFlvdSBjYW4gc3BlY2lmeSA8Yj5udWxsPC9iPiBvciAwIHRvIHVzZSBhbiBhdXRvIGNhbGN1bGF0ZWQgaGVpZ2h0LlxuICAgICMjIyAgICAgXG4gICAgc2F2ZTogKHNsb3QsIHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KSAtPlxuICAgICAgICBpZiBAc2F2ZUdhbWVcbiAgICAgICAgICAgIGhlYWRlciA9IEBjcmVhdGVTYXZlR2FtZUhlYWRlcih0aHVtYldpZHRoLCB0aHVtYkhlaWdodClcbiAgICAgICAgICAgIEBzYXZlR2FtZVNsb3RzW3Nsb3RdID0gQGNyZWF0ZVNhdmVHYW1lU2xvdChoZWFkZXIpXG4gICAgICAgICAgICBAc3RvcmVTYXZlR2FtZShcIlNhdmVHYW1lXyN7c2xvdH1cIiwgQHNhdmVHYW1lLCBoZWFkZXIpXG4gICAgICAgICAgICBAc2NlbmVEYXRhID0ge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIEBzYXZlR2FtZVxuICAgIFxuICAgIHJlc3RvcmU6IChzYXZlR2FtZSkgLT5cbiAgICAgICAgQGJhY2tsb2cgPSBzYXZlR2FtZS5kYXRhLmJhY2tsb2dcbiAgICAgICAgQGRlZmF1bHRzID0gc2F2ZUdhbWUuZGF0YS5kZWZhdWx0c1xuICAgICAgICBAdmFyaWFibGVTdG9yZSA9IHNhdmVHYW1lLmRhdGEudmFyaWFibGVTdG9yZVxuICAgICAgICBAc2NlbmVEYXRhID0gc2F2ZUdhbWUuZGF0YVxuICAgICAgICBAc2F2ZUdhbWUgPSBudWxsXG4gICAgICAgIEBsb2FkZWRTYXZlR2FtZSA9IG51bGxcbiAgICAgICAgQHRlbXBGaWVsZHMgPSBzYXZlR2FtZS5kYXRhLnRlbXBGaWVsZHNcbiAgICAgICAgQGNoYXJhY3RlclBhcmFtcyA9IHNhdmVHYW1lLmRhdGEuY2hhcmFjdGVyUGFyYW1zXG4gICAgICAgIHdpbmRvdy4kdGVtcEZpZWxkcyA9IEB0ZW1wRmllbGRzXG4gICAgICAgIHdpbmRvdy4kZGF0YUZpZWxkcy5iYWNrbG9nID0gQGJhY2tsb2dcbiAgICAgICAgICAgIFxuICAgIFxuICAgIHByZXBhcmVMb2FkR2FtZTogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygzMClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgdGhlIGdhbWUgZnJvbSB0aGUgc3BlY2lmaWVkIHNhdmUgZ2FtZSBzbG90LiBUaGlzIG1ldGhvZCB0cmlnZ2Vyc1xuICAgICogYSBhdXRvbWF0aWMgc2NlbmUgY2hhbmdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNsb3QgLSBUaGUgc2xvdCB3aGVyZSB0aGUgZ2FtZSBzaG91bGQgYmUgbG9hZGVkIGZyb20uXG4gICAgIyMjICAgICAgICBcbiAgICBsb2FkOiAoc2xvdCkgLT5cbiAgICAgICAgcmV0dXJuIGlmICFAc2F2ZUdhbWVTbG90c1tzbG90XSBvciBAc2F2ZUdhbWVTbG90c1tzbG90XS5kYXRlLnRyaW0oKS5sZW5ndGggPT0gMFxuICAgICAgICBcbiAgICAgICAgQHByZXBhcmVMb2FkR2FtZSgpXG4gICAgICAgIEBsb2FkZWRTYXZlR2FtZSA9IEBsb2FkU2F2ZUdhbWUoXCJTYXZlR2FtZV8je3Nsb3R9XCIpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyB2bi5PYmplY3RfU2NlbmUoKSlcbiAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgXG4gICAgICAgIFxuICAgIGxvYWRTYXZlR2FtZTogKG5hbWUpIC0+IEpTT04ucGFyc2UoR2FtZVN0b3JhZ2UuZ2V0RGF0YShuYW1lKSlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHNhdmUgZ2FtZSBkYXRhIGZvciBhIHNwZWNpZmllZCBzbG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgZ2V0U2F2ZUdhbWVcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzbG90IC0gVGhlIHNsb3QgdG8gZ2V0IHRoZSBzYXZlIGRhdGEgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHNhdmUgZ2FtZSBkYXRhLlxuICAgICMjIyAgICAgICAgXG4gICAgZ2V0U2F2ZUdhbWU6IChzbG90KSAtPiBKU09OLnBhcnNlKEdhbWVTdG9yYWdlLmdldERhdGEoXCJTYXZlR2FtZV8je3Nsb3R9XCIpKVxuICAgIFxud2luZG93LkdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKClcbmdzLkdhbWVNYW5hZ2VyID0gd2luZG93LkdhbWVNYW5hZ2VyIl19
//# sourceURL=GameManager_27.js