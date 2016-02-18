/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";
import LeDataServiceProvider from "../le-data-service-provider";

export class LeDataServiceProviderFirebase implements LeDataServiceProvider {
  firebaseRef:any;
  lastedFetchedValueStore: any;
  constructor(firebaseRef:any) {
    this.firebaseRef = firebaseRef;
    this.lastedFetchedValueStore = {};
  }
  dataExists(location:string): Promise<boolean> {
    var deferred = Promise.defer<boolean>();
    var provider = this;
    this.firebaseRef.child(location).once('value', function(snapshot){
      provider.updateStoreForLocation(location, snapshot.val());
      deferred.resolve(snapshot.val() !== null);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
  fetchData(location:string): Promise<any> {
    var deferred = Promise.defer<any>();
    var provider = this;
    this.firebaseRef.child(location).once('value', function(snapshot){
      provider.updateStoreForLocation(location, snapshot.val());
      deferred.resolve(snapshot.val());
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
  createData(location:string, data:LeData): Promise<LeData> {
    removeUndefinedFeilds(data);
    var deferred = Promise.defer<LeData>();
    var provider = this;
    if(!data._id) {
      var newFieldRef = this.firebaseRef.child(location).push(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        var newFieldLocationArray = newFieldRef.toString().split('/');
        var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
        data._id = newID;
        provider.updateStoreForLocation(location, data);
        deferred.resolve(data);
      });
    } else {
      this.firebaseRef.child(location).child(data._id).set(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        provider.updateStoreForLocation(location, data);
        deferred.resolve(data);
      });
    }

    return deferred.promise;
  }
  updateData(location:string, data:any): Promise<any> {
    removeUndefinedFeilds(data);
    if(typeof data === 'object') {
      var innerUpdatePromises = [];
      for (var key in data) {
        if(data.hasOwnProperty(key)) {
          var innerLocation = location += '/' + key;
          innerUpdatePromises.push(this.updateData(innerLocation, data[key]));
        }
      }
      return Promise.all(innerUpdatePromises);
    }
    if(data === this.storedValueForLocation(location)) {
      return Promise.resolve();
    }
    var deferred = Promise.defer<any>();
    this.firebaseRef.child(location).set(data, function(err){
      if(err) {
        deferred.reject(err);
        return;
      }
      deferred.resolve(data);
    });
    return deferred.promise;
  }
  deleteData(location:string): Promise<void> {
    var deferred = Promise.defer<void>();
    var provider = this;
    this.firebaseRef.child(location).remove(function(err){
      if(err) {
        deferred.reject(err);
        return;
      }
      provider.updateStoreForLocation(location, undefined);
      deferred.resolve(undefined);
    });
    return deferred.promise;
  }
  sync(location:string, callback:(data)=>void, errorCallback:(error)=>void): any {
    var referenceToThis = this;
    return this.firebaseRef.child(location).on('value', function(snapshot){
      referenceToThis.updateStoreForLocation(location, snapshot.val());
      callback(snapshot.val());
    }, function(err){
      errorCallback(err);
    });
  }
  unsync(location:string, unsyncObject:any):void {
    this.firebaseRef.child(location).off('value', unsyncObject);
  }
  updateStore(store: any, key:string, value) {
    if(typeof value === 'object') {
      for(var innerKey in value) {
        if(value.hasOwnProperty(innerKey)) {
          if(!store[key]) {
            store[key] = {};
          }
          this.updateStore(store[key], innerKey, value[innerKey]);
        }
      }
    } else {
      store[key] = value;
    }
  }
  updateStoreForLocation(location: string, value) {
    var locationArray = location.split('/');
    var currentStore = this.lastedFetchedValueStore;
    var lastSublocation;
    for(var i = 0; i < locationArray.length; i += 1) {
      var sublocation = locationArray[i];
      if(!sublocation.length) {
        break;
      }
      if(!lastSublocation) {
        lastSublocation = sublocation;
      } else {
        if(!currentStore[lastSublocation]) {
          currentStore[lastSublocation] = {};
        }
        currentStore = currentStore[lastSublocation];
        lastSublocation = sublocation;
      }
    }
    this.updateStore(currentStore, lastSublocation, value);
  }
  storedValueForLocation(location:string):any {
    var locationArray = location.split('/');
    var currentStore = this.lastedFetchedValueStore;
    var lastSublocation;
    for(var i = 0; i < locationArray.length; i += 1) {
      var sublocation = locationArray[i];
      if(!sublocation.length) {
        break;
      }
      if(!lastSublocation) {
        lastSublocation = sublocation;
      } else {
        if(!currentStore[lastSublocation]) {
          currentStore[lastSublocation] = {};
        }
        currentStore = currentStore[lastSublocation];
        lastSublocation = sublocation;
      }
    }
    return currentStore[sublocation];
  }
}
function removeUndefinedFeilds(data) {
  for(var key in data) {
    if(data.hasOwnProperty(key)) {
      if(data[key] === undefined) {
        delete data[key];
      }
    }
  }
}
export default LeDataServiceProviderFirebase;
