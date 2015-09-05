/**
 * The object used to configure a field on a type of data
 *
 * @interface LeTypeFieldConfig
 *
 */
interface LeTypeFieldConfig {
  /**
   * @var type string - the type for the field.
   * Accepts values of 'string', 'boolean', 'number', 'Date', 'JSON', or any a LeData type configured in the storage provider.
   * Because the fields of a JSON object on a LeData field can only be accessed from the LeData object that owns the field, the 'JSON' object type is discuraged.
   * If the field is an array of the spcified type, append on '[]'. Ex, 'CustomDataType[]'
   */
  type: string;

  /**
   * @var fieldName string - the key for the field when it is set on the LeData object
   */
  fieldName: string;

  /**
   * @var jsonObjectPrototype any - Only used if the type is set to JSON.
   * Each key on the prototype JSON object is an accepted field in the JSON.
   * If a field is set that is not specified in the prototype, then the object is considered invalid.
   * The value for each key can be a string of 'string', 'boolean', or 'number', or it could be nother inner JSON object with the same format.
   */
  jsonObjectPrototype?: any;

  /**
   * @var cascadeDelete boolean - secified if the LeData set at this field should be deleted if the parent data is deleted.
   * Only used if the type specified is a LeData type configured in the storage provider
   */
   cascadeDelete?: boolean;

}
