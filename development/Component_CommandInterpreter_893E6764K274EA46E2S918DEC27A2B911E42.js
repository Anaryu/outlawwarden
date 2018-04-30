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

    /** 
    * Indicates that the command to skip to has not been found. 
    * @property commandNotFound  
    * @type boolean
     */
    this.commandNotFound = false;
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
    if (messageObject.waitForCompletion) {
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
      SceneManager.scene.choices = [];
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
    Component_CommandInterpreter.__super__.setup.apply(this, arguments);
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
      if (this.previewData.uid && this.previewData.uid !== this.command.uid) {
        GameManager.tempSettings.skip = true;
        GameManager.tempSettings.skipTime = 0;
      } else if (this.pointer < this.previewData.pointer) {
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

  Component_CommandInterpreter.prototype.numberValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.numberValueAtIndex(scope, index, domain);
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
    var objectPosition;
    objectPosition = RecordManager.system.objectPositions[position];
    if (!objectPosition) {
      return {
        x: 0,
        y: 0
      };
    }
    return objectPosition.func.call(null, object, params) || {
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

  Component_CommandInterpreter.prototype.eraseObject = function(object, params, callback) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.disappear(params.animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        return typeof callback === "function" ? callback(sender) : void 0;
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
      choices: scene.choices,
      isChoice: true
    });
    scene.choices = [];
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
            return SceneManager.scene.interpreter.callCommonEvent(params.action.data.commonEventId, null, _this.interpreter.isWaiting);
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
    value = this.params.order === 0 ? list.join(this.params.separator || "") : list.reverse().join(this.params.separator || "");
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
      switch (this.params.target) {
        case "activeContext":
          return this.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
        case "activeScene":
          return SceneManager.scene.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
        default:
          return this.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
      }
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
      scene.backgrounds[layer].zIndex = zIndex + layer;
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
    var animation, defaults, duration, easing, flags, isLocked, number, origin, p, ref, ref1, ref2, scene, video, videos, x, y, zIndex;
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
    video.loop = (ref1 = this.params.loop) != null ? ref1 : true;
    video.dstRect.x = x;
    video.dstRect.y = y;
    video.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    video.anchor.x = origin === 0 ? 0 : 0.5;
    video.anchor.y = origin === 0 ? 0 : 0.5;
    video.zIndex = zIndex || (1000 + number);
    if (((ref2 = this.params.viewport) != null ? ref2.type : void 0) === "scene") {
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
    var imageMap, number, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    imageMap = scene.pictures[number];
    if (imageMap == null) {
      return;
    }
    imageMap.events.emit("finish", imageMap);
    imageMap.visual.active = false;
    this.interpreter.eraseObject(imageMap, this.params, (function(_this) {
      return function(sender) {
        scene.behavior.changePictureDomain(sender.domain);
        return scene.pictures[number] = null;
      };
    })(this));
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
          if (scene.choiceWindow && ((ref = scene.choices) != null ? ref.length : void 0) > 0) {
            defaultChoice = (scene.choices.first(function(c) {
              return c.isDefault;
            })) || scene.choices[0];
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
    choices = scene.choices || [];
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
      scene.choices = [];
    } else {
      if (choices.length > 0) {
        this.interpreter.isWaiting = true;
        scene.behavior.showChoices(gs.CallBack("onChoiceAccept", this.interpreter, {
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
    if (!scene.choices) {
      scene.choices = [];
    }
    choices = scene.choices;
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
    music = null;
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
        music = AudioManager.playMusic(this.params.music.name, volume, playbackRate, fadeDuration, this.params.layer || 0, this.params.loop);
      }
    }
    if (music && this.params.waitForCompletion && !this.params.loop) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = Math.round(music.duration * Graphics.frameRate);
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
    var defaults, flags, isLocked, playbackRate, sound, volume;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    sound = null;
    if (GameManager.settings.soundEnabled && !GameManager.tempSettings.skip) {
      volume = !isLocked(flags["sound.volume"]) ? this.params.sound.volume : defaults.soundVolume;
      playbackRate = !isLocked(flags["sound.playbackRate"]) ? this.params.sound.playbackRate : defaults.soundPlaybackRate;
      sound = AudioManager.playSound(this.params.sound.name, volume, playbackRate, this.params.musicEffect, null, this.params.loop);
    }
    gs.GameNotifier.postMinorChange();
    if (sound && this.params.waitForCompletion && !this.params.loop) {
      this.interpreter.isWaiting = true;
      return this.interpreter.waitCounter = Math.round(sound.duration * Graphics.frameRate);
    }
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
    gs.GlobalEventManager.offByOwner("mouseDown", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("keyDown", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.interpreter.object);
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
          gs.GlobalEventManager.offByOwner("mouseDown", _this.interpreter.object);
          gs.GlobalEventManager.offByOwner("mouseUp", _this.interpreter.object);
          gs.GlobalEventManager.offByOwner("keyDown", _this.interpreter.object);
          return gs.GlobalEventManager.offByOwner("keyUp", _this.interpreter.object);
        }
      };
    })(this);
    gs.GlobalEventManager.on("mouseDown", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("mouseUp", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("keyDown", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("keyUp", f, null, this.interpreter.object);
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
        return settings.messageSpeed = this.interpreter.numberValueOf(this.params.decimalValue);
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
    if (this.params.objectType === 6) {
      switch (field) {
        case 0:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.x);
        case 1:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.y);
        case 2:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.zIndex);
        case 3:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.opacity);
        case 4:
          return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.visible);
      }
    } else if (object != null) {
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
    if (this.params.objectType === 6) {
      switch (field) {
        case 0:
          return object.dstRect.x = this.interpreter.numberValueOf(this.params.numberValue);
        case 1:
          return object.dstRect.y = this.interpreter.numberValueOf(this.params.numberValue);
        case 2:
          return object.zIndex = this.interpreter.numberValueOf(this.params.numberValue);
        case 3:
          return object.opacity = this.interpreter.numberValueOf(this.params.numberValue);
        case 4:
          return object.visible = this.interpreter.booleanValueOf(this.params.switchValue);
      }
    } else if (object != null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsaUVBQUE7RUFBQTs7O0FBQU07O0FBQ0Y7Ozs7Ozs7RUFPYSx5QkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7O0FBRXBCOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1CO0VBN0JWOzs7Ozs7QUErQmpCLEVBQUUsQ0FBQyxlQUFILEdBQXFCOztBQUVmO0VBQ0Ysa0JBQUMsQ0FBQSxvQkFBRCxHQUF3QixDQUFDLE9BQUQ7OztBQUV4Qjs7Ozs7Ozs7Ozs7O0VBV2EsNEJBQUMsRUFBRCxFQUFLLEtBQUw7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLEVBQUQsR0FBTTs7QUFFTjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTO0VBYkE7OztBQWViOzs7Ozs7OytCQU1BLEdBQUEsR0FBSyxTQUFDLEVBQUQsRUFBSyxLQUFMO0lBQ0QsSUFBQyxDQUFBLEVBQUQsR0FBTTtXQUNOLElBQUMsQ0FBQSxLQUFELEdBQVM7RUFGUjs7Ozs7O0FBSVQsRUFBRSxDQUFDLGtCQUFILEdBQXdCOztBQUVsQjs7O0VBQ0YsNEJBQUMsQ0FBQSxvQkFBRCxHQUF3QixDQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLHFCQUF0QixFQUE2Qyx1QkFBN0MsRUFBc0Usb0JBQXRFOzs7QUFFeEI7Ozs7Ozs7Ozt5Q0FRQSxtQkFBQSxHQUFxQixTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7OztBQUdyQjs7Ozs7Ozs7Ozs7OztFQVlhLHNDQUFBO0lBQ1QsNERBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7Ozs7SUFNQSxJQUFD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QUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixHQUFxQixJQUFBLENBQUssY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXpCLEdBQWtDLElBQXZDLEVBRHpCOzthQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLEVBSko7S0FBQSxhQUFBO01BS007YUFDRixPQUFPLENBQUMsR0FBUixDQUFZLEVBQVosRUFOSjs7RUFEVzs7OztHQXBxTHdCLEVBQUUsQ0FBQzs7QUE2cUw5QyxNQUFNLENBQUMsa0JBQVAsR0FBNEI7O0FBQzVCLEVBQUUsQ0FBQyw0QkFBSCxHQUFrQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBMaXZlUHJldmlld0luZm9cbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgaW50ZXJuYWwgcHJldmlldy1pbmZvIGlmIHRoZSBnYW1lIHJ1bnMgY3VycmVudGx5IGluIExpdmUtUHJldmlldy5cbiAgICAqICAgICAgICBcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBMaXZlUHJldmlld0luZm9cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGltZXIgSUQgaWYgYSB0aW1lb3V0IGZvciBsaXZlLXByZXZpZXcgd2FzIGNvbmZpZ3VyZWQgdG8gZXhpdCB0aGUgZ2FtZSBsb29wIGFmdGVyIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdGltZW91dFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHRpbWVvdXQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqIFxuICAgICAgICAqIEluZGljYXRlcyBpZiBMaXZlLVByZXZpZXcgaXMgY3VycmVudGx5IHdhaXRpbmcgZm9yIHRoZSBuZXh0IHVzZXItYWN0aW9uLiAoU2VsZWN0aW5nIGFub3RoZXIgY29tbWFuZCwgZXRjLilcbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdGluZyAgXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvdW50cyB0aGUgYW1vdW50IG9mIGV4ZWN1dGVkIGNvbW1hbmRzIHNpbmNlIHRoZSBsYXN0IFxuICAgICAgICAqIGludGVycHJldGVyLXBhdXNlKHdhaXRpbmcsIGV0Yy4pLiBJZiBpdHMgbW9yZSB0aGFuIDUwMCwgdGhlIGludGVycHJldGVyIHdpbGwgYXV0b21hdGljYWxseSBwYXVzZSBmb3IgMSBmcmFtZSB0byBcbiAgICAgICAgKiBhdm9pZCB0aGF0IExpdmUtUHJldmlldyBmcmVlemVzIHRoZSBFZGl0b3IgaW4gY2FzZSBvZiBlbmRsZXNzIGxvb3BzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBleGVjdXRlZENvbW1hbmRzXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZXhlY3V0ZWRDb21tYW5kcyA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIyogXG4gICAgICAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgdG8gc2tpcCB0byBoYXMgbm90IGJlZW4gZm91bmQuIFxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21tYW5kTm90Rm91bmQgIFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBjb21tYW5kTm90Rm91bmQgPSBub1xuICAgICAgICBcbmdzLkxpdmVQcmV2aWV3SW5mbyA9IExpdmVQcmV2aWV3SW5mb1xuICAgICAgICBcbmNsYXNzIEludGVycHJldGVyQ29udGV4dFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm93bmVyXCJdXG4gICAgXG4gICAgIyMjKlxuICAgICogRGVzY3JpYmVzIGFuIGludGVycHJldGVyLWNvbnRleHQgd2hpY2ggaG9sZHMgaW5mb3JtYXRpb24gYWJvdXRcbiAgICAqIHRoZSBpbnRlcnByZXRlcidzIG93bmVyIGFuZCBhbHNvIHVuaXF1ZSBJRCB1c2VkIGZvciBhY2Nlc3NpbmcgY29ycmVjdFxuICAgICogbG9jYWwgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBJbnRlcnByZXRlckNvbnRleHRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBpZCAtIEEgdW5pcXVlIElEXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3duZXIgLSBUaGUgb3duZXIgb2YgdGhlIGludGVycHJldGVyXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChpZCwgb3duZXIpIC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBBIHVuaXF1ZSBudW1lcmljIG9yIHRleHR1YWwgSUQgdXNlZCBmb3IgYWNjZXNzaW5nIGNvcnJlY3QgbG9jYWwgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAqIEB0eXBlIG51bWJlcnxzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBpZCA9IGlkXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG93bmVyIG9mIHRoZSBpbnRlcnByZXRlciAoZS5nLiBjdXJyZW50IHNjZW5lLCBldGMuKS5cbiAgICAgICAgKiBAcHJvcGVydHkgb3duZXJcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBvd25lciA9IG93bmVyXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgY29udGV4dCdzIGRhdGEuXG4gICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IGlkIC0gQSB1bmlxdWUgSURcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvd25lciAtIFRoZSBvd25lciBvZiB0aGUgaW50ZXJwcmV0ZXJcbiAgICAqIEBtZXRob2Qgc2V0XG4gICAgIyMjICAgIFxuICAgIHNldDogKGlkLCBvd25lcikgLT5cbiAgICAgICAgQGlkID0gaWRcbiAgICAgICAgQG93bmVyID0gb3duZXJcbiAgICAgICAgXG5ncy5JbnRlcnByZXRlckNvbnRleHQgPSBJbnRlcnByZXRlckNvbnRleHRcblxuY2xhc3MgQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9iamVjdFwiLCBcImNvbW1hbmRcIiwgXCJvbk1lc3NhZ2VBRFZXYWl0aW5nXCIsIFwib25NZXNzYWdlQURWRGlzYXBwZWFyXCIsIFwib25NZXNzYWdlQURWRmluaXNoXCJdXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEEgY29tcG9uZW50IHdoaWNoIGFsbG93cyBhIGdhbWUgb2JqZWN0IHRvIHByb2Nlc3MgY29tbWFuZHMgbGlrZSBmb3JcbiAgICAqIHNjZW5lLW9iamVjdHMuIEZvciBlYWNoIGNvbW1hbmQgYSBjb21tYW5kLWZ1bmN0aW9uIGV4aXN0cy4gVG8gYWRkXG4gICAgKiBvd24gY3VzdG9tIGNvbW1hbmRzIHRvIHRoZSBpbnRlcnByZXRlciBqdXN0IGNyZWF0ZSBhIHN1Yi1jbGFzcyBhbmRcbiAgICAqIG92ZXJyaWRlIHRoZSBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyLmFzc2lnbkNvbW1hbmQgbWV0aG9kXG4gICAgKiBhbmQgYXNzaWduIHRoZSBjb21tYW5kLWZ1bmN0aW9uIGZvciB5b3VyIGN1c3RvbS1jb21tYW5kLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfQ29tbWFuZEludGVycHJldGVyXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogV2FpdC1Db3VudGVyIGluIGZyYW1lcy4gSWYgZ3JlYXRlciB0aGFuIDAsIHRoZSBpbnRlcnByZXRlciB3aWxsIGZvciB0aGF0IGFtb3VudCBvZiBmcmFtZXMgYmVmb3JlIGNvbnRpbnVlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGV4IHRvIHRoZSBuZXh0IGNvbW1hbmQgdG8gZXhlY3V0ZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcG9pbnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBvaW50ZXIgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIHN0YXRlcyBvZiBjb25kaXRpb25zLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb25kaXRpb25zXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbmRpdGlvbnMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBzdGF0ZXMgb2YgbG9vcHMuXG4gICAgICAgICogQHByb3BlcnR5IGxvb3BzXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvb3BzID0gW11cbiAgICAgICAgXG4gICAgICAgICMgRklYTUU6IFNob3VsZCBub3QgYmUgc3RvcmVkIGluIHRoZSBpbnRlcnByZXRlci5cbiAgICAgICAgQHRpbWVycyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBpcyBjdXJyZW50bHkgcnVubmluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgaXNSdW5uaW5nXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBpcyBjdXJyZW50bHkgd2FpdGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgaXNXYWl0aW5nXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBpcyBjdXJyZW50bHkgd2FpdGluZyB1bnRpbCBhIG1lc3NhZ2UgcHJvY2Vzc2VkIGJ5IGFub3RoZXIgY29udGV4dCBsaWtlIGEgQ29tbW9uIEV2ZW50XG4gICAgICAgICogaXMgZmluaXNoZWQuXG4gICAgICAgICogRklYTUU6IENvbmZsaWN0IGhhbmRsaW5nIGNhbiBiZSByZW1vdmVkIG1heWJlLiBcbiAgICAgICAgKiBAcHJvcGVydHkgaXNXYWl0aW5nRm9yTWVzc2FnZVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmdGb3JNZXNzYWdlID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgaW50ZXJuYWwgcHJldmlldy1pbmZvIGlmIHRoZSBnYW1lIHJ1bnMgY3VycmVudGx5IGluIExpdmUtUHJldmlldy5cbiAgICAgICAgKiA8dWw+XG4gICAgICAgICogPGxpPnByZXZpZXdJbmZvLnRpbWVvdXQgLSBUaW1lciBJRCBpZiBhIHRpbWVvdXQgZm9yIGxpdmUtcHJldmlldyB3YXMgY29uZmlndXJlZCB0byBleGl0IHRoZSBnYW1lIGxvb3AgYWZ0ZXIgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lLjwvbGk+XG4gICAgICAgICogPGxpPnByZXZpZXdJbmZvLndhaXRpbmcgLSBJbmRpY2F0ZXMgaWYgTGl2ZS1QcmV2aWV3IGlzIGN1cnJlbnRseSB3YWl0aW5nIGZvciB0aGUgbmV4dCB1c2VyLWFjdGlvbi4gKFNlbGVjdGluZyBhbm90aGVyIGNvbW1hbmQsIGV0Yy4pPC9saT5cbiAgICAgICAgKiA8bGk+cHJldmlld0luZm8uZXhlY3V0ZWRDb21tYW5kcyAtIENvdW50cyB0aGUgYW1vdW50IG9mIGV4ZWN1dGVkIGNvbW1hbmRzIHNpbmNlIHRoZSBsYXN0IFxuICAgICAgICAqIGludGVycHJldGVyLXBhdXNlKHdhaXRpbmcsIGV0Yy4pLiBJZiBpdHMgbW9yZSB0aGFuIDUwMCwgdGhlIGludGVycHJldGVyIHdpbGwgYXV0b21hdGljYWxseSBwYXVzZSBmb3IgMSBmcmFtZSB0byBcbiAgICAgICAgKiBhdm9pZCB0aGF0IExpdmUtUHJldmlldyBmcmVlemVzIHRoZSBFZGl0b3IgaW4gY2FzZSBvZiBlbmRsZXNzIGxvb3BzLjwvbGk+XG4gICAgICAgICogPC91bD5cbiAgICAgICAgKiBAcHJvcGVydHkgcHJldmlld0luZm9cbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHByZXZpZXdJbmZvID0gbmV3IGdzLkxpdmVQcmV2aWV3SW5mbygpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIExpdmUtUHJldmlldyByZWxhdGVkIGluZm8gcGFzc2VkIGZyb20gdGhlIFZOIE1ha2VyIGVkaXRvciBsaWtlIHRoZSBjb21tYW5kLWluZGV4IHRoZSBwbGF5ZXIgY2xpY2tlZCBvbiwgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwcmV2aWV3RGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwcmV2aWV3RGF0YSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIGF1dG9tYXRpY2FsbHkgcmVwZWF0cyBleGVjdXRpb24gYWZ0ZXIgdGhlIGxhc3QgY29tbWFuZCB3YXMgZXhlY3V0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHJlcGVhdFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEByZXBlYXQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBleGVjdXRpb24gY29udGV4dCBvZiB0aGUgaW50ZXJwcmV0ZXIuXG4gICAgICAgICogQHByb3BlcnR5IGNvbnRleHRcbiAgICAgICAgKiBAdHlwZSBncy5JbnRlcnByZXRlckNvbnRleHRcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY29udGV4dCA9IG5ldyBncy5JbnRlcnByZXRlckNvbnRleHQoMCwgbnVsbClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdWItSW50ZXJwcmV0ZXIgZnJvbSBhIENvbW1vbiBFdmVudCBDYWxsLiBUaGUgaW50ZXJwcmV0ZXIgd2lsbCB3YWl0IHVudGlsIHRoZSBzdWItaW50ZXJwcmV0ZXIgaXMgZG9uZSBhbmQgc2V0IGJhY2sgdG9cbiAgICAgICAgKiA8Yj5udWxsPC9iPi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3ViSW50ZXJwcmV0ZXJcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHN1YkludGVycHJldGVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgaW5kZW50LWxldmVsIG9mIGV4ZWN1dGlvblxuICAgICAgICAqIEBwcm9wZXJ0eSBpbmRlbnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW5kZW50ID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBpbmZvcm1hdGlvbiBhYm91dCBmb3Igd2hhdCB0aGUgaW50ZXJwcmV0ZXIgaXMgY3VycmVudGx5IHdhaXRpbmcgZm9yIGxpa2UgZm9yIGEgQURWIG1lc3NhZ2UsIGV0Yy4gdG9cbiAgICAgICAgKiByZXN0b3JlIHByb2JhYmx5IHdoZW4gbG9hZGVkIGZyb20gYSBzYXZlLWdhbWUuXG4gICAgICAgICogQHByb3BlcnR5IHdhaXRpbmdGb3JcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAd2FpdGluZ0ZvciA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGludGVycHJldGVyIHJlbGF0ZWQgc2V0dGluZ3MgbGlrZSBob3cgdG8gaGFuZGxlIG1lc3NhZ2VzLCBldGMuXG4gICAgICAgICogQHByb3BlcnR5IHNldHRpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHNldHRpbmdzID0geyBtZXNzYWdlOiB7IGJ5SWQ6IHt9LCBhdXRvRXJhc2U6IHllcywgd2FpdEF0RW5kOiB5ZXMsIGJhY2tsb2c6IHllcyB9LCBzY3JlZW46IHsgcGFuOiBuZXcgZ3MuUG9pbnQoMCwgMCkgfSB9XG4gICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBNYXBwaW5nIHRhYmxlIHRvIHF1aWNrbHkgZ2V0IHRoZSBhbmNob3IgcG9pbnQgZm9yIHRoZSBhbiBpbnNlcnRlZCBhbmNob3ItcG9pbnQgY29uc3RhbnQgc3VjaCBhc1xuICAgICAgICAqIFRvcC1MZWZ0KDApLCBUb3AoMSksIFRvcC1SaWdodCgyKSBhbmQgc28gb24uXG4gICAgICAgICogQHByb3BlcnR5IGdyYXBoaWNBbmNob3JQb2ludHNCeUNvbnN0YW50XG4gICAgICAgICogQHR5cGUgZ3MuUG9pbnRbXVxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudCA9IFtcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjAsIDAuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC41LCAwLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDEuMCwgMC4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgxLjAsIDAuNSksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMS4wLCAxLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuNSwgMS4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjAsIDEuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC4wLCAwLjUpLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuNSwgMC41KVxuICAgICAgICBdXG4gICAgICAgIFxuICAgIG9uSG90c3BvdENsaWNrOiAoZSwgZGF0YSkgLT4gXG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25DbGljaywgbm8sIGRhdGEuYmluZFZhbHVlKVxuICAgICAgICBcbiAgICBvbkhvdHNwb3RFbnRlcjogKGUsIGRhdGEpIC0+IFxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uRW50ZXIsIHllcywgZGF0YS5iaW5kVmFsdWUpXG4gICAgICAgIFxuICAgIG9uSG90c3BvdExlYXZlOiAoZSwgZGF0YSkgLT4gXG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25MZWF2ZSwgbm8sIGRhdGEuYmluZFZhbHVlKVxuICAgIG9uSG90c3BvdERyYWdTdGFydDogKGUsIGRhdGEpIC0+IFxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uRHJhZywgeWVzLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3REcmFnOiAoZSwgZGF0YSkgLT4gXG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25EcmFnLCB5ZXMsIGRhdGEuYmluZFZhbHVlKVxuICAgIG9uSG90c3BvdERyYWdFbmQ6IChlLCBkYXRhKSAtPiBcbiAgICAgICAgQGV4ZWN1dGVBY3Rpb24oZGF0YS5wYXJhbXMuYWN0aW9ucy5vbkRyYWcsIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3RTdGF0ZUNoYW5nZWQ6IChlLCBwYXJhbXMpIC0+IFxuICAgICAgICBpZiBlLnNlbmRlci5iZWhhdmlvci5zZWxlY3RlZFxuICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb24ocGFyYW1zLmFjdGlvbnMub25TZWxlY3QsIHllcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb24ocGFyYW1zLmFjdGlvbnMub25EZXNlbGVjdCwgbm8pXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIEFEViBtZXNzYWdlIGZpbmlzaGVkIHJlbmRlcmluZyBhbmQgaXMgbm93IHdhaXRpbmdcbiAgICAqIGZvciB0aGUgdXNlci9hdXRvbS1tZXNzYWdlIHRpbWVyIHRvIHByb2NlZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbk1lc3NhZ2VBRFZXYWl0aW5nXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgXG4gICAgb25NZXNzYWdlQURWV2FpdGluZzogKGUpIC0+XG4gICAgICAgIG1lc3NhZ2VPYmplY3QgPSBlLnNlbmRlci5vYmplY3RcbiAgICAgICAgaWYgIUBtZXNzYWdlU2V0dGluZ3MoKS53YWl0QXRFbmRcbiAgICAgICAgICAgIGlmIGUuZGF0YS5wYXJhbXMud2FpdEZvckNvbXBsZXRpb25cbiAgICAgICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLmlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5pc1J1bm5pbmcgPSBub1xuICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vZmYgXCJ3YWl0aW5nXCIsIGUuaGFuZGxlclxuICAgICAgICBcbiAgICAgICAgaWYgQG1lc3NhZ2VTZXR0aW5ncygpLmJhY2tsb2cgYW5kIChtZXNzYWdlT2JqZWN0LnNldHRpbmdzLmF1dG9FcmFzZSBvciBtZXNzYWdlT2JqZWN0LnNldHRpbmdzLnBhcmFncmFwaFNwYWNpbmcgPiAwKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuYmFja2xvZy5wdXNoKHsgY2hhcmFjdGVyOiBtZXNzYWdlT2JqZWN0LmNoYXJhY3RlciwgbWVzc2FnZTogbWVzc2FnZU9iamVjdC5iZWhhdmlvci5tZXNzYWdlLCBjaG9pY2VzOiBbXSB9KSBcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYW4gQURWIG1lc3NhZ2UgZmluaXNoZWQgZmFkZS1vdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbk1lc3NhZ2VBRFZEaXNhcHBlYXJcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBvbk1lc3NhZ2VBRFZEaXNhcHBlYXI6IChtZXNzYWdlT2JqZWN0LCB3YWl0Rm9yQ29tcGxldGlvbikgLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmN1cnJlbnRDaGFyYWN0ZXIgPSB7IG5hbWU6IFwiXCIgfVxuICAgICAgICBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgbWVzc2FnZU9iamVjdC52aXNpYmxlID0gbm9cbiAgICAgICAgXG4gICAgICAgIGlmIG1lc3NhZ2VPYmplY3Qud2FpdEZvckNvbXBsZXRpb24gICAgXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRpbmdGb3IubWVzc2FnZUFEViA9IG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhbiBBRFYgbWVzc2FnZSBmaW5pc2hlZCBjbGVhci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uTWVzc2FnZUFEVkNsZWFyXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIG9uTWVzc2FnZUFEVkNsZWFyOiAobWVzc2FnZU9iamVjdCwgd2FpdEZvckNvbXBsZXRpb24pIC0+XG4gICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAdGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmIEBtZXNzYWdlU2V0dGluZ3MoKS5iYWNrbG9nICAgXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5iYWNrbG9nLnB1c2goeyBjaGFyYWN0ZXI6IG1lc3NhZ2VPYmplY3QuY2hhcmFjdGVyLCBtZXNzYWdlOiBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLm1lc3NhZ2UsIGNob2ljZXM6IFtdIH0pIFxuICAgICAgICBAb25NZXNzYWdlQURWRGlzYXBwZWFyKG1lc3NhZ2VPYmplY3QsIHdhaXRGb3JDb21wbGV0aW9uKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBob3RzcG90L2ltYWdlLW1hcCBzZW5kcyBhIFwianVtcFRvXCIgZXZlbnQgdG8gbGV0IHRoZVxuICAgICogaW50ZXJwcmV0ZXIganVtcCB0byB0aGUgcG9zaXRpb24gZGVmaW5lZCBpbiB0aGUgZXZlbnQgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25KdW1wVG9cbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgb25KdW1wVG86IChlKSAtPlxuICAgICAgICBAanVtcFRvTGFiZWwoZS5sYWJlbClcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGEgaG90c3BvdC9pbWFnZS1tYXAgc2VuZHMgYSBcImNhbGxDb21tb25FdmVudFwiIGV2ZW50IHRvIGxldCB0aGVcbiAgICAqIGludGVycHJldGVyIGNhbGwgdGhlIGNvbW1vbiBldmVudCBkZWZpbmVkIGluIHRoZSBldmVudCBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkp1bXBUb1xuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBvbkNhbGxDb21tb25FdmVudDogKGUpIC0+XG4gICAgICAgIGV2ZW50SWQgPSBlLmNvbW1vbkV2ZW50SWRcbiAgICAgICAgZXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1tldmVudElkXVxuICAgICAgICBpZiAhZXZlbnRcbiAgICAgICAgICAgIGV2ZW50ID0gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHMuZmlyc3QgKHgpID0+IHgubmFtZSA9PSBldmVudElkXG4gICAgICAgICAgICBldmVudElkID0gZXZlbnQuaW5kZXggaWYgZXZlbnRcbiAgICAgICAgQGNhbGxDb21tb25FdmVudChldmVudElkLCBlLnBhcmFtcyB8fCBbXSwgIWUuZmluaXNoKVxuICAgICAgICBAaXNXYWl0aW5nID0gZS53YWl0aW5nID8gbm9cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBBRFYgbWVzc2FnZSBmaW5pc2hlcy4gXG4gICAgKlxuICAgICogQG1ldGhvZCBvbk1lc3NhZ2VBRFZGaW5pc2hcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgb25NZXNzYWdlQURWRmluaXNoOiAoZSkgLT5cbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IGUuc2VuZGVyLm9iamVjdCBcbiAgXG4gICAgICAgIGlmIG5vdCBAbWVzc2FnZVNldHRpbmdzKCkud2FpdEF0RW5kIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLm1lc3NhZ2VzW2xjc20oZS5kYXRhLnBhcmFtcy5tZXNzYWdlKV0gPSB7IHJlYWQ6IHllcyB9XG4gICAgICAgIEdhbWVNYW5hZ2VyLnNhdmVHbG9iYWxEYXRhKClcbiAgICAgICAgaWYgZS5kYXRhLnBhcmFtcy53YWl0Rm9yQ29tcGxldGlvblxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0aW5nRm9yLm1lc3NhZ2VBRFYgPSBudWxsXG4gICAgICAgIHBvaW50ZXIgPSBAcG9pbnRlclxuICAgICAgICBjb21tYW5kcyA9IEBvYmplY3QuY29tbWFuZHNcbiAgICAgICAgXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9mZiBcImZpbmlzaFwiLCBlLmhhbmRsZXJcbiAgICAgICAgI21lc3NhZ2VPYmplY3QuY2hhcmFjdGVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgbWVzc2FnZU9iamVjdC52b2ljZT8gYW5kIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnNraXBWb2ljZU9uQWN0aW9uXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc3RvcFNvdW5kKG1lc3NhZ2VPYmplY3Qudm9pY2UubmFtZSlcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAaXNNZXNzYWdlQ29tbWFuZChwb2ludGVyLCBjb21tYW5kcykgYW5kIEBtZXNzYWdlU2V0dGluZ3MoKS5hdXRvRXJhc2VcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0aW5nRm9yLm1lc3NhZ2VBRFYgPSBlLmRhdGEucGFyYW1zXG4gICAgICAgIFxuICAgICAgICAgICAgZmFkaW5nID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lc3NhZ2VGYWRpbmdcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgdGhlbiAwIGVsc2UgZmFkaW5nLmR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3Qud2FpdEZvckNvbXBsZXRpb24gPSBlLmRhdGEucGFyYW1zLndhaXRGb3JDb21wbGV0aW9uXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgZ3MuQ2FsbEJhY2soXCJvbk1lc3NhZ2VBRFZEaXNhcHBlYXJcIiwgdGhpcywgZS5kYXRhLnBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbikpXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGNvbW1vbiBldmVudCBmaW5pc2hlZCBleGVjdXRpb24uIEluIG1vc3QgY2FzZXMsIHRoZSBpbnRlcnByZXRlclxuICAgICogd2lsbCBzdG9wIHdhaXRpbmcgYW5kIGNvbnRpbnVlIHByb2Nlc3NpbmcgYWZ0ZXIgdGhpcy4gQnV0IGhcbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ29tbW9uRXZlbnRGaW5pc2hcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG9uQ29tbW9uRXZlbnRGaW5pc2g6IChlKSAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuY29tbW9uRXZlbnRDb250YWluZXIucmVtb3ZlT2JqZWN0KGUuc2VuZGVyLm9iamVjdClcbiAgICAgICAgZS5zZW5kZXIub2JqZWN0LmV2ZW50cy5vZmYgXCJmaW5pc2hcIlxuICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBudWxsXG4gICAgICAgIEBpc1dhaXRpbmcgPSBlLmRhdGEud2FpdGluZyA/IG5vXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBzY2VuZSBjYWxsIGZpbmlzaGVkIGV4ZWN1dGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ2FsbFNjZW5lRmluaXNoXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2VuZGVyIC0gVGhlIHNlbmRlciBvZiB0aGlzIGV2ZW50LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBvbkNhbGxTY2VuZUZpbmlzaDogKHNlbmRlcikgLT5cbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEBzdWJJbnRlcnByZXRlciA9IG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgaW50ZXJwcmV0ZXIgaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyMgICBcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGlmIEBpc0lucHV0RGF0YUNvbW1hbmQoTWF0aC5tYXgoQHBvaW50ZXIgLSAxLCAwKSwgQG9iamVjdC5jb21tYW5kcykgXG4gICAgICAgICAgICBwb2ludGVyOiBNYXRoLm1heChAcG9pbnRlciAtIDEgLCAwKSxcbiAgICAgICAgICAgIGNob2ljZTogQGNob2ljZSwgXG4gICAgICAgICAgICBjb25kaXRpb25zOiBAY29uZGl0aW9ucywgXG4gICAgICAgICAgICBsb29wczogQGxvb3BzLFxuICAgICAgICAgICAgbGFiZWxzOiBAbGFiZWxzLFxuICAgICAgICAgICAgaXNXYWl0aW5nOiBubyxcbiAgICAgICAgICAgIGlzUnVubmluZzogQGlzUnVubmluZyxcbiAgICAgICAgICAgIHdhaXRDb3VudGVyOiBAd2FpdENvdW50ZXIsXG4gICAgICAgICAgICB3YWl0aW5nRm9yOiBAd2FpdGluZ0ZvcixcbiAgICAgICAgICAgIGluZGVudDogQGluZGVudCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBAc2V0dGluZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9pbnRlcjogQHBvaW50ZXIsXG4gICAgICAgICAgICBjaG9pY2U6IEBjaG9pY2UsIFxuICAgICAgICAgICAgY29uZGl0aW9uczogQGNvbmRpdGlvbnMsIFxuICAgICAgICAgICAgbG9vcHM6IEBsb29wcyxcbiAgICAgICAgICAgIGxhYmVsczogQGxhYmVscyxcbiAgICAgICAgICAgIGlzV2FpdGluZzogQGlzV2FpdGluZyxcbiAgICAgICAgICAgIGlzUnVubmluZzogQGlzUnVubmluZyxcbiAgICAgICAgICAgIHdhaXRDb3VudGVyOiBAd2FpdENvdW50ZXIsXG4gICAgICAgICAgICB3YWl0aW5nRm9yOiBAd2FpdGluZ0ZvcixcbiAgICAgICAgICAgIGluZGVudDogQGluZGVudCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBAc2V0dGluZ3NcbiAgICBcbiAgICAjIyMqXG4gICAgIyBQcmV2aWV3cyB0aGUgY3VycmVudCBzY2VuZSBhdCB0aGUgc3BlY2lmaWVkIHBvaW50ZXIuIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmcm9tIHRoZVxuICAgICMgVk4gTWFrZXIgU2NlbmUtRWRpdG9yIGlmIGxpdmUtcHJldmlldyBpcyBlbmFibGVkIGFuZCB0aGUgdXNlciBjbGlja2VkIG9uIGEgY29tbWFuZC5cbiAgICAjXG4gICAgIyBAbWV0aG9kIHByZXZpZXdcbiAgICAjIyNcbiAgICBwcmV2aWV3OiAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHJldHVybiBpZiAhJFBBUkFNUy5wcmV2aWV3IG9yICEkUEFSQU1TLnByZXZpZXcuc2NlbmVcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsU291bmRzKClcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsTXVzaWMoKVxuICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxWb2ljZXMoKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNob2ljZXMgPSBbXVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dXBDdXJzb3IoKVxuICAgICAgICAgICAgQHByZXZpZXdEYXRhID0gJFBBUkFNUy5wcmV2aWV3XG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdSZXN0YXJ0XCIpXG4gICAgICAgICAgICBpZiBAcHJldmlld0luZm8udGltZW91dFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChAcHJldmlld0luZm8udGltZW91dClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLnN0b3BwZWRcbiAgICAgICAgICAgICAgICBHcmFwaGljcy5zdG9wcGVkID0gbm9cbiAgICAgICAgICAgICAgICBHcmFwaGljcy5vbkVhY2hGcmFtZShncy5NYWluLmZyYW1lQ2FsbGJhY2spXG4gICAgICAgICAgIFxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKCkgXG4gICAgICAgIFxuICAgICAgICAgICAgc2NlbmUuc2NlbmVEYXRhLnVpZCA9IEBwcmV2aWV3RGF0YS5zY2VuZS51aWQgICAgXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUpXG4gICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZXgpXG4gICAgXG4gICAgIyMjKlxuICAgICMgU2V0cyB1cCB0aGUgaW50ZXJwcmV0ZXIuXG4gICAgI1xuICAgICMgQG1ldGhvZCBzZXR1cFxuICAgICMjIyAgICBcbiAgICBzZXR1cDogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBwcmV2aWV3RGF0YSA9ICRQQVJBTVMucHJldmlld1xuICAgICAgICBpZiBAcHJldmlld0RhdGFcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlRG93blwiLCAoPT5cbiAgICAgICAgICAgICAgICBpZiBAcHJldmlld0luZm8ud2FpdGluZ1xuICAgICAgICAgICAgICAgICAgICBpZiBAcHJldmlld0luZm8udGltZW91dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KEBwcmV2aWV3SW5mby50aW1lb3V0KVxuICAgICAgICAgICAgICAgICAgICBAcHJldmlld0luZm8ud2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgICNAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICAgICAgICAgICAgICBAcHJldmlld0RhdGEgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwicHJldmlld1Jlc3RhcnRcIilcbiAgICAgICAgICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgIFxuICAgICMjIypcbiAgICAjIERpc3Bvc2VzIHRoZSBpbnRlcnByZXRlci5cbiAgICAjXG4gICAgIyBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyMgICAgICAgXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgaWYgQHByZXZpZXdEYXRhXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlRG93blwiLCBAb2JqZWN0KVxuICAgICAgICAgXG4gICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICBcbiAgICAgXG4gICAgaXNJbnN0YW50U2tpcDogLT4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZSA9PSAwICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIGludGVycHJldGVyIGZyb20gYSBkYXRhLWJ1bmRsZVxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZS0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgICAgXG4gICAgcmVzdG9yZTogLT5cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGRlZmF1bHQgZ2FtZSBtZXNzYWdlIGZvciBub3ZlbC1tb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZU9iamVjdE5WTFxuICAgICogQHJldHVybiB7dWkuT2JqZWN0X01lc3NhZ2V9IFRoZSBOVkwgZ2FtZSBtZXNzYWdlIG9iamVjdC5cbiAgICAjIyMgICAgICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3ROVkw6IC0+IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwibnZsR2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGRlZmF1bHQgZ2FtZSBtZXNzYWdlIGZvciBhZHZlbnR1cmUtbW9kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VPYmplY3RBRFZcbiAgICAqIEByZXR1cm4ge3VpLk9iamVjdF9NZXNzYWdlfSBUaGUgQURWIGdhbWUgbWVzc2FnZSBvYmplY3QuXG4gICAgIyMjICAgICAgICAgICBcbiAgICBtZXNzYWdlT2JqZWN0QURWOiAtPiBcbiAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSBpbnRlcnByZXRlclxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAjIyMgICBcbiAgICBzdGFydDogLT5cbiAgICAgICAgQGNvbmRpdGlvbnMgPSBbXVxuICAgICAgICBAbG9vcHMgPSBbXVxuICAgICAgICBAaW5kZW50ID0gMFxuICAgICAgICBAcG9pbnRlciA9IDBcbiAgICAgICAgQGlzUnVubmluZyA9IHllc1xuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU3RvcHMgdGhlIGludGVycHJldGVyXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wXG4gICAgIyMjICAgXG4gICAgc3RvcDogLT5cbiAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgdGhlIGludGVycHJldGVyXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN1bWVcbiAgICAjIyMgIFxuICAgIHJlc3VtZTogLT5cbiAgICAgICAgQGlzUnVubmluZyA9IHllcyAgICAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGludGVycHJldGVyIGFuZCBleGVjdXRlcyBhbGwgY29tbWFuZHMgdW50aWwgdGhlIG5leHQgd2FpdCBpcyBcbiAgICAqIHRyaWdnZXJlZCBieSBhIGNvbW1hbmQuIFNvIGluIHRoZSBjYXNlIG9mIGFuIGVuZGxlc3MtbG9vcCB0aGUgbWV0aG9kIHdpbGwgXG4gICAgKiBuZXZlciByZXR1cm4uXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICAgICBcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGlmIEBzdWJJbnRlcnByZXRlcj9cbiAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci51cGRhdGUoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAY29udGV4dClcbiAgICAgICAgXG4gICAgICAgIGlmIChub3QgQG9iamVjdC5jb21tYW5kcz8gb3IgQHBvaW50ZXIgPj0gQG9iamVjdC5jb21tYW5kcy5sZW5ndGgpIGFuZCBub3QgQGlzV2FpdGluZ1xuICAgICAgICAgICAgaWYgQHJlcGVhdFxuICAgICAgICAgICAgICAgIEBzdGFydCgpXG4gICAgICAgICAgICBlbHNlIGlmIEBpc1J1bm5pbmdcbiAgICAgICAgICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgICAgICAgICBpZiBAb25GaW5pc2g/IHRoZW4gQG9uRmluaXNoKHRoaXMpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBpc1J1bm5pbmcgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAb2JqZWN0LmNvbW1hbmRzLm9wdGltaXplZFxuICAgICAgICAgICAgRGF0YU9wdGltaXplci5vcHRpbWl6ZUV2ZW50Q29tbWFuZHMoQG9iamVjdC5jb21tYW5kcylcblxuICAgICAgICBpZiBAd2FpdENvdW50ZXIgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXItLVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIHJldHVybiAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBpc1dhaXRpbmdGb3JNZXNzYWdlXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBpZiBub3QgQGlzUHJvY2Vzc2luZ01lc3NhZ2VJbk90aGVyQ29udGV4dCgpXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZ0Zvck1lc3NhZ2UgPSBub1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBHYW1lTWFuYWdlci5pbkxpdmVQcmV2aWV3XG4gICAgICAgICAgICB3aGlsZSBub3QgKEBpc1dhaXRpbmcgb3IgQHByZXZpZXdJbmZvLndhaXRpbmcpIGFuZCBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGV4ZWN1dGVDb21tYW5kKEBwb2ludGVyKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcHJldmlld0luZm8uZXhlY3V0ZWRDb21tYW5kcysrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMgPiA1MDBcbiAgICAgICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMgPSAwXG4gICAgICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aGlsZSBub3QgKEBpc1dhaXRpbmcgb3IgQHByZXZpZXdJbmZvLndhaXRpbmcpIGFuZCBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGV4ZWN1dGVDb21tYW5kKEBwb2ludGVyKVxuICAgICBcbiAgICAgICAgICBcbiAgICAgICAgaWYgQHBvaW50ZXIgPj0gQG9iamVjdC5jb21tYW5kcy5sZW5ndGggYW5kIG5vdCBAaXNXYWl0aW5nXG4gICAgICAgICAgICBpZiBAcmVwZWF0XG4gICAgICAgICAgICAgICAgQHN0YXJ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgQGlzUnVubmluZ1xuICAgICAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgICAgIGlmIEBvbkZpbmlzaD8gdGhlbiBAb25GaW5pc2godGhpcylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQXNzaWducyB0aGUgY29ycmVjdCBjb21tYW5kLWZ1bmN0aW9uIHRvIHRoZSBzcGVjaWZpZWQgY29tbWFuZC1vYmplY3QgaWYgXG4gICAgKiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBhc3NpZ25Db21tYW5kXG4gICAgIyMjICAgICAgXG4gICAgYXNzaWduQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgICAgIHN3aXRjaCBjb21tYW5kLmlkXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSWRsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJZGxlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU3RhcnRUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTdGFydFRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGF1c2VUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQYXVzZVRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVzdW1lVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzdW1lVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5TdG9wVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU3RvcFRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuV2FpdENvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kV2FpdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxvb3BDb21tYW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExvb3BcbiAgICAgICAgICAgIHdoZW4gXCJncy5CcmVha0xvb3BDb21tYW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJyZWFrTG9vcFxuICAgICAgICAgICAgd2hlbiBcImdzLkNvbW1lbnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IC0+IDBcbiAgICAgICAgICAgIHdoZW4gXCJncy5FbXB0eUNvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IC0+IDBcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0QWRkXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RBZGRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0UG9wXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RQb3BcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2hpZnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFNoaWZ0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdFJlbW92ZUF0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RSZW1vdmVBdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RJbnNlcnRBdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0SW5zZXJ0QXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0VmFsdWVBdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0VmFsdWVBdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RDbGVhclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0Q2xlYXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2h1ZmZsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0U2h1ZmZsZVxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RTb3J0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RTb3J0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEluZGV4T2ZcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdEluZGV4T2ZcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2V0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RTZXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0Q29weVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0Q29weVxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RMZW5ndGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdExlbmd0aFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RKb2luXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RKb2luXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEZyb21UZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RGcm9tVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlJlc2V0VmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJlc2V0VmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVmFyaWFibGVEb21haW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVmFyaWFibGVEb21haW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VOdW1iZXJWYXJpYWJsZXNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlTnVtYmVyVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlRGVjaW1hbFZhcmlhYmxlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlQm9vbGVhblZhcmlhYmxlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VCb29sZWFuVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlU3RyaW5nVmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVN0cmluZ1ZhcmlhYmxlc1xuICAgICAgICAgICAgd2hlbiBcImdzLkNoZWNrU3dpdGNoXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoZWNrU3dpdGNoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hlY2tOdW1iZXJWYXJpYWJsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGVja051bWJlclZhcmlhYmxlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hlY2tUZXh0VmFyaWFibGVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hlY2tUZXh0VmFyaWFibGVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Db25kaXRpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ29uZGl0aW9uXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29uZGl0aW9uRWxzZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDb25kaXRpb25FbHNlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29uZGl0aW9uRWxzZUlmXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENvbmRpdGlvbkVsc2VJZlxuICAgICAgICAgICAgd2hlbiBcImdzLkxhYmVsXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExhYmVsXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSnVtcFRvTGFiZWxcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kSnVtcFRvTGFiZWxcbiAgICAgICAgICAgIHdoZW4gXCJncy5TZXRNZXNzYWdlQXJlYVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dNZXNzYWdlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1BhcnRpYWxNZXNzYWdlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dQYXJ0aWFsTWVzc2FnZVxuICAgICAgICAgICAgd2hlbiBcImdzLk1lc3NhZ2VGYWRpbmdcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWVzc2FnZUZhZGluZ1xuICAgICAgICAgICAgd2hlbiBcImdzLk1lc3NhZ2VTZXR0aW5nc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlU2V0dGluZ3NcbiAgICAgICAgICAgIHdoZW4gXCJncy5DcmVhdGVNZXNzYWdlQXJlYVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDcmVhdGVNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlTWVzc2FnZUFyZWFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLlNldFRhcmdldE1lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2V0VGFyZ2V0TWVzc2FnZVxuICAgICAgICAgICAgd2hlbiBcInZuLk1lc3NhZ2VCb3hEZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlQm94RGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5NZXNzYWdlQm94VmlzaWJpbGl0eVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlQm94VmlzaWJpbGl0eVxuICAgICAgICAgICAgd2hlbiBcInZuLk1lc3NhZ2VWaXNpYmlsaXR5XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1lc3NhZ2VWaXNpYmlsaXR5XG4gICAgICAgICAgICB3aGVuIFwidm4uQmFja2xvZ1Zpc2liaWxpdHlcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmFja2xvZ1Zpc2liaWxpdHlcbiAgICAgICAgICAgIHdoZW4gXCJncy5DbGVhck1lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2xlYXJNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlV2VhdGhlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VXZWF0aGVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRnJlZXplU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEZyZWV6ZVNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlNjcmVlblRyYW5zaXRpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2NyZWVuVHJhbnNpdGlvblxuICAgICAgICAgICAgd2hlbiBcImdzLlNoYWtlU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNoYWtlU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGludFNjcmVlblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50U2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRmxhc2hTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hTY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21TY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGFuU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBhblNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlNjcmVlbkVmZmVjdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JlZW5FZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaG93VmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd1ZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVWaWRlb1BhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVZpZGVvUGF0aFxuICAgICAgICAgICAgd2hlbiBcImdzLlRpbnRWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50VmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5GbGFzaFZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEZsYXNoVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5Dcm9wVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ3JvcFZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUm90YXRlVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbVZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQmxlbmRWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZFZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWFza1ZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1hc2tWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlZpZGVvRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFZpZGVvRWZmZWN0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuVmlkZW9Nb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFZpZGVvTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcImdzLlZpZGVvRGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVmlkZW9EZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dJbWFnZU1hcFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93SW1hZ2VNYXBcbiAgICAgICAgICAgIHdoZW4gXCJncy5FcmFzZUltYWdlTWFwXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEVyYXNlSW1hZ2VNYXBcbiAgICAgICAgICAgIHdoZW4gXCJncy5BZGRIb3RzcG90XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEFkZEhvdHNwb3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5FcmFzZUhvdHNwb3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VIb3RzcG90XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlSG90c3BvdFN0YXRlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZUhvdHNwb3RTdGF0ZVxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlUGljdHVyZVBhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVBpY3R1cmVQYXRoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGludFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGludFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5GbGFzaFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ3JvcFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ3JvcFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJvdGF0ZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLkJsZW5kUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaGFrZVBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hha2VQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWFza1BpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWFza1BpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5QaWN0dXJlRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBpY3R1cmVFZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5QaWN0dXJlTW90aW9uQmx1clwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQaWN0dXJlTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcImdzLlBpY3R1cmVEZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQaWN0dXJlRGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5UGljdHVyZUFuaW1hdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQbGF5UGljdHVyZUFuaW1hdGlvblxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5JbnB1dE51bWJlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJbnB1dE51bWJlclxuICAgICAgICAgICAgd2hlbiBcInZuLkNob2ljZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93Q2hvaWNlXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hvaWNlVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hvaWNlVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TaG93Q2hvaWNlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93Q2hvaWNlc1xuICAgICAgICAgICAgd2hlbiBcInZuLlVubG9ja0NHXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFVubG9ja0NHXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJESm9pblNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyREpvaW5TY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLkwyREV4aXRTY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRFeGl0U2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRNb3Rpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJETW90aW9uXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJETW90aW9uR3JvdXBcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJETW90aW9uR3JvdXBcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRFeHByZXNzaW9uXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyREV4cHJlc3Npb25cbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRNb3ZlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRE1vdmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRQYXJhbWV0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJEUGFyYW1ldGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJEU2V0dGluZ3NcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJEU2V0dGluZ3NcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkREZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkREZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckpvaW5TY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJKb2luU2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJFeGl0U2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyRXhpdFNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyQ2hhbmdlRXhwcmVzc2lvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJDaGFuZ2VFeHByZXNzaW9uXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyU2V0UGFyYW1ldGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlclNldFBhcmFtZXRlclxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckdldFBhcmFtZXRlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJHZXRQYXJhbWV0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJEZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJEZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckVmZmVjdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJFZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5ab29tQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21DaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5Sb3RhdGVDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQmxlbmRDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmxlbmRDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TaGFrZUNoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaGFrZUNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLk1hc2tDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWFza0NoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLk1vdmVDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZUNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLk1vdmVDaGFyYWN0ZXJQYXRoXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVDaGFyYWN0ZXJQYXRoXG4gICAgICAgICAgICB3aGVuIFwidm4uRmxhc2hDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5UaW50Q2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFRpbnRDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJNb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3Rlck1vdGlvbkJsdXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZUJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TaGFrZUJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hha2VCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uU2Nyb2xsQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uU2Nyb2xsQmFja2dyb3VuZFRvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNjcm9sbEJhY2tncm91bmRUb1xuICAgICAgICAgICAgd2hlbiBcInZuLlNjcm9sbEJhY2tncm91bmRQYXRoXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNjcm9sbEJhY2tncm91bmRQYXRoXG4gICAgICAgICAgICB3aGVuIFwidm4uWm9vbUJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbUJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5Sb3RhdGVCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJvdGF0ZUJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5UaW50QmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50QmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLkJsZW5kQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZEJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5NYXNrQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNYXNrQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLkJhY2tncm91bmRNb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJhY2tncm91bmRNb3Rpb25CbHVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQmFja2dyb3VuZEVmZmVjdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCYWNrZ3JvdW5kRWZmZWN0XG4gICAgICAgICAgICB3aGVuIFwidm4uQmFja2dyb3VuZERlZmF1bHRzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJhY2tncm91bmREZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcInZuLkNoYW5nZVNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uUmV0dXJuVG9QcmV2aW91c1NjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJldHVyblRvUHJldmlvdXNTY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLkNhbGxTY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDYWxsU2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5Td2l0Y2hUb0xheW91dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTd2l0Y2hUb0xheW91dFxuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVRyYW5zaXRpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVHJhbnNpdGlvblxuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVdpbmRvd1NraW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlV2luZG93U2tpblxuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVNjcmVlblRyYW5zaXRpb25zXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVNjcmVlblRyYW5zaXRpb25zXG4gICAgICAgICAgICB3aGVuIFwidm4uVUlBY2Nlc3NcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVUlBY2Nlc3NcbiAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5VmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGxheVZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGxheU11c2ljXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBsYXlNdXNpY1xuICAgICAgICAgICAgd2hlbiBcImdzLlN0b3BNdXNpY1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTdG9wTXVzaWNcbiAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5U291bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGxheVNvdW5kXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU3RvcFNvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFN0b3BTb3VuZFxuICAgICAgICAgICAgd2hlbiBcImdzLlBhdXNlTXVzaWNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUGF1c2VNdXNpY1xuICAgICAgICAgICAgd2hlbiBcImdzLlJlc3VtZU11c2ljXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJlc3VtZU11c2ljXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQXVkaW9EZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRBdWRpb0RlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRW5kQ29tbW9uRXZlbnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRW5kQ29tbW9uRXZlbnRcbiAgICAgICAgICAgIHdoZW4gXCJncy5SZXN1bWVDb21tb25FdmVudFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXN1bWVDb21tb25FdmVudFxuICAgICAgICAgICAgd2hlbiBcImdzLkNhbGxDb21tb25FdmVudFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDYWxsQ29tbW9uRXZlbnRcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VUaW1lclxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVmcmVzaFRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVmcmVzaFRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5UZXh0TW90aW9uQmx1clwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUZXh0TW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVRleHRQYXRoXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVUZXh0UGF0aFxuICAgICAgICAgICAgd2hlbiBcImdzLlJvdGF0ZVRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlpvb21UZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21UZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQmxlbmRUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJsZW5kVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLkNvbG9yVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDb2xvclRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5FcmFzZVRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VUZXh0IFxuICAgICAgICAgICAgd2hlbiBcImdzLlRleHRFZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGV4dEVmZmVjdCBcbiAgICAgICAgICAgIHdoZW4gXCJncy5UZXh0RGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGV4dERlZmF1bHRzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVGV4dFNldHRpbmdzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVRleHRTZXR0aW5nc1xuICAgICAgICAgICAgd2hlbiBcImdzLklucHV0VGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJbnB1dFRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5JbnB1dE5hbWVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kSW5wdXROYW1lXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2F2ZVBlcnNpc3RlbnREYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNhdmVQZXJzaXN0ZW50RGF0YVxuICAgICAgICAgICAgd2hlbiBcImdzLlNhdmVTZXR0aW5nc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTYXZlU2V0dGluZ3NcbiAgICAgICAgICAgIHdoZW4gXCJncy5QcmVwYXJlU2F2ZUdhbWVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUHJlcGFyZVNhdmVHYW1lXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2F2ZUdhbWVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2F2ZUdhbWVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Mb2FkR2FtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMb2FkR2FtZVxuICAgICAgICAgICAgd2hlbiBcImdzLkdldElucHV0RGF0YVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRHZXRJbnB1dERhdGFcbiAgICAgICAgICAgIHdoZW4gXCJncy5XYWl0Rm9ySW5wdXRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kV2FpdEZvcklucHV0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlT2JqZWN0RG9tYWluXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZU9iamVjdERvbWFpblxuICAgICAgICAgICAgd2hlbiBcInZuLkdldEdhbWVEYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEdldEdhbWVEYXRhXG4gICAgICAgICAgICB3aGVuIFwidm4uU2V0R2FtZURhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2V0R2FtZURhdGFcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5HZXRPYmplY3REYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEdldE9iamVjdERhdGFcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TZXRPYmplY3REYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNldE9iamVjdERhdGFcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VTb3VuZHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlU291bmRzXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhbmdlQ29sb3JzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZUNvbG9yc1xuICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVNjcmVlbkN1cnNvclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VTY3JlZW5DdXJzb3JcbiAgICAgICAgICAgIHdoZW4gXCJncy5SZXNldEdsb2JhbERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzZXRHbG9iYWxEYXRhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2NyaXB0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNjcmlwdFxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBjb21tYW5kIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggYW5kIGluY3JlYXNlcyB0aGUgY29tbWFuZC1wb2ludGVyLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUNvbW1hbmRcbiAgICAjIyMgICAgICAgXG4gICAgZXhlY3V0ZUNvbW1hbmQ6IChpbmRleCkgLT5cbiAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW2luZGV4XVxuXG4gICAgICAgIGlmIEBwcmV2aWV3RGF0YVxuICAgICAgICAgICAgaWYgQHByZXZpZXdEYXRhLnVpZCBhbmQgQHByZXZpZXdEYXRhLnVpZCAhPSBAY29tbWFuZC51aWRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IHllc1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZSA9IDBcbiAgICAgICAgICAgIGVsc2UgaWYgQHBvaW50ZXIgPCBAcHJldmlld0RhdGEucG9pbnRlclxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0geWVzXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID0gMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvbkRpc2FibGVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID0gMFxuICAgICAgICAgICAgICAgIEBwcmV2aWV3SW5mby53YWl0aW5nID0geWVzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJwcmV2aWV3V2FpdGluZ1wiKVxuICAgICAgICAgICAgICAgIGlmIEBwcmV2aWV3RGF0YS5zZXR0aW5ncy5hbmltYXRpb25EaXNhYmxlZCBvciBAcHJldmlld0RhdGEuc2V0dGluZ3MuYW5pbWF0aW9uVGltZSA+IDBcbiAgICAgICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLnRpbWVvdXQgPSBzZXRUaW1lb3V0ICgtPiBHcmFwaGljcy5zdG9wcGVkID0geWVzKSwgKEBwcmV2aWV3RGF0YS5zZXR0aW5ncy5hbmltYXRpb25UaW1lKSoxMDAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBjb21tYW5kLmV4ZWN1dGU/XG4gICAgICAgICAgICBAY29tbWFuZC5pbnRlcnByZXRlciA9IHRoaXNcbiAgICAgICAgICAgIEBjb21tYW5kLmV4ZWN1dGUoKSBpZiBAY29tbWFuZC5pbmRlbnQgPT0gQGluZGVudFxuICAgICAgICAgICAgQHBvaW50ZXIrK1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAY29tbWFuZCA9IEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdXG4gICAgICAgICAgICBpZiBAY29tbWFuZD9cbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBAY29tbWFuZC5pbmRlbnRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBAaW5kZW50XG4gICAgICAgICAgICAgICAgd2hpbGUgaW5kZW50ID4gMCBhbmQgKG5vdCBAbG9vcHNbaW5kZW50XT8pXG4gICAgICAgICAgICAgICAgICAgIGluZGVudC0tXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgaW5kZW50IDwgQGluZGVudFxuICAgICAgICAgICAgICAgIEBpbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgICAgICAgICBpZiBAbG9vcHNbQGluZGVudF0/XG4gICAgICAgICAgICAgICAgICAgIEBwb2ludGVyID0gQGxvb3BzW0BpbmRlbnRdXG4gICAgICAgICAgICAgICAgICAgIEBjb21tYW5kID0gQG9iamVjdC5jb21tYW5kc1tAcG9pbnRlcl1cbiAgICAgICAgICAgICAgICAgICAgQGNvbW1hbmQuaW50ZXJwcmV0ZXIgPSB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBhc3NpZ25Db21tYW5kKEBjb21tYW5kKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGNvbW1hbmQuZXhlY3V0ZT9cbiAgICAgICAgICAgICAgICBAY29tbWFuZC5pbnRlcnByZXRlciA9IHRoaXNcbiAgICAgICAgICAgICAgICBAY29tbWFuZC5leGVjdXRlKCkgaWYgQGNvbW1hbmQuaW5kZW50ID09IEBpbmRlbnRcbiAgICAgICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXVxuICAgICAgICAgICAgICAgIGlmIEBjb21tYW5kP1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBAY29tbWFuZC5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGluZGVudCA9IEBpbmRlbnRcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgaW5kZW50ID4gMCBhbmQgKG5vdCBAbG9vcHNbaW5kZW50XT8pXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQtLVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgaW5kZW50IDwgQGluZGVudFxuICAgICAgICAgICAgICAgICAgICBAaW5kZW50ID0gaW5kZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIEBsb29wc1tAaW5kZW50XT9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBwb2ludGVyID0gQGxvb3BzW0BpbmRlbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICBAY29tbWFuZCA9IEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdXG4gICAgICAgICAgICAgICAgICAgICAgICBAY29tbWFuZC5pbnRlcnByZXRlciA9IHRoaXNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIGNvbW1hbmRzIHVudGlsIGEgY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgaW5kZW50LWxldmVsIGlzIFxuICAgICogZm91bmQuIFNvIGZvciBleGFtcGxlOiBUbyBqdW1wIGZyb20gYSBDb25kaXRpb24tQ29tbWFuZCB0byB0aGUgbmV4dFxuICAgICogRWxzZS1Db21tYW5kIGp1c3QgcGFzcyB0aGUgaW5kZW50LWxldmVsIG9mIHRoZSBDb25kaXRpb24vRWxzZSBjb21tYW5kLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGVudCAtIFRoZSBpbmRlbnQtbGV2ZWwuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJhY2t3YXJkIC0gSWYgdHJ1ZSB0aGUgc2tpcCBydW5zIGJhY2t3YXJkLlxuICAgICMjIyAgIFxuICAgIHNraXA6IChpbmRlbnQsIGJhY2t3YXJkKSAtPlxuICAgICAgICBpZiBiYWNrd2FyZFxuICAgICAgICAgICAgQHBvaW50ZXItLVxuICAgICAgICAgICAgd2hpbGUgQHBvaW50ZXIgPiAwIGFuZCBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXS5pbmRlbnQgIT0gaW5kZW50XG4gICAgICAgICAgICAgICAgQHBvaW50ZXItLVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICB3aGlsZSBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXS5pbmRlbnQgIT0gaW5kZW50XG4gICAgICAgICAgICAgICAgQHBvaW50ZXIrK1xuICAgIFxuICAgICMjIypcbiAgICAqIEhhbHRzIHRoZSBpbnRlcnByZXRlciBmb3IgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgdGltZS4gQW4gb3B0aW9uYWxseVxuICAgICogY2FsbGJhY2sgZnVuY3Rpb24gY2FuIGJlIHBhc3NlZCB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgdGltZSBpcyB1cC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHdhaXRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gVGhlIHRpbWUgdG8gd2FpdFxuICAgICogQHBhcmFtIHtncy5DYWxsYmFja30gY2FsbGJhY2sgLSBDYWxsZWQgaWYgdGhlIHdhaXQgdGltZSBpcyB1cC5cbiAgICAjIyMgIFxuICAgIHdhaXQ6ICh0aW1lLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICBAd2FpdENvdW50ZXIgPSB0aW1lXG4gICAgICAgIEB3YWl0Q2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgdGhlIGNvbW1hbmQgYXQgdGhlIHNwZWNpZmllZCBwb2ludGVyLWluZGV4IGlzIGEgZ2FtZSBtZXNzYWdlXG4gICAgKiByZWxhdGVkIGNvbW1hbmQuXG4gICAgKlxuICAgICogQG1ldGhvZCBpc01lc3NhZ2VDb21tYW5kXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRlciAtIFRoZSBwb2ludGVyL2luZGV4LlxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gY29tbWFuZHMgLSBUaGUgbGlzdCBvZiBjb21tYW5kcyB0byBjaGVjay5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGlmIGl0cyBhIGdhbWUgbWVzc2FnZSByZWxhdGVkIGNvbW1hbmQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj4uXG4gICAgIyMjIFxuICAgIGlzTWVzc2FnZUNvbW1hbmQ6IChwb2ludGVyLCBjb21tYW5kcykgLT5cbiAgICAgICAgcmVzdWx0ID0geWVzXG4gICAgICAgIGlmIHBvaW50ZXIgPj0gY29tbWFuZHMubGVuZ3RoIG9yIChjb21tYW5kc1twb2ludGVyXS5pZCAhPSBcImdzLklucHV0TnVtYmVyXCIgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCAhPSBcInZuLkNob2ljZVwiIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZHNbcG9pbnRlcl0uaWQgIT0gXCJncy5JbnB1dFRleHRcIiBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkICE9IFwiZ3MuSW5wdXROYW1lXCIpXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBpZiB0aGUgY29tbWFuZCBhdCB0aGUgc3BlY2lmaWVkIHBvaW50ZXItaW5kZXggYXNrcyBmb3IgdXNlci1pbnB1dCBsaWtlXG4gICAgKiB0aGUgSW5wdXQgTnVtYmVyIG9yIElucHV0IFRleHQgY29tbWFuZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGlzSW5wdXREYXRhQ29tbWFuZFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvaW50ZXIgLSBUaGUgcG9pbnRlci9pbmRleC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNvbW1hbmRzIC0gVGhlIGxpc3Qgb2YgY29tbWFuZHMgdG8gY2hlY2suXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSA8Yj50cnVlPC9iPiBpZiBpdHMgYW4gaW5wdXQtZGF0YSBjb21tYW5kLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgIyMjICAgICBcbiAgICBpc0lucHV0RGF0YUNvbW1hbmQ6IChwb2ludGVyLCBjb21tYW5kcykgLT5cbiAgICAgICAgcG9pbnRlciA8IGNvbW1hbmRzLmxlbmd0aCBhbmQgKFxuICAgICAgICAgICAgY29tbWFuZHNbcG9pbnRlcl0uaWQgPT0gXCJncy5JbnB1dE51bWJlclwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcImdzLklucHV0VGV4dFwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcInZuLkNob2ljZVwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcInZuLlNob3dDaG9pY2VzXCJcbiAgICAgICAgKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgYSBnYW1lIG1lc3NhZ2UgaXMgY3VycmVudGx5IHJ1bm5pbmcgYnkgYW5vdGhlciBpbnRlcnByZXRlciBsaWtlIGFcbiAgICAqIGNvbW1vbi1ldmVudCBpbnRlcnByZXRlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGlzUHJvY2Vzc2luZ01lc3NhZ2VJbk90aGVyQ29udGV4dFxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gPGI+dHJ1ZTwvYj4gYSBnYW1lIG1lc3NhZ2UgaXMgcnVubmluZyBpbiBhbm90aGVyIGNvbnRleHQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyMgICAgIFxuICAgIGlzUHJvY2Vzc2luZ01lc3NhZ2VJbk90aGVyQ29udGV4dDogLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgZ20gPSBHYW1lTWFuYWdlclxuICAgICAgICBzID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIFxuICAgICAgICByZXN1bHQgPVxuICAgICAgICAgICAgICAgICAocy5pbnB1dE51bWJlcldpbmRvdz8gYW5kIHMuaW5wdXROdW1iZXJXaW5kb3cudmlzaWJsZSBhbmQgcy5pbnB1dE51bWJlcldpbmRvdy5leGVjdXRpb25Db250ZXh0ICE9IEBjb250ZXh0KSBvclxuICAgICAgICAgICAgICAgICAocy5pbnB1dFRleHRXaW5kb3c/IGFuZCBzLmlucHV0VGV4dFdpbmRvdy5hY3RpdmUgYW5kIHMuaW5wdXRUZXh0V2luZG93LmV4ZWN1dGlvbkNvbnRleHQgIT0gQGNvbnRleHQpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgIyMjKlxuICAgICogSWYgYSBnYW1lIG1lc3NhZ2UgaXMgY3VycmVudGx5IHJ1bm5pbmcgYnkgYW4gb3RoZXIgaW50ZXJwcmV0ZXIgbGlrZSBhIGNvbW1vbi1ldmVudFxuICAgICogaW50ZXJwcmV0ZXIsIHRoaXMgbWV0aG9kIHRyaWdnZXIgYSB3YWl0IHVudGlsIHRoZSBvdGhlciBpbnRlcnByZXRlciBpcyBmaW5pc2hlZFxuICAgICogd2l0aCB0aGUgZ2FtZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgd2FpdEZvck1lc3NhZ2VcbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGEgZ2FtZSBtZXNzYWdlIGlzIHJ1bm5pbmcgaW4gYW5vdGhlciBjb250ZXh0LiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgIyMjICAgICAgIFxuICAgIHdhaXRGb3JNZXNzYWdlOiAtPlxuICAgICAgICBAaXNXYWl0aW5nRm9yTWVzc2FnZSA9IHllc1xuICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgIEBwb2ludGVyLS1cbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSB0aGUgbnVtYmVyIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBudW1iZXJWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIGRvbWFpbikgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCBkb21haW4pXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIG51bWJlciB2YXJpYWJsZS4gSWYgYSBjb25zdGFudCBudW1iZXIgdmFsdWUgaXMgc3BlY2lmaWVkLCB0aGlzIG1ldGhvZFxuICAgICogZG9lcyBub3RoaW5nIGFuIGp1c3QgcmV0dXJucyB0aGF0IGNvbnN0YW50IHZhbHVlLiBUaGF0J3MgdG8gbWFrZSBpdCBtb3JlIGNvbWZvcnRhYmxlIHRvIGp1c3QgcGFzcyBhIHZhbHVlIHdoaWNoXG4gICAgKiBjYW4gYmUgY2FsY3VsYXRlZCBieSB2YXJpYWJsZSBidXQgYWxzbyBiZSBqdXN0IGEgY29uc3RhbnQgdmFsdWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge251bWJlcnxPYmplY3R9IG9iamVjdCAtIEEgbnVtYmVyIHZhcmlhYmxlIG9yIGNvbnN0YW50IG51bWJlciB2YWx1ZS5cbiAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgICAgIFxuICAgIG51bWJlclZhbHVlT2Y6IChvYmplY3QpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZihvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogSXQgZG9lcyB0aGUgc2FtZSBsaWtlIDxiPm51bWJlclZhbHVlT2Y8L2I+IHdpdGggb25lIGRpZmZlcmVuY2U6IElmIHRoZSBzcGVjaWZpZWQgb2JqZWN0XG4gICAgKiBpcyBhIHZhcmlhYmxlLCBpdCdzIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXMgYSBkdXJhdGlvbi12YWx1ZSBpbiBtaWxsaXNlY29uZHMgYW5kIGF1dG9tYXRpY2FsbHkgY29udmVydGVkXG4gICAgKiBpbnRvIGZyYW1lcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGR1cmF0aW9uVmFsdWVPZlxuICAgICogQHBhcmFtIHtudW1iZXJ8T2JqZWN0fSBvYmplY3QgLSBBIG51bWJlciB2YXJpYWJsZSBvciBjb25zdGFudCBudW1iZXIgdmFsdWUuXG4gICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBkdXJhdGlvblZhbHVlT2Y6IChvYmplY3QpIC0+IFxuICAgICAgICBpZiBvYmplY3QgYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIE1hdGgucm91bmQoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKG9iamVjdCkgLyAxMDAwICogR3JhcGhpY3MuZnJhbWVSYXRlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBNYXRoLnJvdW5kKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZihvYmplY3QpKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIGEgcG9zaXRpb24gKHt4LCB5fSkgZm9yIHRoZSBzcGVjaWZpZWQgcHJlZGVmaW5lZCBvYmplY3QgcG9zaXRpb24gY29uZmlndXJlZCBpbiBcbiAgICAqIERhdGFiYXNlIC0gU3lzdGVtLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb24gLSBUaGUgaW5kZXgvSUQgb2YgdGhlIHByZWRlZmluZWQgb2JqZWN0IHBvc2l0aW9uIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzZXQgdGhlIHBvc2l0aW9uIGZvci5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgcGFyYW1zIG9iamVjdCBvZiB0aGUgc2NlbmUgY29tbWFuZC5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHBvc2l0aW9uIHt4LCB5fS5cbiAgICAjIyNcbiAgICBwcmVkZWZpbmVkT2JqZWN0UG9zaXRpb246IChwb3NpdGlvbiwgb2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIG9iamVjdFBvc2l0aW9uID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0ub2JqZWN0UG9zaXRpb25zW3Bvc2l0aW9uXVxuICAgICAgICBpZiAhb2JqZWN0UG9zaXRpb24gdGhlbiByZXR1cm4geyB4OiAwLCB5OiAwIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBvYmplY3RQb3NpdGlvbi5mdW5jLmNhbGwobnVsbCwgb2JqZWN0LCBwYXJhbXMpIHx8IHsgeDogMCwgeTogMCB9XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbnVtYmVyIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXROdW1iZXJWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBUaGUgbnVtYmVyIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0TnVtYmVyVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXROdW1iZXJWYWx1ZVRvXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVGhlIG51bWJlciB2YWx1ZSB0byBzZXQgdGhlIHZhcmlhYmxlIHRvLlxuICAgICMjI1xuICAgIHNldE51bWJlclZhbHVlVG86ICh2YXJpYWJsZSwgdmFsdWUpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0TnVtYmVyVmFsdWVUbyh2YXJpYWJsZSwgdmFsdWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBsaXN0IHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0TGlzdE9iamVjdFRvXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIC0gVGhlIGxpc3Qgb2JqZWN0IHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0TGlzdE9iamVjdFRvOiAodmFyaWFibGUsIHZhbHVlKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldExpc3RPYmplY3RUbyh2YXJpYWJsZSwgdmFsdWUpXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGJvb2xlYW4vc3dpdGNoIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0Qm9vbGVhblZhbHVlVG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIGJvb2xlYW4gdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRCb29sZWFuVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRCb29sZWFuVmFsdWVUbyh2YXJpYWJsZSwgdmFsdWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldEJvb2xlYW5WYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIGJvb2xlYW4gdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRCb29sZWFuVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKVxuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3RyaW5nL3RleHQgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRTdHJpbmdWYWx1ZVRvXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHN0cmluZy90ZXh0IHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0U3RyaW5nVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRTdHJpbmdWYWx1ZVRvKHZhcmlhYmxlLCB2YWx1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgc3RyaW5nIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRTdHJpbmdWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSBzY29wZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSB2YXJpYWJsZSdzIGluZGV4LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyMgICAgIFxuICAgIHNldFN0cmluZ1ZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgdmFsdWUsIGRvbWFpbikgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRTdHJpbmdWYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIHN0cmluZyB2YXJpYWJsZS4gSWYgYSBjb25zdGFudCBzdHJpbmcgdmFsdWUgaXMgc3BlY2lmaWVkLCB0aGlzIG1ldGhvZFxuICAgICogZG9lcyBub3RoaW5nIGFuIGp1c3QgcmV0dXJucyB0aGF0IGNvbnN0YW50IHZhbHVlLiBUaGF0J3MgdG8gbWFrZSBpdCBtb3JlIGNvbWZvcnRhYmxlIHRvIGp1c3QgcGFzcyBhIHZhbHVlIHdoaWNoXG4gICAgKiBjYW4gYmUgY2FsY3VsYXRlZCBieSB2YXJpYWJsZSBidXQgYWxzbyBiZSBqdXN0IGEgY29uc3RhbnQgdmFsdWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdHJpbmdWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IG9iamVjdCAtIEEgc3RyaW5nIHZhcmlhYmxlIG9yIGNvbnN0YW50IHN0cmluZyB2YWx1ZS5cbiAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgXG4gICAgc3RyaW5nVmFsdWVPZjogKG9iamVjdCkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zdHJpbmdWYWx1ZU9mKG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgc3RyaW5nIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzdHJpbmdWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjICAgICBcbiAgICBzdHJpbmdWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIGRvbWFpbikgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zdHJpbmdWYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCBkb21haW4pXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIGJvb2xlYW4gdmFyaWFibGUuIElmIGEgY29uc3RhbnQgYm9vbGVhbiB2YWx1ZSBpcyBzcGVjaWZpZWQsIHRoaXMgbWV0aG9kXG4gICAgKiBkb2VzIG5vdGhpbmcgYW4ganVzdCByZXR1cm5zIHRoYXQgY29uc3RhbnQgdmFsdWUuIFRoYXQncyB0byBtYWtlIGl0IG1vcmUgY29tZm9ydGFibGUgdG8ganVzdCBwYXNzIGEgdmFsdWUgd2hpY2hcbiAgICAqIGNhbiBiZSBjYWxjdWxhdGVkIGJ5IHZhcmlhYmxlIGJ1dCBhbHNvIGJlIGp1c3QgYSBjb25zdGFudCB2YWx1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZU9mXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58T2JqZWN0fSBvYmplY3QgLSBBIGJvb2xlYW4gdmFyaWFibGUgb3IgY29uc3RhbnQgYm9vbGVhbiB2YWx1ZS5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjIFxuICAgIGJvb2xlYW5WYWx1ZU9mOiAob2JqZWN0KSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZU9mKG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgYm9vbGVhbiB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2QgYm9vbGVhblZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlJ3Mgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyMgICAgIFxuICAgIGJvb2xlYW5WYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIGRvbWFpbikgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuVmFsdWVBdEluZGV4KHNjb3BlLCBpbmRleCwgZG9tYWluKVxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgKHBvc3NpYmxlKSBsaXN0IHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgbGlzdE9iamVjdE9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gQSBsaXN0IHZhcmlhYmxlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdmFsdWUgb2YgdGhlIGxpc3QgdmFyaWFibGUuXG4gICAgIyMjIFxuICAgIGxpc3RPYmplY3RPZjogKG9iamVjdCkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5saXN0T2JqZWN0T2Yob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIENvbXBhcmVzIHR3byBvYmplY3QgdXNpbmcgdGhlIHNwZWNpZmllZCBvcGVyYXRpb24gYW5kIHJldHVybnMgdGhlIHJlc3VsdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNvbXBhcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhIC0gT2JqZWN0IEEuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYiAtIE9iamVjdCBCLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG9wZXJhdGlvbiAtIFRoZSBjb21wYXJlLW9wZXJhdGlvbiB0byBjb21wYXJlIE9iamVjdCBBIHdpdGggT2JqZWN0IEIuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+MCA9IEVxdWFsIFRvPC9saT5cbiAgICAqIDxsaT4xID0gTm90IEVxdWFsIFRvPC9saT5cbiAgICAqIDxsaT4yID0gR3JlYXRlciBUaGFuPC9saT5cbiAgICAqIDxsaT4zID0gR3JlYXRlciBvciBFcXVhbCBUbzwvbGk+XG4gICAgKiA8bGk+NCA9IExlc3MgVGhhbjwvbGk+XG4gICAgKiA8bGk+NSA9IExlc3Mgb3IgRXF1YWwgVG88L2xpPlxuICAgICogPC91bD5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSBjb21wYXJpc29uIHJlc3VsdC5cbiAgICAjIyMgXG4gICAgY29tcGFyZTogKGEsIGIsIG9wZXJhdGlvbikgLT5cbiAgICAgICAgc3dpdGNoIG9wZXJhdGlvblxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcmV0dXJuIGBhID09IGJgXG4gICAgICAgICAgICB3aGVuIDEgdGhlbiByZXR1cm4gYGEgIT0gYmBcbiAgICAgICAgICAgIHdoZW4gMiB0aGVuIHJldHVybiBhID4gYlxuICAgICAgICAgICAgd2hlbiAzIHRoZW4gcmV0dXJuIGEgPj0gYlxuICAgICAgICAgICAgd2hlbiA0IHRoZW4gcmV0dXJuIGEgPCBiXG4gICAgICAgICAgICB3aGVuIDUgdGhlbiByZXR1cm4gYSA8PSBiXG4gICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgbnVtYmVyIHZhcmlhYmxlcyBhbmQgYWxsb3dzIGRlY2ltYWwgdmFsdWVzIHN1Y2ggYXMgMC41IHRvby5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNoYW5nZURlY2ltYWxWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBJbnB1dCBwYXJhbXMgZnJvbSB0aGUgY29tbWFuZFxuICAgICogQHBhcmFtIHtPYmplY3R9IHJvdW5kTWV0aG9kIC0gVGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uIHdpbGwgYmUgcm91bmRlZCB1c2luZyB0aGUgc3BlY2lmaWVkIG1ldGhvZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gTm9uZS4gVGhlIHJlc3VsdCB3aWxsIG5vdCBiZSByb3VuZGVkLjwvbGk+XG4gICAgKiA8bGk+MSA9IENvbW1lcmNpYWxseTwvbGk+XG4gICAgKiA8bGk+MiA9IFJvdW5kIFVwPC9saT5cbiAgICAqIDxsaT4zID0gUm91bmQgRG93bjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjIyAgICAgICBcbiAgICBjaGFuZ2VEZWNpbWFsVmFyaWFibGVzOiAocGFyYW1zLCByb3VuZE1ldGhvZCkgLT5cbiAgICAgICAgc291cmNlID0gMFxuICAgICAgICByb3VuZEZ1bmMgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcm91bmRNZXRob2RcbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIHJvdW5kRnVuYyA9ICh2YWx1ZSkgLT4gdmFsdWVcbiAgICAgICAgICAgIHdoZW4gMSB0aGVuIHJvdW5kRnVuYyA9ICh2YWx1ZSkgLT4gTWF0aC5yb3VuZCh2YWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMiB0aGVuIHJvdW5kRnVuYyA9ICh2YWx1ZSkgLT4gTWF0aC5jZWlsKHZhbHVlKVxuICAgICAgICAgICAgd2hlbiAzIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiBNYXRoLmZsb29yKHZhbHVlKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHBhcmFtcy5zb3VyY2VcbiAgICAgICAgICAgIHdoZW4gMCAjIENvbnN0YW50IFZhbHVlIC8gVmFyaWFibGUgVmFsdWVcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc291cmNlVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5kb21cbiAgICAgICAgICAgICAgICBzdGFydCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zb3VyY2VSYW5kb20uc3RhcnQpXG4gICAgICAgICAgICAgICAgZW5kID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnNvdXJjZVJhbmRvbS5lbmQpXG4gICAgICAgICAgICAgICAgZGlmZiA9IGVuZCAtIHN0YXJ0XG4gICAgICAgICAgICAgICAgc291cmNlID0gTWF0aC5mbG9vcihzdGFydCArIE1hdGgucmFuZG9tKCkgKiAoZGlmZisxKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFBvaW50ZXJcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVBdEluZGV4KHBhcmFtcy5zb3VyY2VTY29wZSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnNvdXJjZVJlZmVyZW5jZSktMSwgcGFyYW1zLnNvdXJjZVJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgIHdoZW4gMyAjIEdhbWUgRGF0YVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBudW1iZXJWYWx1ZU9mR2FtZURhdGEocGFyYW1zLnNvdXJjZVZhbHVlMSlcbiAgICAgICAgICAgIHdoZW4gNCAjIERhdGFiYXNlIERhdGFcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVPZkRhdGFiYXNlRGF0YShwYXJhbXMuc291cmNlVmFsdWUxKVxuICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyhwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVPZihwYXJhbXMudGFyZ2V0VmFyaWFibGUpICsgc291cmNlKSApXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFN1YlxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAtIHNvdXJjZSkgKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgKiBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgLyBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgc2NvcGUgPSBwYXJhbXMudGFyZ2V0U2NvcGVcbiAgICAgICAgICAgICAgICBzdGFydCA9IHBhcmFtcy50YXJnZXRSYW5nZS5zdGFydC0xXG4gICAgICAgICAgICAgICAgZW5kID0gcGFyYW1zLnRhcmdldFJhbmdlLmVuZC0xXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW3N0YXJ0Li5lbmRdXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCByb3VuZEZ1bmMoc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSArIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgLSBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgTXVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICogc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAvIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIHJvdW5kRnVuYyhzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgKyBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLSBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgKiBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLyBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAlIHNvdXJjZSwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2hha2VzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBzaGFrZU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNoYWtlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8gYWJvdXQgdGhlIHNoYWtlLWFuaW1hdGlvbi5cbiAgICAjIyMgICAgICAgIFxuICAgIHNoYWtlT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGR1cmF0aW9uID0gTWF0aC5tYXgoTWF0aC5yb3VuZChAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbikpLCAyKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5zaGFrZSh7IHg6IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5yYW5nZS54KSwgeTogQG51bWJlclZhbHVlT2YocGFyYW1zLnJhbmdlLnkpIH0sIEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zcGVlZCkgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICBcbiAgICAjIyMqXG4gICAgKiBMZXRzIHRoZSBpbnRlcnByZXRlciB3YWl0IGZvciB0aGUgY29tcGxldGlvbiBvZiBhIHJ1bm5pbmcgb3BlcmF0aW9uIGxpa2UgYW4gYW5pbWF0aW9uLCBldGMuXG4gICAgKlxuICAgICogQG1ldGhvZCB3YWl0Rm9yQ29tcGxldGlvblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRoZSBvcGVyYXRpb24gaXMgZXhlY3V0ZWQgb24uIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyAgXG4gICAgd2FpdEZvckNvbXBsZXRpb246IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogRXJhc2VzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBlcmFzZU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGVyYXNlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjICAgICAgXG4gICAgZXJhc2VPYmplY3Q6IChvYmplY3QsIHBhcmFtcywgY2FsbGJhY2spIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBvYmplY3QuYW5pbWF0b3IuZGlzYXBwZWFyKHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIChzZW5kZXIpID0+IFxuICAgICAgICAgICAgc2VuZGVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgY2FsbGJhY2s/KHNlbmRlcilcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uIFxuICAgIFxuICAgICMjIypcbiAgICAqIFNob3dzIGEgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd09iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNob3cuXG4gICAgKiBAcGFyYW0ge2dzLlBvaW50fSBwb3NpdGlvbiAtIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgZ2FtZSBvYmplY3Qgc2hvdWxkIGJlIHNob3duLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgICAgICAgICAgXG4gICAgc2hvd09iamVjdDogKG9iamVjdCwgcG9zaXRpb24sIHBhcmFtcykgLT5cbiAgICAgICAgeCA9IEBudW1iZXJWYWx1ZU9mKHBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwb3NpdGlvbi55KVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgIFxuICAgICAgICBvYmplY3QuYW5pbWF0b3IuYXBwZWFyKHgsIHksIHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIFxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgXG4gICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIE1vdmVzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBtb3ZlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gbW92ZS5cbiAgICAqIEBwYXJhbSB7Z3MuUG9pbnR9IHBvc2l0aW9uIC0gVGhlIHBvc2l0aW9uIHRvIG1vdmUgdGhlIGdhbWUgb2JqZWN0IHRvLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgbW92ZU9iamVjdDogKG9iamVjdCwgcG9zaXRpb24sIHBhcmFtcykgLT5cbiAgICAgICAgaWYgcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQHByZWRlZmluZWRPYmplY3RQb3NpdGlvbihwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIG9iamVjdCwgcGFyYW1zKVxuICAgICAgICAgICAgeCA9IHAueFxuICAgICAgICAgICAgeSA9IHAueVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4ID0gQG51bWJlclZhbHVlT2YocG9zaXRpb24ueClcbiAgICAgICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwb3NpdGlvbi55KVxuICAgIFxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5tb3ZlVG8oeCwgeSwgZHVyYXRpb24sIGVhc2luZylcbiAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBNb3ZlcyBhIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1vdmVPYmplY3RQYXRoXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gbW92ZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXRoIC0gVGhlIHBhdGggdG8gbW92ZSB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICBtb3ZlT2JqZWN0UGF0aDogKG9iamVjdCwgcGF0aCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLm1vdmVQYXRoKHBhdGguZGF0YSwgcGFyYW1zLmxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nLCBwYXRoLmVmZmVjdHM/LmRhdGEpXG4gICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIFNjcm9sbHMgYSBzY3JvbGxhYmxlIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNjcm9sbE9iamVjdFBhdGhcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzY3JvbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aCAtIFRoZSBwYXRoIHRvIHNjcm9sbCB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyAgICAgICAgXG4gICAgc2Nyb2xsT2JqZWN0UGF0aDogKG9iamVjdCwgcGF0aCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnNjcm9sbFBhdGgocGF0aCwgcGFyYW1zLmxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgIFxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFpvb21zL1NjYWxlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgem9vbU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHpvb20uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICB6b29tT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBvYmplY3QuYW5pbWF0b3Iuem9vbVRvKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy56b29taW5nLngpIC8gMTAwLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuem9vbWluZy55KSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogUm90YXRlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgcm90YXRlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gcm90YXRlLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgcm90YXRlT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgI2lmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICMgICAgYWN0dWFsRHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgICMgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKEBkdXJhdGlvbilcbiAgICAgICAgIyAgICBzcGVlZCA9IEBudW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwXG4gICAgICAgICMgICAgc3BlZWQgPSBNYXRoLnJvdW5kKGR1cmF0aW9uIC8gKGFjdHVhbER1cmF0aW9ufHwxKSAqIHNwZWVkKVxuICAgICAgICAjICAgIHBpY3R1cmUuYW5pbWF0b3Iucm90YXRlKEBwYXJhbXMuZGlyZWN0aW9uLCBzcGVlZCwgYWN0dWFsRHVyYXRpb258fDEsIGVhc2luZylcbiAgICAgICAgIyAgICBkdXJhdGlvbiA9IGFjdHVhbER1cmF0aW9uXG4gICAgICAgICNlbHNlXG4gICAgICAgICMgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgIyAgICBvYmplY3QuYW5pbWF0b3Iucm90YXRlKHBhcmFtcy5kaXJlY3Rpb24sIEBudW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnJvdGF0ZShwYXJhbXMuZGlyZWN0aW9uLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogQmxlbmRzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBibGVuZE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGJsZW5kLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBibGVuZE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmJsZW5kVG8oQG51bWJlclZhbHVlT2YocGFyYW1zLm9wYWNpdHkpLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBFeGVjdXRlcyBhIG1hc2tpbmctZWZmZWN0IG9uIGEgZ2FtZSBvYmplY3QuLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWFza09iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGV4ZWN1dGUgYSBtYXNraW5nLWVmZmVjdCBvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjIFxuICAgIG1hc2tPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICBcbiAgICAgICAgaWYgcGFyYW1zLm1hc2sudHlwZSA9PSAwXG4gICAgICAgICAgICBvYmplY3QubWFzay50eXBlID0gMFxuICAgICAgICAgICAgb2JqZWN0Lm1hc2sub3ggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMubWFzay5veClcbiAgICAgICAgICAgIG9iamVjdC5tYXNrLm95ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLm1hc2sub3kpXG4gICAgICAgICAgICBpZiBvYmplY3QubWFzay5zb3VyY2U/LnZpZGVvRWxlbWVudD9cbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UucGF1c2UoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcGFyYW1zLm1hc2suc291cmNlVHlwZSA9PSAwXG4gICAgICAgICAgICAgICAgb2JqZWN0Lm1hc2suc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7cGFyYW1zLm1hc2suZ3JhcGhpYz8ubmFtZX1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCJNb3ZpZXMvI3twYXJhbXMubWFzay52aWRlbz8ubmFtZX1cIilcbiAgICAgICAgICAgICAgICBpZiBvYmplY3QubWFzay5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lm1hc2suc291cmNlLnBsYXkoKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UubG9vcCA9IHllc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICAgICAgb2JqZWN0LmFuaW1hdG9yLm1hc2tUbyhwYXJhbXMubWFzaywgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgXG4gICAgIyMjKlxuICAgICogVGludHMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRpbnRPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byB0aW50LlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgICAgICAgXG4gICAgdGludE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnRpbnRUbyhwYXJhbXMudG9uZSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICBcbiAgICAjIyMqXG4gICAgKiBGbGFzaGVzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBmbGFzaE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGZsYXNoLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyMgXG4gICAgZmxhc2hPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmZsYXNoKG5ldyBDb2xvcihwYXJhbXMuY29sb3IpLCBkdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIENyb3BlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JvcE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGNyb3AuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyAgICAgICAgIFxuICAgIGNyb3BPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgb2JqZWN0LnNyY1JlY3QueCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy54KVxuICAgICAgICBvYmplY3Quc3JjUmVjdC55ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnkpXG4gICAgICAgIG9iamVjdC5zcmNSZWN0LndpZHRoID0gQG51bWJlclZhbHVlT2YocGFyYW1zLndpZHRoKVxuICAgICAgICBvYmplY3Quc3JjUmVjdC5oZWlnaHQgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuaGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMud2lkdGgpXG4gICAgICAgIG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5oZWlnaHQpXG4gICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgbW90aW9uIGJsdXIgc2V0dGluZ3Mgb2YgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9iamVjdE1vdGlvbkJsdXJcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzZXQgdGhlIG1vdGlvbiBibHVyIHNldHRpbmdzIGZvci5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjXG4gICAgb2JqZWN0TW90aW9uQmx1cjogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBvYmplY3QubW90aW9uQmx1ci5zZXQocGFyYW1zLm1vdGlvbkJsdXIpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEVuYWJsZXMgYW4gZWZmZWN0IG9uIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvYmplY3RFZmZlY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBleGVjdXRlIGEgbWFza2luZy1lZmZlY3Qgb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjIyBcbiAgICBvYmplY3RFZmZlY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcGFyYW1zLnR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIFdvYmJsZVxuICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci53b2JibGVUbyhwYXJhbXMud29iYmxlLnBvd2VyIC8gMTAwMDAsIHBhcmFtcy53b2JibGUuc3BlZWQgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgd29iYmxlID0gb2JqZWN0LmVmZmVjdHMud29iYmxlXG4gICAgICAgICAgICAgICAgd29iYmxlLmVuYWJsZWQgPSBwYXJhbXMud29iYmxlLnBvd2VyID4gMFxuICAgICAgICAgICAgICAgIHdvYmJsZS52ZXJ0aWNhbCA9IHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMCBvciBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgICAgICB3b2JibGUuaG9yaXpvbnRhbCA9IHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMSBvciBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgIHdoZW4gMSAjIEJsdXJcbiAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3IuYmx1clRvKHBhcmFtcy5ibHVyLnBvd2VyIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIG9iamVjdC5lZmZlY3RzLmJsdXIuZW5hYmxlZCA9IHllc1xuICAgICAgICAgICAgd2hlbiAyICMgUGl4ZWxhdGVcbiAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0b3IucGl4ZWxhdGVUbyhwYXJhbXMucGl4ZWxhdGUuc2l6ZS53aWR0aCwgcGFyYW1zLnBpeGVsYXRlLnNpemUuaGVpZ2h0LCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIG9iamVjdC5lZmZlY3RzLnBpeGVsYXRlLmVuYWJsZWQgPSB5ZXNcbiAgICBcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBkdXJhdGlvbiAhPSAwXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGFuIGFjdGlvbiBsaWtlIGZvciBhIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQWN0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIC0gQWN0aW9uLURhdGEuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlVmFsdWUgLSBJbiBjYXNlIG9mIHN3aXRjaC1iaW5kaW5nLCB0aGUgc3dpdGNoIGlzIHNldCB0byB0aGlzIHZhbHVlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGJpbmRWYWx1ZSAtIEEgbnVtYmVyIHZhbHVlIHdoaWNoIGJlIHB1dCBpbnRvIHRoZSBhY3Rpb24ncyBiaW5kLXZhbHVlIHZhcmlhYmxlLlxuICAgICMjI1xuICAgIGV4ZWN1dGVBY3Rpb246IChhY3Rpb24sIHN0YXRlVmFsdWUsIGJpbmRWYWx1ZSkgLT5cbiAgICAgICAgc3dpdGNoIGFjdGlvbi50eXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBKdW1wIFRvIExhYmVsXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLmxhYmVsSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGp1bXBUb0xhYmVsKGFjdGlvbi5sYWJlbClcbiAgICAgICAgICAgIHdoZW4gMSAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgQGNhbGxDb21tb25FdmVudChhY3Rpb24uY29tbW9uRXZlbnRJZCwgbnVsbCwgQGlzV2FpdGluZylcbiAgICAgICAgICAgIHdoZW4gMiAjIEJpbmQgVG8gU3dpdGNoXG4gICAgICAgICAgICAgICAgZG9tYWluID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5kb21haW5cbiAgICAgICAgICAgICAgICBAc2V0Qm9vbGVhblZhbHVlVG8oYWN0aW9uLnN3aXRjaCwgc3RhdGVWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMyAjIENhbGwgU2NlbmVcbiAgICAgICAgICAgICAgICBAY2FsbFNjZW5lKGFjdGlvbi5zY2VuZT8udWlkKVxuICAgICAgICAgICAgd2hlbiA0ICMgQmluZCBWYWx1ZSB0byBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIGRvbWFpbiA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuZG9tYWluXG4gICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8oYWN0aW9uLmJpbmRWYWx1ZVZhcmlhYmxlLCBiaW5kVmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLmxhYmVsSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGp1bXBUb0xhYmVsKGFjdGlvbi5sYWJlbClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsQ29tbW9uRXZlbnRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIFRoZSBJRCBvZiB0aGUgY29tbW9uIGV2ZW50IHRvIGNhbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIE9wdGlvbmFsIGNvbW1vbiBldmVudCBwYXJhbWV0ZXJzLlxuICAgICogQHBhcmFtIHtib29sZWFufSB3YWl0IC0gSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBzaG91bGQgYmUgc3RheSBpbiB3YWl0aW5nLW1vZGUgZXZlbiBpZiB0aGUgc3ViLWludGVycHJldGVyIGlzIGZpbmlzaGVkLlxuICAgICMjIyBcbiAgICBjYWxsQ29tbW9uRXZlbnQ6IChpZCwgcGFyYW1ldGVycywgd2FpdCkgLT5cbiAgICAgICAgY29tbW9uRXZlbnQgPSBHYW1lTWFuYWdlci5jb21tb25FdmVudHNbaWRdXG4gICAgICAgIFxuICAgICAgICBpZiBjb21tb25FdmVudD9cbiAgICAgICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmluZGV4T2YoY29tbW9uRXZlbnQpID09IC0xXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLmFkZE9iamVjdChjb21tb25FdmVudClcbiAgICAgICAgICAgIGNvbW1vbkV2ZW50LmV2ZW50cz8ub24gXCJmaW5pc2hcIiwgZ3MuQ2FsbEJhY2soXCJvbkNvbW1vbkV2ZW50RmluaXNoXCIsIHRoaXMpLCB7IHdhaXRpbmc6IHdhaXQgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBjb21tb25FdmVudC5iZWhhdmlvci5jYWxsKHBhcmFtZXRlcnMgfHwgW10sIEBzZXR0aW5ncywgQGNvbnRleHQpXG4gICAgICAgICAgICAjR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cExvY2FsVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgI0dhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgY29tbW9uRXZlbnQuYmVoYXZpb3IudXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHN1YkludGVycHJldGVyP1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc2V0dGluZ3MgPSBAc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci51cGRhdGUoKVxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxzIGEgc2NlbmUgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsU2NlbmVcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1aWQgLSBUaGUgVUlEIG9mIHRoZSBzY2VuZSB0byBjYWxsLlxuICAgICMjIyAgICAgICAgIFxuICAgIGNhbGxTY2VuZTogKHVpZCkgLT5cbiAgICAgICAgc2NlbmVEb2N1bWVudCA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KHVpZClcbiAgICAgICAgXG4gICAgICAgIGlmIHNjZW5lRG9jdW1lbnQ/XG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBuZXcgdm4uQ29tcG9uZW50X0NhbGxTY2VuZUludGVycHJldGVyKClcbiAgICAgICAgICAgIG9iamVjdCA9IHsgY29tbWFuZHM6IHNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMgfVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnJlcGVhdCA9IG5vXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoc2NlbmVEb2N1bWVudC51aWQsIHNjZW5lRG9jdW1lbnQpXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIub2JqZWN0ID0gb2JqZWN0XG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIub25GaW5pc2ggPSBncy5DYWxsQmFjayhcIm9uQ2FsbFNjZW5lRmluaXNoXCIsIHRoaXMpXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnNldHRpbmdzID0gQHNldHRpbmdzXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIudXBkYXRlKClcbiAgICAgICAgICAgIFxuICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9yZUxpc3RWYWx1ZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIElEIG9mIHRoZSBjb21tb24gZXZlbnQgdG8gY2FsbC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gT3B0aW9uYWwgY29tbW9uIGV2ZW50IHBhcmFtZXRlcnMuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhaXQgLSBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIHNob3VsZCBiZSBzdGF5IGluIHdhaXRpbmctbW9kZSBldmVuIGlmIHRoZSBzdWItaW50ZXJwcmV0ZXIgaXMgZmluaXNoZWQuXG4gICAgIyMjICAgICAgICBcbiAgICBzdG9yZUxpc3RWYWx1ZTogKHZhcmlhYmxlLCBsaXN0LCB2YWx1ZSwgdmFsdWVUeXBlKSAtPlxuICAgICAgICBzd2l0Y2ggdmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyh2YXJpYWJsZSwgKGlmICFpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZSBlbHNlIDApKVxuICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldEJvb2xlYW5WYWx1ZVRvKHZhcmlhYmxlLCAoaWYgdmFsdWUgdGhlbiAxIGVsc2UgMCkpXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHZhbHVlLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldExpc3RPYmplY3RUbyh2YXJpYWJsZSwgKGlmIHZhbHVlLmxlbmd0aD8gdGhlbiB2YWx1ZSBlbHNlIFtdKSkgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QganVtcFRvTGFiZWxcbiAgICAjIyMgICAgICAgICBcbiAgICBqdW1wVG9MYWJlbDogKGxhYmVsKSAtPlxuICAgICAgICByZXR1cm4gaWYgbm90IGxhYmVsXG4gICAgICAgIGZvdW5kID0gbm9cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uQG9iamVjdC5jb21tYW5kcy5sZW5ndGhdXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmNvbW1hbmRzW2ldLmlkID09IFwiZ3MuTGFiZWxcIiBhbmQgQG9iamVjdC5jb21tYW5kc1tpXS5wYXJhbXMubmFtZSA9PSBsYWJlbFxuICAgICAgICAgICAgICAgIEBwb2ludGVyID0gaVxuICAgICAgICAgICAgICAgIEBpbmRlbnQgPSBAb2JqZWN0LmNvbW1hbmRzW2ldLmluZGVudFxuICAgICAgICAgICAgICAgIGZvdW5kID0geWVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZm91bmRcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGN1cnJlbnQgbWVzc2FnZSBib3ggb2JqZWN0IGRlcGVuZGluZyBvbiBnYW1lIG1vZGUgKEFEViBvciBOVkwpLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZUJveE9iamVjdFxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X0Jhc2V9IFRoZSBtZXNzYWdlIGJveCBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgbWVzc2FnZUJveE9iamVjdDogKGlkKSAtPlxuICAgICAgICBpZiBTY2VuZU1hbmFnZXIuc2NlbmUubGF5b3V0LnZpc2libGVcbiAgICAgICAgICAgIHJldHVybiBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChpZCB8fCBcIm1lc3NhZ2VCb3hcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKGlkIHx8IFwibnZsTWVzc2FnZUJveFwiKVxuICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIG9iamVjdCBkZXBlbmRpbmcgb24gZ2FtZSBtb2RlIChBRFYgb3IgTlZMKS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VPYmplY3RcbiAgICAqIEByZXR1cm4ge3VpLk9iamVjdF9NZXNzYWdlfSBUaGUgbWVzc2FnZSBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3Q6IC0+XG4gICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5sYXlvdXQudmlzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIElEIGRlcGVuZGluZyBvbiBnYW1lIG1vZGUgKEFEViBvciBOVkwpLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZU9iamVjdElkXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBtZXNzYWdlIG9iamVjdCBJRC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgIFxuICAgIG1lc3NhZ2VPYmplY3RJZDogLT5cbiAgICAgICAgaWYgU2NlbmVNYW5hZ2VyLnNjZW5lLmxheW91dC52aXNpYmxlXG4gICAgICAgICAgICByZXR1cm4gXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFwibnZsR2FtZU1lc3NhZ2VfbWVzc2FnZVwiXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZVNldHRpbmdzXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBtZXNzYWdlIHNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBtZXNzYWdlU2V0dGluZ3M6IC0+XG4gICAgICAgIG1lc3NhZ2UgPSBAdGFyZ2V0TWVzc2FnZSgpXG5cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2Uuc2V0dGluZ3NcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCB0YXJnZXQgbWVzc2FnZSBvYmplY3Qgd2hlcmUgYWxsIG1lc3NhZ2UgY29tbWFuZHMgYXJlIGV4ZWN1dGVkIG9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdGFyZ2V0TWVzc2FnZVxuICAgICogQHJldHVybiB7dWkuT2JqZWN0X01lc3NhZ2V9IFRoZSB0YXJnZXQgbWVzc2FnZSBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgdGFyZ2V0TWVzc2FnZTogLT5cbiAgICAgICAgbWVzc2FnZSA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgdGFyZ2V0ID0gQHNldHRpbmdzLm1lc3NhZ2UudGFyZ2V0XG4gICAgICAgIGlmIHRhcmdldD9cbiAgICAgICAgICAgIHN3aXRjaCB0YXJnZXQudHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIExheW91dC1CYXNlZFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBDdXN0b21cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IFNjZW5lTWFuYWdlci5zY2VuZS5tZXNzYWdlQXJlYXNbdGFyZ2V0LmlkXT8ubWVzc2FnZSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBtZXNzYWdlXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGN1cnJlbnQgdGFyZ2V0IG1lc3NhZ2UgYm94IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdGFyZ2V0IG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCB0YXJnZXRNZXNzYWdlQm94XG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfVUlFbGVtZW50fSBUaGUgdGFyZ2V0IG1lc3NhZ2UgYm94LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgdGFyZ2V0TWVzc2FnZUJveDogLT5cbiAgICAgICAgbWVzc2FnZUJveCA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgdGFyZ2V0ID0gQHNldHRpbmdzLm1lc3NhZ2UudGFyZ2V0XG4gICAgICAgIGlmIHRhcmdldD9cbiAgICAgICAgICAgIHN3aXRjaCB0YXJnZXQudHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIExheW91dC1CYXNlZFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQm94ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBDdXN0b21cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUJveCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIrdGFyZ2V0LmlkKSA/IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBtZXNzYWdlQm94XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBhZnRlciBhbiBpbnB1dCBudW1iZXIgZGlhbG9nIHdhcyBhY2NlcHRlZCBieSB0aGUgdXNlci4gSXQgdGFrZXMgdGhlIHVzZXIncyBpbnB1dCBhbmQgcHV0c1xuICAgICogaXQgaW4gdGhlIGNvbmZpZ3VyZWQgbnVtYmVyIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25JbnB1dE51bWJlckZpbmlzaFxuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgbGlrZSB0aGUgbnVtYmVyLCBldGMuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIG9uSW5wdXROdW1iZXJGaW5pc2g6IChlKSAtPlxuICAgICAgICBAbWVzc2FnZU9iamVjdCgpLmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgQHNldE51bWJlclZhbHVlVG8oQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIudmFyaWFibGUsIHBhcnNlSW50KHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGUuc2VuZGVyLCBlLm51bWJlcikpKVxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIgPSBudWxsXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnB1dE51bWJlckJveC5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYW4gaW5wdXQgdGV4dCBkaWFsb2cgd2FzIGFjY2VwdGVkIGJ5IHRoZSB1c2VyLiBJdCB0YWtlcyB0aGUgdXNlcidzIHRleHQgaW5wdXQgYW5kIHB1dHNcbiAgICAqIGl0IGluIHRoZSBjb25maWd1cmVkIHN0cmluZyB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uSW5wdXRUZXh0RmluaXNoXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBsaWtlIHRoZSB0ZXh0LCBldGMuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIG9uSW5wdXRUZXh0RmluaXNoOiAoZSkgLT5cbiAgICAgICAgQG1lc3NhZ2VPYmplY3QoKS5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgIEBzZXRTdHJpbmdWYWx1ZVRvKEB3YWl0aW5nRm9yLmlucHV0VGV4dC52YXJpYWJsZSwgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoZS5zZW5kZXIsIGUudGV4dCkucmVwbGFjZSgvXy9nLCBcIlwiKSlcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0aW5nRm9yLmlucHV0VGV4dCA9IG51bGxcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmlucHV0VGV4dEJveC5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYSBjaG9pY2Ugd2FzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLiBJdCBqdW1wcyB0byB0aGUgY29ycmVzcG9uZGluZyBsYWJlbFxuICAgICogYW5kIGFsc28gcHV0cyB0aGUgY2hvaWNlIGludG8gYmFja2xvZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ2hvaWNlQWNjZXB0XG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBsaWtlIHRoZSBsYWJlbCwgZXRjLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgXG4gICAgb25DaG9pY2VBY2NlcHQ6IChlKSAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5jaG9pY2VUaW1lci5iZWhhdmlvci5zdG9wKClcbiAgICAgICAgXG4gICAgICAgIGUuaXNTZWxlY3RlZCA9IHllc1xuICAgICAgICBkZWxldGUgZS5zZW5kZXJcbiAgICAgICAgXG4gICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cucHVzaCh7IGNoYXJhY3RlcjogeyBuYW1lOiBcIlwiIH0sIG1lc3NhZ2U6IFwiXCIsIGNob2ljZTogZSwgY2hvaWNlczogc2NlbmUuY2hvaWNlcywgaXNDaG9pY2U6IHllcyB9KVxuICAgICAgICBzY2VuZS5jaG9pY2VzID0gW11cbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgaWYgbWVzc2FnZU9iamVjdD8udmlzaWJsZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgZmFkaW5nID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lc3NhZ2VGYWRpbmdcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgdGhlbiAwIGVsc2UgZmFkaW5nLmR1cmF0aW9uXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgPT5cbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnZpc2libGUgPSBub1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEB3YWl0aW5nRm9yLmNob2ljZSA9IG51bGxcbiAgICAgICAgICAgICAgICBAZXhlY3V0ZUFjdGlvbihlLmFjdGlvbiwgdHJ1ZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBAZXhlY3V0ZUFjdGlvbihlLmFjdGlvbiwgdHJ1ZSlcbiAgICAgICAgc2NlbmUuY2hvaWNlV2luZG93LmRpc3Bvc2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIElkbGVcbiAgICAqIEBtZXRob2QgY29tbWFuZElkbGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZElkbGU6IC0+XG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSAhQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0IFRpbWVyXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTdGFydFRpbWVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kU3RhcnRUaW1lcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgdGltZXJzID0gc2NlbmUudGltZXJzXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0aW1lciA9IHRpbWVyc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0aW1lcj9cbiAgICAgICAgICAgIHRpbWVyID0gbmV3IGdzLk9iamVjdF9JbnRlcnZhbFRpbWVyKClcbiAgICAgICAgICAgIHRpbWVyc1tudW1iZXJdID0gdGltZXJcbiAgICAgICAgICAgIFxuICAgICAgICB0aW1lci5ldmVudHMub2ZmQnlPd25lcihcImVsYXBzZWRcIiwgQG9iamVjdClcbiAgICAgICAgdGltZXIuZXZlbnRzLm9uKFwiZWxhcHNlZFwiLCAoZSkgPT5cbiAgICAgICAgICAgIHBhcmFtcyA9IGUuZGF0YS5wYXJhbXNcbiAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMuYWN0aW9uLnR5cGVcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBKdW1wIFRvIExhYmVsXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcmFtcy5sYWJlbEluZGV4P1xuICAgICAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLnBvaW50ZXIgPSBwYXJhbXMubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuaW50ZXJwcmV0ZXIuanVtcFRvTGFiZWwocGFyYW1zLmFjdGlvbi5kYXRhLmxhYmVsKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnRlcnByZXRlci5jYWxsQ29tbW9uRXZlbnQocGFyYW1zLmFjdGlvbi5kYXRhLmNvbW1vbkV2ZW50SWQsIG51bGwsIEBpbnRlcnByZXRlci5pc1dhaXRpbmcpXG4gICAgICAgIHsgcGFyYW1zOiBAcGFyYW1zIH0sIEBvYmplY3QpXG4gICAgICAgIFxuICAgICAgICB0aW1lci5iZWhhdmlvci5pbnRlcnZhbCA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5pbnRlcnZhbClcbiAgICAgICAgdGltZXIuYmVoYXZpb3Iuc3RhcnQoKVxuICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN1bWUgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlc3VtZVRpbWVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kUmVzdW1lVGltZXI6IC0+XG4gICAgICAgIHRpbWVycyA9IFNjZW5lTWFuYWdlci5zY2VuZS50aW1lcnNcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRpbWVyc1tudW1iZXJdPy5iZWhhdmlvci5yZXN1bWUoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQYXVzZXMgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFBhdXNlVGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRQYXVzZVRpbWVyOiAtPlxuICAgICAgICB0aW1lcnMgPSBTY2VuZU1hbmFnZXIuc2NlbmUudGltZXJzXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0aW1lcnNbbnVtYmVyXT8uYmVoYXZpb3IucGF1c2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTdG9wIFRpbWVyXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTdG9wVGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kU3RvcFRpbWVyOiAtPlxuICAgICAgICB0aW1lcnMgPSBTY2VuZU1hbmFnZXIuc2NlbmUudGltZXJzXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0aW1lcnNbbnVtYmVyXT8uYmVoYXZpb3Iuc3RvcCgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBXYWl0XG4gICAgKiBAbWV0aG9kIGNvbW1hbmRXYWl0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRXYWl0OiAtPlxuICAgICAgICB0aW1lID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLnRpbWUpIFxuICAgICAgICBcbiAgICAgICAgaWYgdGltZT8gYW5kIHRpbWUgPiAwIGFuZCAhQGludGVycHJldGVyLnByZXZpZXdEYXRhXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSB0aW1lXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIExvb3BcbiAgICAqIEBtZXRob2QgY29tbWFuZExvb3BcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZExvb3A6IC0+XG4gICAgICAgIEBpbnRlcnByZXRlci5sb29wc1tAaW50ZXJwcmV0ZXIuaW5kZW50XSA9IEBpbnRlcnByZXRlci5wb2ludGVyXG4gICAgICAgIEBpbnRlcnByZXRlci5pbmRlbnQrK1xuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBCcmVhayBMb29wXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCcmVha0xvb3BcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZEJyZWFrTG9vcDogLT5cbiAgICAgICAgaW5kZW50ID0gQGluZGVudFxuICAgICAgICB3aGlsZSBub3QgQGludGVycHJldGVyLmxvb3BzW2luZGVudF0/IGFuZCBpbmRlbnQgPiAwXG4gICAgICAgICAgICBpbmRlbnQtLVxuICAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5sb29wc1tpbmRlbnRdID0gbnVsbFxuICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50ID0gaW5kZW50XG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdEFkZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZExpc3RBZGQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnN0cmluZ1ZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMyAjIExpc3QgVmFsdWVcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5zZXRMaXN0T2JqZWN0VG8oQHBhcmFtcy5saXN0VmFyaWFibGUsIGxpc3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFBvcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTGlzdFBvcDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIHZhbHVlID0gbGlzdC5wb3AoKSA/IDBcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuc3RvcmVMaXN0VmFsdWUoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbGlzdCwgdmFsdWUsIEBwYXJhbXMudmFsdWVUeXBlKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U2hpZnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZExpc3RTaGlmdDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIHZhbHVlID0gbGlzdC5zaGlmdCgpID8gMFxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zdG9yZUxpc3RWYWx1ZShAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0LCB2YWx1ZSwgQHBhcmFtcy52YWx1ZVR5cGUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdEluZGV4T2ZcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZExpc3RJbmRleE9mOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSAtMVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxpc3QuaW5kZXhPZihAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaCBWYWx1ZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbGlzdC5pbmRleE9mKEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHQgVmFsdWVcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxpc3QuaW5kZXhPZihAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnN0cmluZ1ZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMyAjIExpc3QgVmFsdWVcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxpc3QuaW5kZXhPZihAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhbHVlKSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdENsZWFyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kTGlzdENsZWFyOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgbGlzdC5sZW5ndGggPSAwXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RWYWx1ZUF0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kTGlzdFZhbHVlQXQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuaW5kZXgpXG4gICAgICAgIFxuICAgICAgICBpZiBpbmRleCA+PSAwIGFuZCBpbmRleCA8IGxpc3QubGVuZ3RoXG4gICAgICAgICAgICB2YWx1ZSA9IGxpc3RbaW5kZXhdID8gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLnN0b3JlTGlzdFZhbHVlKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxpc3QsIHZhbHVlLCBAcGFyYW1zLnZhbHVlVHlwZSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFJlbW92ZUF0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIGNvbW1hbmRMaXN0UmVtb3ZlQXQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuaW5kZXgpXG4gICAgICAgIFxuICAgICAgICBpZiBpbmRleCA+PSAwIGFuZCBpbmRleCA8IGxpc3QubGVuZ3RoXG4gICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0SW5zZXJ0QXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgXG4gICAgY29tbWFuZExpc3RJbnNlcnRBdDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbmRleClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID49IDAgYW5kIGluZGV4IDwgbGlzdC5sZW5ndGhcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAwLCBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zdHJpbmdWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLmxpc3RWYXJpYWJsZSwgbGlzdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U2V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kTGlzdFNldDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbmRleClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID49IDBcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0W2luZGV4XSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0W2luZGV4XSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc3RyaW5nVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0W2luZGV4XSA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLmxpc3RWYXJpYWJsZSwgbGlzdCkgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0Q29weVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICBcbiAgICBjb21tYW5kTGlzdENvcHk6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBjb3B5ID0gT2JqZWN0LmRlZXBDb3B5KGxpc3QpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TGlzdE9iamVjdFRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGNvcHkpIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0TGVuZ3RoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRMaXN0TGVuZ3RoOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0Lmxlbmd0aCkgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdEpvaW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRMaXN0Sm9pbjogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIHZhbHVlID0gaWYgQHBhcmFtcy5vcmRlciA9PSAwIHRoZW4gbGlzdC5qb2luKEBwYXJhbXMuc2VwYXJhdG9yfHxcIlwiKSBlbHNlIGxpc3QucmV2ZXJzZSgpLmpvaW4oQHBhcmFtcy5zZXBhcmF0b3J8fFwiXCIpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSkgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RGcm9tVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZExpc3RGcm9tVGV4dDogLT5cbiAgICAgICAgdGV4dCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhcmlhYmxlKVxuICAgICAgICBzZXBhcmF0b3IgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNlcGFyYXRvcilcbiAgICAgICAgbGlzdCA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0KSBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFNodWZmbGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdFNodWZmbGU6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpZiBsaXN0Lmxlbmd0aCA9PSAwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbbGlzdC5sZW5ndGgtMS4uMV1cbiAgICAgICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSsxKSlcbiAgICAgICAgICAgIHRlbXBpID0gbGlzdFtpXVxuICAgICAgICAgICAgdGVtcGogPSBsaXN0W2pdXG4gICAgICAgICAgICBsaXN0W2ldID0gdGVtcGpcbiAgICAgICAgICAgIGxpc3Rbal0gPSB0ZW1waVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U29ydFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICBcbiAgICBjb21tYW5kTGlzdFNvcnQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpZiBsaXN0Lmxlbmd0aCA9PSAwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zb3J0T3JkZXJcbiAgICAgICAgICAgIHdoZW4gMCAjIEFzY2VuZGluZ1xuICAgICAgICAgICAgICAgIGxpc3Quc29ydCAoYSwgYikgLT4gXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPCBiIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPiBiIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIHdoZW4gMSAjIERlc2NlbmRpbmdcbiAgICAgICAgICAgICAgICBsaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPiBiIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgIGlmIGEgPCBiIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUmVzZXRWYXJpYWJsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kUmVzZXRWYXJpYWJsZXM6IC0+XG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgd2hlbiAwICMgQWxsXG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBudWxsXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5nZVxuICAgICAgICAgICAgICAgIHJhbmdlID0gQHBhcmFtcy5yYW5nZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zY29wZVxuICAgICAgICAgICAgd2hlbiAwICMgTG9jYWxcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyh7IGlkOiBAcGFyYW1zLnNjZW5lLnVpZCB9LCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAxICMgQWxsIExvY2Fsc1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyhudWxsLCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAyICMgR2xvYmFsXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jbGVhckdsb2JhbFZhcmlhYmxlcyhAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAzICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzKEBwYXJhbXMudHlwZSwgcmFuZ2UpXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVZhcmlhYmxlRG9tYWluXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRDaGFuZ2VWYXJpYWJsZURvbWFpbjogLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jaGFuZ2VEb21haW4oQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5kb21haW4pKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzOiAtPiBAaW50ZXJwcmV0ZXIuY2hhbmdlRGVjaW1hbFZhcmlhYmxlcyhAcGFyYW1zLCBAcGFyYW1zLnJvdW5kTWV0aG9kKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZU51bWJlclZhcmlhYmxlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlTnVtYmVyVmFyaWFibGVzOiAtPlxuICAgICAgICBzb3VyY2UgPSAwXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zb3VyY2VcbiAgICAgICAgICAgIHdoZW4gMCAjIENvbnN0YW50IFZhbHVlIC8gVmFyaWFibGUgVmFsdWVcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZG9tXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVJhbmRvbS5zdGFydClcbiAgICAgICAgICAgICAgICBlbmQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNvdXJjZVJhbmRvbS5lbmQpXG4gICAgICAgICAgICAgICAgZGlmZiA9IGVuZCAtIHN0YXJ0XG4gICAgICAgICAgICAgICAgc291cmNlID0gTWF0aC5mbG9vcihzdGFydCArIE1hdGgucmFuZG9tKCkgKiAoZGlmZisxKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFBvaW50ZXJcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMuc291cmNlU2NvcGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc291cmNlUmVmZXJlbmNlKS0xLCBAcGFyYW1zLnNvdXJjZVJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgIHdoZW4gMyAjIEdhbWUgRGF0YVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mR2FtZURhdGEoQHBhcmFtcy5zb3VyY2VWYWx1ZTEpXG4gICAgICAgICAgICB3aGVuIDQgIyBEYXRhYmFzZSBEYXRhXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2ZEYXRhYmFzZURhdGEoQHBhcmFtcy5zb3VyY2VWYWx1ZTEpXG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgU3ViXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAtIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgTXVsXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAqIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLmZsb29yKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpIC8gc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgTW9kXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgc2NvcGUgPSBAcGFyYW1zLnRhcmdldFNjb3BlXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBAcGFyYW1zLnRhcmdldFJhbmdlLnN0YXJ0LTFcbiAgICAgICAgICAgICAgICBlbmQgPSBAcGFyYW1zLnRhcmdldFJhbmdlLmVuZC0xXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW3N0YXJ0Li5lbmRdXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgKyBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAtIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIE11bFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICogc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgTWF0aC5mbG9vcihAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAvIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50YXJnZXRSZWZlcmVuY2UpIC0gMVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pICsgc291cmNlLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgU3ViXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLSBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAqIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgTWF0aC5mbG9vcihAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLyBzb3VyY2UpLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgTW9kXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgJSBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXM6IC0+XG4gICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnZhbHVlKVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgd2hlbiAwICMgVmFyaWFibGVcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnZhbHVlID09IDIgIyBUcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBpZiB0YXJnZXRWYWx1ZSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzb3VyY2UpXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5nZVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0geyBpbmRleDogMCwgc2NvcGU6IEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSB9XG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gWyhAcGFyYW1zLnJhbmdlU3RhcnQtMSkuLihAcGFyYW1zLnJhbmdlRW5kLTEpXVxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5pbmRleCA9IGlcbiAgICAgICAgICAgICAgICAgICAgaWYgQHBhcmFtcy52YWx1ZSA9PSAyICMgVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFsdWUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YodmFyaWFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIGlmIHRhcmdldFZhbHVlIHRoZW4gZmFsc2UgZWxzZSB0cnVlKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50YXJnZXRSZWZlcmVuY2UpIC0gMVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSwgaW5kZXgsIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVN0cmluZ1ZhcmlhYmxlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlU3RyaW5nVmFyaWFibGVzOiAtPlxuICAgICAgICBzb3VyY2UgPSBcIlwiXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnNvdXJjZVxuICAgICAgICAgICAgd2hlbiAwICMgQ29uc3RhbnQgVGV4dFxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGxjcyhAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFZhcmlhYmxlXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zb3VyY2VWYXJpYWJsZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIERhdGFiYXNlIERhdGFcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZkRhdGFiYXNlRGF0YShAcGFyYW1zLmRhdGFiYXNlRGF0YSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFNjcmlwdFxuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBldmFsKEBwYXJhbXMuc2NyaXB0KVxuICAgICAgICAgICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IFwiRVJSOiBcIiArIGV4Lm1lc3NhZ2VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBsY3MoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVG8gVXBwZXItQ2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkudG9VcHBlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgVG8gTG93ZXItQ2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkudG9Mb3dlckNhc2UoKSlcblxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZ2VcbiAgICAgICAgICAgICAgICB2YXJpYWJsZSA9IHsgaW5kZXg6IDAsIHNjb3BlOiBAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUgfVxuICAgICAgICAgICAgICAgIGZvciBpIGluIFtAcGFyYW1zLnJhbmdlU3RhcnQtMS4uQHBhcmFtcy5yYW5nZUVuZC0xXVxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5pbmRleCA9IGlcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyh2YXJpYWJsZSwgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHZhcmlhYmxlKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRvIFVwcGVyLUNhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyh2YXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YodmFyaWFibGUpLnRvVXBwZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBUbyBMb3dlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHZhcmlhYmxlKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgdGFyZ2V0VmFsdWUgKyBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUbyBVcHBlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSwgaW5kZXgsIHRhcmdldFZhbHVlLnRvVXBwZXJDYXNlKCksIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBUbyBMb3dlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCB0YXJnZXRWYWx1ZS50b0xvd2VyQ2FzZSgpLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hlY2tTd2l0Y2hcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRDaGVja1N3aXRjaDogLT5cbiAgICAgICAgcmVzdWx0ID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpICYmIEBwYXJhbXMudmFsdWVcbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlciA9IEBwYXJhbXMubGFiZWxJbmRleFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE51bWJlckNvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmROdW1iZXJDb25kaXRpb246IC0+XG4gICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgIEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdID0gcmVzdWx0XG4gICAgICAgIFxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pbmRlbnQrK1xuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICBcbiAgICBjb21tYW5kQ29uZGl0aW9uOiAtPlxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudmFyaWFibGUpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy52YXJpYWJsZSksIEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGludGVycHJldGVyLmNvbXBhcmUobGNzKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudmFyaWFibGUpKSwgbGNzKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKSksIEBwYXJhbXMub3BlcmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmNvbmRpdGlvbnNbQGludGVycHJldGVyLmluZGVudF0gPSByZXN1bHRcbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KysgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvbkVsc2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kQ29uZGl0aW9uRWxzZTogLT5cbiAgICAgICAgaWYgbm90IEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDb25kaXRpb25FbHNlSWZcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDb25kaXRpb25FbHNlSWY6IC0+XG4gICAgICAgIGlmIG5vdCBAaW50ZXJwcmV0ZXIuY29uZGl0aW9uc1tAaW50ZXJwcmV0ZXIuaW5kZW50XVxuICAgICAgICAgICAgQGludGVycHJldGVyLmNvbW1hbmRDb25kaXRpb24uY2FsbCh0aGlzKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoZWNrTnVtYmVyVmFyaWFibGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDaGVja051bWJlclZhcmlhYmxlOiAtPlxuICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52YWx1ZSksIEBwYXJhbXMub3BlcmF0aW9uKVxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyID0gQHBhcmFtcy5sYWJlbEluZGV4XG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hlY2tUZXh0VmFyaWFibGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbW1hbmRDaGVja1RleHRWYXJpYWJsZTogLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgdGV4dDEgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKVxuICAgICAgICB0ZXh0MiA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudmFsdWUpXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcmVzdWx0ID0gdGV4dDEgPT0gdGV4dDJcbiAgICAgICAgICAgIHdoZW4gMSB0aGVuIHJlc3VsdCA9IHRleHQxICE9IHRleHQyXG4gICAgICAgICAgICB3aGVuIDIgdGhlbiByZXN1bHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gMyB0aGVuIHJlc3VsdCA9IHRleHQxLmxlbmd0aCA+PSB0ZXh0Mi5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gNCB0aGVuIHJlc3VsdCA9IHRleHQxLmxlbmd0aCA8IHRleHQyLmxlbmd0aFxuICAgICAgICAgICAgd2hlbiA1IHRoZW4gcmVzdWx0ID0gdGV4dDEubGVuZ3RoIDw9IHRleHQyLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIgPSBAcGFyYW1zLmxhYmVsSW5kZXhcbiAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGFiZWxcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kTGFiZWw6IC0+ICMgRG9lcyBOb3RoaW5nXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEp1bXBUb0xhYmVsXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgICBcbiAgICBjb21tYW5kSnVtcFRvTGFiZWw6IC0+XG4gICAgICAgIGxhYmVsID0gQHBhcmFtcy5sYWJlbEluZGV4ICNAaW50ZXJwcmV0ZXIubGFiZWxzW0BwYXJhbXMubmFtZV1cbiAgICAgICAgaWYgbGFiZWw/XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlciA9IGxhYmVsXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50ID0gQGludGVycHJldGVyLm9iamVjdC5jb21tYW5kc1tsYWJlbF0uaW5kZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgICAgIHdoZW4gXCJhY3RpdmVDb250ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLmp1bXBUb0xhYmVsKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMubmFtZSkpXG4gICAgICAgICAgICAgICAgd2hlbiBcImFjdGl2ZVNjZW5lXCJcbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmp1bXBUb0xhYmVsKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMubmFtZSkpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuanVtcFRvTGFiZWwoQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5uYW1lKSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2xlYXJNZXNzYWdlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjb21tYW5kQ2xlYXJNZXNzYWdlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKVxuICAgICAgICBpZiBub3QgbWVzc2FnZU9iamVjdD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIGZhZGluZyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZXNzYWdlRmFkaW5nXG4gICAgICAgIGlmIG5vdCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGZhZGluZy5kdXJhdGlvblxuICAgICAgICBtZXNzYWdlT2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgZ3MuQ2FsbEJhY2soXCJvbk1lc3NhZ2VBRFZDbGVhclwiLCBAaW50ZXJwcmV0ZXIpKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihtZXNzYWdlT2JqZWN0LCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWVzc2FnZUJveERlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRNZXNzYWdlQm94RGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubWVzc2FnZUJveFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93TWVzc2FnZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFNob3dNZXNzYWdlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5tZXNzYWdlTW9kZSA9IHZuLk1lc3NhZ2VNb2RlLkFEVlxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCBcbiAgICAgICAgXG4gICAgICAgIHNob3dNZXNzYWdlID0gPT5cbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tAcGFyYW1zLmNoYXJhY3RlcklkXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzY2VuZS5sYXlvdXQudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgbWVzc2FnZU9iamVjdCA9IEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBtZXNzYWdlT2JqZWN0PyB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzY2VuZS5jdXJyZW50Q2hhcmFjdGVyID0gY2hhcmFjdGVyXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmNoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0Lm9wYWNpdHkgPSAyNTVcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9mZkJ5T3duZXIoXCJjYWxsQ29tbW9uRXZlbnRcIiwgQGludGVycHJldGVyKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub24oXCJjYWxsQ29tbW9uRXZlbnRcIiwgZ3MuQ2FsbEJhY2soXCJvbkNhbGxDb21tb25FdmVudFwiLCBAaW50ZXJwcmV0ZXIpLCBwYXJhbXM6IEBwYXJhbXMsIEBpbnRlcnByZXRlcilcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9uY2UoXCJmaW5pc2hcIiwgZ3MuQ2FsbEJhY2soXCJvbk1lc3NhZ2VBRFZGaW5pc2hcIiwgQGludGVycHJldGVyKSwgcGFyYW1zOiBAcGFyYW1zLCBAaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vbmNlKFwid2FpdGluZ1wiLCBncy5DYWxsQmFjayhcIm9uTWVzc2FnZUFEVldhaXRpbmdcIiwgQGludGVycHJldGVyKSwgcGFyYW1zOiBAcGFyYW1zLCBAaW50ZXJwcmV0ZXIpICAgXG4gICAgICAgICAgICBpZiBtZXNzYWdlT2JqZWN0LnNldHRpbmdzLnVzZUNoYXJhY3RlckNvbG9yXG4gICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5tZXNzYWdlLnNob3dNZXNzYWdlKEBpbnRlcnByZXRlciwgQHBhcmFtcywgY2hhcmFjdGVyKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QubWVzc2FnZS5zaG93TWVzc2FnZShAaW50ZXJwcmV0ZXIsIEBwYXJhbXMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcbiAgICAgICAgICAgIHZvaWNlU2V0dGluZ3MgPSBzZXR0aW5ncy52b2ljZXNCeUNoYXJhY3RlcltjaGFyYWN0ZXIuaW5kZXhdXG4gICAgICBcbiAgICAgICAgICAgIGlmIEBwYXJhbXMudm9pY2U/IGFuZCBHYW1lTWFuYWdlci5zZXR0aW5ncy52b2ljZUVuYWJsZWQgYW5kICghdm9pY2VTZXR0aW5ncyBvciB2b2ljZVNldHRpbmdzID4gMClcbiAgICAgICAgICAgICAgICBpZiAoR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb24gb3IgIUF1ZGlvTWFuYWdlci52b2ljZT8ucGxheWluZykgYW5kICFHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnZvaWNlID0gQHBhcmFtcy52b2ljZVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLnZvaWNlID0gQXVkaW9NYW5hZ2VyLnBsYXlWb2ljZShAcGFyYW1zLnZvaWNlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYmVoYXZpb3Iudm9pY2UgPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuZXhwcmVzc2lvbklkPyBhbmQgY2hhcmFjdGVyP1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbQHBhcmFtcy5leHByZXNzaW9uSWQgfHwgMF1cbiAgICAgICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuY2hhcmFjdGVyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmICFncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZChAcGFyYW1zLmZpZWxkRmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmV4cHJlc3Npb25EdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmNoYW5nZUVhc2luZylcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGRlZmF1bHRzLmNoYW5nZUFuaW1hdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGFyYWN0ZXIuYmVoYXZpb3IuY2hhbmdlRXhwcmVzc2lvbihleHByZXNzaW9uLCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sID0+XG4gICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzaG93TWVzc2FnZSgpXG4gICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSAoQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiA/IHllcykgYW5kICEoR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZSA9PSAwKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdGluZ0Zvci5tZXNzYWdlQURWID0gQHBhcmFtc1xuICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2V0TWVzc2FnZUFyZWFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICBcbiAgICBjb21tYW5kU2V0TWVzc2FnZUFyZWE6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBcbiAgICAgICAgaWYgc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl1cbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQgPSBzY2VuZS5tZXNzYWdlQXJlYXNbbnVtYmVyXS5sYXlvdXRcbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC54ID0gQHBhcmFtcy5ib3gueFxuICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LnkgPSBAcGFyYW1zLmJveC55XG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3Qud2lkdGggPSBAcGFyYW1zLmJveC5zaXplLndpZHRoXG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QuaGVpZ2h0ID0gQHBhcmFtcy5ib3guc2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VGYWRpbmdcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZE1lc3NhZ2VGYWRpbmc6IC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZXNzYWdlRmFkaW5nID0gZHVyYXRpb246IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbiksIGFuaW1hdGlvbjogQHBhcmFtcy5hbmltYXRpb24sIGVhc2luZzogZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNZXNzYWdlU2V0dGluZ3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRNZXNzYWdlU2V0dGluZ3M6IC0+XG4gICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmICFtZXNzYWdlT2JqZWN0IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIG1lc3NhZ2VTZXR0aW5ncyA9IEBpbnRlcnByZXRlci5tZXNzYWdlU2V0dGluZ3MoKVxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmF1dG9FcmFzZSlcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy5hdXRvRXJhc2UgPSBAcGFyYW1zLmF1dG9FcmFzZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy53YWl0QXRFbmQpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3Mud2FpdEF0RW5kID0gQHBhcmFtcy53YWl0QXRFbmRcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYmFja2xvZylcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy5iYWNrbG9nID0gQHBhcmFtcy5iYWNrbG9nXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZUhlaWdodClcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy5saW5lSGVpZ2h0ID0gQHBhcmFtcy5saW5lSGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZVNwYWNpbmcpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MubGluZVNwYWNpbmcgPSBAcGFyYW1zLmxpbmVTcGFjaW5nXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZVBhZGRpbmcpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MubGluZVBhZGRpbmcgPSBAcGFyYW1zLmxpbmVQYWRkaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnBhcmFncmFwaFNwYWNpbmcpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MucGFyYWdyYXBoU3BhY2luZyA9IEBwYXJhbXMucGFyYWdyYXBoU3BhY2luZ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy51c2VDaGFyYWN0ZXJDb2xvcilcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy51c2VDaGFyYWN0ZXJDb2xvciA9IEBwYXJhbXMudXNlQ2hhcmFjdGVyQ29sb3JcbiAgICAgICAgICAgIFxuICAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5taW5MaW5lSGVpZ2h0ID0gbWVzc2FnZVNldHRpbmdzLmxpbmVIZWlnaHQgPyAwXG4gICAgICAgIG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLmxpbmVTcGFjaW5nID0gbWVzc2FnZVNldHRpbmdzLmxpbmVTcGFjaW5nID8gbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIubGluZVNwYWNpbmdcbiAgICAgICAgbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIucGFkZGluZyA9IG1lc3NhZ2VTZXR0aW5ncy5saW5lUGFkZGluZyA/IG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLnBhZGRpbmdcbiAgICAgICAgXG4gICAgICAgIGZvbnROYW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZvbnQpIHRoZW4gQHBhcmFtcy5mb250IGVsc2UgbWVzc2FnZU9iamVjdC5mb250Lm5hbWVcbiAgICAgICAgZm9udFNpemUgPSBpZiAhaXNMb2NrZWQoZmxhZ3Muc2l6ZSkgdGhlbiBAcGFyYW1zLnNpemUgZWxzZSBtZXNzYWdlT2JqZWN0LmZvbnQuc2l6ZVxuICAgICAgICBmb250ID0gbWVzc2FnZU9iamVjdC5mb250XG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5mb250KSBvciAhaXNMb2NrZWQoZmxhZ3Muc2l6ZSlcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udCA9IG5ldyBGb250KGZvbnROYW1lLCBmb250U2l6ZSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYm9sZClcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5ib2xkID0gQHBhcmFtcy5ib2xkXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5pdGFsaWMpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuaXRhbGljID0gQHBhcmFtcy5pdGFsaWNcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNtYWxsQ2FwcylcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zbWFsbENhcHMgPSBAcGFyYW1zLnNtYWxsQ2Fwc1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MudW5kZXJsaW5lKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnVuZGVybGluZSA9IEBwYXJhbXMudW5kZXJsaW5lXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zdHJpa2VUaHJvdWdoKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnN0cmlrZVRocm91Z2ggPSBAcGFyYW1zLnN0cmlrZVRocm91Z2hcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmNvbG9yKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmNvbG9yID0gbmV3IENvbG9yKEBwYXJhbXMuY29sb3IpXG4gICAgICAgICAgICBcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmNvbG9yID0gaWYgZmxhZ3MuY29sb3I/IGFuZCAhaXNMb2NrZWQoZmxhZ3MuY29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMuY29sb3IpIGVsc2UgZm9udC5jb2xvclxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuYm9yZGVyID0gaWYgZmxhZ3Mub3V0bGluZT8gYW5kICFpc0xvY2tlZChmbGFncy5vdXRsaW5lKSB0aGVuIEBwYXJhbXMub3V0bGluZSBlbHNlIGZvbnQuYm9yZGVyXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5ib3JkZXJDb2xvciA9IGlmIGZsYWdzLm91dGxpbmVDb2xvcj8gYW5kICFpc0xvY2tlZChmbGFncy5vdXRsaW5lQ29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMub3V0bGluZUNvbG9yKSBlbHNlIG5ldyBDb2xvcihmb250LmJvcmRlckNvbG9yKVxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuYm9yZGVyU2l6ZSA9IGlmIGZsYWdzLm91dGxpbmVTaXplPyBhbmQgIWlzTG9ja2VkKGZsYWdzLm91dGxpbmVTaXplKSB0aGVuIChAcGFyYW1zLm91dGxpbmVTaXplID8gNCkgZWxzZSBmb250LmJvcmRlclNpemVcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnNoYWRvdyA9IGlmIGZsYWdzLnNoYWRvdz8gYW5kICFpc0xvY2tlZChmbGFncy5zaGFkb3cpdGhlbiBAcGFyYW1zLnNoYWRvdyBlbHNlIGZvbnQuc2hhZG93XG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zaGFkb3dDb2xvciA9IGlmIGZsYWdzLnNoYWRvd0NvbG9yPyBhbmQgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd0NvbG9yKSB0aGVuIG5ldyBDb2xvcihAcGFyYW1zLnNoYWRvd0NvbG9yKSBlbHNlIG5ldyBDb2xvcihmb250LnNoYWRvd0NvbG9yKVxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc2hhZG93T2Zmc2V0WCA9IGlmIGZsYWdzLnNoYWRvd09mZnNldFg/IGFuZCAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93T2Zmc2V0WCkgdGhlbiAoQHBhcmFtcy5zaGFkb3dPZmZzZXRYID8gMSkgZWxzZSBmb250LnNoYWRvd09mZnNldFhcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnNoYWRvd09mZnNldFkgPSBpZiBmbGFncy5zaGFkb3dPZmZzZXRZPyBhbmQgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFkpIHRoZW4gKEBwYXJhbXMuc2hhZG93T2Zmc2V0WSA/IDEpIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRZXG4gICAgICAgIFxuICAgICAgICBpZiBpc0xvY2tlZChmbGFncy5ib2xkKSB0aGVuIG1lc3NhZ2VPYmplY3QuZm9udC5ib2xkID0gZm9udC5ib2xkXG4gICAgICAgIGlmIGlzTG9ja2VkKGZsYWdzLml0YWxpYykgdGhlbiBtZXNzYWdlT2JqZWN0LmZvbnQuaXRhbGljID0gZm9udC5pdGFsaWNcbiAgICAgICAgaWYgaXNMb2NrZWQoZmxhZ3Muc21hbGxDYXBzKSB0aGVuIG1lc3NhZ2VPYmplY3QuZm9udC5zbWFsbENhcHMgPSBmb250LnNtYWxsQ2Fwc1xuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JlYXRlTWVzc2FnZUFyZWFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRDcmVhdGVNZXNzYWdlQXJlYTogLT5cbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBpZiAhc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl1cbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhID0gbmV3IGdzLk9iamVjdF9NZXNzYWdlQXJlYSgpXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQgPSB1aS5VSU1hbmFnZXIuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHR5cGU6IFwidWkuQ3VzdG9tR2FtZU1lc3NhZ2VcIiwgaWQ6IFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIrbnVtYmVyLCBwYXJhbXM6IHsgaWQ6IFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIrbnVtYmVyIH0sIG1lc3NhZ2VBcmVhKVxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubWVzc2FnZSA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIrbnVtYmVyK1wiX21lc3NhZ2VcIilcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLm1lc3NhZ2UuZG9tYWluID0gQHBhcmFtcy5udW1iZXJEb21haW5cbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmFkZE9iamVjdChtZXNzYWdlQXJlYS5sYXlvdXQpXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQuZHN0UmVjdC54ID0gQHBhcmFtcy5ib3gueFxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0LmRzdFJlY3QueSA9IEBwYXJhbXMuYm94LnlcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5kc3RSZWN0LndpZHRoID0gQHBhcmFtcy5ib3guc2l6ZS53aWR0aFxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0LmRzdFJlY3QuaGVpZ2h0ID0gQHBhcmFtcy5ib3guc2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl0gPSBtZXNzYWdlQXJlYVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlTWVzc2FnZUFyZWFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRFcmFzZU1lc3NhZ2VBcmVhOiAtPlxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlTWVzc2FnZUFyZWFEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIGFyZWEgPSBzY2VuZS5tZXNzYWdlQXJlYXNbbnVtYmVyXSBcbiAgICAgICAgYXJlYT8ubGF5b3V0LmRpc3Bvc2UoKVxuICAgICAgICBzY2VuZS5tZXNzYWdlQXJlYXNbbnVtYmVyXSA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNldFRhcmdldE1lc3NhZ2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRTZXRUYXJnZXRNZXNzYWdlOiAtPlxuICAgICAgICBtZXNzYWdlID0gQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKVxuICAgICAgICBtZXNzYWdlPy50ZXh0UmVuZGVyZXIuaXNXYWl0aW5nID0gZmFsc2VcbiAgICAgICAgbWVzc2FnZT8uYmVoYXZpb3IuaXNXYWl0aW5nID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICB0YXJnZXQgPSB7IHR5cGU6IEBwYXJhbXMudHlwZSwgaWQ6IG51bGwgfVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTGF5b3V0LWJhc2VkXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlkID0gQHBhcmFtcy5pZFxuICAgICAgICAgICAgd2hlbiAxICMgQ3VzdG9tXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5zZXR0aW5ncy5tZXNzYWdlLnRhcmdldCA9IHRhcmdldFxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5jbGVhclxuICAgICAgICAgICAgQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKT8uYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpPy52aXNpYmxlID0geWVzXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCYWNrbG9nVmlzaWJpbGl0eVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZEJhY2tsb2dWaXNpYmlsaXR5OiAtPlxuICAgICAgICBpZiBAcGFyYW1zLnZpc2libGUgXG4gICAgICAgICAgICBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nQm94XCIpXG4gICAgICAgICAgICBpZiBub3QgY29udHJvbD8gdGhlbiBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nXCIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNvbnRyb2w/XG4gICAgICAgICAgICAgICAgY29udHJvbC5kaXNwb3NlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHBhcmFtcy5iYWNrZ3JvdW5kVmlzaWJsZVxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY3JlYXRlQ29udHJvbCh0aGlzLCB7IGRlc2NyaXB0b3I6IFwidWkuTWVzc2FnZUJhY2tsb2dCb3hcIiB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY3JlYXRlQ29udHJvbCh0aGlzLCB7IGRlc2NyaXB0b3I6IFwidWkuTWVzc2FnZUJhY2tsb2dcIiB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nQm94XCIpXG4gICAgICAgICAgICBpZiBub3QgY29udHJvbD8gdGhlbiBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nXCIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRyb2w/LmRpc3Bvc2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VWaXNpYmlsaXR5XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRNZXNzYWdlVmlzaWJpbGl0eTogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5tZXNzYWdlQm94XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIG1lc3NhZ2UgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlPyBvciBAcGFyYW1zLnZpc2libGUgPT0gbWVzc2FnZS52aXNpYmxlIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnZpc2libGVcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgICAgICAgICAgbWVzc2FnZS5hbmltYXRvci5hcHBlYXIobWVzc2FnZS5kc3RSZWN0LngsIG1lc3NhZ2UuZHN0UmVjdC55LCBAcGFyYW1zLmFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uXG4gICAgICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZylcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgICAgICBtZXNzYWdlLmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIC0+IG1lc3NhZ2UudmlzaWJsZSA9IG5vKVxuICAgICAgICBtZXNzYWdlLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VCb3hWaXNpYmlsaXR5XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRNZXNzYWdlQm94VmlzaWJpbGl0eTogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5tZXNzYWdlQm94XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgbWVzc2FnZUJveCA9IEBpbnRlcnByZXRlci5tZXNzYWdlQm94T2JqZWN0KEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuaWQpKVxuICAgICAgICB2aXNpYmxlID0gQHBhcmFtcy52aXNpYmxlID09IDFcbiAgICAgICAgaWYgbm90IG1lc3NhZ2VCb3g/IG9yIHZpc2libGUgPT0gbWVzc2FnZUJveC52aXNpYmxlIHRoZW4gcmV0dXJuXG4gIFxuICAgICAgICBpZiBAcGFyYW1zLnZpc2libGVcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgICAgICAgICAgbWVzc2FnZUJveC5hbmltYXRvci5hcHBlYXIobWVzc2FnZUJveC5kc3RSZWN0LngsIG1lc3NhZ2VCb3guZHN0UmVjdC55LCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICAgICAgbWVzc2FnZUJveC5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAtPiBtZXNzYWdlQm94LnZpc2libGUgPSBubylcbiAgICAgICAgbWVzc2FnZUJveC51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRVSUFjY2Vzc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kVUlBY2Nlc3M6IC0+XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5nZW5lcmFsTWVudSlcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZW51QWNjZXNzID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuZ2VuZXJhbE1lbnUpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zYXZlTWVudSlcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5zYXZlTWVudUFjY2VzcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnNhdmVNZW51KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubG9hZE1lbnUpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubG9hZE1lbnVBY2Nlc3MgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5sb2FkTWVudSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmJhY2tsb2cpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MuYmFja2xvZ0FjY2VzcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLmJhY2tsb2cpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRVbmxvY2tDR1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgIFxuICAgIGNvbW1hbmRVbmxvY2tDRzogLT5cbiAgICAgICAgY2cgPSBSZWNvcmRNYW5hZ2VyLmNnR2FsbGVyeVtAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNnSWQpXVxuICAgICAgICBcbiAgICAgICAgaWYgY2c/XG4gICAgICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF0gPSB7IHVubG9ja2VkOiB5ZXMgfVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRNb3ZlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjb21tYW5kTDJETW92ZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyRE1vdGlvbkdyb3VwXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZEwyRE1vdGlvbkdyb3VwOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCBcbiAgICAgICAgaWYgbm90IGNoYXJhY3RlciBpbnN0YW5jZW9mIHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb25Hcm91cCA9IHsgbmFtZTogQHBhcmFtcy5kYXRhLm1vdGlvbkdyb3VwLCBsb29wOiBAcGFyYW1zLmxvb3AsIHBsYXlUeXBlOiBAcGFyYW1zLnBsYXlUeXBlIH1cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IEBwYXJhbXMubG9vcFxuICAgICAgICAgICAgbW90aW9ucyA9IGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zQnlHcm91cFtjaGFyYWN0ZXIubW90aW9uR3JvdXAubmFtZV1cbiAgICAgICAgICAgIGlmIG1vdGlvbnM/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IG1vdGlvbnMuc3VtIChtKSAtPiBtLmdldER1cmF0aW9uTVNlYygpIC8gMTYuNlxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRNb3Rpb25cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRMMkRNb3Rpb246IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubGl2ZTJkXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIHRoZW4gcmV0dXJuXG4gICAgICAgIGZhZGVJblRpbWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZUluVGltZSkgdGhlbiBAcGFyYW1zLmZhZGVJblRpbWUgZWxzZSBkZWZhdWx0cy5tb3Rpb25GYWRlSW5UaW1lXG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb24gPSB7IG5hbWU6IEBwYXJhbXMuZGF0YS5tb3Rpb24sIGZhZGVJblRpbWU6IGZhZGVJblRpbWUsIGxvb3A6IEBwYXJhbXMubG9vcCB9XG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb25Hcm91cCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCBAcGFyYW1zLmxvb3BcbiAgICAgICAgICAgIG1vdGlvbiA9IGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zW2NoYXJhY3Rlci5tb3Rpb24ubmFtZV1cbiAgICAgICAgICAgIGlmIG1vdGlvbj9cbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gbW90aW9uLmdldER1cmF0aW9uTVNlYygpIC8gMTYuNlxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRFeHByZXNzaW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRMMkRFeHByZXNzaW9uOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyIGluc3RhbmNlb2Ygdm4uT2JqZWN0X0xpdmUyRENoYXJhY3RlciB0aGVuIHJldHVyblxuICAgICAgICBmYWRlSW5UaW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZhZGVJblRpbWUpIHRoZW4gQHBhcmFtcy5mYWRlSW5UaW1lIGVsc2UgZGVmYXVsdHMuZXhwcmVzc2lvbkZhZGVJblRpbWVcbiAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci5leHByZXNzaW9uID0geyBuYW1lOiBAcGFyYW1zLmRhdGEuZXhwcmVzc2lvbiwgZmFkZUluVGltZTogZmFkZUluVGltZSB9XG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRFeGl0U2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRMMkRFeGl0U2NlbmU6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubGl2ZTJkXG4gICAgICAgIEBpbnRlcnByZXRlci5jb21tYW5kQ2hhcmFjdGVyRXhpdFNjZW5lLmNhbGwodGhpcywgZGVmYXVsdHMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyRFNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRMMkRTZXR0aW5nczogLT5cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/LnZpc3VhbC5sMmRPYmplY3QgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGlwU3luY1NlbnNpdGl2aXR5KVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QubGlwU3luY1NlbnNpdGl2aXR5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5saXBTeW5jU2Vuc2l0aXZpdHkpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5pZGxlSW50ZW5zaXR5KSAgICBcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmlkbGVJbnRlbnNpdHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmlkbGVJbnRlbnNpdHkpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5icmVhdGhJbnRlbnNpdHkpXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5icmVhdGhJbnRlbnNpdHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJyZWF0aEludGVuc2l0eSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsuZW5hYmxlZFwiXSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmV5ZUJsaW5rLmVuYWJsZWQgPSBAcGFyYW1zLmV5ZUJsaW5rLmVuYWJsZWRcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsuaW50ZXJ2YWxcIl0pXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5leWVCbGluay5ibGlua0ludGVydmFsTXNlYyA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZXllQmxpbmsuaW50ZXJ2YWwpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLmNsb3NlZE1vdGlvblRpbWVcIl0pXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5leWVCbGluay5jbG9zZWRNb3Rpb25Nc2VjID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5leWVCbGluay5jbG9zZWRNb3Rpb25UaW1lKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJleWVCbGluay5jbG9zaW5nTW90aW9uVGltZVwiXSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmV5ZUJsaW5rLmNsb3NpbmdNb3Rpb25Nc2VjID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5leWVCbGluay5jbG9zaW5nTW90aW9uVGltZSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsub3BlbmluZ01vdGlvblRpbWVcIl0pXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5leWVCbGluay5vcGVuaW5nTW90aW9uTXNlYyA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZXllQmxpbmsub3BlbmluZ01vdGlvblRpbWUpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRQYXJhbWV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZEwyRFBhcmFtZXRlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBjaGFyYWN0ZXIuYW5pbWF0b3IubDJkUGFyYW1ldGVyVG8oQHBhcmFtcy5wYXJhbS5uYW1lLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBhcmFtLnZhbHVlKSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJERGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZEwyRERlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm1vdGlvbkZhZGVJblRpbWUpIHRoZW4gZGVmYXVsdHMubW90aW9uRmFkZUluVGltZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubW90aW9uRmFkZUluVGltZSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyREpvaW5TY2VuZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRMMkRKb2luU2NlbmU6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubGl2ZTJkXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgcmVjb3JkID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW0BpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXVxuICAgICAgICByZXR1cm4gaWYgIXJlY29yZCBvciBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSAtPiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gcmVjb3JkLmluZGV4XG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAxXG4gICAgICAgICAgICB4ID0gQHBhcmFtcy5wb3NpdGlvbi54XG4gICAgICAgICAgICB5ID0gQHBhcmFtcy5wb3NpdGlvbi55XG4gICAgICAgIGVsc2UgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMlxuICAgICAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG4gICAgICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgbW90aW9uQmx1ciA9IGlmICFpc0xvY2tlZChmbGFnc1tcIm1vdGlvbkJsdXIuZW5hYmxlZFwiXSkgdGhlbiBAcGFyYW1zLm1vdGlvbkJsdXIgZWxzZSBkZWZhdWx0cy5tb3Rpb25CbHVyXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcblxuICAgICAgICBjaGFyYWN0ZXIgPSBuZXcgdm4uT2JqZWN0X0xpdmUyRENoYXJhY3RlcihyZWNvcmQpXG4gICAgICAgIGNoYXJhY3Rlci5tb2RlbE5hbWUgPSBAcGFyYW1zLm1vZGVsPy5uYW1lIHx8IFwiXCJcbiAgICAgICAgY2hhcmFjdGVyLm1vZGVsID0gUmVzb3VyY2VNYW5hZ2VyLmdldExpdmUyRE1vZGVsKFwiTGl2ZTJELyN7Y2hhcmFjdGVyLm1vZGVsTmFtZX1cIilcbiAgICAgICAgY2hhcmFjdGVyLm1vdGlvbiA9IHsgbmFtZTogXCJcIiwgZmFkZUluVGltZTogMCwgbG9vcDogdHJ1ZSB9IGlmIGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zXG4gICAgICAgICNjaGFyYWN0ZXIuZXhwcmVzc2lvbiA9IHsgbmFtZTogT2JqZWN0LmtleXMoY2hhcmFjdGVyLm1vZGVsLmV4cHJlc3Npb25zKVswXSwgZmFkZUluVGltZTogMCB9IGlmIGNoYXJhY3Rlci5tb2RlbC5leHByZXNzaW9uc1xuICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC54ID0geFxuICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC55ID0geVxuICAgICAgICBjaGFyYWN0ZXIuYW5jaG9yLnggPSBpZiAhb3JpZ2luIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICBjaGFyYWN0ZXIuYW5jaG9yLnkgPSBpZiAhb3JpZ2luIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyLmJsZW5kTW9kZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYmxlbmRNb2RlKVxuICAgICAgICBjaGFyYWN0ZXIuem9vbS54ID0gQHBhcmFtcy5wb3NpdGlvbi56b29tLmRcbiAgICAgICAgY2hhcmFjdGVyLnpvb20ueSA9IEBwYXJhbXMucG9zaXRpb24uem9vbS5kXG4gICAgICAgIGNoYXJhY3Rlci56SW5kZXggPSB6SW5kZXggfHwgMjAwXG4gICAgICAgIGNoYXJhY3Rlci5tb2RlbD8ucmVzZXQoKVxuICAgICAgICBjaGFyYWN0ZXIuc2V0dXAoKVxuICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5pZGxlSW50ZW5zaXR5ID0gcmVjb3JkLmlkbGVJbnRlbnNpdHkgPyAxLjBcbiAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuYnJlYXRoSW50ZW5zaXR5ID0gcmVjb3JkLmJyZWF0aEludGVuc2l0eSA/IDEuMCBcbiAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QubGlwU3luY1NlbnNpdGl2aXR5ID0gcmVjb3JkLmxpcFN5bmNTZW5zaXRpdml0eSA/IDEuMFxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBjaGFyYWN0ZXIsIEBwYXJhbXMpXG4gICAgICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC55ID0gcC55XG4gICAgICAgIFxuICAgICAgICBzY2VuZS5iZWhhdmlvci5hZGRDaGFyYWN0ZXIoY2hhcmFjdGVyLCBubywgeyBhbmltYXRpb246IGFuaW1hdGlvbiwgZHVyYXRpb246IGR1cmF0aW9uLCBlYXNpbmc6IGVhc2luZywgbW90aW9uQmx1cjogbW90aW9uQmx1cn0pXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwidWlcIlxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJKb2luU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVySm9pblNjZW5lOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tAcGFyYW1zLmNoYXJhY3RlcklkXVxuICAgICAgICByZXR1cm4gaWYgIXJlY29yZCBvciBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSAtPiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gcmVjb3JkLmluZGV4IGFuZCAhdi5kaXNwb3NlZFxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyID0gbmV3IHZuLk9iamVjdF9DaGFyYWN0ZXIocmVjb3JkLCBudWxsLCBzY2VuZSlcbiAgICAgICAgY2hhcmFjdGVyLmV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW0BwYXJhbXMuZXhwcmVzc2lvbklkID8gcmVjb3JkLmRlZmF1bHRFeHByZXNzaW9uSWR8fDBdICNjaGFyYWN0ZXIuZXhwcmVzc2lvblxuICAgICAgICBpZiBjaGFyYWN0ZXIuZXhwcmVzc2lvbj9cbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9DaGFyYWN0ZXJzLyN7Y2hhcmFjdGVyLmV4cHJlc3Npb24uaWRsZVswXT8ucmVzb3VyY2UubmFtZX1cIilcbiAgICAgICAgXG4gICAgICAgIG1pcnJvciA9IG5vXG4gICAgICAgIGFuZ2xlID0gMFxuICAgICAgICB6b29tID0gMVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMVxuICAgICAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG4gICAgICAgICAgICBtaXJyb3IgPSBAcGFyYW1zLnBvc2l0aW9uLmhvcml6b250YWxGbGlwXG4gICAgICAgICAgICBhbmdsZSA9IEBwYXJhbXMucG9zaXRpb24uYW5nbGV8fDBcbiAgICAgICAgICAgIHpvb20gPSBAcGFyYW1zLnBvc2l0aW9uLmRhdGE/Lnpvb20gfHwgMVxuICAgICAgICBlbHNlIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDJcbiAgICAgICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICAgICAgbWlycm9yID0gbm9cbiAgICAgICAgICAgIGFuZ2xlID0gMFxuICAgICAgICAgICAgem9vbSA9IDFcbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgbW90aW9uQmx1ciA9IGlmICFpc0xvY2tlZChmbGFnc1tcIm1vdGlvbkJsdXIuZW5hYmxlZFwiXSkgdGhlbiBAcGFyYW1zLm1vdGlvbkJsdXIgZWxzZSBkZWZhdWx0cy5tb3Rpb25CbHVyXG4gICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIGNoYXJhY3Rlci5leHByZXNzaW9uP1xuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3tjaGFyYWN0ZXIuZXhwcmVzc2lvbi5pZGxlWzBdPy5yZXNvdXJjZS5uYW1lfVwiKVxuICAgICAgICAgICAgaWYgQHBhcmFtcy5vcmlnaW4gPT0gMSBhbmQgYml0bWFwP1xuICAgICAgICAgICAgICAgIHggKz0gKGJpdG1hcC53aWR0aCp6b29tLWJpdG1hcC53aWR0aCkvMlxuICAgICAgICAgICAgICAgIHkgKz0gKGJpdG1hcC5oZWlnaHQqem9vbS1iaXRtYXAuaGVpZ2h0KS8yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGNoYXJhY3Rlci5taXJyb3IgPSBtaXJyb3JcbiAgICAgICAgY2hhcmFjdGVyLmFuY2hvci54ID0gaWYgIW9yaWdpbiB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgY2hhcmFjdGVyLmFuY2hvci55ID0gaWYgIW9yaWdpbiB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgY2hhcmFjdGVyLnpvb20ueCA9IHpvb21cbiAgICAgICAgY2hhcmFjdGVyLnpvb20ueSA9IHpvb21cbiAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueCA9IHhcbiAgICAgICAgY2hhcmFjdGVyLmRzdFJlY3QueSA9IHlcbiAgICAgICAgY2hhcmFjdGVyLnpJbmRleCA9IHpJbmRleCB8fCAgMjAwXG4gICAgICAgIGNoYXJhY3Rlci5ibGVuZE1vZGUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJsZW5kTW9kZSlcbiAgICAgICAgY2hhcmFjdGVyLmFuZ2xlID0gYW5nbGVcbiAgICAgICAgY2hhcmFjdGVyLnNldHVwKClcbiAgICAgICAgY2hhcmFjdGVyLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBjaGFyYWN0ZXIsIEBwYXJhbXMpXG4gICAgICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC55ID0gcC55XG4gICAgICAgIFxuICAgICAgICBzY2VuZS5iZWhhdmlvci5hZGRDaGFyYWN0ZXIoY2hhcmFjdGVyLCBubywgeyBhbmltYXRpb246IGFuaW1hdGlvbiwgZHVyYXRpb246IGR1cmF0aW9uLCBlYXNpbmc6IGVhc2luZywgbW90aW9uQmx1cjogbW90aW9uQmx1cn0pXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwidWlcIlxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJFeGl0U2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyRXhpdFNjZW5lOiAoZGVmYXVsdHMpIC0+XG4gICAgICAgIGRlZmF1bHRzID0gZGVmYXVsdHMgfHwgR2FtZU1hbmFnZXIuZGVmYXVsdHMuY2hhcmFjdGVyXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBzY2VuZS5iZWhhdmlvci5yZW1vdmVDaGFyYWN0ZXIoY2hhcmFjdGVyLCB7IGFuaW1hdGlvbjogYW5pbWF0aW9uLCBkdXJhdGlvbjogZHVyYXRpb24sIGVhc2luZzogZWFzaW5nfSkgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyQ2hhbmdlRXhwcmVzc2lvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZENoYXJhY3RlckNoYW5nZUV4cHJlc3Npb246IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZXhwcmVzc2lvbkR1cmF0aW9uXG4gICAgICAgIGV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW0BwYXJhbXMuZXhwcmVzc2lvbklkIHx8IDBdXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuY2hhbmdlRWFzaW5nKVxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmNoYW5nZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyLmJlaGF2aW9yLmNoYW5nZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgQHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlclNldFBhcmFtZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyU2V0UGFyYW1ldGVyOiAtPlxuICAgICAgICBwYXJhbXMgPSBHYW1lTWFuYWdlci5jaGFyYWN0ZXJQYXJhbXNbQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZCldXG4gICAgICAgIGlmIG5vdCBwYXJhbXM/IG9yIG5vdCBAcGFyYW1zLnBhcmFtPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgPiAwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IGlmIHZhbHVlIHRoZW4gMSBlbHNlIDBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKSAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gaWYgdmFsdWUgdGhlbiBcIk9OXCIgZWxzZSBcIk9GRlwiXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IHZhbHVlLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpID09IFwiT05cIlxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckdldFBhcmFtZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kQ2hhcmFjdGVyR2V0UGFyYW1ldGVyOiAtPlxuICAgICAgICBwYXJhbXMgPSBHYW1lTWFuYWdlci5jaGFyYWN0ZXJQYXJhbXNbQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZCldXG4gICAgICAgIGlmIG5vdCBwYXJhbXM/IG9yIG5vdCBAcGFyYW1zLnBhcmFtPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgdmFsdWUgPSBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXIgVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgaWYgdmFsdWUgdGhlbiAxIGVsc2UgMClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgaWYgdmFsdWU/IHRoZW4gdmFsdWUubGVuZ3RoIGVsc2UgMClcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaCBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUgPiAwKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlID09IFwiT05cIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlPyB0aGVuIHZhbHVlLnRvU3RyaW5nKCkgZWxzZSBcIlwiKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlIHRoZW4gXCJPTlwiIGVsc2UgXCJPRkZcIilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyTW90aW9uQmx1clxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRDaGFyYWN0ZXJNb3Rpb25CbHVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuXG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb25CbHVyLnNldChAcGFyYW1zLm1vdGlvbkJsdXIpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckRlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRDaGFyYWN0ZXJEZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXJcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5leHByZXNzaW9uRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZXhwcmVzc2lvbkR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmV4cHJlc3Npb25EdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkJsdXIgPSBAcGFyYW1zLm1vdGlvbkJsdXJcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckVmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRDaGFyYWN0ZXJFZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAoYykgLT4gIWMuZGlzcG9zZWQgYW5kIGMucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaENoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRGbGFzaENoYXJhY3RlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIHJldHVybiBpZiBub3QgY2hhcmFjdGVyXG4gICAgICAgIFxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgY2hhcmFjdGVyLmFuaW1hdG9yLmZsYXNoKG5ldyBDb2xvcihAcGFyYW1zLmNvbG9yKSwgZHVyYXRpb24pXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRUaW50Q2hhcmFjdGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kVGludENoYXJhY3RlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpXG4gICAgICAgIHJldHVybiBpZiBub3QgY2hhcmFjdGVyXG4gICAgICAgIFxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgY2hhcmFjdGVyLmFuaW1hdG9yLnRpbnRUbyhAcGFyYW1zLnRvbmUsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kWm9vbUNoYXJhY3RlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgICAgICBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci56b29tT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlQ2hhcmFjdGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRSb3RhdGVDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkICAgICAgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCbGVuZENoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZENoYXJhY3RlcjogLT5cbiAgICAgICAgY2hhcmFjdGVyID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkICAgICAgXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QoY2hhcmFjdGVyLCBAcGFyYW1zKSBcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaGFrZUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaGFrZUNoYXJhY3RlcjogLT4gXG4gICAgICAgIGNoYXJhY3RlciA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgICAgICBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgQGludGVycHJldGVyLnNoYWtlT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcykgIFxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWFza0NoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNYXNrQ2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCAgICAgIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QoY2hhcmFjdGVyLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTW92ZUNoYXJhY3RlcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWQgICAgICBcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcy5wb3NpdGlvbiwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVDaGFyYWN0ZXJQYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1vdmVDaGFyYWN0ZXJQYXRoOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZCAgICAgIFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3RQYXRoKGNoYXJhY3RlciwgQHBhcmFtcy5wYXRoLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hha2VCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRTaGFrZUJhY2tncm91bmQ6IC0+IFxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5zaGFrZU9iamVjdChiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGhvcml6b250YWxTcGVlZCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuaG9yaXpvbnRhbFNwZWVkKVxuICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52ZXJ0aWNhbFNwZWVkKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KVxuICAgICAgICBsYXllciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgXG4gICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXT8uYW5pbWF0b3IubW92ZShob3Jpem9udGFsU3BlZWQsIHZlcnRpY2FsU3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kVG9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kVG86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5iYWNrZ3JvdW5kLmxvY2F0aW9uLngpXG4gICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJhY2tncm91bmQubG9jYXRpb24ueSlcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dClcbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdXG4gICAgICAgIGlmICFiYWNrZ3JvdW5kIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgICAgIHggPSBwLnhcbiAgICAgICAgICAgIHkgPSBwLnlcbiAgICAgXG4gICAgICAgIGJhY2tncm91bmQuYW5pbWF0b3IubW92ZVRvKHgsIHksIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kUGF0aFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kUGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuICAgICAgICByZXR1cm4gdW5sZXNzIGJhY2tncm91bmQ/XG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdFBhdGgoYmFja2dyb3VuZCwgQHBhcmFtcy5wYXRoLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWFza0JhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTWFza0JhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgcmV0dXJuIHVubGVzcyBiYWNrZ3JvdW5kP1xuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRab29tQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kWm9vbUJhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56b29taW5nLngpXG4gICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpvb21pbmcueSlcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dClcbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdPy5hbmltYXRvci56b29tVG8oeCAvIDEwMCwgeSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZUJhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFJvdGF0ZUJhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgXG4gICAgICAgIGlmIGJhY2tncm91bmRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5yb3RhdGVPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgICAgIFxuICAgICMjIyogICAgICAgIFxuICAgICogQG1ldGhvZCBjb21tYW5kVGludEJhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kVGludEJhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGJhY2tncm91bmQuYW5pbWF0b3IudGludFRvKEBwYXJhbXMudG9uZSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmxlbmRCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEJsZW5kQmFja2dyb3VuZDogLT5cbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5ibGVuZE9iamVjdChiYWNrZ3JvdW5kLCBAcGFyYW1zKSBcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCYWNrZ3JvdW5kRWZmZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kQmFja2dyb3VuZEVmZmVjdDogLT5cbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5vYmplY3RFZmZlY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJhY2tncm91bmREZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRCYWNrZ3JvdW5kRGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYmFja2dyb3VuZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmVhc2luZyA9IEBwYXJhbXMuZWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFuaW1hdGlvbiA9IEBwYXJhbXMuYW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gZGVmYXVsdHMub3JpZ2luID0gQHBhcmFtcy5vcmlnaW5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxvb3BIb3Jpem9udGFsKSB0aGVuIGRlZmF1bHRzLmxvb3BIb3Jpem9udGFsID0gQHBhcmFtcy5sb29wSG9yaXpvbnRhbFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubG9vcFZlcnRpY2FsKSB0aGVuIGRlZmF1bHRzLmxvb3BWZXJ0aWNhbCA9IEBwYXJhbXMubG9vcFZlcnRpY2FsXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmFja2dyb3VuZE1vdGlvbkJsdXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRCYWNrZ3JvdW5kTW90aW9uQmx1cjogLT5cbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGJhY2tncm91bmQubW90aW9uQmx1ci5zZXQoQHBhcmFtcy5tb3Rpb25CbHVyKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kQ2hhbmdlQmFja2dyb3VuZDogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5iYWNrZ3JvdW5kXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmR1cmF0aW9uXG4gICAgICAgIGxvb3BIID0gaWYgIWlzTG9ja2VkKGZsYWdzLmxvb3BIb3Jpem9udGFsKSB0aGVuIEBwYXJhbXMubG9vcEhvcml6b250YWwgZWxzZSBkZWZhdWx0cy5sb29wSG9yaXpvbnRhbFxuICAgICAgICBsb29wViA9IGlmICFpc0xvY2tlZChmbGFncy5sb29wVmVydGljYWwpIHRoZW4gQHBhcmFtcy5sb29wVmVydGljYWwgZWxzZSBkZWZhdWx0cy5sb29wVmVydGljYWxcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hbmltYXRpb25cbiAgICAgICAgb3JpZ2luID0gaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBAcGFyYW1zLm9yaWdpbiBlbHNlIGRlZmF1bHRzLm9yaWdpblxuICAgICAgICB6SW5kZXggPSBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKSBlbHNlIGRlZmF1bHRzLnpPcmRlclxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiAgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5lYXNpbmcpXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlQmFja2dyb3VuZChAcGFyYW1zLmdyYXBoaWMsIG5vLCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIDAsIDAsIGxheWVyLCBsb29wSCwgbG9vcFYpXG4gICAgICAgIFxuICAgICAgICBpZiBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJ1aVwiXG4gICAgICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcbiAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5hbmNob3IueCA9IGlmIG9yaWdpbiA9PSAwIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uekluZGV4ID0gekluZGV4ICsgbGF5ZXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3JpZ2luID09IDFcbiAgICAgICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC54ID0gc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmRzdFJlY3QueCMgKyBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYml0bWFwLndpZHRoLzJcbiAgICAgICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC55ID0gc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmRzdFJlY3QueSMgKyBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYml0bWFwLmhlaWdodC8yXG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uc2V0dXAoKVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLnVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2FsbFNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgXG4gICAgY29tbWFuZENhbGxTY2VuZTogLT5cbiAgICAgICAgQGludGVycHJldGVyLmNhbGxTY2VuZShAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNjZW5lLnVpZCB8fCBAcGFyYW1zLnNjZW5lKSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kQ2hhbmdlU2NlbmU6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBcbiAgICAgICAgaWYgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuY2xlYXIoKVxuICAgICAgICAgICAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGlmICFAcGFyYW1zLmVyYXNlUGljdHVyZXMgYW5kICFAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgc2NlbmUucmVtb3ZlT2JqZWN0KHNjZW5lLnBpY3R1cmVDb250YWluZXIpXG4gICAgICAgICAgICBmb3IgcGljdHVyZSBpbiBzY2VuZS5waWN0dXJlc1xuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5jb250ZXh0LnJlbW92ZShcIkdyYXBoaWNzL1BpY3R1cmVzLyN7cGljdHVyZS5pbWFnZX1cIikgaWYgcGljdHVyZVxuICAgICAgICBpZiAhQHBhcmFtcy5lcmFzZVRleHRzIGFuZCAhQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS50ZXh0Q29udGFpbmVyKVxuICAgICAgIyAgaWYgIUBwYXJhbXMuZXJhc2VNZXNzYWdlQXJlYXMgYW5kICFAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgIyAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS5tZXNzYWdlQXJlYUNvbnRhaW5lcilcbiAgICAgICMgIGlmICFAcGFyYW1zLmVyYXNlSG90c3BvdHMgYW5kICFAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgIyAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS5ob3RzcG90Q29udGFpbmVyKVxuICAgICAgICBpZiAhQHBhcmFtcy5lcmFzZVZpZGVvcyBhbmQgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICBzY2VuZS5yZW1vdmVPYmplY3Qoc2NlbmUudmlkZW9Db250YWluZXIpXG4gICAgICAgICAgICBmb3IgdmlkZW8gaW4gc2NlbmUudmlkZW9zXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQucmVtb3ZlKFwiTW92aWVzLyN7dmlkZW8udmlkZW99XCIpIGlmIHZpZGVvXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnNjZW5lXG4gICAgICAgICAgICBpZiBAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lRGF0YSA9IHVpZDogdWlkID0gQHBhcmFtcy5zY2VuZS51aWQsIHBpY3R1cmVzOiBbXSwgdGV4dHM6IFtdLCB2aWRlb3M6IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB1aWQ6IHVpZCA9IEBwYXJhbXMuc2NlbmUudWlkLCBcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZXM6IHNjZW5lLnBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLCBcbiAgICAgICAgICAgICAgICAgICAgdGV4dHM6IHNjZW5lLnRleHRDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLCBcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9zOiBzY2VuZS52aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAgICAgICAjICAgIG1lc3NhZ2VBcmVhczogc2NlbmUubWVzc2FnZUFyZWFDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgICAgICAjICAgaG90c3BvdHM6IHNjZW5lLmhvdHNwb3RDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgICAgIG5ld1NjZW5lID0gbmV3IHZuLk9iamVjdF9TY2VuZSgpXG4gICAgICAgICAgICBpZiBAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgICAgIG5ld1NjZW5lLnNjZW5lRGF0YSA9IHVpZDogdWlkID0gQHBhcmFtcy5zY2VuZS51aWQsIHBpY3R1cmVzOiBbXSwgdGV4dHM6IFtdLCB2aWRlb3M6IFtdLCBiYWNrbG9nOiBHYW1lTWFuYWdlci5iYWNrbG9nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3U2NlbmUuc2NlbmVEYXRhID0gdWlkOiB1aWQgPSBAcGFyYW1zLnNjZW5lLnVpZCwgcGljdHVyZXM6IHNjZW5lLnBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLCB0ZXh0czogc2NlbmUudGV4dENvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sIHZpZGVvczogc2NlbmUudmlkZW9Db250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXdTY2VuZSwgQHBhcmFtcy5zYXZlUHJldmlvdXMsID0+IEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBubylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG51bGwpXG4gICAgICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXR1cm5Ub1ByZXZpb3VzU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRSZXR1cm5Ub1ByZXZpb3VzU2NlbmU6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnJldHVyblRvUHJldmlvdXMoPT4gQGludGVycHJldGVyLmlzV2FpdGluZyA9IG5vKVxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTd2l0Y2hUb0xheW91dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kU3dpdGNoVG9MYXlvdXQ6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgdWkuVUlNYW5hZ2VyLmxheW91dHNbQHBhcmFtcy5sYXlvdXQubmFtZV0/XG4gICAgICAgICAgICBzY2VuZSA9IG5ldyBncy5PYmplY3RfTGF5b3V0KEBwYXJhbXMubGF5b3V0Lm5hbWUpXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIEBwYXJhbXMuc2F2ZVByZXZpb3VzLCA9PiBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm8pXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlVHJhbnNpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kQ2hhbmdlVHJhbnNpdGlvbjogLT5cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLmR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZ3JhcGhpYylcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci50cmFuc2l0aW9uRGF0YS5ncmFwaGljID0gQHBhcmFtcy5ncmFwaGljXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy52YWd1ZSlcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci50cmFuc2l0aW9uRGF0YS52YWd1ZSA9IEBwYXJhbXMudmFndWVcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRnJlZXplU2NyZWVuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZEZyZWV6ZVNjcmVlbjogLT4gXG4gICAgICAgIEdyYXBoaWNzLmZyZWV6ZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2NyZWVuVHJhbnNpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZFNjcmVlblRyYW5zaXRpb246IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuc2NlbmVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBncmFwaGljTmFtZSA9IGlmICFpc0xvY2tlZChmbGFncy5ncmFwaGljKSB0aGVuIEBwYXJhbXMuZ3JhcGhpYz8ubmFtZSBlbHNlIFNjZW5lTWFuYWdlci50cmFuc2l0aW9uRGF0YS5ncmFwaGljPy5uYW1lXG4gICAgICAgIFxuICAgICAgICBpZiBncmFwaGljTmFtZVxuICAgICAgICAgICAgYml0bWFwID0gaWYgIWlzTG9ja2VkKGZsYWdzLmdyYXBoaWMpIHRoZW4gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7Z3JhcGhpY05hbWV9XCIpIGVsc2UgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7Z3JhcGhpY05hbWV9XCIpXG4gICAgICAgIHZhZ3VlID0gaWYgIWlzTG9ja2VkKGZsYWdzLnZhZ3VlKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudmFndWUpIGVsc2UgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLnZhZ3VlXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEuZHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSAhR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlld1xuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEdyYXBoaWNzLnRyYW5zaXRpb24oZHVyYXRpb24sIGJpdG1hcCwgdmFndWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hha2VTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hha2VTY3JlZW46IC0+XG4gICAgICAgIGlmIG5vdCBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQ/IHRoZW4gcmV0dXJuICAgICAgICAgICAgICAgIFxuICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hha2VPYmplY3QoU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LCBAcGFyYW1zKSAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFRpbnRTY3JlZW46IC0+XG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5pbWF0b3IudGludFRvKG5ldyBUb25lKEBwYXJhbXMudG9uZSksIGR1cmF0aW9uLCBncy5FYXNpbmdzLkVBU0VfTElORUFSWzBdKVxuICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBkdXJhdGlvbiA+IDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFpvb21TY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNvbW1hbmRab29tU2NyZWVuOiAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmNob3IueCA9IDAuNVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5jaG9yLnkgPSAwLjVcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuaW1hdG9yLnpvb21UbyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpvb21pbmcueCkgLyAxMDAsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuem9vbWluZy55KSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihudWxsLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUGFuU2NyZWVuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgXG4gICAgY29tbWFuZFBhblNjcmVlbjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgQGludGVycHJldGVyLnNldHRpbmdzLnNjcmVlbi5wYW4ueCAtPSBAcGFyYW1zLnBvc2l0aW9uLnhcbiAgICAgICAgQGludGVycHJldGVyLnNldHRpbmdzLnNjcmVlbi5wYW4ueSAtPSBAcGFyYW1zLnBvc2l0aW9uLnlcbiAgICAgICAgdmlld3BvcnQgPSBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnRcblxuICAgICAgICB2aWV3cG9ydC5hbmltYXRvci5zY3JvbGxUbygtQHBhcmFtcy5wb3NpdGlvbi54ICsgdmlld3BvcnQuZHN0UmVjdC54LCAtQHBhcmFtcy5wb3NpdGlvbi55ICsgdmlld3BvcnQuZHN0UmVjdC55LCBkdXJhdGlvbiwgZWFzaW5nKSAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihudWxsLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSb3RhdGVTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFJvdGF0ZVNjcmVlbjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIHBhbiA9IEBpbnRlcnByZXRlci5zZXR0aW5ncy5zY3JlZW4ucGFuXG5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuY2hvci54ID0gMC41XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmNob3IueSA9IDAuNVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5pbWF0b3Iucm90YXRlKEBwYXJhbXMuZGlyZWN0aW9uLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNwZWVkKSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihudWxsLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRmxhc2hTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kRmxhc2hTY3JlZW46IC0+XG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5pbWF0b3IuZmxhc2gobmV3IENvbG9yKEBwYXJhbXMuY29sb3IpLCBkdXJhdGlvbiwgZ3MuRWFzaW5ncy5FQVNFX0xJTkVBUlswXSlcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIGR1cmF0aW9uICE9IDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNjcmVlbkVmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICBcbiAgICBjb21tYW5kU2NyZWVuRWZmZWN0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIFxuICAgICAgICBpZiAhZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSBcbiAgICAgICAgICAgIHpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB6T3JkZXIgPSBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuekluZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgdmlld3BvcnQgPSBzY2VuZS52aWV3cG9ydENvbnRhaW5lci5zdWJPYmplY3RzLmZpcnN0ICh2KSAtPiB2LnpJbmRleCA9PSB6T3JkZXJcbiAgICAgICAgXG4gICAgICAgIGlmICF2aWV3cG9ydFxuICAgICAgICAgICAgdmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KClcbiAgICAgICAgICAgIHZpZXdwb3J0LnpJbmRleCA9IHpPcmRlclxuICAgICAgICAgICAgc2NlbmUudmlld3BvcnRDb250YWluZXIuYWRkT2JqZWN0KHZpZXdwb3J0KVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgV29iYmxlXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuYW5pbWF0b3Iud29iYmxlVG8oQHBhcmFtcy53b2JibGUucG93ZXIgLyAxMDAwMCwgQHBhcmFtcy53b2JibGUuc3BlZWQgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgd29iYmxlID0gdmlld3BvcnQuZWZmZWN0cy53b2JibGVcbiAgICAgICAgICAgICAgICB3b2JibGUuZW5hYmxlZCA9IEBwYXJhbXMud29iYmxlLnBvd2VyID4gMFxuICAgICAgICAgICAgICAgIHdvYmJsZS52ZXJ0aWNhbCA9IEBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDAgb3IgQHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMlxuICAgICAgICAgICAgICAgIHdvYmJsZS5ob3Jpem9udGFsID0gQHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMSBvciBAcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAyXG4gICAgICAgICAgICB3aGVuIDEgIyBCbHVyXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuYW5pbWF0b3IuYmx1clRvKEBwYXJhbXMuYmx1ci5wb3dlciAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5lZmZlY3RzLmJsdXIuZW5hYmxlZCA9IHllc1xuICAgICAgICAgICAgd2hlbiAyICMgUGl4ZWxhdGVcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5hbmltYXRvci5waXhlbGF0ZVRvKEBwYXJhbXMucGl4ZWxhdGUuc2l6ZS53aWR0aCwgQHBhcmFtcy5waXhlbGF0ZS5zaXplLmhlaWdodCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5lZmZlY3RzLnBpeGVsYXRlLmVuYWJsZWQgPSB5ZXNcbiAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgZHVyYXRpb24gIT0gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVmlkZW9EZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kVmlkZW9EZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy52aWRlb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkJsdXIgPSBAcGFyYW1zLm1vdGlvbkJsdXJcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZFNob3dWaWRlbzogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy52aWRlb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW9zID0gc2NlbmUudmlkZW9zXG4gICAgICAgIGlmIG5vdCB2aWRlb3NbbnVtYmVyXT8gdGhlbiB2aWRlb3NbbnVtYmVyXSA9IG5ldyBncy5PYmplY3RfVmlkZW8oKVxuICAgICAgICBcbiAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgeSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICBcbiAgICAgICAgdmlkZW8gPSB2aWRlb3NbbnVtYmVyXVxuICAgICAgICB2aWRlby5kb21haW4gPSBAcGFyYW1zLm51bWJlckRvbWFpblxuICAgICAgICB2aWRlby52aWRlbyA9IEBwYXJhbXMudmlkZW8/Lm5hbWVcbiAgICAgICAgdmlkZW8ubG9vcCA9IEBwYXJhbXMubG9vcCA/IHllc1xuICAgICAgICB2aWRlby5kc3RSZWN0LnggPSB4XG4gICAgICAgIHZpZGVvLmRzdFJlY3QueSA9IHlcbiAgICAgICAgdmlkZW8uYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIHZpZGVvLmFuY2hvci54ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLnpJbmRleCA9IHpJbmRleCB8fCAgKDEwMDAgKyBudW1iZXIpXG4gICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJzY2VuZVwiXG4gICAgICAgICAgICB2aWRlby52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICB2aWRlby51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgdmlkZW8sIEBwYXJhbXMpXG4gICAgICAgICAgICB2aWRlby5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIHZpZGVvLmRzdFJlY3QueSA9IHAueVxuICAgICAgICAgICAgXG4gICAgICAgIHZpZGVvLmFuaW1hdG9yLmFwcGVhcih4LCB5LCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgXG4gICAgY29tbWFuZE1vdmVWaWRlbzogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlbyA9IHNjZW5lLnZpZGVvc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB2aWRlbz8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KHZpZGVvLCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVmlkZW9QYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZE1vdmVWaWRlb1BhdGg6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdFBhdGgodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSb3RhdGVWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kUm90YXRlVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRab29tVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuem9vbU9iamVjdCh2aWRlbywgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kVmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmxlbmRWaWRlbzogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICB2aWRlbyA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWRlb3NbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QodmlkZW8sIEBwYXJhbXMpIFxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kVGludFZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnRpbnRPYmplY3QodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRGbGFzaFZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLmZsYXNoT2JqZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JvcFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRDcm9wVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuY3JvcE9iamVjdCh2aWRlbywgQHBhcmFtcylcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdE1vdGlvbkJsdXIodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kTWFza1ZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QodmlkZW8sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRWaWRlb0VmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kVmlkZW9FZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZEVyYXNlVmlkZW86IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudmlkZW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgXG4gICAgICAgIHZpZGVvLmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIChzZW5kZXIpID0+IFxuICAgICAgICAgICAgc2VuZGVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgc2NlbmUudmlkZW9zW251bWJlcl0gPSBudWxsXG4gICAgICAgICAgIyAgc2VuZGVyLnZpZGVvLnBhdXNlKClcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvbiBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd0ltYWdlTWFwXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICBcbiAgICBjb21tYW5kU2hvd0ltYWdlTWFwOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgaW1hZ2VNYXAgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBpbWFnZU1hcD9cbiAgICAgICAgICAgIGltYWdlTWFwLmRpc3Bvc2UoKVxuICAgICAgICBpbWFnZU1hcCA9IG5ldyBncy5PYmplY3RfSW1hZ2VNYXAoKVxuICAgICAgICBpbWFnZU1hcC52aXN1YWwudmFyaWFibGVDb250ZXh0ID0gQGludGVycHJldGVyLmNvbnRleHRcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW251bWJlcl0gPSBpbWFnZU1hcFxuICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tAcGFyYW1zLmdyb3VuZD8ubmFtZX1cIilcbiAgICAgICAgXG4gICAgICAgIGltYWdlTWFwLmRzdFJlY3Qud2lkdGggPSBiaXRtYXAud2lkdGhcbiAgICAgICAgaW1hZ2VNYXAuZHN0UmVjdC5oZWlnaHQgPSBiaXRtYXAuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBpbWFnZU1hcCwgQHBhcmFtcylcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgaW1hZ2VNYXAuZHN0UmVjdC55ID0gcC55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5hbmNob3IueCA9IGlmIEBwYXJhbXMub3JpZ2luID09IDEgdGhlbiAwLjUgZWxzZSAwXG4gICAgICAgIGltYWdlTWFwLmFuY2hvci55ID0gaWYgQHBhcmFtcy5vcmlnaW4gPT0gMSB0aGVuIDAuNSBlbHNlIDBcbiAgICAgICAgaW1hZ2VNYXAuekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSA0MDBcbiAgICAgICAgaW1hZ2VNYXAuYmxlbmRNb2RlID0gaWYgIWlzTG9ja2VkKGZsYWdzLmJsZW5kTW9kZSkgdGhlbiBAcGFyYW1zLmJsZW5kTW9kZSBlbHNlIDBcbiAgICAgICAgaW1hZ2VNYXAuaG90c3BvdHMgPSBAcGFyYW1zLmhvdHNwb3RzXG4gICAgICAgIGltYWdlTWFwLmltYWdlcyA9IFtcbiAgICAgICAgICAgIEBwYXJhbXMuZ3JvdW5kPy5uYW1lLFxuICAgICAgICAgICAgQHBhcmFtcy5ob3Zlcj8ubmFtZSxcbiAgICAgICAgICAgIEBwYXJhbXMudW5zZWxlY3RlZD8ubmFtZSxcbiAgICAgICAgICAgIEBwYXJhbXMuc2VsZWN0ZWQ/Lm5hbWUsXG4gICAgICAgICAgICBAcGFyYW1zLnNlbGVjdGVkSG92ZXI/Lm5hbWVcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgaW1hZ2VNYXAuZXZlbnRzLm9uIFwianVtcFRvXCIsIGdzLkNhbGxCYWNrKFwib25KdW1wVG9cIiwgQGludGVycHJldGVyKVxuICAgICAgICBpbWFnZU1hcC5ldmVudHMub24gXCJjYWxsQ29tbW9uRXZlbnRcIiwgZ3MuQ2FsbEJhY2soXCJvbkNhbGxDb21tb25FdmVudFwiLCBAaW50ZXJwcmV0ZXIpXG4gICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5zZXR1cCgpXG4gICAgICAgIGltYWdlTWFwLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hvd09iamVjdChpbWFnZU1hcCwge3g6MCwgeTowfSwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb25cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5ldmVudHMub24gXCJmaW5pc2hcIiwgKHNlbmRlcikgPT5cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAjIEBpbnRlcnByZXRlci5lcmFzZU9iamVjdChzY2VuZS5pbWFnZU1hcCwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VJbWFnZU1hcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgICBcbiAgICBjb21tYW5kRXJhc2VJbWFnZU1hcDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIGltYWdlTWFwID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgaW1hZ2VNYXA/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpbWFnZU1hcC5ldmVudHMuZW1pdChcImZpbmlzaFwiLCBpbWFnZU1hcClcbiAgICAgICAgaW1hZ2VNYXAudmlzdWFsLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBpbnRlcnByZXRlci5lcmFzZU9iamVjdChpbWFnZU1hcCwgQHBhcmFtcywgKHNlbmRlcikgPT4gXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgICAgIHNjZW5lLnBpY3R1cmVzW251bWJlcl0gPSBudWxsXG4gICAgICAgIClcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEFkZEhvdHNwb3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICBcbiAgICBjb21tYW5kQWRkSG90c3BvdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIGhvdHNwb3RzID0gc2NlbmUuaG90c3BvdHNcbiAgICAgXG4gICAgICAgIGlmIG5vdCBob3RzcG90c1tudW1iZXJdP1xuICAgICAgICAgICAgaG90c3BvdHNbbnVtYmVyXSA9IG5ldyBncy5PYmplY3RfSG90c3BvdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgaG90c3BvdCA9IGhvdHNwb3RzW251bWJlcl1cbiAgICAgICAgaG90c3BvdC5kb21haW4gPSBAcGFyYW1zLm51bWJlckRvbWFpblxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMucG9zaXRpb25UeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBEaXJlY3RcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QueCA9IEBwYXJhbXMuYm94LnhcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QueSA9IEBwYXJhbXMuYm94LnlcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3Qud2lkdGggPSBAcGFyYW1zLmJveC5zaXplLndpZHRoXG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LmhlaWdodCA9IEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuIDEgIyBDYWxjdWxhdGVkXG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJveC54KVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC55ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ib3gueSlcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3Qud2lkdGggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJveC5zaXplLndpZHRoKVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC5oZWlnaHQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJveC5zaXplLmhlaWdodClcbiAgICAgICAgICAgIHdoZW4gMiAjIEJpbmQgdG8gUGljdHVyZVxuICAgICAgICAgICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBpY3R1cmVOdW1iZXIpXVxuICAgICAgICAgICAgICAgIGlmIHBpY3R1cmU/XG4gICAgICAgICAgICAgICAgICAgIGhvdHNwb3QudGFyZ2V0ID0gcGljdHVyZVxuICAgICAgICAgICAgd2hlbiAzICMgQmluZCB0byBUZXh0XG4gICAgICAgICAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGV4dE51bWJlcildXG4gICAgICAgICAgICAgICAgaWYgdGV4dD9cbiAgICAgICAgICAgICAgICAgICAgaG90c3BvdC50YXJnZXQgPSB0ZXh0XG4gICAgICAgIFxuICAgICAgICBob3RzcG90LmJlaGF2aW9yLnNoYXBlID0gQHBhcmFtcy5zaGFwZSA/IGdzLkhvdHNwb3RTaGFwZS5SRUNUQU5HTEUgXG4gICAgICAgIFxuICAgICAgICBpZiB0ZXh0P1xuICAgICAgICAgICAgaG90c3BvdC5pbWFnZXMgPSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2VzID0gW1xuICAgICAgICAgICAgICAgIEBwYXJhbXMuYmFzZUdyYXBoaWM/Lm5hbWUgfHwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5iYXNlR3JhcGhpYykgfHwgcGljdHVyZT8uaW1hZ2UsXG4gICAgICAgICAgICAgICAgQHBhcmFtcy5ob3ZlckdyYXBoaWM/Lm5hbWUgfHwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5ob3ZlckdyYXBoaWMpLFxuICAgICAgICAgICAgICAgIEBwYXJhbXMuc2VsZWN0ZWRHcmFwaGljPy5uYW1lIHx8IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc2VsZWN0ZWRHcmFwaGljKSxcbiAgICAgICAgICAgICAgICBAcGFyYW1zLnNlbGVjdGVkSG92ZXJHcmFwaGljPy5uYW1lIHx8IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc2VsZWN0ZWRIb3ZlckdyYXBoaWMpLFxuICAgICAgICAgICAgICAgIEBwYXJhbXMudW5zZWxlY3RlZEdyYXBoaWM/Lm5hbWUgfHwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy51bnNlbGVjdGVkR3JhcGhpYylcbiAgICAgICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25DbGljay50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uQ2xpY2subGFiZWwgICAgICAgIFxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJjbGlja1wiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdENsaWNrXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uQ2xpY2suYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25FbnRlci50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uRW50ZXIubGFiZWwgICAgICAgIFxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJlbnRlclwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdEVudGVyXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRW50ZXIuYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25MZWF2ZS50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uTGVhdmUubGFiZWwgICAgICAgIFxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJsZWF2ZVwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdExlYXZlXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uTGVhdmUuYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25EcmFnLnR5cGUgIT0gMCBvciBAcGFyYW1zLmFjdGlvbnMub25EcmFnLmxhYmVsICAgICAgICBcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwiZHJhZ1N0YXJ0XCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RHJhZ1N0YXJ0XCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy5iaW5kVmFsdWUpIH0pXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImRyYWdcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3REcmFnXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy5iaW5kVmFsdWUpIH0pXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImRyYWdFbmRcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3REcmFnRW5kXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy5iaW5kVmFsdWUpIH0pXG4gICAgICAgIGlmIEBwYXJhbXMuYWN0aW9ucy5vblNlbGVjdC50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uU2VsZWN0LmxhYmVsIG9yXG4gICAgICAgICAgIEBwYXJhbXMuYWN0aW9ucy5vbkRlc2VsZWN0LnR5cGUgIT0gMCBvciBAcGFyYW1zLmFjdGlvbnMub25EZXNlbGVjdC5sYWJlbCAgICBcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwic3RhdGVDaGFuZ2VkXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90U3RhdGVDaGFuZ2VkXCIsIEBpbnRlcnByZXRlciwgQHBhcmFtcylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaG90c3BvdC5zZWxlY3RhYmxlID0geWVzXG4gICAgICAgIGhvdHNwb3Quc2V0dXAoKVxuXG4gICAgICAgIGlmIEBwYXJhbXMuZHJhZ2dpbmcuZW5hYmxlZFxuICAgICAgICAgICAgZHJhZ2dpbmcgPSBAcGFyYW1zLmRyYWdnaW5nXG4gICAgICAgICAgICBob3RzcG90LmRyYWdnYWJsZSA9IHsgXG4gICAgICAgICAgICAgICAgcmVjdDogbmV3IFJlY3QoZHJhZ2dpbmcucmVjdC54LCBkcmFnZ2luZy5yZWN0LnksIGRyYWdnaW5nLnJlY3Quc2l6ZS53aWR0aCwgZHJhZ2dpbmcucmVjdC5zaXplLmhlaWdodCksIFxuICAgICAgICAgICAgICAgIGF4aXNYOiBkcmFnZ2luZy5ob3Jpem9udGFsLCBcbiAgICAgICAgICAgICAgICBheGlzWTogZHJhZ2dpbmcudmVydGljYWwgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob3RzcG90LmFkZENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0RyYWdnYWJsZSgpKVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnXCIsIChlKSA9PiBcbiAgICAgICAgICAgICAgICBkcmFnID0gZS5zZW5kZXIuZHJhZ2dhYmxlXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQGludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgaWYgQHBhcmFtcy5kcmFnZ2luZy5ob3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMuZHJhZ2dpbmcudmFyaWFibGUsIE1hdGgucm91bmQoKGUuc2VuZGVyLmRzdFJlY3QueC1kcmFnLnJlY3QueCkgLyAoZHJhZy5yZWN0LndpZHRoLWUuc2VuZGVyLmRzdFJlY3Qud2lkdGgpICogMTAwKSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMuZHJhZ2dpbmcudmFyaWFibGUsIE1hdGgucm91bmQoKGUuc2VuZGVyLmRzdFJlY3QueS1kcmFnLnJlY3QueSkgLyAoZHJhZy5yZWN0LmhlaWdodC1lLnNlbmRlci5kc3RSZWN0LmhlaWdodCkgKiAxMDApKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZUhvdHNwb3RTdGF0ZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRDaGFuZ2VIb3RzcG90U3RhdGU6IC0+XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIGhvdHNwb3QgPSBzY2VuZS5ob3RzcG90c1tudW1iZXJdXG4gICAgICAgIHJldHVybiBpZiAhaG90c3BvdFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNlbGVjdGVkKSB0aGVuIGhvdHNwb3QuYmVoYXZpb3Iuc2VsZWN0ZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zZWxlY3RlZClcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmVuYWJsZWQpIHRoZW4gaG90c3BvdC5iZWhhdmlvci5lbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuZW5hYmxlZClcbiAgICAgICAgXG4gICAgICAgIGhvdHNwb3QuYmVoYXZpb3IudXBkYXRlSW5wdXQoKVxuICAgICAgICBob3RzcG90LmJlaGF2aW9yLnVwZGF0ZUltYWdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VIb3RzcG90XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZEVyYXNlSG90c3BvdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIFxuICAgICAgICBpZiBzY2VuZS5ob3RzcG90c1tudW1iZXJdP1xuICAgICAgICAgICAgc2NlbmUuaG90c3BvdHNbbnVtYmVyXS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNjZW5lLmhvdHNwb3RDb250YWluZXIuZXJhc2VPYmplY3QobnVtYmVyKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZU9iamVjdERvbWFpblxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kQ2hhbmdlT2JqZWN0RG9tYWluOiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY2hhbmdlT2JqZWN0RG9tYWluKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuZG9tYWluKSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUGljdHVyZURlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgXG4gICAgY29tbWFuZFBpY3R1cmVEZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5waWN0dXJlXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmFwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmRpc2FwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gZGVmYXVsdHMubW90aW9uQmx1ciA9IEBwYXJhbXMubW90aW9uQmx1clxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG4gICAgXG4gICAgXG4gICAgY3JlYXRlUGljdHVyZTogKGdyYXBoaWMsIHBhcmFtcykgLT5cbiAgICAgICAgZ3JhcGhpYyA9IEBzdHJpbmdWYWx1ZU9mKGdyYXBoaWMpXG4gICAgICAgIGdyYXBoaWNOYW1lID0gaWYgZ3JhcGhpYz8ubmFtZT8gdGhlbiBncmFwaGljLm5hbWUgZWxzZSBncmFwaGljXG4gICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2dyYXBoaWNOYW1lfVwiKVxuICAgICAgICByZXR1cm4gbnVsbCBpZiBiaXRtYXAgJiYgIWJpdG1hcC5sb2FkZWRcbiAgICAgICAgXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgbnVtYmVyID0gQG51bWJlclZhbHVlT2YocGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZXMgPSBzY2VuZS5waWN0dXJlc1xuICAgICAgICBpZiBub3QgcGljdHVyZXNbbnVtYmVyXT9cbiAgICAgICAgICAgIHBpY3R1cmUgPSBuZXcgZ3MuT2JqZWN0X1BpY3R1cmUobnVsbCwgbnVsbCwgcGFyYW1zLnZpc3VhbD8udHlwZSlcbiAgICAgICAgICAgIHBpY3R1cmUuZG9tYWluID0gcGFyYW1zLm51bWJlckRvbWFpblxuICAgICAgICAgICAgcGljdHVyZXNbbnVtYmVyXSA9IHBpY3R1cmVcbiAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMudmlzdWFsPy50eXBlXG4gICAgICAgICAgICAgICAgd2hlbiAxXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0geWVzXG4gICAgICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZnJhbWVUaGlja25lc3MgPSBwYXJhbXMudmlzdWFsLmZyYW1lLnRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmZyYW1lQ29ybmVyU2l6ZSA9IHBhcmFtcy52aXN1YWwuZnJhbWUuY29ybmVyU2l6ZVxuICAgICAgICAgICAgICAgIHdoZW4gM1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnZpc3VhbC5vcmllbnRhdGlvbiA9IHBhcmFtcy52aXN1YWwudGhyZWVQYXJ0SW1hZ2Uub3JpZW50YXRpb25cbiAgICAgICAgICAgICAgICB3aGVuIDRcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5jb2xvciA9IGdzLkNvbG9yLmZyb21PYmplY3QocGFyYW1zLnZpc3VhbC5xdWFkLmNvbG9yKVxuICAgICAgICAgICAgICAgIHdoZW4gNVxuICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdCA9IEdyYXBoaWNzLnNuYXBzaG90KClcbiAgICAgICAgICAgICAgICAgICAgI1Jlc291cmNlTWFuYWdlci5hZGRDdXN0b21CaXRtYXAoc25hcHNob3QpXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuYml0bWFwID0gc25hcHNob3RcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LndpZHRoID0gc25hcHNob3Qud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LmhlaWdodCA9IHNuYXBzaG90LmhlaWdodFxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnNyY1JlY3Quc2V0KDAsIDAsIHNuYXBzaG90LndpZHRoLCBzbmFwc2hvdC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgeSA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICBwaWN0dXJlID0gcGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBcbiAgICAgICAgaWYgIXBpY3R1cmUuYml0bWFwXG4gICAgICAgICAgICBwaWN0dXJlLmltYWdlID0gZ3JhcGhpY05hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGljdHVyZS5pbWFnZSA9IG51bGxcbiAgICBcbiAgICAgICAgYml0bWFwID0gcGljdHVyZS5iaXRtYXAgPyBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tncmFwaGljTmFtZX1cIilcbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5lYXNpbmcudHlwZSksIHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgb3JpZ2luID0gaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQG51bWJlclZhbHVlT2YocGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgIFxuICAgICAgICBwaWN0dXJlLm1pcnJvciA9IHBhcmFtcy5wb3NpdGlvbi5ob3Jpem9udGFsRmxpcFxuICAgICAgICBwaWN0dXJlLmFuZ2xlID0gcGFyYW1zLnBvc2l0aW9uLmFuZ2xlIHx8IDBcbiAgICAgICAgcGljdHVyZS56b29tLnggPSAocGFyYW1zLnBvc2l0aW9uLmRhdGE/Lnpvb218fDEpXG4gICAgICAgIHBpY3R1cmUuem9vbS55ID0gKHBhcmFtcy5wb3NpdGlvbi5kYXRhPy56b29tfHwxKVxuICAgICAgICBwaWN0dXJlLmJsZW5kTW9kZSA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIFxuICAgICAgICBpZiBwYXJhbXMub3JpZ2luID09IDEgYW5kIGJpdG1hcD9cbiAgICAgICAgICAgIHggKz0gKGJpdG1hcC53aWR0aCpwaWN0dXJlLnpvb20ueC1iaXRtYXAud2lkdGgpLzJcbiAgICAgICAgICAgIHkgKz0gKGJpdG1hcC5oZWlnaHQqcGljdHVyZS56b29tLnktYml0bWFwLmhlaWdodCkvMlxuICAgICAgICAgICAgXG4gICAgICAgIHBpY3R1cmUuZHN0UmVjdC54ID0geFxuICAgICAgICBwaWN0dXJlLmRzdFJlY3QueSA9IHlcbiAgICAgICAgcGljdHVyZS5hbmNob3IueCA9IGlmIG9yaWdpbiA9PSAxIHRoZW4gMC41IGVsc2UgMFxuICAgICAgICBwaWN0dXJlLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDEgdGhlbiAwLjUgZWxzZSAwXG4gICAgICAgIHBpY3R1cmUuekluZGV4ID0gekluZGV4IHx8ICAoNzAwICsgbnVtYmVyKVxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwic2NlbmVcIlxuICAgICAgICAgICAgcGljdHVyZS52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICBcbiAgICAgICAgaWYgcGFyYW1zLnNpemU/LnR5cGUgPT0gMVxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LndpZHRoID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnNpemUud2lkdGgpXG4gICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QuaGVpZ2h0ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgXG4gICAgICAgIHBpY3R1cmUudXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBwaWN0dXJlXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd1BpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFNob3dQaWN0dXJlOiAtPiBcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5waWN0dXJlXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgcGljdHVyZSA9IEBpbnRlcnByZXRlci5jcmVhdGVQaWN0dXJlKEBwYXJhbXMuZ3JhcGhpYywgQHBhcmFtcylcbiAgICAgICAgaWYgIXBpY3R1cmVcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyLS1cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDFcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgcGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QueSA9IHAueVxuICAgICAgICAgICAgXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgXG4gICAgICAgIHBpY3R1cmUuYW5pbWF0b3IuYXBwZWFyKHBpY3R1cmUuZHN0UmVjdC54LCBwaWN0dXJlLmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBsYXlQaWN0dXJlQW5pbWF0aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRQbGF5UGljdHVyZUFuaW1hdGlvbjogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHBpY3R1cmUgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5hbmltYXRpb25JZD9cbiAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc1tAcGFyYW1zLmFuaW1hdGlvbklkXVxuICAgICAgICAgICAgaWYgcmVjb3JkP1xuICAgICAgICAgICAgICAgIHBpY3R1cmUgPSBAaW50ZXJwcmV0ZXIuY3JlYXRlUGljdHVyZShyZWNvcmQuZ3JhcGhpYywgQHBhcmFtcylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBwaWN0dXJlLmZpbmRDb21wb25lbnQoXCJDb21wb25lbnRfRnJhbWVBbmltYXRpb25cIilcbiAgICAgICAgICAgICAgICBpZiBjb21wb25lbnQ/XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5yZWZyZXNoKHJlY29yZClcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBncy5Db21wb25lbnRfRnJhbWVBbmltYXRpb24ocmVjb3JkKVxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmFkZENvbXBvbmVudChjb21wb25lbnQpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudC51cGRhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgcGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LnkgPSBwLnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGljdHVyZS5hbmltYXRvci5hcHBlYXIocGljdHVyZS5kc3RSZWN0LngsIHBpY3R1cmUuZHN0UmVjdC55LCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBpY3R1cmUgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gcGljdHVyZT8uZmluZENvbXBvbmVudChcIkNvbXBvbmVudF9GcmFtZUFuaW1hdGlvblwiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBhbmltYXRpb24/XG4gICAgICAgICAgICAgICAgcGljdHVyZS5yZW1vdmVDb21wb25lbnQoYW5pbWF0aW9uKVxuICAgICAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9BbmltYXRpb25zLyN7cGljdHVyZS5pbWFnZX1cIilcbiAgICAgICAgICAgICAgICBpZiBiaXRtYXA/XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuc3JjUmVjdC5zZXQoMCwgMCwgYml0bWFwLndpZHRoLCBiaXRtYXAuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3Qud2lkdGggPSBwaWN0dXJlLnNyY1JlY3Qud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LmhlaWdodCA9IHBpY3R1cmUuc3JjUmVjdC5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVQaWN0dXJlUGF0aFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmRNb3ZlUGljdHVyZVBhdGg6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0UGF0aChwaWN0dXJlLCBAcGFyYW1zLnBhdGgsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZE1vdmVQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdChwaWN0dXJlLCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICBcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRQaWN0dXJlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjb21tYW5kVGludFBpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLnRpbnRPYmplY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEZsYXNoUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kRmxhc2hQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5mbGFzaE9iamVjdChwaWN0dXJlLCBAcGFyYW1zKVxuICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDcm9wUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmRDcm9wUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuY3JvcE9iamVjdChwaWN0dXJlLCBAcGFyYW1zKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSb3RhdGVQaWN0dXJlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjb21tYW5kUm90YXRlUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRab29tUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgIFxuICAgIGNvbW1hbmRab29tUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuem9vbU9iamVjdChwaWN0dXJlLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZFBpY3R1cmU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIHBpY3R1cmUgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5ibGVuZE9iamVjdChwaWN0dXJlLCBAcGFyYW1zKSBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNoYWtlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaGFrZVBpY3R1cmU6IC0+IFxuICAgICAgICBwaWN0dXJlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hha2VPYmplY3QocGljdHVyZSwgQHBhcmFtcykgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNYXNrUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kTWFza1BpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUGljdHVyZU1vdGlvbkJsdXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICBcbiAgICBjb21tYW5kUGljdHVyZU1vdGlvbkJsdXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdE1vdGlvbkJsdXIocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBpY3R1cmVFZmZlY3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFBpY3R1cmVFZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdEVmZmVjdChwaWN0dXJlLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRFcmFzZVBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRXJhc2VQaWN0dXJlOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnBpY3R1cmVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgcGljdHVyZS5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCBcbiAgICAgICAgICAgIChzZW5kZXIpID0+IFxuICAgICAgICAgICAgICAgIHNlbmRlci5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKHNlbmRlci5kb21haW4pXG4gICAgICAgICAgICAgICAgc2NlbmUucGljdHVyZXNbbnVtYmVyXSA9IG51bGxcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvbiBcbiAgICAgICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZElucHV0TnVtYmVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZElucHV0TnVtYmVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5pc1Byb2Nlc3NpbmdNZXNzYWdlSW5PdGhlckNvbnRleHQoKVxuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRGb3JNZXNzYWdlKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIChHYW1lTWFuYWdlci5zZXR0aW5ncy5hbGxvd0Nob2ljZVNraXB8fEBpbnRlcnByZXRlci5wcmV2aWV3KSBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgQGludGVycHJldGVyLm1lc3NhZ2VPYmplY3QoKS5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnZhcmlhYmxlLCAwKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgJHRlbXBGaWVsZHMuZGlnaXRzID0gQHBhcmFtcy5kaWdpdHNcbiAgICAgICAgc2NlbmUuYmVoYXZpb3Iuc2hvd0lucHV0TnVtYmVyKEBwYXJhbXMuZGlnaXRzLCBncy5DYWxsQmFjayhcIm9uSW5wdXROdW1iZXJGaW5pc2hcIiwgQGludGVycHJldGVyLCBAcGFyYW1zKSlcbiAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLndhaXRpbmdGb3IuaW5wdXROdW1iZXIgPSBAcGFyYW1zXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENob2ljZVRpbWVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENob2ljZVRpbWVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBcbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5jaG9pY2VUaW1lciA9IHNjZW5lLmNob2ljZVRpbWVyXG4gICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHMuY2hvaWNlVGltZXJWaXNpYmxlID0gQHBhcmFtcy52aXNpYmxlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMuZW5hYmxlZFxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlVGltZXIuYmVoYXZpb3Iuc2Vjb25kcyA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2Vjb25kcylcbiAgICAgICAgICAgIHNjZW5lLmNob2ljZVRpbWVyLmJlaGF2aW9yLm1pbnV0ZXMgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm1pbnV0ZXMpXG4gICAgICAgICAgICBzY2VuZS5jaG9pY2VUaW1lci5iZWhhdmlvci5zdGFydCgpXG4gICAgICAgICAgICBzY2VuZS5jaG9pY2VUaW1lci5ldmVudHMub24gXCJmaW5pc2hcIiwgKHNlbmRlcikgPT5cbiAgICAgICAgICAgICAgICBpZiAgc2NlbmUuY2hvaWNlV2luZG93IGFuZCBzY2VuZS5jaG9pY2VzPy5sZW5ndGggPiAwICAgIFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Q2hvaWNlID0gKHNjZW5lLmNob2ljZXMuZmlyc3QgKGMpIC0+IGMuaXNEZWZhdWx0KSB8fCBzY2VuZS5jaG9pY2VzWzBdXG4gICAgICAgICAgICAgICAgICAgICNzY2VuZS5jaG9pY2VXaW5kb3cuZXZlbnRzLmVtaXQoXCJzZWxlY3Rpb25BY2NlcHRcIiwgc2NlbmUuY2hvaWNlV2luZG93LCB7IGxhYmVsSW5kZXg6IGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsSW5kZXggfSlcbiAgICAgICAgICAgICAgICAgICAgc2NlbmUuY2hvaWNlV2luZG93LmV2ZW50cy5lbWl0KFwic2VsZWN0aW9uQWNjZXB0XCIsIHNjZW5lLmNob2ljZVdpbmRvdywgZGVmYXVsdENob2ljZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlVGltZXIuc3RvcCgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dDaG9pY2VzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNob3dDaG9pY2VzOiAtPiAgXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHBvaW50ZXIgPSBAaW50ZXJwcmV0ZXIucG9pbnRlclxuICAgICAgICBjaG9pY2VzID0gc2NlbmUuY2hvaWNlcyB8fCBbXVxuICAgICAgICBcbiAgICAgICAgaWYgKEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcHx8QGludGVycHJldGVyLnByZXZpZXdEYXRhKSBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIubWVzc2FnZU9iamVjdCgpXG4gICAgICAgICAgICBpZiBtZXNzYWdlT2JqZWN0Py52aXNpYmxlXG4gICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgICAgICBkZWZhdWx0Q2hvaWNlID0gKGNob2ljZXMuZmlyc3QoKGMpIC0+IGMuaXNEZWZhdWx0KSkgfHwgY2hvaWNlc1swXSAgICBcbiAgICAgICAgICAgIGlmIGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsSW5kZXg/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIgPSBkZWZhdWx0Q2hvaWNlLmFjdGlvbi5sYWJlbEluZGV4XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmp1bXBUb0xhYmVsKGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsKVxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlcyA9IFtdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGNob2ljZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5zaG93Q2hvaWNlcyhncy5DYWxsQmFjayhcIm9uQ2hvaWNlQWNjZXB0XCIsIEBpbnRlcnByZXRlciwgeyBwb2ludGVyOiBwb2ludGVyLCBwYXJhbXM6IEBwYXJhbXMgfSkpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93Q2hvaWNlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjb21tYW5kU2hvd0Nob2ljZTogLT4gXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNvbW1hbmRzID0gQGludGVycHJldGVyLm9iamVjdC5jb21tYW5kc1xuICAgICAgICBjb21tYW5kID0gbnVsbFxuICAgICAgICBpbmRleCA9IDBcbiAgICAgICAgcG9pbnRlciA9IEBpbnRlcnByZXRlci5wb2ludGVyXG4gICAgICAgIGNob2ljZXMgPSBudWxsXG4gICAgICAgIGRzdFJlY3QgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wb3NpdGlvblR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIEF1dG9cbiAgICAgICAgICAgICAgICBkc3RSZWN0ID0gbnVsbFxuICAgICAgICAgICAgd2hlbiAxICMgRGlyZWN0XG4gICAgICAgICAgICAgICAgZHN0UmVjdCA9IG5ldyBSZWN0KEBwYXJhbXMuYm94LngsIEBwYXJhbXMuYm94LnksIEBwYXJhbXMuYm94LnNpemUud2lkdGgsIEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiAhc2NlbmUuY2hvaWNlc1xuICAgICAgICAgICAgc2NlbmUuY2hvaWNlcyA9IFtdXG4gICAgICAgIGNob2ljZXMgPSBzY2VuZS5jaG9pY2VzXG4gICAgICAgIGNob2ljZXMucHVzaCh7IFxuICAgICAgICAgICAgZHN0UmVjdDogZHN0UmVjdCwgXG4gICAgICAgICAgICAjdGV4dDogbGNzKEBwYXJhbXMudGV4dCksIFxuICAgICAgICAgICAgdGV4dDogQHBhcmFtcy50ZXh0LCBcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCwgXG4gICAgICAgICAgICBhY3Rpb246IEBwYXJhbXMuYWN0aW9uLCBcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IG5vLCBcbiAgICAgICAgICAgIGlzRGVmYXVsdDogQHBhcmFtcy5kZWZhdWx0Q2hvaWNlLCBcbiAgICAgICAgICAgIGlzRW5hYmxlZDogQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuZW5hYmxlZCkgfSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRPcGVuTWVudVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRPcGVuTWVudTogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwibWVudUxheW91dFwiKSwgdHJ1ZSlcbiAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gMVxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kT3BlbkxvYWRNZW51XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kT3BlbkxvYWRNZW51OiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3IGdzLk9iamVjdF9MYXlvdXQoXCJsb2FkTWVudUxheW91dFwiKSwgdHJ1ZSlcbiAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gMVxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE9wZW5TYXZlTWVudVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZE9wZW5TYXZlTWVudTogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwic2F2ZU1lbnVMYXlvdXRcIiksIHRydWUpXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDFcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUmV0dXJuVG9UaXRsZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgY29tbWFuZFJldHVyblRvVGl0bGU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5jbGVhcigpXG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcInRpdGxlTGF5b3V0XCIpKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBsYXlWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kUGxheVZpZGVvOiAtPlxuICAgICAgICBpZiAoR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlldyBvciBHYW1lTWFuYWdlci5zZXR0aW5ncy5hbGxvd1ZpZGVvU2tpcCkgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLnZpZGVvPy5uYW1lP1xuICAgICAgICAgICAgc2NlbmUudmlkZW8gPSBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCJNb3ZpZXMvI3tAcGFyYW1zLnZpZGVvLm5hbWV9XCIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZSA9IG5ldyBTcHJpdGUoR3JhcGhpY3Mudmlld3BvcnQpXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUuc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIHNjZW5lLnZpZGVvLndpZHRoLCBzY2VuZS52aWRlby5oZWlnaHQpXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUudmlkZW8gPSBzY2VuZS52aWRlb1xuICAgICAgICAgICAgQHZpZGVvU3ByaXRlLnpvb21YID0gR3JhcGhpY3Mud2lkdGggLyBzY2VuZS52aWRlby53aWR0aFxuICAgICAgICAgICAgQHZpZGVvU3ByaXRlLnpvb21ZID0gR3JhcGhpY3MuaGVpZ2h0IC8gc2NlbmUudmlkZW8uaGVpZ2h0XG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUueiA9IDk5OTk5OTk5XG4gICAgICAgICAgICBzY2VuZS52aWRlby5vbkVuZGVkID0gPT5cbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICBAdmlkZW9TcHJpdGUuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgc2NlbmUudmlkZW8gPSBudWxsXG4gICAgICAgICAgICBzY2VuZS52aWRlby52b2x1bWUgPSBAcGFyYW1zLnZvbHVtZSAvIDEwMFxuICAgICAgICAgICAgc2NlbmUudmlkZW8ucGxheWJhY2tSYXRlID0gQHBhcmFtcy5wbGF5YmFja1JhdGUgLyAxMDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIHNjZW5lLnZpZGVvLnBsYXkoKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRBdWRpb0RlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRBdWRpb0RlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmF1ZGlvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5tdXNpY0ZhZGVJbkR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLm11c2ljRmFkZUluRHVyYXRpb24gPSBAcGFyYW1zLm11c2ljRmFkZUluRHVyYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm11c2ljRmFkZU91dER1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLm11c2ljRmFkZU91dER1cmF0aW9uID0gQHBhcmFtcy5tdXNpY0ZhZGVPdXREdXJhdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubXVzaWNWb2x1bWUpIHRoZW4gZGVmYXVsdHMubXVzaWNWb2x1bWUgPSBAcGFyYW1zLm11c2ljVm9sdW1lXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5tdXNpY1BsYXliYWNrUmF0ZSkgdGhlbiBkZWZhdWx0cy5tdXNpY1BsYXliYWNrUmF0ZSA9IEBwYXJhbXMubXVzaWNQbGF5YmFja1JhdGVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNvdW5kVm9sdW1lKSB0aGVuIGRlZmF1bHRzLnNvdW5kVm9sdW1lID0gQHBhcmFtcy5zb3VuZFZvbHVtZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc291bmRQbGF5YmFja1JhdGUpIHRoZW4gZGVmYXVsdHMuc291bmRQbGF5YmFja1JhdGUgPSBAcGFyYW1zLnNvdW5kUGxheWJhY2tSYXRlXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy52b2ljZVZvbHVtZSkgdGhlbiBkZWZhdWx0cy52b2ljZVZvbHVtZSA9IEBwYXJhbXMudm9pY2VWb2x1bWVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnZvaWNlUGxheWJhY2tSYXRlKSB0aGVuIGRlZmF1bHRzLnZvaWNlUGxheWJhY2tSYXRlID0gQHBhcmFtcy52b2ljZVBsYXliYWNrUmF0ZVxuICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5TXVzaWNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGxheU11c2ljOiAtPlxuICAgICAgICBpZiBub3QgQHBhcmFtcy5tdXNpYz8gdGhlbiByZXR1cm5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIG11c2ljID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgR2FtZU1hbmFnZXIuc2V0dGluZ3MuYmdtRW5hYmxlZFxuICAgICAgICAgICAgZmFkZUR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZhZGVJbkR1cmF0aW9uKSB0aGVuIEBwYXJhbXMuZmFkZUluRHVyYXRpb24gZWxzZSBkZWZhdWx0cy5tdXNpY0ZhZGVJbkR1cmF0aW9uXG4gICAgICAgICAgICB2b2x1bWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtdXNpYy52b2x1bWVcIl0pIHRoZW4gQHBhcmFtcy5tdXNpYy52b2x1bWUgZWxzZSBkZWZhdWx0cy5tdXNpY1ZvbHVtZVxuICAgICAgICAgICAgcGxheWJhY2tSYXRlID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wibXVzaWMucGxheWJhY2tSYXRlXCJdKSB0aGVuIEBwYXJhbXMubXVzaWMucGxheWJhY2tSYXRlIGVsc2UgZGVmYXVsdHMubXVzaWNQbGF5YmFja1JhdGVcbiAgICAgICAgICAgIG11c2ljID0geyBuYW1lOiBAcGFyYW1zLm11c2ljLm5hbWUsIHZvbHVtZTogdm9sdW1lLCBwbGF5YmFja1JhdGU6IHBsYXliYWNrUmF0ZSB9XG4gICAgICAgICAgICBpZiBAcGFyYW1zLnBsYXlUeXBlID09IDFcbiAgICAgICAgICAgICAgICBwbGF5VGltZSA9IG1pbjogQHBhcmFtcy5wbGF5VGltZS5taW4gKiA2MCwgbWF4OiBAcGFyYW1zLnBsYXlUaW1lLm1heCAqIDYwXG4gICAgICAgICAgICAgICAgcGxheVJhbmdlID0gc3RhcnQ6IEBwYXJhbXMucGxheVJhbmdlLnN0YXJ0ICogNjAsIGVuZDogQHBhcmFtcy5wbGF5UmFuZ2UuZW5kICogNjBcbiAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheU11c2ljUmFuZG9tKG11c2ljLCBmYWRlRHVyYXRpb24sIEBwYXJhbXMubGF5ZXIgfHwgMCwgcGxheVRpbWUsIHBsYXlSYW5nZSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtdXNpYyA9IEF1ZGlvTWFuYWdlci5wbGF5TXVzaWMoQHBhcmFtcy5tdXNpYy5uYW1lLCB2b2x1bWUsIHBsYXliYWNrUmF0ZSwgZmFkZUR1cmF0aW9uLCBAcGFyYW1zLmxheWVyIHx8IDAsIEBwYXJhbXMubG9vcClcbiAgICBcbiAgICAgICAgaWYgbXVzaWMgYW5kIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kICFAcGFyYW1zLmxvb3BcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IE1hdGgucm91bmQobXVzaWMuZHVyYXRpb24gKiBHcmFwaGljcy5mcmFtZVJhdGUpXG4gICAgICAgICAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU3RvcE11c2ljXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFN0b3BNdXNpYzogLT4gXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBmYWRlRHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZU91dER1cmF0aW9uKSB0aGVuIEBwYXJhbXMuZmFkZU91dER1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlT3V0RHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wTXVzaWMoZmFkZUR1cmF0aW9uLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKSlcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBhdXNlTXVzaWNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGF1c2VNdXNpYzogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGZhZGVEdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlT3V0RHVyYXRpb24pIHRoZW4gQHBhcmFtcy5mYWRlT3V0RHVyYXRpb24gZWxzZSBkZWZhdWx0cy5tdXNpY0ZhZGVPdXREdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BNdXNpYyhmYWRlRHVyYXRpb24sIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlc3VtZU11c2ljXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFJlc3VtZU11c2ljOiAtPiBcbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGZhZGVEdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlSW5EdXJhdGlvbikgdGhlbiBAcGFyYW1zLmZhZGVJbkR1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlSW5EdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgQXVkaW9NYW5hZ2VyLnJlc3VtZU11c2ljKGZhZGVEdXJhdGlvbiwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcikpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBsYXlTb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kUGxheVNvdW5kOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmF1ZGlvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc291bmQgPSBudWxsXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnNvdW5kRW5hYmxlZCBhbmQgIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICB2b2x1bWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJzb3VuZC52b2x1bWVcIl0pIHRoZW4gQHBhcmFtcy5zb3VuZC52b2x1bWUgZWxzZSBkZWZhdWx0cy5zb3VuZFZvbHVtZVxuICAgICAgICAgICAgcGxheWJhY2tSYXRlID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wic291bmQucGxheWJhY2tSYXRlXCJdKSB0aGVuIEBwYXJhbXMuc291bmQucGxheWJhY2tSYXRlIGVsc2UgZGVmYXVsdHMuc291bmRQbGF5YmFja1JhdGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc291bmQgPSBBdWRpb01hbmFnZXIucGxheVNvdW5kKEBwYXJhbXMuc291bmQubmFtZSwgdm9sdW1lLCBwbGF5YmFja1JhdGUsIEBwYXJhbXMubXVzaWNFZmZlY3QsIG51bGwsIEBwYXJhbXMubG9vcClcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgICAgIGlmIHNvdW5kIGFuZCBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCAhQHBhcmFtcy5sb29wXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBNYXRoLnJvdW5kKHNvdW5kLmR1cmF0aW9uICogR3JhcGhpY3MuZnJhbWVSYXRlKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0b3BTb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBjb21tYW5kU3RvcFNvdW5kOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcFNvdW5kKEBwYXJhbXMuc291bmQubmFtZSlcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRW5kQ29tbW9uRXZlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRW5kQ29tbW9uRXZlbnQ6IC0+XG4gICAgICAgIGV2ZW50SWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgIGV2ZW50ID0gR2FtZU1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdIFxuICAgICAgICBldmVudD8uYmVoYXZpb3Iuc3RvcCgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlc3VtZUNvbW1vbkV2ZW50XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgY29tbWFuZFJlc3VtZUNvbW1vbkV2ZW50OiAtPlxuICAgICAgICBldmVudElkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jb21tb25FdmVudElkKVxuICAgICAgICBldmVudCA9IEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1tldmVudElkXSBcbiAgICAgICAgZXZlbnQ/LmJlaGF2aW9yLnJlc3VtZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2FsbENvbW1vbkV2ZW50XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGNvbW1hbmRDYWxsQ29tbW9uRXZlbnQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGV2ZW50SWQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLmNvbW1vbkV2ZW50SWQuaW5kZXg/XG4gICAgICAgICAgICBldmVudElkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jb21tb25FdmVudElkKVxuICAgICAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5wYXJhbWV0ZXJzLnZhbHVlc1swXSlcbiAgICAgICAgICAgIHBhcmFtcyA9IHsgdmFsdWVzOiBsaXN0IH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyYW1zID0gQHBhcmFtcy5wYXJhbWV0ZXJzXG4gICAgICAgICAgICBldmVudElkID0gQHBhcmFtcy5jb21tb25FdmVudElkXG5cbiAgICAgICAgQGludGVycHJldGVyLmNhbGxDb21tb25FdmVudChldmVudElkLCBwYXJhbXMpXG4gICAgIFxuICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VUZXh0U2V0dGluZ3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZENoYW5nZVRleHRTZXR0aW5nczogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHRzID0gc2NlbmUudGV4dHNcbiAgICAgICAgaWYgbm90IHRleHRzW251bWJlcl0/IFxuICAgICAgICAgICAgdGV4dHNbbnVtYmVyXSA9IG5ldyBncy5PYmplY3RfVGV4dCgpXG4gICAgICAgICAgICB0ZXh0c1tudW1iZXJdLnZpc2libGUgPSBub1xuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0ZXh0U3ByaXRlID0gdGV4dHNbbnVtYmVyXVxuICAgICAgICBwYWRkaW5nID0gdGV4dFNwcml0ZS5iZWhhdmlvci5wYWRkaW5nXG4gICAgICAgIGZvbnQgPSB0ZXh0U3ByaXRlLmZvbnRcbiAgICAgICAgZm9udE5hbWUgPSB0ZXh0U3ByaXRlLmZvbnQubmFtZVxuICAgICAgICBmb250U2l6ZSA9IHRleHRTcHJpdGUuZm9udC5zaXplXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpbmVTcGFjaW5nKSB0aGVuIHRleHRTcHJpdGUudGV4dFJlbmRlcmVyLmxpbmVTcGFjaW5nID0gQHBhcmFtcy5saW5lU3BhY2luZyA/IHRleHRTcHJpdGUudGV4dFJlbmRlcmVyLmxpbmVTcGFjaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5mb250KSB0aGVuIGZvbnROYW1lID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5mb250KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc2l6ZSkgdGhlbiBmb250U2l6ZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2l6ZSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZm9udCkgb3IgIWlzTG9ja2VkKGZsYWdzLnNpemUpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQgPSBuZXcgRm9udChmb250TmFtZSwgZm9udFNpemUpXG4gICAgICAgICAgICBcbiAgICAgICAgcGFkZGluZy5sZWZ0ID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wicGFkZGluZy4wXCJdKSB0aGVuIEBwYXJhbXMucGFkZGluZz9bMF0gZWxzZSBwYWRkaW5nLmxlZnRcbiAgICAgICAgcGFkZGluZy50b3AgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJwYWRkaW5nLjFcIl0pIHRoZW4gQHBhcmFtcy5wYWRkaW5nP1sxXSBlbHNlIHBhZGRpbmcudG9wXG4gICAgICAgIHBhZGRpbmcucmlnaHQgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJwYWRkaW5nLjJcIl0pIHRoZW4gQHBhcmFtcy5wYWRkaW5nP1syXSBlbHNlIHBhZGRpbmcucmlnaHRcbiAgICAgICAgcGFkZGluZy5ib3R0b20gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJwYWRkaW5nLjNcIl0pIHRoZW4gQHBhcmFtcy5wYWRkaW5nP1szXSBlbHNlIHBhZGRpbmcuYm90dG9tXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYm9sZClcbiAgICAgICAgICAgIHRleHRTcHJpdGUuZm9udC5ib2xkID0gQHBhcmFtcy5ib2xkXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5pdGFsaWMpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuaXRhbGljID0gQHBhcmFtcy5pdGFsaWNcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNtYWxsQ2FwcylcbiAgICAgICAgICAgIHRleHRTcHJpdGUuZm9udC5zbWFsbENhcHMgPSBAcGFyYW1zLnNtYWxsQ2Fwc1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MudW5kZXJsaW5lKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LnVuZGVybGluZSA9IEBwYXJhbXMudW5kZXJsaW5lXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zdHJpa2VUaHJvdWdoKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LnN0cmlrZVRocm91Z2ggPSBAcGFyYW1zLnN0cmlrZVRocm91Z2hcbiAgICAgICAgICAgIFxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuY29sb3IgPSBpZiAhaXNMb2NrZWQoZmxhZ3MuY29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMuY29sb3IpIGVsc2UgZm9udC5jb2xvclxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuYm9yZGVyID0gaWYgIWlzTG9ja2VkKGZsYWdzLm91dGxpbmUpdGhlbiBAcGFyYW1zLm91dGxpbmUgZWxzZSBmb250LmJvcmRlclxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuYm9yZGVyQ29sb3IgPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZUNvbG9yKSB0aGVuIG5ldyBDb2xvcihAcGFyYW1zLm91dGxpbmVDb2xvcikgZWxzZSBuZXcgQ29sb3IoZm9udC5ib3JkZXJDb2xvcilcbiAgICAgICAgdGV4dFNwcml0ZS5mb250LmJvcmRlclNpemUgPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZVNpemUpIHRoZW4gQHBhcmFtcy5vdXRsaW5lU2l6ZSBlbHNlIGZvbnQuYm9yZGVyU2l6ZVxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc2hhZG93ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvdyl0aGVuIEBwYXJhbXMuc2hhZG93IGVsc2UgZm9udC5zaGFkb3dcbiAgICAgICAgdGV4dFNwcml0ZS5mb250LnNoYWRvd0NvbG9yID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd0NvbG9yKSB0aGVuIG5ldyBDb2xvcihAcGFyYW1zLnNoYWRvd0NvbG9yKSBlbHNlIG5ldyBDb2xvcihmb250LnNoYWRvd0NvbG9yKVxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc2hhZG93T2Zmc2V0WCA9IGlmICFpc0xvY2tlZChmbGFncy5zaGFkb3dPZmZzZXRYKSB0aGVuIEBwYXJhbXMuc2hhZG93T2Zmc2V0WCBlbHNlIGZvbnQuc2hhZG93T2Zmc2V0WFxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc2hhZG93T2Zmc2V0WSA9IGlmICFpc0xvY2tlZChmbGFncy5zaGFkb3dPZmZzZXRZKSB0aGVuIEBwYXJhbXMuc2hhZG93T2Zmc2V0WSBlbHNlIGZvbnQuc2hhZG93T2Zmc2V0WVxuICAgICAgICB0ZXh0U3ByaXRlLmJlaGF2aW9yLnJlZnJlc2goKVxuICAgICAgICB0ZXh0U3ByaXRlLnVwZGF0ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVRleHRTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgIFxuICAgIGNvbW1hbmRUZXh0RGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudGV4dFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkJsdXIgPSBAcGFyYW1zLm1vdGlvbkJsdXJcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kU2hvd1RleHQ6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudGV4dFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gQHBhcmFtcy50ZXh0XG4gICAgICAgIHRleHRzID0gc2NlbmUudGV4dHNcbiAgICAgICAgaWYgbm90IHRleHRzW251bWJlcl0/IHRoZW4gdGV4dHNbbnVtYmVyXSA9IG5ldyBncy5PYmplY3RfVGV4dCgpXG4gICAgICAgIFxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICB0ZXh0T2JqZWN0ID0gdGV4dHNbbnVtYmVyXVxuICAgICAgICB0ZXh0T2JqZWN0LmRvbWFpbiA9IEBwYXJhbXMubnVtYmVyRG9tYWluXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIHBvc2l0aW9uQW5jaG9yID0gaWYgIWlzTG9ja2VkKGZsYWdzLnBvc2l0aW9uT3JpZ2luKSB0aGVuIEBpbnRlcnByZXRlci5ncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudFtAcGFyYW1zLnBvc2l0aW9uT3JpZ2luXSB8fCBuZXcgZ3MuUG9pbnQoMCwgMCkgZWxzZSBAaW50ZXJwcmV0ZXIuZ3JhcGhpY0FuY2hvclBvaW50c0J5Q29uc3RhbnRbZGVmYXVsdHMucG9zaXRpb25PcmlnaW5dXG4gICAgICAgIFxuICAgICAgICB0ZXh0T2JqZWN0LnRleHQgPSB0ZXh0XG4gICAgICAgIHRleHRPYmplY3QuZHN0UmVjdC54ID0geCBcbiAgICAgICAgdGV4dE9iamVjdC5kc3RSZWN0LnkgPSB5IFxuICAgICAgICB0ZXh0T2JqZWN0LmJsZW5kTW9kZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYmxlbmRNb2RlKVxuICAgICAgICB0ZXh0T2JqZWN0LmFuY2hvci54ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHRleHRPYmplY3QuYW5jaG9yLnkgPSBpZiBvcmlnaW4gPT0gMCB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgdGV4dE9iamVjdC5wb3NpdGlvbkFuY2hvci54ID0gcG9zaXRpb25BbmNob3IueFxuICAgICAgICB0ZXh0T2JqZWN0LnBvc2l0aW9uQW5jaG9yLnkgPSBwb3NpdGlvbkFuY2hvci55XG4gICAgICAgIHRleHRPYmplY3QuekluZGV4ID0gekluZGV4IHx8ICAoNzAwICsgbnVtYmVyKVxuICAgICAgICB0ZXh0T2JqZWN0LnNpemVUb0ZpdCA9IHllc1xuICAgICAgICB0ZXh0T2JqZWN0LmZvcm1hdHRpbmcgPSB5ZXNcbiAgICAgICAgaWYgQHBhcmFtcy52aWV3cG9ydD8udHlwZSA9PSBcInNjZW5lXCJcbiAgICAgICAgICAgIHRleHRPYmplY3Qudmlld3BvcnQgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3Iudmlld3BvcnRcbiAgICAgICAgdGV4dE9iamVjdC51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgdGV4dE9iamVjdCwgQHBhcmFtcylcbiAgICAgICAgICAgIHRleHRPYmplY3QuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICB0ZXh0T2JqZWN0LmRzdFJlY3QueSA9IHAueVxuICAgICAgICAgICAgXG4gICAgICAgIHRleHRPYmplY3QuYW5pbWF0b3IuYXBwZWFyKHgsIHksIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICBcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGV4dE1vdGlvbkJsdXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRUZXh0TW90aW9uQmx1cjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgdGV4dC5tb3Rpb25CbHVyLnNldChAcGFyYW1zLm1vdGlvbkJsdXIpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlZnJlc2hUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kUmVmcmVzaFRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0cyA9IHNjZW5lLnRleHRzXG4gICAgICAgIGlmIG5vdCB0ZXh0c1tudW1iZXJdPyB0aGVuIHJldHVyblxuXG4gICAgICAgIHRleHRzW251bWJlcl0uYmVoYXZpb3IucmVmcmVzaCh5ZXMpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZVRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZE1vdmVUZXh0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdCh0ZXh0LCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVGV4dFBhdGhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZE1vdmVUZXh0UGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3RQYXRoKHRleHQsIEBwYXJhbXMucGF0aCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZVRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZFJvdGF0ZVRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5yb3RhdGVPYmplY3QodGV4dCwgQHBhcmFtcylcbiAgICAgICAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFpvb21UZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBjb21tYW5kWm9vbVRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci56b29tT2JqZWN0KHRleHQsIEBwYXJhbXMpXG4gICAgICAgIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmxlbmRUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEJsZW5kVGV4dDogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIHRleHQgPSBTY2VuZU1hbmFnZXIuc2NlbmUudGV4dHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5ibGVuZE9iamVjdCh0ZXh0LCBAcGFyYW1zKSAgXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbG9yVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgIFxuICAgIGNvbW1hbmRDb2xvclRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBcbiAgICAgICAgaWYgdGV4dD9cbiAgICAgICAgICAgIHRleHQuYW5pbWF0b3IuY29sb3JUbyhuZXcgQ29sb3IoQHBhcmFtcy5jb2xvciksIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb24gXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgICBcbiAgICBjb21tYW5kRXJhc2VUZXh0OiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnRleHRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRleHQuYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgKHNlbmRlcikgPT4gXG4gICAgICAgICAgICBzZW5kZXIuZGlzcG9zZSgpXG4gICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKHNlbmRlci5kb21haW4pXG4gICAgICAgICAgICBzY2VuZS50ZXh0c1tudW1iZXJdID0gbnVsbFxuICAgICAgICApXG4gICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uIFxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRUZXh0RWZmZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFRleHRFZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5vYmplY3RFZmZlY3QodGV4dCwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kSW5wdXRUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRJbnB1dFRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIGlmIChHYW1lTWFuYWdlci5zZXR0aW5ncy5hbGxvd0Nob2ljZVNraXB8fEBpbnRlcnByZXRlci5wcmV2aWV3KSBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5tZXNzYWdlT2JqZWN0KCkuYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy52YXJpYWJsZSwgXCJcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgaWYgQGludGVycHJldGVyLmlzUHJvY2Vzc2luZ01lc3NhZ2VJbk90aGVyQ29udGV4dCgpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdEZvck1lc3NhZ2UoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAkdGVtcEZpZWxkcy5sZXR0ZXJzID0gQHBhcmFtcy5sZXR0ZXJzXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLnNob3dJbnB1dFRleHQoQHBhcmFtcy5sZXR0ZXJzLCBncy5DYWxsQmFjayhcIm9uSW5wdXRUZXh0RmluaXNoXCIsIEBpbnRlcnByZXRlciwgQGludGVycHJldGVyKSkgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdGluZ0Zvci5pbnB1dFRleHQgPSBAcGFyYW1zXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNhdmVQZXJzaXN0ZW50RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBjb21tYW5kU2F2ZVBlcnNpc3RlbnREYXRhOiAtPiBHYW1lTWFuYWdlci5zYXZlR2xvYmFsRGF0YSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2F2ZVNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRTYXZlU2V0dGluZ3M6IC0+IEdhbWVNYW5hZ2VyLnNhdmVTZXR0aW5ncygpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUHJlcGFyZVNhdmVHYW1lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjIFxuICAgIGNvbW1hbmRQcmVwYXJlU2F2ZUdhbWU6IC0+XG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5wcmV2aWV3RGF0YT8gdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyKytcbiAgICAgICAgR2FtZU1hbmFnZXIucHJlcGFyZVNhdmVHYW1lKEBwYXJhbXMuc25hcHNob3QpXG4gICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyLS1cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2F2ZUdhbWVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFNhdmVHYW1lOiAtPlxuICAgICAgICBpZiBAaW50ZXJwcmV0ZXIucHJldmlld0RhdGE/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB0aHVtYldpZHRoID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50aHVtYldpZHRoKVxuICAgICAgICB0aHVtYkhlaWdodCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGh1bWJIZWlnaHQpXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci5zYXZlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2xvdCkgLSAxLCB0aHVtYldpZHRoLCB0aHVtYkhlaWdodClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTG9hZEdhbWVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZExvYWRHYW1lOiAtPlxuICAgICAgICBpZiBAaW50ZXJwcmV0ZXIucHJldmlld0RhdGE/IHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBHYW1lTWFuYWdlci5sb2FkKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2xvdCkgLSAxKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRXYWl0Rm9ySW5wdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgY29tbWFuZFdhaXRGb3JJbnB1dDogLT5cbiAgICAgICAgcmV0dXJuIGlmIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKClcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VEb3duXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAaW50ZXJwcmV0ZXIub2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleURvd25cIiwgQGludGVycHJldGVyLm9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJrZXlVcFwiLCBAaW50ZXJwcmV0ZXIub2JqZWN0KVxuICAgICAgICBcbiAgICAgICAgZiA9ID0+XG4gICAgICAgICAgICBrZXkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmtleSlcbiAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSBub1xuICAgICAgICAgICAgaWYgSW5wdXQuTW91c2UuaXNCdXR0b24oQHBhcmFtcy5rZXkpXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IElucHV0Lk1vdXNlLmJ1dHRvbnNbQHBhcmFtcy5rZXldID09IEBwYXJhbXMuc3RhdGVcbiAgICAgICAgICAgIGVsc2UgaWYgQHBhcmFtcy5rZXkgPT0gMTAwXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiBJbnB1dC5rZXlEb3duIGFuZCBAcGFyYW1zLnN0YXRlID09IDFcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIElucHV0LmtleVVwIGFuZCBAcGFyYW1zLnN0YXRlID09IDJcbiAgICAgICAgICAgIGVsc2UgaWYgQHBhcmFtcy5rZXkgPT0gMTAxXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiBJbnB1dC5Nb3VzZS5idXR0b25Eb3duIGFuZCBAcGFyYW1zLnN0YXRlID09IDFcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0geWVzIGlmIElucHV0Lk1vdXNlLmJ1dHRvblVwIGFuZCBAcGFyYW1zLnN0YXRlID09IDJcbiAgICAgICAgICAgIGVsc2UgaWYgQHBhcmFtcy5rZXkgPT0gMTAyXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiAoSW5wdXQua2V5RG93biBvciBJbnB1dC5Nb3VzZS5idXR0b25Eb3duKSBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAxXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiAoSW5wdXQua2V5VXAgb3IgSW5wdXQuTW91c2UuYnV0dG9uVXApIGFuZCBAcGFyYW1zLnN0YXRlID09IDJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrZXkgPSBpZiBrZXkgPiAxMDAgdGhlbiBrZXkgLSAxMDAgZWxzZSBrZXlcbiAgICAgICAgICAgICAgICBleGVjdXRlQWN0aW9uID0gSW5wdXQua2V5c1trZXldID09IEBwYXJhbXMuc3RhdGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGV4ZWN1dGVBY3Rpb25cbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VEb3duXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJrZXlEb3duXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJrZXlVcFwiLCBAaW50ZXJwcmV0ZXIub2JqZWN0KVxuICAgICAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlRG93blwiLCBmLCBudWxsLCBAaW50ZXJwcmV0ZXIub2JqZWN0XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcIm1vdXNlVXBcIiwgZiwgbnVsbCwgQGludGVycHJldGVyLm9iamVjdFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJrZXlEb3duXCIsIGYsIG51bGwsIEBpbnRlcnByZXRlci5vYmplY3RcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwia2V5VXBcIiwgZiwgbnVsbCwgQGludGVycHJldGVyLm9iamVjdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kR2V0SW5wdXREYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEdldElucHV0RGF0YTogLT5cbiAgICAgICAgc3dpdGNoIEBwYXJhbXMuZmllbGRcbiAgICAgICAgICAgIHdoZW4gMCAjIEJ1dHRvbiBBXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5BXSlcbiAgICAgICAgICAgIHdoZW4gMSAjIEJ1dHRvbiBCXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5CXSlcbiAgICAgICAgICAgIHdoZW4gMiAjIEJ1dHRvbiBYXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5YXSlcbiAgICAgICAgICAgIHdoZW4gMyAjIEJ1dHRvbiBZXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5ZXSlcbiAgICAgICAgICAgIHdoZW4gNCAjIEJ1dHRvbiBMXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5MXSlcbiAgICAgICAgICAgIHdoZW4gNSAjIEJ1dHRvbiBSXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5SXSlcbiAgICAgICAgICAgIHdoZW4gNiAjIEJ1dHRvbiBTVEFSVFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0LmtleXNbSW5wdXQuU1RBUlRdKVxuICAgICAgICAgICAgd2hlbiA3ICMgQnV0dG9uIFNFTEVDVFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0LmtleXNbSW5wdXQuU0VMRUNUXSlcbiAgICAgICAgICAgIHdoZW4gOCAjIE1vdXNlIFhcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5Nb3VzZS54KVxuICAgICAgICAgICAgd2hlbiA5ICMgTW91c2UgWVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLnkpXG4gICAgICAgICAgICB3aGVuIDEwICMgTW91c2UgV2hlZWxcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5Nb3VzZS53aGVlbClcbiAgICAgICAgICAgIHdoZW4gMTEgIyBNb3VzZSBMZWZ0XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5MRUZUXSlcbiAgICAgICAgICAgIHdoZW4gMTIgIyBNb3VzZSBSaWdodFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuUklHSFRdKVxuICAgICAgICAgICAgd2hlbiAxMyAjIE1vdXNlIE1pZGRsZVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTUlERExFXSlcbiAgICAgICAgICAgIHdoZW4gMTAwICMgQW55IEtleVxuICAgICAgICAgICAgICAgIGFueUtleSA9IDBcbiAgICAgICAgICAgICAgICBhbnlLZXkgPSAxIGlmIElucHV0LmtleURvd25cbiAgICAgICAgICAgICAgICBhbnlLZXkgPSAyIGlmIElucHV0LmtleVVwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgYW55S2V5KVxuICAgICAgICAgICAgd2hlbiAxMDEgIyBBbnkgQnV0dG9uXG4gICAgICAgICAgICAgICAgYW55QnV0dG9uID0gMFxuICAgICAgICAgICAgICAgIGFueUJ1dHRvbiA9IDEgaWYgSW5wdXQuTW91c2UuYnV0dG9uRG93blxuICAgICAgICAgICAgICAgIGFueUJ1dHRvbiA9IDIgaWYgSW5wdXQuTW91c2UuYnV0dG9uVXBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBhbnlCdXR0b24pXG4gICAgICAgICAgICB3aGVuIDEwMiAjIEFueSBJbnB1dFxuICAgICAgICAgICAgICAgIGFueUlucHV0ID0gMFxuICAgICAgICAgICAgICAgIGFueUlucHV0ID0gMSBpZiBJbnB1dC5Nb3VzZS5idXR0b25Eb3duIG9yIElucHV0LmtleURvd25cbiAgICAgICAgICAgICAgICBhbnlJbnB1dCA9IDIgaWYgSW5wdXQuTW91c2UuYnV0dG9uVXAgb3IgSW5wdXQua2V5VXBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBhbnlJbnB1dClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2RlID0gQHBhcmFtcy5maWVsZCAtIDEwMFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0LmtleXNbY29kZV0pXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kR2V0R2FtZURhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kR2V0R2FtZURhdGE6IC0+XG4gICAgICAgIHRlbXBTZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5nc1xuICAgICAgICBzZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwICMgU2NlbmUgSURcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBTY2VuZU1hbmFnZXIuc2NlbmUuc2NlbmVEb2N1bWVudC51aWQpXG4gICAgICAgICAgICB3aGVuIDEgIyBHYW1lIFRpbWUgLSBTZWNvbmRzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgTWF0aC5yb3VuZChHcmFwaGljcy5mcmFtZUNvdW50IC8gNjApKVxuICAgICAgICAgICAgd2hlbiAyICMgR2FtZSBUaW1lIC0gTWludXRlc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQoR3JhcGhpY3MuZnJhbWVDb3VudCAvIDYwIC8gNjApKVxuICAgICAgICAgICAgd2hlbiAzICMgR2FtZSBUaW1lIC0gSG91cnNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKEdyYXBoaWNzLmZyYW1lQ291bnQgLyA2MCAvIDYwIC8gNjApKVxuICAgICAgICAgICAgd2hlbiA0ICMgRGF0ZSAtIERheSBvZiBNb250aFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKVxuICAgICAgICAgICAgd2hlbiA1ICMgRGF0ZSAtIERheSBvZiBXZWVrXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXREYXkoKSlcbiAgICAgICAgICAgIHdoZW4gNiAjIERhdGUgLSBNb250aFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG5ldyBEYXRlKCkuZ2V0TW9udGgoKSlcbiAgICAgICAgICAgIHdoZW4gNyAjIERhdGUgLSBZZWFyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpKVxuICAgICAgICAgICAgd2hlbiA4XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFsbG93U2tpcClcbiAgICAgICAgICAgIHdoZW4gOVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hbGxvd1NraXBVbnJlYWRNZXNzYWdlcylcbiAgICAgICAgICAgIHdoZW4gMTBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5tZXNzYWdlU3BlZWQpXG4gICAgICAgICAgICB3aGVuIDExXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWQpXG4gICAgICAgICAgICB3aGVuIDEyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYXV0b01lc3NhZ2UudGltZSlcbiAgICAgICAgICAgIHdoZW4gMTNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYXV0b01lc3NhZ2Uud2FpdEZvclZvaWNlKVxuICAgICAgICAgICAgd2hlbiAxNFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hdXRvTWVzc2FnZS5zdG9wT25BY3Rpb24pXG4gICAgICAgICAgICB3aGVuIDE1XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnRpbWVNZXNzYWdlVG9Wb2ljZSlcbiAgICAgICAgICAgIHdoZW4gMTZcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYWxsb3dWaWRlb1NraXApXG4gICAgICAgICAgICB3aGVuIDE3XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcClcbiAgICAgICAgICAgIHdoZW4gMThcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb24pXG4gICAgICAgICAgICB3aGVuIDE5XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmZ1bGxTY3JlZW4pXG4gICAgICAgICAgICB3aGVuIDIwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvKVxuICAgICAgICAgICAgd2hlbiAyMVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5jb25maXJtYXRpb24pXG4gICAgICAgICAgICB3aGVuIDIyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYmdtVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyM1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnZvaWNlVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyNFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnNlVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyNVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5iZ21FbmFibGVkKVxuICAgICAgICAgICAgd2hlbiAyNlxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy52b2ljZUVuYWJsZWQpXG4gICAgICAgICAgICB3aGVuIDI3XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnNlRW5hYmxlZClcbiAgICAgICAgICAgIHdoZW4gMjggIyBMYW5ndWFnZSAtIENvZGVcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2U/LmNvZGUgfHwgXCJcIilcbiAgICAgICAgICAgIHdoZW4gMjkgIyBMYW5ndWFnZSAtIE5hbWVcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2U/Lm5hbWUgfHwgXCJcIikgICAgXG4gICAgICAgICAgICB3aGVuIDMwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNldEdhbWVEYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNldEdhbWVEYXRhOiAtPlxuICAgICAgICB0ZW1wU2V0dGluZ3MgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3NcbiAgICAgICAgc2V0dGluZ3MgPSBHYW1lTWFuYWdlci5zZXR0aW5nc1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIEBwYXJhbXMuZmllbGRcbiAgICAgICAgICAgIHdoZW4gMFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFsbG93U2tpcCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWxsb3dTa2lwVW5yZWFkTWVzc2FnZXMgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMlxuICAgICAgICAgICAgICAgIHNldHRpbmdzLm1lc3NhZ2VTcGVlZCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZGVjaW1hbFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXV0b01lc3NhZ2UuZW5hYmxlZCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiA0XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXV0b01lc3NhZ2UudGltZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDVcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hdXRvTWVzc2FnZS53YWl0Rm9yVm9pY2UgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gNlxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmF1dG9NZXNzYWdlLnN0b3BPbkFjdGlvbiA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiA3XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MudGltZU1lc3NhZ2VUb1ZvaWNlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDhcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hbGxvd1ZpZGVvU2tpcCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiA5XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWxsb3dDaG9pY2VTa2lwID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEwXG4gICAgICAgICAgICAgICAgc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb24gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTFcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5mdWxsU2NyZWVuID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgc2V0dGluZ3MuZnVsbFNjcmVlblxuICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuZW50ZXJGdWxsU2NyZWVuKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5sZWF2ZUZ1bGxTY3JlZW4oKVxuICAgICAgICAgICAgd2hlbiAxMlxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgR3JhcGhpY3Mua2VlcFJhdGlvID0gc2V0dGluZ3MuYWRqdXN0QXNwZWN0UmF0aW9cbiAgICAgICAgICAgICAgICBHcmFwaGljcy5vblJlc2l6ZSgpXG4gICAgICAgICAgICB3aGVuIDEzXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuY29uZmlybWF0aW9uID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE0XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYmdtVm9sdW1lID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTVcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy52b2ljZVZvbHVtZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE2XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Muc2VWb2x1bWUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxN1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmJnbUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMThcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy52b2ljZUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTlcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5zZUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkgICBcbiAgICAgICAgICAgIHdoZW4gMjAgXG4gICAgICAgICAgICAgICAgY29kZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgIGxhbmd1YWdlID0gTGFuZ3VhZ2VNYW5hZ2VyLmxhbmd1YWdlcy5maXJzdCAobCkgPT4gbC5jb2RlID09IGNvZGVcbiAgICAgICAgICAgICAgICBMYW5ndWFnZU1hbmFnZXIuc2VsZWN0TGFuZ3VhZ2UobGFuZ3VhZ2UpIGlmIGxhbmd1YWdlXG4gICAgICAgICAgICB3aGVuIDIxXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRHZXRPYmplY3REYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEdldE9iamVjdERhdGE6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLm9iamVjdFR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIFBpY3R1cmVcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5waWN0dXJlc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDEgIyBCYWNrZ3JvdW5kXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRleHRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gMyAjIE1vdmllXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZGVvc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDQgIyBDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICAgICAgd2hlbiA1ICMgTWVzc2FnZSBCb3hcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcIm1lc3NhZ2VCb3hcIilcbiAgICAgICAgICAgIHdoZW4gNiAjIE1lc3NhZ2UgQXJlYVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIGFyZWEgPSBTY2VuZU1hbmFnZXIuc2NlbmUubWVzc2FnZUFyZWFzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgICAgICBvYmplY3QgPSBhcmVhPy5sYXlvdXRcbiAgICAgICAgICAgIHdoZW4gNyAjIEhvdHNwb3RcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VIb3RzcG90RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5ob3RzcG90c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZpZWxkID0gQHBhcmFtcy5maWVsZFxuICAgICAgICBpZiBAcGFyYW1zLm9iamVjdFR5cGUgPT0gNCAjIENoYXJhY3RlclxuICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMuZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBJRFxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbY2hhcmFjdGVySWRdPy5pbmRleCB8fCBcIlwiKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIE5hbWVcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbGNzKFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tjaGFyYWN0ZXJJZF0/Lm5hbWUpIHx8IFwiXCIpXG4gICAgICAgICAgICBmaWVsZCAtPSAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHBhcmFtcy5vYmplY3RUeXBlID09IDYgIyBNZXNzYWdlXG4gICAgICAgICAgICBzd2l0Y2ggZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueSlcbiAgICAgICAgICAgICAgICB3aGVuIDIgIyBaLUluZGV4XG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC56SW5kZXgpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgT3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3Qub3BhY2l0eSlcbiAgICAgICAgICAgICAgICB3aGVuIDQgIyBWaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QudmlzaWJsZSlcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIG9iamVjdD8gICAgICAgIFxuICAgICAgICAgICAgaWYgZmllbGQgPj0gMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBSZXNvdXJjZSBOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vYmplY3RUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC50ZXh0IHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC52aWRlbyB8fCBcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmltYWdlIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFBvc2l0aW9uIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgUG9zaXRpb24gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuZHN0UmVjdC55KVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBBbmNob3IgLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKG9iamVjdC5hbmNob3IueCAqIDEwMCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIEFuY2hvciAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0LmFuY2hvci55ICogMTAwKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA1ICMgWm9vbSAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0Lnpvb20ueCAqIDEwMCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNiAjIFpvb20gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKG9iamVjdC56b29tLnkgKiAxMDApKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDcgIyBTaXplIC0gV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5kc3RSZWN0LndpZHRoKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDggIyBTaXplIC0gSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuZHN0UmVjdC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOSAjIFotSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC56SW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTAgIyBPcGFjaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3Qub3BhY2l0eSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMSAjIEFuZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuYW5nbGUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTIgIyBWaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LnZpc2libGUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTMgIyBCbGVuZCBNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuYmxlbmRNb2RlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDE0ICMgRmxpcHBlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5taXJyb3IpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2V0T2JqZWN0RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgICAgICAgICAgICBcbiAgICBjb21tYW5kU2V0T2JqZWN0RGF0YTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLm9iamVjdFR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIFBpY3R1cmVcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5waWN0dXJlc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDEgIyBCYWNrZ3JvdW5kXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRleHRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gMyAjIE1vdmllXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZGVvc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDQgIyBDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICAgICAgd2hlbiA1ICMgTWVzc2FnZSBCb3hcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcIm1lc3NhZ2VCb3hcIilcbiAgICAgICAgICAgIHdoZW4gNiAjIE1lc3NhZ2UgQXJlYVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIGFyZWEgPSBTY2VuZU1hbmFnZXIuc2NlbmUubWVzc2FnZUFyZWFzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgICAgICBvYmplY3QgPSBhcmVhPy5sYXlvdXRcbiAgICAgICAgICAgIHdoZW4gNyAjIEhvdHNwb3RcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VIb3RzcG90RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5ob3RzcG90c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBmaWVsZCA9IEBwYXJhbXMuZmllbGRcbiAgICAgICAgaWYgQHBhcmFtcy5vYmplY3RUeXBlID09IDQgIyBDaGFyYWN0ZXJcbiAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIE5hbWVcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBpZiBvYmplY3Q/XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QubmFtZSA9IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2NoYXJhY3RlcklkXT8ubmFtZSA9IG5hbWVcbiAgICAgICAgICAgIGZpZWxkLS1cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAcGFyYW1zLm9iamVjdFR5cGUgPT0gNiAjIE1lc3NhZ2VcbiAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIFBvc2l0aW9uIC0gWFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC54ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAyICMgWi1JbmRleFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuekluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDMgIyBPcGFjaXR5XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5PSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgIHdoZW4gNCAjIFZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZpc2libGUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIG9iamVjdD8gICAgICAgIFxuICAgICAgICAgICAgaWYgZmllbGQgPj0gMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBSZXNvdXJjZSBOYW1lIC8gVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub2JqZWN0VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QudGV4dCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gM1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlkZW8gPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBBbmNob3IgLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBBbmNob3IgLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBab29tIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lnpvb20ueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNiAjIFpvb20gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Quem9vbS55ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgLyAxMDBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA3ICMgWi1JbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnpJbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOCAjIE9wYWNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5PSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDkgIyBBbmdsZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFuZ2xlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMCAjIFZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXNpYmxlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTEgIyBCbGVuZCBNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTIgIyBGbGlwcGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QubWlycm9yID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VTb3VuZHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgY29tbWFuZENoYW5nZVNvdW5kczogLT5cbiAgICAgICAgc291bmRzID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc291bmRzXG4gICAgICAgIGZpZWxkRmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgXG4gICAgICAgIGZvciBzb3VuZCwgaSBpbiBAcGFyYW1zLnNvdW5kc1xuICAgICAgICAgICAgaWYgIWdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkKGZpZWxkRmxhZ3NbXCJzb3VuZHMuXCIraV0pXG4gICAgICAgICAgICAgICAgc291bmRzW2ldID0gQHBhcmFtcy5zb3VuZHNbaV1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VDb2xvcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICBcbiAgICBjb21tYW5kQ2hhbmdlQ29sb3JzOiAtPlxuICAgICAgICBjb2xvcnMgPSBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jb2xvcnNcbiAgICAgICAgZmllbGRGbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBcbiAgICAgICAgZm9yIGNvbG9yLCBpIGluIEBwYXJhbXMuY29sb3JzXG4gICAgICAgICAgICBpZiAhZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWQoZmllbGRGbGFnc1tcImNvbG9ycy5cIitpXSlcbiAgICAgICAgICAgICAgICBjb2xvcnNbaV0gPSBuZXcgZ3MuQ29sb3IoQHBhcmFtcy5jb2xvcnNbaV0pXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU2NyZWVuQ3Vyc29yXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgXG4gICAgY29tbWFuZENoYW5nZVNjcmVlbkN1cnNvcjogLT5cbiAgICAgICAgaWYgQHBhcmFtcy5ncmFwaGljPy5uYW1lP1xuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7QHBhcmFtcy5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAoYml0bWFwLCBAcGFyYW1zLmh4LCBAcGFyYW1zLmh5KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAobnVsbCwgMCwgMClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXNldEdsb2JhbERhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIGNvbW1hbmRSZXNldEdsb2JhbERhdGE6IC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnJlc2V0R2xvYmFsRGF0YSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2NyaXB0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgIFxuICAgIGNvbW1hbmRTY3JpcHQ6IC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgIUBwYXJhbXMuc2NyaXB0RnVuY1xuICAgICAgICAgICAgICAgIEBwYXJhbXMuc2NyaXB0RnVuYyA9IGV2YWwoXCIoZnVuY3Rpb24oKXtcIiArIEBwYXJhbXMuc2NyaXB0ICsgXCJ9KVwiKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQHBhcmFtcy5zY3JpcHRGdW5jKClcbiAgICAgICAgY2F0Y2ggZXhcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV4KVxuICAgICAgICAgICAgXG53aW5kb3cuQ29tbWFuZEludGVycHJldGVyID0gQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlciA9IENvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbiAgICBcbiAgICAgICAgXG4gICAgICAgICJdfQ==
//# sourceURL=Component_CommandInterpreter_167.js