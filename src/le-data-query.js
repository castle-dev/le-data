var LeDataQuery = (function () {
    function LeDataQuery(type, id) {
        this.queryObject = {};
        this.queryObject.type = type;
        this.queryObject.id = id;
        this.queryObject.includedFields = {};
    }
    LeDataQuery.prototype.include = function (fieldName) {
        var newSubQuery = new LeDataQuery();
        this.queryObject.includedFields[fieldName] = newSubQuery.queryObject;
        return newSubQuery;
    };
    return LeDataQuery;
})();
exports.LeDataQuery = LeDataQuery;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeDataQuery;
//# sourceMappingURL=le-data-query.js.map