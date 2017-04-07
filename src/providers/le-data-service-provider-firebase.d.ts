import Promise from "ts-promise";
import { FetchDataOptions, LeDataServiceProvider, UpdateType } from "../le-data-service-provider";
export declare class LeDataServiceProviderFirebase implements LeDataServiceProvider {
    firebaseRef: any;
    lastedFetchedValueStore: any;
    constructor(firebaseRef: any);
    equalToLastedFetchData(location: string, data: any): boolean;
    dataExists(location: string): Promise<boolean>;
    fetchData(location: string, fetchDataOptions?: FetchDataOptions): Promise<any>;
    createData(location: string, data: LeData): Promise<LeData>;
    updateData(location: string, data: any, updateType?: UpdateType): Promise<any>;
    deleteData(location: string): Promise<void>;
    sync(location: string, callback: (data) => void, errorCallback: (error) => void): any;
    unsync(location: string, unsyncObject: any): void;
    lock(word: string): Promise<void>;
    unlock(word: string): Promise<void>;
    generateID(): string;
    updateStore(store: any, key: string, value: any): void;
    updateStoreForLocation(location: string, value: any): void;
    storedValueForLocation(location: string): any;
}
export default LeDataServiceProviderFirebase;
