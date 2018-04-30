var GameTemp;

GameTemp = (function() {

  /**
  * The GameTemp holds the temporary data of the currently running game like currently displayed
  * choices, choice timer, etc. The GameTemp is written to the save-game as well.
  *
  * @module gs
  * @class GameTemp
  * @memberof gs
  * @constructor
  * @param {Object} data - An optional data-bundle to initialize the game-temp from.
   */
  function GameTemp(data) {

    /**
    * Stores the current choice timer.
    *
    * @property choiceTimer
    * @type gs.Object_Timer
     */
    this.choiceTimer = null;
    this.restore(data);
  }


  /**
  * Stores the current choices.
  *
  * @property choices
  * @type Object[]
   */

  GameTemp.accessors("choices", {
    set: function(choices) {
      return SceneManager.scene.choices = choices;
    },
    get: function() {
      return SceneManager.scene.choices;
    }
  });


  /**
  * Serializes the game-temp into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} A data-bundle which can be serialized to JSON.
   */

  GameTemp.prototype.toDataBundle = function() {
    var bundle, ref;
    bundle = {};
    Object.mixin(bundle, this);
    bundle.choiceTimer = (ref = this.choiceTimer) != null ? ref.toDataBundle() : void 0;
    return bundle;
  };


  /**
  * Restores the game-temp from a data-bundle.
  *
  * @method restore
  * @param {Object} data - A data-bundle to restore the game-temp from.
   */

  GameTemp.prototype.restore = function(data) {
    if (!data) {
      return;
    }
    Object.mixin(this, data);
    if (data.choiceTimer) {
      return this.choiceTimer = new gs.Object_Timer(data.choiceTimer);
    }
  };


  /**
  * Clears the game temp.
  *
  * @method clear
   */

  GameTemp.prototype.clear = function() {
    return Object.keys(this).forEach((function(_this) {
      return function(x) {
        return delete _this[x];
      };
    })(this));
  };

  return GameTemp;

})();

gs.GameTemp = GameTemp;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7Ozs7RUFVYSxrQkFBQyxJQUFEOztBQUNUOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRWYsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFUO0VBVFM7OztBQVdiOzs7Ozs7O0VBTUEsUUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxPQUFEO2FBQWEsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFuQixHQUE2QjtJQUExQyxDQUFMO0lBQ0EsR0FBQSxFQUFLLFNBQUE7YUFBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBQXRCLENBREw7R0FESjs7O0FBSUE7Ozs7Ozs7cUJBTUEsWUFBQSxHQUFjLFNBQUE7QUFDVixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLEtBQVAsQ0FBYSxNQUFiLEVBQXFCLElBQXJCO0lBRUEsTUFBTSxDQUFDLFdBQVAseUNBQWlDLENBQUUsWUFBZCxDQUFBO0FBRXJCLFdBQU87RUFORzs7O0FBUWQ7Ozs7Ozs7cUJBTUEsT0FBQSxHQUFTLFNBQUMsSUFBRDtJQUNMLElBQUcsQ0FBQyxJQUFKO0FBQWMsYUFBZDs7SUFFQSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsRUFBbUIsSUFBbkI7SUFFQSxJQUFHLElBQUksQ0FBQyxXQUFSO2FBQ0ksSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFnQixJQUFJLENBQUMsV0FBckIsRUFEdkI7O0VBTEs7OztBQVFUOzs7Ozs7cUJBS0EsS0FBQSxHQUFPLFNBQUE7V0FDSCxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLE9BQU8sS0FBSyxDQUFBLENBQUE7TUFBbkI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0VBREc7Ozs7OztBQUdYLEVBQUUsQ0FBQyxRQUFILEdBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IEdhbWVUZW1wXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBHYW1lVGVtcFxuICAgICMjIypcbiAgICAqIFRoZSBHYW1lVGVtcCBob2xkcyB0aGUgdGVtcG9yYXJ5IGRhdGEgb2YgdGhlIGN1cnJlbnRseSBydW5uaW5nIGdhbWUgbGlrZSBjdXJyZW50bHkgZGlzcGxheWVkXG4gICAgKiBjaG9pY2VzLCBjaG9pY2UgdGltZXIsIGV0Yy4gVGhlIEdhbWVUZW1wIGlzIHdyaXR0ZW4gdG8gdGhlIHNhdmUtZ2FtZSBhcyB3ZWxsLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBHYW1lVGVtcFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gQW4gb3B0aW9uYWwgZGF0YS1idW5kbGUgdG8gaW5pdGlhbGl6ZSB0aGUgZ2FtZS10ZW1wIGZyb20uXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIHRoZSBjdXJyZW50IGNob2ljZSB0aW1lci5cbiAgICAgICAgKlxuICAgICAgICAqIEBwcm9wZXJ0eSBjaG9pY2VUaW1lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9UaW1lclxuICAgICAgICAjIyMgXG4gICAgICAgIEBjaG9pY2VUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIEByZXN0b3JlKGRhdGEpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFN0b3JlcyB0aGUgY3VycmVudCBjaG9pY2VzLlxuICAgICpcbiAgICAqIEBwcm9wZXJ0eSBjaG9pY2VzXG4gICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICMjIyBcbiAgICBAYWNjZXNzb3JzIFwiY2hvaWNlc1wiLCBcbiAgICAgICAgc2V0OiAoY2hvaWNlcykgLT4gU2NlbmVNYW5hZ2VyLnNjZW5lLmNob2ljZXMgPSBjaG9pY2VzXG4gICAgICAgIGdldDogLT4gU2NlbmVNYW5hZ2VyLnNjZW5lLmNob2ljZXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgZ2FtZS10ZW1wIGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIGRhdGEtYnVuZGxlIHdoaWNoIGNhbiBiZSBzZXJpYWxpemVkIHRvIEpTT04uXG4gICAgIyMjIFxuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgYnVuZGxlID0ge31cbiAgICAgICAgT2JqZWN0Lm1peGluKGJ1bmRsZSwgdGhpcylcbiAgICBcbiAgICAgICAgYnVuZGxlLmNob2ljZVRpbWVyID0gQGNob2ljZVRpbWVyPy50b0RhdGFCdW5kbGUoKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJ1bmRsZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgZ2FtZS10ZW1wIGZyb20gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gQSBkYXRhLWJ1bmRsZSB0byByZXN0b3JlIHRoZSBnYW1lLXRlbXAgZnJvbS5cbiAgICAjIyMgICAgIFxuICAgIHJlc3RvcmU6IChkYXRhKSAtPlxuICAgICAgICBpZiAhZGF0YSB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgT2JqZWN0Lm1peGluKHRoaXMsIGRhdGEpXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhLmNob2ljZVRpbWVyXG4gICAgICAgICAgICBAY2hvaWNlVGltZXIgPSBuZXcgZ3MuT2JqZWN0X1RpbWVyKGRhdGEuY2hvaWNlVGltZXIpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgdGhlIGdhbWUgdGVtcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgIyMjIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoICh4KSA9PiBkZWxldGUgdGhpc1t4XVxuXG5ncy5HYW1lVGVtcCA9IEdhbWVUZW1wIl19
//# sourceURL=GameTemp_33.js