var Component_MessageTextRenderer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_MessageTextRenderer = (function(superClass) {
  extend(Component_MessageTextRenderer, superClass);

  Component_MessageTextRenderer.objectCodecBlackList = ["onLinkClick", "onBatchDisappear"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * x
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_MessageTextRenderer.prototype.onDataBundleRestore = function(data, context) {
    var bitmap, customObject, j, l, len, len1, len2, line, m, message, n, ref, ref1, ref2;
    this.setupEventHandlers();
    l = 0;
    ref = this.object.messages;
    for (j = 0, len = ref.length; j < len; j++) {
      message = ref[j];
      if (this.object.settings.useCharacterColor) {
        this.object.font.color = new gs.Color(message.character.textColor);
      }
      this.lines = this.calculateLines(lcsm(message.text), true, 0);
      ref1 = this.lines;
      for (m = 0, len1 = ref1.length; m < len1; m++) {
        line = ref1[m];
        bitmap = this.createBitmap(line);
        if (line === this.line) {
          this.drawLineContent(line, bitmap, this.charIndex + 1);
        } else {
          this.drawLineContent(line, bitmap, -1);
        }
        this.allSprites[l].bitmap = bitmap;
        l++;
      }
    }
    ref2 = this.customObjects;
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      customObject = ref2[n];
      SceneManager.scene.addObject(customObject);
    }
    return null;
  };


  /**
  *  A text-renderer component to render an animated and interactive message text using
  *  dimensions of the game object's destination-rectangle. The message is displayed
  *  using a sprite for each line instead of drawing to the game object's bitmap object.
  *
  *  @module gs
  *  @class Component_MessageTextRenderer
  *  @extends gs.Component_TextRenderer
  *  @memberof gs
  *  @constructor
   */

  function Component_MessageTextRenderer() {
    Component_MessageTextRenderer.__super__.constructor.apply(this, arguments);

    /**
    * An array containing all sprites of the current message.
    * @property sprites
    * @type gs.Sprite[]
    * @protected
     */
    this.sprites = [];

    /**
    * An array containing all sprites of all messages. In NVL mode
    * a page can contain multiple messages.
    * @property allSprites
    * @type gs.Sprite[]
    * @protected
     */
    this.allSprites = [];

    /**
    * An array containing all line-objects of the current message.
    * @property lines
    * @type gs.TextRendererLine[]
    * @readOnly
     */
    this.lines = null;

    /**
    * The line currently rendered.
    * @property line
    * @type number
    * @readOnly
     */
    this.line = 0;

    /**
    * The left and right padding per line.
    * @property padding
    * @type number
     */
    this.padding = 6;

    /**
    * The minimum height of the line currently rendered. If 0, the measured
    * height of the line will be used.
    * @property minLineHeight
    * @type number
     */
    this.minLineHeight = 0;

    /**
    * The spacing between text lines in pixels.
    * @property lineSpacing
    * @type number
     */
    this.lineSpacing = 2;

    /**
    * The line currently rendered.
    * @property currentLine
    * @type number
    * @protected
     */
    this.currentLine = 0;

    /**
    * The height of the line currently rendered.
    * @property currentLineHeight
    * @type number
    * @protected
     */
    this.currentLineHeight = 0;

    /**
    * Index of the current character to draw.
    * @property charIndex
    * @type number
    * @readOnly
     */
    this.charIndex = 0;

    /**
    * Position of the message caret. The caret is like an invisible
    * cursor pointing to the x/y coordinates of the last rendered character of
    * the message. That position can be used to display a waiting- or processing-animation for example.
    * @property caretPosition
    * @type gs.Point
    * @readOnly
     */
    this.caretPosition = new gs.Point();

    /**
    * Indicates that the a message is currently in progress.
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * The current x-coordinate of the caret/cursor.
    * @property currentX
    * @type number
    * @readOnly
     */
    this.currentX = 0;

    /**
    * The current y-coordinate of the caret/cursor.
    * @property currentY
    * @type number
    * @readOnly
     */
    this.currentY = 0;

    /**
    * The current sprites used to display the current text-line/part.
    * @property currentSprite
    * @type gs.Sprite
    * @readOnly
     */
    this.currentSprite = null;

    /**
    * Indicates if the message-renderer is currently waiting like for a user-action.
    * @property isWaiting
    * @type boolean
    * @readOnly
     */
    this.isWaiting = false;

    /**
    * Indicates if the message-renderer is currently waiting for a key-press or mouse/touch action.
    * @property waitForKey
    * @type boolean
    * @readOnly
     */
    this.waitForKey = false;

    /**
    * Number of frames the message-renderer should wait before continue.
    * @property waitCounter
    * @type number
     */
    this.waitCounter = 0;

    /**
    * Speed of the message-drawing. The smaller the value, the faster the message is displayed.
    * @property speed
    * @type number
     */
    this.speed = 1;

    /**
    * Indicates if the message should be rendered immedialtely without any animation or delay.
    * @property drawImmediately
    * @type boolean
     */
    this.drawImmediately = false;

    /**
    * Indicates if the message should wait for a user-action or a certain amount of time
    * before finishing.
    * @property waitAtEnd
    * @type boolean
     */
    this.waitAtEnd = true;

    /**
    * The number of frames to wait before finishing a message.
    * before finishing.
    * @property waitAtEndTime
    * @type number
     */
    this.waitAtEndTime = 0;

    /**
    * Indicates if auto word-wrap should be used. Default is <b>true</b>
    * @property wordWrap
    * @type boolean
     */
    this.wordWrap = true;

    /**
    * Custom game objects which are alive until the current message is erased. Can be used to display
    * animated icons, etc.
    * @property customObjects
    * @type gs.Object_Base[]
     */
    this.customObjects = [];

    /**
    * A hashtable/dictionary object to store custom-data useful like for token-processing. The data must be
    * serializable.
    * @property customObjects
    * @type Object
     */
    this.customData = {};

    /**
    * A callback function called if the player clicks on a non-stylable link (LK text-code) to trigger
    * the specified common event.
    * @property onLinkClick
    * @type Function
     */
    this.onLinkClick = function(e) {
      var event, eventId;
      eventId = e.data.linkData.commonEventId;
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
      if (!event) {
        return SceneManager.scene.interpreter.jumpToLabel(eventId);
      } else {
        return SceneManager.scene.interpreter.callCommonEvent(eventId, null, true);
      }
    };

    /**
    * A callback function called if a batched messsage has been faded out. It triggers the execution of
    * the next message.
    * @property onBatchDisappear
    * @type Function
     */
    this.onBatchDisappear = (function(_this) {
      return function(e) {
        _this.drawImmediately = false;
        _this.isWaiting = false;
        _this.object.opacity = 255;
        return _this.executeBatch();
      };
    })(this);
  }


  /**
  * Serializes the message text-renderer into a data-bundle.
  * @method toDataBundle
  * @return {Object} A data-bundle.
   */

  Component_MessageTextRenderer.prototype.toDataBundle = function() {
    var bundle, ignore, k;
    ignore = ["object", "font", "sprites", "allSprites", "currentSprite", "currentX"];
    bundle = {
      currentSpriteIndex: this.sprites.indexOf(this.currentSprite)
    };
    for (k in this) {
      if (ignore.indexOf(k) === -1) {
        bundle[k] = this[k];
      }
    }
    return bundle;
  };


  /**
  * Disposes the message text-renderer and all sprites used to display
  * the message.
  * @method dispose
   */

  Component_MessageTextRenderer.prototype.dispose = function() {
    var j, len, ref, ref1, results, sprite;
    Component_MessageTextRenderer.__super__.dispose.apply(this, arguments);
    this.disposeEventHandlers();
    ref = this.allSprites;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
      results.push(sprite.dispose());
    }
    return results;
  };


  /**
  * Removes all attached event handlers 
  * the message.
  * @method disposeEventHandlers
   */

  Component_MessageTextRenderer.prototype.disposeEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.offByOwner("keyUp", this.object);
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_MessageTextRenderer.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        if (_this.object.findComponentByName("animation") || (GameManager.settings.autoMessage.enabled && !GameManager.settings.autoMessage.stopOnAction)) {
          return;
        }
        if (_this.isWaiting && !(_this.waitCounter > 0 || _this.waitForKey)) {
          e.breakChain = true;
          _this["continue"]();
        } else {
          e.breakChain = _this.isRunning;
          _this.drawImmediately = !_this.waitForKey;
          _this.waitCounter = 0;
          _this.waitForKey = false;
          _this.isWaiting = false;
        }
        if (_this.waitForKey) {
          if (Input.Mouse.buttons[Input.Mouse.LEFT] === 2) {
            e.breakChain = true;
            Input.clear();
            _this.waitForKey = false;
            return _this.isWaiting = false;
          }
        }
      };
    })(this)), null, this.object);
    return gs.GlobalEventManager.on("keyUp", ((function(_this) {
      return function(e) {
        if (Input.keys[Input.C] && (!_this.isWaiting || (_this.waitCounter > 0 || _this.waitForKey))) {
          _this.drawImmediately = !_this.waitForKey;
          _this.waitCounter = 0;
          _this.waitForKey = false;
          _this.isWaiting = false;
        }
        if (_this.isWaiting && !_this.waitForKey && !_this.waitCounter && Input.keys[Input.C]) {
          _this["continue"]();
        }
        if (_this.waitForKey) {
          if (Input.keys[Input.C]) {
            Input.clear();
            _this.waitForKey = false;
            return _this.isWaiting = false;
          }
        }
      };
    })(this)), null, this.object);
  };


  /**
  * Sets up the renderer. Registers necessary event handlers.
  * @method setup
   */

  Component_MessageTextRenderer.prototype.setup = function() {
    return this.setupEventHandlers();
  };


  /**
  * Restores the message text-renderer's state from a data-bundle.
  * @method restore
  * @param {Object} bundle - A data-bundle containing message text-renderer state.
   */

  Component_MessageTextRenderer.prototype.restore = function(bundle) {
    var k;
    for (k in bundle) {
      if (k === "currentSpriteIndex") {
        this.currentSprite = this.sprites[bundle.currentSpriteIndex];
      } else {
        this[k] = bundle[k];
      }
    }
    if (this.sprites.length > 0) {
      this.currentY = this.sprites.last().y - this.object.origin.y - this.object.dstRect.y;
      this.line = this.maxLines;
      this.isWaiting = this.isWaiting || this.isRunning;
    }
    return null;
  };


  /**
  * Continues message-processing if currently waiting.
  * @method continue
   */

  Component_MessageTextRenderer.prototype["continue"] = function() {
    var duration, fading, ref, ref1;
    this.isWaiting = false;
    if (this.line >= this.lines.length) {
      this.isRunning = false;
      return (ref = this.object.events) != null ? ref.emit("messageFinish", this) : void 0;
    } else {
      if ((ref1 = this.object.events) != null) {
        ref1.emit("messageBatch", this);
      }
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      return this.object.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onBatchDisappear", this));
    }
  };


  /**
  * Updates the text-renderer.
  * @method update
   */

  Component_MessageTextRenderer.prototype.update = function() {
    var j, len, len1, m, object, ref, ref1, ref2, sprite;
    ref = this.allSprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.opacity = this.object.opacity;
      sprite.visible = this.object.visible;
      sprite.ox = -this.object.offset.x;
      sprite.oy = -this.object.offset.y;
      sprite.mask.value = this.object.mask.value;
      sprite.mask.vague = this.object.mask.vague;
      sprite.mask.source = this.object.mask.source;
      sprite.mask.type = this.object.mask.type;
    }
    ref1 = this.customObjects;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      object = ref1[m];
      object.opacity = this.object.opacity;
      object.visible = this.object.visible;
    }
    if (!this.isRunning && this.waitCounter > 0) {
      this.waitCounter--;
      if (this.waitCounter === 0) {
        this["continue"]();
      }
      return;
    }
    if (this.object.visible && ((ref2 = this.lines) != null ? ref2.length : void 0) > 0) {
      this.updateLineWriting();
      this.updateWaitForKey();
      this.updateWaitCounter();
      return this.updateCaretPosition();
    }
  };


  /**
  * Indicates if its a batched messages.
  *
  * @method isBatched
  * @return If <b>true</b> it is a batched message. Otherwise <b>false</b>.
   */

  Component_MessageTextRenderer.prototype.isBatched = function() {
    return this.lines.length > this.maxLines;
  };


  /**
  * Indicates if the batch is still in progress and not done.
  *
  * @method isBatchInProgress
  * @return If <b>true</b> the batched message is still not done. Otherwise <b>false</b>
   */

  Component_MessageTextRenderer.prototype.isBatchInProgress = function() {
    return this.lines.length - this.line > this.maxLines;
  };


  /**
  * Starts displaying the next page of text if a message is too long to fit
  * into one message box.
  *
  * @method executeBatch
   */

  Component_MessageTextRenderer.prototype.executeBatch = function() {
    this.clearAllSprites();
    this.lines = this.lines.slice(this.line);
    this.line = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.currentLineHeight = 0;
    this.tokenIndex = 0;
    this.charIndex = 0;
    this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
    this.maxLines = this.calculateMaxLines(this.lines);
    this.lineAnimationCount = this.speed;
    this.sprites = this.createSprites(this.lines);
    this.allSprites = this.allSprites.concat(this.sprites);
    this.currentSprite = this.sprites[this.line];
    this.currentSprite.x = this.currentX + this.object.origin.x + this.object.dstRect.x;
    return this.drawNext();
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to display
  * the message.
  *
  * @method calculateDuration
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDuration = function() {
    var duration, j, len, len1, line, m, ref, ref1, token;
    duration = 0;
    if (this.lines != null) {
      ref = this.lines;
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        ref1 = line.content;
        for (m = 0, len1 = ref1.length; m < len1; m++) {
          token = ref1[m];
          if (token != null) {
            duration += this.calculateDurationForToken(token);
          }
        }
      }
    }
    return duration;
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to display
  * the specified line.
  *
  * @method calculateDurationForLine
  * @param {gs.RendererTextLine} line The line to calculate the duration for.
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDurationForLine = function(line) {
    var duration, j, len, ref, token;
    duration = 0;
    if (line) {
      ref = line.content;
      for (j = 0, len = ref.length; j < len; j++) {
        token = ref[j];
        if (token != null) {
          duration += this.calculateDurationForToken(token);
        }
      }
    }
    return duration;
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to process
  * the specified token.
  *
  * @method calculateDurationForToken
  * @param {string|Object} token - The token.
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDurationForToken = function(token) {
    var duration;
    duration = 0;
    if (token.code != null) {
      switch (token.code) {
        case "W":
          if (token.value !== "A") {
            duration = token.value / 1000 * Graphics.frameRate;
          }
      }
    } else {
      duration = token.value.length * this.speed;
    }
    return duration;
  };


  /**
  * Calculates the maximum of lines which can be displayed in one message.
  *
  * @method calculateMaxLines
  * @param {Array} lines - An array of line-objects.
  * @return {number} The number of displayable lines.
   */

  Component_MessageTextRenderer.prototype.calculateMaxLines = function(lines) {
    var height, j, len, line, result;
    height = 0;
    result = 0;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      height += line.height + this.lineSpacing;
      if (this.currentY + height > this.object.dstRect.height) {
        break;
      }
      result++;
    }
    return Math.min(lines.length, result || 1);
  };


  /**
  * Displays the character or processes the next control-token.
  *
  * @method drawNext
   */

  Component_MessageTextRenderer.prototype.drawNext = function() {
    var lineSpacing, size, token;
    token = this.processToken();
    if ((token != null ? token.value.length : void 0) > 0) {
      this.char = this.token.value.charAt(this.charIndex);
      size = this.font.measureTextPlain(this.char);
      lineSpacing = this.lineSpacing;
      if (this.currentLine !== this.line) {
        this.currentLine = this.line;
        this.currentLineHeight = 0;
      }
      this.currentSprite.y = this.object.origin.y + this.object.dstRect.y + this.currentY;
      this.currentSprite.visible = true;
      this.drawLineContent(this.lines[this.line], this.currentSprite.bitmap, this.charIndex + 1);
      this.currentSprite.srcRect.width = this.currentSprite.bitmap.width;
      this.currentLineHeight = this.lines[this.line].height;
      return this.currentX = Math.min(this.lines[this.line].width, this.currentX + size.width);
    }
  };


  /**
  * Processes the next character/token of the message.
  * @method nextChar
  * @private
   */

  Component_MessageTextRenderer.prototype.nextChar = function() {
    var base, base1, results;
    results = [];
    while (true) {
      this.charIndex++;
      this.lineAnimationCount = this.speed;
      if ((this.token.code != null) || this.charIndex >= this.token.value.length) {
        if (typeof (base = this.token).onEnd === "function") {
          base.onEnd();
        }
        this.tokenIndex++;
        if (this.tokenIndex >= this.lines[this.line].content.length) {
          this.tokenIndex = 0;
          this.line++;
          this.currentSprite.srcRect.width = this.currentSprite.bitmap.width;
          this.currentSprite = this.sprites[this.line];
          if (this.currentSprite != null) {
            this.currentSprite.x = this.object.origin.x + this.object.dstRect.x;
          }
          if (this.line < this.maxLines) {
            this.currentY += (this.currentLineHeight || this.font.lineHeight) + this.lineSpacing * Graphics.scale;
            this.charIndex = 0;
            this.currentX = 0;
            this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
          }
        } else {
          this.charIndex = 0;
          this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
        }
        if (typeof (base1 = this.token).onStart === "function") {
          base1.onStart();
        }
      }
      if (!this.token || this.token.value !== "\n" || !this.lines[this.line]) {
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Finishes the message. Depending on the message configuration, the
  * message text-renderer will now wait for a user-action or a certain amount
  * of time.
  *
  * @method finish
   */

  Component_MessageTextRenderer.prototype.finish = function() {
    var ref, ref1, ref2;
    if (this.waitAtEnd) {
      this.isWaiting = true;
      return (ref = this.object.events) != null ? ref.emit("messageWaiting", this) : void 0;
    } else if (this.waitAtEndTime > 0) {
      this.waitCounter = this.waitAtEndTime;
      this.isWaiting = false;
      return (ref1 = this.object.events) != null ? ref1.emit("messageWaiting", this) : void 0;
    } else {
      if ((ref2 = this.object.events) != null) {
        ref2.emit("messageWaiting", this);
      }
      return this["continue"]();
    }
  };


  /**
  * Returns the position of the caret in pixels. The caret is like an invisible
  * cursor pointing to the x/y coordinates of the last rendered character of
  * the message. That position can be used to display a waiting- or processing-animation for example.
  *
  * @method updateCaretPosition
   */

  Component_MessageTextRenderer.prototype.updateCaretPosition = function() {
    this.caretPosition.x = this.currentX + this.padding;
    return this.caretPosition.y = this.currentY + this.currentLineHeight / 2;
  };


  /**
  * Updates the line writing.
  *
  * @method updateLineWriting
  * @private
   */

  Component_MessageTextRenderer.prototype.updateLineWriting = function() {
    if (this.isRunning && !this.isWaiting && !this.waitForKey && this.waitCounter <= 0) {
      if (this.lineAnimationCount <= 0) {
        while (true) {
          if (this.line < this.maxLines) {
            this.nextChar();
          }
          if (this.line >= this.maxLines) {
            this.finish();
          } else {
            this.drawNext();
          }
          if (!((this.token.code || this.lineAnimationCount <= 0 || this.drawImmediately) && !this.waitForKey && this.waitCounter <= 0 && this.isRunning && this.line < this.maxLines)) {
            break;
          }
        }
      }
      if (GameManager.tempSettings.skip) {
        return this.lineAnimationCount = 0;
      } else {
        return this.lineAnimationCount--;
      }
    }
  };


  /**
  * Updates wait-for-key state. If skipping is enabled, the text renderer will
  * not wait for key press.
  *
  * @method updateWaitForKey
  * @private
   */

  Component_MessageTextRenderer.prototype.updateWaitForKey = function() {
    if (this.waitForKey) {
      this.isWaiting = !GameManager.tempSettings.skip;
      return this.waitForKey = this.isWaiting;
    }
  };


  /**
  * Updates wait counter if the text renderer is waiting for a certain amount of time to pass. If skipping is enabled, the text renderer will
  * not wait for the actual amount of time and sets the wait-counter to 1 frame instead.
  *
  * @method updateWaitForKey
  * @private
   */

  Component_MessageTextRenderer.prototype.updateWaitCounter = function() {
    if (this.waitCounter > 0) {
      if (GameManager.tempSettings.skip) {
        this.waitCounter = 1;
      }
      this.isWaiting = true;
      this.waitCounter--;
      if (this.waitCounter <= 0) {
        this.isWaiting = false;
        if (this.line >= this.maxLines) {
          return this["continue"]();
        }
      }
    }
  };


  /**
  * Creates a token-object for a specified text-code.
  * 
  * @method createToken
  * @param {string} code - The code/type of the text-code.
  * @param {string} value - The value of the text-code.
  * @return {Object} The token-object.
   */

  Component_MessageTextRenderer.prototype.createToken = function(code, value) {
    var data, i, j, ref, tokenObject;
    tokenObject = null;
    switch (code) {
      case "CE":
        data = value.split("/");
        value = data.shift();
        value = isNaN(value) ? value : parseInt(value);
        for (i = j = 0, ref = data; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if (data[i].startsWith('"') && data[i].endsWith('"')) {
            data[i] = data[i].substring(1, data[i].length - 1);
          } else {
            data[i] = isNaN(data[i]) ? data[i] : parseFloat(data[i]);
          }
        }
        tokenObject = {
          code: code,
          value: value,
          values: data
        };
        break;
      default:
        tokenObject = Component_MessageTextRenderer.__super__.createToken.call(this, code, value);
    }
    return tokenObject;
  };


  /**
  * <p>Measures a control-token. If a token produces a visual result like displaying an icon then it must return the size taken by
  * the visual result. If the token has no visual result, <b>null</b> must be returned. This method is called for every token when the message is initialized.</p> 
  *
  * <p>This method is not called while the message is running. For that case, see <i>processControlToken</i> method which is called
  * for every token while the message is running.</p>
  *
  * @param {Object} token - A control-token.
  * @return {gs.Size} The size of the area taken by the visual result of the token or <b>null</b> if the token has no visual result.
  * @method analyzeControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.measureControlToken = function(token) {
    return Component_MessageTextRenderer.__super__.measureControlToken.call(this, token);
  };


  /**
  * <p>Draws the visual result of a token, like an icon for example, to the specified bitmap. This method is called for every token when the message is initialized and the sprites for each
  * text-line are created.</p> 
  *
  * <p>This method is not called while the message is running. For that case, see <i>processControlToken</i> method which is called
  * for every token while the message is running.</p>
  *
  * @param {Object} token - A control-token.
  * @param {gs.Bitmap} bitmap - The bitmap used for the current text-line. Can be used to draw something on it like an icon, etc.
  * @param {number} offset - An x-offset for the draw-routine.
  * @param {number} length - Determines how many characters of the token should be drawn. Can be ignored for tokens
  * not drawing any characters.
  * @method drawControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.drawControlToken = function(token, bitmap, offset, length) {
    var data, j, len, linkData, results;
    switch (token.code) {
      case "RT":
        return Component_MessageTextRenderer.__super__.drawControlToken.call(this, token, bitmap, offset, length);
      case "SLK":
        if (token.customData.offsetX == null) {
          token.customData.offsetX = offset;
        }
        if (this.customData.linkData) {
          linkData = this.customData.linkData[this.line];
          if (linkData) {
            results = [];
            for (j = 0, len = linkData.length; j < len; j++) {
              data = linkData[j];
              results.push(this.sprites[this.line].bitmap.clearRect(data.cx, 0, data.width, data.height));
            }
            return results;
          }
        }
    }
  };


  /**
  * Processes a control-token. A control-token is a token which influences
  * the text-rendering like changing the fonts color, size or style. Changes 
  * will be automatically applied to the game object's font.
  *
  * For message text-renderer, a few additional control-tokens like
  * speed-change, waiting, etc. needs to be processed here.
  *
  * This method is called for each token while the message is initialized and
  * also while the message is running. See <i>formattingOnly</i> parameter.
  *
  * @param {Object} token - A control-token.
  * @param {boolean} formattingOnly - If <b>true</b> the message is initializing right now and only 
  * format-tokens should be processed which is necessary for the message to calculated sizes correctly.
  * @return {Object} A new token which is processed next or <b>null</b>.
  * @method processControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.processControlToken = function(token, formattingOnly) {
    var animation, bitmap, character, duration, easing, expression, line, linkData, linkStart, object, params, ref, ref1, result, sound, textTokens, values;
    if (formattingOnly) {
      return Component_MessageTextRenderer.__super__.processControlToken.call(this, token);
    }
    result = null;
    switch (token.code) {
      case "CR":
        character = RecordManager.charactersArray.first(function(c) {
          var ref;
          return ((ref = c.name.defaultText) != null ? ref : c.name) === token.value;
        });
        if (character) {
          SceneManager.scene.currentCharacter = character;
        }
        break;
      case "CE":
        params = {
          "values": token.values
        };
        if ((ref = this.object.events) != null) {
          ref.emit("callCommonEvent", this.object, {
            commonEventId: token.value,
            params: params,
            finish: false,
            waiting: true
          });
        }
        break;
      case "X":
        if (typeof token.value === "function") {
          token.value(this.object);
        }
        break;
      case "A":
        animation = RecordManager.animationsArray.first(function(a) {
          return a.name === token.value;
        });
        if (!animation) {
          animation = RecordManager.animations[token.value];
        }
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + animation.graphic.name);
          object = new gs.Object_Animation(animation);
          this.addCustomObject(object);
          this.currentX += Math.round(bitmap.width / animation.framesX);
          this.currentSprite.srcRect.width += Math.round(bitmap.width / animation.framesX);
        }
        break;
      case "RT":
        if (token.rtSize.width > token.rbSize.width) {
          this.currentX += token.rtSize.width;
          this.font.set(this.getRubyTextFont(token));
        } else {
          this.currentX += token.rbSize.width;
        }
        break;
      case "LK":
        if (token.value === 'E') {
          object = new ui.Object_Hotspot();
          object.enabled = true;
          object.setup();
          this.addCustomObject(object);
          object.dstRect.x = this.object.dstRect.x + this.object.origin.x + this.customData.linkData.cx;
          object.dstRect.y = this.object.dstRect.y + this.object.origin.y + this.customData.linkData.cy;
          object.dstRect.width = this.currentX - this.customData.linkData.cx;
          object.dstRect.height = this.currentLineHeight;
          object.events.on("click", gs.CallBack("onLinkClick", this), {
            linkData: this.customData.linkData
          }, this);
        } else {
          this.customData.linkData = {
            cx: this.currentX,
            cy: this.currentY,
            commonEventId: token.value,
            tokenIndex: this.tokenIndex
          };
        }
        break;
      case "SLK":
        if (token.value === 'E') {
          linkData = this.customData.linkData[this.line].last();
          line = this.lines[this.line].content;
          linkStart = this.findToken(this.tokenIndex - 1, "SLK", -1, line);
          textTokens = this.findTokensBetween(linkData.tokenIndex, this.tokenIndex, null, line);
          linkData.cx = linkStart.customData.offsetX;
          linkData.width = this.currentX - linkData.cx + this.padding;
          linkData.height = this.currentSprite.bitmap.height;
          object = new ui.Object_Text();
          object.text = textTokens.select((function(_this) {
            return function(x) {
              return x.value;
            };
          })(this)).join("");
          object.formatting = false;
          object.wordWrap = false;
          object.ui = new ui.Component_UIBehavior();
          object.enabled = true;
          object.addComponent(object.ui);
          object.addComponent(new gs.Component_HotspotBehavior());
          object.behavior.padding.left = 0;
          object.behavior.padding.right = 0;
          object.dstRect.width = linkData.width;
          object.dstRect.height = linkData.height;
          if (linkData.styleIndex === -1) {
            ui.UIManager.addControlStyles(object, ["hyperlink"]);
          } else {
            ui.UIManager.addControlStyles(object, ["hyperlink-" + linkData.styleIndex]);
          }
          object.setup();
          this.addCustomObject(object);
          object.dstRect.x = this.currentSprite.x + linkData.cx;
          object.dstRect.y = this.object.dstRect.y + this.object.origin.y + linkData.cy;
          object.events.on("click", gs.CallBack("onLinkClick", this), {
            linkData: linkData
          }, this);
        } else {
          if (!this.customData.linkData) {
            this.customData.linkData = [];
          }
          if (!this.customData.linkData[this.line]) {
            this.customData.linkData[this.line] = [];
          }
          if ((ref1 = token.value) != null ? ref1.contains(",") : void 0) {
            values = token.value.split(",");
            this.customData.linkData[this.line].push({
              cx: this.currentX,
              cy: this.currentY,
              commonEventId: values[0],
              styleIndex: parseInt(values[1]),
              tokenIndex: this.tokenIndex
            });
          } else {
            this.customData.linkData[this.line].push({
              cx: this.currentY,
              cy: this.currentY,
              commonEventId: token.value,
              tokenIndex: this.tokenIndex,
              styleIndex: -1
            });
          }
        }
        break;
      case "E":
        expression = RecordManager.characterExpressionsArray.first(function(c) {
          var ref2;
          return ((ref2 = c.name.defaultText) != null ? ref2 : c.name) === token.value;
        });
        if (!expression) {
          expression = RecordManager.characterExpressions[token.value];
        }
        character = SceneManager.scene.currentCharacter;
        if ((expression != null) && ((character != null ? character.index : void 0) != null)) {
          duration = GameManager.defaults.character.expressionDuration;
          easing = gs.Easings.fromObject(GameManager.defaults.character.changeEasing);
          animation = GameManager.defaults.character.changeAnimation;
          object = SceneManager.scene.characters.first(function(c) {
            return c.rid === character.index;
          });
          if (object != null) {
            object.behavior.changeExpression(expression, animation, easing, duration);
          }
        }
        break;
      case "SP":
        sound = RecordManager.system.sounds[token.value - 1];
        AudioManager.playSound(sound);
        break;
      case "S":
        GameManager.settings.messageSpeed = token.value;
        break;
      case "W":
        this.drawImmediately = false;
        if (!GameManager.tempSettings.skip) {
          if (token.value === "A") {
            this.waitForKey = true;
          } else {
            this.waitCounter = Math.round(token.value / 1000 * Graphics.frameRate);
          }
        }
        break;
      case "WE":
        this.waitAtEnd = token.value === "Y";
        break;
      case "DI":
        this.drawImmediately = token.value === 1 || token.value === "Y";
        break;
      default:
        result = Component_MessageTextRenderer.__super__.processControlToken.call(this, token);
    }
    return result;
  };


  /**
  * Clears/Resets the text-renderer.
  *
  * @method clear
   */

  Component_MessageTextRenderer.prototype.clear = function() {
    var j, len, ref, ref1, ref2, sprite;
    this.charIndex = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.line = 0;
    this.lines = [];
    this.clearCustomObjects();
    if ((ref = this.object.bitmap) != null) {
      ref.clear();
    }
    ref1 = this.allSprites;
    for (j = 0, len = ref1.length; j < len; j++) {
      sprite = ref1[j];
      sprite.dispose();
      if ((ref2 = sprite.bitmap) != null) {
        ref2.dispose();
      }
    }
    this.allSprites = [];
    return null;
  };


  /**
  * Clears/Disposes all sprites used to display the text-lines/parts.
  *
  * @method clearAllSprites
   */

  Component_MessageTextRenderer.prototype.clearAllSprites = function() {
    var j, len, ref, ref1, sprite;
    ref = this.allSprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.dispose();
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
    }
    return null;
  };


  /**
  * Clears/Disposes the sprites used to display the text-lines/parts of the current/last message.
  *
  * @method clearSprites
   */

  Component_MessageTextRenderer.prototype.clearSprites = function() {
    var j, len, ref, ref1, sprite;
    ref = this.sprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.dispose();
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
    }
    return null;
  };


  /**
  * Removes a game object from the message.
  *
  * @method removeCustomObject
  * @param object {gs.Object_Base} The game object to remove.
   */

  Component_MessageTextRenderer.prototype.removeCustomObject = function(object) {
    SceneManager.scene.removeObject(object);
    object.dispose();
    return this.customObjects.remove(object);
  };


  /**
  * Adds a game object to the message which is alive until the message is
  * erased. Can be used to display animationed-icons, etc. in a message.
  *
  * @method addCustomObject
  * @param object {gs.Object_Base} The game object to add.
   */

  Component_MessageTextRenderer.prototype.addCustomObject = function(object) {
    object.dstRect.x = this.object.dstRect.x + this.object.origin.x + this.currentX;
    object.dstRect.y = this.object.dstRect.y + this.object.origin.y + this.currentY;
    object.zIndex = this.object.zIndex + 1;
    object.update();
    SceneManager.scene.addObject(object);
    return this.customObjects.push(object);
  };


  /**
  * Clears the list of custom game objects. All game objects are disposed and removed
  * from the scene.
  *
  * @method clearCustomObjects
  * @param object {Object} The game object to add.
   */

  Component_MessageTextRenderer.prototype.clearCustomObjects = function() {
    var j, len, object, ref;
    ref = this.customObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      object.dispose();
      SceneManager.scene.removeObject(object);
    }
    return this.customObjects = [];
  };


  /**
  * Creates the bitmap for a specified line-object.
  *
  * @method createBitmap
  * @private
  * @param {Object} line - A line-object.
  * @return {Bitmap} A newly created bitmap containing the line-text.
   */

  Component_MessageTextRenderer.prototype.createBitmap = function(line) {
    var bitmap;
    this.font = this.object.font;
    bitmap = new Bitmap(this.object.dstRect.width, Math.max(this.minLineHeight, line.height));
    bitmap.font = this.font;
    return bitmap;
  };


  /**
  * Draws the line's content on the specified bitmap.
  *
  * @method drawLineContent
  * @protected
  * @param {Object} line - A line-object which should be drawn on the bitmap.
  * @param {gs.Bitmap} bitmap - The bitmap to draw the line's content on.
  * @param {number} length - Determines how many characters of the specified line should be drawn. You can 
  * specify -1 to draw all characters.
   */

  Component_MessageTextRenderer.prototype.drawLineContent = function(line, bitmap, length) {
    var currentX, drawAll, i, j, len, ref, size, token, value;
    bitmap.clear();
    currentX = this.padding;
    drawAll = length === -1;
    ref = line.content;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      token = ref[i];
      if (i > this.tokenIndex && !drawAll) {
        break;
      }
      if (token.code != null) {
        size = this.measureControlToken(token, bitmap);
        this.drawControlToken(token, bitmap, currentX);
        if (size) {
          currentX += size.width;
        }
        this.processControlToken(token, true, line);
      } else if (token.value.length > 0) {
        token.applyFormat(this.font);
        value = token.value;
        if (!drawAll && this.tokenIndex === i && value.length > length) {
          value = value.substring(0, length);
        }
        if (value !== "\n") {
          size = this.font.measureTextPlain(value);
          bitmap.drawText(currentX, line.height - (size.height - this.font.descent) - line.descent, size.width, bitmap.height, value, 0, 0);
          currentX += size.width;
        }
      }
    }
    return line.contentWidth = currentX + this.font.measureTextPlain(" ").width;
  };


  /**
  * Creates the sprite for a specified line-object.
  *
  * @method createSprite
  * @private
  * @param {Object} line - A line-object.
  * @return {Sprite} A newly created sprite object containing the line-text as bitmap.
   */

  Component_MessageTextRenderer.prototype.createSprite = function(line) {
    var bitmap, sprite;
    bitmap = this.createBitmap(line);
    this.currentX = 0;
    this.waitCounter = 0;
    this.waitForKey = false;
    sprite = new Sprite(Graphics.viewport);
    sprite.bitmap = bitmap;
    sprite.visible = true;
    sprite.z = this.object.zIndex + 1;
    sprite.srcRect = new Rect(0, 0, 0, bitmap.height);
    return sprite;
  };


  /**
  * Creates the sprites for a specified array of line-objects.
  *
  * @method createSprites
  * @private
  * @see gs.Component_MessageTextRenderer.createSprite.
  * @param {Array} lines - An array of line-objects.
  * @return {Array} An array of sprites.
   */

  Component_MessageTextRenderer.prototype.createSprites = function(lines) {
    var i, j, len, line, result, sprite;
    this.fontSize = this.object.font.size;
    result = [];
    for (i = j = 0, len = lines.length; j < len; i = ++j) {
      line = lines[i];
      sprite = this.createSprite(line);
      result.push(sprite);
    }
    return result;
  };


  /**
  * Starts a new line.
  *
  * @method newLine
   */

  Component_MessageTextRenderer.prototype.newLine = function() {
    this.currentX = 0;
    return this.currentY += this.currentLineHeight + this.lineSpacing;
  };


  /**
  * Displays a formatted text immediately without any delays or animations. The
  * Component_TextRenderer.drawFormattedText method from the base-class cannot
  * be used here because it would render to the game object's bitmap object while
  * this method is rendering to the sprites.
  *
  * @method drawFormattedTextImmediately
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_MessageTextRenderer.prototype.drawFormattedTextImmediately = function(x, y, width, height, text, wordWrap) {
    this.drawFormattedText(x, y, width, height, text, wordWrap);
    while (true) {
      this.nextChar();
      if (this.line >= this.maxLines) {
        this.isRunning = false;
      } else {
        this.drawNext();
      }
      if (!this.isRunning) {
        break;
      }
    }
    this.currentY += this.currentLineHeight + this.lineSpacing;
    return null;
  };


  /**
  * Starts the rendering-process for the message.
  *
  * @method drawFormattedText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_MessageTextRenderer.prototype.drawFormattedText = function(x, y, width, height, text, wordWrap) {
    var currentX, ref;
    text = text || " ";
    this.font.set(this.object.font);
    this.speed = 11 - Math.round(GameManager.settings.messageSpeed * 2.5);
    this.isRunning = true;
    this.drawImmediately = false;
    this.lineAnimationCount = this.speed;
    this.currentLineHeight = 0;
    this.isWaiting = false;
    this.waitForKey = false;
    this.charIndex = 0;
    this.token = null;
    this.tokenIndex = 0;
    this.message = text;
    this.line = 0;
    this.currentLine = this.line;
    currentX = this.currentX;
    this.lines = this.calculateLines(lcsm(this.message), wordWrap, this.currentX);
    this.sprites = this.createSprites(this.lines);
    this.allSprites = this.allSprites.concat(this.sprites);
    this.currentX = currentX;
    this.currentSprite = this.sprites[this.line];
    this.currentSprite.x = this.currentX + this.object.origin.x + this.object.dstRect.x;
    this.maxLines = this.calculateMaxLines(this.lines);
    this.token = ((ref = this.lines[this.line]) != null ? ref.content[this.tokenIndex] : void 0) || new gs.RendererToken(null, "");
    return this.start();
  };


  /**
  * Starts the message-rendering process.
  *
  * @method start
  * @protected
   */

  Component_MessageTextRenderer.prototype.start = function() {
    var ref;
    if (GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0) {
      return this.instantSkip();
    } else if (this.maxLines === 0) {
      if (((ref = this.lines[0]) != null ? ref.content : void 0) === "") {
        return this.finish();
      } else {
        this.maxLines = 1;
        return this.drawNext();
      }
    } else {
      return this.drawNext();
    }
  };


  /**
  * Skips the current message and finishes the message-processing immediately. The message
  * tokens are processed but not rendered.
  *
  * @method instantSkip
   */

  Component_MessageTextRenderer.prototype.instantSkip = function() {
    var ref;
    while (true) {
      if (this.line < this.maxLines) {
        this.nextChar();
      }
      if (this.line >= this.maxLines) {
        break;
      } else {
        this.processToken();
      }
      if (!(this.isRunning && this.line < this.maxLines)) {
        break;
      }
    }
    if ((ref = this.object.events) != null) {
      ref.emit("messageWaiting", this);
    }
    return this["continue"]();
  };


  /**
  * Processes the current token.
  *
  * @method processToken
   */

  Component_MessageTextRenderer.prototype.processToken = function() {
    var base, token;
    token = null;
    if (this.token.code != null) {
      token = this.processControlToken(this.token, false);
      if (token != null) {
        this.token = token;
        if (typeof (base = this.token).onStart === "function") {
          base.onStart();
        }
      }
    } else {
      token = this.token;
    }
    return token;
  };

  return Component_MessageTextRenderer;

})(gs.Component_TextRenderer);

