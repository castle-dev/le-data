var LeTypeFieldConfig = (function () {
    function LeTypeFieldConfig(fieldName, type) {
        this.fieldName = fieldName;
        this.type = type;
        this.addedFieldsArray = [];
        this.addedFieldsObejct = {};
    }
    LeTypeFieldConfig.prototype.addField = function (fieldName, type) {
        var newFieldConfig = new LeTypeFieldConfig(fieldName, type);
        this.addedFieldsArray.push(newFieldConfig);
        this.addedFieldsObejct[fieldName] = newFieldConfig;
        return newFieldConfig;
    };
    LeTypeFieldConfig.prototype.getFieldName = function () {
        return this.fieldName;
    };
    LeTypeFieldConfig.prototype.getFieldType = function () {
        return this.type;
    };
    LeTypeFieldConfig.prototype.getFieldConfigs = function () {
        return this.addedFieldsArray;
    };
    LeTypeFieldConfig.prototype.fieldExists = function (fieldName) {
        return !!this.addedFieldsObejct[fieldName];
    };
    return LeTypeFieldConfig;
})();
exports.LeTypeFieldConfig = LeTypeFieldConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeTypeFieldConfig;
//# sourceMappingURL=le-type-field-config.js.map