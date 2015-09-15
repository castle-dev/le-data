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
				this.dataServiceProvider.dataExists(data._type, data._id).then((dataExists)=>{
					if(dataExists){
						var errorMessage = 'Attempted to create data with an id and type that already exists, _id: ' + data._id + ', _type: ' + data._type;
						var error = new Error(errorMessage);
						reject(error);
					} else {
						return this.dataServiceProvider.validateData(data);
					}
				}).then(()=>{
					return this.dataServiceProvider.saveData(data);
				}).then(()=>{
					resolve(data);
				}, (err)=>{
					reject(err);
				});
			});
		}
		return new Promise<LeData>((resolve, reject) => {});
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
		return new Promise<LeData>((resolve, reject) => {});
	}

	/**
	 * Soft deletes the data in the database.
	 * If a LeData object is configured with fields that cascade delete, the data at those fields will also soft delete.
	 * Sets _deletedAt, and _lastUpdatedAt.
	 *
	 * Fails if the LeData object passed in does not matcht he LedData object stored in the database.
	 * 		This is to insure that data writen to the database from another source is not inadvertently removed.
	 * Fails if any of the values for the fields specified in the LeData interface differ from the ones saved in the database.
	 *
	 * @function deleteData
	 * @memberof LeDataService
	 * @instance
	 * @param data LeData - The data to delete.
	 * @returns Promise<LeData> - Resolves with the data that was deleted.
	 */
	deleteData(data: LeData): Promise<LeData> {
		return new Promise<LeData>((resolve, reject) => {});
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
}
