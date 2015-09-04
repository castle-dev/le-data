/// <reference path="le-data.ts"/>
/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

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
class LeDataService {

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
		return new Promise((resolve, reject) => {

		});
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
		return new Promise((resolve, reject) => {

		});
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
	 * @returns Promise<LeData> resolves with the data that was deleted.
	 */
	deleteData(data: LeData): Promise<LeData> {
		return new Promise((resolve, reject) => {

		});
	}

	/**
	 * Retrieves the data that matches the query data, and retrieves it again every time the data that matches the query has changed.
	 *
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
	
}
