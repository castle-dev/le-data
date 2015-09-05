/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 */
interface LeTypeConfig {
  /**
   * @var fieldConfigs LeTypeFieldConfig[] - The config objects for each field on the type being configured
   */
   fieldConfigs: LeTypeFieldConfig[];

   /**
    * @var allowAdditionalFields boolean - Allows fields to exist on an instance of the type that are not specified in fieldConfigs when set to true
    */
   allowAdditionalFields: boolean;
}
