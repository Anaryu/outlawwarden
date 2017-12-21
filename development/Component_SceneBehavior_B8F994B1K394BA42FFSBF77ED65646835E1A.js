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
  * Called once per frame while a scene is loading. Can be used to display
  * loading-message/animation.
  *
  * @method loading
   */

  Component_SceneBehavior.prototype.loading = function() {
    if (this.loadingBackgroundSprite == null) {
      this.loadingBackgroundSprite = {};
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
            this.object.loaded = true;
            this.object.setup();
            this.prepareVisual();
            this.loadingScreenVisible = false;
            Graphics.update();
            return Input.update();
          }
        } else {
          if (this.object.preparing) {
            this.object.preparing = false;
            this.start();
          }
          Graphics.update();
          this.updateContent();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsdUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLGlDQUFBO0lBQ1QsdURBQUE7SUFFQSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7RUFIZjs7O0FBS2I7Ozs7Ozs7b0NBTUEsVUFBQSxHQUFZLFNBQUEsR0FBQTs7O0FBRVo7Ozs7OztvQ0FLQSxPQUFBLEdBQVMsU0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFHLENBQUksV0FBVyxDQUFDLGFBQW5CO01BQ0ksZUFBZSxDQUFDLE9BQWhCLENBQUEsRUFESjs7bURBRWMsQ0FBRSxJQUFoQixDQUFxQixTQUFyQixFQUFnQyxJQUFDLENBQUEsTUFBakM7RUFISzs7O0FBTVQ7Ozs7Ozs7b0NBTUEsS0FBQSxHQUFPLFNBQUEsR0FBQTs7O0FBRVA7Ozs7Ozs7b0NBTUEsYUFBQSxHQUFlLFNBQUEsR0FBQTs7O0FBRWY7Ozs7Ozs7b0NBTUEsV0FBQSxHQUFhLFNBQUEsR0FBQTs7O0FBRWI7Ozs7Ozs7O29DQU9BLGlCQUFBLEdBQW1CLFNBQUMsY0FBRDtBQUNmLFFBQUE7SUFBQSwwRUFBMEIsQ0FBRSxJQUFJLENBQUMseUJBQTlCLEdBQXVDLENBQTFDO2FBQ0ksZUFBZSxDQUFDLFNBQWhCLENBQTBCLGlCQUFBLEdBQWtCLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBbkUsRUFESjs7RUFEZTs7O0FBSW5COzs7Ozs7OztvQ0FPQSxVQUFBLEdBQVksU0FBQyxjQUFEO0FBQ1IsUUFBQTtJQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7YUFDSSxRQUFRLENBQUMsVUFBVCxDQUFvQixDQUFwQixFQURKO0tBQUEsTUFBQTtNQUdJLGNBQUEsR0FBaUIsY0FBQSxJQUFrQixZQUFZLENBQUM7TUFDaEQsMEVBQTBCLENBQUUsSUFBSSxDQUFDLHlCQUE5QixHQUF1QyxDQUExQztlQUNJLFFBQVEsQ0FBQyxVQUFULENBQW9C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Q0FBQyxNQUFOLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBaENKOztFQWRJOzs7O0dBOUcwQixFQUFFLENBQUM7O0FBaUt6QyxFQUFFLENBQUMsdUJBQUgsR0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfU2NlbmVCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9Db250YWluZXJcbiAgICAjIyMqXG4gICAgKiBUaGUgYmFzZSBjbGFzcyBvZiBhbGwgc2NlbmUtYmVoYXZpb3IgY29tcG9uZW50cy4gQSBzY2VuZS1iZWhhdmlvciBjb21wb25lbnRcbiAgICAqIGRlZmluZSB0aGUgbG9naWMgb2YgYSBzaW5nbGUgZ2FtZSBzY2VuZS4gXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfQ29udGFpbmVyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0gbm9cblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBzY2VuZS4gXG4gICAgKlxuICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyNcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjIyAgXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5kaXNwb3NlKClcbiAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJkaXNwb3NlXCIsIEBvYmplY3QpXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGUgcHJlcGFyYXRpb24gYW5kIHRyYW5zaXRpb25cbiAgICAqIGlzIGRvbmUgYW5kIHRoZSBpcyByZWFkeSB0byBzdGFydC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgIyMjICBcbiAgICBzdGFydDogLT5cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIHZpc3VhbCBnYW1lIG9iamVjdCBmb3IgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVZpc3VhbFxuICAgICogQGFic3RyYWN0XG4gICAgIyMjICBcbiAgICBwcmVwYXJlVmlzdWFsOiAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgZGF0YSBmb3IgdGhlIHNjZW5lIGFuZCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGdyYXBoaWMgYW5kIGF1ZGlvIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVEYXRhXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyMgXG4gICAgcHJlcGFyZURhdGE6IC0+XG4gICAgIFxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGZvciBhIHNjcmVlbi10cmFuc2l0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVRyYW5zaXRpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFuc2l0aW9uRGF0YSAtIE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGhlIHRyYW5zaXRpb24gXG4gICAgKiBsaWtlIGdyYXBoaWMsIGR1cmF0aW9uIGFuZCB2YWd1ZS5cbiAgICAjIyMgICAgXG4gICAgcHJlcGFyZVRyYW5zaXRpb246ICh0cmFuc2l0aW9uRGF0YSkgLT5cbiAgICAgICAgaWYgdHJhbnNpdGlvbkRhdGE/LmdyYXBoaWM/Lm5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7dHJhbnNpdGlvbkRhdGEuZ3JhcGhpYy5uYW1lfVwiKVxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGEgc2NyZWVuLXRyYW5zaXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCB0cmFuc2l0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdHJhbnNpdGlvbkRhdGEgLSBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgZm9yIHRoZSB0cmFuc2l0aW9uIFxuICAgICogbGlrZSBncmFwaGljLCBkdXJhdGlvbiBhbmQgdmFndWUuXG4gICAgIyMjICAgICAgICAgXG4gICAgdHJhbnNpdGlvbjogKHRyYW5zaXRpb25EYXRhKSAtPlxuICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXdcbiAgICAgICAgICAgIEdyYXBoaWNzLnRyYW5zaXRpb24oMClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJhbnNpdGlvbkRhdGEgPSB0cmFuc2l0aW9uRGF0YSB8fCBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGFcbiAgICAgICAgICAgIGlmIHRyYW5zaXRpb25EYXRhPy5ncmFwaGljPy5uYW1lLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKHRyYW5zaXRpb25EYXRhLmR1cmF0aW9uLCBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvTWFza3MvI3t0cmFuc2l0aW9uRGF0YS5ncmFwaGljLm5hbWV9XCIpLCB0cmFuc2l0aW9uRGF0YS52YWd1ZSB8fCAzMClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKHRyYW5zaXRpb25EYXRhLmR1cmF0aW9uKVxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZSB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICogQGFic3RyYWN0XG4gICAgIyMjICAgICAgICAgXG4gICAgdXBkYXRlQ29udGVudDogLT5cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgb25jZSBwZXIgZnJhbWUgd2hpbGUgYSBzY2VuZSBpcyBsb2FkaW5nLiBDYW4gYmUgdXNlZCB0byBkaXNwbGF5XG4gICAgKiBsb2FkaW5nLW1lc3NhZ2UvYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZGluZ1xuICAgICMjIyBcbiAgICBsb2FkaW5nOiAtPlxuICAgICAgICBpZiBub3QgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlP1xuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlID0ge31cbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLmZyb3plbiB0aGVuIEB0cmFuc2l0aW9uKHsgZHVyYXRpb246IDAgfSlcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZSB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBpZiBEYXRhTWFuYWdlci5kb2N1bWVudHNMb2FkZWRcbiAgICAgICAgICAgIGlmIEBvYmplY3QubG9hZGluZ0RhdGEgYW5kIG5vdCBAb2JqZWN0LmluaXRpYWxpemVkIHRoZW4gQHByZXBhcmVEYXRhKClcbiAgICAgICAgICAgIEBvYmplY3QubG9hZGluZ0RhdGEgPSAhRGF0YU1hbmFnZXIuZG9jdW1lbnRzTG9hZGVkXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQG9iamVjdC5sb2FkaW5nRGF0YSBhbmQgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0xvYWRlZFxuICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkaW5nUmVzb3VyY2VzIGFuZCBub3QgQG9iamVjdC5pbml0aWFsaXplZFxuICAgICAgICAgICAgICAgIGlmIG5vdCBAbG9hZGluZ1NjcmVlblZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgQHByZXBhcmVWaXN1YWwoKSBcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmluaXRpYWxpemVkID0geWVzXG4gICAgICAgICAgICBAb2JqZWN0LmxvYWRpbmdSZXNvdXJjZXMgPSBmYWxzZVxuICAgIFxuICAgICAgICBpZiBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzTG9hZGVkIGFuZCBEYXRhTWFuYWdlci5kb2N1bWVudHNMb2FkZWRcbiAgICAgICAgICAgIEBvYmplY3QubG9hZGluZyA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgR3JhcGhpY3MuZnJvemVuIGFuZCBAb2JqZWN0LnByZXBhcmluZ1xuICAgICAgICAgICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgQGxvYWRpbmdTY3JlZW5WaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgIGlmIEBvYmplY3QubG9hZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9hZGluZ1NjcmVlblZpc2libGUgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5sb2FkZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVDb250ZW50KClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IEdyYXBoaWNzLmZyb3plbiB0aGVuIEdyYXBoaWNzLmZyZWV6ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmxvYWRlZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5zZXR1cCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBAcHJlcGFyZVZpc3VhbCgpIFxuICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC51cGRhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgQG9iamVjdC5wcmVwYXJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QucHJlcGFyaW5nID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBzdGFydCgpXG4gICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGVDb250ZW50KClcbiAgICAgICAgICAgICAgICAgICAgSW5wdXQudXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0geWVzXG4gICAgICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICAgICAgSW5wdXQudXBkYXRlKClcbiAgICAgICAgICAgIEBsb2FkaW5nKClcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG5ncy5Db21wb25lbnRfU2NlbmVCZWhhdmlvciA9IENvbXBvbmVudF9TY2VuZUJlaGF2aW9yIl19
//# sourceURL=Component_SceneBehavior_14.js