gs.Component_MessageTextRenderer = Component_MessageTextRenderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07OztFQUNGLDZCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxhQUFELEVBQWdCLGtCQUFoQjs7O0FBQ3hCOzs7Ozs7Ozs7MENBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsSUFBQyxDQUFBLGtCQUFELENBQUE7SUFDQSxDQUFBLEdBQUk7QUFFSjtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBcEI7UUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLEdBQXlCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQTNCLEVBRDdCOztNQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQSxDQUFLLE9BQU8sQ0FBQyxJQUFiLENBQWhCLEVBQW9DLElBQXBDLEVBQXlDLENBQXpDO0FBQ1Q7QUFBQSxXQUFBLHdDQUFBOztRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQ7UUFDVCxJQUFHLElBQUEsS0FBUSxJQUFDLENBQUEsSUFBWjtVQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQWpCLEVBQXVCLE1BQXZCLEVBQStCLElBQUMsQ0FBQSxTQUFELEdBQVcsQ0FBMUMsRUFESjtTQUFBLE1BQUE7VUFHSSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQUF1QixNQUF2QixFQUErQixDQUFDLENBQWhDLEVBSEo7O1FBSUEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFmLEdBQXdCO1FBQ3hCLENBQUE7QUFQSjtBQUpKO0FBY0E7QUFBQSxTQUFBLHdDQUFBOztNQUNJLFlBQVksQ0FB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QSxHQUFjLFNBQUE7QUFDVixRQUFBO0lBQUEsS0FBQSxHQUFRO0lBRVIsSUFBRyx1QkFBSDtNQUNJLEtBQUEsR0FBUSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsSUFBQyxDQUFBLEtBQXRCLEVBQTZCLEtBQTdCO01BQ1IsSUFBRyxhQUFIO1FBQ0ksSUFBQyxDQUFBLEtBQUQsR0FBUzs7Y0FDSCxDQUFDO1NBRlg7T0FGSjtLQUFBLE1BQUE7TUFNSSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BTmI7O0FBUUEsV0FBTztFQVhHOzs7O0dBeHNDMEIsRUFBRSxDQUFDOztBQXV0Qy9DLEVBQUUsQ0FBQyw2QkFBSCxHQUFtQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X01lc3NhZ2VUZXh0UmVuZGVyZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyIGV4dGVuZHMgZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlclxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9uTGlua0NsaWNrXCIsIFwib25CYXRjaERpc2FwcGVhclwiXVxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICogeFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIGwgPSAwXG4gICAgICAgIFxuICAgICAgICBmb3IgbWVzc2FnZSBpbiBAb2JqZWN0Lm1lc3NhZ2VzXG4gICAgICAgICAgICBpZiBAb2JqZWN0LnNldHRpbmdzLnVzZUNoYXJhY3RlckNvbG9yXG4gICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmNvbG9yID0gbmV3IGdzLkNvbG9yKG1lc3NhZ2UuY2hhcmFjdGVyLnRleHRDb2xvcilcbiAgICAgICAgICAgIEBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyhsY3NtKG1lc3NhZ2UudGV4dCksIHllcywgMClcbiAgICAgICAgICAgIGZvciBsaW5lIGluIEBsaW5lc1xuICAgICAgICAgICAgICAgIGJpdG1hcCA9IEBjcmVhdGVCaXRtYXAobGluZSlcbiAgICAgICAgICAgICAgICBpZiBsaW5lID09IEBsaW5lXG4gICAgICAgICAgICAgICAgICAgIEBkcmF3TGluZUNvbnRlbnQobGluZSwgYml0bWFwLCBAY2hhckluZGV4KzEpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAZHJhd0xpbmVDb250ZW50KGxpbmUsIGJpdG1hcCwgLTEpXG4gICAgICAgICAgICAgICAgQGFsbFNwcml0ZXNbbF0uYml0bWFwID0gYml0bWFwXG4gICAgICAgICAgICAgICAgbCsrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgXG4gICAgICAgIGZvciBjdXN0b21PYmplY3QgaW4gQGN1c3RvbU9iamVjdHNcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5hZGRPYmplY3QoY3VzdG9tT2JqZWN0KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiAgQSB0ZXh0LXJlbmRlcmVyIGNvbXBvbmVudCB0byByZW5kZXIgYW4gYW5pbWF0ZWQgYW5kIGludGVyYWN0aXZlIG1lc3NhZ2UgdGV4dCB1c2luZ1xuICAgICogIGRpbWVuc2lvbnMgb2YgdGhlIGdhbWUgb2JqZWN0J3MgZGVzdGluYXRpb24tcmVjdGFuZ2xlLiBUaGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWRcbiAgICAqICB1c2luZyBhIHNwcml0ZSBmb3IgZWFjaCBsaW5lIGluc3RlYWQgb2YgZHJhd2luZyB0byB0aGUgZ2FtZSBvYmplY3QncyBiaXRtYXAgb2JqZWN0LlxuICAgICpcbiAgICAqICBAbW9kdWxlIGdzXG4gICAgKiAgQGNsYXNzIENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyXG4gICAgKiAgQGV4dGVuZHMgZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlclxuICAgICogIEBtZW1iZXJvZiBnc1xuICAgICogIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHNwcml0ZXMgb2YgdGhlIGN1cnJlbnQgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc3ByaXRlc1xuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHNwcml0ZXMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHNwcml0ZXMgb2YgYWxsIG1lc3NhZ2VzLiBJbiBOVkwgbW9kZVxuICAgICAgICAqIGEgcGFnZSBjYW4gY29udGFpbiBtdWx0aXBsZSBtZXNzYWdlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgYWxsU3ByaXRlc1xuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGFsbFNwcml0ZXMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gYXJyYXkgY29udGFpbmluZyBhbGwgbGluZS1vYmplY3RzIG9mIHRoZSBjdXJyZW50IG1lc3NhZ2UuXG4gICAgICAgICogQHByb3BlcnR5IGxpbmVzXG4gICAgICAgICogQHR5cGUgZ3MuVGV4dFJlbmRlcmVyTGluZVtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbGluZXMgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsaW5lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbGluZSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGVmdCBhbmQgcmlnaHQgcGFkZGluZyBwZXIgbGluZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSA2XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSBsaW5lIGN1cnJlbnRseSByZW5kZXJlZC4gSWYgMCwgdGhlIG1lYXN1cmVkXG4gICAgICAgICogaGVpZ2h0IG9mIHRoZSBsaW5lIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgbWluTGluZUhlaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQG1pbkxpbmVIZWlnaHQgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNwYWNpbmcgYmV0d2VlbiB0ZXh0IGxpbmVzIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgbGluZVNwYWNpbmdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBsaW5lU3BhY2luZyA9IDJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGluZSBjdXJyZW50bHkgcmVuZGVyZWQuXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRMaW5lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRMaW5lID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50TGluZUhlaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRleCBvZiB0aGUgY3VycmVudCBjaGFyYWN0ZXIgdG8gZHJhdy5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhckluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFBvc2l0aW9uIG9mIHRoZSBtZXNzYWdlIGNhcmV0LiBUaGUgY2FyZXQgaXMgbGlrZSBhbiBpbnZpc2libGVcbiAgICAgICAgKiBjdXJzb3IgcG9pbnRpbmcgdG8gdGhlIHgveSBjb29yZGluYXRlcyBvZiB0aGUgbGFzdCByZW5kZXJlZCBjaGFyYWN0ZXIgb2ZcbiAgICAgICAgKiB0aGUgbWVzc2FnZS4gVGhhdCBwb3NpdGlvbiBjYW4gYmUgdXNlZCB0byBkaXNwbGF5IGEgd2FpdGluZy0gb3IgcHJvY2Vzc2luZy1hbmltYXRpb24gZm9yIGV4YW1wbGUuXG4gICAgICAgICogQHByb3BlcnR5IGNhcmV0UG9zaXRpb25cbiAgICAgICAgKiBAdHlwZSBncy5Qb2ludFxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGNhcmV0UG9zaXRpb24gPSBuZXcgZ3MuUG9pbnQoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyB0aGF0IHRoZSBhIG1lc3NhZ2UgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpc1J1bm5pbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB4LWNvb3JkaW5hdGUgb2YgdGhlIGNhcmV0L2N1cnNvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB5LWNvb3JkaW5hdGUgb2YgdGhlIGNhcmV0L2N1cnNvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFlcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzcHJpdGVzIHVzZWQgdG8gZGlzcGxheSB0aGUgY3VycmVudCB0ZXh0LWxpbmUvcGFydC5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFNwcml0ZVxuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlLXJlbmRlcmVyIGlzIGN1cnJlbnRseSB3YWl0aW5nIGxpa2UgZm9yIGEgdXNlci1hY3Rpb24uXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbWVzc2FnZS1yZW5kZXJlciBpcyBjdXJyZW50bHkgd2FpdGluZyBmb3IgYSBrZXktcHJlc3Mgb3IgbW91c2UvdG91Y2ggYWN0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Rm9yS2V5XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIE51bWJlciBvZiBmcmFtZXMgdGhlIG1lc3NhZ2UtcmVuZGVyZXIgc2hvdWxkIHdhaXQgYmVmb3JlIGNvbnRpbnVlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFNwZWVkIG9mIHRoZSBtZXNzYWdlLWRyYXdpbmcuIFRoZSBzbWFsbGVyIHRoZSB2YWx1ZSwgdGhlIGZhc3RlciB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNwZWVkXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAc3BlZWQgPSAxXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlIHNob3VsZCBiZSByZW5kZXJlZCBpbW1lZGlhbHRlbHkgd2l0aG91dCBhbnkgYW5pbWF0aW9uIG9yIGRlbGF5LlxuICAgICAgICAqIEBwcm9wZXJ0eSBkcmF3SW1tZWRpYXRlbHlcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1lc3NhZ2Ugc2hvdWxkIHdhaXQgZm9yIGEgdXNlci1hY3Rpb24gb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lXG4gICAgICAgICogYmVmb3JlIGZpbmlzaGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEF0RW5kXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRBdEVuZCA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBudW1iZXIgb2YgZnJhbWVzIHRvIHdhaXQgYmVmb3JlIGZpbmlzaGluZyBhIG1lc3NhZ2UuXG4gICAgICAgICogYmVmb3JlIGZpbmlzaGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEF0RW5kVGltZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRBdEVuZFRpbWUgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIGF1dG8gd29yZC13cmFwIHNob3VsZCBiZSB1c2VkLiBEZWZhdWx0IGlzIDxiPnRydWU8L2I+XG4gICAgICAgICogQHByb3BlcnR5IHdvcmRXcmFwXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdvcmRXcmFwID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VzdG9tIGdhbWUgb2JqZWN0cyB3aGljaCBhcmUgYWxpdmUgdW50aWwgdGhlIGN1cnJlbnQgbWVzc2FnZSBpcyBlcmFzZWQuIENhbiBiZSB1c2VkIHRvIGRpc3BsYXlcbiAgICAgICAgKiBhbmltYXRlZCBpY29ucywgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21PYmplY3RzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0Jhc2VbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGN1c3RvbU9iamVjdHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEEgaGFzaHRhYmxlL2RpY3Rpb25hcnkgb2JqZWN0IHRvIHN0b3JlIGN1c3RvbS1kYXRhIHVzZWZ1bCBsaWtlIGZvciB0b2tlbi1wcm9jZXNzaW5nLiBUaGUgZGF0YSBtdXN0IGJlXG4gICAgICAgICogc2VyaWFsaXphYmxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21PYmplY3RzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY3VzdG9tRGF0YSA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgdGhlIHBsYXllciBjbGlja3Mgb24gYSBub24tc3R5bGFibGUgbGluayAoTEsgdGV4dC1jb2RlKSB0byB0cmlnZ2VyXG4gICAgICAgICogdGhlIHNwZWNpZmllZCBjb21tb24gZXZlbnQuXG4gICAgICAgICogQHByb3BlcnR5IG9uTGlua0NsaWNrXG4gICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBvbkxpbmtDbGljayA9IChlKSAtPlxuICAgICAgICAgICAgZXZlbnRJZCA9IGUuZGF0YS5saW5rRGF0YS5jb21tb25FdmVudElkXG4gICAgICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdXG4gICAgICAgICAgICBpZiAhZXZlbnRcbiAgICAgICAgICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzLmZpcnN0ICh4KSA9PiB4Lm5hbWUgPT0gZXZlbnRJZFxuICAgICAgICAgICAgICAgIGV2ZW50SWQgPSBldmVudC5pbmRleCBpZiBldmVudFxuICAgICAgICAgICAgaWYgIWV2ZW50XG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmp1bXBUb0xhYmVsKGV2ZW50SWQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmNhbGxDb21tb25FdmVudChldmVudElkLCBudWxsLCB5ZXMpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgYSBiYXRjaGVkIG1lc3NzYWdlIGhhcyBiZWVuIGZhZGVkIG91dC4gSXQgdHJpZ2dlcnMgdGhlIGV4ZWN1dGlvbiBvZlxuICAgICAgICAqIHRoZSBuZXh0IG1lc3NhZ2UuXG4gICAgICAgICogQHByb3BlcnR5IG9uQmF0Y2hEaXNhcHBlYXJcbiAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAjIyMgICAgXG4gICAgICAgIEBvbkJhdGNoRGlzYXBwZWFyID0gKGUpID0+IFxuICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIEBvYmplY3Qub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgQGV4ZWN1dGVCYXRjaCgpIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXJpYWxpemVzIHRoZSBtZXNzYWdlIHRleHQtcmVuZGVyZXIgaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBkYXRhLWJ1bmRsZS5cbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGlnbm9yZSA9IFtcIm9iamVjdFwiLCBcImZvbnRcIiwgXCJzcHJpdGVzXCIsIFwiYWxsU3ByaXRlc1wiLCBcImN1cnJlbnRTcHJpdGVcIiwgXCJjdXJyZW50WFwiXVxuICAgICAgICBidW5kbGUgPSB7IGN1cnJlbnRTcHJpdGVJbmRleDogQHNwcml0ZXMuaW5kZXhPZihAY3VycmVudFNwcml0ZSkgfVxuICAgICAgICBcbiAgICAgICAgZm9yIGsgb2YgdGhpc1xuICAgICAgICAgICAgaWYgaWdub3JlLmluZGV4T2YoaykgPT0gLTFcbiAgICAgICAgICAgICAgICBidW5kbGVba10gPSB0aGlzW2tdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBidW5kbGVcbiAgICAgXG4gICAgXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgbWVzc2FnZSB0ZXh0LXJlbmRlcmVyIGFuZCBhbGwgc3ByaXRlcyB1c2VkIHRvIGRpc3BsYXlcbiAgICAqIHRoZSBtZXNzYWdlLlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBkaXNwb3NlRXZlbnRIYW5kbGVycygpXG4gICAgICAgIFxuICAgICAgICBmb3Igc3ByaXRlIGluIEBhbGxTcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwPy5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhbGwgYXR0YWNoZWQgZXZlbnQgaGFuZGxlcnMgXG4gICAgKiB0aGUgbWVzc2FnZS5cbiAgICAqIEBtZXRob2QgZGlzcG9zZUV2ZW50SGFuZGxlcnNcbiAgICAjIyMgICAgICAgXG4gICAgZGlzcG9zZUV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBldmVudC1oYW5kbGVycyBmb3IgbW91c2UvdG91Y2ggZXZlbnRzXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJrZXlVcFwiLCBAb2JqZWN0KVxuICAgICAgICBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCAoKGUpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgQG9iamVjdC5maW5kQ29tcG9uZW50QnlOYW1lKFwiYW5pbWF0aW9uXCIpIG9yIChHYW1lTWFuYWdlci5zZXR0aW5ncy5hdXRvTWVzc2FnZS5lbmFibGVkIGFuZCAhR2FtZU1hbmFnZXIuc2V0dGluZ3MuYXV0b01lc3NhZ2Uuc3RvcE9uQWN0aW9uKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgI2lmIEBvYmplY3QuZHN0UmVjdC5jb250YWlucyhJbnB1dC5Nb3VzZS54IC0gQG9iamVjdC5vcmlnaW4ueCwgSW5wdXQuTW91c2UueSAtIEBvYmplY3Qub3JpZ2luLnkpXG4gICAgICAgICAgICBpZiBAaXNXYWl0aW5nIGFuZCBub3QgKEB3YWl0Q291bnRlciA+IDAgb3IgQHdhaXRGb3JLZXkpXG4gICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICAgICAgQGNvbnRpbnVlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlLmJyZWFrQ2hhaW4gPSBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9ICFAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIGlmIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTEVGVF0gPT0gMlxuICAgICAgICAgICAgICAgICAgICBlLmJyZWFrQ2hhaW4gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgSW5wdXQuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgKSwgbnVsbCwgQG9iamVjdFxuICAgICAgICBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwia2V5VXBcIiwgKChlKSA9PlxuICAgICAgICAgICAgaWYgSW5wdXQua2V5c1tJbnB1dC5DXSBhbmQgKCFAaXNXYWl0aW5nIG9yIChAd2FpdENvdW50ZXIgPiAwIG9yIEB3YWl0Rm9yS2V5KSlcbiAgICAgICAgICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gIUB3YWl0Rm9yS2V5XG4gICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICAgICAgICAgIEB3YWl0Rm9yS2V5ID0gbm9cbiAgICAgICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBpc1dhaXRpbmcgYW5kICFAd2FpdEZvcktleSBhbmQgIUB3YWl0Q291bnRlciBhbmQgSW5wdXQua2V5c1tJbnB1dC5DXVxuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIGlmIElucHV0LmtleXNbSW5wdXQuQ11cbiAgICAgICAgICAgICAgICAgICAgSW5wdXQuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIFxuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGhlIHJlbmRlcmVyLiBSZWdpc3RlcnMgbmVjZXNzYXJ5IGV2ZW50IGhhbmRsZXJzLlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjIyBcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIHRoZSBtZXNzYWdlIHRleHQtcmVuZGVyZXIncyBzdGF0ZSBmcm9tIGEgZGF0YS1idW5kbGUuXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBidW5kbGUgLSBBIGRhdGEtYnVuZGxlIGNvbnRhaW5pbmcgbWVzc2FnZSB0ZXh0LXJlbmRlcmVyIHN0YXRlLlxuICAgICMjI1xuICAgIHJlc3RvcmU6IChidW5kbGUpIC0+XG4gICAgICAgIGZvciBrIG9mIGJ1bmRsZVxuICAgICAgICAgICAgaWYgayA9PSBcImN1cnJlbnRTcHJpdGVJbmRleFwiXG4gICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBAc3ByaXRlc1tidW5kbGUuY3VycmVudFNwcml0ZUluZGV4XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXNba10gPSBidW5kbGVba11cbiAgICAgICAgXG4gICAgICAgIGlmIEBzcHJpdGVzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEBjdXJyZW50WSA9IEBzcHJpdGVzLmxhc3QoKS55IC0gQG9iamVjdC5vcmlnaW4ueSAtIEBvYmplY3QuZHN0UmVjdC55XG4gICAgICAgICAgICBAbGluZSA9IEBtYXhMaW5lc1xuICAgICAgICAgICAgQGlzV2FpdGluZyA9IEBpc1dhaXRpbmcgfHwgQGlzUnVubmluZ1xuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsICAgIFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIENvbnRpbnVlcyBtZXNzYWdlLXByb2Nlc3NpbmcgaWYgY3VycmVudGx5IHdhaXRpbmcuXG4gICAgKiBAbWV0aG9kIGNvbnRpbnVlXG4gICAgIyMjXG4gICAgY29udGludWU6IC0+IFxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgIFxuICAgICAgICBpZiBAbGluZSA+PSBAbGluZXMubGVuZ3RoXG4gICAgICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwibWVzc2FnZUZpbmlzaFwiLCB0aGlzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VCYXRjaFwiLCB0aGlzKVxuICAgICAgICAgICAgZmFkaW5nID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lc3NhZ2VGYWRpbmdcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgdGhlbiAwIGVsc2UgZmFkaW5nLmR1cmF0aW9uXG4gICAgICAgICAgICBAb2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgZ3MuQ2FsbEJhY2soXCJvbkJhdGNoRGlzYXBwZWFyXCIsIHRoaXMpKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgdGV4dC1yZW5kZXJlci5cbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBmb3Igc3ByaXRlIGluIEBhbGxTcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUub3BhY2l0eSA9IEBvYmplY3Qub3BhY2l0eVxuICAgICAgICAgICAgc3ByaXRlLnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgICAgIHNwcml0ZS5veCA9IC1Ab2JqZWN0Lm9mZnNldC54XG4gICAgICAgICAgICBzcHJpdGUub3kgPSAtQG9iamVjdC5vZmZzZXQueVxuICAgICAgICAgICAgc3ByaXRlLm1hc2sudmFsdWUgPSBAb2JqZWN0Lm1hc2sudmFsdWVcbiAgICAgICAgICAgIHNwcml0ZS5tYXNrLnZhZ3VlID0gQG9iamVjdC5tYXNrLnZhZ3VlXG4gICAgICAgICAgICBzcHJpdGUubWFzay5zb3VyY2UgPSBAb2JqZWN0Lm1hc2suc291cmNlXG4gICAgICAgICAgICBzcHJpdGUubWFzay50eXBlID0gQG9iamVjdC5tYXNrLnR5cGVcbiAgICBcbiAgICAgICAgZm9yIG9iamVjdCBpbiBAY3VzdG9tT2JqZWN0c1xuICAgICAgICAgICAgb2JqZWN0Lm9wYWNpdHkgPSBAb2JqZWN0Lm9wYWNpdHlcbiAgICAgICAgICAgIG9iamVjdC52aXNpYmxlID0gQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBpc1J1bm5pbmcgYW5kIEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIEB3YWl0Q291bnRlci0tXG4gICAgICAgICAgICBpZiBAd2FpdENvdW50ZXIgPT0gMFxuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC52aXNpYmxlIGFuZCBAbGluZXM/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEB1cGRhdGVMaW5lV3JpdGluZygpXG4gICAgICAgICAgICBAdXBkYXRlV2FpdEZvcktleSgpXG4gICAgICAgICAgICBAdXBkYXRlV2FpdENvdW50ZXIoKVxuICAgICAgICAgICAgQHVwZGF0ZUNhcmV0UG9zaXRpb24oKVxuICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogSW5kaWNhdGVzIGlmIGl0cyBhIGJhdGNoZWQgbWVzc2FnZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBpc0JhdGNoZWRcbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gaXQgaXMgYSBiYXRjaGVkIG1lc3NhZ2UuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj4uXG4gICAgIyMjXG4gICAgaXNCYXRjaGVkOiAtPiBAbGluZXMubGVuZ3RoID4gQG1heExpbmVzXG4gICAgXG4gICAgIyMjKlxuICAgICogSW5kaWNhdGVzIGlmIHRoZSBiYXRjaCBpcyBzdGlsbCBpbiBwcm9ncmVzcyBhbmQgbm90IGRvbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBpc0JhdGNoSW5Qcm9ncmVzc1xuICAgICogQHJldHVybiBJZiA8Yj50cnVlPC9iPiB0aGUgYmF0Y2hlZCBtZXNzYWdlIGlzIHN0aWxsIG5vdCBkb25lLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgIyMjXG4gICAgaXNCYXRjaEluUHJvZ3Jlc3M6IC0+IEBsaW5lcy5sZW5ndGggLSBAbGluZSA+IEBtYXhMaW5lc1xuICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBkaXNwbGF5aW5nIHRoZSBuZXh0IHBhZ2Ugb2YgdGV4dCBpZiBhIG1lc3NhZ2UgaXMgdG9vIGxvbmcgdG8gZml0XG4gICAgKiBpbnRvIG9uZSBtZXNzYWdlIGJveC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVCYXRjaFxuICAgICMjIyBcbiAgICBleGVjdXRlQmF0Y2g6IC0+XG4gICAgICAgIEBjbGVhckFsbFNwcml0ZXMoKVxuICAgICAgICBAbGluZXMgPSBAbGluZXMuc2xpY2UoQGxpbmUpXG4gICAgICAgIEBsaW5lID0gMFxuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIEBjdXJyZW50WSA9IDAgIFxuICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSAwXG4gICAgICAgIEB0b2tlbkluZGV4ID0gMFxuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBAdG9rZW4gPSBAbGluZXNbQGxpbmVdLmNvbnRlbnRbQHRva2VuSW5kZXhdIHx8IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIFwiXCIpO1xuICAgICAgICBAbWF4TGluZXMgPSBAY2FsY3VsYXRlTWF4TGluZXMoQGxpbmVzKVxuICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50ID0gQHNwZWVkXG4gICAgICAgIEBzcHJpdGVzID0gQGNyZWF0ZVNwcml0ZXMoQGxpbmVzKVxuICAgICAgICBAYWxsU3ByaXRlcyA9IEBhbGxTcHJpdGVzLmNvbmNhdChAc3ByaXRlcylcbiAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBAc3ByaXRlc1tAbGluZV1cbiAgICAgICAgQGN1cnJlbnRTcHJpdGUueCA9IEBjdXJyZW50WCArIEBvYmplY3Qub3JpZ2luLnggKyBAb2JqZWN0LmRzdFJlY3QueFxuICAgICAgICBAZHJhd05leHQoKVxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGN1bGF0ZXMgdGhlIGR1cmF0aW9uKGluIGZyYW1lcykgdGhlIG1lc3NhZ2UtcmVuZGVyZXIgbmVlZHMgdG8gZGlzcGxheVxuICAgICogdGhlIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxjdWxhdGVEdXJhdGlvblxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjIyAgICBcbiAgICBjYWxjdWxhdGVEdXJhdGlvbjogLT5cbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBAbGluZXM/XG4gICAgICAgICAgICBmb3IgbGluZSBpbiBAbGluZXNcbiAgICAgICAgICAgICAgICBmb3IgdG9rZW4gaW4gbGluZS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuP1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gKz0gQGNhbGN1bGF0ZUR1cmF0aW9uRm9yVG9rZW4odG9rZW4pXG4gICAgICAgIHJldHVybiBkdXJhdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGN1bGF0ZXMgdGhlIGR1cmF0aW9uKGluIGZyYW1lcykgdGhlIG1lc3NhZ2UtcmVuZGVyZXIgbmVlZHMgdG8gZGlzcGxheVxuICAgICogdGhlIHNwZWNpZmllZCBsaW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2FsY3VsYXRlRHVyYXRpb25Gb3JMaW5lXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmV9IGxpbmUgVGhlIGxpbmUgdG8gY2FsY3VsYXRlIHRoZSBkdXJhdGlvbiBmb3IuXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgIyMjICAgICAgXG4gICAgY2FsY3VsYXRlRHVyYXRpb25Gb3JMaW5lOiAobGluZSkgLT5cbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBsaW5lXG4gICAgICAgICAgICBmb3IgdG9rZW4gaW4gbGluZS5jb250ZW50XG4gICAgICAgICAgICAgICAgaWYgdG9rZW4/XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uICs9IEBjYWxjdWxhdGVEdXJhdGlvbkZvclRva2VuKHRva2VuKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBkdXJhdGlvblxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBkdXJhdGlvbihpbiBmcmFtZXMpIHRoZSBtZXNzYWdlLXJlbmRlcmVyIG5lZWRzIHRvIHByb2Nlc3NcbiAgICAqIHRoZSBzcGVjaWZpZWQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxjdWxhdGVEdXJhdGlvbkZvclRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IHRva2VuIC0gVGhlIHRva2VuLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjIyAgICAgICAgICAgICAgICAgICAgXG4gICAgY2FsY3VsYXRlRHVyYXRpb25Gb3JUb2tlbjogKHRva2VuKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IDBcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2VuLmNvZGU/XG4gICAgICAgICAgICBzd2l0Y2ggdG9rZW4uY29kZVxuICAgICAgICAgICAgICAgIHdoZW4gXCJXXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWUgIT0gXCJBXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gdG9rZW4udmFsdWUgLyAxMDAwICogR3JhcGhpY3MuZnJhbWVSYXRlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR1cmF0aW9uID0gdG9rZW4udmFsdWUubGVuZ3RoICogQHNwZWVkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gZHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGN1bGF0ZXMgdGhlIG1heGltdW0gb2YgbGluZXMgd2hpY2ggY2FuIGJlIGRpc3BsYXllZCBpbiBvbmUgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZU1heExpbmVzXG4gICAgKiBAcGFyYW0ge0FycmF5fSBsaW5lcyAtIEFuIGFycmF5IG9mIGxpbmUtb2JqZWN0cy5cbiAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBkaXNwbGF5YWJsZSBsaW5lcy5cbiAgICAjIyNcbiAgICBjYWxjdWxhdGVNYXhMaW5lczogKGxpbmVzKSAtPlxuICAgICAgICBoZWlnaHQgPSAwXG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IGxpbmUuaGVpZ2h0ICsgQGxpbmVTcGFjaW5nXG4gICAgICAgICAgICAgICAgaWYgQGN1cnJlbnRZK2hlaWdodCA+IChAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIHJlc3VsdCsrXG4gICAgIFxuICAgICAgICByZXR1cm4gTWF0aC5taW4obGluZXMubGVuZ3RoLCByZXN1bHQgfHwgMSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwbGF5cyB0aGUgY2hhcmFjdGVyIG9yIHByb2Nlc3NlcyB0aGUgbmV4dCBjb250cm9sLXRva2VuLlxuICAgICpcbiAgICAqIEBtZXRob2QgZHJhd05leHRcbiAgICAjIyNcbiAgICBkcmF3TmV4dDogLT5cbiAgICAgICAgdG9rZW4gPSBAcHJvY2Vzc1Rva2VuKClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2tlbj8udmFsdWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgQGNoYXIgPSBAdG9rZW4udmFsdWUuY2hhckF0KEBjaGFySW5kZXgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpemUgPSBAZm9udC5tZWFzdXJlVGV4dFBsYWluKEBjaGFyKSAgXG4gICAgICAgICAgICBsaW5lU3BhY2luZyA9IEBsaW5lU3BhY2luZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAY3VycmVudExpbmUgIT0gQGxpbmVcbiAgICAgICAgICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZVxuICAgICAgICAgICAgICAgIyBAY3VycmVudFkgKz0gQGN1cnJlbnRMaW5lSGVpZ2h0ICsgbGluZVNwYWNpbmcgKiBHcmFwaGljcy5zY2FsZVxuICAgICAgICAgICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcblxuICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUueSA9IEBvYmplY3Qub3JpZ2luLnkgKyBAb2JqZWN0LmRzdFJlY3QueSArIEBjdXJyZW50WVxuICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgQGRyYXdMaW5lQ29udGVudChAbGluZXNbQGxpbmVdLCBAY3VycmVudFNwcml0ZS5iaXRtYXAsIEBjaGFySW5kZXgrMSlcbiAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggPSBAY3VycmVudFNwcml0ZS5iaXRtYXAud2lkdGggI01hdGgubWluKEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggKyBzaXplLndpZHRoLCBAY3VycmVudFNwcml0ZS5iaXRtYXAud2lkdGgpXG4gICAgICAgIFxuICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gQGxpbmVzW0BsaW5lXS5oZWlnaHRcbiAgICAgICAgICAgIEBjdXJyZW50WCA9IE1hdGgubWluKEBsaW5lc1tAbGluZV0ud2lkdGgsIEBjdXJyZW50WCArIHNpemUud2lkdGgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIG5leHQgY2hhcmFjdGVyL3Rva2VuIG9mIHRoZSBtZXNzYWdlLlxuICAgICogQG1ldGhvZCBuZXh0Q2hhclxuICAgICogQHByaXZhdGVcbiAgICAjIyNcbiAgICBuZXh0Q2hhcjogLT5cbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgQGNoYXJJbmRleCsrXG4gICAgICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50ID0gQHNwZWVkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEB0b2tlbi5jb2RlPyBvciBAY2hhckluZGV4ID49IEB0b2tlbi52YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdG9rZW4ub25FbmQ/KClcbiAgICAgICAgICAgICAgICBAdG9rZW5JbmRleCsrXG4gICAgICAgICAgICAgICAgaWYgQHRva2VuSW5kZXggPj0gQGxpbmVzW0BsaW5lXS5jb250ZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdG9rZW5JbmRleCA9IDBcbiAgICAgICAgICAgICAgICAgICAgQGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFNwcml0ZS5zcmNSZWN0LndpZHRoID0gQGN1cnJlbnRTcHJpdGUuYml0bWFwLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlID0gQHNwcml0ZXNbQGxpbmVdXG4gICAgICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50U3ByaXRlP1xuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUueCA9IEBvYmplY3Qub3JpZ2luLnggKyBAb2JqZWN0LmRzdFJlY3QueFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRZICs9IChAY3VycmVudExpbmVIZWlnaHQgfHwgQGZvbnQubGluZUhlaWdodCkgKyBAbGluZVNwYWNpbmcgKiBHcmFwaGljcy5zY2FsZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0uY29udGVudFtAdG9rZW5JbmRleF0gfHwgbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcIilcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBjaGFySW5kZXggPSAwXG4gICAgICAgICAgICAgICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0uY29udGVudFtAdG9rZW5JbmRleF0gfHwgbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcIilcbiAgICAgICAgICAgICAgICBAdG9rZW4ub25TdGFydD8oKVxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICFAdG9rZW4gb3IgQHRva2VuLnZhbHVlICE9IFwiXFxuXCIgb3IgIUBsaW5lc1tAbGluZV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICMjIypcbiAgICAqIEZpbmlzaGVzIHRoZSBtZXNzYWdlLiBEZXBlbmRpbmcgb24gdGhlIG1lc3NhZ2UgY29uZmlndXJhdGlvbiwgdGhlXG4gICAgKiBtZXNzYWdlIHRleHQtcmVuZGVyZXIgd2lsbCBub3cgd2FpdCBmb3IgYSB1c2VyLWFjdGlvbiBvciBhIGNlcnRhaW4gYW1vdW50XG4gICAgKiBvZiB0aW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZmluaXNoXG4gICAgIyMjXG4gICAgZmluaXNoOiAtPlxuICAgICAgICBpZiBAd2FpdEF0RW5kXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VXYWl0aW5nXCIsIHRoaXMpXG4gICAgICAgIGVsc2UgaWYgQHdhaXRBdEVuZFRpbWUgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBAd2FpdEF0RW5kVGltZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwibWVzc2FnZVdhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlV2FpdGluZ1wiLCB0aGlzKVxuICAgICAgICAgICAgQGNvbnRpbnVlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2FyZXQgaW4gcGl4ZWxzLiBUaGUgY2FyZXQgaXMgbGlrZSBhbiBpbnZpc2libGVcbiAgICAqIGN1cnNvciBwb2ludGluZyB0byB0aGUgeC95IGNvb3JkaW5hdGVzIG9mIHRoZSBsYXN0IHJlbmRlcmVkIGNoYXJhY3RlciBvZlxuICAgICogdGhlIG1lc3NhZ2UuIFRoYXQgcG9zaXRpb24gY2FuIGJlIHVzZWQgdG8gZGlzcGxheSBhIHdhaXRpbmctIG9yIHByb2Nlc3NpbmctYW5pbWF0aW9uIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ2FyZXRQb3NpdGlvblxuICAgICMjI1xuICAgIHVwZGF0ZUNhcmV0UG9zaXRpb246IC0+IFxuICAgICAgICBAY2FyZXRQb3NpdGlvbi54ID0gQGN1cnJlbnRYICsgQHBhZGRpbmcgICBcbiAgICAgICAgQGNhcmV0UG9zaXRpb24ueSA9IEBjdXJyZW50WSArIEBjdXJyZW50TGluZUhlaWdodC8yXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGxpbmUgd3JpdGluZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUxpbmVXcml0aW5nXG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZUxpbmVXcml0aW5nOiAtPlxuICAgICAgICBpZiBAaXNSdW5uaW5nIGFuZCAhQGlzV2FpdGluZyBhbmQgIUB3YWl0Rm9yS2V5IGFuZCBAd2FpdENvdW50ZXIgPD0gMFxuICAgICAgICAgICAgaWYgQGxpbmVBbmltYXRpb25Db3VudCA8PSAwXG4gICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgQG5leHRDaGFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA+PSBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBmaW5pc2goKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAZHJhd05leHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIHVubGVzcyAoQHRva2VuLmNvZGUgb3IgQGxpbmVBbmltYXRpb25Db3VudCA8PSAwIG9yIEBkcmF3SW1tZWRpYXRlbHkpIGFuZCAhQHdhaXRGb3JLZXkgYW5kIEB3YWl0Q291bnRlciA8PSAwIGFuZCBAaXNSdW5uaW5nIGFuZCBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgICAgIEBsaW5lQW5pbWF0aW9uQ291bnQgPSAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGxpbmVBbmltYXRpb25Db3VudC0tXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB3YWl0LWZvci1rZXkgc3RhdGUuIElmIHNraXBwaW5nIGlzIGVuYWJsZWQsIHRoZSB0ZXh0IHJlbmRlcmVyIHdpbGxcbiAgICAqIG5vdCB3YWl0IGZvciBrZXkgcHJlc3MuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVXYWl0Rm9yS2V5XG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZVdhaXRGb3JLZXk6IC0+XG4gICAgICAgIGlmIEB3YWl0Rm9yS2V5XG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAd2FpdEZvcktleSA9IEBpc1dhaXRpbmdcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB3YWl0IGNvdW50ZXIgaWYgdGhlIHRleHQgcmVuZGVyZXIgaXMgd2FpdGluZyBmb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lIHRvIHBhc3MuIElmIHNraXBwaW5nIGlzIGVuYWJsZWQsIHRoZSB0ZXh0IHJlbmRlcmVyIHdpbGxcbiAgICAqIG5vdCB3YWl0IGZvciB0aGUgYWN0dWFsIGFtb3VudCBvZiB0aW1lIGFuZCBzZXRzIHRoZSB3YWl0LWNvdW50ZXIgdG8gMSBmcmFtZSBpbnN0ZWFkLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlV2FpdEZvcktleVxuICAgICogQHByaXZhdGVcbiAgICAjIyMgICAgICAgXG4gICAgdXBkYXRlV2FpdENvdW50ZXI6IC0+XG4gICAgICAgIGlmIEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyLS1cbiAgICAgICAgICAgIGlmIEB3YWl0Q291bnRlciA8PSAwXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgQGNvbnRpbnVlKCkgaWYgQGxpbmUgPj0gQG1heExpbmVzXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIHRva2VuLW9iamVjdCBmb3IgYSBzcGVjaWZpZWQgdGV4dC1jb2RlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlL3R5cGUgb2YgdGhlIHRleHQtY29kZS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgdGV4dC1jb2RlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdG9rZW4tb2JqZWN0LlxuICAgICMjI1xuICAgIGNyZWF0ZVRva2VuOiAoY29kZSwgdmFsdWUpIC0+XG4gICAgICAgIHRva2VuT2JqZWN0ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvZGVcbiAgICAgICAgICAgIHdoZW4gXCJDRVwiXG4gICAgICAgICAgICAgICAgZGF0YSA9IHZhbHVlLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YS5zaGlmdCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZSBlbHNlIHBhcnNlSW50KHZhbHVlKVxuICAgICAgICAgICAgICAgIGZvciBpIGluIFswLi4uZGF0YV1cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YVtpXS5zdGFydHNXaXRoKCdcIicpIGFuZCBkYXRhW2ldLmVuZHNXaXRoKCdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ldID0gZGF0YVtpXS5zdWJzdHJpbmcoMSwgZGF0YVtpXS5sZW5ndGgtMSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtpXSA9IGlmIGlzTmFOKGRhdGFbaV0pIHRoZW4gZGF0YVtpXSBlbHNlIHBhcnNlRmxvYXQoZGF0YVtpXSlcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHsgY29kZTogY29kZSwgdmFsdWU6IHZhbHVlLCB2YWx1ZXM6IGRhdGEgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHN1cGVyKGNvZGUsIHZhbHVlKVxuICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gdG9rZW5PYmplY3QgXG4gICAgIyMjKlxuICAgICogPHA+TWVhc3VyZXMgYSBjb250cm9sLXRva2VuLiBJZiBhIHRva2VuIHByb2R1Y2VzIGEgdmlzdWFsIHJlc3VsdCBsaWtlIGRpc3BsYXlpbmcgYW4gaWNvbiB0aGVuIGl0IG11c3QgcmV0dXJuIHRoZSBzaXplIHRha2VuIGJ5XG4gICAgKiB0aGUgdmlzdWFsIHJlc3VsdC4gSWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LCA8Yj5udWxsPC9iPiBtdXN0IGJlIHJldHVybmVkLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQuPC9wPiBcbiAgICAqXG4gICAgKiA8cD5UaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIHdoaWxlIHRoZSBtZXNzYWdlIGlzIHJ1bm5pbmcuIEZvciB0aGF0IGNhc2UsIHNlZSA8aT5wcm9jZXNzQ29udHJvbFRva2VuPC9pPiBtZXRob2Qgd2hpY2ggaXMgY2FsbGVkXG4gICAgKiBmb3IgZXZlcnkgdG9rZW4gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy48L3A+XG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHJldHVybiB7Z3MuU2l6ZX0gVGhlIHNpemUgb2YgdGhlIGFyZWEgdGFrZW4gYnkgdGhlIHZpc3VhbCByZXN1bHQgb2YgdGhlIHRva2VuIG9yIDxiPm51bGw8L2I+IGlmIHRoZSB0b2tlbiBoYXMgbm8gdmlzdWFsIHJlc3VsdC5cbiAgICAqIEBtZXRob2QgYW5hbHl6ZUNvbnRyb2xUb2tlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG1lYXN1cmVDb250cm9sVG9rZW46ICh0b2tlbikgLT4gcmV0dXJuIHN1cGVyKHRva2VuKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiA8cD5EcmF3cyB0aGUgdmlzdWFsIHJlc3VsdCBvZiBhIHRva2VuLCBsaWtlIGFuIGljb24gZm9yIGV4YW1wbGUsIHRvIHRoZSBzcGVjaWZpZWQgYml0bWFwLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQgYW5kIHRoZSBzcHJpdGVzIGZvciBlYWNoXG4gICAgKiB0ZXh0LWxpbmUgYXJlIGNyZWF0ZWQuPC9wPiBcbiAgICAqXG4gICAgKiA8cD5UaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIHdoaWxlIHRoZSBtZXNzYWdlIGlzIHJ1bm5pbmcuIEZvciB0aGF0IGNhc2UsIHNlZSA8aT5wcm9jZXNzQ29udHJvbFRva2VuPC9pPiBtZXRob2Qgd2hpY2ggaXMgY2FsbGVkXG4gICAgKiBmb3IgZXZlcnkgdG9rZW4gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy48L3A+XG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHBhcmFtIHtncy5CaXRtYXB9IGJpdG1hcCAtIFRoZSBiaXRtYXAgdXNlZCBmb3IgdGhlIGN1cnJlbnQgdGV4dC1saW5lLiBDYW4gYmUgdXNlZCB0byBkcmF3IHNvbWV0aGluZyBvbiBpdCBsaWtlIGFuIGljb24sIGV0Yy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgLSBBbiB4LW9mZnNldCBmb3IgdGhlIGRyYXctcm91dGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSBEZXRlcm1pbmVzIGhvdyBtYW55IGNoYXJhY3RlcnMgb2YgdGhlIHRva2VuIHNob3VsZCBiZSBkcmF3bi4gQ2FuIGJlIGlnbm9yZWQgZm9yIHRva2Vuc1xuICAgICogbm90IGRyYXdpbmcgYW55IGNoYXJhY3RlcnMuXG4gICAgKiBAbWV0aG9kIGRyYXdDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBkcmF3Q29udHJvbFRva2VuOiAodG9rZW4sIGJpdG1hcCwgb2Zmc2V0LCBsZW5ndGgpIC0+XG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIHN1cGVyKHRva2VuLCBiaXRtYXAsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgICAgICAgd2hlbiBcIlNMS1wiICMgU3R5bGFibGUgTGlua1xuICAgICAgICAgICAgICAgIGlmICF0b2tlbi5jdXN0b21EYXRhLm9mZnNldFg/XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmN1c3RvbURhdGEub2Zmc2V0WCA9IG9mZnNldFxuICAgICAgICAgICAgICAgIGlmIEBjdXN0b21EYXRhLmxpbmtEYXRhXG4gICAgICAgICAgICAgICAgICAgIGxpbmtEYXRhID0gQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtEYXRhIHRoZW4gZm9yIGRhdGEgaW4gbGlua0RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzcHJpdGVzW0BsaW5lXS5iaXRtYXAuY2xlYXJSZWN0KGRhdGEuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgYSBjb250cm9sLXRva2VuLiBBIGNvbnRyb2wtdG9rZW4gaXMgYSB0b2tlbiB3aGljaCBpbmZsdWVuY2VzXG4gICAgKiB0aGUgdGV4dC1yZW5kZXJpbmcgbGlrZSBjaGFuZ2luZyB0aGUgZm9udHMgY29sb3IsIHNpemUgb3Igc3R5bGUuIENoYW5nZXMgXG4gICAgKiB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byB0aGUgZ2FtZSBvYmplY3QncyBmb250LlxuICAgICpcbiAgICAqIEZvciBtZXNzYWdlIHRleHQtcmVuZGVyZXIsIGEgZmV3IGFkZGl0aW9uYWwgY29udHJvbC10b2tlbnMgbGlrZVxuICAgICogc3BlZWQtY2hhbmdlLCB3YWl0aW5nLCBldGMuIG5lZWRzIHRvIGJlIHByb2Nlc3NlZCBoZXJlLlxuICAgICpcbiAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmb3IgZWFjaCB0b2tlbiB3aGlsZSB0aGUgbWVzc2FnZSBpcyBpbml0aWFsaXplZCBhbmRcbiAgICAqIGFsc28gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy4gU2VlIDxpPmZvcm1hdHRpbmdPbmx5PC9pPiBwYXJhbWV0ZXIuXG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHBhcmFtIHtib29sZWFufSBmb3JtYXR0aW5nT25seSAtIElmIDxiPnRydWU8L2I+IHRoZSBtZXNzYWdlIGlzIGluaXRpYWxpemluZyByaWdodCBub3cgYW5kIG9ubHkgXG4gICAgKiBmb3JtYXQtdG9rZW5zIHNob3VsZCBiZSBwcm9jZXNzZWQgd2hpY2ggaXMgbmVjZXNzYXJ5IGZvciB0aGUgbWVzc2FnZSB0byBjYWxjdWxhdGVkIHNpemVzIGNvcnJlY3RseS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgdG9rZW4gd2hpY2ggaXMgcHJvY2Vzc2VkIG5leHQgb3IgPGI+bnVsbDwvYj4uXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBwcm9jZXNzQ29udHJvbFRva2VuOiAodG9rZW4sIGZvcm1hdHRpbmdPbmx5KSAtPlxuICAgICAgICByZXR1cm4gc3VwZXIodG9rZW4pIGlmIGZvcm1hdHRpbmdPbmx5XG4gICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiQ1JcIiAjIENoYW5nZSBDdXJyZW50IENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc0FycmF5LmZpcnN0IChjKSAtPiAoYy5uYW1lLmRlZmF1bHRUZXh0ID8gYy5uYW1lKSA9PSB0b2tlbi52YWx1ZVxuICAgICAgICAgICAgICAgIGlmIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuY3VycmVudENoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcIkNFXCIgIyBDYWxsIENvbW1vbiBFdmVudFxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHsgXCJ2YWx1ZXNcIjogdG9rZW4udmFsdWVzIH1cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImNhbGxDb21tb25FdmVudFwiLCBAb2JqZWN0LCB7IGNvbW1vbkV2ZW50SWQ6IHRva2VuLnZhbHVlLCBwYXJhbXM6IHBhcmFtcywgZmluaXNoOiBubywgd2FpdGluZzogeWVzIH0pXG4gICAgICAgICAgICB3aGVuIFwiWFwiICMgU2NyaXB0XG4gICAgICAgICAgICAgICAgdG9rZW4udmFsdWU/KEBvYmplY3QpXG4gICAgICAgICAgICB3aGVuIFwiQVwiICMgUGxheSBBbmltYXRpb25cbiAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNBcnJheS5maXJzdCAoYSkgLT4gYS5uYW1lID09IHRva2VuLnZhbHVlXG4gICAgICAgICAgICAgICAgaWYgIWFuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNbdG9rZW4udmFsdWVdXG4gICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uPy5ncmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IG5ldyBncy5PYmplY3RfQW5pbWF0aW9uKGFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEBhZGRDdXN0b21PYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gTWF0aC5yb3VuZChiaXRtYXAud2lkdGggLyBhbmltYXRpb24uZnJhbWVzWClcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUuc3JjUmVjdC53aWR0aCArPSBNYXRoLnJvdW5kKGJpdG1hcC53aWR0aCAvIGFuaW1hdGlvbi5mcmFtZXNYKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIGlmIHRva2VuLnJ0U2l6ZS53aWR0aCA+IHRva2VuLnJiU2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gdG9rZW4ucnRTaXplLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBmb250LnNldChAZ2V0UnVieVRleHRGb250KHRva2VuKSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50WCArPSB0b2tlbi5yYlNpemUud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIFwiTEtcIiAjIExpbmsgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbi52YWx1ZSA9PSAnRScgIyBFbmQgTGlua1xuICAgICAgICAgICAgICAgICAgICBvYmplY3QgPSBuZXcgdWkuT2JqZWN0X0hvdHNwb3QoKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZW5hYmxlZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgQGFkZEN1c3RvbU9iamVjdChvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC54ID0gQG9iamVjdC5kc3RSZWN0LnggKyBAb2JqZWN0Lm9yaWdpbi54ICsgQGN1c3RvbURhdGEubGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55ICsgQG9iamVjdC5vcmlnaW4ueSArIEBjdXN0b21EYXRhLmxpbmtEYXRhLmN5XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LndpZHRoID0gQGN1cnJlbnRYIC0gQGN1c3RvbURhdGEubGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQGN1cnJlbnRMaW5lSGVpZ2h0XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmV2ZW50cy5vbihcImNsaWNrXCIsIGdzLkNhbGxCYWNrKFwib25MaW5rQ2xpY2tcIiwgdGhpcyksIGxpbmtEYXRhOiBAY3VzdG9tRGF0YS5saW5rRGF0YSwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlICMgQmVnaW4gTGlua1xuICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YSA9IHsgY3g6IEBjdXJyZW50WCwgY3k6IEBjdXJyZW50WSwgY29tbW9uRXZlbnRJZDogdG9rZW4udmFsdWUsIHRva2VuSW5kZXg6IEB0b2tlbkluZGV4IH1cbiAgICAgICAgICAgIHdoZW4gXCJTTEtcIiAjIFN0eWxlYWJsZSBMaW5rXG4gICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWUgPT0gJ0UnICMgRW5kIExpbmtcbiAgICAgICAgICAgICAgICAgICAgbGlua0RhdGEgPSBAY3VzdG9tRGF0YS5saW5rRGF0YVtAbGluZV0ubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBAbGluZXNbQGxpbmVdLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgbGlua1N0YXJ0ID0gQGZpbmRUb2tlbihAdG9rZW5JbmRleC0xLCBcIlNMS1wiLCAtMSwgbGluZSlcbiAgICAgICAgICAgICAgICAgICAgdGV4dFRva2VucyA9IEBmaW5kVG9rZW5zQmV0d2VlbihsaW5rRGF0YS50b2tlbkluZGV4LCBAdG9rZW5JbmRleCwgbnVsbCwgbGluZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxpbmtEYXRhLmN4ID0gbGlua1N0YXJ0LmN1c3RvbURhdGEub2Zmc2V0WFxuICAgICAgICAgICAgICAgICAgICBsaW5rRGF0YS53aWR0aCA9IEBjdXJyZW50WCAtIGxpbmtEYXRhLmN4ICsgQHBhZGRpbmdcbiAgICAgICAgICAgICAgICAgICAgbGlua0RhdGEuaGVpZ2h0ID0gQGN1cnJlbnRTcHJpdGUuYml0bWFwLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gbmV3IHVpLk9iamVjdF9UZXh0KClcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnRleHQgPSB0ZXh0VG9rZW5zLnNlbGVjdCgoeCkgPT4geC52YWx1ZSkuam9pbihcIlwiKVxuICAgICAgICAgICAgICAgICAgICAjb2JqZWN0LnNpemVUb0ZpdCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZm9ybWF0dGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC53b3JkV3JhcCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC51aSA9IG5ldyB1aS5Db21wb25lbnRfVUlCZWhhdmlvcigpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5lbmFibGVkID0geWVzXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hZGRDb21wb25lbnQob2JqZWN0LnVpKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG5ldyBncy5Db21wb25lbnRfSG90c3BvdEJlaGF2aW9yKCkpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5iZWhhdmlvci5wYWRkaW5nLmxlZnQgPSAwXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5iZWhhdmlvci5wYWRkaW5nLnJpZ2h0ID0gMFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC53aWR0aCA9IGxpbmtEYXRhLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IGxpbmtEYXRhLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua0RhdGEuc3R5bGVJbmRleCA9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgdWkuVUlNYW5hZ2VyLmFkZENvbnRyb2xTdHlsZXMob2JqZWN0LCBbXCJoeXBlcmxpbmtcIl0pXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5VSU1hbmFnZXIuYWRkQ29udHJvbFN0eWxlcyhvYmplY3QsIFtcImh5cGVybGluay1cIitsaW5rRGF0YS5zdHlsZUluZGV4XSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5zZXR1cCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBAYWRkQ3VzdG9tT2JqZWN0KG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAY3VycmVudFNwcml0ZS54ICsgbGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55ICsgQG9iamVjdC5vcmlnaW4ueSArIGxpbmtEYXRhLmN5XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmV2ZW50cy5vbihcImNsaWNrXCIsIGdzLkNhbGxCYWNrKFwib25MaW5rQ2xpY2tcIiwgdGhpcyksIGxpbmtEYXRhOiBsaW5rRGF0YSwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlICMgQmVnaW4gTGlua1xuICAgICAgICAgICAgICAgICAgICBpZiAhQGN1c3RvbURhdGEubGlua0RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXN0b21EYXRhLmxpbmtEYXRhID0gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgIUBjdXN0b21EYXRhLmxpbmtEYXRhW0BsaW5lXVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWU/LmNvbnRhaW5zKFwiLFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdG9rZW4udmFsdWUuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YVtAbGluZV0ucHVzaCh7IGN4OiBAY3VycmVudFgsIGN5OiBAY3VycmVudFksIGNvbW1vbkV2ZW50SWQ6IHZhbHVlc1swXSwgc3R5bGVJbmRleDogcGFyc2VJbnQodmFsdWVzWzFdKSwgdG9rZW5JbmRleDogQHRva2VuSW5kZXggfSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdLnB1c2goeyBjeDogQGN1cnJlbnRZLCBjeTogQGN1cnJlbnRZLCBjb21tb25FdmVudElkOiB0b2tlbi52YWx1ZSwgdG9rZW5JbmRleDogQHRva2VuSW5kZXgsIHN0eWxlSW5kZXg6IC0xIH0pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiBcIkVcIiAjIENoYW5nZSBFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNBcnJheS5maXJzdCAoYykgLT4gKGMubmFtZS5kZWZhdWx0VGV4dCA/IGMubmFtZSkgPT0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgICAgICBpZiAhZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1t0b2tlbi52YWx1ZV1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmN1cnJlbnRDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBpZiBleHByZXNzaW9uPyBhbmQgY2hhcmFjdGVyPy5pbmRleD9cbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXIuZXhwcmVzc2lvbkR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXIuY2hhbmdlRWFzaW5nKVxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXIuY2hhbmdlQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0IChjKSAtPiBjLnJpZCA9PSBjaGFyYWN0ZXIuaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0Py5iZWhhdmlvci5jaGFuZ2VFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgXG4gICAgICAgICAgICB3aGVuIFwiU1BcIiAjIFBsYXkgU291bmRcbiAgICAgICAgICAgICAgICBzb3VuZCA9IFJlY29yZE1hbmFnZXIuc3lzdGVtLnNvdW5kc1t0b2tlbi52YWx1ZS0xXVxuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoc291bmQpXG4gICAgICAgICAgICB3aGVuIFwiU1wiICMgQ2hhbmdlIFNwZWVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dGluZ3MubWVzc2FnZVNwZWVkID0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgIHdoZW4gXCJXXCIgIyBXYWl0XG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgICAgICAgICAgaWYgIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlID09IFwiQVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IHllc1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBNYXRoLnJvdW5kKHRva2VuLnZhbHVlIC8gMTAwMCAqIEdyYXBoaWNzLmZyYW1lUmF0ZSlcbiAgICAgICAgICAgIHdoZW4gXCJXRVwiICMgV2FpdCBhdCBFbmRcbiAgICAgICAgICAgICAgICBAd2FpdEF0RW5kID0gdG9rZW4udmFsdWUgPT0gXCJZXCJcbiAgICAgICAgICAgIHdoZW4gXCJESVwiICMgRHJhdyBJbW1lZGlhbHR5XG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IHRva2VuLnZhbHVlID09IDEgb3IgdG9rZW4udmFsdWUgPT0gXCJZXCIgIyBEcmF3IGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc3VwZXIodG9rZW4pXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0ICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMvUmVzZXRzIHRoZSB0ZXh0LXJlbmRlcmVyLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAjIyNcbiAgICBjbGVhcjogLT5cbiAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgQGN1cnJlbnRYID0gMFxuICAgICAgICBAY3VycmVudFkgPSAwXG4gICAgICAgIEBsaW5lID0gMFxuICAgICAgICBAbGluZXMgPSBbXVxuICAgICAgICBAY2xlYXJDdXN0b21PYmplY3RzKClcbiAgICAgICAgQG9iamVjdC5iaXRtYXA/LmNsZWFyKClcbiAgICAgICAgXG4gICAgICAgIGZvciBzcHJpdGUgaW4gQGFsbFNwcml0ZXNcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXA/LmRpc3Bvc2UoKVxuICAgICAgICBAYWxsU3ByaXRlcyA9IFtdXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzL0Rpc3Bvc2VzIGFsbCBzcHJpdGVzIHVzZWQgdG8gZGlzcGxheSB0aGUgdGV4dC1saW5lcy9wYXJ0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyQWxsU3ByaXRlc1xuICAgICMjI1xuICAgIGNsZWFyQWxsU3ByaXRlczogLT5cbiAgICAgICAgZm9yIHNwcml0ZSBpbiBAYWxsU3ByaXRlc1xuICAgICAgICAgICAgc3ByaXRlLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc3ByaXRlLmJpdG1hcD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMvRGlzcG9zZXMgdGhlIHNwcml0ZXMgdXNlZCB0byBkaXNwbGF5IHRoZSB0ZXh0LWxpbmVzL3BhcnRzIG9mIHRoZSBjdXJyZW50L2xhc3QgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyU3ByaXRlc1xuICAgICMjIyAgICAgICAgXG4gICAgY2xlYXJTcHJpdGVzOiAtPlxuICAgICAgICBmb3Igc3ByaXRlIGluIEBzcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUuZGlzcG9zZSgpXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwPy5kaXNwb3NlKClcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBnYW1lIG9iamVjdCBmcm9tIHRoZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlQ3VzdG9tT2JqZWN0XG4gICAgKiBAcGFyYW0gb2JqZWN0IHtncy5PYmplY3RfQmFzZX0gVGhlIGdhbWUgb2JqZWN0IHRvIHJlbW92ZS5cbiAgICAjIyNcbiAgICByZW1vdmVDdXN0b21PYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5yZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICBvYmplY3QuZGlzcG9zZSgpXG4gICAgICAgIEBjdXN0b21PYmplY3RzLnJlbW92ZShvYmplY3QpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgYSBnYW1lIG9iamVjdCB0byB0aGUgbWVzc2FnZSB3aGljaCBpcyBhbGl2ZSB1bnRpbCB0aGUgbWVzc2FnZSBpc1xuICAgICogZXJhc2VkLiBDYW4gYmUgdXNlZCB0byBkaXNwbGF5IGFuaW1hdGlvbmVkLWljb25zLCBldGMuIGluIGEgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFkZEN1c3RvbU9iamVjdFxuICAgICogQHBhcmFtIG9iamVjdCB7Z3MuT2JqZWN0X0Jhc2V9IFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjXG4gICAgYWRkQ3VzdG9tT2JqZWN0OiAob2JqZWN0KSAtPlxuICAgICAgICBvYmplY3QuZHN0UmVjdC54ID0gQG9iamVjdC5kc3RSZWN0LnggKyBAb2JqZWN0Lm9yaWdpbi54ICsgQGN1cnJlbnRYXG4gICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAb2JqZWN0LmRzdFJlY3QueSArIEBvYmplY3Qub3JpZ2luLnkgKyBAY3VycmVudFlcbiAgICAgICAgb2JqZWN0LnpJbmRleCA9IEBvYmplY3QuekluZGV4ICsgMVxuICAgICAgICBvYmplY3QudXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5hZGRPYmplY3Qob2JqZWN0KVxuICAgICAgICBAY3VzdG9tT2JqZWN0cy5wdXNoKG9iamVjdClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHRoZSBsaXN0IG9mIGN1c3RvbSBnYW1lIG9iamVjdHMuIEFsbCBnYW1lIG9iamVjdHMgYXJlIGRpc3Bvc2VkIGFuZCByZW1vdmVkXG4gICAgKiBmcm9tIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyQ3VzdG9tT2JqZWN0c1xuICAgICogQHBhcmFtIG9iamVjdCB7T2JqZWN0fSBUaGUgZ2FtZSBvYmplY3QgdG8gYWRkLlxuICAgICMjIyAgIFxuICAgIGNsZWFyQ3VzdG9tT2JqZWN0czogLT5cbiAgICAgICAgZm9yIG9iamVjdCBpbiBAY3VzdG9tT2JqZWN0c1xuICAgICAgICAgICAgb2JqZWN0LmRpc3Bvc2UoKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnJlbW92ZU9iamVjdChvYmplY3QpXG4gICAgICAgICAgICBcbiAgICAgICAgQGN1c3RvbU9iamVjdHMgPSBbXVxuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIGJpdG1hcCBmb3IgYSBzcGVjaWZpZWQgbGluZS1vYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVCaXRtYXBcbiAgICAqIEBwcml2YXRlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGluZSAtIEEgbGluZS1vYmplY3QuXG4gICAgKiBAcmV0dXJuIHtCaXRtYXB9IEEgbmV3bHkgY3JlYXRlZCBiaXRtYXAgY29udGFpbmluZyB0aGUgbGluZS10ZXh0LlxuICAgICMjI1xuICAgIGNyZWF0ZUJpdG1hcDogKGxpbmUpIC0+XG4gICAgICAgIEBmb250ID0gQG9iamVjdC5mb250XG4gICAgICAgIGJpdG1hcCA9IG5ldyBCaXRtYXAoQG9iamVjdC5kc3RSZWN0LndpZHRoLCBNYXRoLm1heChAbWluTGluZUhlaWdodCwgbGluZS5oZWlnaHQpKVxuICAgICAgICBiaXRtYXAuZm9udCA9IEBmb250XG4gICAgICAgXG4gICAgICAgIHJldHVybiBiaXRtYXBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBEcmF3cyB0aGUgbGluZSdzIGNvbnRlbnQgb24gdGhlIHNwZWNpZmllZCBiaXRtYXAuXG4gICAgKlxuICAgICogQG1ldGhvZCBkcmF3TGluZUNvbnRlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaW5lIC0gQSBsaW5lLW9iamVjdCB3aGljaCBzaG91bGQgYmUgZHJhd24gb24gdGhlIGJpdG1hcC5cbiAgICAqIEBwYXJhbSB7Z3MuQml0bWFwfSBiaXRtYXAgLSBUaGUgYml0bWFwIHRvIGRyYXcgdGhlIGxpbmUncyBjb250ZW50IG9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAtIERldGVybWluZXMgaG93IG1hbnkgY2hhcmFjdGVycyBvZiB0aGUgc3BlY2lmaWVkIGxpbmUgc2hvdWxkIGJlIGRyYXduLiBZb3UgY2FuIFxuICAgICogc3BlY2lmeSAtMSB0byBkcmF3IGFsbCBjaGFyYWN0ZXJzLlxuICAgICMjI1xuICAgIGRyYXdMaW5lQ29udGVudDogKGxpbmUsIGJpdG1hcCwgbGVuZ3RoKSAtPlxuICAgICAgICBiaXRtYXAuY2xlYXIoKVxuICAgICAgICBjdXJyZW50WCA9IEBwYWRkaW5nXG4gICAgICAgIGRyYXdBbGwgPSBsZW5ndGggPT0gLTFcbiAgICAgICAgXG4gICAgICAgIGZvciB0b2tlbiwgaSBpbiBsaW5lLmNvbnRlbnRcbiAgICAgICAgICAgIGJyZWFrIGlmIGkgPiBAdG9rZW5JbmRleCBhbmQgIWRyYXdBbGxcbiAgICAgICAgICAgIGlmIHRva2VuLmNvZGU/XG4gICAgICAgICAgICAgICAgc2l6ZSA9IEBtZWFzdXJlQ29udHJvbFRva2VuKHRva2VuLCBiaXRtYXApXG4gICAgICAgICAgICAgICAgQGRyYXdDb250cm9sVG9rZW4odG9rZW4sIGJpdG1hcCwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgaWYgc2l6ZSB0aGVuIGN1cnJlbnRYICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBAcHJvY2Vzc0NvbnRyb2xUb2tlbih0b2tlbiwgeWVzLCBsaW5lKVxuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbi52YWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgdG9rZW4uYXBwbHlGb3JtYXQoQGZvbnQpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZVxuICAgICAgICAgICAgICAgIGlmICFkcmF3QWxsIGFuZCBAdG9rZW5JbmRleCA9PSBpIGFuZCB2YWx1ZS5sZW5ndGggPiBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgbGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlICE9IFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4odmFsdWUpICBcbiAgICAgICAgICAgICAgICAgICAgYml0bWFwLmRyYXdUZXh0KGN1cnJlbnRYLCBsaW5lLmhlaWdodCAtIChzaXplLmhlaWdodCAtIEBmb250LmRlc2NlbnQpIC0gbGluZS5kZXNjZW50LCBzaXplLndpZHRoLCBiaXRtYXAuaGVpZ2h0LCB2YWx1ZSwgMCwgMClcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFggKz0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBsaW5lLmNvbnRlbnRXaWR0aCA9IGN1cnJlbnRYICsgQGZvbnQubWVhc3VyZVRleHRQbGFpbihcIiBcIikud2lkdGggICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgc3ByaXRlIGZvciBhIHNwZWNpZmllZCBsaW5lLW9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVNwcml0ZVxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaW5lIC0gQSBsaW5lLW9iamVjdC5cbiAgICAqIEByZXR1cm4ge1Nwcml0ZX0gQSBuZXdseSBjcmVhdGVkIHNwcml0ZSBvYmplY3QgY29udGFpbmluZyB0aGUgbGluZS10ZXh0IGFzIGJpdG1hcC5cbiAgICAjIyNcbiAgICBjcmVhdGVTcHJpdGU6IChsaW5lKSAtPlxuICAgICAgICBiaXRtYXAgPSBAY3JlYXRlQml0bWFwKGxpbmUpXG4gICAgICAgIFxuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBzcHJpdGUgPSBuZXcgU3ByaXRlKEdyYXBoaWNzLnZpZXdwb3J0KVxuICAgICAgICBzcHJpdGUuYml0bWFwID0gYml0bWFwXG4gICAgICAgIHNwcml0ZS52aXNpYmxlID0geWVzXG4gICAgICAgIHNwcml0ZS56ID0gQG9iamVjdC56SW5kZXggKyAxXG4gICAgICAgIFxuICAgICAgICBzcHJpdGUuc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIDAsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc3ByaXRlXG4gICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIHNwcml0ZXMgZm9yIGEgc3BlY2lmaWVkIGFycmF5IG9mIGxpbmUtb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVNwcml0ZXNcbiAgICAqIEBwcml2YXRlXG4gICAgKiBAc2VlIGdzLkNvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyLmNyZWF0ZVNwcml0ZS5cbiAgICAqIEBwYXJhbSB7QXJyYXl9IGxpbmVzIC0gQW4gYXJyYXkgb2YgbGluZS1vYmplY3RzLlxuICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIHNwcml0ZXMuXG4gICAgIyMjXG4gICAgY3JlYXRlU3ByaXRlczogKGxpbmVzKSAtPlxuICAgICAgICBAZm9udFNpemUgPSBAb2JqZWN0LmZvbnQuc2l6ZVxuICAgICAgICByZXN1bHQgPSBbXVxuICAgICAgICBmb3IgbGluZSwgaSBpbiBsaW5lc1xuICAgICAgICAgICAgc3ByaXRlID0gQGNyZWF0ZVNwcml0ZShsaW5lKVxuICAgICAgICAgICAgcmVzdWx0LnB1c2goc3ByaXRlKVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgIyMjKlxuICAgICogU3RhcnRzIGEgbmV3IGxpbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBuZXdMaW5lXG4gICAgIyMjXG4gICAgbmV3TGluZTogLT5cbiAgICAgICAgQGN1cnJlbnRYID0gMFxuICAgICAgICBAY3VycmVudFkgKz0gQGN1cnJlbnRMaW5lSGVpZ2h0ICsgQGxpbmVTcGFjaW5nXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3BsYXlzIGEgZm9ybWF0dGVkIHRleHQgaW1tZWRpYXRlbHkgd2l0aG91dCBhbnkgZGVsYXlzIG9yIGFuaW1hdGlvbnMuIFRoZVxuICAgICogQ29tcG9uZW50X1RleHRSZW5kZXJlci5kcmF3Rm9ybWF0dGVkVGV4dCBtZXRob2QgZnJvbSB0aGUgYmFzZS1jbGFzcyBjYW5ub3RcbiAgICAqIGJlIHVzZWQgaGVyZSBiZWNhdXNlIGl0IHdvdWxkIHJlbmRlciB0byB0aGUgZ2FtZSBvYmplY3QncyBiaXRtYXAgb2JqZWN0IHdoaWxlXG4gICAgKiB0aGlzIG1ldGhvZCBpcyByZW5kZXJpbmcgdG8gdGhlIHNwcml0ZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBkcmF3Rm9ybWF0dGVkVGV4dEltbWVkaWF0ZWx5XG4gICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGRyYXcuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdvcmRXcmFwIC0gSWYgd29yZFdyYXAgaXMgc2V0IHRvIHRydWUsIGxpbmUtYnJlYWtzIGFyZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQuXG4gICAgIyMjXG4gICAgZHJhd0Zvcm1hdHRlZFRleHRJbW1lZGlhdGVseTogKHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHQsIHdvcmRXcmFwKSAtPlxuICAgICAgICBAZHJhd0Zvcm1hdHRlZFRleHQoeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dCwgd29yZFdyYXApXG4gICAgICAgIFxuICAgICAgICBsb29wXG4gICAgICAgICAgICBAbmV4dENoYXIoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGxpbmUgPj0gQG1heExpbmVzXG4gICAgICAgICAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGRyYXdOZXh0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIHVubGVzcyBAaXNSdW5uaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgQGN1cnJlbnRZICs9IEBjdXJyZW50TGluZUhlaWdodCArIEBsaW5lU3BhY2luZ1xuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSByZW5kZXJpbmctcHJvY2VzcyBmb3IgdGhlIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBkcmF3Rm9ybWF0dGVkVGV4dFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBkcmF3LlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkLlxuICAgICMjI1xuICAgIGRyYXdGb3JtYXR0ZWRUZXh0OiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dCwgd29yZFdyYXApIC0+XG4gICAgICAgIHRleHQgPSB0ZXh0IHx8IFwiIFwiICMgVXNlIGEgc3BhY2UgY2hhcmFjdGVyIGlmIG5vIHRleHQgaXMgc3BlY2lmaWVkLlxuICAgICAgICBAZm9udC5zZXQoQG9iamVjdC5mb250KVxuICAgICAgICBAc3BlZWQgPSAxMSAtIE1hdGgucm91bmQoR2FtZU1hbmFnZXIuc2V0dGluZ3MubWVzc2FnZVNwZWVkICogMi41KVxuICAgICAgICBAaXNSdW5uaW5nID0geWVzXG4gICAgICAgIEBkcmF3SW1tZWRpYXRlbHkgPSBub1xuICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50ID0gQHNwZWVkXG4gICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0Rm9yS2V5ID0gbm9cbiAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgQHRva2VuID0gbnVsbFxuICAgICAgICBAdG9rZW5JbmRleCA9IDBcbiAgICAgICAgQG1lc3NhZ2UgPSB0ZXh0XG4gICAgICAgIEBsaW5lID0gMFxuICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZVxuICAgICAgICBjdXJyZW50WCA9IEBjdXJyZW50WCAjTWF0aC5tYXgoQGN1cnJlbnRYLCBAcGFkZGluZylcbiAgICAgICAgQGxpbmVzID0gQGNhbGN1bGF0ZUxpbmVzKGxjc20oQG1lc3NhZ2UpLCB3b3JkV3JhcCwgQGN1cnJlbnRYKVxuICAgICAgICBAc3ByaXRlcyA9IEBjcmVhdGVTcHJpdGVzKEBsaW5lcylcbiAgICAgICAgQGFsbFNwcml0ZXMgPSBAYWxsU3ByaXRlcy5jb25jYXQoQHNwcml0ZXMpXG4gICAgICAgIEBjdXJyZW50WCA9IGN1cnJlbnRYXG4gICAgICAgIEBjdXJyZW50U3ByaXRlID0gQHNwcml0ZXNbQGxpbmVdXG4gICAgICAgIEBjdXJyZW50U3ByaXRlLnggPSBAY3VycmVudFggKyBAb2JqZWN0Lm9yaWdpbi54ICsgQG9iamVjdC5kc3RSZWN0LnhcbiAgICAgICAgQG1heExpbmVzID0gQGNhbGN1bGF0ZU1heExpbmVzKEBsaW5lcylcbiAgICAgICAgQHRva2VuID0gQGxpbmVzW0BsaW5lXT8uY29udGVudFtAdG9rZW5JbmRleF0gfHwgbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcIilcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAc3RhcnQoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIG1lc3NhZ2UtcmVuZGVyaW5nIHByb2Nlc3MuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdGFydFxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICAgXG4gICAgc3RhcnQ6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPT0gMFxuICAgICAgICAgICAgQGluc3RhbnRTa2lwKClcbiAgICAgICAgZWxzZSBpZiBAbWF4TGluZXMgPT0gMFxuICAgICAgICAgICAgIyBJZiBmaXJzdCBsaW5lIGlzIGVtcHR5IHRoZW4gaXQgZG9lc24ndCBmaXQgaW50byBjdXJyZW50IGxpbmUsIHNvIGZpbmlzaC5cbiAgICAgICAgICAgIGlmIEBsaW5lc1swXT8uY29udGVudCA9PSBcIlwiXG4gICAgICAgICAgICAgICAgQGZpbmlzaCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1heExpbmVzID0gMVxuICAgICAgICAgICAgICAgIEBkcmF3TmV4dCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkcmF3TmV4dCgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBjdXJyZW50IG1lc3NhZ2UgYW5kIGZpbmlzaGVzIHRoZSBtZXNzYWdlLXByb2Nlc3NpbmcgaW1tZWRpYXRlbHkuIFRoZSBtZXNzYWdlXG4gICAgKiB0b2tlbnMgYXJlIHByb2Nlc3NlZCBidXQgbm90IHJlbmRlcmVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5zdGFudFNraXBcbiAgICAjIyMgIFxuICAgIGluc3RhbnRTa2lwOiAtPlxuICAgICAgICBsb29wXG4gICAgICAgICAgICBpZiBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgIEBuZXh0Q2hhcigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAbGluZSA+PSBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwcm9jZXNzVG9rZW4oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgdW5sZXNzIEBpc1J1bm5pbmcgYW5kIEBsaW5lIDwgQG1heExpbmVzXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VXYWl0aW5nXCIsIHRoaXMpXG4gICAgICAgIEBjb250aW51ZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFByb2Nlc3NlcyB0aGUgY3VycmVudCB0b2tlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NUb2tlblxuICAgICMjIyAgICBcbiAgICBwcm9jZXNzVG9rZW46IC0+XG4gICAgICAgIHRva2VuID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgQHRva2VuLmNvZGU/XG4gICAgICAgICAgICB0b2tlbiA9IEBwcm9jZXNzQ29udHJvbFRva2VuKEB0b2tlbiwgbm8pXG4gICAgICAgICAgICBpZiB0b2tlbj9cbiAgICAgICAgICAgICAgICBAdG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgICAgIEB0b2tlbi5vblN0YXJ0PygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRva2VuID0gQHRva2VuXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRva2VuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG5ncy5Db21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlciA9IENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyIl19
//# sourceURL=Component_MessageTextRenderer_126.js