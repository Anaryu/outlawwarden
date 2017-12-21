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
      gs.GlobalEventManager.clear();
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
    var advVisible, ref;
    this.dataFields = ui.UIManager.dataSources[ui.UiFactory.layouts.gameLayout.dataSource || "default"]();
    this.dataFields.scene = this.object;
    window.$dataFields = this.dataFields;
    advVisible = this.object.messageMode === vn.MessageMode.ADV;
    this.object.layout = ui.UiFactory.createFromDescriptor(ui.UiFactory.layouts.gameLayout, this.object);
    this.object.layout.visible = advVisible;
    $gameMessage_message.visible = advVisible;
    this.object.layout.ui.prepare();
    if (((ref = $tempFields.choices) != null ? ref.length : void 0) > 0) {
      this.showChoices(GameManager.tempFields.choices, gs.CallBack("onChoiceAccept", this.object.interpreter, {
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
      this.viewport.viewport = Graphics.viewport;
      return this.object.addObject(this.object.viewport);
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
    var c, j, len, message, messageBox, messageBoxes, messageObject, ref, results;
    messageBoxes = (ref = this.object.sceneData) != null ? ref.messageBoxes : void 0;
    if (messageBoxes) {
      results = [];
      for (j = 0, len = messageBoxes.length; j < len; j++) {
        messageBox = messageBoxes[j];
        messageObject = gs.ObjectManager.current.objectById(messageBox.id);
        messageObject.visible = messageBox.visible;
        if (messageBox.message) {
          message = gs.ObjectManager.current.objectById(messageBox.message.id);
          message.textRenderer.dispose();
          Object.mixin(message, messageBox.message, ui.Object_Message.objectCodecBlackList.concat(["origin"]));
          results.push((function() {
            var k, len1, ref1, results1;
            ref1 = message.components;
            results1 = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              c = ref1[k];
              results1.push(c.object = message);
            }
            return results1;
          })());
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
    var c, context, ref, saveGame;
    saveGame = GameManager.loadedSaveGame;
    if (saveGame) {
      context = new gs.ObjectCodecContext([Graphics.viewport, this.object, this], saveGame.encodedObjectStore, null);
      saveGame.data = gs.ObjectCodec.decode(saveGame.data, context);
      if ((function() {
        var j, len, ref, results;
        ref = saveGame.data.characterNames;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          results.push(c);
        }
        return results;
      })()) {
        if ((ref = RecordManager.characters[c.index]) != null) {
          ref.name = c.name;
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

  Component_GameSceneBehavior.prototype.showChoices = function(choices, callback) {
    var ref, useFreeLayout;
    useFreeLayout = choices.where(function(x) {
      return x.dstRect != null;
    }).length > 0;
    GameManager.tempFields.choices = choices;
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
    var object, otherObject, ref;
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
              var ref;
              sender.update();
              if ((ref = sender.animator.otherObject) != null) {
                ref.dispose();
              }
              sender.animator.otherObject = null;
              sender.visual.looping.vertical = loopVertical;
              return sender.visual.looping.horizontal = loopHorizontal;
            };
          })(this));
        }
      }
    } else {
      return (ref = this.object.backgrounds[layer]) != null ? ref.animator.hide(duration, easing, (function(_this) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7O0VBUWEscUNBQUE7SUFDVCwyREFBQTtJQUVBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDdEIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBaEM7ZUFDQSxLQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFwQixDQUFBO01BRnNCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQUcxQixJQUFDLENBQUEsdUJBQUQsR0FBMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQ3ZCLElBQUcsQ0FBQyxLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFuQixDQUE0QixLQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDLENBQUo7VUFDSSxLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxXQUE3QixFQURKOztlQUVBLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQUE7TUFIdUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBSzNCLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxZQUFELEdBQWdCO0VBWlA7OztBQWNiOzs7Ozs7d0NBS0EsVUFBQSxHQUFZLFNBQUE7QUFDUixRQUFBO0lBQUEsSUFBRyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQTVCLEtBQXNDLENBQXpDO01BQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQXRCLENBQUEsRUFESjs7SUFHQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFlLENBQUMsYUFBaEIsQ0FBQTtJQUNuQixlQUFlLENBQUMsT0FBaEIsR0FBMEIsSUFBQyxDQUFB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QXBCLENBQUEsSUFBMEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLENBQXBCLEtBQXlDLENBQXBFLENBQXZDO1FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFBLEVBREo7O2FBRUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxFQUpKOztFQURTOzs7QUFPYjs7Ozs7O3dDQUtBLGNBQUEsR0FBZ0IsU0FBQTtJQUNaLElBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFyQjtNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQXJCLEdBQTRCLE1BRGhDOztJQUdBLElBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUE1QjthQUNJLElBQUMsQ0FBQSxXQUFELENBQUEsRUFESjs7RUFKWTs7O0FBT2hCOzs7Ozs7d0NBS0EsYUFBQSxHQUFlLFNBQUE7SUFDWCxXQUFXLENBQUMsS0FBWixHQUFvQixJQUFDLENBQUE7SUFDckIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBakIsQ0FBQTtJQUVBLElBQUMsQ0FBQSxjQUFELENBQUE7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQTtXQUVBLDZEQUFBO0VBVFc7Ozs7R0E3OEJ1QixFQUFFLENBQUM7O0FBdzlCN0MsRUFBRSxDQUFDLDJCQUFILEdBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfR2FtZVNjZW5lQmVoYXZpb3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9HYW1lU2NlbmVCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yXG4gIyAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9iamVjdE1hbmFnZXJcIl1cbiAgICAjIyMqXG4gICAgKiBEZWZpbmVzIHRoZSBiZWhhdmlvciBvZiB2aXN1YWwgbm92ZWwgZ2FtZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIHZuXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvclxuICAgICogQG1lbWJlcm9mIHZuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBvbkF1dG9Db21tb25FdmVudFN0YXJ0ID0gPT5cbiAgICAgICAgICAgIEBvYmplY3QucmVtb3ZlQ29tcG9uZW50KEBvYmplY3QuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnN0b3AoKVxuICAgICAgICBAb25BdXRvQ29tbW9uRXZlbnRGaW5pc2ggPSA9PlxuICAgICAgICAgICAgaWYgIUBvYmplY3QuY29tcG9uZW50cy5jb250YWlucyhAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEBvYmplY3QuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnJlc3VtZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgQHJlc291cmNlQ29udGV4dCA9IG51bGxcbiAgICAgICAgQG9iamVjdERvbWFpbiA9IFwiXCJcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHNjZW5lLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAjIyMgXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgaWYgU2NlbmVNYW5hZ2VyLnByZXZpb3VzU2NlbmVzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuY2xlYXIoKVxuICAgICAgICAgICAgXG4gICAgICAgIEByZXNvdXJjZUNvbnRleHQgPSBSZXNvdXJjZU1hbmFnZXIuY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIFJlc291cmNlTWFuYWdlci5jb250ZXh0ID0gQHJlc291cmNlQ29udGV4dFxuICAgICAgICBcbiAgICAgICAgR3JhcGhpY3MuZnJlZXplKClcbiAgICAgICAgc2F2ZUdhbWUgPSBHYW1lTWFuYWdlci5sb2FkZWRTYXZlR2FtZVxuICAgICAgICBzY2VuZVVpZCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIHNhdmVHYW1lXG4gICAgICAgICAgICBzY2VuZVVpZCA9IHNhdmVHYW1lLnNjZW5lVWlkXG4gICAgICAgICAgICBAb2JqZWN0LnNjZW5lRGF0YSA9IHNhdmVHYW1lLmRhdGFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2NlbmVVaWQgPSAkUEFSQU1TLnByZXZpZXc/LnNjZW5lLnVpZCB8fCBAb2JqZWN0LnNjZW5lRGF0YS51aWQgfHwgUmVjb3JkTWFuYWdlci5zeXN0ZW0uc3RhcnRJbmZvLnNjZW5lLnVpZFxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5zY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoc2NlbmVVaWQpXG4gICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LnNjZW5lRG9jdW1lbnQgYW5kIEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy50eXBlID09IFwidm4uc2NlbmVcIlxuICAgICAgICAgICAgQG9iamVjdC5jaGFwdGVyID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLmNoYXB0ZXJVaWQpXG4gICAgICAgICAgICBAb2JqZWN0LmN1cnJlbnRDaGFyYWN0ZXIgPSB7IFwibmFtZVwiOiBcIlwiIH0gI1JlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1swXVxuICAgIFxuICAgICAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuaW5pdGlhbGl6ZSgpXG4gICAgXG4gICAgICAgICAgICBMYW5ndWFnZU1hbmFnZXIubG9hZEJ1bmRsZXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzcHJpdGUgPSBuZXcgZ3MuU3ByaXRlKClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXAgPSBuZXcgZ3MuQml0bWFwKEdyYXBoaWNzLndpZHRoLCA1MClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXAuZHJhd1RleHQoMCwgMCwgR3JhcGhpY3Mud2lkdGgsIDUwLCBcIk5vIFN0YXJ0IFNjZW5lIHNlbGVjdGVkXCIsIDEsIDApXG4gICAgICAgICAgICBzcHJpdGUuc3JjUmVjdCA9IG5ldyBncy5SZWN0KDAsIDAsIEdyYXBoaWNzLndpZHRoLCA1MClcbiAgICAgICAgICAgIHNwcml0ZS55ID0gKEdyYXBoaWNzLmhlaWdodCAtIDUwKSAvIDJcbiAgICAgICAgICAgIHNwcml0ZS56ID0gMTAwMDBcbiAgIFxuICAgICAgICBAc2V0dXBTY3JlZW4oKSBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIHNjZW5lLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBSZXNvdXJjZU1hbmFnZXIuY29udGV4dCA9IEByZXNvdXJjZUNvbnRleHRcbiAgICAgICAgQG9iamVjdC5yZW1vdmVPYmplY3QoQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lcilcbiAgICAgICAgQHNob3cobm8pXG5cbiAgICAgICAgZm9yIGV2ZW50IGluIEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgaWYgZXZlbnRcbiAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub2ZmQnlPd25lcihcInN0YXJ0XCIsIEBvYmplY3QpXG4gICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9mZkJ5T3duZXIoXCJmaW5pc2hcIiwgQG9iamVjdClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LnZpZGVvXG4gICAgICAgICAgICBAb2JqZWN0LnZpZGVvLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQG9iamVjdC52aWRlby5vbkVuZGVkKClcbiAgICAgICAgXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBjaGFuZ2VQaWN0dXJlRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgQG9iamVjdC5waWN0dXJlcyA9IEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgY2hhbmdlVGV4dERvbWFpbjogKGRvbWFpbikgLT5cbiAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgIEBvYmplY3QudGV4dHMgPSBAb2JqZWN0LnRleHRDb250YWluZXIuc3ViT2JqZWN0c1xuICAgIGNoYW5nZVZpZGVvRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgIEBvYmplY3QudmlkZW9zID0gQG9iamVjdC52aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgY2hhbmdlSG90c3BvdERvbWFpbjogKGRvbWFpbikgLT5cbiAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgIEBvYmplY3QuaG90c3BvdHMgPSBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuc3ViT2JqZWN0c1xuICAgIGNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgIEBvYmplY3QubWVzc2FnZUFyZWFzID0gQG9iamVjdC5tZXNzYWdlQXJlYUNvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTaG93cy9IaWRlcyB0aGUgY3VycmVudCBzY2VuZS4gQSBoaWRkZW4gc2NlbmUgaXMgbm8gbG9uZ2VyIHNob3duIGFuZCBleGVjdXRlZFxuICAgICogYnV0IGFsbCBvYmplY3RzIGFuZCBkYXRhIGlzIHN0aWxsIHRoZXJlIGFuZCBiZSBzaG93biBhZ2FpbiBhbnl0aW1lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd1xuICAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlIC0gSW5kaWNhdGVzIGlmIHRoZSBzY2VuZSBzaG91bGQgYmUgc2hvd24gb3IgaGlkZGVuLlxuICAgICMjIyAgICAgICAgICBcbiAgICBzaG93OiAodmlzaWJsZSkgLT5cbiAgICAgICAgQG9iamVjdC52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5sYXlvdXQ/LnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC5tZXNzYWdlQXJlYUNvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3Qudmlld3BvcnRDb250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG5cbiAgICAgICAgQHZpZXdwb3J0Py52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmNob2ljZVdpbmRvdz8udmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveD8udmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3g/LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94Py51cGRhdGUoKVxuICAgICAgICBAb2JqZWN0LmlucHV0TnVtYmVyQm94Py51cGRhdGUoKVxuICAgICAgICBAb2JqZWN0LmNob2ljZVdpbmRvdz8udXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgICNpZiB2aXNpYmxlIGFuZCBAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHMubGVuZ3RoID09IDBcbiAgICAgICAgQHNldHVwQ29tbW9uRXZlbnRzKClcbiAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBjb21tb24gZXZlbnQgaGFuZGxpbmcuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cENvbW1vbkV2ZW50c1xuICAgICMjIyAgIFxuICAgIHNldHVwQ29tbW9uRXZlbnRzOiAtPlxuICAgICAgICBjb21tb25FdmVudHMgPSBAb2JqZWN0LnNjZW5lRGF0YT8uY29tbW9uRXZlbnRzXG4gICAgICAgIFxuICAgICAgICBpZiBjb21tb25FdmVudHNcbiAgICAgICAgICAgIGZvciBldmVudCwgaSBpbiBjb21tb25FdmVudHNcbiAgICAgICAgICAgICAgICBpZiBldmVudCBhbmQgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmluZGV4T2YoZXZlbnQpID09IC0xXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc2V0T2JqZWN0KGV2ZW50LCBpKVxuICAgICAgICAgICAgICAgICAgICBldmVudC5iZWhhdmlvci5zZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBldmVudC5pbnRlcnByZXRlcj8uaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMuZW1pdChcInN0YXJ0XCIsIGV2ZW50KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmb3IgZXZlbnQsIGkgaW4gR2FtZU1hbmFnZXIuY29tbW9uRXZlbnRzXG4gICAgICAgICAgICAgICAgaWYgZXZlbnQgYW5kIChldmVudC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMSBvciBldmVudC5yZWNvcmQucGFyYWxsZWwpIGFuZCBAb2JqZWN0LmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHMuaW5kZXhPZihldmVudCkgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zZXRPYmplY3QoZXZlbnQsIGkpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub2ZmQnlPd25lcihcInN0YXJ0XCIsIEBvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5vZmZCeU93bmVyKFwiZmluaXNoXCIsIEBvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgZXZlbnQucmVjb3JkLnBhcmFsbGVsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub24gXCJzdGFydFwiLCBncy5DYWxsQmFjayhcIm9uQXV0b0NvbW1vbkV2ZW50U3RhcnRcIiwgdGhpcyksIG51bGwsIEBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5vbiBcImZpbmlzaFwiLCBncy5DYWxsQmFjayhcIm9uQXV0b0NvbW1vbkV2ZW50RmluaXNoXCIsIHRoaXMpLCBudWxsLCBAb2JqZWN0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgZXZlbnQuaW50ZXJwcmV0ZXI/LmlzUnVubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLmVtaXQoXCJzdGFydFwiLCBldmVudClcbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIG1haW4gaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEludGVycHJldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgc2V0dXBJbnRlcnByZXRlcjogLT5cbiAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kc1xuICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGEuaW50ZXJwcmV0ZXJcbiAgICAgICAgICAgIEBvYmplY3QucmVtb3ZlQ29tcG9uZW50KEBvYmplY3QuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyID0gQG9iamVjdC5zY2VuZURhdGEuaW50ZXJwcmV0ZXJcbiAgICAgICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEBvYmplY3QuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICAjT2JqZWN0Lm1peGluKEBvYmplY3QuaW50ZXJwcmV0ZXIsIEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyLCBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyLm9iamVjdENvZGVjQmxhY2tMaXN0KVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5jb250ZXh0LnNldChAb2JqZWN0LnNjZW5lRG9jdW1lbnQudWlkLCBAb2JqZWN0KVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vYmplY3QgPSBAb2JqZWN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuc2V0dXAoKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5jb250ZXh0LnNldChAb2JqZWN0LnNjZW5lRG9jdW1lbnQudWlkLCBAb2JqZWN0KVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5zdGFydCgpXG4gICAgICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBjaGFyYWN0ZXJzIGFuZCByZXN0b3JlcyB0aGVtIGZyb20gbG9hZGVkIHNhdmUgZ2FtZSBpZiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cENoYXJhY3RlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgXG4gICAgc2V0dXBDaGFyYWN0ZXJzOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnNjZW5lRGF0YS5jaGFyYWN0ZXJzP1xuICAgICAgICAgICAgZm9yIGMsIGkgaW4gQG9iamVjdC5zY2VuZURhdGEuY2hhcmFjdGVyc1xuICAgICAgICAgICAgICAgIEBvYmplY3QuY2hhcmFjdGVyQ29udGFpbmVyLnNldE9iamVjdChjLCBpKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5jdXJyZW50Q2hhcmFjdGVyID0gQG9iamVjdC5zY2VuZURhdGEuY3VycmVudENoYXJhY3RlciB8fCB7IG5hbWU6IFwiXCIgfSNSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbMF1cbiAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHZpZXdwb3J0cyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWaWV3cG9ydHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgc2V0dXBWaWV3cG9ydHM6IC0+XG4gICAgICAgIHZpZXdwb3J0cyA9IEBvYmplY3Quc2NlbmVEYXRhPy52aWV3cG9ydHMgPyBbXVxuICAgICAgICBmb3Igdmlld3BvcnQsIGkgaW4gdmlld3BvcnRzXG4gICAgICAgICAgICBpZiB2aWV3cG9ydFxuICAgICAgICAgICAgICAgIEBvYmplY3Qudmlld3BvcnRDb250YWluZXIuc2V0T2JqZWN0KHZpZXdwb3J0LCBpKVxuICAgICMjIypcbiAgICAqIFNldHMgdXAgYmFja2dyb3VuZHMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQmFja2dyb3VuZHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBzZXR1cEJhY2tncm91bmRzOiAtPlxuICAgICAgICBiYWNrZ3JvdW5kcyA9IEBvYmplY3Quc2NlbmVEYXRhPy5iYWNrZ3JvdW5kcyA/IFtdXG4gICAgICAgIGZvciBiLCBpIGluIGJhY2tncm91bmRzXG4gICAgICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRDb250YWluZXIuc2V0T2JqZWN0KGIsIGkpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHBpY3R1cmVzIGFuZCByZXN0b3JlcyB0aGVtIGZyb20gbG9hZGVkIHNhdmUgZ2FtZSBpZiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFBpY3R1cmVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgc2V0dXBQaWN0dXJlczogLT5cbiAgICAgICAgcGljdHVyZXMgPSBAb2JqZWN0LnNjZW5lRGF0YT8ucGljdHVyZXMgPyB7fVxuICAgICAgICBmb3IgZG9tYWluIG9mIHBpY3R1cmVzXG4gICAgICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgIGlmIHBpY3R1cmVzW2RvbWFpbl0gdGhlbiBmb3IgcGljdHVyZSwgaSBpbiBwaWN0dXJlc1tkb21haW5dXG4gICAgICAgICAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLnNldE9iamVjdChwaWN0dXJlLCBpKVxuICAgICAgICAgICAgICAgIGlmIHBpY3R1cmU/LmltYWdlXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBcIkdyYXBoaWNzL1BpY3R1cmVzLyN7cGljdHVyZS5pbWFnZX1cIlxuICAgICAgICAgICAgICAgICAgICBAcmVzb3VyY2VDb250ZXh0LmFkZChwYXRoLCBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzQnlQYXRoW3BhdGhdKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRleHRzIGFuZCByZXN0b3JlcyB0aGVtIGZyb20gbG9hZGVkIHNhdmUgZ2FtZSBpZiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFRleHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgc2V0dXBUZXh0czogLT5cbiAgICAgICAgdGV4dHMgPSBAb2JqZWN0LnNjZW5lRGF0YT8udGV4dHMgPyB7fVxuICAgICAgICBmb3IgZG9tYWluIG9mIHRleHRzXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgIGlmIHRleHRzW2RvbWFpbl0gdGhlbiBmb3IgdGV4dCwgaSBpbiB0ZXh0c1tkb21haW5dXG4gICAgICAgICAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLnNldE9iamVjdCh0ZXh0LCBpKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB2aWRlb3MgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVmlkZW9zXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNldHVwVmlkZW9zOiAtPlxuICAgICAgICB2aWRlb3MgPSBAb2JqZWN0LnNjZW5lRGF0YT8udmlkZW9zID8ge31cbiAgICAgICAgZm9yIGRvbWFpbiBvZiB2aWRlb3NcbiAgICAgICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgIGlmIHZpZGVvc1tkb21haW5dIHRoZW4gZm9yIHZpZGVvLCBpIGluIHZpZGVvc1tkb21haW5dXG4gICAgICAgICAgICAgICAgaWYgdmlkZW9cbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFwiTW92aWVzLyN7dmlkZW8udmlkZW99XCJcbiAgICAgICAgICAgICAgICAgICAgQHJlc291cmNlQ29udGV4dC5hZGQocGF0aCwgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0J5UGF0aFtwYXRoXSlcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8udmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICB2aWRlby51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLnNldE9iamVjdCh2aWRlbywgaSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBob3RzcG90cyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBIb3RzcG90c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgc2V0dXBIb3RzcG90czogLT5cbiAgICAgICAgaG90c3BvdHMgPSBAb2JqZWN0LnNjZW5lRGF0YT8uaG90c3BvdHMgPyB7fVxuICAgICAgICBmb3IgZG9tYWluIG9mIGhvdHNwb3RzXG4gICAgICAgICAgICBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgIGlmIGhvdHNwb3RzW2RvbWFpbl0gdGhlbiBmb3IgaG90c3BvdCwgaSBpbiBob3RzcG90c1tkb21haW5dXG4gICAgICAgICAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLnNldE9iamVjdChob3RzcG90LCBpKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGxheW91dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwTGF5b3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIHNldHVwTGF5b3V0OiAtPlxuICAgICAgICBAZGF0YUZpZWxkcyA9IHVpLlVJTWFuYWdlci5kYXRhU291cmNlc1t1aS5VaUZhY3RvcnkubGF5b3V0cy5nYW1lTGF5b3V0LmRhdGFTb3VyY2UgfHwgXCJkZWZhdWx0XCJdKClcbiAgICAgICAgQGRhdGFGaWVsZHMuc2NlbmUgPSBAb2JqZWN0XG4gICAgICAgIHdpbmRvdy4kZGF0YUZpZWxkcyA9IEBkYXRhRmllbGRzXG4gICAgICAgIGFkdlZpc2libGUgPSBAb2JqZWN0Lm1lc3NhZ2VNb2RlID09IHZuLk1lc3NhZ2VNb2RlLkFEVlxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5sYXlvdXQgPSB1aS5VaUZhY3RvcnkuY3JlYXRlRnJvbURlc2NyaXB0b3IodWkuVWlGYWN0b3J5LmxheW91dHMuZ2FtZUxheW91dCwgQG9iamVjdClcbiAgICAgICAgQG9iamVjdC5sYXlvdXQudmlzaWJsZSA9IGFkdlZpc2libGVcbiAgICAgICAgJGdhbWVNZXNzYWdlX21lc3NhZ2UudmlzaWJsZSA9IGFkdlZpc2libGVcbiAgICAgICAgQG9iamVjdC5sYXlvdXQudWkucHJlcGFyZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAkdGVtcEZpZWxkcy5jaG9pY2VzPy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAc2hvd0Nob2ljZXMoR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5jaG9pY2VzLCBncy5DYWxsQmFjayhcIm9uQ2hvaWNlQWNjZXB0XCIsIEBvYmplY3QuaW50ZXJwcmV0ZXIsIHsgcG9pbnRlcjogQG9iamVjdC5pbnRlcnByZXRlci5wb2ludGVyLCBwYXJhbXM6IEBwYXJhbXMgfSkpXG4gICAgXG4gICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXIud2FpdGluZ0Zvci5pbnB1dE51bWJlclxuICAgICAgICAgICAgQHNob3dJbnB1dE51bWJlcihHYW1lTWFuYWdlci50ZW1wRmllbGRzLmRpZ2l0cywgZ3MuQ2FsbEJhY2soXCJvbklucHV0TnVtYmVyRmluaXNoXCIsIEBvYmplY3QuaW50ZXJwcmV0ZXIsIEBvYmplY3QuaW50ZXJwcmV0ZXIpKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuaW50ZXJwcmV0ZXIud2FpdGluZ0Zvci5pbnB1dFRleHRcbiAgICAgICAgICAgIEBzaG93SW5wdXRUZXh0KEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMubGV0dGVycywgZ3MuQ2FsbEJhY2soXCJvbklucHV0VGV4dEZpbmlzaFwiLCBAb2JqZWN0LmludGVycHJldGVyLCBAb2JqZWN0LmludGVycHJldGVyKSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0aGUgbWFpbiB2aWV3cG9ydCAvIHNjcmVlbiB2aWV3cG9ydC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwTWFpblZpZXdwb3J0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNldHVwTWFpblZpZXdwb3J0OiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5zY2VuZURhdGEudmlld3BvcnRcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQucmVtb3ZlQ29tcG9uZW50KEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQudmlzdWFsKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5kaXNwb3NlKClcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQudmlzdWFsLnZpZXdwb3J0KVxuICAgICAgICAgICAgQHZpZXdwb3J0ID0gR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC52aXN1YWwudmlld3BvcnRcbiAgICAgICAgICAgIEBvYmplY3Qudmlld3BvcnQgPSBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQuZGlzcG9zZSgpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0ID0gQG9iamVjdC5zY2VuZURhdGEudmlld3BvcnRcbiAgICAgICAgICAgIEBvYmplY3Qudmlld3BvcnQgPSBAb2JqZWN0LnNjZW5lRGF0YS52aWV3cG9ydFxuICAgICAgICAgICAgQHZpZXdwb3J0ID0gQG9iamVjdC52aWV3cG9ydC52aXN1YWwudmlld3BvcnRcbiAgICAgICAgICAgIEB2aWV3cG9ydC52aWV3cG9ydCA9IEdyYXBoaWNzLnZpZXdwb3J0XG4gICAgICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChAb2JqZWN0LnZpZXdwb3J0KVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBzY3JlZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBzZXR1cFNjcmVlbjogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGEuc2NyZWVuXG4gICAgICAgICAgICBAb2JqZWN0LnZpZXdwb3J0LnJlc3RvcmUoQG9iamVjdC5zY2VuZURhdGEuc2NyZWVuKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgbWFpbiBpbnRlcnByZXRlciBmcm9tIGxvYWRlZCBzYXZlIGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlSW50ZXJwcmV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICBcbiAgICByZXN0b3JlSW50ZXJwcmV0ZXI6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnJlc3RvcmUoKVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIG1lc3NhZ2UgYm94IGZyb20gbG9hZGVkIHNhdmUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVNZXNzYWdlQm94XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICByZXN0b3JlTWVzc2FnZUJveDogLT5cbiAgICAgICAgbWVzc2FnZUJveGVzID0gQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VCb3hlc1xuICAgICAgICBpZiBtZXNzYWdlQm94ZXNcbiAgICAgICAgICAgIGZvciBtZXNzYWdlQm94IGluIG1lc3NhZ2VCb3hlc1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChtZXNzYWdlQm94LmlkKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QudmlzaWJsZSA9IG1lc3NhZ2VCb3gudmlzaWJsZVxuICAgICAgICAgICAgICAgIGlmIG1lc3NhZ2VCb3gubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQobWVzc2FnZUJveC5tZXNzYWdlLmlkKVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnRleHRSZW5kZXJlci5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5taXhpbihtZXNzYWdlLCBtZXNzYWdlQm94Lm1lc3NhZ2UsIHVpLk9iamVjdF9NZXNzYWdlLm9iamVjdENvZGVjQmxhY2tMaXN0LmNvbmNhdChbXCJvcmlnaW5cIl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGZvciBjIGluIG1lc3NhZ2UuY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5vYmplY3QgPSBtZXNzYWdlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIG1lc3NhZ2UgZnJvbSBsb2FkZWQgc2F2ZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZU1lc3NhZ2VzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgICBcbiAgICByZXN0b3JlTWVzc2FnZXM6IC0+XG4gICAgICAgICNtZXNzYWdlT2JqZWN0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIFxuICAgICAjICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VcbiAgICAgIyAgICAgICBtZXNzYWdlT2JqZWN0LnJlc3RvcmUoQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZSlcbiAgICAgICAgICAgIFxuICAgICAjICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VzXG4gICAgICMgICAgICAgbWVzc2FnZU9iamVjdC5tZXNzYWdlLnJlc3RvcmVNZXNzYWdlcyhAb2JqZWN0LnNjZW5lRGF0YS5tZXNzYWdlcylcbiAgICAgIyAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5yZXN0b3JlKEBvYmplY3Quc2NlbmVEYXRhLm1lc3NhZ2VUZXh0UmVuZGVyZXIpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VBcmVhc1xuICAgICAgICAgICAgZm9yIGRvbWFpbiBvZiBAb2JqZWN0LnNjZW5lRGF0YS5tZXNzYWdlQXJlYXNcbiAgICAgICAgICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICAgICAgbWVzc2FnZUFyZWFzID0gQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZUFyZWFzXG4gICAgICAgICAgICAgICAgaWYgbWVzc2FnZUFyZWFzW2RvbWFpbl0gdGhlbiBmb3IgYXJlYSwgaSBpbiBtZXNzYWdlQXJlYXNbZG9tYWluXVxuICAgICAgICAgICAgICAgICAgICBpZiBhcmVhXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQXJlYSA9IG5ldyBncy5PYmplY3RfTWVzc2FnZUFyZWEoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dCA9IHVpLlVJTWFuYWdlci5jcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodHlwZTogXCJ1aS5DdXN0b21HYW1lTWVzc2FnZVwiLCBpZDogXCJjdXN0b21HYW1lTWVzc2FnZV9cIitpLCBwYXJhbXM6IHsgaWQ6IFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIraSB9LCBtZXNzYWdlQXJlYSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImN1c3RvbUdhbWVNZXNzYWdlX1wiK2krXCJfbWVzc2FnZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0Lm1peGluKG1lc3NhZ2UsIGFyZWEubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBjIGluIG1lc3NhZ2UuY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMub2JqZWN0ID0gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UucmVzdG9yZShmLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC54ID0gYXJlYS5sYXlvdXQuZHN0UmVjdC54XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QueSA9IGFyZWEubGF5b3V0LmRzdFJlY3QueVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LndpZHRoID0gYXJlYS5sYXlvdXQuZHN0UmVjdC53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LmhlaWdodCA9IGFyZWEubGF5b3V0LmRzdFJlY3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAjbWVzc2FnZS5tZXNzYWdlLnJlc3RvcmVNZXNzYWdlcyhmLm1lc3NhZ2VzKVxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UudGV4dFJlbmRlcmVyLnJlc3RvcmUoZi50ZXh0UmVuZGVyZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAjbWVzc2FnZS52aXNpYmxlID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQXJlYS5tZXNzYWdlID0gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0ID0gbWVzc2FnZUxheW91dFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUFyZWEuYWRkT2JqZWN0KG1lc3NhZ2VMYXlvdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLnNldE9iamVjdChtZXNzYWdlQXJlYSwgaSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgIFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIGF1ZGlvLXBsYXliYWNrIGZyb20gbG9hZGVkIHNhdmUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVBdWRpb1BsYXliYWNrXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgXG4gICAgcmVzdG9yZUF1ZGlvUGxheWJhY2s6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzLnB1c2goYikgZm9yIGIgaW4gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uYXVkaW9CdWZmZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzQnlMYXllciA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvQnVmZmVyc0J5TGF5ZXJcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5hdWRpb0xheWVycyA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvTGF5ZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc291bmRSZWZlcmVuY2VzID0gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uc291bmRSZWZlcmVuY2VzXG4gICAgICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIHNjZW5lIG9iamVjdHMgZnJvbSB0aGUgY3VycmVudCBsb2FkZWQgc2F2ZS1nYW1lLiBJZiBubyBzYXZlLWdhbWUgaXNcbiAgICAqIHByZXNlbnQgaW4gR2FtZU1hbmFnZXIubG9hZGVkU2F2ZUdhbWUsIG5vdGhpbmcgd2lsbCBoYXBwZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICByZXN0b3JlU2NlbmU6IC0+XG4gICAgICAgIHNhdmVHYW1lID0gR2FtZU1hbmFnZXIubG9hZGVkU2F2ZUdhbWVcbiAgICAgICAgaWYgc2F2ZUdhbWVcbiAgICAgICAgICAgIGNvbnRleHQgPSBuZXcgZ3MuT2JqZWN0Q29kZWNDb250ZXh0KFtHcmFwaGljcy52aWV3cG9ydCwgQG9iamVjdCwgdGhpc10sIHNhdmVHYW1lLmVuY29kZWRPYmplY3RTdG9yZSwgbnVsbClcbiAgICAgICAgICAgIHNhdmVHYW1lLmRhdGEgPSBncy5PYmplY3RDb2RlYy5kZWNvZGUoc2F2ZUdhbWUuZGF0YSwgY29udGV4dClcbiAgICAgICAgICAgIFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tjLmluZGV4XT8ubmFtZSA9IGMubmFtZSBpZiBjIGZvciBjIGluIHNhdmVHYW1lLmRhdGEuY2hhcmFjdGVyTmFtZXNcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnJlc3RvcmUoc2F2ZUdhbWUpXG4gICAgICAgICAgICBncy5PYmplY3RDb2RlYy5vblJlc3RvcmUoc2F2ZUdhbWUuZGF0YSwgY29udGV4dClcbiAgICAgICAgICAgIEByZXNvdXJjZUNvbnRleHQuZnJvbURhdGFCdW5kbGUoc2F2ZUdhbWUuZGF0YS5yZXNvdXJjZUNvbnRleHQsIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNCeVBhdGgpXG5cbiAgICAgICAgICAgIEBvYmplY3Quc2NlbmVEYXRhID0gc2F2ZUdhbWUuZGF0YVxuICAgICAgICAgICAgR3JhcGhpY3MuZnJhbWVDb3VudCA9IHNhdmVHYW1lLmRhdGEuZnJhbWVDb3VudFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgZGF0YSBmb3IgdGhlIHNjZW5lIGFuZCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGdyYXBoaWMgYW5kIGF1ZGlvIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVEYXRhXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyNcbiAgICBwcmVwYXJlRGF0YTogLT5cbiAgICAgICAgI1JlY29yZE1hbmFnZXIudHJhbnNsYXRlKClcbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lID0gQG9iamVjdFxuXG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudCA9IEBvYmplY3RNYW5hZ2VyXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LnNjZW5lRGF0YS51aWQgPSBAb2JqZWN0LnNjZW5lRG9jdW1lbnQudWlkXG4gICAgICAgIFxuICAgICAgICBpZiAhUmVzb3VyY2VMb2FkZXIubG9hZEV2ZW50Q29tbWFuZHNEYXRhKEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcylcbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRFdmVudENvbW1hbmRzR3JhcGhpY3MoQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLmNvbW1hbmRzKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuYmFja2xvZyA9IEBvYmplY3Quc2NlbmVEYXRhLmJhY2tsb2cgfHwgR2FtZU1hbmFnZXIuc2NlbmVEYXRhLmJhY2tsb2cgfHwgW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFN5c3RlbVNvdW5kcygpXG4gICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtR3JhcGhpY3MoKVxuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpVHlwZXNHcmFwaGljcyh1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXMpXG4gICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkVWlMYXlvdXRHcmFwaGljcyh1aS5VaUZhY3RvcnkubGF5b3V0cy5nYW1lTGF5b3V0KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAZGF0YUZpZWxkcz9cbiAgICAgICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkVWlEYXRhRmllbGRzR3JhcGhpY3MoQGRhdGFGaWVsZHMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkdGVtcEZpZWxkcy5jaG9pY2VUaW1lciA9IEBvYmplY3QuY2hvaWNlVGltZXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cCh7IGlkOiBAb2JqZWN0LnNjZW5lRG9jdW1lbnQudWlkfSlcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGFsbCB2aXN1YWwgZ2FtZSBvYmplY3QgZm9yIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVWaXN1YWxcbiAgICAjIyMgXG4gICAgcHJlcGFyZVZpc3VhbDogLT5cbiAgICAgICAgaWYgQG9iamVjdC5sYXlvdXQgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuaXNFeGl0aW5nR2FtZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5pc0V4aXRpbmdHYW1lID0gbm9cbiAgICAgICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0UmVzZXRTY2VuZUNoYW5nZShAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMubmFtZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RTY2VuZUNoYW5nZShAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMubmFtZSlcbiAgICAgICAgXG4gICAgICAgIEByZXN0b3JlU2NlbmUoKVxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VNb2RlID0gQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZU1vZGUgPyB2bi5NZXNzYWdlTW9kZS5BRFZcbiAgICAgICAgQHNldHVwTWFpblZpZXdwb3J0KClcbiAgICAgICAgQHNldHVwVmlld3BvcnRzKClcbiAgICAgICAgQHNldHVwQ2hhcmFjdGVycygpXG4gICAgICAgIEBzZXR1cEJhY2tncm91bmRzKClcbiAgICAgICAgQHNldHVwUGljdHVyZXMoKVxuICAgICAgICBAc2V0dXBUZXh0cygpXG4gICAgICAgIEBzZXR1cFZpZGVvcygpXG4gICAgICAgIEBzZXR1cEhvdHNwb3RzKClcbiAgICAgICAgQHNldHVwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAc2V0dXBMYXlvdXQoKVxuICAgICAgICBAc2V0dXBDb21tb25FdmVudHMoKVxuICAgICAgICBcbiAgICAgICAgQHJlc3RvcmVNZXNzYWdlQm94KClcbiAgICAgICAgQHJlc3RvcmVJbnRlcnByZXRlcigpXG4gICAgICAgIEByZXN0b3JlTWVzc2FnZXMoKVxuICAgICAgICBAcmVzdG9yZUF1ZGlvUGxheWJhY2soKVxuICAgICAgICBcbiAgICAgICAgQHNob3codHJ1ZSlcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3Quc2NlbmVEYXRhID0ge31cbiAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVEYXRhID0ge31cbiAgICAgICAgXG4gICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgIEB0cmFuc2l0aW9uKHsgZHVyYXRpb246IDAgfSlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgYSBuZXcgY2hhcmFjdGVyIHRvIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFkZENoYXJhY3RlclxuICAgICogQHBhcmFtIHt2bi5PYmplY3RfQ2hhcmFjdGVyfSBjaGFyYWN0ZXIgLSBUaGUgY2hhcmFjdGVyIHRvIGFkZC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9BbmltYXRpb24gLSBJbmRpY2F0ZXMgaWYgdGhlIGNoYXJhY3RlciBzaG91bGQgYmUgYWRkZWQgaW1tZWRpYXRlbHkgd2l0b3V0IGFueSBhcHBlYXItYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbkRhdGEgLSBDb250YWlucyB0aGUgYXBwZWFyLWFuaW1hdGlvbiBkYXRhIC0+IHsgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uIH0uXG4gICAgIyMjIFxuICAgIGFkZENoYXJhY3RlcjogKGNoYXJhY3Rlciwgbm9BbmltYXRpb24sIGFuaW1hdGlvbkRhdGEpIC0+XG4gICAgICAgIHVubGVzcyBub0FuaW1hdGlvblxuICAgICAgICAgICAgY2hhcmFjdGVyLm1vdGlvbkJsdXIuc2V0KGFuaW1hdGlvbkRhdGEubW90aW9uQmx1cilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYW5pbWF0aW9uRGF0YS5kdXJhdGlvbiA+IDBcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIuYW5pbWF0b3IuYXBwZWFyKGNoYXJhY3Rlci5kc3RSZWN0LngsIGNoYXJhY3Rlci5kc3RSZWN0LnksIGFuaW1hdGlvbkRhdGEuYW5pbWF0aW9uLCBhbmltYXRpb25EYXRhLmVhc2luZywgYW5pbWF0aW9uRGF0YS5kdXJhdGlvbikgdW5sZXNzIG5vQW5pbWF0aW9uXG4gICAgICAgIFxuICAgICAgICBjaGFyYWN0ZXIudmlld3BvcnQgPSBAdmlld3BvcnRcbiAgICAgICAgY2hhcmFjdGVyLnZpc2libGUgPSB5ZXMgXG4gICAgXG4gICAgICAgIEBvYmplY3QuY2hhcmFjdGVyQ29udGFpbmVyLmFkZE9iamVjdChjaGFyYWN0ZXIpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBjaGFyYWN0ZXIgZnJvbSB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZW1vdmVDaGFyYWN0ZXJcbiAgICAqIEBwYXJhbSB7dm4uT2JqZWN0X0NoYXJhY3Rlcn0gY2hhcmFjdGVyIC0gVGhlIGNoYXJhY3RlciB0byByZW1vdmUuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uRGF0YSAtIENvbnRhaW5zIHRoZSBkaXNhcHBlYXItYW5pbWF0aW9uIGRhdGEgLT4geyBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24gfS5cbiAgICAjIyNcbiAgICByZW1vdmVDaGFyYWN0ZXI6IChjaGFyYWN0ZXIsIGFuaW1hdGlvbkRhdGEpIC0+XG4gICAgICAgIGNoYXJhY3Rlcj8uYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbkRhdGEuYW5pbWF0aW9uLCBhbmltYXRpb25EYXRhLmVhc2luZywgYW5pbWF0aW9uRGF0YS5kdXJhdGlvbiwgKHNlbmRlcikgLT4gc2VuZGVyLmRpc3Bvc2UoKSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN1bWVzIHRoZSBjdXJyZW50IHNjZW5lIGlmIGl0IGhhcyBiZWVuIHBhdXNlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3VtZVNjZW5lXG4gICAgIyMjXG4gICAgcmVzdW1lU2NlbmU6IC0+XG4gICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5hY3RpdmUgPSB5ZXNcbiAgICAgICAgQG9iamVjdC5jaGFyYWN0ZXJDb250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5hY3RpdmUgPSB5ZXNcbiAgICAgICAgQG9iamVjdC50ZXh0Q29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIFxuICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIG1lc3NhZ2UuYWN0aXZlID0geWVzXG4gXG4gICAgIyMjKlxuICAgICogUGF1c2VzIHRoZSBjdXJyZW50IHNjZW5lLiBBIHBhdXNlZCBzY2VuZSB3aWxsIG5vdCBjb250aW51ZSwgbWVzc2FnZXMsIHBpY3R1cmVzLCBldGMuIHdpbGxcbiAgICAqIHN0b3AgdW50aWwgdGhlIHNjZW5lIHJlc3VtZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBwYXVzZVNjZW5lXG4gICAgIyMjXG4gICAgcGF1c2VTY2VuZTogLT5cbiAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBvYmplY3QuY2hhcmFjdGVyQ29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5hY3RpdmUgPSBub1xuICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgXG4gICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImdhbWVNZXNzYWdlX21lc3NhZ2VcIilcbiAgICAgICAgbWVzc2FnZS5hY3RpdmUgPSBub1xuICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGFuZ2VzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBlbnRpcmUgZ2FtZSBVSSBsaWtlIHRoZSBtZXNzYWdlIGJveGVzLCBldGMuIHRvIGFsbG93c1xuICAgICogdGhlIHBsYXllciB0byBzZWUgdGhlIGVudGlyZSBzY2VuZS4gVXNlZnVsIGZvciBDR3MsIGV0Yy5cbiAgICAqXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZpc2libGUgLSBJZiA8Yj50cnVlPC9iPiwgdGhlIGdhbWUgVUkgd2lsbCBiZSB2aXNpYmxlLiBPdGhlcndpc2UgaXQgd2lsbCBiZSBoaWRkZW4uXG4gICAgKiBAbWV0aG9kIGNoYW5nZVVJVmlzaWJpbGl0eVxuICAgICMjIyAgIFxuICAgIGNoYW5nZVVJVmlzaWJpbGl0eTogKHZpc2libGUpIC0+XG4gICAgICAgIEB1aVZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QubGF5b3V0LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNob3dzIGlucHV0LXRleHQgYm94IHRvIGxldCB0aGUgdXNlciBlbnRlciBhIHRleHQuXG4gICAgKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxldHRlcnMgLSBUaGUgbWF4LiBudW1iZXIgb2YgbGV0dGVycyB0aGUgdXNlciBjYW4gZW50ZXIuXG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGlmIHRoZSBpbnB1dC10ZXh0IGJveCBoYXMgYmVlbiBhY2NlcHRlZCBieSB0aGUgdXNlci5cbiAgICAqIEBtZXRob2Qgc2hvd0lucHV0VGV4dFxuICAgICMjI1xuICAgIHNob3dJbnB1dFRleHQ6IChsZXR0ZXJzLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3g/LmRpc3Bvc2UoKVxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveCA9IHVpLlVpRmFjdG9yeS5jcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzW1widWkuSW5wdXRUZXh0Qm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3gudWkucHJlcGFyZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94LmV2ZW50cy5vbihcImFjY2VwdFwiLCBjYWxsYmFjaylcbiAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTaG93cyBpbnB1dC1udW1iZXIgYm94IHRvIGxldCB0aGUgdXNlciBlbnRlciBhIG51bWJlci5cbiAgICAqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZGlnaXRzIC0gVGhlIG1heC4gbnVtYmVyIG9mIGRpZ2l0cyB0aGUgdXNlciBjYW4gZW50ZXIuXG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGlmIHRoZSBpbnB1dC1udW1iZXIgYm94IGhhcyBiZWVuIGFjY2VwdGVkIGJ5IHRoZSB1c2VyLlxuICAgICogQG1ldGhvZCBzaG93SW5wdXROdW1iZXJcbiAgICAjIyMgXG4gICAgc2hvd0lucHV0TnVtYmVyOiAoZGlnaXRzLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveD8uZGlzcG9zZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3ggPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLklucHV0TnVtYmVyQm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveC51aS5wcmVwYXJlKClcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveC5ldmVudHMub24oXCJhY2NlcHRcIiwgY2FsbGJhY2spICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFNob3dzIGNob2ljZXMgdG8gbGV0IHRoZSB1c2VyIHBpY2sgYSBjaG9pY2UuXG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gY2hvaWNlcyAtIEFuIGFycmF5IG9mIGNob2ljZXNcbiAgICAqIEBwYXJhbSB7Z3MuQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgYSBjaG9pY2UgaGFzIGJlZW4gcGlja2VkIGJ5IHRoZSB1c2VyLlxuICAgICogQG1ldGhvZCBzaG93Q2hvaWNlc1xuICAgICMjIyAgICAgXG4gICAgc2hvd0Nob2ljZXM6IChjaG9pY2VzLCBjYWxsYmFjaykgLT5cbiAgICAgICAgdXNlRnJlZUxheW91dCA9IGNob2ljZXMud2hlcmUoKHgpIC0+IHguZHN0UmVjdD8pLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5jaG9pY2VzID0gY2hvaWNlcyBcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3c/LmRpc3Bvc2UoKVxuICAgICAgICBcbiAgICAgICAgaWYgdXNlRnJlZUxheW91dFxuICAgICAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cgPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLkZyZWVDaG9pY2VCb3hcIl0sIEBvYmplY3QubGF5b3V0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmNob2ljZVdpbmRvdyA9IHVpLlVpRmFjdG9yeS5jcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzW1widWkuQ2hvaWNlQm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuY2hvaWNlV2luZG93LmV2ZW50cy5vbihcInNlbGVjdGlvbkFjY2VwdFwiLCBjYWxsYmFjaylcbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cudWkucHJlcGFyZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGJhY2tncm91bmQgb2YgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlQmFja2dyb3VuZFxuICAgICogQHBhcmFtIHtPYmplY3R9IGJhY2tncm91bmQgLSBUaGUgYmFja2dyb3VuZCBncmFwaGljIG9iamVjdCAtPiB7IG5hbWUgfVxuICAgICogQHBhcmFtIHtib29sZWFufSBub0FuaW1hdGlvbiAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgY2hhbmdlZCBpbW1lZGlhdGVseSB3aXRvdXQgYW55IGNoYW5nZS1hbmltYXRpb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uIC0gVGhlIGFwcGVhci9kaXNhcHBlYXIgYW5pbWF0aW9uIHRvIHVzZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmcgLSBUaGUgZWFzaW5nIG9mIHRoZSBjaGFuZ2UgYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9mIHRoZSBjaGFuZ2UgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG94IC0gVGhlIHgtb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG95IC0gVGhlIHktb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGJhY2tncm91bmQtbGF5ZXIgdG8gY2hhbmdlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBsb29wSG9yaXpvbnRhbCAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgbG9vcGVkIGhvcml6b250YWxseS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9vcFZlcnRpY2FsIC0gSW5kaWNhdGVzIGlmIHRoZSBiYWNrZ3JvdW5kIHNob3VsZCBiZSBsb29wZWQgdmVydGljYWxseS5cbiAgICAjIyMgICBcbiAgICBjaGFuZ2VCYWNrZ3JvdW5kOiAoYmFja2dyb3VuZCwgbm9BbmltYXRpb24sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgb3gsIG95LCBsYXllciwgbG9vcEhvcml6b250YWwsIGxvb3BWZXJ0aWNhbCkgLT5cbiAgICAgICAgaWYgYmFja2dyb3VuZD9cbiAgICAgICAgICAgIG90aGVyT2JqZWN0ID0gQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgICAgIG9iamVjdCA9IG5ldyB2bi5PYmplY3RfQmFja2dyb3VuZCgpXG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBiYWNrZ3JvdW5kLm5hbWVcbiAgICAgICAgICAgIG9iamVjdC5vcmlnaW4ueCA9IG94XG4gICAgICAgICAgICBvYmplY3Qub3JpZ2luLnkgPSBveVxuICAgICAgICAgICAgb2JqZWN0LnZpZXdwb3J0ID0gQHZpZXdwb3J0XG4gICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBub1xuICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBub1xuICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5zZXRPYmplY3Qob2JqZWN0LCBsYXllcilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPyAzMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvdGhlck9iamVjdD8uekluZGV4ID0gbGF5ZXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZHVyYXRpb24gPT0gMFxuICAgICAgICAgICAgICAgIG90aGVyT2JqZWN0Py5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBsb29wVmVydGljYWxcbiAgICAgICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IGxvb3BIb3Jpem9udGFsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbm9BbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLnZlcnRpY2FsID0gbG9vcFZlcnRpY2FsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0gbG9vcEhvcml6b250YWxcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci5vdGhlck9iamVjdCA9IG90aGVyT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci5hcHBlYXIoMCwgMCwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoc2VuZGVyKSA9PiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyLmFuaW1hdG9yLm90aGVyT2JqZWN0Py5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci5hbmltYXRvci5vdGhlck9iamVjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IGxvb3BWZXJ0aWNhbFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyLnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBsb29wSG9yaXpvbnRhbFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZHNbbGF5ZXJdPy5hbmltYXRvci5oaWRlIGR1cmF0aW9uLCBlYXNpbmcsICA9PlxuICAgICAgICAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl0uZGlzcG9zZSgpXG4gICAgICAgICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRzW2xheWVyXSA9IG51bGxcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgdmlld3BvcnQgYW5pbWF0aW9ucyBleGNlcHQgdGhlIG1haW4gdmlld3BvcnQgYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFZpZXdwb3J0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwVmlld3BvcnRzOiAtPlxuICAgICAgICB2aWV3cG9ydHMgPSBAb2JqZWN0LnZpZXdwb3J0Q29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgZm9yIHZpZXdwb3J0IGluIHZpZXdwb3J0c1xuICAgICAgICAgICAgaWYgdmlld3BvcnRcbiAgICAgICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIHZpZXdwb3J0LmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgcGljdHVyZSBhbmltYXRpb25zLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFBpY3R1cmVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBza2lwUGljdHVyZXM6IC0+XG4gICAgICAgIGZvciBwaWN0dXJlIGluIEBvYmplY3QucGljdHVyZXNcbiAgICAgICAgICAgIGlmIHBpY3R1cmVcbiAgICAgICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIHBpY3R1cmUuY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuc2tpcD8oKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgdGV4dCBhbmltYXRpb25zLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFRleHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNraXBUZXh0czogLT5cbiAgICAgICBmb3IgdGV4dCBpbiBAb2JqZWN0LnRleHRzXG4gICAgICAgICAgICBpZiB0ZXh0XG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiB0ZXh0LmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIHZpZGVvIGFuaW1hdGlvbnMgYnV0IG5vdCB0aGUgdmlkZW8tcGxheWJhY2sgaXRzZWxmLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFZpZGVvc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwVmlkZW9zOiAtPlxuICAgICAgICBmb3IgdmlkZW8gaW4gQG9iamVjdC52aWRlb3NcbiAgICAgICAgICAgIGlmIHZpZGVvXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiB2aWRlby5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCBiYWNrZ3JvdW5kIGFuaW1hdGlvbnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwQmFja2dyb3VuZHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgc2tpcEJhY2tncm91bmRzOiAtPlxuICAgICAgICBmb3IgYmFja2dyb3VuZCBpbiBAb2JqZWN0LmJhY2tncm91bmRzXG4gICAgICAgICAgICBpZiBiYWNrZ3JvdW5kXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBiYWNrZ3JvdW5kLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIGNoYXJhY3RlciBhbmltYXRpb25zXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwQ2hhcmFjdGVyc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBza2lwQ2hhcmFjdGVyczogLT5cbiAgICAgICAgZm9yIGNoYXJhY3RlciBpbiBAb2JqZWN0LmNoYXJhY3RlcnNcbiAgICAgICAgICAgIGlmIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gY2hhcmFjdGVyLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgdGhlIG1haW4gdmlld3BvcnQgYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcE1haW5WaWV3cG9ydFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBza2lwTWFpblZpZXdwb3J0OiAtPlxuICAgICAgICBmb3IgY29tcG9uZW50IGluIEBvYmplY3Qudmlld3BvcnQuY29tcG9uZW50c1xuICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIGFuaW1hdGlvbnMgb2YgYWxsIG1lc3NhZ2UgYm94ZXMgZGVmaW5lZCBpbiBNRVNTQUdFX0JPWF9JRFMgdWkgY29uc3RhbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwTWVzc2FnZUJveGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNraXBNZXNzYWdlQm94ZXM6IC0+XG4gICAgICAgIGZvciBtZXNzYWdlQm94SWQgaW4gZ3MuVUlDb25zdGFudHMuTUVTU0FHRV9CT1hfSURTIHx8IFtcIm1lc3NhZ2VCb3hcIiwgXCJudmxNZXNzYWdlQm94XCJdXG4gICAgICAgICAgICBtZXNzYWdlQm94ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQobWVzc2FnZUJveElkKVxuICAgICAgICAgICAgaWYgbWVzc2FnZUJveC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBtZXNzYWdlQm94LmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KCkgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCBhbmltYXRpb25zIG9mIGFsbCBtZXNzYWdlIGFyZWFzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcE1lc3NhZ2VBcmVhc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBza2lwTWVzc2FnZUFyZWFzOiAtPlxuICAgICAgICBmb3IgbWVzc2FnZUFyZWEgaW4gQG9iamVjdC5tZXNzYWdlQXJlYXNcbiAgICAgICAgICAgIGlmIG1lc3NhZ2VBcmVhPy5tZXNzYWdlXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBtZXNzYWdlQXJlYS5tZXNzYWdlLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgICAgICAgIFxuICAgICAgICBtc2cgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImdhbWVNZXNzYWdlX21lc3NhZ2VcIikgICAgIFxuICAgICAgICBpZiBtc2dcbiAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gbXNnLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc2tpcD8oKVxuICAgICAgICBtc2cgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcIm52bEdhbWVNZXNzYWdlX21lc3NhZ2VcIikgICAgIFxuICAgICAgICBpZiBtc2dcbiAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gbXNnLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc2tpcD8oKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2tpcHMgdGhlIHNjZW5lIGludGVycHJldGVyIHRpbWVyLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcEludGVycHJldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHNraXBJbnRlcnByZXRlcjogLT5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA+IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZVxuICAgICAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9PSAwXG4gICAgICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBpbnRlcnByZXRlciB0aW1lciBvZiBhbGwgY29tbW9uIGV2ZW50cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBDb21tb25FdmVudHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIHNraXBDb21tb25FdmVudHM6IC0+XG4gICAgICAgIGV2ZW50cyA9IEBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudD8uaW50ZXJwcmV0ZXIgYW5kIGV2ZW50LmludGVycHJldGVyLndhaXRDb3VudGVyID4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICAgICAgZXZlbnQuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWVcbiAgICAgICAgICAgICAgICBpZiBldmVudC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9PSAwXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmludGVycHJldGVyLmlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBzY2VuZSdzIGNvbnRlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwQ29udGVudFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBza2lwQ29udGVudDogLT5cbiAgICAgICAgQHNraXBQaWN0dXJlcygpXG4gICAgICAgIEBza2lwVGV4dHMoKVxuICAgICAgICBAc2tpcFZpZGVvcygpXG4gICAgICAgIEBza2lwQmFja2dyb3VuZHMoKVxuICAgICAgICBAc2tpcENoYXJhY3RlcnMoKVxuICAgICAgICBAc2tpcE1haW5WaWV3cG9ydCgpXG4gICAgICAgIEBza2lwVmlld3BvcnRzKClcbiAgICAgICAgQHNraXBNZXNzYWdlQm94ZXMoKVxuICAgICAgICBAc2tpcE1lc3NhZ2VBcmVhcygpXG4gICAgICAgIEBza2lwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAc2tpcENvbW1vbkV2ZW50cygpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGZvciB0aGUgc2hvcnRjdXQgdG8gaGlkZS9zaG93IHRoZSBnYW1lIFVJLiBCeSBkZWZhdWx0LCB0aGlzIGlzIHRoZSBzcGFjZS1rZXkuIFlvdVxuICAgICogY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSB0aGUgc2hvcnRjdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVVSVZpc2liaWxpdHlTaG9ydGN1dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICB1cGRhdGVVSVZpc2liaWxpdHlTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgIUB1aVZpc2libGUgYW5kIChJbnB1dC50cmlnZ2VyKElucHV0LkMpIG9yIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24pXG4gICAgICAgICAgICBAY2hhbmdlVUlWaXNpYmlsaXR5KCFAdWlWaXNpYmxlKVxuICAgICAgICBpZiBJbnB1dC50cmlnZ2VyKElucHV0LktFWV9TUEFDRSlcbiAgICAgICAgICAgIEBjaGFuZ2VVSVZpc2liaWxpdHkoIUB1aVZpc2libGUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGZvciB0aGUgc2hvcnRjdXQgdG8gZXhpdCB0aGUgZ2FtZS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgZXNjYXBlLWtleS4gWW91XG4gICAgKiBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gY2hhbmdlIHRoZSBzaG9ydGN1dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVF1aXRTaG9ydGN1dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIHVwZGF0ZVF1aXRTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgSW5wdXQudHJpZ2dlcihJbnB1dC5LRVlfRVNDQVBFKVxuICAgICAgICAgICAgZ3MuQXBwbGljYXRpb24uZXhpdCgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGZvciB0aGUgc2hvcnRjdXQgdG8gb3BlbiB0aGUgc2V0dGluZ3MgbWVudS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgcy1rZXkuIFlvdVxuICAgICogY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSB0aGUgc2hvcnRjdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVTZXR0aW5nc1Nob3J0Y3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICBcbiAgICB1cGRhdGVTZXR0aW5nc1Nob3J0Y3V0OiAtPlxuICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVudUFjY2VzcyBhbmQgSW5wdXQudHJpZ2dlcihJbnB1dC5YKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwic2V0dGluZ3NNZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgZm9yIHRoZSBzaG9ydGN1dCB0byBvcGVuIHRoZSBzZXR0aW5ncyBtZW51LiBCeSBkZWZhdWx0LCB0aGlzIGlzIHRoZSBjb250cm9sLWtleS4gWW91XG4gICAgKiBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gY2hhbmdlIHRoZSBzaG9ydGN1dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVNraXBTaG9ydGN1dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIHVwZGF0ZVNraXBTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zZXR0aW5ncy5hbGxvd1NraXBcbiAgICAgICAgICAgIGlmIElucHV0LmtleXNbSW5wdXQuS0VZX0NPTlRST0xdID09IDFcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IHllc1xuICAgICAgICAgICAgZWxzZSBpZiBJbnB1dC5rZXlzW0lucHV0LktFWV9DT05UUk9MXSA9PSAyXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgZGVmYXVsdCBrZXlib2FyZCBzaG9ydGN1dHMgZS5nIHNwYWNlLWtleSB0byBoaWRlIHRoZSBVSSwgZXRjLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU2hvcnRjdXRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIHVwZGF0ZVNob3J0Y3V0czogLT5cbiAgICAgICAgQHVwZGF0ZVNldHRpbmdzU2hvcnRjdXQoKVxuICAgICAgICBAdXBkYXRlUXVpdFNob3J0Y3V0KClcbiAgICAgICAgQHVwZGF0ZVVJVmlzaWJpbGl0eVNob3J0Y3V0KClcbiAgICAgICAgQHVwZGF0ZVNraXBTaG9ydGN1dCgpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBmdWxsIHNjcmVlbiB2aWRlbyBwbGF5ZWQgdmlhIFBsYXkgTW92aWUgY29tbWFuZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVZpZGVvXG4gICAgIyMjICBcbiAgICB1cGRhdGVWaWRlbzogLT5cbiAgICAgICAgaWYgQG9iamVjdC52aWRlbz9cbiAgICAgICAgICAgIEBvYmplY3QudmlkZW8udXBkYXRlKClcbiAgICAgICAgICAgIGlmIEBvYmplY3Quc2V0dGluZ3MuYWxsb3dWaWRlb1NraXAgYW5kIChJbnB1dC50cmlnZ2VyKElucHV0LkMpIG9yIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTEVGVF0gPT0gMilcbiAgICAgICAgICAgICAgICBAb2JqZWN0LnZpZGVvLnN0b3AoKVxuICAgICAgICAgICAgSW5wdXQuY2xlYXIoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHNraXBwaW5nIGlmIGVuYWJsZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVTa2lwcGluZ1xuICAgICMjIyAgICAgICAgIFxuICAgIHVwZGF0ZVNraXBwaW5nOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5zZXR0aW5ncy5hbGxvd1NraXBcbiAgICAgICAgICAgIEBvYmplY3QudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAc2tpcENvbnRlbnQoKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjIyAgICAgIFxuICAgIHVwZGF0ZUNvbnRlbnQ6IC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lID0gQG9iamVjdFxuICAgICAgICBHcmFwaGljcy52aWV3cG9ydC51cGRhdGUoKVxuICAgICAgICBAb2JqZWN0LnZpZXdwb3J0LnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlU2tpcHBpbmcoKVxuICAgICAgICBAdXBkYXRlVmlkZW8oKVxuICAgICAgICBAdXBkYXRlU2hvcnRjdXRzKClcblxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxudm4uQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yID0gQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yIl19
//# sourceURL=Component_GameSceneBehavior_42.js