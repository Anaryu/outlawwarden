var Component_SceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_SceneBehavior = (function(superClass) {
  extend(Component_SceneBehavior, superClass);


  /**
  * The base class of all scene-behavior components. A scene-behavior component
  * define the logic of a single game scene. 
  *
  * @module gs
  * @class Component_SceneBehavior
  * @extends gs.Component_Container
  * @memberof gs
   */

  function Component_SceneBehavior() {
    Component_SceneBehavior.__super__.constructor.call(this);
    this.loadingScreenVisible = false;
  }


  /**
  * Initializes the scene. 
  *
  * @method initialize
  * @abstract
   */

  Component_SceneBehavior.prototype.initialize = function() {};


  /**
  * Disposes the scene.
  *
  * @method dispose
   */

  Component_SceneBehavior.prototype.dispose = function() {
    var ref;
    if (!GameManager.inLivePreview) {
      ResourceManager.dispose();
    }
    return (ref = this.object.events) != null ? ref.emit("dispose", this.object) : void 0;
  };


  /**
  * Called if the preparation and transition
  * is done and the is ready to start.
  *
  * @method start
   */

  Component_SceneBehavior.prototype.start = function() {};


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
  * @abstract
   */

  Component_SceneBehavior.prototype.prepareVisual = function() {};


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_SceneBehavior.prototype.prepareData = function() {};


  /**
  * Prepares for a screen-transition.
  *
  * @method prepareTransition
  * @param {Object} transitionData - Object containing additional data for the transition 
  * like graphic, duration and vague.
   */

  Component_SceneBehavior.prototype.prepareTransition = function(transitionData) {
    var ref;
    if ((transitionData != null ? (ref = transitionData.graphic) != null ? ref.name.length : void 0 : void 0) > 0) {
      return ResourceManager.getBitmap("Graphics/Masks/" + transitionData.graphic.name);
    }
  };


  /**
  * Executes a screen-transition.
  *
  * @method transition
  * @param {Object} transitionData - Object containing additional data for the transition 
  * like graphic, duration and vague.
   */

  Component_SceneBehavior.prototype.transition = function(transitionData) {
    var ref;
    if ($PARAMS.preview) {
      return Graphics.transition(0);
    } else {
      transitionData = transitionData || SceneManager.transitionData;
      if ((transitionData != null ? (ref = transitionData.graphic) != null ? ref.name.length : void 0 : void 0) > 0) {
        return Graphics.transition(transitionData.duration, ResourceManager.getBitmap("Graphics/Masks/" + transitionData.graphic.name), transitionData.vague || 30);
      } else {
        return Graphics.transition(transitionData.duration);
      }
    }
  };


  /**
  * Update the scene's content.
  *
  * @method updateContent
  * @abstract
   */

  Component_SceneBehavior.prototype.updateContent = function() {};


  /**
  * Sets up the loading screen.
  *
  * @method prepareLoadingScreen
   */

  Component_SceneBehavior.prototype.prepareLoadingScreen = function() {
    var bitmap;
    this.loadingBackgroundSprite = new gs.Sprite();
    if (gs.Platform.isWeb && !GameManager.inLivePreview) {
      bitmap = new gs.Bitmap(300, 100);
      bitmap.font.name = "Times New Roman";
      bitmap.drawText(0, 0, 300, 100, "NOW LOADING", 1, 1);
      this.loadingBackgroundSprite.x = (Graphics.width - bitmap.width) / 2;
      this.loadingBackgroundSprite.y = (Graphics.height - bitmap.height) / 2;
      this.loadingBackgroundSprite.bitmap = bitmap;
      return this.loadingBackgroundSprite.srcRect = new gs.Rect(0, 0, bitmap.width, bitmap.height);
    }
  };


  /**
  * Disposes the loading screen.
  *
  * @method clearLoadingScreen
   */

  Component_SceneBehavior.prototype.clearLoadingScreen = function() {
    if (this.loadingBackgroundSprite) {
      if (gs.Platform.isWeb && !GameManager.inLivePreview) {
        this.loadingBackgroundSprite.bitmap.dispose();
      }
      this.loadingBackgroundSprite.dispose();
      return this.loadingBackgroundSprite = null;
    }
  };


  /**
  * Called once per frame while a scene is loading. Can be used to display
  * loading-message/animation.
  *
  * @method loading
   */

  Component_SceneBehavior.prototype.loading = function() {
    if (this.loadingBackgroundSprite2 == null) {
      this.loadingBackgroundSprite2 = {};

      /*
      bitmap = new gs.Bitmap(300, 100)
      bitmap.drawText(0, 0, 300, 100, "NOW LOADING", 1, 1)
      @loadingBackgroundSprite = new gs.Sprite()
      @loadingBackgroundSprite.x = (Graphics.width - bitmap.width) / 2
      @loadingBackgroundSprite.y = (Graphics.height - bitmap.height) / 2
      @loadingBackgroundSprite.bitmap = bitmap
      @loadingBackgroundSprite.srcRect = new gs.Rect(0, 0, bitmap.width, bitmap.height)
       */
      if (Graphics.frozen) {
        return this.transition({
          duration: 0
        });
      }
    }
  };


  /**
  * Update the scene.
  *
  * @method update
   */

  Component_SceneBehavior.prototype.update = function() {
    Component_SceneBehavior.__super__.update.call(this);
    if (DataManager.documentsLoaded) {
      if (this.object.loadingData && !this.object.initialized) {
        this.prepareData();
      }
      this.object.loadingData = !DataManager.documentsLoaded;
    }
    if (!this.object.loadingData && ResourceManager.resourcesLoaded) {
      if (this.object.loadingResources && !this.object.initialized) {
        if (!this.loadingScreenVisible) {
          this.prepareVisual();
        }
        this.object.initialized = true;
      }
      this.object.loadingResources = false;
    }
    if (ResourceManager.resourcesLoaded && DataManager.documentsLoaded) {
      this.object.loading = false;
      if (Graphics.frozen && this.object.preparing) {
        return Graphics.update();
      } else {
        if (this.loadingScreenVisible) {
          if (this.object.loaded) {
            this.loadingScreenVisible = false;
            this.object.loaded = true;
            return this.updateContent();
          } else {
            if (!Graphics.frozen) {
              Graphics.freeze();
            }
            this.clearLoadingScreen();
            this.object.loaded = true;
            this.object.setup();
            this.prepareVisual();
            this.loadingScreenVisible = false;
            Graphics.update();
            return Input.update();
          }
        } else {
          this.clearLoadingScreen();
          if (this.object.preparing) {
            this.object.preparing = false;
            this.start();
          }
          Graphics.update();
          if (!Graphics.frozen) {
            this.updateContent();
          }
          return Input.update();
        }
      }
    } else {
      this.loadingScreenVisible = true;
      Graphics.update();
      Input.update();
      return this.loading();
    }
  };

  return Component_SceneBehavior;

})(gs.Component_Container);

