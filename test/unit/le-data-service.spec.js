var ts_promise_1 = require("ts-promise");
var chai = require('chai');
var data = require("../../src/le-data-service");
var mock_le_data_service_provider_1 = require("../mock-le-data-service-provider/mock-le-data-service-provider");
var expect = chai.expect;
describe('LeDataService', function () {
    var dataService;
    var mockProvider = new mock_le_data_service_provider_1.default();
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
    });
    describe('updateData', function () {
        it('should return a promise', function () {
            var returnedObject = dataService.updateData({ _type: 'exampleType' });
            expect(returnedObject instanceof ts_promise_1.default).to.be.true;
        });
        it('should reject if no data is passed to the function', function (done) {
            var returnedPromise = dataService.updateData();
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('No data passed to updateData function');
                done();
            });
        });
        it('should reject if there is no _type specified in the data', function (done) {
            var returnedPromise = dataService.updateData({
                _id: 'exampleID',
                exampleField: 'exampleFieldData'
            });
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('No _type specified in LeData object passed to updateData, object: {"_id":"exampleID","exampleField":"exampleFieldData"}');
                done();
            });
        });
        it('should reject if there is no _id specified in the data', function (done) {
            var returnedPromise = dataService.updateData({
                _type: 'ExampleType',
                exampleField: 'exampleFieldData'
            });
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('No _id specified in LeData object passed to updateData, object: {"_type":"ExampleType","exampleField":"exampleFieldData"}');
                done();
            });
        });
    });
    describe('deleteData', function () {
        it('should reject if no _type is passed in parameters', function (done) {
            var returnedPromise = dataService.deleteData(undefined, 'exampleID');
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('Undefined type passed to deleteData.\ntype: undefined id: exampleID');
                done();
            });
        });
        it('should reject if no _id is passed in parameters', function (done) {
            var returnedPromise = dataService.deleteData('ExampleType', undefined);
            returnedPromise.then(undefined, function (err) {
                expect(err.message).to.equal('Undefined id passed to deleteData.\ntype: ExampleType id: undefined');
                done();
            });
        });
    });
    describe('configureType', function () {
        it('should throw an error if the type is not configured', function (done) {
            dataService.createData({ _type: 'Cat' }).then(undefined, function (err) {
                console.log(err.message);
                expect(err.message).to.equal('Invalid _type set on data: {"_type":"Cat"}');
                done();
            });
        });
    });
    describe('sync', function () {
    });
});
//# sourceMappingURL=le-data-service.spec.js.map