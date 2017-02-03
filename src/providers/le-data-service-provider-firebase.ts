import Promise from "ts-promise";
import {FetchDataOptions, LeDataServiceProvider, UpdateType} from "../le-data-service-provider";

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
    }else {
      locationRef = locationRef.orderByKey()
    }
    if(fetchDataOptions && fetchDataOptions.hasOwnProperty('limitToTop')){
      locationRef = locationRef.limitToFirst(fetchDataOptions.limitToTop);
    }
    if(fetchDataOptions && fetchDataOptions.hasOwnProperty('startAt')) {
      locationRef = locationRef.startAt(fetchDataOptions.startAt);
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
    removeUndefinedFields(data);
    var deferred = Promise.defer<LeData>();
    var provider = this;
    var dataID = data._id;
    var dataToSave = convertDataToDataToSave(data);
    if(!dataID) {
      var newFieldRef = this.firebaseRef.child(location).push(dataToSave, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        var newFieldLocationArray = newFieldRef.toString().split('/');
        var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
        provider.updateStoreForLocation(location, dataToSave);
        data._id = newID;
        deferred.resolve(data);
      });
    } else {
      this.firebaseRef.child(location).child(dataID).set(dataToSave, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        provider.updateStoreForLocation(location, dataToSave);
        deferred.resolve(data);
      });
    }

    return deferred.promise;
  }
  updateData(location:string, data:any, updateType?:UpdateType): Promise<any> {
    if(!updateType) {
      updateType = UpdateType.default;
    }
    if(typeof data === 'object' && updateType === UpdateType.default) {
      var innerUpdatePromises = [];
      for (var key in data) {
        if(data.hasOwnProperty(key)) {
          var innerLocation = location + '/' + key;
          innerUpdatePromises.push(this.updateData(innerLocation, data[key]));
        }
      }
      return Promise.all(innerUpdatePromises);
    }

    if(data === undefined) {
      return this.deleteData(location);
    }
    if(typeof data !== 'object' && data === this.storedValueForLocation(location)) {
      return Promise.resolve();
    }
    var mergeDataIfNeededPromise;
    if(updateType === UpdateType.merge) {
      mergeDataIfNeededPromise = this.fetchData(location).then((oldData)=>{
        data = mergeData(oldData, data);
      });
    } else {
      mergeDataIfNeededPromise = Promise.resolve();
    }

    return mergeDataIfNeededPromise.then(()=>{
      var deferred = Promise.defer<any>();
      this.firebaseRef.child(location).set(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        deferred.resolve(data);
      });
      return deferred.promise;
    });
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
function convertDataToDataToSave(object){
  var objectToReturn = {};
  for(var key in object){
    if(object.hasOwnProperty(key) && key !== '_type' && key !== '_id') {
      var keyArray = key.split('/');
      var currentObject = objectToReturn;
      for(var i = 0; i < keyArray.length; i += 1) {
        var subKey = keyArray[i];
        if(i === keyArray.length - 1) {
          currentObject[subKey] = typeof object[key] === 'object' ? convertDataToDataToSave(object[key]) : object[key];
          break;
        }
        if(!currentObject[subKey]) {
          currentObject[subKey] = {}
        }
        currentObject = currentObject[subKey];
      }
    }
  }
  return objectToReturn;
}
function mergeData(oldData, newData) {
  if(newData === undefined) {
    return undefined;
  }
  if(oldData === null || typeof oldData !== 'object' || Array.isArray(newData) || Array.isArray(oldData)) {
    removeUndefinedFields(newData);
    return newData;
  }
  for(var key in newData) {
    if(newData.hasOwnProperty(key)) {
      if(newData[key] === undefined) {
        delete oldData[key];
      } else {
        if(typeof newData[key] === 'object') {
          oldData[key] = mergeData(oldData[key], newData[key]);
        } else {
          oldData[key] = newData[key];
        }
      }
    }
  }
  return oldData;
}
function removeUndefinedFields(data) {
  if(Array.isArray(data)) {
    for(var i = 0; i <data.length; i +=1) {
      var arrayContent = data[i];
      if(arrayContent === undefined) {
        data.splice(i);
        i -=1;
      }
    }
  }
  if(typeof data !== 'object') {
    return;
  }
  for(var key in data) {
    if(data.hasOwnProperty(key)) {
      if(typeof data[key] === 'object') {
        removeUndefinedFields(data[key]);
      }
      if(data[key] === undefined) {
        delete data[key];
      }
    }
  }
}
export default LeDataServiceProviderFirebase;
