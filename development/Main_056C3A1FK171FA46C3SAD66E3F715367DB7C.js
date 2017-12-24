var Main;

Main = (function() {

  /**
  * Controls the boot-process of the game.
  *
  * @module gs
  * @class Main
  * @memberof gs
  * @constructor
   */
  function Main() {
    window.$ = jQuery.noConflict();
    this.languagesLoaded = false;
    this.frameCallback = null;
  }


  /**
  * Updates the current frame.
  *
  * @method updateFrame
   */

  Main.prototype.updateFrame = function() {
    if ($PARAMS.showDebugInfo) {
      window.startTime = window.performance != null ? window.performance.now() : Date.now();
    }
    SceneManager.update();
    Graphics.frameCount++;
    if ($PARAMS.showDebugInfo) {
      if (this.debugSprite == null) {
        this.debugSprite = new Sprite_Debug();
      }
      window.endTime = window.performance != null ? window.performance.now() : Date.now();
      if (Graphics.frameCount % 30 === 0) {
        this.debugSprite.frameTime = endTime - startTime;
        return this.debugSprite.redraw();
      }
    }
  };


  /**
  * Loads game data.
  *
  * @method loadData
   */

  Main.prototype.loadData = function() {
    RecordManager.load();
    DataManager.getDocumentsByType("global_variables");
    DataManager.getDocumentsByType("language_profile");
    return DataManager.getDocumentsByType("vn.chapter");
  };


  /**
  * Loads system data.
  *
  * @method loadSystemData
   */

  Main.prototype.loadSystemData = function() {
    DataManager.getDocument("RESOURCES");
    return DataManager.getDocument("SUMMARIES");
  };


  /**
  * Loads system resources such as graphics, sounds, fonts, etc.
  *
  * @method loadSystemResources
   */

  Main.prototype.loadSystemResources = function() {
    var j, language, len, ref, ref1, ref2;
    ResourceManager.loadFonts();
    ResourceLoader.loadSystemSounds(RecordManager.system);
    ResourceLoader.loadSystemGraphics(RecordManager.system);
    ref = LanguageManager.languages;
    for (j = 0, len = ref.length; j < len; j++) {
      language = ref[j];
      if (((ref1 = language.icon) != null ? (ref2 = ref1.name) != null ? ref2.length : void 0 : void 0) > 0) {
        ResourceManager.getBitmap("Graphics/Icons/" + language.icon.name);
      }
    }
    return gs.Fonts.initialize();
  };


  /**
  * Gets game settings.
  *
  * @method getSettings
   */

  Main.prototype.getSettings = function() {
    var settings;
    settings = GameStorage.getObject("settings");
    if ((settings == null) || settings.version !== 339) {
      GameManager.resetSettings();
      settings = GameManager.settings;
    }
    return settings;
  };


  /**
  * Sets up the game's global data. If it is outdated, this method will
  * reset the global game data.
  *
  * @method setupGlobalData
   */

  Main.prototype.setupGlobalData = function() {
    var globalData;
    globalData = GameStorage.getObject("globalData");
    if (globalData.version !== 339) {
      return GameManager.resetGlobalData();
    }
  };


  /**
  * Sets up game settings.
  *
  * @method setupGameSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupGameSettings = function(settings) {
    var cg, character, i, j, l, len, len1, ref, ref1, results;
    GameManager.globalData = GameStorage.getObject("globalData");
    GameManager.settings = settings;
    GameManager.settings.fullScreen = Graphics.isFullscreen();
    ref = RecordManager.charactersArray;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      character = ref[i];
      if (character && !GameManager.settings.voicesByCharacter[character.index]) {
        GameManager.settings.voicesByCharacter[character.index] = 100;
      }
    }
    ref1 = RecordManager.cgGalleryArray;
    results = [];
    for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
      cg = ref1[i];
      if ((cg != null) && !GameManager.globalData.cgGallery[cg.index]) {
        results.push(GameManager.globalData.cgGallery[cg.index] = {
          unlocked: false
        });
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up audio settings.
  *
  * @method setupAudioSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupAudioSettings = function(settings) {
    AudioManager.generalSoundVolume = settings.seVolume;
    AudioManager.generalMusicVolume = settings.bgmVolume;
    return AudioManager.generalVoiceVolume = settings.voiceVolume;
  };


  /**
  * Sets up video settings.
  *
  * @method setupVideoSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupVideoSettings = function(settings) {
    settings.renderer = 1;
    Graphics.keepRatio = !settings.adjustAspectRatio;
    return Graphics.onResize();
  };


  /**
  * Sets up settings.
  *
  * @method setupSettings
   */

  Main.prototype.setupSettings = function() {
    var settings;
    settings = this.getSettings();
    this.setupGameSettings(settings);
    this.setupAudioSettings(settings);
    this.setupVideoSettings(settings);
    this.setupGlobalData();
    return GameStorage.setObject("settings", settings);
  };


  /**
  * Loads all system resources needed to start the actual game.
  *
  * @method load
  * @param {Function} callback - Called when all system resources are loaded.
   */

  Main.prototype.load = function(callback) {
    this.loadSystemData();
    return DataManager.events.on("loaded", (function(_this) {
      return function() {
        GameManager.tempFields = new gs.GameTemp();
        window.$tempFields = GameManager.tempFields;
        if (_this.languagesLoaded) {
          RecordManager.initialize();
          LanguageManager.initialize();
          SceneManager.initialize();
          _this.setupSettings();
        } else {
          _this.loadData();
        }
        if (_this.languagesLoaded) {
          _this.loadSystemResources();
          DataManager.events.off("loaded");
          ResourceManager.events.on("loaded", function() {
            GameManager.setupCursor();
            ResourceManager.events.off("loaded");
            ui.UIManager.setup();
            return callback();
          });
        }
        return _this.languagesLoaded = true;
      };
    })(this));
  };


  /**
  * Sets up the application.
  *
  * @method setupApplication
   */

  Main.prototype.setupApplication = function() {
    $PARAMS.showDebugInfo = false;
    window.ResourceManager = new window.ResourceManager();
    window.DataManager = new window.DataManager();
    window.Graphics = new Graphics_OpenGL();
    window.gs.Graphics = window.Graphics;
    window.Renderer = window.Renderer_OpenGL;
    return Texture2D.filter = 1;
  };


  /**
  * Initializes the input system to enable support for keyboard, mouse, touch, etc.
  *
  * @method setupInput
   */

  Main.prototype.setupInput = function() {
    Input.initialize();
    return Input.Mouse.initialize();
  };


  /**
  * Initializes the video system with the game's resolution. It is necessary to
  * call this method before using graphic object such as bitmaps, sprites, etc.
  *
  * @method setupVideo
   */

  Main.prototype.setupVideo = function() {
    this.frameCallback = this.createFrameCallback();
    Graphics.initialize($PARAMS.resolution.width, $PARAMS.resolution.height);
    Graphics.onDispose = (function(_this) {
      return function() {
        return ResourceManager.dispose();
      };
    })(this);
    Graphics.formats = [320, 384, 427];
    Graphics.scale = 0.5 / 240 * Graphics.height;
    Font.defaultSize = Math.round(9 / 240 * Graphics.height);
    return Graphics.onEachFrame(this.frameCallback);
  };


  /**
  * Registers shader-based effects. It is important to register all effects
  * before the graphics system is initialized.
  *
  * @method setupEffects
   */

  Main.prototype.setupEffects = function() {
    gs.Effect.registerEffect(gs.Effect.fragmentShaderInfos.lod_blur);
    return gs.Effect.registerEffect(gs.Effect.fragmentShaderInfos.pixelate);
  };


  /**
  * Initializes the Live2D. If Live2D is not available, it does nothing. Needs to be
  * called before using Live2D.
  *
  * @method setupLive2D
   */

  Main.prototype.setupLive2D = function() {
    Live2D.init();
    Live2D.setGL($gl);
    return Live2DFramework.setPlatformManager(new L2DPlatformManager());
  };


  /**
  * Creates the frame-callback function called once per frame to update and render
  * the game.
  *
  * @method setupLive2D
  * @return {Function} The frame-callback function.
   */

  Main.prototype.createFrameCallback = function() {
    var callback;
    callback = null;
    if (($PARAMS.preview != null) || window.parent !== window) {
      callback = (function(_this) {
        return function(time) {
          var ex;
          try {
            return _this.updateFrame();
          } catch (error) {
            ex = error;
            if ($PARAMS.preview || GameManager.inLivePreview) {
              $PARAMS.preview = {
                error: ex
              };
            }
            return console.log(ex);
          }
        };
      })(this);
    } else {
      callback = (function(_this) {
        return function(time) {
          return _this.updateFrame();
        };
      })(this);
    }
    return callback;
  };


  /**
  * Creates the start scene object. If an intro-scene is set, this method returns the
  * intro-scene. If the game runs in Live-Preview, this method returns the selected
  * scene in editor.
  *
  * @method createStartScene
  * @return {gs.Object_Base} The start-scene.
   */

  Main.prototype.createStartScene = function() {
    var introScene, ref, ref1, ref2, ref3, ref4, scene;
    scene = null;
    introScene = null;
    if (RecordManager.system.useIntroScene) {
      introScene = DataManager.getDocumentSummary((ref = RecordManager.system.introInfo) != null ? (ref1 = ref.scene) != null ? ref1.uid : void 0 : void 0);
    }
    if ($PARAMS.preview || introScene) {
      scene = new vn.Object_Scene();
      scene.sceneData.uid = ((ref2 = $PARAMS.preview) != null ? ref2.scene.uid : void 0) || ((ref3 = RecordManager.system.introInfo) != null ? (ref4 = ref3.scene) != null ? ref4.uid : void 0 : void 0);
      scene.events.on("dispose", function(e) {
        return GameManager.sceneData.uid = null;
      });
    } else if (LanguageManager.languages.length > 1) {
      scene = new gs.Object_Layout("languageMenuLayout");
    } else {
      scene = new gs.Object_Layout("titleLayout");
    }
    return scene;
  };


  /**
  * Boots the game by setting up the application window as well as the video, audio and input system.
  *
  * @method start
   */

  Main.prototype.start = function() {
    this.setupApplication();
    this.setupEffects();
    this.setupVideo();
    this.setupLive2D();
    this.setupInput();
    return this.load((function(_this) {
      return function() {
        return SceneManager.switchTo(_this.createStartScene());
      };
    })(this));
  };

  return Main;

})();

