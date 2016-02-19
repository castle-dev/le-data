var ts_promise_1 = require("ts-promise");
var LeDataServiceProviderFirebase = (function () {
    function LeDataServiceProviderFirebase(firebaseRef) {
        this.firebaseRef = firebaseRef;
        this.lastedFetchedValueStore = {};
    }
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
    LeDataServiceProviderFirebase.prototype.fetchData = function (location) {
        var deferred = ts_promise_1.default.defer();
        var provider = this;
        this.firebaseRef.child(location).once('value', function (snapshot) {
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
        var dataType = data._type;
        delete data._id;
        delete data._type;
        if (!dataID) {
            var newFieldRef = this.firebaseRef.child(location).push(data, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                var newFieldLocationArray = newFieldRef.toString().split('/');
                var newID = newFieldLocationArray[newFieldLocationArray.length - 1];
                provider.updateStoreForLocation(location, data);
                data._id = newID;
                if (dataType) {
                    data._type = dataType;
                }
                deferred.resolve(data);
            });
        }
        else {
            this.firebaseRef.child(location).child(dataID).set(data, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                provider.updateStoreForLocation(location, data);
                data._id = dataID;
                if (dataType) {
                    data._type = dataType;
                }
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
        if (data === this.storedValueForLocation(location)) {
            return ts_promise_1.default.resolve();
        }
        if (data === undefined) {
            return this.deleteData(location);
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