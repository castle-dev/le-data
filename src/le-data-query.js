var le_id_generator_1 = require("./le-id-generator");
/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 * @param type string - the LeData configured type to start the query from
 * @param id? string - The id of the individual record to serve as the root of the query
 */
var LeDataQuery = (function () {
    function LeDataQuery(type, id) {
        this.queryObject = {};
        this.queryObject.queryID = le_id_generator_1["default"].generateID();
        this.queryObject.type = type;
        this.queryObject.id = id;
        this.queryObject.includedFields = {};
        this.hasCalledFilter = false;
    }
    LeDataQuery.prototype.getQueryID = function () {
        return this.queryObject.queryID;
    };
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
    LeDataQuery.prototype.include = function (fieldName) {
        var newSubQuery = new LeDataQuery();
        this.queryObject.includedFields[fieldName] = newSubQuery.queryObject;
        return newSubQuery;
    };
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
    LeDataQuery.prototype.filter = function (fieldName, value) {
        if (this.hasCalledFilter) {
            throw new Error('The filter has already been called on the query, and can only be called once per query.');
        }
        this.hasCalledFilter = true;
        this.queryObject.filterFieldName = fieldName.replace('.', '/');
        this.queryObject.filterValue = value;
    };
    /**
     * Includes Deleted objects in the query.
     * This can only be called once on a query object.
     *
     * @function includeDeleted
     * @memberof LeDataQuery
     * @instance
     */
    LeDataQuery.prototype.includeDeleted = function () {
        if (this.queryObject.includeDeleted || this.queryObject.includeDeletedOnly) {
            throw new Error('includeDeleted or includeDeletedOnly can on be called once on a query');
        }
        this.queryObject.includeDeleted = true;
    };
    ;
    LeDataQuery.prototype.includeDeletedOnly = function () {
        if (this.queryObject.includeDeleted || this.queryObject.includeDeletedOnly) {
            throw new Error('includeDeleted or includeDeletedOnly can on be called once on a query');
        }
        this.queryObject.includeDeletedOnly = true;
    };
    ;
    LeDataQuery.prototype.setStreamSize = function (size) {
        if (this.queryObject.streamSize) {
            throw new Error('setStreamSize can on be called once on a query');
        }
        this.queryObject.streamSize = size;
    };
    ;
    LeDataQuery.prototype.getStreamSize = function () {
        var streamSize = this.queryObject && this.queryObject.streamSize || 100;
        return streamSize;
    };
    ;
    LeDataQuery.prototype.startAt = function (value) {
        this.queryObject.startAt = value;
    };
    /**
    * Limit the number of results to the first ones returned.
    * Only used if an id was not specified in the constructor.
    *
    * @function limitToTop
    * @memberof LeDataQuery
    * @instance
    * @param number number -  the number of results to limit the query to
    */
    LeDataQuery.prototype.limitToTop = function (limit) {
        if (limit <= 0) {
            throw new Error('limitToTop only accepts positive numbers');
        }
        if (this.queryObject.limitToTop) {
            throw new Error('limitToTop can only be called once on a query');
        }
        this.queryObject.limitToTop = limit;
    };
    return LeDataQuery;
}());
exports.LeDataQuery = LeDataQuery;
exports.__esModule = true;
exports["default"] = LeDataQuery;
//# sourceMappingURL=le-data-query.js.map