var Component_MessageTextRenderer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_MessageTextRenderer = (function(superClass) {
  extend(Component_MessageTextRenderer, superClass);

  Component_MessageTextRenderer.objectCodecBlackList = ["onLinkClick", "onBatchDisappear"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
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
      return SceneManager.scene.interpreter.callCommonEvent(eventId, null, true);
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
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
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
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_MessageTextRenderer.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        if (GameManager.settings.autoMessage.enabled && !GameManager.settings.autoMessage.stopOnAction) {
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
    var lineSpacing, s, size, token;
    token = this.processToken();
    if ((token != null ? token.value.length : void 0) > 0) {
      this.char = this.token.value.charAt(this.charIndex);
      size = this.font.measureTextPlain(this.char);
      s = Graphics.scale;
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
    switch (token.code) {
      case "RT":
        return Component_MessageTextRenderer.__super__.drawControlToken.call(this, token, bitmap, offset, length);
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
    var animation, bitmap, character, duration, easing, expression, line, linkStart, object, params, ref, ref1, result, sound, textTokens, values;
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
        animation = RecordManager.animations[Math.max(token.value - 1, 0)];
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
          this.currentSprite.bitmap.clearRect(this.customData.linkData.cx, this.customData.linkData.cy, this.currentX - this.customData.linkData.cx + this.object.font.borderSize * 2, this.currentLineHeight);
          line = this.lines[this.line].content;
          linkStart = this.findToken(this.tokenIndex - 1, "SLK", -1, line);
          textTokens = this.findTokensBetween(this.customData.linkData.tokenIndex, this.tokenIndex, null, line);
          object = new ui.Object_Text();
          object.text = textTokens.select((function(_this) {
            return function(x) {
              return x.value;
            };
          })(this)).join("");
          object.sizeToFit = true;
          object.formatting = true;
          object.wordWrap = false;
          object.ui = new ui.Component_UIBehavior();
          object.enabled = true;
          object.addComponent(object.ui);
          object.addComponent(new gs.Component_HotspotBehavior());
          if (this.customData.linkData.styleIndex === -1) {
            ui.UIManager.addControlStyles(object, ["hyperlink"]);
          } else {
            ui.UIManager.addControlStyles(object, ["hyperlink-" + this.customData.linkData.styleIndex]);
          }
          object.setup();
          this.addCustomObject(object);
          object.dstRect.x = this.object.dstRect.x + this.object.origin.x + this.customData.linkData.cx;
          object.dstRect.y = this.object.dstRect.y + this.object.origin.y + this.customData.linkData.cy;
          object.events.on("click", gs.CallBack("onLinkClick", this), {
            linkData: this.customData.linkData
          }, this);
        } else {
          if ((ref1 = token.value) != null ? ref1.contains(",") : void 0) {
            values = token.value.split(",");
            this.customData.linkData = {
              cx: this.currentX,
              cy: this.currentY,
              commonEventId: values[0],
              styleIndex: parseInt(values[1]),
              tokenIndex: this.tokenIndex
            };
          } else {
            this.customData.linkData = {
              cx: this.currentX,
              cy: this.currentY,
              commonEventId: token.value,
              tokenIndex: this.tokenIndex,
              styleIndex: -1
            };
          }
        }
        break;
      case "E":
        expression = RecordManager.characterExpressions[Math.max(token.value - 1, 0)];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07OztFQUNGLDZCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxhQUFELEVBQWdCLGtCQUFoQjs7O0FBQ3hCOzs7Ozs7Ozs7MENBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsSUFBQyxDQUFBLGtCQUFELENBQUE7SUFDQSxDQUFBLEdBQUk7QUFFSjtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBcEI7UUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLEdBQXlCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQTNCLEVBRDdCOztNQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQSxDQUFLLE9BQU8sQ0FBQyxJQUFiLENBQWhCLEVBQW9DLElBQXBDLEVBQXlDLENBQXpDO0FBQ1Q7QUFBQSxXQUFBLHdDQUFBOztRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQ7UUFDVCxJQUFHLElBQUEsS0FBUSxJQUFDLENBQUEsSUFBWjtVQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQWpCLEVBQXVCLE1BQXZCLEVBQStCLElBQUMsQ0FBQSxTQUFELEdBQVcsQ0FBMUMsRUFESjtTQUFBLE1BQUE7VUFHSSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQUF1QixNQUF2QixFQUErQixDQUFDLENBQWhDLEVBSEo7O1FBSUEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFmLEdBQXdCO1FBQ3hCLENBQUE7QUFQSjtBQUpKO0FBY0E7QUFBQSxTQUFBLHdDQUFBOztNQUNJLFlBQVksQ0FB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O2NBQ0gsQ0FBQztTQUZYO09BRko7S0FBQSxNQUFBO01BTUksS0FBQSxHQUFRLElBQUMsQ0FBQSxNQU5iOztBQVFBLFdBQU87RUFYRzs7OztHQXZxQzBCLEVBQUUsQ0FBQzs7QUFzckMvQyxFQUFFLENBQUMsNkJBQUgsR0FBbUMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlciBleHRlbmRzIGdzLkNvbXBvbmVudF9UZXh0UmVuZGVyZXJcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvbkxpbmtDbGlja1wiLCBcIm9uQmF0Y2hEaXNhcHBlYXJcIl1cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIGwgPSAwXG4gICAgICAgIFxuICAgICAgICBmb3IgbWVzc2FnZSBpbiBAb2JqZWN0Lm1lc3NhZ2VzXG4gICAgICAgICAgICBpZiBAb2JqZWN0LnNldHRpbmdzLnVzZUNoYXJhY3RlckNvbG9yXG4gICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmNvbG9yID0gbmV3IGdzLkNvbG9yKG1lc3NhZ2UuY2hhcmFjdGVyLnRleHRDb2xvcilcbiAgICAgICAgICAgIEBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyhsY3NtKG1lc3NhZ2UudGV4dCksIHllcywgMClcbiAgICAgICAgICAgIGZvciBsaW5lIGluIEBsaW5lc1xuICAgICAgICAgICAgICAgIGJpdG1hcCA9IEBjcmVhdGVCaXRtYXAobGluZSlcbiAgICAgICAgICAgICAgICBpZiBsaW5lID09IEBsaW5lXG4gICAgICAgICAgICAgICAgICAgIEBkcmF3TGluZUNvbnRlbnQobGluZSwgYml0bWFwLCBAY2hhckluZGV4KzEpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAZHJhd0xpbmVDb250ZW50KGxpbmUsIGJpdG1hcCwgLTEpXG4gICAgICAgICAgICAgICAgQGFsbFNwcml0ZXNbbF0uYml0bWFwID0gYml0bWFwXG4gICAgICAgICAgICAgICAgbCsrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgXG4gICAgICAgIGZvciBjdXN0b21PYmplY3QgaW4gQGN1c3RvbU9iamVjdHNcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5hZGRPYmplY3QoY3VzdG9tT2JqZWN0KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiAgQSB0ZXh0LXJlbmRlcmVyIGNvbXBvbmVudCB0byByZW5kZXIgYW4gYW5pbWF0ZWQgYW5kIGludGVyYWN0aXZlIG1lc3NhZ2UgdGV4dCB1c2luZ1xuICAgICogIGRpbWVuc2lvbnMgb2YgdGhlIGdhbWUgb2JqZWN0J3MgZGVzdGluYXRpb24tcmVjdGFuZ2xlLiBUaGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWRcbiAgICAqICB1c2luZyBhIHNwcml0ZSBmb3IgZWFjaCBsaW5lIGluc3RlYWQgb2YgZHJhd2luZyB0byB0aGUgZ2FtZSBvYmplY3QncyBiaXRtYXAgb2JqZWN0LlxuICAgICpcbiAgICAqICBAbW9kdWxlIGdzXG4gICAgKiAgQGNsYXNzIENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyXG4gICAgKiAgQGV4dGVuZHMgZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlclxuICAgICogIEBtZW1iZXJvZiBnc1xuICAgICogIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHNwcml0ZXMgb2YgdGhlIGN1cnJlbnQgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc3ByaXRlc1xuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHNwcml0ZXMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHNwcml0ZXMgb2YgYWxsIG1lc3NhZ2VzLiBJbiBOVkwgbW9kZVxuICAgICAgICAqIGEgcGFnZSBjYW4gY29udGFpbiBtdWx0aXBsZSBtZXNzYWdlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgYWxsU3ByaXRlc1xuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGFsbFNwcml0ZXMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gYXJyYXkgY29udGFpbmluZyBhbGwgbGluZS1vYmplY3RzIG9mIHRoZSBjdXJyZW50IG1lc3NhZ2UuXG4gICAgICAgICogQHByb3BlcnR5IGxpbmVzXG4gICAgICAgICogQHR5cGUgZ3MuVGV4dFJlbmRlcmVyTGluZVtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbGluZXMgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsaW5lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbGluZSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGVmdCBhbmQgcmlnaHQgcGFkZGluZyBwZXIgbGluZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSA2XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSBsaW5lIGN1cnJlbnRseSByZW5kZXJlZC4gSWYgMCwgdGhlIG1lYXN1cmVkXG4gICAgICAgICogaGVpZ2h0IG9mIHRoZSBsaW5lIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgbWluTGluZUhlaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQG1pbkxpbmVIZWlnaHQgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNwYWNpbmcgYmV0d2VlbiB0ZXh0IGxpbmVzIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgbGluZVNwYWNpbmdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBsaW5lU3BhY2luZyA9IDJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGluZSBjdXJyZW50bHkgcmVuZGVyZWQuXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRMaW5lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRMaW5lID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50TGluZUhlaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRleCBvZiB0aGUgY3VycmVudCBjaGFyYWN0ZXIgdG8gZHJhdy5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhckluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFBvc2l0aW9uIG9mIHRoZSBtZXNzYWdlIGNhcmV0LiBUaGUgY2FyZXQgaXMgbGlrZSBhbiBpbnZpc2libGVcbiAgICAgICAgKiBjdXJzb3IgcG9pbnRpbmcgdG8gdGhlIHgveSBjb29yZGluYXRlcyBvZiB0aGUgbGFzdCByZW5kZXJlZCBjaGFyYWN0ZXIgb2ZcbiAgICAgICAgKiB0aGUgbWVzc2FnZS4gVGhhdCBwb3NpdGlvbiBjYW4gYmUgdXNlZCB0byBkaXNwbGF5IGEgd2FpdGluZy0gb3IgcHJvY2Vzc2luZy1hbmltYXRpb24gZm9yIGV4YW1wbGUuXG4gICAgICAgICogQHByb3BlcnR5IGNhcmV0UG9zaXRpb25cbiAgICAgICAgKiBAdHlwZSBncy5Qb2ludFxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGNhcmV0UG9zaXRpb24gPSBuZXcgZ3MuUG9pbnQoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyB0aGF0IHRoZSBhIG1lc3NhZ2UgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpc1J1bm5pbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB4LWNvb3JkaW5hdGUgb2YgdGhlIGNhcmV0L2N1cnNvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB5LWNvb3JkaW5hdGUgb2YgdGhlIGNhcmV0L2N1cnNvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFlcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzcHJpdGVzIHVzZWQgdG8gZGlzcGxheSB0aGUgY3VycmVudCB0ZXh0LWxpbmUvcGFydC5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFNwcml0ZVxuICAgICAgICAqIEB0eXBlIGdzLlNwcml0ZVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlLXJlbmRlcmVyIGlzIGN1cnJlbnRseSB3YWl0aW5nIGxpa2UgZm9yIGEgdXNlci1hY3Rpb24uXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbWVzc2FnZS1yZW5kZXJlciBpcyBjdXJyZW50bHkgd2FpdGluZyBmb3IgYSBrZXktcHJlc3Mgb3IgbW91c2UvdG91Y2ggYWN0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Rm9yS2V5XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIE51bWJlciBvZiBmcmFtZXMgdGhlIG1lc3NhZ2UtcmVuZGVyZXIgc2hvdWxkIHdhaXQgYmVmb3JlIGNvbnRpbnVlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFNwZWVkIG9mIHRoZSBtZXNzYWdlLWRyYXdpbmcuIFRoZSBzbWFsbGVyIHRoZSB2YWx1ZSwgdGhlIGZhc3RlciB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNwZWVkXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAc3BlZWQgPSAxXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlIHNob3VsZCBiZSByZW5kZXJlZCBpbW1lZGlhbHRlbHkgd2l0aG91dCBhbnkgYW5pbWF0aW9uIG9yIGRlbGF5LlxuICAgICAgICAqIEBwcm9wZXJ0eSBkcmF3SW1tZWRpYXRlbHlcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1lc3NhZ2Ugc2hvdWxkIHdhaXQgZm9yIGEgdXNlci1hY3Rpb24gb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lXG4gICAgICAgICogYmVmb3JlIGZpbmlzaGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEF0RW5kXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRBdEVuZCA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBudW1iZXIgb2YgZnJhbWVzIHRvIHdhaXQgYmVmb3JlIGZpbmlzaGluZyBhIG1lc3NhZ2UuXG4gICAgICAgICogYmVmb3JlIGZpbmlzaGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEF0RW5kVGltZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRBdEVuZFRpbWUgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIGF1dG8gd29yZC13cmFwIHNob3VsZCBiZSB1c2VkLiBEZWZhdWx0IGlzIDxiPnRydWU8L2I+XG4gICAgICAgICogQHByb3BlcnR5IHdvcmRXcmFwXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHdvcmRXcmFwID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VzdG9tIGdhbWUgb2JqZWN0cyB3aGljaCBhcmUgYWxpdmUgdW50aWwgdGhlIGN1cnJlbnQgbWVzc2FnZSBpcyBlcmFzZWQuIENhbiBiZSB1c2VkIHRvIGRpc3BsYXlcbiAgICAgICAgKiBhbmltYXRlZCBpY29ucywgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21PYmplY3RzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0Jhc2VbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGN1c3RvbU9iamVjdHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEEgaGFzaHRhYmxlL2RpY3Rpb25hcnkgb2JqZWN0IHRvIHN0b3JlIGN1c3RvbS1kYXRhIHVzZWZ1bCBsaWtlIGZvciB0b2tlbi1wcm9jZXNzaW5nLiBUaGUgZGF0YSBtdXN0IGJlXG4gICAgICAgICogc2VyaWFsaXphYmxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21PYmplY3RzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY3VzdG9tRGF0YSA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgdGhlIHBsYXllciBjbGlja3Mgb24gYSBub24tc3R5bGFibGUgbGluayAoTEsgdGV4dC1jb2RlKSB0byB0cmlnZ2VyXG4gICAgICAgICogdGhlIHNwZWNpZmllZCBjb21tb24gZXZlbnQuXG4gICAgICAgICogQHByb3BlcnR5IG9uTGlua0NsaWNrXG4gICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBvbkxpbmtDbGljayA9IChlKSAtPlxuICAgICAgICAgICAgZXZlbnRJZCA9IGUuZGF0YS5saW5rRGF0YS5jb21tb25FdmVudElkXG4gICAgICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdXG4gICAgICAgICAgICBpZiAhZXZlbnRcbiAgICAgICAgICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzLmZpcnN0ICh4KSA9PiB4Lm5hbWUgPT0gZXZlbnRJZFxuICAgICAgICAgICAgICAgIGV2ZW50SWQgPSBldmVudC5pbmRleCBpZiBldmVudFxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmNhbGxDb21tb25FdmVudChldmVudElkLCBudWxsLCB5ZXMpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgYSBiYXRjaGVkIG1lc3NzYWdlIGhhcyBiZWVuIGZhZGVkIG91dC4gSXQgdHJpZ2dlcnMgdGhlIGV4ZWN1dGlvbiBvZlxuICAgICAgICAqIHRoZSBuZXh0IG1lc3NhZ2UuXG4gICAgICAgICogQHByb3BlcnR5IG9uQmF0Y2hEaXNhcHBlYXJcbiAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAjIyMgICAgXG4gICAgICAgIEBvbkJhdGNoRGlzYXBwZWFyID0gKGUpID0+IFxuICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIEBvYmplY3Qub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgQGV4ZWN1dGVCYXRjaCgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXJpYWxpemVzIHRoZSBtZXNzYWdlIHRleHQtcmVuZGVyZXIgaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBkYXRhLWJ1bmRsZS5cbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGlnbm9yZSA9IFtcIm9iamVjdFwiLCBcImZvbnRcIiwgXCJzcHJpdGVzXCIsIFwiYWxsU3ByaXRlc1wiLCBcImN1cnJlbnRTcHJpdGVcIiwgXCJjdXJyZW50WFwiXVxuICAgICAgICBidW5kbGUgPSB7IGN1cnJlbnRTcHJpdGVJbmRleDogQHNwcml0ZXMuaW5kZXhPZihAY3VycmVudFNwcml0ZSkgfVxuICAgICAgICBcbiAgICAgICAgZm9yIGsgb2YgdGhpc1xuICAgICAgICAgICAgaWYgaWdub3JlLmluZGV4T2YoaykgPT0gLTFcbiAgICAgICAgICAgICAgICBidW5kbGVba10gPSB0aGlzW2tdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBidW5kbGVcbiAgICAgXG4gICAgXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgbWVzc2FnZSB0ZXh0LXJlbmRlcmVyIGFuZCBhbGwgc3ByaXRlcyB1c2VkIHRvIGRpc3BsYXlcbiAgICAqIHRoZSBtZXNzYWdlLlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgIFxuICAgICAgICBmb3Igc3ByaXRlIGluIEBhbGxTcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwPy5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXJzIGZvciBtb3VzZS90b3VjaCBldmVudHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRXZlbnRIYW5kbGVyc1xuICAgICMjIyBcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZVVwXCIsICgoZSkgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiAoR2FtZU1hbmFnZXIuc2V0dGluZ3MuYXV0b01lc3NhZ2UuZW5hYmxlZCBhbmQgIUdhbWVNYW5hZ2VyLnNldHRpbmdzLmF1dG9NZXNzYWdlLnN0b3BPbkFjdGlvbilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICNpZiBAb2JqZWN0LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55KVxuICAgICAgICAgICAgaWYgQGlzV2FpdGluZyBhbmQgbm90IChAd2FpdENvdW50ZXIgPiAwIG9yIEB3YWl0Rm9yS2V5KVxuICAgICAgICAgICAgICAgIGUuYnJlYWtDaGFpbiA9IHllc1xuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0gQGlzUnVubmluZ1xuICAgICAgICAgICAgICAgIEBkcmF3SW1tZWRpYXRlbHkgPSAhQHdhaXRGb3JLZXlcbiAgICAgICAgICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG4gICAgICAgICAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHdhaXRGb3JLZXlcbiAgICAgICAgICAgICAgICBpZiBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdID09IDJcbiAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICAgICAgICAgIElucHV0LmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICAgICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICksIG51bGwsIEBvYmplY3RcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcImtleVVwXCIsICgoZSkgPT5cbiAgICAgICAgICAgIGlmIElucHV0LmtleXNbSW5wdXQuQ10gYW5kICghQGlzV2FpdGluZyBvciAoQHdhaXRDb3VudGVyID4gMCBvciBAd2FpdEZvcktleSkpXG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9ICFAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAaXNXYWl0aW5nIGFuZCAhQHdhaXRGb3JLZXkgYW5kICFAd2FpdENvdW50ZXIgYW5kIElucHV0LmtleXNbSW5wdXQuQ11cbiAgICAgICAgICAgICAgICBAY29udGludWUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHdhaXRGb3JLZXlcbiAgICAgICAgICAgICAgICBpZiBJbnB1dC5rZXlzW0lucHV0LkNdXG4gICAgICAgICAgICAgICAgICAgIElucHV0LmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICAgICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgKSwgbnVsbCwgQG9iamVjdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSByZW5kZXJlci4gUmVnaXN0ZXJzIG5lY2Vzc2FyeSBldmVudCBoYW5kbGVycy5cbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyMgXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgbWVzc2FnZSB0ZXh0LXJlbmRlcmVyJ3Mgc3RhdGUgZnJvbSBhIGRhdGEtYnVuZGxlLlxuICAgICogQG1ldGhvZCByZXN0b3JlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYnVuZGxlIC0gQSBkYXRhLWJ1bmRsZSBjb250YWluaW5nIG1lc3NhZ2UgdGV4dC1yZW5kZXJlciBzdGF0ZS5cbiAgICAjIyNcbiAgICByZXN0b3JlOiAoYnVuZGxlKSAtPlxuICAgICAgICBmb3IgayBvZiBidW5kbGVcbiAgICAgICAgICAgIGlmIGsgPT0gXCJjdXJyZW50U3ByaXRlSW5kZXhcIlxuICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlID0gQHNwcml0ZXNbYnVuZGxlLmN1cnJlbnRTcHJpdGVJbmRleF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzW2tdID0gYnVuZGxlW2tdXG4gICAgICAgIFxuICAgICAgICBpZiBAc3ByaXRlcy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAY3VycmVudFkgPSBAc3ByaXRlcy5sYXN0KCkueSAtIEBvYmplY3Qub3JpZ2luLnkgLSBAb2JqZWN0LmRzdFJlY3QueVxuICAgICAgICAgICAgQGxpbmUgPSBAbWF4TGluZXNcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBAaXNXYWl0aW5nIHx8IEBpc1J1bm5pbmdcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbCAgICBcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDb250aW51ZXMgbWVzc2FnZS1wcm9jZXNzaW5nIGlmIGN1cnJlbnRseSB3YWl0aW5nLlxuICAgICogQG1ldGhvZCBjb250aW51ZVxuICAgICMjI1xuICAgIGNvbnRpbnVlOiAtPiBcbiAgICAgICAgI0lucHV0LmNsZWFyKClcbiAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICBcbiAgICAgICAgaWYgQGxpbmUgPj0gQGxpbmVzLmxlbmd0aFxuICAgICAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VGaW5pc2hcIiwgdGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlQmF0Y2hcIiwgdGhpcylcbiAgICAgICAgICAgIGZhZGluZyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZXNzYWdlRmFkaW5nXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIHRoZW4gMCBlbHNlIGZhZGluZy5kdXJhdGlvblxuICAgICAgICAgICAgQG9iamVjdC5hbmltYXRvci5kaXNhcHBlYXIoZmFkaW5nLmFuaW1hdGlvbiwgZmFkaW5nLmVhc2luZywgZHVyYXRpb24sIGdzLkNhbGxCYWNrKFwib25CYXRjaERpc2FwcGVhclwiLCB0aGlzKSlcbiAgICAgICAgICAgICNAZXhlY3V0ZUJhdGNoKClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHRleHQtcmVuZGVyZXIuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgZm9yIHNwcml0ZSBpbiBAYWxsU3ByaXRlc1xuICAgICAgICAgICAgc3ByaXRlLm9wYWNpdHkgPSBAb2JqZWN0Lm9wYWNpdHlcbiAgICAgICAgICAgIHNwcml0ZS52aXNpYmxlID0gQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICBzcHJpdGUub3ggPSAtQG9iamVjdC5vZmZzZXQueFxuICAgICAgICAgICAgc3ByaXRlLm95ID0gLUBvYmplY3Qub2Zmc2V0LnlcbiAgICAgICAgICAgIHNwcml0ZS5tYXNrLnZhbHVlID0gQG9iamVjdC5tYXNrLnZhbHVlXG4gICAgICAgICAgICBzcHJpdGUubWFzay52YWd1ZSA9IEBvYmplY3QubWFzay52YWd1ZVxuICAgICAgICAgICAgc3ByaXRlLm1hc2suc291cmNlID0gQG9iamVjdC5tYXNrLnNvdXJjZVxuICAgICAgICAgICAgc3ByaXRlLm1hc2sudHlwZSA9IEBvYmplY3QubWFzay50eXBlXG4gICAgXG4gICAgICAgIGZvciBvYmplY3QgaW4gQGN1c3RvbU9iamVjdHNcbiAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgICAgICBvYmplY3QudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAaXNSdW5uaW5nIGFuZCBAd2FpdENvdW50ZXIgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXItLVxuICAgICAgICAgICAgaWYgQHdhaXRDb3VudGVyID09IDBcbiAgICAgICAgICAgICAgICBAY29udGludWUoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QudmlzaWJsZSBhbmQgQGxpbmVzPy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAdXBkYXRlTGluZVdyaXRpbmcoKVxuICAgICAgICAgICAgQHVwZGF0ZVdhaXRGb3JLZXkoKVxuICAgICAgICAgICAgQHVwZGF0ZVdhaXRDb3VudGVyKClcbiAgICAgICAgICAgIEB1cGRhdGVDYXJldFBvc2l0aW9uKClcbiAgICAgICAgXG4gICAgIFxuICAgICMjIypcbiAgICAqIEluZGljYXRlcyBpZiBpdHMgYSBiYXRjaGVkIG1lc3NhZ2VzLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNCYXRjaGVkXG4gICAgKiBAcmV0dXJuIElmIDxiPnRydWU8L2I+IGl0IGlzIGEgYmF0Y2hlZCBtZXNzYWdlLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICMjI1xuICAgIGlzQmF0Y2hlZDogLT4gQGxpbmVzLmxlbmd0aCA+IEBtYXhMaW5lc1xuICAgIFxuICAgICMjIypcbiAgICAqIEluZGljYXRlcyBpZiB0aGUgYmF0Y2ggaXMgc3RpbGwgaW4gcHJvZ3Jlc3MgYW5kIG5vdCBkb25lLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNCYXRjaEluUHJvZ3Jlc3NcbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlIGJhdGNoZWQgbWVzc2FnZSBpcyBzdGlsbCBub3QgZG9uZS4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPlxuICAgICMjI1xuICAgIGlzQmF0Y2hJblByb2dyZXNzOiAtPiBAbGluZXMubGVuZ3RoIC0gQGxpbmUgPiBAbWF4TGluZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgZGlzcGxheWluZyB0aGUgbmV4dCBwYWdlIG9mIHRleHQgaWYgYSBtZXNzYWdlIGlzIHRvbyBsb25nIHRvIGZpdFxuICAgICogaW50byBvbmUgbWVzc2FnZSBib3guXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQmF0Y2hcbiAgICAjIyMgXG4gICAgZXhlY3V0ZUJhdGNoOiAtPlxuICAgICAgICBAY2xlYXJBbGxTcHJpdGVzKClcbiAgICAgICAgQGxpbmVzID0gQGxpbmVzLnNsaWNlKEBsaW5lKVxuICAgICAgICBAbGluZSA9IDBcbiAgICAgICAgQGN1cnJlbnRYID0gMFxuICAgICAgICBAY3VycmVudFkgPSAwICBcbiAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuICAgICAgICBAdG9rZW5JbmRleCA9IDBcbiAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgQHRva2VuID0gQGxpbmVzW0BsaW5lXS5jb250ZW50W0B0b2tlbkluZGV4XSB8fCBuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCBcIlwiKTtcbiAgICAgICAgQG1heExpbmVzID0gQGNhbGN1bGF0ZU1heExpbmVzKEBsaW5lcylcbiAgICAgICAgQGxpbmVBbmltYXRpb25Db3VudCA9IEBzcGVlZFxuICAgICAgICBAc3ByaXRlcyA9IEBjcmVhdGVTcHJpdGVzKEBsaW5lcylcbiAgICAgICAgQGFsbFNwcml0ZXMgPSBAYWxsU3ByaXRlcy5jb25jYXQoQHNwcml0ZXMpXG4gICAgICAgIEBjdXJyZW50U3ByaXRlID0gQHNwcml0ZXNbQGxpbmVdXG4gICAgICAgIEBjdXJyZW50U3ByaXRlLnggPSBAY3VycmVudFggKyBAb2JqZWN0Lm9yaWdpbi54ICsgQG9iamVjdC5kc3RSZWN0LnhcbiAgICAgICAgQGRyYXdOZXh0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBkdXJhdGlvbihpbiBmcmFtZXMpIHRoZSBtZXNzYWdlLXJlbmRlcmVyIG5lZWRzIHRvIGRpc3BsYXlcbiAgICAqIHRoZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2FsY3VsYXRlRHVyYXRpb25cbiAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAjIyMgICAgXG4gICAgY2FsY3VsYXRlRHVyYXRpb246IC0+XG4gICAgICAgIGR1cmF0aW9uID0gMFxuICAgICAgICBcbiAgICAgICAgaWYgQGxpbmVzP1xuICAgICAgICAgICAgZm9yIGxpbmUgaW4gQGxpbmVzXG4gICAgICAgICAgICAgICAgZm9yIHRva2VuIGluIGxpbmUuY29udGVudFxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbj9cbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uICs9IEBjYWxjdWxhdGVEdXJhdGlvbkZvclRva2VuKHRva2VuKVxuICAgICAgICByZXR1cm4gZHVyYXRpb25cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBkdXJhdGlvbihpbiBmcmFtZXMpIHRoZSBtZXNzYWdlLXJlbmRlcmVyIG5lZWRzIHRvIGRpc3BsYXlcbiAgICAqIHRoZSBzcGVjaWZpZWQgbGluZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZUR1cmF0aW9uRm9yTGluZVxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lfSBsaW5lIFRoZSBsaW5lIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb24gZm9yLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjIyAgICAgIFxuICAgIGNhbGN1bGF0ZUR1cmF0aW9uRm9yTGluZTogKGxpbmUpIC0+XG4gICAgICAgIGR1cmF0aW9uID0gMFxuICAgICAgICBcbiAgICAgICAgaWYgbGluZVxuICAgICAgICAgICAgZm9yIHRva2VuIGluIGxpbmUuY29udGVudFxuICAgICAgICAgICAgICAgIGlmIHRva2VuP1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBAY2FsY3VsYXRlRHVyYXRpb25Gb3JUb2tlbih0b2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gZHVyYXRpb25cbiAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsY3VsYXRlcyB0aGUgZHVyYXRpb24oaW4gZnJhbWVzKSB0aGUgbWVzc2FnZS1yZW5kZXJlciBuZWVkcyB0byBwcm9jZXNzXG4gICAgKiB0aGUgc3BlY2lmaWVkIHRva2VuLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2FsY3VsYXRlRHVyYXRpb25Gb3JUb2tlblxuICAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0fSB0b2tlbiAtIFRoZSB0b2tlbi5cbiAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAjIyMgICAgICAgICAgICAgICAgICAgIFxuICAgIGNhbGN1bGF0ZUR1cmF0aW9uRm9yVG9rZW46ICh0b2tlbikgLT5cbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbi5jb2RlP1xuICAgICAgICAgICAgc3dpdGNoIHRva2VuLmNvZGVcbiAgICAgICAgICAgICAgICB3aGVuIFwiV1wiXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlICE9IFwiQVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IHRva2VuLnZhbHVlIC8gMTAwMCAqIEdyYXBoaWNzLmZyYW1lUmF0ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IHRva2VuLnZhbHVlLmxlbmd0aCAqIEBzcGVlZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBtYXhpbXVtIG9mIGxpbmVzIHdoaWNoIGNhbiBiZSBkaXNwbGF5ZWQgaW4gb25lIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxjdWxhdGVNYXhMaW5lc1xuICAgICogQHBhcmFtIHtBcnJheX0gbGluZXMgLSBBbiBhcnJheSBvZiBsaW5lLW9iamVjdHMuXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgZGlzcGxheWFibGUgbGluZXMuXG4gICAgIyMjXG4gICAgY2FsY3VsYXRlTWF4TGluZXM6IChsaW5lcykgLT5cbiAgICAgICAgaGVpZ2h0ID0gMFxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIFxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgICAgIGhlaWdodCArPSBsaW5lLmhlaWdodCArIEBsaW5lU3BhY2luZ1xuICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50WStoZWlnaHQgPiAoQG9iamVjdC5kc3RSZWN0LmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICByZXN1bHQrK1xuICAgICBcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKGxpbmVzLmxlbmd0aCwgcmVzdWx0IHx8IDEpXG4gICAgXG4gICAgIyMjKlxuICAgICogRGlzcGxheXMgdGhlIGNoYXJhY3RlciBvciBwcm9jZXNzZXMgdGhlIG5leHQgY29udHJvbC10b2tlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdOZXh0XG4gICAgIyMjXG4gICAgZHJhd05leHQ6IC0+XG4gICAgICAgIHRva2VuID0gQHByb2Nlc3NUb2tlbigpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgdG9rZW4/LnZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEBjaGFyID0gQHRva2VuLnZhbHVlLmNoYXJBdChAY2hhckluZGV4KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihAY2hhcikgIFxuICAgICAgICAgICAgcyA9IEdyYXBoaWNzLnNjYWxlICAgXG4gICAgICAgICAgICBsaW5lU3BhY2luZyA9IEBsaW5lU3BhY2luZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAY3VycmVudExpbmUgIT0gQGxpbmVcbiAgICAgICAgICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZVxuICAgICAgICAgICAgICAgIyBAY3VycmVudFkgKz0gQGN1cnJlbnRMaW5lSGVpZ2h0ICsgbGluZVNwYWNpbmcgKiBHcmFwaGljcy5zY2FsZVxuICAgICAgICAgICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcblxuICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUueSA9IEBvYmplY3Qub3JpZ2luLnkgKyBAb2JqZWN0LmRzdFJlY3QueSArIEBjdXJyZW50WVxuICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgQGRyYXdMaW5lQ29udGVudChAbGluZXNbQGxpbmVdLCBAY3VycmVudFNwcml0ZS5iaXRtYXAsIEBjaGFySW5kZXgrMSlcbiAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggPSBAY3VycmVudFNwcml0ZS5iaXRtYXAud2lkdGggI01hdGgubWluKEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggKyBzaXplLndpZHRoLCBAY3VycmVudFNwcml0ZS5iaXRtYXAud2lkdGgpXG4gICAgICAgIFxuICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gQGxpbmVzW0BsaW5lXS5oZWlnaHRcbiAgICAgICAgICAgIEBjdXJyZW50WCA9IE1hdGgubWluKEBsaW5lc1tAbGluZV0ud2lkdGgsIEBjdXJyZW50WCArIHNpemUud2lkdGgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIG5leHQgY2hhcmFjdGVyL3Rva2VuIG9mIHRoZSBtZXNzYWdlLlxuICAgICogQG1ldGhvZCBuZXh0Q2hhclxuICAgICogQHByaXZhdGVcbiAgICAjIyNcbiAgICBuZXh0Q2hhcjogLT5cbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgQGNoYXJJbmRleCsrXG4gICAgICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50ID0gQHNwZWVkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEB0b2tlbi5jb2RlPyBvciBAY2hhckluZGV4ID49IEB0b2tlbi52YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdG9rZW4ub25FbmQ/KClcbiAgICAgICAgICAgICAgICBAdG9rZW5JbmRleCsrXG4gICAgICAgICAgICAgICAgaWYgQHRva2VuSW5kZXggPj0gQGxpbmVzW0BsaW5lXS5jb250ZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdG9rZW5JbmRleCA9IDBcbiAgICAgICAgICAgICAgICAgICAgQGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFNwcml0ZS5zcmNSZWN0LndpZHRoID0gQGN1cnJlbnRTcHJpdGUuYml0bWFwLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlID0gQHNwcml0ZXNbQGxpbmVdXG4gICAgICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50U3ByaXRlP1xuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUueCA9IEBvYmplY3Qub3JpZ2luLnggKyBAb2JqZWN0LmRzdFJlY3QueFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRZICs9IChAY3VycmVudExpbmVIZWlnaHQgfHwgQGZvbnQubGluZUhlaWdodCkgKyBAbGluZVNwYWNpbmcgKiBHcmFwaGljcy5zY2FsZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0uY29udGVudFtAdG9rZW5JbmRleF0gfHwgbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcIilcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBjaGFySW5kZXggPSAwXG4gICAgICAgICAgICAgICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0uY29udGVudFtAdG9rZW5JbmRleF0gfHwgbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcIilcbiAgICAgICAgICAgICAgICBAdG9rZW4ub25TdGFydD8oKVxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICFAdG9rZW4gb3IgQHRva2VuLnZhbHVlICE9IFwiXFxuXCIgb3IgIUBsaW5lc1tAbGluZV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICMjIypcbiAgICAqIEZpbmlzaGVzIHRoZSBtZXNzYWdlLiBEZXBlbmRpbmcgb24gdGhlIG1lc3NhZ2UgY29uZmlndXJhdGlvbiwgdGhlXG4gICAgKiBtZXNzYWdlIHRleHQtcmVuZGVyZXIgd2lsbCBub3cgd2FpdCBmb3IgYSB1c2VyLWFjdGlvbiBvciBhIGNlcnRhaW4gYW1vdW50XG4gICAgKiBvZiB0aW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZmluaXNoXG4gICAgIyMjXG4gICAgZmluaXNoOiAtPlxuICAgICAgICBpZiBAd2FpdEF0RW5kXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VXYWl0aW5nXCIsIHRoaXMpXG4gICAgICAgIGVsc2UgaWYgQHdhaXRBdEVuZFRpbWUgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBAd2FpdEF0RW5kVGltZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwibWVzc2FnZVdhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlV2FpdGluZ1wiLCB0aGlzKVxuICAgICAgICAgICAgQGNvbnRpbnVlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2FyZXQgaW4gcGl4ZWxzLiBUaGUgY2FyZXQgaXMgbGlrZSBhbiBpbnZpc2libGVcbiAgICAqIGN1cnNvciBwb2ludGluZyB0byB0aGUgeC95IGNvb3JkaW5hdGVzIG9mIHRoZSBsYXN0IHJlbmRlcmVkIGNoYXJhY3RlciBvZlxuICAgICogdGhlIG1lc3NhZ2UuIFRoYXQgcG9zaXRpb24gY2FuIGJlIHVzZWQgdG8gZGlzcGxheSBhIHdhaXRpbmctIG9yIHByb2Nlc3NpbmctYW5pbWF0aW9uIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ2FyZXRQb3NpdGlvblxuICAgICMjI1xuICAgIHVwZGF0ZUNhcmV0UG9zaXRpb246IC0+IFxuICAgICAgICBAY2FyZXRQb3NpdGlvbi54ID0gQGN1cnJlbnRYICsgQHBhZGRpbmcgICBcbiAgICAgICAgQGNhcmV0UG9zaXRpb24ueSA9IEBjdXJyZW50WSArIEBjdXJyZW50TGluZUhlaWdodC8yXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGxpbmUgd3JpdGluZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUxpbmVXcml0aW5nXG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZUxpbmVXcml0aW5nOiAtPlxuICAgICAgICBpZiBAaXNSdW5uaW5nIGFuZCAhQGlzV2FpdGluZyBhbmQgIUB3YWl0Rm9yS2V5IGFuZCBAd2FpdENvdW50ZXIgPD0gMFxuICAgICAgICAgICAgaWYgQGxpbmVBbmltYXRpb25Db3VudCA8PSAwXG4gICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgQG5leHRDaGFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBAbGluZSA+PSBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBmaW5pc2goKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAZHJhd05leHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIHVubGVzcyAoQHRva2VuLmNvZGUgb3IgQGxpbmVBbmltYXRpb25Db3VudCA8PSAwIG9yIEBkcmF3SW1tZWRpYXRlbHkpIGFuZCAhQHdhaXRGb3JLZXkgYW5kIEB3YWl0Q291bnRlciA8PSAwIGFuZCBAaXNSdW5uaW5nIGFuZCBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgICAgIEBsaW5lQW5pbWF0aW9uQ291bnQgPSAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGxpbmVBbmltYXRpb25Db3VudC0tXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB3YWl0LWZvci1rZXkgc3RhdGUuIElmIHNraXBwaW5nIGlzIGVuYWJsZWQsIHRoZSB0ZXh0IHJlbmRlcmVyIHdpbGxcbiAgICAqIG5vdCB3YWl0IGZvciBrZXkgcHJlc3MuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVXYWl0Rm9yS2V5XG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZVdhaXRGb3JLZXk6IC0+XG4gICAgICAgIGlmIEB3YWl0Rm9yS2V5XG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAd2FpdEZvcktleSA9IEBpc1dhaXRpbmdcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB3YWl0IGNvdW50ZXIgaWYgdGhlIHRleHQgcmVuZGVyZXIgaXMgd2FpdGluZyBmb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lIHRvIHBhc3MuIElmIHNraXBwaW5nIGlzIGVuYWJsZWQsIHRoZSB0ZXh0IHJlbmRlcmVyIHdpbGxcbiAgICAqIG5vdCB3YWl0IGZvciB0aGUgYWN0dWFsIGFtb3VudCBvZiB0aW1lIGFuZCBzZXRzIHRoZSB3YWl0LWNvdW50ZXIgdG8gMSBmcmFtZSBpbnN0ZWFkLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlV2FpdEZvcktleVxuICAgICogQHByaXZhdGVcbiAgICAjIyMgICAgICAgXG4gICAgdXBkYXRlV2FpdENvdW50ZXI6IC0+XG4gICAgICAgIGlmIEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyLS1cbiAgICAgICAgICAgIGlmIEB3YWl0Q291bnRlciA8PSAwXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgQGNvbnRpbnVlKCkgaWYgQGxpbmUgPj0gQG1heExpbmVzXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIHRva2VuLW9iamVjdCBmb3IgYSBzcGVjaWZpZWQgdGV4dC1jb2RlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlL3R5cGUgb2YgdGhlIHRleHQtY29kZS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgdGV4dC1jb2RlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdG9rZW4tb2JqZWN0LlxuICAgICMjI1xuICAgIGNyZWF0ZVRva2VuOiAoY29kZSwgdmFsdWUpIC0+XG4gICAgICAgIHRva2VuT2JqZWN0ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvZGVcbiAgICAgICAgICAgIHdoZW4gXCJDRVwiXG4gICAgICAgICAgICAgICAgZGF0YSA9IHZhbHVlLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YS5zaGlmdCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZSBlbHNlIHBhcnNlSW50KHZhbHVlKVxuICAgICAgICAgICAgICAgIGZvciBpIGluIFswLi4uZGF0YV1cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YVtpXS5zdGFydHNXaXRoKCdcIicpIGFuZCBkYXRhW2ldLmVuZHNXaXRoKCdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ldID0gZGF0YVtpXS5zdWJzdHJpbmcoMSwgZGF0YVtpXS5sZW5ndGgtMSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtpXSA9IGlmIGlzTmFOKGRhdGFbaV0pIHRoZW4gZGF0YVtpXSBlbHNlIHBhcnNlRmxvYXQoZGF0YVtpXSlcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHsgY29kZTogY29kZSwgdmFsdWU6IHZhbHVlLCB2YWx1ZXM6IGRhdGEgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHN1cGVyKGNvZGUsIHZhbHVlKVxuICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gdG9rZW5PYmplY3QgXG4gICAgIyMjKlxuICAgICogPHA+TWVhc3VyZXMgYSBjb250cm9sLXRva2VuLiBJZiBhIHRva2VuIHByb2R1Y2VzIGEgdmlzdWFsIHJlc3VsdCBsaWtlIGRpc3BsYXlpbmcgYW4gaWNvbiB0aGVuIGl0IG11c3QgcmV0dXJuIHRoZSBzaXplIHRha2VuIGJ5XG4gICAgKiB0aGUgdmlzdWFsIHJlc3VsdC4gSWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LCA8Yj5udWxsPC9iPiBtdXN0IGJlIHJldHVybmVkLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQuPC9wPiBcbiAgICAqXG4gICAgKiA8cD5UaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIHdoaWxlIHRoZSBtZXNzYWdlIGlzIHJ1bm5pbmcuIEZvciB0aGF0IGNhc2UsIHNlZSA8aT5wcm9jZXNzQ29udHJvbFRva2VuPC9pPiBtZXRob2Qgd2hpY2ggaXMgY2FsbGVkXG4gICAgKiBmb3IgZXZlcnkgdG9rZW4gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy48L3A+XG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHJldHVybiB7Z3MuU2l6ZX0gVGhlIHNpemUgb2YgdGhlIGFyZWEgdGFrZW4gYnkgdGhlIHZpc3VhbCByZXN1bHQgb2YgdGhlIHRva2VuIG9yIDxiPm51bGw8L2I+IGlmIHRoZSB0b2tlbiBoYXMgbm8gdmlzdWFsIHJlc3VsdC5cbiAgICAqIEBtZXRob2QgYW5hbHl6ZUNvbnRyb2xUb2tlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG1lYXN1cmVDb250cm9sVG9rZW46ICh0b2tlbikgLT4gcmV0dXJuIHN1cGVyKHRva2VuKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiA8cD5EcmF3cyB0aGUgdmlzdWFsIHJlc3VsdCBvZiBhIHRva2VuLCBsaWtlIGFuIGljb24gZm9yIGV4YW1wbGUsIHRvIHRoZSBzcGVjaWZpZWQgYml0bWFwLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQgYW5kIHRoZSBzcHJpdGVzIGZvciBlYWNoXG4gICAgKiB0ZXh0LWxpbmUgYXJlIGNyZWF0ZWQuPC9wPiBcbiAgICAqXG4gICAgKiA8cD5UaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIHdoaWxlIHRoZSBtZXNzYWdlIGlzIHJ1bm5pbmcuIEZvciB0aGF0IGNhc2UsIHNlZSA8aT5wcm9jZXNzQ29udHJvbFRva2VuPC9pPiBtZXRob2Qgd2hpY2ggaXMgY2FsbGVkXG4gICAgKiBmb3IgZXZlcnkgdG9rZW4gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy48L3A+XG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHBhcmFtIHtncy5CaXRtYXB9IGJpdG1hcCAtIFRoZSBiaXRtYXAgdXNlZCBmb3IgdGhlIGN1cnJlbnQgdGV4dC1saW5lLiBDYW4gYmUgdXNlZCB0byBkcmF3IHNvbWV0aGluZyBvbiBpdCBsaWtlIGFuIGljb24sIGV0Yy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgLSBBbiB4LW9mZnNldCBmb3IgdGhlIGRyYXctcm91dGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSBEZXRlcm1pbmVzIGhvdyBtYW55IGNoYXJhY3RlcnMgb2YgdGhlIHRva2VuIHNob3VsZCBiZSBkcmF3bi4gQ2FuIGJlIGlnbm9yZWQgZm9yIHRva2Vuc1xuICAgICogbm90IGRyYXdpbmcgYW55IGNoYXJhY3RlcnMuXG4gICAgKiBAbWV0aG9kIGRyYXdDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBkcmF3Q29udHJvbFRva2VuOiAodG9rZW4sIGJpdG1hcCwgb2Zmc2V0LCBsZW5ndGgpIC0+XG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIHN1cGVyKHRva2VuLCBiaXRtYXAsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgICAgICAgICAgIFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgYSBjb250cm9sLXRva2VuLiBBIGNvbnRyb2wtdG9rZW4gaXMgYSB0b2tlbiB3aGljaCBpbmZsdWVuY2VzXG4gICAgKiB0aGUgdGV4dC1yZW5kZXJpbmcgbGlrZSBjaGFuZ2luZyB0aGUgZm9udHMgY29sb3IsIHNpemUgb3Igc3R5bGUuIENoYW5nZXMgXG4gICAgKiB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byB0aGUgZ2FtZSBvYmplY3QncyBmb250LlxuICAgICpcbiAgICAqIEZvciBtZXNzYWdlIHRleHQtcmVuZGVyZXIsIGEgZmV3IGFkZGl0aW9uYWwgY29udHJvbC10b2tlbnMgbGlrZVxuICAgICogc3BlZWQtY2hhbmdlLCB3YWl0aW5nLCBldGMuIG5lZWRzIHRvIGJlIHByb2Nlc3NlZCBoZXJlLlxuICAgICpcbiAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmb3IgZWFjaCB0b2tlbiB3aGlsZSB0aGUgbWVzc2FnZSBpcyBpbml0aWFsaXplZCBhbmRcbiAgICAqIGFsc28gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy4gU2VlIDxpPmZvcm1hdHRpbmdPbmx5PC9pPiBwYXJhbWV0ZXIuXG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHBhcmFtIHtib29sZWFufSBmb3JtYXR0aW5nT25seSAtIElmIDxiPnRydWU8L2I+IHRoZSBtZXNzYWdlIGlzIGluaXRpYWxpemluZyByaWdodCBub3cgYW5kIG9ubHkgXG4gICAgKiBmb3JtYXQtdG9rZW5zIHNob3VsZCBiZSBwcm9jZXNzZWQgd2hpY2ggaXMgbmVjZXNzYXJ5IGZvciB0aGUgbWVzc2FnZSB0byBjYWxjdWxhdGVkIHNpemVzIGNvcnJlY3RseS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgdG9rZW4gd2hpY2ggaXMgcHJvY2Vzc2VkIG5leHQgb3IgPGI+bnVsbDwvYj4uXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBwcm9jZXNzQ29udHJvbFRva2VuOiAodG9rZW4sIGZvcm1hdHRpbmdPbmx5KSAtPlxuICAgICAgICByZXR1cm4gc3VwZXIodG9rZW4pIGlmIGZvcm1hdHRpbmdPbmx5XG4gICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiQ1JcIiAjIENoYW5nZSBDdXJyZW50IENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc0FycmF5LmZpcnN0IChjKSAtPiAoYy5uYW1lLmRlZmF1bHRUZXh0ID8gYy5uYW1lKSA9PSB0b2tlbi52YWx1ZVxuICAgICAgICAgICAgICAgIGlmIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuY3VycmVudENoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcIkNFXCIgIyBDYWxsIENvbW1vbiBFdmVudFxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHsgXCJ2YWx1ZXNcIjogdG9rZW4udmFsdWVzIH1cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImNhbGxDb21tb25FdmVudFwiLCBAb2JqZWN0LCB7IGNvbW1vbkV2ZW50SWQ6IHRva2VuLnZhbHVlLCBwYXJhbXM6IHBhcmFtcywgZmluaXNoOiBubywgd2FpdGluZzogeWVzIH0pXG4gICAgICAgICAgICB3aGVuIFwiWFwiICMgU2NyaXB0XG4gICAgICAgICAgICAgICAgdG9rZW4udmFsdWU/KEBvYmplY3QpXG4gICAgICAgICAgICB3aGVuIFwiQVwiICMgUGxheSBBbmltYXRpb25cbiAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNbTWF0aC5tYXgodG9rZW4udmFsdWUtMSwgMCldXG4gICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uPy5ncmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IG5ldyBncy5PYmplY3RfQW5pbWF0aW9uKGFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEBhZGRDdXN0b21PYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gTWF0aC5yb3VuZChiaXRtYXAud2lkdGggLyBhbmltYXRpb24uZnJhbWVzWClcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUuc3JjUmVjdC53aWR0aCArPSBNYXRoLnJvdW5kKGJpdG1hcC53aWR0aCAvIGFuaW1hdGlvbi5mcmFtZXNYKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIGlmIHRva2VuLnJ0U2l6ZS53aWR0aCA+IHRva2VuLnJiU2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gdG9rZW4ucnRTaXplLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBmb250LnNldChAZ2V0UnVieVRleHRGb250KHRva2VuKSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50WCArPSB0b2tlbi5yYlNpemUud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIFwiTEtcIiAjIExpbmsgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbi52YWx1ZSA9PSAnRScgIyBFbmQgTGlua1xuICAgICAgICAgICAgICAgICAgICBvYmplY3QgPSBuZXcgdWkuT2JqZWN0X0hvdHNwb3QoKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZW5hYmxlZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgQGFkZEN1c3RvbU9iamVjdChvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC54ID0gQG9iamVjdC5kc3RSZWN0LnggKyBAb2JqZWN0Lm9yaWdpbi54ICsgQGN1c3RvbURhdGEubGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55ICsgQG9iamVjdC5vcmlnaW4ueSArIEBjdXN0b21EYXRhLmxpbmtEYXRhLmN5XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LndpZHRoID0gQGN1cnJlbnRYIC0gQGN1c3RvbURhdGEubGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQGN1cnJlbnRMaW5lSGVpZ2h0XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmV2ZW50cy5vbihcImNsaWNrXCIsIGdzLkNhbGxCYWNrKFwib25MaW5rQ2xpY2tcIiwgdGhpcyksIGxpbmtEYXRhOiBAY3VzdG9tRGF0YS5saW5rRGF0YSwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlICMgQmVnaW4gTGlua1xuICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YSA9IHsgY3g6IEBjdXJyZW50WCwgY3k6IEBjdXJyZW50WSwgY29tbW9uRXZlbnRJZDogdG9rZW4udmFsdWUsIHRva2VuSW5kZXg6IEB0b2tlbkluZGV4IH1cbiAgICAgICAgICAgIHdoZW4gXCJTTEtcIiAjIFN0eWxlYWJsZSBMaW5rXG4gICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWUgPT0gJ0UnICMgRW5kIExpbmtcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUuYml0bWFwLmNsZWFyUmVjdChAY3VzdG9tRGF0YS5saW5rRGF0YS5jeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YS5jeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggLSBAY3VzdG9tRGF0YS5saW5rRGF0YS5jeCArIEBvYmplY3QuZm9udC5ib3JkZXJTaXplKjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBsaW5lID0gQGxpbmVzW0BsaW5lXS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgIGxpbmtTdGFydCA9IEBmaW5kVG9rZW4oQHRva2VuSW5kZXgtMSwgXCJTTEtcIiwgLTEsIGxpbmUpXG4gICAgICAgICAgICAgICAgICAgIHRleHRUb2tlbnMgPSBAZmluZFRva2Vuc0JldHdlZW4oQGN1c3RvbURhdGEubGlua0RhdGEudG9rZW5JbmRleCwgQHRva2VuSW5kZXgsIG51bGwsIGxpbmUpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QgPSBuZXcgdWkuT2JqZWN0X1RleHQoKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QudGV4dCA9IHRleHRUb2tlbnMuc2VsZWN0KCh4KSA9PiB4LnZhbHVlKS5qb2luKFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5zaXplVG9GaXQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmZvcm1hdHRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LndvcmRXcmFwID0gbm9cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnVpID0gbmV3IHVpLkNvbXBvbmVudF9VSUJlaGF2aW9yKClcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmVuYWJsZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFkZENvbXBvbmVudChvYmplY3QudWkpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hZGRDb21wb25lbnQobmV3IGdzLkNvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IoKSlcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBAY3VzdG9tRGF0YS5saW5rRGF0YS5zdHlsZUluZGV4ID09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5VSU1hbmFnZXIuYWRkQ29udHJvbFN0eWxlcyhvYmplY3QsIFtcImh5cGVybGlua1wiXSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLlVJTWFuYWdlci5hZGRDb250cm9sU3R5bGVzKG9iamVjdCwgW1wiaHlwZXJsaW5rLVwiK0BjdXN0b21EYXRhLmxpbmtEYXRhLnN0eWxlSW5kZXhdKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnNldHVwKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEBhZGRDdXN0b21PYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueCA9IEBvYmplY3QuZHN0UmVjdC54ICsgQG9iamVjdC5vcmlnaW4ueCArIEBjdXN0b21EYXRhLmxpbmtEYXRhLmN4XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAb2JqZWN0LmRzdFJlY3QueSArIEBvYmplY3Qub3JpZ2luLnkgKyBAY3VzdG9tRGF0YS5saW5rRGF0YS5jeVxuXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5ldmVudHMub24oXCJjbGlja1wiLCBncy5DYWxsQmFjayhcIm9uTGlua0NsaWNrXCIsIHRoaXMpLCBsaW5rRGF0YTogQGN1c3RvbURhdGEubGlua0RhdGEsIHRoaXMpXG4gICAgICAgICAgICAgICAgZWxzZSAjIEJlZ2luIExpbmtcbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWU/LmNvbnRhaW5zKFwiLFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdG9rZW4udmFsdWUuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YSA9IHsgY3g6IEBjdXJyZW50WCwgY3k6IEBjdXJyZW50WSwgY29tbW9uRXZlbnRJZDogdmFsdWVzWzBdLCBzdHlsZUluZGV4OiBwYXJzZUludCh2YWx1ZXNbMV0pLCB0b2tlbkluZGV4OiBAdG9rZW5JbmRleCB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXN0b21EYXRhLmxpbmtEYXRhID0geyBjeDogQGN1cnJlbnRYLCBjeTogQGN1cnJlbnRZLCBjb21tb25FdmVudElkOiB0b2tlbi52YWx1ZSwgdG9rZW5JbmRleDogQHRva2VuSW5kZXgsIHN0eWxlSW5kZXg6IC0xIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIFwiRVwiICMgQ2hhbmdlIEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tNYXRoLm1heCh0b2tlbi52YWx1ZS0xLCAwKV1cbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY3VycmVudENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGlmIGV4cHJlc3Npb24/IGFuZCBjaGFyYWN0ZXI/LmluZGV4P1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5leHByZXNzaW9uRHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5jaGFuZ2VFYXNpbmcpXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5jaGFuZ2VBbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKGMpIC0+IGMucmlkID09IGNoYXJhY3Rlci5pbmRleFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q/LmJlaGF2aW9yLmNoYW5nZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuICBcbiAgICAgICAgICAgIHdoZW4gXCJTUFwiICMgUGxheSBTb3VuZFxuICAgICAgICAgICAgICAgIHNvdW5kID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc291bmRzW3Rva2VuLnZhbHVlLTFdXG4gICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChzb3VuZClcbiAgICAgICAgICAgIHdoZW4gXCJTXCIgIyBDaGFuZ2UgU3BlZWRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5zZXR0aW5ncy5tZXNzYWdlU3BlZWQgPSB0b2tlbi52YWx1ZVxuICAgICAgICAgICAgd2hlbiBcIldcIiAjIFdhaXRcbiAgICAgICAgICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gbm9cbiAgICAgICAgICAgICAgICBpZiAhR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWUgPT0gXCJBXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIEB3YWl0Rm9yS2V5ID0geWVzXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IE1hdGgucm91bmQodG9rZW4udmFsdWUgLyAxMDAwICogR3JhcGhpY3MuZnJhbWVSYXRlKVxuICAgICAgICAgICAgd2hlbiBcIldFXCIgIyBXYWl0IGF0IEVuZFxuICAgICAgICAgICAgICAgIEB3YWl0QXRFbmQgPSB0b2tlbi52YWx1ZSA9PSBcIllcIlxuICAgICAgICAgICAgd2hlbiBcIkRJXCIgIyBEcmF3IEltbWVkaWFsdHlcbiAgICAgICAgICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gdG9rZW4udmFsdWUgPT0gMSBvciB0b2tlbi52YWx1ZSA9PSBcIllcIiAjIERyYXcgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzdXBlcih0b2tlbilcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQgICAgICAgIFxuICAgICMjIypcbiAgICAqIENsZWFycy9SZXNldHMgdGhlIHRleHQtcmVuZGVyZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhclxuICAgICMjI1xuICAgIGNsZWFyOiAtPlxuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIEBjdXJyZW50WSA9IDBcbiAgICAgICAgQGxpbmUgPSAwXG4gICAgICAgIEBsaW5lcyA9IFtdXG4gICAgICAgIEBjbGVhckN1c3RvbU9iamVjdHMoKVxuICAgICAgICBAb2JqZWN0LmJpdG1hcD8uY2xlYXIoKVxuICAgICAgICBcbiAgICAgICAgZm9yIHNwcml0ZSBpbiBAYWxsU3ByaXRlc1xuICAgICAgICAgICAgc3ByaXRlLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc3ByaXRlLmJpdG1hcD8uZGlzcG9zZSgpXG4gICAgICAgIEBhbGxTcHJpdGVzID0gW11cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMvRGlzcG9zZXMgYWxsIHNwcml0ZXMgdXNlZCB0byBkaXNwbGF5IHRoZSB0ZXh0LWxpbmVzL3BhcnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJBbGxTcHJpdGVzXG4gICAgIyMjXG4gICAgY2xlYXJBbGxTcHJpdGVzOiAtPlxuICAgICAgICBmb3Igc3ByaXRlIGluIEBhbGxTcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUuZGlzcG9zZSgpXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwPy5kaXNwb3NlKClcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgICMjIypcbiAgICAqIENsZWFycy9EaXNwb3NlcyB0aGUgc3ByaXRlcyB1c2VkIHRvIGRpc3BsYXkgdGhlIHRleHQtbGluZXMvcGFydHMgb2YgdGhlIGN1cnJlbnQvbGFzdCBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJTcHJpdGVzXG4gICAgIyMjICAgICAgICBcbiAgICBjbGVhclNwcml0ZXM6IC0+XG4gICAgICAgIGZvciBzcHJpdGUgaW4gQHNwcml0ZXNcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXA/LmRpc3Bvc2UoKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhIGdhbWUgb2JqZWN0IGZyb20gdGhlIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCByZW1vdmVDdXN0b21PYmplY3RcbiAgICAqIEBwYXJhbSBvYmplY3Qge2dzLk9iamVjdF9CYXNlfSBUaGUgZ2FtZSBvYmplY3QgdG8gcmVtb3ZlLlxuICAgICMjI1xuICAgIHJlbW92ZUN1c3RvbU9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnJlbW92ZU9iamVjdChvYmplY3QpXG4gICAgICAgIG9iamVjdC5kaXNwb3NlKClcbiAgICAgICAgQGN1c3RvbU9iamVjdHMucmVtb3ZlKG9iamVjdClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtZXNzYWdlIHdoaWNoIGlzIGFsaXZlIHVudGlsIHRoZSBtZXNzYWdlIGlzXG4gICAgKiBlcmFzZWQuIENhbiBiZSB1c2VkIHRvIGRpc3BsYXkgYW5pbWF0aW9uZWQtaWNvbnMsIGV0Yy4gaW4gYSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgYWRkQ3VzdG9tT2JqZWN0XG4gICAgKiBAcGFyYW0gb2JqZWN0IHtncy5PYmplY3RfQmFzZX0gVGhlIGdhbWUgb2JqZWN0IHRvIGFkZC5cbiAgICAjIyNcbiAgICBhZGRDdXN0b21PYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAb2JqZWN0LmRzdFJlY3QueCArIEBvYmplY3Qub3JpZ2luLnggKyBAY3VycmVudFhcbiAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55ICsgQG9iamVjdC5vcmlnaW4ueSArIEBjdXJyZW50WVxuICAgICAgICBvYmplY3QuekluZGV4ID0gQG9iamVjdC56SW5kZXggKyAxXG4gICAgICAgIG9iamVjdC51cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmFkZE9iamVjdChvYmplY3QpXG4gICAgICAgIEBjdXN0b21PYmplY3RzLnB1c2gob2JqZWN0KVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgdGhlIGxpc3Qgb2YgY3VzdG9tIGdhbWUgb2JqZWN0cy4gQWxsIGdhbWUgb2JqZWN0cyBhcmUgZGlzcG9zZWQgYW5kIHJlbW92ZWRcbiAgICAqIGZyb20gdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJDdXN0b21PYmplY3RzXG4gICAgKiBAcGFyYW0gb2JqZWN0IHtPYmplY3R9IFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjICAgXG4gICAgY2xlYXJDdXN0b21PYmplY3RzOiAtPlxuICAgICAgICBmb3Igb2JqZWN0IGluIEBjdXN0b21PYmplY3RzXG4gICAgICAgICAgICBvYmplY3QuZGlzcG9zZSgpXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUucmVtb3ZlT2JqZWN0KG9iamVjdClcbiAgICAgICAgICAgIFxuICAgICAgICBAY3VzdG9tT2JqZWN0cyA9IFtdXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgYml0bWFwIGZvciBhIHNwZWNpZmllZCBsaW5lLW9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUJpdG1hcFxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaW5lIC0gQSBsaW5lLW9iamVjdC5cbiAgICAqIEByZXR1cm4ge0JpdG1hcH0gQSBuZXdseSBjcmVhdGVkIGJpdG1hcCBjb250YWluaW5nIHRoZSBsaW5lLXRleHQuXG4gICAgIyMjXG4gICAgY3JlYXRlQml0bWFwOiAobGluZSkgLT5cbiAgICAgICAgQGZvbnQgPSBAb2JqZWN0LmZvbnRcbiAgICAgICAgYml0bWFwID0gbmV3IEJpdG1hcChAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIE1hdGgubWF4KEBtaW5MaW5lSGVpZ2h0LCBsaW5lLmhlaWdodCkpXG4gICAgICAgIGJpdG1hcC5mb250ID0gQGZvbnRcbiAgICAgICBcbiAgICAgICAgcmV0dXJuIGJpdG1hcFxuICAgIFxuICAgICMjIypcbiAgICAqIERyYXdzIHRoZSBsaW5lJ3MgY29udGVudCBvbiB0aGUgc3BlY2lmaWVkIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdMaW5lQ29udGVudFxuICAgICogQHByb3RlY3RlZFxuICAgICogQHBhcmFtIHtPYmplY3R9IGxpbmUgLSBBIGxpbmUtb2JqZWN0IHdoaWNoIHNob3VsZCBiZSBkcmF3biBvbiB0aGUgYml0bWFwLlxuICAgICogQHBhcmFtIHtncy5CaXRtYXB9IGJpdG1hcCAtIFRoZSBiaXRtYXAgdG8gZHJhdyB0aGUgbGluZSdzIGNvbnRlbnQgb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gRGV0ZXJtaW5lcyBob3cgbWFueSBjaGFyYWN0ZXJzIG9mIHRoZSBzcGVjaWZpZWQgbGluZSBzaG91bGQgYmUgZHJhd24uIFlvdSBjYW4gXG4gICAgKiBzcGVjaWZ5IC0xIHRvIGRyYXcgYWxsIGNoYXJhY3RlcnMuXG4gICAgIyMjXG4gICAgZHJhd0xpbmVDb250ZW50OiAobGluZSwgYml0bWFwLCBsZW5ndGgpIC0+XG4gICAgICAgIGJpdG1hcC5jbGVhcigpXG4gICAgICAgIGN1cnJlbnRYID0gQHBhZGRpbmdcbiAgICAgICAgZHJhd0FsbCA9IGxlbmd0aCA9PSAtMVxuICAgICAgICBcbiAgICAgICAgZm9yIHRva2VuLCBpIGluIGxpbmUuY29udGVudFxuICAgICAgICAgICAgYnJlYWsgaWYgaSA+IEB0b2tlbkluZGV4IGFuZCAhZHJhd0FsbFxuICAgICAgICAgICAgaWYgdG9rZW4uY29kZT9cbiAgICAgICAgICAgICAgICBzaXplID0gQG1lYXN1cmVDb250cm9sVG9rZW4odG9rZW4sIGJpdG1hcClcbiAgICAgICAgICAgICAgICBAZHJhd0NvbnRyb2xUb2tlbih0b2tlbiwgYml0bWFwLCBjdXJyZW50WClcbiAgICAgICAgICAgICAgICBpZiBzaXplIHRoZW4gY3VycmVudFggKz0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgIEBwcm9jZXNzQ29udHJvbFRva2VuKHRva2VuLCB5ZXMsIGxpbmUpXG4gICAgICAgICAgICBlbHNlIGlmIHRva2VuLnZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB0b2tlbi5hcHBseUZvcm1hdChAZm9udClcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlXG4gICAgICAgICAgICAgICAgaWYgIWRyYXdBbGwgYW5kIEB0b2tlbkluZGV4ID09IGkgYW5kIHZhbHVlLmxlbmd0aCA+IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCBsZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgdmFsdWUgIT0gXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICBzaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbih2YWx1ZSkgIFxuICAgICAgICAgICAgICAgICAgICBiaXRtYXAuZHJhd1RleHQoY3VycmVudFgsIGxpbmUuaGVpZ2h0IC0gKHNpemUuaGVpZ2h0IC0gQGZvbnQuZGVzY2VudCkgLSBsaW5lLmRlc2NlbnQsIHNpemUud2lkdGgsIGJpdG1hcC5oZWlnaHQsIHZhbHVlLCAwLCAwKVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50WCArPSBzaXplLndpZHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGxpbmUuY29udGVudFdpZHRoID0gY3VycmVudFggKyBAZm9udC5tZWFzdXJlVGV4dFBsYWluKFwiIFwiKS53aWR0aCAgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIHRoZSBzcHJpdGUgZm9yIGEgc3BlY2lmaWVkIGxpbmUtb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU3ByaXRlXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGxpbmUgLSBBIGxpbmUtb2JqZWN0LlxuICAgICogQHJldHVybiB7U3ByaXRlfSBBIG5ld2x5IGNyZWF0ZWQgc3ByaXRlIG9iamVjdCBjb250YWluaW5nIHRoZSBsaW5lLXRleHQgYXMgYml0bWFwLlxuICAgICMjI1xuICAgIGNyZWF0ZVNwcml0ZTogKGxpbmUpIC0+XG4gICAgICAgIGJpdG1hcCA9IEBjcmVhdGVCaXRtYXAobGluZSlcbiAgICAgICAgXG4gICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHNwcml0ZSA9IG5ldyBTcHJpdGUoR3JhcGhpY3Mudmlld3BvcnQpXG4gICAgICAgIHNwcml0ZS5iaXRtYXAgPSBiaXRtYXBcbiAgICAgICAgc3ByaXRlLnZpc2libGUgPSB5ZXNcbiAgICAgICAgc3ByaXRlLnogPSBAb2JqZWN0LnpJbmRleCArIDFcbiAgICAgICAgXG4gICAgICAgIHNwcml0ZS5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgMCwgYml0bWFwLmhlaWdodClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzcHJpdGVcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgc3ByaXRlcyBmb3IgYSBzcGVjaWZpZWQgYXJyYXkgb2YgbGluZS1vYmplY3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU3ByaXRlc1xuICAgICogQHByaXZhdGVcbiAgICAqIEBzZWUgZ3MuQ29tcG9uZW50X01lc3NhZ2VUZXh0UmVuZGVyZXIuY3JlYXRlU3ByaXRlLlxuICAgICogQHBhcmFtIHtBcnJheX0gbGluZXMgLSBBbiBhcnJheSBvZiBsaW5lLW9iamVjdHMuXG4gICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2Ygc3ByaXRlcy5cbiAgICAjIyNcbiAgICBjcmVhdGVTcHJpdGVzOiAobGluZXMpIC0+XG4gICAgICAgIEBmb250U2l6ZSA9IEBvYmplY3QuZm9udC5zaXplXG4gICAgICAgIHJlc3VsdCA9IFtdXG4gICAgICAgIGZvciBsaW5lLCBpIGluIGxpbmVzXG4gICAgICAgICAgICBzcHJpdGUgPSBAY3JlYXRlU3ByaXRlKGxpbmUpXG4gICAgICAgICAgICByZXN1bHQucHVzaChzcHJpdGUpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgYSBuZXcgbGluZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG5ld0xpbmVcbiAgICAjIyNcbiAgICBuZXdMaW5lOiAtPlxuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIEBjdXJyZW50WSArPSBAY3VycmVudExpbmVIZWlnaHQgKyBAbGluZVNwYWNpbmdcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcGxheXMgYSBmb3JtYXR0ZWQgdGV4dCBpbW1lZGlhdGVseSB3aXRob3V0IGFueSBkZWxheXMgb3IgYW5pbWF0aW9ucy4gVGhlXG4gICAgKiBDb21wb25lbnRfVGV4dFJlbmRlcmVyLmRyYXdGb3JtYXR0ZWRUZXh0IG1ldGhvZCBmcm9tIHRoZSBiYXNlLWNsYXNzIGNhbm5vdFxuICAgICogYmUgdXNlZCBoZXJlIGJlY2F1c2UgaXQgd291bGQgcmVuZGVyIHRvIHRoZSBnYW1lIG9iamVjdCdzIGJpdG1hcCBvYmplY3Qgd2hpbGVcbiAgICAqIHRoaXMgbWV0aG9kIGlzIHJlbmRlcmluZyB0byB0aGUgc3ByaXRlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdGb3JtYXR0ZWRUZXh0SW1tZWRpYXRlbHlcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gZHJhdy5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZC5cbiAgICAjIyNcbiAgICBkcmF3Rm9ybWF0dGVkVGV4dEltbWVkaWF0ZWx5OiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dCwgd29yZFdyYXApIC0+XG4gICAgICAgIEBkcmF3Rm9ybWF0dGVkVGV4dCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB3b3JkV3JhcClcbiAgICAgICAgXG4gICAgICAgIGxvb3BcbiAgICAgICAgICAgIEBuZXh0Q2hhcigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAbGluZSA+PSBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZHJhd05leHQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgdW5sZXNzIEBpc1J1bm5pbmdcbiAgICAgICAgICAgIFxuICAgICAgICBAY3VycmVudFkgKz0gQGN1cnJlbnRMaW5lSGVpZ2h0ICsgQGxpbmVTcGFjaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIHJlbmRlcmluZy1wcm9jZXNzIGZvciB0aGUgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdGb3JtYXR0ZWRUZXh0XG4gICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGRyYXcuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdvcmRXcmFwIC0gSWYgd29yZFdyYXAgaXMgc2V0IHRvIHRydWUsIGxpbmUtYnJlYWtzIGFyZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQuXG4gICAgIyMjXG4gICAgZHJhd0Zvcm1hdHRlZFRleHQ6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB3b3JkV3JhcCkgLT5cbiAgICAgICAgdGV4dCA9IHRleHQgfHwgXCIgXCIgIyBVc2UgYSBzcGFjZSBjaGFyYWN0ZXIgaWYgbm8gdGV4dCBpcyBzcGVjaWZpZWQuXG4gICAgICAgIEBmb250LnNldChAb2JqZWN0LmZvbnQpXG4gICAgICAgIEBzcGVlZCA9IDExIC0gTWF0aC5yb3VuZChHYW1lTWFuYWdlci5zZXR0aW5ncy5tZXNzYWdlU3BlZWQgKiAyLjUpXG4gICAgICAgIEBpc1J1bm5pbmcgPSB5ZXNcbiAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgIEBsaW5lQW5pbWF0aW9uQ291bnQgPSBAc3BlZWRcbiAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBAdG9rZW4gPSBudWxsXG4gICAgICAgIEB0b2tlbkluZGV4ID0gMFxuICAgICAgICBAbWVzc2FnZSA9IHRleHRcbiAgICAgICAgQGxpbmUgPSAwXG4gICAgICAgIEBjdXJyZW50TGluZSA9IEBsaW5lXG4gICAgICAgIGN1cnJlbnRYID0gQGN1cnJlbnRYXG4gICAgICAgIEBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyhsY3NtKEBtZXNzYWdlKSwgd29yZFdyYXAsIEBjdXJyZW50WClcbiAgICAgICAgQHNwcml0ZXMgPSBAY3JlYXRlU3ByaXRlcyhAbGluZXMpXG4gICAgICAgIEBhbGxTcHJpdGVzID0gQGFsbFNwcml0ZXMuY29uY2F0KEBzcHJpdGVzKVxuICAgICAgICBAY3VycmVudFggPSBjdXJyZW50WFxuICAgICAgICBAY3VycmVudFNwcml0ZSA9IEBzcHJpdGVzW0BsaW5lXVxuICAgICAgICBAY3VycmVudFNwcml0ZS54ID0gQGN1cnJlbnRYICsgQG9iamVjdC5vcmlnaW4ueCArIEBvYmplY3QuZHN0UmVjdC54XG4gICAgICAgIEBtYXhMaW5lcyA9IEBjYWxjdWxhdGVNYXhMaW5lcyhAbGluZXMpXG4gICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0/LmNvbnRlbnRbQHRva2VuSW5kZXhdIHx8IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIFwiXCIpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQHN0YXJ0KClcbiAgICAgXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSBtZXNzYWdlLXJlbmRlcmluZyBwcm9jZXNzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgIFxuICAgIHN0YXJ0OiAtPlxuICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID09IDBcbiAgICAgICAgICAgIEBpbnN0YW50U2tpcCgpXG4gICAgICAgIGVsc2UgaWYgQG1heExpbmVzID09IDBcbiAgICAgICAgICAgICMgSWYgZmlyc3QgbGluZSBpcyBlbXB0eSB0aGVuIGl0IGRvZXNuJ3QgZml0IGludG8gY3VycmVudCBsaW5lLCBzbyBmaW5pc2guXG4gICAgICAgICAgICBpZiBAbGluZXNbMF0/LmNvbnRlbnQgPT0gXCJcIlxuICAgICAgICAgICAgICAgIEBmaW5pc2goKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBtYXhMaW5lcyA9IDFcbiAgICAgICAgICAgICAgICBAZHJhd05leHQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZHJhd05leHQoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgY3VycmVudCBtZXNzYWdlIGFuZCBmaW5pc2hlcyB0aGUgbWVzc2FnZS1wcm9jZXNzaW5nIGltbWVkaWF0ZWx5LiBUaGUgbWVzc2FnZVxuICAgICogdG9rZW5zIGFyZSBwcm9jZXNzZWQgYnV0IG5vdCByZW5kZXJlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluc3RhbnRTa2lwXG4gICAgIyMjICBcbiAgICBpbnN0YW50U2tpcDogLT5cbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgaWYgQGxpbmUgPCBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICBAbmV4dENoYXIoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGxpbmUgPj0gQG1heExpbmVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcHJvY2Vzc1Rva2VuKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIHVubGVzcyBAaXNSdW5uaW5nIGFuZCBAbGluZSA8IEBtYXhMaW5lc1xuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlV2FpdGluZ1wiLCB0aGlzKVxuICAgICAgICBAY29udGludWUoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIGN1cnJlbnQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBwcm9jZXNzVG9rZW5cbiAgICAjIyMgICAgXG4gICAgcHJvY2Vzc1Rva2VuOiAtPlxuICAgICAgICB0b2tlbiA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIEB0b2tlbi5jb2RlP1xuICAgICAgICAgICAgdG9rZW4gPSBAcHJvY2Vzc0NvbnRyb2xUb2tlbihAdG9rZW4sIG5vKVxuICAgICAgICAgICAgaWYgdG9rZW4/XG4gICAgICAgICAgICAgICAgQHRva2VuID0gdG9rZW5cbiAgICAgICAgICAgICAgICBAdG9rZW4ub25TdGFydD8oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2tlbiA9IEB0b2tlblxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiB0b2tlblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuZ3MuQ29tcG9uZW50X01lc3NhZ2VUZXh0UmVuZGVyZXIgPSBDb21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlciJdfQ==
//# sourceURL=Component_MessageTextRenderer_127.js