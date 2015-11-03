var le_type_field_config_1 = require("./le-type-field-config");
var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
        this.fieldConfigsArray = [];
        this.fieldConfigsObject = {};
    }
    LeTypeConfig.prototype.addField = function (fieldName, type) {
        var newFieldConfig = new le_type_field_config_1.default('exampleFieldName', 'ExampleCustomType');
        this.fieldConfigsArray.push(newFieldConfig);
        this.fieldConfigsObject[fieldName] = newFieldConfig;
        return newFieldConfig;
    };
    LeTypeConfig.prototype.getFieldConfigs = function () {
        return this.fieldConfigsArray;
    };
    LeTypeConfig.prototype.fieldExists = function (fieldName) {
        return !!this.fieldConfigsObject[fieldName];
    };
    return LeTypeConfig;
})();
exports.LeTypeConfig = LeTypeConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeTypeConfig;
//# sourceMappingURL=le-type-config.js.map