/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 * @param type string - the LeData configured type to start the query from
 * @param id? string - The id of the individual record to serve as the root of the query
 */
export declare class LeIDGenerator {
    static generateID(): string;
}
export default LeIDGenerator;
