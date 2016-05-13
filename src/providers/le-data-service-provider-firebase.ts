/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";
import {FetchDataOptions, LeDataServiceProvider} from "../le-data-service-provider";

export class LeDataServiceProviderFirebase implements LeDataServiceProvider {
  firebaseRef:any;
  lastedFetchedValueStore: any;
  constructor(firebaseRef:any) {
    this.firebaseRef = firebaseRef;
    this.lastedFetchedValueStore = {};
  }
  equalToLastedFetchData(location:string, data: any): boolean {
    if(typeof data === 'object') {
      var doesMatch = true;
      for (var key in data) {
        if(data.hasOwnProperty(key)) {
          var innerLocation = location + '/' + key;
          doesMatch = doesMatch && this.equalToLastedFetchData(innerLocation, data[key]);
        }
      }
      return doesMatch;
    } else {
      return data === this.storedValueForLocation(location);
    }
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
  fetchData(location:string, fetchDataOptions?: FetchDataOptions): Promise<any> {
    var deferred = Promise.defer<any>();
    var provider = this;
    var locationRef = this.firebaseRef.child(location);
    if(fetchDataOptions && fetchDataOptions.hasOwnProperty('filterFieldName')) {
      locationRef = locationRef.orderByChild(fetchDataOptions.filterFieldName);
      locationRef = locationRef.equalTo(fetchDataOptions.filterValue);
    }
    locationRef.once('value', function(snapshot){
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
    var dataID = data._id;
    var dataType = data._type;
    delete data._id;
    delete data._type;
    if(!dataID) {
      var newFieldRef = this.firebaseRef.child(location).push(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        var newFieldLocationArray = newFieldRef.toString().split('/');
        var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
        provider.updateStoreForLocation(location, data);
        data._id = newID;
        if(dataType) {
          data._type = dataType;
        }
        deferred.resolve(data);
      });
    } else {
      this.firebaseRef.child(location).child(dataID).set(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        provider.updateStoreForLocation(location, data);
        data._id = dataID;
        if(dataType) {
          data._type = dataType;
        }
        deferred.resolve(data);
      });
    }

    return deferred.promise;
  }
  updateData(location:string, data:any): Promise<any> {
    if(typeof data === 'object') {
      var innerUpdatePromises = [];
      for (var key in data) {
        if(data.hasOwnProperty(key)) {
          var innerLocation = location + '/' + key;
          innerUpdatePromises.push(this.updateData(innerLocation, data[key]));
        }
      }
      return Promise.all(innerUpdatePromises);
    }
    if(data === this.storedValueForLocation(location)) {
      return Promise.resolve();
    }
    if(data === undefined) {
      return this.deleteData(location);
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
  lock(word:string): Promise<void> {
    let deferred = Promise.defer<void>();
    this.firebaseRef.child('_leLocks').child(word).transaction(function(oldWordValue){
      if(oldWordValue === 'locked') {
        return;
      } else {
        return 'locked';
      }
    }, function(err, didLock) {
      if(err){
        deferred.reject(err);
      } else if (!didLock) {
        deferred.reject(new Error(word + 'is already locked.'));
      } else {
        deferred.resolve(undefined);
      }
    });
    return deferred.promise;
  }
  unlock(word:string): Promise<void> {
    var deferred = Promise.defer<void>();
    var provider = this;
    this.firebaseRef.child('_leLocks').child(word).remove(function(err){
      if(err) {
        deferred.reject(err);
        return;
      }
      deferred.resolve(undefined);
    });
    return deferred.promise;
  }
  generateID(): string {
    return this.firebaseRef.push().key();
  }
  updateStore(store: any, key:string, value) {
    if(typeof store !== 'object') {
      return;
    }
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
        if(typeof currentStore[lastSublocation] !== 'object') {
          return undefined;
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
