/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

export interface LeDataServiceProvider {
  dataExists(type: string, id: string): Promise<boolean>;
  validateQuery(query: LeDataQuery): Promise<void>;
  validateData(data: LeData): Promise<void>;
  saveData(data: LeData): Promise<LeData>;
  saveTypeConfig(config: LeTypeConfig): Promise<void>;
  deleteData(type: string, id: string): Promise<void>;
  syncData(type: string, id: string, callback:(data: LeData) => void, errorCallback:(error:Error)=>void): void;
}

export default LeDataServiceProvider;
