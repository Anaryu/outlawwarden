var Object_Scene,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Scene = (function(superClass) {
  extend(Object_Scene, superClass);

  Object_Scene.accessors("visible", {
    set: function(v) {
      if (v !== this.visible_) {
        this.visible_ = v;
        this.needsUpdate = true;
        return this.fullRefresh();
      }
    },
    get: function() {
      return this.visible_ && (!this.parent || this.parent.visible);
    }
  });


  /**
  * A scene object manages a whole visual novel scene with backgrounds, characters,
  * messages, etc.
  *
  * @module vn
  * @class Object_Scene
  * @extends gs.Object_Base
  * @memberof vn
  * @constructor
   */

  function Object_Scene() {
    Object_Scene.__super__.constructor.call(this);

    /**
    * Indicates that the scene is still in prepare-state and not ready yet.
    * @property preparing
    * @type boolean
     */
    this.preparing = true;

    /**
    * The behavior-component for the VN scene specific behavior.
    * @property behavior
    * @type gs.Component_GameSceneBehavior
     */
    this.behavior = new vn.Component_GameSceneBehavior();

    /**
    * An interpreter to execute the commands of scene.
    * @property interpreter
    * @type gs.Component_CommandInterpreter
     */
    this.interpreter = new gs.Component_CommandInterpreter();

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.Component_EventEmitter();

    /**
    * Contains all background objects of the scene.
    * @property backgroundContainer
    * @type gs.Object_Container
     */
    this.backgroundContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all character objects of the scene.
    * @property characterContainer
    * @type gs.Object_Container
     */
    this.characterContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.REMOVE);

    /**
    * Contains all picture objects of the scene.
    * @property pictureContainer
    * @type gs.Object_Container
     */
    this.pictureContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all video objects of the scene.
    * @property videoContainer
    * @type gs.Object_Container
     */
    this.videoContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all text objects of the scene.
    * @property textContainer
    * @type gs.Object_Container
     */
    this.textContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all hotspot objects of the scene.
    * @property hotspotContainer
    * @type gs.Object_Container
     */
    this.hotspotContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all common events which are running parallel/auto to the scene.
    * @property commonEventContainer
    * @type gs.Object_Container
     */
    this.commonEventContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all viewports which are used to create multi-layered screen effects.
    * @property viewportContainer
    * @type gs.Object_Container
     */
    this.viewportContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.REMOVE);

    /**
    * Contains all interval timers.
    * @property timerContainer
    * @type gs.Object_Container
     */
    this.timerContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all message areas of the scene.
    * @property messageAreaContainer
    * @type gs.Object_Container
     */
    this.messageAreaContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);
    this.characterContainer.visible = true;

    /**
    * All picture objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property pictures
    * @type gs.Object_Picture[]
    * @readOnly
     */
    this.pictures = this.pictureContainer.subObjects;

    /**
    * All video objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property videos
    * @type gs.Object_Video[]
    * @readOnly
     */
    this.videos = this.videoContainer.subObjects;

    /**
    * All text objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property texts
    * @type gs.Object_Text[]
    * @readOnly
     */
    this.texts = this.textContainer.subObjects;

    /**
    * All character objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property characters
    * @type gs.Object_Character[]
    * @readOnly
     */
    this.characters = this.characterContainer.subObjects;

    /**
    * All backgrounds as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property backgrounds
    * @type gs.Object_Background[]
    * @readOnly
     */
    this.backgrounds = this.backgroundContainer.subObjects;

    /**
    * All hotspot objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property hotspots
    * @type gs.Object_Hotspot[]
    * @readOnly
     */
    this.hotspots = this.hotspotContainer.subObjects;

    /**
    * All interval timer objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property timers
    * @type gs.Object_IntervalTimer[]
    * @readOnly
     */
    this.timers = this.timerContainer.subObjects;

    /**
    * All message areas as array.
    * @property messageAreas
    * @type vn.MessageArea[]
    * @readOnly
     */
    this.messageAreas = this.messageAreaContainer.subObjects;

    /**
    * A timer object used for choices with time-limit.
    * @property choiceTimer
    * @type gs.Object_Timer
     */
    this.choiceTimer = new gs.Object_Timer();

    /**
    * Indicates if the UI layout is visible.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * @property visible_
    * @type boolean
    * @protected
     */
    this.visible_ = true;

    /**
    * The game settings.
    * @property settings
    * @type Object
     */
    this.settings = GameManager.settings;

    /**
    * Temporary settings like skip, etc.
    * @property tempSettings
    * @type Object
     */
    this.tempSettings = GameManager.settings;

    /**
    * Contains all data necessary to construct the scene.
    * @property sceneData
    * @type Object
     */
    this.sceneData = GameManager.sceneData;
    this.addObject(this.backgroundContainer);
    this.addObject(this.characterContainer);
    this.addObject(this.pictureContainer);
    this.addObject(this.textContainer);
    this.addObject(this.videoContainer);
    this.addObject(this.hotspotContainer);
    this.addObject(this.viewportContainer);
    this.addObject(this.commonEventContainer);
    this.addObject(this.timerContainer);
    this.addObject(this.choiceTimer);
    this.addObject(this.messageAreaContainer);
    this.addComponent(new gs.Component_InputHandler());
    this.addComponent(this.behavior);
    this.addComponent(this.interpreter);
  }

  return Object_Scene;

})(gs.Object_Base);

