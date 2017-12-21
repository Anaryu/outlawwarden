var Component_TextRenderer, RendererTextLine, RendererToken,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RendererTextLine = (function() {

  /**
  * Stores a text line.
  * 
  * @module gs.RendererTextLine
  * @class RendererTextLine
  * @memberof gs.RendererTextLine
  * @constructor
   */
  function RendererTextLine() {

    /*
    * The width of the line in pixels.
    * @property width
    * @type number
    * @protected
     */
    this.width = 0;

    /*
    * The height of the line in pixels.
    * @property width
    * @type number
    * @protected
     */
    this.height = 0;

    /*
    * The descent of the line in pixels.
    * @property descent
    * @type number
    * @protected
     */
    this.descent = 0;

    /*
    * The content of the line as token objects.
    * @property content
    * @type Object[]
    * @protected
     */
    this.content = [];
  }

  return RendererTextLine;

})();

gs.RendererTextLine = RendererTextLine;

RendererToken = (function() {

  /**
  * Stores a token.
  * 
  * @module gs
  * @class RendererToken
  * @memberof gs
  * @constructor
   */
  function RendererToken(code, value, font) {

    /*
    * The value of the token. That value depends on the token type. For text-tokens, it stores
    * the actual text.
    * @property content
    * @type string
     */
    this.value = value;

    /*
    * The code describes what kind of token it is. For example, if the code is "Y" it means it is a
    * style-token. If the code is <b>null</b>, it means it is a text-token.
    * @property code
    * @type string
     */
    this.code = code;

    /*
    * The format stores the font-style properties of the token like if it is italic, bold, etc. It can be <b>null</b>.
    * @property format
    * @type Object
     */
    this.format = null;
    if (font != null) {
      this.takeFormat(font);
    }
  }


  /**
  * Takes the style from the specified font and stores it into the format-property. The token will
  * will be rendered with that style then.
  * 
  * @method takeFormat
  * @param {gs.Font} font - The font to take the style from.
   */

  RendererToken.prototype.takeFormat = function(font) {
    return this.format = font.toDataBundle();
  };


  /**
  * Applies the format-style of the token on the specified font. The font will have the style from
  * then token then.
  * 
  * @method applyFormat
  * @param {gs.Font} font - The font to apply the format-style on.
   */

  RendererToken.prototype.applyFormat = function(font) {
    return font.set(this.format);
  };

  return RendererToken;

})();

gs.RendererToken = RendererToken;

