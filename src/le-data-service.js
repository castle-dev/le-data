/// <reference path="le-data.ts"/>
/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
var ts_promise_1 = require("ts-promise");
var LeDataService = (function () {
    function LeDataService() {
    }
    LeDataService.prototype.createData = function (data) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.updateData = function (data) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.deleteData = function (data) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.sync = function (query, callback, errorCallback) {
    };
    LeDataService.prototype.unsync = function (query) {
    };
    LeDataService.prototype.search = function (query) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.configureType = function (config) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    return LeDataService;
})();
//# sourceMappingURL=le-data-service.js.map