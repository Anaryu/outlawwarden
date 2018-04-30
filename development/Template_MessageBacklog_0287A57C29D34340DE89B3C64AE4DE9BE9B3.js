ui.UiFactory.customTypes["ui.MessageBacklog"] = {
  "id": "backlogScrollView",
  "type": "ui.DataScrollView",
  "zIndex": 80000,
  "order": 80001,
  "frame": [0, 0, Graphics.width, Graphics.height],
  "params": {
    "dataSource": $(function() {
      return $dataFields.backlog;
    }),
    "template": {
      "size": [Graphics.width, 200],
      "descriptor": {
        "type": "ui.FreeLayout",
        "frame": [0, 0, Graphics.width, 200],
        "controls": [
          {
            "type": "ui.FreeLayout",
            "frame": [0, 20, Graphics.width / 4, 30],
            "controls": [
              {
                "type": "ui.Text",
                "styles": ["backlogNameText"],
                "frame": [0, 0],
                "margin": [0, 0, 20, 0],
                "sizeToFit": true,
                "alignmentX": "right",
                "zIndex": 82000,
                "formulas": [
                  $(function() {
                    var c, ref;
                    c = $dataFields.backlog[o.parent.parent.index].character;
                    o.text = (ref = c != null ? c.name : void 0) != null ? ref : "";
                    if (c != null ? c.textColor : void 0) {
                      return o.font.color.setFromObject(c.textColor);
                    }
                  })
                ],
                "text": "Name"
              }
            ]
          }, {
            "type": "ui.Text",
            "styles": ["messageText"],
            "frame": [Graphics.width / 4 + 20, 20, Graphics.width * 0.7, 0],
            "sizeToFit": {
              "horizontal": false,
              "vertical": true
            },
            "formatting": true,
            "wordWrap": true,
            "zIndex": 82000,
            "order": 80001,
            "formulas": [
              $(function() {
                return o.visible = !$dataFields.backlog[o.parent.index].isChoice;
              }), $(function() {
                if (!$dataFields.backlog[o.parent.index].isChoice) {
                  return o.text = $dataFields.backlog[o.parent.index].message;
                }
              }), $(function() {
                if ($dataFields.backlog[o.parent.index].isChoice) {
                  return o.text = $dataFields.backlog[o.parent.index].choice.text;
                }
              })
            ],
            "text": ""
          }, {
            "type": "ui.FreeLayout",
            "alignmentX": 1,
            "sizeToFit": true,
            "formulas": [
              $(function() {
                return o.visible = $dataFields.backlog[o.parent.index].isChoice;
              })
            ],
            "controls": [
              {
                "type": "ui.Window",
                "formulas": [
                  $(function() {
                    return o.controls[0].image = "selection";
                  })
                ],
                "frame": [0, 0, 750, 50],
                "margin": [0, 0, 0, 30],
                "zIndex": 4999
              }, {
                "type": "ui.Text",
                "sizeToFit": true,
                "styles": ["regularUIText"],
                "alignmentX": "center",
                "alignmentY": "center",
                "frame": [0, 12],
                "margin": [0, 0, 0, 30],
                "formulas": [
                  $(function() {
                    if ($dataFields.backlog[o.parent.parent.index].isChoice) {
                      return o.text = $dataFields.backlog[o.parent.parent.index].choice.text;
                    }
                  })
                ],
                "zIndex": 5100
              }
            ]
          }
        ],
        "margin": [0, 0, 0, 20]
      }
    }
  },
  "zIndex": 81000
};

