/// <reference path="le-data.ts"/>
/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
var ts_promise_1 = require("ts-promise");
var LeDataService = (function () {
    function LeDataService(provider) {
        this.dataServiceProvider = provider;
    }
    LeDataService.prototype.createData = function (data) {
        if (!data) {
            var errorMessage = 'No data passed to createData function';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'No _type specified in LeData object passed to createData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (data._id) {
            return this.dataServiceProvider.dataExists(data._type, data._id).then(function (dataExists) {
                if (dataExists) {
                    var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
                    var error = new Error(errorMessage);
                    var promise = new ts_promise_1.default(function (resolve, reject) {
                        reject(error);
                    });
                    return promise;
                }
            });
        }
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
exports.LeDataService = LeDataService;
//# sourceMappingURL=le-data-service.js.map