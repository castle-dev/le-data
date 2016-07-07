var ts_promise_1 = require("ts-promise");
var LeDataServiceProviderFirebase = (function () {
    function LeDataServiceProviderFirebase(firebaseRef) {
        this.firebaseRef = firebaseRef;
        this.lastedFetchedValueStore = {};
    }
    LeDataServiceProviderFirebase.prototype.equalToLastedFetchData = function (location, data) {
        if (typeof data === 'object') {
            var doesMatch = true;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var innerLocation = location + '/' + key;
                    doesMatch = doesMatch && this.equalToLastedFetchData(innerLocation, data[key]);
                }
            }
            return doesMatch;
        }
        else {
            return data === this.storedValueForLocation(location);
        }
    };
    LeDataServiceProviderFirebase.prototype.dataExists = function (location) {
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        this.firebaseRef.child(location).once('value', function (snapshot) {
            provider.updateStoreForLocation(location, snapshot.val());
            deferred.resolve(snapshot.val() !== null);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.fetchData = function (location, fetchDataOptions) {
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        var locationRef = this.firebaseRef.child(location);
        if (fetchDataOptions && fetchDataOptions.hasOwnProperty('filterFieldName')) {
            locationRef = locationRef.orderByChild(fetchDataOptions.filterFieldName);
            locationRef = locationRef.equalTo(fetchDataOptions.filterValue);
        }
        locationRef.once('value', function (snapshot) {
            provider.updateStoreForLocation(location, snapshot.val());
            deferred.resolve(snapshot.val());
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.createData = function (location, data) {
        removeUndefinedFeilds(data);
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        var dataID = data._id;
        var dataToSave = convertDataToDataToSave(data);
        if (!dataID) {
            var newFieldRef = this.firebaseRef.child(location).push(dataToSave, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                var newFieldLocationArray = newFieldRef.toString().split('/');
                var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
                provider.updateStoreForLocation(location, dataToSave);
                data._id = newID;
                deferred.resolve(data);
            });
        }
        else {
            this.firebaseRef.child(location).child(dataID).set(dataToSave, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                provider.updateStoreForLocation(location, dataToSave);
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.updateData = function (location, data) {
        if (typeof data === 'object') {
            var innerUpdatePromises = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var innerLocation = location + '/' + key;
                    innerUpdatePromises.push(this.updateData(innerLocation, data[key]));
                }
            }
            return ts_promise_1.default.all(innerUpdatePromises);
        }
        if (data === undefined) {
            return this.deleteData(location);
        }
        if (data === this.storedValueForLocation(location)) {
            return ts_promise_1.default.resolve();
        }
        var deferred = ts_promise_1.default.defer();
        this.firebaseRef.child(location).set(data, function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.deleteData = function (location) {
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        this.firebaseRef.child(location).remove(function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            provider.updateStoreForLocation(location, undefined);
            deferred.resolve(undefined);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.sync = function (location, callback, errorCallback) {
        var referenceToThis = this;
        return this.firebaseRef.child(location).on('value', function (snapshot) {
            referenceToThis.updateStoreForLocation(location, snapshot.val());
            callback(snapshot.val());
        }, function (err) {
            errorCallback(err);
        });
    };
    LeDataServiceProviderFirebase.prototype.unsync = function (location, unsyncObject) {
        this.firebaseRef.child(location).off('value', unsyncObject);
    };
    LeDataServiceProviderFirebase.prototype.lock = function (word) {
        var deferred = ts_promise_1.default.defer();
        this.firebaseRef.child('_leLocks').child(word).transaction(function (oldWordValue) {
            if (oldWordValue === 'locked') {
                return;
            }
            else {
                return 'locked';
            }
        }, function (err, didLock) {
            if (err) {
                deferred.reject(err);
            }
            else if (!didLock) {
                deferred.reject(new Error(word + 'is already locked.'));
            }
            else {
                deferred.resolve(undefined);
            }
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.unlock = function (word) {
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        this.firebaseRef.child('_leLocks').child(word).remove(function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(undefined);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.generateID = function () {
        return this.firebaseRef.push().key();
    };
    LeDataServiceProviderFirebase.prototype.updateStore = function (store, key, value) {
        if (typeof store !== 'object') {
            return;
        }
        if (typeof value === 'object') {
            for (var innerKey in value) {
                if (value.hasOwnProperty(innerKey)) {
                    if (!store[key]) {
                        store[key] = {};
                    }
                    this.updateStore(store[key], innerKey, value[innerKey]);
                }
            }
        }
        else {
            store[key] = value;
        }
    };
    LeDataServiceProviderFirebase.prototype.updateStoreForLocation = function (location, value) {
        var locationArray = location.split('/');
        var currentStore = this.lastedFetchedValueStore;
        var lastSublocation;
        for (var i = 0; i < locationArray.length; i += 1) {
            var sublocation = locationArray[i];
            if (!sublocation.length) {
                break;
            }
            if (!lastSublocation) {
                lastSublocation = sublocation;
            }
            else {
                if (!currentStore[lastSublocation]) {
                    currentStore[lastSublocation] = {};
                }
                currentStore = currentStore[lastSublocation];
                lastSublocation = sublocation;
            }
        }
        this.updateStore(currentStore, lastSublocation, value);
    };
    LeDataServiceProviderFirebase.prototype.storedValueForLocation = function (location) {
        var locationArray = location.split('/');
        var currentStore = this.lastedFetchedValueStore;
        var lastSublocation;
        for (var i = 0; i < locationArray.length; i += 1) {
            var sublocation = locationArray[i];
            if (!sublocation.length) {
                break;
            }
            if (!lastSublocation) {
                lastSublocation = sublocation;
            }
            else {
                if (typeof currentStore[lastSublocation] !== 'object') {
                    return undefined;
                }
                currentStore = currentStore[lastSublocation];
                lastSublocation = sublocation;
            }
        }
        return currentStore[sublocation];
    };
    return LeDataServiceProviderFirebase;
})();
exports.LeDataServiceProviderFirebase = LeDataServiceProviderFirebase;
function convertDataToDataToSave(object) {
    var objectToReturn = {};
    for (var key in object) {
        if (object.hasOwnProperty(key) && key !== '_type' && key !== '_id') {
            var keyArray = key.split('/');
            var currentObject = objectToReturn;
            for (var i = 0; i < keyArray.length; i += 1) {
                var subKey = keyArray[i];
                if (i === keyArray.length - 1) {
                    currentObject[subKey] = typeof object[key] === 'object' ? convertDataToDataToSave(object[key]) : object[key];
                    break;
                }
                if (!currentObject[subKey]) {
                    currentObject[subKey] = {};
                }
                currentObject = currentObject[subKey];
            }
        }
    }
    return objectToReturn;
}
function removeUndefinedFeilds(data) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] === undefined) {
                delete data[key];
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeDataServiceProviderFirebase;
//# sourceMappingURL=le-data-service-provider-firebase.js.map