import Promise from "ts-promise";

export interface FetchDataOptions {
  filterFieldName?: string;
  filterValue?: any;
}

export enum UpdateType {
  default,
  replace,
  merge,
}

export interface LeDataServiceProvider {
  dataExists(location:string): Promise<boolean>;
  fetchData(location:string, fetchDataOptions?: FetchDataOptions): Promise<any>;
  createData(location:string, data:LeData): Promise<LeData>;
  updateData(location:string, data:any, updateType?:UpdateType): Promise<any>;
  deleteData(location:string): Promise<void>;
  lock(word:string): Promise<void>;
  unlock(word:string): Promise<void>;
  sync(location:string, callback:(data)=>void, errorCallback:(error)=>void): any;
  unsync(location:string, unsyncObject:any):void;
  equalToLastedFetchData(location:string, data: any): boolean;
  generateID(): string;
}

export default LeDataServiceProvider;
