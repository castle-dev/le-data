var ts_promise_1 = require("ts-promise");
var MockLeDataServiceProvider = (function () {
    function MockLeDataServiceProvider() {
        this.remoteStoredData = {};
        this.uniqueID = 0;
    }
    MockLeDataServiceProvider.prototype.dataExists = function (location) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            _this.fetchData(location).then(function (fetchedData) {
                resolve(!!fetchedData);
            }, function () {
                resolve(false);
            });
        });
    };
    MockLeDataServiceProvider.prototype.fetchData = function (location) {
        var locationArray = location.split('/');
        var dataToReturn = this.remoteStoredData;
        for (var i = 0; i < locationArray.length; i += 1) {
            var sublocation = locationArray[i];
            if (dataToReturn[sublocation]) {
                dataToReturn = dataToReturn[sublocation];
            }
            else {
                return ts_promise_1.default.reject(new Error('data did not exist remotely'));
            }
        }
        return ts_promise_1.default.resolve(dataToReturn);
    };
    MockLeDataServiceProvider.prototype.createData = function (location, data) {
        var locationArray = location.split('/');
        var locationToSaveAt = this.remoteStoredData;
        var sublocation;
        for (var i = 0; i < locationArray.length; i += 1) {
            sublocation = locationArray[i];
            if (!locationToSaveAt[sublocation]) {
                locationToSaveAt[sublocation] = {};
            }
            locationToSaveAt = locationToSaveAt[sublocation];
        }
        data._id = '' + this.uniqueID;
        locationToSaveAt[this.uniqueID] = data;
        this.uniqueID += 1;
        return ts_promise_1.default.resolve(data);
    };
    MockLeDataServiceProvider.prototype.updateData = function (location, data) {
        var locationArray = location.split('/');
        var locationToSaveAt = this.remoteStoredData;
        var sublocation;
        for (var i = 0; i < locationArray.length; i += 1) {
            sublocation = locationArray[i];
            if (!locationToSaveAt[sublocation]) {
                locationToSaveAt[sublocation] = {};
            }
            if (i < locationArray.length - 1) {
                locationToSaveAt = locationToSaveAt[sublocation];
            }
        }
        locationToSaveAt[sublocation] = data;
        return ts_promise_1.default.resolve(data);
    };
    MockLeDataServiceProvider.prototype.deleteData = function (location) {
        var locationArray = location.split('/');
        var fieldToDelete = locationArray[locationArray.length - 1];
        var locationToDeleteAt = this.remoteStoredData;
        for (var i = 0; i < locationArray.length - 1; i += 1) {
            var sublocation = locationArray[i];
            if (!locationToDeleteAt[sublocation]) {
                return ts_promise_1.default.reject(new Error('location to data to delete does not exist'));
            }
            locationToDeleteAt = locationToDeleteAt[sublocation];
        }
        if (!locationToDeleteAt[fieldToDelete]) {
            return ts_promise_1.default.reject(new Error('the field ' + fieldToDelete + ' does not exist'));
        }
        delete locationToDeleteAt[fieldToDelete];
        return ts_promise_1.default.resolve();
    };
    return MockLeDataServiceProvider;
})();
exports.MockLeDataServiceProvider = MockLeDataServiceProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MockLeDataServiceProvider;
//# sourceMappingURL=mock-le-data-service-provider.js.map