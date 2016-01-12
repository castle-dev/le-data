import LeTypeFieldConfig from "./le-type-field-config";
/**
 * The object used to configure a type of data
 *
 * @class LeTypeConfig
 *
 * @param type string - the type to be configured
 */
export class LeTypeConfig {
  private fieldConfigsArray: LeTypeFieldConfig[];
  private fieldConfigsObject: Object;
  private type: string;
  constructor(type: string) {
    this.type = type;
    this.fieldConfigsArray = [];
    this.fieldConfigsObject = {};
  }

  /**
   * @function addField - adds a field to the current type
   *
   * @param fieldname string - the name for the new field, the key on the object
   * @param type string - the type for the field.
   * Accepts values of 'string', 'boolean', 'number', 'Date', 'object' or any a LeData type configured in the storage provider.
   * 'object' is a json object with additional field inside it.
   * If the field is an array of the spcified type, append on '[]'. Ex, 'CustomDataType[]'
   *
   * @returns LeTypeFieldConfig -  the config object to configure the new field
   */
  addField(fieldConfig: LeTypeFieldConfig): LeTypeFieldConfig;
  addField(fieldName: string, type: string): LeTypeFieldConfig;
  addField(argument1, argument2?) {
    var fieldConfigToAdd: LeTypeFieldConfig;
    var fieldName:string;
    if(argument1 instanceof LeTypeFieldConfig) {
      var passedInFieldConfig:LeTypeFieldConfig = argument1;
      fieldName = passedInFieldConfig.getFieldName();
      fieldConfigToAdd = passedInFieldConfig;
    } else {
      fieldName = argument1;
      var type:string = argument2;
      fieldConfigToAdd = new LeTypeFieldConfig(fieldName, type);
    }
    this.fieldConfigsArray.push(fieldConfigToAdd);
    this.fieldConfigsObject[fieldName] = fieldConfigToAdd;
    return fieldConfigToAdd;
  }

  /**
   * @function getFieldConfigs - returns all the LeTypeFieldConfig objects set on the LeTypeConfig object
   *
   * @returns LeTypeFieldConfig[] - all the LeTypeFieldConfig objects set on the LeTypeConfig object
   */
  getFieldConfigs(): LeTypeFieldConfig[] {
    return this.fieldConfigsArray;
  }

  /**
   * @function fieldExists - returns if the field is configured on the typeConfig
   *
   * @returns boolean - if the field is configured on the typeConfig
   */
  fieldExists(fieldName: string): boolean {
    return !!this.fieldConfigsObject[fieldName];
  }

  getFieldConfig(fieldName: string): LeTypeFieldConfig {
    return this.fieldConfigsObject[fieldName];
  }

  saveAt: string;

  getType(): string {
    return this.type;
  }
}

export default LeTypeConfig;
