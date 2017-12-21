var Component_CommandInterpreter, InterpreterContext, LivePreviewInfo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LivePreviewInfo = (function() {

  /**
  * Stores internal preview-info if the game runs currently in Live-Preview.
  *        
  * @module gs
  * @class LivePreviewInfo
  * @memberof gs
   */
  function LivePreviewInfo() {

    /**
    * Timer ID if a timeout for live-preview was configured to exit the game loop after a certain amount of time.
    * @property timeout
    * @type number
     */
    this.timeout = null;

    /** 
    * Indicates if Live-Preview is currently waiting for the next user-action. (Selecting another command, etc.)
    * @property waiting  
    * @type boolean
     */
    this.waiting = false;

    /**
    * Counts the amount of executed commands since the last 
    * interpreter-pause(waiting, etc.). If its more than 500, the interpreter will automatically pause for 1 frame to 
    * avoid that Live-Preview freezes the Editor in case of endless loops.
    * @property executedCommands
    * @type number
     */
    this.executedCommands = 0;
  }

  return LivePreviewInfo;

})();

gs.LivePreviewInfo = LivePreviewInfo;

InterpreterContext = (function() {
  InterpreterContext.objectCodecBlackList = ["owner"];


  /**
  * Describes an interpreter-context which holds information about
  * the interpreter's owner and also unique ID used for accessing correct
  * local variables.
  *
  * @module gs
  * @class InterpreterContext
  * @memberof gs
  * @param {number|string} id - A unique ID
  * @param {Object} owner - The owner of the interpreter
   */

  function InterpreterContext(id, owner) {

    /**
    * A unique numeric or textual ID used for accessing correct local variables.
    * @property id
    * @type number|string
     */
    this.id = id;

    /**
    * The owner of the interpreter (e.g. current scene, etc.).
    * @property owner
    * @type Object
     */
    this.owner = owner;
  }


  /**
  * Sets the context's data.
  * @param {number|string} id - A unique ID
  * @param {Object} owner - The owner of the interpreter
  * @method set
   */

  InterpreterContext.prototype.set = function(id, owner) {
    this.id = id;
    return this.owner = owner;
  };

  return InterpreterContext;

})();

gs.InterpreterContext = InterpreterContext;

Component_CommandInterpreter = (function(superClass) {
  extend(Component_CommandInterpreter, superClass);

  Component_CommandInterpreter.objectCodecBlackList = ["object", "command", "onMessageADVWaiting", "onMessageADVDisappear", "onMessageADVFinish"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CommandInterpreter.prototype.onDataBundleRestore = function(data, context) {};


  /**
  * A component which allows a game object to process commands like for
  * scene-objects. For each command a command-function exists. To add
  * own custom commands to the interpreter just create a sub-class and
  * override the gs.Component_CommandInterpreter.assignCommand method
  * and assign the command-function for your custom-command.
  *
  * @module gs
  * @class Component_CommandInterpreter
  * @extends gs.Component
  * @memberof gs
   */

  function Component_CommandInterpreter() {
    Component_CommandInterpreter.__super__.constructor.call(this);

    /**
    * Wait-Counter in frames. If greater than 0, the interpreter will for that amount of frames before continue.
    * @property waitCounter
    * @type number
     */
    this.waitCounter = 0;

    /**
    * Index to the next command to execute.
    * @property pointer
    * @type number
     */
    this.pointer = 0;

    /**
    * Stores states of conditions.
    * @property conditions
    * @type number
    * @protected
     */
    this.conditions = [];

    /**
    * Stores states of loops.
    * @property loops
    * @type number
    * @protected
     */
    this.loops = [];
    this.timers = [];

    /**
    * Indicates if the interpreter is currently running.
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * Indicates if the interpreter is currently waiting.
    * @property isWaiting
    * @type boolean
     */
    this.isWaiting = false;

    /**
    * Indicates if the interpreter is currently waiting until a message processed by another context like a Common Event
    * is finished.
    * FIXME: Conflict handling can be removed maybe. 
    * @property isWaitingForMessage
    * @type boolean
     */
    this.isWaitingForMessage = false;

    /**
    * Stores internal preview-info if the game runs currently in Live-Preview.
    * <ul>
    * <li>previewInfo.timeout - Timer ID if a timeout for live-preview was configured to exit the game loop after a certain amount of time.</li>
    * <li>previewInfo.waiting - Indicates if Live-Preview is currently waiting for the next user-action. (Selecting another command, etc.)</li>
    * <li>previewInfo.executedCommands - Counts the amount of executed commands since the last 
    * interpreter-pause(waiting, etc.). If its more than 500, the interpreter will automatically pause for 1 frame to 
    * avoid that Live-Preview freezes the Editor in case of endless loops.</li>
    * </ul>
    * @property previewInfo
    * @type boolean
    * @protected
     */
    this.previewInfo = new gs.LivePreviewInfo();

    /**
    * Stores Live-Preview related info passed from the VN Maker editor like the command-index the player clicked on, etc.
    * @property previewData
    * @type Object
    * @protected
     */
    this.previewData = null;

    /**
    * Indicates if the interpreter automatically repeats execution after the last command was executed.
    * @property repeat
    * @type boolean
     */
    this.repeat = false;

    /**
    * The execution context of the interpreter.
    * @property context
    * @type gs.InterpreterContext
    * @protected
     */
    this.context = new gs.InterpreterContext(0, null);

    /**
    * Sub-Interpreter from a Common Event Call. The interpreter will wait until the sub-interpreter is done and set back to
    * <b>null</b>.
    * @property subInterpreter
    * @type gs.Component_CommandInterpreter
    * @protected
     */
    this.subInterpreter = null;

    /**
    * Current indent-level of execution
    * @property indent
    * @type number
    * @protected
     */
    this.indent = 0;

    /**
    * Stores information about for what the interpreter is currently waiting for like for a ADV message, etc. to
    * restore probably when loaded from a save-game.
    * @property waitingFor
    * @type Object
    * @protected
     */
    this.waitingFor = {};

    /**
    * Stores interpreter related settings like how to handle messages, etc.
    * @property settings
    * @type Object
    * @protected
     */
    this.settings = {
      message: {
        byId: {},
        autoErase: true,
        waitAtEnd: true,
        backlog: true
      },
      screen: {
        pan: new gs.Point(0, 0)
      }
    };

    /**
    * Mapping table to quickly get the anchor point for the an inserted anchor-point constant such as
    * Top-Left(0), Top(1), Top-Right(2) and so on.
    * @property graphicAnchorPointsByConstant
    * @type gs.Point[]
    * @protected
     */
    this.graphicAnchorPointsByConstant = [new gs.Point(0.0, 0.0), new gs.Point(0.5, 0.0), new gs.Point(1.0, 0.0), new gs.Point(1.0, 0.5), new gs.Point(1.0, 1.0), new gs.Point(0.5, 1.0), new gs.Point(0.0, 1.0), new gs.Point(0.0, 0.5), new gs.Point(0.5, 0.5)];
  }

  Component_CommandInterpreter.prototype.onHotspotClick = function(e, data) {
    return this.executeAction(data.params.actions.onClick, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotEnter = function(e, data) {
    return this.executeAction(data.params.actions.onEnter, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotLeave = function(e, data) {
    return this.executeAction(data.params.actions.onLeave, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDragStart = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDrag = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDragEnd = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotStateChanged = function(e, params) {
    if (e.sender.behavior.selected) {
      return this.executeAction(params.actions.onSelect, true);
    } else {
      return this.executeAction(params.actions.onDeselect, false);
    }
  };


  /**
  * Called when a ADV message finished rendering and is now waiting
  * for the user/autom-message timer to proceed.
  *
  * @method onMessageADVWaiting
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVWaiting = function(e) {
    var messageObject;
    messageObject = e.sender.object;
    if (!this.messageSettings().waitAtEnd) {
      if (e.data.params.waitForCompletion) {
        this.isWaiting = false;
      }
      messageObject.textRenderer.isWaiting = false;
      messageObject.textRenderer.isRunning = false;
    }
    messageObject.events.off("waiting", e.handler);
    if (this.messageSettings().backlog && (messageObject.settings.autoErase || messageObject.settings.paragraphSpacing > 0)) {
      return GameManager.backlog.push({
        character: messageObject.character,
        message: messageObject.behavior.message,
        choices: []
      });
    }
  };


  /**
  * Called when an ADV message finished fade-out.
  *
  * @method onMessageADVDisappear
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVDisappear = function(messageObject, waitForCompletion) {
    SceneManager.scene.currentCharacter = {
      name: ""
    };
    messageObject.behavior.clear();
    messageObject.visible = false;
    if (waitForCompletion) {
      this.isWaiting = false;
    }
    return this.waitingFor.messageADV = null;
  };


  /**
  * Called when an ADV message finished clear.
  *
  * @method onMessageADVClear
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVClear = function(messageObject, waitForCompletion) {
    messageObject = this.targetMessage();
    if (this.messageSettings().backlog) {
      GameManager.backlog.push({
        character: messageObject.character,
        message: messageObject.behavior.message,
        choices: []
      });
    }
    return this.onMessageADVDisappear(messageObject, waitForCompletion);
  };


  /**
  * Called when a hotspot/image-map sends a "jumpTo" event to let the
  * interpreter jump to the position defined in the event object.
  *
  * @method onJumpTo
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onJumpTo = function(e) {
    this.jumpToLabel(e.label);
    return this.isWaiting = false;
  };


  /**
  * Called when a hotspot/image-map sends a "callCommonEvent" event to let the
  * interpreter call the common event defined in the event object.
  *
  * @method onJumpTo
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCallCommonEvent = function(e) {
    var event, eventId, ref;
    eventId = e.commonEventId;
    event = RecordManager.commonEvents[eventId];
    if (!event) {
      event = RecordManager.commonEvents.first((function(_this) {
        return function(x) {
          return x.name === eventId;
        };
      })(this));
      if (event) {
        eventId = event.index;
      }
    }
    this.callCommonEvent(eventId, e.params || [], !e.finish);
    return this.isWaiting = (ref = e.waiting) != null ? ref : false;
  };


  /**
  * Called when a ADV message finishes. 
  *
  * @method onMessageADVFinish
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVFinish = function(e) {
    var commands, duration, fading, messageObject, pointer;
    messageObject = e.sender.object;
    if (!this.messageSettings().waitAtEnd) {
      return;
    }
    GameManager.globalData.messages[lcsm(e.data.params.message)] = {
      read: true
    };
    GameManager.saveGlobalData();
    if (e.data.params.waitForCompletion) {
      this.isWaiting = false;
    }
    this.waitingFor.messageADV = null;
    pointer = this.pointer;
    commands = this.object.commands;
    messageObject.events.off("finish", e.handler);
    if ((messageObject.voice != null) && GameManager.settings.skipVoiceOnAction) {
      AudioManager.stopSound(messageObject.voice.name);
    }
    if (!this.isMessageCommand(pointer, commands) && this.messageSettings().autoErase) {
      this.isWaiting = true;
      this.waitingFor.messageADV = e.data.params;
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      messageObject.waitForCompletion = e.data.params.waitForCompletion;
      return messageObject.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onMessageADVDisappear", this, e.data.params.waitForCompletion));
    }
  };


  /**
  * Called when a common event finished execution. In most cases, the interpreter
  * will stop waiting and continue processing after this. But h
  *
  * @method onCommonEventFinish
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCommonEventFinish = function(e) {
    var ref;
    SceneManager.scene.commonEventContainer.removeObject(e.sender.object);
    e.sender.object.events.off("finish");
    this.subInterpreter = null;
    return this.isWaiting = (ref = e.data.waiting) != null ? ref : false;
  };


  /**
  * Called when a scene call finished execution.
  *
  * @method onCallSceneFinish
  * @param {Object} sender - The sender of this event.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCallSceneFinish = function(sender) {
    this.isWaiting = false;
    return this.subInterpreter = null;
  };


  /**
  * Serializes the interpreter into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Component_CommandInterpreter.prototype.toDataBundle = function() {
    if (this.isInputDataCommand(Math.max(this.pointer - 1, 0), this.object.commands)) {
      return {
        pointer: Math.max(this.pointer - 1, 0),
        choice: this.choice,
        conditions: this.conditions,
        loops: this.loops,
        labels: this.labels,
        isWaiting: false,
        isRunning: this.isRunning,
        waitCounter: this.waitCounter,
        waitingFor: this.waitingFor,
        indent: this.indent,
        settings: this.settings
      };
    } else {
      return {
        pointer: this.pointer,
        choice: this.choice,
        conditions: this.conditions,
        loops: this.loops,
        labels: this.labels,
        isWaiting: this.isWaiting,
        isRunning: this.isRunning,
        waitCounter: this.waitCounter,
        waitingFor: this.waitingFor,
        indent: this.indent,
        settings: this.settings
      };
    }
  };


  /**
   * Previews the current scene at the specified pointer. This method is called from the
   * VN Maker Scene-Editor if live-preview is enabled and the user clicked on a command.
   *
   * @method preview
   */

  Component_CommandInterpreter.prototype.preview = function() {
    var ex, scene;
    try {
      if (!$PARAMS.preview || !$PARAMS.preview.scene) {
        return;
      }
      AudioManager.stopAllSounds();
      AudioManager.stopAllMusic();
      AudioManager.stopAllVoices();
      GameManager.tempFields.choices = [];
      GameManager.setupCursor();
      this.previewData = $PARAMS.preview;
      gs.GlobalEventManager.emit("previewRestart");
      if (this.previewInfo.timeout) {
        clearTimeout(this.previewInfo.timeout);
      }
      if (Graphics.stopped) {
        Graphics.stopped = false;
        Graphics.onEachFrame(gs.Main.frameCallback);
      }
      scene = new vn.Object_Scene();
      scene.sceneData.uid = this.previewData.scene.uid;
      return SceneManager.switchTo(scene);
    } catch (error) {
      ex = error;
      return console.warn(ex);
    }
  };


  /**
   * Sets up the interpreter.
   *
   * @method setup
   */

  Component_CommandInterpreter.prototype.setup = function() {
    this.previewData = $PARAMS.preview;
    if (this.previewData) {
      return gs.GlobalEventManager.on("mouseDown", ((function(_this) {
        return function() {
          if (_this.previewInfo.waiting) {
            if (_this.previewInfo.timeout) {
              clearTimeout(_this.previewInfo.timeout);
            }
            _this.previewInfo.waiting = false;
            GameManager.tempSettings.skip = false;
            _this.previewData = null;
            return gs.GlobalEventManager.emit("previewRestart");
          }
        };
      })(this)), null, this.object);
    }
  };


  /**
   * Disposes the interpreter.
   *
   * @method dispose
   */

  Component_CommandInterpreter.prototype.dispose = function() {
    if (this.previewData) {
      gs.GlobalEventManager.offByOwner("mouseDown", this.object);
    }
    return Component_CommandInterpreter.__super__.dispose.apply(this, arguments);
  };

  Component_CommandInterpreter.prototype.isInstantSkip = function() {
    return GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0;
  };


  /**
  * Restores the interpreter from a data-bundle
  *
  * @method restore
  * @param {Object} bundle- The data-bundle.
   */

  Component_CommandInterpreter.prototype.restore = function() {};


  /**
  * Gets the default game message for novel-mode.
  *
  * @method messageObjectNVL
  * @return {ui.Object_Message} The NVL game message object.
   */

  Component_CommandInterpreter.prototype.messageObjectNVL = function() {
    return gs.ObjectManager.current.objectById("nvlGameMessage_message");
  };


  /**
  * Gets the default game message for adventure-mode.
  *
  * @method messageObjectADV
  * @return {ui.Object_Message} The ADV game message object.
   */

  Component_CommandInterpreter.prototype.messageObjectADV = function() {
    return gs.ObjectManager.current.objectById("gameMessage_message");
  };


  /**
  * Starts the interpreter
  *
  * @method start
   */

  Component_CommandInterpreter.prototype.start = function() {
    this.conditions = [];
    this.loops = [];
    this.indent = 0;
    this.pointer = 0;
    this.isRunning = true;
    return this.isWaiting = false;
  };


  /**
  * Stops the interpreter
  *
  * @method stop
   */

  Component_CommandInterpreter.prototype.stop = function() {
    return this.isRunning = false;
  };


  /**
  * Resumes the interpreter
  *
  * @method resume
   */

  Component_CommandInterpreter.prototype.resume = function() {
    return this.isRunning = true;
  };


  /**
  * Updates the interpreter and executes all commands until the next wait is 
  * triggered by a command. So in the case of an endless-loop the method will 
  * never return.
  *
  * @method update
   */

  Component_CommandInterpreter.prototype.update = function() {
    if (this.subInterpreter != null) {
      this.subInterpreter.update();
      return;
    }
    GameManager.variableStore.setupTempVariables(this.context);
    if (((this.object.commands == null) || this.pointer >= this.object.commands.length) && !this.isWaiting) {
      if (this.repeat) {
        this.start();
      } else if (this.isRunning) {
        this.isRunning = false;
        if (this.onFinish != null) {
          this.onFinish(this);
        }
        return;
      }
    }
    if (!this.isRunning) {
      return;
    }
    if (!this.object.commands.optimized) {
      DataOptimizer.optimizeEventCommands(this.object.commands);
    }
    if (this.waitCounter > 0) {
      this.waitCounter--;
      this.isWaiting = this.waitCounter > 0;
      return;
    }
    if (this.isWaitingForMessage) {
      this.isWaiting = true;
      if (!this.isProcessingMessageInOtherContext()) {
        this.isWaiting = false;
        this.isWaitingForMessage = false;
      } else {
        return;
      }
    }
    if (GameManager.inLivePreview) {
      while (!(this.isWaiting || this.previewInfo.waiting) && this.pointer < this.object.commands.length && this.isRunning) {
        this.executeCommand(this.pointer);
        this.previewInfo.executedCommands++;
        if (this.previewInfo.executedCommands > 500) {
          this.previewInfo.executedCommands = 0;
          this.isWaiting = true;
          this.waitCounter = 1;
        }
      }
    } else {
      while (!(this.isWaiting || this.previewInfo.waiting) && this.pointer < this.object.commands.length && this.isRunning) {
        this.executeCommand(this.pointer);
      }
    }
    if (this.pointer >= this.object.commands.length && !this.isWaiting) {
      if (this.repeat) {
        return this.start();
      } else if (this.isRunning) {
        this.isRunning = false;
        if (this.onFinish != null) {
          return this.onFinish(this);
        }
      }
    }
  };


  /**
  * Assigns the correct command-function to the specified command-object if 
  * necessary.
  *
  * @method assignCommand
   */

  Component_CommandInterpreter.prototype.assignCommand = function(command) {
    switch (command.id) {
      case "gs.Idle":
        return command.execute = this.commandIdle;
      case "gs.StartTimer":
        return command.execute = this.commandStartTimer;
      case "gs.PauseTimer":
        return command.execute = this.commandPauseTimer;
      case "gs.ResumeTimer":
        return command.execute = this.commandResumeTimer;
      case "gs.StopTimer":
        return command.execute = this.commandStopTimer;
      case "gs.WaitCommand":
        return command.execute = this.commandWait;
      case "gs.LoopCommand":
        return command.execute = this.commandLoop;
      case "gs.BreakLoopCommand":
        return command.execute = this.commandBreakLoop;
      case "gs.Comment":
        return command.execute = function() {
          return 0;
        };
      case "gs.EmptyCommand":
        return command.execute = function() {
          return 0;
        };
      case "gs.ListAdd":
        return command.execute = this.commandListAdd;
      case "gs.ListPop":
        return command.execute = this.commandListPop;
      case "gs.ListShift":
        return command.execute = this.commandListShift;
      case "gs.ListRemoveAt":
        return command.execute = this.commandListRemoveAt;
      case "gs.ListInsertAt":
        return command.execute = this.commandListInsertAt;
      case "gs.ListValueAt":
        return command.execute = this.commandListValueAt;
      case "gs.ListClear":
        return command.execute = this.commandListClear;
      case "gs.ListShuffle":
        return command.execute = this.commandListShuffle;
      case "gs.ListSort":
        return command.execute = this.commandListSort;
      case "gs.ListIndexOf":
        return command.execute = this.commandListIndexOf;
      case "gs.ListSet":
        return command.execute = this.commandListSet;
      case "gs.ListCopy":
        return command.execute = this.commandListCopy;
      case "gs.ListLength":
        return command.execute = this.commandListLength;
      case "gs.ListJoin":
        return command.execute = this.commandListJoin;
      case "gs.ListFromText":
        return command.execute = this.commandListFromText;
      case "gs.ResetVariables":
        return command.execute = this.commandResetVariables;
      case "gs.ChangeVariableDomain":
        return command.execute = this.commandChangeVariableDomain;
      case "gs.ChangeNumberVariables":
        return command.execute = this.commandChangeNumberVariables;
      case "gs.ChangeDecimalVariables":
        return command.execute = this.commandChangeDecimalVariables;
      case "gs.ChangeBooleanVariables":
        return command.execute = this.commandChangeBooleanVariables;
      case "gs.ChangeStringVariables":
        return command.execute = this.commandChangeStringVariables;
      case "gs.CheckSwitch":
        return command.execute = this.commandCheckSwitch;
      case "gs.CheckNumberVariable":
        return command.execute = this.commandCheckNumberVariable;
      case "gs.CheckTextVariable":
        return command.execute = this.commandCheckTextVariable;
      case "gs.Condition":
        return command.execute = this.commandCondition;
      case "gs.ConditionElse":
        return command.execute = this.commandConditionElse;
      case "gs.ConditionElseIf":
        return command.execute = this.commandConditionElseIf;
      case "gs.Label":
        return command.execute = this.commandLabel;
      case "gs.JumpToLabel":
        return command.execute = this.commandJumpToLabel;
      case "gs.SetMessageArea":
        return command.execute = this.commandSetMessageArea;
      case "gs.ShowMessage":
        return command.execute = this.commandShowMessage;
      case "gs.ShowPartialMessage":
        return command.execute = this.commandShowPartialMessage;
      case "gs.MessageFading":
        return command.execute = this.commandMessageFading;
      case "gs.MessageSettings":
        return command.execute = this.commandMessageSettings;
      case "gs.CreateMessageArea":
        return command.execute = this.commandCreateMessageArea;
      case "gs.EraseMessageArea":
        return command.execute = this.commandEraseMessageArea;
      case "gs.SetTargetMessage":
        return command.execute = this.commandSetTargetMessage;
      case "vn.MessageBoxDefaults":
        return command.execute = this.commandMessageBoxDefaults;
      case "vn.MessageBoxVisibility":
        return command.execute = this.commandMessageBoxVisibility;
      case "vn.MessageVisibility":
        return command.execute = this.commandMessageVisibility;
      case "vn.BacklogVisibility":
        return command.execute = this.commandBacklogVisibility;
      case "gs.ClearMessage":
        return command.execute = this.commandClearMessage;
      case "gs.ChangeWeather":
        return command.execute = this.commandChangeWeather;
      case "gs.FreezeScreen":
        return command.execute = this.commandFreezeScreen;
      case "gs.ScreenTransition":
        return command.execute = this.commandScreenTransition;
      case "gs.ShakeScreen":
        return command.execute = this.commandShakeScreen;
      case "gs.TintScreen":
        return command.execute = this.commandTintScreen;
      case "gs.FlashScreen":
        return command.execute = this.commandFlashScreen;
      case "gs.ZoomScreen":
        return command.execute = this.commandZoomScreen;
      case "gs.RotateScreen":
        return command.execute = this.commandRotateScreen;
      case "gs.PanScreen":
        return command.execute = this.commandPanScreen;
      case "gs.ScreenEffect":
        return command.execute = this.commandScreenEffect;
      case "gs.ShowVideo":
        return command.execute = this.commandShowVideo;
      case "gs.MoveVideo":
        return command.execute = this.commandMoveVideo;
      case "gs.MoveVideoPath":
        return command.execute = this.commandMoveVideoPath;
      case "gs.TintVideo":
        return command.execute = this.commandTintVideo;
      case "gs.FlashVideo":
        return command.execute = this.commandFlashVideo;
      case "gs.CropVideo":
        return command.execute = this.commandCropVideo;
      case "gs.RotateVideo":
        return command.execute = this.commandRotateVideo;
      case "gs.ZoomVideo":
        return command.execute = this.commandZoomVideo;
      case "gs.BlendVideo":
        return command.execute = this.commandBlendVideo;
      case "gs.MaskVideo":
        return command.execute = this.commandMaskVideo;
      case "gs.VideoEffect":
        return command.execute = this.commandVideoEffect;
      case "gs.VideoMotionBlur":
        return command.execute = this.commandVideoMotionBlur;
      case "gs.VideoDefaults":
        return command.execute = this.commandVideoDefaults;
      case "gs.EraseVideo":
        return command.execute = this.commandEraseVideo;
      case "gs.ShowImageMap":
        return command.execute = this.commandShowImageMap;
      case "gs.EraseImageMap":
        return command.execute = this.commandEraseImageMap;
      case "gs.AddHotspot":
        return command.execute = this.commandAddHotspot;
      case "gs.EraseHotspot":
        return command.execute = this.commandEraseHotspot;
      case "gs.ChangeHotspotState":
        return command.execute = this.commandChangeHotspotState;
      case "gs.ShowPicture":
        return command.execute = this.commandShowPicture;
      case "gs.MovePicture":
        return command.execute = this.commandMovePicture;
      case "gs.MovePicturePath":
        return command.execute = this.commandMovePicturePath;
      case "gs.TintPicture":
        return command.execute = this.commandTintPicture;
      case "gs.FlashPicture":
        return command.execute = this.commandFlashPicture;
      case "gs.CropPicture":
        return command.execute = this.commandCropPicture;
      case "gs.RotatePicture":
        return command.execute = this.commandRotatePicture;
      case "gs.ZoomPicture":
        return command.execute = this.commandZoomPicture;
      case "gs.BlendPicture":
        return command.execute = this.commandBlendPicture;
      case "gs.ShakePicture":
        return command.execute = this.commandShakePicture;
      case "gs.MaskPicture":
        return command.execute = this.commandMaskPicture;
      case "gs.PictureEffect":
        return command.execute = this.commandPictureEffect;
      case "gs.PictureMotionBlur":
        return command.execute = this.commandPictureMotionBlur;
      case "gs.PictureDefaults":
        return command.execute = this.commandPictureDefaults;
      case "gs.PlayPictureAnimation":
        return command.execute = this.commandPlayPictureAnimation;
      case "gs.ErasePicture":
        return command.execute = this.commandErasePicture;
      case "gs.InputNumber":
        return command.execute = this.commandInputNumber;
      case "vn.Choice":
        return command.execute = this.commandShowChoice;
      case "vn.ChoiceTimer":
        return command.execute = this.commandChoiceTimer;
      case "vn.ShowChoices":
        return command.execute = this.commandShowChoices;
      case "vn.UnlockCG":
        return command.execute = this.commandUnlockCG;
      case "vn.L2DJoinScene":
        return command.execute = this.commandL2DJoinScene;
      case "vn.L2DExitScene":
        return command.execute = this.commandL2DExitScene;
      case "vn.L2DMotion":
        return command.execute = this.commandL2DMotion;
      case "vn.L2DMotionGroup":
        return command.execute = this.commandL2DMotionGroup;
      case "vn.L2DExpression":
        return command.execute = this.commandL2DExpression;
      case "vn.L2DMove":
        return command.execute = this.commandL2DMove;
      case "vn.L2DParameter":
        return command.execute = this.commandL2DParameter;
      case "vn.L2DSettings":
        return command.execute = this.commandL2DSettings;
      case "vn.L2DDefaults":
        return command.execute = this.commandL2DDefaults;
      case "vn.CharacterJoinScene":
        return command.execute = this.commandCharacterJoinScene;
      case "vn.CharacterExitScene":
        return command.execute = this.commandCharacterExitScene;
      case "vn.CharacterChangeExpression":
        return command.execute = this.commandCharacterChangeExpression;
      case "vn.CharacterSetParameter":
        return command.execute = this.commandCharacterSetParameter;
      case "vn.CharacterGetParameter":
        return command.execute = this.commandCharacterGetParameter;
      case "vn.CharacterDefaults":
        return command.execute = this.commandCharacterDefaults;
      case "vn.CharacterEffect":
        return command.execute = this.commandCharacterEffect;
      case "vn.ZoomCharacter":
        return command.execute = this.commandZoomCharacter;
      case "vn.RotateCharacter":
        return command.execute = this.commandRotateCharacter;
      case "vn.BlendCharacter":
        return command.execute = this.commandBlendCharacter;
      case "vn.ShakeCharacter":
        return command.execute = this.commandShakeCharacter;
      case "vn.MaskCharacter":
        return command.execute = this.commandMaskCharacter;
      case "vn.MoveCharacter":
        return command.execute = this.commandMoveCharacter;
      case "vn.MoveCharacterPath":
        return command.execute = this.commandMoveCharacterPath;
      case "vn.FlashCharacter":
        return command.execute = this.commandFlashCharacter;
      case "vn.TintCharacter":
        return command.execute = this.commandTintCharacter;
      case "vn.CharacterMotionBlur":
        return command.execute = this.commandCharacterMotionBlur;
      case "vn.ChangeBackground":
        return command.execute = this.commandChangeBackground;
      case "vn.ShakeBackground":
        return command.execute = this.commandShakeBackground;
      case "vn.ScrollBackground":
        return command.execute = this.commandScrollBackground;
      case "vn.ScrollBackgroundTo":
        return command.execute = this.commandScrollBackgroundTo;
      case "vn.ScrollBackgroundPath":
        return command.execute = this.commandScrollBackgroundPath;
      case "vn.ZoomBackground":
        return command.execute = this.commandZoomBackground;
      case "vn.RotateBackground":
        return command.execute = this.commandRotateBackground;
      case "vn.TintBackground":
        return command.execute = this.commandTintBackground;
      case "vn.BlendBackground":
        return command.execute = this.commandBlendBackground;
      case "vn.MaskBackground":
        return command.execute = this.commandMaskBackground;
      case "vn.BackgroundMotionBlur":
        return command.execute = this.commandBackgroundMotionBlur;
      case "vn.BackgroundEffect":
        return command.execute = this.commandBackgroundEffect;
      case "vn.BackgroundDefaults":
        return command.execute = this.commandBackgroundDefaults;
      case "vn.ChangeScene":
        return command.execute = this.commandChangeScene;
      case "vn.ReturnToPreviousScene":
        return command.execute = this.commandReturnToPreviousScene;
      case "vn.CallScene":
        return command.execute = this.commandCallScene;
      case "vn.SwitchToLayout":
        return command.execute = this.commandSwitchToLayout;
      case "gs.ChangeTransition":
        return command.execute = this.commandChangeTransition;
      case "gs.ChangeWindowSkin":
        return command.execute = this.commandChangeWindowSkin;
      case "gs.ChangeScreenTransitions":
        return command.execute = this.commandChangeScreenTransitions;
      case "vn.UIAccess":
        return command.execute = this.commandUIAccess;
      case "gs.PlayVideo":
        return command.execute = this.commandPlayVideo;
      case "gs.PlayMusic":
        return command.execute = this.commandPlayMusic;
      case "gs.StopMusic":
        return command.execute = this.commandStopMusic;
      case "gs.PlaySound":
        return command.execute = this.commandPlaySound;
      case "gs.StopSound":
        return command.execute = this.commandStopSound;
      case "gs.PauseMusic":
        return command.execute = this.commandPauseMusic;
      case "gs.ResumeMusic":
        return command.execute = this.commandResumeMusic;
      case "gs.AudioDefaults":
        return command.execute = this.commandAudioDefaults;
      case "gs.EndCommonEvent":
        return command.execute = this.commandEndCommonEvent;
      case "gs.ResumeCommonEvent":
        return command.execute = this.commandResumeCommonEvent;
      case "gs.CallCommonEvent":
        return command.execute = this.commandCallCommonEvent;
      case "gs.ChangeTimer":
        return command.execute = this.commandChangeTimer;
      case "gs.ShowText":
        return command.execute = this.commandShowText;
      case "gs.RefreshText":
        return command.execute = this.commandRefreshText;
      case "gs.TextMotionBlur":
        return command.execute = this.commandTextMotionBlur;
      case "gs.MoveText":
        return command.execute = this.commandMoveText;
      case "gs.MoveTextPath":
        return command.execute = this.commandMoveTextPath;
      case "gs.RotateText":
        return command.execute = this.commandRotateText;
      case "gs.ZoomText":
        return command.execute = this.commandZoomText;
      case "gs.BlendText":
        return command.execute = this.commandBlendText;
      case "gs.ColorText":
        return command.execute = this.commandColorText;
      case "gs.EraseText":
        return command.execute = this.commandEraseText;
      case "gs.TextEffect":
        return command.execute = this.commandTextEffect;
      case "gs.TextDefaults":
        return command.execute = this.commandTextDefaults;
      case "gs.ChangeTextSettings":
        return command.execute = this.commandChangeTextSettings;
      case "gs.InputText":
        return command.execute = this.commandInputText;
      case "gs.InputName":
        return command.execute = this.commandInputName;
      case "gs.SavePersistentData":
        return command.execute = this.commandSavePersistentData;
      case "gs.SaveSettings":
        return command.execute = this.commandSaveSettings;
      case "gs.PrepareSaveGame":
        return command.execute = this.commandPrepareSaveGame;
      case "gs.SaveGame":
        return command.execute = this.commandSaveGame;
      case "gs.LoadGame":
        return command.execute = this.commandLoadGame;
      case "gs.GetInputData":
        return command.execute = this.commandGetInputData;
      case "gs.WaitForInput":
        return command.execute = this.commandWaitForInput;
      case "gs.ChangeObjectDomain":
        return command.execute = this.commandChangeObjectDomain;
      case "vn.GetGameData":
        return command.execute = this.commandGetGameData;
      case "vn.SetGameData":
        return command.execute = this.commandSetGameData;
      case "vn.GetObjectData":
        return command.execute = this.commandGetObjectData;
      case "vn.SetObjectData":
        return command.execute = this.commandSetObjectData;
      case "vn.ChangeSounds":
        return command.execute = this.commandChangeSounds;
      case "vn.ChangeColors":
        return command.execute = this.commandChangeColors;
      case "gs.ChangeScreenCursor":
        return command.execute = this.commandChangeScreenCursor;
      case "gs.ResetGlobalData":
        return command.execute = this.commandResetGlobalData;
      case "gs.Script":
        return command.execute = this.commandScript;
    }
  };


  /**
  * Executes the command at the specified index and increases the command-pointer.
  *
  * @method executeCommand
   */

  Component_CommandInterpreter.prototype.executeCommand = function(index) {
    var indent;
    this.command = this.object.commands[index];
    if (this.previewData) {
      if (this.pointer < this.previewData.pointer) {
        GameManager.tempSettings.skip = true;
        GameManager.tempSettings.skipTime = 0;
      } else {
        GameManager.tempSettings.skip = this.previewData.settings.animationDisabled;
        GameManager.tempSettings.skipTime = 0;
        this.previewInfo.waiting = true;
        gs.GlobalEventManager.emit("previewWaiting");
        if (this.previewData.settings.animationDisabled || this.previewData.settings.animationTime > 0) {
          this.previewInfo.timeout = setTimeout((function() {
            return Graphics.stopped = true;
          }), this.previewData.settings.animationTime * 1000);
        }
      }
    }
    if (this.command.execute != null) {
      this.command.interpreter = this;
      if (this.command.indent === this.indent) {
        this.command.execute();
      }
      this.pointer++;
      this.command = this.object.commands[this.pointer];
      if (this.command != null) {
        indent = this.command.indent;
      } else {
        indent = this.indent;
        while (indent > 0 && (this.loops[indent] == null)) {
          indent--;
        }
      }
      if (indent < this.indent) {
        this.indent = indent;
        if (this.loops[this.indent] != null) {
          this.pointer = this.loops[this.indent];
          this.command = this.object.commands[this.pointer];
          return this.command.interpreter = this;
        }
      }
    } else {
      this.assignCommand(this.command);
      if (this.command.execute != null) {
        this.command.interpreter = this;
        if (this.command.indent === this.indent) {
          this.command.execute();
        }
        this.pointer++;
        this.command = this.object.commands[this.pointer];
        if (this.command != null) {
          indent = this.command.indent;
        } else {
          indent = this.indent;
          while (indent > 0 && (this.loops[indent] == null)) {
            indent--;
          }
        }
        if (indent < this.indent) {
          this.indent = indent;
          if (this.loops[this.indent] != null) {
            this.pointer = this.loops[this.indent];
            this.command = this.object.commands[this.pointer];
            return this.command.interpreter = this;
          }
        }
      } else {
        return this.pointer++;
      }
    }
  };


  /**
  * Skips all commands until a command with the specified indent-level is 
  * found. So for example: To jump from a Condition-Command to the next
  * Else-Command just pass the indent-level of the Condition/Else command.
  *
  * @method skip
  * @param {number} indent - The indent-level.
  * @param {boolean} backward - If true the skip runs backward.
   */

  Component_CommandInterpreter.prototype.skip = function(indent, backward) {
    var results, results1;
    if (backward) {
      this.pointer--;
      results = [];
      while (this.pointer > 0 && this.object.commands[this.pointer].indent !== indent) {
        results.push(this.pointer--);
      }
      return results;
    } else {
      this.pointer++;
      results1 = [];
      while (this.pointer < this.object.commands.length && this.object.commands[this.pointer].indent !== indent) {
        results1.push(this.pointer++);
      }
      return results1;
    }
  };


  /**
  * Halts the interpreter for the specified amount of time. An optionally
  * callback function can be passed which is called when the time is up.
  *
  * @method wait
  * @param {number} time - The time to wait
  * @param {gs.Callback} callback - Called if the wait time is up.
   */

  Component_CommandInterpreter.prototype.wait = function(time, callback) {
    this.isWaiting = true;
    this.waitCounter = time;
    return this.waitCallback = callback;
  };


  /**
  * Checks if the command at the specified pointer-index is a game message
  * related command.
  *
  * @method isMessageCommand
  * @param {number} pointer - The pointer/index.
  * @param {Object[]} commands - The list of commands to check.
  * @return {boolean} <b>true</b> if its a game message related command. Otherwise <b>false</b>.
   */

  Component_CommandInterpreter.prototype.isMessageCommand = function(pointer, commands) {
    var result;
    result = true;
    if (pointer >= commands.length || (commands[pointer].id !== "gs.InputNumber" && commands[pointer].id !== "vn.Choice" && commands[pointer].id !== "gs.InputText" && commands[pointer].id !== "gs.InputName")) {
      result = false;
    }
    return result;
  };


  /**
  * Checks if the command at the specified pointer-index asks for user-input like
  * the Input Number or Input Text command.
  *
  * @method isInputDataCommand
  * @param {number} pointer - The pointer/index.
  * @param {Object[]} commands - The list of commands to check.
  * @return {boolean} <b>true</b> if its an input-data command. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.isInputDataCommand = function(pointer, commands) {
    return pointer < commands.length && (commands[pointer].id === "gs.InputNumber" || commands[pointer].id === "gs.InputText" || commands[pointer].id === "vn.Choice" || commands[pointer].id === "vn.ShowChoices");
  };


  /**
  * Checks if a game message is currently running by another interpreter like a
  * common-event interpreter.
  *
  * @method isProcessingMessageInOtherContext
  * @return {boolean} <b>true</b> a game message is running in another context. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.isProcessingMessageInOtherContext = function() {
    var gm, result, s;
    result = false;
    gm = GameManager;
    s = SceneManager.scene;
    result = ((s.inputNumberWindow != null) && s.inputNumberWindow.visible && s.inputNumberWindow.executionContext !== this.context) || ((s.inputTextWindow != null) && s.inputTextWindow.active && s.inputTextWindow.executionContext !== this.context);
    return result;
  };


  /**
  * If a game message is currently running by an other interpreter like a common-event
  * interpreter, this method trigger a wait until the other interpreter is finished
  * with the game message.
  *
  * @method waitForMessage
  * @return {boolean} <b>true</b> a game message is running in another context. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.waitForMessage = function() {
    this.isWaitingForMessage = true;
    this.isWaiting = true;
    return this.pointer--;
  };


  /**
  * Gets the value the number variable at the specified index.
  *
  * @method numberValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.numberValueAtIndex = function(scope, index) {
    return GameManager.variableStore.numberValueAtIndex(scope, index);
  };


  /**
  * Gets the value of a (possible) number variable. If a constant number value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method numberValueOf
  * @param {number|Object} object - A number variable or constant number value.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.numberValueOf = function(object) {
    return GameManager.variableStore.numberValueOf(object);
  };


  /**
  * It does the same like <b>numberValueOf</b> with one difference: If the specified object
  * is a variable, it's value is considered as a duration-value in milliseconds and automatically converted
  * into frames.
  *
  * @method durationValueOf
  * @param {number|Object} object - A number variable or constant number value.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.durationValueOf = function(object) {
    if (object && (object.index != null)) {
      return Math.round(GameManager.variableStore.numberValueOf(object) / 1000 * Graphics.frameRate);
    } else {
      return Math.round(GameManager.variableStore.numberValueOf(object));
    }
  };


  /**
  * Gets a position ({x, y}) for the specified predefined object position configured in 
  * Database - System.
  *
  * @method predefinedObjectPosition
  * @param {number} position - The index/ID of the predefined object position to set.
  * @param {gs.Object_Base} object - The game object to set the position for.
  * @param {Object} params - The params object of the scene command.
  * @return {Object} The position {x, y}.
   */

  Component_CommandInterpreter.prototype.predefinedObjectPosition = function(position, object, params) {
    var f, objectPosition;
    objectPosition = RecordManager.system.objectPositions[position];
    if (!objectPosition) {
      return {
        x: 0,
        y: 0
      };
    }
    if (objectPosition.func == null) {
      f = eval("(function(object, params){" + objectPosition.script + "})");
      objectPosition.func = f;
    }
    return objectPosition.func(object, params) || {
      x: 0,
      y: 0
    };
  };


  /**
  * Sets the value of a number variable at the specified index.
  *
  * @method setNumberValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to set.
  * @param {number} value - The number value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setNumberValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setNumberValueAtIndex(scope, index, value, domain);
  };


  /**
  * Sets the value of a number variable.
  *
  * @method setNumberValueTo
  * @param {number} variable - The variable to set.
  * @param {number} value - The number value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setNumberValueTo = function(variable, value) {
    return GameManager.variableStore.setNumberValueTo(variable, value);
  };


  /**
  * Sets the value of a list variable.
  *
  * @method setListObjectTo
  * @param {Object} variable - The variable to set.
  * @param {Object} value - The list object to set the variable to.
   */

  Component_CommandInterpreter.prototype.setListObjectTo = function(variable, value) {
    return GameManager.variableStore.setListObjectTo(variable, value);
  };


  /**
  * Sets the value of a boolean/switch variable.
  *
  * @method setBooleanValueTo
  * @param {Object} variable - The variable to set.
  * @param {boolean} value - The boolean value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setBooleanValueTo = function(variable, value) {
    return GameManager.variableStore.setBooleanValueTo(variable, value);
  };


  /**
  * Sets the value of a number variable at the specified index.
  *
  * @method setBooleanValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to set.
  * @param {boolean} value - The boolean value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setBooleanValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setBooleanValueAtIndex(scope, index, value, domain);
  };


  /**
  * Sets the value of a string/text variable.
  *
  * @method setStringValueTo
  * @param {Object} variable - The variable to set.
  * @param {string} value - The string/text value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setStringValueTo = function(variable, value) {
    return GameManager.variableStore.setStringValueTo(variable, value);
  };


  /**
  * Sets the value of the string variable at the specified index.
  *
  * @method setStringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {string} value - The value to set.
   */

  Component_CommandInterpreter.prototype.setStringValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setStringValueAtIndex(scope, index, value, domain);
  };


  /**
  * Gets the value of a (possible) string variable. If a constant string value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method stringValueOf
  * @param {string|Object} object - A string variable or constant string value.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.stringValueOf = function(object) {
    return GameManager.variableStore.stringValueOf(object);
  };


  /**
  * Gets the value of the string variable at the specified index.
  *
  * @method stringValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.stringValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.stringValueAtIndex(scope, index, domain);
  };


  /**
  * Gets the value of a (possible) boolean variable. If a constant boolean value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method booleanValueOf
  * @param {boolean|Object} object - A boolean variable or constant boolean value.
  * @return {boolean} The value of the variable.
   */

  Component_CommandInterpreter.prototype.booleanValueOf = function(object) {
    return GameManager.variableStore.booleanValueOf(object);
  };


  /**
  * Gets the value of the boolean variable at the specified index.
  *
  * @method booleanValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.booleanValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.booleanValueAtIndex(scope, index, domain);
  };


  /**
  * Gets the value of a (possible) list variable.
  *
  * @method listObjectOf
  * @param {Object} object - A list variable.
  * @return {Object} The value of the list variable.
   */

  Component_CommandInterpreter.prototype.listObjectOf = function(object) {
    return GameManager.variableStore.listObjectOf(object);
  };


  /**
  * Compares two object using the specified operation and returns the result.
  *
  * @method compare
  * @param {Object} a - Object A.
  * @param {Object} b - Object B.
  * @param {number} operation - The compare-operation to compare Object A with Object B.
  * <ul>
  * <li>0 = Equal To</li>
  * <li>1 = Not Equal To</li>
  * <li>2 = Greater Than</li>
  * <li>3 = Greater or Equal To</li>
  * <li>4 = Less Than</li>
  * <li>5 = Less or Equal To</li>
  * </ul>
  * @return {boolean} The comparison result.
   */

  Component_CommandInterpreter.prototype.compare = function(a, b, operation) {
    switch (operation) {
      case 0:
        return a == b;
      case 1:
        return a != b;
      case 2:
        return a > b;
      case 3:
        return a >= b;
      case 4:
        return a < b;
      case 5:
        return a <= b;
    }
  };


  /**
  * Changes number variables and allows decimal values such as 0.5 too.
  *
  * @method changeDecimalVariables
  * @param {Object} params - Input params from the command
  * @param {Object} roundMethod - The result of the operation will be rounded using the specified method.
  * <ul>
  * <li>0 = None. The result will not be rounded.</li>
  * <li>1 = Commercially</li>
  * <li>2 = Round Up</li>
  * <li>3 = Round Down</li>
  * </ul>
   */

  Component_CommandInterpreter.prototype.changeDecimalVariables = function(params, roundMethod) {
    var diff, end, i, index, k, ref, ref1, roundFunc, scope, source, start;
    source = 0;
    roundFunc = null;
    switch (roundMethod) {
      case 0:
        roundFunc = function(value) {
          return value;
        };
        break;
      case 1:
        roundFunc = function(value) {
          return Math.round(value);
        };
        break;
      case 2:
        roundFunc = function(value) {
          return Math.ceil(value);
        };
        break;
      case 3:
        roundFunc = function(value) {
          return Math.floor(value);
        };
    }
    switch (params.source) {
      case 0:
        source = this.numberValueOf(params.sourceValue);
        break;
      case 1:
        start = this.numberValueOf(params.sourceRandom.start);
        end = this.numberValueOf(params.sourceRandom.end);
        diff = end - start;
        source = Math.floor(start + Math.random() * (diff + 1));
        break;
      case 2:
        source = this.numberValueAtIndex(params.sourceScope, this.numberValueOf(params.sourceReference) - 1, params.sourceReferenceDomain);
        break;
      case 3:
        source = this.numberValueOfGameData(params.sourceValue1);
        break;
      case 4:
        source = this.numberValueOfDatabaseData(params.sourceValue1);
    }
    switch (params.target) {
      case 0:
        switch (params.operation) {
          case 0:
            this.setNumberValueTo(params.targetVariable, roundFunc(source));
            break;
          case 1:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) + source));
            break;
          case 2:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) - source));
            break;
          case 3:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) * source));
            break;
          case 4:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) / source));
            break;
          case 5:
            this.setNumberValueTo(params.targetVariable, this.numberValueOf(params.targetVariable) % source);
        }
        break;
      case 1:
        scope = params.targetScope;
        start = params.targetRange.start - 1;
        end = params.targetRange.end - 1;
        for (i = k = ref = start, ref1 = end; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          switch (params.operation) {
            case 0:
              this.setNumberValueAtIndex(scope, i, roundFunc(source));
              break;
            case 1:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) + source));
              break;
            case 2:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) - source));
              break;
            case 3:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) * source));
              break;
            case 4:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) / source));
              break;
            case 5:
              this.setNumberValueAtIndex(scope, i, this.numberValueAtIndex(scope, i) % source);
          }
        }
        break;
      case 2:
        index = this.numberValueOf(params.targetReference) - 1;
        switch (params.operation) {
          case 0:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(source), params.targetReferenceDomain);
            break;
          case 1:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) + source), params.targetReferenceDomain);
            break;
          case 2:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) - source), params.targetReferenceDomain);
            break;
          case 3:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) * source), params.targetReferenceDomain);
            break;
          case 4:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) / source), params.targetReferenceDomain);
            break;
          case 5:
            this.setNumberValueAtIndex(params.targetScope, index, this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) % source, params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * Shakes a game object.
  *
  * @method shakeObject
  * @param {gs.Object_Base} object - The game object to shake.
  * @return {Object} A params object containing additional info about the shake-animation.
   */

  Component_CommandInterpreter.prototype.shakeObject = function(object, params) {
    var duration, easing;
    duration = Math.max(Math.round(this.durationValueOf(params.duration)), 2);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.shake({
      x: this.numberValueOf(params.range.x),
      y: this.numberValueOf(params.range.y)
    }, this.numberValueOf(params.speed) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Lets the interpreter wait for the completion of a running operation like an animation, etc.
  *
  * @method waitForCompletion
  * @param {gs.Object_Base} object - The game object the operation is executed on. Can be <b>null</b>.
  * @return {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.waitForCompletion = function(object, params) {
    var duration;
    duration = this.durationValueOf(params.duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Erases a game object.
  *
  * @method eraseObject
  * @param {gs.Object_Base} object - The game object to erase.
  * @return {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.eraseObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.disappear(params.animation, easing, duration, (function(_this) {
      return function(sender) {
        return sender.dispose();
      };
    })(this));
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Shows a game object on screen.
  *
  * @method showObject
  * @param {gs.Object_Base} object - The game object to show.
  * @param {gs.Point} position - The position where the game object should be shown.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.showObject = function(object, position, params) {
    var duration, easing, x, y;
    x = this.numberValueOf(position.x);
    y = this.numberValueOf(position.y);
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.appear(x, y, params.animation, easing, duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Moves a game object.
  *
  * @method moveObject
  * @param {gs.Object_Base} object - The game object to move.
  * @param {gs.Point} position - The position to move the game object to.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.moveObject = function(object, position, params) {
    var duration, easing, p, x, y;
    if (params.positionType === 0) {
      p = this.predefinedObjectPosition(params.predefinedPositionId, object, params);
      x = p.x;
      y = p.y;
    } else {
      x = this.numberValueOf(position.x);
      y = this.numberValueOf(position.y);
    }
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.moveTo(x, y, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Moves a game object along a path.
  *
  * @method moveObjectPath
  * @param {gs.Object_Base} object - The game object to move.
  * @param {Object} path - The path to move the game object along.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.moveObjectPath = function(object, path, params) {
    var duration, easing, ref;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.movePath(path.data, params.loopType, duration, easing, (ref = path.effects) != null ? ref.data : void 0);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Scrolls a scrollable game object along a path.
  *
  * @method scrollObjectPath
  * @param {gs.Object_Base} object - The game object to scroll.
  * @param {Object} path - The path to scroll the game object along.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.scrollObjectPath = function(object, path, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.scrollPath(path, params.loopType, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Zooms/Scales a game object.
  *
  * @method zoomObject
  * @param {gs.Object_Base} object - The game object to zoom.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.zoomObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.zoomTo(this.numberValueOf(params.zooming.x) / 100, this.numberValueOf(params.zooming.y) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Rotates a game object.
  *
  * @method rotateObject
  * @param {gs.Object_Base} object - The game object to rotate.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.rotateObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.rotate(params.direction, this.numberValueOf(params.speed) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Blends a game object.
  *
  * @method blendObject
  * @param {gs.Object_Base} object - The game object to blend.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.blendObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.blendTo(this.numberValueOf(params.opacity), duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Executes a masking-effect on a game object..
  *
  * @method maskObject
  * @param {gs.Object_Base} object - The game object to execute a masking-effect on.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.maskObject = function(object, params) {
    var duration, easing, ref, ref1, ref2;
    easing = gs.Easings.fromObject(params.easing);
    if (params.mask.type === 0) {
      object.mask.type = 0;
      object.mask.ox = this.numberValueOf(params.mask.ox);
      object.mask.oy = this.numberValueOf(params.mask.oy);
      if (((ref = object.mask.source) != null ? ref.videoElement : void 0) != null) {
        object.mask.source.pause();
      }
      if (params.mask.sourceType === 0) {
        object.mask.source = ResourceManager.getBitmap("Graphics/Masks/" + ((ref1 = params.mask.graphic) != null ? ref1.name : void 0));
      } else {
        object.mask.source = ResourceManager.getVideo("Movies/" + ((ref2 = params.mask.video) != null ? ref2.name : void 0));
        if (object.mask.source) {
          object.mask.source.play();
          object.mask.source.loop = true;
        }
      }
    } else {
      duration = this.durationValueOf(params.duration);
      object.animator.maskTo(params.mask, duration, easing);
    }
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Tints a game object.
  *
  * @method tintObject
  * @param {gs.Object_Base} object - The game object to tint.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.tintObject = function(object, params) {
    var duration, easing;
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.tintTo(params.tone, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Flashes a game object.
  *
  * @method flashObject
  * @param {gs.Object_Base} object - The game object to flash.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.flashObject = function(object, params) {
    var duration;
    duration = this.durationValueOf(params.duration);
    object.animator.flash(new Color(params.color), duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Cropes a game object.
  *
  * @method cropObject
  * @param {gs.Object_Base} object - The game object to crop.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.cropObject = function(object, params) {
    object.srcRect.x = this.numberValueOf(params.x);
    object.srcRect.y = this.numberValueOf(params.y);
    object.srcRect.width = this.numberValueOf(params.width);
    object.srcRect.height = this.numberValueOf(params.height);
    object.dstRect.width = this.numberValueOf(params.width);
    return object.dstRect.height = this.numberValueOf(params.height);
  };


  /**
  * Sets the motion blur settings of a game object.
  *
  * @method objectMotionBlur
  * @param {gs.Object_Base} object - The game object to set the motion blur settings for.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.objectMotionBlur = function(object, params) {
    return object.motionBlur.set(params.motionBlur);
  };


  /**
  * Enables an effect on a game object.
  *
  * @method objectEffect
  * @param {gs.Object_Base} object - The game object to execute a masking-effect on.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.objectEffect = function(object, params) {
    var duration, easing, wobble;
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    switch (params.type) {
      case 0:
        object.animator.wobbleTo(params.wobble.power / 10000, params.wobble.speed / 100, duration, easing);
        wobble = object.effects.wobble;
        wobble.enabled = params.wobble.power > 0;
        wobble.vertical = params.wobble.orientation === 0 || params.wobble.orientation === 2;
        wobble.horizontal = params.wobble.orientation === 1 || params.wobble.orientation === 2;
        break;
      case 1:
        object.animator.blurTo(params.blur.power / 100, duration, easing);
        object.effects.blur.enabled = true;
        break;
      case 2:
        object.animator.pixelateTo(params.pixelate.size.width, params.pixelate.size.height, duration, easing);
        object.effects.pixelate.enabled = true;
    }
    if (params.waitForCompletion && duration !== 0) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Executes an action like for a hotspot.
  *
  * @method executeAction
  * @param {Object} action - Action-Data.
  * @param {boolean} stateValue - In case of switch-binding, the switch is set to this value.
  * @param {number} bindValue - A number value which be put into the action's bind-value variable.
   */

  Component_CommandInterpreter.prototype.executeAction = function(action, stateValue, bindValue) {
    var domain, ref;
    switch (action.type) {
      case 0:
        if (action.labelIndex) {
          return this.pointer = action.labelIndex;
        } else {
          return this.jumpToLabel(action.label);
        }
        break;
      case 1:
        return this.callCommonEvent(action.commonEventId, null, this.isWaiting);
      case 2:
        domain = GameManager.variableStore.domain;
        return this.setBooleanValueTo(action["switch"], stateValue);
      case 3:
        return this.callScene((ref = action.scene) != null ? ref.uid : void 0);
      case 4:
        domain = GameManager.variableStore.domain;
        this.setNumberValueTo(action.bindValueVariable, bindValue);
        if (action.labelIndex) {
          return this.pointer = action.labelIndex;
        } else {
          return this.jumpToLabel(action.label);
        }
    }
  };


  /**
  * Calls a common event and returns the sub-interpreter for it.
  *
  * @method callCommonEvent
  * @param {number} id - The ID of the common event to call.
  * @param {Object} parameters - Optional common event parameters.
  * @param {boolean} wait - Indicates if the interpreter should be stay in waiting-mode even if the sub-interpreter is finished.
   */

  Component_CommandInterpreter.prototype.callCommonEvent = function(id, parameters, wait) {
    var commonEvent, ref;
    commonEvent = GameManager.commonEvents[id];
    if (commonEvent != null) {
      if (SceneManager.scene.commonEventContainer.subObjects.indexOf(commonEvent) === -1) {
        SceneManager.scene.commonEventContainer.addObject(commonEvent);
      }
      if ((ref = commonEvent.events) != null) {
        ref.on("finish", gs.CallBack("onCommonEventFinish", this), {
          waiting: wait
        });
      }
      this.subInterpreter = commonEvent.behavior.call(parameters || [], this.settings, this.context);
      commonEvent.behavior.update();
      if (this.subInterpreter != null) {
        this.isWaiting = true;
        this.subInterpreter.settings = this.settings;
        this.subInterpreter.start();
        return this.subInterpreter.update();
      }
    }
  };


  /**
  * Calls a scene and returns the sub-interpreter for it.
  *
  * @method callScene
  * @param {String} uid - The UID of the scene to call.
   */

  Component_CommandInterpreter.prototype.callScene = function(uid) {
    var object, sceneDocument;
    sceneDocument = DataManager.getDocument(uid);
    if (sceneDocument != null) {
      this.isWaiting = true;
      this.subInterpreter = new vn.Component_CallSceneInterpreter();
      object = {
        commands: sceneDocument.items.commands
      };
      this.subInterpreter.repeat = false;
      this.subInterpreter.context.set(sceneDocument.uid, sceneDocument);
      this.subInterpreter.object = object;
      this.subInterpreter.onFinish = gs.CallBack("onCallSceneFinish", this);
      this.subInterpreter.start();
      this.subInterpreter.settings = this.settings;
      return this.subInterpreter.update();
    }
  };


  /**
  * Calls a common event and returns the sub-interpreter for it.
  *
  * @method storeListValue
  * @param {number} id - The ID of the common event to call.
  * @param {Object} parameters - Optional common event parameters.
  * @param {boolean} wait - Indicates if the interpreter should be stay in waiting-mode even if the sub-interpreter is finished.
   */

  Component_CommandInterpreter.prototype.storeListValue = function(variable, list, value, valueType) {
    switch (valueType) {
      case 0:
        return this.setNumberValueTo(variable, (!isNaN(value) ? value : 0));
      case 1:
        return this.setBooleanValueTo(variable, (value ? 1 : 0));
      case 2:
        return this.setStringValueTo(variable, value.toString());
      case 3:
        return this.setListObjectTo(variable, (value.length != null ? value : []));
    }
  };


  /**
  * @method jumpToLabel
   */

  Component_CommandInterpreter.prototype.jumpToLabel = function(label) {
    var found, i, k, ref;
    if (!label) {
      return;
    }
    found = false;
    for (i = k = 0, ref = this.object.commands.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      if (this.object.commands[i].id === "gs.Label" && this.object.commands[i].params.name === label) {
        this.pointer = i;
        this.indent = this.object.commands[i].indent;
        found = true;
        break;
      }
    }
    if (found) {
      this.waitCounter = 0;
      return this.isWaiting = false;
    }
  };


  /**
  * Gets the current message box object depending on game mode (ADV or NVL).
  *
  * @method messageBoxObject
  * @return {gs.Object_Base} The message box object.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageBoxObject = function(id) {
    if (SceneManager.scene.layout.visible) {
      return gs.ObjectManager.current.objectById(id || "messageBox");
    } else {
      return gs.ObjectManager.current.objectById(id || "nvlMessageBox");
    }
  };


  /**
  * Gets the current message object depending on game mode (ADV or NVL).
  *
  * @method messageObject
  * @return {ui.Object_Message} The message object.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageObject = function() {
    if (SceneManager.scene.layout.visible) {
      return gs.ObjectManager.current.objectById("gameMessage_message");
    } else {
      return gs.ObjectManager.current.objectById("nvlGameMessage_message");
    }
  };


  /**
  * Gets the current message ID depending on game mode (ADV or NVL).
  *
  * @method messageObjectId
  * @return {string} The message object ID.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageObjectId = function() {
    if (SceneManager.scene.layout.visible) {
      return "gameMessage_message";
    } else {
      return "nvlGameMessage_message";
    }
  };


  /**
  * Gets the current message settings.
  *
  * @method messageSettings
  * @return {Object} The message settings
  * @protected
   */

  Component_CommandInterpreter.prototype.messageSettings = function() {
    var message;
    message = this.targetMessage();
    return message.settings;
  };


  /**
  * Gets the current target message object where all message commands are executed on.
  *
  * @method targetMessage
  * @return {ui.Object_Message} The target message object.
  * @protected
   */

  Component_CommandInterpreter.prototype.targetMessage = function() {
    var message, ref, ref1, ref2, target;
    message = this.messageObject();
    target = this.settings.message.target;
    if (target != null) {
      switch (target.type) {
        case 0:
          message = (ref = gs.ObjectManager.current.objectById(target.id)) != null ? ref : this.messageObject();
          break;
        case 1:
          message = (ref1 = (ref2 = SceneManager.scene.messageAreas[target.id]) != null ? ref2.message : void 0) != null ? ref1 : this.messageObject();
      }
    }
    return message;
  };


  /**
  * Gets the current target message box containing the current target message.
  *
  * @method targetMessageBox
  * @return {ui.Object_UIElement} The target message box.
  * @protected
   */

  Component_CommandInterpreter.prototype.targetMessageBox = function() {
    var messageBox, ref, ref1, target;
    messageBox = this.messageObject();
    target = this.settings.message.target;
    if (target != null) {
      switch (target.type) {
        case 0:
          messageBox = (ref = gs.ObjectManager.current.objectById(target.id)) != null ? ref : this.messageObject();
          break;
        case 1:
          messageBox = (ref1 = gs.ObjectManager.current.objectById("customGameMessage_" + target.id)) != null ? ref1 : this.messageObject();
      }
    }
    return messageBox;
  };


  /**
  * Called after an input number dialog was accepted by the user. It takes the user's input and puts
  * it in the configured number variable.
  *
  * @method onInputNumberFinish
  * @return {Object} Event Object containing additional data like the number, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onInputNumberFinish = function(e) {
    this.messageObject().behavior.clear();
    this.setNumberValueTo(this.waitingFor.inputNumber.variable, parseInt(ui.Component_FormulaHandler.fieldValue(e.sender, e.number)));
    this.isWaiting = false;
    this.waitingFor.inputNumber = null;
    return SceneManager.scene.inputNumberBox.dispose();
  };


  /**
  * Called after an input text dialog was accepted by the user. It takes the user's text input and puts
  * it in the configured string variable.
  *
  * @method onInputTextFinish
  * @return {Object} Event Object containing additional data like the text, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onInputTextFinish = function(e) {
    this.messageObject().behavior.clear();
    this.setStringValueTo(this.waitingFor.inputText.variable, ui.Component_FormulaHandler.fieldValue(e.sender, e.text).replace(/_/g, ""));
    this.isWaiting = false;
    this.waitingFor.inputText = null;
    return SceneManager.scene.inputTextBox.dispose();
  };


  /**
  * Called after a choice was selected by the user. It jumps to the corresponding label
  * and also puts the choice into backlog.
  *
  * @method onChoiceAccept
  * @return {Object} Event Object containing additional data like the label, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onChoiceAccept = function(e) {
    var duration, fading, messageObject, scene;
    scene = SceneManager.scene;
    scene.choiceTimer.behavior.stop();
    e.isSelected = true;
    delete e.sender;
    GameManager.backlog.push({
      character: {
        name: ""
      },
      message: "",
      choice: e,
      choices: $tempFields.choices,
      isChoice: true
    });
    GameManager.tempFields.choices = [];
    messageObject = this.messageObject();
    if (messageObject != null ? messageObject.visible : void 0) {
      this.isWaiting = true;
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      messageObject.animator.disappear(fading.animation, fading.easing, duration, (function(_this) {
        return function() {
          messageObject.behavior.clear();
          messageObject.visible = false;
          _this.isWaiting = false;
          _this.waitingFor.choice = null;
          return _this.executeAction(e.action, true);
        };
      })(this));
    } else {
      this.isWaiting = false;
      this.executeAction(e.action, true);
    }
    return scene.choiceWindow.dispose();
  };


  /**
  * Idle
  * @method commandIdle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandIdle = function() {
    return this.interpreter.isWaiting = !this.interpreter.isInstantSkip();
  };


  /**
  * Start Timer
  * @method commandStartTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStartTimer = function() {
    var number, scene, timer, timers;
    scene = SceneManager.scene;
    timers = scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    timer = timers[number];
    if (timer == null) {
      timer = new gs.Object_IntervalTimer();
      timers[number] = timer;
    }
    timer.events.offByOwner("elapsed", this.object);
    timer.events.on("elapsed", (function(_this) {
      return function(e) {
        var params;
        params = e.data.params;
        switch (params.action.type) {
          case 0:
            if (params.labelIndex != null) {
              return SceneManager.scene.interpreter.pointer = params.labelIndex;
            } else {
              return SceneManager.scene.interpreter.jumpToLabel(params.action.data.label);
            }
            break;
          case 1:
            return SceneManager.scene.interpreter.callCommonEvent(params.action.data.commonEventId);
        }
      };
    })(this), {
      params: this.params
    }, this.object);
    timer.behavior.interval = this.interpreter.durationValueOf(this.params.interval);
    return timer.behavior.start();
  };


  /**
  * Resume Timer
  * @method commandResumeTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.resume() : void 0;
  };


  /**
  * Pauses Timer
  * @method commandPauseTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPauseTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.pause() : void 0;
  };


  /**
  * Stop Timer
  * @method commandStopTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.stop() : void 0;
  };


  /**
  * Wait
  * @method commandWait
  * @protected
   */

  Component_CommandInterpreter.prototype.commandWait = function() {
    var time;
    time = this.interpreter.durationValueOf(this.params.time);
    if ((time != null) && time > 0 && !this.interpreter.previewData) {
      this.interpreter.waitCounter = time;
      return this.interpreter.isWaiting = true;
    }
  };


  /**
  * Loop
  * @method commandLoop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLoop = function() {
    this.interpreter.loops[this.interpreter.indent] = this.interpreter.pointer;
    return this.interpreter.indent++;
  };


  /**
  * Break Loop
  * @method commandBreakLoop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBreakLoop = function() {
    var indent;
    indent = this.indent;
    while ((this.interpreter.loops[indent] == null) && indent > 0) {
      indent--;
    }
    this.interpreter.loops[indent] = null;
    return this.interpreter.indent = indent;
  };


  /**
  * @method commandListAdd
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListAdd = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    switch (this.params.valueType) {
      case 0:
        list.push(this.interpreter.numberValueOf(this.params.numberValue));
        break;
      case 1:
        list.push(this.interpreter.booleanValueOf(this.params.switchValue));
        break;
      case 2:
        list.push(this.interpreter.stringValueOf(this.params.stringValue));
        break;
      case 3:
        list.push(this.interpreter.listObjectOf(this.params.listValue));
    }
    return this.interpreter.setListObjectTo(this.params.listVariable, list);
  };


  /**
  * @method commandListPop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListPop = function() {
    var list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = (ref = list.pop()) != null ? ref : 0;
    return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
  };


  /**
  * @method commandListShift
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListShift = function() {
    var list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = (ref = list.shift()) != null ? ref : 0;
    return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
  };


  /**
  * @method commandListIndexOf
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListIndexOf = function() {
    var list, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = -1;
    switch (this.params.valueType) {
      case 0:
        value = list.indexOf(this.interpreter.numberValueOf(this.params.numberValue));
        break;
      case 1:
        value = list.indexOf(this.interpreter.booleanValueOf(this.params.switchValue));
        break;
      case 2:
        value = list.indexOf(this.interpreter.stringValueOf(this.params.stringValue));
        break;
      case 3:
        value = list.indexOf(this.interpreter.listObjectOf(this.params.listValue));
    }
    return this.interpreter.setNumberValueTo(this.params.targetVariable, value);
  };


  /**
  * @method commandListClear
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListClear = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    return list.length = 0;
  };


  /**
  * @method commandListValueAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListValueAt = function() {
    var index, list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      value = (ref = list[index]) != null ? ref : 0;
      return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
    }
  };


  /**
  * @method commandListRemoveAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListRemoveAt = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      return list.splice(index, 1);
    }
  };


  /**
  * @method commandListInsertAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListInsertAt = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      switch (this.params.valueType) {
        case 0:
          list.splice(index, 0, this.interpreter.numberValueOf(this.params.numberValue));
          break;
        case 1:
          list.splice(index, 0, this.interpreter.booleanValueOf(this.params.switchValue));
          break;
        case 2:
          list.splice(index, 0, this.interpreter.stringValueOf(this.params.stringValue));
          break;
        case 3:
          list.splice(index, 0, this.interpreter.listObjectOf(this.params.listValue));
      }
      return this.interpreter.setListObjectTo(this.params.listVariable, list);
    }
  };


  /**
  * @method commandListSet
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListSet = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0) {
      switch (this.params.valueType) {
        case 0:
          list[index] = this.interpreter.numberValueOf(this.params.numberValue);
          break;
        case 1:
          list[index] = this.interpreter.booleanValueOf(this.params.switchValue);
          break;
        case 2:
          list[index] = this.interpreter.stringValueOf(this.params.stringValue);
          break;
        case 3:
          list[index] = this.interpreter.listObjectOf(this.params.listValue);
      }
      return this.interpreter.setListObjectTo(this.params.listVariable, list);
    }
  };


  /**
  * @method commandListCopy
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListCopy = function() {
    var copy, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    copy = Object.deepCopy(list);
    return this.interpreter.setListObjectTo(this.params.targetVariable, copy);
  };


  /**
  * @method commandListLength
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListLength = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    return this.interpreter.setNumberValueTo(this.params.targetVariable, list.length);
  };


  /**
  * @method commandListJoin
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListJoin = function() {
    var list, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = this.params.order === 0 ? list.join("") : list.reverse().join("");
    return this.interpreter.setStringValueTo(this.params.targetVariable, value);
  };


  /**
  * @method commandListFromText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListFromText = function() {
    var list, separator, text;
    text = this.interpreter.stringValueOf(this.params.textVariable);
    separator = this.interpreter.stringValueOf(this.params.separator);
    list = text.split(separator);
    return this.interpreter.setListObjectTo(this.params.targetVariable, list);
  };


  /**
  * @method commandListShuffle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListShuffle = function() {
    var i, j, k, list, ref, results, tempi, tempj;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    if (list.length === 0) {
      return;
    }
    results = [];
    for (i = k = ref = list.length - 1; ref <= 1 ? k <= 1 : k >= 1; i = ref <= 1 ? ++k : --k) {
      j = Math.floor(Math.random() * (i + 1));
      tempi = list[i];
      tempj = list[j];
      list[i] = tempj;
      results.push(list[j] = tempi);
    }
    return results;
  };


  /**
  * @method commandListSort
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListSort = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    if (list.length === 0) {
      return;
    }
    switch (this.params.sortOrder) {
      case 0:
        return list.sort(function(a, b) {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
      case 1:
        return list.sort(function(a, b) {
          if (a > b) {
            return -1;
          }
          if (a < b) {
            return 1;
          }
          return 0;
        });
    }
  };


  /**
  * @method commandResetVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResetVariables = function() {
    var range;
    switch (this.params.target) {
      case 0:
        range = null;
        break;
      case 1:
        range = this.params.range;
    }
    switch (this.params.scope) {
      case 0:
        if (this.params.scene) {
          return GameManager.variableStore.clearLocalVariables({
            id: this.params.scene.uid
          }, this.params.type, range);
        }
        break;
      case 1:
        return GameManager.variableStore.clearLocalVariables(null, this.params.type, range);
      case 2:
        return GameManager.variableStore.clearGlobalVariables(this.params.type, range);
      case 3:
        GameManager.variableStore.clearPersistentVariables(this.params.type, range);
        return GameManager.saveGlobalData();
    }
  };


  /**
  * @method commandChangeVariableDomain
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeVariableDomain = function() {
    return GameManager.variableStore.changeDomain(this.interpreter.stringValueOf(this.params.domain));
  };


  /**
  * @method commandChangeDecimalVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeDecimalVariables = function() {
    return this.interpreter.changeDecimalVariables(this.params, this.params.roundMethod);
  };


  /**
  * @method commandChangeNumberVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeNumberVariables = function() {
    var diff, end, i, index, k, ref, ref1, scope, source, start;
    source = 0;
    switch (this.params.source) {
      case 0:
        source = this.interpreter.numberValueOf(this.params.sourceValue);
        break;
      case 1:
        start = this.interpreter.numberValueOf(this.params.sourceRandom.start);
        end = this.interpreter.numberValueOf(this.params.sourceRandom.end);
        diff = end - start;
        source = Math.floor(start + Math.random() * (diff + 1));
        break;
      case 2:
        source = this.interpreter.numberValueAtIndex(this.params.sourceScope, this.interpreter.numberValueOf(this.params.sourceReference) - 1, this.params.sourceReferenceDomain);
        break;
      case 3:
        source = this.interpreter.numberValueOfGameData(this.params.sourceValue1);
        break;
      case 4:
        source = this.interpreter.numberValueOfDatabaseData(this.params.sourceValue1);
    }
    switch (this.params.target) {
      case 0:
        switch (this.params.operation) {
          case 0:
            this.interpreter.setNumberValueTo(this.params.targetVariable, source);
            break;
          case 1:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) + source);
            break;
          case 2:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) - source);
            break;
          case 3:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) * source);
            break;
          case 4:
            this.interpreter.setNumberValueTo(this.params.targetVariable, Math.floor(this.interpreter.numberValueOf(this.params.targetVariable) / source));
            break;
          case 5:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) % source);
        }
        break;
      case 1:
        scope = this.params.targetScope;
        start = this.params.targetRange.start - 1;
        end = this.params.targetRange.end - 1;
        for (i = k = ref = start, ref1 = end; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          switch (this.params.operation) {
            case 0:
              this.interpreter.setNumberValueAtIndex(scope, i, source);
              break;
            case 1:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) + source);
              break;
            case 2:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) - source);
              break;
            case 3:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) * source);
              break;
            case 4:
              this.interpreter.setNumberValueAtIndex(scope, i, Math.floor(this.interpreter.numberValueAtIndex(scope, i) / source));
              break;
            case 5:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) % source);
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        switch (this.params.operation) {
          case 0:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, source, this.params.targetReferenceDomain);
            break;
          case 1:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) + source, this.params.targetReferenceDomain);
            break;
          case 2:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) - source, this.params.targetReferenceDomain);
            break;
          case 3:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) * source, this.params.targetReferenceDomain);
            break;
          case 4:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, Math.floor(this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) / source), this.params.targetReferenceDomain);
            break;
          case 5:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) % source, this.params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * @method commandChangeBooleanVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeBooleanVariables = function() {
    var i, index, k, ref, ref1, source, targetValue, variable;
    source = this.interpreter.booleanValueOf(this.params.value);
    switch (this.params.target) {
      case 0:
        if (this.params.value === 2) {
          targetValue = this.interpreter.booleanValueOf(this.params.targetVariable);
          this.interpreter.setBooleanValueTo(this.params.targetVariable, targetValue ? false : true);
        } else {
          this.interpreter.setBooleanValueTo(this.params.targetVariable, source);
        }
        break;
      case 1:
        variable = {
          index: 0,
          scope: this.params.targetRangeScope
        };
        for (i = k = ref = this.params.rangeStart - 1, ref1 = this.params.rangeEnd - 1; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          variable.index = i;
          if (this.params.value === 2) {
            targetValue = this.interpreter.booleanValueOf(variable);
            this.interpreter.setBooleanValueTo(variable, targetValue ? false : true);
          } else {
            this.interpreter.setBooleanValueTo(variable, source);
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        this.interpreter.setBooleanValueAtIndex(this.params.targetRangeScope, index, source, this.params.targetReferenceDomain);
    }
    return null;
  };


  /**
  * @method commandChangeStringVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeStringVariables = function() {
    var ex, i, index, k, ref, ref1, source, targetValue, variable;
    source = "";
    switch (this.params.source) {
      case 0:
        source = lcs(this.params.textValue);
        break;
      case 1:
        source = this.interpreter.stringValueOf(this.params.sourceVariable);
        break;
      case 2:
        source = this.interpreter.stringValueOfDatabaseData(this.params.databaseData);
        break;
      case 2:
        try {
          source = eval(this.params.script);
        } catch (error) {
          ex = error;
          source = "ERR: " + ex.message;
        }
        break;
      default:
        source = lcs(this.params.textValue);
    }
    switch (this.params.target) {
      case 0:
        switch (this.params.operation) {
          case 0:
            this.interpreter.setStringValueTo(this.params.targetVariable, source);
            break;
          case 1:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable) + source);
            break;
          case 2:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable).toUpperCase());
            break;
          case 3:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable).toLowerCase());
        }
        break;
      case 1:
        variable = {
          index: 0,
          scope: this.params.targetRangeScope
        };
        for (i = k = ref = this.params.rangeStart - 1, ref1 = this.params.rangeEnd - 1; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          variable.index = i;
          switch (this.params.operation) {
            case 0:
              this.interpreter.setStringValueTo(variable, source);
              break;
            case 1:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable) + source);
              break;
            case 2:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable).toUpperCase());
              break;
            case 3:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable).toLowerCase());
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        switch (this.params.operation) {
          case 0:
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, source, this.params.targetReferenceDomain);
            break;
          case 1:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, targetValue + source, this.params.targetReferenceDomain);
            break;
          case 2:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, targetValue.toUpperCase(), this.params.targetReferenceDomain);
            break;
          case 3:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueTo(this.params.targetRangeScope, index, targetValue.toLowerCase(), this.params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * @method commandCheckSwitch
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckSwitch = function() {
    var result;
    result = this.interpreter.booleanValueOf(this.params.targetVariable) && this.params.value;
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandNumberCondition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandNumberCondition = function() {
    var result;
    result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.targetVariable), this.interpreter.numberValueOf(this.params.value), this.params.operation);
    this.interpreter.conditions[this.interpreter.indent] = result;
    if (result) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandCondition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCondition = function() {
    var result;
    switch (this.params.valueType) {
      case 0:
        result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.variable), this.interpreter.numberValueOf(this.params.numberValue), this.params.operation);
        break;
      case 1:
        result = this.interpreter.compare(this.interpreter.booleanValueOf(this.params.variable), this.interpreter.booleanValueOf(this.params.switchValue), this.params.operation);
        break;
      case 2:
        result = this.interpreter.compare(lcs(this.interpreter.stringValueOf(this.params.variable)), lcs(this.interpreter.stringValueOf(this.params.textValue)), this.params.operation);
    }
    this.interpreter.conditions[this.interpreter.indent] = result;
    if (result) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandConditionElse
  * @protected
   */

  Component_CommandInterpreter.prototype.commandConditionElse = function() {
    if (!this.interpreter.conditions[this.interpreter.indent]) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandConditionElseIf
  * @protected
   */

  Component_CommandInterpreter.prototype.commandConditionElseIf = function() {
    if (!this.interpreter.conditions[this.interpreter.indent]) {
      return this.interpreter.commandCondition.call(this);
    }
  };


  /**
  * @method commandCheckNumberVariable
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckNumberVariable = function() {
    var result;
    result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.targetVariable), this.interpreter.numberValueOf(this.params.value), this.params.operation);
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandCheckTextVariable
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckTextVariable = function() {
    var result, text1, text2;
    result = false;
    text1 = this.interpreter.stringValueOf(this.params.targetVariable);
    text2 = this.interpreter.stringValueOf(this.params.value);
    switch (this.params.operation) {
      case 0:
        result = text1 === text2;
        break;
      case 1:
        result = text1 !== text2;
        break;
      case 2:
        result = text1.length > text2.length;
        break;
      case 3:
        result = text1.length >= text2.length;
        break;
      case 4:
        result = text1.length < text2.length;
        break;
      case 5:
        result = text1.length <= text2.length;
    }
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandLabel
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLabel = function() {};


  /**
  * @method commandJumpToLabel
  * @protected
   */

  Component_CommandInterpreter.prototype.commandJumpToLabel = function() {
    var label;
    label = this.params.labelIndex;
    if (label != null) {
      this.interpreter.pointer = label;
      return this.interpreter.indent = this.interpreter.object.commands[label].indent;
    } else {
      return this.interpreter.jumpToLabel(this.params.name);
    }
  };


  /**
  * @method commandClearMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandClearMessage = function() {
    var duration, fading, flags, isLocked, messageObject, scene;
    scene = SceneManager.scene;
    messageObject = this.interpreter.targetMessage();
    if (messageObject == null) {
      return;
    }
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = 0;
    fading = GameManager.tempSettings.messageFading;
    if (!GameManager.tempSettings.skip) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : fading.duration;
    }
    messageObject.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onMessageADVClear", this.interpreter));
    this.interpreter.waitForCompletion(messageObject, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMessageBoxDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageBoxDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      return defaults.disappearAnimation = this.params.disappearAnimation;
    }
  };


  /**
  * @method commandShowMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowMessage = function() {
    var animation, character, defaults, duration, easing, expression, ref, scene, showMessage;
    scene = SceneManager.scene;
    scene.messageMode = vn.MessageMode.ADV;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    showMessage = (function(_this) {
      return function() {
        var messageObject, ref, settings, voiceSettings;
        character = RecordManager.characters[_this.params.characterId];
        scene.layout.visible = true;
        messageObject = _this.interpreter.targetMessage();
        if (messageObject == null) {
          return;
        }
        scene.currentCharacter = character;
        messageObject.character = character;
        messageObject.opacity = 255;
        messageObject.events.offByOwner("callCommonEvent", _this.interpreter);
        messageObject.events.on("callCommonEvent", gs.CallBack("onCallCommonEvent", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        messageObject.events.once("finish", gs.CallBack("onMessageADVFinish", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        messageObject.events.once("waiting", gs.CallBack("onMessageADVWaiting", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        if (messageObject.settings.useCharacterColor) {
          messageObject.message.showMessage(_this.interpreter, _this.params, character);
        } else {
          messageObject.message.showMessage(_this.interpreter, _this.params);
        }
        settings = GameManager.settings;
        voiceSettings = settings.voicesByCharacter[character.index];
        if ((_this.params.voice != null) && GameManager.settings.voiceEnabled && (!voiceSettings || voiceSettings > 0)) {
          if ((GameManager.settings.skipVoiceOnAction || !((ref = AudioManager.voice) != null ? ref.playing : void 0)) && !GameManager.tempSettings.skip) {
            messageObject.voice = _this.params.voice;
            return messageObject.behavior.voice = AudioManager.playVoice(_this.params.voice);
          }
        } else {
          return messageObject.behavior.voice = null;
        }
      };
    })(this);
    if ((this.params.expressionId != null) && (character != null)) {
      expression = RecordManager.characterExpressions[this.params.expressionId || 0];
      defaults = GameManager.defaults.character;
      duration = !gs.CommandFieldFlags.isLocked(this.params.fieldFlags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.expressionDuration;
      easing = gs.Easings.fromObject(defaults.changeEasing);
      animation = defaults.changeAnimation;
      character.behavior.changeExpression(expression, animation, easing, duration, (function(_this) {
        return function() {
          return showMessage();
        };
      })(this));
    } else {
      showMessage();
    }
    this.interpreter.isWaiting = ((ref = this.params.waitForCompletion) != null ? ref : true) && !(GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0);
    return this.interpreter.waitingFor.messageADV = this.params;
  };


  /**
  * @method commandSetMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetMessageArea = function() {
    var messageLayout, number, scene;
    scene = SceneManager.scene;
    number = this.interpreter.numberValueOf(this.params.number);
    if (scene.messageAreas[number]) {
      messageLayout = scene.messageAreas[number].layout;
      messageLayout.dstRect.x = this.params.box.x;
      messageLayout.dstRect.y = this.params.box.y;
      messageLayout.dstRect.width = this.params.box.size.width;
      messageLayout.dstRect.height = this.params.box.size.height;
      return messageLayout.needsUpdate = true;
    }
  };


  /**
  * @method commandMessageFading
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageFading = function() {
    return GameManager.tempSettings.messageFading = {
      duration: this.interpreter.durationValueOf(this.params.duration),
      animation: this.params.animation,
      easing: gs.Easings.fromObject(this.params.easing)
    };
  };


  /**
  * @method commandMessageSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageSettings = function() {
    var flags, font, fontName, fontSize, isLocked, messageObject, messageSettings, ref, ref1, ref2, ref3, ref4, ref5;
    messageObject = this.interpreter.targetMessage();
    if (!messageObject) {
      return;
    }
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    messageSettings = this.interpreter.messageSettings();
    if (!isLocked(flags.autoErase)) {
      messageSettings.autoErase = this.params.autoErase;
    }
    if (!isLocked(flags.waitAtEnd)) {
      messageSettings.waitAtEnd = this.params.waitAtEnd;
    }
    if (!isLocked(flags.backlog)) {
      messageSettings.backlog = this.params.backlog;
    }
    if (!isLocked(flags.lineHeight)) {
      messageSettings.lineHeight = this.params.lineHeight;
    }
    if (!isLocked(flags.lineSpacing)) {
      messageSettings.lineSpacing = this.params.lineSpacing;
    }
    if (!isLocked(flags.linePadding)) {
      messageSettings.linePadding = this.params.linePadding;
    }
    if (!isLocked(flags.paragraphSpacing)) {
      messageSettings.paragraphSpacing = this.params.paragraphSpacing;
    }
    if (!isLocked(flags.useCharacterColor)) {
      messageSettings.useCharacterColor = this.params.useCharacterColor;
    }
    messageObject.textRenderer.minLineHeight = (ref = messageSettings.lineHeight) != null ? ref : 0;
    messageObject.textRenderer.lineSpacing = (ref1 = messageSettings.lineSpacing) != null ? ref1 : messageObject.textRenderer.lineSpacing;
    messageObject.textRenderer.padding = (ref2 = messageSettings.linePadding) != null ? ref2 : messageObject.textRenderer.padding;
    fontName = !isLocked(flags.font) ? this.params.font : messageObject.font.name;
    fontSize = !isLocked(flags.size) ? this.params.size : messageObject.font.size;
    font = messageObject.font;
    if (!isLocked(flags.font) || !isLocked(flags.size)) {
      messageObject.font = new Font(fontName, fontSize);
    }
    if (!isLocked(flags.bold)) {
      messageObject.font.bold = this.params.bold;
    }
    if (!isLocked(flags.italic)) {
      messageObject.font.italic = this.params.italic;
    }
    if (!isLocked(flags.smallCaps)) {
      messageObject.font.smallCaps = this.params.smallCaps;
    }
    if (!isLocked(flags.underline)) {
      messageObject.font.underline = this.params.underline;
    }
    if (!isLocked(flags.strikeThrough)) {
      messageObject.font.strikeThrough = this.params.strikeThrough;
    }
    if (!isLocked(flags.color)) {
      messageObject.font.color = new Color(this.params.color);
    }
    messageObject.font.color = (flags.color != null) && !isLocked(flags.color) ? new Color(this.params.color) : font.color;
    messageObject.font.border = (flags.outline != null) && !isLocked(flags.outline) ? this.params.outline : font.border;
    messageObject.font.borderColor = (flags.outlineColor != null) && !isLocked(flags.outlineColor) ? new Color(this.params.outlineColor) : new Color(font.borderColor);
    messageObject.font.borderSize = (flags.outlineSize != null) && !isLocked(flags.outlineSize) ? (ref3 = this.params.outlineSize) != null ? ref3 : 4 : font.borderSize;
    messageObject.font.shadow = (flags.shadow != null) && !isLocked(flags.shadow) ? this.params.shadow : font.shadow;
    messageObject.font.shadowColor = (flags.shadowColor != null) && !isLocked(flags.shadowColor) ? new Color(this.params.shadowColor) : new Color(font.shadowColor);
    messageObject.font.shadowOffsetX = (flags.shadowOffsetX != null) && !isLocked(flags.shadowOffsetX) ? (ref4 = this.params.shadowOffsetX) != null ? ref4 : 1 : font.shadowOffsetX;
    messageObject.font.shadowOffsetY = (flags.shadowOffsetY != null) && !isLocked(flags.shadowOffsetY) ? (ref5 = this.params.shadowOffsetY) != null ? ref5 : 1 : font.shadowOffsetY;
    if (isLocked(flags.bold)) {
      messageObject.font.bold = font.bold;
    }
    if (isLocked(flags.italic)) {
      messageObject.font.italic = font.italic;
    }
    if (isLocked(flags.smallCaps)) {
      return messageObject.font.smallCaps = font.smallCaps;
    }
  };


  /**
  * @method commandCreateMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCreateMessageArea = function() {
    var messageArea, number, scene;
    number = this.interpreter.numberValueOf(this.params.number);
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    if (!scene.messageAreas[number]) {
      messageArea = new gs.Object_MessageArea();
      messageArea.layout = ui.UIManager.createControlFromDescriptor({
        type: "ui.CustomGameMessage",
        id: "customGameMessage_" + number,
        params: {
          id: "customGameMessage_" + number
        }
      }, messageArea);
      messageArea.message = gs.ObjectManager.current.objectById("customGameMessage_" + number + "_message");
      messageArea.message.domain = this.params.numberDomain;
      messageArea.addObject(messageArea.layout);
      messageArea.layout.dstRect.x = this.params.box.x;
      messageArea.layout.dstRect.y = this.params.box.y;
      messageArea.layout.dstRect.width = this.params.box.size.width;
      messageArea.layout.dstRect.height = this.params.box.size.height;
      messageArea.layout.needsUpdate = true;
      return scene.messageAreas[number] = messageArea;
    }
  };


  /**
  * @method commandEraseMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseMessageArea = function() {
    var area, number, scene;
    number = this.interpreter.numberValueOf(this.params.number);
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    area = scene.messageAreas[number];
    if (area != null) {
      area.layout.dispose();
    }
    return scene.messageAreas[number] = null;
  };


  /**
  * @method commandSetTargetMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetTargetMessage = function() {
    var message, ref, ref1, scene, target;
    message = this.interpreter.targetMessage();
    if (message != null) {
      message.textRenderer.isWaiting = false;
    }
    if (message != null) {
      message.behavior.isWaiting = false;
    }
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    target = {
      type: this.params.type,
      id: null
    };
    switch (this.params.type) {
      case 0:
        target.id = this.params.id;
        break;
      case 1:
        target.id = this.interpreter.numberValueOf(this.params.number);
    }
    this.interpreter.settings.message.target = target;
    if (this.params.clear) {
      if ((ref = this.interpreter.targetMessage()) != null) {
        ref.behavior.clear();
      }
    }
    return (ref1 = this.interpreter.targetMessage()) != null ? ref1.visible = true : void 0;
  };


  /**
  * @method commandBacklogVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBacklogVisibility = function() {
    var control;
    if (this.params.visible) {
      control = gs.ObjectManager.current.objectById("backlogBox");
      if (control == null) {
        control = gs.ObjectManager.current.objectById("backlog");
      }
      if (control != null) {
        control.dispose();
      }
      if (this.params.backgroundVisible) {
        return control = SceneManager.scene.behavior.createControl(this, {
          descriptor: "ui.MessageBacklogBox"
        });
      } else {
        return control = SceneManager.scene.behavior.createControl(this, {
          descriptor: "ui.MessageBacklog"
        });
      }
    } else {
      control = gs.ObjectManager.current.objectById("backlogBox");
      if (control == null) {
        control = gs.ObjectManager.current.objectById("backlog");
      }
      return control != null ? control.dispose() : void 0;
    }
  };


  /**
  * @method commandMessageVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageVisibility = function() {
    var animation, defaults, duration, easing, flags, isLocked, message;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    message = this.interpreter.targetMessage();
    if ((message == null) || this.params.visible === message.visible) {
      return;
    }
    if (this.params.visible) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.appearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
      message.animator.appear(message.dstRect.x, message.dstRect.y, this.params.animation, easing, duration);
    } else {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.disappearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
      message.animator.disappear(animation, easing, duration, function() {
        return message.visible = false;
      });
    }
    message.update();
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMessageBoxVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageBoxVisibility = function() {
    var animation, defaults, duration, easing, flags, isLocked, messageBox, visible;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    messageBox = this.interpreter.messageBoxObject(this.interpreter.stringValueOf(this.params.id));
    visible = this.params.visible === 1;
    if ((messageBox == null) || visible === messageBox.visible) {
      return;
    }
    if (this.params.visible) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.appearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
      messageBox.animator.appear(messageBox.dstRect.x, messageBox.dstRect.y, animation, easing, duration);
    } else {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.disappearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
      messageBox.animator.disappear(animation, easing, duration, function() {
        return messageBox.visible = false;
      });
    }
    messageBox.update();
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandUIAccess
  * @protected
   */

  Component_CommandInterpreter.prototype.commandUIAccess = function() {
    var flags, isLocked;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.generalMenu)) {
      GameManager.tempSettings.menuAccess = this.interpreter.booleanValueOf(this.params.generalMenu);
    }
    if (!isLocked(flags.saveMenu)) {
      GameManager.tempSettings.saveMenuAccess = this.interpreter.booleanValueOf(this.params.saveMenu);
    }
    if (!isLocked(flags.loadMenu)) {
      GameManager.tempSettings.loadMenuAccess = this.interpreter.booleanValueOf(this.params.loadMenu);
    }
    if (!isLocked(flags.backlog)) {
      return GameManager.tempSettings.backlogAccess = this.interpreter.booleanValueOf(this.params.backlog);
    }
  };


  /**
  * @method commandUnlockCG
  * @protected
   */

  Component_CommandInterpreter.prototype.commandUnlockCG = function() {
    var cg;
    cg = RecordManager.cgGallery[this.interpreter.stringValueOf(this.params.cgId)];
    if (cg != null) {
      GameManager.globalData.cgGallery[cg.index] = {
        unlocked: true
      };
      return GameManager.saveGlobalData();
    }
  };


  /**
  * @method commandL2DMove
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMove = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character instanceof vn.Object_Live2DCharacter) {
      return;
    }
    this.interpreter.moveObject(character, this.params.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DMotionGroup
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMotionGroup = function() {
    var character, motions, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character instanceof vn.Object_Live2DCharacter) {
      return;
    }
    character.motionGroup = {
      name: this.params.data.motionGroup,
      loop: this.params.loop,
      playType: this.params.playType
    };
    if (this.params.waitForCompletion && !this.params.loop) {
      motions = character.model.motionsByGroup[character.motionGroup.name];
      if (motions != null) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = motions.sum(function(m) {
          return m.getDurationMSec() / 16.6;
        });
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DMotion
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMotion = function() {
    var character, defaults, fadeInTime, flags, isLocked, motion, scene;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character instanceof vn.Object_Live2DCharacter) {
      return;
    }
    fadeInTime = !isLocked(flags.fadeInTime) ? this.params.fadeInTime : defaults.motionFadeInTime;
    character.motion = {
      name: this.params.data.motion,
      fadeInTime: fadeInTime,
      loop: this.params.loop
    };
    character.motionGroup = null;
    if (this.params.waitForCompletion && !this.params.loop) {
      motion = character.model.motions[character.motion.name];
      if (motion != null) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = motion.getDurationMSec() / 16.6;
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DExpression
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DExpression = function() {
    var character, defaults, fadeInTime, flags, isLocked, scene;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character instanceof vn.Object_Live2DCharacter) {
      return;
    }
    fadeInTime = !isLocked(flags.fadeInTime) ? this.params.fadeInTime : defaults.expressionFadeInTime;
    character.expression = {
      name: this.params.data.expression,
      fadeInTime: fadeInTime
    };
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DExitScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DExitScene = function() {
    var defaults;
    defaults = GameManager.defaults.live2d;
    this.interpreter.commandCharacterExitScene.call(this, defaults);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DSettings = function() {
    var character, flags, isLocked, scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character != null ? character.visual.l2dObject : void 0)) {
      return;
    }
    if (!isLocked(flags.lipSyncSensitivity)) {
      character.visual.l2dObject.lipSyncSensitivity = this.interpreter.numberValueOf(this.params.lipSyncSensitivity);
    }
    if (!isLocked(flags.idleIntensity)) {
      character.visual.l2dObject.idleIntensity = this.interpreter.numberValueOf(this.params.idleIntensity);
    }
    if (!isLocked(flags.breathIntensity)) {
      character.visual.l2dObject.breathIntensity = this.interpreter.numberValueOf(this.params.breathIntensity);
    }
    if (!isLocked(flags["eyeBlink.enabled"])) {
      character.visual.l2dObject.eyeBlink.enabled = this.params.eyeBlink.enabled;
    }
    if (!isLocked(flags["eyeBlink.interval"])) {
      character.visual.l2dObject.eyeBlink.blinkIntervalMsec = this.interpreter.numberValueOf(this.params.eyeBlink.interval);
    }
    if (!isLocked(flags["eyeBlink.closedMotionTime"])) {
      character.visual.l2dObject.eyeBlink.closedMotionMsec = this.interpreter.numberValueOf(this.params.eyeBlink.closedMotionTime);
    }
    if (!isLocked(flags["eyeBlink.closingMotionTime"])) {
      character.visual.l2dObject.eyeBlink.closingMotionMsec = this.interpreter.numberValueOf(this.params.eyeBlink.closingMotionTime);
    }
    if (!isLocked(flags["eyeBlink.openingMotionTime"])) {
      character.visual.l2dObject.eyeBlink.openingMotionMsec = this.interpreter.numberValueOf(this.params.eyeBlink.openingMotionTime);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DParameter = function() {
    var character, duration, easing, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character instanceof vn.Object_Live2DCharacter) {
      return;
    }
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.l2dParameterTo(this.params.param.name, this.interpreter.numberValueOf(this.params.param.value), duration, easing);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags.motionFadeInTime)) {
      defaults.motionFadeInTime = this.interpreter.numberValueOf(this.params.motionFadeInTime);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DJoinScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DJoinScene = function() {
    var animation, character, defaults, duration, easing, flags, isLocked, motionBlur, origin, p, record, ref, ref1, ref2, ref3, ref4, ref5, scene, x, y, zIndex;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    record = RecordManager.characters[this.interpreter.stringValueOf(this.params.characterId)];
    if (!record || scene.characters.first(function(v) {
      return !v.disposed && v.rid === record.index;
    })) {
      return;
    }
    if (this.params.positionType === 1) {
      x = this.params.position.x;
      y = this.params.position.y;
    } else if (this.params.positionType === 2) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    motionBlur = !isLocked(flags["motionBlur.enabled"]) ? this.params.motionBlur : defaults.motionBlur;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    character = new vn.Object_Live2DCharacter(record);
    character.modelName = ((ref = this.params.model) != null ? ref.name : void 0) || "";
    character.model = ResourceManager.getLive2DModel("Live2D/" + character.modelName);
    if (character.model.motions) {
      character.motion = {
        name: "",
        fadeInTime: 0,
        loop: true
      };
    }
    character.dstRect.x = x;
    character.dstRect.y = y;
    character.anchor.x = !origin ? 0 : 0.5;
    character.anchor.y = !origin ? 0 : 0.5;
    character.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    character.zoom.x = this.params.position.zoom.d;
    character.zoom.y = this.params.position.zoom.d;
    character.zIndex = zIndex || 200;
    if ((ref1 = character.model) != null) {
      ref1.reset();
    }
    character.setup();
    character.visual.l2dObject.idleIntensity = (ref2 = record.idleIntensity) != null ? ref2 : 1.0;
    character.visual.l2dObject.breathIntensity = (ref3 = record.breathIntensity) != null ? ref3 : 1.0;
    character.visual.l2dObject.lipSyncSensitivity = (ref4 = record.lipSyncSensitivity) != null ? ref4 : 1.0;
    character.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, character, this.params);
      character.dstRect.x = p.x;
      character.dstRect.y = p.y;
    }
    scene.behavior.addCharacter(character, false, {
      animation: animation,
      duration: duration,
      easing: easing,
      motionBlur: motionBlur
    });
    if (((ref5 = this.params.viewport) != null ? ref5.type : void 0) === "ui") {
      character.viewport = Graphics.viewport;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterJoinScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterJoinScene = function() {
    var angle, animation, bitmap, character, defaults, duration, easing, flags, isLocked, mirror, motionBlur, origin, p, record, ref, ref1, ref2, ref3, ref4, scene, x, y, zIndex, zoom;
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    record = RecordManager.characters[this.params.characterId];
    if (!record || scene.characters.first(function(v) {
      return !v.disposed && v.rid === record.index && !v.disposed;
    })) {
      return;
    }
    character = new vn.Object_Character(record, null, scene);
    character.expression = RecordManager.characterExpressions[((ref = this.params.expressionId) != null ? ref : record.defaultExpressionId) || 0];
    if (character.expression != null) {
      bitmap = ResourceManager.getBitmap("Graphics/Characters/" + ((ref1 = character.expression.idle[0]) != null ? ref1.resource.name : void 0));
    }
    mirror = false;
    angle = 0;
    zoom = 1;
    if (this.params.positionType === 1) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
      mirror = this.params.position.horizontalFlip;
      angle = this.params.position.angle || 0;
      zoom = ((ref2 = this.params.position.data) != null ? ref2.zoom : void 0) || 1;
    } else if (this.params.positionType === 2) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
      mirror = false;
      angle = 0;
      zoom = 1;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    motionBlur = !isLocked(flags["motionBlur.enabled"]) ? this.params.motionBlur : defaults.motionBlur;
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if (character.expression != null) {
      bitmap = ResourceManager.getBitmap("Graphics/Characters/" + ((ref3 = character.expression.idle[0]) != null ? ref3.resource.name : void 0));
      if (this.params.origin === 1 && (bitmap != null)) {
        x += (bitmap.width * zoom - bitmap.width) / 2;
        y += (bitmap.height * zoom - bitmap.height) / 2;
      }
    }
    character.mirror = mirror;
    character.anchor.x = !origin ? 0 : 0.5;
    character.anchor.y = !origin ? 0 : 0.5;
    character.zoom.x = zoom;
    character.zoom.y = zoom;
    character.dstRect.x = x;
    character.dstRect.y = y;
    character.zIndex = zIndex || 200;
    character.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    character.angle = angle;
    character.setup();
    character.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, character, this.params);
      character.dstRect.x = p.x;
      character.dstRect.y = p.y;
    }
    scene.behavior.addCharacter(character, false, {
      animation: animation,
      duration: duration,
      easing: easing,
      motionBlur: motionBlur
    });
    if (((ref4 = this.params.viewport) != null ? ref4.type : void 0) === "ui") {
      character.viewport = Graphics.viewport;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterExitScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterExitScene = function(defaults) {
    var animation, character, duration, easing, flags, isLocked, scene;
    defaults = defaults || GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    scene.behavior.removeCharacter(character, {
      animation: animation,
      duration: duration,
      easing: easing
    });
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterChangeExpression
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterChangeExpression = function() {
    var animation, character, defaults, duration, easing, expression, flags, isLocked, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.expressionDuration;
    expression = RecordManager.characterExpressions[this.params.expressionId || 0];
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.changeEasing);
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.changeAnimation;
    character.behavior.changeExpression(expression, this.params.animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterSetParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterSetParameter = function() {
    var params, value;
    params = GameManager.characterParams[this.interpreter.stringValueOf(this.params.characterId)];
    if ((params == null) || (this.params.param == null)) {
      return;
    }
    switch (this.params.valueType) {
      case 0:
        switch (this.params.param.type) {
          case 0:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue);
          case 1:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue) > 0;
          case 2:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue).toString();
        }
        break;
      case 1:
        switch (this.params.param.type) {
          case 0:
            value = this.interpreter.booleanValueOf(this.params.switchValue);
            return params[this.params.param.name] = value ? 1 : 0;
          case 1:
            return params[this.params.param.name] = this.interpreter.booleanValueOf(this.params.switchValue);
          case 2:
            value = this.interpreter.booleanValueOf(this.params.switchValue);
            return params[this.params.param.name] = value ? "ON" : "OFF";
        }
        break;
      case 2:
        switch (this.params.param.type) {
          case 0:
            value = this.interpreter.stringValueOf(this.params.textValue);
            return params[this.params.param.name] = value.length;
          case 1:
            return params[this.params.param.name] = this.interpreter.stringValueOf(this.params.textValue) === "ON";
          case 2:
            return params[this.params.param.name] = this.interpreter.stringValueOf(this.params.textValue);
        }
    }
  };


  /**
  * @method commandCharacterGetParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterGetParameter = function() {
    var params, value;
    params = GameManager.characterParams[this.interpreter.stringValueOf(this.params.characterId)];
    if ((params == null) || (this.params.param == null)) {
      return;
    }
    value = params[this.params.param.name];
    switch (this.params.valueType) {
      case 0:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value);
          case 1:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value ? 1 : 0);
          case 2:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value != null ? value.length : 0);
        }
        break;
      case 1:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value > 0);
          case 1:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value);
          case 2:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value === "ON");
        }
        break;
      case 2:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value != null ? value.toString() : "");
          case 1:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value ? "ON" : "OFF");
          case 2:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value);
        }
    }
  };


  /**
  * @method commandCharacterMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterMotionBlur = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    return character.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandCharacterDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.expressionDuration)) {
      defaults.expressionDuration = this.interpreter.durationValueOf(this.params.expressionDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandCharacterEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterEffect = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first(function(c) {
      return !c.disposed && c.rid === characterId;
    });
    if (character == null) {
      return;
    }
    this.interpreter.objectEffect(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashCharacter = function() {
    var character, duration, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!character) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.flash(new Color(this.params.color), duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintCharacter = function() {
    var character, duration, easing, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    if (!character) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.tintTo(this.params.tone, duration, easing);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomCharacter = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.zoomObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateCharacter = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.rotateObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendCharacter = function() {
    var character;
    character = SceneManager.scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.blendObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakeCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeCharacter = function() {
    var character;
    character = SceneManager.scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.shakeObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskCharacter = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.maskObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveCharacter = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.moveObject(character, this.params.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveCharacterPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveCharacterPath = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.moveObjectPath(character, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakeBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeBackground = function() {
    var background;
    background = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.shakeObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackground = function() {
    var duration, easing, horizontalSpeed, layer, ref, scene, verticalSpeed;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    horizontalSpeed = this.interpreter.numberValueOf(this.params.horizontalSpeed);
    verticalSpeed = this.interpreter.numberValueOf(this.params.verticalSpeed);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if ((ref = scene.backgrounds[layer]) != null) {
      ref.animator.move(horizontalSpeed, verticalSpeed, duration, easing);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackgroundTo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackgroundTo = function() {
    var background, duration, easing, layer, p, scene, x, y;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    x = this.interpreter.numberValueOf(this.params.background.location.x);
    y = this.interpreter.numberValueOf(this.params.background.location.y);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = scene.backgrounds[layer];
    if (!background) {
      return;
    }
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, background, this.params);
      x = p.x;
      y = p.y;
    }
    background.animator.moveTo(x, y, duration, easing);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackgroundPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackgroundPath = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.moveObjectPath(background, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskBackground = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.maskObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomBackground = function() {
    var duration, easing, layer, ref, scene, x, y;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    x = this.interpreter.numberValueOf(this.params.zooming.x);
    y = this.interpreter.numberValueOf(this.params.zooming.y);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if ((ref = scene.backgrounds[layer]) != null) {
      ref.animator.zoomTo(x / 100, y / 100, duration, easing);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateBackground = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background) {
      this.interpreter.rotateObject(background, this.params);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**        
  * @method commandTintBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintBackground = function() {
    var background, duration, easing, layer, scene;
    scene = SceneManager.scene;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    background.animator.tintTo(this.params.tone, duration, easing);
    this.interpreter.waitForCompletion(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendBackground = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    this.interpreter.blendObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBackgroundEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundEffect = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    this.interpreter.objectEffect(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBackgroundDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.background;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.duration)) {
      defaults.duration = this.interpreter.durationValueOf(this.params.duration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["easing.type"])) {
      defaults.easing = this.params.easing;
    }
    if (!isLocked(flags["animation.type"])) {
      defaults.animation = this.params.animation;
    }
    if (!isLocked(flags.origin)) {
      defaults.origin = this.params.origin;
    }
    if (!isLocked(flags.loopHorizontal)) {
      defaults.loopHorizontal = this.params.loopHorizontal;
    }
    if (!isLocked(flags.loopVertical)) {
      return defaults.loopVertical = this.params.loopVertical;
    }
  };


  /**
  * @method commandBackgroundMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundMotionBlur = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    return background.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandChangeBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeBackground = function() {
    var animation, defaults, duration, easing, flags, isLocked, layer, loopH, loopV, origin, ref, scene, zIndex;
    defaults = GameManager.defaults.background;
    scene = SceneManager.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.duration;
    loopH = !isLocked(flags.loopHorizontal) ? this.params.loopHorizontal : defaults.loopHorizontal;
    loopV = !isLocked(flags.loopVertical) ? this.params.loopVertical : defaults.loopVertical;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.animation;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.easing);
    layer = this.interpreter.numberValueOf(this.params.layer);
    scene.behavior.changeBackground(this.params.graphic, false, animation, easing, duration, 0, 0, layer, loopH, loopV);
    if (scene.backgrounds[layer]) {
      if (((ref = this.params.viewport) != null ? ref.type : void 0) === "ui") {
        scene.backgrounds[layer].viewport = Graphics.viewport;
      }
      scene.backgrounds[layer].anchor.x = origin === 0 ? 0 : 0.5;
      scene.backgrounds[layer].anchor.y = origin === 0 ? 0 : 0.5;
      scene.backgrounds[layer].blendMode = this.interpreter.numberValueOf(this.params.blendMode);
      scene.backgrounds[layer].zIndex = zIndex;
      if (origin === 1) {
        scene.backgrounds[layer].dstRect.x = scene.backgrounds[layer].dstRect.x;
        scene.backgrounds[layer].dstRect.y = scene.backgrounds[layer].dstRect.y;
      }
      scene.backgrounds[layer].setup();
      scene.backgrounds[layer].update();
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCallScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCallScene = function() {
    return this.interpreter.callScene(this.interpreter.stringValueOf(this.params.scene.uid || this.params.scene));
  };


  /**
  * @method commandChangeScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeScene = function() {
    var flags, isLocked, k, len, len1, n, newScene, picture, ref, ref1, scene, uid, video;
    if (GameManager.inLivePreview) {
      return;
    }
    GameManager.tempSettings.skip = false;
    if (!this.params.savePrevious) {
      SceneManager.clear();
    }
    scene = SceneManager.scene;
    if (!this.params.erasePictures && !this.params.savePrevious) {
      scene.removeObject(scene.pictureContainer);
      ref = scene.pictures;
      for (k = 0, len = ref.length; k < len; k++) {
        picture = ref[k];
        if (picture) {
          ResourceManager.context.remove("Graphics/Pictures/" + picture.image);
        }
      }
    }
    if (!this.params.eraseTexts && !this.params.savePrevious) {
      scene.removeObject(scene.textContainer);
    }
    if (!this.params.eraseVideos && !this.params.savePrevious) {
      scene.removeObject(scene.videoContainer);
      ref1 = scene.videos;
      for (n = 0, len1 = ref1.length; n < len1; n++) {
        video = ref1[n];
        if (video) {
          ResourceManager.context.remove("Movies/" + video.video);
        }
      }
    }
    if (this.params.scene) {
      if (this.params.savePrevious) {
        GameManager.sceneData = {
          uid: uid = this.params.scene.uid,
          pictures: [],
          texts: [],
          videos: []
        };
      } else {
        GameManager.sceneData = {
          uid: uid = this.params.scene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
      }
      flags = this.params.fieldFlags || {};
      isLocked = gs.CommandFieldFlags.isLocked;
      newScene = new vn.Object_Scene();
      if (this.params.savePrevious) {
        newScene.sceneData = {
          uid: uid = this.params.scene.uid,
          pictures: [],
          texts: [],
          videos: [],
          backlog: GameManager.backlog
        };
      } else {
        newScene.sceneData = {
          uid: uid = this.params.scene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
      }
      SceneManager.switchTo(newScene, this.params.savePrevious, (function(_this) {
        return function() {
          return _this.interpreter.isWaiting = false;
        };
      })(this));
    } else {
      SceneManager.switchTo(null);
    }
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandReturnToPreviousScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandReturnToPreviousScene = function() {
    if (GameManager.inLivePreview) {
      return;
    }
    SceneManager.returnToPrevious((function(_this) {
      return function() {
        return _this.interpreter.isWaiting = false;
      };
    })(this));
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandSwitchToLayout
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSwitchToLayout = function() {
    var scene;
    if (GameManager.inLivePreview) {
      return;
    }
    if (ui.UIManager.layouts[this.params.layout.name] != null) {
      scene = new gs.Object_Layout(this.params.layout.name);
      SceneManager.switchTo(scene, this.params.savePrevious, (function(_this) {
        return function() {
          return _this.interpreter.isWaiting = false;
        };
      })(this));
      return this.interpreter.isWaiting = true;
    }
  };


  /**
  * @method commandChangeTransition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeTransition = function() {
    var flags, isLocked;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.duration)) {
      SceneManager.transitionData.duration = this.interpreter.durationValueOf(this.params.duration);
    }
    if (!isLocked(flags.graphic)) {
      SceneManager.transitionData.graphic = this.params.graphic;
    }
    if (!isLocked(flags.vague)) {
      return SceneManager.transitionData.vague = this.params.vague;
    }
  };


  /**
  * @method commandFreezeScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFreezeScreen = function() {
    return Graphics.freeze();
  };


  /**
  * @method commandScreenTransition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScreenTransition = function() {
    var bitmap, defaults, duration, flags, graphicName, isLocked, ref, ref1, vague;
    defaults = GameManager.defaults.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    graphicName = !isLocked(flags.graphic) ? (ref = this.params.graphic) != null ? ref.name : void 0 : (ref1 = SceneManager.transitionData.graphic) != null ? ref1.name : void 0;
    if (graphicName) {
      bitmap = !isLocked(flags.graphic) ? ResourceManager.getBitmap("Graphics/Masks/" + graphicName) : ResourceManager.getBitmap("Graphics/Masks/" + graphicName);
    }
    vague = !isLocked(flags.vague) ? this.interpreter.numberValueOf(this.params.vague) : SceneManager.transitionData.vague;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : SceneManager.transitionData.duration;
    this.interpreter.isWaiting = !GameManager.inLivePreview;
    this.interpreter.waitCounter = duration;
    return Graphics.transition(duration, bitmap, vague);
  };


  /**
  * @method commandShakeScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeScreen = function() {
    if (SceneManager.scene.viewport == null) {
      return;
    }
    this.interpreter.shakeObject(SceneManager.scene.viewport, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintScreen = function() {
    var duration;
    duration = this.interpreter.durationValueOf(this.params.duration);
    SceneManager.scene.viewport.animator.tintTo(new Tone(this.params.tone), duration, gs.Easings.EASE_LINEAR[0]);
    if (this.params.waitForCompletion && duration > 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomScreen = function() {
    var duration, easing, scene;
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    scene = SceneManager.scene;
    SceneManager.scene.viewport.anchor.x = 0.5;
    SceneManager.scene.viewport.anchor.y = 0.5;
    SceneManager.scene.viewport.animator.zoomTo(this.interpreter.numberValueOf(this.params.zooming.x) / 100, this.interpreter.numberValueOf(this.params.zooming.y) / 100, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPanScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPanScreen = function() {
    var duration, easing, scene, viewport;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    this.interpreter.settings.screen.pan.x -= this.params.position.x;
    this.interpreter.settings.screen.pan.y -= this.params.position.y;
    viewport = SceneManager.scene.viewport;
    viewport.animator.scrollTo(-this.params.position.x + viewport.dstRect.x, -this.params.position.y + viewport.dstRect.y, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateScreen = function() {
    var duration, easing, pan, scene;
    scene = SceneManager.scene;
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    pan = this.interpreter.settings.screen.pan;
    SceneManager.scene.viewport.anchor.x = 0.5;
    SceneManager.scene.viewport.anchor.y = 0.5;
    SceneManager.scene.viewport.animator.rotate(this.params.direction, this.interpreter.numberValueOf(this.params.speed) / 100, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashScreen = function() {
    var duration;
    duration = this.interpreter.durationValueOf(this.params.duration);
    SceneManager.scene.viewport.animator.flash(new Color(this.params.color), duration, gs.Easings.EASE_LINEAR[0]);
    if (this.params.waitForCompletion && duration !== 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScreenEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScreenEffect = function() {
    var duration, easing, flags, isLocked, scene, viewport, wobble, zOrder;
    scene = SceneManager.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    if (!gs.CommandFieldFlags.isLocked(flags.zOrder)) {
      zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    } else {
      zOrder = SceneManager.scene.viewport.zIndex;
    }
    viewport = scene.viewportContainer.subObjects.first(function(v) {
      return v.zIndex === zOrder;
    });
    if (!viewport) {
      viewport = new gs.Object_Viewport();
      viewport.zIndex = zOrder;
      scene.viewportContainer.addObject(viewport);
    }
    switch (this.params.type) {
      case 0:
        viewport.animator.wobbleTo(this.params.wobble.power / 10000, this.params.wobble.speed / 100, duration, easing);
        wobble = viewport.effects.wobble;
        wobble.enabled = this.params.wobble.power > 0;
        wobble.vertical = this.params.wobble.orientation === 0 || this.params.wobble.orientation === 2;
        wobble.horizontal = this.params.wobble.orientation === 1 || this.params.wobble.orientation === 2;
        break;
      case 1:
        viewport.animator.blurTo(this.params.blur.power / 100, duration, easing);
        viewport.effects.blur.enabled = true;
        break;
      case 2:
        viewport.animator.pixelateTo(this.params.pixelate.size.width, this.params.pixelate.size.height, duration, easing);
        viewport.effects.pixelate.enabled = true;
    }
    if (this.params.waitForCompletion && duration !== 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandVideoDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandShowVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowVideo = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, origin, p, ref, ref1, scene, video, videos, x, y, zIndex;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    videos = scene.videos;
    if (videos[number] == null) {
      videos[number] = new gs.Object_Video();
    }
    x = this.interpreter.numberValueOf(this.params.position.x);
    y = this.interpreter.numberValueOf(this.params.position.y);
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    video = videos[number];
    video.domain = this.params.numberDomain;
    video.video = (ref = this.params.video) != null ? ref.name : void 0;
    video.loop = true;
    video.dstRect.x = x;
    video.dstRect.y = y;
    video.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    video.anchor.x = origin === 0 ? 0 : 0.5;
    video.anchor.y = origin === 0 ? 0 : 0.5;
    video.zIndex = zIndex || (1000 + number);
    if (((ref1 = this.params.viewport) != null ? ref1.type : void 0) === "scene") {
      video.viewport = SceneManager.scene.behavior.viewport;
    }
    video.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, video, this.params);
      video.dstRect.x = p.x;
      video.dstRect.y = p.y;
    }
    video.animator.appear(x, y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.moveObject(video, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveVideoPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveVideoPath = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.moveObjectPath(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.rotateObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.zoomObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendVideo = function() {
    var video;
    SceneManager.scene.behavior.changeVideoDomain(this.params.numberDomain);
    video = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
    if (video == null) {
      return;
    }
    this.interpreter.blendObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.tintObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.flashObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCropVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCropVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    return this.interpreter.cropObject(video, this.params);
  };


  /**
  * @method commandVideoMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoMotionBlur = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    return this.interpreter.objectMotionBlur(video, this.params);
  };


  /**
  * @method commandMaskVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.maskObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandVideoEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoEffect = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.objectEffect(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseVideo = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, scene, video;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    video.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changeTextDomain(sender.domain);
        return scene.videos[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShowImageMap
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowImageMap = function() {
    var bitmap, flags, imageMap, isLocked, number, p, ref, ref1, ref2, ref3, ref4, ref5;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    imageMap = SceneManager.scene.pictures[number];
    if (imageMap != null) {
      imageMap.dispose();
    }
    imageMap = new gs.Object_ImageMap();
    imageMap.visual.variableContext = this.interpreter.context;
    SceneManager.scene.pictures[number] = imageMap;
    bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + ((ref = this.params.ground) != null ? ref.name : void 0));
    imageMap.dstRect.width = bitmap.width;
    imageMap.dstRect.height = bitmap.height;
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, imageMap, this.params);
      imageMap.dstRect.x = p.x;
      imageMap.dstRect.y = p.y;
    } else {
      imageMap.dstRect.x = this.interpreter.numberValueOf(this.params.position.x);
      imageMap.dstRect.y = this.interpreter.numberValueOf(this.params.position.y);
    }
    imageMap.anchor.x = this.params.origin === 1 ? 0.5 : 0;
    imageMap.anchor.y = this.params.origin === 1 ? 0.5 : 0;
    imageMap.zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : 400;
    imageMap.blendMode = !isLocked(flags.blendMode) ? this.params.blendMode : 0;
    imageMap.hotspots = this.params.hotspots;
    imageMap.images = [(ref1 = this.params.ground) != null ? ref1.name : void 0, (ref2 = this.params.hover) != null ? ref2.name : void 0, (ref3 = this.params.unselected) != null ? ref3.name : void 0, (ref4 = this.params.selected) != null ? ref4.name : void 0, (ref5 = this.params.selectedHover) != null ? ref5.name : void 0];
    imageMap.events.on("jumpTo", gs.CallBack("onJumpTo", this.interpreter));
    imageMap.events.on("callCommonEvent", gs.CallBack("onCallCommonEvent", this.interpreter));
    imageMap.setup();
    imageMap.update();
    this.interpreter.showObject(imageMap, {
      x: 0,
      y: 0
    }, this.params);
    if (this.params.waitForCompletion) {
      this.interpreter.waitCounter = 0;
      this.interpreter.isWaiting = true;
    }
    imageMap.events.on("finish", (function(_this) {
      return function(sender) {
        return _this.interpreter.isWaiting = false;
      };
    })(this));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseImageMap
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseImageMap = function() {
    var imageMap, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    imageMap = scene.pictures[this.interpreter.numberValueOf(this.params.number)];
    if (imageMap == null) {
      return;
    }
    imageMap.events.emit("finish", imageMap);
    imageMap.visual.active = false;
    this.interpreter.eraseObject(imageMap, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandAddHotspot
  * @protected
   */

  Component_CommandInterpreter.prototype.commandAddHotspot = function() {
    var dragging, hotspot, hotspots, number, picture, ref, ref1, ref2, ref3, ref4, ref5, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    hotspots = scene.hotspots;
    if (hotspots[number] == null) {
      hotspots[number] = new gs.Object_Hotspot();
    }
    hotspot = hotspots[number];
    hotspot.domain = this.params.numberDomain;
    switch (this.params.positionType) {
      case 0:
        hotspot.dstRect.x = this.params.box.x;
        hotspot.dstRect.y = this.params.box.y;
        hotspot.dstRect.width = this.params.box.size.width;
        hotspot.dstRect.height = this.params.box.size.height;
        break;
      case 1:
        hotspot.dstRect.x = this.interpreter.numberValueOf(this.params.box.x);
        hotspot.dstRect.y = this.interpreter.numberValueOf(this.params.box.y);
        hotspot.dstRect.width = this.interpreter.numberValueOf(this.params.box.size.width);
        hotspot.dstRect.height = this.interpreter.numberValueOf(this.params.box.size.height);
        break;
      case 2:
        picture = scene.pictures[this.interpreter.numberValueOf(this.params.pictureNumber)];
        if (picture != null) {
          hotspot.target = picture;
        }
        break;
      case 3:
        text = scene.texts[this.interpreter.numberValueOf(this.params.textNumber)];
        if (text != null) {
          hotspot.target = text;
        }
    }
    hotspot.behavior.shape = (ref = this.params.shape) != null ? ref : gs.HotspotShape.RECTANGLE;
    if (text != null) {
      hotspot.images = null;
    } else {
      hotspot.images = [((ref1 = this.params.baseGraphic) != null ? ref1.name : void 0) || this.interpreter.stringValueOf(this.params.baseGraphic) || (picture != null ? picture.image : void 0), ((ref2 = this.params.hoverGraphic) != null ? ref2.name : void 0) || this.interpreter.stringValueOf(this.params.hoverGraphic), ((ref3 = this.params.selectedGraphic) != null ? ref3.name : void 0) || this.interpreter.stringValueOf(this.params.selectedGraphic), ((ref4 = this.params.selectedHoverGraphic) != null ? ref4.name : void 0) || this.interpreter.stringValueOf(this.params.selectedHoverGraphic), ((ref5 = this.params.unselectedGraphic) != null ? ref5.name : void 0) || this.interpreter.stringValueOf(this.params.unselectedGraphic)];
    }
    if (this.params.actions.onClick.type !== 0 || this.params.actions.onClick.label) {
      hotspot.events.on("click", gs.CallBack("onHotspotClick", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onClick.bindValue)
      }));
    }
    if (this.params.actions.onEnter.type !== 0 || this.params.actions.onEnter.label) {
      hotspot.events.on("enter", gs.CallBack("onHotspotEnter", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onEnter.bindValue)
      }));
    }
    if (this.params.actions.onLeave.type !== 0 || this.params.actions.onLeave.label) {
      hotspot.events.on("leave", gs.CallBack("onHotspotLeave", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onLeave.bindValue)
      }));
    }
    if (this.params.actions.onDrag.type !== 0 || this.params.actions.onDrag.label) {
      hotspot.events.on("dragStart", gs.CallBack("onHotspotDragStart", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
      hotspot.events.on("drag", gs.CallBack("onHotspotDrag", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
      hotspot.events.on("dragEnd", gs.CallBack("onHotspotDragEnd", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
    }
    if (this.params.actions.onSelect.type !== 0 || this.params.actions.onSelect.label || this.params.actions.onDeselect.type !== 0 || this.params.actions.onDeselect.label) {
      hotspot.events.on("stateChanged", gs.CallBack("onHotspotStateChanged", this.interpreter, this.params));
    }
    hotspot.selectable = true;
    hotspot.setup();
    if (this.params.dragging.enabled) {
      dragging = this.params.dragging;
      hotspot.draggable = {
        rect: new Rect(dragging.rect.x, dragging.rect.y, dragging.rect.size.width, dragging.rect.size.height),
        axisX: dragging.horizontal,
        axisY: dragging.vertical
      };
      hotspot.addComponent(new ui.Component_Draggable());
      return hotspot.events.on("drag", (function(_this) {
        return function(e) {
          var drag;
          drag = e.sender.draggable;
          GameManager.variableStore.setupTempVariables(_this.interpreter.context);
          if (_this.params.dragging.horizontal) {
            return _this.interpreter.setNumberValueTo(_this.params.dragging.variable, Math.round((e.sender.dstRect.x - drag.rect.x) / (drag.rect.width - e.sender.dstRect.width) * 100));
          } else {
            return _this.interpreter.setNumberValueTo(_this.params.dragging.variable, Math.round((e.sender.dstRect.y - drag.rect.y) / (drag.rect.height - e.sender.dstRect.height) * 100));
          }
        };
      })(this));
    }
  };


  /**
  * @method commandChangeHotspotState
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeHotspotState = function() {
    var flags, hotspot, isLocked, number, scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    hotspot = scene.hotspots[number];
    if (!hotspot) {
      return;
    }
    if (!isLocked(flags.selected)) {
      hotspot.behavior.selected = this.interpreter.booleanValueOf(this.params.selected);
    }
    if (!isLocked(flags.enabled)) {
      hotspot.behavior.enabled = this.interpreter.booleanValueOf(this.params.enabled);
    }
    hotspot.behavior.updateInput();
    return hotspot.behavior.updateImage();
  };


  /**
  * @method commandEraseHotspot
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseHotspot = function() {
    var number, scene;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    if (scene.hotspots[number] != null) {
      scene.hotspots[number].dispose();
      return scene.hotspotContainer.eraseObject(number);
    }
  };


  /**
  * @method commandChangeObjectDomain
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeObjectDomain = function() {
    return SceneManager.scene.behavior.changeObjectDomain(this.interpreter.stringValueOf(this.params.domain));
  };


  /**
  * @method commandPictureDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };

  Component_CommandInterpreter.prototype.createPicture = function(graphic, params) {
    var animation, bitmap, defaults, duration, easing, flags, graphicName, isLocked, number, origin, picture, pictures, ref, ref1, ref2, ref3, ref4, ref5, ref6, scene, snapshot, x, y, zIndex;
    graphic = this.stringValueOf(graphic);
    graphicName = (graphic != null ? graphic.name : void 0) != null ? graphic.name : graphic;
    bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + graphicName);
    if (bitmap && !bitmap.loaded) {
      return null;
    }
    defaults = GameManager.defaults.picture;
    flags = params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    number = this.numberValueOf(params.number);
    pictures = scene.pictures;
    if (pictures[number] == null) {
      picture = new gs.Object_Picture(null, null, (ref = params.visual) != null ? ref.type : void 0);
      picture.domain = params.numberDomain;
      pictures[number] = picture;
      switch ((ref1 = params.visual) != null ? ref1.type : void 0) {
        case 1:
          picture.visual.looping.vertical = true;
          picture.visual.looping.horizontal = true;
          break;
        case 2:
          picture.frameThickness = params.visual.frame.thickness;
          picture.frameCornerSize = params.visual.frame.cornerSize;
          break;
        case 3:
          picture.visual.orientation = params.visual.threePartImage.orientation;
          break;
        case 4:
          picture.color = gs.Color.fromObject(params.visual.quad.color);
          break;
        case 5:
          snapshot = Graphics.snapshot();
          picture.bitmap = snapshot;
          picture.dstRect.width = snapshot.width;
          picture.dstRect.height = snapshot.height;
          picture.srcRect.set(0, 0, snapshot.width, snapshot.height);
      }
    }
    x = this.numberValueOf(params.position.x);
    y = this.numberValueOf(params.position.y);
    picture = pictures[number];
    if (!picture.bitmap) {
      picture.image = graphicName;
    } else {
      picture.image = null;
    }
    bitmap = (ref2 = picture.bitmap) != null ? ref2 : ResourceManager.getBitmap("Graphics/Pictures/" + graphicName);
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.numberValueOf(params.easing.type), params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.durationValueOf(params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.numberValueOf(params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? params.animation : defaults.appearAnimation;
    picture.mirror = params.position.horizontalFlip;
    picture.angle = params.position.angle || 0;
    picture.zoom.x = ((ref3 = params.position.data) != null ? ref3.zoom : void 0) || 1;
    picture.zoom.y = ((ref4 = params.position.data) != null ? ref4.zoom : void 0) || 1;
    picture.blendMode = this.numberValueOf(params.blendMode);
    if (params.origin === 1 && (bitmap != null)) {
      x += (bitmap.width * picture.zoom.x - bitmap.width) / 2;
      y += (bitmap.height * picture.zoom.y - bitmap.height) / 2;
    }
    picture.dstRect.x = x;
    picture.dstRect.y = y;
    picture.anchor.x = origin === 1 ? 0.5 : 0;
    picture.anchor.y = origin === 1 ? 0.5 : 0;
    picture.zIndex = zIndex || (700 + number);
    if (((ref5 = params.viewport) != null ? ref5.type : void 0) === "scene") {
      picture.viewport = SceneManager.scene.behavior.viewport;
    }
    if (((ref6 = params.size) != null ? ref6.type : void 0) === 1) {
      picture.dstRect.width = this.numberValueOf(params.size.width);
      picture.dstRect.height = this.numberValueOf(params.size.height);
    }
    picture.update();
    return picture;
  };


  /**
  * @method commandShowPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowPicture = function() {
    var animation, defaults, duration, easing, flags, isLocked, p, picture;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    picture = this.interpreter.createPicture(this.params.graphic, this.params);
    if (!picture) {
      this.interpreter.pointer--;
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = 1;
      return;
    }
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, picture, this.params);
      picture.dstRect.x = p.x;
      picture.dstRect.y = p.y;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    picture.animator.appear(picture.dstRect.x, picture.dstRect.y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPlayPictureAnimation
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayPictureAnimation = function() {
    var animation, bitmap, component, defaults, duration, easing, flags, isLocked, p, picture, record;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    picture = null;
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    if (this.params.animationId != null) {
      record = RecordManager.animations[this.params.animationId];
      if (record != null) {
        picture = this.interpreter.createPicture(record.graphic, this.params);
        component = picture.findComponent("Component_FrameAnimation");
        if (component != null) {
          component.refresh(record);
          component.start();
        } else {
          component = new gs.Component_FrameAnimation(record);
          picture.addComponent(component);
        }
        component.update();
        if (this.params.positionType === 0) {
          p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, picture, this.params);
          picture.dstRect.x = p.x;
          picture.dstRect.y = p.y;
        }
        picture.animator.appear(picture.dstRect.x, picture.dstRect.y, animation, easing, duration);
      }
    } else {
      picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
      animation = picture != null ? picture.findComponent("Component_FrameAnimation") : void 0;
      if (animation != null) {
        picture.removeComponent(animation);
        bitmap = ResourceManager.getBitmap("Graphics/Animations/" + picture.image);
        if (bitmap != null) {
          picture.srcRect.set(0, 0, bitmap.width, bitmap.height);
          picture.dstRect.width = picture.srcRect.width;
          picture.dstRect.height = picture.srcRect.height;
        }
      }
    }
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMovePicturePath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMovePicturePath = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.moveObjectPath(picture, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMovePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMovePicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.moveObject(picture, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.tintObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.flashObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCropPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCropPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    return this.interpreter.cropObject(picture, this.params);
  };


  /**
  * @method commandRotatePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotatePicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.rotateObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.zoomObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendPicture = function() {
    var picture;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
    if (picture == null) {
      return;
    }
    this.interpreter.blendObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakePicture = function() {
    var picture;
    picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
    if (picture == null) {
      return;
    }
    this.interpreter.shakeObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.maskObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPictureMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureMotionBlur = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.objectMotionBlur(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPictureEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureEffect = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.objectEffect(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandErasePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandErasePicture = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, picture, scene;
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    picture.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changePictureDomain(sender.domain);
        return scene.pictures[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandInputNumber
  * @protected
   */

  Component_CommandInterpreter.prototype.commandInputNumber = function() {
    var scene;
    scene = SceneManager.scene;
    this.interpreter.isWaiting = true;
    if (this.interpreter.isProcessingMessageInOtherContext()) {
      this.interpreter.waitForMessage();
      return;
    }
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.preview) && GameManager.tempSettings.skip) {
      this.interpreter.isWaiting = false;
      this.interpreter.messageObject().behavior.clear();
      this.interpreter.setNumberValueTo(this.params.variable, 0);
      return;
    }
    $tempFields.digits = this.params.digits;
    scene.behavior.showInputNumber(this.params.digits, gs.CallBack("onInputNumberFinish", this.interpreter, this.params));
    this.interpreter.waitingFor.inputNumber = this.params;
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandChoiceTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChoiceTimer = function() {
    var scene;
    scene = SceneManager.scene;
    GameManager.tempFields.choiceTimer = scene.choiceTimer;
    GameManager.tempFields.choiceTimerVisible = this.params.visible;
    if (this.params.enabled) {
      scene.choiceTimer.behavior.seconds = this.interpreter.numberValueOf(this.params.seconds);
      scene.choiceTimer.behavior.minutes = this.interpreter.numberValueOf(this.params.minutes);
      scene.choiceTimer.behavior.start();
      return scene.choiceTimer.events.on("finish", (function(_this) {
        return function(sender) {
          var defaultChoice, ref;
          if (scene.choiceWindow && ((ref = GameManager.tempFields.choices) != null ? ref.length : void 0) > 0) {
            defaultChoice = (GameManager.tempFields.choices.first(function(c) {
              return c.isDefault;
            })) || GameManager.tempFields.choices[0];
            return scene.choiceWindow.events.emit("selectionAccept", scene.choiceWindow, defaultChoice);
          }
        };
      })(this));
    } else {
      return scene.choiceTimer.stop();
    }
  };


  /**
  * @method commandShowChoices
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowChoices = function() {
    var choices, defaultChoice, messageObject, pointer, scene;
    scene = SceneManager.scene;
    pointer = this.interpreter.pointer;
    choices = GameManager.tempFields.choices || [];
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.previewData) && GameManager.tempSettings.skip) {
      messageObject = this.interpreter.messageObject();
      if (messageObject != null ? messageObject.visible : void 0) {
        messageObject.behavior.clear();
      }
      defaultChoice = (choices.first(function(c) {
        return c.isDefault;
      })) || choices[0];
      if (defaultChoice.action.labelIndex != null) {
        this.interpreter.pointer = defaultChoice.action.labelIndex;
      } else {
        this.interpreter.jumpToLabel(defaultChoice.action.label);
      }
      GameManager.tempFields.choices = [];
    } else {
      if (choices.length > 0) {
        this.interpreter.isWaiting = true;
        scene.behavior.showChoices(choices, gs.CallBack("onChoiceAccept", this.interpreter, {
          pointer: pointer,
          params: this.params
        }));
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShowChoice
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowChoice = function() {
    var choices, command, commands, dstRect, index, pointer, scene;
    scene = SceneManager.scene;
    commands = this.interpreter.object.commands;
    command = null;
    index = 0;
    pointer = this.interpreter.pointer;
    choices = null;
    dstRect = null;
    switch (this.params.positionType) {
      case 0:
        dstRect = null;
        break;
      case 1:
        dstRect = new Rect(this.params.box.x, this.params.box.y, this.params.box.size.width, this.params.box.size.height);
    }
    if (!GameManager.tempFields.choices) {
      GameManager.tempFields.choices = [];
    }
    choices = GameManager.tempFields.choices;
    return choices.push({
      dstRect: dstRect,
      text: this.params.text,
      index: index,
      action: this.params.action,
      isSelected: false,
      isDefault: this.params.defaultChoice,
      isEnabled: this.interpreter.booleanValueOf(this.params.enabled)
    });
  };


  /**
  * @method commandOpenMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("menuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandOpenLoadMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenLoadMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("loadMenuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandOpenSaveMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenSaveMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("saveMenuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandReturnToTitle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandReturnToTitle = function() {
    SceneManager.clear();
    SceneManager.switchTo(new gs.Object_Layout("titleLayout"));
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandPlayVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayVideo = function() {
    var ref, scene;
    if ((GameManager.inLivePreview || GameManager.settings.allowVideoSkip) && GameManager.tempSettings.skip) {
      return;
    }
    GameManager.tempSettings.skip = false;
    scene = SceneManager.scene;
    if (((ref = this.params.video) != null ? ref.name : void 0) != null) {
      scene.video = ResourceManager.getVideo("Movies/" + this.params.video.name);
      this.videoSprite = new Sprite(Graphics.viewport);
      this.videoSprite.srcRect = new Rect(0, 0, scene.video.width, scene.video.height);
      this.videoSprite.video = scene.video;
      this.videoSprite.zoomX = Graphics.width / scene.video.width;
      this.videoSprite.zoomY = Graphics.height / scene.video.height;
      this.videoSprite.z = 99999999;
      scene.video.onEnded = (function(_this) {
        return function() {
          _this.interpreter.isWaiting = false;
          _this.videoSprite.dispose();
          return scene.video = null;
        };
      })(this);
      scene.video.volume = this.params.volume / 100;
      scene.video.playbackRate = this.params.playbackRate / 100;
      this.interpreter.isWaiting = true;
      scene.video.play();
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandAudioDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandAudioDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.musicFadeInDuration)) {
      defaults.musicFadeInDuration = this.params.musicFadeInDuration;
    }
    if (!isLocked(flags.musicFadeOutDuration)) {
      defaults.musicFadeOutDuration = this.params.musicFadeOutDuration;
    }
    if (!isLocked(flags.musicVolume)) {
      defaults.musicVolume = this.params.musicVolume;
    }
    if (!isLocked(flags.musicPlaybackRate)) {
      defaults.musicPlaybackRate = this.params.musicPlaybackRate;
    }
    if (!isLocked(flags.soundVolume)) {
      defaults.soundVolume = this.params.soundVolume;
    }
    if (!isLocked(flags.soundPlaybackRate)) {
      defaults.soundPlaybackRate = this.params.soundPlaybackRate;
    }
    if (!isLocked(flags.voiceVolume)) {
      defaults.voiceVolume = this.params.voiceVolume;
    }
    if (!isLocked(flags.voicePlaybackRate)) {
      return defaults.voicePlaybackRate = this.params.voicePlaybackRate;
    }
  };


  /**
  * @method commandPlayMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayMusic = function() {
    var defaults, fadeDuration, flags, isLocked, music, playRange, playTime, playbackRate, volume;
    if (this.params.music == null) {
      return;
    }
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (GameManager.settings.bgmEnabled) {
      fadeDuration = !isLocked(flags.fadeInDuration) ? this.params.fadeInDuration : defaults.musicFadeInDuration;
      volume = !isLocked(flags["music.volume"]) ? this.params.music.volume : defaults.musicVolume;
      playbackRate = !isLocked(flags["music.playbackRate"]) ? this.params.music.playbackRate : defaults.musicPlaybackRate;
      music = {
        name: this.params.music.name,
        volume: volume,
        playbackRate: playbackRate
      };
      if (this.params.playType === 1) {
        playTime = {
          min: this.params.playTime.min * 60,
          max: this.params.playTime.max * 60
        };
        playRange = {
          start: this.params.playRange.start * 60,
          end: this.params.playRange.end * 60
        };
        AudioManager.playMusicRandom(music, fadeDuration, this.params.layer || 0, playTime, playRange);
      } else {
        AudioManager.playMusic(this.params.music.name, volume, playbackRate, fadeDuration, this.params.layer || 0);
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandStopMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeOutDuration) ? this.params.fadeOutDuration : defaults.musicFadeOutDuration;
    AudioManager.stopMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPauseMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPauseMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeOutDuration) ? this.params.fadeOutDuration : defaults.musicFadeOutDuration;
    return AudioManager.stopMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
  };


  /**
  * @method commandResumeMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeInDuration) ? this.params.fadeInDuration : defaults.musicFadeInDuration;
    AudioManager.resumeMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPlaySound
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlaySound = function() {
    var defaults, flags, isLocked, playbackRate, volume;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (GameManager.settings.soundEnabled && !GameManager.tempSettings.skip) {
      volume = !isLocked(flags["sound.volume"]) ? this.params.sound.volume : defaults.soundVolume;
      playbackRate = !isLocked(flags["sound.playbackRate"]) ? this.params.sound.playbackRate : defaults.soundPlaybackRate;
      AudioManager.playSound(this.params.sound.name, volume, playbackRate, this.params.musicEffect);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandStopSound
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopSound = function() {
    AudioManager.stopSound(this.params.sound.name);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEndCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEndCommonEvent = function() {
    var event, eventId;
    eventId = this.interpreter.stringValueOf(this.params.commonEventId);
    event = GameManager.commonEvents[eventId];
    return event != null ? event.behavior.stop() : void 0;
  };


  /**
  * @method commandResumeCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeCommonEvent = function() {
    var event, eventId;
    eventId = this.interpreter.stringValueOf(this.params.commonEventId);
    event = GameManager.commonEvents[eventId];
    return event != null ? event.behavior.resume() : void 0;
  };


  /**
  * @method commandCallCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCallCommonEvent = function() {
    var eventId, list, params, scene;
    scene = SceneManager.scene;
    eventId = null;
    if (this.params.commonEventId.index != null) {
      eventId = this.interpreter.stringValueOf(this.params.commonEventId);
      list = this.interpreter.listObjectOf(this.params.parameters.values[0]);
      params = {
        values: list
      };
    } else {
      params = this.params.parameters;
      eventId = this.params.commonEventId;
    }
    return this.interpreter.callCommonEvent(eventId, params);
  };


  /**
  * @method commandChangeTextSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeTextSettings = function() {
    var flags, font, fontName, fontSize, isLocked, number, padding, ref, ref1, ref2, ref3, ref4, scene, textSprite, texts;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    texts = scene.texts;
    if (texts[number] == null) {
      texts[number] = new gs.Object_Text();
      texts[number].visible = false;
    }
    textSprite = texts[number];
    padding = textSprite.behavior.padding;
    font = textSprite.font;
    fontName = textSprite.font.name;
    fontSize = textSprite.font.size;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.lineSpacing)) {
      textSprite.textRenderer.lineSpacing = (ref = this.params.lineSpacing) != null ? ref : textSprite.textRenderer.lineSpacing;
    }
    if (!isLocked(flags.font)) {
      fontName = this.interpreter.stringValueOf(this.params.font);
    }
    if (!isLocked(flags.size)) {
      fontSize = this.interpreter.numberValueOf(this.params.size);
    }
    if (!isLocked(flags.font) || !isLocked(flags.size)) {
      textSprite.font = new Font(fontName, fontSize);
    }
    padding.left = !isLocked(flags["padding.0"]) ? (ref1 = this.params.padding) != null ? ref1[0] : void 0 : padding.left;
    padding.top = !isLocked(flags["padding.1"]) ? (ref2 = this.params.padding) != null ? ref2[1] : void 0 : padding.top;
    padding.right = !isLocked(flags["padding.2"]) ? (ref3 = this.params.padding) != null ? ref3[2] : void 0 : padding.right;
    padding.bottom = !isLocked(flags["padding.3"]) ? (ref4 = this.params.padding) != null ? ref4[3] : void 0 : padding.bottom;
    if (!isLocked(flags.bold)) {
      textSprite.font.bold = this.params.bold;
    }
    if (!isLocked(flags.italic)) {
      textSprite.font.italic = this.params.italic;
    }
    if (!isLocked(flags.smallCaps)) {
      textSprite.font.smallCaps = this.params.smallCaps;
    }
    if (!isLocked(flags.underline)) {
      textSprite.font.underline = this.params.underline;
    }
    if (!isLocked(flags.strikeThrough)) {
      textSprite.font.strikeThrough = this.params.strikeThrough;
    }
    textSprite.font.color = !isLocked(flags.color) ? new Color(this.params.color) : font.color;
    textSprite.font.border = !isLocked(flags.outline) ? this.params.outline : font.border;
    textSprite.font.borderColor = !isLocked(flags.outlineColor) ? new Color(this.params.outlineColor) : new Color(font.borderColor);
    textSprite.font.borderSize = !isLocked(flags.outlineSize) ? this.params.outlineSize : font.borderSize;
    textSprite.font.shadow = !isLocked(flags.shadow) ? this.params.shadow : font.shadow;
    textSprite.font.shadowColor = !isLocked(flags.shadowColor) ? new Color(this.params.shadowColor) : new Color(font.shadowColor);
    textSprite.font.shadowOffsetX = !isLocked(flags.shadowOffsetX) ? this.params.shadowOffsetX : font.shadowOffsetX;
    textSprite.font.shadowOffsetY = !isLocked(flags.shadowOffsetY) ? this.params.shadowOffsetY : font.shadowOffsetY;
    textSprite.behavior.refresh();
    return textSprite.update();
  };


  /**
  * @method commandChangeTextSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandShowText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowText = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, origin, p, positionAnchor, ref, scene, text, textObject, texts, x, y, zIndex;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = this.params.text;
    texts = scene.texts;
    if (texts[number] == null) {
      texts[number] = new gs.Object_Text();
    }
    x = this.interpreter.numberValueOf(this.params.position.x);
    y = this.interpreter.numberValueOf(this.params.position.y);
    textObject = texts[number];
    textObject.domain = this.params.numberDomain;
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    positionAnchor = !isLocked(flags.positionOrigin) ? this.interpreter.graphicAnchorPointsByConstant[this.params.positionOrigin] || new gs.Point(0, 0) : this.interpreter.graphicAnchorPointsByConstant[defaults.positionOrigin];
    textObject.text = text;
    textObject.dstRect.x = x;
    textObject.dstRect.y = y;
    textObject.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    textObject.anchor.x = origin === 0 ? 0 : 0.5;
    textObject.anchor.y = origin === 0 ? 0 : 0.5;
    textObject.positionAnchor.x = positionAnchor.x;
    textObject.positionAnchor.y = positionAnchor.y;
    textObject.zIndex = zIndex || (700 + number);
    textObject.sizeToFit = true;
    textObject.formatting = true;
    if (((ref = this.params.viewport) != null ? ref.type : void 0) === "scene") {
      textObject.viewport = SceneManager.scene.behavior.viewport;
    }
    textObject.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, textObject, this.params);
      textObject.dstRect.x = p.x;
      textObject.dstRect.y = p.y;
    }
    textObject.animator.appear(x, y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTextMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextMotionBlur = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    return text.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandRefreshText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRefreshText = function() {
    var number, scene, texts;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    texts = scene.texts;
    if (texts[number] == null) {
      return;
    }
    return texts[number].behavior.refresh(true);
  };


  /**
  * @method commandMoveText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.moveObject(text, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveTextPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveTextPath = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.moveObjectPath(text, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.rotateObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.zoomObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendText = function() {
    var text;
    SceneManager.scene.behavior.changeTextDomain(this.params.numberDomain);
    text = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
    if (text == null) {
      return;
    }
    this.interpreter.blendObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandColorText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandColorText = function() {
    var duration, easing, number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    if (text != null) {
      text.animator.colorTo(new Color(this.params.color), duration, easing);
      if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = duration;
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseText = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, scene, text;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    text.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changeTextDomain(sender.domain);
        return scene.texts[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTextEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextEffect = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.objectEffect(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandInputText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandInputText = function() {
    var scene;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.preview) && GameManager.tempSettings.skip) {
      this.interpreter.messageObject().behavior.clear();
      this.interpreter.setStringValueTo(this.params.variable, "");
      return;
    }
    this.interpreter.isWaiting = true;
    if (this.interpreter.isProcessingMessageInOtherContext()) {
      this.interpreter.waitForMessage();
      return;
    }
    $tempFields.letters = this.params.letters;
    scene.behavior.showInputText(this.params.letters, gs.CallBack("onInputTextFinish", this.interpreter, this.interpreter));
    this.interpreter.waitingFor.inputText = this.params;
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandSavePersistentData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSavePersistentData = function() {
    return GameManager.saveGlobalData();
  };


  /**
  * @method commandSaveSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSaveSettings = function() {
    return GameManager.saveSettings();
  };


  /**
  * @method commandPrepareSaveGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPrepareSaveGame = function() {
    if (this.interpreter.previewData != null) {
      return;
    }
    this.interpreter.pointer++;
    GameManager.prepareSaveGame(this.params.snapshot);
    return this.interpreter.pointer--;
  };


  /**
  * @method commandSaveGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSaveGame = function() {
    var thumbHeight, thumbWidth;
    if (this.interpreter.previewData != null) {
      return;
    }
    thumbWidth = this.interpreter.numberValueOf(this.params.thumbWidth);
    thumbHeight = this.interpreter.numberValueOf(this.params.thumbHeight);
    return GameManager.save(this.interpreter.numberValueOf(this.params.slot) - 1, thumbWidth, thumbHeight);
  };


  /**
  * @method commandLoadGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLoadGame = function() {
    if (this.interpreter.previewData != null) {
      return;
    }
    return GameManager.load(this.interpreter.numberValueOf(this.params.slot) - 1);
  };


  /**
  * @method commandWaitForInput
  * @protected
   */

  Component_CommandInterpreter.prototype.commandWaitForInput = function() {
    var f;
    if (this.interpreter.isInstantSkip()) {
      return;
    }
    gs.GlobalEventManager.offByOwner("mouseDown", this.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("keyDown", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    f = (function(_this) {
      return function() {
        var executeAction, key;
        key = _this.interpreter.numberValueOf(_this.params.key);
        executeAction = false;
        if (Input.Mouse.isButton(_this.params.key)) {
          executeAction = Input.Mouse.buttons[_this.params.key] === _this.params.state;
        } else if (_this.params.key === 100) {
          if (Input.keyDown && _this.params.state === 1) {
            executeAction = true;
          }
          if (Input.keyUp && _this.params.state === 2) {
            executeAction = true;
          }
        } else if (_this.params.key === 101) {
          if (Input.Mouse.buttonDown && _this.params.state === 1) {
            executeAction = true;
          }
          if (Input.Mouse.buttonUp && _this.params.state === 2) {
            executeAction = true;
          }
        } else if (_this.params.key === 102) {
          if ((Input.keyDown || Input.Mouse.buttonDown) && _this.params.state === 1) {
            executeAction = true;
          }
          if ((Input.keyUp || Input.Mouse.buttonUp) && _this.params.state === 2) {
            executeAction = true;
          }
        } else {
          key = key > 100 ? key - 100 : key;
          executeAction = Input.keys[key] === _this.params.state;
        }
        if (executeAction) {
          _this.interpreter.isWaiting = false;
          gs.GlobalEventManager.offByOwner("mouseDown", _this.object);
          gs.GlobalEventManager.offByOwner("mouseUp", _this.object);
          gs.GlobalEventManager.offByOwner("keyDown", _this.object);
          return gs.GlobalEventManager.offByOwner("keyUp", _this.object);
        }
      };
    })(this);
    gs.GlobalEventManager.on("mouseDown", f, null, this.object);
    gs.GlobalEventManager.on("mouseUp", f, null, this.object);
    gs.GlobalEventManager.on("keyDown", f, null, this.object);
    gs.GlobalEventManager.on("KeyUp", f, null, this.object);
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandGetInputData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetInputData = function() {
    var anyButton, anyInput, anyKey, code;
    switch (this.params.field) {
      case 0:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.A]);
      case 1:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.B]);
      case 2:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.X]);
      case 3:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.Y]);
      case 4:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.L]);
      case 5:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.R]);
      case 6:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.START]);
      case 7:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.SELECT]);
      case 8:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.x);
      case 9:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.y);
      case 10:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.wheel);
      case 11:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.LEFT]);
      case 12:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.RIGHT]);
      case 13:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.MIDDLE]);
      case 100:
        anyKey = 0;
        if (Input.keyDown) {
          anyKey = 1;
        }
        if (Input.keyUp) {
          anyKey = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyKey);
      case 101:
        anyButton = 0;
        if (Input.Mouse.buttonDown) {
          anyButton = 1;
        }
        if (Input.Mouse.buttonUp) {
          anyButton = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyButton);
      case 102:
        anyInput = 0;
        if (Input.Mouse.buttonDown || Input.keyDown) {
          anyInput = 1;
        }
        if (Input.Mouse.buttonUp || Input.keyUp) {
          anyInput = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyInput);
      default:
        code = this.params.field - 100;
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[code]);
    }
  };


  /**
  * @method commandGetGameData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetGameData = function() {
    var ref, ref1, settings, tempSettings;
    tempSettings = GameManager.tempSettings;
    settings = GameManager.settings;
    switch (this.params.field) {
      case 0:
        return this.interpreter.setStringValueTo(this.params.targetVariable, SceneManager.scene.sceneDocument.uid);
      case 1:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60));
      case 2:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60 / 60));
      case 3:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60 / 60 / 60));
      case 4:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getDate());
      case 5:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getDay());
      case 6:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getMonth());
      case 7:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getFullYear());
      case 8:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowSkip);
      case 9:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowSkipUnreadMessages);
      case 10:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.messageSpeed);
      case 11:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.enabled);
      case 12:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.autoMessage.time);
      case 13:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.waitForVoice);
      case 14:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.stopOnAction);
      case 15:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.timeMessageToVoice);
      case 16:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowVideoSkip);
      case 17:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowChoiceSkip);
      case 18:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.skipVoiceOnAction);
      case 19:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.fullScreen);
      case 20:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.adjustAspectRatio);
      case 21:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.confirmation);
      case 22:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.bgmVolume);
      case 23:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.voiceVolume);
      case 24:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.seVolume);
      case 25:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.bgmEnabled);
      case 26:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.voiceEnabled);
      case 27:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.seEnabled);
      case 28:
        return this.interpreter.setStringValueTo(this.params.targetVariable, ((ref = LanguageManager.language) != null ? ref.code : void 0) || "");
      case 29:
        return this.interpreter.setStringValueTo(this.params.targetVariable, ((ref1 = LanguageManager.language) != null ? ref1.name : void 0) || "");
      case 30:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, GameManager.tempSettings.skip);
    }
  };


  /**
  * @method commandSetGameData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetGameData = function() {
    var code, language, settings, tempSettings;
    tempSettings = GameManager.tempSettings;
    settings = GameManager.settings;
    switch (this.params.field) {
      case 0:
        return settings.allowSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 1:
        return settings.allowSkipUnreadMessages = this.interpreter.booleanValueOf(this.params.switchValue);
      case 2:
        return settings.messageSpeed = this.interpreter.numberValueOf(this.params.numberValue);
      case 3:
        return settings.autoMessage.enabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 4:
        return settings.autoMessage.time = this.interpreter.numberValueOf(this.params.numberValue);
      case 5:
        return settings.autoMessage.waitForVoice = this.interpreter.booleanValueOf(this.params.switchValue);
      case 6:
        return settings.autoMessage.stopOnAction = this.interpreter.booleanValueOf(this.params.switchValue);
      case 7:
        return settings.timeMessageToVoice = this.interpreter.booleanValueOf(this.params.switchValue);
      case 8:
        return settings.allowVideoSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 9:
        return settings.allowChoiceSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 10:
        return settings.skipVoiceOnAction = this.interpreter.booleanValueOf(this.params.switchValue);
      case 11:
        settings.fullScreen = this.interpreter.booleanValueOf(this.params.switchValue);
        if (settings.fullScreen) {
          return SceneManager.scene.behavior.enterFullScreen();
        } else {
          return SceneManager.scene.behavior.leaveFullScreen();
        }
        break;
      case 12:
        settings.adjustAspectRatio = this.interpreter.booleanValueOf(this.params.switchValue);
        Graphics.keepRatio = settings.adjustAspectRatio;
        return Graphics.onResize();
      case 13:
        return settings.confirmation = this.interpreter.booleanValueOf(this.params.switchValue);
      case 14:
        return settings.bgmVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 15:
        return settings.voiceVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 16:
        return settings.seVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 17:
        return settings.bgmEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 18:
        return settings.voiceEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 19:
        return settings.seEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 20:
        code = this.interpreter.stringValueOf(this.params.textValue);
        language = LanguageManager.languages.first((function(_this) {
          return function(l) {
            return l.code === code;
          };
        })(this));
        if (language) {
          return LanguageManager.selectLanguage(language);
        }
        break;
      case 21:
        return GameManager.tempSettings.skip = this.interpreter.booleanValueOf(this.params.switchValue);
    }
  };


  /**
  * @method commandGetObjectData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetObjectData = function() {
    var area, characterId, field, object, ref, ref1, scene;
    scene = SceneManager.scene;
    switch (this.params.objectType) {
      case 0:
        scene.behavior.changePictureDomain(this.params.numberDomain);
        object = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 1:
        object = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
        break;
      case 2:
        scene.behavior.changeTextDomain(this.params.numberDomain);
        object = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 3:
        scene.behavior.changeVideoDomain(this.params.numberDomain);
        object = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 4:
        characterId = this.interpreter.stringValueOf(this.params.characterId);
        object = SceneManager.scene.characters.first((function(_this) {
          return function(v) {
            return !v.disposed && v.rid === characterId;
          };
        })(this));
        break;
      case 5:
        object = gs.ObjectManager.current.objectById("messageBox");
        break;
      case 6:
        scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
        area = SceneManager.scene.messageAreas[this.interpreter.numberValueOf(this.params.number)];
        object = area != null ? area.layout : void 0;
        break;
      case 7:
        scene.behavior.changeHotspotDomain(this.params.numberDomain);
        object = SceneManager.scene.hotspots[this.interpreter.numberValueOf(this.params.number)];
    }
    field = this.params.field;
    if (this.params.objectType === 4) {
      switch (this.params.field) {
        case 0:
          this.interpreter.setStringValueTo(this.params.targetVariable, ((ref = RecordManager.characters[characterId]) != null ? ref.index : void 0) || "");
          break;
        case 1:
          this.interpreter.setStringValueTo(this.params.targetVariable, lcs((ref1 = RecordManager.characters[characterId]) != null ? ref1.name : void 0) || "");
      }
      field -= 2;
    }
    if (object != null) {
      if (field >= 0) {
        switch (field) {
          case 0:
            switch (this.params.objectType) {
              case 2:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.text || "");
              case 3:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.video || "");
              default:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.image || "");
            }
            break;
          case 1:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.x);
          case 2:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.y);
          case 3:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.anchor.x * 100));
          case 4:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.anchor.y * 100));
          case 5:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.zoom.x * 100));
          case 6:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.zoom.y * 100));
          case 7:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.width);
          case 8:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.height);
          case 9:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.zIndex);
          case 10:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.opacity);
          case 11:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.angle);
          case 12:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.visible);
          case 13:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.blendMode);
          case 14:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.mirror);
        }
      }
    }
  };


  /**
  * @method commandSetObjectData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetObjectData = function() {
    var area, characterId, field, name, object, ref, scene;
    scene = SceneManager.scene;
    switch (this.params.objectType) {
      case 0:
        scene.behavior.changePictureDomain(this.params.numberDomain);
        object = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 1:
        object = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
        break;
      case 2:
        scene.behavior.changeTextDomain(this.params.numberDomain);
        object = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 3:
        scene.behavior.changeVideoDomain(this.params.numberDomain);
        object = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 4:
        characterId = this.interpreter.stringValueOf(this.params.characterId);
        object = SceneManager.scene.characters.first((function(_this) {
          return function(v) {
            return !v.disposed && v.rid === characterId;
          };
        })(this));
        break;
      case 5:
        object = gs.ObjectManager.current.objectById("messageBox");
        break;
      case 6:
        scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
        area = SceneManager.scene.messageAreas[this.interpreter.numberValueOf(this.params.number)];
        object = area != null ? area.layout : void 0;
        break;
      case 7:
        scene.behavior.changeHotspotDomain(this.params.numberDomain);
        object = SceneManager.scene.hotspots[this.interpreter.numberValueOf(this.params.number)];
    }
    field = this.params.field;
    if (this.params.objectType === 4) {
      switch (field) {
        case 0:
          name = this.interpreter.stringValueOf(this.params.textValue);
          if (object != null) {
            object.name = name;
          }
          if ((ref = RecordManager.characters[characterId]) != null) {
            ref.name = name;
          }
      }
      field--;
    }
    if (object != null) {
      if (field >= 0) {
        switch (field) {
          case 0:
            switch (this.params.objectType) {
              case 2:
                return object.text = this.interpreter.stringValueOf(this.params.textValue);
              case 3:
                return object.video = this.interpreter.stringValueOf(this.params.textValue);
              default:
                return object.image = this.interpreter.stringValueOf(this.params.textValue);
            }
            break;
          case 1:
            return object.dstRect.x = this.interpreter.numberValueOf(this.params.numberValue);
          case 2:
            return object.dstRect.y = this.interpreter.numberValueOf(this.params.numberValue);
          case 3:
            return object.anchor.x = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 4:
            return object.anchor.y = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 5:
            return object.zoom.x = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 6:
            return object.zoom.y = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 7:
            return object.zIndex = this.interpreter.numberValueOf(this.params.numberValue);
          case 8:
            return object.opacity = this.interpreter.numberValueOf(this.params.numberValue);
          case 9:
            return object.angle = this.interpreter.numberValueOf(this.params.numberValue);
          case 10:
            return object.visible = this.interpreter.booleanValueOf(this.params.switchValue);
          case 11:
            return object.blendMode = this.interpreter.numberValueOf(this.params.numberValue);
          case 12:
            return object.mirror = this.interpreter.booleanValueOf(this.params.switchValue);
        }
      }
    }
  };


  /**
  * @method commandChangeSounds
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeSounds = function() {
    var fieldFlags, i, k, len, ref, results, sound, sounds;
    sounds = RecordManager.system.sounds;
    fieldFlags = this.params.fieldFlags || {};
    ref = this.params.sounds;
    results = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      sound = ref[i];
      if (!gs.CommandFieldFlags.isLocked(fieldFlags["sounds." + i])) {
        results.push(sounds[i] = this.params.sounds[i]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * @method commandChangeColors
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeColors = function() {
    var color, colors, fieldFlags, i, k, len, ref, results;
    colors = RecordManager.system.colors;
    fieldFlags = this.params.fieldFlags || {};
    ref = this.params.colors;
    results = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      color = ref[i];
      if (!gs.CommandFieldFlags.isLocked(fieldFlags["colors." + i])) {
        results.push(colors[i] = new gs.Color(this.params.colors[i]));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * @method commandChangeScreenCursor
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeScreenCursor = function() {
    var bitmap, ref;
    if (((ref = this.params.graphic) != null ? ref.name : void 0) != null) {
      bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + this.params.graphic.name);
      return Graphics.setCursorBitmap(bitmap, this.params.hx, this.params.hy);
    } else {
      return Graphics.setCursorBitmap(null, 0, 0);
    }
  };


  /**
  * @method commandResetGlobalData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResetGlobalData = function() {
    return GameManager.resetGlobalData();
  };


  /**
  * @method commandScript
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScript = function() {
    var ex;
    try {
      if (!this.params.scriptFunc) {
        this.params.scriptFunc = eval("(function(){" + this.params.script + "})");
      }
      return this.params.scriptFunc();
    } catch (error) {
      ex = error;
      return console.log(ex);
    }
  };

  return Component_CommandInterpreter;

})(gs.Component);

window.CommandInterpreter = Component_CommandInterpreter;

gs.Component_CommandInterpreter = Component_CommandInterpreter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsaUVBQUE7RUFBQTs7O0FBQU07O0FBQ0Y7Ozs7Ozs7RUFPYSx5QkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7RUF0Qlg7Ozs7OztBQXdCakIsRUFBRSxDQUFDLGVBQUgsR0FBcUI7O0FBRWY7RUFDRixrQkFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsT0FBRDs7O0FBRXhCOzs7Ozs7Ozs7Ozs7RUFXYSw0QkFBQyxFQUFELEVBQUssS0FBTDs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsRUFBRCxHQUFNOztBQUVOOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7RUFiQTs7O0FBZWI7Ozs7Ozs7K0JBTUEsR0FBQSxHQUFLLFNBQUMsRUFBRCxFQUFLLEtBQUw7SUFDRCxJQUFDLENBQUEsRUFBRCxHQUFNO1dBQ04sSUFBQyxDQUFBLEtBQUQsR0FBUztFQUZSOzs7Ozs7QUFJVCxFQUFFLENBQUMsa0JBQUgsR0FBd0I7O0FBRWxCOzs7RUFDRiw0QkFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRCxFQUFXLFNBQVgsRUFBc0IscUJBQXRCLEVBQTZDLHVCQUE3QyxFQUFzRSxvQkFBdEU7OztBQUV4Qjs7Ozs7Ozs7O3lDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTs7O0FBR3JCOzs7Ozs7Ozs7Ozs7O0VBWWEsc0NBQUE7SUFDVCw0REFBQTs7QUFFQTs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7OztJQU1BLElBQUMsQ0FBQSxVQUFELEdBQWM7O0FBRWQ7Ozs7OztJQU1BLElBQUMs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U0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBbkQsQ0FBOUI7T0FBNUMsQ0FBM0IsRUFESjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUF4QixLQUFnQyxDQUFoQyxJQUFxQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEU7TUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsRUFBRSxDQUFDLFFBQUgsQ0FBWSxnQkFBWixFQUE4QixJQUFDLENBQUEsV0FBL0IsRUFBNEM7UUFBRSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVg7UUFBbUIsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBbkQsQ0FBOUI7T0FBNUMsQ0FBM0IsRUFESjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUF4QixLQUFnQyxDQUFoQyxJQUFxQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEU7TUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsRUFBRSxDQUFDLFFBQUgsQ0FBWSxnQkFBWixFQUE4QixJQUFDLENBQUEsV0FBL0IsRUFBNEM7UUFBRSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVg7UUFBbUIsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBbkQsQ0FBOUI7T0FBNUMsQ0FBM0IsRUFESjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJ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eEI7Ozs7O3lDQUlBLGFBQUEsR0FBZSxTQUFBO0FBQ1gsUUFBQTtBQUFBO01BQ0ksSUFBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBWjtRQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixHQUFxQixJQUFBLENBQUssY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXpCLEdBQWtDLElBQXZDLEVBRHpCOzthQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLEVBSko7S0FBQSxhQUFBO01BS007YUFDRixPQUFPLENBQUMsR0FBUixDQUFZLEVBQVosRUFOSjs7RUFEVzs7OztHQXRuTHdCLEVBQUUsQ0FBQzs7QUErbkw5QyxNQUFNLENBQUMsa0JBQVAsR0FBNEI7O0FBQzVCLEVBQUUsQ0FBQyw0QkFBSCxHQUFrQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBMaXZlUHJldmlld0luZm9cbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgaW50ZXJuYWwgcHJldmlldy1pbmZvIGlmIHRoZSBnYW1lIHJ1bnMgY3VycmVudGx5IGluIExpdmUtUHJldmlldy5cbiAgICAqICAgICAgICBcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBMaXZlUHJldmlld0luZm9cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGltZXIgSUQgaWYgYSB0aW1lb3V0IGZvciBsaXZlLXByZXZpZXcgd2FzIGNvbmZpZ3VyZWQgdG8gZXhpdCB0aGUgZ2FtZSBsb29wIGFmdGVyIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdGltZW91dFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHRpbWVvdXQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqIFxuICAgICAgICAqIEluZGljYXRlcyBpZiBMaXZlLVByZXZpZXcgaXMgY3VycmVudGx5IHdhaXRpbmcgZm9yIHRoZSBuZXh0IHVzZXItYWN0aW9uLiAoU2VsZWN0aW5nIGFub3RoZXIgY29tbWFuZCwgZXRjLilcbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdGluZyAgXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvdW50cyB0aGUgYW1vdW50IG9mIGV4ZWN1dGVkIGNvbW1hbmRzIHNpbmNlIHRoZSBsYXN0IFxuICAgICAgICAqIGludGVycHJldGVyLXBhdXNlKHdhaXRpbmcsIGV0Yy4pLiBJZiBpdHMgbW9yZSB0aGFuIDUwMCwgdGhlIGludGVycHJldGVyIHdpbGwgYXV0b21hdGljYWxseSBwYXVzZSBmb3IgMSBmcmFtZSB0byBcbiAgICAgICAgKiBhdm9pZCB0aGF0IExpdmUtUHJldmlldyBmcmVlemVzIHRoZSBFZGl0b3IgaW4gY2FzZSBvZiBlbmRsZXNzIGxvb3BzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBleGVjdXRlZENvbW1hbmRzXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZXhlY3V0ZWRDb21tYW5kcyA9IDBcbiAgICAgICAgXG5ncy5MaXZlUHJldmlld0luZm8gPSBMaXZlUHJldmlld0luZm9cbiAgICAgICAgXG5jbGFzcyBJbnRlcnByZXRlckNvbnRleHRcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvd25lclwiXVxuICAgIFxuICAgICMjIypcbiAgICAqIERlc2NyaWJlcyBhbiBpbnRlcnByZXRlci1jb250ZXh0IHdoaWNoIGhvbGRzIGluZm9ybWF0aW9uIGFib3V0XG4gICAgKiB0aGUgaW50ZXJwcmV0ZXIncyBvd25lciBhbmQgYWxzbyB1bmlxdWUgSUQgdXNlZCBmb3IgYWNjZXNzaW5nIGNvcnJlY3RcbiAgICAqIGxvY2FsIHZhcmlhYmxlcy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgSW50ZXJwcmV0ZXJDb250ZXh0XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaWQgLSBBIHVuaXF1ZSBJRFxuICAgICogQHBhcmFtIHtPYmplY3R9IG93bmVyIC0gVGhlIG93bmVyIG9mIHRoZSBpbnRlcnByZXRlclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoaWQsIG93bmVyKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogQSB1bmlxdWUgbnVtZXJpYyBvciB0ZXh0dWFsIElEIHVzZWQgZm9yIGFjY2Vzc2luZyBjb3JyZWN0IGxvY2FsIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJ8c3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAaWQgPSBpZFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvd25lciBvZiB0aGUgaW50ZXJwcmV0ZXIgKGUuZy4gY3VycmVudCBzY2VuZSwgZXRjLikuXG4gICAgICAgICogQHByb3BlcnR5IG93bmVyXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAb3duZXIgPSBvd25lclxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIGNvbnRleHQncyBkYXRhLlxuICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBpZCAtIEEgdW5pcXVlIElEXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3duZXIgLSBUaGUgb3duZXIgb2YgdGhlIGludGVycHJldGVyXG4gICAgKiBAbWV0aG9kIHNldFxuICAgICMjIyAgICBcbiAgICBzZXQ6IChpZCwgb3duZXIpIC0+XG4gICAgICAgIEBpZCA9IGlkXG4gICAgICAgIEBvd25lciA9IG93bmVyXG4gICAgICAgIFxuZ3MuSW50ZXJwcmV0ZXJDb250ZXh0ID0gSW50ZXJwcmV0ZXJDb250ZXh0XG5cbmNsYXNzIENvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvYmplY3RcIiwgXCJjb21tYW5kXCIsIFwib25NZXNzYWdlQURWV2FpdGluZ1wiLCBcIm9uTWVzc2FnZUFEVkRpc2FwcGVhclwiLCBcIm9uTWVzc2FnZUFEVkZpbmlzaFwiXVxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICogXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgYSBnYW1lIG9iamVjdCB0byBwcm9jZXNzIGNvbW1hbmRzIGxpa2UgZm9yXG4gICAgKiBzY2VuZS1vYmplY3RzLiBGb3IgZWFjaCBjb21tYW5kIGEgY29tbWFuZC1mdW5jdGlvbiBleGlzdHMuIFRvIGFkZFxuICAgICogb3duIGN1c3RvbSBjb21tYW5kcyB0byB0aGUgaW50ZXJwcmV0ZXIganVzdCBjcmVhdGUgYSBzdWItY2xhc3MgYW5kXG4gICAgKiBvdmVycmlkZSB0aGUgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlci5hc3NpZ25Db21tYW5kIG1ldGhvZFxuICAgICogYW5kIGFzc2lnbiB0aGUgY29tbWFuZC1mdW5jdGlvbiBmb3IgeW91ciBjdXN0b20tY29tbWFuZC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFdhaXQtQ291bnRlciBpbiBmcmFtZXMuIElmIGdyZWF0ZXIgdGhhbiAwLCB0aGUgaW50ZXJwcmV0ZXIgd2lsbCBmb3IgdGhhdCBhbW91bnQgb2YgZnJhbWVzIGJlZm9yZSBjb250aW51ZS5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdENvdW50ZXJcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRleCB0byB0aGUgbmV4dCBjb21tYW5kIHRvIGV4ZWN1dGUuXG4gICAgICAgICogQHByb3BlcnR5IHBvaW50ZXJcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBzdGF0ZXMgb2YgY29uZGl0aW9ucy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29uZGl0aW9uc1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb25kaXRpb25zID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgc3RhdGVzIG9mIGxvb3BzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb29wc1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBsb29wcyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIEZJWE1FOiBTaG91bGQgbm90IGJlIHN0b3JlZCBpbiB0aGUgaW50ZXJwcmV0ZXIuXG4gICAgICAgIEB0aW1lcnMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaW50ZXJwcmV0ZXIgaXMgY3VycmVudGx5IHJ1bm5pbmcuXG4gICAgICAgICogQHByb3BlcnR5IGlzUnVubmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaW50ZXJwcmV0ZXIgaXMgY3VycmVudGx5IHdhaXRpbmcuXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaW50ZXJwcmV0ZXIgaXMgY3VycmVudGx5IHdhaXRpbmcgdW50aWwgYSBtZXNzYWdlIHByb2Nlc3NlZCBieSBhbm90aGVyIGNvbnRleHQgbGlrZSBhIENvbW1vbiBFdmVudFxuICAgICAgICAqIGlzIGZpbmlzaGVkLlxuICAgICAgICAqIEZJWE1FOiBDb25mbGljdCBoYW5kbGluZyBjYW4gYmUgcmVtb3ZlZCBtYXliZS4gXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ0Zvck1lc3NhZ2VcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAaXNXYWl0aW5nRm9yTWVzc2FnZSA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGludGVybmFsIHByZXZpZXctaW5mbyBpZiB0aGUgZ2FtZSBydW5zIGN1cnJlbnRseSBpbiBMaXZlLVByZXZpZXcuXG4gICAgICAgICogPHVsPlxuICAgICAgICAqIDxsaT5wcmV2aWV3SW5mby50aW1lb3V0IC0gVGltZXIgSUQgaWYgYSB0aW1lb3V0IGZvciBsaXZlLXByZXZpZXcgd2FzIGNvbmZpZ3VyZWQgdG8gZXhpdCB0aGUgZ2FtZSBsb29wIGFmdGVyIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS48L2xpPlxuICAgICAgICAqIDxsaT5wcmV2aWV3SW5mby53YWl0aW5nIC0gSW5kaWNhdGVzIGlmIExpdmUtUHJldmlldyBpcyBjdXJyZW50bHkgd2FpdGluZyBmb3IgdGhlIG5leHQgdXNlci1hY3Rpb24uIChTZWxlY3RpbmcgYW5vdGhlciBjb21tYW5kLCBldGMuKTwvbGk+XG4gICAgICAgICogPGxpPnByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMgLSBDb3VudHMgdGhlIGFtb3VudCBvZiBleGVjdXRlZCBjb21tYW5kcyBzaW5jZSB0aGUgbGFzdCBcbiAgICAgICAgKiBpbnRlcnByZXRlci1wYXVzZSh3YWl0aW5nLCBldGMuKS4gSWYgaXRzIG1vcmUgdGhhbiA1MDAsIHRoZSBpbnRlcnByZXRlciB3aWxsIGF1dG9tYXRpY2FsbHkgcGF1c2UgZm9yIDEgZnJhbWUgdG8gXG4gICAgICAgICogYXZvaWQgdGhhdCBMaXZlLVByZXZpZXcgZnJlZXplcyB0aGUgRWRpdG9yIGluIGNhc2Ugb2YgZW5kbGVzcyBsb29wcy48L2xpPlxuICAgICAgICAqIDwvdWw+XG4gICAgICAgICogQHByb3BlcnR5IHByZXZpZXdJbmZvXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwcmV2aWV3SW5mbyA9IG5ldyBncy5MaXZlUHJldmlld0luZm8oKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBMaXZlLVByZXZpZXcgcmVsYXRlZCBpbmZvIHBhc3NlZCBmcm9tIHRoZSBWTiBNYWtlciBlZGl0b3IgbGlrZSB0aGUgY29tbWFuZC1pbmRleCB0aGUgcGxheWVyIGNsaWNrZWQgb24sIGV0Yy5cbiAgICAgICAgKiBAcHJvcGVydHkgcHJldmlld0RhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAcHJldmlld0RhdGEgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBhdXRvbWF0aWNhbGx5IHJlcGVhdHMgZXhlY3V0aW9uIGFmdGVyIHRoZSBsYXN0IGNvbW1hbmQgd2FzIGV4ZWN1dGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZXBlYXRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAcmVwZWF0ID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgb2YgdGhlIGludGVycHJldGVyLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgICAgICogQHR5cGUgZ3MuSW50ZXJwcmV0ZXJDb250ZXh0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbnRleHQgPSBuZXcgZ3MuSW50ZXJwcmV0ZXJDb250ZXh0KDAsIG51bGwpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3ViLUludGVycHJldGVyIGZyb20gYSBDb21tb24gRXZlbnQgQ2FsbC4gVGhlIGludGVycHJldGVyIHdpbGwgd2FpdCB1bnRpbCB0aGUgc3ViLWludGVycHJldGVyIGlzIGRvbmUgYW5kIHNldCBiYWNrIHRvXG4gICAgICAgICogPGI+bnVsbDwvYj4uXG4gICAgICAgICogQHByb3BlcnR5IHN1YkludGVycHJldGVyXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBzdWJJbnRlcnByZXRlciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IGluZGVudC1sZXZlbCBvZiBleGVjdXRpb25cbiAgICAgICAgKiBAcHJvcGVydHkgaW5kZW50XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGluZGVudCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgaW5mb3JtYXRpb24gYWJvdXQgZm9yIHdoYXQgdGhlIGludGVycHJldGVyIGlzIGN1cnJlbnRseSB3YWl0aW5nIGZvciBsaWtlIGZvciBhIEFEViBtZXNzYWdlLCBldGMuIHRvXG4gICAgICAgICogcmVzdG9yZSBwcm9iYWJseSB3aGVuIGxvYWRlZCBmcm9tIGEgc2F2ZS1nYW1lLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0aW5nRm9yXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRpbmdGb3IgPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBpbnRlcnByZXRlciByZWxhdGVkIHNldHRpbmdzIGxpa2UgaG93IHRvIGhhbmRsZSBtZXNzYWdlcywgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzZXR0aW5nc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBzZXR0aW5ncyA9IHsgbWVzc2FnZTogeyBieUlkOiB7fSwgYXV0b0VyYXNlOiB5ZXMsIHdhaXRBdEVuZDogeWVzLCBiYWNrbG9nOiB5ZXMgfSwgc2NyZWVuOiB7IHBhbjogbmV3IGdzLlBvaW50KDAsIDApIH0gfVxuICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogTWFwcGluZyB0YWJsZSB0byBxdWlja2x5IGdldCB0aGUgYW5jaG9yIHBvaW50IGZvciB0aGUgYW4gaW5zZXJ0ZWQgYW5jaG9yLXBvaW50IGNvbnN0YW50IHN1Y2ggYXNcbiAgICAgICAgKiBUb3AtTGVmdCgwKSwgVG9wKDEpLCBUb3AtUmlnaHQoMikgYW5kIHNvIG9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudFxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50W11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZ3JhcGhpY0FuY2hvclBvaW50c0J5Q29uc3RhbnQgPSBbXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC4wLCAwLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuNSwgMC4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgxLjAsIDAuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMS4wLCAwLjUpLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDEuMCwgMS4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjUsIDEuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC4wLCAxLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuMCwgMC41KSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjUsIDAuNSlcbiAgICAgICAgXVxuICAgICAgICBcbiAgICBvbkhvdHNwb3RDbGljazogKGUsIGRhdGEpIC0+IFxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uQ2xpY2ssIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICAgICAgXG4gICAgb25Ib3RzcG90RW50ZXI6IChlLCBkYXRhKSAtPiBcbiAgICAgICAgQGV4ZWN1dGVBY3Rpb24oZGF0YS5wYXJhbXMuYWN0aW9ucy5vbkVudGVyLCB5ZXMsIGRhdGEuYmluZFZhbHVlKVxuICAgICAgICBcbiAgICBvbkhvdHNwb3RMZWF2ZTogKGUsIGRhdGEpIC0+IFxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uTGVhdmUsIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3REcmFnU3RhcnQ6IChlLCBkYXRhKSAtPiBcbiAgICAgICAgQGV4ZWN1dGVBY3Rpb24oZGF0YS5wYXJhbXMuYWN0aW9ucy5vbkRyYWcsIHllcywgZGF0YS5iaW5kVmFsdWUpXG4gICAgb25Ib3RzcG90RHJhZzogKGUsIGRhdGEpIC0+IFxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uRHJhZywgeWVzLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3REcmFnRW5kOiAoZSwgZGF0YSkgLT4gXG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25EcmFnLCBubywgZGF0YS5iaW5kVmFsdWUpXG4gICAgb25Ib3RzcG90U3RhdGVDaGFuZ2VkOiAoZSwgcGFyYW1zKSAtPiBcbiAgICAgICAgaWYgZS5zZW5kZXIuYmVoYXZpb3Iuc2VsZWN0ZWRcbiAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKHBhcmFtcy5hY3Rpb25zLm9uU2VsZWN0LCB5ZXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKHBhcmFtcy5hY3Rpb25zLm9uRGVzZWxlY3QsIG5vKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBBRFYgbWVzc2FnZSBmaW5pc2hlZCByZW5kZXJpbmcgYW5kIGlzIG5vdyB3YWl0aW5nXG4gICAgKiBmb3IgdGhlIHVzZXIvYXV0b20tbWVzc2FnZSB0aW1lciB0byBwcm9jZWVkLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25NZXNzYWdlQURWV2FpdGluZ1xuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIG9uTWVzc2FnZUFEVldhaXRpbmc6IChlKSAtPlxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gZS5zZW5kZXIub2JqZWN0XG4gICAgICAgIGlmICFAbWVzc2FnZVNldHRpbmdzKCkud2FpdEF0RW5kXG4gICAgICAgICAgICBpZiBlLmRhdGEucGFyYW1zLndhaXRGb3JDb21wbGV0aW9uXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIuaXNSdW5uaW5nID0gbm9cbiAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub2ZmIFwid2FpdGluZ1wiLCBlLmhhbmRsZXJcbiAgICAgICAgXG4gICAgICAgIGlmIEBtZXNzYWdlU2V0dGluZ3MoKS5iYWNrbG9nIGFuZCAobWVzc2FnZU9iamVjdC5zZXR0aW5ncy5hdXRvRXJhc2Ugb3IgbWVzc2FnZU9iamVjdC5zZXR0aW5ncy5wYXJhZ3JhcGhTcGFjaW5nID4gMClcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cucHVzaCh7IGNoYXJhY3RlcjogbWVzc2FnZU9iamVjdC5jaGFyYWN0ZXIsIG1lc3NhZ2U6IG1lc3NhZ2VPYmplY3QuYmVoYXZpb3IubWVzc2FnZSwgY2hvaWNlczogW10gfSkgXG4gICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGFuIEFEViBtZXNzYWdlIGZpbmlzaGVkIGZhZGUtb3V0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25NZXNzYWdlQURWRGlzYXBwZWFyXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgb25NZXNzYWdlQURWRGlzYXBwZWFyOiAobWVzc2FnZU9iamVjdCwgd2FpdEZvckNvbXBsZXRpb24pIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5jdXJyZW50Q2hhcmFjdGVyID0geyBuYW1lOiBcIlwiIH1cbiAgICAgICAgbWVzc2FnZU9iamVjdC5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgIG1lc3NhZ2VPYmplY3QudmlzaWJsZSA9IG5vXG4gICAgICAgIFxuICAgICAgICBpZiB3YWl0Rm9yQ29tcGxldGlvbiAgICBcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBAd2FpdGluZ0Zvci5tZXNzYWdlQURWID0gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGFuIEFEViBtZXNzYWdlIGZpbmlzaGVkIGNsZWFyLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25NZXNzYWdlQURWQ2xlYXJcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgb25NZXNzYWdlQURWQ2xlYXI6IChtZXNzYWdlT2JqZWN0LCB3YWl0Rm9yQ29tcGxldGlvbikgLT5cbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IEB0YXJnZXRNZXNzYWdlKClcbiAgICAgICAgaWYgQG1lc3NhZ2VTZXR0aW5ncygpLmJhY2tsb2cgICBcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cucHVzaCh7IGNoYXJhY3RlcjogbWVzc2FnZU9iamVjdC5jaGFyYWN0ZXIsIG1lc3NhZ2U6IG1lc3NhZ2VPYmplY3QuYmVoYXZpb3IubWVzc2FnZSwgY2hvaWNlczogW10gfSkgXG4gICAgICAgIEBvbk1lc3NhZ2VBRFZEaXNhcHBlYXIobWVzc2FnZU9iamVjdCwgd2FpdEZvckNvbXBsZXRpb24pXG4gICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGhvdHNwb3QvaW1hZ2UtbWFwIHNlbmRzIGEgXCJqdW1wVG9cIiBldmVudCB0byBsZXQgdGhlXG4gICAgKiBpbnRlcnByZXRlciBqdW1wIHRvIHRoZSBwb3NpdGlvbiBkZWZpbmVkIGluIHRoZSBldmVudCBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkp1bXBUb1xuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBvbkp1bXBUbzogKGUpIC0+XG4gICAgICAgIEBqdW1wVG9MYWJlbChlLmxhYmVsKVxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBob3RzcG90L2ltYWdlLW1hcCBzZW5kcyBhIFwiY2FsbENvbW1vbkV2ZW50XCIgZXZlbnQgdG8gbGV0IHRoZVxuICAgICogaW50ZXJwcmV0ZXIgY2FsbCB0aGUgY29tbW9uIGV2ZW50IGRlZmluZWQgaW4gdGhlIGV2ZW50IG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uSnVtcFRvXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIG9uQ2FsbENvbW1vbkV2ZW50OiAoZSkgLT5cbiAgICAgICAgZXZlbnRJZCA9IGUuY29tbW9uRXZlbnRJZFxuICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdXG4gICAgICAgIGlmICFldmVudFxuICAgICAgICAgICAgZXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50cy5maXJzdCAoeCkgPT4geC5uYW1lID09IGV2ZW50SWRcbiAgICAgICAgICAgIGV2ZW50SWQgPSBldmVudC5pbmRleCBpZiBldmVudFxuICAgICAgICBAY2FsbENvbW1vbkV2ZW50KGV2ZW50SWQsIGUucGFyYW1zIHx8IFtdLCAhZS5maW5pc2gpXG4gICAgICAgIEBpc1dhaXRpbmcgPSBlLndhaXRpbmcgPyBub1xuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIEFEViBtZXNzYWdlIGZpbmlzaGVzLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uTWVzc2FnZUFEVkZpbmlzaFxuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBvbk1lc3NhZ2VBRFZGaW5pc2g6IChlKSAtPlxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gZS5zZW5kZXIub2JqZWN0IFxuICBcbiAgICAgICAgaWYgbm90IEBtZXNzYWdlU2V0dGluZ3MoKS53YWl0QXRFbmQgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLmdsb2JhbERhdGEubWVzc2FnZXNbbGNzbShlLmRhdGEucGFyYW1zLm1lc3NhZ2UpXSA9IHsgcmVhZDogeWVzIH1cbiAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuICAgICAgICBpZiBlLmRhdGEucGFyYW1zLndhaXRGb3JDb21wbGV0aW9uXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRpbmdGb3IubWVzc2FnZUFEViA9IG51bGxcbiAgICAgICAgcG9pbnRlciA9IEBwb2ludGVyXG4gICAgICAgIGNvbW1hbmRzID0gQG9iamVjdC5jb21tYW5kc1xuICAgICAgICBcbiAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub2ZmIFwiZmluaXNoXCIsIGUuaGFuZGxlclxuICAgICAgICAjbWVzc2FnZU9iamVjdC5jaGFyYWN0ZXIgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBtZXNzYWdlT2JqZWN0LnZvaWNlPyBhbmQgR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb25cbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wU291bmQobWVzc2FnZU9iamVjdC52b2ljZS5uYW1lKVxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBpc01lc3NhZ2VDb21tYW5kKHBvaW50ZXIsIGNvbW1hbmRzKSBhbmQgQG1lc3NhZ2VTZXR0aW5ncygpLmF1dG9FcmFzZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRpbmdGb3IubWVzc2FnZUFEViA9IGUuZGF0YS5wYXJhbXNcbiAgICAgICAgXG4gICAgICAgICAgICBmYWRpbmcgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZ1xuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDAgZWxzZSBmYWRpbmcuZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC53YWl0Rm9yQ29tcGxldGlvbiA9IGUuZGF0YS5wYXJhbXMud2FpdEZvckNvbXBsZXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYW5pbWF0b3IuZGlzYXBwZWFyKGZhZGluZy5hbmltYXRpb24sIGZhZGluZy5lYXNpbmcsIGR1cmF0aW9uLCBncy5DYWxsQmFjayhcIm9uTWVzc2FnZUFEVkRpc2FwcGVhclwiLCB0aGlzLCBlLmRhdGEucGFyYW1zLndhaXRGb3JDb21wbGV0aW9uKSlcblxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGEgY29tbW9uIGV2ZW50IGZpbmlzaGVkIGV4ZWN1dGlvbi4gSW4gbW9zdCBjYXNlcywgdGhlIGludGVycHJldGVyXG4gICAgKiB3aWxsIHN0b3Agd2FpdGluZyBhbmQgY29udGludWUgcHJvY2Vzc2luZyBhZnRlciB0aGlzLiBCdXQgaFxuICAgICpcbiAgICAqIEBtZXRob2Qgb25Db21tb25FdmVudEZpbmlzaFxuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgb25Db21tb25FdmVudEZpbmlzaDogKGUpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5jb21tb25FdmVudENvbnRhaW5lci5yZW1vdmVPYmplY3QoZS5zZW5kZXIub2JqZWN0KVxuICAgICAgICBlLnNlbmRlci5vYmplY3QuZXZlbnRzLm9mZiBcImZpbmlzaFwiXG4gICAgICAgIEBzdWJJbnRlcnByZXRlciA9IG51bGxcbiAgICAgICAgQGlzV2FpdGluZyA9IGUuZGF0YS53YWl0aW5nID8gbm9cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIHNjZW5lIGNhbGwgZmluaXNoZWQgZXhlY3V0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25DYWxsU2NlbmVGaW5pc2hcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9mIHRoaXMgZXZlbnQuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIG9uQ2FsbFNjZW5lRmluaXNoOiAoc2VuZGVyKSAtPlxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHN1YkludGVycHJldGVyID0gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXJpYWxpemVzIHRoZSBpbnRlcnByZXRlciBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgIFxuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgaWYgQGlzSW5wdXREYXRhQ29tbWFuZChNYXRoLm1heChAcG9pbnRlciAtIDEsIDApLCBAb2JqZWN0LmNvbW1hbmRzKSBcbiAgICAgICAgICAgIHBvaW50ZXI6IE1hdGgubWF4KEBwb2ludGVyIC0gMSAsIDApLFxuICAgICAgICAgICAgY2hvaWNlOiBAY2hvaWNlLCBcbiAgICAgICAgICAgIGNvbmRpdGlvbnM6IEBjb25kaXRpb25zLCBcbiAgICAgICAgICAgIGxvb3BzOiBAbG9vcHMsXG4gICAgICAgICAgICBsYWJlbHM6IEBsYWJlbHMsXG4gICAgICAgICAgICBpc1dhaXRpbmc6IG5vLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBAaXNSdW5uaW5nLFxuICAgICAgICAgICAgd2FpdENvdW50ZXI6IEB3YWl0Q291bnRlcixcbiAgICAgICAgICAgIHdhaXRpbmdGb3I6IEB3YWl0aW5nRm9yLFxuICAgICAgICAgICAgaW5kZW50OiBAaW5kZW50LFxuICAgICAgICAgICAgc2V0dGluZ3M6IEBzZXR0aW5nc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb2ludGVyOiBAcG9pbnRlcixcbiAgICAgICAgICAgIGNob2ljZTogQGNob2ljZSwgXG4gICAgICAgICAgICBjb25kaXRpb25zOiBAY29uZGl0aW9ucywgXG4gICAgICAgICAgICBsb29wczogQGxvb3BzLFxuICAgICAgICAgICAgbGFiZWxzOiBAbGFiZWxzLFxuICAgICAgICAgICAgaXNXYWl0aW5nOiBAaXNXYWl0aW5nLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBAaXNSdW5uaW5nLFxuICAgICAgICAgICAgd2FpdENvdW50ZXI6IEB3YWl0Q291bnRlcixcbiAgICAgICAgICAgIHdhaXRpbmdGb3I6IEB3YWl0aW5nRm9yLFxuICAgICAgICAgICAgaW5kZW50OiBAaW5kZW50LFxuICAgICAgICAgICAgc2V0dGluZ3M6IEBzZXR0aW5nc1xuICAgIFxuICAgICMjIypcbiAgICAjIFByZXZpZXdzIHRoZSBjdXJyZW50IHNjZW5lIGF0IHRoZSBzcGVjaWZpZWQgcG9pbnRlci4gVGhpcyBtZXRob2QgaXMgY2FsbGVkIGZyb20gdGhlXG4gICAgIyBWTiBNYWtlciBTY2VuZS1FZGl0b3IgaWYgbGl2ZS1wcmV2aWV3IGlzIGVuYWJsZWQgYW5kIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBjb21tYW5kLlxuICAgICNcbiAgICAjIEBtZXRob2QgcHJldmlld1xuICAgICMjI1xuICAgIHByZXZpZXc6IC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgICAgcmV0dXJuIGlmICEkUEFSQU1TLnByZXZpZXcgb3IgISRQQVJBTVMucHJldmlldy5zY2VuZVxuICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxTb3VuZHMoKVxuICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygpXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc3RvcEFsbFZvaWNlcygpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmNob2ljZXMgPSBbXVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dXBDdXJzb3IoKVxuICAgICAgICAgICAgQHByZXZpZXdEYXRhID0gJFBBUkFNUy5wcmV2aWV3XG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdSZXN0YXJ0XCIpXG4gICAgICAgICAgICBpZiBAcHJldmlld0luZm8udGltZW91dFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChAcHJldmlld0luZm8udGltZW91dClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLnN0b3BwZWRcbiAgICAgICAgICAgICAgICBHcmFwaGljcy5zdG9wcGVkID0gbm9cbiAgICAgICAgICAgICAgICBHcmFwaGljcy5vbkVhY2hGcmFtZShncy5NYWluLmZyYW1lQ2FsbGJhY2spXG4gICAgICAgICAgIFxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKCkgXG4gICAgICAgIFxuICAgICAgICAgICAgc2NlbmUuc2NlbmVEYXRhLnVpZCA9IEBwcmV2aWV3RGF0YS5zY2VuZS51aWQgICAgXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUpXG4gICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZXgpXG4gICAgXG4gICAgIyMjKlxuICAgICMgU2V0cyB1cCB0aGUgaW50ZXJwcmV0ZXIuXG4gICAgI1xuICAgICMgQG1ldGhvZCBzZXR1cFxuICAgICMjIyAgICBcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQHByZXZpZXdEYXRhID0gJFBBUkFNUy5wcmV2aWV3XG4gICAgICAgIGlmIEBwcmV2aWV3RGF0YVxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VEb3duXCIsICg9PlxuICAgICAgICAgICAgICAgIGlmIEBwcmV2aWV3SW5mby53YWl0aW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIEBwcmV2aWV3SW5mby50aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoQHByZXZpZXdJbmZvLnRpbWVvdXQpXG4gICAgICAgICAgICAgICAgICAgIEBwcmV2aWV3SW5mby53YWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICAgICAgI0Bpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBwcmV2aWV3RGF0YSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJwcmV2aWV3UmVzdGFydFwiKVxuICAgICAgICAgICAgICAgICksIG51bGwsIEBvYmplY3RcbiAgICAgXG4gICAgIyMjKlxuICAgICMgRGlzcG9zZXMgdGhlIGludGVycHJldGVyLlxuICAgICNcbiAgICAjIEBtZXRob2QgZGlzcG9zZVxuICAgICMjIyAgICAgICBcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBpZiBAcHJldmlld0RhdGFcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VEb3duXCIsIEBvYmplY3QpXG4gICAgICAgICBcbiAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgIFxuICAgICBcbiAgICBpc0luc3RhbnRTa2lwOiAtPiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID09IDAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgaW50ZXJwcmV0ZXIgZnJvbSBhIGRhdGEtYnVuZGxlXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYnVuZGxlLSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjICAgICBcbiAgICByZXN0b3JlOiAtPlxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgZGVmYXVsdCBnYW1lIG1lc3NhZ2UgZm9yIG5vdmVsLW1vZGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBtZXNzYWdlT2JqZWN0TlZMXG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfTWVzc2FnZX0gVGhlIE5WTCBnYW1lIG1lc3NhZ2Ugb2JqZWN0LlxuICAgICMjIyAgICAgICAgICAgXG4gICAgbWVzc2FnZU9iamVjdE5WTDogLT4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgZGVmYXVsdCBnYW1lIG1lc3NhZ2UgZm9yIGFkdmVudHVyZS1tb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZU9iamVjdEFEVlxuICAgICogQHJldHVybiB7dWkuT2JqZWN0X01lc3NhZ2V9IFRoZSBBRFYgZ2FtZSBtZXNzYWdlIG9iamVjdC5cbiAgICAjIyMgICAgICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3RBRFY6IC0+IFxuICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImdhbWVNZXNzYWdlX21lc3NhZ2VcIilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIGludGVycHJldGVyXG4gICAgKlxuICAgICogQG1ldGhvZCBzdGFydFxuICAgICMjIyAgIFxuICAgIHN0YXJ0OiAtPlxuICAgICAgICBAY29uZGl0aW9ucyA9IFtdXG4gICAgICAgIEBsb29wcyA9IFtdXG4gICAgICAgIEBpbmRlbnQgPSAwXG4gICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICBAaXNSdW5uaW5nID0geWVzXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTdG9wcyB0aGUgaW50ZXJwcmV0ZXJcbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BcbiAgICAjIyMgICBcbiAgICBzdG9wOiAtPlxuICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdW1lcyB0aGUgaW50ZXJwcmV0ZXJcbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3VtZVxuICAgICMjIyAgXG4gICAgcmVzdW1lOiAtPlxuICAgICAgICBAaXNSdW5uaW5nID0geWVzICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgaW50ZXJwcmV0ZXIgYW5kIGV4ZWN1dGVzIGFsbCBjb21tYW5kcyB1bnRpbCB0aGUgbmV4dCB3YWl0IGlzIFxuICAgICogdHJpZ2dlcmVkIGJ5IGEgY29tbWFuZC4gU28gaW4gdGhlIGNhc2Ugb2YgYW4gZW5kbGVzcy1sb29wIHRoZSBtZXRob2Qgd2lsbCBcbiAgICAqIG5ldmVyIHJldHVybi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyAgICAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgaWYgQHN1YkludGVycHJldGVyP1xuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnVwZGF0ZSgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBjb250ZXh0KVxuICAgICAgICBcbiAgICAgICAgaWYgKG5vdCBAb2JqZWN0LmNvbW1hbmRzPyBvciBAcG9pbnRlciA+PSBAb2JqZWN0LmNvbW1hbmRzLmxlbmd0aCkgYW5kIG5vdCBAaXNXYWl0aW5nXG4gICAgICAgICAgICBpZiBAcmVwZWF0XG4gICAgICAgICAgICAgICAgQHN0YXJ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgQGlzUnVubmluZ1xuICAgICAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgICAgIGlmIEBvbkZpbmlzaD8gdGhlbiBAb25GaW5pc2godGhpcylcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgQGlzUnVubmluZyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBvYmplY3QuY29tbWFuZHMub3B0aW1pemVkXG4gICAgICAgICAgICBEYXRhT3B0aW1pemVyLm9wdGltaXplRXZlbnRDb21tYW5kcyhAb2JqZWN0LmNvbW1hbmRzKVxuXG4gICAgICAgIGlmIEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIEB3YWl0Q291bnRlci0tXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gQHdhaXRDb3VudGVyID4gMFxuICAgICAgICAgICAgcmV0dXJuICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQGlzV2FpdGluZ0Zvck1lc3NhZ2VcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIGlmIG5vdCBAaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0KClcbiAgICAgICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICBAaXNXYWl0aW5nRm9yTWVzc2FnZSA9IG5vXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgIHdoaWxlIG5vdCAoQGlzV2FpdGluZyBvciBAcHJldmlld0luZm8ud2FpdGluZykgYW5kIEBwb2ludGVyIDwgQG9iamVjdC5jb21tYW5kcy5sZW5ndGggYW5kIEBpc1J1bm5pbmdcbiAgICAgICAgICAgICAgICBAZXhlY3V0ZUNvbW1hbmQoQHBvaW50ZXIpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwcmV2aWV3SW5mby5leGVjdXRlZENvbW1hbmRzKytcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAcHJldmlld0luZm8uZXhlY3V0ZWRDb21tYW5kcyA+IDUwMFxuICAgICAgICAgICAgICAgICAgICBAcHJldmlld0luZm8uZXhlY3V0ZWRDb21tYW5kcyA9IDBcbiAgICAgICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgICAgICBAd2FpdENvdW50ZXIgPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdoaWxlIG5vdCAoQGlzV2FpdGluZyBvciBAcHJldmlld0luZm8ud2FpdGluZykgYW5kIEBwb2ludGVyIDwgQG9iamVjdC5jb21tYW5kcy5sZW5ndGggYW5kIEBpc1J1bm5pbmdcbiAgICAgICAgICAgICAgICBAZXhlY3V0ZUNvbW1hbmQoQHBvaW50ZXIpXG4gICAgIFxuICAgICAgICAgIFxuICAgICAgICBpZiBAcG9pbnRlciA+PSBAb2JqZWN0LmNvbW1hbmRzLmxlbmd0aCBhbmQgbm90IEBpc1dhaXRpbmdcbiAgICAgICAgICAgIGlmIEByZXBlYXRcbiAgICAgICAgICAgICAgICBAc3RhcnQoKVxuICAgICAgICAgICAgZWxzZSBpZiBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgICAgICAgICAgaWYgQG9uRmluaXNoPyB0aGVuIEBvbkZpbmlzaCh0aGlzKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBc3NpZ25zIHRoZSBjb3JyZWN0IGNvbW1hbmQtZnVuY3Rpb24gdG8gdGhlIHNwZWNpZmllZCBjb21tYW5kLW9iamVjdCBpZiBcbiAgICAqIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFzc2lnbkNvbW1hbmRcbiAgICAjIyMgICAgICBcbiAgICBhc3NpZ25Db21tYW5kOiAoY29tbWFuZCkgLT5cbiAgICAgICAgc3dpdGNoIGNvbW1hbmQuaWRcbiAgICAgICAgICAgIHdoZW4gXCJncy5JZGxlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZElkbGVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TdGFydFRpbWVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFN0YXJ0VGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5QYXVzZVRpbWVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBhdXNlVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5SZXN1bWVUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXN1bWVUaW1lclxuICAgICAgICAgICAgd2hlbiBcImdzLlN0b3BUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTdG9wVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5XYWl0Q29tbWFuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRXYWl0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTG9vcENvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTG9vcFxuICAgICAgICAgICAgd2hlbiBcImdzLkJyZWFrTG9vcENvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQnJlYWtMb29wXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29tbWVudFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gLT4gMFxuICAgICAgICAgICAgd2hlbiBcImdzLkVtcHR5Q29tbWFuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gLT4gMFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RBZGRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdEFkZFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RQb3BcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFBvcFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RTaGlmdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0U2hpZnRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0UmVtb3ZlQXRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFJlbW92ZUF0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEluc2VydEF0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RJbnNlcnRBdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RWYWx1ZUF0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RWYWx1ZUF0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdENsZWFyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RDbGVhclxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RTaHVmZmxlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RTaHVmZmxlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdFNvcnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFNvcnRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0SW5kZXhPZlwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0SW5kZXhPZlxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RTZXRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFNldFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RDb3B5XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RDb3B5XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdExlbmd0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0TGVuZ3RoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEpvaW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdEpvaW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0RnJvbVRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdEZyb21UZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVzZXRWYXJpYWJsZXNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzZXRWYXJpYWJsZXNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VWYXJpYWJsZURvbWFpblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VWYXJpYWJsZURvbWFpblxuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZU51bWJlclZhcmlhYmxlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VOdW1iZXJWYXJpYWJsZXNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VEZWNpbWFsVmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZURlY2ltYWxWYXJpYWJsZXNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VCb29sZWFuVmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VTdHJpbmdWYXJpYWJsZXNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlU3RyaW5nVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hlY2tTd2l0Y2hcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hlY2tTd2l0Y2hcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGVja051bWJlclZhcmlhYmxlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoZWNrTnVtYmVyVmFyaWFibGVcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGVja1RleHRWYXJpYWJsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGVja1RleHRWYXJpYWJsZVxuICAgICAgICAgICAgd2hlbiBcImdzLkNvbmRpdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDb25kaXRpb25cbiAgICAgICAgICAgIHdoZW4gXCJncy5Db25kaXRpb25FbHNlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENvbmRpdGlvbkVsc2VcbiAgICAgICAgICAgIHdoZW4gXCJncy5Db25kaXRpb25FbHNlSWZcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ29uZGl0aW9uRWxzZUlmXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGFiZWxcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGFiZWxcbiAgICAgICAgICAgIHdoZW4gXCJncy5KdW1wVG9MYWJlbFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRKdW1wVG9MYWJlbFxuICAgICAgICAgICAgd2hlbiBcImdzLlNldE1lc3NhZ2VBcmVhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNldE1lc3NhZ2VBcmVhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd01lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd01lc3NhZ2VcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaG93UGFydGlhbE1lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd1BhcnRpYWxNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWVzc2FnZUZhZGluZ1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlRmFkaW5nXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWVzc2FnZVNldHRpbmdzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1lc3NhZ2VTZXR0aW5nc1xuICAgICAgICAgICAgd2hlbiBcImdzLkNyZWF0ZU1lc3NhZ2VBcmVhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENyZWF0ZU1lc3NhZ2VBcmVhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRXJhc2VNZXNzYWdlQXJlYVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZU1lc3NhZ2VBcmVhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2V0VGFyZ2V0TWVzc2FnZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRUYXJnZXRNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwidm4uTWVzc2FnZUJveERlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1lc3NhZ2VCb3hEZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcInZuLk1lc3NhZ2VCb3hWaXNpYmlsaXR5XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1lc3NhZ2VCb3hWaXNpYmlsaXR5XG4gICAgICAgICAgICB3aGVuIFwidm4uTWVzc2FnZVZpc2liaWxpdHlcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWVzc2FnZVZpc2liaWxpdHlcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CYWNrbG9nVmlzaWJpbGl0eVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCYWNrbG9nVmlzaWJpbGl0eVxuICAgICAgICAgICAgd2hlbiBcImdzLkNsZWFyTWVzc2FnZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDbGVhck1lc3NhZ2VcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VXZWF0aGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVdlYXRoZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5GcmVlemVTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRnJlZXplU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2NyZWVuVHJhbnNpdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JlZW5UcmFuc2l0aW9uXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hha2VTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hha2VTY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5UaW50U2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFRpbnRTY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5GbGFzaFNjcmVlblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRGbGFzaFNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlpvb21TY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbVNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlJvdGF0ZVNjcmVlblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSb3RhdGVTY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5QYW5TY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGFuU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2NyZWVuRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNjcmVlbkVmZmVjdFxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93VmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVZpZGVvUGF0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlVmlkZW9QYXRoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGludFZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFRpbnRWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLkZsYXNoVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLkNyb3BWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDcm9wVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSb3RhdGVWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlpvb21WaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5CbGVuZFZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJsZW5kVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5NYXNrVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWFza1ZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVmlkZW9FZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVmlkZW9FZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5WaWRlb01vdGlvbkJsdXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVmlkZW9EZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRWaWRlb0RlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRXJhc2VWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZVZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd0ltYWdlTWFwXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dJbWFnZU1hcFxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlSW1hZ2VNYXBcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VJbWFnZU1hcFxuICAgICAgICAgICAgd2hlbiBcImdzLkFkZEhvdHNwb3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQWRkSG90c3BvdFxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlSG90c3BvdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZUhvdHNwb3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VIb3RzcG90U3RhdGVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlSG90c3BvdFN0YXRlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1BpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd1BpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVQaWN0dXJlUGF0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlUGljdHVyZVBhdGhcbiAgICAgICAgICAgIHdoZW4gXCJncy5UaW50UGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50UGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLkZsYXNoUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRGbGFzaFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Dcm9wUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDcm9wUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLlJvdGF0ZVBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLlpvb21QaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21QaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQmxlbmRQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJsZW5kUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLlNoYWtlUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaGFrZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5NYXNrUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNYXNrUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLlBpY3R1cmVFZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGljdHVyZUVmZmVjdFxuICAgICAgICAgICAgd2hlbiBcImdzLlBpY3R1cmVNb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBpY3R1cmVNb3Rpb25CbHVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGljdHVyZURlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBpY3R1cmVEZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlQaWN0dXJlQW5pbWF0aW9uXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBsYXlQaWN0dXJlQW5pbWF0aW9uXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRXJhc2VQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEVyYXNlUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLklucHV0TnVtYmVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZElucHV0TnVtYmVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hvaWNlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dDaG9pY2VcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaG9pY2VUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaG9pY2VUaW1lclxuICAgICAgICAgICAgd2hlbiBcInZuLlNob3dDaG9pY2VzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dDaG9pY2VzXG4gICAgICAgICAgICB3aGVuIFwidm4uVW5sb2NrQ0dcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVW5sb2NrQ0dcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRKb2luU2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJESm9pblNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJERXhpdFNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyREV4aXRTY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLkwyRE1vdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRNb3Rpb25cbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRNb3Rpb25Hcm91cFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRNb3Rpb25Hcm91cFxuICAgICAgICAgICAgd2hlbiBcInZuLkwyREV4cHJlc3Npb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJERXhwcmVzc2lvblxuICAgICAgICAgICAgd2hlbiBcInZuLkwyRE1vdmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJETW92ZVxuICAgICAgICAgICAgd2hlbiBcInZuLkwyRFBhcmFtZXRlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRQYXJhbWV0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRTZXR0aW5nc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRTZXR0aW5nc1xuICAgICAgICAgICAgd2hlbiBcInZuLkwyRERlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRERlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVySm9pblNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckpvaW5TY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckV4aXRTY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJFeGl0U2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJDaGFuZ2VFeHByZXNzaW9uXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckNoYW5nZUV4cHJlc3Npb25cbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJTZXRQYXJhbWV0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyU2V0UGFyYW1ldGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyR2V0UGFyYW1ldGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckdldFBhcmFtZXRlclxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckRlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckRlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckVmZmVjdFxuICAgICAgICAgICAgd2hlbiBcInZuLlpvb21DaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbUNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLlJvdGF0ZUNoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSb3RhdGVDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CbGVuZENoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZENoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLlNoYWtlQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNoYWtlQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uTWFza0NoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNYXNrQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uTW92ZUNoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uTW92ZUNoYXJhY3RlclBhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZUNoYXJhY3RlclBhdGhcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5GbGFzaENoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRGbGFzaENoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLlRpbnRDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGludENoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3Rlck1vdGlvbkJsdXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYW5nZUJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLlNoYWtlQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaGFrZUJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TY3JvbGxCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNjcm9sbEJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TY3JvbGxCYWNrZ3JvdW5kVG9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFRvXG4gICAgICAgICAgICB3aGVuIFwidm4uU2Nyb2xsQmFja2dyb3VuZFBhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFBhdGhcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5ab29tQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLlJvdGF0ZUJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLlRpbnRCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFRpbnRCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uQmxlbmRCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJsZW5kQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLk1hc2tCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1hc2tCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uQmFja2dyb3VuZE1vdGlvbkJsdXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmFja2dyb3VuZE1vdGlvbkJsdXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CYWNrZ3JvdW5kRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJhY2tncm91bmRFZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CYWNrZ3JvdW5kRGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmFja2dyb3VuZERlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhbmdlU2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlU2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5SZXR1cm5Ub1ByZXZpb3VzU2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmV0dXJuVG9QcmV2aW91c1NjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2FsbFNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENhbGxTY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLlN3aXRjaFRvTGF5b3V0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFN3aXRjaFRvTGF5b3V0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVHJhbnNpdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VUcmFuc2l0aW9uXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlV2luZG93U2tpblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VXaW5kb3dTa2luXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlU2NyZWVuVHJhbnNpdGlvbnNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlU2NyZWVuVHJhbnNpdGlvbnNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5VSUFjY2Vzc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRVSUFjY2Vzc1xuICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQbGF5VmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5TXVzaWNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGxheU11c2ljXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU3RvcE11c2ljXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFN0b3BNdXNpY1xuICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlTb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQbGF5U291bmRcbiAgICAgICAgICAgIHdoZW4gXCJncy5TdG9wU291bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU3RvcFNvdW5kXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGF1c2VNdXNpY1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQYXVzZU11c2ljXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVzdW1lTXVzaWNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzdW1lTXVzaWNcbiAgICAgICAgICAgIHdoZW4gXCJncy5BdWRpb0RlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEF1ZGlvRGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJncy5FbmRDb21tb25FdmVudFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFbmRDb21tb25FdmVudFxuICAgICAgICAgICAgd2hlbiBcImdzLlJlc3VtZUNvbW1vbkV2ZW50XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJlc3VtZUNvbW1vbkV2ZW50XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2FsbENvbW1vbkV2ZW50XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENhbGxDb21tb25FdmVudFxuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVRpbWVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1RleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd1RleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5SZWZyZXNoVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZWZyZXNoVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlRleHRNb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFRleHRNb3Rpb25CbHVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlVGV4dFBhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVRleHRQYXRoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUm90YXRlVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSb3RhdGVUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuWm9vbVRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbVRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5CbGVuZFRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmxlbmRUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29sb3JUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENvbG9yVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZVRleHQgXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGV4dEVmZmVjdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUZXh0RWZmZWN0IFxuICAgICAgICAgICAgd2hlbiBcImdzLlRleHREZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUZXh0RGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VUZXh0U2V0dGluZ3NcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVGV4dFNldHRpbmdzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSW5wdXRUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZElucHV0VGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLklucHV0TmFtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJbnB1dE5hbWVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TYXZlUGVyc2lzdGVudERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2F2ZVBlcnNpc3RlbnREYXRhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2F2ZVNldHRpbmdzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNhdmVTZXR0aW5nc1xuICAgICAgICAgICAgd2hlbiBcImdzLlByZXBhcmVTYXZlR2FtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQcmVwYXJlU2F2ZUdhbWVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TYXZlR2FtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTYXZlR2FtZVxuICAgICAgICAgICAgd2hlbiBcImdzLkxvYWRHYW1lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExvYWRHYW1lXG4gICAgICAgICAgICB3aGVuIFwiZ3MuR2V0SW5wdXREYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEdldElucHV0RGF0YVxuICAgICAgICAgICAgd2hlbiBcImdzLldhaXRGb3JJbnB1dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRXYWl0Rm9ySW5wdXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VPYmplY3REb21haW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlT2JqZWN0RG9tYWluXG4gICAgICAgICAgICB3aGVuIFwidm4uR2V0R2FtZURhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kR2V0R2FtZURhdGFcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TZXRHYW1lRGF0YVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRHYW1lRGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLkdldE9iamVjdERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kR2V0T2JqZWN0RGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLlNldE9iamVjdERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2V0T2JqZWN0RGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYW5nZVNvdW5kc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VTb3VuZHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VDb2xvcnNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlQ29sb3JzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlU2NyZWVuQ3Vyc29yXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVNjcmVlbkN1cnNvclxuICAgICAgICAgICAgd2hlbiBcImdzLlJlc2V0R2xvYmFsRGF0YVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXNldEdsb2JhbERhdGFcbiAgICAgICAgICAgIHdoZW4gXCJncy5TY3JpcHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2NyaXB0XG4gICAgXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgdGhlIGNvbW1hbmQgYXQgdGhlIHNwZWNpZmllZCBpbmRleCBhbmQgaW5jcmVhc2VzIHRoZSBjb21tYW5kLXBvaW50ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQ29tbWFuZFxuICAgICMjIyAgICAgICBcbiAgICBleGVjdXRlQ29tbWFuZDogKGluZGV4KSAtPlxuICAgICAgICBAY29tbWFuZCA9IEBvYmplY3QuY29tbWFuZHNbaW5kZXhdXG5cbiAgICAgICAgaWYgQHByZXZpZXdEYXRhXG4gICAgICAgICAgICBpZiBAcG9pbnRlciA8IEBwcmV2aWV3RGF0YS5wb2ludGVyXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSB5ZXNcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPSAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBAcHJldmlld0RhdGEuc2V0dGluZ3MuYW5pbWF0aW9uRGlzYWJsZWRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPSAwXG4gICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLndhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdXYWl0aW5nXCIpXG4gICAgICAgICAgICAgICAgaWYgQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvbkRpc2FibGVkIG9yIEBwcmV2aWV3RGF0YS5zZXR0aW5ncy5hbmltYXRpb25UaW1lID4gMFxuICAgICAgICAgICAgICAgICAgICBAcHJldmlld0luZm8udGltZW91dCA9IHNldFRpbWVvdXQgKC0+IEdyYXBoaWNzLnN0b3BwZWQgPSB5ZXMpLCAoQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvblRpbWUpKjEwMDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgQGNvbW1hbmQuZXhlY3V0ZT9cbiAgICAgICAgICAgIEBjb21tYW5kLmludGVycHJldGVyID0gdGhpc1xuICAgICAgICAgICAgQGNvbW1hbmQuZXhlY3V0ZSgpIGlmIEBjb21tYW5kLmluZGVudCA9PSBAaW5kZW50XG4gICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBjb21tYW5kID0gQG9iamVjdC5jb21tYW5kc1tAcG9pbnRlcl1cbiAgICAgICAgICAgIGlmIEBjb21tYW5kP1xuICAgICAgICAgICAgICAgIGluZGVudCA9IEBjb21tYW5kLmluZGVudFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGluZGVudCA9IEBpbmRlbnRcbiAgICAgICAgICAgICAgICB3aGlsZSBpbmRlbnQgPiAwIGFuZCAobm90IEBsb29wc1tpbmRlbnRdPylcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50LS1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBpbmRlbnQgPCBAaW5kZW50XG4gICAgICAgICAgICAgICAgQGluZGVudCA9IGluZGVudFxuICAgICAgICAgICAgICAgIGlmIEBsb29wc1tAaW5kZW50XT9cbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBAbG9vcHNbQGluZGVudF1cbiAgICAgICAgICAgICAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXVxuICAgICAgICAgICAgICAgICAgICBAY29tbWFuZC5pbnRlcnByZXRlciA9IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGFzc2lnbkNvbW1hbmQoQGNvbW1hbmQpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAY29tbWFuZC5leGVjdXRlP1xuICAgICAgICAgICAgICAgIEBjb21tYW5kLmludGVycHJldGVyID0gdGhpc1xuICAgICAgICAgICAgICAgIEBjb21tYW5kLmV4ZWN1dGUoKSBpZiBAY29tbWFuZC5pbmRlbnQgPT0gQGluZGVudFxuICAgICAgICAgICAgICAgIEBwb2ludGVyKytcbiAgICAgICAgICAgICAgICBAY29tbWFuZCA9IEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdXG4gICAgICAgICAgICAgICAgaWYgQGNvbW1hbmQ/XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCA9IEBjb21tYW5kLmluZGVudFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gQGluZGVudFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBpbmRlbnQgPiAwIGFuZCAobm90IEBsb29wc1tpbmRlbnRdPylcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudC0tXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBpbmRlbnQgPCBAaW5kZW50XG4gICAgICAgICAgICAgICAgICAgIEBpbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgICAgICAgICAgICAgaWYgQGxvb3BzW0BpbmRlbnRdP1xuICAgICAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBAbG9vcHNbQGluZGVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb21tYW5kID0gQG9iamVjdC5jb21tYW5kc1tAcG9pbnRlcl1cbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb21tYW5kLmludGVycHJldGVyID0gdGhpc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwb2ludGVyKytcbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgY29tbWFuZHMgdW50aWwgYSBjb21tYW5kIHdpdGggdGhlIHNwZWNpZmllZCBpbmRlbnQtbGV2ZWwgaXMgXG4gICAgKiBmb3VuZC4gU28gZm9yIGV4YW1wbGU6IFRvIGp1bXAgZnJvbSBhIENvbmRpdGlvbi1Db21tYW5kIHRvIHRoZSBuZXh0XG4gICAgKiBFbHNlLUNvbW1hbmQganVzdCBwYXNzIHRoZSBpbmRlbnQtbGV2ZWwgb2YgdGhlIENvbmRpdGlvbi9FbHNlIGNvbW1hbmQuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZW50IC0gVGhlIGluZGVudC1sZXZlbC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYmFja3dhcmQgLSBJZiB0cnVlIHRoZSBza2lwIHJ1bnMgYmFja3dhcmQuXG4gICAgIyMjICAgXG4gICAgc2tpcDogKGluZGVudCwgYmFja3dhcmQpIC0+XG4gICAgICAgIGlmIGJhY2t3YXJkXG4gICAgICAgICAgICBAcG9pbnRlci0tXG4gICAgICAgICAgICB3aGlsZSBAcG9pbnRlciA+IDAgYW5kIEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdLmluZGVudCAhPSBpbmRlbnRcbiAgICAgICAgICAgICAgICBAcG9pbnRlci0tXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb2ludGVyKytcbiAgICAgICAgICAgIHdoaWxlIEBwb2ludGVyIDwgQG9iamVjdC5jb21tYW5kcy5sZW5ndGggYW5kIEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdLmluZGVudCAhPSBpbmRlbnRcbiAgICAgICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgXG4gICAgIyMjKlxuICAgICogSGFsdHMgdGhlIGludGVycHJldGVyIGZvciB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiB0aW1lLiBBbiBvcHRpb25hbGx5XG4gICAgKiBjYWxsYmFjayBmdW5jdGlvbiBjYW4gYmUgcGFzc2VkIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSB0aW1lIGlzIHVwLlxuICAgICpcbiAgICAqIEBtZXRob2Qgd2FpdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSBUaGUgdGltZSB0byB3YWl0XG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIENhbGxlZCBpZiB0aGUgd2FpdCB0aW1lIGlzIHVwLlxuICAgICMjIyAgXG4gICAgd2FpdDogKHRpbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgIEB3YWl0Q291bnRlciA9IHRpbWVcbiAgICAgICAgQHdhaXRDYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBpZiB0aGUgY29tbWFuZCBhdCB0aGUgc3BlY2lmaWVkIHBvaW50ZXItaW5kZXggaXMgYSBnYW1lIG1lc3NhZ2VcbiAgICAqIHJlbGF0ZWQgY29tbWFuZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGlzTWVzc2FnZUNvbW1hbmRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludGVyIC0gVGhlIHBvaW50ZXIvaW5kZXguXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSBjb21tYW5kcyAtIFRoZSBsaXN0IG9mIGNvbW1hbmRzIHRvIGNoZWNrLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gPGI+dHJ1ZTwvYj4gaWYgaXRzIGEgZ2FtZSBtZXNzYWdlIHJlbGF0ZWQgY29tbWFuZC4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPi5cbiAgICAjIyMgXG4gICAgaXNNZXNzYWdlQ29tbWFuZDogKHBvaW50ZXIsIGNvbW1hbmRzKSAtPlxuICAgICAgICByZXN1bHQgPSB5ZXNcbiAgICAgICAgaWYgcG9pbnRlciA+PSBjb21tYW5kcy5sZW5ndGggb3IgKGNvbW1hbmRzW3BvaW50ZXJdLmlkICE9IFwiZ3MuSW5wdXROdW1iZXJcIiBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkICE9IFwidm4uQ2hvaWNlXCIgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCAhPSBcImdzLklucHV0VGV4dFwiIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZHNbcG9pbnRlcl0uaWQgIT0gXCJncy5JbnB1dE5hbWVcIilcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBub1xuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIHRoZSBjb21tYW5kIGF0IHRoZSBzcGVjaWZpZWQgcG9pbnRlci1pbmRleCBhc2tzIGZvciB1c2VyLWlucHV0IGxpa2VcbiAgICAqIHRoZSBJbnB1dCBOdW1iZXIgb3IgSW5wdXQgVGV4dCBjb21tYW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNJbnB1dERhdGFDb21tYW5kXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRlciAtIFRoZSBwb2ludGVyL2luZGV4LlxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gY29tbWFuZHMgLSBUaGUgbGlzdCBvZiBjb21tYW5kcyB0byBjaGVjay5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGlmIGl0cyBhbiBpbnB1dC1kYXRhIGNvbW1hbmQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyMgICAgIFxuICAgIGlzSW5wdXREYXRhQ29tbWFuZDogKHBvaW50ZXIsIGNvbW1hbmRzKSAtPlxuICAgICAgICBwb2ludGVyIDwgY29tbWFuZHMubGVuZ3RoIGFuZCAoXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcImdzLklucHV0TnVtYmVyXCIgb3JcbiAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkID09IFwiZ3MuSW5wdXRUZXh0XCIgb3JcbiAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkID09IFwidm4uQ2hvaWNlXCIgb3JcbiAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkID09IFwidm4uU2hvd0Nob2ljZXNcIlxuICAgICAgICApXG4gICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBpZiBhIGdhbWUgbWVzc2FnZSBpcyBjdXJyZW50bHkgcnVubmluZyBieSBhbm90aGVyIGludGVycHJldGVyIGxpa2UgYVxuICAgICogY29tbW9uLWV2ZW50IGludGVycHJldGVyLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0XG4gICAgKiBAcmV0dXJuIHtib29sZWFufSA8Yj50cnVlPC9iPiBhIGdhbWUgbWVzc2FnZSBpcyBydW5uaW5nIGluIGFub3RoZXIgY29udGV4dC4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPlxuICAgICMjIyAgICAgXG4gICAgaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0OiAtPlxuICAgICAgICByZXN1bHQgPSBub1xuICAgICAgICBnbSA9IEdhbWVNYW5hZ2VyXG4gICAgICAgIHMgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICAgICAgIChzLmlucHV0TnVtYmVyV2luZG93PyBhbmQgcy5pbnB1dE51bWJlcldpbmRvdy52aXNpYmxlIGFuZCBzLmlucHV0TnVtYmVyV2luZG93LmV4ZWN1dGlvbkNvbnRleHQgIT0gQGNvbnRleHQpIG9yXG4gICAgICAgICAgICAgICAgIChzLmlucHV0VGV4dFdpbmRvdz8gYW5kIHMuaW5wdXRUZXh0V2luZG93LmFjdGl2ZSBhbmQgcy5pbnB1dFRleHRXaW5kb3cuZXhlY3V0aW9uQ29udGV4dCAhPSBAY29udGV4dClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBJZiBhIGdhbWUgbWVzc2FnZSBpcyBjdXJyZW50bHkgcnVubmluZyBieSBhbiBvdGhlciBpbnRlcnByZXRlciBsaWtlIGEgY29tbW9uLWV2ZW50XG4gICAgKiBpbnRlcnByZXRlciwgdGhpcyBtZXRob2QgdHJpZ2dlciBhIHdhaXQgdW50aWwgdGhlIG90aGVyIGludGVycHJldGVyIGlzIGZpbmlzaGVkXG4gICAgKiB3aXRoIHRoZSBnYW1lIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCB3YWl0Rm9yTWVzc2FnZVxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gPGI+dHJ1ZTwvYj4gYSBnYW1lIG1lc3NhZ2UgaXMgcnVubmluZyBpbiBhbm90aGVyIGNvbnRleHQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyMgICAgICAgXG4gICAgd2FpdEZvck1lc3NhZ2U6IC0+XG4gICAgICAgIEBpc1dhaXRpbmdGb3JNZXNzYWdlID0geWVzXG4gICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgQHBvaW50ZXItLVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIHRoZSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlJ3Mgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgICAgIFxuICAgIG51bWJlclZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4KVxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgKHBvc3NpYmxlKSBudW1iZXIgdmFyaWFibGUuIElmIGEgY29uc3RhbnQgbnVtYmVyIHZhbHVlIGlzIHNwZWNpZmllZCwgdGhpcyBtZXRob2RcbiAgICAqIGRvZXMgbm90aGluZyBhbiBqdXN0IHJldHVybnMgdGhhdCBjb25zdGFudCB2YWx1ZS4gVGhhdCdzIHRvIG1ha2UgaXQgbW9yZSBjb21mb3J0YWJsZSB0byBqdXN0IHBhc3MgYSB2YWx1ZSB3aGljaFxuICAgICogY2FuIGJlIGNhbGN1bGF0ZWQgYnkgdmFyaWFibGUgYnV0IGFsc28gYmUganVzdCBhIGNvbnN0YW50IHZhbHVlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbnVtYmVyVmFsdWVPZlxuICAgICogQHBhcmFtIHtudW1iZXJ8T2JqZWN0fSBvYmplY3QgLSBBIG51bWJlciB2YXJpYWJsZSBvciBjb25zdGFudCBudW1iZXIgdmFsdWUuXG4gICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBudW1iZXJWYWx1ZU9mOiAob2JqZWN0KSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLm51bWJlclZhbHVlT2Yob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIEl0IGRvZXMgdGhlIHNhbWUgbGlrZSA8Yj5udW1iZXJWYWx1ZU9mPC9iPiB3aXRoIG9uZSBkaWZmZXJlbmNlOiBJZiB0aGUgc3BlY2lmaWVkIG9iamVjdFxuICAgICogaXMgYSB2YXJpYWJsZSwgaXQncyB2YWx1ZSBpcyBjb25zaWRlcmVkIGFzIGEgZHVyYXRpb24tdmFsdWUgaW4gbWlsbGlzZWNvbmRzIGFuZCBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZFxuICAgICogaW50byBmcmFtZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBkdXJhdGlvblZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7bnVtYmVyfE9iamVjdH0gb2JqZWN0IC0gQSBudW1iZXIgdmFyaWFibGUgb3IgY29uc3RhbnQgbnVtYmVyIHZhbHVlLlxuICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgXG4gICAgZHVyYXRpb25WYWx1ZU9mOiAob2JqZWN0KSAtPiBcbiAgICAgICAgaWYgb2JqZWN0IGFuZCBvYmplY3QuaW5kZXg/XG4gICAgICAgICAgICBNYXRoLnJvdW5kKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZihvYmplY3QpIC8gMTAwMCAqIEdyYXBoaWNzLmZyYW1lUmF0ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgTWF0aC5yb3VuZChHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLm51bWJlclZhbHVlT2Yob2JqZWN0KSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyBhIHBvc2l0aW9uICh7eCwgeX0pIGZvciB0aGUgc3BlY2lmaWVkIHByZWRlZmluZWQgb2JqZWN0IHBvc2l0aW9uIGNvbmZpZ3VyZWQgaW4gXG4gICAgKiBEYXRhYmFzZSAtIFN5c3RlbS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZWRlZmluZWRPYmplY3RQb3NpdGlvblxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uIC0gVGhlIGluZGV4L0lEIG9mIHRoZSBwcmVkZWZpbmVkIG9iamVjdCBwb3NpdGlvbiB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gc2V0IHRoZSBwb3NpdGlvbiBmb3IuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gVGhlIHBhcmFtcyBvYmplY3Qgb2YgdGhlIHNjZW5lIGNvbW1hbmQuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBwb3NpdGlvbiB7eCwgeX0uXG4gICAgIyMjXG4gICAgcHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uOiAocG9zaXRpb24sIG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBvYmplY3RQb3NpdGlvbiA9IFJlY29yZE1hbmFnZXIuc3lzdGVtLm9iamVjdFBvc2l0aW9uc1twb3NpdGlvbl1cbiAgICAgICAgaWYgIW9iamVjdFBvc2l0aW9uIHRoZW4gcmV0dXJuIHsgeDogMCwgeTogMCB9XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgb2JqZWN0UG9zaXRpb24uZnVuYz9cbiAgICAgICAgICAgIGYgPSBldmFsKFwiKGZ1bmN0aW9uKG9iamVjdCwgcGFyYW1zKXtcIiArIG9iamVjdFBvc2l0aW9uLnNjcmlwdCArIFwifSlcIilcbiAgICAgICAgICAgIG9iamVjdFBvc2l0aW9uLmZ1bmMgPSBmXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gb2JqZWN0UG9zaXRpb24uZnVuYyhvYmplY3QsIHBhcmFtcykgfHwgeyB4OiAwLCB5OiAwIH1cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlJ3Mgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFRoZSBudW1iZXIgdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXROdW1iZXJWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpbmRleCwgdmFsdWUsIGRvbWFpbilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIG51bWJlciB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlVG9cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBUaGUgbnVtYmVyIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0TnVtYmVyVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXROdW1iZXJWYWx1ZVRvKHZhcmlhYmxlLCB2YWx1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGxpc3QgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRMaXN0T2JqZWN0VG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgLSBUaGUgbGlzdCBvYmplY3QgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRMaXN0T2JqZWN0VG86ICh2YXJpYWJsZSwgdmFsdWUpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0TGlzdE9iamVjdFRvKHZhcmlhYmxlLCB2YWx1ZSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgYm9vbGVhbi9zd2l0Y2ggdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRCb29sZWFuVmFsdWVUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgLSBUaGUgYm9vbGVhbiB2YWx1ZSB0byBzZXQgdGhlIHZhcmlhYmxlIHRvLlxuICAgICMjI1xuICAgIHNldEJvb2xlYW5WYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZVRvKHZhcmlhYmxlLCB2YWx1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIG51bWJlciB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0Qm9vbGVhblZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlJ3Mgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgLSBUaGUgYm9vbGVhbiB2YWx1ZSB0byBzZXQgdGhlIHZhcmlhYmxlIHRvLlxuICAgICMjI1xuICAgIHNldEJvb2xlYW5WYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0Qm9vbGVhblZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzdHJpbmcvdGV4dCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldFN0cmluZ1ZhbHVlVG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgc3RyaW5nL3RleHQgdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRTdHJpbmdWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHZhbHVlKVxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBzdHJpbmcgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldFN0cmluZ1ZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0LlxuICAgICMjIyAgICAgXG4gICAgc2V0U3RyaW5nVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldFN0cmluZ1ZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIChwb3NzaWJsZSkgc3RyaW5nIHZhcmlhYmxlLiBJZiBhIGNvbnN0YW50IHN0cmluZyB2YWx1ZSBpcyBzcGVjaWZpZWQsIHRoaXMgbWV0aG9kXG4gICAgKiBkb2VzIG5vdGhpbmcgYW4ganVzdCByZXR1cm5zIHRoYXQgY29uc3RhbnQgdmFsdWUuIFRoYXQncyB0byBtYWtlIGl0IG1vcmUgY29tZm9ydGFibGUgdG8ganVzdCBwYXNzIGEgdmFsdWUgd2hpY2hcbiAgICAqIGNhbiBiZSBjYWxjdWxhdGVkIGJ5IHZhcmlhYmxlIGJ1dCBhbHNvIGJlIGp1c3QgYSBjb25zdGFudCB2YWx1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1ZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gb2JqZWN0IC0gQSBzdHJpbmcgdmFyaWFibGUgb3IgY29uc3RhbnQgc3RyaW5nIHZhbHVlLlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyBcbiAgICBzdHJpbmdWYWx1ZU9mOiAob2JqZWN0KSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnN0cmluZ1ZhbHVlT2Yob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBzdHJpbmcgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1ZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlJ3Mgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgICAgIFxuICAgIHN0cmluZ1ZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnN0cmluZ1ZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIGRvbWFpbilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIChwb3NzaWJsZSkgYm9vbGVhbiB2YXJpYWJsZS4gSWYgYSBjb25zdGFudCBib29sZWFuIHZhbHVlIGlzIHNwZWNpZmllZCwgdGhpcyBtZXRob2RcbiAgICAqIGRvZXMgbm90aGluZyBhbiBqdXN0IHJldHVybnMgdGhhdCBjb25zdGFudCB2YWx1ZS4gVGhhdCdzIHRvIG1ha2UgaXQgbW9yZSBjb21mb3J0YWJsZSB0byBqdXN0IHBhc3MgYSB2YWx1ZSB3aGljaFxuICAgICogY2FuIGJlIGNhbGN1bGF0ZWQgYnkgdmFyaWFibGUgYnV0IGFsc28gYmUganVzdCBhIGNvbnN0YW50IHZhbHVlLlxuICAgICpcbiAgICAqIEBtZXRob2QgYm9vbGVhblZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxPYmplY3R9IG9iamVjdCAtIEEgYm9vbGVhbiB2YXJpYWJsZSBvciBjb25zdGFudCBib29sZWFuIHZhbHVlLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgXG4gICAgYm9vbGVhblZhbHVlT2Y6IChvYmplY3QpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2Yob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBib29sZWFuIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBib29sZWFuVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUncyBzY29wZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgdmFyaWFibGUgdG8gZ2V0IHRoZSB2YWx1ZSBmcm9tLlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjIyAgICAgXG4gICAgYm9vbGVhblZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCBkb21haW4pXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIGxpc3QgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBsaXN0T2JqZWN0T2ZcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBBIGxpc3QgdmFyaWFibGUuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB2YWx1ZSBvZiB0aGUgbGlzdCB2YXJpYWJsZS5cbiAgICAjIyMgXG4gICAgbGlzdE9iamVjdE9mOiAob2JqZWN0KSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmxpc3RPYmplY3RPZihvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogQ29tcGFyZXMgdHdvIG9iamVjdCB1c2luZyB0aGUgc3BlY2lmaWVkIG9wZXJhdGlvbiBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY29tcGFyZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGEgLSBPYmplY3QgQS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBiIC0gT2JqZWN0IEIuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gb3BlcmF0aW9uIC0gVGhlIGNvbXBhcmUtb3BlcmF0aW9uIHRvIGNvbXBhcmUgT2JqZWN0IEEgd2l0aCBPYmplY3QgQi5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gRXF1YWwgVG88L2xpPlxuICAgICogPGxpPjEgPSBOb3QgRXF1YWwgVG88L2xpPlxuICAgICogPGxpPjIgPSBHcmVhdGVyIFRoYW48L2xpPlxuICAgICogPGxpPjMgPSBHcmVhdGVyIG9yIEVxdWFsIFRvPC9saT5cbiAgICAqIDxsaT40ID0gTGVzcyBUaGFuPC9saT5cbiAgICAqIDxsaT41ID0gTGVzcyBvciBFcXVhbCBUbzwvbGk+XG4gICAgKiA8L3VsPlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGNvbXBhcmlzb24gcmVzdWx0LlxuICAgICMjIyBcbiAgICBjb21wYXJlOiAoYSwgYiwgb3BlcmF0aW9uKSAtPlxuICAgICAgICBzd2l0Y2ggb3BlcmF0aW9uXG4gICAgICAgICAgICB3aGVuIDAgdGhlbiByZXR1cm4gYGEgPT0gYmBcbiAgICAgICAgICAgIHdoZW4gMSB0aGVuIHJldHVybiBgYSAhPSBiYFxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gcmV0dXJuIGEgPiBiXG4gICAgICAgICAgICB3aGVuIDMgdGhlbiByZXR1cm4gYSA+PSBiXG4gICAgICAgICAgICB3aGVuIDQgdGhlbiByZXR1cm4gYSA8IGJcbiAgICAgICAgICAgIHdoZW4gNSB0aGVuIHJldHVybiBhIDw9IGJcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyBudW1iZXIgdmFyaWFibGVzIGFuZCBhbGxvd3MgZGVjaW1hbCB2YWx1ZXMgc3VjaCBhcyAwLjUgdG9vLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlRGVjaW1hbFZhcmlhYmxlc1xuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIElucHV0IHBhcmFtcyBmcm9tIHRoZSBjb21tYW5kXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcm91bmRNZXRob2QgLSBUaGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb24gd2lsbCBiZSByb3VuZGVkIHVzaW5nIHRoZSBzcGVjaWZpZWQgbWV0aG9kLlxuICAgICogPHVsPlxuICAgICogPGxpPjAgPSBOb25lLiBUaGUgcmVzdWx0IHdpbGwgbm90IGJlIHJvdW5kZWQuPC9saT5cbiAgICAqIDxsaT4xID0gQ29tbWVyY2lhbGx5PC9saT5cbiAgICAqIDxsaT4yID0gUm91bmQgVXA8L2xpPlxuICAgICogPGxpPjMgPSBSb3VuZCBEb3duPC9saT5cbiAgICAqIDwvdWw+XG4gICAgIyMjICAgICAgIFxuICAgIGNoYW5nZURlY2ltYWxWYXJpYWJsZXM6IChwYXJhbXMsIHJvdW5kTWV0aG9kKSAtPlxuICAgICAgICBzb3VyY2UgPSAwXG4gICAgICAgIHJvdW5kRnVuYyA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCByb3VuZE1ldGhvZFxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiB2YWx1ZVxuICAgICAgICAgICAgd2hlbiAxIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiBNYXRoLnJvdW5kKHZhbHVlKVxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiBNYXRoLmNlaWwodmFsdWUpXG4gICAgICAgICAgICB3aGVuIDMgdGhlbiByb3VuZEZ1bmMgPSAodmFsdWUpIC0+IE1hdGguZmxvb3IodmFsdWUpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcGFyYW1zLnNvdXJjZVxuICAgICAgICAgICAgd2hlbiAwICMgQ29uc3RhbnQgVmFsdWUgLyBWYXJpYWJsZSBWYWx1ZVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zb3VyY2VWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmRvbVxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnNvdXJjZVJhbmRvbS5zdGFydClcbiAgICAgICAgICAgICAgICBlbmQgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc291cmNlUmFuZG9tLmVuZClcbiAgICAgICAgICAgICAgICBkaWZmID0gZW5kIC0gc3RhcnRcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBNYXRoLmZsb29yKHN0YXJ0ICsgTWF0aC5yYW5kb20oKSAqIChkaWZmKzEpKVxuICAgICAgICAgICAgd2hlbiAyICMgUG9pbnRlclxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnNvdXJjZVNjb3BlLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc291cmNlUmVmZXJlbmNlKS0xLCBwYXJhbXMuc291cmNlUmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgd2hlbiAzICMgR2FtZSBEYXRhXG4gICAgICAgICAgICAgICAgc291cmNlID0gQG51bWJlclZhbHVlT2ZHYW1lRGF0YShwYXJhbXMuc291cmNlVmFsdWUxKVxuICAgICAgICAgICAgd2hlbiA0ICMgRGF0YWJhc2UgRGF0YVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBudW1iZXJWYWx1ZU9mRGF0YWJhc2VEYXRhKHBhcmFtcy5zb3VyY2VWYWx1ZTEpXG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIHBhcmFtcy50YXJnZXRcbiAgICAgICAgICAgIHdoZW4gMCAjIFZhcmlhYmxlXG4gICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyhwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHJvdW5kRnVuYyhzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgKyBzb3VyY2UpIClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgU3ViXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyhwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVPZihwYXJhbXMudGFyZ2V0VmFyaWFibGUpIC0gc291cmNlKSApXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIE11bFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAqIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAvIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNSAjIE1vZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMudGFyZ2V0VmFyaWFibGUpICUgc291cmNlKVxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZ2VcbiAgICAgICAgICAgICAgICBzY29wZSA9IHBhcmFtcy50YXJnZXRTY29wZVxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gcGFyYW1zLnRhcmdldFJhbmdlLnN0YXJ0LTFcbiAgICAgICAgICAgICAgICBlbmQgPSBwYXJhbXMudGFyZ2V0UmFuZ2UuZW5kLTFcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbc3RhcnQuLmVuZF1cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICsgc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFN1YlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAtIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgKiBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpIC8gc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNSAjIE1vZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIEBudW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICUgc291cmNlKVxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMudGFyZ2V0UmVmZXJlbmNlKSAtIDFcbiAgICAgICAgICAgICAgICBzd2l0Y2ggcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKHNvdXJjZSksIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSArIHNvdXJjZSksIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFN1YlxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAtIHNvdXJjZSksIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIE11bFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAqIHNvdXJjZSksIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAvIHNvdXJjZSksIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNSAjIE1vZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAbnVtYmVyVmFsdWVBdEluZGV4KHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pICUgc291cmNlLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTaGFrZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNoYWtlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gc2hha2UuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mbyBhYm91dCB0aGUgc2hha2UtYW5pbWF0aW9uLlxuICAgICMjIyAgICAgICAgXG4gICAgc2hha2VPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBNYXRoLm1heChNYXRoLnJvdW5kKEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKSksIDIpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnNoYWtlKHsgeDogQG51bWJlclZhbHVlT2YocGFyYW1zLnJhbmdlLngpLCB5OiBAbnVtYmVyVmFsdWVPZihwYXJhbXMucmFuZ2UueSkgfSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnNwZWVkKSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIExldHMgdGhlIGludGVycHJldGVyIHdhaXQgZm9yIHRoZSBjb21wbGV0aW9uIG9mIGEgcnVubmluZyBvcGVyYXRpb24gbGlrZSBhbiBhbmltYXRpb24sIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHdhaXRGb3JDb21wbGV0aW9uXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdGhlIG9wZXJhdGlvbiBpcyBleGVjdXRlZCBvbi4gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjICBcbiAgICB3YWl0Rm9yQ29tcGxldGlvbjogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICBcbiAgICAjIyMqXG4gICAgKiBFcmFzZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGVyYXNlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gZXJhc2UuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgICAgICBcbiAgICBlcmFzZU9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihwYXJhbXMuYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoc2VuZGVyKSA9PiBcbiAgICAgICAgICAgIHNlbmRlci5kaXNwb3NlKClcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uIFxuICAgIFxuICAgICMjIypcbiAgICAqIFNob3dzIGEgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd09iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNob3cuXG4gICAgKiBAcGFyYW0ge2dzLlBvaW50fSBwb3NpdGlvbiAtIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgZ2FtZSBvYmplY3Qgc2hvdWxkIGJlIHNob3duLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgICAgICAgICAgXG4gICAgc2hvd09iamVjdDogKG9iamVjdCwgcG9zaXRpb24sIHBhcmFtcykgLT5cbiAgICAgICAgeCA9IEBudW1iZXJWYWx1ZU9mKHBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwb3NpdGlvbi55KVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgIFxuICAgICAgICBvYmplY3QuYW5pbWF0b3IuYXBwZWFyKHgsIHksIHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIFxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgXG4gICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIE1vdmVzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBtb3ZlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gbW92ZS5cbiAgICAqIEBwYXJhbSB7Z3MuUG9pbnR9IHBvc2l0aW9uIC0gVGhlIHBvc2l0aW9uIHRvIG1vdmUgdGhlIGdhbWUgb2JqZWN0IHRvLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgbW92ZU9iamVjdDogKG9iamVjdCwgcG9zaXRpb24sIHBhcmFtcykgLT5cbiAgICAgICAgaWYgcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQHByZWRlZmluZWRPYmplY3RQb3NpdGlvbihwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIG9iamVjdCwgcGFyYW1zKVxuICAgICAgICAgICAgeCA9IHAueFxuICAgICAgICAgICAgeSA9IHAueVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4ID0gQG51bWJlclZhbHVlT2YocG9zaXRpb24ueClcbiAgICAgICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwb3NpdGlvbi55KVxuICAgIFxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5tb3ZlVG8oeCwgeSwgZHVyYXRpb24sIGVhc2luZylcbiAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBNb3ZlcyBhIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1vdmVPYmplY3RQYXRoXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gbW92ZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXRoIC0gVGhlIHBhdGggdG8gbW92ZSB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICBtb3ZlT2JqZWN0UGF0aDogKG9iamVjdCwgcGF0aCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLm1vdmVQYXRoKHBhdGguZGF0YSwgcGFyYW1zLmxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nLCBwYXRoLmVmZmVjdHM/LmRhdGEpXG4gICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIFNjcm9sbHMgYSBzY3JvbGxhYmxlIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNjcm9sbE9iamVjdFBhdGhcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzY3JvbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aCAtIFRoZSBwYXRoIHRvIHNjcm9sbCB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyAgICAgICAgXG4gICAgc2Nyb2xsT2JqZWN0UGF0aDogKG9iamVjdCwgcGF0aCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnNjcm9sbFBhdGgocGF0aCwgcGFyYW1zLmxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgIFxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFpvb21zL1NjYWxlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgem9vbU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHpvb20uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICB6b29tT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBvYmplY3QuYW5pbWF0b3Iuem9vbVRvKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy56b29taW5nLngpIC8gMTAwLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuem9vbWluZy55KSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogUm90YXRlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgcm90YXRlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gcm90YXRlLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgcm90YXRlT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgI2lmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICMgICAgYWN0dWFsRHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgICMgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKEBkdXJhdGlvbilcbiAgICAgICAgIyAgICBzcGVlZCA9IEBudW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwXG4gICAgICAgICMgICAgc3BlZWQgPSBNYXRoLnJvdW5kKGR1cmF0aW9uIC8gKGFjdHVhbER1cmF0aW9ufHwxKSAqIHNwZWVkKVxuICAgICAgICAjICAgIHBpY3R1cmUuYW5pbWF0b3Iucm90YXRlKEBwYXJhbXMuZGlyZWN0aW9uLCBzcGVlZCwgYWN0dWFsRHVyYXRpb258fDEsIGVhc2luZylcbiAgICAgICAgIyAgICBkdXJhdGlvbiA9IGFjdHVhbER1cmF0aW9uXG4gICAgICAgICNlbHNlXG4gICAgICAgICMgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgIyAgICBvYmplY3QuYW5pbWF0b3Iucm90YXRlKHBhcmFtcy5kaXJlY3Rpb24sIEBudW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnJvdGF0ZShwYXJhbXMuZGlyZWN0aW9uLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogQmxlbmRzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBibGVuZE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGJsZW5kLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBibGVuZE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmJsZW5kVG8oQG51bWJlclZhbHVlT2YocGFyYW1zLm9wYWNpdHkpLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBFeGVjdXRlcyBhIG1hc2tpbmctZWZmZWN0IG9uIGEgZ2FtZSBvYmplY3QuLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWFza09iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGV4ZWN1dGUgYSBtYXNraW5nLWVmZmVjdCBvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjIFxuICAgIG1hc2tPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICBcbiAgICAgICAgaWYgcGFyYW1zLm1hc2sudHlwZSA9PSAwXG4gICAgICAgICAgICBvYmplY3QubWFzay50eXBlID0gMFxuICAgICAgICAgICAgb2JqZWN0Lm1hc2sub3ggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMubWFzay5veClcbiAgICAgICAgICAgIG9iamVjdC5tYXNrLm95ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLm1hc2sub3kpXG4gICAgICAgICAgICBpZiBvYmplY3QubWFzay5zb3VyY2U/LnZpZGVvRWxlbWVudD9cbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UucGF1c2UoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcGFyYW1zLm1hc2suc291cmNlVHlwZSA9PSAwXG4gICAgICAgICAgICAgICAgb2JqZWN0Lm1hc2suc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7cGFyYW1zLm1hc2suZ3JhcGhpYz8ubmFtZX1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCJNb3ZpZXMvI3twYXJhbXMubWFzay52aWRlbz8ubmFtZX1cIilcbiAgICAgICAgICAgICAgICBpZiBvYmplY3QubWFzay5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lm1hc2suc291cmNlLnBsYXkoKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UubG9vcCA9IHllc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICAgICAgb2JqZWN0LmFuaW1hdG9yLm1hc2tUbyhwYXJhbXMubWFzaywgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgXG4gICAgIyMjKlxuICAgICogVGludHMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRpbnRPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byB0aW50LlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgICAgICAgXG4gICAgdGludE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnRpbnRUbyhwYXJhbXMudG9uZSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICBcbiAgICAjIyMqXG4gICAgKiBGbGFzaGVzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBmbGFzaE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGZsYXNoLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgZmxhc2hPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmZsYXNoKG5ldyBDb2xvcihwYXJhbXMuY29sb3IpLCBkdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIENyb3BlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JvcE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGNyb3AuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyAgICAgICAgIFxuICAgIGNyb3BPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgb2JqZWN0LnNyY1JlY3QueCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy54KVxuICAgICAgICBvYmplY3Quc3JjUmVjdC55ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnkpXG4gICAgICAgIG9iamVjdC5zcmNSZWN0LndpZHRoID0gQG51bWJlclZhbHVlT2YocGFyYW1zLndpZHRoKVxuICAgICAgICBvYmplY3Quc3JjUmVjdC5oZWlnaHQgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuaGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMud2lkdGgpXG4gICAgICAgIG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5oZWlnaHQpXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgbW90aW9uIGJsdXIgc2V0dGluZ3Mgb2YgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9iamVjdE1vdGlvbkJsdXJcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzZXQgdGhlIG1vdGlvbiBibHVyIHNldHRpbmdzIGZvci5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjXG4gICAgb2JqZWN0TW90aW9uQmx1cjogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBvYmplY3QubW90aW9uQmx1ci5zZXQocGFyYW1zLm1vdGlvbkJsdXIpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEVuYWJsZXMgYW4gZWZmZWN0IG9uIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvYmplY3RFZmZlY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBleGVjdXRlIGEgbWFza2luZy1lZmZlY3Qgb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICBvYmplY3RFZmZlY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcGFyYW1zLnR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIFdvYmJsZVxuICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci53b2JibGVUbyhwYXJhbXMud29iYmxlLnBvd2VyIC8gMTAwMDAsIHBhcmFtcy53b2JibGUuc3BlZWQgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgd29iYmxlID0gb2JqZWN0LmVmZmVjdHMud29iYmxlXG4gICAgICAgICAgICAgICAgd29iYmxlLmVuYWJsZWQgPSBwYXJhbXMud29iYmxlLnBvd2VyID4gMFxuICAgICAgICAgICAgICAgIHdvYmJsZS52ZXJ0aWNhbCA9IHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMCBvciBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgICAgICB3b2JibGUuaG9yaXpvbnRhbCA9IHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMSBvciBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgIHdoZW4gMSAjIEJsdXJcbiAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3IuYmx1clRvKHBhcmFtcy5ibHVyLnBvd2VyIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIG9iamVjdC5lZmZlY3RzLmJsdXIuZW5hYmxlZCA9IHllc1xuICAgICAgICAgICAgd2hlbiAyICMgUGl4ZWxhdGVcbiAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3IucGl4ZWxhdGVUbyhwYXJhbXMucGl4ZWxhdGUuc2l6ZS53aWR0aCwgcGFyYW1zLnBpeGVsYXRlLnNpemUuaGVpZ2h0LCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIG9iamVjdC5lZmZlY3RzLnBpeGVsYXRlLmVuYWJsZWQgPSB5ZXNcbiAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBkdXJhdGlvbiAhPSAwXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGFuIGFjdGlvbiBsaWtlIGZvciBhIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQWN0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIC0gQWN0aW9uLURhdGEuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlVmFsdWUgLSBJbiBjYXNlIG9mIHN3aXRjaC1iaW5kaW5nLCB0aGUgc3dpdGNoIGlzIHNldCB0byB0aGlzIHZhbHVlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGJpbmRWYWx1ZSAtIEEgbnVtYmVyIHZhbHVlIHdoaWNoIGJlIHB1dCBpbnRvIHRoZSBhY3Rpb24ncyBiaW5kLXZhbHVlIHZhcmlhYmxlLlxuICAgICMjI1xuICAgIGV4ZWN1dGVBY3Rpb246IChhY3Rpb24sIHN0YXRlVmFsdWUsIGJpbmRWYWx1ZSkgLT5cbiAgICAgICAgc3dpdGNoIGFjdGlvbi50eXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBKdW1wIFRvIExhYmVsXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLmxhYmVsSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGp1bXBUb0xhYmVsKGFjdGlvbi5sYWJlbClcbiAgICAgICAgICAgIHdoZW4gMSAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgQGNhbGxDb21tb25FdmVudChhY3Rpb24uY29tbW9uRXZlbnRJZCwgbnVsbCwgQGlzV2FpdGluZylcbiAgICAgICAgICAgIHdoZW4gMiAjIEJpbmQgVG8gU3dpdGNoXG4gICAgICAgICAgICAgICAgZG9tYWluID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5kb21haW5cbiAgICAgICAgICAgICAgICBAc2V0Qm9vbGVhblZhbHVlVG8oYWN0aW9uLnN3aXRjaCwgc3RhdGVWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMyAjIENhbGwgU2NlbmVcbiAgICAgICAgICAgICAgICBAY2FsbFNjZW5lKGFjdGlvbi5zY2VuZT8udWlkKVxuICAgICAgICAgICAgd2hlbiA0ICMgQmluZCBWYWx1ZSB0byBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIGRvbWFpbiA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuZG9tYWluXG4gICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8oYWN0aW9uLmJpbmRWYWx1ZVZhcmlhYmxlLCBiaW5kVmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLmxhYmVsSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGp1bXBUb0xhYmVsKGFjdGlvbi5sYWJlbClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsQ29tbW9uRXZlbnRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIFRoZSBJRCBvZiB0aGUgY29tbW9uIGV2ZW50IHRvIGNhbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIE9wdGlvbmFsIGNvbW1vbiBldmVudCBwYXJhbWV0ZXJzLlxuICAgICogQHBhcmFtIHtib29sZWFufSB3YWl0IC0gSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBzaG91bGQgYmUgc3RheSBpbiB3YWl0aW5nLW1vZGUgZXZlbiBpZiB0aGUgc3ViLWludGVycHJldGVyIGlzIGZpbmlzaGVkLlxuICAgICMjIyBcbiAgICBjYWxsQ29tbW9uRXZlbnQ6IChpZCwgcGFyYW1ldGVycywgd2FpdCkgLT5cbiAgICAgICAgY29tbW9uRXZlbnQgPSBHYW1lTWFuYWdlci5jb21tb25FdmVudHNbaWRdXG4gICAgICAgIFxuICAgICAgICBpZiBjb21tb25FdmVudD9cbiAgICAgICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmluZGV4T2YoY29tbW9uRXZlbnQpID09IC0xXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLmFkZE9iamVjdChjb21tb25FdmVudClcbiAgICAgICAgICAgIGNvbW1vbkV2ZW50LmV2ZW50cz8ub24gXCJmaW5pc2hcIiwgZ3MuQ2FsbEJhY2soXCJvbkNvbW1vbkV2ZW50RmluaXNoXCIsIHRoaXMpLCB7IHdhaXRpbmc6IHdhaXQgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBjb21tb25FdmVudC5iZWhhdmlvci5jYWxsKHBhcmFtZXRlcnMgfHwgW10sIEBzZXR0aW5ncywgQGNvbnRleHQpXG4gICAgICAgICAgICAjR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cExvY2FsVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgI0dhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgY29tbW9uRXZlbnQuYmVoYXZpb3IudXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHN1YkludGVycHJldGVyP1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc2V0dGluZ3MgPSBAc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci51cGRhdGUoKVxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxzIGEgc2NlbmUgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsU2NlbmVcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1aWQgLSBUaGUgVUlEIG9mIHRoZSBzY2VuZSB0byBjYWxsLlxuICAgICMjIyAgICAgICAgIFxuICAgIGNhbGxTY2VuZTogKHVpZCkgLT5cbiAgICAgICAgc2NlbmVEb2N1bWVudCA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KHVpZClcbiAgICAgICAgXG4gICAgICAgIGlmIHNjZW5lRG9jdW1lbnQ/XG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBuZXcgdm4uQ29tcG9uZW50X0NhbGxTY2VuZUludGVycHJldGVyKClcbiAgICAgICAgICAgIG9iamVjdCA9IHsgY29tbWFuZHM6IHNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMgfVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnJlcGVhdCA9IG5vXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoc2NlbmVEb2N1bWVudC51aWQsIHNjZW5lRG9jdW1lbnQpXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIub2JqZWN0ID0gb2JqZWN0XG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIub25GaW5pc2ggPSBncy5DYWxsQmFjayhcIm9uQ2FsbFNjZW5lRmluaXNoXCIsIHRoaXMpXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnNldHRpbmdzID0gQHNldHRpbmdzXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIudXBkYXRlKClcbiAgICAgICAgICAgIFxuICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9yZUxpc3RWYWx1ZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIElEIG9mIHRoZSBjb21tb24gZXZlbnQgdG8gY2FsbC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gT3B0aW9uYWwgY29tbW9uIGV2ZW50IHBhcmFtZXRlcnMuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhaXQgLSBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIHNob3VsZCBiZSBzdGF5IGluIHdhaXRpbmctbW9kZSBldmVuIGlmIHRoZSBzdWItaW50ZXJwcmV0ZXIgaXMgZmluaXNoZWQuXG4gICAgIyMjICAgICAgICBcbiAgICBzdG9yZUxpc3RWYWx1ZTogKHZhcmlhYmxlLCBsaXN0LCB2YWx1ZSwgdmFsdWVUeXBlKSAtPlxuICAgICAgICBzd2l0Y2ggdmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyh2YXJpYWJsZSwgKGlmICFpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZSBlbHNlIDApKVxuICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldEJvb2xlYW5WYWx1ZVRvKHZhcmlhYmxlLCAoaWYgdmFsdWUgdGhlbiAxIGVsc2UgMCkpXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHZhbHVlLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldExpc3RPYmplY3RUbyh2YXJpYWJsZSwgKGlmIHZhbHVlLmxlbmd0aD8gdGhlbiB2YWx1ZSBlbHNlIFtdKSkgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QganVtcFRvTGFiZWxcbiAgICAjIyMgICAgICAgICBcbiAgICBqdW1wVG9MYWJlbDogKGxhYmVsKSAtPlxuICAgICAgICByZXR1cm4gaWYgbm90IGxhYmVsXG4gICAgICAgIGZvdW5kID0gbm9cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uQG9iamVjdC5jb21tYW5kcy5sZW5ndGhdXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmNvbW1hbmRzW2ldLmlkID09IFwiZ3MuTGFiZWxcIiBhbmQgQG9iamVjdC5jb21tYW5kc1tpXS5wYXJhbXMubmFtZSA9PSBsYWJlbFxuICAgICAgICAgICAgICAgIEBwb2ludGVyID0gaVxuICAgICAgICAgICAgICAgIEBpbmRlbnQgPSBAb2JqZWN0LmNvbW1hbmRzW2ldLmluZGVudFxuICAgICAgICAgICAgICAgIGZvdW5kID0geWVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZm91bmRcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGN1cnJlbnQgbWVzc2FnZSBib3ggb2JqZWN0IGRlcGVuZGluZyBvbiBnYW1lIG1vZGUgKEFEViBvciBOVkwpLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZUJveE9iamVjdFxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X0Jhc2V9IFRoZSBtZXNzYWdlIGJveCBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgbWVzc2FnZUJveE9iamVjdDogKGlkKSAtPlxuICAgICAgICBpZiBTY2VuZU1hbmFnZXIuc2NlbmUubGF5b3V0LnZpc2libGVcbiAgICAgICAgICAgIHJldHVybiBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChpZCB8fCBcIm1lc3NhZ2VCb3hcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKGlkIHx8IFwibnZsTWVzc2FnZUJveFwiKVxuICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIG9iamVjdCBkZXBlbmRpbmcgb24gZ2FtZSBtb2RlIChBRFYgb3IgTlZMKS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VPYmplY3RcbiAgICAqIEByZXR1cm4ge3VpLk9iamVjdF9NZXNzYWdlfSBUaGUgbWVzc2FnZSBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3Q6IC0+XG4gICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5sYXlvdXQudmlzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIElEIGRlcGVuZGluZyBvbiBnYW1lIG1vZGUgKEFEViBvciBOVkwpLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZU9iamVjdElkXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBtZXNzYWdlIG9iamVjdCBJRC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3RJZDogLT5cbiAgICAgICAgaWYgU2NlbmVNYW5hZ2VyLnNjZW5lLmxheW91dC52aXNpYmxlXG4gICAgICAgICAgICByZXR1cm4gXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFwibnZsR2FtZU1lc3NhZ2VfbWVzc2FnZVwiXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZVNldHRpbmdzXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBtZXNzYWdlIHNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBtZXNzYWdlU2V0dGluZ3M6IC0+XG4gICAgICAgIG1lc3NhZ2UgPSBAdGFyZ2V0TWVzc2FnZSgpXG5cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2Uuc2V0dGluZ3NcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCB0YXJnZXQgbWVzc2FnZSBvYmplY3Qgd2hlcmUgYWxsIG1lc3NhZ2UgY29tbWFuZHMgYXJlIGV4ZWN1dGVkIG9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdGFyZ2V0TWVzc2FnZVxuICAgICogQHJldHVybiB7dWkuT2JqZWN0X01lc3NhZ2V9IFRoZSB0YXJnZXQgbWVzc2FnZSBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgdGFyZ2V0TWVzc2FnZTogLT5cbiAgICAgICAgbWVzc2FnZSA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgdGFyZ2V0ID0gQHNldHRpbmdzLm1lc3NhZ2UudGFyZ2V0XG4gICAgICAgIGlmIHRhcmdldD9cbiAgICAgICAgICAgIHN3aXRjaCB0YXJnZXQudHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIExheW91dC1CYXNlZFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBDdXN0b21cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IFNjZW5lTWFuYWdlci5zY2VuZS5tZXNzYWdlQXJlYXNbdGFyZ2V0LmlkXT8ubWVzc2FnZSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBtZXNzYWdlXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGN1cnJlbnQgdGFyZ2V0IG1lc3NhZ2UgYm94IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdGFyZ2V0IG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCB0YXJnZXRNZXNzYWdlQm94XG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfVUlFbGVtZW50fSBUaGUgdGFyZ2V0IG1lc3NhZ2UgYm94LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgdGFyZ2V0TWVzc2FnZUJveDogLT5cbiAgICAgICAgbWVzc2FnZUJveCA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgdGFyZ2V0ID0gQHNldHRpbmdzLm1lc3NhZ2UudGFyZ2V0XG4gICAgICAgIGlmIHRhcmdldD9cbiAgICAgICAgICAgIHN3aXRjaCB0YXJnZXQudHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIExheW91dC1CYXNlZFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQm94ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBDdXN0b21cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUJveCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIrdGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBtZXNzYWdlQm94XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBhZnRlciBhbiBpbnB1dCBudW1iZXIgZGlhbG9nIHdhcyBhY2NlcHRlZCBieSB0aGUgdXNlci4gSXQgdGFrZXMgdGhlIHVzZXIncyBpbnB1dCBhbmQgcHV0c1xuICAgICogaXQgaW4gdGhlIGNvbmZpZ3VyZWQgbnVtYmVyIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25JbnB1dE51bWJlckZpbmlzaFxuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgbGlrZSB0aGUgbnVtYmVyLCBldGMuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIG9uSW5wdXROdW1iZXJGaW5pc2g6IChlKSAtPlxuICAgICAgICBAbWVzc2FnZU9iamVjdCgpLmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgQHNldE51bWJlclZhbHVlVG8oQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIudmFyaWFibGUsIHBhcnNlSW50KHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGUuc2VuZGVyLCBlLm51bWJlcikpKVxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIgPSBudWxsXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnB1dE51bWJlckJveC5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYW4gaW5wdXQgdGV4dCBkaWFsb2cgd2FzIGFjY2VwdGVkIGJ5IHRoZSB1c2VyLiBJdCB0YWtlcyB0aGUgdXNlcidzIHRleHQgaW5wdXQgYW5kIHB1dHNcbiAgICAqIGl0IGluIHRoZSBjb25maWd1cmVkIHN0cmluZyB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uSW5wdXRUZXh0RmluaXNoXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBsaWtlIHRoZSB0ZXh0LCBldGMuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIG9uSW5wdXRUZXh0RmluaXNoOiAoZSkgLT5cbiAgICAgICAgQG1lc3NhZ2VPYmplY3QoKS5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgIEBzZXRTdHJpbmdWYWx1ZVRvKEB3YWl0aW5nRm9yLmlucHV0VGV4dC52YXJpYWJsZSwgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoZS5zZW5kZXIsIGUudGV4dCkucmVwbGFjZSgvXy9nLCBcIlwiKSlcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0aW5nRm9yLmlucHV0VGV4dCA9IG51bGxcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmlucHV0VGV4dEJveC5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYSBjaG9pY2Ugd2FzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLiBJdCBqdW1wcyB0byB0aGUgY29ycmVzcG9uZGluZyBsYWJlbFxuICAgICogYW5kIGFsc28gcHV0cyB0aGUgY2hvaWNlIGludG8gYmFja2xvZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ2hvaWNlQWNjZXB0XG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBsaWtlIHRoZSBsYWJlbCwgZXRjLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgb25DaG9pY2VBY2NlcHQ6IChlKSAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5jaG9pY2VUaW1lci5iZWhhdmlvci5zdG9wKClcbiAgICAgICAgXG4gICAgICAgIGUuaXNTZWxlY3RlZCA9IHllc1xuICAgICAgICBkZWxldGUgZS5zZW5kZXJcbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cucHVzaCh7IGNoYXJhY3RlcjogeyBuYW1lOiBcIlwiIH0sIG1lc3NhZ2U6IFwiXCIsIGNob2ljZTogZSwgY2hvaWNlczogJHRlbXBGaWVsZHMuY2hvaWNlcywgaXNDaG9pY2U6IHllcyB9KVxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmNob2ljZXMgPSBbXVxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gQG1lc3NhZ2VPYmplY3QoKVxuICAgICAgICBpZiBtZXNzYWdlT2JqZWN0Py52aXNpYmxlXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBmYWRpbmcgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZ1xuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDAgZWxzZSBmYWRpbmcuZHVyYXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYW5pbWF0b3IuZGlzYXBwZWFyKGZhZGluZy5hbmltYXRpb24sIGZhZGluZy5lYXNpbmcsIGR1cmF0aW9uLCA9PlxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QudmlzaWJsZSA9IG5vXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgQHdhaXRpbmdGb3IuY2hvaWNlID0gbnVsbFxuICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKGUuYWN0aW9uLCB0cnVlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKGUuYWN0aW9uLCB0cnVlKVxuICAgICAgICBzY2VuZS5jaG9pY2VXaW5kb3cuZGlzcG9zZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogSWRsZVxuICAgICogQG1ldGhvZCBjb21tYW5kSWRsZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kSWRsZTogLT5cbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9ICFAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RhcnQgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0YXJ0VGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRTdGFydFRpbWVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICB0aW1lcnMgPSBzY2VuZS50aW1lcnNcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRpbWVyID0gdGltZXJzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRpbWVyP1xuICAgICAgICAgICAgdGltZXIgPSBuZXcgZ3MuT2JqZWN0X0ludGVydmFsVGltZXIoKVxuICAgICAgICAgICAgdGltZXJzW251bWJlcl0gPSB0aW1lclxuICAgICAgICAgICAgXG4gICAgICAgIHRpbWVyLmV2ZW50cy5vZmZCeU93bmVyKFwiZWxhcHNlZFwiLCBAb2JqZWN0KVxuICAgICAgICB0aW1lci5ldmVudHMub24oXCJlbGFwc2VkXCIsIChlKSA9PlxuICAgICAgICAgICAgcGFyYW1zID0gZS5kYXRhLnBhcmFtc1xuICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy5hY3Rpb24udHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIEp1bXAgVG8gTGFiZWxcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFyYW1zLmxhYmVsSW5kZXg/XG4gICAgICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuaW50ZXJwcmV0ZXIucG9pbnRlciA9IHBhcmFtcy5sYWJlbEluZGV4XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnRlcnByZXRlci5qdW1wVG9MYWJlbChwYXJhbXMuYWN0aW9uLmRhdGEubGFiZWwpXG4gICAgICAgICAgICAgICAgd2hlbiAxICMgQ2FsbCBDb21tb24gRXZlbnRcbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmNhbGxDb21tb25FdmVudChwYXJhbXMuYWN0aW9uLmRhdGEuY29tbW9uRXZlbnRJZClcbiAgICAgICAgeyBwYXJhbXM6IEBwYXJhbXMgfSwgQG9iamVjdClcbiAgICAgICAgXG4gICAgICAgIHRpbWVyLmJlaGF2aW9yLmludGVydmFsID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmludGVydmFsKVxuICAgICAgICB0aW1lci5iZWhhdmlvci5zdGFydCgpXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3VtZSBUaW1lclxuICAgICogQG1ldGhvZCBjb21tYW5kUmVzdW1lVGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRSZXN1bWVUaW1lcjogLT5cbiAgICAgICAgdGltZXJzID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRpbWVyc1xuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGltZXJzW251bWJlcl0/LmJlaGF2aW9yLnJlc3VtZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFBhdXNlcyBUaW1lclxuICAgICogQG1ldGhvZCBjb21tYW5kUGF1c2VUaW1lclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFBhdXNlVGltZXI6IC0+XG4gICAgICAgIHRpbWVycyA9IFNjZW5lTWFuYWdlci5zY2VuZS50aW1lcnNcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRpbWVyc1tudW1iZXJdPy5iZWhhdmlvci5wYXVzZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFN0b3AgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0b3BUaW1lclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRTdG9wVGltZXI6IC0+XG4gICAgICAgIHRpbWVycyA9IFNjZW5lTWFuYWdlci5zY2VuZS50aW1lcnNcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRpbWVyc1tudW1iZXJdPy5iZWhhdmlvci5zdG9wKClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFdhaXRcbiAgICAqIEBtZXRob2QgY29tbWFuZFdhaXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFdhaXQ6IC0+XG4gICAgICAgIHRpbWUgPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMudGltZSkgXG4gICAgICAgIFxuICAgICAgICBpZiB0aW1lPyBhbmQgdGltZSA+IDAgYW5kICFAaW50ZXJwcmV0ZXIucHJldmlld0RhdGFcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IHRpbWVcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9vcFxuICAgICogQG1ldGhvZCBjb21tYW5kTG9vcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTG9vcDogLT5cbiAgICAgICAgQGludGVycHJldGVyLmxvb3BzW0BpbnRlcnByZXRlci5pbmRlbnRdID0gQGludGVycHJldGVyLnBvaW50ZXJcbiAgICAgICAgQGludGVycHJldGVyLmluZGVudCsrXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEJyZWFrIExvb3BcbiAgICAqIEBtZXRob2QgY29tbWFuZEJyZWFrTG9vcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQnJlYWtMb29wOiAtPlxuICAgICAgICBpbmRlbnQgPSBAaW5kZW50XG4gICAgICAgIHdoaWxlIG5vdCBAaW50ZXJwcmV0ZXIubG9vcHNbaW5kZW50XT8gYW5kIGluZGVudCA+IDBcbiAgICAgICAgICAgIGluZGVudC0tXG4gICAgICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmxvb3BzW2luZGVudF0gPSBudWxsXG4gICAgICAgIEBpbnRlcnByZXRlci5pbmRlbnQgPSBpbmRlbnRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0QWRkXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kTGlzdEFkZDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaCBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc3RyaW5nVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhbHVlKSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLmxpc3RWYXJpYWJsZSwgbGlzdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0UG9wXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRMaXN0UG9wOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSBsaXN0LnBvcCgpID8gMFxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zdG9yZUxpc3RWYWx1ZShAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0LCB2YWx1ZSwgQHBhcmFtcy52YWx1ZVR5cGUpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RTaGlmdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTGlzdFNoaWZ0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSBsaXN0LnNoaWZ0KCkgPyAwXG5cbiAgICAgICAgQGludGVycHJldGVyLnN0b3JlTGlzdFZhbHVlKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxpc3QsIHZhbHVlLCBAcGFyYW1zLnZhbHVlVHlwZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0SW5kZXhPZlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTGlzdEluZGV4T2Y6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICB2YWx1ZSA9IC0xXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbGlzdC5pbmRleE9mKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsaXN0LmluZGV4T2YoQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbGlzdC5pbmRleE9mKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc3RyaW5nVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbGlzdC5pbmRleE9mKEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFsdWUpKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0Q2xlYXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRMaXN0Q2xlYXI6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBsaXN0Lmxlbmd0aCA9IDBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFZhbHVlQXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRMaXN0VmFsdWVBdDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbmRleClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID49IDAgYW5kIGluZGV4IDwgbGlzdC5sZW5ndGhcbiAgICAgICAgICAgIHZhbHVlID0gbGlzdFtpbmRleF0gPyAwXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc3RvcmVMaXN0VmFsdWUoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbGlzdCwgdmFsdWUsIEBwYXJhbXMudmFsdWVUeXBlKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0UmVtb3ZlQXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgXG4gICAgY29tbWFuZExpc3RSZW1vdmVBdDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbmRleClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID49IDAgYW5kIGluZGV4IDwgbGlzdC5sZW5ndGhcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RJbnNlcnRBdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICBcbiAgICBjb21tYW5kTGlzdEluc2VydEF0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmluZGV4KVxuICAgICAgICBcbiAgICAgICAgaWYgaW5kZXggPj0gMCBhbmQgaW5kZXggPCBsaXN0Lmxlbmd0aFxuICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAwLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSlcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDAsIEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKSlcbiAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAwLCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnN0cmluZ1ZhbHVlKSlcbiAgICAgICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAwLCBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TGlzdE9iamVjdFRvKEBwYXJhbXMubGlzdFZhcmlhYmxlLCBsaXN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RTZXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRMaXN0U2V0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmluZGV4KVxuICAgICAgICBcbiAgICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtpbmRleF0gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zdHJpbmdWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TGlzdE9iamVjdFRvKEBwYXJhbXMubGlzdFZhcmlhYmxlLCBsaXN0KSAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RDb3B5XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgIFxuICAgIGNvbW1hbmRMaXN0Q29weTogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGNvcHkgPSBPYmplY3QuZGVlcENvcHkobGlzdClcbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5zZXRMaXN0T2JqZWN0VG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgY29weSkgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RMZW5ndGhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZExpc3RMZW5ndGg6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxpc3QubGVuZ3RoKSBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0Sm9pblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZExpc3RKb2luOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSBpZiBAcGFyYW1zLm9yZGVyID09IDAgdGhlbiBsaXN0LmpvaW4oXCJcIikgZWxzZSBsaXN0LnJldmVyc2UoKS5qb2luKFwiXCIpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSkgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RGcm9tVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZExpc3RGcm9tVGV4dDogLT5cbiAgICAgICAgdGV4dCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhcmlhYmxlKVxuICAgICAgICBzZXBhcmF0b3IgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNlcGFyYXRvcilcbiAgICAgICAgbGlzdCA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0KSBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFNodWZmbGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdFNodWZmbGU6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpZiBsaXN0Lmxlbmd0aCA9PSAwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbbGlzdC5sZW5ndGgtMS4uMV1cbiAgICAgICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSsxKSlcbiAgICAgICAgICAgIHRlbXBpID0gbGlzdFtpXVxuICAgICAgICAgICAgdGVtcGogPSBsaXN0W2pdXG4gICAgICAgICAgICBsaXN0W2ldID0gdGVtcGpcbiAgICAgICAgICAgIGxpc3Rbal0gPSB0ZW1waVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U29ydFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICBcbiAgICBjb21tYW5kTGlzdFNvcnQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpZiBsaXN0Lmxlbmd0aCA9PSAwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zb3J0T3JkZXJcbiAgICAgICAgICAgIHdoZW4gMCAjIEFzY2VuZGluZ1xuICAgICAgICAgICAgICAgIGxpc3Quc29ydCAoYSwgYikgLT4gXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPCBiIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPiBiIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIHdoZW4gMSAjIERlc2NlbmRpbmdcbiAgICAgICAgICAgICAgICBsaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPiBiIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPCBiIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUmVzZXRWYXJpYWJsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kUmVzZXRWYXJpYWJsZXM6IC0+XG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgd2hlbiAwICMgQWxsXG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBudWxsXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5nZVxuICAgICAgICAgICAgICAgIHJhbmdlID0gQHBhcmFtcy5yYW5nZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zY29wZVxuICAgICAgICAgICAgd2hlbiAwICMgTG9jYWxcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyh7IGlkOiBAcGFyYW1zLnNjZW5lLnVpZCB9LCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAxICMgQWxsIExvY2Fsc1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyhudWxsLCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAyICMgR2xvYmFsXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jbGVhckdsb2JhbFZhcmlhYmxlcyhAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAzICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzKEBwYXJhbXMudHlwZSwgcmFuZ2UpXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVZhcmlhYmxlRG9tYWluXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRDaGFuZ2VWYXJpYWJsZURvbWFpbjogLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jaGFuZ2VEb21haW4oQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5kb21haW4pKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzOiAtPiBAaW50ZXJwcmV0ZXIuY2hhbmdlRGVjaW1hbFZhcmlhYmxlcyhAcGFyYW1zLCBAcGFyYW1zLnJvdW5kTWV0aG9kKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZU51bWJlclZhcmlhYmxlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlTnVtYmVyVmFyaWFibGVzOiAtPlxuICAgICAgICBzb3VyY2UgPSAwXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zb3VyY2VcbiAgICAgICAgICAgIHdoZW4gMCAjIENvbnN0YW50IFZhbHVlIC8gVmFyaWFibGUgVmFsdWVcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZG9tXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVJhbmRvbS5zdGFydClcbiAgICAgICAgICAgICAgICBlbmQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVJhbmRvbS5lbmQpXG4gICAgICAgICAgICAgICAgZGlmZiA9IGVuZCAtIHN0YXJ0XG4gICAgICAgICAgICAgICAgc291cmNlID0gTWF0aC5mbG9vcihzdGFydCArIE1hdGgucmFuZG9tKCkgKiAoZGlmZisxKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFBvaW50ZXJcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMuc291cmNlU2NvcGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc291cmNlUmVmZXJlbmNlKS0xLCBAcGFyYW1zLnNvdXJjZVJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgIHdoZW4gMyAjIEdhbWUgRGF0YVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mR2FtZURhdGEoQHBhcmFtcy5zb3VyY2VWYWx1ZTEpXG4gICAgICAgICAgICB3aGVuIDQgIyBEYXRhYmFzZSBEYXRhXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2ZEYXRhYmFzZURhdGEoQHBhcmFtcy5zb3VyY2VWYWx1ZTEpXG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgU3ViXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAtIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgTXVsXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAqIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLmZsb29yKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpIC8gc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgTW9kXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgc2NvcGUgPSBAcGFyYW1zLnRhcmdldFNjb3BlXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBAcGFyYW1zLnRhcmdldFJhbmdlLnN0YXJ0LTFcbiAgICAgICAgICAgICAgICBlbmQgPSBAcGFyYW1zLnRhcmdldFJhbmdlLmVuZC0xXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW3N0YXJ0Li5lbmRdXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgKyBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAtIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIE11bFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICogc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgTWF0aC5mbG9vcihAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAvIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50YXJnZXRSZWZlcmVuY2UpIC0gMVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pICsgc291cmNlLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgU3ViXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLSBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAqIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgTWF0aC5mbG9vcihAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLyBzb3VyY2UpLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgTW9kXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgJSBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXM6IC0+XG4gICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnZhbHVlKVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgd2hlbiAwICMgVmFyaWFibGVcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnZhbHVlID09IDIgIyBUcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBpZiB0YXJnZXRWYWx1ZSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzb3VyY2UpXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5nZVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0geyBpbmRleDogMCwgc2NvcGU6IEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSB9XG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gWyhAcGFyYW1zLnJhbmdlU3RhcnQtMSkuLihAcGFyYW1zLnJhbmdlRW5kLTEpXVxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5pbmRleCA9IGlcbiAgICAgICAgICAgICAgICAgICAgaWYgQHBhcmFtcy52YWx1ZSA9PSAyICMgVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFsdWUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YodmFyaWFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIGlmIHRhcmdldFZhbHVlIHRoZW4gZmFsc2UgZWxzZSB0cnVlKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50YXJnZXRSZWZlcmVuY2UpIC0gMVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSwgaW5kZXgsIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVN0cmluZ1ZhcmlhYmxlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlU3RyaW5nVmFyaWFibGVzOiAtPlxuICAgICAgICBzb3VyY2UgPSBcIlwiXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnNvdXJjZVxuICAgICAgICAgICAgd2hlbiAwICMgQ29uc3RhbnQgVGV4dFxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGxjcyhAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFZhcmlhYmxlXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zb3VyY2VWYXJpYWJsZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIERhdGFiYXNlIERhdGFcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZkRhdGFiYXNlRGF0YShAcGFyYW1zLmRhdGFiYXNlRGF0YSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFNjcmlwdFxuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBldmFsKEBwYXJhbXMuc2NyaXB0KVxuICAgICAgICAgICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IFwiRVJSOiBcIiArIGV4Lm1lc3NhZ2VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBsY3MoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVG8gVXBwZXItQ2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkudG9VcHBlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgVG8gTG93ZXItQ2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkudG9Mb3dlckNhc2UoKSlcblxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZ2VcbiAgICAgICAgICAgICAgICB2YXJpYWJsZSA9IHsgaW5kZXg6IDAsIHNjb3BlOiBAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUgfVxuICAgICAgICAgICAgICAgIGZvciBpIGluIFtAcGFyYW1zLnJhbmdlU3RhcnQtMS4uQHBhcmFtcy5yYW5nZUVuZC0xXVxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5pbmRleCA9IGlcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyh2YXJpYWJsZSwgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRvIFVwcGVyLUNhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyh2YXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YodmFyaWFibGUpLnRvVXBwZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBUbyBMb3dlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHZhcmlhYmxlKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgdGFyZ2V0VmFsdWUgKyBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUbyBVcHBlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSwgaW5kZXgsIHRhcmdldFZhbHVlLnRvVXBwZXJDYXNlKCksIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBUbyBMb3dlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCB0YXJnZXRWYWx1ZS50b0xvd2VyQ2FzZSgpLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hlY2tTd2l0Y2hcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRDaGVja1N3aXRjaDogLT5cbiAgICAgICAgcmVzdWx0ID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpICYmIEBwYXJhbXMudmFsdWVcbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlciA9IEBwYXJhbXMubGFiZWxJbmRleFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE51bWJlckNvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmROdW1iZXJDb25kaXRpb246IC0+XG4gICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgIEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdID0gcmVzdWx0XG4gICAgICAgIFxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pbmRlbnQrK1xuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICBcbiAgICBjb21tYW5kQ29uZGl0aW9uOiAtPlxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudmFyaWFibGUpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy52YXJpYWJsZSksIEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGludGVycHJldGVyLmNvbXBhcmUobGNzKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudmFyaWFibGUpKSwgbGNzKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKSksIEBwYXJhbXMub3BlcmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmNvbmRpdGlvbnNbQGludGVycHJldGVyLmluZGVudF0gPSByZXN1bHRcbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KysgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvbkVsc2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kQ29uZGl0aW9uRWxzZTogLT5cbiAgICAgICAgaWYgbm90IEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDb25kaXRpb25FbHNlSWZcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDb25kaXRpb25FbHNlSWY6IC0+XG4gICAgICAgIGlmIG5vdCBAaW50ZXJwcmV0ZXIuY29uZGl0aW9uc1tAaW50ZXJwcmV0ZXIuaW5kZW50XVxuICAgICAgICAgICAgQGludGVycHJldGVyLmNvbW1hbmRDb25kaXRpb24uY2FsbCh0aGlzKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoZWNrTnVtYmVyVmFyaWFibGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDaGVja051bWJlclZhcmlhYmxlOiAtPlxuICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52YWx1ZSksIEBwYXJhbXMub3BlcmF0aW9uKVxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyID0gQHBhcmFtcy5sYWJlbEluZGV4XG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hlY2tUZXh0VmFyaWFibGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDaGVja1RleHRWYXJpYWJsZTogLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgdGV4dDEgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKVxuICAgICAgICB0ZXh0MiA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudmFsdWUpXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcmVzdWx0ID0gdGV4dDEgPT0gdGV4dDJcbiAgICAgICAgICAgIHdoZW4gMSB0aGVuIHJlc3VsdCA9IHRleHQxICE9IHRleHQyXG4gICAgICAgICAgICB3aGVuIDIgdGhlbiByZXN1bHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gMyB0aGVuIHJlc3VsdCA9IHRleHQxLmxlbmd0aCA+PSB0ZXh0Mi5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gNCB0aGVuIHJlc3VsdCA9IHRleHQxLmxlbmd0aCA8IHRleHQyLmxlbmd0aFxuICAgICAgICAgICAgd2hlbiA1IHRoZW4gcmVzdWx0ID0gdGV4dDEubGVuZ3RoIDw9IHRleHQyLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIgPSBAcGFyYW1zLmxhYmVsSW5kZXhcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGFiZWxcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kTGFiZWw6IC0+ICMgRG9lcyBOb3RoaW5nXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEp1bXBUb0xhYmVsXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgICBcbiAgICBjb21tYW5kSnVtcFRvTGFiZWw6IC0+XG4gICAgICAgIGxhYmVsID0gQHBhcmFtcy5sYWJlbEluZGV4ICNAaW50ZXJwcmV0ZXIubGFiZWxzW0BwYXJhbXMubmFtZV1cbiAgICAgICAgaWYgbGFiZWw/XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlciA9IGxhYmVsXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50ID0gQGludGVycHJldGVyLm9iamVjdC5jb21tYW5kc1tsYWJlbF0uaW5kZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5qdW1wVG9MYWJlbChAcGFyYW1zLm5hbWUpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENsZWFyTWVzc2FnZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgY29tbWFuZENsZWFyTWVzc2FnZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKClcbiAgICAgICAgaWYgbm90IG1lc3NhZ2VPYmplY3Q/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGR1cmF0aW9uID0gMFxuICAgICAgICBmYWRpbmcgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZ1xuICAgICAgICBpZiBub3QgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBmYWRpbmcuZHVyYXRpb25cbiAgICAgICAgbWVzc2FnZU9iamVjdC5hbmltYXRvci5kaXNhcHBlYXIoZmFkaW5nLmFuaW1hdGlvbiwgZmFkaW5nLmVhc2luZywgZHVyYXRpb24sIGdzLkNhbGxCYWNrKFwib25NZXNzYWdlQURWQ2xlYXJcIiwgQGludGVycHJldGVyKSlcblxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdEZvckNvbXBsZXRpb24obWVzc2FnZU9iamVjdCwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VCb3hEZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTWVzc2FnZUJveERlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLm1lc3NhZ2VCb3hcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckVhc2luZyA9IEBwYXJhbXMuYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZyA9IEBwYXJhbXMuZGlzYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd01lc3NhZ2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRTaG93TWVzc2FnZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUubWVzc2FnZU1vZGUgPSB2bi5NZXNzYWdlTW9kZS5BRFZcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIFxuICAgICAgICBzaG93TWVzc2FnZSA9ID0+XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbQHBhcmFtcy5jaGFyYWN0ZXJJZF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2NlbmUubGF5b3V0LnZpc2libGUgPSB5ZXNcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgbWVzc2FnZU9iamVjdD8gdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2NlbmUuY3VycmVudENoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5vcGFjaXR5ID0gMjU1XG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vZmZCeU93bmVyKFwiY2FsbENvbW1vbkV2ZW50XCIsIEBpbnRlcnByZXRlcilcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9uKFwiY2FsbENvbW1vbkV2ZW50XCIsIGdzLkNhbGxCYWNrKFwib25DYWxsQ29tbW9uRXZlbnRcIiwgQGludGVycHJldGVyKSwgcGFyYW1zOiBAcGFyYW1zLCBAaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vbmNlKFwiZmluaXNoXCIsIGdzLkNhbGxCYWNrKFwib25NZXNzYWdlQURWRmluaXNoXCIsIEBpbnRlcnByZXRlciksIHBhcmFtczogQHBhcmFtcywgQGludGVycHJldGVyKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub25jZShcIndhaXRpbmdcIiwgZ3MuQ2FsbEJhY2soXCJvbk1lc3NhZ2VBRFZXYWl0aW5nXCIsIEBpbnRlcnByZXRlciksIHBhcmFtczogQHBhcmFtcywgQGludGVycHJldGVyKSAgIFxuICAgICAgICAgICAgaWYgbWVzc2FnZU9iamVjdC5zZXR0aW5ncy51c2VDaGFyYWN0ZXJDb2xvclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QubWVzc2FnZS5zaG93TWVzc2FnZShAaW50ZXJwcmV0ZXIsIEBwYXJhbXMsIGNoYXJhY3RlcilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0Lm1lc3NhZ2Uuc2hvd01lc3NhZ2UoQGludGVycHJldGVyLCBAcGFyYW1zKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzXG4gICAgICAgICAgICB2b2ljZVNldHRpbmdzID0gc2V0dGluZ3Mudm9pY2VzQnlDaGFyYWN0ZXJbY2hhcmFjdGVyLmluZGV4XVxuICAgICAgXG4gICAgICAgICAgICBpZiBAcGFyYW1zLnZvaWNlPyBhbmQgR2FtZU1hbmFnZXIuc2V0dGluZ3Mudm9pY2VFbmFibGVkIGFuZCAoIXZvaWNlU2V0dGluZ3Mgb3Igdm9pY2VTZXR0aW5ncyA+IDApXG4gICAgICAgICAgICAgICAgaWYgKEdhbWVNYW5hZ2VyLnNldHRpbmdzLnNraXBWb2ljZU9uQWN0aW9uIG9yICFBdWRpb01hbmFnZXIudm9pY2U/LnBsYXlpbmcpIGFuZCAhR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC52b2ljZSA9IEBwYXJhbXMudm9pY2VcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5iZWhhdmlvci52b2ljZSA9IEF1ZGlvTWFuYWdlci5wbGF5Vm9pY2UoQHBhcmFtcy52b2ljZSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLnZvaWNlID0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLmV4cHJlc3Npb25JZD8gYW5kIGNoYXJhY3Rlcj9cbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW0BwYXJhbXMuZXhwcmVzc2lvbklkIHx8IDBdXG4gICAgICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWQoQHBhcmFtcy5maWVsZEZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5leHByZXNzaW9uRHVyYXRpb25cbiAgICAgICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5jaGFuZ2VFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBkZWZhdWx0cy5jaGFuZ2VBbmltYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hhcmFjdGVyLmJlaGF2aW9yLmNoYW5nZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCA9PlxuICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKClcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2hvd01lc3NhZ2UoKVxuICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gKEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gPyB5ZXMpIGFuZCAhKEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPT0gMClcbiAgICAgICAgQGludGVycHJldGVyLndhaXRpbmdGb3IubWVzc2FnZUFEViA9IEBwYXJhbXNcbiAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNldE1lc3NhZ2VBcmVhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZFNldE1lc3NhZ2VBcmVhOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgXG4gICAgICAgIGlmIHNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdXG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0ID0gc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl0ubGF5b3V0XG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QueCA9IEBwYXJhbXMuYm94LnhcbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC55ID0gQHBhcmFtcy5ib3gueVxuICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LndpZHRoID0gQHBhcmFtcy5ib3guc2l6ZS53aWR0aFxuICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LmhlaWdodCA9IEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0XG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNZXNzYWdlRmFkaW5nXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRNZXNzYWdlRmFkaW5nOiAtPlxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZyA9IGR1cmF0aW9uOiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pLCBhbmltYXRpb246IEBwYXJhbXMuYW5pbWF0aW9uLCBlYXNpbmc6IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWVzc2FnZVNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kTWVzc2FnZVNldHRpbmdzOiAtPlxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKVxuICAgICAgICBpZiAhbWVzc2FnZU9iamVjdCB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBtZXNzYWdlU2V0dGluZ3MgPSBAaW50ZXJwcmV0ZXIubWVzc2FnZVNldHRpbmdzKClcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hdXRvRXJhc2UpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MuYXV0b0VyYXNlID0gQHBhcmFtcy5hdXRvRXJhc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mud2FpdEF0RW5kKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLndhaXRBdEVuZCA9IEBwYXJhbXMud2FpdEF0RW5kXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmJhY2tsb2cpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MuYmFja2xvZyA9IEBwYXJhbXMuYmFja2xvZ1xuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpbmVIZWlnaHQpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MubGluZUhlaWdodCA9IEBwYXJhbXMubGluZUhlaWdodFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpbmVTcGFjaW5nKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLmxpbmVTcGFjaW5nID0gQHBhcmFtcy5saW5lU3BhY2luZ1xuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpbmVQYWRkaW5nKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLmxpbmVQYWRkaW5nID0gQHBhcmFtcy5saW5lUGFkZGluZ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5wYXJhZ3JhcGhTcGFjaW5nKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLnBhcmFncmFwaFNwYWNpbmcgPSBAcGFyYW1zLnBhcmFncmFwaFNwYWNpbmdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MudXNlQ2hhcmFjdGVyQ29sb3IpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MudXNlQ2hhcmFjdGVyQ29sb3IgPSBAcGFyYW1zLnVzZUNoYXJhY3RlckNvbG9yXG4gICAgICAgICAgICBcbiAgICAgICAgbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIubWluTGluZUhlaWdodCA9IG1lc3NhZ2VTZXR0aW5ncy5saW5lSGVpZ2h0ID8gMFxuICAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5saW5lU3BhY2luZyA9IG1lc3NhZ2VTZXR0aW5ncy5saW5lU3BhY2luZyA/IG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLmxpbmVTcGFjaW5nXG4gICAgICAgIG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLnBhZGRpbmcgPSBtZXNzYWdlU2V0dGluZ3MubGluZVBhZGRpbmcgPyBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5wYWRkaW5nXG4gICAgICAgIFxuICAgICAgICBmb250TmFtZSA9IGlmICFpc0xvY2tlZChmbGFncy5mb250KSB0aGVuIEBwYXJhbXMuZm9udCBlbHNlIG1lc3NhZ2VPYmplY3QuZm9udC5uYW1lXG4gICAgICAgIGZvbnRTaXplID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNpemUpIHRoZW4gQHBhcmFtcy5zaXplIGVsc2UgbWVzc2FnZU9iamVjdC5mb250LnNpemVcbiAgICAgICAgZm9udCA9IG1lc3NhZ2VPYmplY3QuZm9udFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZm9udCkgb3IgIWlzTG9ja2VkKGZsYWdzLnNpemUpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQgPSBuZXcgRm9udChmb250TmFtZSwgZm9udFNpemUpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmJvbGQpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuYm9sZCA9IEBwYXJhbXMuYm9sZFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuaXRhbGljKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250Lml0YWxpYyA9IEBwYXJhbXMuaXRhbGljXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zbWFsbENhcHMpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc21hbGxDYXBzID0gQHBhcmFtcy5zbWFsbENhcHNcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnVuZGVybGluZSlcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC51bmRlcmxpbmUgPSBAcGFyYW1zLnVuZGVybGluZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc3RyaWtlVGhyb3VnaClcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zdHJpa2VUaHJvdWdoID0gQHBhcmFtcy5zdHJpa2VUaHJvdWdoXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5jb2xvcilcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5jb2xvciA9IG5ldyBDb2xvcihAcGFyYW1zLmNvbG9yKVxuICAgICAgICAgICAgXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5jb2xvciA9IGlmIGZsYWdzLmNvbG9yPyBhbmQgIWlzTG9ja2VkKGZsYWdzLmNvbG9yKSB0aGVuIG5ldyBDb2xvcihAcGFyYW1zLmNvbG9yKSBlbHNlIGZvbnQuY29sb3JcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmJvcmRlciA9IGlmIGZsYWdzLm91dGxpbmU/IGFuZCAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZSkgdGhlbiBAcGFyYW1zLm91dGxpbmUgZWxzZSBmb250LmJvcmRlclxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuYm9yZGVyQ29sb3IgPSBpZiBmbGFncy5vdXRsaW5lQ29sb3I/IGFuZCAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZUNvbG9yKSB0aGVuIG5ldyBDb2xvcihAcGFyYW1zLm91dGxpbmVDb2xvcikgZWxzZSBuZXcgQ29sb3IoZm9udC5ib3JkZXJDb2xvcilcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmJvcmRlclNpemUgPSBpZiBmbGFncy5vdXRsaW5lU2l6ZT8gYW5kICFpc0xvY2tlZChmbGFncy5vdXRsaW5lU2l6ZSkgdGhlbiAoQHBhcmFtcy5vdXRsaW5lU2l6ZSA/IDQpIGVsc2UgZm9udC5ib3JkZXJTaXplXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zaGFkb3cgPSBpZiBmbGFncy5zaGFkb3c/IGFuZCAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93KXRoZW4gQHBhcmFtcy5zaGFkb3cgZWxzZSBmb250LnNoYWRvd1xuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc2hhZG93Q29sb3IgPSBpZiBmbGFncy5zaGFkb3dDb2xvcj8gYW5kICFpc0xvY2tlZChmbGFncy5zaGFkb3dDb2xvcikgdGhlbiBuZXcgQ29sb3IoQHBhcmFtcy5zaGFkb3dDb2xvcikgZWxzZSBuZXcgQ29sb3IoZm9udC5zaGFkb3dDb2xvcilcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnNoYWRvd09mZnNldFggPSBpZiBmbGFncy5zaGFkb3dPZmZzZXRYPyBhbmQgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFgpIHRoZW4gKEBwYXJhbXMuc2hhZG93T2Zmc2V0WCA/IDEpIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRYXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zaGFkb3dPZmZzZXRZID0gaWYgZmxhZ3Muc2hhZG93T2Zmc2V0WT8gYW5kICFpc0xvY2tlZChmbGFncy5zaGFkb3dPZmZzZXRZKSB0aGVuIChAcGFyYW1zLnNoYWRvd09mZnNldFkgPyAxKSBlbHNlIGZvbnQuc2hhZG93T2Zmc2V0WVxuICAgICAgICBcbiAgICAgICAgaWYgaXNMb2NrZWQoZmxhZ3MuYm9sZCkgdGhlbiBtZXNzYWdlT2JqZWN0LmZvbnQuYm9sZCA9IGZvbnQuYm9sZFxuICAgICAgICBpZiBpc0xvY2tlZChmbGFncy5pdGFsaWMpIHRoZW4gbWVzc2FnZU9iamVjdC5mb250Lml0YWxpYyA9IGZvbnQuaXRhbGljXG4gICAgICAgIGlmIGlzTG9ja2VkKGZsYWdzLnNtYWxsQ2FwcykgdGhlbiBtZXNzYWdlT2JqZWN0LmZvbnQuc21hbGxDYXBzID0gZm9udC5zbWFsbENhcHNcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENyZWF0ZU1lc3NhZ2VBcmVhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kQ3JlYXRlTWVzc2FnZUFyZWE6IC0+XG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VNZXNzYWdlQXJlYURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgaWYgIXNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdXG4gICAgICAgICAgICBtZXNzYWdlQXJlYSA9IG5ldyBncy5PYmplY3RfTWVzc2FnZUFyZWEoKVxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0ID0gdWkuVUlNYW5hZ2VyLmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih0eXBlOiBcInVpLkN1c3RvbUdhbWVNZXNzYWdlXCIsIGlkOiBcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlciwgcGFyYW1zOiB7IGlkOiBcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlciB9LCBtZXNzYWdlQXJlYSlcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLm1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlcitcIl9tZXNzYWdlXCIpXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5tZXNzYWdlLmRvbWFpbiA9IEBwYXJhbXMubnVtYmVyRG9tYWluXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5hZGRPYmplY3QobWVzc2FnZUFyZWEubGF5b3V0KVxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0LmRzdFJlY3QueCA9IEBwYXJhbXMuYm94LnhcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5kc3RSZWN0LnkgPSBAcGFyYW1zLmJveC55XG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQuZHN0UmVjdC53aWR0aCA9IEBwYXJhbXMuYm94LnNpemUud2lkdGhcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5kc3RSZWN0LmhlaWdodCA9IEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0XG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgIHNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdID0gbWVzc2FnZUFyZWFcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRFcmFzZU1lc3NhZ2VBcmVhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kRXJhc2VNZXNzYWdlQXJlYTogLT5cbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBhcmVhID0gc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl0gXG4gICAgICAgIGFyZWE/LmxheW91dC5kaXNwb3NlKClcbiAgICAgICAgc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl0gPSBudWxsXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTZXRUYXJnZXRNZXNzYWdlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2V0VGFyZ2V0TWVzc2FnZTogLT5cbiAgICAgICAgbWVzc2FnZSA9IEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKClcbiAgICAgICAgbWVzc2FnZT8udGV4dFJlbmRlcmVyLmlzV2FpdGluZyA9IGZhbHNlXG4gICAgICAgIG1lc3NhZ2U/LmJlaGF2aW9yLmlzV2FpdGluZyA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VNZXNzYWdlQXJlYURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgdGFyZ2V0ID0geyB0eXBlOiBAcGFyYW1zLnR5cGUsIGlkOiBudWxsIH1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIExheW91dC1iYXNlZFxuICAgICAgICAgICAgICAgIHRhcmdldC5pZCA9IEBwYXJhbXMuaWRcbiAgICAgICAgICAgIHdoZW4gMSAjIEN1c3RvbVxuICAgICAgICAgICAgICAgIHRhcmdldC5pZCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0dGluZ3MubWVzc2FnZS50YXJnZXQgPSB0YXJnZXRcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuY2xlYXJcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKCk/LmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKT8udmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmFja2xvZ1Zpc2liaWxpdHlcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRCYWNrbG9nVmlzaWJpbGl0eTogLT5cbiAgICAgICAgaWYgQHBhcmFtcy52aXNpYmxlIFxuICAgICAgICAgICAgY29udHJvbCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiYmFja2xvZ0JveFwiKVxuICAgICAgICAgICAgaWYgbm90IGNvbnRyb2w/IHRoZW4gY29udHJvbCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiYmFja2xvZ1wiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjb250cm9sP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGlzcG9zZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBwYXJhbXMuYmFja2dyb3VuZFZpc2libGVcbiAgICAgICAgICAgICAgICBjb250cm9sID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNyZWF0ZUNvbnRyb2wodGhpcywgeyBkZXNjcmlwdG9yOiBcInVpLk1lc3NhZ2VCYWNrbG9nQm94XCIgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNyZWF0ZUNvbnRyb2wodGhpcywgeyBkZXNjcmlwdG9yOiBcInVpLk1lc3NhZ2VCYWNrbG9nXCIgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29udHJvbCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiYmFja2xvZ0JveFwiKVxuICAgICAgICAgICAgaWYgbm90IGNvbnRyb2w/IHRoZW4gY29udHJvbCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiYmFja2xvZ1wiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb250cm9sPy5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNZXNzYWdlVmlzaWJpbGl0eVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTWVzc2FnZVZpc2liaWxpdHk6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubWVzc2FnZUJveFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBtZXNzYWdlID0gQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKVxuICAgICAgICBpZiBub3QgbWVzc2FnZT8gb3IgQHBhcmFtcy52aXNpYmxlID09IG1lc3NhZ2UudmlzaWJsZSB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy52aXNpYmxlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2UuYW5pbWF0b3IuYXBwZWFyKG1lc3NhZ2UuZHN0UmVjdC54LCBtZXNzYWdlLmRzdFJlY3QueSwgQHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICAgICAgbWVzc2FnZS5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAtPiBtZXNzYWdlLnZpc2libGUgPSBubylcbiAgICAgICAgbWVzc2FnZS51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNZXNzYWdlQm94VmlzaWJpbGl0eVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTWVzc2FnZUJveFZpc2liaWxpdHk6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubWVzc2FnZUJveFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIG1lc3NhZ2VCb3ggPSBAaW50ZXJwcmV0ZXIubWVzc2FnZUJveE9iamVjdChAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmlkKSlcbiAgICAgICAgdmlzaWJsZSA9IEBwYXJhbXMudmlzaWJsZSA9PSAxXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlQm94PyBvciB2aXNpYmxlID09IG1lc3NhZ2VCb3gudmlzaWJsZSB0aGVuIHJldHVyblxuICBcbiAgICAgICAgaWYgQHBhcmFtcy52aXNpYmxlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2VCb3guYW5pbWF0b3IuYXBwZWFyKG1lc3NhZ2VCb3guZHN0UmVjdC54LCBtZXNzYWdlQm94LmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2VCb3guYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgLT4gbWVzc2FnZUJveC52aXNpYmxlID0gbm8pXG4gICAgICAgIG1lc3NhZ2VCb3gudXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVUlBY2Nlc3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFVJQWNjZXNzOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZ2VuZXJhbE1lbnUpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVudUFjY2VzcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLmdlbmVyYWxNZW51KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc2F2ZU1lbnUpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2F2ZU1lbnVBY2Nlc3MgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zYXZlTWVudSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxvYWRNZW51KVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLmxvYWRNZW51QWNjZXNzID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMubG9hZE1lbnUpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5iYWNrbG9nKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLmJhY2tsb2dBY2Nlc3MgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5iYWNrbG9nKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVW5sb2NrQ0dcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kVW5sb2NrQ0c6IC0+XG4gICAgICAgIGNnID0gUmVjb3JkTWFuYWdlci5jZ0dhbGxlcnlbQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jZ0lkKV1cbiAgICAgICAgXG4gICAgICAgIGlmIGNnP1xuICAgICAgICAgICAgR2FtZU1hbmFnZXIuZ2xvYmFsRGF0YS5jZ0dhbGxlcnlbY2cuaW5kZXhdID0geyB1bmxvY2tlZDogeWVzIH1cbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNhdmVHbG9iYWxEYXRhKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJETW92ZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgY29tbWFuZEwyRE1vdmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyIGluc3RhbmNlb2Ygdm4uT2JqZWN0X0xpdmUyRENoYXJhY3RlciB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3QoY2hhcmFjdGVyLCBAcGFyYW1zLnBvc2l0aW9uLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRNb3Rpb25Hcm91cFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRMMkRNb3Rpb25Hcm91cDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBjaGFyYWN0ZXIubW90aW9uR3JvdXAgPSB7IG5hbWU6IEBwYXJhbXMuZGF0YS5tb3Rpb25Hcm91cCwgbG9vcDogQHBhcmFtcy5sb29wLCBwbGF5VHlwZTogQHBhcmFtcy5wbGF5VHlwZSB9XG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCBAcGFyYW1zLmxvb3BcbiAgICAgICAgICAgIG1vdGlvbnMgPSBjaGFyYWN0ZXIubW9kZWwubW90aW9uc0J5R3JvdXBbY2hhcmFjdGVyLm1vdGlvbkdyb3VwLm5hbWVdXG4gICAgICAgICAgICBpZiBtb3Rpb25zP1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBtb3Rpb25zLnN1bSAobSkgLT4gbS5nZXREdXJhdGlvbk1TZWMoKSAvIDE2LjZcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJETW90aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kTDJETW90aW9uOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyIGluc3RhbmNlb2Ygdm4uT2JqZWN0X0xpdmUyRENoYXJhY3RlciB0aGVuIHJldHVyblxuICAgICAgICBmYWRlSW5UaW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZhZGVJblRpbWUpIHRoZW4gQHBhcmFtcy5mYWRlSW5UaW1lIGVsc2UgZGVmYXVsdHMubW90aW9uRmFkZUluVGltZVxuICAgICAgICBjaGFyYWN0ZXIubW90aW9uID0geyBuYW1lOiBAcGFyYW1zLmRhdGEubW90aW9uLCBmYWRlSW5UaW1lOiBmYWRlSW5UaW1lLCBsb29wOiBAcGFyYW1zLmxvb3AgfVxuICAgICAgICBjaGFyYWN0ZXIubW90aW9uR3JvdXAgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgQHBhcmFtcy5sb29wXG4gICAgICAgICAgICBtb3Rpb24gPSBjaGFyYWN0ZXIubW9kZWwubW90aW9uc1tjaGFyYWN0ZXIubW90aW9uLm5hbWVdXG4gICAgICAgICAgICBpZiBtb3Rpb24/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IG1vdGlvbi5nZXREdXJhdGlvbk1TZWMoKSAvIDE2LjZcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJERXhwcmVzc2lvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTDJERXhwcmVzc2lvbjogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5saXZlMmRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCBcbiAgICAgICAgaWYgbm90IGNoYXJhY3RlciBpbnN0YW5jZW9mIHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIgdGhlbiByZXR1cm5cbiAgICAgICAgZmFkZUluVGltZSA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlSW5UaW1lKSB0aGVuIEBwYXJhbXMuZmFkZUluVGltZSBlbHNlIGRlZmF1bHRzLmV4cHJlc3Npb25GYWRlSW5UaW1lXG4gICAgICAgIFxuICAgICAgICBjaGFyYWN0ZXIuZXhwcmVzc2lvbiA9IHsgbmFtZTogQHBhcmFtcy5kYXRhLmV4cHJlc3Npb24sIGZhZGVJblRpbWU6IGZhZGVJblRpbWUgfVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJERXhpdFNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kTDJERXhpdFNjZW5lOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBAaW50ZXJwcmV0ZXIuY29tbWFuZENoYXJhY3RlckV4aXRTY2VuZS5jYWxsKHRoaXMsIGRlZmF1bHRzKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTDJEU2V0dGluZ3M6IC0+XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPy52aXN1YWwubDJkT2JqZWN0IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpcFN5bmNTZW5zaXRpdml0eSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmxpcFN5bmNTZW5zaXRpdml0eSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGlwU3luY1NlbnNpdGl2aXR5KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuaWRsZUludGVuc2l0eSkgICAgXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5pZGxlSW50ZW5zaXR5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pZGxlSW50ZW5zaXR5KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYnJlYXRoSW50ZW5zaXR5KVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuYnJlYXRoSW50ZW5zaXR5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5icmVhdGhJbnRlbnNpdHkpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLmVuYWJsZWRcIl0pXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5leWVCbGluay5lbmFibGVkID0gQHBhcmFtcy5leWVCbGluay5lbmFibGVkXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLmludGVydmFsXCJdKVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuZXllQmxpbmsuYmxpbmtJbnRlcnZhbE1zZWMgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmV5ZUJsaW5rLmludGVydmFsKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJleWVCbGluay5jbG9zZWRNb3Rpb25UaW1lXCJdKVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuZXllQmxpbmsuY2xvc2VkTW90aW9uTXNlYyA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZXllQmxpbmsuY2xvc2VkTW90aW9uVGltZSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsuY2xvc2luZ01vdGlvblRpbWVcIl0pXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5leWVCbGluay5jbG9zaW5nTW90aW9uTXNlYyA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZXllQmxpbmsuY2xvc2luZ01vdGlvblRpbWUpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLm9wZW5pbmdNb3Rpb25UaW1lXCJdKVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuZXllQmxpbmsub3BlbmluZ01vdGlvbk1zZWMgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmV5ZUJsaW5rLm9wZW5pbmdNb3Rpb25UaW1lKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJEUGFyYW1ldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRMMkRQYXJhbWV0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyIGluc3RhbmNlb2Ygdm4uT2JqZWN0X0xpdmUyRENoYXJhY3RlciB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgY2hhcmFjdGVyLmFuaW1hdG9yLmwyZFBhcmFtZXRlclRvKEBwYXJhbXMucGFyYW0ubmFtZSwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wYXJhbS52YWx1ZSksIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyRERlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRMMkREZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5saXZlMmRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5tb3Rpb25GYWRlSW5UaW1lKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkZhZGVJblRpbWUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm1vdGlvbkZhZGVJblRpbWUpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckVhc2luZyA9IEBwYXJhbXMuYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZyA9IEBwYXJhbXMuZGlzYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRKb2luU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kTDJESm9pblNjZW5lOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKV1cbiAgICAgICAgcmV0dXJuIGlmICFyZWNvcmQgb3Igc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgLT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IHJlY29yZC5pbmRleFxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMVxuICAgICAgICAgICAgeCA9IEBwYXJhbXMucG9zaXRpb24ueFxuICAgICAgICAgICAgeSA9IEBwYXJhbXMucG9zaXRpb24ueVxuICAgICAgICBlbHNlIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDJcbiAgICAgICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIG1vdGlvbkJsdXIgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gQHBhcmFtcy5tb3Rpb25CbHVyIGVsc2UgZGVmYXVsdHMubW90aW9uQmx1clxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG5cbiAgICAgICAgY2hhcmFjdGVyID0gbmV3IHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIocmVjb3JkKVxuICAgICAgICBjaGFyYWN0ZXIubW9kZWxOYW1lID0gQHBhcmFtcy5tb2RlbD8ubmFtZSB8fCBcIlwiXG4gICAgICAgIGNoYXJhY3Rlci5tb2RlbCA9IFJlc291cmNlTWFuYWdlci5nZXRMaXZlMkRNb2RlbChcIkxpdmUyRC8je2NoYXJhY3Rlci5tb2RlbE5hbWV9XCIpXG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb24gPSB7IG5hbWU6IFwiXCIsIGZhZGVJblRpbWU6IDAsIGxvb3A6IHRydWUgfSBpZiBjaGFyYWN0ZXIubW9kZWwubW90aW9uc1xuICAgICAgICAjY2hhcmFjdGVyLmV4cHJlc3Npb24gPSB7IG5hbWU6IE9iamVjdC5rZXlzKGNoYXJhY3Rlci5tb2RlbC5leHByZXNzaW9ucylbMF0sIGZhZGVJblRpbWU6IDAgfSBpZiBjaGFyYWN0ZXIubW9kZWwuZXhwcmVzc2lvbnNcbiAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueCA9IHhcbiAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueSA9IHlcbiAgICAgICAgY2hhcmFjdGVyLmFuY2hvci54ID0gaWYgIW9yaWdpbiB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgY2hhcmFjdGVyLmFuY2hvci55ID0gaWYgIW9yaWdpbiB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci5ibGVuZE1vZGUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJsZW5kTW9kZSlcbiAgICAgICAgY2hhcmFjdGVyLnpvb20ueCA9IEBwYXJhbXMucG9zaXRpb24uem9vbS5kXG4gICAgICAgIGNoYXJhY3Rlci56b29tLnkgPSBAcGFyYW1zLnBvc2l0aW9uLnpvb20uZFxuICAgICAgICBjaGFyYWN0ZXIuekluZGV4ID0gekluZGV4IHx8IDIwMFxuICAgICAgICBjaGFyYWN0ZXIubW9kZWw/LnJlc2V0KClcbiAgICAgICAgY2hhcmFjdGVyLnNldHVwKClcbiAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuaWRsZUludGVuc2l0eSA9IHJlY29yZC5pZGxlSW50ZW5zaXR5ID8gMS4wXG4gICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmJyZWF0aEludGVuc2l0eSA9IHJlY29yZC5icmVhdGhJbnRlbnNpdHkgPyAxLjAgXG4gICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmxpcFN5bmNTZW5zaXRpdml0eSA9IHJlY29yZC5saXBTeW5jU2Vuc2l0aXZpdHkgPyAxLjBcbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgY2hhcmFjdGVyLCBAcGFyYW1zKVxuICAgICAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueSA9IHAueVxuICAgICAgICBcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuYWRkQ2hhcmFjdGVyKGNoYXJhY3Rlciwgbm8sIHsgYW5pbWF0aW9uOiBhbmltYXRpb24sIGR1cmF0aW9uOiBkdXJhdGlvbiwgZWFzaW5nOiBlYXNpbmcsIG1vdGlvbkJsdXI6IG1vdGlvbkJsdXJ9KVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy52aWV3cG9ydD8udHlwZSA9PSBcInVpXCJcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aWV3cG9ydCA9IEdyYXBoaWNzLnZpZXdwb3J0XG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVySm9pblNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZENoYXJhY3RlckpvaW5TY2VuZTogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXJcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICByZWNvcmQgPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbQHBhcmFtcy5jaGFyYWN0ZXJJZF1cbiAgICAgICAgcmV0dXJuIGlmICFyZWNvcmQgb3Igc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgLT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IHJlY29yZC5pbmRleCBhbmQgIXYuZGlzcG9zZWRcbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3RlciA9IG5ldyB2bi5PYmplY3RfQ2hhcmFjdGVyKHJlY29yZCwgbnVsbCwgc2NlbmUpXG4gICAgICAgIGNoYXJhY3Rlci5leHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tAcGFyYW1zLmV4cHJlc3Npb25JZCA/IHJlY29yZC5kZWZhdWx0RXhwcmVzc2lvbklkfHwwXSAjY2hhcmFjdGVyLmV4cHJlc3Npb25cbiAgICAgICAgaWYgY2hhcmFjdGVyLmV4cHJlc3Npb24/XG4gICAgICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy8je2NoYXJhY3Rlci5leHByZXNzaW9uLmlkbGVbMF0/LnJlc291cmNlLm5hbWV9XCIpXG4gICAgICAgIFxuICAgICAgICBtaXJyb3IgPSBub1xuICAgICAgICBhbmdsZSA9IDBcbiAgICAgICAgem9vbSA9IDFcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDFcbiAgICAgICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICAgICAgbWlycm9yID0gQHBhcmFtcy5wb3NpdGlvbi5ob3Jpem9udGFsRmxpcFxuICAgICAgICAgICAgYW5nbGUgPSBAcGFyYW1zLnBvc2l0aW9uLmFuZ2xlfHwwXG4gICAgICAgICAgICB6b29tID0gQHBhcmFtcy5wb3NpdGlvbi5kYXRhPy56b29tIHx8IDFcbiAgICAgICAgZWxzZSBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAyXG4gICAgICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi54KVxuICAgICAgICAgICAgeSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgICAgIG1pcnJvciA9IG5vXG4gICAgICAgICAgICBhbmdsZSA9IDBcbiAgICAgICAgICAgIHpvb20gPSAxXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIG1vdGlvbkJsdXIgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gQHBhcmFtcy5tb3Rpb25CbHVyIGVsc2UgZGVmYXVsdHMubW90aW9uQmx1clxuICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBjaGFyYWN0ZXIuZXhwcmVzc2lvbj9cbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9DaGFyYWN0ZXJzLyN7Y2hhcmFjdGVyLmV4cHJlc3Npb24uaWRsZVswXT8ucmVzb3VyY2UubmFtZX1cIilcbiAgICAgICAgICAgIGlmIEBwYXJhbXMub3JpZ2luID09IDEgYW5kIGJpdG1hcD9cbiAgICAgICAgICAgICAgICB4ICs9IChiaXRtYXAud2lkdGgqem9vbS1iaXRtYXAud2lkdGgpLzJcbiAgICAgICAgICAgICAgICB5ICs9IChiaXRtYXAuaGVpZ2h0Knpvb20tYml0bWFwLmhlaWdodCkvMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBjaGFyYWN0ZXIubWlycm9yID0gbWlycm9yXG4gICAgICAgIGNoYXJhY3Rlci5hbmNob3IueCA9IGlmICFvcmlnaW4gdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIGNoYXJhY3Rlci5hbmNob3IueSA9IGlmICFvcmlnaW4gdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIGNoYXJhY3Rlci56b29tLnggPSB6b29tXG4gICAgICAgIGNoYXJhY3Rlci56b29tLnkgPSB6b29tXG4gICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnggPSB4XG4gICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnkgPSB5XG4gICAgICAgIGNoYXJhY3Rlci56SW5kZXggPSB6SW5kZXggfHwgIDIwMFxuICAgICAgICBjaGFyYWN0ZXIuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIGNoYXJhY3Rlci5hbmdsZSA9IGFuZ2xlXG4gICAgICAgIGNoYXJhY3Rlci5zZXR1cCgpXG4gICAgICAgIGNoYXJhY3Rlci51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgY2hhcmFjdGVyLCBAcGFyYW1zKVxuICAgICAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueSA9IHAueVxuICAgICAgICBcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuYWRkQ2hhcmFjdGVyKGNoYXJhY3Rlciwgbm8sIHsgYW5pbWF0aW9uOiBhbmltYXRpb24sIGR1cmF0aW9uOiBkdXJhdGlvbiwgZWFzaW5nOiBlYXNpbmcsIG1vdGlvbkJsdXI6IG1vdGlvbkJsdXJ9KVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy52aWV3cG9ydD8udHlwZSA9PSBcInVpXCJcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aWV3cG9ydCA9IEdyYXBoaWNzLnZpZXdwb3J0XG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyRXhpdFNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZENoYXJhY3RlckV4aXRTY2VuZTogKGRlZmF1bHRzKSAtPlxuICAgICAgICBkZWZhdWx0cyA9IGRlZmF1bHRzIHx8IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZFxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IucmVtb3ZlQ2hhcmFjdGVyKGNoYXJhY3RlciwgeyBhbmltYXRpb246IGFuaW1hdGlvbiwgZHVyYXRpb246IGR1cmF0aW9uLCBlYXNpbmc6IGVhc2luZ30pICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckNoYW5nZUV4cHJlc3Npb25cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRDaGFyYWN0ZXJDaGFuZ2VFeHByZXNzaW9uOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXJcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmV4cHJlc3Npb25EdXJhdGlvblxuICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tAcGFyYW1zLmV4cHJlc3Npb25JZCB8fCAwXVxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmNoYW5nZUVhc2luZylcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5jaGFuZ2VBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci5iZWhhdmlvci5jaGFuZ2VFeHByZXNzaW9uKGV4cHJlc3Npb24sIEBwYXJhbXMuYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJTZXRQYXJhbWV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZENoYXJhY3RlclNldFBhcmFtZXRlcjogLT5cbiAgICAgICAgcGFyYW1zID0gR2FtZU1hbmFnZXIuY2hhcmFjdGVyUGFyYW1zW0BpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXVxuICAgICAgICBpZiBub3QgcGFyYW1zPyBvciBub3QgQHBhcmFtcy5wYXJhbT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpID4gMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaCBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBpZiB2YWx1ZSB0aGVuIDEgZWxzZSAwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IGlmIHZhbHVlIHRoZW4gXCJPTlwiIGVsc2UgXCJPRkZcIlxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKSA9PSBcIk9OXCJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJHZXRQYXJhbWV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZENoYXJhY3RlckdldFBhcmFtZXRlcjogLT5cbiAgICAgICAgcGFyYW1zID0gR2FtZU1hbmFnZXIuY2hhcmFjdGVyUGFyYW1zW0BpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXVxuICAgICAgICBpZiBub3QgcGFyYW1zPyBvciBub3QgQHBhcmFtcy5wYXJhbT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhbHVlID0gcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlIHRoZW4gMSBlbHNlIDApXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlPyB0aGVuIHZhbHVlLmxlbmd0aCBlbHNlIDApXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlID4gMClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSA9PSBcIk9OXCIpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBpZiB2YWx1ZT8gdGhlbiB2YWx1ZS50b1N0cmluZygpIGVsc2UgXCJcIilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBpZiB2YWx1ZSB0aGVuIFwiT05cIiBlbHNlIFwiT0ZGXCIpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3Rlck1vdGlvbkJsdXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyTW90aW9uQmx1cjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWRcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cblxuICAgICAgICBjaGFyYWN0ZXIubW90aW9uQmx1ci5zZXQoQHBhcmFtcy5tb3Rpb25CbHVyKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJEZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyRGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuY2hhcmFjdGVyXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZXhwcmVzc2lvbkR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmV4cHJlc3Npb25EdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5leHByZXNzaW9uRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckVhc2luZyA9IEBwYXJhbXMuYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZyA9IEBwYXJhbXMuZGlzYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcIm1vdGlvbkJsdXIuZW5hYmxlZFwiXSkgdGhlbiBkZWZhdWx0cy5tb3Rpb25CbHVyID0gQHBhcmFtcy5tb3Rpb25CbHVyXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gZGVmYXVsdHMub3JpZ2luID0gQHBhcmFtcy5vcmlnaW5cbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJFZmZlY3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyRWZmZWN0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKGMpIC0+ICFjLmRpc3Bvc2VkIGFuZCBjLnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdEVmZmVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRmxhc2hDaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICBcbiAgICBjb21tYW5kRmxhc2hDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNoYXJhY3RlclxuICAgICAgICBcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGNoYXJhY3Rlci5hbmltYXRvci5mbGFzaChuZXcgQ29sb3IoQHBhcmFtcy5jb2xvciksIGR1cmF0aW9uKVxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGludENoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFRpbnRDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KVxuICAgICAgICByZXR1cm4gaWYgbm90IGNoYXJhY3RlclxuICAgICAgICBcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGNoYXJhY3Rlci5hbmltYXRvci50aW50VG8oQHBhcmFtcy50b25lLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFpvb21DaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFpvb21DaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkICAgICAgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuem9vbU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kUm90YXRlQ2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCAgICAgIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmxlbmRDaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmxlbmRDaGFyYWN0ZXI6IC0+XG4gICAgICAgIGNoYXJhY3RlciA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCAgICAgIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmJsZW5kT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcykgXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hha2VDaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hha2VDaGFyYWN0ZXI6IC0+IFxuICAgICAgICBjaGFyYWN0ZXIgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kICB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkICAgICAgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIEBpbnRlcnByZXRlci5zaGFrZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpICBcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tDaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTWFza0NoYXJhY3RlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgICAgICBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tYXNrT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVDaGFyYWN0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZE1vdmVDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkICAgICAgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlQ2hhcmFjdGVyUGF0aFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNb3ZlQ2hhcmFjdGVyUGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgICAgICBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0UGF0aChjaGFyYWN0ZXIsIEBwYXJhbXMucGF0aCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNoYWtlQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kU2hha2VCYWNrZ3JvdW5kOiAtPiBcbiAgICAgICAgYmFja2dyb3VuZCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hha2VPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFNjcm9sbEJhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBob3Jpem9udGFsU3BlZWQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmhvcml6b250YWxTcGVlZClcbiAgICAgICAgdmVydGljYWxTcGVlZCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudmVydGljYWxTcGVlZClcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dClcbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgIFxuICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0/LmFuaW1hdG9yLm1vdmUoaG9yaXpvbnRhbFNwZWVkLCB2ZXJ0aWNhbFNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFRvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFRvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYmFja2dyb3VuZC5sb2NhdGlvbi54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5iYWNrZ3JvdW5kLmxvY2F0aW9uLnkpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiAhYmFja2dyb3VuZCB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIGJhY2tncm91bmQsIEBwYXJhbXMpXG4gICAgICAgICAgICB4ID0gcC54XG4gICAgICAgICAgICB5ID0gcC55XG4gICAgIFxuICAgICAgICBiYWNrZ3JvdW5kLmFuaW1hdG9yLm1vdmVUbyh4LCB5LCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFBhdGhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFBhdGg6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgcmV0dXJuIHVubGVzcyBiYWNrZ3JvdW5kP1xuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3RQYXRoKGJhY2tncm91bmQsIEBwYXJhbXMucGF0aCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1hc2tCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBiYWNrZ3JvdW5kID0gc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgIHJldHVybiB1bmxlc3MgYmFja2dyb3VuZD9cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tYXNrT2JqZWN0KGJhY2tncm91bmQsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbUJhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFpvb21CYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuem9vbWluZy54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56b29taW5nLnkpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXT8uYW5pbWF0b3Iuem9vbVRvKHggLyAxMDAsIHkgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSb3RhdGVCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRSb3RhdGVCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBiYWNrZ3JvdW5kID0gc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgIFxuICAgICAgICBpZiBiYWNrZ3JvdW5kXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KGJhY2tncm91bmQsIEBwYXJhbXMpXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgICAgICBcbiAgICAjIyMqICAgICAgICBcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFRpbnRCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBsYXllciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXG4gICAgICAgIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBiYWNrZ3JvdW5kLmFuaW1hdG9yLnRpbnRUbyhAcGFyYW1zLnRvbmUsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdEZvckNvbXBsZXRpb24oYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZEJhY2tncm91bmQ6IC0+XG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcykgXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmFja2dyb3VuZEVmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZEJhY2tncm91bmRFZmZlY3Q6IC0+XG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KGJhY2tncm91bmQsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCYWNrZ3JvdW5kRGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kQmFja2dyb3VuZERlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmJhY2tncm91bmRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5lYXNpbmcgPSBAcGFyYW1zLmVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hbmltYXRpb24gPSBAcGFyYW1zLmFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5sb29wSG9yaXpvbnRhbCkgdGhlbiBkZWZhdWx0cy5sb29wSG9yaXpvbnRhbCA9IEBwYXJhbXMubG9vcEhvcml6b250YWxcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxvb3BWZXJ0aWNhbCkgdGhlbiBkZWZhdWx0cy5sb29wVmVydGljYWwgPSBAcGFyYW1zLmxvb3BWZXJ0aWNhbFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJhY2tncm91bmRNb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kQmFja2dyb3VuZE1vdGlvbkJsdXI6IC0+XG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBiYWNrZ3JvdW5kLm1vdGlvbkJsdXIuc2V0KEBwYXJhbXMubW90aW9uQmx1cilcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZENoYW5nZUJhY2tncm91bmQ6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYmFja2dyb3VuZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kdXJhdGlvblxuICAgICAgICBsb29wSCA9IGlmICFpc0xvY2tlZChmbGFncy5sb29wSG9yaXpvbnRhbCkgdGhlbiBAcGFyYW1zLmxvb3BIb3Jpem9udGFsIGVsc2UgZGVmYXVsdHMubG9vcEhvcml6b250YWxcbiAgICAgICAgbG9vcFYgPSBpZiAhaXNMb2NrZWQoZmxhZ3MubG9vcFZlcnRpY2FsKSB0aGVuIEBwYXJhbXMubG9vcFZlcnRpY2FsIGVsc2UgZGVmYXVsdHMubG9vcFZlcnRpY2FsXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYW5pbWF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZWFzaW5nKVxuICAgICAgICBsYXllciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUJhY2tncm91bmQoQHBhcmFtcy5ncmFwaGljLCBubywgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAwLCAwLCBsYXllciwgbG9vcEgsIGxvb3BWKVxuICAgICAgICBcbiAgICAgICAgaWYgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdXG4gICAgICAgICAgICBpZiBAcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwidWlcIlxuICAgICAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS52aWV3cG9ydCA9IEdyYXBoaWNzLnZpZXdwb3J0XG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYW5jaG9yLnggPSBpZiBvcmlnaW4gPT0gMCB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5hbmNob3IueSA9IGlmIG9yaWdpbiA9PSAwIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmJsZW5kTW9kZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYmxlbmRNb2RlKVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLnpJbmRleCA9IHpJbmRleFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcmlnaW4gPT0gMVxuICAgICAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5kc3RSZWN0LnggPSBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC54IyArIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5iaXRtYXAud2lkdGgvMlxuICAgICAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5kc3RSZWN0LnkgPSBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC55IyArIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5iaXRtYXAuaGVpZ2h0LzJcbiAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5zZXR1cCgpXG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0udXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDYWxsU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kQ2FsbFNjZW5lOiAtPlxuICAgICAgICBAaW50ZXJwcmV0ZXIuY2FsbFNjZW5lKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc2NlbmUudWlkIHx8IEBwYXJhbXMuc2NlbmUpKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VTY2VuZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmRDaGFuZ2VTY2VuZTogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlldyB0aGVuIHJldHVyblxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG4gICAgICAgIFxuICAgICAgICBpZiAhQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5jbGVhcigpXG4gICAgICAgICAgICBcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgaWYgIUBwYXJhbXMuZXJhc2VQaWN0dXJlcyBhbmQgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICBzY2VuZS5yZW1vdmVPYmplY3Qoc2NlbmUucGljdHVyZUNvbnRhaW5lcilcbiAgICAgICAgICAgIGZvciBwaWN0dXJlIGluIHNjZW5lLnBpY3R1cmVzXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQucmVtb3ZlKFwiR3JhcGhpY3MvUGljdHVyZXMvI3twaWN0dXJlLmltYWdlfVwiKSBpZiBwaWN0dXJlXG4gICAgICAgIGlmICFAcGFyYW1zLmVyYXNlVGV4dHMgYW5kICFAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgc2NlbmUucmVtb3ZlT2JqZWN0KHNjZW5lLnRleHRDb250YWluZXIpXG4gICAgICAjICBpZiAhQHBhcmFtcy5lcmFzZU1lc3NhZ2VBcmVhcyBhbmQgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAjICAgICAgc2NlbmUucmVtb3ZlT2JqZWN0KHNjZW5lLm1lc3NhZ2VBcmVhQ29udGFpbmVyKVxuICAgICAgIyAgaWYgIUBwYXJhbXMuZXJhc2VIb3RzcG90cyBhbmQgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAjICAgICAgc2NlbmUucmVtb3ZlT2JqZWN0KHNjZW5lLmhvdHNwb3RDb250YWluZXIpXG4gICAgICAgIGlmICFAcGFyYW1zLmVyYXNlVmlkZW9zIGFuZCAhQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS52aWRlb0NvbnRhaW5lcilcbiAgICAgICAgICAgIGZvciB2aWRlbyBpbiBzY2VuZS52aWRlb3NcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuY29udGV4dC5yZW1vdmUoXCJNb3ZpZXMvI3t2aWRlby52aWRlb31cIikgaWYgdmlkZW9cbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuc2NlbmVcbiAgICAgICAgICAgIGlmIEBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVEYXRhID0gdWlkOiB1aWQgPSBAcGFyYW1zLnNjZW5lLnVpZCwgcGljdHVyZXM6IFtdLCB0ZXh0czogW10sIHZpZGVvczogW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVpZDogdWlkID0gQHBhcmFtcy5zY2VuZS51aWQsIFxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlczogc2NlbmUucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sIFxuICAgICAgICAgICAgICAgICAgICB0ZXh0czogc2NlbmUudGV4dENvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sIFxuICAgICAgICAgICAgICAgICAgICB2aWRlb3M6IHNjZW5lLnZpZGVvQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpblxuICAgICAgICAgICAgICAgICMgICAgbWVzc2FnZUFyZWFzOiBzY2VuZS5tZXNzYWdlQXJlYUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sXG4gICAgICAgICAgICAgICAgICMgICBob3RzcG90czogc2NlbmUuaG90c3BvdENvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICAgICAgbmV3U2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKClcbiAgICAgICAgICAgIGlmIEBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICAgICAgbmV3U2NlbmUuc2NlbmVEYXRhID0gdWlkOiB1aWQgPSBAcGFyYW1zLnNjZW5lLnVpZCwgcGljdHVyZXM6IFtdLCB0ZXh0czogW10sIHZpZGVvczogW10sIGJhY2tsb2c6IEdhbWVNYW5hZ2VyLmJhY2tsb2dcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuZXdTY2VuZS5zY2VuZURhdGEgPSB1aWQ6IHVpZCA9IEBwYXJhbXMuc2NlbmUudWlkLCBwaWN0dXJlczogc2NlbmUucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sIHRleHRzOiBzY2VuZS50ZXh0Q29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbiwgdmlkZW9zOiBzY2VuZS52aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ld1NjZW5lLCBAcGFyYW1zLnNhdmVQcmV2aW91cywgPT4gQGludGVycHJldGVyLmlzV2FpdGluZyA9IG5vKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obnVsbClcbiAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJldHVyblRvUHJldmlvdXNTY2VuZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFJldHVyblRvUHJldmlvdXNTY2VuZTogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlldyB0aGVuIHJldHVyblxuICAgICAgICBTY2VuZU1hbmFnZXIucmV0dXJuVG9QcmV2aW91cyg9PiBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm8pXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFN3aXRjaFRvTGF5b3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRTd2l0Y2hUb0xheW91dDogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlldyB0aGVuIHJldHVyblxuICAgICAgICBpZiB1aS5VSU1hbmFnZXIubGF5b3V0c1tAcGFyYW1zLmxheW91dC5uYW1lXT9cbiAgICAgICAgICAgIHNjZW5lID0gbmV3IGdzLk9iamVjdF9MYXlvdXQoQHBhcmFtcy5sYXlvdXQubmFtZSlcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhzY2VuZSwgQHBhcmFtcy5zYXZlUHJldmlvdXMsID0+IEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBubylcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VUcmFuc2l0aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRDaGFuZ2VUcmFuc2l0aW9uOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEuZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5ncmFwaGljKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLmdyYXBoaWMgPSBAcGFyYW1zLmdyYXBoaWNcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnZhZ3VlKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLnZhZ3VlID0gQHBhcmFtcy52YWd1ZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGcmVlemVTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kRnJlZXplU2NyZWVuOiAtPiBcbiAgICAgICAgR3JhcGhpY3MuZnJlZXplKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JlZW5UcmFuc2l0aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2NyZWVuVHJhbnNpdGlvbjogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5zY2VuZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGdyYXBoaWNOYW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzLmdyYXBoaWMpIHRoZW4gQHBhcmFtcy5ncmFwaGljPy5uYW1lIGVsc2UgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLmdyYXBoaWM/Lm5hbWVcbiAgICAgICAgXG4gICAgICAgIGlmIGdyYXBoaWNOYW1lXG4gICAgICAgICAgICBiaXRtYXAgPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZ3JhcGhpYykgdGhlbiBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3tncmFwaGljTmFtZX1cIikgZWxzZSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3tncmFwaGljTmFtZX1cIilcbiAgICAgICAgdmFndWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3MudmFndWUpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52YWd1ZSkgZWxzZSBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEudmFndWVcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIFNjZW5lTWFuYWdlci50cmFuc2l0aW9uRGF0YS5kdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9ICFHYW1lTWFuYWdlci5pbkxpdmVQcmV2aWV3XG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgR3JhcGhpY3MudHJhbnNpdGlvbihkdXJhdGlvbiwgYml0bWFwLCB2YWd1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaGFrZVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaGFrZVNjcmVlbjogLT5cbiAgICAgICAgaWYgbm90IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydD8gdGhlbiByZXR1cm4gICAgICAgICAgICAgICAgXG4gICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5zaGFrZU9iamVjdChTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQsIEBwYXJhbXMpICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGludFNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kVGludFNjcmVlbjogLT5cbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmltYXRvci50aW50VG8obmV3IFRvbmUoQHBhcmFtcy50b25lKSwgZHVyYXRpb24sIGdzLkVhc2luZ3MuRUFTRV9MSU5FQVJbMF0pXG4gICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIGR1cmF0aW9uID4gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFpvb21TY3JlZW46IC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuY2hvci54ID0gMC41XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmNob3IueSA9IDAuNVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5pbWF0b3Iuem9vbVRvKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuem9vbWluZy54KSAvIDEwMCwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56b29taW5nLnkpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLndhaXRGb3JDb21wbGV0aW9uKG51bGwsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQYW5TY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kUGFuU2NyZWVuOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0dGluZ3Muc2NyZWVuLnBhbi54IC09IEBwYXJhbXMucG9zaXRpb24ueFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0dGluZ3Muc2NyZWVuLnBhbi55IC09IEBwYXJhbXMucG9zaXRpb24ueVxuICAgICAgICB2aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydFxuXG4gICAgICAgIHZpZXdwb3J0LmFuaW1hdG9yLnNjcm9sbFRvKC1AcGFyYW1zLnBvc2l0aW9uLnggKyB2aWV3cG9ydC5kc3RSZWN0LngsIC1AcGFyYW1zLnBvc2l0aW9uLnkgKyB2aWV3cG9ydC5kc3RSZWN0LnksIGR1cmF0aW9uLCBlYXNpbmcpICBcbiAgICAgICAgQGludGVycHJldGVyLndhaXRGb3JDb21wbGV0aW9uKG51bGwsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kUm90YXRlU2NyZWVuOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgcGFuID0gQGludGVycHJldGVyLnNldHRpbmdzLnNjcmVlbi5wYW5cblxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5jaG9yLnggPSAwLjVcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuY2hvci55ID0gMC41XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmltYXRvci5yb3RhdGUoQHBhcmFtcy5kaXJlY3Rpb24sIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLndhaXRGb3JDb21wbGV0aW9uKG51bGwsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmRGbGFzaFNjcmVlbjogLT5cbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmltYXRvci5mbGFzaChuZXcgQ29sb3IoQHBhcmFtcy5jb2xvciksIGR1cmF0aW9uLCBncy5FYXNpbmdzLkVBU0VfTElORUFSWzBdKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgZHVyYXRpb24gIT0gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2NyZWVuRWZmZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgIFxuICAgIGNvbW1hbmRTY3JlZW5FZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmICFncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZChmbGFncy56T3JkZXIpIFxuICAgICAgICAgICAgek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHpPcmRlciA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC56SW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICB2aWV3cG9ydCA9IHNjZW5lLnZpZXdwb3J0Q29udGFpbmVyLnN1Yk9iamVjdHMuZmlyc3QgKHYpIC0+IHYuekluZGV4ID09IHpPcmRlclxuICAgICAgICBcbiAgICAgICAgaWYgIXZpZXdwb3J0XG4gICAgICAgICAgICB2aWV3cG9ydCA9IG5ldyBncy5PYmplY3RfVmlld3BvcnQoKVxuICAgICAgICAgICAgdmlld3BvcnQuekluZGV4ID0gek9yZGVyXG4gICAgICAgICAgICBzY2VuZS52aWV3cG9ydENvbnRhaW5lci5hZGRPYmplY3Qodmlld3BvcnQpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy50eXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBXb2JibGVcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5hbmltYXRvci53b2JibGVUbyhAcGFyYW1zLndvYmJsZS5wb3dlciAvIDEwMDAwLCBAcGFyYW1zLndvYmJsZS5zcGVlZCAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgICAgICB3b2JibGUgPSB2aWV3cG9ydC5lZmZlY3RzLndvYmJsZVxuICAgICAgICAgICAgICAgIHdvYmJsZS5lbmFibGVkID0gQHBhcmFtcy53b2JibGUucG93ZXIgPiAwXG4gICAgICAgICAgICAgICAgd29iYmxlLnZlcnRpY2FsID0gQHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMCBvciBAcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAyXG4gICAgICAgICAgICAgICAgd29iYmxlLmhvcml6b250YWwgPSBAcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAxIG9yIEBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgIHdoZW4gMSAjIEJsdXJcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5hbmltYXRvci5ibHVyVG8oQHBhcmFtcy5ibHVyLnBvd2VyIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIHZpZXdwb3J0LmVmZmVjdHMuYmx1ci5lbmFibGVkID0geWVzXG4gICAgICAgICAgICB3aGVuIDIgIyBQaXhlbGF0ZVxuICAgICAgICAgICAgICAgIHZpZXdwb3J0LmFuaW1hdG9yLnBpeGVsYXRlVG8oQHBhcmFtcy5waXhlbGF0ZS5zaXplLndpZHRoLCBAcGFyYW1zLnBpeGVsYXRlLnNpemUuaGVpZ2h0LCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIHZpZXdwb3J0LmVmZmVjdHMucGl4ZWxhdGUuZW5hYmxlZCA9IHllc1xuICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBkdXJhdGlvbiAhPSAwXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRWaWRlb0RlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRWaWRlb0RlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnZpZGVvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmFwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmRpc2FwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gZGVmYXVsdHMubW90aW9uQmx1ciA9IEBwYXJhbXMubW90aW9uQmx1clxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd1ZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kU2hvd1ZpZGVvOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnZpZGVvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlb3MgPSBzY2VuZS52aWRlb3NcbiAgICAgICAgaWYgbm90IHZpZGVvc1tudW1iZXJdPyB0aGVuIHZpZGVvc1tudW1iZXJdID0gbmV3IGdzLk9iamVjdF9WaWRlbygpXG4gICAgICAgIFxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgb3JpZ2luID0gaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBAcGFyYW1zLm9yaWdpbiBlbHNlIGRlZmF1bHRzLm9yaWdpblxuICAgICAgICB6SW5kZXggPSBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKSBlbHNlIGRlZmF1bHRzLnpPcmRlclxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgdmlkZW8gPSB2aWRlb3NbbnVtYmVyXVxuICAgICAgICB2aWRlby5kb21haW4gPSBAcGFyYW1zLm51bWJlckRvbWFpblxuICAgICAgICB2aWRlby52aWRlbyA9IEBwYXJhbXMudmlkZW8/Lm5hbWVcbiAgICAgICAgdmlkZW8ubG9vcCA9IHllc1xuICAgICAgICB2aWRlby5kc3RSZWN0LnggPSB4XG4gICAgICAgIHZpZGVvLmRzdFJlY3QueSA9IHlcbiAgICAgICAgdmlkZW8uYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIHZpZGVvLmFuY2hvci54ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLnpJbmRleCA9IHpJbmRleCB8fCAgKDEwMDAgKyBudW1iZXIpXG4gICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJzY2VuZVwiXG4gICAgICAgICAgICB2aWRlby52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICB2aWRlby51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgdmlkZW8sIEBwYXJhbXMpXG4gICAgICAgICAgICB2aWRlby5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIHZpZGVvLmRzdFJlY3QueSA9IHAueVxuICAgICAgICAgICAgXG4gICAgICAgIHZpZGVvLmFuaW1hdG9yLmFwcGVhcih4LCB5LCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZE1vdmVWaWRlbzogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlbyA9IHNjZW5lLnZpZGVvc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB2aWRlbz8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KHZpZGVvLCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVmlkZW9QYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZE1vdmVWaWRlb1BhdGg6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdFBhdGgodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSb3RhdGVWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kUm90YXRlVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRab29tVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuem9vbU9iamVjdCh2aWRlbywgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kVmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmxlbmRWaWRlbzogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICB2aWRlbyA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWRlb3NbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QodmlkZW8sIEBwYXJhbXMpIFxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kVGludFZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnRpbnRPYmplY3QodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRGbGFzaFZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmZsYXNoT2JqZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JvcFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRDcm9wVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuY3JvcE9iamVjdCh2aWRlbywgQHBhcmFtcylcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdE1vdGlvbkJsdXIodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTWFza1ZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRWaWRlb0VmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kVmlkZW9FZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZEVyYXNlVmlkZW86IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudmlkZW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIHZpZGVvLmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIChzZW5kZXIpID0+IFxuICAgICAgICAgICAgc2VuZGVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgc2NlbmUudmlkZW9zW251bWJlcl0gPSBudWxsXG4gICAgICAgICAgIyAgc2VuZGVyLnZpZGVvLnBhdXNlKClcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvbiBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd0ltYWdlTWFwXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2hvd0ltYWdlTWFwOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgaW1hZ2VNYXAgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBpbWFnZU1hcD9cbiAgICAgICAgICAgIGltYWdlTWFwLmRpc3Bvc2UoKVxuICAgICAgICBpbWFnZU1hcCA9IG5ldyBncy5PYmplY3RfSW1hZ2VNYXAoKVxuICAgICAgICBpbWFnZU1hcC52aXN1YWwudmFyaWFibGVDb250ZXh0ID0gQGludGVycHJldGVyLmNvbnRleHRcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW251bWJlcl0gPSBpbWFnZU1hcFxuICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tAcGFyYW1zLmdyb3VuZD8ubmFtZX1cIilcbiAgICAgICAgXG4gICAgICAgIGltYWdlTWFwLmRzdFJlY3Qud2lkdGggPSBiaXRtYXAud2lkdGhcbiAgICAgICAgaW1hZ2VNYXAuZHN0UmVjdC5oZWlnaHQgPSBiaXRtYXAuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBpbWFnZU1hcCwgQHBhcmFtcylcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgaW1hZ2VNYXAuZHN0UmVjdC55ID0gcC55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5hbmNob3IueCA9IGlmIEBwYXJhbXMub3JpZ2luID09IDEgdGhlbiAwLjUgZWxzZSAwXG4gICAgICAgIGltYWdlTWFwLmFuY2hvci55ID0gaWYgQHBhcmFtcy5vcmlnaW4gPT0gMSB0aGVuIDAuNSBlbHNlIDBcbiAgICAgICAgaW1hZ2VNYXAuekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSA0MDBcbiAgICAgICAgaW1hZ2VNYXAuYmxlbmRNb2RlID0gaWYgIWlzTG9ja2VkKGZsYWdzLmJsZW5kTW9kZSkgdGhlbiBAcGFyYW1zLmJsZW5kTW9kZSBlbHNlIDBcbiAgICAgICAgaW1hZ2VNYXAuaG90c3BvdHMgPSBAcGFyYW1zLmhvdHNwb3RzXG4gICAgICAgIGltYWdlTWFwLmltYWdlcyA9IFtcbiAgICAgICAgICAgIEBwYXJhbXMuZ3JvdW5kPy5uYW1lLFxuICAgICAgICAgICAgQHBhcmFtcy5ob3Zlcj8ubmFtZSxcbiAgICAgICAgICAgIEBwYXJhbXMudW5zZWxlY3RlZD8ubmFtZSxcbiAgICAgICAgICAgIEBwYXJhbXMuc2VsZWN0ZWQ/Lm5hbWUsXG4gICAgICAgICAgICBAcGFyYW1zLnNlbGVjdGVkSG92ZXI/Lm5hbWVcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgaW1hZ2VNYXAuZXZlbnRzLm9uIFwianVtcFRvXCIsIGdzLkNhbGxCYWNrKFwib25KdW1wVG9cIiwgQGludGVycHJldGVyKVxuICAgICAgICBpbWFnZU1hcC5ldmVudHMub24gXCJjYWxsQ29tbW9uRXZlbnRcIiwgZ3MuQ2FsbEJhY2soXCJvbkNhbGxDb21tb25FdmVudFwiLCBAaW50ZXJwcmV0ZXIpXG4gICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5zZXR1cCgpXG4gICAgICAgIGltYWdlTWFwLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hvd09iamVjdChpbWFnZU1hcCwge3g6MCwgeTowfSwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb25cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5ldmVudHMub24gXCJmaW5pc2hcIiwgKHNlbmRlcikgPT5cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAjIEBpbnRlcnByZXRlci5lcmFzZU9iamVjdChzY2VuZS5pbWFnZU1hcCwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VJbWFnZU1hcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgICBcbiAgICBjb21tYW5kRXJhc2VJbWFnZU1hcDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgaW1hZ2VNYXAgPSBzY2VuZS5waWN0dXJlc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgIGlmIG5vdCBpbWFnZU1hcD8gdGhlbiByZXR1cm5cbiBcbiAgICAgICAgaW1hZ2VNYXAuZXZlbnRzLmVtaXQoXCJmaW5pc2hcIiwgaW1hZ2VNYXApXG4gICAgICAgIGltYWdlTWFwLnZpc3VhbC5hY3RpdmUgPSBub1xuICAgICAgICBAaW50ZXJwcmV0ZXIuZXJhc2VPYmplY3QoaW1hZ2VNYXAsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRBZGRIb3RzcG90XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZEFkZEhvdHNwb3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUhvdHNwb3REb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBob3RzcG90cyA9IHNjZW5lLmhvdHNwb3RzXG4gICAgIFxuICAgICAgICBpZiBub3QgaG90c3BvdHNbbnVtYmVyXT9cbiAgICAgICAgICAgIGhvdHNwb3RzW251bWJlcl0gPSBuZXcgZ3MuT2JqZWN0X0hvdHNwb3QoKVxuICAgICAgICAgICAgXG4gICAgICAgIGhvdHNwb3QgPSBob3RzcG90c1tudW1iZXJdXG4gICAgICAgIGhvdHNwb3QuZG9tYWluID0gQHBhcmFtcy5udW1iZXJEb21haW5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnBvc2l0aW9uVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgRGlyZWN0XG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LnggPSBAcGFyYW1zLmJveC54XG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LnkgPSBAcGFyYW1zLmJveC55XG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LndpZHRoID0gQHBhcmFtcy5ib3guc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC5oZWlnaHQgPSBAcGFyYW1zLmJveC5zaXplLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAxICMgQ2FsY3VsYXRlZFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC54ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ib3gueClcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QueSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYm94LnkpXG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LndpZHRoID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ib3guc2l6ZS53aWR0aClcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QuaGVpZ2h0ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ib3guc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICB3aGVuIDIgIyBCaW5kIHRvIFBpY3R1cmVcbiAgICAgICAgICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5waWN0dXJlTnVtYmVyKV1cbiAgICAgICAgICAgICAgICBpZiBwaWN0dXJlP1xuICAgICAgICAgICAgICAgICAgICBob3RzcG90LnRhcmdldCA9IHBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gMyAjIEJpbmQgdG8gVGV4dFxuICAgICAgICAgICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRleHROdW1iZXIpXVxuICAgICAgICAgICAgICAgIGlmIHRleHQ/XG4gICAgICAgICAgICAgICAgICAgIGhvdHNwb3QudGFyZ2V0ID0gdGV4dFxuICAgICAgICBcbiAgICAgICAgaG90c3BvdC5iZWhhdmlvci5zaGFwZSA9IEBwYXJhbXMuc2hhcGUgPyBncy5Ib3RzcG90U2hhcGUuUkVDVEFOR0xFIFxuICAgICAgICBcbiAgICAgICAgaWYgdGV4dD9cbiAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2VzID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBob3RzcG90LmltYWdlcyA9IFtcbiAgICAgICAgICAgICAgICBAcGFyYW1zLmJhc2VHcmFwaGljPy5uYW1lIHx8IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuYmFzZUdyYXBoaWMpIHx8IHBpY3R1cmU/LmltYWdlLFxuICAgICAgICAgICAgICAgIEBwYXJhbXMuaG92ZXJHcmFwaGljPy5uYW1lIHx8IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuaG92ZXJHcmFwaGljKSxcbiAgICAgICAgICAgICAgICBAcGFyYW1zLnNlbGVjdGVkR3JhcGhpYz8ubmFtZSB8fCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNlbGVjdGVkR3JhcGhpYyksXG4gICAgICAgICAgICAgICAgQHBhcmFtcy5zZWxlY3RlZEhvdmVyR3JhcGhpYz8ubmFtZSB8fCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNlbGVjdGVkSG92ZXJHcmFwaGljKSxcbiAgICAgICAgICAgICAgICBAcGFyYW1zLnVuc2VsZWN0ZWRHcmFwaGljPy5uYW1lIHx8IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudW5zZWxlY3RlZEdyYXBoaWMpXG4gICAgICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5hY3Rpb25zLm9uQ2xpY2sudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vbkNsaWNrLmxhYmVsICAgICAgICBcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwiY2xpY2tcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3RDbGlja1wiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkNsaWNrLmJpbmRWYWx1ZSkgfSlcbiAgICAgICAgaWYgQHBhcmFtcy5hY3Rpb25zLm9uRW50ZXIudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vbkVudGVyLmxhYmVsICAgICAgICBcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwiZW50ZXJcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3RFbnRlclwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkVudGVyLmJpbmRWYWx1ZSkgfSlcbiAgICAgICAgaWYgQHBhcmFtcy5hY3Rpb25zLm9uTGVhdmUudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vbkxlYXZlLmxhYmVsICAgICAgICBcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwibGVhdmVcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3RMZWF2ZVwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkxlYXZlLmJpbmRWYWx1ZSkgfSlcbiAgICAgICAgaWYgQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy5sYWJlbCAgICAgICAgXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImRyYWdTdGFydFwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdERyYWdTdGFydFwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RHJhZ1wiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnRW5kXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RHJhZ0VuZFwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25TZWxlY3QudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vblNlbGVjdC5sYWJlbCBvclxuICAgICAgICAgICBAcGFyYW1zLmFjdGlvbnMub25EZXNlbGVjdC50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uRGVzZWxlY3QubGFiZWwgICAgXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcInN0YXRlQ2hhbmdlZFwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdFN0YXRlQ2hhbmdlZFwiLCBAaW50ZXJwcmV0ZXIsIEBwYXJhbXMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGhvdHNwb3Quc2VsZWN0YWJsZSA9IHllc1xuICAgICAgICBob3RzcG90LnNldHVwKClcblxuICAgICAgICBpZiBAcGFyYW1zLmRyYWdnaW5nLmVuYWJsZWRcbiAgICAgICAgICAgIGRyYWdnaW5nID0gQHBhcmFtcy5kcmFnZ2luZ1xuICAgICAgICAgICAgaG90c3BvdC5kcmFnZ2FibGUgPSB7IFxuICAgICAgICAgICAgICAgIHJlY3Q6IG5ldyBSZWN0KGRyYWdnaW5nLnJlY3QueCwgZHJhZ2dpbmcucmVjdC55LCBkcmFnZ2luZy5yZWN0LnNpemUud2lkdGgsIGRyYWdnaW5nLnJlY3Quc2l6ZS5oZWlnaHQpLCBcbiAgICAgICAgICAgICAgICBheGlzWDogZHJhZ2dpbmcuaG9yaXpvbnRhbCwgXG4gICAgICAgICAgICAgICAgYXhpc1k6IGRyYWdnaW5nLnZlcnRpY2FsIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaG90c3BvdC5hZGRDb21wb25lbnQobmV3IHVpLkNvbXBvbmVudF9EcmFnZ2FibGUoKSlcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwiZHJhZ1wiLCAoZSkgPT4gXG4gICAgICAgICAgICAgICAgZHJhZyA9IGUuc2VuZGVyLmRyYWdnYWJsZVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBpbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgICAgIGlmIEBwYXJhbXMuZHJhZ2dpbmcuaG9yaXpvbnRhbFxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLmRyYWdnaW5nLnZhcmlhYmxlLCBNYXRoLnJvdW5kKChlLnNlbmRlci5kc3RSZWN0LngtZHJhZy5yZWN0LngpIC8gKGRyYWcucmVjdC53aWR0aC1lLnNlbmRlci5kc3RSZWN0LndpZHRoKSAqIDEwMCkpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLmRyYWdnaW5nLnZhcmlhYmxlLCBNYXRoLnJvdW5kKChlLnNlbmRlci5kc3RSZWN0LnktZHJhZy5yZWN0LnkpIC8gKGRyYWcucmVjdC5oZWlnaHQtZS5zZW5kZXIuZHN0UmVjdC5oZWlnaHQpICogMTAwKSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VIb3RzcG90U3RhdGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kQ2hhbmdlSG90c3BvdFN0YXRlOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUhvdHNwb3REb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBob3RzcG90ID0gc2NlbmUuaG90c3BvdHNbbnVtYmVyXVxuICAgICAgICByZXR1cm4gaWYgIWhvdHNwb3RcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zZWxlY3RlZCkgdGhlbiBob3RzcG90LmJlaGF2aW9yLnNlbGVjdGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc2VsZWN0ZWQpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5lbmFibGVkKSB0aGVuIGhvdHNwb3QuYmVoYXZpb3IuZW5hYmxlZCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLmVuYWJsZWQpXG4gICAgICAgIFxuICAgICAgICBob3RzcG90LmJlaGF2aW9yLnVwZGF0ZUlucHV0KClcbiAgICAgICAgaG90c3BvdC5iZWhhdmlvci51cGRhdGVJbWFnZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlSG90c3BvdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRFcmFzZUhvdHNwb3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUhvdHNwb3REb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBcbiAgICAgICAgaWYgc2NlbmUuaG90c3BvdHNbbnVtYmVyXT9cbiAgICAgICAgICAgIHNjZW5lLmhvdHNwb3RzW251bWJlcl0uZGlzcG9zZSgpXG4gICAgICAgICAgICBzY2VuZS5ob3RzcG90Q29udGFpbmVyLmVyYXNlT2JqZWN0KG51bWJlcilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VPYmplY3REb21haW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZENoYW5nZU9iamVjdERvbWFpbjogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZU9iamVjdERvbWFpbihAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmRvbWFpbikpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBpY3R1cmVEZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRQaWN0dXJlRGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkJsdXIgPSBAcGFyYW1zLm1vdGlvbkJsdXJcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuICAgIFxuICAgIFxuICAgIGNyZWF0ZVBpY3R1cmU6IChncmFwaGljLCBwYXJhbXMpIC0+XG4gICAgICAgIGdyYXBoaWMgPSBAc3RyaW5nVmFsdWVPZihncmFwaGljKVxuICAgICAgICBncmFwaGljTmFtZSA9IGlmIGdyYXBoaWM/Lm5hbWU/IHRoZW4gZ3JhcGhpYy5uYW1lIGVsc2UgZ3JhcGhpY1xuICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tncmFwaGljTmFtZX1cIilcbiAgICAgICAgcmV0dXJuIG51bGwgaWYgYml0bWFwICYmICFiaXRtYXAubG9hZGVkXG4gICAgICAgIFxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnBpY3R1cmVcbiAgICAgICAgZmxhZ3MgPSBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIG51bWJlciA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmVzID0gc2NlbmUucGljdHVyZXNcbiAgICAgICAgaWYgbm90IHBpY3R1cmVzW251bWJlcl0/XG4gICAgICAgICAgICBwaWN0dXJlID0gbmV3IGdzLk9iamVjdF9QaWN0dXJlKG51bGwsIG51bGwsIHBhcmFtcy52aXN1YWw/LnR5cGUpXG4gICAgICAgICAgICBwaWN0dXJlLmRvbWFpbiA9IHBhcmFtcy5udW1iZXJEb21haW5cbiAgICAgICAgICAgIHBpY3R1cmVzW251bWJlcl0gPSBwaWN0dXJlXG4gICAgICAgICAgICBzd2l0Y2ggcGFyYW1zLnZpc3VhbD8udHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMVxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnZpc3VhbC5sb29waW5nLnZlcnRpY2FsID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IHllc1xuICAgICAgICAgICAgICAgIHdoZW4gMlxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmZyYW1lVGhpY2tuZXNzID0gcGFyYW1zLnZpc3VhbC5mcmFtZS50aGlja25lc3NcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5mcmFtZUNvcm5lclNpemUgPSBwYXJhbXMudmlzdWFsLmZyYW1lLmNvcm5lclNpemVcbiAgICAgICAgICAgICAgICB3aGVuIDNcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS52aXN1YWwub3JpZW50YXRpb24gPSBwYXJhbXMudmlzdWFsLnRocmVlUGFydEltYWdlLm9yaWVudGF0aW9uXG4gICAgICAgICAgICAgICAgd2hlbiA0XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuY29sb3IgPSBncy5Db2xvci5mcm9tT2JqZWN0KHBhcmFtcy52aXN1YWwucXVhZC5jb2xvcilcbiAgICAgICAgICAgICAgICB3aGVuIDVcbiAgICAgICAgICAgICAgICAgICAgc25hcHNob3QgPSBHcmFwaGljcy5zbmFwc2hvdCgpXG4gICAgICAgICAgICAgICAgICAgICNSZXNvdXJjZU1hbmFnZXIuYWRkQ3VzdG9tQml0bWFwKHNuYXBzaG90KVxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmJpdG1hcCA9IHNuYXBzaG90XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC53aWR0aCA9IHNuYXBzaG90LndpZHRoXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC5oZWlnaHQgPSBzbmFwc2hvdC5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5zcmNSZWN0LnNldCgwLCAwLCBzbmFwc2hvdC53aWR0aCwgc25hcHNob3QuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB4ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgcGljdHVyZSA9IHBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgXG4gICAgICAgIGlmICFwaWN0dXJlLmJpdG1hcFxuICAgICAgICAgICAgcGljdHVyZS5pbWFnZSA9IGdyYXBoaWNOYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBpY3R1cmUuaW1hZ2UgPSBudWxsXG4gICAgXG4gICAgICAgIGJpdG1hcCA9IHBpY3R1cmUuYml0bWFwID8gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7Z3JhcGhpY05hbWV9XCIpXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAbnVtYmVyVmFsdWVPZihwYXJhbXMuZWFzaW5nLnR5cGUpLCBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gcGFyYW1zLm9yaWdpbiBlbHNlIGRlZmF1bHRzLm9yaWdpblxuICAgICAgICB6SW5kZXggPSBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIEBudW1iZXJWYWx1ZU9mKHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICBcbiAgICAgICAgcGljdHVyZS5taXJyb3IgPSBwYXJhbXMucG9zaXRpb24uaG9yaXpvbnRhbEZsaXBcbiAgICAgICAgcGljdHVyZS5hbmdsZSA9IHBhcmFtcy5wb3NpdGlvbi5hbmdsZSB8fCAwXG4gICAgICAgIHBpY3R1cmUuem9vbS54ID0gKHBhcmFtcy5wb3NpdGlvbi5kYXRhPy56b29tfHwxKVxuICAgICAgICBwaWN0dXJlLnpvb20ueSA9IChwYXJhbXMucG9zaXRpb24uZGF0YT8uem9vbXx8MSlcbiAgICAgICAgcGljdHVyZS5ibGVuZE1vZGUgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuYmxlbmRNb2RlKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLm9yaWdpbiA9PSAxIGFuZCBiaXRtYXA/XG4gICAgICAgICAgICB4ICs9IChiaXRtYXAud2lkdGgqcGljdHVyZS56b29tLngtYml0bWFwLndpZHRoKS8yXG4gICAgICAgICAgICB5ICs9IChiaXRtYXAuaGVpZ2h0KnBpY3R1cmUuem9vbS55LWJpdG1hcC5oZWlnaHQpLzJcbiAgICAgICAgICAgIFxuICAgICAgICBwaWN0dXJlLmRzdFJlY3QueCA9IHhcbiAgICAgICAgcGljdHVyZS5kc3RSZWN0LnkgPSB5XG4gICAgICAgIHBpY3R1cmUuYW5jaG9yLnggPSBpZiBvcmlnaW4gPT0gMSB0aGVuIDAuNSBlbHNlIDBcbiAgICAgICAgcGljdHVyZS5hbmNob3IueSA9IGlmIG9yaWdpbiA9PSAxIHRoZW4gMC41IGVsc2UgMFxuICAgICAgICBwaWN0dXJlLnpJbmRleCA9IHpJbmRleCB8fCAgKDcwMCArIG51bWJlcilcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy52aWV3cG9ydD8udHlwZSA9PSBcInNjZW5lXCJcbiAgICAgICAgICAgIHBpY3R1cmUudmlld3BvcnQgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3Iudmlld3BvcnRcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy5zaXplPy50eXBlID09IDFcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC53aWR0aCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zaXplLndpZHRoKVxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LmhlaWdodCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zaXplLmhlaWdodClcbiAgICAgICAgICAgIFxuICAgICAgICBwaWN0dXJlLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcGljdHVyZVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dQaWN0dXJlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRTaG93UGljdHVyZTogLT4gXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHBpY3R1cmUgPSBAaW50ZXJwcmV0ZXIuY3JlYXRlUGljdHVyZShAcGFyYW1zLmdyYXBoaWMsIEBwYXJhbXMpXG4gICAgICAgIGlmICFwaWN0dXJlXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlci0tXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LnkgPSBwLnlcbiAgICAgICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgIFxuICAgICAgICBwaWN0dXJlLmFuaW1hdG9yLmFwcGVhcihwaWN0dXJlLmRzdFJlY3QueCwgcGljdHVyZS5kc3RSZWN0LnksIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5UGljdHVyZUFuaW1hdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kUGxheVBpY3R1cmVBbmltYXRpb246IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIFxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnBpY3R1cmVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBwaWN0dXJlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuYW5pbWF0aW9uSWQ/XG4gICAgICAgICAgICByZWNvcmQgPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNbQHBhcmFtcy5hbmltYXRpb25JZF1cbiAgICAgICAgICAgIGlmIHJlY29yZD9cbiAgICAgICAgICAgICAgICBwaWN0dXJlID0gQGludGVycHJldGVyLmNyZWF0ZVBpY3R1cmUocmVjb3JkLmdyYXBoaWMsIEBwYXJhbXMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0gcGljdHVyZS5maW5kQ29tcG9uZW50KFwiQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uXCIpXG4gICAgICAgICAgICAgICAgaWYgY29tcG9uZW50P1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucmVmcmVzaChyZWNvcmQpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGFydCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgZ3MuQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uKHJlY29yZClcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5hZGRDb21wb25lbnQoY29tcG9uZW50KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudXBkYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC55ID0gcC55XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBpY3R1cmUuYW5pbWF0b3IuYXBwZWFyKHBpY3R1cmUuZHN0UmVjdC54LCBwaWN0dXJlLmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwaWN0dXJlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IHBpY3R1cmU/LmZpbmRDb21wb25lbnQoXCJDb21wb25lbnRfRnJhbWVBbmltYXRpb25cIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYW5pbWF0aW9uP1xuICAgICAgICAgICAgICAgIHBpY3R1cmUucmVtb3ZlQ29tcG9uZW50KGFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQW5pbWF0aW9ucy8je3BpY3R1cmUuaW1hZ2V9XCIpXG4gICAgICAgICAgICAgICAgaWYgYml0bWFwP1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnNyY1JlY3Quc2V0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LndpZHRoID0gcGljdHVyZS5zcmNSZWN0LndpZHRoXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC5oZWlnaHQgPSBwaWN0dXJlLnNyY1JlY3QuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlUGljdHVyZVBhdGhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kTW92ZVBpY3R1cmVQYXRoOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdFBhdGgocGljdHVyZSwgQHBhcmFtcy5wYXRoLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZVBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRNb3ZlUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3QocGljdHVyZSwgQHBhcmFtcy5waWN0dXJlLnBvc2l0aW9uLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRUaW50UGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgY29tbWFuZFRpbnRQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci50aW50T2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZEZsYXNoUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuZmxhc2hPYmplY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JvcFBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kQ3JvcFBpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmNyb3BPYmplY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgY29tbWFuZFJvdGF0ZVBpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdChwaWN0dXJlLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kWm9vbVBpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnpvb21PYmplY3QocGljdHVyZSwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCbGVuZFBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmxlbmRQaWN0dXJlOiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBwaWN0dXJlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QocGljdHVyZSwgQHBhcmFtcykgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaGFrZVBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hha2VQaWN0dXJlOiAtPiBcbiAgICAgICAgcGljdHVyZSA9IFNjZW5lTWFuYWdlci5zY2VuZS5waWN0dXJlc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnNoYWtlT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWFza1BpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZE1hc2tQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tYXNrT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBpY3R1cmVNb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgXG4gICAgY29tbWFuZFBpY3R1cmVNb3Rpb25CbHVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5vYmplY3RNb3Rpb25CbHVyKHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQaWN0dXJlRWZmZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRQaWN0dXJlRWZmZWN0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5vYmplY3RFZmZlY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VQaWN0dXJlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEVyYXNlUGljdHVyZTogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5waWN0dXJlXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIHBpY3R1cmUuYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgXG4gICAgICAgICAgICAoc2VuZGVyKSA9PiBcbiAgICAgICAgICAgICAgICBzZW5kZXIuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgICAgIHNjZW5lLnBpY3R1cmVzW251bWJlcl0gPSBudWxsXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb24gXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRJbnB1dE51bWJlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRJbnB1dE51bWJlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICBpZiBAaW50ZXJwcmV0ZXIuaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0KClcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yTWVzc2FnZSgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiAoR2FtZU1hbmFnZXIuc2V0dGluZ3MuYWxsb3dDaG9pY2VTa2lwfHxAaW50ZXJwcmV0ZXIucHJldmlldykgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5tZXNzYWdlT2JqZWN0KCkuYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy52YXJpYWJsZSwgMClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICR0ZW1wRmllbGRzLmRpZ2l0cyA9IEBwYXJhbXMuZGlnaXRzXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLnNob3dJbnB1dE51bWJlcihAcGFyYW1zLmRpZ2l0cywgZ3MuQ2FsbEJhY2soXCJvbklucHV0TnVtYmVyRmluaXNoXCIsIEBpbnRlcnByZXRlciwgQHBhcmFtcykpXG4gICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0aW5nRm9yLmlucHV0TnVtYmVyID0gQHBhcmFtc1xuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaG9pY2VUaW1lclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaG9pY2VUaW1lcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlVGltZXIgPSBzY2VuZS5jaG9pY2VUaW1lclxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmNob2ljZVRpbWVyVmlzaWJsZSA9IEBwYXJhbXMudmlzaWJsZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLmVuYWJsZWRcbiAgICAgICAgICAgIHNjZW5lLmNob2ljZVRpbWVyLmJlaGF2aW9yLnNlY29uZHMgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNlY29uZHMpXG4gICAgICAgICAgICBzY2VuZS5jaG9pY2VUaW1lci5iZWhhdmlvci5taW51dGVzID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5taW51dGVzKVxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlVGltZXIuYmVoYXZpb3Iuc3RhcnQoKVxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlVGltZXIuZXZlbnRzLm9uIFwiZmluaXNoXCIsIChzZW5kZXIpID0+XG4gICAgICAgICAgICAgICAgaWYgIHNjZW5lLmNob2ljZVdpbmRvdyBhbmQgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5jaG9pY2VzPy5sZW5ndGggPiAwICAgIFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Q2hvaWNlID0gKEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlcy5maXJzdCAoYykgLT4gYy5pc0RlZmF1bHQpIHx8IEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlc1swXVxuICAgICAgICAgICAgICAgICAgICAjc2NlbmUuY2hvaWNlV2luZG93LmV2ZW50cy5lbWl0KFwic2VsZWN0aW9uQWNjZXB0XCIsIHNjZW5lLmNob2ljZVdpbmRvdywgeyBsYWJlbEluZGV4OiBkZWZhdWx0Q2hvaWNlLmFjdGlvbi5sYWJlbEluZGV4IH0pXG4gICAgICAgICAgICAgICAgICAgIHNjZW5lLmNob2ljZVdpbmRvdy5ldmVudHMuZW1pdChcInNlbGVjdGlvbkFjY2VwdFwiLCBzY2VuZS5jaG9pY2VXaW5kb3csIGRlZmF1bHRDaG9pY2UpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNjZW5lLmNob2ljZVRpbWVyLnN0b3AoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93Q2hvaWNlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaG93Q2hvaWNlczogLT4gIFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBwb2ludGVyID0gQGludGVycHJldGVyLnBvaW50ZXJcbiAgICAgICAgY2hvaWNlcyA9IEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlcyB8fCBbXVxuICAgICAgICBcbiAgICAgICAgaWYgKEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcHx8QGludGVycHJldGVyLnByZXZpZXdEYXRhKSBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIubWVzc2FnZU9iamVjdCgpXG4gICAgICAgICAgICBpZiBtZXNzYWdlT2JqZWN0Py52aXNpYmxlXG4gICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgICAgICBkZWZhdWx0Q2hvaWNlID0gKGNob2ljZXMuZmlyc3QoKGMpIC0+IGMuaXNEZWZhdWx0KSkgfHwgY2hvaWNlc1swXSAgICBcbiAgICAgICAgICAgIGlmIGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsSW5kZXg/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIgPSBkZWZhdWx0Q2hvaWNlLmFjdGlvbi5sYWJlbEluZGV4XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmp1bXBUb0xhYmVsKGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5jaG9pY2VzID0gW11cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgY2hvaWNlcy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLnNob3dDaG9pY2VzKGNob2ljZXMsIGdzLkNhbGxCYWNrKFwib25DaG9pY2VBY2NlcHRcIiwgQGludGVycHJldGVyLCB7IHBvaW50ZXI6IHBvaW50ZXIsIHBhcmFtczogQHBhcmFtcyB9KSlcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dDaG9pY2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRTaG93Q2hvaWNlOiAtPiBcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY29tbWFuZHMgPSBAaW50ZXJwcmV0ZXIub2JqZWN0LmNvbW1hbmRzXG4gICAgICAgIGNvbW1hbmQgPSBudWxsXG4gICAgICAgIGluZGV4ID0gMFxuICAgICAgICBwb2ludGVyID0gQGludGVycHJldGVyLnBvaW50ZXJcbiAgICAgICAgY2hvaWNlcyA9IG51bGxcbiAgICAgICAgZHN0UmVjdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnBvc2l0aW9uVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgQXV0b1xuICAgICAgICAgICAgICAgIGRzdFJlY3QgPSBudWxsXG4gICAgICAgICAgICB3aGVuIDEgIyBEaXJlY3RcbiAgICAgICAgICAgICAgICBkc3RSZWN0ID0gbmV3IFJlY3QoQHBhcmFtcy5ib3gueCwgQHBhcmFtcy5ib3gueSwgQHBhcmFtcy5ib3guc2l6ZS53aWR0aCwgQHBhcmFtcy5ib3guc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmICFHYW1lTWFuYWdlci50ZW1wRmllbGRzLmNob2ljZXNcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlcyA9IFtdXG4gICAgICAgIGNob2ljZXMgPSBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmNob2ljZXNcbiAgICAgICAgY2hvaWNlcy5wdXNoKHsgXG4gICAgICAgICAgICBkc3RSZWN0OiBkc3RSZWN0LCBcbiAgICAgICAgICAgICN0ZXh0OiBsY3MoQHBhcmFtcy50ZXh0KSwgXG4gICAgICAgICAgICB0ZXh0OiBAcGFyYW1zLnRleHQsIFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4LCBcbiAgICAgICAgICAgIGFjdGlvbjogQHBhcmFtcy5hY3Rpb24sIFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogbm8sIFxuICAgICAgICAgICAgaXNEZWZhdWx0OiBAcGFyYW1zLmRlZmF1bHRDaG9pY2UsIFxuICAgICAgICAgICAgaXNFbmFibGVkOiBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5lbmFibGVkKSB9KVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE9wZW5NZW51XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZE9wZW5NZW51OiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3IGdzLk9iamVjdF9MYXlvdXQoXCJtZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRPcGVuTG9hZE1lbnVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRPcGVuTG9hZE1lbnU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcImxvYWRNZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kT3BlblNhdmVNZW51XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kT3BlblNhdmVNZW51OiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3IGdzLk9iamVjdF9MYXlvdXQoXCJzYXZlTWVudUxheW91dFwiKSwgdHJ1ZSlcbiAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gMVxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXR1cm5Ub1RpdGxlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kUmV0dXJuVG9UaXRsZTogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwidGl0bGVMYXlvdXRcIikpXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDFcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUGxheVZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRQbGF5VmlkZW86IC0+XG4gICAgICAgIGlmIChHYW1lTWFuYWdlci5pbkxpdmVQcmV2aWV3IG9yIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFsbG93VmlkZW9Ta2lwKSBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gbm9cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMudmlkZW8/Lm5hbWU/XG4gICAgICAgICAgICBzY2VuZS52aWRlbyA9IFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIk1vdmllcy8je0BwYXJhbXMudmlkZW8ubmFtZX1cIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHZpZGVvU3ByaXRlID0gbmV3IFNwcml0ZShHcmFwaGljcy52aWV3cG9ydClcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgc2NlbmUudmlkZW8ud2lkdGgsIHNjZW5lLnZpZGVvLmhlaWdodClcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS52aWRlbyA9IHNjZW5lLnZpZGVvXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUuem9vbVggPSBHcmFwaGljcy53aWR0aCAvIHNjZW5lLnZpZGVvLndpZHRoXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUuem9vbVkgPSBHcmFwaGljcy5oZWlnaHQgLyBzY2VuZS52aWRlby5oZWlnaHRcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS56ID0gOTk5OTk5OTlcbiAgICAgICAgICAgIHNjZW5lLnZpZGVvLm9uRW5kZWQgPSA9PlxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBzY2VuZS52aWRlbyA9IG51bGxcbiAgICAgICAgICAgIHNjZW5lLnZpZGVvLnZvbHVtZSA9IEBwYXJhbXMudm9sdW1lIC8gMTAwXG4gICAgICAgICAgICBzY2VuZS52aWRlby5wbGF5YmFja1JhdGUgPSBAcGFyYW1zLnBsYXliYWNrUmF0ZSAvIDEwMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgc2NlbmUudmlkZW8ucGxheSgpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEF1ZGlvRGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZEF1ZGlvRGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm11c2ljRmFkZUluRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMubXVzaWNGYWRlSW5EdXJhdGlvbiA9IEBwYXJhbXMubXVzaWNGYWRlSW5EdXJhdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubXVzaWNGYWRlT3V0RHVyYXRpb24pIHRoZW4gZGVmYXVsdHMubXVzaWNGYWRlT3V0RHVyYXRpb24gPSBAcGFyYW1zLm11c2ljRmFkZU91dER1cmF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5tdXNpY1ZvbHVtZSkgdGhlbiBkZWZhdWx0cy5tdXNpY1ZvbHVtZSA9IEBwYXJhbXMubXVzaWNWb2x1bWVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm11c2ljUGxheWJhY2tSYXRlKSB0aGVuIGRlZmF1bHRzLm11c2ljUGxheWJhY2tSYXRlID0gQHBhcmFtcy5tdXNpY1BsYXliYWNrUmF0ZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc291bmRWb2x1bWUpIHRoZW4gZGVmYXVsdHMuc291bmRWb2x1bWUgPSBAcGFyYW1zLnNvdW5kVm9sdW1lXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zb3VuZFBsYXliYWNrUmF0ZSkgdGhlbiBkZWZhdWx0cy5zb3VuZFBsYXliYWNrUmF0ZSA9IEBwYXJhbXMuc291bmRQbGF5YmFja1JhdGVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnZvaWNlVm9sdW1lKSB0aGVuIGRlZmF1bHRzLnZvaWNlVm9sdW1lID0gQHBhcmFtcy52b2ljZVZvbHVtZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mudm9pY2VQbGF5YmFja1JhdGUpIHRoZW4gZGVmYXVsdHMudm9pY2VQbGF5YmFja1JhdGUgPSBAcGFyYW1zLnZvaWNlUGxheWJhY2tSYXRlXG4gIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBsYXlNdXNpY1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRQbGF5TXVzaWM6IC0+XG4gICAgICAgIGlmIG5vdCBAcGFyYW1zLm11c2ljPyB0aGVuIHJldHVyblxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmF1ZGlvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBHYW1lTWFuYWdlci5zZXR0aW5ncy5iZ21FbmFibGVkXG4gICAgICAgICAgICBmYWRlRHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZUluRHVyYXRpb24pIHRoZW4gQHBhcmFtcy5mYWRlSW5EdXJhdGlvbiBlbHNlIGRlZmF1bHRzLm11c2ljRmFkZUluRHVyYXRpb25cbiAgICAgICAgICAgIHZvbHVtZSA9IGlmICFpc0xvY2tlZChmbGFnc1tcIm11c2ljLnZvbHVtZVwiXSkgdGhlbiBAcGFyYW1zLm11c2ljLnZvbHVtZSBlbHNlIGRlZmF1bHRzLm11c2ljVm9sdW1lXG4gICAgICAgICAgICBwbGF5YmFja1JhdGUgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtdXNpYy5wbGF5YmFja1JhdGVcIl0pIHRoZW4gQHBhcmFtcy5tdXNpYy5wbGF5YmFja1JhdGUgZWxzZSBkZWZhdWx0cy5tdXNpY1BsYXliYWNrUmF0ZVxuICAgICAgICAgICAgbXVzaWMgPSB7IG5hbWU6IEBwYXJhbXMubXVzaWMubmFtZSwgdm9sdW1lOiB2b2x1bWUsIHBsYXliYWNrUmF0ZTogcGxheWJhY2tSYXRlIH1cbiAgICAgICAgICAgIGlmIEBwYXJhbXMucGxheVR5cGUgPT0gMVxuICAgICAgICAgICAgICAgIHBsYXlUaW1lID0gbWluOiBAcGFyYW1zLnBsYXlUaW1lLm1pbiAqIDYwLCBtYXg6IEBwYXJhbXMucGxheVRpbWUubWF4ICogNjBcbiAgICAgICAgICAgICAgICBwbGF5UmFuZ2UgPSBzdGFydDogQHBhcmFtcy5wbGF5UmFuZ2Uuc3RhcnQgKiA2MCwgZW5kOiBAcGFyYW1zLnBsYXlSYW5nZS5lbmQgKiA2MFxuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5TXVzaWNSYW5kb20obXVzaWMsIGZhZGVEdXJhdGlvbiwgQHBhcmFtcy5sYXllciB8fCAwLCBwbGF5VGltZSwgcGxheVJhbmdlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5TXVzaWMoQHBhcmFtcy5tdXNpYy5uYW1lLCB2b2x1bWUsIHBsYXliYWNrUmF0ZSwgZmFkZUR1cmF0aW9uLCBAcGFyYW1zLmxheWVyIHx8IDApXG4gICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0b3BNdXNpY1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTdG9wTXVzaWM6IC0+IFxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmF1ZGlvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZmFkZUR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZhZGVPdXREdXJhdGlvbikgdGhlbiBAcGFyYW1zLmZhZGVPdXREdXJhdGlvbiBlbHNlIGRlZmF1bHRzLm11c2ljRmFkZU91dER1cmF0aW9uXG4gICAgICAgIFxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcE11c2ljKGZhZGVEdXJhdGlvbiwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcikpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQYXVzZU11c2ljXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFBhdXNlTXVzaWM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBmYWRlRHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZU91dER1cmF0aW9uKSB0aGVuIEBwYXJhbXMuZmFkZU91dER1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlT3V0RHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wTXVzaWMoZmFkZUR1cmF0aW9uLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXN1bWVNdXNpY1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSZXN1bWVNdXNpYzogLT4gXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBmYWRlRHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZUluRHVyYXRpb24pIHRoZW4gQHBhcmFtcy5mYWRlSW5EdXJhdGlvbiBlbHNlIGRlZmF1bHRzLm11c2ljRmFkZUluRHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIEF1ZGlvTWFuYWdlci5yZXN1bWVNdXNpYyhmYWRlRHVyYXRpb24sIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5U291bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFBsYXlTb3VuZDogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiBHYW1lTWFuYWdlci5zZXR0aW5ncy5zb3VuZEVuYWJsZWQgYW5kICFHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgdm9sdW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wic291bmQudm9sdW1lXCJdKSB0aGVuIEBwYXJhbXMuc291bmQudm9sdW1lIGVsc2UgZGVmYXVsdHMuc291bmRWb2x1bWVcbiAgICAgICAgICAgIHBsYXliYWNrUmF0ZSA9IGlmICFpc0xvY2tlZChmbGFnc1tcInNvdW5kLnBsYXliYWNrUmF0ZVwiXSkgdGhlbiBAcGFyYW1zLnNvdW5kLnBsYXliYWNrUmF0ZSBlbHNlIGRlZmF1bHRzLnNvdW5kUGxheWJhY2tSYXRlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoQHBhcmFtcy5zb3VuZC5uYW1lLCB2b2x1bWUsIHBsYXliYWNrUmF0ZSwgQHBhcmFtcy5tdXNpY0VmZmVjdClcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU3RvcFNvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRTdG9wU291bmQ6IC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wU291bmQoQHBhcmFtcy5zb3VuZC5uYW1lKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRFbmRDb21tb25FdmVudFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRFbmRDb21tb25FdmVudDogLT5cbiAgICAgICAgZXZlbnRJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY29tbW9uRXZlbnRJZClcbiAgICAgICAgZXZlbnQgPSBHYW1lTWFuYWdlci5jb21tb25FdmVudHNbZXZlbnRJZF0gXG4gICAgICAgIGV2ZW50Py5iZWhhdmlvci5zdG9wKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUmVzdW1lQ29tbW9uRXZlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kUmVzdW1lQ29tbW9uRXZlbnQ6IC0+XG4gICAgICAgIGV2ZW50SWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgIGV2ZW50ID0gR2FtZU1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdIFxuICAgICAgICBldmVudD8uYmVoYXZpb3IucmVzdW1lKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDYWxsQ29tbW9uRXZlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZENhbGxDb21tb25FdmVudDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgZXZlbnRJZCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuY29tbW9uRXZlbnRJZC5pbmRleD9cbiAgICAgICAgICAgIGV2ZW50SWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLnBhcmFtZXRlcnMudmFsdWVzWzBdKVxuICAgICAgICAgICAgcGFyYW1zID0geyB2YWx1ZXM6IGxpc3QgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYXJhbXMgPSBAcGFyYW1zLnBhcmFtZXRlcnNcbiAgICAgICAgICAgIGV2ZW50SWQgPSBAcGFyYW1zLmNvbW1vbkV2ZW50SWRcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuY2FsbENvbW1vbkV2ZW50KGV2ZW50SWQsIHBhcmFtcylcbiAgICAgXG4gIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVRleHRTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlVGV4dFNldHRpbmdzOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dHMgPSBzY2VuZS50ZXh0c1xuICAgICAgICBpZiBub3QgdGV4dHNbbnVtYmVyXT8gXG4gICAgICAgICAgICB0ZXh0c1tudW1iZXJdID0gbmV3IGdzLk9iamVjdF9UZXh0KClcbiAgICAgICAgICAgIHRleHRzW251bWJlcl0udmlzaWJsZSA9IG5vXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRleHRTcHJpdGUgPSB0ZXh0c1tudW1iZXJdXG4gICAgICAgIHBhZGRpbmcgPSB0ZXh0U3ByaXRlLmJlaGF2aW9yLnBhZGRpbmdcbiAgICAgICAgZm9udCA9IHRleHRTcHJpdGUuZm9udFxuICAgICAgICBmb250TmFtZSA9IHRleHRTcHJpdGUuZm9udC5uYW1lXG4gICAgICAgIGZvbnRTaXplID0gdGV4dFNwcml0ZS5mb250LnNpemVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZVNwYWNpbmcpIHRoZW4gdGV4dFNwcml0ZS50ZXh0UmVuZGVyZXIubGluZVNwYWNpbmcgPSBAcGFyYW1zLmxpbmVTcGFjaW5nID8gdGV4dFNwcml0ZS50ZXh0UmVuZGVyZXIubGluZVNwYWNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmZvbnQpIHRoZW4gZm9udE5hbWUgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmZvbnQpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zaXplKSB0aGVuIGZvbnRTaXplID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5zaXplKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5mb250KSBvciAhaXNMb2NrZWQoZmxhZ3Muc2l6ZSlcbiAgICAgICAgICAgIHRleHRTcHJpdGUuZm9udCA9IG5ldyBGb250KGZvbnROYW1lLCBmb250U2l6ZSlcbiAgICAgICAgICAgIFxuICAgICAgICBwYWRkaW5nLmxlZnQgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJwYWRkaW5nLjBcIl0pIHRoZW4gQHBhcmFtcy5wYWRkaW5nP1swXSBlbHNlIHBhZGRpbmcubGVmdFxuICAgICAgICBwYWRkaW5nLnRvcCA9IGlmICFpc0xvY2tlZChmbGFnc1tcInBhZGRpbmcuMVwiXSkgdGhlbiBAcGFyYW1zLnBhZGRpbmc/WzFdIGVsc2UgcGFkZGluZy50b3BcbiAgICAgICAgcGFkZGluZy5yaWdodCA9IGlmICFpc0xvY2tlZChmbGFnc1tcInBhZGRpbmcuMlwiXSkgdGhlbiBAcGFyYW1zLnBhZGRpbmc/WzJdIGVsc2UgcGFkZGluZy5yaWdodFxuICAgICAgICBwYWRkaW5nLmJvdHRvbSA9IGlmICFpc0xvY2tlZChmbGFnc1tcInBhZGRpbmcuM1wiXSkgdGhlbiBAcGFyYW1zLnBhZGRpbmc/WzNdIGVsc2UgcGFkZGluZy5ib3R0b21cbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5ib2xkKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LmJvbGQgPSBAcGFyYW1zLmJvbGRcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLml0YWxpYylcbiAgICAgICAgICAgIHRleHRTcHJpdGUuZm9udC5pdGFsaWMgPSBAcGFyYW1zLml0YWxpY1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc21hbGxDYXBzKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LnNtYWxsQ2FwcyA9IEBwYXJhbXMuc21hbGxDYXBzXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy51bmRlcmxpbmUpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQudW5kZXJsaW5lID0gQHBhcmFtcy51bmRlcmxpbmVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnN0cmlrZVRocm91Z2gpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc3RyaWtlVGhyb3VnaCA9IEBwYXJhbXMuc3RyaWtlVGhyb3VnaFxuICAgICAgICAgICAgXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5jb2xvciA9IGlmICFpc0xvY2tlZChmbGFncy5jb2xvcikgdGhlbiBuZXcgQ29sb3IoQHBhcmFtcy5jb2xvcikgZWxzZSBmb250LmNvbG9yXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5ib3JkZXIgPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZSl0aGVuIEBwYXJhbXMub3V0bGluZSBlbHNlIGZvbnQuYm9yZGVyXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5ib3JkZXJDb2xvciA9IGlmICFpc0xvY2tlZChmbGFncy5vdXRsaW5lQ29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMub3V0bGluZUNvbG9yKSBlbHNlIG5ldyBDb2xvcihmb250LmJvcmRlckNvbG9yKVxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuYm9yZGVyU2l6ZSA9IGlmICFpc0xvY2tlZChmbGFncy5vdXRsaW5lU2l6ZSkgdGhlbiBAcGFyYW1zLm91dGxpbmVTaXplIGVsc2UgZm9udC5ib3JkZXJTaXplXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3cgPSBpZiAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93KXRoZW4gQHBhcmFtcy5zaGFkb3cgZWxzZSBmb250LnNoYWRvd1xuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc2hhZG93Q29sb3IgPSBpZiAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93Q29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMuc2hhZG93Q29sb3IpIGVsc2UgbmV3IENvbG9yKGZvbnQuc2hhZG93Q29sb3IpXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3dPZmZzZXRYID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFgpIHRoZW4gQHBhcmFtcy5zaGFkb3dPZmZzZXRYIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRYXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3dPZmZzZXRZID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFkpIHRoZW4gQHBhcmFtcy5zaGFkb3dPZmZzZXRZIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRZXG4gICAgICAgIHRleHRTcHJpdGUuYmVoYXZpb3IucmVmcmVzaCgpXG4gICAgICAgIHRleHRTcHJpdGUudXBkYXRlKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlVGV4dFNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZFRleHREZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy50ZXh0XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmFwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmRpc2FwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gZGVmYXVsdHMubW90aW9uQmx1ciA9IEBwYXJhbXMubW90aW9uQmx1clxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd1RleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRTaG93VGV4dDogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy50ZXh0XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBAcGFyYW1zLnRleHRcbiAgICAgICAgdGV4dHMgPSBzY2VuZS50ZXh0c1xuICAgICAgICBpZiBub3QgdGV4dHNbbnVtYmVyXT8gdGhlbiB0ZXh0c1tudW1iZXJdID0gbmV3IGdzLk9iamVjdF9UZXh0KClcbiAgICAgICAgXG4gICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG4gICAgICAgIHRleHRPYmplY3QgPSB0ZXh0c1tudW1iZXJdXG4gICAgICAgIHRleHRPYmplY3QuZG9tYWluID0gQHBhcmFtcy5udW1iZXJEb21haW5cbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgcG9zaXRpb25BbmNob3IgPSBpZiAhaXNMb2NrZWQoZmxhZ3MucG9zaXRpb25PcmlnaW4pIHRoZW4gQGludGVycHJldGVyLmdyYXBoaWNBbmNob3JQb2ludHNCeUNvbnN0YW50W0BwYXJhbXMucG9zaXRpb25PcmlnaW5dIHx8IG5ldyBncy5Qb2ludCgwLCAwKSBlbHNlIEBpbnRlcnByZXRlci5ncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudFtkZWZhdWx0cy5wb3NpdGlvbk9yaWdpbl1cbiAgICAgICAgXG4gICAgICAgIHRleHRPYmplY3QudGV4dCA9IHRleHRcbiAgICAgICAgdGV4dE9iamVjdC5kc3RSZWN0LnggPSB4IFxuICAgICAgICB0ZXh0T2JqZWN0LmRzdFJlY3QueSA9IHkgXG4gICAgICAgIHRleHRPYmplY3QuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIHRleHRPYmplY3QuYW5jaG9yLnggPSBpZiBvcmlnaW4gPT0gMCB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgdGV4dE9iamVjdC5hbmNob3IueSA9IGlmIG9yaWdpbiA9PSAwIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICB0ZXh0T2JqZWN0LnBvc2l0aW9uQW5jaG9yLnggPSBwb3NpdGlvbkFuY2hvci54XG4gICAgICAgIHRleHRPYmplY3QucG9zaXRpb25BbmNob3IueSA9IHBvc2l0aW9uQW5jaG9yLnlcbiAgICAgICAgdGV4dE9iamVjdC56SW5kZXggPSB6SW5kZXggfHwgICg3MDAgKyBudW1iZXIpXG4gICAgICAgIHRleHRPYmplY3Quc2l6ZVRvRml0ID0geWVzXG4gICAgICAgIHRleHRPYmplY3QuZm9ybWF0dGluZyA9IHllc1xuICAgICAgICBpZiBAcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwic2NlbmVcIlxuICAgICAgICAgICAgdGV4dE9iamVjdC52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICB0ZXh0T2JqZWN0LnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCB0ZXh0T2JqZWN0LCBAcGFyYW1zKVxuICAgICAgICAgICAgdGV4dE9iamVjdC5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIHRleHRPYmplY3QuZHN0UmVjdC55ID0gcC55XG4gICAgICAgICAgICBcbiAgICAgICAgdGV4dE9iamVjdC5hbmltYXRvci5hcHBlYXIoeCwgeSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRUZXh0TW90aW9uQmx1clxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZFRleHRNb3Rpb25CbHVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB0ZXh0Lm1vdGlvbkJsdXIuc2V0KEBwYXJhbXMubW90aW9uQmx1cilcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUmVmcmVzaFRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRSZWZyZXNoVGV4dDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHRzID0gc2NlbmUudGV4dHNcbiAgICAgICAgaWYgbm90IHRleHRzW251bWJlcl0/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgdGV4dHNbbnVtYmVyXS5iZWhhdmlvci5yZWZyZXNoKHllcylcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTW92ZVRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KHRleHQsIEBwYXJhbXMucGljdHVyZS5wb3NpdGlvbiwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVUZXh0UGF0aFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTW92ZVRleHRQYXRoOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdFBhdGgodGV4dCwgQHBhcmFtcy5wYXRoLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kUm90YXRlVGV4dDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdCh0ZXh0LCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRab29tVGV4dDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnpvb21PYmplY3QodGV4dCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCbGVuZFRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmxlbmRUZXh0OiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgdGV4dCA9IFNjZW5lTWFuYWdlci5zY2VuZS50ZXh0c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmJsZW5kT2JqZWN0KHRleHQsIEBwYXJhbXMpICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ29sb3JUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZENvbG9yVGV4dDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBpZiB0ZXh0P1xuICAgICAgICAgICAgdGV4dC5hbmltYXRvci5jb2xvclRvKG5ldyBDb2xvcihAcGFyYW1zLmNvbG9yKSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvbiBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIGNvbW1hbmRFcmFzZVRleHQ6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudGV4dFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGV4dC5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoc2VuZGVyKSA9PiBcbiAgICAgICAgICAgIHNlbmRlci5kaXNwb3NlKClcbiAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oc2VuZGVyLmRvbWFpbilcbiAgICAgICAgICAgIHNjZW5lLnRleHRzW251bWJlcl0gPSBudWxsXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb24gXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRleHRFZmZlY3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kVGV4dEVmZmVjdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdEVmZmVjdCh0ZXh0LCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRJbnB1dFRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZElucHV0VGV4dDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgaWYgKEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcHx8QGludGVycHJldGVyLnByZXZpZXcpIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgQGludGVycHJldGVyLm1lc3NhZ2VPYmplY3QoKS5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnZhcmlhYmxlLCBcIlwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICBpZiBAaW50ZXJwcmV0ZXIuaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0KClcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yTWVzc2FnZSgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgICR0ZW1wRmllbGRzLmxldHRlcnMgPSBAcGFyYW1zLmxldHRlcnNcbiAgICAgICAgc2NlbmUuYmVoYXZpb3Iuc2hvd0lucHV0VGV4dChAcGFyYW1zLmxldHRlcnMsIGdzLkNhbGxCYWNrKFwib25JbnB1dFRleHRGaW5pc2hcIiwgQGludGVycHJldGVyLCBAaW50ZXJwcmV0ZXIpKSAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0aW5nRm9yLmlucHV0VGV4dCA9IEBwYXJhbXNcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2F2ZVBlcnNpc3RlbnREYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRTYXZlUGVyc2lzdGVudERhdGE6IC0+IEdhbWVNYW5hZ2VyLnNhdmVHbG9iYWxEYXRhKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTYXZlU2V0dGluZ3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFNhdmVTZXR0aW5nczogLT4gR2FtZU1hbmFnZXIuc2F2ZVNldHRpbmdzKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQcmVwYXJlU2F2ZUdhbWVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFByZXBhcmVTYXZlR2FtZTogLT5cbiAgICAgICAgaWYgQGludGVycHJldGVyLnByZXZpZXdEYXRhPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIrK1xuICAgICAgICBHYW1lTWFuYWdlci5wcmVwYXJlU2F2ZUdhbWUoQHBhcmFtcy5zbmFwc2hvdClcbiAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXItLVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTYXZlR2FtZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kU2F2ZUdhbWU6IC0+XG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5wcmV2aWV3RGF0YT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHRodW1iV2lkdGggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRodW1iV2lkdGgpXG4gICAgICAgIHRodW1iSGVpZ2h0ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50aHVtYkhlaWdodClcbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNhdmUoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5zbG90KSAtIDEsIHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMb2FkR2FtZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTG9hZEdhbWU6IC0+XG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5wcmV2aWV3RGF0YT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLmxvYWQoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5zbG90KSAtIDEpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFdhaXRGb3JJbnB1dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kV2FpdEZvcklucHV0OiAtPlxuICAgICAgICByZXR1cm4gaWYgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZURvd25cIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwia2V5RG93blwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgIFxuICAgICAgICBmID0gPT5cbiAgICAgICAgICAgIGtleSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMua2V5KVxuICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IG5vXG4gICAgICAgICAgICBpZiBJbnB1dC5Nb3VzZS5pc0J1dHRvbihAcGFyYW1zLmtleSlcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0gSW5wdXQuTW91c2UuYnV0dG9uc1tAcGFyYW1zLmtleV0gPT0gQHBhcmFtcy5zdGF0ZVxuICAgICAgICAgICAgZWxzZSBpZiBAcGFyYW1zLmtleSA9PSAxMDBcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIElucHV0LmtleURvd24gYW5kIEBwYXJhbXMuc3RhdGUgPT0gMVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgSW5wdXQua2V5VXAgYW5kIEBwYXJhbXMuc3RhdGUgPT0gMlxuICAgICAgICAgICAgZWxzZSBpZiBAcGFyYW1zLmtleSA9PSAxMDFcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24gYW5kIEBwYXJhbXMuc3RhdGUgPT0gMVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgSW5wdXQuTW91c2UuYnV0dG9uVXAgYW5kIEBwYXJhbXMuc3RhdGUgPT0gMlxuICAgICAgICAgICAgZWxzZSBpZiBAcGFyYW1zLmtleSA9PSAxMDJcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIChJbnB1dC5rZXlEb3duIG9yIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24pIGFuZCBAcGFyYW1zLnN0YXRlID09IDFcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIChJbnB1dC5rZXlVcCBvciBJbnB1dC5Nb3VzZS5idXR0b25VcCkgYW5kIEBwYXJhbXMuc3RhdGUgPT0gMlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtleSA9IGlmIGtleSA+IDEwMCB0aGVuIGtleSAtIDEwMCBlbHNlIGtleVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSBJbnB1dC5rZXlzW2tleV0gPT0gQHBhcmFtcy5zdGF0ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZXhlY3V0ZUFjdGlvblxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZURvd25cIiwgQG9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQG9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleURvd25cIiwgQG9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VEb3duXCIsIGYsIG51bGwsIEBvYmplY3RcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCBmLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcImtleURvd25cIiwgZiwgbnVsbCwgQG9iamVjdFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJLZXlVcFwiLCBmLCBudWxsLCBAb2JqZWN0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRHZXRJbnB1dERhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kR2V0SW5wdXREYXRhOiAtPlxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwICMgQnV0dG9uIEFcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkFdKVxuICAgICAgICAgICAgd2hlbiAxICMgQnV0dG9uIEJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkJdKVxuICAgICAgICAgICAgd2hlbiAyICMgQnV0dG9uIFhcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlhdKVxuICAgICAgICAgICAgd2hlbiAzICMgQnV0dG9uIFlcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlldKVxuICAgICAgICAgICAgd2hlbiA0ICMgQnV0dG9uIExcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkxdKVxuICAgICAgICAgICAgd2hlbiA1ICMgQnV0dG9uIFJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlJdKVxuICAgICAgICAgICAgd2hlbiA2ICMgQnV0dG9uIFNUQVJUXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5TVEFSVF0pXG4gICAgICAgICAgICB3aGVuIDcgIyBCdXR0b24gU0VMRUNUXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5TRUxFQ1RdKVxuICAgICAgICAgICAgd2hlbiA4ICMgTW91c2UgWFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLngpXG4gICAgICAgICAgICB3aGVuIDkgIyBNb3VzZSBZXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UueSlcbiAgICAgICAgICAgIHdoZW4gMTAgIyBNb3VzZSBXaGVlbFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLndoZWVsKVxuICAgICAgICAgICAgd2hlbiAxMSAjIE1vdXNlIExlZnRcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdKVxuICAgICAgICAgICAgd2hlbiAxMiAjIE1vdXNlIFJpZ2h0XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5SSUdIVF0pXG4gICAgICAgICAgICB3aGVuIDEzICMgTW91c2UgTWlkZGxlXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5NSURETEVdKVxuICAgICAgICAgICAgd2hlbiAxMDAgIyBBbnkgS2V5XG4gICAgICAgICAgICAgICAgYW55S2V5ID0gMFxuICAgICAgICAgICAgICAgIGFueUtleSA9IDEgaWYgSW5wdXQua2V5RG93blxuICAgICAgICAgICAgICAgIGFueUtleSA9IDIgaWYgSW5wdXQua2V5VXBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBhbnlLZXkpXG4gICAgICAgICAgICB3aGVuIDEwMSAjIEFueSBCdXR0b25cbiAgICAgICAgICAgICAgICBhbnlCdXR0b24gPSAwXG4gICAgICAgICAgICAgICAgYW55QnV0dG9uID0gMSBpZiBJbnB1dC5Nb3VzZS5idXR0b25Eb3duXG4gICAgICAgICAgICAgICAgYW55QnV0dG9uID0gMiBpZiBJbnB1dC5Nb3VzZS5idXR0b25VcFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGFueUJ1dHRvbilcbiAgICAgICAgICAgIHdoZW4gMTAyICMgQW55IElucHV0XG4gICAgICAgICAgICAgICAgYW55SW5wdXQgPSAwXG4gICAgICAgICAgICAgICAgYW55SW5wdXQgPSAxIGlmIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24gb3IgSW5wdXQua2V5RG93blxuICAgICAgICAgICAgICAgIGFueUlucHV0ID0gMiBpZiBJbnB1dC5Nb3VzZS5idXR0b25VcCBvciBJbnB1dC5rZXlVcFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGFueUlucHV0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvZGUgPSBAcGFyYW1zLmZpZWxkIC0gMTAwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tjb2RlXSlcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRHZXRHYW1lRGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgIFxuICAgIGNvbW1hbmRHZXRHYW1lRGF0YTogLT5cbiAgICAgICAgdGVtcFNldHRpbmdzID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzXG4gICAgICAgIHNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLmZpZWxkXG4gICAgICAgICAgICB3aGVuIDAgIyBTY2VuZSBJRFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIFNjZW5lTWFuYWdlci5zY2VuZS5zY2VuZURvY3VtZW50LnVpZClcbiAgICAgICAgICAgIHdoZW4gMSAjIEdhbWUgVGltZSAtIFNlY29uZHNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKEdyYXBoaWNzLmZyYW1lQ291bnQgLyA2MCkpXG4gICAgICAgICAgICB3aGVuIDIgIyBHYW1lIFRpbWUgLSBNaW51dGVzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgTWF0aC5yb3VuZChHcmFwaGljcy5mcmFtZUNvdW50IC8gNjAgLyA2MCkpXG4gICAgICAgICAgICB3aGVuIDMgIyBHYW1lIFRpbWUgLSBIb3Vyc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQoR3JhcGhpY3MuZnJhbWVDb3VudCAvIDYwIC8gNjAgLyA2MCkpXG4gICAgICAgICAgICB3aGVuIDQgIyBEYXRlIC0gRGF5IG9mIE1vbnRoXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXREYXRlKCkpXG4gICAgICAgICAgICB3aGVuIDUgIyBEYXRlIC0gRGF5IG9mIFdlZWtcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBuZXcgRGF0ZSgpLmdldERheSgpKVxuICAgICAgICAgICAgd2hlbiA2ICMgRGF0ZSAtIE1vbnRoXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXRNb250aCgpKVxuICAgICAgICAgICAgd2hlbiA3ICMgRGF0ZSAtIFllYXJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpXG4gICAgICAgICAgICB3aGVuIDhcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYWxsb3dTa2lwKVxuICAgICAgICAgICAgd2hlbiA5XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFsbG93U2tpcFVucmVhZE1lc3NhZ2VzKVxuICAgICAgICAgICAgd2hlbiAxMFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLm1lc3NhZ2VTcGVlZClcbiAgICAgICAgICAgIHdoZW4gMTFcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYXV0b01lc3NhZ2UuZW5hYmxlZClcbiAgICAgICAgICAgIHdoZW4gMTJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hdXRvTWVzc2FnZS50aW1lKVxuICAgICAgICAgICAgd2hlbiAxM1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hdXRvTWVzc2FnZS53YWl0Rm9yVm9pY2UpXG4gICAgICAgICAgICB3aGVuIDE0XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmF1dG9NZXNzYWdlLnN0b3BPbkFjdGlvbilcbiAgICAgICAgICAgIHdoZW4gMTVcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MudGltZU1lc3NhZ2VUb1ZvaWNlKVxuICAgICAgICAgICAgd2hlbiAxNlxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hbGxvd1ZpZGVvU2tpcClcbiAgICAgICAgICAgIHdoZW4gMTdcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYWxsb3dDaG9pY2VTa2lwKVxuICAgICAgICAgICAgd2hlbiAxOFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5za2lwVm9pY2VPbkFjdGlvbilcbiAgICAgICAgICAgIHdoZW4gMTlcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuZnVsbFNjcmVlbilcbiAgICAgICAgICAgIHdoZW4gMjBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYWRqdXN0QXNwZWN0UmF0aW8pXG4gICAgICAgICAgICB3aGVuIDIxXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmNvbmZpcm1hdGlvbilcbiAgICAgICAgICAgIHdoZW4gMjJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5iZ21Wb2x1bWUpXG4gICAgICAgICAgICB3aGVuIDIzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3Mudm9pY2VWb2x1bWUpXG4gICAgICAgICAgICB3aGVuIDI0XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3Muc2VWb2x1bWUpXG4gICAgICAgICAgICB3aGVuIDI1XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmJnbUVuYWJsZWQpXG4gICAgICAgICAgICB3aGVuIDI2XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnZvaWNlRW5hYmxlZClcbiAgICAgICAgICAgIHdoZW4gMjdcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3Muc2VFbmFibGVkKVxuICAgICAgICAgICAgd2hlbiAyOCAjIExhbmd1YWdlIC0gQ29kZVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZT8uY29kZSB8fCBcIlwiKVxuICAgICAgICAgICAgd2hlbiAyOSAjIExhbmd1YWdlIC0gTmFtZVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZT8ubmFtZSB8fCBcIlwiKSAgICBcbiAgICAgICAgICAgIHdoZW4gMzBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXApXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2V0R2FtZURhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2V0R2FtZURhdGE6IC0+XG4gICAgICAgIHRlbXBTZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5nc1xuICAgICAgICBzZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWxsb3dTa2lwID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDFcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hbGxvd1NraXBVbnJlYWRNZXNzYWdlcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MubWVzc2FnZVNwZWVkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gM1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gNFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmF1dG9NZXNzYWdlLnRpbWUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgd2hlbiA1XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXV0b01lc3NhZ2Uud2FpdEZvclZvaWNlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDZcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hdXRvTWVzc2FnZS5zdG9wT25BY3Rpb24gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gN1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLnRpbWVNZXNzYWdlVG9Wb2ljZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiA4XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWxsb3dWaWRlb1NraXAgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gOVxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxMFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLnNraXBWb2ljZU9uQWN0aW9uID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDExXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuZnVsbFNjcmVlbiA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgICAgIGlmIHNldHRpbmdzLmZ1bGxTY3JlZW5cbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmVudGVyRnVsbFNjcmVlbigpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IubGVhdmVGdWxsU2NyZWVuKClcbiAgICAgICAgICAgIHdoZW4gMTJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hZGp1c3RBc3BlY3RSYXRpbyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgICAgIEdyYXBoaWNzLmtlZXBSYXRpbyA9IHNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvXG4gICAgICAgICAgICAgICAgR3JhcGhpY3Mub25SZXNpemUoKVxuICAgICAgICAgICAgd2hlbiAxM1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbmZpcm1hdGlvbiA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxNFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmJnbVZvbHVtZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE1XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mudm9pY2VWb2x1bWUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxNlxuICAgICAgICAgICAgICAgIHNldHRpbmdzLnNlVm9sdW1lID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTdcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5iZ21FbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE4XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mudm9pY2VFbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE5XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Muc2VFbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpICAgXG4gICAgICAgICAgICB3aGVuIDIwIFxuICAgICAgICAgICAgICAgIGNvZGUgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgICAgICBsYW5ndWFnZSA9IExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZXMuZmlyc3QgKGwpID0+IGwuY29kZSA9PSBjb2RlXG4gICAgICAgICAgICAgICAgTGFuZ3VhZ2VNYW5hZ2VyLnNlbGVjdExhbmd1YWdlKGxhbmd1YWdlKSBpZiBsYW5ndWFnZVxuICAgICAgICAgICAgd2hlbiAyMVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kR2V0T2JqZWN0RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRHZXRPYmplY3REYXRhOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vYmplY3RUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBQaWN0dXJlXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiAxICMgQmFja2dyb3VuZFxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS50ZXh0c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDMgIyBNb3ZpZVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWRlb3NbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiA0ICMgQ2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gY2hhcmFjdGVySWRcbiAgICAgICAgICAgIHdoZW4gNSAjIE1lc3NhZ2UgQm94XG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJtZXNzYWdlQm94XCIpXG4gICAgICAgICAgICB3aGVuIDYgIyBNZXNzYWdlIEFyZWFcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VNZXNzYWdlQXJlYURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBhcmVhID0gU2NlbmVNYW5hZ2VyLnNjZW5lLm1lc3NhZ2VBcmVhc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gYXJlYT8ubGF5b3V0XG4gICAgICAgICAgICB3aGVuIDcgIyBIb3RzcG90XG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuaG90c3BvdHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBmaWVsZCA9IEBwYXJhbXMuZmllbGRcbiAgICAgICAgaWYgQHBhcmFtcy5vYmplY3RUeXBlID09IDQgIyBDaGFyYWN0ZXJcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLmZpZWxkXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgSURcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2NoYXJhY3RlcklkXT8uaW5kZXggfHwgXCJcIilcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBOYW1lXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxjcyhSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbY2hhcmFjdGVySWRdPy5uYW1lKSB8fCBcIlwiKVxuICAgICAgICAgICAgZmllbGQgLT0gMlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iamVjdD8gICAgICAgIFxuICAgICAgICAgICAgaWYgZmllbGQgPj0gMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBSZXNvdXJjZSBOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vYmplY3RUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC50ZXh0IHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC52aWRlbyB8fCBcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmltYWdlIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFBvc2l0aW9uIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgUG9zaXRpb24gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuZHN0UmVjdC55KVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBBbmNob3IgLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKG9iamVjdC5hbmNob3IueCAqIDEwMCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIEFuY2hvciAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0LmFuY2hvci55ICogMTAwKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgWm9vbSAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0Lnpvb20ueCAqIDEwMCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNiAjIFpvb20gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKG9iamVjdC56b29tLnkgKiAxMDApKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDcgIyBTaXplIC0gV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5kc3RSZWN0LndpZHRoKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDggIyBTaXplIC0gSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuZHN0UmVjdC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOSAjIFotSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC56SW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTAgIyBPcGFjaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3Qub3BhY2l0eSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMSAjIEFuZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuYW5nbGUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTIgIyBWaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LnZpc2libGUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTMgIyBCbGVuZCBNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuYmxlbmRNb2RlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDE0ICMgRmxpcHBlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5taXJyb3IpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2V0T2JqZWN0RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgICAgICBcbiAgICBjb21tYW5kU2V0T2JqZWN0RGF0YTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMub2JqZWN0VHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgUGljdHVyZVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gMSAjIEJhY2tncm91bmRcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUudGV4dHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiAzICMgTW92aWVcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUudmlkZW9zW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gNCAjIENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgICAgICB3aGVuIDUgIyBNZXNzYWdlIEJveFxuICAgICAgICAgICAgICAgIG9iamVjdCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwibWVzc2FnZUJveFwiKVxuICAgICAgICAgICAgd2hlbiA2ICMgTWVzc2FnZSBBcmVhXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlTWVzc2FnZUFyZWFEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgYXJlYSA9IFNjZW5lTWFuYWdlci5zY2VuZS5tZXNzYWdlQXJlYXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IGFyZWE/LmxheW91dFxuICAgICAgICAgICAgd2hlbiA3ICMgSG90c3BvdFxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUhvdHNwb3REb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmhvdHNwb3RzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZpZWxkID0gQHBhcmFtcy5maWVsZFxuICAgICAgICBpZiBAcGFyYW1zLm9iamVjdFR5cGUgPT0gNCAjIENoYXJhY3RlclxuICAgICAgICAgICAgc3dpdGNoIGZpZWxkXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTmFtZVxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5uYW1lID0gbmFtZVxuICAgICAgICAgICAgICAgICAgICBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbY2hhcmFjdGVySWRdPy5uYW1lID0gbmFtZVxuICAgICAgICAgICAgZmllbGQtLVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iamVjdD8gICAgICAgIFxuICAgICAgICAgICAgaWYgZmllbGQgPj0gMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBSZXNvdXJjZSBOYW1lIC8gVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub2JqZWN0VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QudGV4dCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gM1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlkZW8gPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBBbmNob3IgLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBBbmNob3IgLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBab29tIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lnpvb20ueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNiAjIFpvb20gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Quem9vbS55ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgLyAxMDBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA3ICMgWi1JbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnpJbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOCAjIE9wYWNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5PSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDkgIyBBbmdsZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFuZ2xlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMCAjIFZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXNpYmxlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTEgIyBCbGVuZCBNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTIgIyBGbGlwcGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QubWlycm9yID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VTb3VuZHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZENoYW5nZVNvdW5kczogLT5cbiAgICAgICAgc291bmRzID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc291bmRzXG4gICAgICAgIGZpZWxkRmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgXG4gICAgICAgIGZvciBzb3VuZCwgaSBpbiBAcGFyYW1zLnNvdW5kc1xuICAgICAgICAgICAgaWYgIWdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkKGZpZWxkRmxhZ3NbXCJzb3VuZHMuXCIraV0pXG4gICAgICAgICAgICAgICAgc291bmRzW2ldID0gQHBhcmFtcy5zb3VuZHNbaV1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VDb2xvcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kQ2hhbmdlQ29sb3JzOiAtPlxuICAgICAgICBjb2xvcnMgPSBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jb2xvcnNcbiAgICAgICAgZmllbGRGbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBcbiAgICAgICAgZm9yIGNvbG9yLCBpIGluIEBwYXJhbXMuY29sb3JzXG4gICAgICAgICAgICBpZiAhZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWQoZmllbGRGbGFnc1tcImNvbG9ycy5cIitpXSlcbiAgICAgICAgICAgICAgICBjb2xvcnNbaV0gPSBuZXcgZ3MuQ29sb3IoQHBhcmFtcy5jb2xvcnNbaV0pXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU2NyZWVuQ3Vyc29yXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgY29tbWFuZENoYW5nZVNjcmVlbkN1cnNvcjogLT5cbiAgICAgICAgaWYgQHBhcmFtcy5ncmFwaGljPy5uYW1lP1xuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7QHBhcmFtcy5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAoYml0bWFwLCBAcGFyYW1zLmh4LCBAcGFyYW1zLmh5KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAobnVsbCwgMCwgMClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXNldEdsb2JhbERhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRSZXNldEdsb2JhbERhdGE6IC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnJlc2V0R2xvYmFsRGF0YSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2NyaXB0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIGNvbW1hbmRTY3JpcHQ6IC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgIUBwYXJhbXMuc2NyaXB0RnVuY1xuICAgICAgICAgICAgICAgIEBwYXJhbXMuc2NyaXB0RnVuYyA9IGV2YWwoXCIoZnVuY3Rpb24oKXtcIiArIEBwYXJhbXMuc2NyaXB0ICsgXCJ9KVwiKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQHBhcmFtcy5zY3JpcHRGdW5jKClcbiAgICAgICAgY2F0Y2ggZXhcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV4KVxuICAgICAgICAgICAgXG53aW5kb3cuQ29tbWFuZEludGVycHJldGVyID0gQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlciA9IENvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbiAgICBcbiAgICAgICAgXG4gICAgICAgICJdfQ==
//# sourceURL=Component_CommandInterpreter_166.js