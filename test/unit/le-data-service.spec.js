/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />
var ts_promise_1 = require("ts-promise");
var chai = require('chai');
var data = require("../../src/le-data-service");
var expect = chai.expect;
describe('LeDataService', function () {
    var dataService;
    var mockProvider = new function () {
    };
    before(function () {
        dataService = new data.LeDataService(mockProvider);
    });
    it('Should set up the tests', function () {
        expect(dataService).to.exist;
    });
    describe('createData', function () {
        it('should return a promise', function () {
            var returnedObject = dataService.createData({ _type: 'exampleType' });
            expect(returnedObject instanceof ts_promise_1.default).to.be.true;
        });
        it('should reject if there is no type specified in the data', function (done) {
            var returnedPromise = dataService.createData({});
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('No _type specified in LeData object passed to createData, object: {}');
                done();
            });
        });
        it('should reject if no data is passed to the function', function (done) {
            var returnedPromise = dataService.createData();
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('No data passed to createData function');
                done();
            });
        });
        it('should reject if data with the set _id and type exists remotely', function (done) {
            mockProvider.dataExists = function (type, id) {
                return ts_promise_1.default.resolve(true);
            };
            var returnedPromise = dataService.createData({
                _id: 'existingDataID',
                _type: 'ExampleType'
            });
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('Attempted to create data with an id and type that already exists, _id: existingDataID, _type: ExampleType');
                done();
            });
        });
        it('should reject if data is invalid', function (done) {
            mockProvider.dataExists = function (type, id) {
                return ts_promise_1.default.resolve(false);
            };
            mockProvider.validateData = function (data) {
                var errorMessage = 'Error message returned from validateData';
                var error = new Error(errorMessage);
                return ts_promise_1.default.reject(error);
            };
            var returnedPromise = dataService.createData({
                _id: 'existingDataID',
                _type: 'ExampleType'
            });
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('Error message returned from validateData');
                done();
            });
        });
    });
});
//# sourceMappingURL=le-data-service.spec.js.map