var Component_Animation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Animation = (function(superClass) {
  extend(Component_Animation, superClass);


  /**
  * The base-class of all animation components. An animation-component
  * executes a certain animation on a game object. The type of the animation depends
  * on the component. <br>
  * <br>
  * In regular, animation components a used together with the gs.Component_Animator
  * component.
  *
  * @module gs
  * @class Component_Animation
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_Animation() {
    Component_Animation.__super__.constructor.apply(this, arguments);
    this.name = "animation";
  }


  /**
  * Updates the animation. 
  *
  * @method update
   */

  Component_Animation.prototype.update = function() {
    return this.object.needsFullUpdate = true;
  };


  /**
  * Skips the animation. That is used to skip an animation if the user
  * wants to skip very fast through a visual novel scene.
  *
  * @method skip
   */

  Component_Animation.prototype.skip = function() {
    var ref;
    if (((ref = this.easing) != null ? ref.duration : void 0) > GameManager.tempSettings.skipTime) {
      if (GameManager.tempSettings.skipTime === 0) {
        return this.easing.time = this.easing.duration;
      } else {
        this.easing.duration = GameManager.tempSettings.skipTime;
        return this.easing.time = 0;
      }
    }
  };


  /**
  * Indicates if instant-skipping is enabled. In that case, there shouldn't be any delay and animation
  * must finish immediately and call its callback. It is mostly used for live-preview purposes.
  *
  * @method isInstantSkip
  * @return {boolean} If <b>true</b>, instant-skipping is enabled. Otherwise <b>false</b>.
   */

  Component_Animation.prototype.isInstantSkip = function() {
    return GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0;
  };

  return Component_Animation;

})(gs.Component);

gs.Component_Animation = Component_Animation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsbUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7O0VBY2EsNkJBQUE7SUFDVCxzREFBQSxTQUFBO0lBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTtFQUhDOzs7QUFLYjs7Ozs7O2dDQUtBLE1BQUEsR0FBUSxTQUFBO1dBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLEdBQTBCO0VBRHRCOzs7QUFHUjs7Ozs7OztnQ0FNQSxJQUFBLEdBQU0sU0FBQTtBQUNGLFFBQUE7SUFBQSxzQ0FBVSxDQUFFLGtCQUFULEdBQW9CLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBaEQ7TUFDSSxJQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBekIsS0FBcUMsQ0FBeEM7ZUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBRDNCO09BQUEsTUFBQTtRQUdJLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQixXQUFXLENBQUMsWUFBWSxDQUFDO2VBQzVDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixHQUFlLEVBSm5CO09BREo7O0VBREU7OztBQVFOOzs7Ozs7OztnQ0FPQSxhQUFBLEdBQWUsU0FBQTtXQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBekIsSUFBa0MsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUF6QixLQUFxQztFQUExRTs7OztHQWpEZSxFQUFFLENBQUM7O0FBb0RyQyxFQUFFLENBQUMsbUJBQUgsR0FBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9BbmltYXRpb25cbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9BbmltYXRpb24gZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBUaGUgYmFzZS1jbGFzcyBvZiBhbGwgYW5pbWF0aW9uIGNvbXBvbmVudHMuIEFuIGFuaW1hdGlvbi1jb21wb25lbnRcbiAgICAqIGV4ZWN1dGVzIGEgY2VydGFpbiBhbmltYXRpb24gb24gYSBnYW1lIG9iamVjdC4gVGhlIHR5cGUgb2YgdGhlIGFuaW1hdGlvbiBkZXBlbmRzXG4gICAgKiBvbiB0aGUgY29tcG9uZW50LiA8YnI+XG4gICAgKiA8YnI+XG4gICAgKiBJbiByZWd1bGFyLCBhbmltYXRpb24gY29tcG9uZW50cyBhIHVzZWQgdG9nZXRoZXIgd2l0aCB0aGUgZ3MuQ29tcG9uZW50X0FuaW1hdG9yXG4gICAgKiBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9BbmltYXRpb25cbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBuYW1lID0gXCJhbmltYXRpb25cIlxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGFuaW1hdGlvbi4gXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICAgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBAb2JqZWN0Lm5lZWRzRnVsbFVwZGF0ZSA9IHllc1xuICAgICBcbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgYW5pbWF0aW9uLiBUaGF0IGlzIHVzZWQgdG8gc2tpcCBhbiBhbmltYXRpb24gaWYgdGhlIHVzZXJcbiAgICAqIHdhbnRzIHRvIHNraXAgdmVyeSBmYXN0IHRocm91Z2ggYSB2aXN1YWwgbm92ZWwgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwXG4gICAgIyMjICAgIFxuICAgIHNraXA6IC0+XG4gICAgICAgIGlmIEBlYXNpbmc/LmR1cmF0aW9uID4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPT0gMFxuICAgICAgICAgICAgICAgIEBlYXNpbmcudGltZSA9IEBlYXNpbmcuZHVyYXRpb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZWFzaW5nLmR1cmF0aW9uID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICAgICAgQGVhc2luZy50aW1lID0gMFxuICAgIFxuICAgICMjIypcbiAgICAqIEluZGljYXRlcyBpZiBpbnN0YW50LXNraXBwaW5nIGlzIGVuYWJsZWQuIEluIHRoYXQgY2FzZSwgdGhlcmUgc2hvdWxkbid0IGJlIGFueSBkZWxheSBhbmQgYW5pbWF0aW9uXG4gICAgKiBtdXN0IGZpbmlzaCBpbW1lZGlhdGVseSBhbmQgY2FsbCBpdHMgY2FsbGJhY2suIEl0IGlzIG1vc3RseSB1c2VkIGZvciBsaXZlLXByZXZpZXcgcHVycG9zZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBpc0luc3RhbnRTa2lwXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSBJZiA8Yj50cnVlPC9iPiwgaW5zdGFudC1za2lwcGluZyBpcyBlbmFibGVkLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICMjIyAgICAgICAgICAgICAgICBcbiAgICBpc0luc3RhbnRTa2lwOiAtPiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCBhbmQgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID09IDBcbiAgICAgICAgXG4gICAgXG5ncy5Db21wb25lbnRfQW5pbWF0aW9uID0gQ29tcG9uZW50X0FuaW1hdGlvbiJdfQ==
//# sourceURL=Component_Animation_12.js