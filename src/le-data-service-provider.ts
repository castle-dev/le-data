/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

export interface LeDataServiceProvider {
  dataExists(location:string): Promise<boolean>;
  fetchData(location:string): Promise<any>;
  createData(location:string, data:LeData): Promise<LeData>;
  updateData(location:string, data:any): Promise<any>;
  deleteData(location:string): Promise<void>;
  sync(location:string, callback:(data)=>void, errorCallback:(error)=>void): any;
  unsync(location:string, unsyncObject:any):void;
  generateID(): string;
}

export default LeDataServiceProvider;
