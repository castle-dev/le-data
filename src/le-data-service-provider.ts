/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

export interface LeDataServiceProvider {
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
  dataExists(type: string, id: string): Promise<boolean>;

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
  fetchTypeConfig(type:string): Promise<LeTypeConfig>;

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
  saveData(data: LeData): Promise<LeData>;

  /**
   * Saves the LeTypeConfig remotely.
   *
   * @function saveTypeConfig
   * @memberof LeDataServiceProvider
   * @instance
   * @param config LeTypeConfig - The LeTypeConfig to be saved.
   * @returns Promise<void>
   */
  saveTypeConfig(config: LeTypeConfig): Promise<void>;

  /**
   * Deletes the data remotely. This does not handle cascading deletes.
   *
   * @function deleteData
   * @memberof LeDataServiceProvider
   * @instance
   * @param type string - The type of the data to delete.
   * @param id string - The id of the data to delete
   * @returns Promise<void>
   */
  deleteData(type: string, id: string): Promise<void>;

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
  syncData(type: string, id: string, callback:(data: LeData) => void, errorCallback:(error:Error)=>void): void;

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
  fetchData(type: string, id:string): Promise<LeData>;
}

export default LeDataServiceProvider;
