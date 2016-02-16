/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />
import Promise from "ts-promise";
import LeDataServiceProvider from "../le-data-service-provider";

export class LeDataServiceProviderFirebase implements LeDataServiceProvider {
  firebaseRef:any;
  constructor(firebaseRef:any) {
    this.firebaseRef = firebaseRef;
  }
  dataExists(location:string): Promise<boolean> {
    var deferred = Promise.defer<boolean>();
    this.firebaseRef.child(location).once('value', function(snapshot){
      deferred.resolve(snapshot.val() !== null);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
  fetchData(location:string): Promise<any> {
    var deferred = Promise.defer<any>();
    this.firebaseRef.child(location).once('value', function(snapshot){
      deferred.resolve(snapshot.val());
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
  createData(location:string, data:LeData): Promise<LeData> {
    removeUndefinedFeilds(data);
    var deferred = Promise.defer<LeData>();
    if(!data._id) {
      var newFieldRef = this.firebaseRef.child(location).push(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        var newFieldLocationArray = newFieldRef.toString().split('/');
        var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
        data._id = newID;
        deferred.resolve(data);
      });
    } else {
      this.firebaseRef.child(location).child(data._id).set(data, function(err){
        if(err) {
          deferred.reject(err);
          return;
        }
        deferred.resolve(data);
      });
    }

    return deferred.promise;
  }
  updateData(location:string, data:any): Promise<any> {
    removeUndefinedFeilds(data);
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
    this.firebaseRef.child(location).remove(function(err){
      if(err) {
        deferred.reject(err);
        return;
      }
      deferred.resolve(undefined);
    });
    return deferred.promise;
  }
  sync(location:string, callback:(data)=>void, errorCallback:(error)=>void): any {
    return this.firebaseRef.child(location).on('value', function(snapshot){
      callback(snapshot.val());
    }, function(err){
      errorCallback(err);
    });
  }
  unsync(location:string, unsyncObject:any):void {
    this.firebaseRef.child(location).off('value', unsyncObject);
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
