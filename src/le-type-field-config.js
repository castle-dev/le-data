/**
 * The object used to configure a field on a type of data
 *
 * @class LeTypeFieldConfig
 *
 */
var LeTypeFieldConfig = (function () {
    /**
     * @param type string - the type for the field.
     * Accepts values of 'string', 'boolean', 'number', 'Date', 'object' or any a LeData type configured in the storage provider.
     * 'object' is a json object with additional field inside it.
     * If the field is an array of the spcified type, append on '[]'. Ex, 'CustomDataType[]'
     *
     * @param fieldName string - the key for the field when it is set on the LeData object
     */
    function LeTypeFieldConfig(fieldName, type) {
    }
    /**
     * @function addField - adds a field to the current field if it's of type 'object'
     *
     * @param fieldname string - the name for the new field, the key on the object
     * @param type string - the type for the field.
     * Accepts values of 'string', 'boolean', 'number', 'Date', 'object' or any a LeData type configured in the storage provider.
     * 'object' is a json object with additional field inside it.
     * If the field is an array of the spcified type, append on '[]'. Ex, 'CustomDataType[]'
     *
     * @throws if called on a LeTypeFieldConfig that does not have the type set to 'object'.
     *
     * @returns LeTypeFieldConfig -  the config object to configure the new field
     */
    LeTypeFieldConfig.prototype.addField = function (fieldName, type) {
        return new LeTypeFieldConfig('exampleFieldName', 'ExampleCustomType');
    };
    return LeTypeFieldConfig;
})();
//# sourceMappingURL=le-type-field-config.js.map