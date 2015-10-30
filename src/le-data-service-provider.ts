/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

export interface LeDataServiceProvider {
  dataExists(location:string): Promise<boolean>;
  fetchData(location:string): Promise<any>;
  saveData(location:string, data:any): Promise<void>;
  deleteData(location:string): Promise<void>;
}

export default LeDataServiceProvider;
