/// <reference path="le-data.ts"/>
/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />

import Promise from "ts-promise";
import LeDataServiceProvider from "./le-data-service-provider.ts";

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
	constructor(provider: LeDataServiceProvider) {
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
				this.dataExists(data._type, data._id).then((dataExists)=>{
					if(dataExists){
						var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
						var error = new Error(errorMessage);
						reject(error);
					} else {
						return this.validateData(data);
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
				this.validateData(data).then(()=>{
					return this.saveData(data);
				}).then((returnedData)=>{
					resolve(returnedData);
				}, (err)=>{
					reject(err);
				});
			});
		}
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
			this.dataExists(data._type, data._id).then((dataExists)=>{
				if(dataExists){
					return this.validateData(data);
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
			console.log(errorMessage);
			var error = new Error(errorMessage);
			var promise = new Promise<void>((resolve, reject)=>{
				reject(error);
			});
			return promise;
		}
		if(!id) {
			var errorMessage = 'Undefined id passed to deleteData.\ntype: ' + type + ' id: ' + id;
			console.log(errorMessage);
			var error = new Error(errorMessage);
			var promise = new Promise<void>((resolve, reject)=>{
				reject(error);
			});
			return promise;
		}
		return this.deleteData(type, id);
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
		return new Promise<LeData>((resolve, reject) => {});
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
		return new Promise<void>((resolve, reject) => {});
	}

	private validateData(data:LeData): Promise<void> {
		if(!data) {
			var errorMessage = 'Invalid LeData object - cannot be undefined';
			var error = new Error(errorMessage);
			var promise = new Promise<void>((resolve, reject)=>{
				reject(error);
			});
			return promise;
		}
		this.fetchTypeConfig(data._type).then((typeConfig)=>{
			var fieldConfigs = typeConfig.getFieldConfigs();
			var validateFieldPromises: Promise<void>[];
			validateFieldPromises = [];
			for(var i = 0; i < fieldConfigs.length; i += 1) {
				var fieldConfig = fieldConfigs[i];
				validateFieldPromises.push(this.validateField(fieldConfig, data));
			}
			validateFieldPromises.push(this.validateNoExtraFields(typeConfig, data));
			return Promise.all(validateFieldPromises);
		});
	}

	private validateNoExtraFields(typeConfig: LeTypeConfig, data: LeData): Promise<void> {
		for(var key in data) {
			if(key.charAt(0) !== '_' && data.hasOwnProperty(key) && !typeConfig.fieldExists(key)) {
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
		for(var key in data) {
			if(key.charAt(0) !== '_' && data.hasOwnProperty(key) && !fieldConfig.fieldExists(key)) {
				var errorMessage = 'An additional field was set on the data object.\n';
				errorMessage += 'the field "' + key + '" is not configured on the object\n';
				errorMessage += 'data: ' + JSON.stringify(data);
				var error = new Error(errorMessage);
				return Promise.reject(error);
			}
		}
		return Promise.resolve();
	}

	private validateField(fieldConfig: LeTypeFieldConfig, data: LeData): Promise<void> {
		var validationPromises: Promise<void>[];
		var requiredPromise = this.validateRequiredPropertyOnField(fieldConfig, data);
		var typePromise = this.validateTypeOnField(fieldConfig, data);

		validationPromises.push(requiredPromise);
		validationPromises.push(typePromise);

		return new Promise<void>((resolve, reject)=>{
			Promise.all(validationPromises).then(()=>{
				resolve(undefined);
			}, (err)=>{
				reject(err);
			});
		});
	}

	private validateTypeOnField(fieldConfig: LeTypeFieldConfig, data: LeData): Promise<void> {
		var type = fieldConfig.getFieldType();
		var fieldName = fieldConfig.getFieldName();
		if (!data[fieldName]) {
			return Promise.resolve();
		} else if (type === 'object'){
			return this.validateObjectTypeOnField(fieldConfig, data);
		} else if (typeof data[fieldName] === type) {
			return Promise.resolve();
		} else if (type === 'Date' && data[fieldName] instanceof Date) {
			return Promise.resolve();
		} else if (this.fieldConfigTypeIsACustomLeDataType(fieldConfig) && type === data[fieldName]._type) {
			return Promise.resolve();
		} else {
			var errorMessage = 'The specified field is set to an invalid type -\n';
			errorMessage += 'fieldName: ' + fieldName + '\n';
			errorMessage += "field's configured type: " + type + '\n';
			errorMessage += 'data: ' + JSON.stringify(data);
			var error = new Error(errorMessage);
			return Promise.reject(error);
		}
	}

	private validateObjectTypeOnField(fieldConfig: LeTypeFieldConfig, data: LeData): Promise<void> {
		var innerFieldConfigs = fieldConfig.getFieldConfigs();
		var objectUnderValidation = data[fieldConfig.getFieldName()];
		var promises: Promise<void>[] = [];
		for(var i = 0; i < innerFieldConfigs.length; i += 1) {
			var innerFieldConfig = innerFieldConfigs[i];
			promises.push(this.validateField(innerFieldConfig, objectUnderValidation));
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

	private validateRequiredPropertyOnField(fieldConfig: LeTypeFieldConfig, data: LeData): Promise<void> {
		var fieldName = fieldConfig.getFieldName();
		if(fieldConfig.required && !data[fieldName] && data.hasOwnProperty(fieldName)) {
			var errorMessage = fieldConfig.getFieldName() +' is required but was not set to undefined on the LeData object, data: '  + JSON.stringify(data);
			var error = new Error(errorMessage);
			return Promise.reject(error);
		} else if(fieldConfig.required && !data[fieldName]) {
			return new Promise<void>((resolve, reject)=>{
				if(data._id) {
					this.dataExists(data._type, data._id).then((doesExist)=>{
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
		var type = fieldConfig.getFieldType();
		return type !== 'string' && type !== 'boolean' && type !== 'number' && type !== 'Date' && type !== 'object';
	}

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
	private dataExists(type: string, id: string): Promise<boolean> {
		return new Promise<boolean>((resolve,reject)=>{});
	}

	/**
	 * Returns the LeTypeConfig stored remotely for the specified type
	 * Fails if the type is not configured
	 *
	 * @function fetchTypeConfig
	 * @memberof LeDataServiceProvider
	 * @instance
	 * @param type LeDataQuery - The type for the LeTypeConfig
	 * @returns Promise<LeTypeConfig>
	 */
	private fetchTypeConfig(type:string): Promise<LeTypeConfig> {
		return new Promise<LeTypeConfig>((resolve, reject)=>{})
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
	private saveData(data: LeData): Promise<LeData> {
		return new Promise<LeData>((resovle, reject)=>{});
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
	private saveTypeConfig(config: LeTypeConfig): Promise<void> {
		return new Promise<void>(()=>{});
	}

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
	private syncData(type: string, id: string, callback:(data: LeData) => void, errorCallback:(error:Error)=>void): void {

	}

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
	private fetchData(type: string, id:string): Promise<LeData> {
		return new Promise<LeData>(()=>{});
	}
}
