var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
        this.fieldConfigsArray = [];
        this.fieldConfigsObject = {};
    }
    LeTypeConfig.prototype.addField = function (fieldName, type) {
        var newFieldConfig = new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
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
//# sourceMappingURL=le-type-config.js.map