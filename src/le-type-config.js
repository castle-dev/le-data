var le_type_field_config_1 = require("./le-type-field-config");
/**
 * The object used to configure a type of data
 *
 * @class LeTypeConfig
 *
 * @param type string - the type to be configured
 */
var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
        this.type = type;
        this.fieldConfigsArray = [];
        this.fieldConfigsObject = {};
    }
    LeTypeConfig.prototype.addField = function (argument1, argument2) {
        var fieldConfigToAdd;
        var fieldName;
        if (argument1 instanceof le_type_field_config_1["default"]) {
            var passedInFieldConfig = argument1;
            fieldName = passedInFieldConfig.getFieldName();
            fieldConfigToAdd = passedInFieldConfig;
        }
        else {
            fieldName = argument1;
            var type = argument2;
            fieldConfigToAdd = new le_type_field_config_1["default"](fieldName, type);
        }
        this.fieldConfigsArray.push(fieldConfigToAdd);
        this.fieldConfigsObject[fieldName] = fieldConfigToAdd;
        return fieldConfigToAdd;
    };
    /**
     * @function getFieldConfigs - returns all the LeTypeFieldConfig objects set on the LeTypeConfig object
     *
     * @returns LeTypeFieldConfig[] - all the LeTypeFieldConfig objects set on the LeTypeConfig object
     */
    LeTypeConfig.prototype.getFieldConfigs = function () {
        return this.fieldConfigsArray;
    };
    /**
     * @function fieldExists - returns if the field is configured on the typeConfig
     *
     * @returns boolean - if the field is configured on the typeConfig
     */
    LeTypeConfig.prototype.fieldExists = function (fieldName) {
        return !!this.fieldConfigsObject[fieldName];
    };
    LeTypeConfig.prototype.getFieldConfig = function (fieldName) {
        return this.fieldConfigsObject[fieldName];
    };
    LeTypeConfig.prototype.saveAt = function (location) {
        this.saveLocation = location;
    };
    LeTypeConfig.prototype.getType = function () {
        return this.type;
    };
    return LeTypeConfig;
})();
exports.LeTypeConfig = LeTypeConfig;
exports.__esModule = true;
exports["default"] = LeTypeConfig;
//# sourceMappingURL=le-type-config.js.map