/**
 * The object used to configure a field on a type of data
 *
 * @class LeTypeFieldConfig
 *
 */
class LeTypeFieldConfig {
  private fieldName: string;
  private type: string;
  private addedFieldsArray: LeTypeFieldConfig[];
  private addedFieldsObejct: Object;
  /**
   * @param type string - the type for the field.
   * Accepts values of 'string', 'boolean', 'number', 'Date', 'object' or any a LeData type configured in the storage provider.
   * 'object' is a json object with additional field inside it.
   * If the field is an array of the spcified type, append on '[]'. Ex, 'CustomDataType[]'
   *
   * @param fieldName string - the key for the field when it is set on the LeData object
   */
  constructor(fieldName:string, type:string) {
    this.fieldName = fieldName;
    this.type = type;
    this.addedFieldsArray = [];
    this.addedFieldsObejct = {};
  }

  /**
   * @var cascadeDelete boolean  - if set to true, LeData object stored at this field will be soft deleted if the parent LeData object is soft deleted
   *
   * @throws if set on a LeTypeFieldConfig that does not have the type set to a custome LeData type.
   */
  cascadeDelete: boolean;

  /**
   * @var required boolean - if set to true, the field must be set to a value on the LeData object
   */
  required: boolean;

  /**
   * @var convertToLocalTimeZone boolean - if set to true, the Date stored at this field will be converted to whatever timezone it is fetched in
   * only applies to fields of type Date
   */
  convertToLocalTimeZone: boolean;

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
  addField(fieldName: string, type: string): LeTypeFieldConfig {
    var newFieldConfig = new LeTypeFieldConfig(fieldName, type);
    this.addedFieldsArray.push(newFieldConfig);
    this.addedFieldsObejct[fieldName] = newFieldConfig;
    return newFieldConfig;
  }

  /**
   * @function getFieldName - returns the fieldname
   *
   * @returns string -  the name of the field being configured
   */
  getFieldName():string {
    return this.fieldName;
  }

  /**
   * @function getFieldType - returns the type
   *
   * @returns string -  the type of the field being configured
   */
  getFieldType():string {
    return this.type;
  }

  /**
   * @function getFieldConfigs - returns all the fieldConfigs that have been added to this fieldConfig
   *
   * @returns LeTypeFieldConfig[] - all the field all the fieldConfigs that have been added to this fieldConfig
   */
  getFieldConfigs():LeTypeFieldConfig[] {
    return this.addedFieldsArray;
  }

  /**
   * @function fieldExists - returns if the field is configured on the fieldConfig
   *
   * @returns boolean - if the field is configured on the fieldConfig
   */
  fieldExists(fieldName: string): boolean {
    return !!this.addedFieldsObejct[fieldName];
  }
}
