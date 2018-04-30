var Component_GameSceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_GameSceneBehavior = (function(superClass) {
  extend(Component_GameSceneBehavior, superClass);


  /**
  * Defines the behavior of visual novel game scene.
  *
  * @module vn
  * @class Component_GameSceneBehavior
  * @extends gs.Component_LayoutSceneBehavior
  * @memberof vn
   */

  function Component_GameSceneBehavior() {
    Component_GameSceneBehavior.__super__.constructor.call(this);
    this.onAutoCommonEventStart = (function(_this) {
      return function() {
        _this.object.removeComponent(_this.object.interpreter);
        return _this.object.interpreter.stop();
      };
    })(this);
    this.onAutoCommonEventFinish = (function(_this) {
      return function() {
        if (!_this.object.components.contains(_this.object.interpreter)) {
          _this.object.addComponent(_this.object.interpreter);
        }
        return _this.object.interpreter.resume();
      };
    })(this);
    this.resourceContext = null;
    this.objectDomain = "";
  }


  /**
  * Initializes the scene. 
  *
  * @method initialize
   */

  Component_GameSceneBehavior.prototype.initialize = function() {
    var ref, saveGame, sceneUid, sprite;
    if (SceneManager.previousScenes.length === 0) {
      gs.GlobalEventManager.clearExcept(this.object.commonEventContainer.subObjects);
    }
    this.resourceContext = ResourceManager.createContext();
    ResourceManager.context = this.resourceContext;
    Graphics.freeze();
    saveGame = GameManager.loadedSaveGame;
    sceneUid = null;
    if (saveGame) {
      sceneUid = saveGame.sceneUid;
      this.object.sceneData = saveGame.data;
    } else {
      sceneUid = ((ref = $PARAMS.preview) != null ? ref.scene.uid : void 0) || this.object.sceneData.uid || RecordManager.system.startInfo.scene.uid;
    }
    this.object.sceneDocument = DataManager.getDocument(sceneUid);
    if (this.object.sceneDocument && this.object.sceneDocument.items.type === "vn.scene") {
      this.object.chapter = DataManager.getDocument(this.object.sceneDocument.items.chapterUid);
      this.object.currentCharacter = {
        "name": ""
      };
      if (!GameManager.initialized) {
        GameManager.initialize();
      }
      LanguageManager.loadBundles();
    } else {
      sprite = new gs.Sprite();
      sprite.bitmap = new gs.Bitmap(Graphics.width, 50);
      sprite.bitmap.drawText(0, 0, Graphics.width, 50, "No Start Scene selected", 1, 0);
      sprite.srcRect = new gs.Rect(0, 0, Graphics.width, 50);
      sprite.y = (Graphics.height - 50) / 2;
      sprite.z = 10000;
    }
    return this.setupScreen();
  };


  /**
  * Disposes the scene. 
  *
  * @method dispose
   */

  Component_GameSceneBehavior.prototype.dispose = function() {
    var event, j, len, ref;
    ResourceManager.context = this.resourceContext;
    this.object.removeObject(this.object.commonEventContainer);
    this.show(false);
    ref = GameManager.commonEvents;
    for (j = 0, len = ref.length; j < len; j++) {
      event = ref[j];
      if (event) {
        event.events.offByOwner("start", this.object);
        event.events.offByOwner("finish", this.object);
      }
    }
    if (this.object.video) {
      this.object.video.dispose();
      this.object.video.onEnded();
    }
    return Component_GameSceneBehavior.__super__.dispose.call(this);
  };

  Component_GameSceneBehavior.prototype.changePictureDomain = function(domain) {
    this.object.pictureContainer.behavior.changeDomain(domain);
    return this.object.pictures = this.object.pictureContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeTextDomain = function(domain) {
    this.object.textContainer.behavior.changeDomain(domain);
    return this.object.texts = this.object.textContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeVideoDomain = function(domain) {
    this.object.videoContainer.behavior.changeDomain(domain);
    return this.object.videos = this.object.videoContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeHotspotDomain = function(domain) {
    this.object.hotspotContainer.behavior.changeDomain(domain);
    return this.object.hotspots = this.object.hotspotContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeMessageAreaDomain = function(domain) {
    this.object.messageAreaContainer.behavior.changeDomain(domain);
    return this.object.messageAreas = this.object.messageAreaContainer.subObjects;
  };


  /**
  * Shows/Hides the current scene. A hidden scene is no longer shown and executed
  * but all objects and data is still there and be shown again anytime.
  *
  * @method show
  * @param {boolean} visible - Indicates if the scene should be shown or hidden.
   */

  Component_GameSceneBehavior.prototype.show = function(visible) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
    if (visible) {
      this.object.viewport = GameManager.sceneViewport;
    }
    window.$dataFields = this.dataFields;
    this.object.visible = visible;
    if ((ref = this.object.layout) != null) {
      ref.update();
    }
    this.object.pictureContainer.behavior.setVisible(visible);
    this.object.hotspotContainer.behavior.setVisible(visible);
    this.object.textContainer.behavior.setVisible(visible);
    this.object.videoContainer.behavior.setVisible(visible);
    this.object.messageAreaContainer.behavior.setVisible(visible);
    this.object.viewportContainer.behavior.setVisible(visible);
    this.object.characterContainer.behavior.setVisible(visible);
    this.object.backgroundContainer.behavior.setVisible(visible);
    if ((ref1 = this.viewport) != null) {
      ref1.visible = visible;
    }
    if ((ref2 = this.object.choiceWindow) != null) {
      ref2.visible = visible;
    }
    if ((ref3 = this.object.inputNumberBox) != null) {
      ref3.visible = visible;
    }
    if ((ref4 = this.object.inputTextBox) != null) {
      ref4.visible = visible;
    }
    if ((ref5 = this.object.inputTextBox) != null) {
      ref5.update();
    }
    if ((ref6 = this.object.inputNumberBox) != null) {
      ref6.update();
    }
    if ((ref7 = this.object.choiceWindow) != null) {
      ref7.update();
    }
    return this.setupCommonEvents();
  };


  /**
  * Sets up common event handling.
  *
  * @method setupCommonEvents
   */

  Component_GameSceneBehavior.prototype.setupCommonEvents = function() {
    var commonEvents, event, i, j, k, len, len1, ref, ref1, ref2, ref3;
    commonEvents = (ref = this.object.sceneData) != null ? ref.commonEvents : void 0;
    if (commonEvents) {
      for (i = j = 0, len = commonEvents.length; j < len; i = ++j) {
        event = commonEvents[i];
        if (event && this.object.commonEventContainer.subObjects.indexOf(event) === -1) {
          this.object.commonEventContainer.setObject(event, i);
          event.behavior.setupEventHandlers();
          if ((ref1 = event.interpreter) != null ? ref1.isRunning : void 0) {
            event.events.emit("start", event);
          }
        }
      }
    } else {
      ref2 = GameManager.commonEvents;
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        event = ref2[i];
        if (event && (event.record.startCondition === 1 || event.record.parallel) && this.object.commonEventContainer.subObjects.indexOf(event) === -1) {
          this.object.commonEventContainer.setObject(event, i);
          event.events.offByOwner("start", this.object);
          event.events.offByOwner("finish", this.object);
          if (!event.record.parallel) {
            event.events.on("start", gs.CallBack("onAutoCommonEventStart", this), null, this.object);
            event.events.on("finish", gs.CallBack("onAutoCommonEventFinish", this), null, this.object);
          }
          if ((ref3 = event.interpreter) != null ? ref3.isRunning : void 0) {
            event.events.emit("start", event);
          }
        }
      }
    }
    return null;
  };


  /**
  * Sets up main interpreter.
  *
  * @method setupInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupInterpreter = function() {
    this.object.commands = this.object.sceneDocument.items.commands;
    if (this.object.sceneData.interpreter) {
      this.object.removeComponent(this.object.interpreter);
      this.object.interpreter = this.object.sceneData.interpreter;
      this.object.addComponent(this.object.interpreter);
      this.object.interpreter.context.set(this.object.sceneDocument.uid, this.object);
      return this.object.interpreter.object = this.object;
    } else {
      this.object.interpreter.setup();
      this.object.interpreter.context.set(this.object.sceneDocument.uid, this.object);
      return this.object.interpreter.start();
    }
  };


  /**
  * Sets up characters and restores them from loaded save game if necessary.
  *
  * @method setupCharacters
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupCharacters = function() {
    var c, i, j, len, ref;
    if (this.object.sceneData.characters != null) {
      ref = this.object.sceneData.characters;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        c = ref[i];
        this.object.characterContainer.setObject(c, i);
      }
    }
    return this.object.currentCharacter = this.object.sceneData.currentCharacter || {
      name: ""
    };
  };


  /**
  * Sets up viewports and restores them from loaded save game if necessary.
  *
  * @method setupViewports
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupViewports = function() {
    var i, j, len, ref, ref1, results, viewport, viewports;
    viewports = (ref = (ref1 = this.object.sceneData) != null ? ref1.viewports : void 0) != null ? ref : [];
    results = [];
    for (i = j = 0, len = viewports.length; j < len; i = ++j) {
      viewport = viewports[i];
      if (viewport) {
        results.push(this.object.viewportContainer.setObject(viewport, i));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up backgrounds and restores them from loaded save game if necessary.
  *
  * @method setupBackgrounds
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupBackgrounds = function() {
    var b, backgrounds, i, j, len, ref, ref1, results;
    backgrounds = (ref = (ref1 = this.object.sceneData) != null ? ref1.backgrounds : void 0) != null ? ref : [];
    results = [];
    for (i = j = 0, len = backgrounds.length; j < len; i = ++j) {
      b = backgrounds[i];
      results.push(this.object.backgroundContainer.setObject(b, i));
    }
    return results;
  };


  /**
  * Sets up pictures and restores them from loaded save game if necessary.
  *
  * @method setupPictures
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupPictures = function() {
    var domain, i, path, picture, pictures, ref, ref1, results;
    pictures = (ref = (ref1 = this.object.sceneData) != null ? ref1.pictures : void 0) != null ? ref : {};
    results = [];
    for (domain in pictures) {
      this.object.pictureContainer.behavior.changeDomain(domain);
      if (pictures[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = pictures[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            picture = ref2[i];
            this.object.pictureContainer.setObject(picture, i);
            if (picture != null ? picture.image : void 0) {
              path = "Graphics/Pictures/" + picture.image;
              results1.push(this.resourceContext.add(path, ResourceManager.resourcesByPath[path]));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up texts and restores them from loaded save game if necessary.
  *
  * @method setupTexts
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupTexts = function() {
    var domain, i, ref, ref1, results, text, texts;
    texts = (ref = (ref1 = this.object.sceneData) != null ? ref1.texts : void 0) != null ? ref : {};
    results = [];
    for (domain in texts) {
      this.object.textContainer.behavior.changeDomain(domain);
      if (texts[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = texts[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            text = ref2[i];
            results1.push(this.object.textContainer.setObject(text, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up videos and restores them from loaded save game if necessary.
  *
  * @method setupVideos
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupVideos = function() {
    var domain, i, path, ref, ref1, results, video, videos;
    videos = (ref = (ref1 = this.object.sceneData) != null ? ref1.videos : void 0) != null ? ref : {};
    results = [];
    for (domain in videos) {
      this.object.videoContainer.behavior.changeDomain(domain);
      if (videos[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = videos[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            video = ref2[i];
            if (video) {
              path = "Movies/" + video.video;
              this.resourceContext.add(path, ResourceManager.resourcesByPath[path]);
              video.visible = true;
              video.update();
            }
            results1.push(this.object.videoContainer.setObject(video, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up hotspots and restores them from loaded save game if necessary.
  *
  * @method setupHotspots
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupHotspots = function() {
    var domain, hotspot, hotspots, i, ref, ref1, results;
    hotspots = (ref = (ref1 = this.object.sceneData) != null ? ref1.hotspots : void 0) != null ? ref : {};
    results = [];
    for (domain in hotspots) {
      this.object.hotspotContainer.behavior.changeDomain(domain);
      if (hotspots[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = hotspots[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            hotspot = ref2[i];
            results1.push(this.object.hotspotContainer.setObject(hotspot, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up layout.
  *
  * @method setupLayout
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupLayout = function() {
    var advVisible, ref, ref1;
    this.dataFields = ui.UIManager.dataSources[ui.UiFactory.layouts.gameLayout.dataSource || "default"]();
    this.dataFields.scene = this.object;
    window.$dataFields = this.dataFields;
    advVisible = this.object.messageMode === vn.MessageMode.ADV;
    this.object.layout = ui.UiFactory.createFromDescriptor(ui.UiFactory.layouts.gameLayout, this.object);
    this.object.layout.visible = advVisible;
    $gameMessage_message.visible = advVisible;
    this.object.layout.ui.prepare();
    this.object.choices = ((ref = this.object.sceneData) != null ? ref.choices : void 0) || this.object.choices;
    if (((ref1 = this.object.choices) != null ? ref1.length : void 0) > 0) {
      this.showChoices(gs.CallBack("onChoiceAccept", this.object.interpreter, {
        pointer: this.object.interpreter.pointer,
        params: this.params
      }));
    }
    if (this.object.interpreter.waitingFor.inputNumber) {
      this.showInputNumber(GameManager.tempFields.digits, gs.CallBack("onInputNumberFinish", this.object.interpreter, this.object.interpreter));
    }
    if (this.object.interpreter.waitingFor.inputText) {
      return this.showInputText(GameManager.tempFields.letters, gs.CallBack("onInputTextFinish", this.object.interpreter, this.object.interpreter));
    }
  };


  /**
  * Sets up the main viewport / screen viewport.
  *
  * @method setupMainViewport
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupMainViewport = function() {
    if (!this.object.sceneData.viewport) {
      GameManager.sceneViewport.removeComponent(GameManager.sceneViewport.visual);
      GameManager.sceneViewport.dispose();
      GameManager.sceneViewport = new gs.Object_Viewport(GameManager.sceneViewport.visual.viewport);
      this.viewport = GameManager.sceneViewport.visual.viewport;
      return this.object.viewport = GameManager.sceneViewport;
    } else {
      GameManager.sceneViewport.dispose();
      GameManager.sceneViewport = this.object.sceneData.viewport;
      this.object.viewport = this.object.sceneData.viewport;
      this.viewport = this.object.viewport.visual.viewport;
      return this.viewport.viewport = Graphics.viewport;
    }
  };


  /**
  * Sets up screen.
  *
  * @method setupScreen
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupScreen = function() {
    if (this.object.sceneData.screen) {
      return this.object.viewport.restore(this.object.sceneData.screen);
    }
  };


  /**
  * Restores main interpreter from loaded save game.
  *
  * @method restoreInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreInterpreter = function() {
    if (this.object.sceneData.interpreter) {
      return this.object.interpreter.restore();
    }
  };


  /**
  * Restores message box from loaded save game.
  *
  * @method restoreMessageBox
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreMessageBox = function() {
    var c, j, k, len, len1, message, messageBox, messageBoxes, messageObject, ref, ref1, results;
    messageBoxes = (ref = this.object.sceneData) != null ? ref.messageBoxes : void 0;
    if (messageBoxes) {
      results = [];
      for (j = 0, len = messageBoxes.length; j < len; j++) {
        messageBox = messageBoxes[j];
        messageObject = gs.ObjectManager.current.objectById(messageBox.id);
        messageObject.visible = messageBox.visible;
        if (messageBox.message) {
          messageBox.message.textRenderer.disposeEventHandlers();
          message = gs.ObjectManager.current.objectById(messageBox.message.id);
          message.textRenderer.dispose();
          Object.mixin(message, messageBox.message, ui.Object_Message.objectCodecBlackList.concat(["origin"]));
          ref1 = message.components;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            c = ref1[k];
            c.object = message;
          }
          results.push(message.textRenderer.setupEventHandlers());
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Restores message from loaded save game.
  *
  * @method restoreMessages
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreMessages = function() {
    var area, c, domain, i, message, messageArea, messageAreas, messageLayout, ref, results;
    if ((ref = this.object.sceneData) != null ? ref.messageAreas : void 0) {
      results = [];
      for (domain in this.object.sceneData.messageAreas) {
        this.object.messageAreaContainer.behavior.changeDomain(domain);
        messageAreas = this.object.sceneData.messageAreas;
        if (messageAreas[domain]) {
          results.push((function() {
            var j, k, len, len1, ref1, ref2, results1;
            ref1 = messageAreas[domain];
            results1 = [];
            for (i = j = 0, len = ref1.length; j < len; i = ++j) {
              area = ref1[i];
              if (area) {
                messageArea = new gs.Object_MessageArea();
                messageLayout = ui.UIManager.createControlFromDescriptor({
                  type: "ui.CustomGameMessage",
                  id: "customGameMessage_" + i,
                  params: {
                    id: "customGameMessage_" + i
                  }
                }, messageArea);
                message = gs.ObjectManager.current.objectById("customGameMessage_" + i + "_message");
                Object.mixin(message, area.message);
                ref2 = message.components;
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                  c = ref2[k];
                  c.object = message;
                }
                messageLayout.dstRect.x = area.layout.dstRect.x;
                messageLayout.dstRect.y = area.layout.dstRect.y;
                messageLayout.dstRect.width = area.layout.dstRect.width;
                messageLayout.dstRect.height = area.layout.dstRect.height;
                messageLayout.needsUpdate = true;
                messageLayout.update();
                messageArea.message = message;
                messageArea.layout = messageLayout;
                messageArea.addObject(messageLayout);
                results1.push(this.object.messageAreaContainer.setObject(messageArea, i));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Restores audio-playback from loaded save game.
  *
  * @method restoreAudioPlayback
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreAudioPlayback = function() {
    var b, j, len, ref;
    if (this.object.sceneData.audio) {
      ref = this.object.sceneData.audio.audioBuffers;
      for (j = 0, len = ref.length; j < len; j++) {
        b = ref[j];
        AudioManager.audioBuffers.push(b);
      }
      AudioManager.audioBuffersByLayer = this.object.sceneData.audio.audioBuffersByLayer;
      AudioManager.audioLayers = this.object.sceneData.audio.audioLayers;
      return AudioManager.soundReferences = this.object.sceneData.audio.soundReferences;
    }
  };


  /**
  * Restores the scene objects from the current loaded save-game. If no save-game is
  * present in GameManager.loadedSaveGame, nothing will happen.
  *
  * @method restoreScene
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreScene = function() {
    var c, context, j, len, ref, ref1, saveGame;
    saveGame = GameManager.loadedSaveGame;
    if (saveGame) {
      context = new gs.ObjectCodecContext([Graphics.viewport, this.object, this], saveGame.encodedObjectStore, null);
      saveGame.data = gs.ObjectCodec.decode(saveGame.data, context);
      ref = saveGame.data.characterNames;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        if (c) {
          if ((ref1 = RecordManager.characters[c.index]) != null) {
            ref1.name = c.name;
          }
        }
      }
      GameManager.restore(saveGame);
      gs.ObjectCodec.onRestore(saveGame.data, context);
      this.resourceContext.fromDataBundle(saveGame.data.resourceContext, ResourceManager.resourcesByPath);
      this.object.sceneData = saveGame.data;
      return Graphics.frameCount = saveGame.data.frameCount;
    }
  };


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_GameSceneBehavior.prototype.prepareData = function() {
    GameManager.scene = this.object;
    gs.ObjectManager.current = this.objectManager;
    this.object.sceneData.uid = this.object.sceneDocument.uid;
    if (!ResourceLoader.loadEventCommandsData(this.object.sceneDocument.items.commands)) {
      ResourceLoader.loadEventCommandsGraphics(this.object.sceneDocument.items.commands);
      GameManager.backlog = this.object.sceneData.backlog || GameManager.sceneData.backlog || [];
      ResourceLoader.loadSystemSounds();
      ResourceLoader.loadSystemGraphics();
      ResourceLoader.loadUiTypesGraphics(ui.UiFactory.customTypes);
      ResourceLoader.loadUiLayoutGraphics(ui.UiFactory.layouts.gameLayout);
      if (this.dataFields != null) {
        ResourceLoader.loadUiDataFieldsGraphics(this.dataFields);
      }
      $tempFields.choiceTimer = this.object.choiceTimer;
      return GameManager.variableStore.setup({
        id: this.object.sceneDocument.uid
      });
    }
  };


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
   */

  Component_GameSceneBehavior.prototype.prepareVisual = function() {
    var ref;
    if (this.object.layout) {
      return;
    }
    if (GameManager.tempFields.isExitingGame) {
      GameManager.tempFields.isExitingGame = false;
      gs.GameNotifier.postResetSceneChange(this.object.sceneDocument.items.name);
    } else {
      gs.GameNotifier.postSceneChange(this.object.sceneDocument.items.name);
    }
    this.restoreScene();
    this.object.messageMode = (ref = this.object.sceneData.messageMode) != null ? ref : vn.MessageMode.ADV;
    this.setupMainViewport();
    this.setupViewports();
    this.setupCharacters();
    this.setupBackgrounds();
    this.setupPictures();
    this.setupTexts();
    this.setupVideos();
    this.setupHotspots();
    this.setupInterpreter();
    this.setupLayout();
    this.setupCommonEvents();
    this.restoreMessageBox();
    this.restoreInterpreter();
    this.restoreMessages();
    this.restoreAudioPlayback();
    this.show(true);
    this.object.sceneData = {};
    GameManager.sceneData = {};
    Graphics.update();
    return this.transition({
      duration: 0
    });
  };


  /**
  * Adds a new character to the scene.
  *
  * @method addCharacter
  * @param {vn.Object_Character} character - The character to add.
  * @param {boolean} noAnimation - Indicates if the character should be added immediately witout any appear-animation.
  * @param {Object} animationData - Contains the appear-animation data -> { animation, easing, duration }.
   */

  Component_GameSceneBehavior.prototype.addCharacter = function(character, noAnimation, animationData) {
    if (!noAnimation) {
      character.motionBlur.set(animationData.motionBlur);
      if (animationData.duration > 0) {
        if (!noAnimation) {
          character.animator.appear(character.dstRect.x, character.dstRect.y, animationData.animation, animationData.easing, animationData.duration);
        }
      }
    }
    character.viewport = this.viewport;
    character.visible = true;
    return this.object.characterContainer.addObject(character);
  };


  /**
  * Removes a character from the scene.
  *
  * @method removeCharacter
  * @param {vn.Object_Character} character - The character to remove.
  * @param {Object} animationData - Contains the disappear-animation data -> { animation, easing, duration }.
   */

  Component_GameSceneBehavior.prototype.removeCharacter = function(character, animationData) {
    return character != null ? character.animator.disappear(animationData.animation, animationData.easing, animationData.duration, function(sender) {
      return sender.dispose();
    }) : void 0;
  };


  /**
  * Resumes the current scene if it has been paused.
  *
  * @method resumeScene
   */

  Component_GameSceneBehavior.prototype.resumeScene = function() {
    var message;
    this.object.pictureContainer.active = true;
    this.object.characterContainer.active = true;
    this.object.backgroundContainer.active = true;
    this.object.textContainer.active = true;
    this.object.hotspotContainer.active = true;
    this.object.videoContainer.active = true;
    message = gs.ObjectManager.current.objectById("gameMessage_message");
    return message.active = true;
  };


  /**
  * Pauses the current scene. A paused scene will not continue, messages, pictures, etc. will
  * stop until the scene resumes.
  *
  * @method pauseScene
   */

  Component_GameSceneBehavior.prototype.pauseScene = function() {
    var message;
    this.object.pictureContainer.active = false;
    this.object.characterContainer.active = false;
    this.object.backgroundContainer.active = false;
    this.object.textContainer.active = false;
    this.object.hotspotContainer.active = false;
    this.object.videoContainer.active = false;
    message = gs.ObjectManager.current.objectById("gameMessage_message");
    return message.active = false;
  };


  /**
  * Changes the visibility of the entire game UI like the message boxes, etc. to allows
  * the player to see the entire scene. Useful for CGs, etc.
  *
  * @param {boolean} visible - If <b>true</b>, the game UI will be visible. Otherwise it will be hidden.
  * @method changeUIVisibility
   */

  Component_GameSceneBehavior.prototype.changeUIVisibility = function(visible) {
    this.uiVisible = visible;
    return this.object.layout.visible = visible;
  };


  /**
  * Shows input-text box to let the user enter a text.
  *
  * @param {number} letters - The max. number of letters the user can enter.
  * @param {gs.Callback} callback - A callback function called if the input-text box has been accepted by the user.
  * @method showInputText
   */

  Component_GameSceneBehavior.prototype.showInputText = function(letters, callback) {
    var ref;
    if ((ref = this.object.inputTextBox) != null) {
      ref.dispose();
    }
    this.object.inputTextBox = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.InputTextBox"], this.object.layout);
    this.object.inputTextBox.ui.prepare();
    return this.object.inputTextBox.events.on("accept", callback);
  };


  /**
  * Shows input-number box to let the user enter a number.
  *
  * @param {number} digits - The max. number of digits the user can enter.
  * @param {gs.Callback} callback - A callback function called if the input-number box has been accepted by the user.
  * @method showInputNumber
   */

  Component_GameSceneBehavior.prototype.showInputNumber = function(digits, callback) {
    var ref;
    if ((ref = this.object.inputNumberBox) != null) {
      ref.dispose();
    }
    this.object.inputNumberBox = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.InputNumberBox"], this.object.layout);
    this.object.inputNumberBox.ui.prepare();
    return this.object.inputNumberBox.events.on("accept", callback);
  };


  /**
  * Shows choices to let the user pick a choice.
  *
  * @param {Object[]} choices - An array of choices
  * @param {gs.Callback} callback - A callback function called if a choice has been picked by the user.
  * @method showChoices
   */

  Component_GameSceneBehavior.prototype.showChoices = function(callback) {
    var ref, useFreeLayout;
    useFreeLayout = this.object.choices.where(function(x) {
      return x.dstRect != null;
    }).length > 0;
    if ((ref = this.object.choiceWindow) != null) {
      ref.dispose();
    }
    if (useFreeLayout) {
      this.object.choiceWindow = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.FreeChoiceBox"], this.object.layout);
    } else {
      this.object.choiceWindow = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.ChoiceBox"], this.object.layout);
    }
    this.object.choiceWindow.events.on("selectionAccept", callback);
    return this.object.choiceWindow.ui.prepare();
  };


  /**
  * Changes the background of the scene.
  *
  * @method changeBackground
  * @param {Object} background - The background graphic object -> { name }
  * @param {boolean} noAnimation - Indicates if the background should be changed immediately witout any change-animation.
  * @param {Object} animation - The appear/disappear animation to use.
  * @param {Object} easing - The easing of the change animation.
  * @param {number} duration - The duration of the change in frames.
  * @param {number} ox - The x-origin of the background.
  * @param {number} oy - The y-origin of the background.
  * @param {number} layer - The background-layer to change.
  * @param {boolean} loopHorizontal - Indicates if the background should be looped horizontally.
  * @param {boolean} loopVertical - Indicates if the background should be looped vertically.
   */

  Component_GameSceneBehavior.prototype.changeBackground = function(background, noAnimation, animation, easing, duration, ox, oy, layer, loopHorizontal, loopVertical) {
    var object, otherObject, ref, ref1;
    if (background != null) {
      otherObject = this.object.backgrounds[layer];
      object = new vn.Object_Background();
      object.image = background.name;
      object.origin.x = ox;
      object.origin.y = oy;
      object.viewport = this.viewport;
      object.visual.looping.vertical = false;
      object.visual.looping.horizontal = false;
      object.update();
      this.object.backgroundContainer.setObject(object, layer);
      duration = duration != null ? duration : 30;
      if (otherObject != null) {
        otherObject.zIndex = layer;
      }
      if (otherObject != null) {
        if ((ref = otherObject.animator.otherObject) != null) {
          ref.dispose();
        }
      }
      if (duration === 0) {
        if (otherObject != null) {
          otherObject.dispose();
        }
        object.visual.looping.vertical = loopVertical;
        return object.visual.looping.horizontal = loopHorizontal;
      } else {
        if (noAnimation) {
          object.visual.looping.vertical = loopVertical;
          return object.visual.looping.horizontal = loopHorizontal;
        } else {
          object.animator.otherObject = otherObject;
          return object.animator.appear(0, 0, animation, easing, duration, (function(_this) {
            return function(sender) {
              var ref1;
              sender.update();
              if ((ref1 = sender.animator.otherObject) != null) {
                ref1.dispose();
              }
              sender.animator.otherObject = null;
              sender.visual.looping.vertical = loopVertical;
              return sender.visual.looping.horizontal = loopHorizontal;
            };
          })(this));
        }
      }
    } else {
      return (ref1 = this.object.backgrounds[layer]) != null ? ref1.animator.hide(duration, easing, (function(_this) {
        return function() {
          _this.object.backgrounds[layer].dispose();
          return _this.object.backgrounds[layer] = null;
        };
      })(this)) : void 0;
    }
  };


  /**
  * Skips all viewport animations except the main viewport animation.
  *
  * @method skipViewports
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipViewports = function() {
    var component, j, k, len, len1, ref, viewport, viewports;
    viewports = this.object.viewportContainer.subObjects;
    for (j = 0, len = viewports.length; j < len; j++) {
      viewport = viewports[j];
      if (viewport) {
        ref = viewport.components;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          component = ref[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all picture animations.
  *
  * @method skipPictures
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipPictures = function() {
    var component, j, k, len, len1, picture, ref, ref1;
    ref = this.object.pictures;
    for (j = 0, len = ref.length; j < len; j++) {
      picture = ref[j];
      if (picture) {
        ref1 = picture.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all text animations.
  *
  * @method skipTexts
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipTexts = function() {
    var component, j, k, len, len1, ref, ref1, text;
    ref = this.object.texts;
    for (j = 0, len = ref.length; j < len; j++) {
      text = ref[j];
      if (text) {
        ref1 = text.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all video animations but not the video-playback itself.
  *
  * @method skipVideos
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipVideos = function() {
    var component, j, k, len, len1, ref, ref1, video;
    ref = this.object.videos;
    for (j = 0, len = ref.length; j < len; j++) {
      video = ref[j];
      if (video) {
        ref1 = video.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all background animations.
  *
  * @method skipBackgrounds
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipBackgrounds = function() {
    var background, component, j, k, len, len1, ref, ref1;
    ref = this.object.backgrounds;
    for (j = 0, len = ref.length; j < len; j++) {
      background = ref[j];
      if (background) {
        ref1 = background.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all character animations
  *
  * @method skipCharacters
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipCharacters = function() {
    var character, component, j, k, len, len1, ref, ref1;
    ref = this.object.characters;
    for (j = 0, len = ref.length; j < len; j++) {
      character = ref[j];
      if (character) {
        ref1 = character.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips the main viewport animation.
  *
  * @method skipMainViewport
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMainViewport = function() {
    var component, j, len, ref;
    ref = this.object.viewport.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (typeof component.skip === "function") {
        component.skip();
      }
    }
    return null;
  };


  /**
  * Skips all animations of all message boxes defined in MESSAGE_BOX_IDS ui constant.
  *
  * @method skipMessageBoxes
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMessageBoxes = function() {
    var component, j, k, len, len1, messageBox, messageBoxId, ref, ref1;
    ref = gs.UIConstants.MESSAGE_BOX_IDS || ["messageBox", "nvlMessageBox"];
    for (j = 0, len = ref.length; j < len; j++) {
      messageBoxId = ref[j];
      messageBox = gs.ObjectManager.current.objectById(messageBoxId);
      if (messageBox.components) {
        ref1 = messageBox.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all animations of all message areas.
  *
  * @method skipMessageAreas
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMessageAreas = function() {
    var component, j, k, l, len, len1, len2, len3, m, messageArea, msg, ref, ref1, ref2, ref3;
    ref = this.object.messageAreas;
    for (j = 0, len = ref.length; j < len; j++) {
      messageArea = ref[j];
      if (messageArea != null ? messageArea.message : void 0) {
        ref1 = messageArea.message.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    msg = gs.ObjectManager.current.objectById("gameMessage_message");
    if (msg) {
      ref2 = msg.components;
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        component = ref2[l];
        if (typeof component.skip === "function") {
          component.skip();
        }
      }
    }
    msg = gs.ObjectManager.current.objectById("nvlGameMessage_message");
    if (msg) {
      ref3 = msg.components;
      for (m = 0, len3 = ref3.length; m < len3; m++) {
        component = ref3[m];
        if (typeof component.skip === "function") {
          component.skip();
        }
      }
    }
    return null;
  };


  /**
  * Skips the scene interpreter timer.
  *
  * @method skipInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipInterpreter = function() {
    if (this.object.interpreter.waitCounter > GameManager.tempSettings.skipTime) {
      this.object.interpreter.waitCounter = GameManager.tempSettings.skipTime;
      if (this.object.interpreter.waitCounter === 0) {
        return this.object.interpreter.isWaiting = false;
      }
    }
  };


  /**
  * Skips the interpreter timer of all common events.
  *
  * @method skipCommonEvents
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipCommonEvents = function() {
    var event, events, j, len, results;
    events = this.object.commonEventContainer.subObjects;
    results = [];
    for (j = 0, len = events.length; j < len; j++) {
      event = events[j];
      if ((event != null ? event.interpreter : void 0) && event.interpreter.waitCounter > GameManager.tempSettings.skipTime) {
        event.interpreter.waitCounter = GameManager.tempSettings.skipTime;
        if (event.interpreter.waitCounter === 0) {
          results.push(event.interpreter.isWaiting = false);
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Skips the scene's content.
  *
  * @method skipContent
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipContent = function() {
    this.skipPictures();
    this.skipTexts();
    this.skipVideos();
    this.skipBackgrounds();
    this.skipCharacters();
    this.skipMainViewport();
    this.skipViewports();
    this.skipMessageBoxes();
    this.skipMessageAreas();
    this.skipInterpreter();
    return this.skipCommonEvents();
  };


  /**
  * Checks for the shortcut to hide/show the game UI. By default, this is the space-key. You
  * can override this method to change the shortcut.
  *
  * @method updateUIVisibilityShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateUIVisibilityShortcut = function() {
    if (!this.uiVisible && (Input.trigger(Input.C) || Input.Mouse.buttonDown)) {
      this.changeUIVisibility(!this.uiVisible);
    }
    if (Input.trigger(Input.KEY_SPACE)) {
      return this.changeUIVisibility(!this.uiVisible);
    }
  };


  /**
  * Checks for the shortcut to exit the game. By default, this is the escape-key. You
  * can override this method to change the shortcut.
  *
  * @method updateQuitShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateQuitShortcut = function() {
    if (Input.trigger(Input.KEY_ESCAPE)) {
      return gs.Application.exit();
    }
  };


  /**
  * Checks for the shortcut to open the settings menu. By default, this is the s-key. You
  * can override this method to change the shortcut.
  *
  * @method updateSettingsShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateSettingsShortcut = function() {
    if (GameManager.tempSettings.menuAccess && Input.trigger(Input.X)) {
      return SceneManager.switchTo(new gs.Object_Layout("settingsMenuLayout"), true);
    }
  };


  /**
  * Checks for the shortcut to open the settings menu. By default, this is the control-key. You
  * can override this method to change the shortcut.
  *
  * @method updateSkipShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateSkipShortcut = function() {
    if (this.object.settings.allowSkip) {
      if (Input.keys[Input.KEY_CONTROL] === 1) {
        return GameManager.tempSettings.skip = true;
      } else if (Input.keys[Input.KEY_CONTROL] === 2) {
        return GameManager.tempSettings.skip = false;
      }
    }
  };


  /**
  * Checks for default keyboard shortcuts e.g space-key to hide the UI, etc.
  *
  * @method updateShortcuts
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateShortcuts = function() {
    this.updateSettingsShortcut();
    this.updateQuitShortcut();
    this.updateUIVisibilityShortcut();
    return this.updateSkipShortcut();
  };


  /**
  * Updates the full screen video played via Play Movie command.
  *
  * @method updateVideo
   */

  Component_GameSceneBehavior.prototype.updateVideo = function() {
    if (this.object.video != null) {
      this.object.video.update();
      if (this.object.settings.allowVideoSkip && (Input.trigger(Input.C) || Input.Mouse.buttons[Input.Mouse.LEFT] === 2)) {
        this.object.video.stop();
      }
      return Input.clear();
    }
  };


  /**
  * Updates skipping if enabled.
  *
  * @method updateSkipping
   */

  Component_GameSceneBehavior.prototype.updateSkipping = function() {
    if (!this.object.settings.allowSkip) {
      this.object.tempSettings.skip = false;
    }
    if (GameManager.tempSettings.skip) {
      return this.skipContent();
    }
  };


  /**
  * Updates the scene's content.
  *
  * @method updateContent
   */

  Component_GameSceneBehavior.prototype.updateContent = function() {
    GameManager.scene = this.object;
    Graphics.viewport.update();
    this.object.viewport.update();
    this.updateSkipping();
    this.updateVideo();
    this.updateShortcuts();
    return Component_GameSceneBehavior.__super__.updateContent.call(this);
  };

  return Component_GameSceneBehavior;

})(gs.Component_LayoutSceneBehavior);

vn.Component_GameSceneBehavior = Component_GameSceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7O0VBUWEscUNBQUE7SUFDVCwyREFBQTtJQUVBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDdEIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBaEM7ZUFDQSxLQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFwQixDQUFBO01BRnNCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQUcxQixJQUFDLENBQUEsdUJBQUQsR0FBMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQ3ZCLElBQUcsQ0FBQyxLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFuQixDQUE0QixLQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDLENBQUo7VUFDSSxLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxXQUE3QixFQURKOztlQUVBLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQUE7TUFIdUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBSzNCLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxZQUFELEdBQWdCO0VBWlA7OztBQWNiOzs7Ozs7d0NBS0EsVUFBQSxHQUFZLFNBQUE7QUFDUixRQUFBO0lBQUEsSUFBRyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQTVCLEtBQXNDLENBQXpDO01BQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLFdBQXRCLENBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBL0QsRUFESjs7SUFHQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFlLENBQUMsYUFBaEIsQ0FB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dGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9HYW1lU2NlbmVCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yIGV4dGVuZHMgZ3MuQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3JcbiAjICAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wib2JqZWN0TWFuYWdlclwiXVxuICAgICMjIypcbiAgICAqIERlZmluZXMgdGhlIGJlaGF2aW9yIG9mIHZpc3VhbCBub3ZlbCBnYW1lIHNjZW5lLlxuICAgICpcbiAgICAqIEBtb2R1bGUgdm5cbiAgICAqIEBjbGFzcyBDb21wb25lbnRfR2FtZVNjZW5lQmVoYXZpb3JcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yXG4gICAgKiBAbWVtYmVyb2Ygdm5cbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQG9uQXV0b0NvbW1vbkV2ZW50U3RhcnQgPSA9PlxuICAgICAgICAgICAgQG9iamVjdC5yZW1vdmVDb21wb25lbnQoQG9iamVjdC5pbnRlcnByZXRlcilcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuc3RvcCgpXG4gICAgICAgIEBvbkF1dG9Db21tb25FdmVudEZpbmlzaCA9ID0+XG4gICAgICAgICAgICBpZiAhQG9iamVjdC5jb21wb25lbnRzLmNvbnRhaW5zKEBvYmplY3QuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG9iamVjdC5pbnRlcnByZXRlcilcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIucmVzdW1lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAcmVzb3VyY2VDb250ZXh0ID0gbnVsbFxuICAgICAgICBAb2JqZWN0RG9tYWluID0gXCJcIlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc2NlbmUuIFxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjIyBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBpZiBTY2VuZU1hbmFnZXIucHJldmlvdXNTY2VuZXMubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5jbGVhckV4Y2VwdChAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHMpXG4gICAgICAgICAgICBcbiAgICAgICAgQHJlc291cmNlQ29udGV4dCA9IFJlc291cmNlTWFuYWdlci5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQgPSBAcmVzb3VyY2VDb250ZXh0XG4gICAgICAgIFxuICAgICAgICBHcmFwaGljcy5mcmVlemUoKVxuICAgICAgICBzYXZlR2FtZSA9IEdhbWVNYW5hZ2VyLmxvYWRlZFNhdmVHYW1lXG4gICAgICAgIHNjZW5lVWlkID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgc2F2ZUdhbWVcbiAgICAgICAgICAgIHNjZW5lVWlkID0gc2F2ZUdhbWUuc2NlbmVVaWRcbiAgICAgICAgICAgIEBvYmplY3Quc2NlbmVEYXRhID0gc2F2ZUdhbWUuZGF0YVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzY2VuZVVpZCA9ICRQQVJBTVMucHJldmlldz8uc2NlbmUudWlkIHx8IEBvYmplY3Quc2NlbmVEYXRhLnVpZCB8fCBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5zdGFydEluZm8uc2NlbmUudWlkXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LnNjZW5lRG9jdW1lbnQgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChzY2VuZVVpZClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEb2N1bWVudCBhbmQgQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLnR5cGUgPT0gXCJ2bi5zY2VuZVwiXG4gICAgICAgICAgICBAb2JqZWN0LmNoYXB0ZXIgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMuY2hhcHRlclVpZClcbiAgICAgICAgICAgIEBvYmplY3QuY3VycmVudENoYXJhY3RlciA9IHsgXCJuYW1lXCI6IFwiXCIgfSAjUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzWzBdXG4gICAgXG4gICAgICAgICAgICBpZiBub3QgR2FtZU1hbmFnZXIuaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5pbml0aWFsaXplKClcbiAgICBcbiAgICAgICAgICAgIExhbmd1YWdlTWFuYWdlci5sb2FkQnVuZGxlcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwcml0ZSA9IG5ldyBncy5TcHJpdGUoKVxuICAgICAgICAgICAgc3ByaXRlLmJpdG1hcCA9IG5ldyBncy5CaXRtYXAoR3JhcGhpY3Mud2lkdGgsIDUwKVxuICAgICAgICAgICAgc3ByaXRlLmJpdG1hcC5kcmF3VGV4dCgwLCAwLCBHcmFwaGljcy53aWR0aCwgNTAsIFwiTm8gU3RhcnQgU2NlbmUgc2VsZWN0ZWRcIiwgMSwgMClcbiAgICAgICAgICAgIHNwcml0ZS5zcmNSZWN0ID0gbmV3IGdzLlJlY3QoMCwgMCwgR3JhcGhpY3Mud2lkdGgsIDUwKVxuICAgICAgICAgICAgc3ByaXRlLnkgPSAoR3JhcGhpY3MuaGVpZ2h0IC0gNTApIC8gMlxuICAgICAgICAgICAgc3ByaXRlLnogPSAxMDAwMFxuICAgXG4gICAgICAgIEBzZXR1cFNjcmVlbigpIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgc2NlbmUuIFxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5jb250ZXh0ID0gQHJlc291cmNlQ29udGV4dFxuICAgICAgICBAb2JqZWN0LnJlbW92ZU9iamVjdChAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyKVxuICAgICAgICBAc2hvdyhubylcblxuICAgICAgICBmb3IgZXZlbnQgaW4gR2FtZU1hbmFnZXIuY29tbW9uRXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudFxuICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5vZmZCeU93bmVyKFwic3RhcnRcIiwgQG9iamVjdClcbiAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub2ZmQnlPd25lcihcImZpbmlzaFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QudmlkZW9cbiAgICAgICAgICAgIEBvYmplY3QudmlkZW8uZGlzcG9zZSgpXG4gICAgICAgICAgICBAb2JqZWN0LnZpZGVvLm9uRW5kZWQoKVxuICAgICAgICBcbiAgICAgICAgc3VwZXIoKVxuICAgIFxuICAgIGNoYW5nZVBpY3R1cmVEb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICBAb2JqZWN0LnBpY3R1cmVzID0gQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICBjaGFuZ2VUZXh0RG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgQG9iamVjdC50ZXh0cyA9IEBvYmplY3QudGV4dENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgY2hhbmdlVmlkZW9Eb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgQG9iamVjdC52aWRlb3MgPSBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICBjaGFuZ2VIb3RzcG90RG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgQG9iamVjdC5ob3RzcG90cyA9IEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgY2hhbmdlTWVzc2FnZUFyZWFEb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBvYmplY3QubWVzc2FnZUFyZWFDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgQG9iamVjdC5tZXNzYWdlQXJlYXMgPSBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNob3dzL0hpZGVzIHRoZSBjdXJyZW50IHNjZW5lLiBBIGhpZGRlbiBzY2VuZSBpcyBubyBsb25nZXIgc2hvd24gYW5kIGV4ZWN1dGVkXG4gICAgKiBidXQgYWxsIG9iamVjdHMgYW5kIGRhdGEgaXMgc3RpbGwgdGhlcmUgYW5kIGJlIHNob3duIGFnYWluIGFueXRpbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzaG93XG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZpc2libGUgLSBJbmRpY2F0ZXMgaWYgdGhlIHNjZW5lIHNob3VsZCBiZSBzaG93biBvciBoaWRkZW4uXG4gICAgIyMjICAgICAgICAgIFxuICAgIHNob3c6ICh2aXNpYmxlKSAtPlxuICAgICAgICBpZiB2aXNpYmxlXG4gICAgICAgICAgICBAb2JqZWN0LnZpZXdwb3J0ID0gR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydFxuICAgICAgICAgICAgXG4gICAgICAgIHdpbmRvdy4kZGF0YUZpZWxkcyA9IEBkYXRhRmllbGRzXG4gICAgICAgIEBvYmplY3QudmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QubGF5b3V0Py51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC52aWRlb0NvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QubWVzc2FnZUFyZWFDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LnZpZXdwb3J0Q29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC5jaGFyYWN0ZXJDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuXG4gICAgICAgIEB2aWV3cG9ydD8udmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3c/LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3g/LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94Py52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveD8udXBkYXRlKClcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveD8udXBkYXRlKClcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3c/LnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICAjaWYgdmlzaWJsZSBhbmQgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmxlbmd0aCA9PSAwXG4gICAgICAgIEBzZXR1cENvbW1vbkV2ZW50cygpXG4gICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgY29tbW9uIGV2ZW50IGhhbmRsaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBDb21tb25FdmVudHNcbiAgICAjIyMgICBcbiAgICBzZXR1cENvbW1vbkV2ZW50czogLT5cbiAgICAgICAgY29tbW9uRXZlbnRzID0gQG9iamVjdC5zY2VuZURhdGE/LmNvbW1vbkV2ZW50c1xuICAgICAgICBcbiAgICAgICAgaWYgY29tbW9uRXZlbnRzXG4gICAgICAgICAgICBmb3IgZXZlbnQsIGkgaW4gY29tbW9uRXZlbnRzXG4gICAgICAgICAgICAgICAgaWYgZXZlbnQgYW5kIEBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc3ViT2JqZWN0cy5pbmRleE9mKGV2ZW50KSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyLnNldE9iamVjdChldmVudCwgaSlcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuYmVoYXZpb3Iuc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZXZlbnQuaW50ZXJwcmV0ZXI/LmlzUnVubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLmVtaXQoXCJzdGFydFwiLCBldmVudClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZm9yIGV2ZW50LCBpIGluIEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgICAgIGlmIGV2ZW50IGFuZCAoZXZlbnQucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID09IDEgb3IgZXZlbnQucmVjb3JkLnBhcmFsbGVsKSBhbmQgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmluZGV4T2YoZXZlbnQpID09IC0xXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc2V0T2JqZWN0KGV2ZW50LCBpKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9mZkJ5T3duZXIoXCJzdGFydFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub2ZmQnlPd25lcihcImZpbmlzaFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGV2ZW50LnJlY29yZC5wYXJhbGxlbFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9uIFwic3RhcnRcIiwgZ3MuQ2FsbEJhY2soXCJvbkF1dG9Db21tb25FdmVudFN0YXJ0XCIsIHRoaXMpLCBudWxsLCBAb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub24gXCJmaW5pc2hcIiwgZ3MuQ2FsbEJhY2soXCJvbkF1dG9Db21tb25FdmVudEZpbmlzaFwiLCB0aGlzKSwgbnVsbCwgQG9iamVjdFxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGV2ZW50LmludGVycHJldGVyPy5pc1J1bm5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5lbWl0KFwic3RhcnRcIiwgZXZlbnQpXG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBtYWluIGludGVycHJldGVyLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBJbnRlcnByZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIHNldHVwSW50ZXJwcmV0ZXI6IC0+XG4gICAgICAgIEBvYmplY3QuY29tbWFuZHMgPSBAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHNcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LnJlbW92ZUNvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlciA9IEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgI09iamVjdC5taXhpbihAb2JqZWN0LmludGVycHJldGVyLCBAb2JqZWN0LnNjZW5lRGF0YS5pbnRlcnByZXRlciwgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlci5vYmplY3RDb2RlY0JsYWNrTGlzdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZCwgQG9iamVjdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIub2JqZWN0ID0gQG9iamVjdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnNldHVwKClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZCwgQG9iamVjdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgY2hhcmFjdGVycyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBDaGFyYWN0ZXJzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIHNldHVwQ2hhcmFjdGVyczogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGEuY2hhcmFjdGVycz9cbiAgICAgICAgICAgIGZvciBjLCBpIGluIEBvYmplY3Quc2NlbmVEYXRhLmNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5zZXRPYmplY3QoYywgaSlcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuY3VycmVudENoYXJhY3RlciA9IEBvYmplY3Quc2NlbmVEYXRhLmN1cnJlbnRDaGFyYWN0ZXIgfHwgeyBuYW1lOiBcIlwiIH0jUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzWzBdXG4gICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB2aWV3cG9ydHMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVmlld3BvcnRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIHNldHVwVmlld3BvcnRzOiAtPlxuICAgICAgICB2aWV3cG9ydHMgPSBAb2JqZWN0LnNjZW5lRGF0YT8udmlld3BvcnRzID8gW11cbiAgICAgICAgZm9yIHZpZXdwb3J0LCBpIGluIHZpZXdwb3J0c1xuICAgICAgICAgICAgaWYgdmlld3BvcnRcbiAgICAgICAgICAgICAgICBAb2JqZWN0LnZpZXdwb3J0Q29udGFpbmVyLnNldE9iamVjdCh2aWV3cG9ydCwgaSlcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGJhY2tncm91bmRzIGFuZCByZXN0b3JlcyB0aGVtIGZyb20gbG9hZGVkIHNhdmUgZ2FtZSBpZiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEJhY2tncm91bmRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgc2V0dXBCYWNrZ3JvdW5kczogLT5cbiAgICAgICAgYmFja2dyb3VuZHMgPSBAb2JqZWN0LnNjZW5lRGF0YT8uYmFja2dyb3VuZHMgPyBbXVxuICAgICAgICBmb3IgYiwgaSBpbiBiYWNrZ3JvdW5kc1xuICAgICAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kQ29udGFpbmVyLnNldE9iamVjdChiLCBpKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBwaWN0dXJlcyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBQaWN0dXJlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIHNldHVwUGljdHVyZXM6IC0+XG4gICAgICAgIHBpY3R1cmVzID0gQG9iamVjdC5zY2VuZURhdGE/LnBpY3R1cmVzID8ge31cbiAgICAgICAgZm9yIGRvbWFpbiBvZiBwaWN0dXJlc1xuICAgICAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiBwaWN0dXJlc1tkb21haW5dIHRoZW4gZm9yIHBpY3R1cmUsIGkgaW4gcGljdHVyZXNbZG9tYWluXVxuICAgICAgICAgICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5zZXRPYmplY3QocGljdHVyZSwgaSlcbiAgICAgICAgICAgICAgICBpZiBwaWN0dXJlPy5pbWFnZVxuICAgICAgICAgICAgICAgICAgICBwYXRoID0gXCJHcmFwaGljcy9QaWN0dXJlcy8je3BpY3R1cmUuaW1hZ2V9XCJcbiAgICAgICAgICAgICAgICAgICAgQHJlc291cmNlQ29udGV4dC5hZGQocGF0aCwgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0J5UGF0aFtwYXRoXSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0ZXh0cyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBUZXh0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIHNldHVwVGV4dHM6IC0+XG4gICAgICAgIHRleHRzID0gQG9iamVjdC5zY2VuZURhdGE/LnRleHRzID8ge31cbiAgICAgICAgZm9yIGRvbWFpbiBvZiB0ZXh0c1xuICAgICAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiB0ZXh0c1tkb21haW5dIHRoZW4gZm9yIHRleHQsIGkgaW4gdGV4dHNbZG9tYWluXVxuICAgICAgICAgICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5zZXRPYmplY3QodGV4dCwgaSlcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdmlkZW9zIGFuZCByZXN0b3JlcyB0aGVtIGZyb20gbG9hZGVkIHNhdmUgZ2FtZSBpZiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFZpZGVvc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBzZXR1cFZpZGVvczogLT5cbiAgICAgICAgdmlkZW9zID0gQG9iamVjdC5zY2VuZURhdGE/LnZpZGVvcyA/IHt9XG4gICAgICAgIGZvciBkb21haW4gb2YgdmlkZW9zXG4gICAgICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiB2aWRlb3NbZG9tYWluXSB0aGVuIGZvciB2aWRlbywgaSBpbiB2aWRlb3NbZG9tYWluXVxuICAgICAgICAgICAgICAgIGlmIHZpZGVvXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBcIk1vdmllcy8je3ZpZGVvLnZpZGVvfVwiXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZUNvbnRleHQuYWRkKHBhdGgsIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNCeVBhdGhbcGF0aF0pXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnZpc2libGUgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8udXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQG9iamVjdC52aWRlb0NvbnRhaW5lci5zZXRPYmplY3QodmlkZW8sIGkpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgaG90c3BvdHMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwSG90c3BvdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIHNldHVwSG90c3BvdHM6IC0+XG4gICAgICAgIGhvdHNwb3RzID0gQG9iamVjdC5zY2VuZURhdGE/LmhvdHNwb3RzID8ge31cbiAgICAgICAgZm9yIGRvbWFpbiBvZiBob3RzcG90c1xuICAgICAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiBob3RzcG90c1tkb21haW5dIHRoZW4gZm9yIGhvdHNwb3QsIGkgaW4gaG90c3BvdHNbZG9tYWluXVxuICAgICAgICAgICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5zZXRPYmplY3QoaG90c3BvdCwgaSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBsYXlvdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cExheW91dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICBcbiAgICBzZXR1cExheW91dDogLT5cbiAgICAgICAgQGRhdGFGaWVsZHMgPSB1aS5VSU1hbmFnZXIuZGF0YVNvdXJjZXNbdWkuVWlGYWN0b3J5LmxheW91dHMuZ2FtZUxheW91dC5kYXRhU291cmNlIHx8IFwiZGVmYXVsdFwiXSgpXG4gICAgICAgIEBkYXRhRmllbGRzLnNjZW5lID0gQG9iamVjdFxuICAgICAgICB3aW5kb3cuJGRhdGFGaWVsZHMgPSBAZGF0YUZpZWxkc1xuICAgICAgICBhZHZWaXNpYmxlID0gQG9iamVjdC5tZXNzYWdlTW9kZSA9PSB2bi5NZXNzYWdlTW9kZS5BRFZcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QubGF5b3V0ID0gdWkuVWlGYWN0b3J5LmNyZWF0ZUZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5sYXlvdXRzLmdhbWVMYXlvdXQsIEBvYmplY3QpXG4gICAgICAgIEBvYmplY3QubGF5b3V0LnZpc2libGUgPSBhZHZWaXNpYmxlXG4gICAgICAgICRnYW1lTWVzc2FnZV9tZXNzYWdlLnZpc2libGUgPSBhZHZWaXNpYmxlXG4gICAgICAgIEBvYmplY3QubGF5b3V0LnVpLnByZXBhcmUoKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5jaG9pY2VzID0gQG9iamVjdC5zY2VuZURhdGE/LmNob2ljZXMgfHwgQG9iamVjdC5jaG9pY2VzXG4gICAgICAgIGlmIEBvYmplY3QuY2hvaWNlcz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgQHNob3dDaG9pY2VzKGdzLkNhbGxCYWNrKFwib25DaG9pY2VBY2NlcHRcIiwgQG9iamVjdC5pbnRlcnByZXRlciwgeyBwb2ludGVyOiBAb2JqZWN0LmludGVycHJldGVyLnBvaW50ZXIsIHBhcmFtczogQHBhcmFtcyB9KSlcbiAgICBcbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0aW5nRm9yLmlucHV0TnVtYmVyXG4gICAgICAgICAgICBAc2hvd0lucHV0TnVtYmVyKEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuZGlnaXRzLCBncy5DYWxsQmFjayhcIm9uSW5wdXROdW1iZXJGaW5pc2hcIiwgQG9iamVjdC5pbnRlcnByZXRlciwgQG9iamVjdC5pbnRlcnByZXRlcikpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0aW5nRm9yLmlucHV0VGV4dFxuICAgICAgICAgICAgQHNob3dJbnB1dFRleHQoR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5sZXR0ZXJzLCBncy5DYWxsQmFjayhcIm9uSW5wdXRUZXh0RmluaXNoXCIsIEBvYmplY3QuaW50ZXJwcmV0ZXIsIEBvYmplY3QuaW50ZXJwcmV0ZXIpKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSBtYWluIHZpZXdwb3J0IC8gc2NyZWVuIHZpZXdwb3J0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBNYWluVmlld3BvcnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2V0dXBNYWluVmlld3BvcnQ6IC0+XG4gICAgICAgIGlmICFAb2JqZWN0LnNjZW5lRGF0YS52aWV3cG9ydFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5yZW1vdmVDb21wb25lbnQoR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC52aXN1YWwpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LmRpc3Bvc2UoKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydCA9IG5ldyBncy5PYmplY3RfVmlld3BvcnQoR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC52aXN1YWwudmlld3BvcnQpXG4gICAgICAgICAgICBAdmlld3BvcnQgPSBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LnZpc3VhbC52aWV3cG9ydFxuICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydCA9IEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5kaXNwb3NlKClcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQgPSBAb2JqZWN0LnNjZW5lRGF0YS52aWV3cG9ydFxuICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydCA9IEBvYmplY3Quc2NlbmVEYXRhLnZpZXdwb3J0XG4gICAgICAgICAgICBAdmlld3BvcnQgPSBAb2JqZWN0LnZpZXdwb3J0LnZpc3VhbC52aWV3cG9ydFxuICAgICAgICAgICAgQHZpZXdwb3J0LnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2V0dXBTY3JlZW46IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLnNjcmVlblxuICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydC5yZXN0b3JlKEBvYmplY3Quc2NlbmVEYXRhLnNjcmVlbilcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIG1haW4gaW50ZXJwcmV0ZXIgZnJvbSBsb2FkZWQgc2F2ZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZUludGVycHJldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgcmVzdG9yZUludGVycHJldGVyOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnNjZW5lRGF0YS5pbnRlcnByZXRlclxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5yZXN0b3JlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyBtZXNzYWdlIGJveCBmcm9tIGxvYWRlZCBzYXZlIGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlTWVzc2FnZUJveFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgcmVzdG9yZU1lc3NhZ2VCb3g6IC0+XG4gICAgICAgIG1lc3NhZ2VCb3hlcyA9IEBvYmplY3Quc2NlbmVEYXRhPy5tZXNzYWdlQm94ZXNcbiAgICAgICAgaWYgbWVzc2FnZUJveGVzXG4gICAgICAgICAgICBmb3IgbWVzc2FnZUJveCBpbiBtZXNzYWdlQm94ZXNcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQobWVzc2FnZUJveC5pZClcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnZpc2libGUgPSBtZXNzYWdlQm94LnZpc2libGVcbiAgICAgICAgICAgICAgICBpZiBtZXNzYWdlQm94Lm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUJveC5tZXNzYWdlLnRleHRSZW5kZXJlci5kaXNwb3NlRXZlbnRIYW5kbGVycygpXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChtZXNzYWdlQm94Lm1lc3NhZ2UuaWQpXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UudGV4dFJlbmRlcmVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0Lm1peGluKG1lc3NhZ2UsIG1lc3NhZ2VCb3gubWVzc2FnZSwgdWkuT2JqZWN0X01lc3NhZ2Uub2JqZWN0Q29kZWNCbGFja0xpc3QuY29uY2F0KFtcIm9yaWdpblwiXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGMgaW4gbWVzc2FnZS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjLm9iamVjdCA9IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS50ZXh0UmVuZGVyZXIuc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIG1lc3NhZ2UgZnJvbSBsb2FkZWQgc2F2ZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZU1lc3NhZ2VzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgICBcbiAgICByZXN0b3JlTWVzc2FnZXM6IC0+XG4gICAgICAgICNtZXNzYWdlT2JqZWN0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIFxuICAgICAjICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VcbiAgICAgIyAgICAgICBtZXNzYWdlT2JqZWN0LnJlc3RvcmUoQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZSlcbiAgICAgICAgICAgIFxuICAgICAjICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VzXG4gICAgICMgICAgICAgbWVzc2FnZU9iamVjdC5tZXNzYWdlLnJlc3RvcmVNZXNzYWdlcyhAb2JqZWN0LnNjZW5lRGF0YS5tZXNzYWdlcylcbiAgICAgIyAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5yZXN0b3JlKEBvYmplY3Quc2NlbmVEYXRhLm1lc3NhZ2VUZXh0UmVuZGVyZXIpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VBcmVhc1xuICAgICAgICAgICAgZm9yIGRvbWFpbiBvZiBAb2JqZWN0LnNjZW5lRGF0YS5tZXNzYWdlQXJlYXNcbiAgICAgICAgICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICAgICAgbWVzc2FnZUFyZWFzID0gQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZUFyZWFzXG4gICAgICAgICAgICAgICAgaWYgbWVzc2FnZUFyZWFzW2RvbWFpbl0gdGhlbiBmb3IgYXJlYSwgaSBpbiBtZXNzYWdlQXJlYXNbZG9tYWluXVxuICAgICAgICAgICAgICAgICAgICBpZiBhcmVhXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQXJlYSA9IG5ldyBncy5PYmplY3RfTWVzc2FnZUFyZWEoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dCA9IHVpLlVJTWFuYWdlci5jcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodHlwZTogXCJ1aS5DdXN0b21HYW1lTWVzc2FnZVwiLCBpZDogXCJjdXN0b21HYW1lTWVzc2FnZV9cIitpLCBwYXJhbXM6IHsgaWQ6IFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIraSB9LCBtZXNzYWdlQXJlYSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImN1c3RvbUdhbWVNZXNzYWdlX1wiK2krXCJfbWVzc2FnZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0Lm1peGluKG1lc3NhZ2UsIGFyZWEubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBjIGluIG1lc3NhZ2UuY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMub2JqZWN0ID0gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UucmVzdG9yZShmLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC54ID0gYXJlYS5sYXlvdXQuZHN0UmVjdC54XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QueSA9IGFyZWEubGF5b3V0LmRzdFJlY3QueVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LndpZHRoID0gYXJlYS5sYXlvdXQuZHN0UmVjdC53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LmhlaWdodCA9IGFyZWEubGF5b3V0LmRzdFJlY3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAjbWVzc2FnZS5tZXNzYWdlLnJlc3RvcmVNZXNzYWdlcyhmLm1lc3NhZ2VzKVxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UudGV4dFJlbmRlcmVyLnJlc3RvcmUoZi50ZXh0UmVuZGVyZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAjbWVzc2FnZS52aXNpYmxlID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQXJlYS5tZXNzYWdlID0gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0ID0gbWVzc2FnZUxheW91dFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUFyZWEuYWRkT2JqZWN0KG1lc3NhZ2VMYXlvdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLnNldE9iamVjdChtZXNzYWdlQXJlYSwgaSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgIFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIGF1ZGlvLXBsYXliYWNrIGZyb20gbG9hZGVkIHNhdmUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVBdWRpb1BsYXliYWNrXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgXG4gICAgcmVzdG9yZUF1ZGlvUGxheWJhY2s6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzLnB1c2goYikgZm9yIGIgaW4gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uYXVkaW9CdWZmZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzQnlMYXllciA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvQnVmZmVyc0J5TGF5ZXJcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5hdWRpb0xheWVycyA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvTGF5ZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc291bmRSZWZlcmVuY2VzID0gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uc291bmRSZWZlcmVuY2VzXG4gICAgICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIHNjZW5lIG9iamVjdHMgZnJvbSB0aGUgY3VycmVudCBsb2FkZWQgc2F2ZS1nYW1lLiBJZiBubyBzYXZlLWdhbWUgaXNcbiAgICAqIHByZXNlbnQgaW4gR2FtZU1hbmFnZXIubG9hZGVkU2F2ZUdhbWUsIG5vdGhpbmcgd2lsbCBoYXBwZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICByZXN0b3JlU2NlbmU6IC0+XG4gICAgICAgIHNhdmVHYW1lID0gR2FtZU1hbmFnZXIubG9hZGVkU2F2ZUdhbWVcbiAgICAgICAgaWYgc2F2ZUdhbWVcbiAgICAgICAgICAgIGNvbnRleHQgPSBuZXcgZ3MuT2JqZWN0Q29kZWNDb250ZXh0KFtHcmFwaGljcy52aWV3cG9ydCwgQG9iamVjdCwgdGhpc10sIHNhdmVHYW1lLmVuY29kZWRPYmplY3RTdG9yZSwgbnVsbClcbiAgICAgICAgICAgIHNhdmVHYW1lLmRhdGEgPSBncy5PYmplY3RDb2RlYy5kZWNvZGUoc2F2ZUdhbWUuZGF0YSwgY29udGV4dClcbiAgICAgICAgICAgIGZvciBjIGluIHNhdmVHYW1lLmRhdGEuY2hhcmFjdGVyTmFtZXNcbiAgICAgICAgICAgICAgICBpZiBjIHRoZW4gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2MuaW5kZXhdPy5uYW1lID0gYy5uYW1lXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5yZXN0b3JlKHNhdmVHYW1lKVxuICAgICAgICAgICAgZ3MuT2JqZWN0Q29kZWMub25SZXN0b3JlKHNhdmVHYW1lLmRhdGEsIGNvbnRleHQpXG4gICAgICAgICAgICBAcmVzb3VyY2VDb250ZXh0LmZyb21EYXRhQnVuZGxlKHNhdmVHYW1lLmRhdGEucmVzb3VyY2VDb250ZXh0LCBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzQnlQYXRoKVxuXG4gICAgICAgICAgICBAb2JqZWN0LnNjZW5lRGF0YSA9IHNhdmVHYW1lLmRhdGFcbiAgICAgICAgICAgIEdyYXBoaWNzLmZyYW1lQ291bnQgPSBzYXZlR2FtZS5kYXRhLmZyYW1lQ291bnRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIGRhdGEgZm9yIHRoZSBzY2VuZSBhbmQgbG9hZHMgdGhlIG5lY2Vzc2FyeSBncmFwaGljIGFuZCBhdWRpbyByZXNvdXJjZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlRGF0YVxuICAgICogQGFic3RyYWN0XG4gICAgIyMjXG4gICAgcHJlcGFyZURhdGE6IC0+XG4gICAgICAgICNSZWNvcmRNYW5hZ2VyLnRyYW5zbGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci5zY2VuZSA9IEBvYmplY3RcblxuICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQgPSBAb2JqZWN0TWFuYWdlclxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5zY2VuZURhdGEudWlkID0gQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZFxuICAgICAgICBcbiAgICAgICAgaWYgIVJlc291cmNlTG9hZGVyLmxvYWRFdmVudENvbW1hbmRzRGF0YShAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMpXG4gICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcylcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cgPSBAb2JqZWN0LnNjZW5lRGF0YS5iYWNrbG9nIHx8IEdhbWVNYW5hZ2VyLnNjZW5lRGF0YS5iYWNrbG9nIHx8IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRTeXN0ZW1Tb3VuZHMoKVxuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFN5c3RlbUdyYXBoaWNzKClcbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaVR5cGVzR3JhcGhpY3ModWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzKVxuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpTGF5b3V0R3JhcGhpY3ModWkuVWlGYWN0b3J5LmxheW91dHMuZ2FtZUxheW91dClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGRhdGFGaWVsZHM/XG4gICAgICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpRGF0YUZpZWxkc0dyYXBoaWNzKEBkYXRhRmllbGRzKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHRlbXBGaWVsZHMuY2hvaWNlVGltZXIgPSBAb2JqZWN0LmNob2ljZVRpbWVyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXAoeyBpZDogQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZH0pXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgdmlzdWFsIGdhbWUgb2JqZWN0IGZvciB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlVmlzdWFsXG4gICAgIyMjIFxuICAgIHByZXBhcmVWaXN1YWw6IC0+XG4gICAgICAgIGlmIEBvYmplY3QubGF5b3V0IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmlzRXhpdGluZ0dhbWVcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuaXNFeGl0aW5nR2FtZSA9IG5vXG4gICAgICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdFJlc2V0U2NlbmVDaGFuZ2UoQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLm5hbWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0U2NlbmVDaGFuZ2UoQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLm5hbWUpXG4gICAgICAgIFxuICAgICAgICBAcmVzdG9yZVNjZW5lKClcbiAgICAgICAgQG9iamVjdC5tZXNzYWdlTW9kZSA9IEBvYmplY3Quc2NlbmVEYXRhLm1lc3NhZ2VNb2RlID8gdm4uTWVzc2FnZU1vZGUuQURWXG4gICAgICAgIEBzZXR1cE1haW5WaWV3cG9ydCgpXG4gICAgICAgIEBzZXR1cFZpZXdwb3J0cygpXG4gICAgICAgIEBzZXR1cENoYXJhY3RlcnMoKVxuICAgICAgICBAc2V0dXBCYWNrZ3JvdW5kcygpXG4gICAgICAgIEBzZXR1cFBpY3R1cmVzKClcbiAgICAgICAgQHNldHVwVGV4dHMoKVxuICAgICAgICBAc2V0dXBWaWRlb3MoKVxuICAgICAgICBAc2V0dXBIb3RzcG90cygpXG4gICAgICAgIEBzZXR1cEludGVycHJldGVyKClcbiAgICAgICAgQHNldHVwTGF5b3V0KClcbiAgICAgICAgQHNldHVwQ29tbW9uRXZlbnRzKClcbiAgICAgICAgXG4gICAgICAgIEByZXN0b3JlTWVzc2FnZUJveCgpXG4gICAgICAgIEByZXN0b3JlSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAcmVzdG9yZU1lc3NhZ2VzKClcbiAgICAgICAgQHJlc3RvcmVBdWRpb1BsYXliYWNrKClcbiAgICAgICAgXG4gICAgICAgIEBzaG93KHRydWUpXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LnNjZW5lRGF0YSA9IHt9XG4gICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lRGF0YSA9IHt9XG4gICAgICAgIFxuICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICBAdHJhbnNpdGlvbih7IGR1cmF0aW9uOiAwIH0pXG4gICAgICAgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGEgbmV3IGNoYXJhY3RlciB0byB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRDaGFyYWN0ZXJcbiAgICAqIEBwYXJhbSB7dm4uT2JqZWN0X0NoYXJhY3Rlcn0gY2hhcmFjdGVyIC0gVGhlIGNoYXJhY3RlciB0byBhZGQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IG5vQW5pbWF0aW9uIC0gSW5kaWNhdGVzIGlmIHRoZSBjaGFyYWN0ZXIgc2hvdWxkIGJlIGFkZGVkIGltbWVkaWF0ZWx5IHdpdG91dCBhbnkgYXBwZWFyLWFuaW1hdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhbmltYXRpb25EYXRhIC0gQ29udGFpbnMgdGhlIGFwcGVhci1hbmltYXRpb24gZGF0YSAtPiB7IGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiB9LlxuICAgICMjIyBcbiAgICBhZGRDaGFyYWN0ZXI6IChjaGFyYWN0ZXIsIG5vQW5pbWF0aW9uLCBhbmltYXRpb25EYXRhKSAtPlxuICAgICAgICB1bmxlc3Mgbm9BbmltYXRpb25cbiAgICAgICAgICAgIGNoYXJhY3Rlci5tb3Rpb25CbHVyLnNldChhbmltYXRpb25EYXRhLm1vdGlvbkJsdXIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGFuaW1hdGlvbkRhdGEuZHVyYXRpb24gPiAwXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyLmFuaW1hdG9yLmFwcGVhcihjaGFyYWN0ZXIuZHN0UmVjdC54LCBjaGFyYWN0ZXIuZHN0UmVjdC55LCBhbmltYXRpb25EYXRhLmFuaW1hdGlvbiwgYW5pbWF0aW9uRGF0YS5lYXNpbmcsIGFuaW1hdGlvbkRhdGEuZHVyYXRpb24pIHVubGVzcyBub0FuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyLnZpZXdwb3J0ID0gQHZpZXdwb3J0XG4gICAgICAgIGNoYXJhY3Rlci52aXNpYmxlID0geWVzIFxuICAgIFxuICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5hZGRPYmplY3QoY2hhcmFjdGVyKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZW1vdmVzIGEgY2hhcmFjdGVyIGZyb20gdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlQ2hhcmFjdGVyXG4gICAgKiBAcGFyYW0ge3ZuLk9iamVjdF9DaGFyYWN0ZXJ9IGNoYXJhY3RlciAtIFRoZSBjaGFyYWN0ZXIgdG8gcmVtb3ZlLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbkRhdGEgLSBDb250YWlucyB0aGUgZGlzYXBwZWFyLWFuaW1hdGlvbiBkYXRhIC0+IHsgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uIH0uXG4gICAgIyMjXG4gICAgcmVtb3ZlQ2hhcmFjdGVyOiAoY2hhcmFjdGVyLCBhbmltYXRpb25EYXRhKSAtPlxuICAgICAgICBjaGFyYWN0ZXI/LmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb25EYXRhLmFuaW1hdGlvbiwgYW5pbWF0aW9uRGF0YS5lYXNpbmcsIGFuaW1hdGlvbkRhdGEuZHVyYXRpb24sIChzZW5kZXIpIC0+IHNlbmRlci5kaXNwb3NlKCkpXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVzdW1lcyB0aGUgY3VycmVudCBzY2VuZSBpZiBpdCBoYXMgYmVlbiBwYXVzZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN1bWVTY2VuZVxuICAgICMjI1xuICAgIHJlc3VtZVNjZW5lOiAtPlxuICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIEBvYmplY3QuY2hhcmFjdGVyQ29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRDb250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5hY3RpdmUgPSB5ZXNcbiAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgbWVzc2FnZSA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuICAgICAgICBtZXNzYWdlLmFjdGl2ZSA9IHllc1xuIFxuICAgICMjIypcbiAgICAqIFBhdXNlcyB0aGUgY3VycmVudCBzY2VuZS4gQSBwYXVzZWQgc2NlbmUgd2lsbCBub3QgY29udGludWUsIG1lc3NhZ2VzLCBwaWN0dXJlcywgZXRjLiB3aWxsXG4gICAgKiBzdG9wIHVudGlsIHRoZSBzY2VuZSByZXN1bWVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGF1c2VTY2VuZVxuICAgICMjI1xuICAgIHBhdXNlU2NlbmU6IC0+XG4gICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5hY3RpdmUgPSBub1xuICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5hY3RpdmUgPSBub1xuICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRDb250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5hY3RpdmUgPSBub1xuICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIFxuICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIG1lc3NhZ2UuYWN0aXZlID0gbm9cbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZW50aXJlIGdhbWUgVUkgbGlrZSB0aGUgbWVzc2FnZSBib3hlcywgZXRjLiB0byBhbGxvd3NcbiAgICAqIHRoZSBwbGF5ZXIgdG8gc2VlIHRoZSBlbnRpcmUgc2NlbmUuIFVzZWZ1bCBmb3IgQ0dzLCBldGMuXG4gICAgKlxuICAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlIC0gSWYgPGI+dHJ1ZTwvYj4sIHRoZSBnYW1lIFVJIHdpbGwgYmUgdmlzaWJsZS4gT3RoZXJ3aXNlIGl0IHdpbGwgYmUgaGlkZGVuLlxuICAgICogQG1ldGhvZCBjaGFuZ2VVSVZpc2liaWxpdHlcbiAgICAjIyMgICBcbiAgICBjaGFuZ2VVSVZpc2liaWxpdHk6ICh2aXNpYmxlKSAtPlxuICAgICAgICBAdWlWaXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmxheW91dC52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTaG93cyBpbnB1dC10ZXh0IGJveCB0byBsZXQgdGhlIHVzZXIgZW50ZXIgYSB0ZXh0LlxuICAgICpcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZXR0ZXJzIC0gVGhlIG1heC4gbnVtYmVyIG9mIGxldHRlcnMgdGhlIHVzZXIgY2FuIGVudGVyLlxuICAgICogQHBhcmFtIHtncy5DYWxsYmFja30gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBpZiB0aGUgaW5wdXQtdGV4dCBib3ggaGFzIGJlZW4gYWNjZXB0ZWQgYnkgdGhlIHVzZXIuXG4gICAgKiBAbWV0aG9kIHNob3dJbnB1dFRleHRcbiAgICAjIyNcbiAgICBzaG93SW5wdXRUZXh0OiAobGV0dGVycywgY2FsbGJhY2spIC0+XG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94Py5kaXNwb3NlKClcbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3ggPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLklucHV0VGV4dEJveFwiXSwgQG9iamVjdC5sYXlvdXQpXG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94LnVpLnByZXBhcmUoKVxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveC5ldmVudHMub24oXCJhY2NlcHRcIiwgY2FsbGJhY2spXG4gICAgICAgXG4gICAgIyMjKlxuICAgICogU2hvd3MgaW5wdXQtbnVtYmVyIGJveCB0byBsZXQgdGhlIHVzZXIgZW50ZXIgYSBudW1iZXIuXG4gICAgKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGRpZ2l0cyAtIFRoZSBtYXguIG51bWJlciBvZiBkaWdpdHMgdGhlIHVzZXIgY2FuIGVudGVyLlxuICAgICogQHBhcmFtIHtncy5DYWxsYmFja30gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBpZiB0aGUgaW5wdXQtbnVtYmVyIGJveCBoYXMgYmVlbiBhY2NlcHRlZCBieSB0aGUgdXNlci5cbiAgICAqIEBtZXRob2Qgc2hvd0lucHV0TnVtYmVyXG4gICAgIyMjIFxuICAgIHNob3dJbnB1dE51bWJlcjogKGRpZ2l0cywgY2FsbGJhY2spIC0+XG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3g/LmRpc3Bvc2UoKVxuICAgICAgICBAb2JqZWN0LmlucHV0TnVtYmVyQm94ID0gdWkuVWlGYWN0b3J5LmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbXCJ1aS5JbnB1dE51bWJlckJveFwiXSwgQG9iamVjdC5sYXlvdXQpXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3gudWkucHJlcGFyZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3guZXZlbnRzLm9uKFwiYWNjZXB0XCIsIGNhbGxiYWNrKSAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTaG93cyBjaG9pY2VzIHRvIGxldCB0aGUgdXNlciBwaWNrIGEgY2hvaWNlLlxuICAgICpcbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNob2ljZXMgLSBBbiBhcnJheSBvZiBjaG9pY2VzXG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGlmIGEgY2hvaWNlIGhhcyBiZWVuIHBpY2tlZCBieSB0aGUgdXNlci5cbiAgICAqIEBtZXRob2Qgc2hvd0Nob2ljZXNcbiAgICAjIyMgICAgIFxuICAgIHNob3dDaG9pY2VzOiAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVzZUZyZWVMYXlvdXQgPSBAb2JqZWN0LmNob2ljZXMud2hlcmUoKHgpIC0+IHguZHN0UmVjdD8pLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3c/LmRpc3Bvc2UoKVxuICAgICAgICBcbiAgICAgICAgaWYgdXNlRnJlZUxheW91dFxuICAgICAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cgPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLkZyZWVDaG9pY2VCb3hcIl0sIEBvYmplY3QubGF5b3V0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmNob2ljZVdpbmRvdyA9IHVpLlVpRmFjdG9yeS5jcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzW1widWkuQ2hvaWNlQm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuY2hvaWNlV2luZG93LmV2ZW50cy5vbihcInNlbGVjdGlvbkFjY2VwdFwiLCBjYWxsYmFjaylcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cudWkucHJlcGFyZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGJhY2tncm91bmQgb2YgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlQmFja2dyb3VuZFxuICAgICogQHBhcmFtIHtPYmplY3R9IGJhY2tncm91bmQgLSBUaGUgYmFja2dyb3VuZCBncmFwaGljIG9iamVjdCAtPiB7IG5hbWUgfVxuICAgICogQHBhcmFtIHtib29sZWFufSBub0FuaW1hdGlvbiAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgY2hhbmdlZCBpbW1lZGlhdGVseSB3aXRvdXQgYW55IGNoYW5nZS1hbmltYXRpb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uIC0gVGhlIGFwcGVhci9kaXNhcHBlYXIgYW5pbWF0aW9uIHRvIHVzZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmcgLSBUaGUgZWFzaW5nIG9mIHRoZSBjaGFuZ2UgYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9mIHRoZSBjaGFuZ2UgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG94IC0gVGhlIHgtb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG95IC0gVGhlIHktb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGJhY2tncm91bmQtbGF5ZXIgdG8gY2hhbmdlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBsb29wSG9yaXpvbnRhbCAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgbG9vcGVkIGhvcml6b250YWxseS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9vcFZlcnRpY2FsIC0gSW5kaWNhdGVzIGlmIHRoZSBiYWNrZ3JvdW5kIHNob3VsZCBiZSBsb29wZWQgdmVydGljYWxseS5cbiAgICAjIyMgICBcbiAgICBjaGFuZ2VCYWNrZ3JvdW5kOiAoYmFja2dyb3VuZCwgbm9BbmltYXRpb24sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgb3gsIG95LCBsYXllciwgbG9vcEhvcml6b250YWwsIGxvb3BWZXJ0aWNhbCkgLT5cbiAgICAgICAgaWYgYmFja2dyb3VuZD9cbiAgICAgICAgICAgIG90aGVyT2JqZWN0ID0gQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgICAgIG9iamVjdCA9IG5ldyB2bi5PYmplY3RfQmFja2dyb3VuZCgpXG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBiYWNrZ3JvdW5kLm5hbWVcbiAgICAgICAgICAgIG9iamVjdC5vcmlnaW4ueCA9IG94XG4gICAgICAgICAgICBvYmplY3Qub3JpZ2luLnkgPSBveVxuICAgICAgICAgICAgb2JqZWN0LnZpZXdwb3J0ID0gQHZpZXdwb3J0XG4gICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBub1xuICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBub1xuICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5zZXRPYmplY3Qob2JqZWN0LCBsYXllcilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPyAzMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvdGhlck9iamVjdD8uekluZGV4ID0gbGF5ZXJcbiAgICAgICAgICAgIG90aGVyT2JqZWN0Py5hbmltYXRvci5vdGhlck9iamVjdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGR1cmF0aW9uID09IDBcbiAgICAgICAgICAgICAgICBvdGhlck9iamVjdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLnZlcnRpY2FsID0gbG9vcFZlcnRpY2FsXG4gICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBsb29wSG9yaXpvbnRhbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IGxvb3BWZXJ0aWNhbFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IGxvb3BIb3Jpem9udGFsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3Iub3RoZXJPYmplY3QgPSBvdGhlck9iamVjdFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3IuYXBwZWFyKDAsIDAsIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgKHNlbmRlcikgPT4gXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIudXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci5hbmltYXRvci5vdGhlck9iamVjdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIuYW5pbWF0b3Iub3RoZXJPYmplY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBsb29wVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0gbG9vcEhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRzW2xheWVyXT8uYW5pbWF0b3IuaGlkZSBkdXJhdGlvbiwgZWFzaW5nLCAgPT5cbiAgICAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZHNbbGF5ZXJdLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl0gPSBudWxsXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIHZpZXdwb3J0IGFuaW1hdGlvbnMgZXhjZXB0IHRoZSBtYWluIHZpZXdwb3J0IGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBWaWV3cG9ydHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2tpcFZpZXdwb3J0czogLT5cbiAgICAgICAgdmlld3BvcnRzID0gQG9iamVjdC52aWV3cG9ydENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIGZvciB2aWV3cG9ydCBpbiB2aWV3cG9ydHNcbiAgICAgICAgICAgIGlmIHZpZXdwb3J0XG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiB2aWV3cG9ydC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIHBpY3R1cmUgYW5pbWF0aW9ucy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBQaWN0dXJlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgc2tpcFBpY3R1cmVzOiAtPlxuICAgICAgICBmb3IgcGljdHVyZSBpbiBAb2JqZWN0LnBpY3R1cmVzXG4gICAgICAgICAgICBpZiBwaWN0dXJlXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBwaWN0dXJlLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIHRleHQgYW5pbWF0aW9ucy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBUZXh0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwVGV4dHM6IC0+XG4gICAgICAgZm9yIHRleHQgaW4gQG9iamVjdC50ZXh0c1xuICAgICAgICAgICAgaWYgdGV4dFxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gdGV4dC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCB2aWRlbyBhbmltYXRpb25zIGJ1dCBub3QgdGhlIHZpZGVvLXBsYXliYWNrIGl0c2VsZi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBWaWRlb3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2tpcFZpZGVvczogLT5cbiAgICAgICAgZm9yIHZpZGVvIGluIEBvYmplY3QudmlkZW9zXG4gICAgICAgICAgICBpZiB2aWRlb1xuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gdmlkZW8uY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuc2tpcD8oKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgYmFja2dyb3VuZCBhbmltYXRpb25zLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcEJhY2tncm91bmRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNraXBCYWNrZ3JvdW5kczogLT5cbiAgICAgICAgZm9yIGJhY2tncm91bmQgaW4gQG9iamVjdC5iYWNrZ3JvdW5kc1xuICAgICAgICAgICAgaWYgYmFja2dyb3VuZFxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gYmFja2dyb3VuZC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCBjaGFyYWN0ZXIgYW5pbWF0aW9uc1xuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcENoYXJhY3RlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2tpcENoYXJhY3RlcnM6IC0+XG4gICAgICAgIGZvciBjaGFyYWN0ZXIgaW4gQG9iamVjdC5jaGFyYWN0ZXJzXG4gICAgICAgICAgICBpZiBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIGNoYXJhY3Rlci5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBtYWluIHZpZXdwb3J0IGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBNYWluVmlld3BvcnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgc2tpcE1haW5WaWV3cG9ydDogLT5cbiAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBAb2JqZWN0LnZpZXdwb3J0LmNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCBhbmltYXRpb25zIG9mIGFsbCBtZXNzYWdlIGJveGVzIGRlZmluZWQgaW4gTUVTU0FHRV9CT1hfSURTIHVpIGNvbnN0YW50LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcE1lc3NhZ2VCb3hlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwTWVzc2FnZUJveGVzOiAtPlxuICAgICAgICBmb3IgbWVzc2FnZUJveElkIGluIGdzLlVJQ29uc3RhbnRzLk1FU1NBR0VfQk9YX0lEUyB8fCBbXCJtZXNzYWdlQm94XCIsIFwibnZsTWVzc2FnZUJveFwiXVxuICAgICAgICAgICAgbWVzc2FnZUJveCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKG1lc3NhZ2VCb3hJZClcbiAgICAgICAgICAgIGlmIG1lc3NhZ2VCb3guY29tcG9uZW50c1xuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gbWVzc2FnZUJveC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgYW5pbWF0aW9ucyBvZiBhbGwgbWVzc2FnZSBhcmVhcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBNZXNzYWdlQXJlYXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgc2tpcE1lc3NhZ2VBcmVhczogLT5cbiAgICAgICAgZm9yIG1lc3NhZ2VBcmVhIGluIEBvYmplY3QubWVzc2FnZUFyZWFzXG4gICAgICAgICAgICBpZiBtZXNzYWdlQXJlYT8ubWVzc2FnZVxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gbWVzc2FnZUFyZWEubWVzc2FnZS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgICAgICAgICBcbiAgICAgICAgbXNnID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpICAgICBcbiAgICAgICAgaWYgbXNnXG4gICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIG1zZy5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgbXNnID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpICAgICBcbiAgICAgICAgaWYgbXNnXG4gICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIG1zZy5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBzY2VuZSBpbnRlcnByZXRlciB0aW1lci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBJbnRlcnByZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwSW50ZXJwcmV0ZXI6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWVcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWVcbiAgICAgICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPT0gMFxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm9cbiAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgaW50ZXJwcmV0ZXIgdGltZXIgb2YgYWxsIGNvbW1vbiBldmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwQ29tbW9uRXZlbnRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBza2lwQ29tbW9uRXZlbnRzOiAtPlxuICAgICAgICBldmVudHMgPSBAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgICAgaWYgZXZlbnQ/LmludGVycHJldGVyIGFuZCBldmVudC5pbnRlcnByZXRlci53YWl0Q291bnRlciA+IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZVxuICAgICAgICAgICAgICAgIGV2ZW50LmludGVycHJldGVyLndhaXRDb3VudGVyID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICAgICAgaWYgZXZlbnQuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPT0gMFxuICAgICAgICAgICAgICAgICAgICBldmVudC5pbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcENvbnRlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgc2tpcENvbnRlbnQ6IC0+XG4gICAgICAgIEBza2lwUGljdHVyZXMoKVxuICAgICAgICBAc2tpcFRleHRzKClcbiAgICAgICAgQHNraXBWaWRlb3MoKVxuICAgICAgICBAc2tpcEJhY2tncm91bmRzKClcbiAgICAgICAgQHNraXBDaGFyYWN0ZXJzKClcbiAgICAgICAgQHNraXBNYWluVmlld3BvcnQoKVxuICAgICAgICBAc2tpcFZpZXdwb3J0cygpXG4gICAgICAgIEBza2lwTWVzc2FnZUJveGVzKClcbiAgICAgICAgQHNraXBNZXNzYWdlQXJlYXMoKVxuICAgICAgICBAc2tpcEludGVycHJldGVyKClcbiAgICAgICAgQHNraXBDb21tb25FdmVudHMoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgdGhlIHNob3J0Y3V0IHRvIGhpZGUvc2hvdyB0aGUgZ2FtZSBVSS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgc3BhY2Uta2V5LiBZb3VcbiAgICAqIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgdGhlIHNob3J0Y3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlVUlWaXNpYmlsaXR5U2hvcnRjdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgdXBkYXRlVUlWaXNpYmlsaXR5U2hvcnRjdXQ6IC0+XG4gICAgICAgIGlmICFAdWlWaXNpYmxlIGFuZCAoSW5wdXQudHJpZ2dlcihJbnB1dC5DKSBvciBJbnB1dC5Nb3VzZS5idXR0b25Eb3duKVxuICAgICAgICAgICAgQGNoYW5nZVVJVmlzaWJpbGl0eSghQHVpVmlzaWJsZSlcbiAgICAgICAgaWYgSW5wdXQudHJpZ2dlcihJbnB1dC5LRVlfU1BBQ0UpXG4gICAgICAgICAgICBAY2hhbmdlVUlWaXNpYmlsaXR5KCFAdWlWaXNpYmxlKVxuICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgdGhlIHNob3J0Y3V0IHRvIGV4aXQgdGhlIGdhbWUuIEJ5IGRlZmF1bHQsIHRoaXMgaXMgdGhlIGVzY2FwZS1rZXkuIFlvdVxuICAgICogY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSB0aGUgc2hvcnRjdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVRdWl0U2hvcnRjdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICB1cGRhdGVRdWl0U2hvcnRjdXQ6IC0+XG4gICAgICAgIGlmIElucHV0LnRyaWdnZXIoSW5wdXQuS0VZX0VTQ0FQRSlcbiAgICAgICAgICAgIGdzLkFwcGxpY2F0aW9uLmV4aXQoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgdGhlIHNob3J0Y3V0IHRvIG9wZW4gdGhlIHNldHRpbmdzIG1lbnUuIEJ5IGRlZmF1bHQsIHRoaXMgaXMgdGhlIHMta2V5LiBZb3VcbiAgICAqIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgdGhlIHNob3J0Y3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU2V0dGluZ3NTaG9ydGN1dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgXG4gICAgdXBkYXRlU2V0dGluZ3NTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lbnVBY2Nlc3MgYW5kIElucHV0LnRyaWdnZXIoSW5wdXQuWClcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcInNldHRpbmdzTWVudUxheW91dFwiKSwgdHJ1ZSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGZvciB0aGUgc2hvcnRjdXQgdG8gb3BlbiB0aGUgc2V0dGluZ3MgbWVudS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgY29udHJvbC1rZXkuIFlvdVxuICAgICogY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSB0aGUgc2hvcnRjdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVTa2lwU2hvcnRjdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICB1cGRhdGVTa2lwU2hvcnRjdXQ6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2V0dGluZ3MuYWxsb3dTa2lwXG4gICAgICAgICAgICBpZiBJbnB1dC5rZXlzW0lucHV0LktFWV9DT05UUk9MXSA9PSAxXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSB5ZXNcbiAgICAgICAgICAgIGVsc2UgaWYgSW5wdXQua2V5c1tJbnB1dC5LRVlfQ09OVFJPTF0gPT0gMlxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gbm9cbiAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgZm9yIGRlZmF1bHQga2V5Ym9hcmQgc2hvcnRjdXRzIGUuZyBzcGFjZS1rZXkgdG8gaGlkZSB0aGUgVUksIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVNob3J0Y3V0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICB1cGRhdGVTaG9ydGN1dHM6IC0+XG4gICAgICAgIEB1cGRhdGVTZXR0aW5nc1Nob3J0Y3V0KClcbiAgICAgICAgQHVwZGF0ZVF1aXRTaG9ydGN1dCgpXG4gICAgICAgIEB1cGRhdGVVSVZpc2liaWxpdHlTaG9ydGN1dCgpXG4gICAgICAgIEB1cGRhdGVTa2lwU2hvcnRjdXQoKVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZnVsbCBzY3JlZW4gdmlkZW8gcGxheWVkIHZpYSBQbGF5IE1vdmllIGNvbW1hbmQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVWaWRlb1xuICAgICMjIyAgXG4gICAgdXBkYXRlVmlkZW86IC0+XG4gICAgICAgIGlmIEBvYmplY3QudmlkZW8/XG4gICAgICAgICAgICBAb2JqZWN0LnZpZGVvLnVwZGF0ZSgpXG4gICAgICAgICAgICBpZiBAb2JqZWN0LnNldHRpbmdzLmFsbG93VmlkZW9Ta2lwIGFuZCAoSW5wdXQudHJpZ2dlcihJbnB1dC5DKSBvciBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdID09IDIpXG4gICAgICAgICAgICAgICAgQG9iamVjdC52aWRlby5zdG9wKClcbiAgICAgICAgICAgIElucHV0LmNsZWFyKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyBza2lwcGluZyBpZiBlbmFibGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU2tpcHBpbmdcbiAgICAjIyMgICAgICAgICBcbiAgICB1cGRhdGVTa2lwcGluZzogLT5cbiAgICAgICAgaWYgIUBvYmplY3Quc2V0dGluZ3MuYWxsb3dTa2lwXG4gICAgICAgICAgICBAb2JqZWN0LnRlbXBTZXR0aW5ncy5za2lwID0gbm9cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgQHNraXBDb250ZW50KClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHNjZW5lJ3MgY29udGVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUNvbnRlbnRcbiAgICAjIyMgICAgICBcbiAgICB1cGRhdGVDb250ZW50OiAtPlxuICAgICAgICAjaWYgIUBvYmplY3QuaW50ZXJwcmV0ZXIuaXNSdW5uaW5nIGFuZCAhR3JhcGhpY3MuZnJvemVuXG4gICAgICAgICMgICAgQHNldHVwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBHYW1lTWFuYWdlci5zY2VuZSA9IEBvYmplY3RcbiAgICAgICAgR3JhcGhpY3Mudmlld3BvcnQudXBkYXRlKClcbiAgICAgICAgQG9iamVjdC52aWV3cG9ydC51cGRhdGUoKVxuICAgIFxuICAgICAgICBAdXBkYXRlU2tpcHBpbmcoKVxuICAgICAgICBAdXBkYXRlVmlkZW8oKVxuICAgICAgICBAdXBkYXRlU2hvcnRjdXRzKClcblxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxudm4uQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yID0gQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yIl19
//# sourceURL=Component_GameSceneBehavior_42.js