Component_TextRenderer = (function(superClass) {
  extend(Component_TextRenderer, superClass);


  /**
  * A text-renderer component allow to draw plain or formatted text on a
  * game object's bitmap. For formatted text, different text-codes can be
  * used to add formatting or define a placeholder.<br><br>
  * 
  * A text-code uses the following syntax:<br><br>
  * 
  * {code:value} <- Single Value<br />
  * {code:value1,value2,...} <- Multiple Values<br><br>
  * 
  * Example:<br><br>
  * 
  * "This is {Y:I}a Text{Y:N}" <- "a Text" will be italic here.<br>
  * "The value is {GN:1}" <- "{GN:1}" will be replaced for the value of the global number variable 0001.<br><br>
  * 
  * For a list of all available text-codes with examples, just take a look into the offical help-file.
  * 
  * @module gs
  * @class Component_TextRenderer
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_TextRenderer() {
    Component_TextRenderer.__super__.constructor.apply(this, arguments);

    /**
    * @property currentX
    * @type number
    * @protected
     */
    this.currentX = 0;

    /**
    * @property currentY
    * @type number
    * @protected
     */
    this.currentY = 0;

    /**
    * @property currentLineHeight
    * @type number
    * @protected
     */
    this.currentLineHeight = 0;

    /**
    * @property font
    * @type gs.Font
    * @protected
     */
    this.font = new Font("Times New Roman", 22);

    /**
    * @property spaceSize
    * @type number
    * @protected
     */
    this.spaceSize = 0;

    /**
    * @property fontSize
    * @type number
    * @protected
     */
    this.fontSize = 0;

    /**
    * The left and right padding per line.
    * @property padding
    * @type number
     */
    this.padding = 0;

    /**
    * The spacing between text lines in pixels.
    * @property lineSpacing
    * @type number
     */
    this.lineSpacing = 0;
  }


  /**
  * Creates the token-object for a list-placeholder. A list-placeholder
  * allows to insert a value from a list-variable.
  * 
  * @method createListToken
  * @param {Array} list - The list.
  * @param {Array} values - The values of the list-placeholder text-code.
  * @return {string} The token-object.
   */

  Component_TextRenderer.prototype.createListToken = function(list, values) {
    var index;
    index = 0;
    if (values[1] != null) {
      values = values[1].split(":");
      index = values[0];
      if (values[0] === "G") {
        index = GameManager.variableStore.numbers[parseInt(values[1]) - 1];
      } else if (values[0] === "P") {
        index = GameManager.variableStore.persistentNumbers[parseInt(values[1]) - 1];
      } else if (values[0] === "L") {
        index = GameManager.variableStore.numberValueOf({
          scope: 0,
          index: parseInt(values[1]) - 1
        });
      }
    }
    return "" + list[index];
  };


  /**
  * Parses and returns the variable identifier which is an array containing
  * the optional domain name and the variable index as: [domain, index].
  * 
  * @method parseVariableIdentifier
  * @param {string} identifier - The variable identifier e.g. com.degica.vnm.default.1 or com.degica.vnm.default.VarName
  * @param {string} type - The variable type to parse: number, string, boolean or list
  * @param {string} type - The scope of the variable to parse: 0 = local, 1 = global, 2 = persistent.
  * @return {Array} An array containing two values as: [domain, index]. If the identifier doesn't contain a domain-string, the domain will be 0 (default).
   */

  Component_TextRenderer.prototype.parseVariableIdentifier = function(identifier, type, scope) {
    var index, result;
    result = [0, identifier];
    if (isNaN(identifier)) {
      index = identifier.lastIndexOf(".");
      if (index !== -1) {
        result[0] = identifier.substring(0, index);
        result[1] = identifier.substring(index + 1);
        if (isNaN(result[1])) {
          result[1] = GameManager.variableStore.indexOfVariable(result[1], type, scope, result[0]) + 1;
        } else {
          result[1] = parseInt(result[1]);
        }
      } else {
        result[1] = GameManager.variableStore.indexOfVariable(result[1], type, scope, result[0]) + 1;
      }
    } else {
      result[1] = parseInt(result[1]);
    }
    return result;
  };


  /**
  * Creates a token-object for a specified text-code.
  * 
  * @method createToken
  * @param {string} code - The code/type of the text-code.
  * @param {string} value - The value of the text-code.
  * @return {Object} The token-object.
   */

  Component_TextRenderer.prototype.createToken = function(code, value) {
    var format, listIdentifier, macro, pair, ref, ref1, ref2, ref3, tokenObject, values;
    tokenObject = null;
    value = isNaN(value) ? value : parseInt(value);
    switch (code) {
      case "SZ":
        tokenObject = new gs.RendererToken(code, value);
        this.font.size = tokenObject.value || this.fontSize;
        this.spaceSize = this.font.measureTextPlain(" ");
        break;
      case "Y":
        tokenObject = {
          code: code,
          value: value
        };
        switch (value) {
          case "U":
            this.font.underline = true;
            break;
          case "S":
            this.font.strikeThrough = true;
            break;
          case "I":
            this.font.italic = true;
            break;
          case "B":
            this.font.bold = true;
            break;
          case "C":
            this.font.smallCaps = true;
            break;
          case "NU":
            this.font.underline = false;
            break;
          case "NS":
            this.font.strikeThrough = false;
            break;
          case "NI":
            this.font.italic = false;
            break;
          case "NB":
            this.font.bold = false;
            break;
          case "NC":
            this.font.smallCaps = false;
            break;
          case "N":
            this.font.underline = false;
            this.font.strikeThrough = false;
            this.font.italic = false;
            this.font.bold = false;
            this.font.smallCaps = false;
        }
        this.spaceSize = this.font.measureTextPlain(" ");
        break;
      case "C":
        tokenObject = new gs.RendererToken(code, value);
        if (value <= 0) {
          this.font.color = Font.defaultColor;
        } else {
          this.font.color = gs.Color.fromObject(RecordManager.system.colors[value - 1] || Font.defaultColor);
        }
        break;
      case "GN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 1);
          tokenObject = sprintf("%" + format + "d", GameManager.variableStore.numbersByDomain[values[0] || 0][values[1] - 1] || 0);
        } else {
          values = this.parseVariableIdentifier(values[0], "number", 1);
          tokenObject = (GameManager.variableStore.numbersByDomain[values[0] || 0][values[1] - 1] || 0).toString();
        }
        break;
      case "GT":
        values = this.parseVariableIdentifier(value, "string", 1);
        tokenObject = GameManager.variableStore.stringsByDomain[values[0] || 0][values[1] - 1] || "";
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          tokenObject.pop();
        } else {
          tokenObject = (ref = tokenObject[0]) != null ? ref : "";
        }
        break;
      case "GS":
        values = this.parseVariableIdentifier(value, "boolean", 1);
        tokenObject = (GameManager.variableStore.booleansByDomain[values[0] || 0][values[1] - 1] || false).toString();
        break;
      case "GL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 1);
        tokenObject = this.createListToken(GameManager.variableStore.listsByDomain[listIdentifier[0]][listIdentifier[1] - 1] || [], values);
        break;
      case "PN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 2);
          tokenObject = sprintf("%" + format + "d", GameManager.variableStore.persistentNumbers[values[0]][values[1] - 1] || 0);
        } else {
          tokenObject = (GameManager.variableStore.persistentNumbers[0][values[0] - 1] || 0).toString();
        }
        break;
      case "PT":
        values = this.parseVariableIdentifier(value, "string", 2);
        tokenObject = GameManager.variableStore.persistentStrings[values[0]][values[1] - 1] || "";
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          tokenObject.pop();
        } else {
          tokenObject = (ref1 = tokenObject[0]) != null ? ref1 : "";
        }
        break;
      case "PS":
        values = this.parseVariableIdentifier(value, "boolean", 2);
        tokenObject = (GameManager.variableStore.persistentBooleans[values[0]][values[1] - 1] || false).toString();
        break;
      case "PL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 2);
        tokenObject = this.createListToken(GameManager.variableStore.persistentLists[listIdentifier[0]][listIdentifier[1] - 1] || [], values);
        break;
      case "LN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 0);
          tokenObject = sprintf("%" + format + "d", GameManager.variableStore.numberValueOf({
            scope: 0,
            index: values[1] - 1
          }) || 0);
        } else {
          values = this.parseVariableIdentifier(values[0], "number", 0);
          tokenObject = (GameManager.variableStore.numberValueOf({
            scope: 0,
            index: values[1] - 1
          }) || 0).toString();
        }
        break;
      case "LT":
        values = this.parseVariableIdentifier(value, "string", 0);
        tokenObject = (GameManager.variableStore.stringValueOf({
          scope: 0,
          index: values[1] - 1
        }) || "").toString();
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          tokenObject.pop();
        } else {
          tokenObject = (ref2 = tokenObject[0]) != null ? ref2 : "";
        }
        break;
      case "LS":
        values = this.parseVariableIdentifier(value, "boolean", 0);
        tokenObject = (GameManager.variableStore.booleanValueOf({
          scope: 0,
          index: values[1] - 1
        }) || false).toString();
        break;
      case "LL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 0);
        tokenObject = this.createListToken(GameManager.variableStore.listObjectOf({
          scope: 0,
          index: listIdentifier[1] - 1
        }) || [], values);
        break;
      case "N":
        tokenObject = (RecordManager.characters[value] != null ? lcs(RecordManager.characters[value].name) : "");
        break;
      case "RT":
        pair = value.split("/");
        tokenObject = {
          code: code,
          rtStyleId: (ref3 = pair[2]) != null ? ref3 : 0,
          rb: pair[0],
          rt: pair[1],
          rbSize: {
            width: 0,
            height: 0
          },
          rtSize: {
            width: 0,
            height: 0
          }
        };
        break;
      case "M":
        macro = RecordManager.system.textMacros.first(function(m) {
          return m.name === value;
        });
        if (macro) {
          if (macro.type === 0) {
            tokenObject = macro.content.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
            tokenObject.pop();
          } else if (macro.type === 1) {
            if (!macro.contentFunc) {
              macro.contentFunc = eval("(function(object, value){ " + macro.content + " })");
            }
            tokenObject = macro.contentFunc(this.object, value);
            tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
            if (tokenObject.length > 1) {
              tokenObject.pop();
            }
          } else {
            if (!macro.contentFunc) {
              macro.contentFunc = eval("(function(object){ " + macro.content + " })");
            }
            tokenObject = new gs.RendererToken("X", macro.contentFunc);
          }
        } else {
          tokenObject = "";
        }
        break;
      default:
        tokenObject = new gs.RendererToken(code, value);
    }
    return tokenObject;
  };


  /**
  * <p>Gets the correct font for the specified ruby-text token.</p> 
  *
  * @param {Object} token - A ruby-text token.
  * @return {gs.Font} The font for the ruby-text which is shown above the original text.
  * @method getRubyTextFont
   */

  Component_TextRenderer.prototype.getRubyTextFont = function(token) {
    var font, ref, style;
    style = null;
    font = null;
    if (token.rtStyleId) {
      style = ui.UIManager.styles["rubyText-" + token.rtStyleId];
    }
    if (!style) {
      style = ui.UIManager.styles["rubyText"];
    }
    font = (ref = style != null ? style.font : void 0) != null ? ref : this.font;
    font.size = font.size || this.font.size / 2;
    return font;
  };


  /**
  * <p>Measures a control-token. If a token produces a visual result like displaying an icon then it must return the size taken by
  * the visual result. If the token has no visual result, <b>null</b> must be returned. This method is called for every token when the message is initialized.</p> 
  *
  * @param {Object} token - A control-token.
  * @return {gs.Size} The size of the area taken by the visual result of the token or <b>null</b> if the token has no visual result.
  * @method measureControlToken
  * @protected
   */

  Component_TextRenderer.prototype.measureControlToken = function(token) {
    var animation, font, fs, imageBitmap, size;
    size = null;
    switch (token.code) {
      case "A":
        animation = RecordManager.animations[Math.max(token.value - 1, 0)];
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          imageBitmap = ResourceManager.getBitmap("Graphics/Pictures/" + animation.graphic.name);
          if (imageBitmap != null) {
            size = {
              width: Math.round(imageBitmap.width / animation.framesX),
              height: Math.round(imageBitmap.height / animation.framesY)
            };
          }
        }
        break;
      case "RT":
        font = this.getRubyTextFont(token);
        fs = font.size;
        font.size = font.size || this.font.size / 2;
        token.rbSize = this.font.measureTextPlain(token.rb);
        token.rtSize = font.measureTextPlain(token.rt);
        font.size = fs;
        size = {
          width: Math.max(token.rbSize.width, token.rtSize.width),
          height: token.rbSize.height + token.rtSize.height
        };
    }
    return size;
  };


  /**
  * <p>Draws the visual result of a token, like an icon for example, to the specified bitmap. This method is called for every token while the text is rendered.</p> 
  *
  * @param {Object} token - A control-token.
  * @param {gs.Bitmap} bitmap - The bitmap used for the current text-line. Can be used to draw something on it like an icon, etc.
  * @param {number} offset - An x-offset for the draw-routine.
  * @method drawControlToken
  * @protected
   */

  Component_TextRenderer.prototype.drawControlToken = function(token, bitmap, offset) {
    var animation, font, fs, imageBitmap, rect, ref, ref1, style;
    switch (token.code) {
      case "A":
        animation = RecordManager.animations[Math.max(token.value - 1, 0)];
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          imageBitmap = ResourceManager.getBitmap("Graphics/Pictures/" + animation.graphic.name);
          if (imageBitmap != null) {
            rect = new gs.Rect(0, 0, Math.round(imageBitmap.width / animation.framesX), Math.round(imageBitmap.height / animation.framesY));
            return bitmap.blt(offset, this.currentY, imageBitmap, rect);
          }
        }
        break;
      case "RT":
        style = null;
        if (token.rtStyleId) {
          style = ui.UIManager.styles["rubyText-" + token.rtStyleId];
        }
        if (!style) {
          style = ui.UIManager.styles["rubyText"];
        }
        font = (ref = style != null ? style.font : void 0) != null ? ref : this.font;
        fs = font.size;
        font.size = font.size || this.font.size / 2;
        if (style && !((ref1 = style.descriptor.font) != null ? ref1.color : void 0)) {
          font.color.set(this.font.color);
        }
        bitmap.font = font;
        bitmap.drawText(offset, bitmap.font.descent, Math.max(token.rbSize.width, token.rtSize.width), bitmap.height, token.rt, 1, 0);
        bitmap.font = this.font;
        font.size = fs;
        return bitmap.drawText(offset, token.rtSize.height, Math.max(token.rbSize.width, token.rtSize.width), bitmap.height, token.rb, 1, 0);
    }
  };


  /**
  * Splits up the specified token using a japanese word-wrap technique.
  * 
  * @method wordWrapJapanese
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapJapanese = function(token, line, width, height, result) {
    var ch, depth, depthLevel, descent, endOfLine, i, j, lastCharacterIndex, moved, noSplit, size, startOfLine;
    startOfLine = '—…‥〳〴〵。.・、:;, ?!‼⁇⁈⁉‐゠–〜)]｝〕〉》」』】〙〗〟’"｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻';
    endOfLine = '([｛〔〈《「『【〘〖〝‘"｟«';
    noSplit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789０１２３４５６７８９—…‥〳〴〵';
    descent = this.font.descent;
    size = this.font.measureTextPlain(token);
    depth = 8;
    depthLevel = 0;
    i = 0;
    j = 0;
    lastCharacterIndex = 0;
    if (size.width > this.object.dstRect.width - this.spaceSize.width * 3 - this.padding * 2) {
      while (i < token.length) {
        ch = token[i];
        size = this.font.measureTextPlain(ch);
        width += size.width;
        moved = false;
        if (width > this.object.dstRect.width - this.padding * 2) {
          depthLevel = 0;
          j = i;
          while (true) {
            moved = false;
            while (j > 0 && startOfLine.indexOf(token[j]) !== -1) {
              j--;
              moved = true;
            }
            while (j > 0 && endOfLine.indexOf(token[j - 1]) !== -1) {
              j--;
              moved = true;
            }
            while (j > 0 && noSplit.indexOf(token[j - 1]) !== -1) {
              j--;
              moved = true;
            }
            if (j === 0 && moved) {
              break;
            } else {
              i = j;
            }
            depthLevel++;
            if (depthLevel >= depth || !moved) {
              break;
            }
          }
          line.content.push(new gs.RendererToken(null, token.substring(lastCharacterIndex, i), this.font));
          lastCharacterIndex = i;
          line.height = Math.max(height, this.font.lineHeight);
          line.width = width - size.width;
          line.descent = descent;
          descent = this.font.descent;
          height = size.height;
          result.push(line);
          line = new gs.RendererTextLine();
          width = width - (width - size.width);
        }
        i++;
      }
    } else {
      line.content.push(new gs.RendererToken(null, token, this.font));
      line.height = Math.max(height, this.font.lineHeight);
      line.width = width + size.width;
      line.descent = descent;
    }
    height = Math.max(height, this.font.lineHeight);
    if (lastCharacterIndex !== i) {
      line.content.push(new gs.RendererToken(null, token.substring(lastCharacterIndex, i), this.font));
      line.width = width;
      line.height = Math.max(height, line.height);
      line.descent = descent;
    }
    return line;
  };


  /**
  * Does not word-wrapping at all. It just adds the text token to the line as is.
  * 
  * @method wordWrapNone
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapNone = function(token, line, width, height, result) {
    var size;
    size = this.font.measureTextPlain(token);
    height = Math.max(size.height, height || this.font.lineHeight);
    if (token.length > 0) {
      line.width += size.width;
      line.height = Math.max(height, line.height);
      line.descent = this.font.descent;
      line.content.push(new gs.RendererToken(null, token));
    }
    return line;
  };


  /**
  * Splits up the specified token using a space-based word-wrap technique.
  * 
  * @method wordWrapSpaceBased
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapSpaceBased = function(token, line, width, height, result) {
    var currentWords, descent, i, k, len, size, word, words;
    currentWords = [];
    words = token.split(" ");
    descent = this.font.descent;
    this.spaceSize = this.font.measureTextPlain(" ");
    for (i = k = 0, len = words.length; k < len; i = ++k) {
      word = words[i];
      size = this.font.measureTextPlain(word);
      width += size.width + this.spaceSize.width;
      if (width > this.object.dstRect.width - this.padding * 2) {
        token = new gs.RendererToken(null, currentWords.join(" "));
        token.takeFormat(this.font);
        line.content.push(token);
        line.height = Math.max(height, line.height);
        line.width = width - size.width;
        line.descent = Math.max(line.descent, descent);
        descent = Math.max(descent, this.font.descent);
        height = size.height;
        result.push(line);
        line = new gs.RendererTextLine();
        currentWords = [word];
        width = width - (width - size.width);
      } else {
        currentWords.push(word);
      }
      height = Math.max(height, this.font.lineHeight);
    }
    if (currentWords.length > 0) {
      token = new gs.RendererToken(null, currentWords.join(" "));
      token.takeFormat(this.font);
      line.content.push(token);
      line.width = width;
      line.height = Math.max(height, line.height);
      line.descent = Math.max(descent, line.descent);
    }
    return line;
  };


  /**
  * Splits up the specified token using a word-wrap technique. The kind of word-wrap technique
  * depends on the selected language. You can overwrite this method in derived classes to implement your
  * own custom word-wrap techniques.
  * 
  * @method executeWordWrap
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.executeWordWrap = function(token, line, width, height, result, wordWrap) {
    if (wordWrap) {
      switch (LanguageManager.language.wordWrap) {
        case "spaceBased":
          return this.wordWrapSpaceBased(token, line, width, height, result);
        case "japanese":
          return this.wordWrapJapanese(token, line, width, height, result);
      }
    } else {
      return this.wordWrapNone(token, line, width, height, result);
    }
  };


  /**
  * Creates an a of line-objects. Each line-object is a list of token-objects. 
  * A token-object can be just a string or an object containing more information
  * about how to process the token at runtime.
  * 
  * A line-object also contains additional information like the width and height
  * of the line(in pixels).
  * 
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  * 
  * @method calculateLines
  * @param {string} message - A message creating the line-objects for.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
  * @param {number} [firstLineWidth=0] - The current width of the first line.
  * @return {Array} An array of line-objects.
   */

  Component_TextRenderer.prototype.calculateLines = function(message, wordWrap, firstLineWidth) {
    var bold, currentWords, descent, height, italic, line, result, size, smallCaps, strikeThrough, t, token, tokenObject, tokens, underline, width;
    result = [];
    line = new gs.RendererTextLine();
    width = firstLineWidth || 0;
    height = 0;
    descent = this.font.descent;
    currentWords = [];
    size = null;
    this.spaceSize = this.font.measureChar(" ");
    this.fontSize = this.font.size;
    tokens = message.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
    token = null;
    t = 0;
    underline = this.font.underline;
    strikeThrough = this.font.strikeThrough;
    italic = this.font.italic;
    bold = this.font.bold;
    smallCaps = this.font.smallCaps;
    while (t < tokens.length) {
      token = tokens[t];
      if (t % 4 !== 0) {
        if (token != null) {
          tokenObject = this.createToken(token, tokens[t + 1]);
          if (tokenObject.push != null) {
            Array.prototype.splice.apply(tokens, [t + 3, 0].concat(tokenObject));
          } else if (tokenObject.code == null) {
            tokens[t + 3] = tokenObject + tokens[t + 3];
          } else {
            size = this.measureControlToken(tokenObject);
            if (size) {
              width += size.width;
              height = Math.max(height, size.height);
            }
            line.content.push(tokenObject);
          }
        } else {
          line.height = height || this.font.lineHeight;
          line.width = width;
          line.descent = descent;
          result.push(line);
          line = new gs.RendererTextLine();
          line.content.push(new gs.RendererToken(null, "\n", this.font));
          width = 0;
          height = 0;
          descent = this.font.descent;
        }
        t += 2;
      } else if (token.length > 0) {
        line = this.executeWordWrap(token, line, width, height, result, wordWrap);
        width = line.width;
        height = line.height;
        descent = line.descent;
      }
      t++;
    }
    if (line.content.length > 0 || result.length === 0) {
      line.height = height;
      line.width = width;
      line.descent = descent;
      result.push(line);
    }
    this.font.size = this.fontSize;
    this.font.underline = underline;
    this.font.strikeThrough = strikeThrough;
    this.font.italic = italic;
    this.font.bold = bold;
    this.font.smallCaps = smallCaps;
    return result;
  };


  /**
  * Measures the dimensions of formatted lines in pixels. The result is not
  * pixel-perfect.
  * 
  * @method measureFormattedLines
  * @param {gs.RendererTextLine[]} lines - An array of text lines to measure.
  * @param {boolean} wordWrap - If wordWrap is set to true, automatically created line-breaks will be calculated.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureFormattedLines = function(lines, wordWrap) {
    var k, len, line, size;
    size = {
      width: 0,
      height: 0
    };
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      size.width = Math.max(line.width + 2, size.width);
      size.height += line.height + this.lineSpacing;
    }
    size.height -= this.lineSpacing;
    return size;
  };


  /**
  * Measures the dimensions of a formatted text in pixels. The result is not
  * pixel-perfect.
  * 
  * @method measureFormattedText
  * @param {string} text - The text to measure.
  * @param {boolean} wordWrap - If wordWrap is set to true, automatically created line-breaks will be calculated.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureFormattedText = function(text, wordWrap) {
    var lines, size;
    this.font.set(this.object.font);
    size = null;
    lines = this.calculateLines(text, wordWrap);
    size = this.measureFormattedLines(lines, wordWrap);
    return size;
  };


  /**
  * Measures the dimensions of a plain text in pixels. Formatting and
  * word-wrapping are not supported.
  *
  * @method measureText
  * @param {string} text - The text to measure.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureText = function(text) {
    var k, len, line, lineSize, lines, size;
    size = {
      width: 0,
      height: 0
    };
    lines = text.toString().split("\n");
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      lineSize = this.object.font.measureText(text);
      size.width = Math.max(size.width, lineSize.width);
      size.height += this.object.font.lineHeight + this.lineSpacing;
    }
    size.height -= this.lineSpacing;
    return size;
  };


  /**
  * Searches for a token in a list of tokens and returns the first match.
  *
  * @method findToken
  * @param {number} startIndex - The index in the list of tokens where the search will start.
  * @param {string} code - The code of the token to search for.
  * @param {number} direction - The search direction, can be forward(1) or backward(-1).
  * @param {Object[]} tokens - The list of tokens to search.
  * @result {Object} The first token which matches the specified code or <b>null</b> if the token cannot be found.
   */

  Component_TextRenderer.prototype.findToken = function(startIndex, code, direction, tokens) {
    var i, t, token;
    token = null;
    i = startIndex;
    if (direction === -1) {
      while (i >= 0) {
        t = tokens[i];
        if (t.code === code) {
          token = t;
          break;
        }
        i--;
      }
    }
    return token;
  };


  /**
  * Searches for a specific kind of tokens between a start and an end token.
  *
  * @method findTokensBetween
  * @param {number} startIndex - The index where the search will start.
  * @param {number} endIndex - The index where the search will end.
  * @param {string} code - The code of the token-type to search for.
  * @param {Object[]} tokens - The list of tokens to search.
  * @result {Object[]} List of tokens matching the specified code. Its an empty list if no tokens were found.
   */

  Component_TextRenderer.prototype.findTokensBetween = function(startIndex, endIndex, code, tokens) {
    var e, result, s, token;
    result = [];
    s = startIndex;
    e = endIndex;
    while (s < e) {
      token = tokens[s];
      if (token.code == code) {
        result.push(token);
      }
      s++;
    }
    return result;
  };


  /**
  * Processes a control-token. A control-token is a token which influences
  * the text-rendering like changing the fonts color, size or style.
  *
  * Changes will be automatically applied to the game object's font.
  *
  * @method processControlToken
  * @param {Object} token - A control-token.
  * @return {Object} An object which can contain additional info needed for processing.
   */

  Component_TextRenderer.prototype.processControlToken = function(token) {
    var result;
    result = null;
    switch (token.code) {
      case "SZ":
        this.object.font.size = token.value || this.fontSize;
        break;
      case "C":
        if (token.value <= 0) {
          this.object.font.color = Font.defaultColor;
        } else {
          this.object.font.color = RecordManager.system.colors[token.value - 1] || Font.defaultColor;
        }
        break;
      case "Y":
        switch (token.value) {
          case "U":
            this.object.font.underline = true;
            break;
          case "S":
            this.object.font.strikeThrough = true;
            break;
          case "I":
            this.object.font.italic = true;
            break;
          case "B":
            this.object.font.bold = true;
            break;
          case "C":
            this.object.font.smallCaps = true;
            break;
          case "NU":
            this.object.font.underline = false;
            break;
          case "NS":
            this.object.font.strikeThrough = false;
            break;
          case "NI":
            this.object.font.underline = false;
            break;
          case "NB":
            this.object.font.bold = false;
            break;
          case "NC":
            this.object.font.smallCaps = false;
            break;
          case "N":
            this.object.font.underline = false;
            this.object.font.strikeThrough = false;
            this.object.font.italic = false;
            this.object.font.bold = false;
            this.object.font.smallCaps = false;
        }
    }
    return result;
  };


  /**
  * Draws a plain text. Formatting and word-wrapping are not supported.
  *
  * @method drawText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
   */

  Component_TextRenderer.prototype.drawText = function(pl, pt, pr, pb, text) {
    var font, height, i, k, len, line, lines, size;
    lines = text.toString().split("\n");
    font = this.object.font;
    height = font.lineHeight;
    for (i = k = 0, len = lines.length; k < len; i = ++k) {
      line = lines[i];
      size = font.measureText(line);
      this.object.bitmap.drawText(pl, i * height + pt, size.width + pr + pl, height + pt + pb, line, 0, 0);
    }
    return null;
  };


  /**
  * Draws an array of formatted text lines. 
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  *
  * @method drawFormattedLines
  * @param {number} pl - The left-padding of the text's position.
  * @param {number} pt - The top-padding of the text's position.
  * @param {number} pr - The right-padding of the text's position.
  * @param {number} pb - The bottom-padding of the text's position.
  * @param {gs.RendererTextLine[]} lines - An array of lines to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_TextRenderer.prototype.drawFormattedLines = function(pl, pt, pr, pb, lines, wordWrap) {
    var font, height, k, l, len, len1, line, ref, size, token;
    this.currentX = pl;
    this.currentY = pt;
    this.currentLineHeight = 0;
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      ref = line.content;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        token = ref[l];
        if (token.code != null) {
          this.processControlToken(token);
          size = this.measureControlToken(token);
          if (size) {
            this.drawControlToken(token, this.object.bitmap, this.currentX);
            this.currentX += size.width;
          }
        } else if (token.value.length > 0) {
          font = this.object.font;
          height = line.height;
          if (token.value !== "\n") {
            size = font.measureTextPlain(token.value);
            this.object.bitmap.drawText(this.currentX, this.currentY + height - size.height + font.descent - line.descent, size.width + pl + pr, height + pt + pb, token.value, 0, 0);
            this.currentX += size.width;
          }
          this.currentLineHeight = Math.max(this.currentLineHeight, height);
        }
      }
      this.currentY += (this.currentLineHeight || this.object.font.lineHeight) + this.lineSpacing;
      this.currentX = pl;
      this.currentLineHeight = 0;
    }
    return null;
  };


  /**
  * Draws a formatted text. 
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  *
  * @method drawFormattedText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
  * @return {gs.RendererTextLine[]} The drawn text lines.
   */

  Component_TextRenderer.prototype.drawFormattedText = function(pl, pt, pr, pb, text, wordWrap) {
    var lines;
    lines = this.calculateLines(text.toString(), wordWrap);
    this.drawFormattedLines(pl, pt, pr, pb, lines, wordWrap);
    return lines;
  };

  return Component_TextRenderer;

})(gs.Component);

