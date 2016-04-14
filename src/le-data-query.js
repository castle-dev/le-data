var le_id_generator_1 = require("./le-id-generator");
var LeDataQuery = (function () {
    function LeDataQuery(type, id) {
        this.queryObject = {};
        this.queryObject.queryID = le_id_generator_1.default.generateID();
        this.queryObject.type = type;
        this.queryObject.id = id;
        this.queryObject.includedFields = {};
        this.hasCalledFilter = false;
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
        if (this.hasCalledFilter) {
            throw new Error('The filter has already been called on the query, and can only be called once per query.');
        }
        this.hasCalledFilter = true;
        this.queryObject.filterFieldName = fieldName;
        this.queryObject.filterValue = value;
    };
    return LeDataQuery;
})();
exports.LeDataQuery = LeDataQuery;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeDataQuery;
//# sourceMappingURL=le-data-query.js.map