ui.UiFactory.customTypes["ui.MessageBacklogBox"] = {
  "type": "ui.FreeLayout",
  "order": 80000,
  "id": "backlog",
  "formulas": [
    $(function() {
      console.log("Scroll to END");
      return $backlogScrollView.controls[1].behavior.scrollToEnd();
    }, null, "uiPrepareFinish")
  ],
  "controls": [
    {
      "type": "ui.Panel",
      "animations2": [
        {
          "event": "onInitialize",
          "flow": [
            {
              "type": "appear",
              "animation": {
                "type": 1
              },
              "duration": 30,
              "wait": true
            }
          ]
        }, {
          "event": "onTerminate",
          "flow": [
            {
              "type": "disappear",
              "animation": {
                "type": 1
              },
              "duration": 30,
              "wait": true
            }
          ]
        }
      ],
      "modal": true,
      "order": 800,
      "style": "backlogMessagePanel",
      "zIndex": 80000,
      "frame": [0, 0, Graphics.width, Graphics.height]
    }, {
      "type": "ui.Panel",
      "animations2": [
        {
          "event": "onInitialize",
          "flow": [
            {
              "type": "appear",
              "animation": {
                "type": 1
              },
              "duration": 30,
              "wait": true
            }
          ]
        }, {
          "event": "onTerminate",
          "flow": [
            {
              "type": "disappear",
              "animation": {
                "type": 1
              },
              "duration": 30,
              "wait": true
            }
          ]
        }
      ],
      "style": "backlogNamePanel",
      "zIndex": 80000,
      "frame": [0, 0, Graphics.width / 4, Graphics.height]
    }, {
      "type": "ui.MessageBacklog"
    }
  ],
  "frame": [0, 0, Graphics.width, Graphics.height]
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBWSxDQUFBLG1CQUFBLENBQXpCLEdBQWdEO0VBQzVDLElBQUEsRUFBTSxtQkFEc0M7RUFFNUMsTUFBQSxFQUFRLG1CQUZvQztFQUc1QyxRQUFBLEVBQVUsS0FIa0M7RUFJNUMsT0FBQSxFQUFTLEtBSm1DO0VBSzVDLE9BQUEsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sUUFBUSxDQUFDLEtBQWhCLEVBQXVCLFFBQVEsQ0FBQyxNQUFoQyxDQUxtQztFQU01QyxRQUFBLEVBQVU7SUFDTixZQUFBLEVBQWUsQ0FBQSxDQUFFLFNBQUE7YUFBRyxXQUFXLENBQUM7SUFBZixDQUFGLENBRFQ7SUFFTixVQUFBLEVBQVk7TUFDUixNQUFBLEVBQVEsQ0FBQyxRQUFRLENBQUMsS0FBVixFQUFpQixHQUFqQixDQURBO01BRVIsWUFBQSxFQUFjO1FBQ1YsTUFBQSxFQUFRLGVBREU7UUFFVixPQUFBLEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLFFBQVEsQ0FBQyxLQUFoQixFQUF1QixHQUF2QixDQUZDO1FBR1YsVUFBQSxFQUFZO1VBQ1I7WUFDSSxNQUFBLEVBQVEsZUFEWjtZQUVJLE9BQUEsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLEVBQVEsUUFBUSxDQUFDLEtBQVQsR0FBaUIsQ0FBekIsRUFBNEIsRUFBNUIsQ0FGYjtZQUdJLFVBQUEsRUFBWTtjQUNSO2dCQUNJLE1BQUEsRUFBUSxTQURaO2dCQUVJLFFBQUEsRUFBVSxDQUFDLGlCQUFELENBRmQ7Z0JBR0ksT0FBQSxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FIYjtnQkFJSSxRQUFBLEVBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLEVBQVAsRUFBVyxDQUFYLENBSmQ7Z0JBS0ksV0FBQSxFQUFhLElBTGpCO2dCQU1JLFlBQUEsRUFBYyxPQU5sQjtn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YUFESTtXQUZaO1NBUFc7T0FGbkI7TUFnQkksT0FBQSxFQUFTLGtCQWhCYjtNQWlCSSxRQUFBLEVBQVUsS0FqQmQ7TUFrQkksT0FBQSxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxRQUFRLENBQUMsS0FBVCxHQUFpQixDQUF4QixFQUEyQixRQUFRLENBQUMsTUFBcEMsQ0FsQmI7S0F2QlEsRUEyQ1I7TUFDSSxNQUFBLEVBQVEsbUJBRFo7S0EzQ1E7R0FSbUM7RUF3RC9DLE9BQUEsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sUUFBUSxDQUFDLEtBQWhCLEVBQXVCLFFBQVEsQ0FBQyxNQUFoQyxDQXhEc0MiLCJzb3VyY2VzQ29udGVudCI6WyJ1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbXCJ1aS5NZXNzYWdlQmFja2xvZ1wiXSA9IHtcbiAgICBcImlkXCI6IFwiYmFja2xvZ1Njcm9sbFZpZXdcIixcbiAgICBcInR5cGVcIjogXCJ1aS5EYXRhU2Nyb2xsVmlld1wiLFxuICAgIFwiekluZGV4XCI6IDgwMDAwLFxuICAgIFwib3JkZXJcIjogODAwMDEsXG4gICAgXCJmcmFtZVwiOiBbMCwgMCwgR3JhcGhpY3Mud2lkdGgsIEdyYXBoaWNzLmhlaWdodF0sXG4gICAgXCJwYXJhbXNcIjogeyBcbiAgICAgICAgXCJkYXRhU291cmNlXCI6ICgkIC0+ICRkYXRhRmllbGRzLmJhY2tsb2cpLFxuICAgICAgICBcInRlbXBsYXRlXCI6IHsgXG4gICAgICAgICAgICBcInNpemVcIjogW0dyYXBoaWNzLndpZHRoLCAyMDBdLFxuICAgICAgICAgICAgXCJkZXNjcmlwdG9yXCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJ1aS5GcmVlTGF5b3V0XCIsXG4gICAgICAgICAgICAgICAgXCJmcmFtZVwiOiBbMCwgMCwgR3JhcGhpY3Mud2lkdGgsIDIwMF0sXG4gICAgICAgICAgICAgICAgXCJjb250cm9sc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJ1aS5GcmVlTGF5b3V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZyYW1lXCI6IFswLCAyMCwgR3JhcGhpY3Mud2lkdGggLyA0LCAzMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRyb2xzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJ1aS5UZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R5bGVzXCI6IFtcImJhY2tsb2dOYW1lVGV4dFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmcmFtZVwiOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luXCI6IFswLCAwLCAyMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2l6ZVRvRml0XCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpZ25tZW50WFwiOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiekluZGV4XCI6IDgyMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZvcm11bGFzXCI6IFskIC0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYyA9ICRkYXRhRmllbGRzLmJhY2tsb2dbby5wYXJlbnQucGFyZW50LmluZGV4XS5jaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udGV4dCA9IGM/Lm5hbWUgPyBcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmZvbnQuY29sb3Iuc2V0RnJvbU9iamVjdChjLnRleHRDb2xvcikgaWYgYz8udGV4dENvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGV4dFwiOiBcIk5hbWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInVpLlRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R5bGVzXCI6IFtcIm1lc3NhZ2VUZXh0XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmcmFtZVwiOiBbR3JhcGhpY3Mud2lkdGggLyA0ICsgMjAsIDIwLCBHcmFwaGljcy53aWR0aCAqIDAuNywgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNpemVUb0ZpdFwiOiB7IFwiaG9yaXpvbnRhbFwiOiBmYWxzZSwgXCJ2ZXJ0aWNhbFwiOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZvcm1hdHRpbmdcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid29yZFdyYXBcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiekluZGV4XCI6IDgyMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJvcmRlclwiOiA4MDAwMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZm9ybXVsYXNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQgLT4gby52aXNpYmxlID0gISRkYXRhRmllbGRzLmJhY2tsb2dbby5wYXJlbnQuaW5kZXhdLmlzQ2hvaWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCAtPiBpZiAhJGRhdGFGaWVsZHMuYmFja2xvZ1tvLnBhcmVudC5pbmRleF0uaXNDaG9pY2UgdGhlbiBvLnRleHQgPSAkZGF0YUZpZWxkcy5iYWNrbG9nW28ucGFyZW50LmluZGV4XS5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCAtPiBpZiAkZGF0YUZpZWxkcy5iYWNrbG9nW28ucGFyZW50LmluZGV4XS5pc0Nob2ljZSB0aGVuIG8udGV4dCA9ICRkYXRhRmllbGRzLmJhY2tsb2dbby5wYXJlbnQuaW5kZXhdLmNob2ljZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwidWkuRnJlZUxheW91dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlnbm1lbnRYXCI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNpemVUb0ZpdFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3JtdWxhc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCAtPiBvLnZpc2libGUgPSAkZGF0YUZpZWxkcy5iYWNrbG9nW28ucGFyZW50LmluZGV4XS5pc0Nob2ljZVxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udHJvbHNcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJ1aS5XaW5kb3dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3JtdWxhc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkIC0+IG8uY29udHJvbHNbMF0uaW1hZ2UgPSBcInNlbGVjdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZnJhbWVcIjogWzAsIDAsIDc1MCwgNTBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpblwiOiBbMCwgMCwgMCwgMzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInpJbmRleFwiOiA0OTk5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInVpLlRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaXplVG9GaXRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHlsZXNcIjogW1wicmVndWxhclVJVGV4dFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlnbm1lbnRYXCI6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpZ25tZW50WVwiOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyYW1lXCI6IFswLCAxMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luXCI6IFswLCAwLCAwLCAzMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3JtdWxhc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkIC0+IGlmICRkYXRhRmllbGRzLmJhY2tsb2dbby5wYXJlbnQucGFyZW50LmluZGV4XS5pc0Nob2ljZSB0aGVuIG8udGV4dCA9ICRkYXRhRmllbGRzLmJhY2tsb2dbby5wYXJlbnQucGFyZW50LmluZGV4XS5jaG9pY2UudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInpJbmRleFwiOiA1MTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIm1hcmdpblwiOiBbMCwgMCwgMCwgMjBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCBcbiAgICBcInpJbmRleFwiOiA4MTAwMFxufVxuXG51aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbXCJ1aS5NZXNzYWdlQmFja2xvZ0JveFwiXSA9IHtcbiAgICBcInR5cGVcIjogXCJ1aS5GcmVlTGF5b3V0XCIsXG4gICAgXCJvcmRlclwiOiA4MDAwMCxcbiAgICBcImlkXCI6IFwiYmFja2xvZ1wiLFxuICAgIFwiZm9ybXVsYXNcIjogWyQoLT4gXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2Nyb2xsIHRvIEVORFwiKVxuICAgICAgICAkYmFja2xvZ1Njcm9sbFZpZXcuY29udHJvbHNbMV0uYmVoYXZpb3Iuc2Nyb2xsVG9FbmQoKVxuICAgICwgbnVsbCwgXCJ1aVByZXBhcmVGaW5pc2hcIildLFxuICAgIFwiY29udHJvbHNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBcInR5cGVcIjogXCJ1aS5QYW5lbFwiLFxuICAgICAgICAgICAgXCJhbmltYXRpb25zMlwiOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcImV2ZW50XCI6IFwib25Jbml0aWFsaXplXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmxvd1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IFwidHlwZVwiOiBcImFwcGVhclwiLCBcImFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxIH0sIFwiZHVyYXRpb25cIjogMzAsIFwid2FpdFwiOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcImV2ZW50XCI6IFwib25UZXJtaW5hdGVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmbG93XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgXCJ0eXBlXCI6IFwiZGlzYXBwZWFyXCIsIFwiYW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEgfSwgXCJkdXJhdGlvblwiOiAzMCwgXCJ3YWl0XCI6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwibW9kYWxcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwib3JkZXJcIjogODAwLFxuICAgICAgICAgICAgXCJzdHlsZVwiOiBcImJhY2tsb2dNZXNzYWdlUGFuZWxcIixcbiAgICAgICAgICAgIFwiekluZGV4XCI6IDgwMDAwLFxuICAgICAgICAgICAgXCJmcmFtZVwiOiBbMCwgMCwgR3JhcGhpY3Mud2lkdGgsIEdyYXBoaWNzLmhlaWdodF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidWkuUGFuZWxcIixcbiAgICAgICAgICAgIFwiYW5pbWF0aW9uczJcIjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJldmVudFwiOiBcIm9uSW5pdGlhbGl6ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcImZsb3dcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBcInR5cGVcIjogXCJhcHBlYXJcIiwgXCJhbmltYXRpb25cIjogeyBcInR5cGVcIjogMSB9LCBcImR1cmF0aW9uXCI6IDMwLCBcIndhaXRcIjogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJldmVudFwiOiBcIm9uVGVybWluYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmxvd1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IFwidHlwZVwiOiBcImRpc2FwcGVhclwiLCBcImFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxIH0sIFwiZHVyYXRpb25cIjogMzAsIFwid2FpdFwiOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcInN0eWxlXCI6IFwiYmFja2xvZ05hbWVQYW5lbFwiLFxuICAgICAgICAgICAgXCJ6SW5kZXhcIjogODAwMDAsXG4gICAgICAgICAgICBcImZyYW1lXCI6IFswLCAwLCBHcmFwaGljcy53aWR0aCAvIDQsIEdyYXBoaWNzLmhlaWdodF1cbiAgICAgICAgfSxcbiAgICAgICAgeyBcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInVpLk1lc3NhZ2VCYWNrbG9nXCJcbiAgICAgICAgfVxuICAgICAgICBcbiAgICBdLFxuICAgIFwiZnJhbWVcIjogWzAsIDAsIEdyYXBoaWNzLndpZHRoLCBHcmFwaGljcy5oZWlnaHRdXG59Il19
//# sourceURL=Template_MessageBacklog_35.js