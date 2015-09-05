var LeDataQuery = (function () {
    function LeDataQuery(type, id) {
    }
    LeDataQuery.prototype.include = function (fieldName) {
        return new LeDataQuery('ExampleType');
    };
    LeDataQuery.prototype.limitTo = function (fieldName, value) {
    };
    LeDataQuery.prototype.sortyBy = function (fieldName) {
    };
    LeDataQuery.prototype.limitToTop = function (number) {
    };
    LeDataQuery.prototype.limitToBottom = function (number) {
    };
    LeDataQuery.prototype.includeDeletedData = function () {
    };
    ;
    return LeDataQuery;
})();
//# sourceMappingURL=le-data-query.js.map