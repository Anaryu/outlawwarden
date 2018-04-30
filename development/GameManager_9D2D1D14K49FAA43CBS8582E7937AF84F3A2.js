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
    DataManager.getDocumentsByType("persistent_variables");
    this.variableStore.setupDomains(DataManager.getDocumentsByType("global_variables").select(function(v) {
      return v.items.domain || "";
    }));
    this.variableStore.persistentNumbersByDomain = (ref = this.globalData.persistentNumbers) != null ? ref : this.variableStore.persistentNumbersByDomain;
    this.variableStore.persistentBooleansByDomain = (ref1 = this.globalData.persistentBooleans) != null ? ref1 : this.variableStore.persistentBooleansByDomain;
    this.variableStore.persistentStringsByDomain = (ref2 = this.globalData.persistentStrings) != null ? ref2 : this.variableStore.persistentStringsByDomain;
    this.variableStore.persistentListsByDomain = (ref3 = this.globalData.persistentLists) != null ? ref3 : this.variableStore.persistentListsByDomain;
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
      version: 342,
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
    return GameStorage.setObject("settings", this.settings);
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
    this.globalData.persistentNumbers = this.variableStore.persistentNumbersByDomain;
    this.globalData.persistentLists = this.variableStore.persistentListsByDomain;
    this.globalData.persistentBooleans = this.variableStore.persistentBooleansByDomain;
    this.globalData.persistentStrings = this.variableStore.persistentStringsByDomain;
    return GameStorage.setObject("globalData", this.globalData);
  };


  /**
  * Resets current global data. All stored data about read messages, persistent variables and
  * CG gallery will be deleted.
  *
  * @method resetGlobalData
   */

  GameManager.prototype.resetGlobalData = function() {
    var cg, data, i, j, len, ref, ref1, version;
    version = (ref = this.globalData) != null ? ref.version : void 0;
    data = this.globalData;
    this.globalData = {
      messages: {},
      cgGallery: {},
      version: 342,
      persistentNumbers: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentStrings: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentBooleans: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentLists: {
        "0": [],
        "com.degica.vnm.default": []
      }
    };
    ref1 = RecordManager.cgGalleryArray;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      cg = ref1[i];
      if (cg != null) {
        this.globalData.cgGallery[cg.index] = {
          unlocked: false
        };
      }
    }
    GameStorage.setObject("globalData", this.globalData);
    return this.migrateGlobalData(data, version + 1, this.globalData.version);
  };

  GameManager.prototype.migrateGlobalData = function(data, from, to) {
    var i, j, ref, ref1, results;
    results = [];
    for (i = j = ref = from, ref1 = to; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
      if (this["migrateGlobalData" + i] != null) {
        results.push(this["migrateGlobalData" + i](data));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  GameManager.prototype.migrateGlobalData342 = function(data) {
    if (data != null) {
      this.globalData.persistentNumbers[0] = data.persistentNumbers[0] || [];
      this.globalData.persistentStrings[0] = data.persistentStrings[0] || [];
      this.globalData.persistentBooleans[0] = data.persistentBooleans[0] || [];
      this.globalData.persistentLists[0] = data.persistentLists[0] || [];
      this.globalData.persistentNumbers["com.degica.vnm.default"] = data.persistentNumbers[0] || [];
      this.globalData.persistentStrings["com.degica.vnm.default"] = data.persistentStrings[0] || [];
      this.globalData.persistentBooleans["com.degica.vnm.default"] = data.persistentBooleans[0] || [];
      return this.globalData.persistentLists["com.degica.vnm.default"] = data.persistentLists[0] || [];
    }
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
      choices: this.scene.choices,
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
    if (snapshot && snapshot.loaded) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7OztFQVNhLHFCQUFBOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7OztJQU1BLElBQUMsQ0FBQSxhQUFELEdBQWlCOztBQUVqQjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUFBLElBQUEsRUFBTSxLQUFOO01BQWEsUUFBQSxFQUFVLENBQXZCO01BQTBCLGNBQUEsRUFBZ0IsSUFBMUM7TUFBZ0QsVUFBQSxFQUFZLElBQTVEO01BQWtFLGFBQUEsRUFBZSxJQUFqRjtNQUF1RixjQUFBLEVBQWdCLElBQXZHO01BQTZHLGFBQUEsRUFBZTtRQUFFLFNBQUEsRUFBVztVQUFFLElBQUEsRUFBTSxDQUFSO1NBQWI7UUFBMEIsUUFBQSxFQUFVLEVBQXBDO1FBQXdDLE1BQUEsRUFBUSxJQUFoRDs7O0FBRTVJOzs7O1NBRmdCOztJQU9oQixJQUFDLENBQUEsVUFBRCxHQUFjOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDUixVQUFBLEVBQVk7UUFBRSxVQUFBLEVBQVksRUFBZDtRQUFrQixRQUFBLEVBQVUsQ0FBNUI7UUFBK0IsUUFBQSxFQUFVLENBQXpDO1FBQTRDLGNBQUEsRUFBZ0IsQ0FBNUQ7UUFBK0QsZ0JBQUEsRUFBa0IsQ0FBakY7UUFBb0YsUUFBQSxFQUFVO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBOUY7UUFBeUgsV0FBQSxFQUFhO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxVQUFBLEVBQVksQ0FBekI7VUFBNEIsTUFBQSxFQUFRO1lBQUUsU0FBQSxFQUFXLElBQWI7WUFBbUIsT0FBQSxFQUFTLEVBQTVCO1dBQXBDO1NBQXRJO1FBQThNLFlBQUEsRUFBYztVQUFFLFNBQUEsRUFBVyxDQUFiO1VBQWdCLE9BQUEsRUFBUyxDQUF6QjtVQUE0QixTQUFBLEVBQVcsR0FBdkM7VUFBNEMsZUFBQSxFQUFpQixDQUE3RDtTQUE1TjtPQURKO01BRVIsT0FBQSxFQUFTO1FBQUUsZ0JBQUEsRUFBa0IsRUFBcEI7UUFBd0IsbUJBQUEsRUFBcUIsRUFBN0M7UUFBaUQsUUFBQSxFQUFVLENBQTNEO1FBQThELFFBQUEsRUFBVSxDQUF4RTtRQUEyRSxjQUFBLEVBQWdCO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBM0Y7UUFBc0gsaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLE9BQUEsRUFBUyxDQUF0QjtTQUF6STtRQUFvSyxpQkFBQSxFQUFtQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUF2TDtRQUErUCxvQkFBQSxFQUFzQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUFyUjtRQUE2VixZQUFBLEVBQWM7VUFBRSxTQUFBLEVBQVcsQ0FBYjtVQUFnQixPQUFBLEVBQVMsQ0FBekI7VUFBNEIsU0FBQSxFQUFXLEdBQXZDO1VBQTRDLGVBQUEsRUFBaUIsQ0FBN0Q7U0FBM1c7T0FGRDtNQUdSLFNBQUEsRUFBVztRQUFFLG9CQUFBLEVBQXNCLENBQXhCO1FBQTJCLGdCQUFBLEVBQWtCLEVBQTdDO1FBQWlELG1CQUFBLEVBQXFCLEVBQXRFO1FBQTBFLFFBQUEsRUFBVSxDQUFwRjtRQUF1RixRQUFBLEVBQVUsQ0FBakc7UUFBb0csY0FBQSxFQUFnQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsT0FBQSxFQUFTLENBQXRCO1NBQXBIO1FBQStJLGlCQUFBLEVBQW1CO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBbEs7UUFBNkwsaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBaE47UUFBd1Isb0JBQUEsRUFBc0I7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBOVM7UUFBc1gsWUFBQSxFQUFjO1VBQUUsU0FBQSxFQUFXLENBQWI7VUFBZ0IsT0FBQSxFQUFTLENBQXpCO1VBQTRCLFNBQUEsRUFBVyxHQUF2QztVQUE0QyxlQUFBLEVBQWlCLENBQTdEO1NBQXBZO1FBQXNjLGlCQUFBLEVBQW1CO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxVQUFBLEVBQVksQ0FBekI7VUFBNEIsUUFBQSxFQUFVLENBQXRDO1VBQXlDLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFqRDtTQUF6ZDtRQUE4aUIsY0FBQSxFQUFnQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsT0FBQSxFQUFTLENBQXRCO1NBQTlqQjtPQUhIO01BSVIsSUFBQSxFQUFNO1FBQUUsZ0JBQUEsRUFBa0IsRUFBcEI7UUFBd0IsbUJBQUEsRUFBcUIsRUFBN0M7UUFBaUQsZ0JBQUEsRUFBa0IsQ0FBbkU7UUFBc0UsUUFBQSxFQUFVLENBQWhGO1FBQW1GLFFBQUEsRUFBVSxDQUE3RjtRQUFnRyxjQUFBLEVBQWdCO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBaEg7UUFBMkksaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLE9BQUEsRUFBUyxDQUF0QjtTQUE5SjtRQUF5TCxpQkFBQSxFQUFtQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUE1TTtRQUFvUixvQkFBQSxFQUFzQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUExUztRQUFrWCxZQUFBLEVBQWM7VUFBRSxTQUFBLEVBQVcsQ0FBYjtVQUFnQixPQUFBLEVBQVMsQ0FBekI7VUFBNEIsU0FBQSxFQUFXLEdBQXZDO1VBQTRDLGVBQUEsRUFBaUIsQ0FBN0Q7U0FBaFk7T0FKRTtNQUtSLEtBQUEsRUFBTztRQUFFLGdCQUFBLEVBQWtCLEVBQXBCO1FBQXdCLG1CQUFBLEVBQXFCLEVBQTdDO1FBQWlELFFBQUEsRUFBVSxDQUEzRDtRQUE4RCxRQUFBLEVBQVUsQ0FBeEU7UUFBMkUsY0FBQSxFQUFnQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsT0FBQSxFQUFTLENBQXRCO1NBQTNGO1FBQXNILGlCQUFBLEVBQW1CO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBekk7UUFBb0ssaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBdkw7UUFBK1Asb0JBQUEsRUFBc0I7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBclI7UUFBNlYsWUFBQSxFQUFjO1VBQUUsU0FBQSxFQUFXLENBQWI7VUFBZ0IsT0FBQSxFQUFTLENBQXpCO1VBQTRCLFNBQUEsRUFBVyxHQUF2QztVQUE0QyxlQUFBLEVBQWlCLENBQTdEO1NBQTNXO09BTEM7TUFNUixNQUFBLEVBQVE7UUFBRSxrQkFBQSxFQUFvQixJQUF0QjtRQUE0QixnQkFBQSxFQUFrQixFQUE5QztRQUFrRCxtQkFBQSxFQUFxQixFQUF2RTtRQUEyRSxRQUFBLEVBQVUsQ0FBckY7UUFBd0YsY0FBQSxFQUFnQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsT0FBQSxFQUFTLENBQXRCO1NBQXhHO1FBQW1JLGlCQUFBLEVBQW1CO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBdEo7UUFBaUwsaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBcE07UUFBNFEsb0JBQUEsRUFBc0I7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLFVBQUEsRUFBWSxDQUF6QjtVQUE0QixNQUFBLEVBQVE7WUFBRSxTQUFBLEVBQVcsSUFBYjtZQUFtQixPQUFBLEVBQVMsRUFBNUI7V0FBcEM7U0FBbFM7T0FOQTtNQU9SLFVBQUEsRUFBWTtRQUFFLGdCQUFBLEVBQWtCLEVBQXBCO1FBQXdCLG1CQUFBLEVBQXFCLEVBQTdDO1FBQWlELFFBQUEsRUFBVSxDQUEzRDtRQUE4RCxjQUFBLEVBQWdCO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBOUU7UUFBeUcsaUJBQUEsRUFBbUI7VUFBRSxNQUFBLEVBQVEsQ0FBVjtVQUFhLE9BQUEsRUFBUyxDQUF0QjtTQUE1SDtRQUF1SixpQkFBQSxFQUFtQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUExSztRQUFrUCxvQkFBQSxFQUFzQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsVUFBQSxFQUFZLENBQXpCO1VBQTRCLE1BQUEsRUFBUTtZQUFFLFNBQUEsRUFBVyxJQUFiO1lBQW1CLE9BQUEsRUFBUyxFQUE1QjtXQUFwQztTQUF4UTtPQVBKO01BUVIsS0FBQSxFQUFPO1FBQUUscUJBQUEsRUFBdUIsQ0FBekI7UUFBNEIsc0JBQUEsRUFBd0IsQ0FBcEQ7UUFBdUQsYUFBQSxFQUFlLEdBQXRFO1FBQTJFLG1CQUFBLEVBQXFCLEdBQWhHO1FBQXFHLGFBQUEsRUFBZSxHQUFwSDtRQUF5SCxtQkFBQSxFQUFxQixHQUE5STtRQUFtSixhQUFBLEVBQWUsR0FBbEs7UUFBdUssbUJBQUEsRUFBcUIsR0FBNUw7T0FSQzs7O0FBV1o7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFFbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7O0lBTUEsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7QUFFakI7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWM7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7RUFuSFI7OztBQXNIYjs7Ozs7O3dCQUtBLFVBQUEsR0FBWSxTQUFBO0FBQ1IsUUFBQTtJQUFBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQixhQUFhLENBQUMsTUFBTSxDQUFDLGFBQXJCLElBQXNDO0lBQ3ZELElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsRUFBRSxDQUFDLFFBQUgsQ0FBQTtJQUNsQixNQUFNLENBQUMsV0FBUCxHQUFxQixJQUFDLENBQUE7SUFFdEIsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFDQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQUE7SUFDckIsV0FBVyxDQUFDLGtCQUFaLENBQStCLHNCQUEvQjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixXQUFXLENBQUMsa0JBQVosQ0FBK0Isa0JBQS9CLENBQWtELENBQUMsTUFBbkQsQ0FBMEQsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFSLElBQWdCO0lBQXZCLENBQTFELENBQTVCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyx5QkFBZiw2REFBMkUsSUFBQyxDQUFBLGFBQWEsQ0FBQztJQUMxRixJQUFDLENBQUEsYUFBYSxDQUFDLDBCQUFmLGdFQUE2RSxJQUFDLENBQUEsYUFBYSxDQUFDO0lBQzVGLElBQUMsQ0FBQSxhQUFhLENBQUMseUJBQWYsK0RBQTJFLElBQUMsQ0FBQSxhQUFhLENBQUM7SUFDMUYsSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZiw2REFBdUUsSUFBQyxDQUFBLGFBQWEsQ0FBQztJQUV0RixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEVBQUUsQ0FBQyxlQUFILENBQXVCLElBQUEsUUFBQSxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsUUFBUSxDQUFDLEtBQXhCLEVBQStCLFFBQVEsQ0FBQyxNQUF4QyxFQUFnRCxRQUFRLENBQUMsUUFBekQsQ0FBdkI7QUFDckI7QUFBQSxTQUFBLHNDQUFBOztNQUNJLElBQUcsaUJBQUg7UUFDSSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxTQUFTLENBQUMsS0FBVixDQUFqQixHQUFvQztRQUNwQyxJQUFHLHdCQUFIO0FBQ0k7QUFBQSxlQUFBLHdDQUFBOztZQUNJLElBQUMsQ0FBQSxlQUFnQixDQUFBLFNBQVMsQ0FBQyxLQUFWLENBQWlCLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBbEMsR0FBZ0QsS0FBSyxDQUFDO0FBRDFELFdBREo7U0FGSjs7QUFESjtJQVFBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0FBRUEsU0FBUyxzR0FBVDtNQUNJLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQW1CLENBQUEsQ0FBQSxDQUE3QixHQUFrQztBQUR0QztJQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksV0FBVyxDQUFDLGtCQUFaLENBQStCLFlBQS9CO1dBQ1osSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsU0FBQyxDQUFELEVBQUksQ0FBSjtNQUNYLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLEdBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBM0I7QUFDSSxlQUFPLEVBRFg7T0FBQSxNQUVLLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLEdBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBM0I7QUFDRCxlQUFPLENBQUMsRUFEUDtPQUFBLE1BQUE7QUFHRCxlQUFPLEVBSE47O0lBSE0sQ0FBZjtFQS9CUTs7O0FBdUNaOzs7Ozs7d0JBS0EsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7OztRQUNJLEtBQUssQ0FBRSxPQUFQLENBQUE7O0FBREo7SUFHQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtBQUNoQjtBQUFBO1NBQUEsd0NBQUE7O01BQ0ksSUFBWSxDQUFJLEtBQWhCO0FBQUEsaUJBQUE7O01BQ0EsSUFBRyxLQUFLLENBQUMsY0FBTixLQUF3QixDQUF4QixJQUE4QixLQUFLLENBQUMsV0FBdkM7UUFDSSxFQUFFLENBQUMsY0FBYyxDQUFDLHlCQUFsQixDQUE0QyxLQUFLLENBQUMsUUFBbEQsRUFESjs7TUFHQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBQTtNQUNiLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO01BQ2hCLE1BQU0sQ0FBQyxHQUFQLEdBQWEsS0FBSyxDQUFDO01BQ25CLElBQUMsQ0FBQSxZQUFhLENBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBZCxHQUE2QjttQkFDN0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLE1BQW5CO0FBVEo7O0VBTGU7OztBQWdCbkI7Ozs7Ozt3QkFLQSxXQUFBLEdBQWEsU0FBQTtBQUNULFFBQUE7SUFBQSxxREFBOEIsQ0FBRSxhQUFoQztNQUNJLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBM0U7YUFDVCxRQUFRLENBQUMsZUFBVCxDQUF5QixNQUF6QixFQUFpQyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUE3RCxFQUFpRSxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUE3RixFQUZKO0tBQUEsTUFBQTthQUlJLFFBQVEsQ0FBQyxlQUFULENBQXlCLElBQXpCLEVBSko7O0VBRFM7OztBQU9iOzs7Ozs7d0JBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTs7O0FBRVQ7Ozs7Ozs7d0JBTUEsSUFBQSxHQUFNLFNBQUE7V0FBRyxXQUFXLENBQUMsSUFBWixDQUFBO0VBQUg7OztBQUVOOzs7Ozs7d0JBS0EsS0FBQSxHQUFPLFNBQUE7SUFDSCxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUNmLElBQUMsQ0FBQSxPQUFELENBQUE7V0FDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0VBSkc7OztBQU1QOzs7Ozs7d0JBS0EsT0FBQSxHQUFTLFNBQUE7SUFDTCxJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUFBO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxzQkFBZixDQUFBO0lBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLEdBQXFCO0lBQ3JCLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBO0lBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLEdBQXFCO0lBQ3JCLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxVQUFkLEdBQTJCO0lBQzNCLElBQUMsQ0FBQSxZQUFZLENBQUMsY0FBZCxHQUErQjtJQUMvQixJQUFDLENBQUEsWUFBWSxDQUFDLGNBQWQsR0FBK0I7V0FDL0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxhQUFkLEdBQThCO0VBWHpCOzs7QUFjVDs7Ozs7Ozt3QkFNQSxRQUFBLEdBQVUsU0FBQTtJQUNOLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixHQUFxQjtXQUNyQixJQUFDLENBQUEsVUFBVSxDQUFDLGFBQVosR0FBNEI7RUFGdEI7OztBQUlWOzs7Ozs7d0JBS0EsTUFBQSxHQUFRLFNBQUEsR0FBQTs7O0FBRVI7Ozs7Ozs7O3dCQU9BLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ2pCLFNBQVMsMkZBQVQ7TUFDSSxJQUFHLFdBQVcsQ0FBQyxNQUFaLENBQW1CLFdBQUEsR0FBWSxDQUFaLEdBQWMsU0FBakMsQ0FBSDtRQUNJLE1BQUEsR0FBUyxXQUFXLENBQUMsU0FBWixDQUFzQixXQUFBLEdBQVksQ0FBWixHQUFjLFNBQXBDO1FBQ1QsT0FBQSxHQUFVLFdBQVcsQ0FBQyxXQUFaLENBQXdCLE1BQU0sQ0FBQyxVQUEvQjtRQUNWLEtBQUEsR0FBUSxXQUFXLENBQUMsa0JBQVosQ0FBK0IsTUFBTSxDQUFDLFFBQXRDO1FBQ1IsS0FBQSxHQUFRLE1BQU0sQ0FBQyxNQUpuQjtPQUFBLE1BQUE7UUFNSSxNQUFBLEdBQVM7UUFDVCxNQUFBLEdBQVM7UUFDVCxLQUFBLEdBQVEsS0FSWjs7TUFVQSxJQUFHLGlCQUFBLElBQWEsZUFBYixJQUF3QixDQUFDLElBQUMsQ0FBQSxhQUE3QjtRQUNJLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQjtVQUNoQixJQUFBLEVBQU0sTUFBTSxDQUFDLElBREc7VUFFaEIsT0FBQSxFQUFTLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBZCxJQUFzQixTQUZmO1VBR2hCLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVosSUFBb0IsU0FIWDtVQUloQixLQUFBLEVBQU8sS0FKUztTQUFwQixFQURKO09BQUEsTUFBQTtRQVFJLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQjtVQUFFLE1BQUEsRUFBUSxFQUFWO1VBQWMsU0FBQSxFQUFXLEVBQXpCO1VBQTZCLE9BQUEsRUFBUyxFQUF0QztVQUEwQyxPQUFBLEVBQVMsSUFBbkQ7U0FBcEIsRUFSSjs7QUFYSjtBQXFCQSxXQUFPLElBQUMsQ0FBQTtFQXZCUzs7O0FBeUJyQjs7Ozs7O3dCQUtBLGFBQUEsR0FBZSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFBRSxPQUFBLEVBQVMsR0FBWDtNQUFnQixRQUFBLEVBQVUsQ0FBMUI7TUFBNkIsTUFBQSxFQUFRLENBQXJDO01BQXdDLFlBQUEsRUFBYyxJQUF0RDtNQUEyRCxpQkFBQSxFQUFtQixLQUE5RTtNQUFrRixTQUFBLEVBQVcsSUFBN0Y7TUFBa0csdUJBQUEsRUFBeUIsSUFBM0g7TUFBaUksY0FBQSxFQUFnQixJQUFqSjtNQUFzSixpQkFBQSxFQUFtQixJQUF6SztNQUE4SyxlQUFBLEVBQWlCLEtBQS9MO01BQW1NLGlCQUFBLEVBQW1CLEVBQXROO01BQTBOLGtCQUFBLEVBQW9CLElBQTlPO01BQXFQLGFBQUEsRUFBZTtRQUFFLE9BQUEsRUFBUyxLQUFYO1FBQWtCLElBQUEsRUFBTSxDQUF4QjtRQUEyQixZQUFBLEVBQWMsSUFBekM7UUFBOEMsWUFBQSxFQUFjLEtBQTVEO09BQXBRO01BQXVVLGNBQUEsRUFBZ0IsSUFBdlY7TUFBNlYsWUFBQSxFQUFjLElBQTNXO01BQWlYLGNBQUEsRUFBZ0IsSUFBalk7TUFBdVksYUFBQSxFQUFlLEdBQXRaO01BQTJaLFdBQUEsRUFBYSxHQUF4YTtNQUE2YSxVQUFBLEVBQVksR0FBemI7TUFBOGIsY0FBQSxFQUFnQixDQUE5YztNQUFpZCxZQUFBLEVBQWMsS0FBL2Q7TUFBbWUsYUFBQSxFQUFlLENBQWxmOztJQUNaLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ2pCLFNBQVMsMkZBQVQ7TUFDSSxXQUFXLENBQUMsTUFBWixDQUFtQixXQUFBLEdBQVksQ0FBWixHQUFjLFNBQWpDO01BQ0EsV0FBVyxDQUFDLE1BQVosQ0FBbUIsV0FBQSxHQUFZLENBQS9CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CO1FBQUUsTUFBQSxFQUFRLEVBQVY7UUFBYyxTQUFBLEVBQVcsRUFBekI7UUFBNkIsT0FBQSxFQUFTLEVBQXRDO1FBQTBDLE9BQUEsRUFBUyxFQUFuRDtPQUFwQjtBQUpKO1dBTUEsV0FBVyxDQUFDLFNBQVosQ0FBc0IsVUFBdEIsRUFBa0MsSUFBQyxDQUFBLFFBQW5DO0VBVFc7OztBQWFmOzs7Ozs7d0JBS0EsWUFBQSxHQUFjLFNBQUE7V0FDVixXQUFXLENBQUMsU0FBWixDQUFzQixVQUF0QixFQUFrQyxJQUFDLENBQUEsUUFBbkM7RUFEVTs7O0FBR2Q7Ozs7Ozt3QkFLQSxjQUFBLEdBQWdCLFNBQUE7SUFDWixJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFaLEdBQWdDLElBQUMsQ0FBQSxhQUFhLENBQUM7SUFDL0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxlQUFaLEdBQThCLElBQUMsQ0FBQSxhQUFhLENBQUM7SUFDN0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxrQkFBWixHQUFpQyxJQUFDLENBQUEsYUFBYSxDQUFDO0lBQ2hELElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBQVosR0FBZ0MsSUFBQyxDQUFBLGFBQWEsQ0FBQztXQUMvQyxXQUFXLENBQUMsU0FBWixDQUFzQixZQUF0QixFQUFvQyxJQUFDLENBQUEsVUFBckM7RUFMWTs7O0FBT2hCOzs7Ozs7O3dCQU1BLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxPQUFBLHdDQUFxQixDQUFFO0lBQ3ZCLElBQUEsR0FBTyxJQUFDLENBQUE7SUFFUixJQUFDLENBQUEsVUFBRCxHQUFjO01BQ1YsUUFBQSxFQUFVLEVBREE7TUFDSSxTQUFBLEVBQVcsRUFEZjtNQUNtQixPQUFBLEVBQVMsR0FENUI7TUFFVixpQkFBQSxFQUFtQjtRQUFFLEdBQUEsRUFBSyxFQUFQO1FBQVcsd0JBQUEsRUFBMEIsRUFBckM7T0FGVDtNQUdWLGlCQUFBLEVBQW1CO1FBQUUsR0FBQSxFQUFLLEVBQVA7UUFBVyx3QkFBQSxFQUEwQixFQUFyQztPQUhUO01BSVYsa0JBQUEsRUFBb0I7UUFBRSxHQUFBLEVBQUssRUFBUDtRQUFXLHdCQUFBLEVBQTBCLEVBQXJDO09BSlY7TUFLVixlQUFBLEVBQWlCO1FBQUUsR0FBQSxFQUFLLEVBQVA7UUFBVyx3QkFBQSxFQUEwQixFQUFyQztPQUxQOztBQVFkO0FBQUEsU0FBQSw4Q0FBQTs7TUFDSSxJQUFHLFVBQUg7UUFDSSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVUsQ0FBQSxFQUFFLENBQUMsS0FBSCxDQUF0QixHQUFrQztVQUFFLFFBQUEsRUFBVSxLQUFaO1VBRHRDOztBQURKO0lBSUEsV0FBVyxDQUFDLFNBQVosQ0FBc0IsWUFBdEIsRUFBb0MsSUFBQyxDQUFBLFVBQXJDO1dBRUEsSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQW5CLEVBQXlCLE9BQUEsR0FBUSxDQUFqQyxFQUFvQyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQWhEO0VBbEJhOzt3QkFvQmpCLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxFQUFiO0FBQ2YsUUFBQTtBQUFBO1NBQVMsK0ZBQVQ7TUFDSSxJQUFHLHFDQUFIO3FCQUNJLElBQUssQ0FBQSxtQkFBQSxHQUFvQixDQUFwQixDQUFMLENBQThCLElBQTlCLEdBREo7T0FBQSxNQUFBOzZCQUFBOztBQURKOztFQURlOzt3QkFLbkIsb0JBQUEsR0FBc0IsU0FBQyxJQUFEO0lBQ2xCLElBQUcsWUFBSDtNQUNJLElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBQWtCLENBQUEsQ0FBQSxDQUE5QixHQUFtQyxJQUFJLENBQUMsaUJBQWtCLENBQUEsQ0FBQSxDQUF2QixJQUE2QjtNQUNoRSxJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFrQixDQUFBLENBQUEsQ0FBOUIsR0FBbUMsSUFBSSxDQUFDLGlCQUFrQixDQUFBLENBQUEsQ0FBdkIsSUFBNkI7TUFDaEUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxrQkFBbUIsQ0FBQSxDQUFBLENBQS9CLEdBQW9DLElBQUksQ0FBQyxrQkFBbUIsQ0FBQSxDQUFBLENBQXhCLElBQThCO01BQ2xFLElBQUMsQ0FBQSxVQUFVLENBQUMsZUFBZ0IsQ0FBQSxDQUFBLENBQTVCLEdBQWlDLElBQUksQ0FBQyxlQUFnQixDQUFBLENBQUEsQ0FBckIsSUFBMkI7TUFDNUQsSUFBQyxDQUFBLFVBQVUsQ0FBQyxpQkFBa0IsQ0FBQSx3QkFBQSxDQUE5QixHQUEwRCxJQUFJLENBQUMsaUJBQWtCLENBQUEsQ0FBQSxDQUF2QixJQUE2QjtNQUN2RixJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFrQixDQUFBLHdCQUFBLENBQTlCLEdBQTBELElBQUksQ0FBQyxpQkFBa0IsQ0FBQSxDQUFBLENBQXZCLElBQTZCO01BQ3ZGLElBQUMsQ0FBQSxVQUFVLENBQUMsa0JBQW1CLENBQUEsd0JBQUEsQ0FBL0IsR0FBMkQsSUFBSSxDQUFDLGtCQUFtQixDQUFBLENBQUEsQ0FBeEIsSUFBOEI7YUFDekYsSUFBQyxDQUFBLFVBQVUsQ0FBQyxlQUFnQixDQUFBLHdCQUFBLENBQTVCLEdBQXdELElBQUksQ0FBQyxlQUFnQixDQUFBLENBQUEsQ0FBckIsSUFBMkIsR0FSdkY7O0VBRGtCOzt3QkFXdEIsWUFBQSxHQUFjLFNBQUMsUUFBRCxHQUFBOzt3QkFDZCxhQUFBLEdBQWUsU0FBQyxRQUFELEdBQUE7O3dCQUVmLGVBQUEsR0FBaUIsU0FBQyxRQUFEO0FBQ2IsUUFBQTtJQUFBLElBQUcsUUFBSDtNQUNJLFFBQUEsR0FBVyxlQUFlLENBQUMsZUFBaEIsQ0FBZ0MsV0FBaEM7O1FBQ1gsUUFBUSxDQUFFLE9BQVYsQ0FBQTs7TUFDQSxlQUFlLENBQUMsZUFBaEIsQ0FBZ0MsV0FBaEMsRUFBNkMsUUFBUSxDQUFDLFFBQVQsQ0FBQSxDQUE3QyxFQUhKOztJQUtBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBO0lBQ2QsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQTNCLENBQWdDLFFBQVEsQ0FBQyxRQUF6QztJQUNBLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUEzQixDQUFnQyxJQUFDLENBQUEsS0FBakM7SUFDQSxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBM0IsQ0FBZ0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUF2QztJQUVBLGFBQUEsR0FBZ0IsQ0FBQyxZQUFELEVBQWUsZUFBZixFQUFnQyxhQUFoQztJQUNoQixVQUFBLEdBQWEsQ0FBQyxxQkFBRCxFQUF3Qix3QkFBeEI7SUFDYixZQUFBLEdBQWUsYUFBYSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEVBQUQ7ZUFBUSxLQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBOUIsQ0FBeUMsRUFBekM7TUFBUjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7SUFDZixRQUFBLEdBQVcsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEVBQUQ7ZUFBUSxLQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBOUIsQ0FBeUMsRUFBekM7TUFBUjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEI7SUFFWCxTQUFBLEdBQVk7SUFDWixRQUFBLEdBQVc7SUFDWCxRQUFRLENBQUMsa0JBQVQsR0FBOEI7SUFDOUIsUUFBUSxDQUFDLFFBQVQsR0FBb0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFhLENBQUM7SUFDekMsUUFBUSxDQUFDLElBQVQsR0FBZ0I7TUFDWixlQUFBLEVBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFoQyxDQUFBLENBREw7TUFFWixnQkFBQSxFQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLGdCQUZiO01BR1osZUFBQSxFQUFpQixJQUFDLENBQUEsZUFITjtNQUlaLFVBQUEsRUFBWSxRQUFRLENBQUMsVUFKVDtNQUtaLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFMRDtNQU1aLFFBQUEsRUFBVSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBTkw7TUFPWixVQUFBLEVBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxVQVBQO01BUVosY0FBQSxFQUFnQixhQUFhLENBQUMsZUFBZSxDQUFDLE1BQTlCLENBQXFDLFNBQUMsQ0FBRDtlQUFPO1VBQUUsSUFBQSxFQUFNLENBQUMsQ0FBQyxJQUFWO1VBQWdCLEtBQUEsRUFBTyxDQUFDLENBQUMsS0FBekI7O01BQVAsQ0FBckMsQ0FSSjtNQVNaLFdBQUEsRUFBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBVFI7TUFVWixRQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFWdEI7TUFXWixLQUFBLEVBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFhLENBQUMsa0JBWGhCO01BWVosTUFBQSxFQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsY0FBYyxDQUFDLGtCQVpsQjtNQWFaLFNBQUEsRUFBVyxJQUFDLENBQUEsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBYnhCO01BY1osWUFBQSxFQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFkOUI7TUFlWixRQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFmdEI7TUFnQlosV0FBQSxFQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FoQlI7TUFpQlosT0FBQSxFQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FqQko7TUFrQlosWUFBQSxFQUFjLFlBQVksQ0FBQyxNQUFiLENBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxFQUFELEVBQUssQ0FBTDtpQkFBVztZQUFFLE9BQUEsRUFBUyxFQUFFLENBQUMsT0FBZDtZQUF1QixFQUFBLEVBQUksRUFBRSxDQUFDLEVBQTlCO1lBQWtDLE9BQUEsRUFBUyxRQUFTLENBQUEsQ0FBQSxDQUFwRDs7UUFBWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FsQkY7TUFtQlosT0FBQSxFQUFTLElBQUMsQ0FBQSxPQW5CRTtNQW9CWixhQUFBLEVBQWUsSUFBQyxDQUFBLGFBcEJKO01BcUJaLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFyQkM7TUFzQlosY0FBQSxFQUFnQixZQUFZLENBQUMsY0F0QmpCO01BdUJaLEtBQUEsRUFBTztRQUFFLFlBQUEsRUFBYyxZQUFZLENBQUMsWUFBN0I7UUFBMkMsbUJBQUEsRUFBcUIsWUFBWSxDQUFDLG1CQUE3RTtRQUFrRyxXQUFBLEVBQWEsWUFBWSxDQUFDLFdBQTVIO1FBQXlJLGVBQUEsRUFBaUIsWUFBWSxDQUFDLGVBQXZLO09BdkJLO01Bd0JaLFlBQUEsRUFBYyxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFvQixDQUFDLGtCQXhCOUI7O0lBb0NoQixRQUFRLENBQUMsSUFBVCxHQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLE1BQWYsQ0FBc0IsUUFBUSxDQUFDLElBQS9CLEVBQXFDLE9BQXJDO0lBRWhCLFFBQVEsQ0FBQyxrQkFBVCxHQUE4QixPQUFPLENBQUM7V0FFdEMsSUFBQyxDQUFBLFFBQUQsR0FBWTtFQTVEQzs7d0JBOERqQixrQkFBQSxHQUFvQixTQUFDLE1BQUQ7QUFDaEIsUUFBQTtJQUFBLElBQUEsR0FBTztNQUNILE1BQUEsRUFBWSxJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsWUFBUCxDQUFBLENBRFQ7TUFFSCxTQUFBLEVBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBRjdCO01BR0gsT0FBQSxFQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUhqQztNQUlILE9BQUEsRUFBUyxNQUFNLENBQUMsS0FKYjs7QUFPUCxXQUFPO0VBUlM7O3dCQVVwQixvQkFBQSxHQUFzQixTQUFDLFVBQUQsRUFBYSxXQUFiO0FBQ2xCLFFBQUE7SUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHdCQUFELENBQTBCLFVBQTFCLEVBQXNDLFdBQXRDO0lBRWIsTUFBQSxHQUFTO01BQ0wsTUFBQSxFQUFZLElBQUEsSUFBQSxDQUFBLENBQU0sQ0FBQyxZQUFQLENBQUEsQ0FEUDtNQUVMLFlBQUEsRUFBYyxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUZ4QjtNQUdMLFVBQUEsRUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUg1QjtNQUlMLE9BQUEsdUJBQVMsVUFBVSxDQUFFLEtBQUssQ0FBQyxTQUFsQixDQUFBLFVBSko7OztNQU9ULFVBQVUsQ0FBRSxPQUFaLENBQUE7O0FBRUEsV0FBTztFQVpXOzt3QkFjdEIsd0JBQUEsR0FBMEIsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUN0QixRQUFBO0lBQUEsUUFBQSxHQUFXLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixXQUExQjtJQUNYLFVBQUEsR0FBYTtJQUViLElBQUcsUUFBQSxJQUFhLFFBQVEsQ0FBQyxNQUF6QjtNQUNJLElBQUcsS0FBQSxJQUFVLE1BQWI7UUFDSSxVQUFBLEdBQWlCLElBQUEsTUFBQSxDQUFPLEtBQVAsRUFBYyxNQUFkLEVBRHJCO09BQUEsTUFBQTtRQUdJLFVBQUEsR0FBaUIsSUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLEtBQVQsR0FBaUIsQ0FBeEIsRUFBMkIsUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBN0MsRUFIckI7O01BSUEsVUFBVSxDQUFDLFVBQVgsQ0FBMEIsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxVQUFVLENBQUMsS0FBdEIsRUFBNkIsVUFBVSxDQUFDLE1BQXhDLENBQTFCLEVBQTJFLFFBQTNFLEVBQXlGLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsUUFBUSxDQUFDLEtBQXBCLEVBQTJCLFFBQVEsQ0FBQyxNQUFwQyxDQUF6RixFQUxKOztBQU9BLFdBQU87RUFYZTs7d0JBYTFCLGFBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE1BQWpCO0lBQ1gsSUFBRyxNQUFIO01BQ0ksV0FBVyxDQUFDLE9BQVosQ0FBdUIsSUFBRCxHQUFNLFNBQTVCLEVBQXNDLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixDQUF0QyxFQURKOztXQUdBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLElBQXBCLEVBQTBCLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZixDQUExQjtFQUpXOzs7QUFNZjs7Ozs7Ozs7O3dCQVFBLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLFdBQW5CO0FBQ0YsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUo7TUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLG9CQUFELENBQXNCLFVBQXRCLEVBQWtDLFdBQWxDO01BQ1QsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFBLENBQWYsR0FBdUIsSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQXBCO01BQ3ZCLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBQSxHQUFZLElBQTNCLEVBQW1DLElBQUMsQ0FBQSxRQUFwQyxFQUE4QyxNQUE5QztNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFFYixhQUFPLElBQUMsQ0FBQSxTQU5aOztFQURFOzt3QkFTTixPQUFBLEdBQVMsU0FBQyxRQUFEO0lBQ0wsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLElBQUksQ0FBQztJQUMxQixJQUFDLENBQUEsYUFBRCxHQUFpQixRQUFRLENBQUMsSUFBSSxDQUFDO0lBQy9CLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsY0FBRCxHQUFrQjtJQUNsQixJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDNUIsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLElBQUksQ0FBQztJQUNqQyxNQUFNLENBQUMsV0FBUCxHQUFxQixJQUFDLENBQUE7V0FDdEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFuQixHQUE2QixJQUFDLENBQUE7RUFWekI7O3dCQWFULGVBQUEsR0FBaUIsU0FBQTtXQUNiLFlBQVksQ0FBQyxZQUFiLENBQTBCLEVBQTFCO0VBRGE7OztBQUdqQjs7Ozs7Ozs7d0JBT0EsSUFBQSxHQUFNLFNBQUMsSUFBRDtJQUNGLElBQVUsQ0FBQyxJQUFDLENBQUEsYUFBYyxDQUFBLElBQUEsQ0FBaEIsSUFBeUIsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFBLENBQUssQ0FBQyxJQUFJLENBQUMsSUFBMUIsQ0FBQSxDQUFnQyxDQUFDLE1BQWpDLEtBQTJDLENBQTlFO0FBQUEsYUFBQTs7SUFFQSxJQUFDLENBQUEsZUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFBLEdBQVksSUFBMUI7SUFHbEIsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFBLENBQTFCO1dBQ0EsWUFBWSxDQUFDLEtBQWIsQ0FBQTtFQVJFOzt3QkFXTixZQUFBLEdBQWMsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFYO0VBQVY7OztBQUdkOzs7Ozs7Ozt3QkFPQSxXQUFBLEdBQWEsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixXQUFBLEdBQVksSUFBaEMsQ0FBWDtFQUFWOzs7Ozs7QUFFakIsTUFBTSxDQUFDLFdBQVAsR0FBeUIsSUFBQSxXQUFBLENBQUE7O0FBQ3pCLEVBQUUsQ0FBQyxXQUFILEdBQWlCLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogR2FtZU1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEdhbWVNYW5hZ2VyXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyBhbGwgZ2VuZXJhbCB0aGluZ3MgYXJvdW5kIHRoZSBnYW1lIGxpa2UgaG9sZGluZyB0aGUgZ2FtZSBzZXR0aW5ncyxcbiAgICAqIG1hbmFnZXMgdGhlIHNhdmUvbG9hZCBvZiBhIGdhbWUsIGV0Yy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgR2FtZU1hbmFnZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzY2VuZSBkYXRhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZURhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAc2NlbmVEYXRhID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgc2NlbmUgdmlld3BvcnQgY29udGFpbmluZyBhbGwgdmlzdWFsIG9iamVjdHMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIHNjZW5lIGFuZCBpbmZsdWVuY2VkXG4gICAgICAgICogYnkgdGhlIGluLWdhbWUgY2FtZXJhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZVZpZXdwb3J0XG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1ZpZXdwb3J0XG4gICAgICAgICMjI1xuICAgICAgICBAc2NlbmVWaWV3cG9ydCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGlzdCBvZiBjb21tb24gZXZlbnRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21tb25FdmVudHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29tbW9uRXZlbnRbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBjb21tb25FdmVudHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgR2FtZU1hbmFnZXIgaXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICogQHByb3BlcnR5IGNvbW1vbkV2ZW50c1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db21tb25FdmVudFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUZW1wb3JhcnkgZ2FtZSBzZXR0aW5ncy5cbiAgICAgICAgKiBAcHJvcGVydHkgdGVtcFNldHRpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjIyBcbiAgICAgICAgQHRlbXBTZXR0aW5ncyA9IHNraXA6IGZhbHNlLCBza2lwVGltZTogNSwgbG9hZE1lbnVBY2Nlc3M6IHRydWUsIG1lbnVBY2Nlc3M6IHRydWUsIGJhY2tsb2dBY2Nlc3M6IHRydWUsIHNhdmVNZW51QWNjZXNzOiB0cnVlLCBtZXNzYWdlRmFkaW5nOiB7IGFuaW1hdGlvbjogeyB0eXBlOiAxIH0sIGR1cmF0aW9uOiAxNSwgZWFzaW5nOiBudWxsIH1cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUZW1wb3JhcnkgZ2FtZSBmaWVsZHMuXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBGaWVsZHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAdGVtcEZpZWxkcyA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZGVmYXVsdCB2YWx1ZXMgZm9yIGJhY2tncm91bmRzLCBwaWN0dXJlcywgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGRlZmF1bHRzID0geyBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHsgXCJkdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJsb29wVmVydGljYWxcIjogMCwgXCJsb29wSG9yaXpvbnRhbFwiOiAwLCBcImVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHBpY3R1cmU6IHsgXCJhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJkaXNhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIGNoYXJhY3RlcjogeyBcImV4cHJlc3Npb25EdXJhdGlvblwiOiAwLCBcImFwcGVhckR1cmF0aW9uXCI6IDQwLCBcImRpc2FwcGVhckR1cmF0aW9uXCI6IDQwLCBcIm9yaWdpblwiOiAwLCBcInpPcmRlclwiOiAwLCBcImFwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAyLCBcImluT3V0XCI6IDIgfSwgXCJkaXNhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMSwgXCJpbk91dFwiOiAxIH0sIFwiYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcImRpc2FwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJtb3Rpb25CbHVyXCI6IHsgXCJlbmFibGVkXCI6IDAsIFwiZGVsYXlcIjogMiwgXCJvcGFjaXR5XCI6IDEwMCwgXCJkaXNzb2x2ZVNwZWVkXCI6IDMgfSwgXCJjaGFuZ2VBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcImZhZGluZ1wiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiY2hhbmdlRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDIsIFwiaW5PdXRcIjogMiB9IH0sXG4gICAgICAgICAgICB0ZXh0OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwicG9zaXRpb25PcmlnaW5cIjogMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHZpZGVvOiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwib3JpZ2luXCI6IDAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcIm1vdGlvbkJsdXJcIjogeyBcImVuYWJsZWRcIjogMCwgXCJkZWxheVwiOiAyLCBcIm9wYWNpdHlcIjogMTAwLCBcImRpc3NvbHZlU3BlZWRcIjogMyB9IH0sXG4gICAgICAgICAgICBsaXZlMmQ6IHsgXCJtb3Rpb25GYWRlSW5UaW1lXCI6IDEwMDAsIFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBtZXNzYWdlQm94OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMCwgXCJtb3ZlbWVudFwiOiAzLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDAsIFwibW92ZW1lbnRcIjogMywgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBhdWRpbzogeyBcIm11c2ljRmFkZUluRHVyYXRpb25cIjogMCwgXCJtdXNpY0ZhZGVPdXREdXJhdGlvblwiOiAwLCBcIm11c2ljVm9sdW1lXCI6IDEwMCwgXCJtdXNpY1BsYXliYWNrUmF0ZVwiOiAxMDAsIFwic291bmRWb2x1bWVcIjogMTAwLCBcInNvdW5kUGxheWJhY2tSYXRlXCI6IDEwMCwgXCJ2b2ljZVZvbHVtZVwiOiAxMDAsIFwidm9pY2VQbGF5YmFja1JhdGVcIjogMTAwIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnYW1lJ3MgYmFja2xvZy5cbiAgICAgICAgKiBAcHJvcGVydHkgYmFja2xvZ1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGJhY2tsb2cgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENoYXJhY3RlciBwYXJhbWV0ZXJzIGJ5IGNoYXJhY3RlciBJRC5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcmFjdGVyUGFyYW1zXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgIyMjIFxuICAgICAgICBAY2hhcmFjdGVyUGFyYW1zID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSdzIGNoYXB0ZXJcbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcHRlcnNcbiAgICAgICAgKiBAdHlwZSBncy5Eb2N1bWVudFtdXG4gICAgICAgICMjIyBcbiAgICAgICAgQGNoYXB0ZXJzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSdzIGN1cnJlbnQgZGlzcGxheWVkIG1lc3NhZ2VzLiBFc3BlY2lhbGx5IGluIE5WTCBtb2RlIHRoZSBtZXNzYWdlcyBcbiAgICAgICAgKiBvZiB0aGUgY3VycmVudCBwYWdlIGFyZSBzdG9yZWQgaGVyZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBtZXNzYWdlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ291bnQgb2Ygc2F2ZSBzbG90cy4gRGVmYXVsdCBpcyAxMDAuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVTbG90Q291bnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjIFxuICAgICAgICBAc2F2ZVNsb3RDb3VudCA9IDEwMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBpbmRleCBvZiBzYXZlIGdhbWVzLiBDb250YWlucyB0aGUgaGVhZGVyLWluZm8gZm9yIGVhY2ggc2F2ZSBnYW1lIHNsb3QuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVHYW1lU2xvdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyMgXG4gICAgICAgIEBzYXZlR2FtZVNsb3RzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZ2xvYmFsIGRhdGEgbGlrZSB0aGUgc3RhdGUgb2YgcGVyc2lzdGVudCBnYW1lIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgZ2xvYmFsRGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBnbG9iYWxEYXRhID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZ2FtZSBydW5zIGluIGVkaXRvcidzIGxpdmUtcHJldmlldy5cbiAgICAgICAgKiBAcHJvcGVydHkgaW5MaXZlUHJldmlld1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBpbkxpdmVQcmV2aWV3ID0gbm9cbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIEdhbWVNYW5hZ2VyLCBzaG91bGQgYmUgY2FsbGVkIGJlZm9yZSB0aGUgYWN0dWFsIGdhbWUgc3RhcnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjIyAgICBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICAgICAgQGluTGl2ZVByZXZpZXcgPSAkUEFSQU1TLnByZXZpZXc/XG4gICAgICAgIEBzYXZlU2xvdENvdW50ID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc2F2ZVNsb3RDb3VudCB8fCAxMDBcbiAgICAgICAgQHRlbXBGaWVsZHMgPSBuZXcgZ3MuR2FtZVRlbXAoKVxuICAgICAgICB3aW5kb3cuJHRlbXBGaWVsZHMgPSBAdGVtcEZpZWxkc1xuICAgICAgICBcbiAgICAgICAgQGNyZWF0ZVNhdmVHYW1lSW5kZXgoKVxuICAgICAgICBAdmFyaWFibGVTdG9yZSA9IG5ldyBncy5WYXJpYWJsZVN0b3JlKClcbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwicGVyc2lzdGVudF92YXJpYWJsZXNcIilcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUuc2V0dXBEb21haW5zKERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIikuc2VsZWN0ICh2KSAtPiB2Lml0ZW1zLmRvbWFpbnx8XCJcIilcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNCeURvbWFpbiA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnROdW1iZXJzID8gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNCeURvbWFpblxuICAgICAgICBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpbiA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRCb29sZWFucyA/IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW4gPSBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5ncyA/IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5cbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudExpc3RzQnlEb21haW4gPSBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TGlzdHMgPyBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TGlzdHNCeURvbWFpblxuICAgICAgICBcbiAgICAgICAgQHNjZW5lVmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KG5ldyBWaWV3cG9ydCgwLCAwLCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0LCBHcmFwaGljcy52aWV3cG9ydCkpXG4gICAgICAgIGZvciBjaGFyYWN0ZXIgaW4gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzQXJyYXlcbiAgICAgICAgICAgIGlmIGNoYXJhY3Rlcj9cbiAgICAgICAgICAgICAgICBAY2hhcmFjdGVyUGFyYW1zW2NoYXJhY3Rlci5pbmRleF0gPSB7fVxuICAgICAgICAgICAgICAgIGlmIGNoYXJhY3Rlci5wYXJhbXM/XG4gICAgICAgICAgICAgICAgICAgIGZvciBwYXJhbSBpbiBjaGFyYWN0ZXIucGFyYW1zXG4gICAgICAgICAgICAgICAgICAgICAgICBAY2hhcmFjdGVyUGFyYW1zW2NoYXJhY3Rlci5pbmRleF1bcGFyYW0ubmFtZV0gPSBwYXJhbS52YWx1ZSBcblxuICAgICAgICBcbiAgICAgICAgQHNldHVwQ29tbW9uRXZlbnRzKClcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLlJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc11cbiAgICAgICAgICAgIEBzZXR0aW5ncy52b2ljZXNQZXJDaGFyYWN0ZXJbaV0gPSAxMDBcbiAgICAgICAgICAgICBcbiAgICAgICAgQGNoYXB0ZXJzID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwidm4uY2hhcHRlclwiKVxuICAgICAgICBAY2hhcHRlcnMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgICAgIGlmIGEuaXRlbXMub3JkZXIgPiBiLml0ZW1zLm9yZGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIGVsc2UgaWYgYS5pdGVtcy5vcmRlciA8IGIuaXRlbXMub3JkZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGNvbW1vbiBldmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cENvbW1vbkV2ZW50c1xuICAgICMjIyAgICAgICAgICAgIFxuICAgIHNldHVwQ29tbW9uRXZlbnRzOiAtPlxuICAgICAgICBmb3IgZXZlbnQgaW4gQGNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgZXZlbnQ/LmRpc3Bvc2UoKVxuICAgICAgICBcbiAgICAgICAgQGNvbW1vbkV2ZW50cyA9IFtdICAgIFxuICAgICAgICBmb3IgZXZlbnQgaW4gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIG5vdCBldmVudFxuICAgICAgICAgICAgaWYgZXZlbnQuc3RhcnRDb25kaXRpb24gPT0gMSBhbmQgZXZlbnQuYXV0b1ByZWxvYWRcbiAgICAgICAgICAgICAgICBncy5SZXNvdXJjZUxvYWRlci5sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKGV2ZW50LmNvbW1hbmRzKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqZWN0ID0gbmV3IGdzLk9iamVjdF9Db21tb25FdmVudCgpXG4gICAgICAgICAgICBvYmplY3QucmVjb3JkID0gZXZlbnRcbiAgICAgICAgICAgIG9iamVjdC5yaWQgPSBldmVudC5pbmRleFxuICAgICAgICAgICAgQGNvbW1vbkV2ZW50c1tldmVudC5pbmRleF0gPSBvYmplY3RcbiAgICAgICAgICAgIEBjb21tb25FdmVudHMucHVzaChvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBjdXJzb3IgZGVwZW5kaW5nIG9uIHN5c3RlbSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQ3Vyc29yXG4gICAgIyMjXG4gICAgc2V0dXBDdXJzb3I6IC0+XG4gICAgICAgIGlmIFJlY29yZE1hbmFnZXIuc3lzdGVtLmN1cnNvcj8ubmFtZVxuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7UmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yLm5hbWV9XCIpXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAoYml0bWFwLCBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jdXJzb3IuaHgsIFJlY29yZE1hbmFnZXIuc3lzdGVtLmN1cnNvci5oeSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgR3JhcGhpY3Muc2V0Q3Vyc29yQml0bWFwKG51bGwpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBHYW1lTWFuYWdlci4gU2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgcXVpdCB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyMgICAgICAgICAgICAgICBcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBRdWl0cyB0aGUgZ2FtZS4gVGhlIGltcGxlbWVudGF0aW9uIGRlcGVuZHMgb24gdGhlIHBsYXRmb3JtLiBTbyBmb3IgZXhhbXBsZSBvbiBtb2JpbGVcbiAgICAqIGRldmljZXMgdGhpcyBtZXRob2QgaGFzIG5vIGVmZmVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4aXRcbiAgICAjIyMgICBcbiAgICBleGl0OiAtPiBBcHBsaWNhdGlvbi5leGl0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXNldHMgdGhlIEdhbWVNYW5hZ2VyIGJ5IGRpc3Bvc2luZyBhbmQgcmUtaW5pdGlhbGl6aW5nIGl0LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzZXRcbiAgICAjIyMgICAgICAgICAgXG4gICAgcmVzZXQ6IC0+XG4gICAgICAgIEBpbml0aWFsaXplZCA9IG5vXG4gICAgICAgIEBpbnRlcnByZXRlciA9IG51bGxcbiAgICAgICAgQGRpc3Bvc2UoKVxuICAgICAgICBAaW5pdGlhbGl6ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBhIG5ldyBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgbmV3R2FtZVxuICAgICMjIyAgICAgIFxuICAgIG5ld0dhbWU6IC0+XG4gICAgICAgIEBtZXNzYWdlcyA9IFtdXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlLmNsZWFyQWxsR2xvYmFsVmFyaWFibGVzKClcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUuY2xlYXJBbGxMb2NhbFZhcmlhYmxlcygpXG4gICAgICAgIEB0ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG4gICAgICAgIEB0ZW1wRmllbGRzLmNsZWFyKClcbiAgICAgICAgQHRlbXBGaWVsZHMuaW5HYW1lID0geWVzXG4gICAgICAgIEBzZXR1cENvbW1vbkV2ZW50cygpXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MubWVudUFjY2VzcyA9IHllc1xuICAgICAgICBAdGVtcFNldHRpbmdzLnNhdmVNZW51QWNjZXNzID0geWVzXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MubG9hZE1lbnVBY2Nlc3MgPSB5ZXNcbiAgICAgICAgQHRlbXBTZXR0aW5ncy5iYWNrbG9nQWNjZXNzID0geWVzXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogRXhpc3RzIHRoZSBnYW1lIGFuZCByZXNldHMgdGhlIEdhbWVNYW5hZ2VyIHdoaWNoIGlzIGltcG9ydGFudCBiZWZvcmUgZ29pbmcgYmFjayB0b1xuICAgICogdGhlIG1haW4gbWVudSBvciB0aXRsZSBzY3JlZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBleGl0R2FtZVxuICAgICMjIyAgICBcbiAgICBleGl0R2FtZTogLT5cbiAgICAgICAgQHRlbXBGaWVsZHMuaW5HYW1lID0gbm8gICAgIFxuICAgICAgICBAdGVtcEZpZWxkcy5pc0V4aXRpbmdHYW1lID0geWVzXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgR2FtZU1hbmFnZXIuIFNob3VsZCBiZSBjYWxsZWQgb25jZSBwZXIgZnJhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIHRoZSBpbmRleCBvZiBhbGwgc2F2ZS1nYW1lcy4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBhIG5ldyBzYXZlIGdhbWVcbiAgICAqIGlzIGNyZWF0ZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVTYXZlR2FtZUluZGV4XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNyZWF0ZVNhdmVHYW1lSW5kZXg6IC0+XG4gICAgICAgIEBzYXZlR2FtZVNsb3RzID0gW11cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5Ac2F2ZVNsb3RDb3VudF1cbiAgICAgICAgICAgIGlmIEdhbWVTdG9yYWdlLmV4aXN0cyhcIlNhdmVHYW1lXyN7aX1fSGVhZGVyXCIpXG4gICAgICAgICAgICAgICAgaGVhZGVyID0gR2FtZVN0b3JhZ2UuZ2V0T2JqZWN0KFwiU2F2ZUdhbWVfI3tpfV9IZWFkZXJcIilcbiAgICAgICAgICAgICAgICBjaGFwdGVyID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoaGVhZGVyLmNoYXB0ZXJVaWQpXG4gICAgICAgICAgICAgICAgc2NlbmUgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudFN1bW1hcnkoaGVhZGVyLnNjZW5lVWlkKVxuICAgICAgICAgICAgICAgIGltYWdlID0gaGVhZGVyLmltYWdlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaGVhZGVyID0gbnVsbFxuICAgICAgICAgICAgICAgIGNoYXBlciA9IG51bGxcbiAgICAgICAgICAgICAgICBzY2VuZSA9IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNoYXB0ZXI/IGFuZCBzY2VuZT8gYW5kICFAaW5MaXZlUHJldmlld1xuICAgICAgICAgICAgICAgIEBzYXZlR2FtZVNsb3RzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBoZWFkZXIuZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhcHRlcjogY2hhcHRlci5pdGVtcy5uYW1lIHx8IFwiREVMRVRFRFwiXG4gICAgICAgICAgICAgICAgICAgIHNjZW5lOiBzY2VuZS5pdGVtcy5uYW1lIHx8IFwiREVMRVRFRFwiLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZTogaW1hZ2UgI2NoYXB0ZXIuaXRlbXMuY29tbWFuZHNbMF0ucGFyYW1zLnNhdmVHYW1lR3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNhdmVHYW1lU2xvdHMucHVzaCh7IFwiZGF0ZVwiOiBcIlwiLCBcImNoYXB0ZXJcIjogXCJcIiwgXCJzY2VuZVwiOiBcIlwiLCBcImltYWdlXCI6IG51bGwgfSlcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAc2F2ZUdhbWVTbG90c1xuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXNldHMgdGhlIGdhbWUncyBzZXR0aW5ncyB0byBpdHMgZGVmYXVsdCB2YWx1ZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXNldFNldHRpbmdzXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgcmVzZXRTZXR0aW5nczogLT5cbiAgICAgICAgQHNldHRpbmdzID0geyB2ZXJzaW9uOiAzNDIsIHJlbmRlcmVyOiAwLCBmaWx0ZXI6IDEsIGNvbmZpcm1hdGlvbjogeWVzLCBhZGp1c3RBc3BlY3RSYXRpbzogbm8sIGFsbG93U2tpcDogeWVzLCBhbGxvd1NraXBVbnJlYWRNZXNzYWdlczogeWVzLCAgYWxsb3dWaWRlb1NraXA6IHllcywgc2tpcFZvaWNlT25BY3Rpb246IHllcywgYWxsb3dDaG9pY2VTa2lwOiBubywgdm9pY2VzQnlDaGFyYWN0ZXI6IFtdLCB0aW1lTWVzc2FnZVRvVm9pY2U6IHRydWUsICBcImF1dG9NZXNzYWdlXCI6IHsgZW5hYmxlZDogZmFsc2UsIHRpbWU6IDAsIHdhaXRGb3JWb2ljZTogeWVzLCBzdG9wT25BY3Rpb246IG5vIH0sICBcInZvaWNlRW5hYmxlZFwiOiB0cnVlLCBcImJnbUVuYWJsZWRcIjogdHJ1ZSwgXCJzb3VuZEVuYWJsZWRcIjogdHJ1ZSwgXCJ2b2ljZVZvbHVtZVwiOiAxMDAsIFwiYmdtVm9sdW1lXCI6IDEwMCwgXCJzZVZvbHVtZVwiOiAxMDAsIFwibWVzc2FnZVNwZWVkXCI6IDQsIFwiZnVsbFNjcmVlblwiOiBubywgXCJhc3BlY3RSYXRpb1wiOiAwIH1cbiAgICAgICAgQHNhdmVHYW1lU2xvdHMgPSBbXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBzYXZlU2xvdENvdW50XVxuICAgICAgICAgICAgR2FtZVN0b3JhZ2UucmVtb3ZlKFwiU2F2ZUdhbWVfI3tpfV9IZWFkZXJcIilcbiAgICAgICAgICAgIEdhbWVTdG9yYWdlLnJlbW92ZShcIlNhdmVHYW1lXyN7aX1cIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHNhdmVHYW1lU2xvdHMucHVzaCh7IFwiZGF0ZVwiOiBcIlwiLCBcImNoYXB0ZXJcIjogXCJcIiwgXCJzY2VuZVwiOiBcIlwiLCBcInRodW1iXCI6IFwiXCIgfSlcbiAgICAgICBcbiAgICAgICAgR2FtZVN0b3JhZ2Uuc2V0T2JqZWN0KFwic2V0dGluZ3NcIiwgQHNldHRpbmdzKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNhdmVzIGN1cnJlbnQgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNhdmVTZXR0aW5nc1xuICAgICMjIyAgICAgXG4gICAgc2F2ZVNldHRpbmdzOiAtPlxuICAgICAgICBHYW1lU3RvcmFnZS5zZXRPYmplY3QoXCJzZXR0aW5nc1wiLCBAc2V0dGluZ3MpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNhdmVzIGN1cnJlbnQgZ2xvYmFsIGRhdGEuXG4gICAgKlxuICAgICogQG1ldGhvZCBzYXZlR2xvYmFsRGF0YVxuICAgICMjIyAgXG4gICAgc2F2ZUdsb2JhbERhdGE6IC0+XG4gICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnROdW1iZXJzID0gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TGlzdHMgPSBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TGlzdHNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50Qm9vbGVhbnMgPSBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5ncyA9IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5cbiAgICAgICAgR2FtZVN0b3JhZ2Uuc2V0T2JqZWN0KFwiZ2xvYmFsRGF0YVwiLCBAZ2xvYmFsRGF0YSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVzZXRzIGN1cnJlbnQgZ2xvYmFsIGRhdGEuIEFsbCBzdG9yZWQgZGF0YSBhYm91dCByZWFkIG1lc3NhZ2VzLCBwZXJzaXN0ZW50IHZhcmlhYmxlcyBhbmRcbiAgICAqIENHIGdhbGxlcnkgd2lsbCBiZSBkZWxldGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzZXRHbG9iYWxEYXRhXG4gICAgIyMjICAgICBcbiAgICByZXNldEdsb2JhbERhdGE6IC0+XG4gICAgICAgIHZlcnNpb24gPSBAZ2xvYmFsRGF0YT8udmVyc2lvblxuICAgICAgICBkYXRhID0gQGdsb2JhbERhdGFcbiAgICAgICAgXG4gICAgICAgIEBnbG9iYWxEYXRhID0geyBcbiAgICAgICAgICAgIG1lc3NhZ2VzOiB7fSwgY2dHYWxsZXJ5OiB7fSwgdmVyc2lvbjogMzQyLCBcbiAgICAgICAgICAgIHBlcnNpc3RlbnROdW1iZXJzOiB7IFwiMFwiOiBbXSwgXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCI6IFtdIH0sIFxuICAgICAgICAgICAgcGVyc2lzdGVudFN0cmluZ3M6IHsgXCIwXCI6IFtdLCBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIjogW10gfSwgXG4gICAgICAgICAgICBwZXJzaXN0ZW50Qm9vbGVhbnM6IHsgXCIwXCI6IFtdLCBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIjogW10gfSwgXG4gICAgICAgICAgICBwZXJzaXN0ZW50TGlzdHM6IHsgXCIwXCI6IFtdLCBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIjogW10gfSBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIGNnLCBpIGluIFJlY29yZE1hbmFnZXIuY2dHYWxsZXJ5QXJyYXlcbiAgICAgICAgICAgIGlmIGNnP1xuICAgICAgICAgICAgICAgIEBnbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF0gPSB7IHVubG9ja2VkOiBubyB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEdhbWVTdG9yYWdlLnNldE9iamVjdChcImdsb2JhbERhdGFcIiwgQGdsb2JhbERhdGEpIFxuICAgIFxuICAgICAgICBAbWlncmF0ZUdsb2JhbERhdGEoZGF0YSwgdmVyc2lvbisxLCBAZ2xvYmFsRGF0YS52ZXJzaW9uKVxuICAgIFxuICAgIG1pZ3JhdGVHbG9iYWxEYXRhOiAoZGF0YSwgZnJvbSwgdG8pIC0+XG4gICAgICAgIGZvciBpIGluIFtmcm9tLi50b11cbiAgICAgICAgICAgIGlmIHRoaXNbXCJtaWdyYXRlR2xvYmFsRGF0YSN7aX1cIl0/XG4gICAgICAgICAgICAgICAgdGhpc1tcIm1pZ3JhdGVHbG9iYWxEYXRhI3tpfVwiXShkYXRhKVxuICAgICAgICAgICAgICAgIFxuICAgIG1pZ3JhdGVHbG9iYWxEYXRhMzQyOiAoZGF0YSkgLT4gXG4gICAgICAgIGlmIGRhdGE/XG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TnVtYmVyc1swXSA9IGRhdGEucGVyc2lzdGVudE51bWJlcnNbMF0gfHwgW11cbiAgICAgICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRTdHJpbmdzWzBdID0gZGF0YS5wZXJzaXN0ZW50U3RyaW5nc1swXSB8fCBbXVxuICAgICAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudEJvb2xlYW5zWzBdID0gZGF0YS5wZXJzaXN0ZW50Qm9vbGVhbnNbMF0gfHwgW11cbiAgICAgICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRMaXN0c1swXSA9IGRhdGEucGVyc2lzdGVudExpc3RzWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TnVtYmVyc1tcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIl0gPSBkYXRhLnBlcnNpc3RlbnROdW1iZXJzWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5nc1tcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIl0gPSBkYXRhLnBlcnNpc3RlbnRTdHJpbmdzWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50Qm9vbGVhbnNbXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCJdID0gZGF0YS5wZXJzaXN0ZW50Qm9vbGVhbnNbMF0gfHwgW11cbiAgICAgICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRMaXN0c1tcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIl0gPSBkYXRhLnBlcnNpc3RlbnRMaXN0c1swXSB8fCBbXVxuICAgICBcbiAgICByZWFkU2F2ZUdhbWU6IChzYXZlR2FtZSkgLT5cbiAgICB3cml0ZVNhdmVHYW1lOiAoc2F2ZUdhbWUpIC0+XG4gICAgICAgIFxuICAgIHByZXBhcmVTYXZlR2FtZTogKHNuYXBzaG90KSAtPlxuICAgICAgICBpZiBzbmFwc2hvdFxuICAgICAgICAgICAgc25hcHNob3QgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Q3VzdG9tQml0bWFwKFwiJHNuYXBzaG90XCIpXG4gICAgICAgICAgICBzbmFwc2hvdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuc2V0Q3VzdG9tQml0bWFwKFwiJHNuYXBzaG90XCIsIEdyYXBoaWNzLnNuYXBzaG90KCkpXG4gICAgICAgIFxuICAgICAgICBjb250ZXh0ID0gbmV3IGdzLk9iamVjdENvZGVjQ29udGV4dCgpXG4gICAgICAgIGNvbnRleHQuZGVjb2RlZE9iamVjdFN0b3JlLnB1c2goR3JhcGhpY3Mudmlld3BvcnQpXG4gICAgICAgIGNvbnRleHQuZGVjb2RlZE9iamVjdFN0b3JlLnB1c2goQHNjZW5lKVxuICAgICAgICBjb250ZXh0LmRlY29kZWRPYmplY3RTdG9yZS5wdXNoKEBzY2VuZS5iZWhhdmlvcilcbiAgXG4gICAgICAgIG1lc3NhZ2VCb3hJZHMgPSBbXCJtZXNzYWdlQm94XCIsIFwibnZsTWVzc2FnZUJveFwiLCBcIm1lc3NhZ2VNZW51XCJdO1xuICAgICAgICBtZXNzYWdlSWRzID0gW1wiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiLCBcIm52bEdhbWVNZXNzYWdlX21lc3NhZ2VcIl07XG4gICAgICAgIG1lc3NhZ2VCb3hlcyA9IG1lc3NhZ2VCb3hJZHMuc2VsZWN0IChpZCkgPT4gQHNjZW5lLmJlaGF2aW9yLm9iamVjdE1hbmFnZXIub2JqZWN0QnlJZChpZClcbiAgICAgICAgbWVzc2FnZXMgPSBtZXNzYWdlSWRzLnNlbGVjdCAoaWQpID0+IEBzY2VuZS5iZWhhdmlvci5vYmplY3RNYW5hZ2VyLm9iamVjdEJ5SWQoaWQpXG4gICAgICAgIFxuICAgICAgICBzY2VuZURhdGEgPSB7fVxuICAgICAgICBzYXZlR2FtZSA9IHt9XG4gICAgICAgIHNhdmVHYW1lLmVuY29kZWRPYmplY3RTdG9yZSA9IG51bGxcbiAgICAgICAgc2F2ZUdhbWUuc2NlbmVVaWQgPSBAc2NlbmUuc2NlbmVEb2N1bWVudC51aWRcbiAgICAgICAgc2F2ZUdhbWUuZGF0YSA9IHtcbiAgICAgICAgICAgIHJlc291cmNlQ29udGV4dDogQHNjZW5lLmJlaGF2aW9yLnJlc291cmNlQ29udGV4dC50b0RhdGFCdW5kbGUoKSxcbiAgICAgICAgICAgIGN1cnJlbnRDaGFyYWN0ZXI6IEBzY2VuZS5jdXJyZW50Q2hhcmFjdGVyLFxuICAgICAgICAgICAgY2hhcmFjdGVyUGFyYW1zOiBAY2hhcmFjdGVyUGFyYW1zLFxuICAgICAgICAgICAgZnJhbWVDb3VudDogR3JhcGhpY3MuZnJhbWVDb3VudCxcbiAgICAgICAgICAgIHRlbXBGaWVsZHM6IEB0ZW1wRmllbGRzLFxuICAgICAgICAgICAgdmlld3BvcnQ6IEBzY2VuZS52aWV3cG9ydCxcbiAgICAgICAgICAgIGNoYXJhY3RlcnM6IEBzY2VuZS5jaGFyYWN0ZXJzLFxuICAgICAgICAgICAgY2hhcmFjdGVyTmFtZXM6IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc0FycmF5LnNlbGVjdCgoYykgLT4geyBuYW1lOiBjLm5hbWUsIGluZGV4OiBjLmluZGV4IH0pLFxuICAgICAgICAgICAgYmFja2dyb3VuZHM6IEBzY2VuZS5iYWNrZ3JvdW5kcyxcbiAgICAgICAgICAgIHBpY3R1cmVzOiBAc2NlbmUucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sXG4gICAgICAgICAgICB0ZXh0czogQHNjZW5lLnRleHRDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgdmlkZW9zOiBAc2NlbmUudmlkZW9Db250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgdmlld3BvcnRzOiBAc2NlbmUudmlld3BvcnRDb250YWluZXIuc3ViT2JqZWN0cyxcbiAgICAgICAgICAgIGNvbW1vbkV2ZW50czogQHNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHMsXG4gICAgICAgICAgICBob3RzcG90czogQHNjZW5lLmhvdHNwb3RDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgaW50ZXJwcmV0ZXI6IEBzY2VuZS5pbnRlcnByZXRlcixcbiAgICAgICAgICAgIGNob2ljZXM6IEBzY2VuZS5jaG9pY2VzLFxuICAgICAgICAgICAgbWVzc2FnZUJveGVzOiBtZXNzYWdlQm94ZXMuc2VsZWN0KChtYiwgaSkgPT4geyB2aXNpYmxlOiBtYi52aXNpYmxlLCBpZDogbWIuaWQsIG1lc3NhZ2U6IG1lc3NhZ2VzW2ldIH0pLFxuICAgICAgICAgICAgYmFja2xvZzogQGJhY2tsb2csXG4gICAgICAgICAgICB2YXJpYWJsZVN0b3JlOiBAdmFyaWFibGVTdG9yZSxcbiAgICAgICAgICAgIGRlZmF1bHRzOiBAZGVmYXVsdHMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uRGF0YTogU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLFxuICAgICAgICAgICAgYXVkaW86IHsgYXVkaW9CdWZmZXJzOiBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzLCBhdWRpb0J1ZmZlcnNCeUxheWVyOiBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzQnlMYXllciwgYXVkaW9MYXllcnM6IEF1ZGlvTWFuYWdlci5hdWRpb0xheWVycywgc291bmRSZWZlcmVuY2VzOiBBdWRpb01hbmFnZXIuc291bmRSZWZlcmVuY2VzIH0sXG4gICAgICAgICAgICBtZXNzYWdlQXJlYXM6IEBzY2VuZS5tZXNzYWdlQXJlYUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAjICBtZXNzYWdlQXJlYXM6IEBzY2VuZS5tZXNzYWdlQXJlYXMuc2VsZWN0IChmKSAtPlxuICAgICAgICAgICMgICAgICBpZiBmIFxuICAgICAgICAgICMgICAgICAgICAgeyBcbiAgICAgICAgICAjICAgICAgICAgICAgICBtZXNzYWdlOiBmLm1lc3NhZ2UsIFxuICAgICAgICAgICMgICAgICAgICAgICAgIGxheW91dDogeyBkc3RSZWN0OiBncy5SZWN0LmZyb21PYmplY3QoZi5sYXlvdXQuZHN0UmVjdCkgfSBcbiAgICAgICAgICAjICAgICAgICAgIH0gXG4gICAgICAgICAgIyAgICAgIGVsc2UgXG4gICAgICAgICAgIyAgICAgICAgICBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICNzcyA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgICAgICBzYXZlR2FtZS5kYXRhID0gZ3MuT2JqZWN0Q29kZWMuZW5jb2RlKHNhdmVHYW1lLmRhdGEsIGNvbnRleHQpXG4gICAgICAgICNjb25zb2xlLmxvZyh3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSBzcylcbiAgICAgICAgc2F2ZUdhbWUuZW5jb2RlZE9iamVjdFN0b3JlID0gY29udGV4dC5lbmNvZGVkT2JqZWN0U3RvcmVcblxuICAgICAgICBAc2F2ZUdhbWUgPSBzYXZlR2FtZVxuICAgICAgXG4gICAgY3JlYXRlU2F2ZUdhbWVTbG90OiAoaGVhZGVyKSAtPlxuICAgICAgICBzbG90ID0ge1xuICAgICAgICAgICAgXCJkYXRlXCI6IG5ldyBEYXRlKCkudG9EYXRlU3RyaW5nKCksXG4gICAgICAgICAgICBcImNoYXB0ZXJcIjogQHNjZW5lLmNoYXB0ZXIuaXRlbXMubmFtZSxcbiAgICAgICAgICAgIFwic2NlbmVcIjogQHNjZW5lLnNjZW5lRG9jdW1lbnQuaXRlbXMubmFtZSxcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogaGVhZGVyLmltYWdlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzbG90O1xuICAgICAgICBcbiAgICBjcmVhdGVTYXZlR2FtZUhlYWRlcjogKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KSAtPlxuICAgICAgICB0aHVtYkltYWdlID0gQGNyZWF0ZVNhdmVHYW1lVGh1bWJJbWFnZSh0aHVtYldpZHRoLCB0aHVtYkhlaWdodClcbiAgICAgICAgXG4gICAgICAgIGhlYWRlciA9IHtcbiAgICAgICAgICAgIFwiZGF0ZVwiOiBuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpLFxuICAgICAgICAgICAgXCJjaGFwdGVyVWlkXCI6IEBzY2VuZS5jaGFwdGVyLnVpZCxcbiAgICAgICAgICAgIFwic2NlbmVVaWRcIjogQHNjZW5lLnNjZW5lRG9jdW1lbnQudWlkLFxuICAgICAgICAgICAgXCJpbWFnZVwiOiB0aHVtYkltYWdlPy5pbWFnZS50b0RhdGFVUkwoKSBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGh1bWJJbWFnZT8uZGlzcG9zZSgpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaGVhZGVyXG4gICAgICAgIFxuICAgIGNyZWF0ZVNhdmVHYW1lVGh1bWJJbWFnZTogKHdpZHRoLCBoZWlnaHQpIC0+XG4gICAgICAgIHNuYXBzaG90ID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIiRzbmFwc2hvdFwiKVxuICAgICAgICB0aHVtYkltYWdlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgc25hcHNob3QgYW5kIHNuYXBzaG90LmxvYWRlZFxuICAgICAgICAgICAgaWYgd2lkdGggYW5kIGhlaWdodFxuICAgICAgICAgICAgICAgIHRodW1iSW1hZ2UgPSBuZXcgQml0bWFwKHdpZHRoLCBoZWlnaHQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGh1bWJJbWFnZSA9IG5ldyBCaXRtYXAoR3JhcGhpY3Mud2lkdGggLyA4LCBHcmFwaGljcy5oZWlnaHQgLyA4KVxuICAgICAgICAgICAgdGh1bWJJbWFnZS5zdHJldGNoQmx0KG5ldyBSZWN0KDAsIDAsIHRodW1iSW1hZ2Uud2lkdGgsIHRodW1iSW1hZ2UuaGVpZ2h0KSwgc25hcHNob3QsIG5ldyBSZWN0KDAsIDAsIHNuYXBzaG90LndpZHRoLCBzbmFwc2hvdC5oZWlnaHQpKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiB0aHVtYkltYWdlXG4gICAgICBcbiAgICBzdG9yZVNhdmVHYW1lOiAobmFtZSwgc2F2ZUdhbWUsIGhlYWRlcikgLT5cbiAgICAgICAgaWYgaGVhZGVyXG4gICAgICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKFwiI3tuYW1lfV9IZWFkZXJcIiwgSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSlcbiAgICAgICAgICAgIFxuICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKG5hbWUsIEpTT04uc3RyaW5naWZ5KHNhdmVHYW1lKSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2F2ZXMgdGhlIGN1cnJlbnQgZ2FtZSBhdCB0aGUgc3BlY2lmaWVkIHNsb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBzYXZlXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2xvdCAtIFRoZSBzbG90IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZCBhdC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aHVtYldpZHRoIC0gVGhlIHdpZHRoIGZvciB0aGUgc25hcHNob3QtdGh1bWIuIFlvdSBjYW4gc3BlY2lmeSA8Yj5udWxsPC9iPiBvciAwIHRvIHVzZSBhbiBhdXRvIGNhbGN1bGF0ZWQgd2lkdGguXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdGh1bWJIZWlnaHQgLSBUaGUgaGVpZ2h0IGZvciB0aGUgc25hcHNob3QtdGh1bWIuIFlvdSBjYW4gc3BlY2lmeSA8Yj5udWxsPC9iPiBvciAwIHRvIHVzZSBhbiBhdXRvIGNhbGN1bGF0ZWQgaGVpZ2h0LlxuICAgICMjIyAgICAgXG4gICAgc2F2ZTogKHNsb3QsIHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KSAtPlxuICAgICAgICBpZiBAc2F2ZUdhbWVcbiAgICAgICAgICAgIGhlYWRlciA9IEBjcmVhdGVTYXZlR2FtZUhlYWRlcih0aHVtYldpZHRoLCB0aHVtYkhlaWdodClcbiAgICAgICAgICAgIEBzYXZlR2FtZVNsb3RzW3Nsb3RdID0gQGNyZWF0ZVNhdmVHYW1lU2xvdChoZWFkZXIpXG4gICAgICAgICAgICBAc3RvcmVTYXZlR2FtZShcIlNhdmVHYW1lXyN7c2xvdH1cIiwgQHNhdmVHYW1lLCBoZWFkZXIpXG4gICAgICAgICAgICBAc2NlbmVEYXRhID0ge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIEBzYXZlR2FtZVxuICAgIFxuICAgIHJlc3RvcmU6IChzYXZlR2FtZSkgLT5cbiAgICAgICAgQGJhY2tsb2cgPSBzYXZlR2FtZS5kYXRhLmJhY2tsb2dcbiAgICAgICAgQGRlZmF1bHRzID0gc2F2ZUdhbWUuZGF0YS5kZWZhdWx0c1xuICAgICAgICBAdmFyaWFibGVTdG9yZSA9IHNhdmVHYW1lLmRhdGEudmFyaWFibGVTdG9yZVxuICAgICAgICBAc2NlbmVEYXRhID0gc2F2ZUdhbWUuZGF0YVxuICAgICAgICBAc2F2ZUdhbWUgPSBudWxsXG4gICAgICAgIEBsb2FkZWRTYXZlR2FtZSA9IG51bGxcbiAgICAgICAgQHRlbXBGaWVsZHMgPSBzYXZlR2FtZS5kYXRhLnRlbXBGaWVsZHNcbiAgICAgICAgQGNoYXJhY3RlclBhcmFtcyA9IHNhdmVHYW1lLmRhdGEuY2hhcmFjdGVyUGFyYW1zXG4gICAgICAgIHdpbmRvdy4kdGVtcEZpZWxkcyA9IEB0ZW1wRmllbGRzXG4gICAgICAgIHdpbmRvdy4kZGF0YUZpZWxkcy5iYWNrbG9nID0gQGJhY2tsb2dcbiAgICAgICAgICAgIFxuICAgIFxuICAgIHByZXBhcmVMb2FkR2FtZTogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygzMClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgdGhlIGdhbWUgZnJvbSB0aGUgc3BlY2lmaWVkIHNhdmUgZ2FtZSBzbG90LiBUaGlzIG1ldGhvZCB0cmlnZ2Vyc1xuICAgICogYSBhdXRvbWF0aWMgc2NlbmUgY2hhbmdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNsb3QgLSBUaGUgc2xvdCB3aGVyZSB0aGUgZ2FtZSBzaG91bGQgYmUgbG9hZGVkIGZyb20uXG4gICAgIyMjICAgICAgICBcbiAgICBsb2FkOiAoc2xvdCkgLT5cbiAgICAgICAgcmV0dXJuIGlmICFAc2F2ZUdhbWVTbG90c1tzbG90XSBvciBAc2F2ZUdhbWVTbG90c1tzbG90XS5kYXRlLnRyaW0oKS5sZW5ndGggPT0gMFxuICAgICAgICBcbiAgICAgICAgQHByZXBhcmVMb2FkR2FtZSgpXG4gICAgICAgIEBsb2FkZWRTYXZlR2FtZSA9IEBsb2FkU2F2ZUdhbWUoXCJTYXZlR2FtZV8je3Nsb3R9XCIpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyB2bi5PYmplY3RfU2NlbmUoKSlcbiAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgXG4gICAgICAgIFxuICAgIGxvYWRTYXZlR2FtZTogKG5hbWUpIC0+IEpTT04ucGFyc2UoR2FtZVN0b3JhZ2UuZ2V0RGF0YShuYW1lKSlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHNhdmUgZ2FtZSBkYXRhIGZvciBhIHNwZWNpZmllZCBzbG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgZ2V0U2F2ZUdhbWVcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzbG90IC0gVGhlIHNsb3QgdG8gZ2V0IHRoZSBzYXZlIGRhdGEgZnJvbS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHNhdmUgZ2FtZSBkYXRhLlxuICAgICMjIyAgICAgICAgXG4gICAgZ2V0U2F2ZUdhbWU6IChzbG90KSAtPiBKU09OLnBhcnNlKEdhbWVTdG9yYWdlLmdldERhdGEoXCJTYXZlR2FtZV8je3Nsb3R9XCIpKVxuICAgIFxud2luZG93LkdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKClcbmdzLkdhbWVNYW5hZ2VyID0gd2luZG93LkdhbWVNYW5hZ2VyIl19
//# sourceURL=GameManager_27.js