gs.Component_TextRenderer = Component_TextRenderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsdURBQUE7RUFBQTs7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsMEJBQUE7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBQ1Y7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBQ1g7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVc7RUE1QkY7Ozs7OztBQThCakIsRUFBRSxDQUFDLGdCQUFILEdBQXNCOztBQUVoQjs7QUFDRjs7Ozs7Ozs7RUFRYSx1QkFBQyxJQUFELEVBQU8sS0FBUCxFQUFjLElBQWQ7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxJQUFELEdBQVE7O0FBQ1I7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUVWLElBQXFCLFlBQXJCO01BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQUE7O0VBdEJTOzs7QUF3QmI7Ozs7Ozs7OzBCQU9BLFVBQUEsR0FBWSxTQUFDLElBQUQ7V0FDUixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxZQUFMLENBQUE7RUFERjs7O0FBR1o7Ozs7Ozs7OzBCQU9BLFdBQUEsR0FBYSxTQUFDLElBQUQ7V0FDVCxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxNQUFWO0VBRFM7Ozs7OztBQUdqQixFQUFFLENBQUMsYUFBSCxHQUFtQjs7QUFFYjs7OztBQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF1QmEsZ0NBQUE7SUFDVCx5REFBQSxTQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7SUFLQSxJQUFDLENB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QyxRQUEzQztBQUVBLFdBQU87RUFMUTs7OztHQTMyQmMsRUFBRSxDQUFDOztBQWszQnhDLEVBQUUsQ0FBQyxzQkFBSCxHQUE0QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X1RleHRSZW5kZXJlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBSZW5kZXJlclRleHRMaW5lXG4gICAgIyMjKlxuICAgICogU3RvcmVzIGEgdGV4dCBsaW5lLlxuICAgICogXG4gICAgKiBAbW9kdWxlIGdzLlJlbmRlcmVyVGV4dExpbmVcbiAgICAqIEBjbGFzcyBSZW5kZXJlclRleHRMaW5lXG4gICAgKiBAbWVtYmVyb2YgZ3MuUmVuZGVyZXJUZXh0TGluZVxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjI1xuICAgICAgICAqIFRoZSB3aWR0aCBvZiB0aGUgbGluZSBpbiBwaXhlbHMuXG4gICAgICAgICogQHByb3BlcnR5IHdpZHRoXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHdpZHRoID0gMFxuICAgICAgICAjIyNcbiAgICAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBsaW5lIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2lkdGhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaGVpZ2h0ID0gMFxuICAgICAgICAjIyNcbiAgICAgICAgKiBUaGUgZGVzY2VudCBvZiB0aGUgbGluZSBpbiBwaXhlbHMuXG4gICAgICAgICogQHByb3BlcnR5IGRlc2NlbnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZGVzY2VudCA9IDBcbiAgICAgICAgIyMjXG4gICAgICAgICogVGhlIGNvbnRlbnQgb2YgdGhlIGxpbmUgYXMgdG9rZW4gb2JqZWN0cy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGVudFxuICAgICAgICAqIEB0eXBlIE9iamVjdFtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbnRlbnQgPSBbXVxuICAgICAgICBcbmdzLlJlbmRlcmVyVGV4dExpbmUgPSBSZW5kZXJlclRleHRMaW5lXG5cbmNsYXNzIFJlbmRlcmVyVG9rZW5cbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgYSB0b2tlbi5cbiAgICAqIFxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIFJlbmRlcmVyVG9rZW5cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChjb2RlLCB2YWx1ZSwgZm9udCkgLT5cbiAgICAgICAgIyMjXG4gICAgICAgICogVGhlIHZhbHVlIG9mIHRoZSB0b2tlbi4gVGhhdCB2YWx1ZSBkZXBlbmRzIG9uIHRoZSB0b2tlbiB0eXBlLiBGb3IgdGV4dC10b2tlbnMsIGl0IHN0b3Jlc1xuICAgICAgICAqIHRoZSBhY3R1YWwgdGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGVudFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQHZhbHVlID0gdmFsdWVcbiAgICAgICAgIyMjXG4gICAgICAgICogVGhlIGNvZGUgZGVzY3JpYmVzIHdoYXQga2luZCBvZiB0b2tlbiBpdCBpcy4gRm9yIGV4YW1wbGUsIGlmIHRoZSBjb2RlIGlzIFwiWVwiIGl0IG1lYW5zIGl0IGlzIGFcbiAgICAgICAgKiBzdHlsZS10b2tlbi4gSWYgdGhlIGNvZGUgaXMgPGI+bnVsbDwvYj4sIGl0IG1lYW5zIGl0IGlzIGEgdGV4dC10b2tlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgY29kZVxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQGNvZGUgPSBjb2RlXG4gICAgICAgICMjI1xuICAgICAgICAqIFRoZSBmb3JtYXQgc3RvcmVzIHRoZSBmb250LXN0eWxlIHByb3BlcnRpZXMgb2YgdGhlIHRva2VuIGxpa2UgaWYgaXQgaXMgaXRhbGljLCBib2xkLCBldGMuIEl0IGNhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAgICAgKiBAcHJvcGVydHkgZm9ybWF0XG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAZm9ybWF0ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgQHRha2VGb3JtYXQoZm9udCkgaWYgZm9udD9cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFRha2VzIHRoZSBzdHlsZSBmcm9tIHRoZSBzcGVjaWZpZWQgZm9udCBhbmQgc3RvcmVzIGl0IGludG8gdGhlIGZvcm1hdC1wcm9wZXJ0eS4gVGhlIHRva2VuIHdpbGxcbiAgICAqIHdpbGwgYmUgcmVuZGVyZWQgd2l0aCB0aGF0IHN0eWxlIHRoZW4uXG4gICAgKiBcbiAgICAqIEBtZXRob2QgdGFrZUZvcm1hdFxuICAgICogQHBhcmFtIHtncy5Gb250fSBmb250IC0gVGhlIGZvbnQgdG8gdGFrZSB0aGUgc3R5bGUgZnJvbS5cbiAgICAjIyNcbiAgICB0YWtlRm9ybWF0OiAoZm9udCkgLT5cbiAgICAgICAgQGZvcm1hdCA9IGZvbnQudG9EYXRhQnVuZGxlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBcHBsaWVzIHRoZSBmb3JtYXQtc3R5bGUgb2YgdGhlIHRva2VuIG9uIHRoZSBzcGVjaWZpZWQgZm9udC4gVGhlIGZvbnQgd2lsbCBoYXZlIHRoZSBzdHlsZSBmcm9tXG4gICAgKiB0aGVuIHRva2VuIHRoZW4uXG4gICAgKiBcbiAgICAqIEBtZXRob2QgYXBwbHlGb3JtYXRcbiAgICAqIEBwYXJhbSB7Z3MuRm9udH0gZm9udCAtIFRoZSBmb250IHRvIGFwcGx5IHRoZSBmb3JtYXQtc3R5bGUgb24uXG4gICAgIyMjICAgIFxuICAgIGFwcGx5Rm9ybWF0OiAoZm9udCkgLT5cbiAgICAgICAgZm9udC5zZXQoQGZvcm1hdClcbiAgICAgICAgXG5ncy5SZW5kZXJlclRva2VuID0gUmVuZGVyZXJUb2tlblxuXG5jbGFzcyBDb21wb25lbnRfVGV4dFJlbmRlcmVyIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogQSB0ZXh0LXJlbmRlcmVyIGNvbXBvbmVudCBhbGxvdyB0byBkcmF3IHBsYWluIG9yIGZvcm1hdHRlZCB0ZXh0IG9uIGFcbiAgICAqIGdhbWUgb2JqZWN0J3MgYml0bWFwLiBGb3IgZm9ybWF0dGVkIHRleHQsIGRpZmZlcmVudCB0ZXh0LWNvZGVzIGNhbiBiZVxuICAgICogdXNlZCB0byBhZGQgZm9ybWF0dGluZyBvciBkZWZpbmUgYSBwbGFjZWhvbGRlci48YnI+PGJyPlxuICAgICogXG4gICAgKiBBIHRleHQtY29kZSB1c2VzIHRoZSBmb2xsb3dpbmcgc3ludGF4Ojxicj48YnI+XG4gICAgKiBcbiAgICAqIHtjb2RlOnZhbHVlfSA8LSBTaW5nbGUgVmFsdWU8YnIgLz5cbiAgICAqIHtjb2RlOnZhbHVlMSx2YWx1ZTIsLi4ufSA8LSBNdWx0aXBsZSBWYWx1ZXM8YnI+PGJyPlxuICAgICogXG4gICAgKiBFeGFtcGxlOjxicj48YnI+XG4gICAgKiBcbiAgICAqIFwiVGhpcyBpcyB7WTpJfWEgVGV4dHtZOk59XCIgPC0gXCJhIFRleHRcIiB3aWxsIGJlIGl0YWxpYyBoZXJlLjxicj5cbiAgICAqIFwiVGhlIHZhbHVlIGlzIHtHTjoxfVwiIDwtIFwie0dOOjF9XCIgd2lsbCBiZSByZXBsYWNlZCBmb3IgdGhlIHZhbHVlIG9mIHRoZSBnbG9iYWwgbnVtYmVyIHZhcmlhYmxlIDAwMDEuPGJyPjxicj5cbiAgICAqIFxuICAgICogRm9yIGEgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIHRleHQtY29kZXMgd2l0aCBleGFtcGxlcywganVzdCB0YWtlIGEgbG9vayBpbnRvIHRoZSBvZmZpY2FsIGhlbHAtZmlsZS5cbiAgICAqIFxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9UZXh0UmVuZGVyZXJcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRZXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRZID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50TGluZUhlaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgZm9udFxuICAgICAgICAqIEB0eXBlIGdzLkZvbnRcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZm9udCA9IG5ldyBGb250KFwiVGltZXMgTmV3IFJvbWFuXCIsIDIyKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBzcGFjZVNpemVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAc3BhY2VTaXplID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBmb250U2l6ZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBmb250U2l6ZSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGVmdCBhbmQgcmlnaHQgcGFkZGluZyBwZXIgbGluZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNwYWNpbmcgYmV0d2VlbiB0ZXh0IGxpbmVzIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgbGluZVNwYWNpbmdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBsaW5lU3BhY2luZyA9IDBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgdG9rZW4tb2JqZWN0IGZvciBhIGxpc3QtcGxhY2Vob2xkZXIuIEEgbGlzdC1wbGFjZWhvbGRlclxuICAgICogYWxsb3dzIHRvIGluc2VydCBhIHZhbHVlIGZyb20gYSBsaXN0LXZhcmlhYmxlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUxpc3RUb2tlblxuICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCAtIFRoZSBsaXN0LlxuICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIC0gVGhlIHZhbHVlcyBvZiB0aGUgbGlzdC1wbGFjZWhvbGRlciB0ZXh0LWNvZGUuXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB0b2tlbi1vYmplY3QuXG4gICAgIyMjXG4gICAgY3JlYXRlTGlzdFRva2VuOiAobGlzdCwgdmFsdWVzKSAtPlxuICAgICAgICBpbmRleCA9IDBcbiAgICAgICAgaWYgdmFsdWVzWzFdP1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzWzFdLnNwbGl0KFwiOlwiKVxuICAgICAgICAgICAgaW5kZXggPSB2YWx1ZXNbMF1cbiAgICAgICAgICAgIGlmIHZhbHVlc1swXSA9PSBcIkdcIlxuICAgICAgICAgICAgICAgIGluZGV4ID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJzW3BhcnNlSW50KHZhbHVlc1sxXSktMV1cbiAgICAgICAgICAgIGVsc2UgaWYgdmFsdWVzWzBdID09IFwiUFwiXG4gICAgICAgICAgICAgICAgaW5kZXggPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnROdW1iZXJzW3BhcnNlSW50KHZhbHVlc1sxXSktMV1cbiAgICAgICAgICAgIGVsc2UgaWYgdmFsdWVzWzBdID09IFwiTFwiXG4gICAgICAgICAgICAgICAgaW5kZXggPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLm51bWJlclZhbHVlT2YoeyBzY29wZTogMCwgaW5kZXg6IHBhcnNlSW50KHZhbHVlc1sxXSktMX0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBcIlwiICsgbGlzdFtpbmRleF1cbiAgICAgICBcbiAgICAgIFxuICAgICMjIypcbiAgICAqIFBhcnNlcyBhbmQgcmV0dXJucyB0aGUgdmFyaWFibGUgaWRlbnRpZmllciB3aGljaCBpcyBhbiBhcnJheSBjb250YWluaW5nXG4gICAgKiB0aGUgb3B0aW9uYWwgZG9tYWluIG5hbWUgYW5kIHRoZSB2YXJpYWJsZSBpbmRleCBhczogW2RvbWFpbiwgaW5kZXhdLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHBhcnNlVmFyaWFibGVJZGVudGlmaWVyXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gaWRlbnRpZmllciAtIFRoZSB2YXJpYWJsZSBpZGVudGlmaWVyIGUuZy4gY29tLmRlZ2ljYS52bm0uZGVmYXVsdC4xIG9yIGNvbS5kZWdpY2Eudm5tLmRlZmF1bHQuVmFyTmFtZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdmFyaWFibGUgdHlwZSB0byBwYXJzZTogbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4gb3IgbGlzdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgc2NvcGUgb2YgdGhlIHZhcmlhYmxlIHRvIHBhcnNlOiAwID0gbG9jYWwsIDEgPSBnbG9iYWwsIDIgPSBwZXJzaXN0ZW50LlxuICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IGNvbnRhaW5pbmcgdHdvIHZhbHVlcyBhczogW2RvbWFpbiwgaW5kZXhdLiBJZiB0aGUgaWRlbnRpZmllciBkb2Vzbid0IGNvbnRhaW4gYSBkb21haW4tc3RyaW5nLCB0aGUgZG9tYWluIHdpbGwgYmUgMCAoZGVmYXVsdCkuXG4gICAgIyMjIFxuICAgIHBhcnNlVmFyaWFibGVJZGVudGlmaWVyOiAoaWRlbnRpZmllciwgdHlwZSwgc2NvcGUpIC0+XG4gICAgICAgIHJlc3VsdCA9IFswLCBpZGVudGlmaWVyXVxuICAgICAgICBcbiAgICAgICAgaWYgaXNOYU4oaWRlbnRpZmllcilcbiAgICAgICAgICAgIGluZGV4ID0gaWRlbnRpZmllci5sYXN0SW5kZXhPZihcIi5cIilcbiAgICAgICAgICAgIGlmIGluZGV4ICE9IC0xXG4gICAgICAgICAgICAgICAgcmVzdWx0WzBdID0gaWRlbnRpZmllci5zdWJzdHJpbmcoMCwgaW5kZXgpXG4gICAgICAgICAgICAgICAgcmVzdWx0WzFdID0gaWRlbnRpZmllci5zdWJzdHJpbmcoaW5kZXgrMSlcbiAgICAgICAgICAgICAgICBpZiBpc05hTihyZXN1bHRbMV0pXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsxXSA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuaW5kZXhPZlZhcmlhYmxlKHJlc3VsdFsxXSwgdHlwZSwgc2NvcGUsIHJlc3VsdFswXSkgKyAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbMV0gPSBwYXJzZUludChyZXN1bHRbMV0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0WzFdID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5pbmRleE9mVmFyaWFibGUocmVzdWx0WzFdLCB0eXBlLCBzY29wZSwgcmVzdWx0WzBdKSArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0WzFdID0gcGFyc2VJbnQocmVzdWx0WzFdKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIHRva2VuLW9iamVjdCBmb3IgYSBzcGVjaWZpZWQgdGV4dC1jb2RlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlL3R5cGUgb2YgdGhlIHRleHQtY29kZS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgdGV4dC1jb2RlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdG9rZW4tb2JqZWN0LlxuICAgICMjI1xuICAgIGNyZWF0ZVRva2VuOiAoY29kZSwgdmFsdWUpIC0+XG4gICAgICAgIHRva2VuT2JqZWN0ID0gbnVsbFxuICAgICAgICB2YWx1ZSA9IGlmIGlzTmFOKHZhbHVlKSB0aGVuIHZhbHVlIGVsc2UgcGFyc2VJbnQodmFsdWUpXG4gICAgICAgIHN3aXRjaCBjb2RlXG4gICAgICAgICAgICB3aGVuIFwiU1pcIiBcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IG5ldyBncy5SZW5kZXJlclRva2VuKGNvZGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgIEBmb250LnNpemUgPSB0b2tlbk9iamVjdC52YWx1ZSB8fCBAZm9udFNpemVcbiAgICAgICAgICAgICAgICBAc3BhY2VTaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihcIiBcIilcbiAgICAgICAgICAgIHdoZW4gXCJZXCJcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHsgY29kZTogY29kZSwgdmFsdWU6IHZhbHVlIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIlVcIiB0aGVuIEBmb250LnVuZGVybGluZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiU1wiIHRoZW4gQGZvbnQuc3RyaWtlVGhyb3VnaCA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiSVwiIHRoZW4gQGZvbnQuaXRhbGljID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJCXCIgdGhlbiBAZm9udC5ib2xkID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJDXCIgdGhlbiBAZm9udC5zbWFsbENhcHMgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5VXCIgdGhlbiBAZm9udC51bmRlcmxpbmUgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTlNcIiB0aGVuIEBmb250LnN0cmlrZVRocm91Z2ggPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTklcIiB0aGVuIEBmb250Lml0YWxpYyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOQlwiIHRoZW4gQGZvbnQuYm9sZCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOQ1wiIHRoZW4gQGZvbnQuc21hbGxDYXBzID0gbm9cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgQGZvbnQudW5kZXJsaW5lID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBmb250LnN0cmlrZVRocm91Z2ggPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQGZvbnQuaXRhbGljID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBmb250LmJvbGQgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQGZvbnQuc21hbGxDYXBzID0gbm9cbiAgICAgICAgICAgICAgICBAc3BhY2VTaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihcIiBcIilcbiAgICAgICAgICAgIHdoZW4gXCJDXCJcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IG5ldyBncy5SZW5kZXJlclRva2VuKGNvZGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgQGZvbnQuY29sb3IgPSBGb250LmRlZmF1bHRDb2xvclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGZvbnQuY29sb3IgPSBncy5Db2xvci5mcm9tT2JqZWN0KFJlY29yZE1hbmFnZXIuc3lzdGVtLmNvbG9yc1t2YWx1ZS0xXSB8fCBGb250LmRlZmF1bHRDb2xvcilcbiAgICAgICAgICAgIHdoZW4gXCJHTlwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gaWYgaXNOYU4odmFsdWUpIHRoZW4gdmFsdWUuc3BsaXQoXCIsXCIpIGVsc2UgW3ZhbHVlXVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB2YWx1ZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBzcHJpbnRmKFwiJVwiK2Zvcm1hdCtcImRcIiwgKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyc0J5RG9tYWluW3ZhbHVlc1swXXx8MF1bdmFsdWVzWzFdLTFdIHx8IDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJzQnlEb21haW5bdmFsdWVzWzBdfHwwXVt2YWx1ZXNbMV0tMV0gfHwgMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgd2hlbiBcIkdUXCIgXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlLCBcInN0cmluZ1wiLCAxKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc3RyaW5nc0J5RG9tYWluW3ZhbHVlc1swXXx8MF1bdmFsdWVzWzFdLTFdIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSB0b2tlbk9iamVjdC5zcGxpdCgvXFx7KFtBLXpdKyk6KFteXFx7XFx9XSspXFx9fChcXG4pL2dtKVxuICAgICAgICAgICAgICAgIGlmIHRva2VuT2JqZWN0Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QucG9wKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gdG9rZW5PYmplY3RbMF0gPyBcIlwiXG4gICAgICAgICAgICB3aGVuIFwiR1NcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IEBwYXJzZVZhcmlhYmxlSWRlbnRpZmllcih2YWx1ZSwgXCJib29sZWFuXCIsIDEpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuc0J5RG9tYWluW3ZhbHVlc1swXXx8MF1bdmFsdWVzWzFdLTFdIHx8IGZhbHNlKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIFwiR0xcIlxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KFwiLFwiKVxuICAgICAgICAgICAgICAgIGxpc3RJZGVudGlmaWVyID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJsaXN0XCIsIDEpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBAY3JlYXRlTGlzdFRva2VuKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubGlzdHNCeURvbWFpbltsaXN0SWRlbnRpZmllclswXV1bbGlzdElkZW50aWZpZXJbMV0tMV0gfHwgW10sIHZhbHVlcylcbiAgICAgICAgICAgIHdoZW4gXCJQTlwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gaWYgaXNOYU4odmFsdWUpIHRoZW4gdmFsdWUuc3BsaXQoXCIsXCIpIGVsc2UgW3ZhbHVlXVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB2YWx1ZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMilcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBzcHJpbnRmKFwiJVwiK2Zvcm1hdCtcImRcIiwgKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNbdmFsdWVzWzBdXVt2YWx1ZXNbMV0tMV0gfHwgMCkpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IChHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnROdW1iZXJzWzBdW3ZhbHVlc1swXS0xXSB8fCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIFwiUFRcIiAgXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlLCBcInN0cmluZ1wiLCAyKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUucGVyc2lzdGVudFN0cmluZ3NbdmFsdWVzWzBdXVt2YWx1ZXNbMV0tMV0gfHwgXCJcIilcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0LnNwbGl0KC9cXHsoW0Etel0rKTooW15cXHtcXH1dKylcXH18KFxcbikvZ20pXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5PYmplY3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdC5wb3AoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSB0b2tlbk9iamVjdFswXSA/IFwiXCJcbiAgICAgICAgICAgIHdoZW4gXCJQU1wiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlLCBcImJvb2xlYW5cIiwgMilcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IChHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFuc1t2YWx1ZXNbMF1dW3ZhbHVlc1sxXS0xXSB8fCBmYWxzZSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgd2hlbiBcIlBMXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZS5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICBsaXN0SWRlbnRpZmllciA9IEBwYXJzZVZhcmlhYmxlSWRlbnRpZmllcih2YWx1ZXNbMF0sIFwibGlzdFwiLCAyKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gQGNyZWF0ZUxpc3RUb2tlbihHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRMaXN0c1tsaXN0SWRlbnRpZmllclswXV1bbGlzdElkZW50aWZpZXJbMV0tMV0gfHwgW10sIHZhbHVlcylcbiAgICAgICAgICAgIHdoZW4gXCJMTlwiIFxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IGlmIGlzTmFOKHZhbHVlKSB0aGVuIHZhbHVlLnNwbGl0KFwiLFwiKSBlbHNlIFt2YWx1ZV1cbiAgICAgICAgICAgICAgICBpZiB2YWx1ZXNbMV0gXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWVzWzBdLCBcIm51bWJlclwiLCAwKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHNwcmludGYoXCIlXCIrZm9ybWF0K1wiZFwiLCAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKHsgc2NvcGU6IDAsIGluZGV4OiB2YWx1ZXNbMV0tMX0pIHx8IDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKHsgc2NvcGU6IDAsIGluZGV4OiB2YWx1ZXNbMV0tMX0pIHx8IDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHdoZW4gXCJMVFwiIFxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IEBwYXJzZVZhcmlhYmxlSWRlbnRpZmllcih2YWx1ZSwgXCJzdHJpbmdcIiwgMClcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IChHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnN0cmluZ1ZhbHVlT2YoeyBzY29wZTogMCwgaW5kZXg6IHZhbHVlc1sxXS0xfSkgfHwgXCJcIikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gdG9rZW5PYmplY3Quc3BsaXQoL1xceyhbQS16XSspOihbXlxce1xcfV0rKVxcfXwoXFxuKS9nbSlcbiAgICAgICAgICAgICAgICBpZiB0b2tlbk9iamVjdC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0LnBvcCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0WzBdID8gXCJcIlxuICAgICAgICAgICAgd2hlbiBcIkxTXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWUsIFwiYm9vbGVhblwiLCAwKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2YoeyBzY29wZTogMCwgaW5kZXg6IHZhbHVlc1sxXS0xfSkgfHwgZmFsc2UpLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHdoZW4gXCJMTFwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgbGlzdElkZW50aWZpZXIgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWVzWzBdLCBcImxpc3RcIiwgMClcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IEBjcmVhdGVMaXN0VG9rZW4oR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5saXN0T2JqZWN0T2YoeyBzY29wZTogMCwgaW5kZXg6IGxpc3RJZGVudGlmaWVyWzFdLTF9KSB8fCBbXSwgdmFsdWVzKVxuICAgICAgICAgICAgd2hlbiBcIk5cIiBcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IChpZiBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbdmFsdWVdPyB0aGVuIGxjcyhSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbdmFsdWVdLm5hbWUpIGVsc2UgXCJcIilcbiAgICAgICAgICAgIHdoZW4gXCJSVFwiXG4gICAgICAgICAgICAgICAgcGFpciA9IHZhbHVlLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0geyBjb2RlOiBjb2RlLCBydFN0eWxlSWQ6IHBhaXJbMl0gPyAwLCByYjogcGFpclswXSwgcnQ6IHBhaXJbMV0sIHJiU2l6ZTogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0sIHJ0U2l6ZTogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0gfVxuICAgICAgICAgICAgd2hlbiBcIk1cIlxuICAgICAgICAgICAgICAgIG1hY3JvID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0udGV4dE1hY3Jvcy5maXJzdCAobSkgLT4gbS5uYW1lID09IHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgbWFjcm9cbiAgICAgICAgICAgICAgICAgICAgaWYgbWFjcm8udHlwZSA9PSAwICMgVGV4dCArIENvZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IG1hY3JvLmNvbnRlbnQuc3BsaXQoL1xceyhbQS16XSspOihbXlxce1xcfV0rKVxcfXwoXFxuKS9nbSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0LnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbWFjcm8udHlwZSA9PSAxICMgUGxhY2Vob2xkZXIgU2NyaXB0IE1hY3JvXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAhbWFjcm8uY29udGVudEZ1bmNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNyby5jb250ZW50RnVuYyA9IGV2YWwoXCIoZnVuY3Rpb24ob2JqZWN0LCB2YWx1ZSl7ICN7bWFjcm8uY29udGVudH0gfSlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbWFjcm8uY29udGVudEZ1bmMoQG9iamVjdCwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0LnNwbGl0KC9cXHsoW0Etel0rKTooW15cXHtcXH1dKylcXH18KFxcbikvZ20pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbk9iamVjdC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QucG9wKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZSAjIFNjcmlwdCBNYWNyb1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgIW1hY3JvLmNvbnRlbnRGdW5jXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm8uY29udGVudEZ1bmMgPSBldmFsKFwiKGZ1bmN0aW9uKG9iamVjdCl7ICN7bWFjcm8uY29udGVudH0gfSlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbmV3IGdzLlJlbmRlcmVyVG9rZW4oXCJYXCIsIG1hY3JvLmNvbnRlbnRGdW5jKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBcIlwiXG4gICAgICAgICAgICBlbHNlICAgIFxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbmV3IGdzLlJlbmRlcmVyVG9rZW4oY29kZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiB0b2tlbk9iamVjdFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIDxwPkdldHMgdGhlIGNvcnJlY3QgZm9udCBmb3IgdGhlIHNwZWNpZmllZCBydWJ5LXRleHQgdG9rZW4uPC9wPiBcbiAgICAqXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBBIHJ1YnktdGV4dCB0b2tlbi5cbiAgICAqIEByZXR1cm4ge2dzLkZvbnR9IFRoZSBmb250IGZvciB0aGUgcnVieS10ZXh0IHdoaWNoIGlzIHNob3duIGFib3ZlIHRoZSBvcmlnaW5hbCB0ZXh0LlxuICAgICogQG1ldGhvZCBnZXRSdWJ5VGV4dEZvbnRcbiAgICAjIyMgICBcbiAgICBnZXRSdWJ5VGV4dEZvbnQ6ICh0b2tlbikgLT5cbiAgICAgICAgc3R5bGUgPSBudWxsXG4gICAgICAgIGZvbnQgPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHRva2VuLnJ0U3R5bGVJZFxuICAgICAgICAgICAgc3R5bGUgPSB1aS5VSU1hbmFnZXIuc3R5bGVzW1wicnVieVRleHQtXCIrdG9rZW4ucnRTdHlsZUlkXVxuICAgICAgICBcbiAgICAgICAgaWYgIXN0eWxlXG4gICAgICAgICAgICBzdHlsZSA9IHVpLlVJTWFuYWdlci5zdHlsZXNbXCJydWJ5VGV4dFwiXVxuICAgICAgICAgICAgXG4gICAgICAgIGZvbnQgPSBzdHlsZT8uZm9udCA/IEBmb250XG4gICAgICAgIGZvbnQuc2l6ZSA9IGZvbnQuc2l6ZSB8fCBAZm9udC5zaXplIC8gMlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZvbnRcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogPHA+TWVhc3VyZXMgYSBjb250cm9sLXRva2VuLiBJZiBhIHRva2VuIHByb2R1Y2VzIGEgdmlzdWFsIHJlc3VsdCBsaWtlIGRpc3BsYXlpbmcgYW4gaWNvbiB0aGVuIGl0IG11c3QgcmV0dXJuIHRoZSBzaXplIHRha2VuIGJ5XG4gICAgKiB0aGUgdmlzdWFsIHJlc3VsdC4gSWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LCA8Yj5udWxsPC9iPiBtdXN0IGJlIHJldHVybmVkLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQuPC9wPiBcbiAgICAqXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBBIGNvbnRyb2wtdG9rZW4uXG4gICAgKiBAcmV0dXJuIHtncy5TaXplfSBUaGUgc2l6ZSBvZiB0aGUgYXJlYSB0YWtlbiBieSB0aGUgdmlzdWFsIHJlc3VsdCBvZiB0aGUgdG9rZW4gb3IgPGI+bnVsbDwvYj4gaWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LlxuICAgICogQG1ldGhvZCBtZWFzdXJlQ29udHJvbFRva2VuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgXG4gICAgbWVhc3VyZUNvbnRyb2xUb2tlbjogKHRva2VuKSAtPiAjIENhbiBiZSBpbXBsZW1lbnRlZCBieSBkZXJpdmVkIGNsYXNzZXNcbiAgICAgICAgc2l6ZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiQVwiICMgQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW01hdGgubWF4KHRva2VuLnZhbHVlLTEsIDApXVxuICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbj8uZ3JhcGhpYy5uYW1lP1xuICAgICAgICAgICAgICAgICAgICBpbWFnZUJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGltYWdlQml0bWFwP1xuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHdpZHRoOiBNYXRoLnJvdW5kKGltYWdlQml0bWFwLndpZHRoIC8gYW5pbWF0aW9uLmZyYW1lc1gpLCBoZWlnaHQ6IE1hdGgucm91bmQoaW1hZ2VCaXRtYXAuaGVpZ2h0IC8gYW5pbWF0aW9uLmZyYW1lc1kpXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIGZvbnQgPSBAZ2V0UnVieVRleHRGb250KHRva2VuKVxuICAgICAgICAgICAgICAgIGZzID0gZm9udC5zaXplXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZm9udC5zaXplIHx8IEBmb250LnNpemUgLyAyXG4gICAgICAgICAgICAgICAgdG9rZW4ucmJTaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbih0b2tlbi5yYilcbiAgICAgICAgICAgICAgICB0b2tlbi5ydFNpemUgPSBmb250Lm1lYXN1cmVUZXh0UGxhaW4odG9rZW4ucnQpXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzaXplID0gd2lkdGg6IE1hdGgubWF4KHRva2VuLnJiU2l6ZS53aWR0aCwgdG9rZW4ucnRTaXplLndpZHRoKSwgaGVpZ2h0OiB0b2tlbi5yYlNpemUuaGVpZ2h0ICsgdG9rZW4ucnRTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gc2l6ZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiA8cD5EcmF3cyB0aGUgdmlzdWFsIHJlc3VsdCBvZiBhIHRva2VuLCBsaWtlIGFuIGljb24gZm9yIGV4YW1wbGUsIHRvIHRoZSBzcGVjaWZpZWQgYml0bWFwLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoaWxlIHRoZSB0ZXh0IGlzIHJlbmRlcmVkLjwvcD4gXG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHBhcmFtIHtncy5CaXRtYXB9IGJpdG1hcCAtIFRoZSBiaXRtYXAgdXNlZCBmb3IgdGhlIGN1cnJlbnQgdGV4dC1saW5lLiBDYW4gYmUgdXNlZCB0byBkcmF3IHNvbWV0aGluZyBvbiBpdCBsaWtlIGFuIGljb24sIGV0Yy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgLSBBbiB4LW9mZnNldCBmb3IgdGhlIGRyYXctcm91dGluZS5cbiAgICAqIEBtZXRob2QgZHJhd0NvbnRyb2xUb2tlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGRyYXdDb250cm9sVG9rZW46ICh0b2tlbiwgYml0bWFwLCBvZmZzZXQpIC0+XG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiQVwiICMgQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW01hdGgubWF4KHRva2VuLnZhbHVlLTEsIDApXVxuICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbj8uZ3JhcGhpYy5uYW1lP1xuICAgICAgICAgICAgICAgICAgICBpbWFnZUJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2FuaW1hdGlvbi5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGltYWdlQml0bWFwP1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdCA9IG5ldyBncy5SZWN0KDAsIDAsIE1hdGgucm91bmQoaW1hZ2VCaXRtYXAud2lkdGggLyBhbmltYXRpb24uZnJhbWVzWCksIE1hdGgucm91bmQoaW1hZ2VCaXRtYXAuaGVpZ2h0IC8gYW5pbWF0aW9uLmZyYW1lc1kpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYml0bWFwLmJsdChvZmZzZXQsIEBjdXJyZW50WSwgaW1hZ2VCaXRtYXAsIHJlY3QpXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiBcbiAgICAgICAgICAgICAgICBzdHlsZSA9IG51bGxcbiAgICAgICAgICAgICAgICBpZiB0b2tlbi5ydFN0eWxlSWRcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSB1aS5VSU1hbmFnZXIuc3R5bGVzW1wicnVieVRleHQtXCIrdG9rZW4ucnRTdHlsZUlkXVxuICAgICAgICAgICAgICAgIGlmICFzdHlsZVxuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IHVpLlVJTWFuYWdlci5zdHlsZXNbXCJydWJ5VGV4dFwiXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb250ID0gc3R5bGU/LmZvbnQgPyBAZm9udFxuICAgICAgICAgICAgICAgIGZzID0gZm9udC5zaXplXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZm9udC5zaXplIHx8IEBmb250LnNpemUgLyAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3R5bGUgYW5kICFzdHlsZS5kZXNjcmlwdG9yLmZvbnQ/LmNvbG9yXG4gICAgICAgICAgICAgICAgICAgIGZvbnQuY29sb3Iuc2V0KEBmb250LmNvbG9yKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBiaXRtYXAuZm9udCA9IGZvbnRcbiAgICAgICAgICAgICAgICBiaXRtYXAuZHJhd1RleHQob2Zmc2V0LCBiaXRtYXAuZm9udC5kZXNjZW50LCBNYXRoLm1heCh0b2tlbi5yYlNpemUud2lkdGgsIHRva2VuLnJ0U2l6ZS53aWR0aCksIGJpdG1hcC5oZWlnaHQsIHRva2VuLnJ0LCAxLCAwKVxuICAgICAgICAgICAgICAgIGJpdG1hcC5mb250ID0gQGZvbnRcbiAgICAgICAgICAgICAgICBmb250LnNpemUgPSBmc1xuICAgICAgICAgICAgICAgIGJpdG1hcC5kcmF3VGV4dChvZmZzZXQsIHRva2VuLnJ0U2l6ZS5oZWlnaHQsIE1hdGgubWF4KHRva2VuLnJiU2l6ZS53aWR0aCwgdG9rZW4ucnRTaXplLndpZHRoKSwgYml0bWFwLmhlaWdodCwgdG9rZW4ucmIsIDEsIDApXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU3BsaXRzIHVwIHRoZSBzcGVjaWZpZWQgdG9rZW4gdXNpbmcgYSBqYXBhbmVzZSB3b3JkLXdyYXAgdGVjaG5pcXVlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHdvcmRXcmFwSmFwYW5lc2VcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIFRoZSB0b2tlbiB0byBzcGxpdCB1cC5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gbGluZSAtIFRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gLSBBbiBhcnJheSBvZiBsaW5lcy4gSWYgdGhlIHRva2VuIGlzIHNwbGl0IHVwIGludG8gbXVsdGlwbGUgbGluZXMsIGFsbCBuZXdcbiAgICAqIGxpbmVzIGFyZSBhZGRlZCB0byB0aGlzIHJlc3VsdCBhcnJheS5cbiAgICAqIEByZXR1cm4ge2dzLlJlbmRlcmVyVGV4dExpbmV9IFRoZSBjdXJyZW50IGxpbmUsIHRoYXQgbWF5IGJlIHRoZSBzYW1lIGFzIHRoZSA8Yj5saW5lPC9iPiBwYXJhbWV0ZXJzIGJ1dCBpZiBuZXcgbGluZXNcbiAgICAqIGFyZSBjcmVhdGVkIGl0IGhhcyB0byBiZSB0aGUgbGFzdCBuZXcgY3JlYXRlZCBsaW5lLlxuICAgICMjIyAgICAgXG4gICAgd29yZFdyYXBKYXBhbmVzZTogKHRva2VuLCBsaW5lLCB3aWR0aCwgaGVpZ2h0LCByZXN1bHQpIC0+XG4gICAgICAgIHN0YXJ0T2ZMaW5lID0gJ+KAlOKApuKApeOAs+OAtOOAteOAgi7jg7vjgIE6OywgPyHigLzigYfigYjigYnigJDjgqDigJPjgJwpXe+9neOAleOAieOAi+OAjeOAj+OAkeOAmeOAl+OAn+KAmVwi772gwrvjg73jg77jg7zjgqHjgqPjgqXjgqfjgqnjg4Pjg6Pjg6Xjg6fjg67jg7Xjg7bjgYHjgYPjgYXjgYfjgYnjgaPjgoPjgoXjgofjgo7jgpXjgpbjh7Djh7Hjh7Ljh7Pjh7Tjh7Xjh7bjh7fjh7jjh7njh7rjh7vjh7zjh73jh77jh7/jgIXjgLsnXG4gICAgICAgIGVuZE9mTGluZSA9ICcoW++9m+OAlOOAiOOAiuOAjOOAjuOAkOOAmOOAluOAneKAmFwi772fwqsnXG4gICAgICAgIG5vU3BsaXQgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODnvvJDvvJHvvJLvvJPvvJTvvJXvvJbvvJfvvJjvvJnigJTigKbigKXjgLPjgLTjgLUnXG4gICAgICAgIGRlc2NlbnQgPSBAZm9udC5kZXNjZW50XG4gICAgICAgIHNpemUgPSBAZm9udC5tZWFzdXJlVGV4dFBsYWluKHRva2VuKVxuICAgICAgICBkZXB0aCA9IDhcbiAgICAgICAgZGVwdGhMZXZlbCA9IDBcbiAgICAgICAgaSA9IDBcbiAgICAgICAgaiA9IDBcbiAgICAgICAgbGFzdENoYXJhY3RlckluZGV4ID0gMFxuICAgICAgICBcbiAgICAgICAgaWYgc2l6ZS53aWR0aCA+IEBvYmplY3QuZHN0UmVjdC53aWR0aC1Ac3BhY2VTaXplLndpZHRoKjMtQHBhZGRpbmcqMlxuICAgICAgICAgICAgd2hpbGUgaSA8IHRva2VuLmxlbmd0aFxuICAgICAgICAgICAgICAgIGNoID0gdG9rZW5baV1cbiAgICAgICAgICAgICAgICBzaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihjaClcbiAgICAgICAgICAgICAgICB3aWR0aCArPSBzaXplLndpZHRoXG4gICAgICAgICAgICAgICAgbW92ZWQgPSBub1xuICAgICAgICAgICAgICAgIGlmIHdpZHRoID4gQG9iamVjdC5kc3RSZWN0LndpZHRoIC0gQHBhZGRpbmcqMlxuICAgICAgICAgICAgICAgICAgICBkZXB0aExldmVsID0gMFxuICAgICAgICAgICAgICAgICAgICBqID0gaVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSBub1xuICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgaiA+IDAgYW5kIHN0YXJ0T2ZMaW5lLmluZGV4T2YodG9rZW5bal0pICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgai0tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgaiA+IDAgYW5kIGVuZE9mTGluZS5pbmRleE9mKHRva2VuW2otMV0pICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgai0tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIGogPiAwIGFuZCBub1NwbGl0LmluZGV4T2YodG9rZW5bai0xXSkgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqLS1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHllc1xuICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGogPT0gMCBhbmQgbW92ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aExldmVsKytcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIGRlcHRoTGV2ZWwgPj0gZGVwdGggb3IgIW1vdmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jb250ZW50LnB1c2gobmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgdG9rZW4uc3Vic3RyaW5nKGxhc3RDaGFyYWN0ZXJJbmRleCwgaSksIEBmb250KSlcbiAgICAgICAgICAgICAgICAgICAgbGFzdENoYXJhY3RlckluZGV4ID0gaVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgQGZvbnQubGluZUhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoIC0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG4gICAgICAgICAgICAgICAgICAgIGRlc2NlbnQgPSBAZm9udC5kZXNjZW50XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHNpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGxpbmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBuZXcgZ3MuUmVuZGVyZXJUZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gd2lkdGggLSAod2lkdGggLSBzaXplLndpZHRoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaChuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCB0b2tlbiwgQGZvbnQpKVxuICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIEBmb250LmxpbmVIZWlnaHQpXG4gICAgICAgICAgICBsaW5lLndpZHRoID0gd2lkdGggKyBzaXplLndpZHRoXG4gICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG4gICAgICAgICAgICBcbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBAZm9udC5saW5lSGVpZ2h0KSAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGxhc3RDaGFyYWN0ZXJJbmRleCAhPSBpXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaChuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCB0b2tlbi5zdWJzdHJpbmcobGFzdENoYXJhY3RlckluZGV4LCBpKSwgQGZvbnQpKVxuICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoXG4gICAgICAgICAgICBsaW5lLmhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgbGluZS5oZWlnaHQpXG4gICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpbmVcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogRG9lcyBub3Qgd29yZC13cmFwcGluZyBhdCBhbGwuIEl0IGp1c3QgYWRkcyB0aGUgdGV4dCB0b2tlbiB0byB0aGUgbGluZSBhcyBpcy5cbiAgICAqIFxuICAgICogQG1ldGhvZCB3b3JkV3JhcE5vbmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIFRoZSB0b2tlbiB0byBzcGxpdCB1cC5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gbGluZSAtIFRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gLSBBbiBhcnJheSBvZiBsaW5lcy4gSWYgdGhlIHRva2VuIGlzIHNwbGl0IHVwIGludG8gbXVsdGlwbGUgbGluZXMsIGFsbCBuZXdcbiAgICAqIGxpbmVzIGFyZSBhZGRlZCB0byB0aGlzIHJlc3VsdCBhcnJheS5cbiAgICAqIEByZXR1cm4ge2dzLlJlbmRlcmVyVGV4dExpbmV9IFRoZSBjdXJyZW50IGxpbmUsIHRoYXQgbWF5IGJlIHRoZSBzYW1lIGFzIHRoZSA8Yj5saW5lPC9iPiBwYXJhbWV0ZXJzIGJ1dCBpZiBuZXcgbGluZXNcbiAgICAqIGFyZSBjcmVhdGVkIGl0IGhhcyB0byBiZSB0aGUgbGFzdCBuZXcgY3JlYXRlZCBsaW5lLlxuICAgICMjIyAgXG4gICAgd29yZFdyYXBOb25lOiAodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdCkgLT5cbiAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4odG9rZW4pXG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KHNpemUuaGVpZ2h0LCBoZWlnaHQgfHwgQGZvbnQubGluZUhlaWdodCkgICBcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2VuLmxlbmd0aCA+IDAgICAgXG4gICAgICAgICAgICBsaW5lLndpZHRoICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgIGxpbmUuaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBsaW5lLmhlaWdodClcbiAgICAgICAgICAgIGxpbmUuZGVzY2VudCA9IEBmb250LmRlc2NlbnRcbiAgICAgICAgICAgIGxpbmUuY29udGVudC5wdXNoKG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIHRva2VuKSlcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbGluZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTcGxpdHMgdXAgdGhlIHNwZWNpZmllZCB0b2tlbiB1c2luZyBhIHNwYWNlLWJhc2VkIHdvcmQtd3JhcCB0ZWNobmlxdWUuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgd29yZFdyYXBTcGFjZUJhc2VkXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBUaGUgdG9rZW4gdG8gc3BsaXQgdXAuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmV9IGxpbmUgLSBUaGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lW119IC0gQW4gYXJyYXkgb2YgbGluZXMuIElmIHRoZSB0b2tlbiBpcyBzcGxpdCB1cCBpbnRvIG11bHRpcGxlIGxpbmVzLCBhbGwgbmV3XG4gICAgKiBsaW5lcyBhcmUgYWRkZWQgdG8gdGhpcyByZXN1bHQgYXJyYXkuXG4gICAgKiBAcmV0dXJuIHtncy5SZW5kZXJlclRleHRMaW5lfSBUaGUgY3VycmVudCBsaW5lLCB0aGF0IG1heSBiZSB0aGUgc2FtZSBhcyB0aGUgPGI+bGluZTwvYj4gcGFyYW1ldGVycyBidXQgaWYgbmV3IGxpbmVzXG4gICAgKiBhcmUgY3JlYXRlZCBpdCBoYXMgdG8gYmUgdGhlIGxhc3QgbmV3IGNyZWF0ZWQgbGluZS5cbiAgICAjIyMgICAgXG4gICAgd29yZFdyYXBTcGFjZUJhc2VkOiAodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdCkgLT5cbiAgICAgICAgY3VycmVudFdvcmRzID0gW11cbiAgICAgICAgd29yZHMgPSB0b2tlbi5zcGxpdChcIiBcIilcbiAgICAgICAgZGVzY2VudCA9IEBmb250LmRlc2NlbnRcbiAgICAgICAgQHNwYWNlU2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4oXCIgXCIpXG4gICAgICAgIFxuICAgICAgICBmb3Igd29yZCwgaSBpbiB3b3Jkc1xuICAgICAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4od29yZClcbiAgICAgICAgICAgIHdpZHRoICs9IHNpemUud2lkdGggKyBAc3BhY2VTaXplLndpZHRoXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgd2lkdGggPiBAb2JqZWN0LmRzdFJlY3Qud2lkdGggLSBAcGFkZGluZyoyXG4gICAgICAgICAgICAgICAgdG9rZW4gPSBuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCBjdXJyZW50V29yZHMuam9pbihcIiBcIikpXG4gICAgICAgICAgICAgICAgdG9rZW4udGFrZUZvcm1hdChAZm9udClcbiAgICAgICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaCh0b2tlbilcbiAgICAgICAgICAgICAgICBsaW5lLmhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgbGluZS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoIC0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgIGxpbmUuZGVzY2VudCA9IE1hdGgubWF4KGxpbmUuZGVzY2VudCwgZGVzY2VudClcbiAgICAgICAgICAgICAgICBkZXNjZW50ID0gTWF0aC5tYXgoZGVzY2VudCwgQGZvbnQuZGVzY2VudClcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGxpbmUpXG4gICAgICAgICAgICAgICAgbGluZSA9IG5ldyBncy5SZW5kZXJlclRleHRMaW5lKClcbiAgICAgICAgICAgICAgICBjdXJyZW50V29yZHMgPSBbd29yZF1cbiAgICAgICAgICAgICAgICB3aWR0aCA9IHdpZHRoIC0gKHdpZHRoIC0gc2l6ZS53aWR0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjdXJyZW50V29yZHMucHVzaCh3b3JkKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBAZm9udC5saW5lSGVpZ2h0KSAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGN1cnJlbnRXb3Jkcy5sZW5ndGggPiAwXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIGN1cnJlbnRXb3Jkcy5qb2luKFwiIFwiKSlcbiAgICAgICAgICAgIHRva2VuLnRha2VGb3JtYXQoQGZvbnQpXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaCh0b2tlbilcbiAgICAgICAgICAgIGxpbmUud2lkdGggPSB3aWR0aFxuICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGxpbmUuaGVpZ2h0KVxuICAgICAgICAgICAgbGluZS5kZXNjZW50ID0gTWF0aC5tYXgoZGVzY2VudCwgbGluZS5kZXNjZW50KVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBsaW5lXG4gICAgXG4gICAgIyMjKlxuICAgICogU3BsaXRzIHVwIHRoZSBzcGVjaWZpZWQgdG9rZW4gdXNpbmcgYSB3b3JkLXdyYXAgdGVjaG5pcXVlLiBUaGUga2luZCBvZiB3b3JkLXdyYXAgdGVjaG5pcXVlXG4gICAgKiBkZXBlbmRzIG9uIHRoZSBzZWxlY3RlZCBsYW5ndWFnZS4gWW91IGNhbiBvdmVyd3JpdGUgdGhpcyBtZXRob2QgaW4gZGVyaXZlZCBjbGFzc2VzIHRvIGltcGxlbWVudCB5b3VyXG4gICAgKiBvd24gY3VzdG9tIHdvcmQtd3JhcCB0ZWNobmlxdWVzLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVXb3JkV3JhcFxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gVGhlIHRva2VuIHRvIHNwbGl0IHVwLlxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lfSBsaW5lIC0gVGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZVtdfSAtIEFuIGFycmF5IG9mIGxpbmVzLiBJZiB0aGUgdG9rZW4gaXMgc3BsaXQgdXAgaW50byBtdWx0aXBsZSBsaW5lcywgYWxsIG5ld1xuICAgICogbGluZXMgYXJlIGFkZGVkIHRvIHRoaXMgcmVzdWx0IGFycmF5LlxuICAgICogQHJldHVybiB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gVGhlIGN1cnJlbnQgbGluZSwgdGhhdCBtYXkgYmUgdGhlIHNhbWUgYXMgdGhlIDxiPmxpbmU8L2I+IHBhcmFtZXRlcnMgYnV0IGlmIG5ldyBsaW5lc1xuICAgICogYXJlIGNyZWF0ZWQgaXQgaGFzIHRvIGJlIHRoZSBsYXN0IG5ldyBjcmVhdGVkIGxpbmUuXG4gICAgIyMjXG4gICAgZXhlY3V0ZVdvcmRXcmFwOiAodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdCwgd29yZFdyYXApIC0+XG4gICAgICAgIGlmIHdvcmRXcmFwXG4gICAgICAgICAgICBzd2l0Y2ggTGFuZ3VhZ2VNYW5hZ2VyLmxhbmd1YWdlLndvcmRXcmFwXG4gICAgICAgICAgICAgICAgd2hlbiBcInNwYWNlQmFzZWRcIlxuICAgICAgICAgICAgICAgICAgICBAd29yZFdyYXBTcGFjZUJhc2VkKHRva2VuLCBsaW5lLCB3aWR0aCwgaGVpZ2h0LCByZXN1bHQpXG4gICAgICAgICAgICAgICAgd2hlbiBcImphcGFuZXNlXCJcbiAgICAgICAgICAgICAgICAgICAgQHdvcmRXcmFwSmFwYW5lc2UodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHdvcmRXcmFwTm9uZSh0b2tlbiwgbGluZSwgd2lkdGgsIGhlaWdodCwgcmVzdWx0KVxuICAgICAgICAgICAgXG4gIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYW4gYSBvZiBsaW5lLW9iamVjdHMuIEVhY2ggbGluZS1vYmplY3QgaXMgYSBsaXN0IG9mIHRva2VuLW9iamVjdHMuIFxuICAgICogQSB0b2tlbi1vYmplY3QgY2FuIGJlIGp1c3QgYSBzdHJpbmcgb3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcgbW9yZSBpbmZvcm1hdGlvblxuICAgICogYWJvdXQgaG93IHRvIHByb2Nlc3MgdGhlIHRva2VuIGF0IHJ1bnRpbWUuXG4gICAgKiBcbiAgICAqIEEgbGluZS1vYmplY3QgYWxzbyBjb250YWlucyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGxpa2UgdGhlIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAqIG9mIHRoZSBsaW5lKGluIHBpeGVscykuXG4gICAgKiBcbiAgICAqIElmIHRoZSB3b3JkV3JhcCBwYXJhbSBpcyBzZXQsIGxpbmUtYnJlYWtzIGFyZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgaWYgYSBsaW5lXG4gICAgKiBkb2Vzbid0IGZpdCBpbnRvIHRoZSB3aWR0aCBvZiB0aGUgZ2FtZSBvYmplY3QncyBiaXRtYXAuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgY2FsY3VsYXRlTGluZXNcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gQSBtZXNzYWdlIGNyZWF0aW5nIHRoZSBsaW5lLW9iamVjdHMgZm9yLlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IFtmaXJzdExpbmVXaWR0aD0wXSAtIFRoZSBjdXJyZW50IHdpZHRoIG9mIHRoZSBmaXJzdCBsaW5lLlxuICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIGxpbmUtb2JqZWN0cy5cbiAgICAjIyNcbiAgICBjYWxjdWxhdGVMaW5lczogKG1lc3NhZ2UsIHdvcmRXcmFwLCBmaXJzdExpbmVXaWR0aCkgLT5cbiAgICAgICAgcmVzdWx0ID0gW11cbiAgICAgICAgbGluZSA9IG5ldyBncy5SZW5kZXJlclRleHRMaW5lKClcbiAgICAgICAgd2lkdGggPSBmaXJzdExpbmVXaWR0aCB8fCAwXG4gICAgICAgIGhlaWdodCA9IDBcbiAgICAgICAgZGVzY2VudCA9IEBmb250LmRlc2NlbnRcbiAgICAgICAgY3VycmVudFdvcmRzID0gW11cbiAgICAgICAgc2l6ZSA9IG51bGxcbiAgICAgICAgQHNwYWNlU2l6ZSA9IEBmb250Lm1lYXN1cmVDaGFyKFwiIFwiKVxuICAgICAgICBAZm9udFNpemUgPSBAZm9udC5zaXplXG4gICAgICAgIFxuICAgICAgICB0b2tlbnMgPSBtZXNzYWdlLnNwbGl0KC9cXHsoW0Etel0rKTooW15cXHtcXH1dKylcXH18KFxcbikvZ20pXG4gICAgICAgIHRva2VuID0gbnVsbFxuICAgICAgICB0ID0gMFxuICAgICAgICBcbiAgICAgICAgdW5kZXJsaW5lID0gQGZvbnQudW5kZXJsaW5lXG4gICAgICAgIHN0cmlrZVRocm91Z2ggPSBAZm9udC5zdHJpa2VUaHJvdWdoXG4gICAgICAgIGl0YWxpYyA9IEBmb250Lml0YWxpY1xuICAgICAgICBib2xkID0gQGZvbnQuYm9sZFxuICAgICAgICBzbWFsbENhcHMgPSBAZm9udC5zbWFsbENhcHNcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIHQgPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1t0XVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0ICUgNCAhPSAwXG4gICAgICAgICAgICAgICAgaWYgdG9rZW4/XG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gQGNyZWF0ZVRva2VuKHRva2VuLCB0b2tlbnNbdCsxXSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuT2JqZWN0LnB1c2g/XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRva2VucywgW3QrMywgMF0uY29uY2F0KHRva2VuT2JqZWN0KSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBub3QgdG9rZW5PYmplY3QuY29kZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0KzNdID0gdG9rZW5PYmplY3QgKyB0b2tlbnNbdCszXVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQG1lYXN1cmVDb250cm9sVG9rZW4odG9rZW5PYmplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzaXplXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAjZGVzY2VudCA9IE1hdGgubWF4KEBmb250LmRlc2NlbnQsIGRlc2NlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaCh0b2tlbk9iamVjdClcbiAgICAgICAgICAgICAgICBlbHNlICMgTXVzdCBiZSBhIG5ldy1saW5lXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuaGVpZ2h0ID0gaGVpZ2h0IHx8IEBmb250LmxpbmVIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuZGVzY2VudCA9IGRlc2NlbnRcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobGluZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IG5ldyBncy5SZW5kZXJlclRleHRMaW5lKClcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jb250ZW50LnB1c2gobmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgXCJcXG5cIiwgQGZvbnQpKVxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IDBcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gMFxuICAgICAgICAgICAgICAgICAgICBkZXNjZW50ID0gQGZvbnQuZGVzY2VudFxuICAgICAgICAgICAgICAgIHQgKz0gMlxuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbi5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgbGluZSA9IEBleGVjdXRlV29yZFdyYXAodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdCwgd29yZFdyYXApXG4gICAgICAgICAgICAgICAgd2lkdGggPSBsaW5lLndpZHRoXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gbGluZS5oZWlnaHRcbiAgICAgICAgICAgICAgICBkZXNjZW50ID0gbGluZS5kZXNjZW50XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0KytcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNvbnRlbnQubGVuZ3RoID4gMCBvciByZXN1bHQubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGxpbmUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgICAgICBsaW5lLndpZHRoID0gd2lkdGhcbiAgICAgICAgICAgIGxpbmUuZGVzY2VudCA9IGRlc2NlbnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGxpbmUpXG4gICAgICAgXG4gICAgICAgICBcbiAgICAgICAgQGZvbnQuc2l6ZSA9IEBmb250U2l6ZSAgXG4gICAgICAgIEBmb250LnVuZGVybGluZSA9IHVuZGVybGluZVxuICAgICAgICBAZm9udC5zdHJpa2VUaHJvdWdoID0gc3RyaWtlVGhyb3VnaFxuICAgICAgICBAZm9udC5pdGFsaWMgPSBpdGFsaWNcbiAgICAgICAgQGZvbnQuYm9sZCA9IGJvbGRcbiAgICAgICAgQGZvbnQuc21hbGxDYXBzID0gc21hbGxDYXBzXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogTWVhc3VyZXMgdGhlIGRpbWVuc2lvbnMgb2YgZm9ybWF0dGVkIGxpbmVzIGluIHBpeGVscy4gVGhlIHJlc3VsdCBpcyBub3RcbiAgICAqIHBpeGVsLXBlcmZlY3QuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgbWVhc3VyZUZvcm1hdHRlZExpbmVzXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gbGluZXMgLSBBbiBhcnJheSBvZiB0ZXh0IGxpbmVzIHRvIG1lYXN1cmUuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdvcmRXcmFwIC0gSWYgd29yZFdyYXAgaXMgc2V0IHRvIHRydWUsIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBsaW5lLWJyZWFrcyB3aWxsIGJlIGNhbGN1bGF0ZWQuXG4gICAgKiBAcmVzdWx0IHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSB0ZXh0LlxuICAgICMjI1xuICAgIG1lYXN1cmVGb3JtYXR0ZWRMaW5lczogKGxpbmVzLCB3b3JkV3JhcCkgLT5cbiAgICAgICAgc2l6ZSA9IHdpZHRoOiAwLCBoZWlnaHQ6IDBcbiAgICAgICAgXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBzaXplLndpZHRoID0gTWF0aC5tYXgobGluZS53aWR0aCsyLCBzaXplLndpZHRoKVxuICAgICAgICAgICAgc2l6ZS5oZWlnaHQgKz0gbGluZS5oZWlnaHQgKyBAbGluZVNwYWNpbmdcblxuICAgICAgICBzaXplLmhlaWdodCAtPSBAbGluZVNwYWNpbmdcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzaXplXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIE1lYXN1cmVzIHRoZSBkaW1lbnNpb25zIG9mIGEgZm9ybWF0dGVkIHRleHQgaW4gcGl4ZWxzLiBUaGUgcmVzdWx0IGlzIG5vdFxuICAgICogcGl4ZWwtcGVyZmVjdC5cbiAgICAqIFxuICAgICogQG1ldGhvZCBtZWFzdXJlRm9ybWF0dGVkVGV4dFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBtZWFzdXJlLlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgbGluZS1icmVha3Mgd2lsbCBiZSBjYWxjdWxhdGVkLlxuICAgICogQHJlc3VsdCB7T2JqZWN0fSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgdGV4dC5cbiAgICAjIyNcbiAgICBtZWFzdXJlRm9ybWF0dGVkVGV4dDogKHRleHQsIHdvcmRXcmFwKSAtPlxuICAgICAgICBAZm9udC5zZXQoQG9iamVjdC5mb250KVxuICAgICAgICBzaXplID0gbnVsbFxuICAgICAgICBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyh0ZXh0LCB3b3JkV3JhcClcbiAgICAgICAgXG4gICAgICAgIHNpemUgPSBAbWVhc3VyZUZvcm1hdHRlZExpbmVzKGxpbmVzLCB3b3JkV3JhcClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzaXplXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIE1lYXN1cmVzIHRoZSBkaW1lbnNpb25zIG9mIGEgcGxhaW4gdGV4dCBpbiBwaXhlbHMuIEZvcm1hdHRpbmcgYW5kXG4gICAgKiB3b3JkLXdyYXBwaW5nIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVhc3VyZVRleHRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gbWVhc3VyZS5cbiAgICAqIEByZXN1bHQge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHQuXG4gICAgIyMjXG4gICAgbWVhc3VyZVRleHQ6ICh0ZXh0KSAtPlxuICAgICAgICBzaXplID0gd2lkdGg6IDAsIGhlaWdodDogMFxuICAgICAgICBsaW5lcyA9IHRleHQudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKVxuXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBsaW5lU2l6ZSA9IEBvYmplY3QuZm9udC5tZWFzdXJlVGV4dCh0ZXh0KVxuICAgICAgICAgICAgc2l6ZS53aWR0aCA9IE1hdGgubWF4KHNpemUud2lkdGgsIGxpbmVTaXplLndpZHRoKVxuICAgICAgICAgICAgc2l6ZS5oZWlnaHQgKz0gQG9iamVjdC5mb250LmxpbmVIZWlnaHQgKyBAbGluZVNwYWNpbmdcbiAgICAgICAgICAgIFxuICAgICAgICBzaXplLmhlaWdodCAtPSBAbGluZVNwYWNpbmdcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzaXplXG4gICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGEgdG9rZW4gaW4gYSBsaXN0IG9mIHRva2VucyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2guXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kVG9rZW5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIGluZGV4IGluIHRoZSBsaXN0IG9mIHRva2VucyB3aGVyZSB0aGUgc2VhcmNoIHdpbGwgc3RhcnQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlIG9mIHRoZSB0b2tlbiB0byBzZWFyY2ggZm9yLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiAtIFRoZSBzZWFyY2ggZGlyZWN0aW9uLCBjYW4gYmUgZm9yd2FyZCgxKSBvciBiYWNrd2FyZCgtMSkuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSB0b2tlbnMgLSBUaGUgbGlzdCBvZiB0b2tlbnMgdG8gc2VhcmNoLlxuICAgICogQHJlc3VsdCB7T2JqZWN0fSBUaGUgZmlyc3QgdG9rZW4gd2hpY2ggbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIGNvZGUgb3IgPGI+bnVsbDwvYj4gaWYgdGhlIHRva2VuIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAjIyMgIFxuICAgIGZpbmRUb2tlbjogKHN0YXJ0SW5kZXgsIGNvZGUsIGRpcmVjdGlvbiwgdG9rZW5zKSAtPlxuICAgICAgICB0b2tlbiA9IG51bGxcbiAgICAgICAgaSA9IHN0YXJ0SW5kZXhcbiAgICAgICAgaWYgZGlyZWN0aW9uID09IC0xXG4gICAgICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgICAgICB0ID0gdG9rZW5zW2ldXG4gICAgICAgICAgICAgICAgaWYgdC5jb2RlID09IGNvZGVcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSB0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaS0tXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdG9rZW5cbiAgICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGEgc3BlY2lmaWMga2luZCBvZiB0b2tlbnMgYmV0d2VlbiBhIHN0YXJ0IGFuZCBhbiBlbmQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kVG9rZW5zQmV0d2VlblxuICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggd2hlcmUgdGhlIHNlYXJjaCB3aWxsIHN0YXJ0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEluZGV4IC0gVGhlIGluZGV4IHdoZXJlIHRoZSBzZWFyY2ggd2lsbCBlbmQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlIG9mIHRoZSB0b2tlbi10eXBlIHRvIHNlYXJjaCBmb3IuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSB0b2tlbnMgLSBUaGUgbGlzdCBvZiB0b2tlbnMgdG8gc2VhcmNoLlxuICAgICogQHJlc3VsdCB7T2JqZWN0W119IExpc3Qgb2YgdG9rZW5zIG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgY29kZS4gSXRzIGFuIGVtcHR5IGxpc3QgaWYgbm8gdG9rZW5zIHdlcmUgZm91bmQuXG4gICAgIyMjICAgICBcbiAgICBmaW5kVG9rZW5zQmV0d2VlbjogKHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBjb2RlLCB0b2tlbnMpIC0+XG4gICAgICAgIHJlc3VsdCA9IFtdXG4gICAgICAgIHMgPSBzdGFydEluZGV4XG4gICAgICAgIGUgPSBlbmRJbmRleFxuICAgICAgICBcbiAgICAgICAgd2hpbGUgcyA8IGVcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zW3NdXG4gICAgICAgICAgICBpZiBgdG9rZW4uY29kZSA9PSBjb2RlYFxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRva2VuKVxuICAgICAgICAgICAgcysrXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgYSBjb250cm9sLXRva2VuLiBBIGNvbnRyb2wtdG9rZW4gaXMgYSB0b2tlbiB3aGljaCBpbmZsdWVuY2VzXG4gICAgKiB0aGUgdGV4dC1yZW5kZXJpbmcgbGlrZSBjaGFuZ2luZyB0aGUgZm9udHMgY29sb3IsIHNpemUgb3Igc3R5bGUuXG4gICAgKlxuICAgICogQ2hhbmdlcyB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byB0aGUgZ2FtZSBvYmplY3QncyBmb250LlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJvY2Vzc0NvbnRyb2xUb2tlblxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2hpY2ggY2FuIGNvbnRhaW4gYWRkaXRpb25hbCBpbmZvIG5lZWRlZCBmb3IgcHJvY2Vzc2luZy5cbiAgICAjIyNcbiAgICBwcm9jZXNzQ29udHJvbFRva2VuOiAodG9rZW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiU1pcIlxuICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5zaXplID0gdG9rZW4udmFsdWUgfHwgQGZvbnRTaXplXG4gICAgICAgICAgICB3aGVuIFwiQ1wiXG4gICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWUgPD0gMFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQuY29sb3IgPSBGb250LmRlZmF1bHRDb2xvclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmNvbG9yID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uY29sb3JzW3Rva2VuLnZhbHVlLTFdIHx8IEZvbnQuZGVmYXVsdENvbG9yXG4gICAgICAgICAgICB3aGVuIFwiWVwiXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRva2VuLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJVXCIgdGhlbiBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJTXCIgdGhlbiBAb2JqZWN0LmZvbnQuc3RyaWtlVGhyb3VnaCA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiSVwiIHRoZW4gQG9iamVjdC5mb250Lml0YWxpYyA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiQlwiIHRoZW4gQG9iamVjdC5mb250LmJvbGQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIkNcIiB0aGVuIEBvYmplY3QuZm9udC5zbWFsbENhcHMgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5VXCIgdGhlbiBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0gbm9cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5TXCIgdGhlbiBAb2JqZWN0LmZvbnQuc3RyaWtlVGhyb3VnaCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOSVwiIHRoZW4gQG9iamVjdC5mb250LnVuZGVybGluZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOQlwiIHRoZW4gQG9iamVjdC5mb250LmJvbGQgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTkNcIiB0aGVuIEBvYmplY3QuZm9udC5zbWFsbENhcHMgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5zdHJpa2VUaHJvdWdoID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5pdGFsaWMgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmJvbGQgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LnNtYWxsQ2FwcyA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBEcmF3cyBhIHBsYWluIHRleHQuIEZvcm1hdHRpbmcgYW5kIHdvcmQtd3JhcHBpbmcgYXJlIG5vdCBzdXBwb3J0ZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBkcmF3VGV4dFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBkcmF3LlxuICAgICMjI1xuICAgIGRyYXdUZXh0OiAocGwsIHB0LCBwciwgcGIsIHRleHQpIC0+XG4gICAgICAgIGxpbmVzID0gdGV4dC50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpXG4gICAgICAgIGZvbnQgPSBAb2JqZWN0LmZvbnRcbiAgICAgICAgaGVpZ2h0ID0gZm9udC5saW5lSGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBmb3IgbGluZSwgaSBpbiBsaW5lc1xuICAgICAgICAgICAgc2l6ZSA9IGZvbnQubWVhc3VyZVRleHQobGluZSlcbiAgICAgICAgICAgIEBvYmplY3QuYml0bWFwLmRyYXdUZXh0KHBsLCBpICogaGVpZ2h0ICsgcHQsIHNpemUud2lkdGggKyBwcitwbCwgaGVpZ2h0K3B0K3BiLCBsaW5lLCAwLCAwKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogRHJhd3MgYW4gYXJyYXkgb2YgZm9ybWF0dGVkIHRleHQgbGluZXMuIFxuICAgICogSWYgdGhlIHdvcmRXcmFwIHBhcmFtIGlzIHNldCwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBpZiBhIGxpbmVcbiAgICAqIGRvZXNuJ3QgZml0IGludG8gdGhlIHdpZHRoIG9mIHRoZSBnYW1lIG9iamVjdCdzIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdGb3JtYXR0ZWRMaW5lc1xuICAgICogQHBhcmFtIHtudW1iZXJ9IHBsIC0gVGhlIGxlZnQtcGFkZGluZyBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHB0IC0gVGhlIHRvcC1wYWRkaW5nIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcHIgLSBUaGUgcmlnaHQtcGFkZGluZyBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBiIC0gVGhlIGJvdHRvbS1wYWRkaW5nIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gbGluZXMgLSBBbiBhcnJheSBvZiBsaW5lcyB0byBkcmF3LlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkLlxuICAgICMjIyBcbiAgICBkcmF3Rm9ybWF0dGVkTGluZXM6IChwbCwgcHQsIHByLCBwYiwgbGluZXMsIHdvcmRXcmFwKSAtPlxuICAgICAgICBAY3VycmVudFggPSBwbFxuICAgICAgICBAY3VycmVudFkgPSBwdFxuICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSAwXG4gICAgXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBmb3IgdG9rZW4gaW4gbGluZS5jb250ZW50XG4gICAgICAgICAgICAgICAgaWYgdG9rZW4uY29kZT9cbiAgICAgICAgICAgICAgICAgICAgQHByb2Nlc3NDb250cm9sVG9rZW4odG9rZW4pXG4gICAgICAgICAgICAgICAgICAgIHNpemUgPSBAbWVhc3VyZUNvbnRyb2xUb2tlbih0b2tlbilcbiAgICAgICAgICAgICAgICAgICAgaWYgc2l6ZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGRyYXdDb250cm9sVG9rZW4odG9rZW4sIEBvYmplY3QuYml0bWFwLCBAY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gc2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdG9rZW4udmFsdWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICBmb250ID0gQG9iamVjdC5mb250XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IGxpbmUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlICE9IFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBmb250Lm1lYXN1cmVUZXh0UGxhaW4odG9rZW4udmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmJpdG1hcC5kcmF3VGV4dChAY3VycmVudFgsIEBjdXJyZW50WSArIGhlaWdodCAtIHNpemUuaGVpZ2h0ICsgZm9udC5kZXNjZW50IC0gbGluZS5kZXNjZW50LCBzaXplLndpZHRoK3BsK3ByLCBoZWlnaHQrcHQrcGIsIHRva2VuLnZhbHVlLCAwLCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRYICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gTWF0aC5tYXgoQGN1cnJlbnRMaW5lSGVpZ2h0LCBoZWlnaHQpXG4gICAgICAgICAgICBAY3VycmVudFkgKz0gKEBjdXJyZW50TGluZUhlaWdodCB8fCBAb2JqZWN0LmZvbnQubGluZUhlaWdodCkgKyBAbGluZVNwYWNpbmdcbiAgICAgICAgICAgIEBjdXJyZW50WCA9IHBsXG4gICAgICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSAwXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRHJhd3MgYSBmb3JtYXR0ZWQgdGV4dC4gXG4gICAgKiBJZiB0aGUgd29yZFdyYXAgcGFyYW0gaXMgc2V0LCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkIGlmIGEgbGluZVxuICAgICogZG9lc24ndCBmaXQgaW50byB0aGUgd2lkdGggb2YgdGhlIGdhbWUgb2JqZWN0J3MgYml0bWFwLlxuICAgICpcbiAgICAqIEBtZXRob2QgZHJhd0Zvcm1hdHRlZFRleHRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gZHJhdy5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZC5cbiAgICAqIEByZXR1cm4ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gVGhlIGRyYXduIHRleHQgbGluZXMuXG4gICAgIyMjXG4gICAgZHJhd0Zvcm1hdHRlZFRleHQ6IChwbCwgcHQsIHByLCBwYiwgdGV4dCwgd29yZFdyYXApIC0+XG4gICAgICAgIGxpbmVzID0gQGNhbGN1bGF0ZUxpbmVzKHRleHQudG9TdHJpbmcoKSwgd29yZFdyYXApXG4gICAgICAgIFxuICAgICAgICBAZHJhd0Zvcm1hdHRlZExpbmVzKHBsLCBwdCwgcHIsIHBiLCBsaW5lcywgd29yZFdyYXApXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlciA9IENvbXBvbmVudF9UZXh0UmVuZGVyZXIiXX0=
//# sourceURL=Component_TextRenderer_120.js