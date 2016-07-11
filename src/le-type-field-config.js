var LeTypeFieldConfig = (function () {
    function LeTypeFieldConfig(fieldName, type) {
        this.fieldName = fieldName;
        this.type = type;
        this.addedFieldsArray = [];
        this.addedFieldsObejct = {};
    }
    LeTypeFieldConfig.prototype.saveAt = function (location) {
        this.saveLocation = location;
    };
    LeTypeFieldConfig.prototype.addField = function (argument1, argument2) {
        var fieldConfigToAdd;
        var fieldName;
        if (argument1 instanceof LeTypeFieldConfig) {
            var passedInFieldConfig = argument1;
            fieldName = passedInFieldConfig.getFieldName();
            fieldConfigToAdd = passedInFieldConfig;
        }
        else {
            fieldName = argument1;
            var type = argument2;
            fieldConfigToAdd = new LeTypeFieldConfig(fieldName, type);
        }
        this.addedFieldsArray.push(fieldConfigToAdd);
        this.addedFieldsObejct[fieldName] = fieldConfigToAdd;
        return fieldConfigToAdd;
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
    LeTypeFieldConfig.prototype.getFieldConfig = function (fieldName) {
        return this.addedFieldsObejct[fieldName];
    };
    LeTypeFieldConfig.prototype.fieldExists = function (fieldName) {
        return !!this.addedFieldsObejct[fieldName];
    };
    LeTypeFieldConfig.prototype.isCustomeType = function () {
        return this.type !== 'string' && this.type !== 'boolean' && this.type !== 'number' && this.type !== 'Date' && this.type !== 'object';
    };
    return LeTypeFieldConfig;
})();
exports.LeTypeFieldConfig = LeTypeFieldConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeTypeFieldConfig;
//# sourceMappingURL=le-type-field-config.js.map