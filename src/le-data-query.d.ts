/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 * @param type string - the LeData configured type to start the query from
 * @param id? string - The id of the individual record to serve as the root of the query
 */
export declare class LeDataQuery {
    private hasCalledFilter;
    constructor(type?: string, id?: string);
    getQueryID(): string;
    /**
     * includes the LeData configured type field in the query.
     * If this is not called for a configured LeData type that is on the LeData, that field will not be included in the results.\
     *
     * @function include
     * @memberof LeDataQuery
     * @instance
     * @param filedName string - the name of the field to include in the query. The filed must be a configured LeData type.
     * @returns LeDataQuery -  the sub query object used to control an query specificaitons from the specified field.
     */
    include(fieldName: string): LeDataQuery;
    queryObject: any;
    /**
     * Returns only LeData objects where the specified fieldName is equal to the specified value.
     * This function is only relevant if no id was specified in the constructor.
     * This can only be called on the root query.
     * Filter cannot be called multiple times on the same query object. An error will be thrown if filter is called a second time.
     *
     * @function filter
     * @memberof LeDataQuery
     * @instance
     * @param filedName string - the name of the field to check the values of. This field must be of type string, number, boolean, or a custom data type. IE, this field cannot be of type object or Date and cannot be an array.
     * @param value any -  the value to check the field against. Only accepts primitive values such as strings, numbers, and booleans. If the field the query is filtering on is of a custom type, this value represents the _id for the data set on that field;
     */
    filter(fieldName: string, value: any): void;
    /**
     * Includes Deleted objects in the query.
     * This can only be called once on a query object.
     *
     * @function includeDeleted
     * @memberof LeDataQuery
     * @instance
     */
    includeDeleted(): void;
    includeDeletedOnly(): void;
    setStreamSize(size: number): void;
    getStreamSize(): number;
    startAt(value: string): void;
    /**
    * Limit the number of results to the first ones returned.
    * Only used if an id was not specified in the constructor.
    *
    * @function limitToTop
    * @memberof LeDataQuery
    * @instance
    * @param number number -  the number of results to limit the query to
    */
    limitToTop(limit: number): void;
}
export default LeDataQuery;