gs.Component_SceneBehavior = Component_SceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsdUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLGlDQUFBO0lBQ1QsdURBQUE7SUFFQSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7RUFIZjs7O0FBS2I7Ozs7Ozs7b0NBTUEsVUFBQSxHQUFZLFNBQUEsR0FBQTs7O0FBRVo7Ozs7OztvQ0FLQSxPQUFBLEdBQVMsU0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFHLENBQUksV0FBVyxDQUFDLGFBQW5CO01BQ0ksZUFBZSxDQUFDLE9BQWhCLENBQUEsRUFESjs7bURBRWMsQ0FBRSxJQUFoQixDQUFxQixTQUFyQixFQUFnQyxJQUFDLENBQUEsTUFBakM7RUFISzs7O0FBTVQ7Ozs7Ozs7b0NBTUEsS0FBQSxHQUFPLFNBQUEsR0FBQTs7O0FBRVA7Ozs7Ozs7b0NBTUEsYUFBQSxHQUFlLFNBQUEsR0FBQTs7O0FBRWY7Ozs7Ozs7b0NBTUEsV0FBQSxHQUFhLFNBQUEsR0FBQTs7O0FBRWI7Ozs7Ozs7O29DQU9BLGlCQUFBLEdBQW1CLFNBQUMsY0FBRDtBQUNmLFFBQUE7SUFBQSwwRUFBMEIsQ0FBRSxJQUFJLENBQUMseUJBQTlCLEdBQXVDLENBQTFDO2FBQ0ksZUFBZSxDQUFDLFNBQWhCLENBQTBCLGlCQUFBLEdBQWtCLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBbkUsRUFESjs7RUFEZTs7O0FBSW5COzs7Ozs7OztvQ0FPQSxVQUFBLEdBQVksU0FBQyxjQUFEO0FBQ1IsUUFBQTtJQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7YUFDSSxRQUFRLENBQUMsVUFBVCxDQUFvQixDQUFwQixFQURKO0tBQUEsTUFBQTtNQUdJLGNBQUEsR0FBaUIsY0FBQSxJQUFrQixZQUFZLENBQUM7TUFDaEQsMEVBQTBCLENBQUUsSUFBSSxDQUFDLHlCQUE5QixHQUF1QyxDQUExQztlQUNJLFFBQVEsQ0FBQyxVQUFULENBQW9C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O1VBQ0EsSUFBb0IsQ0FBQyxRQUFRLENBQUMsTUFBOUI7WUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQUE7O2lCQUNBLEtBQUssQ0FBQyxNQUFOLENBQUEsRUFyQko7U0FISjtPQUhKO0tBQUEsTUFBQTtNQStCSSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7TUFDeEIsUUFBUSxDQUFDLE1BQVQsQ0FBQTtNQUNBLEtBQUssQ0FBQyxNQUFOLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBbENKOztFQWRJOzs7O0dBckowQixFQUFFLENBQUM7O0FBME16QyxFQUFFLENBQUMsdUJBQUgsR0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfU2NlbmVCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9Db250YWluZXJcbiAgICAjIyMqXG4gICAgKiBUaGUgYmFzZSBjbGFzcyBvZiBhbGwgc2NlbmUtYmVoYXZpb3IgY29tcG9uZW50cy4gQSBzY2VuZS1iZWhhdmlvciBjb21wb25lbnRcbiAgICAqIGRlZmluZSB0aGUgbG9naWMgb2YgYSBzaW5nbGUgZ2FtZSBzY2VuZS4gXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfQ29udGFpbmVyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0gbm9cblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBzY2VuZS4gXG4gICAgKlxuICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyNcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjIyAgXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5kaXNwb3NlKClcbiAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJkaXNwb3NlXCIsIEBvYmplY3QpXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGUgcHJlcGFyYXRpb24gYW5kIHRyYW5zaXRpb25cbiAgICAqIGlzIGRvbmUgYW5kIHRoZSBpcyByZWFkeSB0byBzdGFydC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgIyMjICBcbiAgICBzdGFydDogLT5cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIHZpc3VhbCBnYW1lIG9iamVjdCBmb3IgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVZpc3VhbFxuICAgICogQGFic3RyYWN0XG4gICAgIyMjICBcbiAgICBwcmVwYXJlVmlzdWFsOiAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgZGF0YSBmb3IgdGhlIHNjZW5lIGFuZCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGdyYXBoaWMgYW5kIGF1ZGlvIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVEYXRhXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyMgXG4gICAgcHJlcGFyZURhdGE6IC0+XG4gICAgIFxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGZvciBhIHNjcmVlbi10cmFuc2l0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVRyYW5zaXRpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFuc2l0aW9uRGF0YSAtIE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGhlIHRyYW5zaXRpb24gXG4gICAgKiBsaWtlIGdyYXBoaWMsIGR1cmF0aW9uIGFuZCB2YWd1ZS5cbiAgICAjIyMgICAgXG4gICAgcHJlcGFyZVRyYW5zaXRpb246ICh0cmFuc2l0aW9uRGF0YSkgLT5cbiAgICAgICAgaWYgdHJhbnNpdGlvbkRhdGE/LmdyYXBoaWM/Lm5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7dHJhbnNpdGlvbkRhdGEuZ3JhcGhpYy5uYW1lfVwiKVxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGEgc2NyZWVuLXRyYW5zaXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCB0cmFuc2l0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdHJhbnNpdGlvbkRhdGEgLSBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgZm9yIHRoZSB0cmFuc2l0aW9uIFxuICAgICogbGlrZSBncmFwaGljLCBkdXJhdGlvbiBhbmQgdmFndWUuXG4gICAgIyMjICAgICAgICAgXG4gICAgdHJhbnNpdGlvbjogKHRyYW5zaXRpb25EYXRhKSAtPlxuICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXdcbiAgICAgICAgICAgIEdyYXBoaWNzLnRyYW5zaXRpb24oMClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJhbnNpdGlvbkRhdGEgPSB0cmFuc2l0aW9uRGF0YSB8fCBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGFcbiAgICAgICAgICAgIGlmIHRyYW5zaXRpb25EYXRhPy5ncmFwaGljPy5uYW1lLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKHRyYW5zaXRpb25EYXRhLmR1cmF0aW9uLCBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3t0cmFuc2l0aW9uRGF0YS5ncmFwaGljLm5hbWV9XCIpLCB0cmFuc2l0aW9uRGF0YS52YWd1ZSB8fCAzMClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKHRyYW5zaXRpb25EYXRhLmR1cmF0aW9uKVxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZSB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICogQGFic3RyYWN0XG4gICAgIyMjICAgICAgICAgXG4gICAgdXBkYXRlQ29udGVudDogLT5cbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSBsb2FkaW5nIHNjcmVlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVMb2FkaW5nU2NyZWVuXG4gICAgIyMjICAgICBcbiAgICBwcmVwYXJlTG9hZGluZ1NjcmVlbjogLT5cbiAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlID0gbmV3IGdzLlNwcml0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBncy5QbGF0Zm9ybS5pc1dlYiBhbmQgIUdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgIGJpdG1hcCA9IG5ldyBncy5CaXRtYXAoMzAwLCAxMDApXG4gICAgICAgICAgICBiaXRtYXAuZm9udC5uYW1lID0gXCJUaW1lcyBOZXcgUm9tYW5cIlxuICAgICAgICAgICAgYml0bWFwLmRyYXdUZXh0KDAsIDAsIDMwMCwgMTAwLCBcIk5PVyBMT0FESU5HXCIsIDEsIDEpXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUueCA9IChHcmFwaGljcy53aWR0aCAtIGJpdG1hcC53aWR0aCkgLyAyXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUueSA9IChHcmFwaGljcy5oZWlnaHQgLSBiaXRtYXAuaGVpZ2h0KSAvIDJcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS5iaXRtYXAgPSBiaXRtYXBcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS5zcmNSZWN0ID0gbmV3IGdzLlJlY3QoMCwgMCwgYml0bWFwLndpZHRoLCBiaXRtYXAuaGVpZ2h0KVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgbG9hZGluZyBzY3JlZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckxvYWRpbmdTY3JlZW5cbiAgICAjIyMgICAgXG4gICAgY2xlYXJMb2FkaW5nU2NyZWVuOiAtPlxuICAgICAgICBpZiBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGVcbiAgICAgICAgICAgIGlmIGdzLlBsYXRmb3JtLmlzV2ViIGFuZCAhR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlld1xuICAgICAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS5iaXRtYXAuZGlzcG9zZSgpXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUuZGlzcG9zZSgpXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgb25jZSBwZXIgZnJhbWUgd2hpbGUgYSBzY2VuZSBpcyBsb2FkaW5nLiBDYW4gYmUgdXNlZCB0byBkaXNwbGF5XG4gICAgKiBsb2FkaW5nLW1lc3NhZ2UvYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZGluZ1xuICAgICMjIyBcbiAgICBsb2FkaW5nOiAtPlxuICAgICAgICBpZiBub3QgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlMj9cbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZTIgPSB7fVxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBiaXRtYXAgPSBuZXcgZ3MuQml0bWFwKDMwMCwgMTAwKVxuICAgICAgICAgICAgYml0bWFwLmRyYXdUZXh0KDAsIDAsIDMwMCwgMTAwLCBcIk5PVyBMT0FESU5HXCIsIDEsIDEpXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUgPSBuZXcgZ3MuU3ByaXRlKClcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS54ID0gKEdyYXBoaWNzLndpZHRoIC0gYml0bWFwLndpZHRoKSAvIDJcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS55ID0gKEdyYXBoaWNzLmhlaWdodCAtIGJpdG1hcC5oZWlnaHQpIC8gMlxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLmJpdG1hcCA9IGJpdG1hcFxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLnNyY1JlY3QgPSBuZXcgZ3MuUmVjdCgwLCAwLCBiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgR3JhcGhpY3MuZnJvemVuIHRoZW4gQHRyYW5zaXRpb24oeyBkdXJhdGlvbjogMCB9KVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyBcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIERhdGFNYW5hZ2VyLmRvY3VtZW50c0xvYWRlZFxuICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkaW5nRGF0YSBhbmQgbm90IEBvYmplY3QuaW5pdGlhbGl6ZWQgdGhlbiBAcHJlcGFyZURhdGEoKVxuICAgICAgICAgICAgQG9iamVjdC5sb2FkaW5nRGF0YSA9ICFEYXRhTWFuYWdlci5kb2N1bWVudHNMb2FkZWRcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAb2JqZWN0LmxvYWRpbmdEYXRhIGFuZCBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzTG9hZGVkXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmxvYWRpbmdSZXNvdXJjZXMgYW5kIG5vdCBAb2JqZWN0LmluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgaWYgbm90IEBsb2FkaW5nU2NyZWVuVmlzaWJsZVxuICAgICAgICAgICAgICAgICAgICBAcHJlcGFyZVZpc3VhbCgpIFxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICAgICAgICAgIEBvYmplY3QubG9hZGluZ1Jlc291cmNlcyA9IGZhbHNlXG4gICAgXG4gICAgICAgIGlmIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNMb2FkZWQgYW5kIERhdGFNYW5hZ2VyLmRvY3VtZW50c0xvYWRlZFxuICAgICAgICAgICAgQG9iamVjdC5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBHcmFwaGljcy5mcm96ZW4gYW5kIEBvYmplY3QucHJlcGFyaW5nXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBAbG9hZGluZ1NjcmVlblZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkaW5nU2NyZWVuVmlzaWJsZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmxvYWRlZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUNvbnRlbnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgR3JhcGhpY3MuZnJvemVuIHRoZW4gR3JhcGhpY3MuZnJlZXplKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjbGVhckxvYWRpbmdTY3JlZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5sb2FkZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3Quc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgQHByZXBhcmVWaXN1YWwoKSBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkaW5nU2NyZWVuVmlzaWJsZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXQudXBkYXRlKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBjbGVhckxvYWRpbmdTY3JlZW4oKVxuICAgICAgICAgICAgICAgICAgICBpZiBAb2JqZWN0LnByZXBhcmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5wcmVwYXJpbmcgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQHN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUNvbnRlbnQoKSBpZiAhR3JhcGhpY3MuZnJvemVuXG4gICAgICAgICAgICAgICAgICAgIElucHV0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBsb2FkaW5nU2NyZWVuVmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgIElucHV0LnVwZGF0ZSgpXG4gICAgICAgICAgICBAbG9hZGluZygpXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X1NjZW5lQmVoYXZpb3IgPSBDb21wb25lbnRfU2NlbmVCZWhhdmlvciJdfQ==
//# sourceURL=Component_SceneBehavior_14.js