/// <reference path="le-data.ts"/>

import Promise from "ts-promise";
import {LeDataServiceProvider, FetchDataOptions, UpdateType} from "./le-data-service-provider";
import LeTypeConfig from "./le-type-config";
import LeTypeFieldConfig from "./le-type-field-config";
import LeDataQuery from "./le-data-query";
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
export class LeDataService {

  private dataServiceProvider: LeDataServiceProvider;
  private queryDictionary: any;
  private createdAtSaveLocation: string;
  private createdAtFieldName: string;
  private lastUpdatedAtSaveLocation: string;
  private lastUpdatedAtFieldName: string;
  private deletedAtFieldName: string;
  private deletedAtSaveLocation: string;
  private archiveDeletedData: boolean;
  private archiveLocation: string;
  private hasLoadedServiceConfig: boolean;

  constructor(provider: LeDataServiceProvider) {
    this.dataServiceProvider = provider;
    this.queryDictionary = {};
    this.dataServiceProvider.sync('_leTypeConfigs', ()=>{}, (err)=>{console.error(err)});
    this.dataServiceProvider.sync('_leTypeFieldConfigs', ()=>{}, (err)=>{console.error(err)});
    this.dataServiceProvider.sync('_leServiceConfig', (serviceConfigObject)=>{
      this.hasLoadedServiceConfig = true;
      this.updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject);
    }, (err)=>{
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
  createData(data: LeData): Promise<LeData> {
    if(!data){
      var errorMessage = 'No data passed to createData function';
      var error = new Error(errorMessage);
      var promise = new Promise<LeData>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(!data._type) {
      var errorMessage = 'No _type specified in LeData object passed to createData, object: ' + JSON.stringify(data);
      var error = new Error(errorMessage);
      var promise = new Promise<LeData>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(data._id) {
      return new Promise<LeData>((resolve, reject)=>{
        this.checkExistence(data._type, data._id).then((dataExists)=>{
          if(dataExists){
            var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
            var error = new Error(errorMessage);
            reject(error);
          } else {
            return this.validateData(data, false);
          }
        }).then(()=>{
          return this.saveData(data);
        }).then((returnedData)=>{
          resolve(returnedData);
        }, (err)=>{
          reject(err);
        });
      });
    } else {
      return new Promise<LeData>((resolve, reject)=>{
        this.validateData(data, false).then(()=>{
          return this.saveData(data);
        }).then((returnedData)=>{
          resolve(returnedData);
        }, (err)=>{
          reject(err);
        });
      });
    }
  }
  create(data: LeData): Promise<LeData> {
    return this.createData(data);
  }
  update(data: LeData): Promise<LeData> {
    return this.updateData(data);
  }
  delete(type:string, id:string): Promise<void>{
    return this.deleteData(type, id);
  }
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
  checkExistence(type:string, id:string): Promise<boolean> {
    return this.fetchTypeConfig(type).then((typeConfig)=>{
      let location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
      location += '/' + id;
      let deletedAtLocation = location +'/' + this.deletedAtSaveLocation;
      return Promise.all([
        this.dataServiceProvider.dataExists(location),
        this.dataServiceProvider.dataExists(deletedAtLocation)
      ]).then((results)=>{
        let dataExists = results[0];
        let hasDeletedAtField = results[1];
        return dataExists && !hasDeletedAtField;
      });
    });
  }

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
  lock(word:string): Promise<void> {
    return this.dataServiceProvider.lock(word);
  }

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
  unlock(word:string): Promise<void> {
    return this.dataServiceProvider.unlock(word);
  }

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
  updateData(data: LeData): Promise<LeData> {
    if(!data){
      var errorMessage = 'No data passed to updateData function';
      var error = new Error(errorMessage);
      var promise = new Promise<LeData>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(!data._type) {
      var errorMessage = 'No _type specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
      var error = new Error(errorMessage);
      var promise = new Promise<LeData>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(!data._id) {
      var errorMessage = 'No _id specified in LeData object passed to updateData, object: ' + JSON.stringify(data);
      var error = new Error(errorMessage);
      var promise = new Promise<LeData>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    return new Promise<LeData>((resolve, reject) => {
      this.checkExistence(data._type, data._id).then((dataExists)=>{
        if(dataExists){
          return this.validateData(data, true);
        } else {
          var errorMessage = 'Attempted to update data that does not exist, object:' + JSON.stringify(data);
          var error = new Error(errorMessage);
          reject(error);
        }
      }).then(()=>{
        return this.saveData(data);
      }).then((returnedData)=>{
        resolve(returnedData);
      }, (err)=>{
        reject(err);
      });
    });
  }

  private locationForData(data:LeData): Promise<string> {
    return new Promise<string>((resolve, reject)=>{
      this.fetchTypeConfig(data._type).then((typeConfig)=>{
        var locationToReturn = data._type;
        if (typeConfig.saveLocation) {
          locationToReturn = typeConfig.saveLocation;
        }
        if (data._id) {
          locationToReturn += '/' + data._id;
        }
        resolve(locationToReturn);
      }, (err)=>{
        reject(err);
      });
    });
  }

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
  deleteData(type: string, id: string): Promise<void> {
    if(!type) {
      var errorMessage = 'Undefined type passed to deleteData.\ntype: ' + type + ' id: ' + id;
      var error = new Error(errorMessage);
      var promise = new Promise<void>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(!id) {
      var errorMessage = 'Undefined id passed to deleteData.\ntype: ' + type + ' id: ' + id;
      var error = new Error(errorMessage);
      var promise = new Promise<void>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    var typeConfig;
    var updateDeletedAtData = {_type:type, _id:id};
    updateDeletedAtData[this.deletedAtFieldName] = new Date();
    return this.updateData(updateDeletedAtData).then(()=>{
      return this.fetchTypeConfig(type);
    }).then((returnedTypeConfig)=>{
      typeConfig = returnedTypeConfig;
      return this.cascadeDeletes(typeConfig, id);
    }).then(()=>{
      var location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
      location += '/' + id;
      return this.dataServiceProvider.fetchData(location);
    }).then((data)=>{
      if(!this.archiveDeletedData) {
        return Promise.resolve();
      }
      var location = this.archiveLocation + '/';
      location += typeConfig.saveLocation ? typeConfig.saveLocation : type;
      location += '/' + id;
      return this.dataServiceProvider.updateData(location, data);
    }).then(()=>{
      var location = typeConfig.saveLocation ? typeConfig.saveLocation : type;
      location += '/' + id;
      return this.dataServiceProvider.deleteData(location);
    });
  }

  removeDataFromArray(type:string, id:string, fieldName:string, data:LeData): Promise<void> {
    var dataService = this;
    return dataService.fetchTypeConfig(type).then((typeConfig)=>{
      var fieldConfig =  typeConfig.getFieldConfig(fieldName);
      var location;
      if (typeConfig.saveLocation) {
        location = typeConfig.saveLocation;
      } else {
        location = typeConfig.getType()
      }
      location += '/' + id + '/';
      if(fieldConfig.saveLocation) {
        location += fieldConfig.saveLocation;
      } else {
        location += fieldConfig.getFieldName();
      }
      if (dataService.isFieldConfigTypeAnArray(fieldConfig)) {
        location += '/' + data._id;
      } else {
        var errorMessage = 'The specified field is not an array';
        var error = new Error(errorMessage);
        return Promise.reject(error);
      }
      return dataService.dataServiceProvider.updateData(location, undefined);
    });
  }

  private cascadeDeletes(typeConfig: LeTypeConfig, id: string): Promise<any> {
    var fieldConfigs = typeConfig.getFieldConfigs();
    var promises = [];
    fieldConfigs.forEach((fieldConfig)=>{
      promises.push(this.handleCascadeDelete(typeConfig, fieldConfig, id));
    });
    return Promise.all(promises);
  }

  private handleCascadeDelete(typeConfig: LeTypeConfig, fieldConfig: LeTypeFieldConfig, id: string): Promise<any> {
    if(!fieldConfig.cascadeDelete) {
      return Promise.resolve();
    }
    var type = typeConfig.getType();
    var fieldName = fieldConfig.getFieldName();
    return this.checkExistence(type, id).then((doesExist)=>{
      var promiseToReturn: Promise<any> = Promise.resolve();
      if(doesExist) {
        var query = new LeDataQuery(type, id);
        query.include(fieldName);
        promiseToReturn = this.search(query);
      }
      return promiseToReturn;
    }).then((data)=>{
      var promise: Promise<any> = Promise.resolve();
      if(!data || !data[fieldName] || typeof data[fieldName] === 'string') {
        return promise;
      }
      if(data[fieldName] instanceof Array) {
        var promises = [];
        data[fieldName].forEach((objectToDelete)=>{
          promises.push(this.deleteData(objectToDelete._type, objectToDelete._id))
        });
        promise = Promise.all(promises);
      } else if (data[fieldName]._type && data[fieldName]._id) {
        promise = this.deleteData(data[fieldName]._type, data[fieldName]._id);
      }
      return promise;
    });
  }

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
  sync(query: LeDataQuery, callback:(data: LeData) => void, errorCallback:(error:Error)=>void): void {
    this.validateQuery(query).then(()=>{
      return  this.fetchQuery(query, true, undefined, callback, errorCallback, undefined);
    }).then((data)=>{
      if(callback) {
        callback(data);
      }
    },(err)=>{
      if(errorCallback){
        errorCallback(err);
      }
    });
  }

  /**
   * Stops listening to a synced query. This needs to be called when the sync is no longer being used to avoid memory leaks and improve performance.
   *
   * @function unsync
   * @memberof LeDataService
   * @instance
   * @param query LeDataQuery - The query used in the origional sync. It must have the same id as the query used to sync. This insures that only the syncs used for that query object are removed.
   */
  unsync(query: LeDataQuery): void {
    var queryID = query.queryObject.queryID;
    var innerQueryObject = this.queryDictionary[queryID];
    if(innerQueryObject) {
      for (var location in innerQueryObject) {
        if(innerQueryObject.hasOwnProperty(location)){
          this.dataServiceProvider.unsync(location, innerQueryObject[location]);
        }
      }
      delete this.queryDictionary[queryID];
    }
  }

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
  search(query: LeDataQuery): Promise<LeData> {
    return this.validateQuery(query).then(()=>{
      return this.fetchQuery(query, false, undefined, undefined, undefined, undefined);
    });
  }

  private fetchQuery(query:LeDataQuery, shouldSync:boolean, syncDictionary:any, callback: (data)=>void, errorCallback: (err)=>void, outerMostQuery: LeDataQuery): Promise<LeData> {
    var queryObject = query.queryObject;

    return this.fetchTypeConfig(queryObject.type).then((typeConfig)=>{
      return this.fetchDataWithQueryObjectAndTypeConfig(query, typeConfig, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
    }).then((data)=>{
      if(!data || data[this.deletedAtFieldName]) {
        throw new Error('No data exists for Type ' + queryObject.type + ' and ID ' + queryObject.id);
      }
      return data;
    });
  }

  fetchDataWithQueryObjectAndTypeConfig(query, typeConfig, shouldSync:boolean, syncDictionary:any, callback: (data)=>void, errorCallback: (err)=>void, outerMostQuery: LeDataQuery): Promise<LeData> {
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
    if(shouldSync && !syncDictionary) {
      if(this.queryDictionary[queryObject.queryID]) {
        syncDictionary = this.queryDictionary[queryObject.queryID];
      } else {
        syncDictionary = {};
        this.queryDictionary[queryObject.queryID] = syncDictionary;
      }
    }
    if(!outerMostQuery) {
      outerMostQuery = query;
    }
    if(shouldSync) {
      this.syncLocation(location, outerMostQuery, syncDictionary, callback, errorCallback);
    }
    var fetchDataOptions: FetchDataOptions = {};
    if(queryObject.hasOwnProperty('filterFieldName')) {
      var filterFieldConfig = this.fieldConfigForFilterFieldName(queryObject.filterFieldName, typeConfig);
      fetchDataOptions.filterFieldName = filterFieldConfig.saveLocation ? filterFieldConfig.saveLocation : queryObject.filterFieldName;
      fetchDataOptions.filterValue = queryObject.filterValue;
      if(fetchDataOptions.filterValue === undefined) {
        fetchDataOptions.filterValue = null;
      }
    }
    return this.dataServiceProvider.fetchData(location, fetchDataOptions).then(function(rawQueryRoot){
      if(dataID) {
        if(!rawQueryRoot || rawQueryRoot[this.deletedAtSaveLocation]) {
          throw new Error('No data exists of type ' + dataType + ' with id ' + dataID + '. Queries cannot start with data that does not exist. Use checkExistence before searching if there is a risk of the data not existing.');
        }
        rawQueryRoot._id = dataID;
        rawQueryRoot._type = dataType;
      } else {
        for(var idAsKey in rawQueryRoot) {
          if(rawQueryRoot.hasOwnProperty(idAsKey)) {
            rawQueryRoot[idAsKey]._id = idAsKey;
            rawQueryRoot[idAsKey]._type = dataType;
          }
        }
      }
      var fieldConfigs;
      if(typeConfig) {
        fieldConfigs = typeConfig.getFieldConfigs();
      } else {
        fieldConfigs = [];
      }
      if(dataID) {
        return dataService.addFieldsToRawDataObject(rawQueryRoot, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
      } else {
        return dataService.addFieldsToRawDataObjects(rawQueryRoot, fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
      }
    });
  }
  private updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject): void {
    if(!serviceConfigObject) {
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
  }
  private syncLocation(location:string, query: LeDataQuery, syncDictionary:any, callback: (data)=>void, errorCallback: (err)=>void):void {
    var dataService = this;
    if(!syncDictionary[location]) {
      var isFirstCallBack = true;
      function providerCallBack() {
        if(isFirstCallBack) {
          isFirstCallBack = false;
          return;
        }
        if(callback) {
          dataService.sync(query, callback, errorCallback);
        }
      }
      function providerErrorCallBack(err) {
        if(errorCallback) {
          errorCallback(err);
        }
      }
      syncDictionary[location] = this.dataServiceProvider.sync(location, providerCallBack, providerErrorCallBack);
    }
  }
  addFieldsToRawDataObjects(rawDataObject:any, fieldConfigs: LeTypeFieldConfig[], queryObject:any, shouldSync:boolean, syncDictionary:any, callback: (data)=>void, errorCallback: (err)=>void, outerMostQuery: LeDataQuery): Promise<any> {
    var promises = [];
    var objectsToReturn = [];
    for(var objectID in rawDataObject) {
      if(rawDataObject.hasOwnProperty(objectID)) {
        promises.push(this.addFieldsToRawDataObject(rawDataObject[objectID], fieldConfigs, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then((data)=>{
          if(data[this.deletedAtFieldName]) {
            return;
          }
          objectsToReturn.push(data);
        }, (err)=>{}));
      }
    }
    return Promise.all(promises).then(()=>{
      return objectsToReturn;
    });
  }
  addFieldsToRawDataObject(rawDataObject:any, fieldConfigs: LeTypeFieldConfig[], queryObject:any, shouldSync:boolean, syncDictionary:any, callback: (data)=>void, errorCallback: (err)=>void, outerMostQuery: LeDataQuery): Promise<any> {
    if(!queryObject) {
      queryObject = {};
    }
    if(!queryObject.includedFields) {
      queryObject.includedFields = {};
    }
    var data = {};
    var fieldConfigsByLocation = this.fieldConfigsByLocation(fieldConfigs);
    var promises = [];
    this.addFetchFieldPromises(rawDataObject, fieldConfigsByLocation, queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);

    return Promise.all(promises).then(()=>{
      return data;
    });
  }
  addFetchFieldPromises(rawDataObject, fieldConfigsByLocation, queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery: LeDataQuery):void {
    for (var rawFieldName in rawDataObject) {
      if(rawDataObject.hasOwnProperty(rawFieldName)) {
        var fieldConfigs = fieldConfigsByLocation[rawFieldName];
        if(fieldConfigs && fieldConfigs.constructor !== Array) {
          this.addFetchFieldPromises(rawDataObject[rawFieldName], fieldConfigsByLocation[rawFieldName], queryObject, promises, data, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
        } else {
          if(fieldConfigs && fieldConfigs.length) {
            fieldConfigs.forEach((fieldConfig)=>{
              var fieldName = fieldConfig.getFieldName();
              promises.push(this.setFieldOnData(data, fieldName, fieldConfig, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery));
            })
          } else {
            var fieldName = rawFieldName;
            promises.push(this.setFieldOnData(data, fieldName, undefined, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery));
          }
        }
      }
    }
  }

  private setFieldOnData(data, fieldName, fieldConfig, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery): Promise<any> {
    var innerQueryObject = queryObject.includedFields[fieldName];
    if(rawFieldName.charAt(0) !== '_') {
      delete data[rawFieldName];
    }
    return this.fetchFieldData(rawDataObject[rawFieldName], fieldConfig, innerQueryObject, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then((fieldInfo)=>{
      if(fieldInfo){
        data[fieldInfo.name] = fieldInfo.data;
      }
    }, ()=>{});
  }

  fetchFieldData(rawValue: any, fieldConfig: LeTypeFieldConfig, fieldQueryObject:any, fieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery: LeDataQuery): any {
    if(!fieldConfig && fieldName.charAt(0) !== '_') {
      return Promise.resolve();
    }
    if(fieldConfig && this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && !fieldQueryObject) {
      return Promise.resolve();
    }
    if(!fieldQueryObject) {
      fieldQueryObject = {};
    }
    if(!fieldQueryObject.includedFields) {
      fieldQueryObject.includedFields = {};
    }
    var fieldInfo:any = {name:fieldName};
    if(!fieldConfig) {
      fieldInfo.data = rawValue;
      return Promise.resolve(fieldInfo);
    } else if (fieldConfig.getFieldType() === 'Date') {
      fieldInfo.data = new Date(rawValue);
      return Promise.resolve(fieldInfo);
    } else if (this.isFieldConfigTypeAnArray(fieldConfig) && this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
      var promises = [];
      var objectsForArrayField = [];
      for(var fieldDataID in rawValue) {
        if(rawValue.hasOwnProperty(fieldDataID)){
          promises.push(this.setDataForArrayField(objectsForArrayField, this.singularVersionOfType(fieldConfig), fieldDataID, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).catch(()=>{}));
        }
      }
      return Promise.all(promises).then(()=>{
        fieldInfo.data = objectsForArrayField;
        return fieldInfo;
      });
    } else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
      return this.setDataOnFeildInfo(fieldInfo, this.singularVersionOfType(fieldConfig), rawValue, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);

    } else {
      fieldInfo.data = rawValue;
      return Promise.resolve(fieldInfo);
    }
  }
  setDataOnFeildInfo(fieldInfo, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery: LeDataQuery):Promise<any> {
    var queryForField = new LeDataQuery(type, id);
    queryForField.queryObject.includedFields = fieldQueryObject.includedFields;
    return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then((data)=>{
      if(!data) {
        return;
      }
      data._type = type;
      data._id = id;
      fieldInfo.data = data;
      return fieldInfo;
    });
  }
  fieldConfigsByLocation(fieldConfigs: LeTypeFieldConfig[]) {
    var fieldConfigsByLocation = {};
    if(fieldConfigs) {
      fieldConfigs.forEach((fieldConfig)=>{
        if(fieldConfig.saveLocation) {
          var saveLocationArray = fieldConfig.saveLocation.split('/');
          var currentScope = fieldConfigsByLocation;
          saveLocationArray.forEach((subscope, index)=>{
            if(!currentScope[subscope] && index + 1 !== saveLocationArray.length) {
              currentScope[subscope] = {};
            }
            if(index + 1 === saveLocationArray.length) {
              if(!currentScope[subscope]) {
                currentScope[subscope] = [];
              }
              currentScope[subscope].push(fieldConfig);
            }
            currentScope = currentScope[subscope];
          });
        } else {
          if(!fieldConfigsByLocation[fieldConfig.getFieldName()]) {
            fieldConfigsByLocation[fieldConfig.getFieldName()] = [];
          }
          fieldConfigsByLocation[fieldConfig.getFieldName()].push(fieldConfig);
        }
      });
    }
    return fieldConfigsByLocation;
  }

  validateQuery(query: LeDataQuery): Promise<any> {
    var queryObject = query.queryObject;
    return this.fetchTypeConfig(queryObject.type).then((typeConfig)=>{
      var includedFields = queryObject.includedFields;
      var promises = [];
      for (var fieldName in includedFields) {
        if(includedFields.hasOwnProperty(fieldName)) {
          var fieldConfig = typeConfig.getFieldConfig(fieldName);
          if(!fieldConfig) {
            var errorMessage = 'invalid field included in query, invalid field: ' + fieldName;
            promises.push(Promise.reject(new Error(errorMessage)));
          } else {
            promises.push(this.validateQueryObject(includedFields[fieldName], fieldConfig));
          }
        }
      }
      promises.push(this.validateFilterOnQueryObject(queryObject, typeConfig));
      return Promise.all(promises);
    });
  }
  private fieldConfigForFilterFieldName(filterFieldName: string, typeConfig: LeTypeConfig): LeTypeFieldConfig {
    var filterFieldNameSegments = filterFieldName.split('/');
    var fieldConfig;
    for (var i = 0; i < filterFieldNameSegments.length; i += 1) {
      var filterFieldNameSegment = filterFieldNameSegments[i];
      if(i === 0) {
        fieldConfig = typeConfig.getFieldConfig(filterFieldNameSegment);
      } else if (fieldConfig) {
        fieldConfig = fieldConfig.getFieldConfig(filterFieldNameSegment);
      }
    }
    return fieldConfig;
  }
  private validateFilterOnQueryObject(queryObject: any, typeConfig: LeTypeConfig): Promise<void> {
    if(!queryObject.hasOwnProperty('filterFieldName')) {
      return Promise.resolve();
    }
    if(queryObject.id) {
      var errorMessage = 'The filter method cannot be called on a query that was created with an id.';
      var error = new Error(errorMessage);
      return Promise.reject(error);
    }
    var filterFieldName = queryObject.filterFieldName;
    var filterValue = queryObject.filterValue;
    var fieldConfig = this.fieldConfigForFilterFieldName(filterFieldName, typeConfig);
    if(!fieldConfig) {
      var errorMessage = 'Invalid filter field name. No field named "' + filterFieldName +'" exists on type ' + typeConfig.getType() + '.';
      var error = new Error(errorMessage);
      return Promise.reject(error);
    }
    var type = fieldConfig.getFieldType();
    if (this.isFieldConfigTypeAnArray(fieldConfig)) {
      var errorMessage = 'Invalid filter field. Queries can only filter on fields of type string, boolean, number, or a custom configured type. And the field "' + filterFieldName +'" is an array type.';
      var error = new Error(errorMessage);
      return Promise.reject(error);
    }
    if (fieldConfig.getFieldType() === 'Date' || fieldConfig.getFieldType() === 'object') {
      var errorMessage = 'Invalid filter field. Queries can only filter on fields of type string, boolean, number, or a custom configured type. And the field "' + filterFieldName +'" is of type' + fieldConfig.getFieldType() + '.';
      var error = new Error(errorMessage);
      return Promise.reject(error);
    }
    if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig)) {
      if (typeof filterValue === 'string') {
        return Promise.resolve();
      } else {
        var errorMessage = 'Invalid filter value for the field "' + filterFieldName +'" on type ' + typeConfig.getType() + '. A value representing the _id for the data is expected, and a value of type ' + typeof filterValue + ' was given.';
        var error = new Error(errorMessage);
        return Promise.reject(error);
      }
    }
    if (typeof filterValue !== type && filterValue !== undefined) {
      var errorMessage = 'Invalid filter value for the field "' + filterFieldName +'" on type ' + typeConfig.getType() + '. A value of type ' + type + ' is expected, and a value of type ' + typeof filterValue + ' was given.';
      var error = new Error(errorMessage);
      return Promise.reject(error);
    }
    return Promise.resolve();
  }
  setDataForArrayField(objectsForArrayField, type, id, fieldQueryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery: LeDataQuery): Promise<any> {
    var queryForField = new LeDataQuery(type, id);
    queryForField.queryObject.includedFields =  fieldQueryObject.includedFields;

    return this.fetchQuery(queryForField, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery).then((data)=>{
      if(!data) {
        return;
      }
      data._id = id;
      data._type = type;
      objectsForArrayField.push(data);
    });
  }

  validateQueryObject(queryObject: any, fieldConfig: LeTypeFieldConfig):Promise<any> {
    return this.fetchTypeConfig(this.singularVersionOfType(fieldConfig)).then((typeConfig)=>{
      var includedFields = queryObject.includedFields;
      var promises = [];
      for (var fieldName in includedFields) {
        if(includedFields.hasOwnProperty(fieldName)) {
          var fieldConfig = typeConfig.getFieldConfig(fieldName);
          if(!fieldConfig) {
            var errorMessage = 'invalid field included in query, invalid field: ' + fieldName;
            promises.push(Promise.reject(new Error(errorMessage)));
          } else {
            promises.push(this.validateQueryObject(includedFields[fieldName], fieldConfig));
          }
        }
      }
      promises.push(this.validateFilterOnQueryObject(queryObject, typeConfig));
      return Promise.all(promises);
    });
  }

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
  configureType(config: LeTypeConfig): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var configObjectToSave:any = {};
      configObjectToSave.type = config.getType();
      configObjectToSave.saveLocation = config.saveLocation;
      var location = configObjectIndex + configObjectToSave.type;
      var fieldConfigs = config.getFieldConfigs();
      var promises = [];
      promises.push(this.validateFieldConfigs(fieldConfigs));
      for(var i = 0; i < fieldConfigs.length; i += 1) {
        var fieldConfig = fieldConfigs[i];
        promises.push(this.saveFieldConfig(fieldConfig).then((returnedFieldConfigID)=>{
          if(!configObjectToSave.fieldConfigs) {
            configObjectToSave.fieldConfigs = {};
          }
          configObjectToSave.fieldConfigs[returnedFieldConfigID] = true;
        }));
      }
      Promise.all(promises).then(()=>{
        this.dataServiceProvider.updateData(location, configObjectToSave, UpdateType.replace).then(()=>{
          resolve(undefined);
        }, (err)=>{
          reject(err);
        });
      }, function(err) {
        reject(err);
      });
    });
  }

  private validateFieldConfigs(fieldConfigs: LeTypeFieldConfig[]):Promise<void> {
    if(!fieldConfigs || !fieldConfigs.length) {
      return Promise.resolve();
    }
    let promises:Promise<void>[] = [];
    fieldConfigs.forEach((fieldConfig) => {
      promises.push(this.validateFieldConfig(fieldConfig));
    });
    return Promise.all(promises).then(()=>{});
  }

  private validateFieldConfig(fieldConfig: LeTypeFieldConfig):Promise<void> {
    if(fieldConfig.replaceOnUpdate && fieldConfig.getFieldType() !== 'object') {
      let error = new Error(fieldConfig.getFieldName() + ' must be of type object to set replaceOnUpdate');
      return Promise.reject(error);
    }
    if(fieldConfig.mergeOnUpdate && fieldConfig.getFieldType() !== 'object') {
      let error = new Error(fieldConfig.getFieldName() + ' must be of type object to set replaceOnUpdate');
      return Promise.reject(error);
    }
    if(fieldConfig.replaceOnUpdate && fieldConfig.getFieldConfigs() && fieldConfig.getFieldConfigs().length) {
      let error = new Error(fieldConfig.getFieldName() + ' cannot have sub-fields configured if replaceOnUpdate is set');
      return Promise.reject(error);
    }
    return Promise.resolve();
  }

  private saveFieldConfig(fieldConfig: LeTypeFieldConfig):Promise<string> {
    var fieldConfigObject:any = {};
    var fieldType = fieldConfig.getFieldType();
    if(this.isFieldConfigTypeAnArray(fieldConfig)) {
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
    for(var i = 0; i < innerFieldConfigs.length; i += 1) {
      var innerFieldConfig = innerFieldConfigs[i];
      promises.push(this.saveFieldConfig(innerFieldConfig).then((returnedFieldConfigID)=>{
        if(!fieldConfigObject.fieldConfigs) {
          fieldConfigObject.fieldConfigs = {};
        }
        fieldConfigObject.fieldConfigs[returnedFieldConfigID] = true;
      }));
    }
    return Promise.all(promises).then(()=>{
      return this.dataServiceProvider.createData('_leTypeFieldConfigs', fieldConfigObject);
    }).then((returnedConfigObject)=>{
      return returnedConfigObject._id;
    });
  }

  private fieldConfigForFieldConfigObject(fieldConfigObject:any): Promise<LeTypeFieldConfig> {
    var promises = [];
    var innerFieldConfigs = [];
    if(fieldConfigObject.fieldConfigs) {
      for(var fieldConfigID in fieldConfigObject.fieldConfigs) {
        promises.push(this.fetchTypeFieldConfig(fieldConfigID).then((returnedFieldConfig)=>{
          innerFieldConfigs.push(returnedFieldConfig);
        }));
      }
    }
    return Promise.all(promises).then(()=>{
      var typeToSet = fieldConfigObject.many ? fieldConfigObject.type + '[]' : fieldConfigObject.type;
      var fieldConfig = new LeTypeFieldConfig(fieldConfigObject.fieldName, typeToSet);
      fieldConfig.cascadeDelete = fieldConfigObject.cascadeDelete;
      fieldConfig.required = fieldConfigObject.required;
      fieldConfig.replaceOnUpdate = fieldConfigObject.replaceOnUpdate;
      fieldConfig.mergeOnUpdate = fieldConfigObject.mergeOnUpdate;
      fieldConfig.convertToLocalTimeZone = fieldConfigObject.convertToLocalTimeZone;
      fieldConfig.saveLocation = fieldConfigObject.saveLocation;
      for(var i = 0; i < innerFieldConfigs.length; i += 1) {
        var innerFieldConfig = innerFieldConfigs[i];
        fieldConfig.addField(innerFieldConfig);
      }
      return fieldConfig;
    });
  }
  private validateData(data:LeData, isUpdate: boolean): Promise<void> {
    if(!data) {
      var errorMessage = 'Invalid LeData object - cannot be undefined';
      var error = new Error(errorMessage);
      var promise = new Promise<void>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    if(!data._type) {
      var errorMessage = 'Invalid LeData object - _type must be set, data: ' + JSON.stringify(data);
      var error = new Error(errorMessage);
      var promise = new Promise<void>((resolve, reject)=>{
        reject(error);
      });
      return promise;
    }
    var configLocation = configObjectIndex + data._type;
    return new Promise<void>((resolve, reject)=>{
      this.dataServiceProvider.dataExists(configLocation).then((doesConfigExist)=>{
        if(!doesConfigExist) {
          var errorMessage = 'Invalid _type set on data: ' + JSON.stringify(data);
          var error = new Error(errorMessage);
          reject(error);
        } else {
          return this.fetchTypeConfig(data._type);
        }
      }).then((typeConfig)=>{
        var fieldConfigs = typeConfig.getFieldConfigs();
        var validateFieldPromises: Promise<any>[];
        validateFieldPromises = [];
        for(var i = 0; i < fieldConfigs.length; i += 1) {
          var fieldConfig = fieldConfigs[i];
          var saveLocation = (typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType()) + '/' + data._id + '/' + (fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName());
          if(!this.dataServiceProvider.equalToLastedFetchData(saveLocation, data[fieldConfig.getFieldName()])) {
            validateFieldPromises.push(this.validateField(fieldConfig, data, isUpdate));
          }
        }
        validateFieldPromises.push(this.validateNoExtraFields(typeConfig, data));
        return Promise.all(validateFieldPromises).then(()=>{
          resolve(undefined);
        }, (error)=>{
          reject(error);
        });
      });
    });
  }

  private validateNoExtraFields(typeConfig: LeTypeConfig, data: LeData): Promise<void> {
    for(var key in data) {
      var saveLocation = (typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType()) + '/' + data._id + '/' + key;
      var valueToCheck = data[key] instanceof Date ? data[key].getTime() : data[key];
      if(data.hasOwnProperty(key) && key.charAt(0) !== '_' && !typeConfig.fieldExists(key) && (!this.dataServiceProvider.equalToLastedFetchData(saveLocation, valueToCheck) || valueToCheck === undefined)) {
        var errorMessage = 'An additional field was set on the data object.\n';
        errorMessage += 'the field "' + key + '" is not configured on objects of type ' + data._type +'\n';
        errorMessage += 'data: ' + JSON.stringify(data);
        var error = new Error(errorMessage);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }

  private validateNoExtraFieldsOnObject(fieldConfig: LeTypeFieldConfig, data: Object) {
    for(var key in data[fieldConfig.getFieldName()]) {
      if(data.hasOwnProperty(key) && key.charAt(0) !== '_' && data.hasOwnProperty(key) && !fieldConfig.fieldExists(key)) {
        var errorMessage = 'An additional field was set on the data object.\n';
        errorMessage += 'the field "' + key + '" is not configured on the object\n';
        errorMessage += 'data: ' + JSON.stringify(data);
        var error = new Error(errorMessage);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }

  private validateField(fieldConfig: LeTypeFieldConfig, data: LeData, isUpdate): Promise<any> {
    var validationPromises: Promise<any>[] = [];
    var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data, isUpdate);
    var typePromise = this.validateTypeOnField(fieldConfig, data, isUpdate);
    validationPromises.push(requiredPromise);
    validationPromises.push(typePromise);
    return Promise.all(validationPromises);
  }

  private validateTypeOnField(fieldConfig: LeTypeFieldConfig, data: LeData, isUpdate: boolean): Promise<any> {
    var type = fieldConfig.getFieldType();
    var fieldName = fieldConfig.getFieldName();
    if (!data[fieldName]) {
      return Promise.resolve();
    } else if (type === 'object'){
      return this.validateObjectTypeOnField(fieldConfig, data, isUpdate);
    } else if (typeof data[fieldName] === type) {
      return Promise.resolve();
    } else if (type === 'Date' && data[fieldName] instanceof Date) {
      return Promise.resolve();
    } else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && type === data[fieldName]._type) {
      return this.validateData(data[fieldName], isUpdate);
    } else if (this.isFieldConfigTypeAnArray(fieldConfig)) {
      var fieldData = data[fieldName];
      if(fieldData && fieldData.constructor === Array) {
        var isValid = true;
        var arrayObjectValidationPromises = [];
        for(var i = 0; i < fieldData.length; i += 1) {
          var isMatchingCustom = this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && this.singularVersionOfType(fieldConfig) === fieldData[i]._type;
          var isMatchingPrimative = typeof fieldData[i] === this.singularVersionOfType(fieldConfig);
          var isMatchingDate = (fieldData[i] instanceof Date) && this.singularVersionOfType(fieldConfig) === 'Date';
          if (isMatchingDate || isMatchingPrimative) {
            continue;
          } else if (!isMatchingCustom) {
            isValid = false;
            break;
          } else {
            arrayObjectValidationPromises.push(this.validateData(fieldData[i], isUpdate));
          }
        }
        if (isValid) {
          return Promise.all(arrayObjectValidationPromises);
        }
      }
    }
    var errorMessage = 'The specified field is set to an invalid type -\n';
    errorMessage += 'fieldName: ' + fieldName + '\n';
    errorMessage += "field's set type: " + type + '\n';
    errorMessage += 'data: ' + JSON.stringify(data);
    var error = new Error(errorMessage);
    return Promise.reject(error);
  }
  private isFieldConfigTypeAnArray(fieldConfig: LeTypeFieldConfig): boolean {
    var fieldType = fieldConfig.getFieldType();
    return fieldType.indexOf('[]') === fieldType.length - 2;
  }
  private singularVersionOfType(fieldConfig:LeTypeFieldConfig): string {
    var fieldType = fieldConfig.getFieldType();
    if (this.isFieldConfigTypeAnArray(fieldConfig)) {
      return fieldType.substring(0, fieldType.length - 2);
    } else {
      return fieldType;
    }
  }
  private validateObjectTypeOnField(fieldConfig: LeTypeFieldConfig, data: LeData, isUpdate: boolean): Promise<void> {
    var innerFieldConfigs = fieldConfig.getFieldConfigs();
    var objectUnderValidation = data[fieldConfig.getFieldName()];
    var promises: Promise<void>[] = [];
    for(var i = 0; i < innerFieldConfigs.length; i += 1) {
      var innerFieldConfig = innerFieldConfigs[i];
      promises.push(this.validateField(innerFieldConfig, objectUnderValidation, isUpdate));
    }
    promises.push(this.validateNoExtraFieldsOnObject(fieldConfig, data));
    return new Promise<void>((resolve, reject)=>{
      Promise.all(promises).then(()=>{
        resolve(undefined);
      }, (err)=>{
        reject(err);
      });
    });
  }

  private validateRequiredPropertyOnField(fieldConfig: LeTypeFieldConfig, data: LeData, isUpdate: boolean): Promise<void> {
    var fieldName = fieldConfig.getFieldName();
    if(fieldConfig.required && !data[fieldName] && data.hasOwnProperty(fieldName)) {
      var errorMessage = fieldConfig.getFieldName() +' is required but was set to undefined on the LeData object, data: '  + JSON.stringify(data);
      var error = new Error(errorMessage);
      return Promise.reject(error);
    } else if(fieldConfig.required && !data[fieldName] && !isUpdate) {
      return new Promise<void>((resolve, reject)=>{
        if(data._id) {
          this.checkExistence(data._type, data._id).then((doesExist)=>{
            if(doesExist){
              resolve(undefined);
            } else {
              var errorMessage = fieldConfig.getFieldName() +' is required but was not set on the LeData and the object does not exist remotely, object, data: '  + JSON.stringify(data);
              var error = new Error(errorMessage);
              reject(error);
            }
          }, (err)=>{
            reject(err);
          });
        } else {
          var errorMessage = fieldConfig.getFieldName() +' is required but was not set on the LeData and the object does not exist remotely, object, data: '  + JSON.stringify(data);
          var error = new Error(errorMessage);
          reject(error);
        }
      });
    } else {
      return Promise.resolve();
    }
  }
  private fieldConfigTypeIsACustomLeDataType(fieldConfig:LeTypeFieldConfig):boolean {
    var type = this.singularVersionOfType(fieldConfig);
    return type !== 'string' && type !== 'boolean' && type !== 'number' && type !== 'Date' && type !== 'object';
  }

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
  private fetchTypeConfig(type:string): Promise<LeTypeConfig> {
    return new Promise<LeTypeConfig>((resolve, reject)=>{
      var location = configObjectIndex + type;
      this.dataServiceProvider.fetchData(location).then((returnedConfigObject)=>{
        if(!returnedConfigObject) {
          var errorMessage = type +' is not a configured type';
          var error = new Error(errorMessage);
          throw error;
        }
        return this.typeConfigForTypeConfigObject(returnedConfigObject);
      }).then((typeConfig)=>{
        typeConfig.addField(this.createdAtFieldName, 'Date').saveAt(this.createdAtSaveLocation);
        typeConfig.addField(this.lastUpdatedAtFieldName, 'Date').saveAt(this.lastUpdatedAtSaveLocation);
        typeConfig.addField(this.deletedAtFieldName, 'Date').saveAt(this.deletedAtSaveLocation);
        resolve(typeConfig);
      }, (err)=>{
        reject(err);
      });
    });
  };
  private fetchTypeFieldConfig(fieldConfigID: string): Promise<LeTypeFieldConfig> {
    var location = '_leTypeFieldConfigs/' + fieldConfigID;
    return this.dataServiceProvider.fetchData(location).then((fieldConfigObject)=>{
      return this.fieldConfigForFieldConfigObject(fieldConfigObject);
    });
  }
  private typeConfigForTypeConfigObject(typeConfigObject: any):Promise<LeTypeConfig> {
    return new Promise<LeTypeConfig>((resolve, reject)=>{
      var typeConfig = new LeTypeConfig(typeConfigObject.type);
      typeConfig.saveAt(typeConfigObject.saveLocation);
      var promises = [];
      for(var fieldConfigID in typeConfigObject.fieldConfigs) {
        if(typeConfigObject.fieldConfigs.hasOwnProperty(fieldConfigID)) {
          promises.push(this.fetchTypeFieldConfig(fieldConfigID).then((fieldConfig)=>{
            typeConfig.addField(fieldConfig);
          }));
        }
      }
      Promise.all(promises).then(()=>{
        resolve(typeConfig);
      });
    });
  }
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
  private saveData(data: LeData): Promise<any> {
    if(!data) {
      return Promise.resolve();
    }
    var initialPromise: Promise<any>;
    var isCreate = false;
    var rootRawData:LeData = {_type:data._type, _id:data._id};
    if(!this.hasLoadedServiceConfig) {
      initialPromise = this.dataServiceProvider.dataExists('_leServiceConfig').then((doesExist)=>{
        if(doesExist) {
          return this.dataServiceProvider.fetchData('_leServiceConfig');
        }
      }).then((serviceConfigObject)=>{
        this.hasLoadedServiceConfig = true;
        this.updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject);
      });
    } else {
      initialPromise = Promise.resolve();
    }
    return initialPromise.then(()=>{
      return this.locationForData(data)
    }).then((location)=>{
      var updateCreatedAtPropmise;
      if(!data._id) {
        isCreate = true;
        data[this.createdAtFieldName] = new Date();
        updateCreatedAtPropmise = Promise.resolve();
      } else {
        updateCreatedAtPropmise = this.dataServiceProvider.dataExists(location).then((doesExist)=>{
          if(!doesExist) {
            isCreate =true;
            data[this.createdAtFieldName] = new Date();
          }
        });
      }
      return updateCreatedAtPropmise;
    }).then(()=>{
      var promises = [];
      var shouldUpdateLastUpdated = false;
      for(var key in data) {
        if(key !== '_type' && key !== '_id') {
          shouldUpdateLastUpdated = true;
        }
        if(data.hasOwnProperty(key)) {
          promises.push(this.saveFieldForData(data, key, isCreate, rootRawData));
        }
      }
      if(shouldUpdateLastUpdated) {
        data[this.lastUpdatedAtFieldName] = new Date();
        promises.push(this.saveFieldForData(data, this.lastUpdatedAtFieldName, isCreate, rootRawData));
      }
      return Promise.all(promises);
    }).then(()=>{
      if(isCreate) {
        return this.createRootRawData(rootRawData);
      }
    }).then(()=>{
      if(!data._id && rootRawData._id) {
        data._id = rootRawData._id;
      }
      return data;
    });
  };

  private createRootRawData(rootRawData:LeData) {
    return this.fetchTypeConfig(rootRawData._type).then((typeConfig)=>{
      var saveLocation = typeConfig.saveLocation ? typeConfig.saveLocation : typeConfig.getType();
      return this.dataServiceProvider.createData(saveLocation, rootRawData);
    });
  }

  private saveFieldForData(data:LeData, fieldName:string, isCreate:boolean, rootRawData:LeData): Promise<any> {
    var location;
    var fieldConfig;
    var rawFieldName;
    if(fieldName === '_id' || fieldName === '_type') {
      return Promise.resolve();
    }
    return this.fetchTypeConfig(data._type).then((typeConfig)=>{
      fieldConfig = typeConfig.getFieldConfig(fieldName);
      location = data._type;
      if (typeConfig.saveLocation) {
        location = typeConfig.saveLocation;
      }
      rawFieldName = fieldConfig && fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldName;
      location += '/' + data._id + '/' + rawFieldName;
      if(fieldConfig && this.fieldConfigTypeIsACustomLeDataType(fieldConfig)){
        return this.saveDataAndSetField(data[fieldName], location, isCreate, rootRawData, rawFieldName);
      } else if(fieldConfig && fieldConfig.getFieldType() === 'object') {
        return this.saveObjectField(location, fieldConfig, data[fieldName], isCreate, rootRawData);
      } else {
        var dataToSave;
        if (fieldConfig && fieldConfig.getFieldType() === 'Date') {
          dataToSave = data[fieldName] && data[fieldName].getTime();
        } else {
          dataToSave = data[fieldName];
        }
        if(isCreate) {
          if(rootRawData && rawFieldName && dataToSave !== undefined) {
            rootRawData[rawFieldName] = dataToSave;
          }
          return;
        }
        return this.dataServiceProvider.updateData(location, dataToSave);
      }
    });
  }

  private saveDataAndReturnObjectToSetOnField(data:any): Promise<any> {
    if(data && data.constructor === Array) {
      var objectToSetAtLocation = {};
      var promises = [];
      data.forEach((dataObjectInArray)=>{
        promises.push(this.saveData(dataObjectInArray).then((returnedData)=>{
          objectToSetAtLocation[returnedData._id] = true;
        }));
      });
      return Promise.all(promises).then(()=>{
        return objectToSetAtLocation;
      });
    } else if (data === undefined) {
      return Promise.resolve();
    } else {
      return this.saveData(data).then((returnedData)=>{
        return returnedData._id;
      });
    }
  }

  private saveDataAndSetField(data, location, isCreate:boolean, rootRawData:LeData, rawFieldName:string) {
    var dataService = this;
    return this.saveDataAndReturnObjectToSetOnField(data).then(function(dataToSetOnField){
      if(isCreate) {
        if(rootRawData && rawFieldName && dataToSetOnField !== undefined) {
          rootRawData[rawFieldName] = dataToSetOnField;
        }
        return;
      }
      if(dataToSetOnField === undefined) {
        return dataService.dataServiceProvider.deleteData(location);
      } else {
        return dataService.dataServiceProvider.updateData(location, dataToSetOnField);
      }
    });
  }

  private saveObjectField(location:string, fieldConfig: LeTypeFieldConfig, data:any, isCreate: boolean, rootRawData: LeData): Promise<any>{
    var dataService = this;
    var rawFieldName = fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName();
    rootRawData[rawFieldName] = {};
    var innerRawData = rootRawData[rawFieldName];
    var promises = [];
    var innerFieldConfigs = fieldConfig.getFieldConfigs();
    if (!innerFieldConfigs.length) {
      if(isCreate) {
        rootRawData[rawFieldName] = data;
        return Promise.resolve();
      } else {
        if(fieldConfig.replaceOnUpdate) {
          return dataService.dataServiceProvider.updateData(location, data, UpdateType.replace);
        } else if (fieldConfig.mergeOnUpdate) {
          return dataService.dataServiceProvider.updateData(location, data, UpdateType.merge);
        } else {
          return dataService.dataServiceProvider.updateData(location, data, UpdateType.default);
        }
      }
    }
    for(var i = 0; i < innerFieldConfigs.length; i += 1) {
      var innerFieldConfig = innerFieldConfigs[i];
      var innerRawFieldName = innerFieldConfig.saveLocation ? innerFieldConfig.saveLocation : innerFieldConfig.getFieldName();
      var innerLocation = location + '/' + innerRawFieldName;
      if(data.hasOwnProperty(innerFieldConfig.getFieldName())) {
        promises.push(this.saveField(innerLocation, innerFieldConfig, data[innerFieldConfig.getFieldName()], isCreate, innerRawData));
      }
    }
    return Promise.all(promises);
  }

  private saveField(location:string, fieldConfig: LeTypeFieldConfig, fieldData: any, isCreate:boolean, rawData:any):Promise<any>{
    var dataService = this;
    var rawFieldName = fieldConfig.saveLocation ? fieldConfig.saveLocation : fieldConfig.getFieldName();
    if(this.fieldConfigTypeIsACustomLeDataType(fieldConfig)){
      if(fieldData && fieldData.constructor === Array) {
        var objectToSetAtLocation = {};
        var promises = [];
        fieldData.forEach((dataObjectInArray)=>{
          promises.push(this.saveData(dataObjectInArray).then((returnedData)=>{
            objectToSetAtLocation[returnedData._id] = true;
          }));
        });
        return Promise.all(promises).then(()=>{
          if(isCreate) {
            rawData[rawFieldName] = objectToSetAtLocation;
          } else {
            return dataService.dataServiceProvider.updateData(location, objectToSetAtLocation);
          }
        });
      } else {
        return this.saveData(fieldData).then((returnedData)=>{
          if(isCreate) {
            rawData[rawFieldName] = objectToSetAtLocation;
          } else {
            return dataService.dataServiceProvider.updateData(location, returnedData._id);
          }
        });
      }
    } else if(fieldConfig.getFieldType() === 'object') {
      return this.saveObjectField(location, fieldConfig, fieldData, isCreate, rawData);
    } else {
      if(isCreate) {
        rawData[rawFieldName] = fieldData;
      } else {
        return this.dataServiceProvider.updateData(location, fieldData);
      }
    }
  }
}
