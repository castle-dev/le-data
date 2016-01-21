var ts_promise_1 = require("ts-promise");
var LeDataServiceProviderFirebase = (function () {
    function LeDataServiceProviderFirebase(firebaseRef) {
        this.firebaseRef = firebaseRef;
    }
    LeDataServiceProviderFirebase.prototype.dataExists = function (location) {
        var deferred = ts_promise_1.default.defer();
        this.firebaseRef.child(location).once('value', function (snapshot) {
            deferred.resolve(snapshot.val() !== null);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.fetchData = function (location) {
        var deferred = ts_promise_1.default.defer();
        this.firebaseRef.child(location).once('value', function (snapshot) {
            deferred.resolve(snapshot.val());
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.createData = function (location, data) {
        var deferred = ts_promise_1.default.defer();
        if (!data._id) {
            var newID = this.firebaseRef.child(location).push(data, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                data._id = newID;
                deferred.resolve(data);
            });
        }
        else {
            this.firebaseRef.child(location).child(data._id).set(data, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.updateData = function (location, data) {
        var deferred = ts_promise_1.default.defer();
        this.firebaseRef.child(location).child(location).set(data, function (err) {
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
        this.firebaseRef.child(location).child(location).remove(function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(undefined);
        });
        return deferred.promise;
    };
    LeDataServiceProviderFirebase.prototype.sync = function (location, callback, errorCallback) {
        return this.firebaseRef.child(location).on('value', function () {
            callback();
        }, function (err) {
            errorCallback(err);
        });
    };
    LeDataServiceProviderFirebase.prototype.unsync = function (location, unsyncObject) {
        this.firebaseRef.child(location).off('value', unsyncObject);
    };
    return LeDataServiceProviderFirebase;
})();
exports.LeDataServiceProviderFirebase = LeDataServiceProviderFirebase;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeDataServiceProviderFirebase;
//# sourceMappingURL=le-data-service-provider-firebase.js.map