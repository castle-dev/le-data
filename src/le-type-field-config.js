var LeTypeFieldConfig = (function () {
    function LeTypeFieldConfig(fieldName, type) {
        this.fieldName = fieldName;
        this.type = type;
    }
    LeTypeFieldConfig.prototype.addField = function (fieldName, type) {
        return new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
    };
    LeTypeFieldConfig.prototype.getFieldName = function () {
        return this.fieldName;
    };
    LeTypeFieldConfig.prototype.getFieldType = function () {
        return this.type;
    };
    LeTypeFieldConfig.prototype.getFieldConfigs = function () {
        return [];
    };
    return LeTypeFieldConfig;
})();
//# sourceMappingURL=le-type-field-config.js.map