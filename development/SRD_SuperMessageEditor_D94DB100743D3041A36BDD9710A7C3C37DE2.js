/*************************************************
 *
 * Super Message Editor
 * 
 * VNM Game JavaScript File
 *
 * by Robert Borghese (SumRndmDde)
 *
 *************************************************/

var SRD = SRD || {};
SRD.SuperMessageEditor = SRD.SuperMessageEditor || {};
SRD.SuperMessageEditor._version = '1.0.0';

(function(_) {

// Credit: https://stackoverflow.com/a/5624139/8139481
_.hexToColObj = function(source) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(source);
    if(result) {
        return {
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16),
            alpha: 255
        };
    } else {
        return null;
    }
};

_.rgbToColObj = function(source) {
    var result = /^(?:rgb)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(source);
    if(result) {
        return {
            red: parseInt(result[1]),
            green: parseInt(result[2]),
            blue: parseInt(result[3]),
            alpha: 255
        };
    } else {
        return null;
    }
};

_.rgbaToColObj = function(source) {
    var result = /^(?:rgba)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(source);
    if(result) {
        return {
            red: parseInt(result[1]),
            green: parseInt(result[2]),
            blue: parseInt(result[3]),
            alpha: parseInt(result[4])
        };
    } else {
        return null;
    }
};

var _Component_TextRenderer_createToken = gs.Component_TextRenderer.prototype.createToken;
gs.Component_TextRenderer.prototype.createToken = function(code, value) {
    var tokenObject = _Component_TextRenderer_createToken.apply(this, arguments);
    if(this.font._defaultBorderColor === undefined) {
        this.font._defaultBorderColor = this.font.borderColor;
    }
    if(code === "CC") {
        tokenObject = new gs.RendererToken(code, value);
        if(value === "0") {
            this.font.color = gs.Color.fromObject(Font.defaultColor);
        } else {
            value = String(value).trim();
            var color;
            if(value.substring(0, 4) === "rgba") {
                color = gs.Color.fromObject(_.rgbaToColObj(value));
            } else if(value.substring(0, 3) === "rgb") {
                color = gs.Color.fromObject(_.rgbToColObj(value));
            } else {
                color = gs.Color.fromObject(_.hexToColObj(value));
            }
            if(color) {
                this.font.color = color;
            }
        }
    } else if(code === "BC") {
        tokenObject = new gs.RendererToken(code, value);
        if(value === "0") {
            this.font.borderColor = this.font._defaultBorderColor;
        } else {
            value = String(value).trim();
            var color;
            if(value.substring(0, 4) === "rgba") {
                color = gs.Color.fromObject(_.rgbaToColObj(value));
            } else if(value.substring(0, 3) === "rgb") {
                color = gs.Color.fromObject(_.rgbToColObj(value));
            } else {
                color = gs.Color.fromObject(_.hexToColObj(value));
            }
            if(color) {
                this.font.borderColor = color;
            }
        }
    }
    return tokenObject;
};

var _Component_TextRenderer_processControlToken = gs.Component_TextRenderer.prototype.processControlToken;
gs.Component_TextRenderer.prototype.processControlToken = function(token) {
    var result = _Component_TextRenderer_processControlToken.apply(this, arguments);
    if(this.font._defaultBorderColor === undefined) {
        this.font._defaultBorderColor = this.font.borderColor;
    }
    if(token.code === "CC") {
        var value = token.value;
        if(value === "0") {
            this.font.color = gs.Color.fromObject(Font.defaultColor);
        } else {
            value = String(value).trim();
            var color;
            if(value.substring(0, 4) === "rgba") {
                color = gs.Color.fromObject(_.rgbaToColObj(value));
            } else if(value.substring(0, 3) === "rgb") {
                color = gs.Color.fromObject(_.rgbToColObj(value));
            } else {
                color = gs.Color.fromObject(_.hexToColObj(value));
            }
            if(color) {
                this.font.color = color;
            }
        }
    } else if(token.code === "BC") {
        var value = token.value;
        if(value === "0") {
            this.font.borderColor = this.font._defaultBorderColor;
        } else {
            value = String(value).trim();
            var color;
            if(value.substring(0, 4) === "rgba") {
                color = gs.Color.fromObject(_.rgbaToColObj(value));
            } else if(value.substring(0, 3) === "rgb") {
                color = gs.Color.fromObject(_.rgbToColObj(value));
            } else {
                color = gs.Color.fromObject(_.hexToColObj(value));
            }
            if(color) {
                this.font.borderColor = color;
            }
        }
    }
    return result;
};

var _Component_CommandInterpreter_assignCommand = gs.Component_CommandInterpreter.prototype.assignCommand;
gs.Component_CommandInterpreter.prototype.assignCommand = function(command) {
    _Component_CommandInterpreter_assignCommand.apply(this, arguments);
    if(command.id === "gs.ShowMessageEditor") {
        command.execute = this.commandShowMessage;
    }
};

})(SRD.SuperMessageEditor);