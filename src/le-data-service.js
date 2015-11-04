var ts_promise_1 = require("ts-promise");
var le_type_config_1 = require("./le-type-config");
var configObjectIndex = '_leTypeConfigs/';
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
                _this.dataExists(data._type, data._id).then(function (dataExists) {
                    if (dataExists) {
                        var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
                        var error = new Error(errorMessage);
                        reject(error);
                    }
                    else {
                        return _this.validateData(data);
                    }
                }).then(function () {
                    return _this.saveData(data);
                }).then(function (returnedData) {
                    resolve(returnedData);
                }, function (err) {
                    reject(err);
                });
            });
        }
        else {
            return new ts_promise_1.default(function (resolve, reject) {
                _this.validateData(data).then(function () {
                    data._createdAt = new Date();
                    data._lastUpdatedAt = data._createdAt;
                    return _this.locationForData(data);
                }).then(function (location) {
                    return _this.dataServiceProvider.createData(location, data);
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
            _this.dataExists(data._type, data._id).then(function (dataExists) {
                if (dataExists) {
                    return _this.validateData(data);
                }
                else {
                    var errorMessage = 'Attempted to update data that does not exist, object:' + JSON.stringify(data);
                    var error = new Error(errorMessage);
                    reject(error);
                }
            }).then(function () {
                return _this.saveData(data);
            }).then(function (returnedData) {
                resolve(returnedData);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.locationForData = function (data) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            _this.fetchTypeConfig(data._type).then(function (typeConfig) {
                var locationToReturn = data._type;
                if (typeConfig.saveAt) {
                    locationToReturn = typeConfig.saveAt;
                }
                if (data._id) {
                    locationToReturn += '/' + data._id;
                }
                resolve(locationToReturn);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.deleteData = function (type, id) {
        if (!type) {
            var errorMessage = 'Undefined type passed to deleteData.\ntype: ' + type + ' id: ' + id;
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!id) {
            var errorMessage = 'Undefined id passed to deleteData.\ntype: ' + type + ' id: ' + id;
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        return this.deleteData(type, id);
    };
    LeDataService.prototype.sync = function (query, callback, errorCallback) {
    };
    LeDataService.prototype.unsync = function (query) {
    };
    LeDataService.prototype.search = function (query) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.configureType = function (config) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            var configObjectToSave = {};
            configObjectToSave.type = config.getType();
            var location = configObjectIndex + configObjectToSave.type;
            _this.dataServiceProvider.updateData(location, configObjectToSave).then(function () {
                resolve(undefined);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.validateData = function (data) {
        var _this = this;
        if (!data) {
            var errorMessage = 'Invalid LeData object - cannot be undefined';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'Invalid LeData object - _type must be set, data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1.default(function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        var configLocation = configObjectIndex + data._type;
        return new ts_promise_1.default(function (resolve, reject) {
            _this.dataServiceProvider.dataExists(configLocation).then(function (doesConfigExist) {
                if (!doesConfigExist) {
                    var errorMessage = 'Invalid _type set on data: ' + JSON.stringify(data);
                    var error = new Error(errorMessage);
                    reject(error);
                }
                else {
                    return _this.fetchTypeConfig(data._type);
                }
            }).then(function (typeConfig) {
                var fieldConfigs = typeConfig.getFieldConfigs();
                var validateFieldPromises;
                validateFieldPromises = [];
                for (var i = 0; i < fieldConfigs.length; i += 1) {
                    var fieldConfig = fieldConfigs[i];
                    validateFieldPromises.push(_this.validateField(fieldConfig, data));
                }
                validateFieldPromises.push(_this.validateNoExtraFields(typeConfig, data));
                return ts_promise_1.default.all(validateFieldPromises).then(function () {
                    resolve(undefined);
                }, function (error) {
                    reject(error);
                });
            });
        });
    };
    LeDataService.prototype.validateNoExtraFields = function (typeConfig, data) {
        for (var key in data) {
            if (key.charAt(0) !== '_' && data.hasOwnProperty(key) && !typeConfig.fieldExists(key)) {
                var errorMessage = 'An additional field was set on the data object.\n';
                errorMessage += 'the field "' + key + '" is not configured on objects of type ' + data._type + '\n';
                errorMessage += 'data: ' + JSON.stringify(data);
                var error = new Error(errorMessage);
                return ts_promise_1.default.reject(error);
            }
        }
        return ts_promise_1.default.resolve();
    };
    LeDataService.prototype.validateNoExtraFieldsOnObject = function (fieldConfig, data) {
        for (var key in data) {
            if (key.charAt(0) !== '_' && data.hasOwnProperty(key) && !fieldConfig.fieldExists(key)) {
                var errorMessage = 'An additional field was set on the data object.\n';
                errorMessage += 'the field "' + key + '" is not configured on the object\n';
                errorMessage += 'data: ' + JSON.stringify(data);
                var error = new Error(errorMessage);
                return ts_promise_1.default.reject(error);
            }
        }
        return ts_promise_1.default.resolve();
    };
    LeDataService.prototype.validateField = function (fieldConfig, data) {
        var validationPromises;
        var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data);
        var typePromise = this.validateTypeOnField(fieldConfig, data);
        validationPromises.push(requiredPromise);
        validationPromises.push(typePromise);
        return new ts_promise_1.default(function (resolve, reject) {
            ts_promise_1.default.all(validationPromises).then(function () {
                resolve(undefined);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.validateTypeOnField = function (fieldConfig, data) {
        var type = fieldConfig.getFieldType();
        var fieldName = fieldConfig.getFieldName();
        if (!data[fieldName]) {
            return ts_promise_1.default.resolve();
        }
        else if (type === 'object') {
            return this.validateObjectTypeOnField(fieldConfig, data);
        }
        else if (typeof data[fieldName] === type) {
            return ts_promise_1.default.resolve();
        }
        else if (type === 'Date' && data[fieldName] instanceof Date) {
            return ts_promise_1.default.resolve();
        }
        else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && type === data[fieldName]._type) {
            return ts_promise_1.default.resolve();
        }
        else {
            var errorMessage = 'The specified field is set to an invalid type -\n';
            errorMessage += 'fieldName: ' + fieldName + '\n';
            errorMessage += "field's configured type: " + type + '\n';
            errorMessage += 'data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            return ts_promise_1.default.reject(error);
        }
    };
    LeDataService.prototype.validateObjectTypeOnField = function (fieldConfig, data) {
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        var objectUnderValidation = data[fieldConfig.getFieldName()];
        var promises = [];
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            promises.push(this.validateField(innerFieldConfig, objectUnderValidation));
        }
        promises.push(this.validateNoExtraFieldsOnObject(fieldConfig, data));
        return new ts_promise_1.default(function (resolve, reject) {
            ts_promise_1.default.all(promises).then(function () {
                resolve(undefined);
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.validateRequiredPropertyOnField = function (fieldConfig, data) {
        var _this = this;
        var fieldName = fieldConfig.getFieldName();
        if (fieldConfig.required && !data[fieldName] && data.hasOwnProperty(fieldName)) {
            var errorMessage = fieldConfig.getFieldName() + ' is required but was not set to undefined on the LeData object, data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            return ts_promise_1.default.reject(error);
        }
        else if (fieldConfig.required && !data[fieldName]) {
            return new ts_promise_1.default(function (resolve, reject) {
                if (data._id) {
                    _this.dataExists(data._type, data._id).then(function (doesExist) {
                        if (doesExist) {
                            resolve(undefined);
                        }
                        else {
                            var errorMessage = fieldConfig.getFieldName() + ' is required but was not set on the LeData and the object does not exist remotely, object, data: ' + JSON.stringify(data);
                            var error = new Error(errorMessage);
                            reject(error);
                        }
                    }, function (err) {
                        reject(err);
                    });
                }
                else {
                    var errorMessage = fieldConfig.getFieldName() + ' is required but was not set on the LeData and the object does not exist remotely, object, data: ' + JSON.stringify(data);
                    var error = new Error(errorMessage);
                    reject(error);
                }
            });
        }
        else {
            return ts_promise_1.default.resolve();
        }
    };
    LeDataService.prototype.fieldConfigTypeIsACustomLeDataType = function (fieldConfig) {
        var type = fieldConfig.getFieldType();
        return type !== 'string' && type !== 'boolean' && type !== 'number' && type !== 'Date' && type !== 'object';
    };
    LeDataService.prototype.dataExists = function (type, id) {
        return new ts_promise_1.default(function (resolve, reject) { });
    };
    LeDataService.prototype.fetchTypeConfig = function (type) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            var location = configObjectIndex + type;
            _this.dataServiceProvider.fetchData(location).then(function (returnedConfigObject) {
                var configObject = new le_type_config_1.default(returnedConfigObject.type);
                resolve(configObject);
            }, function (err) {
                reject(err);
            });
        });
    };
    ;
    LeDataService.prototype.saveData = function (data) {
        return new ts_promise_1.default(function (resovle, reject) { });
    };
    ;
    LeDataService.prototype.saveTypeConfig = function (config) {
        return new ts_promise_1.default(function () { });
    };
    LeDataService.prototype.syncData = function (type, id, callback, errorCallback) {
    };
    LeDataService.prototype.fetchData = function (type, id) {
        return new ts_promise_1.default(function () { });
    };
    return LeDataService;
})();
exports.LeDataService = LeDataService;
//# sourceMappingURL=le-data-service.js.map