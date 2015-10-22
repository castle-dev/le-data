var ts_promise_1 = require("ts-promise");
var LeDataService = (function () {
    function LeDataService(provider) {
        this.dataServiceProvider = provider;
    }
    LeDataService.prototype.createData = function (data) {
        var _this = this;
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
            return new ts_promise_1.default(function (resolve, reject) {
                _this.dataServiceProvider.dataExists(data._type, data._id).then(function (dataExists) {
                    if (dataExists) {
                        var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
                        var error = new Error(errorMessage);
                        reject(error);
                    }
                    else {
                        return _this.dataServiceProvider.validateData(data);
                    }
                }).then(function () {
                    return _this.dataServiceProvider.saveData(data);
                }).then(function (returnedData) {
                    resolve(returnedData);
                }, function (err) {
                    reject(err);
                });
            });
        }
        else {
            return new ts_promise_1.default(function (resolve, reject) {
                _this.dataServiceProvider.validateData(data).then(function () {
                    return _this.dataServiceProvider.saveData(data);
                }).then(function (returnedData) {
                    resolve(returnedData);
                }, function (err) {
                    reject(err);
                });
            });
        }
    };
    LeDataService.prototype.updateData = function (data) {
        var _this = this;
        if (!data) {
            var errorMessage = 'No data passed to updateData function';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'No _type specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._id) {
            var errorMessage = 'No _id specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        return new ts_promise_1.default(function (resolve, reject) {
            _this.dataServiceProvider.dataExists(data._type, data._id).then(function (dataExists) {
                if (dataExists) {
                    return _this.dataServiceProvider.validateData(data);
                }
                else {
                    var errorMessage = 'Attempted to update data that does not exist, object:' + JSON.stringify(data);
                    var error = new Error(errorMessage);
                    reject(error);
                }
            }).then(function () {
                return _this.dataServiceProvider.saveData(data);
            }).then(function (returnedData) {
                resolve(returnedData);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.deleteData = function (type, id) {
        if (!type) {
            var errorMessage = 'Undefined type passed to deleteData.\ntype: ' + type + ' id: ' + id;
            console.log(errorMessage);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!id) {
            var errorMessage = 'Undefined id passed to deleteData.\ntype: ' + type + ' id: ' + id;
            console.log(errorMessage);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        return this.dataServiceProvider.deleteData(type, id);
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