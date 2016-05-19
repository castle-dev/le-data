var le_id_generator_1 = require("./le-id-generator");
var LeDataQuery = (function () {
    function LeDataQuery(type, id) {
        this.queryObject = {};
        this.queryObject.queryID = le_id_generator_1.default.generateID();
        this.queryObject.type = type;
        this.queryObject.id = id;
        this.queryObject.includedFields = {};
    }
    LeDataQuery.prototype.getQueryID = function () {
        return this.queryObject.queryID;
    };
    LeDataQuery.prototype.include = function (fieldName) {
        var newSubQuery = new LeDataQuery();
        this.queryObject.includedFields[fieldName] = newSubQuery.queryObject;
        return newSubQuery;
    };
    LeDataQuery.prototype.filter = function (fieldName, value) {
        if (this.queryObject.filterFieldName) {
            throw new Error('The filter has already been called on the query, and can only be called once per query.');
        }
        if (this.queryObject.sortByFieldName) {
            throw new Error('You can\'t call filter and sortBy on the same query');
        }
        this.queryObject.filterFieldName = fieldName;
        this.queryObject.filterValue = value;
    };
    LeDataQuery.prototype.sortBy = function (fieldName) {
        if (this.queryObject.sortByFieldName) {
            throw new Error('sortBy has already been called on the query, and can only be called once per query.');
        }
        if (this.queryObject.filterFieldName) {
            throw new Error('You can\'t call filter and sortBy on the same query');
        }
        this.queryObject.sortByFieldName = fieldName;
    };
    LeDataQuery.prototype.startAt = function (value) {
        if (this.queryObject.hasOwnProperty('startAtValue')) {
            throw new Error('startAt has already been called on the query, and can only be called once per query.');
        }
        if (!this.queryObject.sortByFieldName) {
            throw new Error('sortBy must be called before calling startAt');
        }
        this.queryObject.startAtValue = value;
    };
    LeDataQuery.prototype.endAt = function (value) {
        if (this.queryObject.hasOwnProperty('endAtValue')) {
            throw new Error('endAt has already been called on the query, and can only be called once per query.');
        }
        if (!this.queryObject.sortByFieldName) {
            throw new Error('sortBy must be called before calling endAt');
        }
        this.queryObject.endAtValue = value;
    };
    return LeDataQuery;
})();
exports.LeDataQuery = LeDataQuery;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeDataQuery;
//# sourceMappingURL=le-data-query.js.map