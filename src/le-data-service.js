var ts_promise_1 = require("ts-promise");
var le_type_config_1 = require("./le-type-config");
var le_type_field_config_1 = require("./le-type-field-config");
var le_data_query_1 = require("./le-data-query");
var configObjectIndex = '_leTypeConfigs/';
var LeDataService = (function () {
    function LeDataService(provider) {
        this.dataServiceProvider = provider;
        this.queryDictionary = {};
        this.dataServiceProvider.sync('_leTypeConfigs', function () { }, function (err) { console.error(err); });
        this.dataServiceProvider.sync('_leTypeFieldConfigs', function () { }, function (err) { console.error(err); });
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
                    return _this.saveData(data);
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
                if (typeConfig.saveLocation) {
                    locationToReturn = typeConfig.saveLocation;
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
        var _this = this;
        this.validateQuery(query).then(function () {
            return _this.fetchQuery(query, true, undefined, callback, errorCallback, undefined);
        }).then(function (data) {
            if (callback) {
                callback(data);
            }
        }, function (err) {
            if (errorCallback) {
                errorCallback(err);
            }
        });
    };
    LeDataService.prototype.unsync = function (query) {
        var queryID = query.queryObject.queryID;
        var innerQueryObject = this.queryDictionary[queryID];
        if (innerQueryObject) {
            for (var location in innerQueryObject) {
                if (innerQueryObject.hasOwnProperty(location)) {
                    this.dataServiceProvider.unsync(location, innerQueryObject[location]);
                }
            }
            delete this.queryDictionary[queryID];
        }
    };
    LeDataService.prototype.search = function (query) {
        var _this = this;
        return this.validateQuery(query).then(function () {
            return _this.fetchQuery(query, false, undefined, undefined, undefined, undefined);
        });
    };
    LeDataService.prototype.fetchQuery = function (query, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var _this = this;
        var queryObject = query.queryObject;
        return this.fetchTypeConfig(queryObject.type).then(function (typeConfig) {
            return _this.fetchDataWithQueryObjectAndTypeConfig(query, typeConfig, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
        });
    };
    LeDataService.prototype.fetchDataWithQueryObjectAndTypeConfig = function (query, typeConfig, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryObject = query.queryObject;
        var dataType = queryObject.type;
        var dataID = queryObject.id;
        var location = typeConfig.saveLocation;
        if (dataID) {
            location += '/' + dataID;
        }
        var dataService = this;
        if (shouldSync && !syncDictionary) {
            syncDictionary = {};
            this.queryDictionary[queryObject.queryID] = syncDictionary;
        }
        if (!outerMostQuery) {
            outerMostQuery = query;
        }
        if (shouldSync) {
            this.syncLocation(location, outerMostQuery, syncDictionary, callback, errorCallback);
        }
        return this.dataServiceProvider.fetchData(location).then(function (rawQueryRoot) {
            if (dataID) {
                rawQueryRoot._id = dataID;
            }
            var fieldConfigs;
            if (typeConfig) {
                fieldConfigs = typeConfig.getFieldConfigs();
            }
            else {
                fieldConfigs = [];
            }
            if (dataID) {
                return dataService.addFieldsToRawDataObject(rawQueryRoot, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
            }
            else {
                return dataService.addFieldsToRawDataObjects(rawQueryRoot, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
            }
        });
    };
    LeDataService.prototype.syncLocation = function (location, query, syncDictionary, callback, errorCallback) {
        var dataService = this;
        if (!syncDictionary[location]) {
            var isFirstCallBack = true;
            function providerCallBack() {
                if (isFirstCallBack) {
                    isFirstCallBack = false;
                    return;
                }
                if (callback) {
                    dataService.search(query).then(function (data) {
                        callback(data);
                    });
                }
            }
            function providerErrorCallBack(err) {
                if (errorCallback) {
                    errorCallback(err);
                }
            }
            syncDictionary[location] = this.dataServiceProvider.sync(location, providerCallBack, providerErrorCallBack);
        }
    };
    LeDataService.prototype.addFieldsToRawDataObjects = function (rawDataObject, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var promises = [];
        var objectsToReturn = [];
        for (var objectID in rawDataObject) {
            if (rawDataObject.hasOwnProperty(objectID)) {
                promises.push(this.addFieldsToRawDataObject(rawDataObject[objectID], fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
                    objectsToReturn.push(data);
                }));
            }
        }
        return ts_promise_1.default.all(promises).then(function () {
            return objectsToReturn;
        });
    };
    LeDataService.prototype.addFieldsToRawDataObject = function (rawDataObject, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        if (!queryObject) {
            queryObject = {};
        }
        if (!queryObject.includedFields) {
            queryObject.includedFields = {};
        }
        var data = {};
        var fieldConfigsByLocation = this.fieldConfigsByLocation(fieldConfigs);
        var promises = [];
        this.addFetchFieldPromises(rawDataObject, fieldConfigsByLocation, queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
        return ts_promise_1.default.all(promises).then(function () {
            return data;
        });
    };
    LeDataService.prototype.addFetchFieldPromises = function (rawDataObject, fieldConfigsByLocation, queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        for (var rawFieldName in rawDataObject) {
            if (rawDataObject.hasOwnProperty(rawFieldName)) {
                var fieldConfig = fieldConfigsByLocation[rawFieldName];
                if (fieldConfig && !fieldConfig.hasOwnProperty('fieldName')) {
                    this.addFetchFieldPromises(rawDataObject[rawFieldName], fieldConfigsByLocation[rawFieldName], queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
                }
                else {
                    var fieldName = fieldConfig ? fieldConfig.getFieldName() : rawFieldName;
                    var innerQueryObject = queryObject.includedFields[fieldName];
                    promises.push(this.fetchFieldData(rawDataObject[rawFieldName], fieldConfig, innerQueryObject, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (fieldInfo) {
                        if (fieldInfo) {
                            data[fieldInfo.name] = fieldInfo.data;
                        }
                    }, function (err) {
                        console.warn(err);
                    }));
                }
            }
        }
    };
    LeDataService.prototype.fetchFieldData = function (rawValue, fieldConfig, fieldQueryObject, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        if (fieldConfig && this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && !fieldQueryObject) {
            return ts_promise_1.default.resolve();
        }
        if (!fieldQueryObject) {
            fieldQueryObject = {};
        }
        if (!fieldQueryObject.includedFields) {
            fieldQueryObject.includedFields = {};
        }
        var fieldInfo = { name: fieldName };
        if (!fieldConfig) {
            fieldInfo.data = rawValue;
            return ts_promise_1.default.resolve(fieldInfo);
        }
        else if (fieldConfig.getFieldType() === 'Date') {
            fieldInfo.data = new Date(rawValue);
            return ts_promise_1.default.resolve(fieldInfo);
        }
        else if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            var promises = [];
            var objectsForArrayField = [];
            for (var fieldDataID in rawValue) {
                if (rawValue.hasOwnProperty(fieldDataID)) {
                    promises.push(this.setDataForArrayField(objectsForArrayField, this.singularVersionOfType(fieldConfig), fieldDataID, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery));
                }
            }
            return ts_promise_1.default.all(promises).then(function () {
                fieldInfo.data = objectsForArrayField;
                return fieldInfo;
            });
        }
        else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
            return this.setDataOnFeildInfo(fieldInfo, this.singularVersionOfType(fieldConfig), rawValue, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
        }
        else {
            fieldInfo.data = rawValue;
            return ts_promise_1.default.resolve(fieldInfo);
        }
    };
    LeDataService.prototype.setDataOnFeildInfo = function (fieldInfo, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryForField = new le_data_query_1.default(type, id);
        queryForField.queryObject.includedFields = fieldQueryObject.includedFields;
        return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
            data._type = type;
            data._id = id;
            fieldInfo.data = data;
            return fieldInfo;
        });
    };
    LeDataService.prototype.fieldConfigsByLocation = function (fieldConfigs) {
        var fieldConfigsByLocation = {};
        if (fieldConfigs) {
            fieldConfigs.forEach(function (fieldConfig) {
                if (fieldConfig.saveLocation) {
                    var saveLocationArray = fieldConfig.saveLocation.split('/');
                    var currentScope = fieldConfigsByLocation;
                    saveLocationArray.forEach(function (subscope, index) {
                        if (!currentScope[subscope]) {
                            currentScope[subscope] = {};
                        }
                        if (index + 1 === saveLocationArray.length) {
                            currentScope[subscope] = fieldConfig;
                        }
                        currentScope = currentScope[subscope];
                    });
                }
                else {
                    fieldConfigsByLocation[fieldConfig.getFieldName()] = fieldConfig;
                }
            });
        }
        return fieldConfigsByLocation;
    };
    LeDataService.prototype.validateQuery = function (query) {
        var _this = this;
        var queryObject = query.queryObject;
        return this.fetchTypeConfig(queryObject.type).then(function (typeConfig) {
            var includedFields = queryObject.includedFields;
            var promises = [];
            for (var fieldName in includedFields) {
                if (includedFields.hasOwnProperty(fieldName)) {
                    var fieldConfig = typeConfig.getFieldConfig(fieldName);
                    if (!fieldConfig) {
                        var errorMessage = 'invalid field included in query, invalid field: ' + fieldName;
                        promises.push(ts_promise_1.default.reject(new Error(errorMessage)));
                    }
                    else {
                        promises.push(_this.validateQueryObject(includedFields[fieldName], fieldConfig));
                    }
                }
            }
            return ts_promise_1.default.all(promises);
        });
    };
    LeDataService.prototype.setDataForArrayField = function (objectsForArrayField, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryForField = new le_data_query_1.default(type, id);
        queryForField.queryObject.includedFields = fieldQueryObject.includedFields;
        return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
            data._id = id;
            data._type = type;
            objectsForArrayField.push(data);
        });
    };
    LeDataService.prototype.validateQueryObject = function (queryObject, fieldConfig) {
        var _this = this;
        return this.fetchTypeConfig(this.singularVersionOfType(fieldConfig)).then(function (typeConfig) {
            var includedFields = queryObject.includedFields;
            var promises = [];
            for (var fieldName in includedFields) {
                if (includedFields.hasOwnProperty(fieldName)) {
                    var fieldConfig = typeConfig.getFieldConfig(fieldName);
                    if (!fieldConfig) {
                        var errorMessage = 'invalid field included in query, invalid field: ' + fieldName;
                        promises.push(ts_promise_1.default.reject(new Error(errorMessage)));
                    }
                    else {
                        promises.push(_this.validateQueryObject(includedFields[fieldName], fieldConfig));
                    }
                }
            }
            return ts_promise_1.default.all(promises);
        });
    };
    LeDataService.prototype.configureType = function (config) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            var configObjectToSave = {};
            configObjectToSave.type = config.getType();
            configObjectToSave.saveLocation = config.saveLocation;
            var location = configObjectIndex + configObjectToSave.type;
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
            ts_promise_1.default.all(promises).then(function () {
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
        var fieldType = fieldConfig.getFieldType();
        if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            fieldConfigObject.many = true;
            fieldType = this.singularVersionOfType(fieldConfig);
        }
        fieldConfigObject.type = fieldType;
        fieldConfigObject.fieldName = fieldConfig.getFieldName();
        fieldConfigObject.cascadeDelete = fieldConfig.cascadeDelete;
        fieldConfigObject.required = fieldConfig.required;
        fieldConfigObject.convertToLocalTimeZone = fieldConfig.convertToLocalTimeZone;
        fieldConfigObject.saveLocation = fieldConfig.saveLocation;
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
        return ts_promise_1.default.all(promises).then(function () {
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
        return ts_promise_1.default.all(promises).then(function () {
            var typeToSet = fieldConfigObject.many ? fieldConfigObject.type + '[]' : fieldConfigObject.type;
            var fieldConfig = new le_type_field_config_1.default(fieldConfigObject.fieldName, typeToSet);
            fieldConfig.cascadeDelete = fieldConfigObject.cascadeDelete;
            fieldConfig.required = fieldConfigObject.required;
            fieldConfig.convertToLocalTimeZone = fieldConfigObject.convertToLocalTimeZone;
            fieldConfig.saveLocation = fieldConfigObject.saveLocation;
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
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_' && !typeConfig.fieldExists(key)) {
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
        for (var key in data[fieldConfig.getFieldName()]) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_' && data.hasOwnProperty(key) && !fieldConfig.fieldExists(key)) {
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
        var validationPromises = [];
        var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data);
        var typePromise = this.validateTypeOnField(fieldConfig, data);
        validationPromises.push(requiredPromise);
        validationPromises.push(typePromise);
        return ts_promise_1.default.all(validationPromises);
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
        else if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            var fieldData = data[fieldName];
            if (fieldData.constructor === Array) {
                var isValid = true;
                for (var i = 0; i < fieldData.length; i += 1) {
                    if (fieldData[i]._type !== this.singularVersionOfType(fieldConfig)) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    return ts_promise_1.default.resolve();
                }
            }
        }
        var errorMessage = 'The specified field is set to an invalid type -\n';
        errorMessage += 'fieldName: ' + fieldName + '\n';
        errorMessage += "field's set type: " + type + '\n';
        errorMessage += 'data: ' + JSON.stringify(data);
        var error = new Error(errorMessage);
        return ts_promise_1.default.reject(error);
    };
    LeDataService.prototype.isFieldConfigTypeAnArray = function (fieldConfig) {
        var fieldType = fieldConfig.getFieldType();
        return fieldType.indexOf('[]') === fieldType.length - 2;
    };
    LeDataService.prototype.singularVersionOfType = function (fieldConfig) {
        var fieldType = fieldConfig.getFieldType();
        if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            return fieldType.substring(0, fieldType.length - 2);
        }
        else {
            return fieldType;
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
        return new ts_promise_1.default(function (resolve, reject) {
            var typeConfig = new le_type_config_1.default(typeConfigObject.type);
            typeConfig.saveAt(typeConfigObject.saveLocation);
            var promises = [];
            for (var fieldConfigID in typeConfigObject.fieldConfigs) {
                if (typeConfigObject.fieldConfigs.hasOwnProperty(fieldConfigID)) {
                    promises.push(_this.fetchTypeFieldConfig(fieldConfigID).then(function (fieldConfig) {
                        typeConfig.addField(fieldConfig);
                    }));
                }
            }
            ts_promise_1.default.all(promises).then(function () {
                resolve(typeConfig);
            });
        });
    };
    LeDataService.prototype.saveData = function (data) {
        var _this = this;
        return this.locationForData(data).then(function (location) {
            var updateCreatedAtPropmise;
            if (!data._id) {
                data._createdAt = new Date();
                updateCreatedAtPropmise = ts_promise_1.default.resolve();
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
            return ts_promise_1.default.all(promises);
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
            if (typeConfig.saveLocation) {
                location = typeConfig.saveLocation;
            }
            location += '/' + data._id;
            if (fieldConfig && fieldConfig.saveLocation) {
                location += '/' + fieldConfig.saveLocation;
            }
            else {
                location += '/' + fieldName;
            }
            if (fieldConfig && fieldConfig.isCustomeType()) {
                return _this.saveDataAndSetReferenceAtLocation(data[fieldName], location);
            }
            else if (fieldConfig && fieldConfig.getFieldType() === 'object') {
                return _this.saveObjectField(location, fieldConfig, data[fieldName]);
            }
            else {
                return _this.dataServiceProvider.updateData(location, data[fieldName]);
            }
        });
    };
    LeDataService.prototype.saveDataAndSetReferenceAtLocation = function (data, location) {
        var _this = this;
        if (data.constructor === Array) {
            var objectToSetAtLocation = {};
            var promises = [];
            data.forEach(function (dataObjectInArray) {
                promises.push(_this.saveData(dataObjectInArray).then(function (returnedData) {
                    objectToSetAtLocation[returnedData._id] = true;
                }));
            });
            return ts_promise_1.default.all(promises).then(function () {
                return _this.dataServiceProvider.updateData(location, objectToSetAtLocation);
            });
        }
        else {
            return this.saveData(data).then(function (returnedData) {
                return _this.dataServiceProvider.updateData(location, returnedData._id);
            });
        }
    };
    LeDataService.prototype.saveObjectField = function (location, fieldConfig, data) {
        var promises = [];
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            var innerLocation;
            if (innerFieldConfig.saveLocation) {
                innerLocation = location + innerFieldConfig.saveLocation;
            }
            else {
                innerLocation = location + innerFieldConfig.getFieldName();
            }
            promises.push(this.saveField(innerLocation, innerFieldConfig, data[innerFieldConfig.getFieldName()]));
        }
        return ts_promise_1.default.all(promises);
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
    return LeDataService;
})();
exports.LeDataService = LeDataService;
//# sourceMappingURL=le-data-service.js.map