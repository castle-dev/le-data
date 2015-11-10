var le_type_field_config_1 = require("./le-type-field-config");
var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
        this.type = type;
        this.fieldConfigsArray = [];
        this.fieldConfigsObject = {};
    }
    LeTypeConfig.prototype.addField = function (argument1, argument2) {
        var fieldConfigToAdd;
        var fieldName;
        if (argument1 instanceof le_type_field_config_1.default) {
            var passedInFieldConfig = argument1;
            fieldName = passedInFieldConfig.getFieldName();
            fieldConfigToAdd = passedInFieldConfig;
        }
        else {
            fieldName = argument1;
            var type = argument2;
            fieldConfigToAdd = new le_type_field_config_1.default(fieldName, type);
        }
        this.fieldConfigsArray.push(fieldConfigToAdd);
        this.fieldConfigsObject[fieldName] = fieldConfigToAdd;
        return fieldConfigToAdd;
    };
    LeTypeConfig.prototype.getFieldConfigs = function () {
        return this.fieldConfigsArray;
    };
    LeTypeConfig.prototype.fieldExists = function (fieldName) {
        return !!this.fieldConfigsObject[fieldName];
    };
    LeTypeConfig.prototype.getType = function () {
        return this.type;
    };
    return LeTypeConfig;
})();
exports.LeTypeConfig = LeTypeConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeTypeConfig;
//# sourceMappingURL=le-type-config.js.map