vn.Object_Scene = Object_Scene;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7O0VBS0YsWUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO01BQ0QsSUFBRyxDQUFBLEtBQUssSUFBQyxDQUFBLFFBQVQ7UUFDSSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLFdBQUQsR0FBZTtlQUNmLElBQUMsQ0FBQSxXQUFELENBQUEsRUFISjs7SUFEQyxDQUFMO0lBTUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUEsUUFBRCxJQUFjLENBQUMsQ0FBQyxJQUFDLENBQUEsTUFBRixJQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBckI7SUFBakIsQ0FOTDtHQURKOzs7QUFTQTs7Ozs7Ozs7Ozs7RUFVYSxzQkFBQTtJQUNULDRDQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsMkJBQUgsQ0FBQTs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxFQUFFLENBQUMsNEJBQUgsQ0FBQTs7QUFFbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUFBOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBdEQ7O0FBRTNCOzs7OztJQUtBLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFvQixFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBaEQ7O0FBRTFCOzs7OztJQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUF3QixJQUFBLEVB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QSxvQkFBWjtJQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLGNBQVo7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxXQUFaO0lBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsb0JBQVo7SUFHQSxJQUFDLENBQUEsWUFBRCxDQUFrQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUFBLENBQWxCO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFdBQWY7RUF4T1M7Ozs7R0F4QlUsRUFBRSxDQUFDOztBQW1ROUIsRUFBRSxDQUFDLFlBQUgsR0FBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9TY2VuZVxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgT2JqZWN0X1NjZW5lIGV4dGVuZHMgZ3MuT2JqZWN0X0Jhc2VcbiAgIyAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wicGFyZW50XCIsIFwic3ViT2JqZWN0c1wiLCBcInByZXBhcmluZ1wiLCBcImJlaGF2aW9yXCIsIFwiaW50ZXJwcmV0ZXJcIiwgXCJldmVudHNcIiwgXCJzY2VuZURhdGFcIixcbiAgIyAgXCJjaGFyYWN0ZXJDb250YWluZXJcIiwgXCJwaWN0dXJlQ29udGFpbmVyXCIsIFwidGV4dENvbnRhaW5lclwiLCBcInZpZGVvQ29udGFpbmVyXCIsIFwibWVzc2FnZUFyZWFzXCIsIFwiaG90c3BvdENvbnRhaW5lclwiLCBcImNvbW1vbkV2ZW50Q29udGFpbmVyXCIsXG4gICMgIFwicGljdHVyZXNcIiwgXCJ0ZXh0c1wiLCBcInZpZGVvc1wiLCBcIm1lc3NhZ2VBcmVhc1wiLCBcImhvdHNwb3RzXCIsIFwiY29tbW9uRXZlbnRzXCIsIFwibGF5b3V0XCIsIFwibGF5b3V0TlZMXCJdXG4gICAgXG4gICAgQGFjY2Vzc29ycyBcInZpc2libGVcIiwgXG4gICAgICAgIHNldDogKHYpIC0+IFxuICAgICAgICAgICAgaWYgdiAhPSBAdmlzaWJsZV9cbiAgICAgICAgICAgICAgICBAdmlzaWJsZV8gPSB2XG4gICAgICAgICAgICAgICAgQG5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgQGZ1bGxSZWZyZXNoKClcbiAgICAgICAgICAgIFxuICAgICAgICBnZXQ6IC0+IEB2aXNpYmxlXyBhbmQgKCFAcGFyZW50IG9yIEBwYXJlbnQudmlzaWJsZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBIHNjZW5lIG9iamVjdCBtYW5hZ2VzIGEgd2hvbGUgdmlzdWFsIG5vdmVsIHNjZW5lIHdpdGggYmFja2dyb3VuZHMsIGNoYXJhY3RlcnMsXG4gICAgKiBtZXNzYWdlcywgZXRjLlxuICAgICpcbiAgICAqIEBtb2R1bGUgdm5cbiAgICAqIEBjbGFzcyBPYmplY3RfU2NlbmVcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9CYXNlXG4gICAgKiBAbWVtYmVyb2Ygdm5cbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjIyAgICBcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyB0aGF0IHRoZSBzY2VuZSBpcyBzdGlsbCBpbiBwcmVwYXJlLXN0YXRlIGFuZCBub3QgcmVhZHkgeWV0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBwcmVwYXJpbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAcHJlcGFyaW5nID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGJlaGF2aW9yLWNvbXBvbmVudCBmb3IgdGhlIFZOIHNjZW5lIHNwZWNpZmljIGJlaGF2aW9yLlxuICAgICAgICAqIEBwcm9wZXJ0eSBiZWhhdmlvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9HYW1lU2NlbmVCZWhhdmlvclxuICAgICAgICAjIyNcbiAgICAgICAgQGJlaGF2aW9yID0gbmV3IHZuLkNvbXBvbmVudF9HYW1lU2NlbmVCZWhhdmlvcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gaW50ZXJwcmV0ZXIgdG8gZXhlY3V0ZSB0aGUgY29tbWFuZHMgb2Ygc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IGludGVycHJldGVyXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuICAgICAgICAjIyNcbiAgICAgICAgQGludGVycHJldGVyID0gbmV3IGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGV2ZW50LWVtaXR0ZXIgdG8gZW1pdCBldmVudHMuXG4gICAgICAgICogQHByb3BlcnR5IGV2ZW50c1xuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9FdmVudEVtaXR0ZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBldmVudHMgPSBuZXcgZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIGJhY2tncm91bmQgb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IGJhY2tncm91bmRDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYmFja2dyb3VuZENvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfRG9tYWluQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCBjaGFyYWN0ZXIgb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IGNoYXJhY3RlckNvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBjaGFyYWN0ZXJDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0NvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuUkVNT1ZFKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCBwaWN0dXJlIG9iamVjdHMgb2YgdGhlIHNjZW5lLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwaWN0dXJlQ29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQHBpY3R1cmVDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgdmlkZW8gb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IHZpZGVvQ29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQHZpZGVvQ29udGFpbmVyID0gbmV3IGdzLk9iamVjdF9Eb21haW5Db250YWluZXIoZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLk5VTEwpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIHRleHQgb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IHRleHRDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAdGV4dENvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfRG9tYWluQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCBob3RzcG90IG9iamVjdHMgb2YgdGhlIHNjZW5lLlxuICAgICAgICAqIEBwcm9wZXJ0eSBob3RzcG90Q29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQGhvdHNwb3RDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgY29tbW9uIGV2ZW50cyB3aGljaCBhcmUgcnVubmluZyBwYXJhbGxlbC9hdXRvIHRvIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgY29tbW9uRXZlbnRDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAY29tbW9uRXZlbnRDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0NvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgdmlld3BvcnRzIHdoaWNoIGFyZSB1c2VkIHRvIGNyZWF0ZSBtdWx0aS1sYXllcmVkIHNjcmVlbiBlZmZlY3RzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aWV3cG9ydENvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aWV3cG9ydENvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5SRU1PVkUpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIGludGVydmFsIHRpbWVycy5cbiAgICAgICAgKiBAcHJvcGVydHkgdGltZXJDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAdGltZXJDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgbWVzc2FnZSBhcmVhcyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IG1lc3NhZ2VBcmVhQ29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQG1lc3NhZ2VBcmVhQ29udGFpbmVyID0gbmV3IGdzLk9iamVjdF9Eb21haW5Db250YWluZXIoZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLk5VTEwpXG4gICAgICAgIFxuICAgICAgICBAY2hhcmFjdGVyQ29udGFpbmVyLnZpc2libGUgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgcGljdHVyZSBvYmplY3RzIGFzIGFycmF5LiBUaGF0IGlzIHRoZSBzYW1lIGxpa2UgYWNjZXNzaW5nIHRoZSA8Yj5zdWJPYmplY3RzPC9iPiBvZiB0aGVcbiAgICAgICAgKiBjb250YWluZXIgb2JqZWN0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBwaWN0dXJlc1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9QaWN0dXJlW11cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBwaWN0dXJlcyA9IEBwaWN0dXJlQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgdmlkZW8gb2JqZWN0cyBhcyBhcnJheS4gVGhhdCBpcyB0aGUgc2FtZSBsaWtlIGFjY2Vzc2luZyB0aGUgPGI+c3ViT2JqZWN0czwvYj4gb2YgdGhlXG4gICAgICAgICogY29udGFpbmVyIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlkZW9zXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1ZpZGVvW11cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aWRlb3MgPSBAdmlkZW9Db250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCB0ZXh0IG9iamVjdHMgYXMgYXJyYXkuIFRoYXQgaXMgdGhlIHNhbWUgbGlrZSBhY2Nlc3NpbmcgdGhlIDxiPnN1Yk9iamVjdHM8L2I+IG9mIHRoZVxuICAgICAgICAqIGNvbnRhaW5lciBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IHRleHRzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1RleHRbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQHRleHRzID0gQHRleHRDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBjaGFyYWN0ZXIgb2JqZWN0cyBhcyBhcnJheS4gVGhhdCBpcyB0aGUgc2FtZSBsaWtlIGFjY2Vzc2luZyB0aGUgPGI+c3ViT2JqZWN0czwvYj4gb2YgdGhlXG4gICAgICAgICogY29udGFpbmVyIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcmFjdGVyc1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9DaGFyYWN0ZXJbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGNoYXJhY3RlcnMgPSBAY2hhcmFjdGVyQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgYmFja2dyb3VuZHMgYXMgYXJyYXkuIFRoYXQgaXMgdGhlIHNhbWUgbGlrZSBhY2Nlc3NpbmcgdGhlIDxiPnN1Yk9iamVjdHM8L2I+IG9mIHRoZVxuICAgICAgICAqIGNvbnRhaW5lciBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IGJhY2tncm91bmRzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0JhY2tncm91bmRbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGJhY2tncm91bmRzID0gQGJhY2tncm91bmRDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBob3RzcG90IG9iamVjdHMgYXMgYXJyYXkuIFRoYXQgaXMgdGhlIHNhbWUgbGlrZSBhY2Nlc3NpbmcgdGhlIDxiPnN1Yk9iamVjdHM8L2I+IG9mIHRoZVxuICAgICAgICAqIGNvbnRhaW5lciBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IGhvdHNwb3RzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0hvdHNwb3RbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGhvdHNwb3RzID0gQGhvdHNwb3RDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBpbnRlcnZhbCB0aW1lciBvYmplY3RzIGFzIGFycmF5LiBUaGF0IGlzIHRoZSBzYW1lIGxpa2UgYWNjZXNzaW5nIHRoZSA8Yj5zdWJPYmplY3RzPC9iPiBvZiB0aGVcbiAgICAgICAgKiBjb250YWluZXIgb2JqZWN0LlxuICAgICAgICAqIEBwcm9wZXJ0eSB0aW1lcnNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfSW50ZXJ2YWxUaW1lcltdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAdGltZXJzID0gQHRpbWVyQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgbWVzc2FnZSBhcmVhcyBhcyBhcnJheS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZUFyZWFzXG4gICAgICAgICogQHR5cGUgdm4uTWVzc2FnZUFyZWFbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQG1lc3NhZ2VBcmVhcyA9IEBtZXNzYWdlQXJlYUNvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQSB0aW1lciBvYmplY3QgdXNlZCBmb3IgY2hvaWNlcyB3aXRoIHRpbWUtbGltaXQuXG4gICAgICAgICogQHByb3BlcnR5IGNob2ljZVRpbWVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1RpbWVyXG4gICAgICAgICMjI1xuICAgICAgICBAY2hvaWNlVGltZXIgPSBuZXcgZ3MuT2JqZWN0X1RpbWVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIFVJIGxheW91dCBpcyB2aXNpYmxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXNpYmxlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc2libGUgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgdmlzaWJsZV9cbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc2libGVfID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdhbWUgc2V0dGluZ3MuXG4gICAgICAgICogQHByb3BlcnR5IHNldHRpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc2V0dGluZ3MgPSBHYW1lTWFuYWdlci5zZXR0aW5nc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRlbXBvcmFyeSBzZXR0aW5ncyBsaWtlIHNraXAsIGV0Yy5cbiAgICAgICAgKiBAcHJvcGVydHkgdGVtcFNldHRpbmdzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcFNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgZGF0YSBuZWNlc3NhcnkgdG8gY29uc3RydWN0IHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc2NlbmVEYXRhXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc2NlbmVEYXRhID0gR2FtZU1hbmFnZXIuc2NlbmVEYXRhXG4gICAgICAgIFxuICAgICAgICBAYWRkT2JqZWN0KEBiYWNrZ3JvdW5kQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBjaGFyYWN0ZXJDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHBpY3R1cmVDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHRleHRDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHZpZGVvQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBob3RzcG90Q29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEB2aWV3cG9ydENvbnRhaW5lcilcbiAgICAgICAgQGFkZE9iamVjdChAY29tbW9uRXZlbnRDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHRpbWVyQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBjaG9pY2VUaW1lcilcbiAgICAgICAgQGFkZE9iamVjdChAbWVzc2FnZUFyZWFDb250YWluZXIpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQGFkZENvbXBvbmVudChuZXcgZ3MuQ29tcG9uZW50X0lucHV0SGFuZGxlcigpKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBiZWhhdmlvcilcbiAgICAgICAgQGFkZENvbXBvbmVudChAaW50ZXJwcmV0ZXIpXG4gICAgICAgIFxuICAgICAgICBcbnZuLk9iamVjdF9TY2VuZSA9IE9iamVjdF9TY2VuZSJdfQ==
//# sourceURL=Object_Scene_159.js