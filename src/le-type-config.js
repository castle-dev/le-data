var LeTypeConfig = (function () {
    function LeTypeConfig(type) {
    }
    LeTypeConfig.prototype.addField = function (fieldName, type) {
        return new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
    };
    return LeTypeConfig;
})();
//# sourceMappingURL=le-type-config.js.map