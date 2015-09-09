var LeTypeFieldConfig = (function () {
    function LeTypeFieldConfig(fieldName, type) {
    }
    LeTypeFieldConfig.prototype.addField = function (fieldName, type) {
        return new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
    };
    return LeTypeFieldConfig;
})();
//# sourceMappingURL=le-type-field-config.js.map