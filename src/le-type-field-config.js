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
    /**
     * @function getFieldName - returns the fieldname
     *
     * @returns string -  the name of the field being configured
     */
    LeTypeFieldConfig.prototype.getFieldName = function () {
        return this.fieldName;
    };
    /**
     * @function getFieldType - returns the type
     *
     * @returns string -  the type of the field being configured
     */
    LeTypeFieldConfig.prototype.getFieldType = function () {
        return this.type;
    };
    /**
     * @function getFieldConfigs - returns all the fieldConfigs that have been added to this fieldConfig
     *
     * @returns LeTypeFieldConfig[] - all the field all the fieldConfigs that have been added to this fieldConfig
     */
    LeTypeFieldConfig.prototype.getFieldConfigs = function () {
        return this.addedFieldsArray;
    };
    /**
     * @function getFieldConfigs - returns the fieldConfig that has been added to this fieldConfig with the specified feild name
     *
     * @param fieldName string - the name of the inner field added to this field
     *
     * @returns LeTypeFieldConfig - the fieldConfig for the inner field with the specified name
     */
    LeTypeFieldConfig.prototype.getFieldConfig = function (fieldName) {
        return this.addedFieldsObejct[fieldName];
    };
    /**
     * @function fieldExists - returns if the field is configured on the fieldConfig
     *
     * @returns boolean - if the field is configured on the fieldConfig
     */
    LeTypeFieldConfig.prototype.fieldExists = function (fieldName) {
        return !!this.addedFieldsObejct[fieldName];
    };
    /**
     * @function fieldExists - returns if the field is configured on the fieldConfig
     *
     * @returns boolean - if the field is configured on the fieldConfig
     */
    LeTypeFieldConfig.prototype.encrypt = function () {
        if (this.isEncrypted) {
            throw new Error('encrypt has already been called on the ' + this.fieldName + ' field config object. encrypt can only be called once on each field.');
        }
        this.isEncrypted = true;
    };
    LeTypeFieldConfig.prototype.getIsEncrypted = function () {
        return this.isEncrypted;
    };
    LeTypeFieldConfig.prototype.isCustomeType = function () {
        return this.type !== 'string' && this.type !== 'boolean' && this.type !== 'number' && this.type !== 'Date' && this.type !== 'object';
    };
    return LeTypeFieldConfig;
}());
exports.LeTypeFieldConfig = LeTypeFieldConfig;
exports.__esModule = true;
exports["default"] = LeTypeFieldConfig;
//# sourceMappingURL=le-type-field-config.js.map