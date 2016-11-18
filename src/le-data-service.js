/// <reference path="le-data.ts"/>
var ts_promise_1 = require("ts-promise");
var le_data_service_provider_1 = require("./le-data-service-provider");
var le_type_config_1 = require("./le-type-config");
var le_type_field_config_1 = require("./le-type-field-config");
var le_data_query_1 = require("./le-data-query");
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
        var _this = this;
        this.dataServiceProvider = provider;
        this.queryDictionary = {};
        this.dataServiceProvider.sync('_leTypeConfigs', function () { }, function (err) { console.error(err); });
        this.dataServiceProvider.sync('_leTypeFieldConfigs', function () { }, function (err) { console.error(err); });
        this.dataServiceProvider.sync('_leServiceConfig', function (serviceConfigObject) {
            _this.hasLoadedServiceConfig = true;
            _this.updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject);
        }, function (err) {
            console.error(err);
        });
        this.updateServiceConfigVariablesWithServiceConfigObject(undefined);
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
                _this.checkExistence(data._type, data._id).then(function (dataExists) {
                    if (dataExists) {
                        var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
                        var error = new Error(errorMessage);
                        reject(error);
                    }
                    else {
                        return _this.validateData(data, false);
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
                _this.validateData(data, false).then(function () {
                    return _this.saveData(data);
                }).then(function (returnedData) {
                    resolve(returnedData);
                }, function (err) {
                    reject(err);
                });
            });
        }
    };
    LeDataService.prototype.create = function (data) {
        return this.createData(data);
    };
    LeDataService.prototype.update = function (data) {
        return this.updateData(data);
    };
    LeDataService.prototype.delete = function (type, id) {
        return this.deleteData(type, id);
    };
    /**
     * Checks of the data with the specified type and id exists remotely.
     *
     * @function checkExistence
     * @memberof LeDataService
     * @instance
     * @param type string - The type of the data.
     * @param id string - The id for the data.
     * @returns Promise<boolean> resolves true if the data exists and false if it does not.
     */
    LeDataService.prototype.checkExistence = function (type, id) {
        var _this = this;
        return this.fetchTypeConfig(type).then(function (typeConfig) {
            var location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
            location += '/' + id;
            var deletedAtLocation = location + '/' + _this.deletedAtSaveLocation;
            return ts_promise_1["default"].all([
                _this.dataServiceProvider.dataExists(location),
                _this.dataServiceProvider.dataExists(deletedAtLocation)
            ]).then(function (results) {
                var dataExists = results[0];
                var hasDeletedAtField = results[1];
                return dataExists && !hasDeletedAtField;
            });
        });
    };
    /**
     * Locks the word so that you know no one else
     * is performing the action that word represents
     * at the same time as you. Make sure to use unlock
     * when you have completed the task.
     *
     * @function lock
     * @memberof LeDataService
     * @instance
     * @param word string - The word you are locking.
     * @returns Promise<void> resolves if the word was successfully lock. Rejects if the word is already locked.
     */
    LeDataService.prototype.lock = function (word) {
        return this.dataServiceProvider.lock(word);
    };
    /**
     * Unlocks the word that was locked earlier to allow
     * others to perform the action that word represents.
     *
     * @function unlock
     * @memberof LeDataService
     * @instance
     * @param word string - The word you are unlocking.
     * @returns Promise<void> resolves if the word was successfully unlocked.
     */
    LeDataService.prototype.unlock = function (word) {
        return this.dataServiceProvider.unlock(word);
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
            _this.checkExistence(data._type, data._id).then(function (dataExists) {
                if (dataExists) {
                    return _this.validateData(data, true);
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
        var _this = this;
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
        var typeConfig;
        var updateDeletedAtData = { _type: type, _id: id };
        updateDeletedAtData[this.deletedAtFieldName] = new Date();
        return this.updateData(updateDeletedAtData).then(function () {
            return _this.fetchTypeConfig(type);
        }).then(function (returnedTypeConfig) {
            typeConfig = returnedTypeConfig;
            return _this.cascadeDeletes(typeConfig, id);
        }).then(function () {
            var location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
            location += '/' + id;
            return _this.dataServiceProvider.fetchData(location);
        }).then(function (data) {
            if (!_this.archiveDeletedData) {
                return ts_promise_1["default"].resolve();
            }
            var location = _this.archiveLocation + '/';
            location += typeConfig.saveLocation ? typeConfig.saveLocation : type;
            location += '/' + id;
            return _this.dataServiceProvider.updateData(location, data);
        }).then(function () {
            var location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
            location += '/' + id;
            return _this.dataServiceProvider.deleteData(location);
        });
    };
    LeDataService.prototype.removeDataFromArray = function (type, id, fieldName, data) {
        var dataService = this;
        return dataService.fetchTypeConfig(type).then(function (typeConfig) {
            var fieldConfig = typeConfig.getFieldConfig(fieldName);
            var location;
            if (typeConfig.saveLocation) {
                location = typeConfig.saveLocation;
            }
            else {
                location = typeConfig.getType();
            }
            location += '/' + id + '/';
            if (fieldConfig.saveLocation) {
                location += fieldConfig.saveLocation;
            }
            else {
                location += fieldConfig.getFieldName();
            }
            if (dataService.isFieldConfigTypeAnArray(fieldConfig)) {
                location += '/' + data._id;
            }
            else {
                var errorMessage = 'The specified field is not an array';
                var error = new Error(errorMessage);
                return ts_promise_1["default"].reject(error);
            }
            return dataService.dataServiceProvider.updateData(location, undefined);
        });
    };
    LeDataService.prototype.cascadeDeletes = function (typeConfig, id) {
        var _this = this;
        var fieldConfigs = typeConfig.getFieldConfigs();
        var promises = [];
        fieldConfigs.forEach(function (fieldConfig) {
            promises.push(_this.handleCascadeDelete(typeConfig, fieldConfig, id));
        });
        return ts_promise_1["default"].all(promises);
    };
    LeDataService.prototype.handleCascadeDelete = function (typeConfig, fieldConfig, id) {
        var _this = this;
        if (!fieldConfig.cascadeDelete) {
            return ts_promise_1["default"].resolve();
        }
        var type = typeConfig.getType();
        var fieldName = fieldConfig.getFieldName();
        return this.checkExistence(type, id).then(function (doesExist) {
            var promiseToReturn = ts_promise_1["default"].resolve();
            if (doesExist) {
                var query = new le_data_query_1["default"](type, id);
                query.include(fieldName);
                promiseToReturn = _this.search(query);
            }
            return promiseToReturn;
        }).then(function (data) {
            var promise = ts_promise_1["default"].resolve();
            if (!data || !data[fieldName] || typeof data[fieldName] === 'string') {
                return promise;
            }
            if (data[fieldName] instanceof Array) {
                var promises = [];
                data[fieldName].forEach(function (objectToDelete) {
                    promises.push(_this.deleteData(objectToDelete._type, objectToDelete._id));
                });
                promise = ts_promise_1["default"].all(promises);
            }
            else if (data[fieldName]._type && data[fieldName]._id) {
                promise = _this.deleteData(data[fieldName]._type, data[fieldName]._id);
            }
            return promise;
        });
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
    /**
     * Stops listening to a synced query. This needs to be called when the sync is no longer being used to avoid memory leaks and improve performance.
     *
     * @function unsync
     * @memberof LeDataService
     * @instance
     * @param query LeDataQuery - The query used in the origional sync. It must have the same id as the query used to sync. This insures that only the syncs used for that query object are removed.
     */
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
        }).then(function (data) {
            if (!data || data[_this.deletedAtFieldName]) {
                throw new Error('No data exists for Type ' + queryObject.type + ' and ID ' + queryObject.id);
            }
            return data;
        });
    };
    LeDataService.prototype.fetchDataWithQueryObjectAndTypeConfig = function (query, typeConfig, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryObject = query.queryObject;
        var dataType = queryObject.type;
        var dataID = queryObject.id;
        var location = typeConfig.saveLocation;
        if (!location) {
            location = typeConfig.getType();
        }
        if (dataID) {
            location += '/' + dataID;
        }
        var dataService = this;
        if (shouldSync && !syncDictionary) {
            if (this.queryDictionary[queryObject.queryID]) {
                syncDictionary = this.queryDictionary[queryObject.queryID];
            }
            else {
                syncDictionary = {};
                this.queryDictionary[queryObject.queryID] = syncDictionary;
            }
        }
        if (!outerMostQuery) {
            outerMostQuery = query;
        }
        if (shouldSync) {
            this.syncLocation(location, outerMostQuery, syncDictionary, callback, errorCallback);
        }
        var fetchDataOptions = {};
        if (queryObject.hasOwnProperty('filterFieldName')) {
            var filterFieldConfig = this.fieldConfigForFilterFieldName(queryObject.filterFieldName, typeConfig);
            fetchDataOptions.filterFieldName = filterFieldConfig.saveLocation ? filterFieldConfig.saveLocation : queryObject.filterFieldName;
            fetchDataOptions.filterValue = queryObject.filterValue;
            if (fetchDataOptions.filterValue === undefined) {
                fetchDataOptions.filterValue = null;
            }
        }
        return this.dataServiceProvider.fetchData(location, fetchDataOptions).then(function (rawQueryRoot) {
            if (dataID) {
                if (!rawQueryRoot || rawQueryRoot[this.deletedAtSaveLocation]) {
                    throw new Error('No data exists of type ' + dataType + ' with id ' + dataID + '. Queries cannot start with data that does not exist. Use checkExistence before searching if there is a risk of the data not existing.');
                }
                rawQueryRoot._id = dataID;
                rawQueryRoot._type = dataType;
            }
            else {
                for (var idAsKey in rawQueryRoot) {
                    if (rawQueryRoot.hasOwnProperty(idAsKey)) {
                        rawQueryRoot[idAsKey]._id = idAsKey;
                        rawQueryRoot[idAsKey]._type = dataType;
                    }
                }
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
    LeDataService.prototype.updateServiceConfigVariablesWithServiceConfigObject = function (serviceConfigObject) {
        if (!serviceConfigObject) {
            serviceConfigObject = {};
        }
        this.createdAtFieldName = serviceConfigObject.createdAtFieldName ? serviceConfigObject.createdAtFieldName : '_createdAt';
        this.createdAtSaveLocation = serviceConfigObject.createdAtSaveLocation ? serviceConfigObject.createdAtSaveLocation : '_createdAt';
        this.lastUpdatedAtFieldName = serviceConfigObject.lastUpdatedAtFieldName ? serviceConfigObject.lastUpdatedAtFieldName : '_lastUpdatedAt';
        this.lastUpdatedAtSaveLocation = serviceConfigObject.lastUpdatedAtSaveLocation ? serviceConfigObject.lastUpdatedAtSaveLocation : '_lastUpdatedAt';
        this.deletedAtFieldName = serviceConfigObject.deletedAtFieldName ? serviceConfigObject.deletedAtFieldName : '_deletedAt';
        this.deletedAtSaveLocation = serviceConfigObject.deletedAtSaveLocation ? serviceConfigObject.deletedAtSaveLocation : '_deletedAt';
        this.archiveLocation = serviceConfigObject.archiveLocation ? serviceConfigObject.archiveLocation : '_archive';
        this.archiveDeletedData = serviceConfigObject.hasOwnProperty('archiveDeletedData') ? serviceConfigObject.archiveDeletedData : true;
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
                    dataService.sync(query, callback, errorCallback);
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
        var _this = this;
        var promises = [];
        var objectsToReturn = [];
        for (var objectID in rawDataObject) {
            if (rawDataObject.hasOwnProperty(objectID)) {
                promises.push(this.addFieldsToRawDataObject(rawDataObject[objectID], fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
                    if (data[_this.deletedAtFieldName]) {
                        return;
                    }
                    objectsToReturn.push(data);
                }, function (err) { }));
            }
        }
        return ts_promise_1["default"].all(promises).then(function () {
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
        return ts_promise_1["default"].all(promises).then(function () {
            return data;
        });
    };
    LeDataService.prototype.addFetchFieldPromises = function (rawDataObject, fieldConfigsByLocation, queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var _this = this;
        for (var rawFieldName in rawDataObject) {
            if (rawDataObject.hasOwnProperty(rawFieldName)) {
                var fieldConfigs = fieldConfigsByLocation[rawFieldName];
                if (fieldConfigs && fieldConfigs.constructor !== Array) {
                    this.addFetchFieldPromises(rawDataObject[rawFieldName], fieldConfigsByLocation[rawFieldName], queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
                }
                else {
                    if (fieldConfigs && fieldConfigs.length) {
                        fieldConfigs.forEach(function (fieldConfig) {
                            var fieldName = fieldConfig.getFieldName();
                            promises.push(_this.setFieldOnData(data, fieldName, fieldConfig, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery));
                        });
                    }
                    else {
                        var fieldName = rawFieldName;
                        promises.push(this.setFieldOnData(data, fieldName, undefined, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery));
                    }
                }
            }
        }
    };
    LeDataService.prototype.setFieldOnData = function (data, fieldName, fieldConfig, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var innerQueryObject = queryObject.includedFields[fieldName];
        if (rawFieldName.charAt(0) !== '_') {
            delete data[rawFieldName];
        }
        return this.fetchFieldData(rawDataObject[rawFieldName], fieldConfig, innerQueryObject, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (fieldInfo) {
            if (fieldInfo) {
                data[fieldInfo.name] = fieldInfo.data;
            }
        }, function () { });
    };
    LeDataService.prototype.fetchFieldData = function (rawValue, fieldConfig, fieldQueryObject, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        if (!fieldConfig && fieldName.charAt(0) !== '_') {
            return ts_promise_1["default"].resolve();
        }
        if (fieldConfig && this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && !fieldQueryObject) {
            return ts_promise_1["default"].resolve();
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
            return ts_promise_1["default"].resolve(fieldInfo);
        }
        else if (fieldConfig.getFieldType() === 'Date') {
            fieldInfo.data = new Date(rawValue);
            return ts_promise_1["default"].resolve(fieldInfo);
        }
        else if (this.isFieldConfigTypeAnArray(fieldConfig) && this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
            var promises = [];
            var objectsForArrayField = [];
            for (var fieldDataID in rawValue) {
                if (rawValue.hasOwnProperty(fieldDataID)) {
                    promises.push(this.setDataForArrayField(objectsForArrayField, this.singularVersionOfType(fieldConfig), fieldDataID, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).catch(function () { }));
                }
            }
            return ts_promise_1["default"].all(promises).then(function () {
                fieldInfo.data = objectsForArrayField;
                return fieldInfo;
            });
        }
        else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
            return this.setDataOnFeildInfo(fieldInfo, this.singularVersionOfType(fieldConfig), rawValue, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
        }
        else {
            fieldInfo.data = rawValue;
            return ts_promise_1["default"].resolve(fieldInfo);
        }
    };
    LeDataService.prototype.setDataOnFeildInfo = function (fieldInfo, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryForField = new le_data_query_1["default"](type, id);
        queryForField.queryObject.includedFields = fieldQueryObject.includedFields;
        return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
            if (!data) {
                return;
            }
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
                        if (!currentScope[subscope] && index + 1 !== saveLocationArray.length) {
                            currentScope[subscope] = {};
                        }
                        if (index + 1 === saveLocationArray.length) {
                            if (!currentScope[subscope]) {
                                currentScope[subscope] = [];
                            }
                            currentScope[subscope].push(fieldConfig);
                        }
                        currentScope = currentScope[subscope];
                    });
                }
                else {
                    if (!fieldConfigsByLocation[fieldConfig.getFieldName()]) {
                        fieldConfigsByLocation[fieldConfig.getFieldName()] = [];
                    }
                    fieldConfigsByLocation[fieldConfig.getFieldName()].push(fieldConfig);
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
                        promises.push(ts_promise_1["default"].reject(new Error(errorMessage)));
                    }
                    else {
                        promises.push(_this.validateQueryObject(includedFields[fieldName], fieldConfig));
                    }
                }
            }
            promises.push(_this.validateFilterOnQueryObject(queryObject, typeConfig));
            return ts_promise_1["default"].all(promises);
        });
    };
    LeDataService.prototype.fieldConfigForFilterFieldName = function (filterFieldName, typeConfig) {
        var filterFieldNameSegments = filterFieldName.split('/');
        var fieldConfig;
        for (var i = 0; i < filterFieldNameSegments.length; i += 1) {
            var filterFieldNameSegment = filterFieldNameSegments[i];
            if (i === 0) {
                fieldConfig = typeConfig.getFieldConfig(filterFieldNameSegment);
            }
            else if (fieldConfig) {
                fieldConfig = fieldConfig.getFieldConfig(filterFieldNameSegment);
            }
        }
        return fieldConfig;
    };
    LeDataService.prototype.validateFilterOnQueryObject = function (queryObject, typeConfig) {
        if (!queryObject.hasOwnProperty('filterFieldName')) {
            return ts_promise_1["default"].resolve();
        }
        if (queryObject.id) {
            var errorMessage = 'The filter method cannot be called on a query that was created with an id.';
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        var filterFieldName = queryObject.filterFieldName;
        var filterValue = queryObject.filterValue;
        var fieldConfig = this.fieldConfigForFilterFieldName(filterFieldName, typeConfig);
        if (!fieldConfig) {
            var errorMessage = 'Invalid filter field name. No field named "' + filterFieldName + '" exists on type ' + typeConfig.getType() + '.';
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        var type = fieldConfig.getFieldType();
        if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            var errorMessage = 'Invalid filter field. Queries can only filter on fields of type string, boolean, number, or a custom configured type. And the field "' + filterFieldName + '" is an array type.';
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        if (fieldConfig.getFieldType() === 'Date' || fieldConfig.getFieldType() === 'object') {
            var errorMessage = 'Invalid filter field. Queries can only filter on fields of type string, boolean, number, or a custom configured type. And the field "' + filterFieldName + '" is of type' + fieldConfig.getFieldType() + '.';
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
            if (typeof filterValue === 'string') {
                return ts_promise_1["default"].resolve();
            }
            else {
                var errorMessage = 'Invalid filter value for the field "' + filterFieldName + '" on type ' + typeConfig.getType() + '. A value representing the _id for the data is expected, and a value of type ' + typeof filterValue + ' was given.';
                var error = new Error(errorMessage);
                return ts_promise_1["default"].reject(error);
            }
        }
        if (typeof filterValue !== type && filterValue !== undefined) {
            var errorMessage = 'Invalid filter value for the field "' + filterFieldName + '" on type ' + typeConfig.getType() + '. A value of type ' + type + ' is expected, and a value of type ' + typeof filterValue + ' was given.';
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        return ts_promise_1["default"].resolve();
    };
    LeDataService.prototype.setDataForArrayField = function (objectsForArrayField, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery) {
        var queryForField = new le_data_query_1["default"](type, id);
        queryForField.queryObject.includedFields = fieldQueryObject.includedFields;
        return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then(function (data) {
            if (!data) {
                return;
            }
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
                        promises.push(ts_promise_1["default"].reject(new Error(errorMessage)));
                    }
                    else {
                        promises.push(_this.validateQueryObject(includedFields[fieldName], fieldConfig));
                    }
                }
            }
            promises.push(_this.validateFilterOnQueryObject(queryObject, typeConfig));
            return ts_promise_1["default"].all(promises);
        });
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
            configObjectToSave.saveLocation = config.saveLocation;
            var location = configObjectIndex + configObjectToSave.type;
            var fieldConfigs = config.getFieldConfigs();
            var promises = [];
            promises.push(_this.validateFieldConfigs(fieldConfigs));
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
                _this.dataServiceProvider.updateData(location, configObjectToSave, le_data_service_provider_1.UpdateType.replace).then(function () {
                    resolve(undefined);
                }, function (err) {
                    reject(err);
                });
            }, function (err) {
                reject(err);
            });
        });
    };
    LeDataService.prototype.validateFieldConfigs = function (fieldConfigs) {
        var _this = this;
        if (!fieldConfigs || !fieldConfigs.length) {
            return ts_promise_1["default"].resolve();
        }
        var promises = [];
        fieldConfigs.forEach(function (fieldConfig) {
            promises.push(_this.validateFieldConfig(fieldConfig));
        });
        return ts_promise_1["default"].all(promises).then(function () { });
    };
    LeDataService.prototype.validateFieldConfig = function (fieldConfig) {
        if (fieldConfig.replaceOnUpdate && fieldConfig.getFieldType() !== 'object') {
            var error = new Error(fieldConfig.getFieldName() + ' must be of type object to set replaceOnUpdate');
            return ts_promise_1["default"].reject(error);
        }
        if (fieldConfig.mergeOnUpdate && fieldConfig.getFieldType() !== 'object') {
            var error = new Error(fieldConfig.getFieldName() + ' must be of type object to set replaceOnUpdate');
            return ts_promise_1["default"].reject(error);
        }
        if (fieldConfig.replaceOnUpdate && fieldConfig.getFieldConfigs() && fieldConfig.getFieldConfigs().length) {
            var error = new Error(fieldConfig.getFieldName() + ' cannot have sub-fields configured if replaceOnUpdate is set');
            return ts_promise_1["default"].reject(error);
        }
        return ts_promise_1["default"].resolve();
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
        fieldConfigObject.replaceOnUpdate = fieldConfig.replaceOnUpdate;
        fieldConfigObject.mergeOnUpdate = fieldConfig.mergeOnUpdate;
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
            var typeToSet = fieldConfigObject.many ? fieldConfigObject.type + '[]' : fieldConfigObject.type;
            var fieldConfig = new le_type_field_config_1["default"](fieldConfigObject.fieldName, typeToSet);
            fieldConfig.cascadeDelete = fieldConfigObject.cascadeDelete;
            fieldConfig.required = fieldConfigObject.required;
            fieldConfig.replaceOnUpdate = fieldConfigObject.replaceOnUpdate;
            fieldConfig.mergeOnUpdate = fieldConfigObject.mergeOnUpdate;
            fieldConfig.convertToLocalTimeZone = fieldConfigObject.convertToLocalTimeZone;
            fieldConfig.saveLocation = fieldConfigObject.saveLocation;
            for (var i = 0; i < innerFieldConfigs.length; i += 1) {
                var innerFieldConfig = innerFieldConfigs[i];
                fieldConfig.addField(innerFieldConfig);
            }
            return fieldConfig;
        });
    };
    LeDataService.prototype.validateData = function (data, isUpdate) {
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
                    var saveLocation = (typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType()) + '/' + data._id + '/' + (fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName());
                    if (!_this.dataServiceProvider.equalToLastedFetchData(saveLocation, data[fieldConfig.getFieldName()])) {
                        validateFieldPromises.push(_this.validateField(fieldConfig, data, isUpdate));
                    }
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
            var saveLocation = (typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType()) + '/' + data._id + '/' + key;
            var valueToCheck = data[key] instanceof Date ? data[key].getTime() : data[key];
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_' && !typeConfig.fieldExists(key) && (!this.dataServiceProvider.equalToLastedFetchData(saveLocation, valueToCheck) || valueToCheck === undefined)) {
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
    LeDataService.prototype.validateField = function (fieldConfig, data, isUpdate) {
        var validationPromises = [];
        var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data, isUpdate);
        var typePromise = this.validateTypeOnField(fieldConfig, data, isUpdate);
        validationPromises.push(requiredPromise);
        validationPromises.push(typePromise);
        return ts_promise_1["default"].all(validationPromises);
    };
    LeDataService.prototype.validateTypeOnField = function (fieldConfig, data, isUpdate) {
        var type = fieldConfig.getFieldType();
        var fieldName = fieldConfig.getFieldName();
        if (!data[fieldName]) {
            return ts_promise_1["default"].resolve();
        }
        else if (type === 'object') {
            return this.validateObjectTypeOnField(fieldConfig, data, isUpdate);
        }
        else if (typeof data[fieldName] === type) {
            return ts_promise_1["default"].resolve();
        }
        else if (type === 'Date' && data[fieldName] instanceof Date) {
            return ts_promise_1["default"].resolve();
        }
        else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && type === data[fieldName]._type) {
            return this.validateData(data[fieldName], isUpdate);
        }
        else if (this.isFieldConfigTypeAnArray(fieldConfig)) {
            var fieldData = data[fieldName];
            if (fieldData && fieldData.constructor === Array) {
                var isValid = true;
                var arrayObjectValidationPromises = [];
                for (var i = 0; i < fieldData.length; i += 1) {
                    var isMatchingCustom = this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && this.singularVersionOfType(fieldConfig) === fieldData[i]._type;
                    var isMatchingPrimative = typeof fieldData[i] === this.singularVersionOfType(fieldConfig);
                    var isMatchingDate = (fieldData[i] instanceof Date) && this.singularVersionOfType(fieldConfig) === 'Date';
                    if (isMatchingDate || isMatchingPrimative) {
                        continue;
                    }
                    else if (!isMatchingCustom) {
                        isValid = false;
                        break;
                    }
                    else {
                        arrayObjectValidationPromises.push(this.validateData(fieldData[i], isUpdate));
                    }
                }
                if (isValid) {
                    return ts_promise_1["default"].all(arrayObjectValidationPromises);
                }
            }
        }
        var errorMessage = 'The specified field is set to an invalid type -\n';
        errorMessage += 'fieldName: ' + fieldName + '\n';
        errorMessage += "field's set type: " + type + '\n';
        errorMessage += 'data: ' + JSON.stringify(data);
        var error = new Error(errorMessage);
        return ts_promise_1["default"].reject(error);
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
    LeDataService.prototype.validateObjectTypeOnField = function (fieldConfig, data, isUpdate) {
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        var objectUnderValidation = data[fieldConfig.getFieldName()];
        var promises = [];
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            promises.push(this.validateField(innerFieldConfig, objectUnderValidation, isUpdate));
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
    LeDataService.prototype.validateRequiredPropertyOnField = function (fieldConfig, data, isUpdate) {
        var _this = this;
        var fieldName = fieldConfig.getFieldName();
        if (fieldConfig.required && !data[fieldName] && data.hasOwnProperty(fieldName)) {
            var errorMessage = fieldConfig.getFieldName() + ' is required but was set to undefined on the LeData object, data: ' + JSON.stringify(data);
            var error = new Error(errorMessage);
            return ts_promise_1["default"].reject(error);
        }
        else if (fieldConfig.required && !data[fieldName] && !isUpdate) {
            return new ts_promise_1["default"](function (resolve, reject) {
                if (data._id) {
                    _this.checkExistence(data._type, data._id).then(function (doesExist) {
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
        var type = this.singularVersionOfType(fieldConfig);
        return type !== 'string' && type !== 'boolean' && type !== 'number' && type !== 'Date' && type !== 'object';
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
                if (!returnedConfigObject) {
                    var errorMessage = type + ' is not a configured type';
                    var error = new Error(errorMessage);
                    throw error;
                }
                return _this.typeConfigForTypeConfigObject(returnedConfigObject);
            }).then(function (typeConfig) {
                typeConfig.addField(_this.createdAtFieldName, 'Date').saveAt(_this.createdAtSaveLocation);
                typeConfig.addField(_this.lastUpdatedAtFieldName, 'Date').saveAt(_this.lastUpdatedAtSaveLocation);
                typeConfig.addField(_this.deletedAtFieldName, 'Date').saveAt(_this.deletedAtSaveLocation);
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
            typeConfig.saveAt(typeConfigObject.saveLocation);
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
        if (!data) {
            return ts_promise_1["default"].resolve();
        }
        var initialPromise;
        var isCreate = false;
        var rootRawData = { _type: data._type, _id: data._id };
        if (!this.hasLoadedServiceConfig) {
            initialPromise = this.dataServiceProvider.dataExists('_leServiceConfig').then(function (doesExist) {
                if (doesExist) {
                    return _this.dataServiceProvider.fetchData('_leServiceConfig');
                }
            }).then(function (serviceConfigObject) {
                _this.hasLoadedServiceConfig = true;
                _this.updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject);
            });
        }
        else {
            initialPromise = ts_promise_1["default"].resolve();
        }
        return initialPromise.then(function () {
            return _this.locationForData(data);
        }).then(function (location) {
            var updateCreatedAtPropmise;
            if (!data._id) {
                isCreate = true;
                data[_this.createdAtFieldName] = new Date();
                updateCreatedAtPropmise = ts_promise_1["default"].resolve();
            }
            else {
                updateCreatedAtPropmise = _this.dataServiceProvider.dataExists(location).then(function (doesExist) {
                    if (!doesExist) {
                        isCreate = true;
                        data[_this.createdAtFieldName] = new Date();
                    }
                });
            }
            return updateCreatedAtPropmise;
        }).then(function () {
            var promises = [];
            var shouldUpdateLastUpdated = false;
            for (var key in data) {
                if (key !== '_type' && key !== '_id') {
                    shouldUpdateLastUpdated = true;
                }
                if (data.hasOwnProperty(key)) {
                    promises.push(_this.saveFieldForData(data, key, isCreate, rootRawData));
                }
            }
            if (shouldUpdateLastUpdated) {
                data[_this.lastUpdatedAtFieldName] = new Date();
                promises.push(_this.saveFieldForData(data, _this.lastUpdatedAtFieldName, isCreate, rootRawData));
            }
            return ts_promise_1["default"].all(promises);
        }).then(function () {
            if (isCreate) {
                return _this.createRootRawData(rootRawData);
            }
        }).then(function () {
            if (!data._id && rootRawData._id) {
                data._id = rootRawData._id;
            }
            return data;
        });
    };
    ;
    LeDataService.prototype.createRootRawData = function (rootRawData) {
        var _this = this;
        return this.fetchTypeConfig(rootRawData._type).then(function (typeConfig) {
            var saveLocation = typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType();
            return _this.dataServiceProvider.createData(saveLocation, rootRawData);
        });
    };
    LeDataService.prototype.saveFieldForData = function (data, fieldName, isCreate, rootRawData) {
        var _this = this;
        var location;
        var fieldConfig;
        var rawFieldName;
        if (fieldName === '_id' || fieldName === '_type') {
            return ts_promise_1["default"].resolve();
        }
        return this.fetchTypeConfig(data._type).then(function (typeConfig) {
            fieldConfig = typeConfig.getFieldConfig(fieldName);
            location = data._type;
            if (typeConfig.saveLocation) {
                location = typeConfig.saveLocation;
            }
            rawFieldName = fieldConfig && fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldName;
            location += '/' + data._id + '/' + rawFieldName;
            if (fieldConfig && _this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
                return _this.saveDataAndSetField(data[fieldName], location, isCreate, rootRawData, rawFieldName);
            }
            else if (fieldConfig && fieldConfig.getFieldType() === 'object') {
                return _this.saveObjectField(location, fieldConfig, data[fieldName], isCreate, rootRawData);
            }
            else {
                var dataToSave;
                if (fieldConfig && fieldConfig.getFieldType() === 'Date') {
                    dataToSave = data[fieldName] && data[fieldName].getTime();
                }
                else {
                    dataToSave = data[fieldName];
                }
                if (isCreate) {
                    if (rootRawData && rawFieldName && dataToSave !== undefined) {
                        rootRawData[rawFieldName] = dataToSave;
                    }
                    return;
                }
                return _this.dataServiceProvider.updateData(location, dataToSave);
            }
        });
    };
    LeDataService.prototype.saveDataAndReturnObjectToSetOnField = function (data) {
        var _this = this;
        if (data && data.constructor === Array) {
            var objectToSetAtLocation = {};
            var promises = [];
            data.forEach(function (dataObjectInArray) {
                promises.push(_this.saveData(dataObjectInArray).then(function (returnedData) {
                    objectToSetAtLocation[returnedData._id] = true;
                }));
            });
            return ts_promise_1["default"].all(promises).then(function () {
                return objectToSetAtLocation;
            });
        }
        else if (data === undefined) {
            return ts_promise_1["default"].resolve();
        }
        else {
            return this.saveData(data).then(function (returnedData) {
                return returnedData._id;
            });
        }
    };
    LeDataService.prototype.saveDataAndSetField = function (data, location, isCreate, rootRawData, rawFieldName) {
        var dataService = this;
        return this.saveDataAndReturnObjectToSetOnField(data).then(function (dataToSetOnField) {
            if (isCreate) {
                if (rootRawData && rawFieldName && dataToSetOnField !== undefined) {
                    rootRawData[rawFieldName] = dataToSetOnField;
                }
                return;
            }
            if (dataToSetOnField === undefined) {
                return dataService.dataServiceProvider.deleteData(location);
            }
            else {
                return dataService.dataServiceProvider.updateData(location, dataToSetOnField);
            }
        });
    };
    LeDataService.prototype.saveObjectField = function (location, fieldConfig, data, isCreate, rootRawData) {
        var dataService = this;
        var rawFieldName = fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName();
        rootRawData[rawFieldName] = {};
        var innerRawData = rootRawData[rawFieldName];
        var promises = [];
        var innerFieldConfigs = fieldConfig.getFieldConfigs();
        if (!innerFieldConfigs.length) {
            if (isCreate) {
                rootRawData[rawFieldName] = data;
                return ts_promise_1["default"].resolve();
            }
            else {
                if (fieldConfig.replaceOnUpdate) {
                    return dataService.dataServiceProvider.updateData(location, data, le_data_service_provider_1.UpdateType.replace);
                }
                else if (fieldConfig.mergeOnUpdate) {
                    return dataService.dataServiceProvider.updateData(location, data, le_data_service_provider_1.UpdateType.merge);
                }
                else {
                    return dataService.dataServiceProvider.updateData(location, data, le_data_service_provider_1.UpdateType.default);
                }
            }
        }
        for (var i = 0; i < innerFieldConfigs.length; i += 1) {
            var innerFieldConfig = innerFieldConfigs[i];
            var innerRawFieldName = innerFieldConfig.saveLocation ? innerFieldConfig.saveLocation : innerFieldConfig.getFieldName();
            var innerLocation = location + '/' + innerRawFieldName;
            if (data.hasOwnProperty(innerFieldConfig.getFieldName())) {
                promises.push(this.saveField(innerLocation, innerFieldConfig, data[innerFieldConfig.getFieldName()], isCreate, innerRawData));
            }
        }
        return ts_promise_1["default"].all(promises);
    };
    LeDataService.prototype.saveField = function (location, fieldConfig, fieldData, isCreate, rawData) {
        var _this = this;
        var dataService = this;
        var rawFieldName = fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName();
        if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
            if (fieldData && fieldData.constructor === Array) {
                var objectToSetAtLocation = {};
                var promises = [];
                fieldData.forEach(function (dataObjectInArray) {
                    promises.push(_this.saveData(dataObjectInArray).then(function (returnedData) {
                        objectToSetAtLocation[returnedData._id] = true;
                    }));
                });
                return ts_promise_1["default"].all(promises).then(function () {
                    if (isCreate) {
                        rawData[rawFieldName] = objectToSetAtLocation;
                    }
                    else {
                        return dataService.dataServiceProvider.updateData(location, objectToSetAtLocation);
                    }
                });
            }
            else {
                return this.saveData(fieldData).then(function (returnedData) {
                    if (isCreate) {
                        rawData[rawFieldName] = objectToSetAtLocation;
                    }
                    else {
                        return dataService.dataServiceProvider.updateData(location, returnedData._id);
                    }
                });
            }
        }
        else if (fieldConfig.getFieldType() === 'object') {
            return this.saveObjectField(location, fieldConfig, fieldData, isCreate, rawData);
        }
        else {
            if (isCreate) {
                rawData[rawFieldName] = fieldData;
            }
            else {
                return this.dataServiceProvider.updateData(location, fieldData);
            }
        }
    };
    return LeDataService;
}());
exports.LeDataService = LeDataService;
//# sourceMappingURL=le-data-service.js.map