gs.Main = new Main();

gs.Application.initialize();

gs.Application.onReady = function() {
  Object.keys(gs).forEach(function(k) {
    gs[k].$namespace = "gs";
    return gs[k].$name = k;
  });
  Object.keys(vn).forEach(function(k) {
    vn[k].$namespace = "vn";
    return vn[k].$name = k;
  });
  Object.keys(ui).forEach(function(k) {
    ui[k].$namespace = "ui";
    return ui[k].$name = k;
  });
  return gs.Main.start();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsY0FBQTtJQUNULE1BQU0sQ0FBQyxDQUFQLEdBQVcsTUFBTSxDQUFDLFVBQVAsQ0FBQTtJQUVYLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxhQUFELEdBQWlCO0VBSlI7OztBQU1iOzs7Ozs7aUJBS0EsV0FBQSxHQUFhLFNBQUE7SUFDVCxJQUFHLE9BQU8sQ0FBQyxhQUFYO01BQ0ksTUFBTSxDQUFDLFNBQVAsR0FBc0IsMEJBQUgsR0FBNEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBLENBQTVCLEdBQTBELElBQUksQ0FBQyxHQUFMLENBQUEsRUFEakY7O0lBR0EsWUFBWSxDQUFDLE1BQWIsQ0FBQTtJQUNBLFFBQVEsQ0FBQyxVQUFUO0lBRUEsSUFBRyxPQUFPLENBQUMsYUFBWDtNQUNJLElBQU8sd0JBQVA7UUFBMEIsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxZQUFBLENBQUEsRUFBN0M7O01BRUEsTUFBTSxDQUFDLE9BQVAsR0FBb0IsMEJBQUgsR0FBNEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBLENBQTVCLEdBQTBELElBQUksQ0FBQyxHQUFMLENBQUE7TUFDM0UsSUFBRyxRQUFRLENBQUMsVUFBVCxHQUFzQixFQUF0QixLQUE0QixDQUEvQjtRQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUEwQixPQUFBLEdBQVU7ZUFDcEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQUEsRUFGSjtPQUpKOztFQVBTOzs7QUFlYjs7Ozs7O2lCQUtBLFFBQUEsR0FBVSxTQUFBO0lBQ04sYUFBYSxDQUFDLElBQWQsQ0FBQTtJQUNBLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0I7SUFDQSxXQUFXLENBQUMsa0JBQVosQ0FBK0Isa0JBQS9CO1dBQ0Es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QUEsQ0FBdEI7TUFBSDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTjtFQVBHOzs7Ozs7QUFXWCxFQUFFLENBQUMsSUFBSCxHQUFjLElBQUEsSUFBQSxDQUFBOztBQUNkLEVBQUUsQ0FBQyxXQUFXLENBQUMsVUFBZixDQUFBOztBQUNBLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBZixHQUF5QixTQUFBO0VBRXJCLE1BQU0sQ0FBQyxJQUFQLENBQVksRUFBWixDQUFlLENBQUMsT0FBaEIsQ0FBd0IsU0FBQyxDQUFEO0lBQU8sRUFBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQU4sR0FBbUI7V0FBTSxFQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTixHQUFjO0VBQTlDLENBQXhCO0VBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaLENBQWUsQ0FBQyxPQUFoQixDQUF3QixTQUFDLENBQUQ7SUFBTyxFQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBTixHQUFtQjtXQUFNLEVBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFOLEdBQWM7RUFBOUMsQ0FBeEI7RUFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLEVBQVosQ0FBZSxDQUFDLE9BQWhCLENBQXdCLFNBQUMsQ0FBRDtJQUFPLEVBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFOLEdBQW1CO1dBQU0sRUFBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQU4sR0FBYztFQUE5QyxDQUF4QjtTQUVBLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBUixDQUFBO0FBTnFCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBNYWluXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBFbnRyeSBwb2ludCBvZiB5b3VyIGdhbWUuXG4jIFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBNYWluXG4gICAgIyMjKlxuICAgICogQ29udHJvbHMgdGhlIGJvb3QtcHJvY2VzcyBvZiB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgTWFpblxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgd2luZG93LiQgPSBqUXVlcnkubm9Db25mbGljdCgpXG4gICAgICAgIFxuICAgICAgICBAbGFuZ3VhZ2VzTG9hZGVkID0gbm9cbiAgICAgICAgQGZyYW1lQ2FsbGJhY2sgPSBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY3VycmVudCBmcmFtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUZyYW1lXG4gICAgIyMjXG4gICAgdXBkYXRlRnJhbWU6IC0+XG4gICAgICAgIGlmICRQQVJBTVMuc2hvd0RlYnVnSW5mb1xuICAgICAgICAgICAgd2luZG93LnN0YXJ0VGltZSA9IGlmIHdpbmRvdy5wZXJmb3JtYW5jZT8gdGhlbiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgZWxzZSBEYXRlLm5vdygpXG4gICAgICAgICAgIFxuICAgICAgICBTY2VuZU1hbmFnZXIudXBkYXRlKClcbiAgICAgICAgR3JhcGhpY3MuZnJhbWVDb3VudCsrXG4gICAgICAgIFxuICAgICAgICBpZiAkUEFSQU1TLnNob3dEZWJ1Z0luZm9cbiAgICAgICAgICAgIGlmIG5vdCBAZGVidWdTcHJpdGU/IHRoZW4gQGRlYnVnU3ByaXRlID0gbmV3IFNwcml0ZV9EZWJ1ZygpXG4gICAgICBcbiAgICAgICAgICAgIHdpbmRvdy5lbmRUaW1lID0gaWYgd2luZG93LnBlcmZvcm1hbmNlPyB0aGVuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSBlbHNlIERhdGUubm93KClcbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLmZyYW1lQ291bnQgJSAzMCA9PSAwXG4gICAgICAgICAgICAgICAgQGRlYnVnU3ByaXRlLmZyYW1lVGltZSA9IChlbmRUaW1lIC0gc3RhcnRUaW1lKVxuICAgICAgICAgICAgICAgIEBkZWJ1Z1Nwcml0ZS5yZWRyYXcoKVxuICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIExvYWRzIGdhbWUgZGF0YS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWREYXRhXG4gICAgIyMjXG4gICAgbG9hZERhdGE6IC0+XG4gICAgICAgIFJlY29yZE1hbmFnZXIubG9hZCgpXG4gICAgICAgIERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIilcbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwibGFuZ3VhZ2VfcHJvZmlsZVwiKVxuICAgICAgICBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJ2bi5jaGFwdGVyXCIpXG4gICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgc3lzdGVtIGRhdGEuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkU3lzdGVtRGF0YVxuICAgICMjIyAgICBcbiAgICBsb2FkU3lzdGVtRGF0YTogLT5cbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoXCJSRVNPVVJDRVNcIilcbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoXCJTVU1NQVJJRVNcIilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBMb2FkcyBzeXN0ZW0gcmVzb3VyY2VzIHN1Y2ggYXMgZ3JhcGhpY3MsIHNvdW5kcywgZm9udHMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRTeXN0ZW1SZXNvdXJjZXNcbiAgICAjIyMgICAgIFxuICAgIGxvYWRTeXN0ZW1SZXNvdXJjZXM6IC0+XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5sb2FkRm9udHMoKVxuICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtU291bmRzKFJlY29yZE1hbmFnZXIuc3lzdGVtKVxuICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtR3JhcGhpY3MoUmVjb3JkTWFuYWdlci5zeXN0ZW0pXG4gICAgICAgIFxuICAgICAgICBmb3IgbGFuZ3VhZ2UgaW4gTGFuZ3VhZ2VNYW5hZ2VyLmxhbmd1YWdlc1xuICAgICAgICAgICAgaWYgbGFuZ3VhZ2UuaWNvbj8ubmFtZT8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9JY29ucy8je2xhbmd1YWdlLmljb24ubmFtZX1cIilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZ3MuRm9udHMuaW5pdGlhbGl6ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldFNldHRpbmdzXG4gICAgIyMjICAgICAgICBcbiAgICBnZXRTZXR0aW5nczogLT5cbiAgICAgICAgc2V0dGluZ3MgPSBHYW1lU3RvcmFnZS5nZXRPYmplY3QoXCJzZXR0aW5nc1wiKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc2V0dGluZ3M/IG9yIHNldHRpbmdzLnZlcnNpb24gIT0gMzM5XG4gICAgICAgICAgICBHYW1lTWFuYWdlci5yZXNldFNldHRpbmdzKClcbiAgICAgICAgICAgIHNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gc2V0dGluZ3NcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSBnYW1lJ3MgZ2xvYmFsIGRhdGEuIElmIGl0IGlzIG91dGRhdGVkLCB0aGlzIG1ldGhvZCB3aWxsXG4gICAgKiByZXNldCB0aGUgZ2xvYmFsIGdhbWUgZGF0YS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwR2xvYmFsRGF0YVxuICAgICMjIyAgICAgXG4gICAgc2V0dXBHbG9iYWxEYXRhOiAtPlxuICAgICAgICBnbG9iYWxEYXRhID0gR2FtZVN0b3JhZ2UuZ2V0T2JqZWN0KFwiZ2xvYmFsRGF0YVwiKVxuICAgICAgICBcbiAgICAgICAgaWYgZ2xvYmFsRGF0YS52ZXJzaW9uICE9IDMzOVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIucmVzZXRHbG9iYWxEYXRhKClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwR2FtZVNldHRpbmdzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBDdXJyZW50IGdhbWUgc2V0dGluZ3MuXG4gICAgIyMjICAgICBcbiAgICBzZXR1cEdhbWVTZXR0aW5nczogKHNldHRpbmdzKSAtPlxuICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhID0gR2FtZVN0b3JhZ2UuZ2V0T2JqZWN0KFwiZ2xvYmFsRGF0YVwiKVxuICAgICAgICBHYW1lTWFuYWdlci5zZXR0aW5ncyA9IHNldHRpbmdzXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBHcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuICAgICAgICBcbiAgICAgICAgZm9yIGNoYXJhY3RlciwgaSBpbiBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNBcnJheVxuICAgICAgICAgICAgaWYgY2hhcmFjdGVyIGFuZCAhR2FtZU1hbmFnZXIuc2V0dGluZ3Mudm9pY2VzQnlDaGFyYWN0ZXJbY2hhcmFjdGVyLmluZGV4XVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlc0J5Q2hhcmFjdGVyW2NoYXJhY3Rlci5pbmRleF0gPSAxMDBcbiAgICAgICAgZm9yIGNnLCBpIGluIFJlY29yZE1hbmFnZXIuY2dHYWxsZXJ5QXJyYXlcbiAgICAgICAgICAgIGlmIGNnPyBhbmQgIUdhbWVNYW5hZ2VyLmdsb2JhbERhdGEuY2dHYWxsZXJ5W2NnLmluZGV4XVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLmdsb2JhbERhdGEuY2dHYWxsZXJ5W2NnLmluZGV4XSA9IHsgdW5sb2NrZWQ6IG5vIH0gXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBhdWRpbyBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQXVkaW9TZXR0aW5nc1xuICAgICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQ3VycmVudCBnYW1lIHNldHRpbmdzLlxuICAgICMjIyAgICAgXG4gICAgc2V0dXBBdWRpb1NldHRpbmdzOiAoc2V0dGluZ3MpIC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5nZW5lcmFsU291bmRWb2x1bWUgPSBzZXR0aW5ncy5zZVZvbHVtZVxuICAgICAgICBBdWRpb01hbmFnZXIuZ2VuZXJhbE11c2ljVm9sdW1lID0gc2V0dGluZ3MuYmdtVm9sdW1lXG4gICAgICAgIEF1ZGlvTWFuYWdlci5nZW5lcmFsVm9pY2VWb2x1bWUgPSBzZXR0aW5ncy52b2ljZVZvbHVtZVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHZpZGVvIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWaWRlb1NldHRpbmdzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBDdXJyZW50IGdhbWUgc2V0dGluZ3MuXG4gICAgIyMjICAgIFxuICAgIHNldHVwVmlkZW9TZXR0aW5nczogKHNldHRpbmdzKSAtPlxuICAgICAgICBzZXR0aW5ncy5yZW5kZXJlciA9IDFcbiAgICAgICAgR3JhcGhpY3Mua2VlcFJhdGlvID0gIXNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvXG4gICAgICAgIEdyYXBoaWNzLm9uUmVzaXplKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBTZXR0aW5nc1xuICAgICMjIyAgICAgICAgXG4gICAgc2V0dXBTZXR0aW5nczogLT5cbiAgICAgICAgc2V0dGluZ3MgPSBAZ2V0U2V0dGluZ3MoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNldHVwR2FtZVNldHRpbmdzKHNldHRpbmdzKVxuICAgICAgICBAc2V0dXBBdWRpb1NldHRpbmdzKHNldHRpbmdzKVxuICAgICAgICBAc2V0dXBWaWRlb1NldHRpbmdzKHNldHRpbmdzKVxuICAgICAgICBAc2V0dXBHbG9iYWxEYXRhKClcblxuICAgICAgICBHYW1lU3RvcmFnZS5zZXRPYmplY3QoXCJzZXR0aW5nc1wiLCBzZXR0aW5ncylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIHN5c3RlbSByZXNvdXJjZXMgbmVlZGVkIHRvIHN0YXJ0IHRoZSBhY3R1YWwgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRcbiAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gYWxsIHN5c3RlbSByZXNvdXJjZXMgYXJlIGxvYWRlZC5cbiAgICAjIyMgICAgICAgICAgICAgICAgXG4gICAgbG9hZDogKGNhbGxiYWNrKSAtPlxuICAgICAgICBAbG9hZFN5c3RlbURhdGEoKVxuICAgICAgICBcbiAgICAgICAgRGF0YU1hbmFnZXIuZXZlbnRzLm9uIFwibG9hZGVkXCIsID0+XG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzID0gbmV3IGdzLkdhbWVUZW1wKClcbiAgICAgICAgICAgIHdpbmRvdy4kdGVtcEZpZWxkcyA9IEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGxhbmd1YWdlc0xvYWRlZFxuICAgICAgICAgICAgICAgIFJlY29yZE1hbmFnZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgTGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoKVxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5pbml0aWFsaXplKClcbiAgICAgICAgICAgICAgICBAc2V0dXBTZXR0aW5ncygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGxvYWREYXRhKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBsYW5ndWFnZXNMb2FkZWRcbiAgICAgICAgICAgICAgICBAbG9hZFN5c3RlbVJlc291cmNlcygpXG4gICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuZXZlbnRzLm9mZiBcImxvYWRlZFwiXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmV2ZW50cy5vbiBcImxvYWRlZFwiLCA9PiBcbiAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dXBDdXJzb3IoKVxuICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZXZlbnRzLm9mZiBcImxvYWRlZFwiXG4gICAgICAgICAgICAgICAgICAgIHVpLlVJTWFuYWdlci5zZXR1cCgpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFuZ3VhZ2VzTG9hZGVkID0geWVzXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0aGUgYXBwbGljYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEFwcGxpY2F0aW9uXG4gICAgIyMjXG4gICAgc2V0dXBBcHBsaWNhdGlvbjogLT5cbiAgICAgICAgJFBBUkFNUy5zaG93RGVidWdJbmZvID0gbm9cbiAgICAgICAgd2luZG93LlJlc291cmNlTWFuYWdlciA9IG5ldyB3aW5kb3cuUmVzb3VyY2VNYW5hZ2VyKClcbiAgICAgICAgd2luZG93LkRhdGFNYW5hZ2VyID0gbmV3IHdpbmRvdy5EYXRhTWFuYWdlcigpXG4gICAgICAgIFxuICAgICAgICAjIEZvcmNlIE9wZW5HTCByZW5kZXJlclxuICAgICAgICB3aW5kb3cuR3JhcGhpY3MgPSBuZXcgR3JhcGhpY3NfT3BlbkdMKClcbiAgICAgICAgd2luZG93LmdzLkdyYXBoaWNzID0gd2luZG93LkdyYXBoaWNzXG4gICAgICAgIHdpbmRvdy5SZW5kZXJlciA9IHdpbmRvdy5SZW5kZXJlcl9PcGVuR0xcbiAgICAgICAgXG4gICAgICAgICMgRm9yY2UgbGluZWFyIGZpbHRlcmluZ1xuICAgICAgICBUZXh0dXJlMkQuZmlsdGVyID0gMVxuICAgIFxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBpbnB1dCBzeXN0ZW0gdG8gZW5hYmxlIHN1cHBvcnQgZm9yIGtleWJvYXJkLCBtb3VzZSwgdG91Y2gsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwSW5wdXRcbiAgICAjIyNcbiAgICBzZXR1cElucHV0OiAtPlxuICAgICAgICBJbnB1dC5pbml0aWFsaXplKClcbiAgICAgICAgSW5wdXQuTW91c2UuaW5pdGlhbGl6ZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHZpZGVvIHN5c3RlbSB3aXRoIHRoZSBnYW1lJ3MgcmVzb2x1dGlvbi4gSXQgaXMgbmVjZXNzYXJ5IHRvXG4gICAgKiBjYWxsIHRoaXMgbWV0aG9kIGJlZm9yZSB1c2luZyBncmFwaGljIG9iamVjdCBzdWNoIGFzIGJpdG1hcHMsIHNwcml0ZXMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVmlkZW9cbiAgICAjIyMgICAgXG4gICAgc2V0dXBWaWRlbzogLT5cbiAgICAgICAgQGZyYW1lQ2FsbGJhY2sgPSBAY3JlYXRlRnJhbWVDYWxsYmFjaygpXG4gICAgICAgIFxuICAgICAgICBHcmFwaGljcy5pbml0aWFsaXplKCRQQVJBTVMucmVzb2x1dGlvbi53aWR0aCwgJFBBUkFNUy5yZXNvbHV0aW9uLmhlaWdodClcbiAgICAgICAgI0dyYXBoaWNzLm9uRm9jdXNSZWNlaXZlID0gPT4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBHcmFwaGljcy5vbkRpc3Bvc2UgPSA9PiBSZXNvdXJjZU1hbmFnZXIuZGlzcG9zZSgpXG4gICAgICAgIEdyYXBoaWNzLmZvcm1hdHMgPSBbMzIwLCAzODQsIDQyN11cbiAgICAgICAgR3JhcGhpY3Muc2NhbGUgPSAwLjUgLyAyNDAgKiBHcmFwaGljcy5oZWlnaHRcbiAgICAgICAgRm9udC5kZWZhdWx0U2l6ZSA9IE1hdGgucm91bmQoOSAvIDI0MCAqIEdyYXBoaWNzLmhlaWdodClcbiAgICAgICAgXG4gICAgICAgIEdyYXBoaWNzLm9uRWFjaEZyYW1lKEBmcmFtZUNhbGxiYWNrKVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlZ2lzdGVycyBzaGFkZXItYmFzZWQgZWZmZWN0cy4gSXQgaXMgaW1wb3J0YW50IHRvIHJlZ2lzdGVyIGFsbCBlZmZlY3RzXG4gICAgKiBiZWZvcmUgdGhlIGdyYXBoaWNzIHN5c3RlbSBpcyBpbml0aWFsaXplZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRWZmZWN0c1xuICAgICMjIyAgIFxuICAgIHNldHVwRWZmZWN0czogLT5cbiAgICAgICAgIyBSZWdpc3RlciBidWlsdC1pbiBMT0QvQm94IEJsdXIgZWZmZWN0XG4gICAgICAgIGdzLkVmZmVjdC5yZWdpc3RlckVmZmVjdChncy5FZmZlY3QuZnJhZ21lbnRTaGFkZXJJbmZvcy5sb2RfYmx1cilcbiAgICAgICAgIyBSZWdpc3RlciBidWlsdC1pbiBwaXhlbGF0ZSBlZmZlY3RcbiAgICAgICAgZ3MuRWZmZWN0LnJlZ2lzdGVyRWZmZWN0KGdzLkVmZmVjdC5mcmFnbWVudFNoYWRlckluZm9zLnBpeGVsYXRlKVxuICAgICAgICBcbiAgICAgICAgIyBUaGlzIGlzIGFuIGV4YW1wbGUgb2YgaG93IHRvIHJlZ2lzdGVyIHlvdXIgb3duIHNoYWRlci1lZmZlY3QuXG4gICAgICAgICMgU2VlIEVmZmVjdHMgPiBDaXJjdWxhckRpc3RvcnRpb25FZmZlY3Qgc2NyaXB0IGZvciBtb3JlIGluZm8uXG4gICAgICAgICMgZ3MuQ2lyY3VsYXJEaXN0b3J0aW9uRWZmZWN0LnJlZ2lzdGVyKClcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgTGl2ZTJELiBJZiBMaXZlMkQgaXMgbm90IGF2YWlsYWJsZSwgaXQgZG9lcyBub3RoaW5nLiBOZWVkcyB0byBiZVxuICAgICogY2FsbGVkIGJlZm9yZSB1c2luZyBMaXZlMkQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cExpdmUyRFxuICAgICMjIyBcbiAgICBzZXR1cExpdmUyRDogLT5cbiAgICAgICAgTGl2ZTJELmluaXQoKVxuICAgICAgICBMaXZlMkQuc2V0R0woJGdsKVxuICAgICAgICBMaXZlMkRGcmFtZXdvcmsuc2V0UGxhdGZvcm1NYW5hZ2VyKG5ldyBMMkRQbGF0Zm9ybU1hbmFnZXIoKSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgZnJhbWUtY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIG9uY2UgcGVyIGZyYW1lIHRvIHVwZGF0ZSBhbmQgcmVuZGVyXG4gICAgKiB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwTGl2ZTJEXG4gICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGZyYW1lLWNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICMjIyAgICBcbiAgICBjcmVhdGVGcmFtZUNhbGxiYWNrOiAtPlxuICAgICAgICBjYWxsYmFjayA9IG51bGxcblxuICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXc/IG9yIHdpbmRvdy5wYXJlbnQgIT0gd2luZG93XG4gICAgICAgICAgICBjYWxsYmFjayA9ICh0aW1lKSA9PiBcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUZyYW1lKClcbiAgICAgICAgICAgICAgICBjYXRjaCBleFxuICAgICAgICAgICAgICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXcgb3IgR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJFBBUkFNUy5wcmV2aWV3ID0gZXJyb3I6IGV4XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGV4KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYWxsYmFjayA9ICh0aW1lKSA9PiBAdXBkYXRlRnJhbWUoKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBjYWxsYmFja1xuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIHN0YXJ0IHNjZW5lIG9iamVjdC4gSWYgYW4gaW50cm8tc2NlbmUgaXMgc2V0LCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZVxuICAgICogaW50cm8tc2NlbmUuIElmIHRoZSBnYW1lIHJ1bnMgaW4gTGl2ZS1QcmV2aWV3LCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBzZWxlY3RlZFxuICAgICogc2NlbmUgaW4gZWRpdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU3RhcnRTY2VuZVxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X0Jhc2V9IFRoZSBzdGFydC1zY2VuZS5cbiAgICAjIyMgICAgICBcbiAgICBjcmVhdGVTdGFydFNjZW5lOiAtPlxuICAgICAgICBzY2VuZSA9IG51bGxcbiAgICAgICAgaW50cm9TY2VuZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIFJlY29yZE1hbmFnZXIuc3lzdGVtLnVzZUludHJvU2NlbmVcbiAgICAgICAgICAgIGludHJvU2NlbmUgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudFN1bW1hcnkoUmVjb3JkTWFuYWdlci5zeXN0ZW0uaW50cm9JbmZvPy5zY2VuZT8udWlkKVxuICAgICAgICBcbiAgICAgICAgaWYgJFBBUkFNUy5wcmV2aWV3IG9yIGludHJvU2NlbmVcbiAgICAgICAgICAgIHNjZW5lID0gbmV3IHZuLk9iamVjdF9TY2VuZSgpXG4gICAgICAgICAgICBzY2VuZS5zY2VuZURhdGEudWlkID0gJFBBUkFNUy5wcmV2aWV3Py5zY2VuZS51aWQgfHwgUmVjb3JkTWFuYWdlci5zeXN0ZW0uaW50cm9JbmZvPy5zY2VuZT8udWlkXG4gICAgICAgICAgICBzY2VuZS5ldmVudHMub24gXCJkaXNwb3NlXCIsIChlKSAtPiBHYW1lTWFuYWdlci5zY2VuZURhdGEudWlkID0gbnVsbFxuICAgICAgICBlbHNlIGlmIExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZXMubGVuZ3RoID4gMVxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgZ3MuT2JqZWN0X0xheW91dChcImxhbmd1YWdlTWVudUxheW91dFwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzY2VuZSA9IG5ldyBncy5PYmplY3RfTGF5b3V0KFwidGl0bGVMYXlvdXRcIilcbiAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHNjZW5lXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEJvb3RzIHRoZSBnYW1lIGJ5IHNldHRpbmcgdXAgdGhlIGFwcGxpY2F0aW9uIHdpbmRvdyBhcyB3ZWxsIGFzIHRoZSB2aWRlbywgYXVkaW8gYW5kIGlucHV0IHN5c3RlbS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgIyMjICBcbiAgICBzdGFydDogLT5cbiAgICAgICAgQHNldHVwQXBwbGljYXRpb24oKVxuICAgICAgICBAc2V0dXBFZmZlY3RzKClcbiAgICAgICAgQHNldHVwVmlkZW8oKVxuICAgICAgICBAc2V0dXBMaXZlMkQoKVxuICAgICAgICBAc2V0dXBJbnB1dCgpXG4gICAgXG4gICAgICAgIEBsb2FkID0+IFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhAY3JlYXRlU3RhcnRTY2VuZSgpKVxuXG5cbiMgVGhlIGVudHJ5IHBvaW50IG9mIHRoZSBnYW1lLlxuZ3MuTWFpbiA9IG5ldyBNYWluKCkgXG5ncy5BcHBsaWNhdGlvbi5pbml0aWFsaXplKClcbmdzLkFwcGxpY2F0aW9uLm9uUmVhZHkgPSAtPlxuICAgICMgQWRkIG1ldGEgZGF0YSB0byBhbGwgY2xhc3Mgb2JqZWN0cyBuZWNlc3NhcnkgZm9yIG9iamVjdCBzZXJpYWxpemF0aW9uLlxuICAgIE9iamVjdC5rZXlzKGdzKS5mb3JFYWNoIChrKSAtPiBnc1trXS4kbmFtZXNwYWNlID0gXCJnc1wiOyBnc1trXS4kbmFtZSA9IGtcbiAgICBPYmplY3Qua2V5cyh2bikuZm9yRWFjaCAoaykgLT4gdm5ba10uJG5hbWVzcGFjZSA9IFwidm5cIjsgdm5ba10uJG5hbWUgPSBrXG4gICAgT2JqZWN0LmtleXModWkpLmZvckVhY2ggKGspIC0+IHVpW2tdLiRuYW1lc3BhY2UgPSBcInVpXCI7IHVpW2tdLiRuYW1lID0ga1xuICAgIFxuICAgIGdzLk1haW4uc3RhcnQoKVxuXG5cbiAgICAgICAgICAgICAgICBcbiAgICBcbiBcbiJdfQ==
//# sourceURL=Main_102.js