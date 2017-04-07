/// <reference path="le-data.d.ts" />
import Promise from "ts-promise";
import { LeDataServiceProvider } from "./le-data-service-provider";
import LeTypeConfig from "./le-type-config";
import LeTypeFieldConfig from "./le-type-field-config";
import LeDataQuery from "./le-data-query";
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
export declare class LeDataService {
    private dataServiceProvider;
    private queryDictionary;
    private createdAtSaveLocation;
    private createdAtFieldName;
    private lastUpdatedAtSaveLocation;
    private lastUpdatedAtFieldName;
    private deletedAtFieldName;
    private deletedAtSaveLocation;
    private archiveDeletedData;
    private archiveLocation;
    private hasLoadedServiceConfig;
    private encryptionService;
    constructor(provider: LeDataServiceProvider);
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
    createData(data: LeData): Promise<LeData>;
    create(data: LeData): Promise<LeData>;
    update(data: LeData): Promise<LeData>;
    delete(type: string, id: string): Promise<void>;
    stream(query: LeDataQuery, callback: (data: LeData[]) => Promise<any>): Promise<any>;
    private streamSection(startAt, packetSize, query, callback, complete, errorCallback);
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
    checkExistence(type: string, id: string): Promise<boolean>;
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
    lock(word: string): Promise<void>;
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
    unlock(word: string): Promise<void>;
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
    updateData(data: LeData): Promise<LeData>;
    setEncryptionKey(key: string): void;
    private locationForData(data);
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
    deleteData(type: string, id: string): Promise<void>;
    removeDataFromArray(type: string, id: string, fieldName: string, data: LeData): Promise<void>;
    private cascadeDeletes(typeConfig, id);
    private handleCascadeDelete(typeConfig, fieldConfig, id);
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
    sync(query: LeDataQuery, callback: (data: LeData) => void, errorCallback: (error: Error) => void): void;
    /**
     * Stops listening to a synced query. This needs to be called when the sync is no longer being used to avoid memory leaks and improve performance.
     *
     * @function unsync
     * @memberof LeDataService
     * @instance
     * @param query LeDataQuery - The query used in the origional sync. It must have the same id as the query used to sync. This insures that only the syncs used for that query object are removed.
     */
    unsync(query: LeDataQuery): void;
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
    search(query: LeDataQuery): Promise<LeData>;
    private fetchQuery(query, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
    fetchDataWithQueryObjectAndTypeConfig(query: any, typeConfig: any, shouldSync: boolean, syncDictionary: any, callback: (data) => void, errorCallback: (err) => void, outerMostQuery: LeDataQuery): Promise<LeData>;
    private fetchAndConvertData(location, fetchDataOptions, dataID, dataType, typeConfig, queryObject, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
    private updateServiceConfigVariablesWithServiceConfigObject(serviceConfigObject);
    private syncLocation(location, query, syncDictionary, callback, errorCallback);
    addFieldsToRawDataObjects(rawDataObject: any, fieldConfigs: LeTypeFieldConfig[], queryObject: any, shouldSync: boolean, syncDictionary: any, callback: (data) => void, errorCallback: (err) => void, outerMostQuery: LeDataQuery): Promise<any>;
    addFieldsToRawDataObject(rawDataObject: any, fieldConfigs: LeTypeFieldConfig[], queryObject: any, shouldSync: boolean, syncDictionary: any, callback: (data) => void, errorCallback: (err) => void, outerMostQuery: LeDataQuery): Promise<any>;
    addFetchFieldPromises(rawDataObject: any, fieldConfigsByLocation: any, queryObject: any, promises: any, data: any, shouldSync: any, syncDictionary: any, callback: any, errorCallback: any, outerMostQuery: LeDataQuery): void;
    private setFieldOnData(data, fieldName, fieldConfig, queryObject, rawDataObject, rawFieldName, shouldSync, syncDictionary, callback, errorCallback, outerMostQuery);
    fetchFieldData(rawValue: any, fieldConfig: LeTypeFieldConfig, fieldQueryObject: any, fieldName: any, shouldSync: any, syncDictionary: any, callback: any, errorCallback: any, outerMostQuery: LeDataQuery): any;
    setDataOnFeildInfo(fieldInfo: any, type: any, id: any, fieldQueryObject: any, shouldSync: any, syncDictionary: any, callback: any, errorCallback: any, outerMostQuery: LeDataQuery): Promise<any>;
    fieldConfigsByLocation(fieldConfigs: LeTypeFieldConfig[]): {};
    validateQuery(query: LeDataQuery): Promise<any>;
    private fieldConfigForFilterFieldName(filterFieldName, typeConfig);
    private validateFilterOnQueryObject(queryObject, typeConfig);
    setDataForArrayField(objectsForArrayField: any, type: any, id: any, fieldQueryObject: any, shouldSync: any, syncDictionary: any, callback: any, errorCallback: any, outerMostQuery: LeDataQuery): Promise<any>;
    validateQueryObject(queryObject: any, fieldConfig: LeTypeFieldConfig): Promise<any>;
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
    configureType(config: LeTypeConfig): Promise<void>;
    private validateFieldConfigs(fieldConfigs);
    private validateFieldConfig(fieldConfig);
    private saveFieldConfig(fieldConfig);
    private fieldConfigForFieldConfigObject(fieldConfigObject);
    private validateData(data, isUpdate);
    private validateNoExtraFields(typeConfig, data);
    private validateNoExtraFieldsOnObject(fieldConfig, data);
    private validateField(fieldConfig, data, isUpdate);
    private validateTypeOnField(fieldConfig, data, isUpdate);
    private isFieldConfigTypeAnArray(fieldConfig);
    private singularVersionOfType(fieldConfig);
    private validateObjectTypeOnField(fieldConfig, data, isUpdate);
    private validateRequiredPropertyOnField(fieldConfig, data, isUpdate);
    private fieldConfigTypeIsACustomLeDataType(fieldConfig);
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
    private fetchTypeConfig(type);
    private fetchTypeFieldConfig(fieldConfigID);
    private typeConfigForTypeConfigObject(typeConfigObject);
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
    private saveData(data);
    private createRootRawData(rootRawData);
    private saveFieldForData(data, fieldName, isCreate, rootRawData);
    private saveDataAndReturnObjectToSetOnField(data);
    private saveDataAndSetField(data, location, isCreate, rootRawData, rawFieldName);
    private saveObjectField(location, fieldConfig, data, isCreate, rootRawData);
    private saveField(location, fieldConfig, fieldData, isCreate, rawData);
}
