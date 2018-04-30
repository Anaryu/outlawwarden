var ResourceLoader;

ResourceLoader = (function() {

  /**
  * The resource helps to load a bunch of resources from different kind of
  * data structures.
  *
  * @module gs
  * @class ResourceLoader
  * @memberof gs
  * @constructor
  * @static
   */
  function ResourceLoader() {
    this.loadedScenesByUid = {};
    this.loadedCommonEventsById = [];
  }


  /**
  * Loads all graphics for the specified list of custom layout types/templates
  *
  * @method loadUiTypesGraphics
  * @param {Object[]} types - An array of custom layout types/templates
  * @static
   */

  ResourceLoader.prototype.loadUiTypesGraphics = function(types) {
    var k;
    for (k in types) {
      this.loadUiLayoutGraphics(types[k]);
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiGraphicsFromObject
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiGraphicsFromObject = function(layout) {
    var k;
    for (k in layout) {
      if (k === "image" || k === "fullImage") {
        ResourceManager.getBitmap("Graphics/Pictures/" + layout[k]);
      } else if (k === "video") {
        ResourceManager.getVideo("Movies/" + layout[k]);
      }
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiDataFieldsGraphics
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiDataFieldsGraphics = function(layout) {
    var image, j, k, l, len, o, ref;
    for (k in layout) {
      if (layout[k] instanceof Array) {
        ref = layout[k];
        for (l = 0, len = ref.length; l < len; l++) {
          o = ref[l];
          for (j in o) {
            if (j === "image" || j === "fullImage") {
              image = o[j];
              if (image != null ? image.startsWith("data:") : void 0) {
                ResourceManager.getBitmap(o[j]);
              } else {
                ResourceManager.getBitmap("Graphics/Pictures/" + o[j]);
              }
            }
          }
        }
      }
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiDataFieldsGraphics
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiLayoutGraphics = function(layout) {
    var action, actions, animation, control, descriptor, graphic, image, l, len, len1, len10, len11, len2, len3, len4, len5, len6, len7, len8, len9, m, music, n, object, p, q, r, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, s, sel, sound, style, sub, t, u, v, video, w, x;
    if (layout.preload != null) {
      if (layout.preload.graphics != null) {
        ref = layout.preload.graphics;
        for (l = 0, len = ref.length; l < len; l++) {
          graphic = ref[l];
          if (graphic.name != null) {
            ResourceManager.getBitmap((graphic.folder || 'Graphics/Pictures') + "/" + (ui.Component_FormulaHandler.fieldValue(null, graphic.name)));
          } else {
            object = ui.Component_FormulaHandler.fieldValue(null, graphic.path);
            for (m = 0, len1 = object.length; m < len1; m++) {
              sub = object[m];
              if (sub != null) {
                image = ui.Component_FormulaHandler.fieldValue(sub, graphic.image);
                if (image != null) {
                  ResourceManager.getBitmap("Graphics/Pictures/" + image);
                }
              }
            }
          }
        }
      }
      if (layout.preload.videos != null) {
        ref1 = layout.preload.videos;
        for (n = 0, len2 = ref1.length; n < len2; n++) {
          video = ref1[n];
          if (video.name != null) {
            ResourceManager.getVideo((video.folder || 'Movies') + "/" + video.name);
          }
        }
      }
      if (layout.preload.music != null) {
        ref2 = layout.preload.music;
        for (p = 0, len3 = ref2.length; p < len3; p++) {
          music = ref2[p];
          if (music != null) {
            ResourceManager.getVideo((music.folder || 'Audio/Music') + "/" + (music.name || music));
          }
        }
      }
      if (layout.preload.sounds != null) {
        ref3 = layout.preload.sounds;
        for (q = 0, len4 = ref3.length; q < len4; q++) {
          sound = ref3[q];
          if (sound != null) {
            ResourceManager.getAudioBuffer((sound.folder || 'Audio/Sounds') + "/" + (ui.Component_FormulaHandler.fieldValue(layout, sound.name || sound)));
          }
        }
      }
    }
    if (layout.images != null) {
      ref4 = layout.images;
      for (r = 0, len5 = ref4.length; r < len5; r++) {
        image = ref4[r];
        ResourceManager.getBitmap("Graphics/Pictures/" + image);
      }
    }
    if (layout.animations != null) {
      ref5 = layout.animations;
      for (s = 0, len6 = ref5.length; s < len6; s++) {
        descriptor = ref5[s];
        ref6 = descriptor.flow;
        for (t = 0, len7 = ref6.length; t < len7; t++) {
          animation = ref6[t];
          switch (animation.type) {
            case "sound":
              ResourceManager.getAudioBuffer("Audio/Sounds/" + animation.sound);
              break;
            case "changeImages":
              ref7 = animation.images;
              for (u = 0, len8 = ref7.length; u < len8; u++) {
                image = ref7[u];
                ResourceManager.getBitmap("Graphics/Pictures/" + image);
              }
              break;
            case "maskTo":
              ResourceManager.getBitmap("Graphics/Masks/" + animation.mask);
          }
          if (animation.sound != null) {
            ResourceManager.getAudioBuffer("Audio/Sounds/" + animation.sound);
          }
        }
      }
    }
    if (layout.image != null) {
      ResourceManager.getBitmap("Graphics/Pictures/" + layout.image);
    }
    if (layout.video != null) {
      ResourceManager.getVideo("Movies/" + layout.video);
    }
    if (layout.customFields != null) {
      this.loadUiGraphicsFromObject(layout.customFields);
    }
    if (((ref8 = layout.customFields) != null ? ref8.actions : void 0) != null) {
      ref9 = layout.customFields.actions;
      for (v = 0, len9 = ref9.length; v < len9; v++) {
        action = ref9[v];
        if (action.name === "playVoice" || action.name === "playSound") {
          AudioManager.loadSound(action.params.name);
        }
      }
    }
    if ((layout.actions != null) || (layout.action != null)) {
      actions = layout.action != null ? [layout.action] : layout.actions;
      for (w = 0, len10 = actions.length; w < len10; w++) {
        action = actions[w];
        if (action.name === "playVoice" || action.name === "playSound") {
          AudioManager.loadSound(action.params.name);
        }
      }
    }
    if (layout.params) {
      this.loadUiLayoutGraphics(layout.params);
    }
    if (layout.template != null) {
      this.loadUiLayoutGraphics(layout.template);
    }
    if ((layout.style != null) && (ui.UiFactory.styles[layout.style] != null)) {
      this.loadUiLayoutGraphics(ui.UiFactory.styles[layout.style]);
      for (sel in ui.UIManager.selectors) {
        style = ui.UIManager.styles[layout.style + ":" + sel];
        if (style) {
          this.loadUiLayoutGraphics(style);
        }
      }
    }
    if (ui.UiFactory.customTypes[layout.type] != null) {
      this.loadUiLayoutGraphics(ui.UiFactory.customTypes[layout.type]);
    }
    if (layout.controls != null) {
      ref10 = layout.controls;
      results = [];
      for (x = 0, len11 = ref10.length; x < len11; x++) {
        control = ref10[x];
        results.push(this.loadUiLayoutGraphics(control));
      }
      return results;
    }
  };


  /**
  * Loads all system sounds.
  *
  * @method loadSystemSounds
  * @static
   */

  ResourceLoader.prototype.loadSystemSounds = function() {
    var l, len, ref, results, sound;
    ref = RecordManager.system.sounds;
    results = [];
    for (l = 0, len = ref.length; l < len; l++) {
      sound = ref[l];
      results.push(AudioManager.loadSound(sound));
    }
    return results;
  };


  /**
  * Loads all system graphics.
  *
  * @method loadSystemGraphics
  * @static
   */

  ResourceLoader.prototype.loadSystemGraphics = function() {
    var l, len, ref, ref1, ref2, ref3, ref4, slot;
    ref = GameManager.saveGameSlots;
    for (l = 0, len = ref.length; l < len; l++) {
      slot = ref[l];
      if ((slot.thumb != null) && slot.thumb.length > 0) {
        ResourceManager.getBitmap(slot.thumb);
      }
    }
    if ((ref1 = RecordManager.system.cursor) != null ? ref1.name : void 0) {
      ResourceManager.getBitmap("Graphics/Pictures/" + RecordManager.system.cursor.name);
    }
    if ((ref2 = RecordManager.system.titleScreen) != null ? ref2.name : void 0) {
      ResourceManager.getBitmap("Graphics/Pictures/" + RecordManager.system.titleScreen.name);
    }
    if ((ref3 = RecordManager.system.languageScreen) != null ? ref3.name : void 0) {
      ResourceManager.getBitmap("Graphics/Pictures/" + RecordManager.system.languageScreen.name);
    }
    if ((ref4 = RecordManager.system.menuBackground) != null ? ref4.name : void 0) {
      ResourceManager.getBitmap("Graphics/Pictures/" + RecordManager.system.menuBackground.name);
    }
    return null;
  };


  /**
  * Loads all resources needed by the specified list of commands.
  *
  * @method loadEventCommandsGraphics
  * @param {Object[]} commands - The list of commands.
  * @return {boolean} Indicates if data needs to be loaded. 
  * @static
   */

  ResourceLoader.prototype.loadEventCommandsData = function(commands) {
    this.loadedScenesByUid = {};
    return this._loadEventCommandsData(commands);
  };

  ResourceLoader.prototype._loadEventCommandsData = function(commands) {
    var command, l, len, result, sceneDocument;
    if (commands == null) {
      return false;
    }
    result = false;
    for (l = 0, len = commands.length; l < len; l++) {
      command = commands[l];
      switch (command.id) {
        case "vn.Choice":
          if (command.params.action.scene) {
            sceneDocument = DataManager.getDocument(command.params.action.scene.uid);
            if (sceneDocument) {
              if (!result) {
                result = !sceneDocument.loaded;
              }
              if (sceneDocument.loaded && !this.loadedScenesByUid[sceneDocument.uid]) {
                this.loadedScenesByUid[sceneDocument.uid] = true;
                if (!result) {
                  result = this._loadEventCommandsData(sceneDocument.items.commands);
                }
              }
            }
          }
          break;
        case "vn.CallScene":
          if (command.params.scene) {
            sceneDocument = DataManager.getDocument(command.params.scene.uid);
            if (sceneDocument) {
              if (!result) {
                result = !sceneDocument.loaded;
              }
              if (sceneDocument.loaded && !this.loadedScenesByUid[sceneDocument.uid]) {
                this.loadedScenesByUid[sceneDocument.uid] = true;
                if (!result) {
                  result = this._loadEventCommandsData(sceneDocument.items.commands);
                }
              }
            }
          }
      }
    }
    return result;
  };


  /**
  * Preloads all resources needed by the specified common event.
  *
  * @method loadCommonEventResources
  * @param {string} eventId - ID of the common event to preload the resources for.
  * @static
   */

  ResourceLoader.prototype.loadCommonEventResources = function(eventId) {
    var commonEvent;
    commonEvent = RecordManager.commonEvents[eventId];
    if ((commonEvent != null) && !this.loadedCommonEventsById[eventId]) {
      this.loadedCommonEventsById[eventId] = true;
      return this._loadEventCommandsGraphics(commonEvent.commands);
    }
  };


  /**
  * Loads all resources needed by the specified list of commands.
  *
  * @method loadEventCommandsGraphics
  * @param {Object[]} commands - The list of commands.
  * @static
   */

  ResourceLoader.prototype.loadEventCommandsGraphics = function(commands) {
    this.loadedScenesByUid = {};
    this.loadedCommonEventsById = [];
    return this._loadEventCommandsGraphics(commands);
  };

  ResourceLoader.prototype._loadEventCommandsGraphics = function(commands) {
    var actor, actorId, animation, animationId, character, command, commonEvent, effect, eid, enemy, expression, expressionId, hotspot, i, i1, image, j1, l, len, len1, len10, len11, len12, len13, len14, len15, len2, len3, len4, len5, len6, len7, len8, len9, m, moveCommand, n, p, param, q, r, record, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, sceneDocument, sound, t, u, v, w, x, y, z;
    if (commands == null) {
      return;
    }
    for (l = 0, len = commands.length; l < len; l++) {
      command = commands[l];
      switch (command.id) {
        case "gs.StartTimer":
          if (command.params.action.type === 1) {
            this.loadCommonEventResources(command.params.action.data.commonEventId);
          }
          break;
        case "gs.CallCommonEvent":
          commonEvent = RecordManager.commonEvents[command.params.commonEventId];
          if (commonEvent != null) {
            ref = commonEvent.parameters;
            for (i = m = 0, len1 = ref.length; m < len1; i = ++m) {
              param = ref[i];
              if (param.stringValueType === "sceneId" && ((ref1 = command.params.parameters) != null ? ref1.values[i] : void 0)) {
                sceneDocument = DataManager.getDocument(command.params.parameters.values[i]);
                if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
                  this.loadedScenesByUid[sceneDocument.uid] = true;
                  this._loadEventCommandsGraphics(sceneDocument.items.commands);
                }
              }
            }
            if (!this.loadedCommonEventsById[command.params.commonEventId]) {
              this.loadedCommonEventsById[command.params.commonEventId] = true;
              this._loadEventCommandsGraphics(commonEvent.commands);
            }
          }
          break;
        case "vn.CallScene":
          sceneDocument = DataManager.getDocument(command.params.scene.uid);
          if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
            this.loadedScenesByUid[sceneDocument.uid] = true;
            this._loadEventCommandsGraphics(sceneDocument.items.commands);
          }
          break;
        case "gs.ChangeTransition":
          ResourceManager.getBitmap("Graphics/Masks/" + ((ref2 = command.params.graphic) != null ? ref2.name : void 0));
          break;
        case "gs.ScreenTransition":
          ResourceManager.getBitmap("Graphics/Masks/" + ((ref3 = command.params.graphic) != null ? ref3.name : void 0));
          break;
        case "vn.ChangeBackground":
          if (command.params.graphic != null) {
            ResourceManager.getBitmap("Graphics/Backgrounds/" + command.params.graphic.name);
          }
          if (((ref4 = command.params.animation) != null ? ref4.type : void 0) === gs.AnimationTypes.MASKING && ((ref5 = command.params.animation.mask) != null ? ref5.graphic : void 0)) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.animation.mask.graphic.name);
          }
          break;
        case "vn.L2DJoinScene":
          if (command.params.model != null) {
            ResourceManager.getLive2DModel("Live2D/" + command.params.model.name);
          }
          break;
        case "vn.CharacterJoinScene":
          character = RecordManager.characters[command.params.characterId];
          if (character != null) {
            expressionId = (ref6 = command.params.expressionId) != null ? ref6 : character.defaultExpressionId;
            if (expressionId != null) {
              record = RecordManager.characterExpressions[expressionId];
              if (record != null) {
                if (record.idle) {
                  ref7 = record.idle;
                  for (n = 0, len2 = ref7.length; n < len2; n++) {
                    image = ref7[n];
                    ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
                  }
                }
                if (record.talking) {
                  ref8 = record.talking;
                  for (p = 0, len3 = ref8.length; p < len3; p++) {
                    image = ref8[p];
                    ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
                  }
                }
              }
            }
          }
          if (command.params.animation.type === gs.AnimationTypes.MASKING && (command.params.animation.mask.graphic != null)) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.animation.mask.graphic.name);
          }
          break;
        case "vn.CharacterChangeExpression":
          record = RecordManager.characterExpressions[command.params.expressionId];
          if (record != null) {
            ref9 = record.idle;
            for (q = 0, len4 = ref9.length; q < len4; q++) {
              image = ref9[q];
              ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
            }
            ref10 = record.talking;
            for (r = 0, len5 = ref10.length; r < len5; r++) {
              image = ref10[r];
              ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
            }
          }
          if (command.params.animation.type === gs.AnimationTypes.MASKING && (command.params.animation.mask.graphic != null)) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.animation.mask.graphic.name);
          }
          break;
        case "gs.ShowPartialMessage":
          if (command.params.voice != null) {
            AudioManager.loadSound(command.params.voice);
          }
          break;
        case "vn.Choice":
          if (command.params.action.scene) {
            sceneDocument = DataManager.getDocument(command.params.action.scene.uid);
            if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
              this.loadedScenesByUid[sceneDocument.uid] = true;
              this._loadEventCommandsGraphics(sceneDocument.items.commands);
            }
          }
          break;
        case "gs.ShowMessage":
        case "gs.ShowMessageNVL":
        case "gs.ShowText":
          if (command.params.animations != null) {
            ref11 = command.params.animations;
            for (s = 0, len6 = ref11.length; s < len6; s++) {
              eid = ref11[s];
              animation = RecordManager.animations[eid];
              if ((animation != null) && animation.graphic.name) {
                ResourceManager.getBitmap("Graphics/Pictures/" + animation.graphic.name);
              }
            }
          }
          if (command.params.expressions != null) {
            ref12 = command.params.expressions;
            for (t = 0, len7 = ref12.length; t < len7; t++) {
              eid = ref12[t];
              expression = RecordManager.characterExpressions[eid];
              if (expression != null) {
                if (expression.idle) {
                  ref13 = expression.idle;
                  for (u = 0, len8 = ref13.length; u < len8; u++) {
                    image = ref13[u];
                    ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
                  }
                }
                if (expression.talking) {
                  ref14 = expression.talking;
                  for (v = 0, len9 = ref14.length; v < len9; v++) {
                    image = ref14[v];
                    ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
                  }
                }
              }
            }
          }
          if (command.params.voice != null) {
            AudioManager.loadSound(command.params.voice);
          }
          record = RecordManager.characterExpressions[command.params.expressionId];
          if (record != null) {
            if (record.idle) {
              ref15 = record.idle;
              for (w = 0, len10 = ref15.length; w < len10; w++) {
                image = ref15[w];
                ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
              }
            }
            if (record.talking) {
              ref16 = record.talking;
              for (x = 0, len11 = ref16.length; x < len11; x++) {
                image = ref16[x];
                ResourceManager.getBitmap("Graphics/Characters/" + image.resource.name);
              }
            }
          }
          break;
        case "gs.AddHotspot":
          if ((command.params.baseGraphic != null) && (command.params.baseGraphic.name != null)) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.baseGraphic.name);
          }
          if ((command.params.hoverGraphic != null) && (command.params.hoverGraphic.name != null)) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.hoverGraphic.name);
          }
          if ((command.params.selectedGraphic != null) && (command.params.selectedGraphic.name != null)) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.selectedGraphic.name);
          }
          if ((command.params.selectedHoverGraphic != null) && (command.params.selectedHoverGraphic.name != null)) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.selectedHoverGraphic.name);
          }
          if ((command.params.unselectedGraphic != null) && (command.params.unselectedGraphic.name != null)) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.unselectedGraphic.name);
          }
          if (command.params.actions != null) {
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onClick.commonEventId);
            }
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onEnter.commonEventId);
            }
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onLeave.commonEventId);
            }
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onSelect.commonEventId);
            }
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDeselect.commonEventId);
            }
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDrag.commonEventId);
            }
          }
          break;
        case "gs.ShowPicture":
          if (command.params.graphic != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.graphic.name);
          }
          if (((ref17 = command.params.animation) != null ? ref17.type : void 0) === gs.AnimationTypes.MASKING) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.animation.mask.graphic.name);
          }
          break;
        case "gs.ShowImageMap":
          if (command.params.ground != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.ground.name);
          }
          if (command.params.hover != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.hover.name);
          }
          if (command.params.unselected != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.unselected.name);
          }
          if (command.params.selected != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.selected.name);
          }
          if (command.params.selectedHover != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.selectedHover.name);
          }
          ref18 = command.params.hotspots;
          for (y = 0, len12 = ref18.length; y < len12; y++) {
            hotspot = ref18[y];
            AudioManager.loadSound(hotspot.data.onHoverSound);
            AudioManager.loadSound(hotspot.data.onClickSound);
            if (hotspot.data.action === 2) {
              commonEvent = RecordManager.commonEvents[hotspot.data.commonEventId];
              if ((commonEvent != null) && !this.loadedCommonEventsById[hotspot.data.commonEventId]) {
                this.loadedCommonEventsById[hotspot.data.commonEventId] = true;
                this._loadEventCommandsGraphics(commonEvent.commands);
              }
            }
          }
          break;
        case "gs.MovePicturePath":
        case "vn.MoveCharacterPath":
        case "vn.ScrollBackgroundPath":
        case "gs.MoveVideoPath":
          if (command.params.path.effects != null) {
            ref19 = command.params.path.effects.data;
            for (z = 0, len13 = ref19.length; z < len13; z++) {
              effect = ref19[z];
              AudioManager.loadSound(effect.sound);
            }
          }
          break;
        case "gs.MaskPicture":
        case "vn.MaskCharacter":
        case "vn.MaskBackground":
        case "gs.MaskVideo":
          if (command.params.mask.sourceType === 0 && (command.params.mask.graphic != null)) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.mask.graphic.name);
          }
          if (command.params.mask.sourceType === 1 && (command.params.mask.video != null)) {
            ResourceManager.getVideo("Movies/" + command.params.mask.video.name);
          }
          break;
        case "gs.PlayPictureAnimation":
          animationId = command.params.animationId;
          if ((animationId != null) && (animationId.scope == null)) {
            animation = RecordManager.animations[animationId];
            if (animation && animation.graphic) {
              ResourceManager.getBitmap("Graphics/Pictures/" + animation.graphic.name);
            }
          }
          break;
        case "gs.ShowBattleAnimation":
          animationId = command.params.animationId;
          if ((animationId != null) && (animationId.scope == null)) {
            animation = RecordManager.animations[animationId];
            this.loadComplexAnimation(animation);
          }
          break;
        case "gs.InputName":
          actorId = command.params.actorId;
          if ((actorId != null) && (actorId.scope == null)) {
            actor = RecordManager.actors[actorId];
            if (actor != null) {
              ResourceManager.getBitmap("Graphics/Faces/" + ((ref20 = actor.faceGraphic) != null ? ref20.name : void 0));
            }
          }
          break;
        case "gs.ChangeTileset":
          if (command.params.graphic != null) {
            ResourceManager.getBitmap("Graphics/Tilesets/" + command.params.graphic.name);
          }
          break;
        case "gs.ChangeMapParallaxBackground":
          if (command.params.parallaxBackground != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.parallaxBackground.name);
          }
          break;
        case "gs.ChangeActorGraphic":
          if (command.params.changeCharacter && (command.params.characterGraphic != null)) {
            ResourceManager.getBitmap("Graphics/Characters/" + command.params.characterGraphic.name);
          }
          if (command.params.changeFace && (command.params.faceGraphic != null)) {
            ResourceManager.getBitmap("Graphics/Faces/" + command.params.faceGraphic.name);
          }
          break;
        case "gs.MoveEvent":
          ref21 = command.params.commands;
          for (i1 = 0, len14 = ref21.length; i1 < len14; i1++) {
            moveCommand = ref21[i1];
            switch (moveCommand.id) {
              case 44:
                ResourceManager.getBitmap("Graphics/Characters/" + moveCommand.resource.name);
                break;
              case 47:
                AudioManager.loadSound(moveCommand.resource);
            }
          }
          break;
        case "gs.TransformEnemy":
          if (((ref22 = command.params) != null ? ref22.targetId.scope : void 0) == null) {
            enemy = RecordManager.enemies[command.params.targetId];
            this.loadActorBattleAnimations(enemy);
          }
          break;
        case "gs.PlayMusic":
          if (command.params.music != null) {
            AudioManager.loadMusic(command.params.music);
          }
          break;
        case "gs.PlayVideo":
        case "gs.ShowVideo":
          if (command.params.video != null) {
            ResourceManager.getVideo("Movies/" + command.params.video.name);
          }
          if (((ref23 = command.params.animation) != null ? ref23.type : void 0) === gs.AnimationTypes.MASKING) {
            ResourceManager.getBitmap("Graphics/Masks/" + command.params.animation.mask.graphic.name);
          }
          break;
        case "gs.PlaySound":
          if (command.params.sound != null) {
            AudioManager.loadSound(command.params.sound);
            ResourceManager.getAudioBuffer("Audio/Sound/" + command.params.sound.name);
          }
          break;
        case "vn.ChangeSounds":
          ref24 = command.params.sounds;
          for (j1 = 0, len15 = ref24.length; j1 < len15; j1++) {
            sound = ref24[j1];
            if (sound != null) {
              AudioManager.loadSound(sound);
            }
          }
          break;
        case "gs.ChangeScreenCursor":
          if (((ref25 = command.params.graphic) != null ? ref25.name : void 0) != null) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.graphic.name);
          }
      }
    }
    return null;
  };


  /**
  * Loads all resources for the specified animation.
  *
  * @method loadAnimation
  * @param {Object} animation - The animation-record.
  * @static
   */

  ResourceLoader.prototype.loadAnimation = function(animation) {
    if ((animation != null) && (animation.graphic != null)) {
      return ResourceManager.getBitmap("Graphics/SimpleAnimations/" + animation.graphic.name);
    }
  };

  return ResourceLoader;

})();

