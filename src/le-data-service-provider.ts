/// <reference path="../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";

export interface LeDataServiceProvider {
  dataExists(type: string, id: string): Promise<boolean>;
  validateData(data: LeData): Promise<void>;
  saveData(type:string, id: string): Promise<LeData>;
  saveTypeConfig(config: LeTypeConfig): Promise<void>;
  // sync(type: string, id?: string, config?: LeDataServiceProviderSyncConfig);
}

export default LeDataServiceProvider;
