var Component_FormulaHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_FormulaHandler = (function(superClass) {
  extend(Component_FormulaHandler, superClass);


  /**
  * A formula-handler component allows a UI game object to execute
  * formulas.<br><br>
  *
  * For more information, take a look
  * into the "In Game UI System" section of the help-file.
  * 
  * @module ui
  * @class Component_BindingHandler
  * @extends ui.Component_Handler
  * @memberof ui
  * @constructor
   */

  function Component_FormulaHandler() {
    this.breakChainAt = null;
  }


  /**
  * Initializes the binding-handler.
  * 
  * @method setup
   */

  Component_FormulaHandler.prototype.setup = function() {
    return this.object.events.on("uiPrepareFinish", ((function(_this) {
      return function(e) {
        var formula, i, len, ref, results;
        ref = _this.object.formulas;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          formula = ref[i];
          if (formula.events.contains("uiPrepareFinish")) {
            window.o = _this.object;
            window.d = _this.object.data[0];
            results.push(formula.exec());
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this)));
  };


  /**
  * Updates the binding-handler.
  * 
  * @method update
   */

  Component_FormulaHandler.prototype.update = function() {
    var formula, i, len, ref;
    ref = this.object.formulas;
    for (i = 0, len = ref.length; i < len; i++) {
      formula = ref[i];
      this.executeFormula(formula);
    }
    this.object.initialized = true;
    return null;
  };

  Component_FormulaHandler.prototype.executeFormula = function(formula) {
    if (this.checkObject(formula)) {
      window.o = this.object;
      window.d = this.object.data[0];
      return formula.exec();
    }
  };

  Component_FormulaHandler.executeFormula = function(object, formula) {
    window.o = object;
    window.d = object.data[0];
    return formula.exec();
  };


  /**
  * Evaluates a specified property-path and returns the result.
  * 
  * @method fieldValue
  * @param {string} path - A property-path.
  * @return {Object} The value of the property-path.
   */

  Component_FormulaHandler.prototype.fieldValue = function(path) {
    return ui.FormulaHandler.fieldValue(this.object, path);
  };


  /**
  * Evaluates a property-path on a specified object and returns the result.
  * 
  * @method fieldValue
  * @static
  * @param {Object} object - An object to evaluate the property-path on.
  * @param {string} path - A property-path.
  * @return {Object} The value of the property-path.
   */

  Component_FormulaHandler.fieldValue = function(object, path, readOnly) {
    var ref, value;
    if (typeof (path != null ? path.exec : void 0) === "function") {
      window.o = object;
      window.d = object != null ? (ref = object.data) != null ? ref[0] : void 0 : void 0;
      value = path.exec();
      return value != null ? value : 0;
    } else {
      return path;
    }
  };

  return Component_FormulaHandler;

})(ui.Component_Handler);

ui.Component_FormulaHandler = Component_FormulaHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsd0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7RUFhYSxrQ0FBQTtJQUNULElBQUMsQ0FBQSxZQUFELEdBQWdCO0VBRFA7OztBQUdiOzs7Ozs7cUNBS0EsS0FBQSxHQUFPLFNBQUE7V0FDSCxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLGlCQUFsQixFQUFxQyxDQUFDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO0FBQ2xDLFlBQUE7QUFBQTtBQUFBO2FBQUEscUNBQUE7O1VBQ0ksSUFBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQWYsQ0FBd0IsaUJBQXhCLENBQUg7WUFDSSxNQUFNLENBQUMsQ0FBUCxHQUFXLEtBQUMsQ0FBQTtZQUNaLE1BQU0sQ0FBQyxDQUFQLEdBQVcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQTt5QkFDeEIsT0FBTyxDQUFDLElBQVIsQ0FBQSxHQUhKO1dBQUEsTUFBQTtpQ0FBQTs7QUFESjs7TUFEa0M7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBckM7RUFERzs7O0FBU1A7Ozs7OztxQ0FLQSxNQUFBLEdBQVEsU0FBQTtBQUNKLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBaEI7QUFESjtJQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQjtBQUV0QixXQUFPO0VBTkg7O3FDQVFSLGNBQUEsR0FBZ0IsU0FBQyxPQUFEO0lBQ1osSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQWIsQ0FBSDtNQUNJLE1BQU0sQ0FBQyxDQUFQLEdBQVcsSUFBQyxDQUFBO01BQ1osTUFBTSxDQUFDLENBQVAsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUssQ0FBQSxDQUFBO2FBQ3hCLE9BQU8sQ0FBQyxJQUFSLENBQUEsRUFISjs7RUFEWTs7RUFNaEIsd0JBQUMsQ0FBQSxjQUFELEdBQWlCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7SUFDYixNQUFNLENBQUMsQ0FBUCxHQUFXO0lBQ1gsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFNLENBQUMsSUFBSyxDQUFBLENBQUE7V0FDdkIsT0FBTyxDQUFDLElBQVIsQ0FBQTtFQUhhOzs7QUFLakI7Ozs7Ozs7O3FDQU9BLFVBQUEsR0FBWSxTQUFDLElBQUQ7V0FBVSxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQWxCLENBQTZCLElBQUMsQ0FBQSxNQUE5QixFQUFzQyxJQUF0QztFQUFWOzs7QUFFWjs7Ozs7Ozs7OztFQVNBLHdCQUFDLENBQUEsVUFBRCxHQUFhLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxRQUFmO0FBQ1QsUUFBQTtJQUFBLElBQUcsT0FBTyxnQkFBQyxJQUFJLENBQUUsYUFBUCxDQUFQLEtBQXVCLFVBQTFCO01BQ0ksTUFBTSxDQUFDLENBQVAsR0FBVztNQUNYLE1BQU0sQ0FBQyxDQUFQLHFEQUF5QixDQUFBLENBQUE7TUFDekIsS0FBQSxHQUFRLElBQUksQ0FBQyxJQUFMLENBQUE7QUFFUiw2QkFBTyxRQUFRLEVBTG5CO0tBQUEsTUFBQTtBQU9JLGFBQU8sS0FQWDs7RUFEUzs7OztHQXpFc0IsRUFBRSxDQUFDOztBQW1GMUMsRUFBRSxDQUFDLHdCQUFILEdBQThCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfRm9ybXVsYUhhbmRsZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9Gb3JtdWxhSGFuZGxlciBleHRlbmRzIHVpLkNvbXBvbmVudF9IYW5kbGVyXG4gICAgIyMjKlxuICAgICogQSBmb3JtdWxhLWhhbmRsZXIgY29tcG9uZW50IGFsbG93cyBhIFVJIGdhbWUgb2JqZWN0IHRvIGV4ZWN1dGVcbiAgICAqIGZvcm11bGFzLjxicj48YnI+XG4gICAgKlxuICAgICogRm9yIG1vcmUgaW5mb3JtYXRpb24sIHRha2UgYSBsb29rXG4gICAgKiBpbnRvIHRoZSBcIkluIEdhbWUgVUkgU3lzdGVtXCIgc2VjdGlvbiBvZiB0aGUgaGVscC1maWxlLlxuICAgICogXG4gICAgKiBAbW9kdWxlIHVpXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0JpbmRpbmdIYW5kbGVyXG4gICAgKiBAZXh0ZW5kcyB1aS5Db21wb25lbnRfSGFuZGxlclxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgQGJyZWFrQ2hhaW5BdCA9IG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGJpbmRpbmctaGFuZGxlci5cbiAgICAqIFxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vbiBcInVpUHJlcGFyZUZpbmlzaFwiLCAoKGUpID0+XG4gICAgICAgICAgICBmb3IgZm9ybXVsYSBpbiBAb2JqZWN0LmZvcm11bGFzXG4gICAgICAgICAgICAgICAgaWYgZm9ybXVsYS5ldmVudHMuY29udGFpbnMoXCJ1aVByZXBhcmVGaW5pc2hcIilcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm8gPSBAb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kID0gQG9iamVjdC5kYXRhWzBdXG4gICAgICAgICAgICAgICAgICAgIGZvcm11bGEuZXhlYygpXG4gICAgICAgIClcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYmluZGluZy1oYW5kbGVyLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgZm9yIGZvcm11bGEgaW4gQG9iamVjdC5mb3JtdWxhc1xuICAgICAgICAgICAgQGV4ZWN1dGVGb3JtdWxhKGZvcm11bGEpXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LmluaXRpYWxpemVkID0geWVzXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICBcbiAgICBleGVjdXRlRm9ybXVsYTogKGZvcm11bGEpIC0+IFxuICAgICAgICBpZiBAY2hlY2tPYmplY3QoZm9ybXVsYSlcbiAgICAgICAgICAgIHdpbmRvdy5vID0gQG9iamVjdFxuICAgICAgICAgICAgd2luZG93LmQgPSBAb2JqZWN0LmRhdGFbMF1cbiAgICAgICAgICAgIGZvcm11bGEuZXhlYygpXG4gICAgICAgICAgICBcbiAgICBAZXhlY3V0ZUZvcm11bGE6IChvYmplY3QsIGZvcm11bGEpIC0+XG4gICAgICAgIHdpbmRvdy5vID0gb2JqZWN0XG4gICAgICAgIHdpbmRvdy5kID0gb2JqZWN0LmRhdGFbMF1cbiAgICAgICAgZm9ybXVsYS5leGVjKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBFdmFsdWF0ZXMgYSBzcGVjaWZpZWQgcHJvcGVydHktcGF0aCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICAgICogXG4gICAgKiBAbWV0aG9kIGZpZWxkVmFsdWVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gQSBwcm9wZXJ0eS1wYXRoLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5LXBhdGguXG4gICAgIyMjIFxuICAgIGZpZWxkVmFsdWU6IChwYXRoKSAtPiB1aS5Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKEBvYmplY3QsIHBhdGgpICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBFdmFsdWF0ZXMgYSBwcm9wZXJ0eS1wYXRoIG9uIGEgc3BlY2lmaWVkIG9iamVjdCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICAgICogXG4gICAgKiBAbWV0aG9kIGZpZWxkVmFsdWVcbiAgICAqIEBzdGF0aWNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBBbiBvYmplY3QgdG8gZXZhbHVhdGUgdGhlIHByb3BlcnR5LXBhdGggb24uXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIEEgcHJvcGVydHktcGF0aC5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS1wYXRoLlxuICAgICMjIyBcbiAgICBAZmllbGRWYWx1ZTogKG9iamVjdCwgcGF0aCwgcmVhZE9ubHkpIC0+XG4gICAgICAgIGlmIHR5cGVvZiAocGF0aD8uZXhlYykgPT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICB3aW5kb3cubyA9IG9iamVjdFxuICAgICAgICAgICAgd2luZG93LmQgPSBvYmplY3Q/LmRhdGE/WzBdXG4gICAgICAgICAgICB2YWx1ZSA9IHBhdGguZXhlYygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHBhdGhcbiAgICAgXG51aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIgPSBDb21wb25lbnRfRm9ybXVsYUhhbmRsZXIiXX0=
//# sourceURL=Component_FormulaHandler_114.js