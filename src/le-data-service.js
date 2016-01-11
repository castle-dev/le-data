/// <reference path="le-data.ts"/>
/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
var ts_promise_1 = require("ts-promise");
var le_type_config_1 = require("./le-type-config");
var le_type_field_config_1 = require("./le-type-field-config");
var configObjectIndex = '_leTypeConfigs/';
/**
 * The main service for the module.
 * In charge of sending and recieving arbitrary JSON data to
 * and from an remote storage provicer.
 *
 * @class LeDataService
 * @param LeDataServiceProvider - The object that will be acting directly
 *                                with the remote storage provider.
 *
 */
var LeDataService = (function () {
    function LeDataService(provider) {
        this.dataServiceProvider = provider;
    }
    /**
     * Creates the passed in data in the remote storage provider.
     * Sets id if no id is set. Sets _createdAt and _lastUpdatedAt.
     * Fails if _type is not set. Fails if the object does not adhere to the type configuration.
     *
     * @function createData
     * @memberof LeDataService
     * @instance
     * @param data LeData - The data to create.
     * @returns Promise<LeData> resolves with the data that was saved.
     */
    LeDataService.prototype.createData = function (data) {
        var _this = this;
        if (!data) {
            var errorMessage = 'No data passed to createData function';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'No _type specified in LeData object passed to createData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (data._id) {
            return new ts_promise_1["default"](function (resolve, reject) {
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
            return new ts_promise_1["default"](function (resolve, reject) {
                _this.validateData(data).then(function () {
                    return _this.saveData(data);
                }).then(function (returnedData) {
                    resolve(returnedData);
                }, function (err) {
                    reject(err);
                });
            });
        }
    };
    /**
     * Updates the data in the database. This only removes data from the database if the field is specified
     * If a LeData object is removed from a field that is configured to cascade deletes, the data will be soft deleted.
     * Sets _lastUpdatedAt.
     *
     * Fails if _type or _id is not set. Fails if the object does not adhere to the type configuration.
     * Fails if any of the values for the fields specified in the LeData interface differ from the ones saved in the database.
     *
     * @function updateData
     * @memberof LeDataService
     * @instance
     * @param data LeData - The data to update.
     * @returns Promise<LeData> resolves with the data that was saved.
     */
    LeDataService.prototype.updateData = function (data) {
        var _this = this;
        if (!data) {
            var errorMessage = 'No data passed to updateData function';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'No _type specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._id) {
            var errorMessage = 'No _id specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        return new ts_promise_1["default"](function (resolve, reject) {
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
        return new ts_promise_1["default"](function (resolve, reject) {
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
    /**
     * Soft deletes the data in the database.
     * If a LeData object is configured with fields that cascade delete, the data at those fields will also soft delete.
     * Sets _deletedAt, and _lastUpdatedAt.
     *
     * @function deleteData
     * @memberof LeDataService
     * @instance
     * @param type string - the _type of the data.
     * @param id string - the _id of the data.
     * @returns Promise<void>.
     */
    LeDataService.prototype.deleteData = function (type, id) {
        if (!type) {
            var errorMessage = 'Undefined type passed to deleteData.\ntype: ' + type + ' id: ' + id;
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!id) {
            var errorMessage = 'Undefined id passed to deleteData.\ntype: ' + type + ' id: ' + id;
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        return this.deleteData(type, id);
    };
    /**
     * Retrieves the data that matches the query data, and retrieves it again every time the data that matches the query has changed.
     *
     * Fails if the LeDataQuery object is invalid
   *
     * @function sync
     * @memberof LeDataService
     * @instance
     * @param query LeDataQuery - The query used to get the data.
     * @param callback (data: LeData) => void - a function that is passed the data every time the data is retrieved from the remote storage provider
     * @param errorCallback (error: Error) => void - a function that is called if something went wrong with the data retrival,
     *					such as not having access to the requested data.
     */
    LeDataService.prototype.sync = function (query, callback, errorCallback) {
    };
    /**
     * Stops listening to a synced query. This needs to be called when the sync is no longer being used to avoid memory leaks and improve performance.
     *
     * @function unsync
     * @memberof LeDataService
     * @instance
     * @param query LeDataQuery - The query used in the origional sync. It must have the same id as the query used to sync. This insures that only the syncs used for that query object are removed.
     */
    LeDataService.prototype.unsync = function (query) {
    };
    /**
     * Retrieves the data that matches the query data.
     *
     * Fails if the LeDataQuery object is invalid
     *
     * @function search
     * @memberof LeDataService
     * @instance
     * @param query LeDataQuery - The query used to get the data.
     * @returns Promise<LeData> resolves with the desired data.
     */
    LeDataService.prototype.search = function (query) {
        return new ts_promise_1["default"](function (resolve, reject) { });
    };
    /**
     * Configures what passes as valid for the specified data type.
     *
     * @function configureType
     * @memberof LeDataService
     *
     * @instance
     *
     * @param config LeTypeConfig - The object that defines how the type should be configured.
     * @returns Promis<any> - Resolves with no data when the type has been successfully configured.
     */
    LeDataService.prototype.configureType = function (config) {
        var _this = this;
        return new ts_promise_1["default"](function (resolve, reject) {
            var configObjectToSave = {};
            configObjectToSave.type = config.getType();
            configObjectToSave.saveAt = config.saveAt;
            var location = configObjectIndex + configObjectToSave.type;
            configObjectToSave.fieldConfigObjects = {};
            var fieldConfigs = config.getFieldConfigs();
            var promises = [];
            for (var i = 0; i < fieldConfigs.length; i += 1) {
                var fieldConfig = fieldConfigs[i];
                promises.push(_this.saveFieldConfig(fieldConfig).then(function (returnedFieldConfigID) {
                    if (!configObjectToSave.fieldConfigs) {
                        configObjectToSave.fieldConfigs = {};
                    }
                    configObjectToSave.fieldConfigs[returnedFieldConfigID] = true;
                }));
            }
            ts_promise_1["default"].all(promises).then(function () {
                _this.dataServiceProvider.updateData(location, configObjectToSave).then(function () {
                    resolve(undefined);
                }, function (err) {
                    reject(err);
                });
            });
        });
    };
    LeDataService.prototype.saveFieldConfig = function (fieldConfig) {
        var _this = this;
        var fieldConfigObject = {};
        fieldConfigObject.type = fieldConfig.getFieldType();
        fieldConfigObject.fieldName = fieldConfig.getFieldName();
        fieldConfigObject.cascadeDelete = fieldConfig.cascadeDelete;
        fieldConfigObject.required = fieldConfig.required;
        fieldConfigObject.convertToLocalTimeZone = fieldConfig.convertToLocalTimeZone;
        var promises = [];
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            promises.push(this.saveFieldConfig(innerFieldConfig).then(function (returnedFieldConfigID) {
                if (!fieldConfigObject.fieldConfigs) {
                    fieldConfigObject.fieldConfigs = {};
                }
                fieldConfigObject.fieldConfigs[returnedFieldConfigID] = true;
            }));
        }
        return ts_promise_1["default"].all(promises).then(function () {
            return _this.dataServiceProvider.createData('_leTypeFieldConfigs', fieldConfigObject);
        }).then(function (returnedConfigObject) {
            return returnedConfigObject._id;
        });
    };
    LeDataService.prototype.fieldConfigForFieldConfigObject = function (fieldConfigObject) {
        var promises = [];
        var innerFieldConfigs = [];
        if (fieldConfigObject.fieldConfigs) {
            for (var fieldConfigID in fieldConfigObject.fieldConfigs) {
                promises.push(this.fetchTypeFieldConfig(fieldConfigID).then(function (returnedFieldConfig) {
                    innerFieldConfigs.push(returnedFieldConfig);
                }));
            }
        }
        return ts_promise_1["default"].all(promises).then(function () {
            var fieldConfig = new le_type_field_config_1["default"](fieldConfigObject.fieldName, fieldConfigObject.type);
            fieldConfig.cascadeDelete = fieldConfigObject.cascadeDelete;
            fieldConfig.required = fieldConfigObject.required;
            fieldConfig.convertToLocalTimeZone = fieldConfigObject.convertToLocalTimeZone;
            for (var i = 0; i < innerFieldConfigs.length; i += 1) {
                var innerFieldConfig = innerFieldConfigs[i];
                fieldConfig.addField(innerFieldConfig);
            }
            return fieldConfig;
        });
    };
    LeDataService.prototype.validateData = function (data) {
        var _this = this;
        if (!data) {
            var errorMessage = 'Invalid LeData object - cannot be undefined';
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        if (!data._type) {
            var errorMessage = 'Invalid LeData object - _type must be set, data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            var promise = new ts_promise_1["default"](function (resolve, reject) {
                reject(error);
            });
            return promise;
        }
        var configLocation = configObjectIndex + data._type;
        return new ts_promise_1["default"](function (resolve, reject) {
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
                return ts_promise_1["default"].all(validateFieldPromises).then(function () {
                    resolve(undefined);
                }, function (error) {
                    reject(error);
                });
            });
        });
    };
    LeDataService.prototype.validateNoExtraFields = function (typeConfig, data) {
        for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_' && !typeConfig.fieldExists(key)) {
                var errorMessage = 'An additional field was set on the data object.\n';
                errorMessage += 'the field "' + key + '" is not configured on objects of type ' + data._type + '\n';
                errorMessage += 'data: ' + JSON.stringify(data);
                var error = new Error(errorMessage);
                return ts_promise_1["default"].reject(error);
            }
        }
        return ts_promise_1["default"].resolve();
    };
    LeDataService.prototype.validateNoExtraFieldsOnObject = function (fieldConfig, data) {
        for (var key in data[fieldConfig.getFieldName()]) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_' && data.hasOwnProperty(key) && !fieldConfig.fieldExists(key)) {
                var errorMessage = 'An additional field was set on the data object.\n';
                errorMessage += 'the field "' + key + '" is not configured on the object\n';
                errorMessage += 'data: ' + JSON.stringify(data);
                var error = new Error(errorMessage);
                return ts_promise_1["default"].reject(error);
            }
        }
        return ts_promise_1["default"].resolve();
    };
    LeDataService.prototype.validateField = function (fieldConfig, data) {
        var validationPromises = [];
        var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data);
        var typePromise = this.validateTypeOnField(fieldConfig, data);
        validationPromises.push(requiredPromise);
        validationPromises.push(typePromise);
        return ts_promise_1["default"].all(validationPromises);
    };
    LeDataService.prototype.validateTypeOnField = function (fieldConfig, data) {
        var type = fieldConfig.getFieldType();
        var fieldName = fieldConfig.getFieldName();
        if (!data[fieldName]) {
            return ts_promise_1["default"].resolve();
        }
        else if (type === 'object') {
            return this.validateObjectTypeOnField(fieldConfig, data);
        }
        else if (typeof data[fieldName] === type) {
            return ts_promise_1["default"].resolve();
        }
        else if (type === 'Date' && data[fieldName] instanceof Date) {
            return ts_promise_1["default"].resolve();
        }
        else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && type === data[fieldName]._type) {
            return ts_promise_1["default"].resolve();
        }
        else {
            var errorMessage = 'The specified field is set to an invalid type -\n';
            errorMessage += 'fieldName: ' + fieldName + '\n';
            errorMessage += "field's configured type: " + type + '\n';
            errorMessage += 'data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
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
        return new ts_promise_1["default"](function (resolve, reject) {
            ts_promise_1["default"].all(promises).then(function () {
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
            return ts_promise_1["default"].reject(error);
        }
        else if (fieldConfig.required && !data[fieldName]) {
            return new ts_promise_1["default"](function (resolve, reject) {
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
            return ts_promise_1["default"].resolve();
        }
    };
    LeDataService.prototype.fieldConfigTypeIsACustomLeDataType = function (fieldConfig) {
        var type = fieldConfig.getFieldType();
        return type !== 'string' && type !== 'boolean' && type !== 'number' && type !== 'Date' && type !== 'object';
    };
    /**
     * Checks if the data with the specified type and id exist remotely.
     * Fails if id is undefined.
     * Fails if type is undefined.
     * Fails if the type is not configured.
     *
     * @function dataExists
     * @memberof LeDataServiceProvider
     * @instance
     * @param type string - The type of the data we are checking.
     * @returns Promise<boolean> resolves with true if the data exists remotely.
     */
    LeDataService.prototype.dataExists = function (type, id) {
        return new ts_promise_1["default"](function (resolve, reject) { });
    };
    /**
     * Returns the LeTypeConfig stored remotely for the specified type
     * Fails if the type is not configured
     *
     * @function ypeConfig
     * @memberof LeDataServiceProvider
     * @instance
     * @param type LeDataQuery - The type for the LeTypeConfig
     * @returns Promise<LeTypeConfig>
     */
    LeDataService.prototype.fetchTypeConfig = function (type) {
        var _this = this;
        return new ts_promise_1["default"](function (resolve, reject) {
            var location = configObjectIndex + type;
            _this.dataServiceProvider.fetchData(location).then(function (returnedConfigObject) {
                var typeConfig = new le_type_config_1["default"](returnedConfigObject.type);
                return _this.typeConfigForTypeConfigObject(returnedConfigObject);
            }).then(function (typeConfig) {
                resolve(typeConfig);
            }, function (err) {
                reject(err);
            });
        });
    };
    ;
    LeDataService.prototype.fetchTypeFieldConfig = function (fieldConfigID) {
        var _this = this;
        var location = '_leTypeFieldConfigs/' + fieldConfigID;
        return this.dataServiceProvider.fetchData(location).then(function (fieldConfigObject) {
            return _this.fieldConfigForFieldConfigObject(fieldConfigObject);
        });
    };
    LeDataService.prototype.typeConfigForTypeConfigObject = function (typeConfigObject) {
        var _this = this;
        return new ts_promise_1["default"](function (resolve, reject) {
            var typeConfig = new le_type_config_1["default"](typeConfigObject.type);
            var promises = [];
            for (var fieldConfigID in typeConfigObject.fieldConfigs) {
                if (typeConfigObject.fieldConfigs.hasOwnProperty(fieldConfigID)) {
                    promises.push(_this.fetchTypeFieldConfig(fieldConfigID).then(function (fieldConfig) {
                        typeConfig.addField(fieldConfig);
                    }));
                }
            }
            ts_promise_1["default"].all(promises).then(function () {
                resolve(typeConfig);
            });
        });
    };
    /**
     * Saves the LeData remotely. It will recursively save all the data.
     * This will not do any checks on if the data is valid.
     * only removes fields if the field is explicitly passed with undefined set as the value
     *
     * @function saveData
     * @memberof LeDataServiceProvider
     * @instance
     * @param data LeData - The data to be saved.
     * @returns Promise<LeData>
     */
    LeDataService.prototype.saveData = function (data) {
        var _this = this;
        return this.locationForData(data).then(function (location) {
            var updateCreatedAtPropmise;
            if (!data._id) {
                data._createdAt = new Date();
                updateCreatedAtPropmise = ts_promise_1["default"].resolve();
            }
            else {
                updateCreatedAtPropmise = _this.dataServiceProvider.dataExists(location).then(function (doesExist) {
                    if (!doesExist) {
                        data._createdAt = new Date();
                    }
                });
            }
            return updateCreatedAtPropmise;
        }).then(function () {
            data._lastUpdatedAt = new Date();
            if (!data._id) {
                return _this.saveToCreateID(data);
            }
        }).then(function () {
            var promises = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    promises.push(_this.saveFieldForData(data, key));
                }
            }
            return ts_promise_1["default"].all(promises);
        }).then(function () {
            return data;
        });
    };
    ;
    LeDataService.prototype.saveFieldForData = function (data, fieldName) {
        var _this = this;
        var location;
        var fieldConfig;
        return this.fetchTypeConfig(data._type).then(function (typeConfig) {
            fieldConfig = typeConfig.getFieldConfig(fieldName);
            location = data._type;
            if (typeConfig.saveAt) {
                location = typeConfig.saveAt;
            }
            location += '/' + data._id;
            if (fieldConfig && fieldConfig.saveAt) {
                location += '/' + fieldConfig.saveAt;
            }
            else {
                location += '/' + fieldName;
            }
            if (fieldConfig && fieldConfig.isCustomeType()) {
                return _this.saveData(data[fieldName]);
            }
        }).then(function (returnedData) {
            if (returnedData) {
                return _this.dataServiceProvider.updateData(location, returnedData._id);
            }
            else if (fieldConfig && fieldConfig.getFieldType() === 'object') {
                return _this.saveObjectField(location, fieldConfig, data[fieldName]);
            }
            else {
                return _this.dataServiceProvider.updateData(location, data[fieldName]);
            }
        });
    };
    LeDataService.prototype.saveObjectField = function (location, fieldConfig, data) {
        var promises = [];
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            var innerLocation;
            if (innerFieldConfig.saveAt) {
                innerLocation = location + innerFieldConfig.saveAt;
            }
            else {
                innerLocation = location + innerFieldConfig.getFieldName();
            }
            promises.push(this.saveField(innerLocation, innerFieldConfig, data[innerFieldConfig.getFieldName()]));
        }
        return ts_promise_1["default"].all(promises);
    };
    LeDataService.prototype.saveField = function (location, fieldConfig, fieldData) {
        var _this = this;
        if (fieldConfig.isCustomeType()) {
            return this.saveData(fieldData).then(function (returnedData) {
                return _this.dataServiceProvider.updateData(location, returnedData._id);
            });
        }
        else if (fieldConfig.getFieldType() === 'object') {
            return this.saveObjectField(location, fieldConfig, fieldData);
        }
    };
    LeDataService.prototype.saveToCreateID = function (data) {
        var _this = this;
        return this.locationForData(data).then(function (location) {
            return _this.dataServiceProvider.createData(location, { _type: data._type });
        }).then(function (returnedData) {
            data._id = returnedData._id;
        });
    };
    /**
     * Saves the LeTypeConfig remotely.
     *
     * @function saveTypeConfig
     * @memberof LeDataServiceProvider
     * @instance
     * @param config LeTypeConfig - The LeTypeConfig to be saved.
     * @returns Promise<void>
     */
    LeDataService.prototype.saveTypeConfig = function (config) {
        return new ts_promise_1["default"](function () { });
    };
    /**
     * Sync with the remote data.
     *
     * @function syncData
     * @memberof LeDataServiceProvider
     * @instance
     * @param type string - the type of the data to sync.
     * @param id string - the id of the data to sync.
     * @param callback (LeData)=>void - the method called when the data is initially retieved and each time the data changes
     * @param errorCallback (Error)=>void - the method called when ever there is an error with the sync
     * @returns Promise<void>
     */
    LeDataService.prototype.syncData = function (type, id, callback, errorCallback) {
    };
    /**
     * fetches the remotely stored LeData object.
     * The child LeData fields are not fetched,
     * instead the id's for those feilds are returned in feilds with the "_id_" or "_ids_" prepended on it
     * depending on if the field is sigular or an array of objects
     *
     * @function fetchData
     * @memberof LeDataServiceProvider
     * @instance
     * @param type string - the type of the data to fetch.
     * @param id string - the id of the data to fetch.
     * @returns Promise<LeData>
     */
    LeDataService.prototype.fetchData = function (type, id) {
        return new ts_promise_1["default"](function () { });
    };
    return LeDataService;
})();
exports.LeDataService = LeDataService;
