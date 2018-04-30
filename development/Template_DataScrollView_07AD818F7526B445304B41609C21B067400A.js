ui.UiFactory.customTypes["ui.DataScrollView"] = {
  "type": "ui.FreeLayout",
  "clipRect": true,
  "controls": [
    {
      "type": "ui.ScrollBar",
      "frame": [0, 0, 15, "100%"],
      "updateBehavior": "continuous",
      "formulas": [
        $(function() {
          o.numbers[0] = o.numbers[0] || 0;
          if (o.parent.controls[1].scrollableHeight > 0 && o.numbers[0] !== o.controls[0].dstRect.y) {
            o.numbers[0] = o.controls[0].dstRect.y;
            o.parent.controls[1].scrollOffsetY = o.controls[0].dstRect.y / (o.parent.dstRect.height - o.controls[0].dstRect.height) * o.parent.controls[1].scrollableHeight;
          }
          if (o.parent.controls[1].scrollableHeight > 0) {
            o.controls[0].dstRect.height = Math.max(o.parent.dstRect.height / o.parent.controls[1].contentHeight * o.parent.dstRect.height, 30);
          }
          if (o.parent.controls[1].scrollableHeight <= 0) {
            o.visible = false;
          }
          if (o.parent.controls[1].scrollableHeight > 0) {
            return o.visible = true;
          }
        })
      ],
      "margin": [0, 0, 0, 0],
      "alignmentX": "right"
    }, {
      "type": "ui.DataGrid",
      "id": "mygrid",
      "formulas": [
        $(function() {
          o.numbers[0] = o.numbers[0] || 0;
          if (o.numbers[0] !== o.scrollOffsetY) {
            o.numbers[0] = o.scrollOffsetY;
            o.parent.controls[0].controls[0].dstRect.y = o.scrollOffsetY / o.scrollableHeight * (o.dstRect.height - o.parent.controls[0].controls[0].dstRect.height);
            return o.parent.controls[0].numbers[0] = o.parent.controls[0].controls[0].dstRect.y;
          }
        })
      ],
      "frame": [0, 0, "100%", "100%"],
      "template": function() {
        return p.template;
      },
      "dataSource": function() {
        return p.dataSource;
      },
      "spacing": function() {
        return p.spacing;
      },
      "columns": function() {
        var ref;
        return (ref = p.columns) != null ? ref : 1;
      }
    }
  ]
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBWSxDQUFBLG1CQUFBLENBQXpCLEdBQWdEO0VBQzVDLE1BQUEsRUFBUSxlQURvQztFQUU1QyxVQUFBLEVBQVksSUFGZ0M7RUFHNUMsVUFBQSxFQUFZO0lBQ1I7TUFDSSxNQUFBLEVBQVEsY0FEWjtNQUVJLE9BQUEsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sRUFBUCxFQUFXLE1BQVgsQ0FGYjtNQUdJLGdCQUFBLEVBQWtCLFlBSHRCO01BSUksVUFBQSxFQUFZO1FBQ1IsQ0FBQSxDQUFFLFNBQUE7VUFDRSxDQUFDLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBVixHQUFlLENBQUMsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFWLElBQWdCO1VBQy9CLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsZ0JBQXJCLEdBQXdDLENBQXhDLElBQThDLENBQUMsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFWLEtBQWdCLENBQUMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDLENBQXZGO1lBQ0ksQ0FBQyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQVYsR0FBZSxDQUFDLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxhQUFyQixHQUFxQyxDQUFDLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxDQUF0QixHQUEwQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWpCLEdBQTBCLENBQUMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDLE1BQWpELENBQTFCLEdBQXFGLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLGlCQUZuSjs7VUFHQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLGdCQUFyQixHQUF3QyxDQUEzQztZQUFrRCxDQUFDLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUF0QixHQUErQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWpCLEdBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLGFBQS9DLEdBQStELENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQXpGLEVBQWlHLEVBQWpHLEVBQWpGOztVQUNBLElBQXFCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLGdCQUFyQixJQUF5QyxDQUE5RDtZQUFBLENBQUMsQ0FBQyxPQUFGLEdBQVksTUFBWjs7VUFDQSxJQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxnQkFBckIsR0FBd0MsQ0FBNUQ7bUJBQUEsQ0FBQyxDQUFDLE9BQUYsR0FBWSxLQUFaOztRQVBGLENBQUYsQ0FEUTtPQUpoQjtNQWVJLFFBQUEsRUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FmZDtNQWdCSSxZQUFBLEVBQWMsT0FoQmxCO0tBRFEsRUFtQlI7TUFDSSxNQUFBLEVBQVEsYUFEWjtNQUVJLElBQUEsRUFBTSxRQUZWO01BR0ksVUFBQSxFQUFZO1FBQ1IsQ0FBQSxDQUFFLFNBQUE7VUFDRSxDQUFDLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBVixHQUFlLENBQUMsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFWLElBQWdCO1VBQy9CLElBQUcsQ0FBQyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQVYsS0FBZ0IsQ0FBQyxDQUFDLGFBQXJCO1lBQ0ksQ0FBQyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQVYsR0FBZSxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxDQUF6QyxHQUE2QyxDQUFDLENBQUMsYUFBRixHQUFrQixDQUFDLENBQUMsZ0JBQXBCLEdBQXVDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFWLEdBQW1CLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFPLENBQUMsTUFBN0Q7bUJBQ3BGLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQTdCLEdBQWtDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFPLENBQUMsRUFIL0U7O1FBRkYsQ0FBRixDQURRO09BSGhCO01BYUksT0FBQSxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxNQUFQLEVBQWUsTUFBZixDQWJiO01BY0ksVUFBQSxFQUFZLFNBQUE7ZUFBRyxDQUFDLENBQUM7TUFBTCxDQWRoQjtNQWVJLFlBQUEsRUFBYyxTQUFBO2VBQUcsQ0FBQyxDQUFDO01BQUwsQ0FmbEI7TUFnQkksU0FBQSxFQUFXLFNBQUE7ZUFBRyxDQUFDLENBQUM7TUFBTCxDQWhCZjtNQWlCSSxTQUFBLEVBQVcsU0FBQTtBQUFHLFlBQUE7aURBQVk7TUFBZixDQWpCZjtLQW5CUTtHQUhnQyIsInNvdXJjZXNDb250ZW50IjpbInVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLkRhdGFTY3JvbGxWaWV3XCJdID0ge1xuICAgIFwidHlwZVwiOiBcInVpLkZyZWVMYXlvdXRcIixcbiAgICBcImNsaXBSZWN0XCI6IHRydWUsXG4gICAgXCJjb250cm9sc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInVpLlNjcm9sbEJhclwiLFxuICAgICAgICAgICAgXCJmcmFtZVwiOiBbMCwgMCwgMTUsIFwiMTAwJVwiXSxcbiAgICAgICAgICAgIFwidXBkYXRlQmVoYXZpb3JcIjogXCJjb250aW51b3VzXCIsXG4gICAgICAgICAgICBcImZvcm11bGFzXCI6IFtcbiAgICAgICAgICAgICAgICAkIC0+IFxuICAgICAgICAgICAgICAgICAgICBvLm51bWJlcnNbMF0gPSBvLm51bWJlcnNbMF0gb3IgMFxuICAgICAgICAgICAgICAgICAgICBpZiBvLnBhcmVudC5jb250cm9sc1sxXS5zY3JvbGxhYmxlSGVpZ2h0ID4gMCBhbmQgby5udW1iZXJzWzBdICE9IG8uY29udHJvbHNbMF0uZHN0UmVjdC55XG4gICAgICAgICAgICAgICAgICAgICAgICBvLm51bWJlcnNbMF0gPSBvLmNvbnRyb2xzWzBdLmRzdFJlY3QueVxuICAgICAgICAgICAgICAgICAgICAgICAgby5wYXJlbnQuY29udHJvbHNbMV0uc2Nyb2xsT2Zmc2V0WSA9IG8uY29udHJvbHNbMF0uZHN0UmVjdC55IC8gKG8ucGFyZW50LmRzdFJlY3QuaGVpZ2h0IC0gby5jb250cm9sc1swXS5kc3RSZWN0LmhlaWdodCkgKiBvLnBhcmVudC5jb250cm9sc1sxXS5zY3JvbGxhYmxlSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGlmIG8ucGFyZW50LmNvbnRyb2xzWzFdLnNjcm9sbGFibGVIZWlnaHQgPiAwIHRoZW4gby5jb250cm9sc1swXS5kc3RSZWN0LmhlaWdodCA9IE1hdGgubWF4KG8ucGFyZW50LmRzdFJlY3QuaGVpZ2h0IC8gby5wYXJlbnQuY29udHJvbHNbMV0uY29udGVudEhlaWdodCAqIG8ucGFyZW50LmRzdFJlY3QuaGVpZ2h0LCAzMClcbiAgICAgICAgICAgICAgICAgICAgby52aXNpYmxlID0gZmFsc2UgaWYgby5wYXJlbnQuY29udHJvbHNbMV0uc2Nyb2xsYWJsZUhlaWdodCA8PSAwICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBvLnZpc2libGUgPSB0cnVlIGlmIG8ucGFyZW50LmNvbnRyb2xzWzFdLnNjcm9sbGFibGVIZWlnaHQgPiAwIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwibWFyZ2luXCI6IFswLCAwLCAwLCAwXSxcbiAgICAgICAgICAgIFwiYWxpZ25tZW50WFwiOiBcInJpZ2h0XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidWkuRGF0YUdyaWRcIixcbiAgICAgICAgICAgIFwiaWRcIjogXCJteWdyaWRcIixcbiAgICAgICAgICAgIFwiZm9ybXVsYXNcIjogW1xuICAgICAgICAgICAgICAgICQgLT5cbiAgICAgICAgICAgICAgICAgICAgby5udW1iZXJzWzBdID0gby5udW1iZXJzWzBdIG9yIDBcbiAgICAgICAgICAgICAgICAgICAgaWYgby5udW1iZXJzWzBdICE9IG8uc2Nyb2xsT2Zmc2V0WVxuICAgICAgICAgICAgICAgICAgICAgICAgby5udW1iZXJzWzBdID0gby5zY3JvbGxPZmZzZXRZXG4gICAgICAgICAgICAgICAgICAgICAgICBvLnBhcmVudC5jb250cm9sc1swXS5jb250cm9sc1swXS5kc3RSZWN0LnkgPSBvLnNjcm9sbE9mZnNldFkgLyBvLnNjcm9sbGFibGVIZWlnaHQgKiAoby5kc3RSZWN0LmhlaWdodCAtIG8ucGFyZW50LmNvbnRyb2xzWzBdLmNvbnRyb2xzWzBdLmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgby5wYXJlbnQuY29udHJvbHNbMF0ubnVtYmVyc1swXSA9IG8ucGFyZW50LmNvbnRyb2xzWzBdLmNvbnRyb2xzWzBdLmRzdFJlY3QueVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICNcImJpbmRpbmdzXCI6IFt7IFwiZXZlbnRcIjogeyBcIm9uQ2hhbmdlXCI6IFwiby5zY3JvbGxPZmZzZXRZXCIgfSwgXCJzb3VyY2VGaWVsZFwiOiBcIm8uc2Nyb2xsT2Zmc2V0WVwiLCBcInRhcmdldEZpZWxkXCI6IFwiby5wYXJlbnQuY29udHJvbHNbMF0uY29udHJvbHNbMF0uZHN0UmVjdC55XCIsIFwiY29udmVydFJhdGlvXCI6IHsgXCJzb3VyY2VcIjogXCJvLnNjcm9sbGFibGVIZWlnaHRcIiwgXCJ0YXJnZXRTaXplXCI6IFwiby5wYXJlbnQuY29udHJvbHNbMF0uY29udHJvbHNbMF0uZHN0UmVjdC5oZWlnaHRcIiwgXCJvZmZzZXRcIjogMCwgXCJ0YXJnZXRcIjogXCJvLmRzdFJlY3QuaGVpZ2h0XCIgfSwgXCJicmVha0NoYWluXCI6IFtcIm8ucGFyZW50LmNvbnRyb2xzWzBdXCJdIH1dLFxuICAgICAgICAgICAgXCJmcmFtZVwiOiBbMCwgMCwgXCIxMDAlXCIsIFwiMTAwJVwiXSxcbiAgICAgICAgICAgIFwidGVtcGxhdGVcIjogLT4gcC50ZW1wbGF0ZVxuICAgICAgICAgICAgXCJkYXRhU291cmNlXCI6IC0+IHAuZGF0YVNvdXJjZVxuICAgICAgICAgICAgXCJzcGFjaW5nXCI6IC0+IHAuc3BhY2luZ1xuICAgICAgICAgICAgXCJjb2x1bW5zXCI6IC0+IHAuY29sdW1ucyA/IDFcbiAgICAgICAgfVxuICAgIF1cbn0iXX0=
//# sourceURL=Template_DataScrollView_179.js