gs.ResourceLoader = new ResourceLoader();

window.ResourceLoader = gs.ResourceLoader;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7Ozs7RUFVYSx3QkFBQTtJQUNULElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtJQUNyQixJQUFDLENBQUEsc0JBQUQsR0FBMEI7RUFGakI7OztBQUliOzs7Ozs7OzsyQkFPQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQ7QUFDakIsUUFBQTtBQUFBLFNBQUEsVUFBQTtNQUNJLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUFNLENBQUEsQ0FBQSxDQUE1QjtBQURKO0FBR0EsV0FBTztFQUpVOzs7QUFNckI7Ozs7Ozs7OzJCQU9BLHdCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0FBQUEsU0FBQSxXQUFBO01BQ0ksSUFBRyxDQUFBLEtBQUssT0FBTCxJQUFnQixDQUFBLEtBQUssV0FBeEI7UUFDSSxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsTUFBTyxDQUFBLENBQUEsQ0FBdEQsRUFESjtPQUFBLE1BRUssSUFBRyxDQUFBLEtBQUssT0FBUjtRQUNELGVBQWUsQ0FBQyxRQUFoQixDQUF5QixTQUFBLEdBQVUsTUFBTyxDQUFBLENBQUEsQ0FBMUMsRUFEQzs7QUFIVDtBQUtBLFdBQU87RUFOZTs7O0FBUTFCOzs7Ozs7OzsyQkFPQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQ7QUFDdEIsUUFBQTtBQUFBLFNBQUEsV0FBQTtNQUNJLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBUCxZQUFxQixLQUF4QjtBQUNJO0FBQUEsYUFBQSxxQ0FBQTs7QUFDSSxlQUFBLE1BQUE7WUFDSSxJQUFHLENBQUEsS0FBSyxPQUFMLElBQWdCLENBQUEsS0FBSyxXQUF4QjtjQUNJLEtBQUEsR0FBUSxDQUFFLENBQUEsQ0FBQTtjQUVWLG9CQUFHLEtBQUssQ0FBRSxVQUFQLENBQWtCLE9BQWxCLFVBQUg7Z0JBQ0ksZUFBZSxDQUFDLFNBQWhC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QUFBLDhDQUFBOztZQUNJLElBQUcsYUFBSDtjQUNJLFlBQVksQ0FBQyxTQUFiLENBQXVCLEtBQXZCLEVBREo7O0FBREo7QUFEQztBQXJOVCxhQTBOUyx1QkExTlQ7VUEyTlEsSUFBRyx3RUFBSDtZQUNJLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixvQkFBQSxHQUFxQixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUF0RSxFQURKOztBQTNOUjtBQURKO0FBOE5BLFdBQU87RUFqT2lCOzs7QUFtTzVCOzs7Ozs7OzsyQkFPQSxhQUFBLEdBQWUsU0FBQyxTQUFEO0lBQ1gsSUFBRyxtQkFBQSxJQUFlLDJCQUFsQjthQUNJLGVBQWUsQ0FBQyxTQUFoQixDQUEwQiw0QkFBQSxHQUE2QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQXpFLEVBREo7O0VBRFc7Ozs7OztBQU1uQixFQUFFLENBQUMsY0FBSCxHQUF3QixJQUFBLGNBQUEsQ0FBQTs7QUFDeEIsTUFBTSxDQUFDLGNBQVAsR0FBd0IsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBSZXNvdXJjZUxvYWRlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUmVzb3VyY2VMb2FkZXJcbiAgICAjIyMqXG4gICAgKiBUaGUgcmVzb3VyY2UgaGVscHMgdG8gbG9hZCBhIGJ1bmNoIG9mIHJlc291cmNlcyBmcm9tIGRpZmZlcmVudCBraW5kIG9mXG4gICAgKiBkYXRhIHN0cnVjdHVyZXMuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIFJlc291cmNlTG9hZGVyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHN0YXRpY1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBAbG9hZGVkU2NlbmVzQnlVaWQgPSB7fVxuICAgICAgICBAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZCA9IFtdXG4gICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGdyYXBoaWNzIGZvciB0aGUgc3BlY2lmaWVkIGxpc3Qgb2YgY3VzdG9tIGxheW91dCB0eXBlcy90ZW1wbGF0ZXNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRVaVR5cGVzR3JhcGhpY3NcbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IHR5cGVzIC0gQW4gYXJyYXkgb2YgY3VzdG9tIGxheW91dCB0eXBlcy90ZW1wbGF0ZXNcbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgXG4gICAgbG9hZFVpVHlwZXNHcmFwaGljczogKHR5cGVzKSAtPlxuICAgICAgICBmb3IgayBvZiB0eXBlc1xuICAgICAgICAgICAgQGxvYWRVaUxheW91dEdyYXBoaWNzKHR5cGVzW2tdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGdyYXBoaWNzIGZvciB0aGUgc3BlY2lmaWVkIGxheW91dC1kZXNjcmlwdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFVpR3JhcGhpY3NGcm9tT2JqZWN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGF5b3V0IC0gVGhlIGxheW91dCBkZXNjcmlwdG9yLlxuICAgICogQHN0YXRpY1xuICAgICMjIyBcbiAgICBsb2FkVWlHcmFwaGljc0Zyb21PYmplY3Q6IChsYXlvdXQpIC0+XG4gICAgICAgIGZvciBrIG9mIGxheW91dFxuICAgICAgICAgICAgaWYgayA9PSBcImltYWdlXCIgb3IgayA9PSBcImZ1bGxJbWFnZVwiXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7bGF5b3V0W2tdfVwiKVxuICAgICAgICAgICAgZWxzZSBpZiBrID09IFwidmlkZW9cIlxuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIk1vdmllcy8je2xheW91dFtrXX1cIikgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCBncmFwaGljcyBmb3IgdGhlIHNwZWNpZmllZCBsYXlvdXQtZGVzY3JpcHRvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRVaURhdGFGaWVsZHNHcmFwaGljc1xuICAgICogQHBhcmFtIHtPYmplY3R9IGxheW91dCAtIFRoZSBsYXlvdXQgZGVzY3JpcHRvci5cbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgICAgIFxuICAgIGxvYWRVaURhdGFGaWVsZHNHcmFwaGljczogKGxheW91dCkgLT5cbiAgICAgICAgZm9yIGsgb2YgbGF5b3V0XG4gICAgICAgICAgICBpZiBsYXlvdXRba10gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIGZvciBvIGluIGxheW91dFtrXVxuICAgICAgICAgICAgICAgICAgICBmb3IgaiBvZiBvXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBqID09IFwiaW1hZ2VcIiBvciBqID09IFwiZnVsbEltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IG9bal1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbWFnZT8uc3RhcnRzV2l0aChcImRhdGE6XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAob1tqXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je29bal19XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGdyYXBoaWNzIGZvciB0aGUgc3BlY2lmaWVkIGxheW91dC1kZXNjcmlwdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFVpRGF0YUZpZWxkc0dyYXBoaWNzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGF5b3V0IC0gVGhlIGxheW91dCBkZXNjcmlwdG9yLlxuICAgICogQHN0YXRpY1xuICAgICMjIyAgICAgXG4gICAgbG9hZFVpTGF5b3V0R3JhcGhpY3M6IChsYXlvdXQpIC0+XG4gICAgICAgIGlmIGxheW91dC5wcmVsb2FkP1xuICAgICAgICAgICAgaWYgbGF5b3V0LnByZWxvYWQuZ3JhcGhpY3M/XG4gICAgICAgICAgICAgICAgZm9yIGdyYXBoaWMgaW4gbGF5b3V0LnByZWxvYWQuZ3JhcGhpY3NcbiAgICAgICAgICAgICAgICAgICAgaWYgZ3JhcGhpYy5uYW1lP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIiN7Z3JhcGhpYy5mb2xkZXJ8fCdHcmFwaGljcy9QaWN0dXJlcyd9LyN7dWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUobnVsbCwgZ3JhcGhpYy5uYW1lKX1cIilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUobnVsbCwgZ3JhcGhpYy5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHN1YiBpbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzdWI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc3ViLCBncmFwaGljLmltYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbWFnZT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2ltYWdlfVwiKVxuICAgICAgICAgICAgaWYgbGF5b3V0LnByZWxvYWQudmlkZW9zP1xuICAgICAgICAgICAgICAgIGZvciB2aWRlbyBpbiBsYXlvdXQucHJlbG9hZC52aWRlb3NcbiAgICAgICAgICAgICAgICAgICAgaWYgdmlkZW8ubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIiN7dmlkZW8uZm9sZGVyfHwnTW92aWVzJ30vI3t2aWRlby5uYW1lfVwiKVxuICAgICAgICAgICAgaWYgbGF5b3V0LnByZWxvYWQubXVzaWM/XG4gICAgICAgICAgICAgICAgZm9yIG11c2ljIGluIGxheW91dC5wcmVsb2FkLm11c2ljXG4gICAgICAgICAgICAgICAgICAgIGlmIG11c2ljP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldFZpZGVvKFwiI3ttdXNpYy5mb2xkZXJ8fCdBdWRpby9NdXNpYyd9LyN7bXVzaWMubmFtZSB8fCBtdXNpY31cIilcbiAgICAgICAgICAgIGlmIGxheW91dC5wcmVsb2FkLnNvdW5kcz9cbiAgICAgICAgICAgICAgICBmb3Igc291bmQgaW4gbGF5b3V0LnByZWxvYWQuc291bmRzXG4gICAgICAgICAgICAgICAgICAgIGlmIHNvdW5kP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiI3tzb3VuZC5mb2xkZXJ8fCdBdWRpby9Tb3VuZHMnfS8je3VpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGxheW91dCwgc291bmQubmFtZSB8fCBzb3VuZCl9XCIpXG4gICAgICAgIGlmIGxheW91dC5pbWFnZXM/XG4gICAgICAgICAgICBmb3IgaW1hZ2UgaW4gbGF5b3V0LmltYWdlc1xuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2ltYWdlfVwiKVxuICAgICAgICBpZiBsYXlvdXQuYW5pbWF0aW9ucz9cbiAgICAgICAgICAgIGZvciBkZXNjcmlwdG9yIGluIGxheW91dC5hbmltYXRpb25zXG4gICAgICAgICAgICAgICAgZm9yIGFuaW1hdGlvbiBpbiBkZXNjcmlwdG9yLmZsb3dcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGFuaW1hdGlvbi50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIFwic291bmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIkF1ZGlvL1NvdW5kcy8je2FuaW1hdGlvbi5zb3VuZH1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gXCJjaGFuZ2VJbWFnZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbWFnZSBpbiBhbmltYXRpb24uaW1hZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2ltYWdlfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBcIm1hc2tUb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7YW5pbWF0aW9uLm1hc2t9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbi5zb3VuZD9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIkF1ZGlvL1NvdW5kcy8je2FuaW1hdGlvbi5zb3VuZH1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgbGF5b3V0LmltYWdlP1xuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7bGF5b3V0LmltYWdlfVwiKVxuICAgICAgICBpZiBsYXlvdXQudmlkZW8/XG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCJNb3ZpZXMvI3tsYXlvdXQudmlkZW99XCIpXG4gICAgICAgIGlmIGxheW91dC5jdXN0b21GaWVsZHM/XG4gICAgICAgICAgICBAbG9hZFVpR3JhcGhpY3NGcm9tT2JqZWN0KGxheW91dC5jdXN0b21GaWVsZHMpXG4gICAgICAgIGlmIGxheW91dC5jdXN0b21GaWVsZHM/LmFjdGlvbnM/XG4gICAgICAgICAgICBmb3IgYWN0aW9uIGluIGxheW91dC5jdXN0b21GaWVsZHMuYWN0aW9uc1xuICAgICAgICAgICAgICAgIGlmIGFjdGlvbi5uYW1lID09IFwicGxheVZvaWNlXCIgb3IgYWN0aW9uLm5hbWUgPT0gXCJwbGF5U291bmRcIlxuICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGFjdGlvbi5wYXJhbXMubmFtZSlcbiAgICAgICAgaWYgbGF5b3V0LmFjdGlvbnM/IG9yIGxheW91dC5hY3Rpb24/XG4gICAgICAgICAgICBhY3Rpb25zID0gaWYgbGF5b3V0LmFjdGlvbj8gdGhlbiBbbGF5b3V0LmFjdGlvbl0gZWxzZSBsYXlvdXQuYWN0aW9uc1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLm5hbWUgPT0gXCJwbGF5Vm9pY2VcIiBvciBhY3Rpb24ubmFtZSA9PSBcInBsYXlTb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoYWN0aW9uLnBhcmFtcy5uYW1lKVxuICAgICAgICBpZiBsYXlvdXQucGFyYW1zXG4gICAgICAgICAgICBAbG9hZFVpTGF5b3V0R3JhcGhpY3MobGF5b3V0LnBhcmFtcylcbiAgICAgICAgaWYgbGF5b3V0LnRlbXBsYXRlP1xuICAgICAgICAgICAgQGxvYWRVaUxheW91dEdyYXBoaWNzKGxheW91dC50ZW1wbGF0ZSlcbiAgICAgICAgaWYgbGF5b3V0LnN0eWxlPyBhbmQgdWkuVWlGYWN0b3J5LnN0eWxlc1tsYXlvdXQuc3R5bGVdP1xuICAgICAgICAgICAgQGxvYWRVaUxheW91dEdyYXBoaWNzKHVpLlVpRmFjdG9yeS5zdHlsZXNbbGF5b3V0LnN0eWxlXSlcbiAgICAgICAgICAgIGZvciBzZWwgb2YgdWkuVUlNYW5hZ2VyLnNlbGVjdG9yc1xuICAgICAgICAgICAgICAgIHN0eWxlID0gdWkuVUlNYW5hZ2VyLnN0eWxlc1tsYXlvdXQuc3R5bGUgKyBcIjpcIitzZWxdXG4gICAgICAgICAgICAgICAgaWYgc3R5bGUgdGhlbiBAbG9hZFVpTGF5b3V0R3JhcGhpY3Moc3R5bGUpXG4gICAgICAgIGlmIHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tsYXlvdXQudHlwZV0/XG4gICAgICAgICAgICBAbG9hZFVpTGF5b3V0R3JhcGhpY3ModWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzW2xheW91dC50eXBlXSlcbiAgICAgICAgaWYgbGF5b3V0LmNvbnRyb2xzP1xuICAgICAgICAgICAgZm9yIGNvbnRyb2wgaW4gbGF5b3V0LmNvbnRyb2xzXG4gICAgICAgICAgICAgICAgQGxvYWRVaUxheW91dEdyYXBoaWNzKGNvbnRyb2wpXG4gICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIHN5c3RlbSBzb3VuZHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkU3lzdGVtU291bmRzXG4gICAgKiBAc3RhdGljXG4gICAgIyMjICAgICAgICAgICAgICAgIFxuICAgIGxvYWRTeXN0ZW1Tb3VuZHM6IC0+XG4gICAgICAgIGZvciBzb3VuZCBpbiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5zb3VuZHNcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoc291bmQpXG4gICAgIFxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCBzeXN0ZW0gZ3JhcGhpY3MuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkU3lzdGVtR3JhcGhpY3NcbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgICAgIFxuICAgIGxvYWRTeXN0ZW1HcmFwaGljczogLT5cbiAgICAgICAgZm9yIHNsb3QgaW4gR2FtZU1hbmFnZXIuc2F2ZUdhbWVTbG90c1xuICAgICAgICAgICAgaWYgc2xvdC50aHVtYj8gYW5kIHNsb3QudGh1bWIubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoc2xvdC50aHVtYilcbiAgICAgICAgaWYgUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yPy5uYW1lXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jdXJzb3IubmFtZX1cIilcbiAgICAgICAgaWYgUmVjb3JkTWFuYWdlci5zeXN0ZW0udGl0bGVTY3JlZW4/Lm5hbWVcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je1JlY29yZE1hbmFnZXIuc3lzdGVtLnRpdGxlU2NyZWVuLm5hbWV9XCIpXG4gICAgICAgIGlmIFJlY29yZE1hbmFnZXIuc3lzdGVtLmxhbmd1YWdlU2NyZWVuPy5uYW1lXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tSZWNvcmRNYW5hZ2VyLnN5c3RlbS5sYW5ndWFnZVNjcmVlbi5uYW1lfVwiKVxuICAgICAgICBpZiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5tZW51QmFja2dyb3VuZD8ubmFtZVxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7UmVjb3JkTWFuYWdlci5zeXN0ZW0ubWVudUJhY2tncm91bmQubmFtZX1cIilcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBMb2FkcyBhbGwgcmVzb3VyY2VzIG5lZWRlZCBieSB0aGUgc3BlY2lmaWVkIGxpc3Qgb2YgY29tbWFuZHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSBjb21tYW5kcyAtIFRoZSBsaXN0IG9mIGNvbW1hbmRzLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gSW5kaWNhdGVzIGlmIGRhdGEgbmVlZHMgdG8gYmUgbG9hZGVkLiBcbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgXG4gICAgbG9hZEV2ZW50Q29tbWFuZHNEYXRhOiAoY29tbWFuZHMpIC0+XG4gICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZCA9IHt9XG4gICAgICAgIHJldHVybiBAX2xvYWRFdmVudENvbW1hbmRzRGF0YShjb21tYW5kcylcbiAgICAgICAgXG4gICAgX2xvYWRFdmVudENvbW1hbmRzRGF0YTogKGNvbW1hbmRzKSAtPlxuICAgICAgICByZXR1cm4gbm8gaWYgbm90IGNvbW1hbmRzP1xuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgXG4gICAgICAgIGZvciBjb21tYW5kIGluIGNvbW1hbmRzXG4gICAgICAgICAgICBzd2l0Y2ggY29tbWFuZC5pZFxuICAgICAgICAgICAgICAgIHdoZW4gXCJ2bi5DaG9pY2VcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb24uc2NlbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lRG9jdW1lbnQgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChjb21tYW5kLnBhcmFtcy5hY3Rpb24uc2NlbmUudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICFzY2VuZURvY3VtZW50LmxvYWRlZCBpZiAhcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudC5sb2FkZWQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQF9sb2FkRXZlbnRDb21tYW5kc0RhdGEoc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcykgaWYgIXJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNhbGxTY2VuZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoY29tbWFuZC5wYXJhbXMuc2NlbmUudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICFzY2VuZURvY3VtZW50LmxvYWRlZCBpZiAhcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudC5sb2FkZWQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQF9sb2FkRXZlbnRDb21tYW5kc0RhdGEoc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcykgaWYgIXJlc3VsdFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAgXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVsb2FkcyBhbGwgcmVzb3VyY2VzIG5lZWRlZCBieSB0aGUgc3BlY2lmaWVkIGNvbW1vbiBldmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRDb21tb25FdmVudFJlc291cmNlc1xuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50SWQgLSBJRCBvZiB0aGUgY29tbW9uIGV2ZW50IHRvIHByZWxvYWQgdGhlIHJlc291cmNlcyBmb3IuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjICAgIFxuICAgIGxvYWRDb21tb25FdmVudFJlc291cmNlczogKGV2ZW50SWQpIC0+XG4gICAgICAgIGNvbW1vbkV2ZW50ID0gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHNbZXZlbnRJZF1cbiAgICAgICAgaWYgY29tbW9uRXZlbnQ/IGFuZCAhQGxvYWRlZENvbW1vbkV2ZW50c0J5SWRbZXZlbnRJZF1cbiAgICAgICAgICAgIEBsb2FkZWRDb21tb25FdmVudHNCeUlkW2V2ZW50SWRdID0gdHJ1ZVxuICAgICAgICAgICAgQF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKGNvbW1vbkV2ZW50LmNvbW1hbmRzKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIHJlc291cmNlcyBuZWVkZWQgYnkgdGhlIHNwZWNpZmllZCBsaXN0IG9mIGNvbW1hbmRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljc1xuICAgICogQHBhcmFtIHtPYmplY3RbXX0gY29tbWFuZHMgLSBUaGUgbGlzdCBvZiBjb21tYW5kcy5cbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgICAgIFxuICAgIGxvYWRFdmVudENvbW1hbmRzR3JhcGhpY3M6IChjb21tYW5kcykgLT5cbiAgICAgICAgQGxvYWRlZFNjZW5lc0J5VWlkID0ge31cbiAgICAgICAgQGxvYWRlZENvbW1vbkV2ZW50c0J5SWQgPSBbXVxuICAgICAgICBAX2xvYWRFdmVudENvbW1hbmRzR3JhcGhpY3MoY29tbWFuZHMpXG4gICAgICAgIFxuICAgIF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzOiAoY29tbWFuZHMpIC0+XG4gICAgICAgIHJldHVybiBpZiBub3QgY29tbWFuZHM/XG4gICAgICAgIFxuICAgICAgICBmb3IgY29tbWFuZCBpbiBjb21tYW5kc1xuICAgICAgICAgICAgc3dpdGNoIGNvbW1hbmQuaWRcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU3RhcnRUaW1lclwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbi50eXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9uLmRhdGEuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuQ2FsbENvbW1vbkV2ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uRXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1tjb21tYW5kLnBhcmFtcy5jb21tb25FdmVudElkXVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tb25FdmVudD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBwYXJhbSwgaSBpbiBjb21tb25FdmVudC5wYXJhbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyYW0uc3RyaW5nVmFsdWVUeXBlID09IFwic2NlbmVJZFwiIGFuZCBjb21tYW5kLnBhcmFtcy5wYXJhbWV0ZXJzPy52YWx1ZXNbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVEb2N1bWVudCA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KGNvbW1hbmQucGFyYW1zLnBhcmFtZXRlcnMudmFsdWVzW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzY2VuZURvY3VtZW50IGFuZCAhQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKHNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAhQGxvYWRlZENvbW1vbkV2ZW50c0J5SWRbY29tbWFuZC5wYXJhbXMuY29tbW9uRXZlbnRJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZFtjb21tYW5kLnBhcmFtcy5jb21tb25FdmVudElkXSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAX2xvYWRFdmVudENvbW1hbmRzR3JhcGhpY3MoY29tbW9uRXZlbnQuY29tbWFuZHMpXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNhbGxTY2VuZVwiXG4gICAgICAgICAgICAgICAgICAgIHNjZW5lRG9jdW1lbnQgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChjb21tYW5kLnBhcmFtcy5zY2VuZS51aWQpXG4gICAgICAgICAgICAgICAgICAgIGlmIHNjZW5lRG9jdW1lbnQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBAX2xvYWRFdmVudENvbW1hbmRzR3JhcGhpY3Moc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcylcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVHJhbnNpdGlvblwiXG4gICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9NYXNrcy8je2NvbW1hbmQucGFyYW1zLmdyYXBoaWM/Lm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlNjcmVlblRyYW5zaXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3tjb21tYW5kLnBhcmFtcy5ncmFwaGljPy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VCYWNrZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9CYWNrZ3JvdW5kcy8je2NvbW1hbmQucGFyYW1zLmdyYXBoaWMubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uPy50eXBlID09IGdzLkFuaW1hdGlvblR5cGVzLk1BU0tJTkcgYW5kIGNvbW1hbmQucGFyYW1zLmFuaW1hdGlvbi5tYXNrPy5ncmFwaGljXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3tjb21tYW5kLnBhcmFtcy5hbmltYXRpb24ubWFzay5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkwyREpvaW5TY2VuZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLm1vZGVsP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldExpdmUyRE1vZGVsKFwiTGl2ZTJELyN7Y29tbWFuZC5wYXJhbXMubW9kZWwubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVySm9pblNjZW5lXCJcbiAgICAgICAgICAgICAgICAgICAgY2hhcmFjdGVyID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2NvbW1hbmQucGFyYW1zLmNoYXJhY3RlcklkXVxuICAgICAgICAgICAgICAgICAgICBpZiBjaGFyYWN0ZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uSWQgPSBjb21tYW5kLnBhcmFtcy5leHByZXNzaW9uSWQgPyBjaGFyYWN0ZXIuZGVmYXVsdEV4cHJlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbklkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbZXhwcmVzc2lvbklkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlY29yZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVjb3JkLmlkbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbWFnZSBpbiByZWNvcmQuaWRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9DaGFyYWN0ZXJzLyN7aW1hZ2UucmVzb3VyY2UubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVjb3JkLnRhbGtpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbWFnZSBpbiByZWNvcmQudGFsa2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9DaGFyYWN0ZXJzLyN7aW1hZ2UucmVzb3VyY2UubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lORyBhbmQgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9NYXNrcy8je2NvbW1hbmQucGFyYW1zLmFuaW1hdGlvbi5tYXNrLmdyYXBoaWMubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyQ2hhbmdlRXhwcmVzc2lvblwiXG4gICAgICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbY29tbWFuZC5wYXJhbXMuZXhwcmVzc2lvbklkXVxuICAgICAgICAgICAgICAgICAgICBpZiByZWNvcmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW1hZ2UgaW4gcmVjb3JkLmlkbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy8je2ltYWdlLnJlc291cmNlLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW1hZ2UgaW4gcmVjb3JkLnRhbGtpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy8je2ltYWdlLnJlc291cmNlLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFuaW1hdGlvbi50eXBlID09IGdzLkFuaW1hdGlvblR5cGVzLk1BU0tJTkcgYW5kIGNvbW1hbmQucGFyYW1zLmFuaW1hdGlvbi5tYXNrLmdyYXBoaWM/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3tjb21tYW5kLnBhcmFtcy5hbmltYXRpb24ubWFzay5ncmFwaGljLm5hbWV9XCIpICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1BhcnRpYWxNZXNzYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMudm9pY2U/XG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGNvbW1hbmQucGFyYW1zLnZvaWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgI1Jlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIkF1ZGlvL1NvdW5kLyN7Y29tbWFuZC5wYXJhbXMudm9pY2UubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNob2ljZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbi5zY2VuZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVEb2N1bWVudCA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KGNvbW1hbmQucGFyYW1zLmFjdGlvbi5zY2VuZS51aWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzY2VuZURvY3VtZW50IGFuZCAhQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAX2xvYWRFdmVudENvbW1hbmRzR3JhcGhpY3Moc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcylcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5TaG93TWVzc2FnZVwiLCBcImdzLlNob3dNZXNzYWdlTlZMXCIsIFwiZ3MuU2hvd1RleHRcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hbmltYXRpb25zP1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGVpZCBpbiBjb21tYW5kLnBhcmFtcy5hbmltYXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW2VpZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24/IGFuZCBhbmltYXRpb24uZ3JhcGhpYy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5leHByZXNzaW9ucz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBlaWQgaW4gY29tbWFuZC5wYXJhbXMuZXhwcmVzc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tlaWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbi5pZGxlIHRoZW4gZm9yIGltYWdlIGluIGV4cHJlc3Npb24uaWRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3tpbWFnZS5yZXNvdXJjZS5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBleHByZXNzaW9uLnRhbGtpbmcgdGhlbiBmb3IgaW1hZ2UgaW4gZXhwcmVzc2lvbi50YWxraW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy8je2ltYWdlLnJlc291cmNlLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnZvaWNlP1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChjb21tYW5kLnBhcmFtcy52b2ljZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICNSZXNvdXJjZU1hbmFnZXIuZ2V0QXVkaW9CdWZmZXIoXCJBdWRpby9Tb3VuZC8je2NvbW1hbmQucGFyYW1zLnZvaWNlLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbY29tbWFuZC5wYXJhbXMuZXhwcmVzc2lvbklkXVxuICAgICAgICAgICAgICAgICAgICBpZiByZWNvcmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZWNvcmQuaWRsZSB0aGVuIGZvciBpbWFnZSBpbiByZWNvcmQuaWRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9DaGFyYWN0ZXJzLyN7aW1hZ2UucmVzb3VyY2UubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlY29yZC50YWxraW5nIHRoZW4gZm9yIGltYWdlIGluIHJlY29yZC50YWxraW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3tpbWFnZS5yZXNvdXJjZS5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkFkZEhvdHNwb3RcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5iYXNlR3JhcGhpYz8gYW5kIGNvbW1hbmQucGFyYW1zLmJhc2VHcmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5iYXNlR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ob3ZlckdyYXBoaWM/IGFuZCBjb21tYW5kLnBhcmFtcy5ob3ZlckdyYXBoaWMubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2NvbW1hbmQucGFyYW1zLmhvdmVyR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEdyYXBoaWM/IGFuZCBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEdyYXBoaWMubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2NvbW1hbmQucGFyYW1zLnNlbGVjdGVkR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyR3JhcGhpYz8gYW5kIGNvbW1hbmQucGFyYW1zLnNlbGVjdGVkSG92ZXJHcmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy51bnNlbGVjdGVkR3JhcGhpYz8gYW5kIGNvbW1hbmQucGFyYW1zLnVuc2VsZWN0ZWRHcmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy51bnNlbGVjdGVkR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb25zP1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkNsaWNrLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkNsaWNrLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uQ2xpY2sudHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21tb25FdmVudFJlc291cmNlcyhjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uRW50ZXIuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25DbGljay50eXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzKGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25MZWF2ZS5jb21tb25FdmVudElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkNsaWNrLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vblNlbGVjdC5jb21tb25FdmVudElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkNsaWNrLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkRlc2VsZWN0LmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uQ2xpY2sudHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21tb25FdmVudFJlc291cmNlcyhjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uRHJhZy5jb21tb25FdmVudElkKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1BpY3R1cmVcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ncmFwaGljP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7Y29tbWFuZC5wYXJhbXMuZ3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hbmltYXRpb24/LnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lOR1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7Y29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5TaG93SW1hZ2VNYXBcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ncm91bmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5ncm91bmQubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuaG92ZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5ob3Zlci5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy51bnNlbGVjdGVkP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7Y29tbWFuZC5wYXJhbXMudW5zZWxlY3RlZC5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZD9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2NvbW1hbmQucGFyYW1zLnNlbGVjdGVkLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnNlbGVjdGVkSG92ZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGZvciBob3RzcG90IGluIGNvbW1hbmQucGFyYW1zLmhvdHNwb3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGhvdHNwb3QuZGF0YS5vbkhvdmVyU291bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGhvdHNwb3QuZGF0YS5vbkNsaWNrU291bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBob3RzcG90LmRhdGEuYWN0aW9uID09IDIgIyBDb21tb24gRXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tb25FdmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2hvdHNwb3QuZGF0YS5jb21tb25FdmVudElkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1vbkV2ZW50PyBhbmQgIUBsb2FkZWRDb21tb25FdmVudHNCeUlkW2hvdHNwb3QuZGF0YS5jb21tb25FdmVudElkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZFtob3RzcG90LmRhdGEuY29tbW9uRXZlbnRJZF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhjb21tb25FdmVudC5jb21tYW5kcylcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVBpY3R1cmVQYXRoXCIsIFwidm4uTW92ZUNoYXJhY3RlclBhdGhcIiwgXCJ2bi5TY3JvbGxCYWNrZ3JvdW5kUGF0aFwiLCBcImdzLk1vdmVWaWRlb1BhdGhcIiAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5wYXRoLmVmZmVjdHM/XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgZWZmZWN0IGluIGNvbW1hbmQucGFyYW1zLnBhdGguZWZmZWN0cy5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChlZmZlY3Quc291bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLk1hc2tQaWN0dXJlXCIsIFwidm4uTWFza0NoYXJhY3RlclwiLCBcInZuLk1hc2tCYWNrZ3JvdW5kXCIsIFwiZ3MuTWFza1ZpZGVvXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMubWFzay5zb3VyY2VUeXBlID09IDAgYW5kIGNvbW1hbmQucGFyYW1zLm1hc2suZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9NYXNrcy8je2NvbW1hbmQucGFyYW1zLm1hc2suZ3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5tYXNrLnNvdXJjZVR5cGUgPT0gMSBhbmQgY29tbWFuZC5wYXJhbXMubWFzay52aWRlbz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIk1vdmllcy8je2NvbW1hbmQucGFyYW1zLm1hc2sudmlkZW8ubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuUGxheVBpY3R1cmVBbmltYXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25JZCA9IGNvbW1hbmQucGFyYW1zLmFuaW1hdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbklkPyBhbmQgbm90IGFuaW1hdGlvbklkLnNjb3BlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc1thbmltYXRpb25JZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24gYW5kIGFuaW1hdGlvbi5ncmFwaGljXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlNob3dCYXR0bGVBbmltYXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25JZCA9IGNvbW1hbmQucGFyYW1zLmFuaW1hdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbklkPyBhbmQgbm90IGFuaW1hdGlvbklkLnNjb3BlP1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW2FuaW1hdGlvbklkXVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21wbGV4QW5pbWF0aW9uKGFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5JbnB1dE5hbWVcIlxuICAgICAgICAgICAgICAgICAgICBhY3RvcklkID0gY29tbWFuZC5wYXJhbXMuYWN0b3JJZFxuICAgICAgICAgICAgICAgICAgICBpZiBhY3RvcklkPyBhbmQgbm90IGFjdG9ySWQuc2NvcGU/XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RvciA9IFJlY29yZE1hbmFnZXIuYWN0b3JzW2FjdG9ySWRdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhY3Rvcj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvRmFjZXMvI3thY3Rvci5mYWNlR3JhcGhpYz8ubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVRpbGVzZXRcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ncmFwaGljP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1RpbGVzZXRzLyN7Y29tbWFuZC5wYXJhbXMuZ3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VNYXBQYXJhbGxheEJhY2tncm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5wYXJhbGxheEJhY2tncm91bmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5wYXJhbGxheEJhY2tncm91bmQubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlQWN0b3JHcmFwaGljXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuY2hhbmdlQ2hhcmFjdGVyIGFuZCBjb21tYW5kLnBhcmFtcy5jaGFyYWN0ZXJHcmFwaGljP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3tjb21tYW5kLnBhcmFtcy5jaGFyYWN0ZXJHcmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmNoYW5nZUZhY2UgYW5kIGNvbW1hbmQucGFyYW1zLmZhY2VHcmFwaGljP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0ZhY2VzLyN7Y29tbWFuZC5wYXJhbXMuZmFjZUdyYXBoaWMubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZUV2ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgZm9yIG1vdmVDb21tYW5kIGluIGNvbW1hbmQucGFyYW1zLmNvbW1hbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggbW92ZUNvbW1hbmQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDQ0ICMgQ2hhbmdlIEdyYXBoaWNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3ttb3ZlQ29tbWFuZC5yZXNvdXJjZS5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNDcgIyBQbGF5IFNvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQobW92ZUNvbW1hbmQucmVzb3VyY2UpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlRyYW5zZm9ybUVuZW15XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGNvbW1hbmQucGFyYW1zPy50YXJnZXRJZC5zY29wZT8gIyBGSVhNRTogTWF5YmUganVzdCB1c2UgdGhlIGN1cnJlbnQgdmFyaWFibGUgdmFsdWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmVteSA9IFJlY29yZE1hbmFnZXIuZW5lbWllc1tjb21tYW5kLnBhcmFtcy50YXJnZXRJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQWN0b3JCYXR0bGVBbmltYXRpb25zKGVuZW15KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5TXVzaWNcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5tdXNpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkTXVzaWMoY29tbWFuZC5wYXJhbXMubXVzaWMpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlWaWRlb1wiLCBcImdzLlNob3dWaWRlb1wiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnZpZGVvP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldFZpZGVvKFwiTW92aWVzLyN7Y29tbWFuZC5wYXJhbXMudmlkZW8ubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uPy50eXBlID09IGdzLkFuaW1hdGlvblR5cGVzLk1BU0tJTkdcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9NYXNrcy8je2NvbW1hbmQucGFyYW1zLmFuaW1hdGlvbi5tYXNrLmdyYXBoaWMubmFtZX1cIilcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuUGxheVNvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuc291bmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGNvbW1hbmQucGFyYW1zLnNvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiQXVkaW8vU291bmQvI3tjb21tYW5kLnBhcmFtcy5zb3VuZC5uYW1lfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNoYW5nZVNvdW5kc1wiXG4gICAgICAgICAgICAgICAgICAgIGZvciBzb3VuZCBpbiBjb21tYW5kLnBhcmFtcy5zb3VuZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNvdW5kP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoc291bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVNjcmVlbkN1cnNvclwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmdyYXBoaWM/Lm5hbWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tjb21tYW5kLnBhcmFtcy5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgIHJldHVybiBudWxsXG4gIFxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCByZXNvdXJjZXMgZm9yIHRoZSBzcGVjaWZpZWQgYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZEFuaW1hdGlvblxuICAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbiAtIFRoZSBhbmltYXRpb24tcmVjb3JkLlxuICAgICogQHN0YXRpY1xuICAgICMjIyBcbiAgICBsb2FkQW5pbWF0aW9uOiAoYW5pbWF0aW9uKSAtPlxuICAgICAgICBpZiBhbmltYXRpb24/IGFuZCBhbmltYXRpb24uZ3JhcGhpYz9cbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9TaW1wbGVBbmltYXRpb25zLyN7YW5pbWF0aW9uLmdyYXBoaWMubmFtZX1cIilcbiAgICAgICAgICAgIFxuICAgIFxuXG5ncy5SZXNvdXJjZUxvYWRlciA9IG5ldyBSZXNvdXJjZUxvYWRlcigpICAgICAgICBcbndpbmRvdy5SZXNvdXJjZUxvYWRlciA9IGdzLlJlc291cmNlTG9hZGVyIl19
//# sourceURL=ResourceLoader_28.js