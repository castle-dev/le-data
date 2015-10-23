var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
        this.fieldConfigs = [];
    }
    LeTypeConfig.prototype.addField = function (fieldName, type) {
        var newFieldConfig = new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
        this.fieldConfigs.push(newFieldConfig);
        return newFieldConfig;
    };
    LeTypeConfig.prototype.getFieldConfigs = function () {
        return this.fieldConfigs;
    };
    return LeTypeConfig;
})();
//# sourceMappingURL=le-type-config.js.map