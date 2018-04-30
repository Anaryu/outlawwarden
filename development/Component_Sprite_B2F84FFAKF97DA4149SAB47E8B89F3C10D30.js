var AnimationTypes, Component_Sprite,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Sprite = (function(superClass) {
  extend(Component_Sprite, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_Sprite.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * A sprite component to display an object on screen. It can be managed or
  * unmanaged. A managed sprite is automatically added to the graphics-system
  * and rendered every frame until it gets disposed. An unmanaged sprite needs
  * to be added and removed manually.
  *
  * @module gs
  * @class Component_Sprite
  * @extends gs.Component_Visual
  * @memberof gs
  * @constructor
  * @param {boolean} managed - Indicates if the sprite is managed by the graphics system.
   */

  function Component_Sprite(managed) {
    Component_Sprite.__super__.constructor.call(this);

    /**
    * The native sprite object to display the game object on screen.
    *
    * @property sprite
    * @type Sprite
    * @protected
     */
    this.sprite = null;

    /**
    * The name of the image to display.
    *
    * @property image
    * @type string
    * @protected
     */
    this.image = null;

    /**
    * The name of the video to display.
    *
    * @property video
    * @type string
    * @protected
     */
    this.video = null;

    /**
    * The name of the folder from where the image should be loaded.
    *
    * @property image
    * @type string
    * @protected
     */
    this.imageFolder = "Graphics/Pictures";

    /**
    * The visibility. If <b>false</b>, the sprite is not rendered.
    *
    * @property visible
    * @type boolean
    * @protected
     */
    this.visible = false;

    /**
    * Indicates if the image is loaded.
    *
    * @property imageLoaded
    * @type boolean
    * @protected
     */
    this.imageLoaded = false;
  }


  /**
  * Disposes the sprite. If the sprite is managed, it will be automatically
  * removed from the graphics system and viewport.
  * @method dispose
   */

  Component_Sprite.prototype.dispose = function() {
    var ref, ref1;
    Component_Sprite.__super__.dispose.apply(this, arguments);
    if (this.sprite) {
      this.sprite.dispose();
      if (this.sprite.video) {
        this.sprite.video.stop();
      }
      if (!this.sprite.managed) {
        if ((ref = this.sprite.viewport) != null) {
          ref.removeGraphicObject(this.sprite);
        }
        return (ref1 = Graphics.viewport) != null ? ref1.removeGraphicObject(this.sprite) : void 0;
      }
    }
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_Sprite.prototype.setupEventHandlers = function() {
    return this.sprite.onIndexChange = (function(_this) {
      return function() {
        _this.object.rIndex = _this.sprite.index;
        return _this.object.needsUpdate = true;
      };
    })(this);
  };


  /**
  * Setup the sprite. 
  * @method setupSprite
   */

  Component_Sprite.prototype.setupSprite = function() {
    if (!this.sprite) {
      return this.sprite = new gs.Sprite(Graphics.viewport, typeof managed !== "undefined" && managed !== null ? managed : true);
    }
  };


  /**
  * Setup the sprite component. This method is automatically called by the
  * system.
  * @method setup
   */

  Component_Sprite.prototype.setup = function() {
    this.isSetup = true;
    this.setupSprite();
    this.setupEventHandlers();
    return this.update();
  };


  /**
  * Updates the source- and destination-rectangle of the game object so that
  * the associated bitmap fits in. The imageHandling property controls how
  * the rectangles are resized.
  * @method updateRect
   */

  Component_Sprite.prototype.updateRect = function() {
    if (this.sprite.bitmap != null) {
      if (!this.object.imageHandling) {
        this.object.srcRect = new Rect(0, 0, this.sprite.bitmap.width, this.sprite.bitmap.height);
        if (!this.object.fixedSize) {
          this.object.dstRect.width = this.object.srcRect.width;
          return this.object.dstRect.height = this.object.srcRect.height;
        }
      } else if (this.object.imageHandling === 1) {
        this.object.srcRect = new Rect(0, 0, this.sprite.bitmap.width, this.sprite.bitmap.height / 2);
        if (!this.object.fixedSize) {
          this.object.dstRect.width = this.object.srcRect.width;
          return this.object.dstRect.height = this.object.srcRect.height;
        }
      } else if (this.object.imageHandling === 2) {
        if (!this.object.fixedSize) {
          this.object.dstRect.width = this.object.srcRect.width;
          return this.object.dstRect.height = this.object.srcRect.height;
        }
      }
    }
  };


  /**
  * Updates the bitmap object from the associated image name. The imageFolder
  * property controls from which resource-folder the image will be loaded.
  * @method updateBitmap
   */

  Component_Sprite.prototype.updateBitmap = function() {
    this.imageLoaded = false;
    this.image = this.object.image;
    if (this.object.image.startsWith("data:") || this.object.image.startsWith("$")) {
      this.sprite.bitmap = ResourceManager.getBitmap(this.object.image);
    } else {
      this.sprite.bitmap = ResourceManager.getBitmap((this.object.imageFolder || this.imageFolder) + "/" + this.object.image);
    }
    if (this.sprite.bitmap != null) {
      if (!this.imageLoaded) {
        this.imageLoaded = this.sprite.bitmap.loaded;
      } else {
        delete this.sprite.bitmap.loaded_;
      }
    }
    return this.object.bitmap = this.sprite.bitmap;
  };


  /**
  * Updates the video object from the associated video name. It also updates
  * the video-rendering process.
  * @method updateVideo
   */

  Component_Sprite.prototype.updateVideo = function() {
    var ref, ref1;
    if (this.object.video !== this.videoName) {
      this.videoName = this.object.video;
      this.sprite.video = ResourceManager.getVideo("Movies/" + this.object.video);
      if (this.sprite.video != null) {
        if ((ref = $PARAMS.preview) != null ? ref.settings.musicDisabled : void 0) {
          this.sprite.video.volume = 0;
        }
        this.sprite.video.loop = this.object.loop;
        this.sprite.video.play();
        this.object.srcRect = new Rect(0, 0, this.sprite.video.width, this.sprite.video.height);
        if (!this.object.fixedSize) {
          this.object.dstRect = new Rect(this.object.dstRect.x, this.object.dstRect.y, this.sprite.video.width, this.sprite.video.height);
        }
      }
    }
    return (ref1 = this.sprite.video) != null ? ref1.update() : void 0;
  };


  /**
  * Updates the image if the game object has the image-property set.
  * @method updateImage
   */

  Component_Sprite.prototype.updateImage = function() {
    var ref;
    if (this.object.image != null) {
      if (this.object.image !== this.image || (!this.imageLoaded && ((ref = this.sprite.bitmap) != null ? ref.loaded : void 0))) {
        this.updateBitmap();
        return this.updateRect();
      }
    } else if (this.object.bitmap != null) {
      return this.sprite.bitmap = this.object.bitmap;
    } else if ((this.object.video != null) || this.videoName !== this.object.video) {
      return this.updateVideo();
    } else {
      this.image = null;
      this.object.bitmap = null;
      return this.sprite.bitmap = null;
    }
  };


  /**
  * If the sprite is unmanaged, this method will update the visibility of the
  * sprite. If the sprite leaves the viewport, it will be removed to save 
  * performance and automatically added back to the viewport if it enters
  * the viewport.
  * @method updateVisibility
   */

  Component_Sprite.prototype.updateVisibility = function() {
    var visible;
    if (!this.sprite.managed) {
      visible = Rect.intersect(this.object.dstRect.x + this.object.origin.x, this.object.dstRect.y + this.object.origin.y, this.object.dstRect.width, this.object.dstRect.height, 0, 0, Graphics.width, Graphics.height);
      if (visible && !this.visible) {
        (this.object.viewport || Graphics.viewport).addGraphicObject(this.sprite);
        this.visible = true;
      }
      if (!visible && this.visible) {
        (this.object.viewport || Graphics.viewport).removeGraphicObject(this.sprite);
        return this.visible = false;
      }
    }
  };


  /**
  * Updates the padding.
  * @method updatePadding
   */

  Component_Sprite.prototype.updatePadding = function() {
    if (this.object.padding != null) {
      this.sprite.x += this.object.padding.left;
      this.sprite.y += this.object.padding.top;
      this.sprite.zoomX -= (this.object.padding.left + this.object.padding.right) / this.object.srcRect.width;
      return this.sprite.zoomY -= (this.object.padding.bottom + this.object.padding.bottom) / this.object.srcRect.height;
    }
  };


  /**
  * Updates the sprite properties from the game object properties.
  * @method updateProperties
   */

  Component_Sprite.prototype.updateProperties = function() {
    var ref, ref1;
    this.sprite.width = this.object.dstRect.width;
    this.sprite.height = this.object.dstRect.height;
    this.sprite.x = this.object.dstRect.x;
    this.sprite.y = this.object.dstRect.y;
    this.sprite.mask = (ref = this.object.mask) != null ? ref : this.mask;
    this.sprite.angle = this.object.angle || 0;
    this.sprite.opacity = (ref1 = this.object.opacity) != null ? ref1 : 255;
    this.sprite.clipRect = this.object.clipRect;
    this.sprite.srcRect = this.object.srcRect;
    this.sprite.blendingMode = this.object.blendMode || 0;
    this.sprite.mirror = this.object.mirror;
    this.sprite.visible = this.object.visible && (!this.object.parent || (this.object.parent.visible == null) || this.object.parent.visible);
    this.sprite.ox = -this.object.origin.x;
    this.sprite.oy = -this.object.origin.y;
    return this.sprite.z = (this.object.zIndex || 0) + (!this.object.parent ? 0 : this.object.parent.zIndex || 0);
  };


  /**
  * Updates the optional sprite properties from the game object properties.
  * @method updateOptionalProperties
   */

  Component_Sprite.prototype.updateOptionalProperties = function() {
    if (this.object.tone != null) {
      this.sprite.tone = this.object.tone;
    }
    if (this.object.color != null) {
      this.sprite.color = this.object.color;
    }
    if (this.object.viewport != null) {
      this.sprite.viewport = this.object.viewport;
    }
    if (this.object.effects != null) {
      this.sprite.effects = this.object.effects;
    }
    if (this.object.anchor != null) {
      this.sprite.anchor.x = this.object.anchor.x;
      this.sprite.anchor.y = this.object.anchor.y;
    }
    if (this.object.positionAnchor != null) {
      this.sprite.positionAnchor = this.object.positionAnchor;
    }
    if (this.object.zoom != null) {
      this.sprite.zoomX = this.object.zoom.x;
      this.sprite.zoomY = this.object.zoom.y;
    }
    if (this.object.motionBlur != null) {
      return this.sprite.motionBlur = this.object.motionBlur;
    }
  };


  /**
  * Updates the sprite component by updating its visibility, image, padding and
  * properties.
  * @method update
   */

  Component_Sprite.prototype.update = function() {
    Component_Sprite.__super__.update.apply(this, arguments);
    if (!this.isSetup) {
      this.setup();
    }
    this.updateVisibility();
    this.updateImage();
    this.updateProperties();
    this.updateOptionalProperties();
    this.updatePadding();
    this.object.rIndex = this.sprite.index;
    return this.sprite.update();
  };

  return Component_Sprite;

})(gs.Component_Visual);


/**
* Enumeration of appearance animations. 
*
* @module gs
* @class AnimationTypes
* @static
* @memberof gs
 */

AnimationTypes = (function() {
  function AnimationTypes() {}

  AnimationTypes.initialize = function() {

    /**
    * An object appears or disappears by moving into or out of the screen.
    * @property MOVEMENT
    * @type number
    * @static
    * @final
     */
    this.MOVEMENT = 0;

    /**
    * An object appears or disappears using alpha-blending.
    * @property BLENDING
    * @type number
    * @static
    * @final
     */
    this.BLENDING = 1;

    /**
    * An object appears or disappears using a mask-image.
    * @property MASKING
    * @type number
    * @static
    * @final
     */
    return this.MASKING = 2;
  };

  return AnimationTypes;

})();

AnimationTypes.initialize();

gs.AnimationTypes = AnimationTypes;

gs.Component_Sprite = Component_Sprite;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0NBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OzZCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7Ozs7RUFhYSwwQkFBQyxPQUFEO0lBQ1QsZ0RBQUE7O0FBRUE7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7OztJQU9BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7OztJQU9BLElBQUMsQ0FBQSxXQUFELEdBQWU7RUF2RE47OztBQTJEYjs7Ozs7OzZCQUtBLE9BQUEsR0FBUyxTQUFBO0FBQ0wsUUFBQTtJQUFBLCtDQUFBLFNBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFKO01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBWDtRQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQWQsQ0FBQSxFQURKOztNQUdBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQWY7O2FBQ29CLENBQUUsbUJBQWxCLENBQXNDLElBQUMsQ0FBQSxNQUF2Qzs7d0RBQ2lCLENBQUUsbUJBQW5CLENBQXVDLElBQUMsQ0FBQSxNQUF4QyxXQUZKO09BTko7O0VBSEs7OztBQWFUOzs7Ozs7NkJBS0Esa0JBQUEsR0FBb0IsU0FBQTtXQUNoQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsR0FBd0IsQ0FBQSxTQUFBLEtBQUE7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QyxDQUFBLGdCQUFELENBQUE7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7SUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7SUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztXQUN6QixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtFQVhJOzs7O0dBelNtQixFQUFFLENBQUM7OztBQXVUbEM7Ozs7Ozs7OztBQVFNOzs7RUFDRixjQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7O0FBQ1Q7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUNaOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFDWjs7Ozs7OztXQU9BLElBQUMsQ0FBQSxPQUFELEdBQVc7RUF4QkY7Ozs7OztBQTBCakIsY0FBYyxDQUFDLFVBQWYsQ0FBQTs7QUFDQSxFQUFFLENBQUMsY0FBSCxHQUFvQjs7QUFDcEIsRUFBRSxDQUFDLGdCQUFILEdBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9TcHJpdGUgZXh0ZW5kcyBncy5Db21wb25lbnRfVmlzdWFsXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBIHNwcml0ZSBjb21wb25lbnQgdG8gZGlzcGxheSBhbiBvYmplY3Qgb24gc2NyZWVuLiBJdCBjYW4gYmUgbWFuYWdlZCBvclxuICAgICogdW5tYW5hZ2VkLiBBIG1hbmFnZWQgc3ByaXRlIGlzIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIGdyYXBoaWNzLXN5c3RlbVxuICAgICogYW5kIHJlbmRlcmVkIGV2ZXJ5IGZyYW1lIHVudGlsIGl0IGdldHMgZGlzcG9zZWQuIEFuIHVubWFuYWdlZCBzcHJpdGUgbmVlZHNcbiAgICAqIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIG1hbnVhbGx5LlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfU3ByaXRlXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHBhcmFtIHtib29sZWFufSBtYW5hZ2VkIC0gSW5kaWNhdGVzIGlmIHRoZSBzcHJpdGUgaXMgbWFuYWdlZCBieSB0aGUgZ3JhcGhpY3Mgc3lzdGVtLlxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAobWFuYWdlZCkgLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbmF0aXZlIHNwcml0ZSBvYmplY3QgdG8gZGlzcGxheSB0aGUgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IHNwcml0ZVxuICAgICAgICAqIEB0eXBlIFNwcml0ZVxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcHJpdGUgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGltYWdlIHRvIGRpc3BsYXkuXG4gICAgICAgICpcbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW1hZ2UgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG5hbWUgb2YgdGhlIHZpZGVvIHRvIGRpc3BsYXkuXG4gICAgICAgICpcbiAgICAgICAgKiBAcHJvcGVydHkgdmlkZW9cbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGZvbGRlciBmcm9tIHdoZXJlIHRoZSBpbWFnZSBzaG91bGQgYmUgbG9hZGVkLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGltYWdlRm9sZGVyID0gXCJHcmFwaGljcy9QaWN0dXJlc1wiXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHZpc2liaWxpdHkuIElmIDxiPmZhbHNlPC9iPiwgdGhlIHNwcml0ZSBpcyBub3QgcmVuZGVyZWQuXG4gICAgICAgICpcbiAgICAgICAgKiBAcHJvcGVydHkgdmlzaWJsZVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzaWJsZSA9IG5vXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaW1hZ2UgaXMgbG9hZGVkLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlTG9hZGVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZUxvYWRlZCA9IG5vXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIHNwcml0ZS4gSWYgdGhlIHNwcml0ZSBpcyBtYW5hZ2VkLCBpdCB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAqIHJlbW92ZWQgZnJvbSB0aGUgZ3JhcGhpY3Mgc3lzdGVtIGFuZCB2aWV3cG9ydC5cbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+IFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgaWYgQHNwcml0ZVxuICAgICAgICAgICAgQHNwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHNwcml0ZS52aWRlb1xuICAgICAgICAgICAgICAgIEBzcHJpdGUudmlkZW8uc3RvcCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBAc3ByaXRlLm1hbmFnZWRcbiAgICAgICAgICAgICAgICBAc3ByaXRlLnZpZXdwb3J0Py5yZW1vdmVHcmFwaGljT2JqZWN0KEBzcHJpdGUpXG4gICAgICAgICAgICAgICAgR3JhcGhpY3Mudmlld3BvcnQ/LnJlbW92ZUdyYXBoaWNPYmplY3QoQHNwcml0ZSlcbiBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXJzIGZvciBtb3VzZS90b3VjaCBldmVudHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRXZlbnRIYW5kbGVyc1xuICAgICMjIyBcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIEBzcHJpdGUub25JbmRleENoYW5nZSA9ID0+XG4gICAgICAgICAgICBAb2JqZWN0LnJJbmRleCA9IEBzcHJpdGUuaW5kZXhcbiAgICAgICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXR1cCB0aGUgc3ByaXRlLiBcbiAgICAqIEBtZXRob2Qgc2V0dXBTcHJpdGVcbiAgICAjIyMgXG4gICAgc2V0dXBTcHJpdGU6IC0+XG4gICAgICAgIGlmICFAc3ByaXRlXG4gICAgICAgICAgICBAc3ByaXRlID0gbmV3IGdzLlNwcml0ZShHcmFwaGljcy52aWV3cG9ydCwgbWFuYWdlZCA/IHllcylcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHVwIHRoZSBzcHJpdGUgY29tcG9uZW50LiBUaGlzIG1ldGhvZCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSB0aGVcbiAgICAqIHN5c3RlbS5cbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQGlzU2V0dXAgPSB5ZXNcbiAgICAgICAgQHNldHVwU3ByaXRlKClcbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBzb3VyY2UtIGFuZCBkZXN0aW5hdGlvbi1yZWN0YW5nbGUgb2YgdGhlIGdhbWUgb2JqZWN0IHNvIHRoYXRcbiAgICAqIHRoZSBhc3NvY2lhdGVkIGJpdG1hcCBmaXRzIGluLiBUaGUgaW1hZ2VIYW5kbGluZyBwcm9wZXJ0eSBjb250cm9scyBob3dcbiAgICAqIHRoZSByZWN0YW5nbGVzIGFyZSByZXNpemVkLlxuICAgICogQG1ldGhvZCB1cGRhdGVSZWN0XG4gICAgIyMjXG4gICAgdXBkYXRlUmVjdDogLT5cbiAgICAgICAgaWYgQHNwcml0ZS5iaXRtYXA/XG4gICAgICAgICAgICBpZiAhQG9iamVjdC5pbWFnZUhhbmRsaW5nXG4gICAgICAgICAgICAgICAgQG9iamVjdC5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgQHNwcml0ZS5iaXRtYXAud2lkdGgsIEBzcHJpdGUuYml0bWFwLmhlaWdodClcbiAgICAgICAgICAgICAgICBpZiBub3QgQG9iamVjdC5maXhlZFNpemVcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoID0gQG9iamVjdC5zcmNSZWN0LndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQgPSBAb2JqZWN0LnNyY1JlY3QuaGVpZ2h0XG4gICAgICAgICAgICBlbHNlIGlmIEBvYmplY3QuaW1hZ2VIYW5kbGluZyA9PSAxXG4gICAgICAgICAgICAgICAgQG9iamVjdC5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgQHNwcml0ZS5iaXRtYXAud2lkdGgsIEBzcHJpdGUuYml0bWFwLmhlaWdodCAvIDIpXG4gICAgICAgICAgICAgICAgaWYgbm90IEBvYmplY3QuZml4ZWRTaXplXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBvYmplY3Quc3JjUmVjdC53aWR0aFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG9iamVjdC5zcmNSZWN0LmhlaWdodFxuICAgICAgICAgICAgZWxzZSBpZiBAb2JqZWN0LmltYWdlSGFuZGxpbmcgPT0gMlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0LmZpeGVkU2l6ZVxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAb2JqZWN0LnNyY1JlY3Qud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBvYmplY3Quc3JjUmVjdC5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYml0bWFwIG9iamVjdCBmcm9tIHRoZSBhc3NvY2lhdGVkIGltYWdlIG5hbWUuIFRoZSBpbWFnZUZvbGRlclxuICAgICogcHJvcGVydHkgY29udHJvbHMgZnJvbSB3aGljaCByZXNvdXJjZS1mb2xkZXIgdGhlIGltYWdlIHdpbGwgYmUgbG9hZGVkLlxuICAgICogQG1ldGhvZCB1cGRhdGVCaXRtYXBcbiAgICAjIyNcbiAgICB1cGRhdGVCaXRtYXA6IC0+XG4gICAgICAgIEBpbWFnZUxvYWRlZCA9IG5vXG4gICAgICAgIEBpbWFnZSA9IEBvYmplY3QuaW1hZ2VcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuaW1hZ2Uuc3RhcnRzV2l0aChcImRhdGE6XCIpIHx8IEBvYmplY3QuaW1hZ2Uuc3RhcnRzV2l0aChcIiRcIilcbiAgICAgICAgICAgIEBzcHJpdGUuYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChAb2JqZWN0LmltYWdlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3ByaXRlLmJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCIje0BvYmplY3QuaW1hZ2VGb2xkZXJ8fEBpbWFnZUZvbGRlcn0vI3tAb2JqZWN0LmltYWdlfVwiKVxuICAgICAgICAgIFxuICAgICAgICBpZiBAc3ByaXRlLmJpdG1hcD8gIFxuICAgICAgICAgICAgaWYgbm90IEBpbWFnZUxvYWRlZFxuICAgICAgICAgICAgICAgIEBpbWFnZUxvYWRlZCA9IEBzcHJpdGUuYml0bWFwLmxvYWRlZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAc3ByaXRlLmJpdG1hcC5sb2FkZWRfXG4gICAgICAgICAgICBcbiAgICAgICAgQG9iamVjdC5iaXRtYXAgPSBAc3ByaXRlLmJpdG1hcFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSB2aWRlbyBvYmplY3QgZnJvbSB0aGUgYXNzb2NpYXRlZCB2aWRlbyBuYW1lLiBJdCBhbHNvIHVwZGF0ZXNcbiAgICAqIHRoZSB2aWRlby1yZW5kZXJpbmcgcHJvY2Vzcy5cbiAgICAqIEBtZXRob2QgdXBkYXRlVmlkZW9cbiAgICAjIyNcbiAgICB1cGRhdGVWaWRlbzogLT5cbiAgICAgICAgaWYgQG9iamVjdC52aWRlbyAhPSBAdmlkZW9OYW1lXG4gICAgICAgICAgICBAdmlkZW9OYW1lID0gQG9iamVjdC52aWRlb1xuICAgICAgICAgICAgQHNwcml0ZS52aWRlbyA9IFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIk1vdmllcy8je0BvYmplY3QudmlkZW99XCIpXG4gICAgICAgICAgICBpZiBAc3ByaXRlLnZpZGVvP1xuICAgICAgICAgICAgICAgIGlmICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3MubXVzaWNEaXNhYmxlZFxuICAgICAgICAgICAgICAgICAgICBAc3ByaXRlLnZpZGVvLnZvbHVtZSA9IDBcbiAgICAgICAgICAgICAgICBAc3ByaXRlLnZpZGVvLmxvb3AgPSBAb2JqZWN0Lmxvb3BcbiAgICAgICAgICAgICAgICBAc3ByaXRlLnZpZGVvLnBsYXkoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBvYmplY3Quc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIEBzcHJpdGUudmlkZW8ud2lkdGgsIEBzcHJpdGUudmlkZW8uaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0LmZpeGVkU2l6ZVxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3QgPSBuZXcgUmVjdChAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksIEBzcHJpdGUudmlkZW8ud2lkdGgsIEBzcHJpdGUudmlkZW8uaGVpZ2h0KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc3ByaXRlLnZpZGVvPy51cGRhdGUoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBpbWFnZSBpZiB0aGUgZ2FtZSBvYmplY3QgaGFzIHRoZSBpbWFnZS1wcm9wZXJ0eSBzZXQuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUltYWdlXG4gICAgIyMjXG4gICAgdXBkYXRlSW1hZ2U6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuaW1hZ2U/XG4gICAgICAgICAgICBpZiBAb2JqZWN0LmltYWdlICE9IEBpbWFnZSBvciAoIUBpbWFnZUxvYWRlZCBhbmQgQHNwcml0ZS5iaXRtYXA/LmxvYWRlZClcbiAgICAgICAgICAgICAgICBAdXBkYXRlQml0bWFwKClcbiAgICAgICAgICAgICAgICBAdXBkYXRlUmVjdCgpXG4gICAgICAgIGVsc2UgaWYgQG9iamVjdC5iaXRtYXA/ICAgIFxuICAgICAgICAgICAgQHNwcml0ZS5iaXRtYXAgPSBAb2JqZWN0LmJpdG1hcFxuICAgICAgICBlbHNlIGlmIEBvYmplY3QudmlkZW8/IG9yIEB2aWRlb05hbWUgIT0gQG9iamVjdC52aWRlb1xuICAgICAgICAgICAgQHVwZGF0ZVZpZGVvKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGltYWdlID0gbnVsbFxuICAgICAgICAgICAgQG9iamVjdC5iaXRtYXAgPSBudWxsXG4gICAgICAgICAgICBAc3ByaXRlLmJpdG1hcCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIElmIHRoZSBzcHJpdGUgaXMgdW5tYW5hZ2VkLCB0aGlzIG1ldGhvZCB3aWxsIHVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGVcbiAgICAqIHNwcml0ZS4gSWYgdGhlIHNwcml0ZSBsZWF2ZXMgdGhlIHZpZXdwb3J0LCBpdCB3aWxsIGJlIHJlbW92ZWQgdG8gc2F2ZSBcbiAgICAqIHBlcmZvcm1hbmNlIGFuZCBhdXRvbWF0aWNhbGx5IGFkZGVkIGJhY2sgdG8gdGhlIHZpZXdwb3J0IGlmIGl0IGVudGVyc1xuICAgICogdGhlIHZpZXdwb3J0LlxuICAgICogQG1ldGhvZCB1cGRhdGVWaXNpYmlsaXR5XG4gICAgIyMjXG4gICAgdXBkYXRlVmlzaWJpbGl0eTogLT5cbiAgICAgICAgaWYgIUBzcHJpdGUubWFuYWdlZFxuICAgICAgICAgICAgdmlzaWJsZSA9IFJlY3QuaW50ZXJzZWN0KEBvYmplY3QuZHN0UmVjdC54K0BvYmplY3Qub3JpZ2luLngsIEBvYmplY3QuZHN0UmVjdC55K0BvYmplY3Qub3JpZ2luLnksIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgR3JhcGhpY3Mud2lkdGgsIEdyYXBoaWNzLmhlaWdodClcbiAgICAgICAgICAgIGlmIHZpc2libGUgYW5kICFAdmlzaWJsZVxuICAgICAgICAgICAgICAgIChAb2JqZWN0LnZpZXdwb3J0IHx8IEdyYXBoaWNzLnZpZXdwb3J0KS5hZGRHcmFwaGljT2JqZWN0KEBzcHJpdGUpXG4gICAgICAgICAgICAgICAgQHZpc2libGUgPSB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICF2aXNpYmxlIGFuZCBAdmlzaWJsZVxuICAgICAgICAgICAgICAgIChAb2JqZWN0LnZpZXdwb3J0IHx8IEdyYXBoaWNzLnZpZXdwb3J0KS5yZW1vdmVHcmFwaGljT2JqZWN0KEBzcHJpdGUpXG4gICAgICAgICAgICAgICAgQHZpc2libGUgPSBub1xuICAgICAgICAgICAgICAgIFxuICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgcGFkZGluZy5cbiAgICAqIEBtZXRob2QgdXBkYXRlUGFkZGluZ1xuICAgICMjI1xuICAgIHVwZGF0ZVBhZGRpbmc6IC0+XG4gICAgICAgIGlmIEBvYmplY3QucGFkZGluZz9cbiAgICAgICAgICAgIEBzcHJpdGUueCArPSBAb2JqZWN0LnBhZGRpbmcubGVmdFxuICAgICAgICAgICAgQHNwcml0ZS55ICs9IEBvYmplY3QucGFkZGluZy50b3BcbiAgICAgICAgICAgIEBzcHJpdGUuem9vbVggLT0gKEBvYmplY3QucGFkZGluZy5sZWZ0K0BvYmplY3QucGFkZGluZy5yaWdodCkgLyBAb2JqZWN0LnNyY1JlY3Qud2lkdGhcbiAgICAgICAgICAgIEBzcHJpdGUuem9vbVkgLT0gKEBvYmplY3QucGFkZGluZy5ib3R0b20rQG9iamVjdC5wYWRkaW5nLmJvdHRvbSkgLyBAb2JqZWN0LnNyY1JlY3QuaGVpZ2h0XG4gICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHNwcml0ZSBwcm9wZXJ0aWVzIGZyb20gdGhlIGdhbWUgb2JqZWN0IHByb3BlcnRpZXMuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVByb3BlcnRpZXNcbiAgICAjIyNcbiAgICB1cGRhdGVQcm9wZXJ0aWVzOiAtPlxuICAgICAgICBAc3ByaXRlLndpZHRoID0gQG9iamVjdC5kc3RSZWN0LndpZHRoXG4gICAgICAgIEBzcHJpdGUuaGVpZ2h0ID0gQG9iamVjdC5kc3RSZWN0LmhlaWdodFxuICAgICAgICBAc3ByaXRlLnggPSBAb2JqZWN0LmRzdFJlY3QueCBcbiAgICAgICAgQHNwcml0ZS55ID0gQG9iamVjdC5kc3RSZWN0LnlcbiAgICAgICAgQHNwcml0ZS5tYXNrID0gQG9iamVjdC5tYXNrID8gQG1hc2tcbiAgICAgICAgQHNwcml0ZS5hbmdsZSA9IEBvYmplY3QuYW5nbGUgfHwgMFxuICAgICAgICBAc3ByaXRlLm9wYWNpdHkgPSBAb2JqZWN0Lm9wYWNpdHkgPyAyNTVcbiAgICAgICAgQHNwcml0ZS5jbGlwUmVjdCA9IEBvYmplY3QuY2xpcFJlY3RcbiAgICAgICAgQHNwcml0ZS5zcmNSZWN0ID0gQG9iamVjdC5zcmNSZWN0XG4gICAgICAgIEBzcHJpdGUuYmxlbmRpbmdNb2RlID0gQG9iamVjdC5ibGVuZE1vZGUgfHwgMFxuICAgICAgICBAc3ByaXRlLm1pcnJvciA9IEBvYmplY3QubWlycm9yXG4gICAgICAgIEBzcHJpdGUudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZSBhbmQgKCFAb2JqZWN0LnBhcmVudCBvciAhQG9iamVjdC5wYXJlbnQudmlzaWJsZT8gb3IgQG9iamVjdC5wYXJlbnQudmlzaWJsZSlcbiAgICAgICAgQHNwcml0ZS5veCA9IC1Ab2JqZWN0Lm9yaWdpbi54XG4gICAgICAgIEBzcHJpdGUub3kgPSAtQG9iamVjdC5vcmlnaW4ueVxuICAgICAgICBAc3ByaXRlLnogPSAoQG9iamVjdC56SW5kZXggfHwgMCkgKyAoaWYgIUBvYmplY3QucGFyZW50IHRoZW4gMCBlbHNlIEBvYmplY3QucGFyZW50LnpJbmRleCB8fCAwKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBvcHRpb25hbCBzcHJpdGUgcHJvcGVydGllcyBmcm9tIHRoZSBnYW1lIG9iamVjdCBwcm9wZXJ0aWVzLlxuICAgICogQG1ldGhvZCB1cGRhdGVPcHRpb25hbFByb3BlcnRpZXNcbiAgICAjIyNcbiAgICB1cGRhdGVPcHRpb25hbFByb3BlcnRpZXM6IC0+XG4gICAgICAgIGlmIEBvYmplY3QudG9uZT9cbiAgICAgICAgICAgIEBzcHJpdGUudG9uZSA9IEBvYmplY3QudG9uZVxuICAgICAgICBpZiBAb2JqZWN0LmNvbG9yP1xuICAgICAgICAgICAgQHNwcml0ZS5jb2xvciA9IEBvYmplY3QuY29sb3JcbiAgICAgICAgaWYgQG9iamVjdC52aWV3cG9ydD9cbiAgICAgICAgICAgIEBzcHJpdGUudmlld3BvcnQgPSBAb2JqZWN0LnZpZXdwb3J0XG4gICAgICAgIGlmIEBvYmplY3QuZWZmZWN0cz9cbiAgICAgICAgICAgIEBzcHJpdGUuZWZmZWN0cyA9IEBvYmplY3QuZWZmZWN0c1xuICAgICAgICBpZiBAb2JqZWN0LmFuY2hvcj9cbiAgICAgICAgICAgIEBzcHJpdGUuYW5jaG9yLnggPSBAb2JqZWN0LmFuY2hvci54XG4gICAgICAgICAgICBAc3ByaXRlLmFuY2hvci55ID0gQG9iamVjdC5hbmNob3IueVxuICAgICAgICBpZiBAb2JqZWN0LnBvc2l0aW9uQW5jaG9yP1xuICAgICAgICAgICAgQHNwcml0ZS5wb3NpdGlvbkFuY2hvciA9IEBvYmplY3QucG9zaXRpb25BbmNob3JcbiAgICAgICAgaWYgQG9iamVjdC56b29tP1xuICAgICAgICAgICAgQHNwcml0ZS56b29tWCA9IEBvYmplY3Quem9vbS54XG4gICAgICAgICAgICBAc3ByaXRlLnpvb21ZID0gQG9iamVjdC56b29tLnlcbiAgICAgICAgaWYgQG9iamVjdC5tb3Rpb25CbHVyP1xuICAgICAgICAgICAgQHNwcml0ZS5tb3Rpb25CbHVyID0gQG9iamVjdC5tb3Rpb25CbHVyXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHNwcml0ZSBjb21wb25lbnQgYnkgdXBkYXRpbmcgaXRzIHZpc2liaWxpdHksIGltYWdlLCBwYWRkaW5nIGFuZFxuICAgICogcHJvcGVydGllcy5cbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHNldHVwKCkgaWYgbm90IEBpc1NldHVwXG4gICAgICAgIEB1cGRhdGVWaXNpYmlsaXR5KClcbiAgICAgICAgQHVwZGF0ZUltYWdlKClcbiAgICAgICAgQHVwZGF0ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlT3B0aW9uYWxQcm9wZXJ0aWVzKClcbiAgICAgICAgQHVwZGF0ZVBhZGRpbmcoKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5ySW5kZXggPSBAc3ByaXRlLmluZGV4XG4gICAgICAgIEBzcHJpdGUudXBkYXRlKClcbiAgICAgICAgXG5cbiMjIypcbiogRW51bWVyYXRpb24gb2YgYXBwZWFyYW5jZSBhbmltYXRpb25zLiBcbipcbiogQG1vZHVsZSBnc1xuKiBAY2xhc3MgQW5pbWF0aW9uVHlwZXNcbiogQHN0YXRpY1xuKiBAbWVtYmVyb2YgZ3NcbiMjI1xuY2xhc3MgQW5pbWF0aW9uVHlwZXNcbiAgICBAaW5pdGlhbGl6ZTogLT4gICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBvYmplY3QgYXBwZWFycyBvciBkaXNhcHBlYXJzIGJ5IG1vdmluZyBpbnRvIG9yIG91dCBvZiB0aGUgc2NyZWVuLlxuICAgICAgICAqIEBwcm9wZXJ0eSBNT1ZFTUVOVFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBzdGF0aWNcbiAgICAgICAgKiBAZmluYWxcbiAgICAgICAgIyMjXG4gICAgICAgIEBNT1ZFTUVOVCA9IDBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIG9iamVjdCBhcHBlYXJzIG9yIGRpc2FwcGVhcnMgdXNpbmcgYWxwaGEtYmxlbmRpbmcuXG4gICAgICAgICogQHByb3BlcnR5IEJMRU5ESU5HXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHN0YXRpY1xuICAgICAgICAqIEBmaW5hbFxuICAgICAgICAjIyNcbiAgICAgICAgQEJMRU5ESU5HID0gMVxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gb2JqZWN0IGFwcGVhcnMgb3IgZGlzYXBwZWFycyB1c2luZyBhIG1hc2staW1hZ2UuXG4gICAgICAgICogQHByb3BlcnR5IE1BU0tJTkdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAc3RhdGljXG4gICAgICAgICogQGZpbmFsXG4gICAgICAgICMjI1xuICAgICAgICBATUFTS0lORyA9IDJcblxuQW5pbWF0aW9uVHlwZXMuaW5pdGlhbGl6ZSgpICAgIFxuZ3MuQW5pbWF0aW9uVHlwZXMgPSBBbmltYXRpb25UeXBlc1xuZ3MuQ29tcG9uZW50X1Nwcml0ZSA9IENvbXBvbmVudF9TcHJpdGVcbiJdfQ==
//# sourceURL=Component_Sprite_59.js