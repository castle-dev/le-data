var ts_promise_1 = require("ts-promise");
var chai = require('chai');
var data = require("../../src/le-data-service");
var le_type_config_1 = require("../../src/le-type-config");
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
    it('should throw an error if the type is not configured', function (done) {
        dataService.createData({ _type: 'Cat' }).then(undefined, function (err) {
            expect(err.message).to.equal('Invalid _type set on data: {"_type":"Cat"}');
            done();
        });
    });
    it('should successfully create a configured type', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        dataService.configureType(dogTypeConfig).then(function () {
            return dataService.createData({ _type: 'Dog' });
        }).then(function (returnedData) {
            expect(typeof returnedData._id === 'string').to.be.true;
            expect(returnedData._createdAt instanceof Date).to.be.true;
            expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
            done();
        });
    });
    it('should throw an error if there is an unconfigured field', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        dataService.configureType(dogTypeConfig).then(function () {
            return dataService.createData({ _type: 'Dog', badField: 'thisFieldIsTrash' });
        }).then(undefined, function (err) {
            expect(err.message).to.equal('An additional field was set on the data object.\nthe field "badField" is not configured on objects of type Dog\ndata: {"_type":"Dog","badField":"thisFieldIsTrash"}');
            done();
        });
    });
    it('should successfully create if there is a configured field', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        var goodFieldConfig = dogTypeConfig.addField('goodField', 'string');
        dataService.configureType(dogTypeConfig).then(function () {
            return dataService.createData({ _type: 'Dog', goodField: 'thisfieldIsAwesome' });
        }).then(function (returnedData) {
            expect(typeof returnedData._id === 'string').to.be.true;
            expect(returnedData._createdAt instanceof Date).to.be.true;
            expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
            expect(returnedData._type === 'Dog').to.be.true;
            expect(returnedData.goodField === 'thisfieldIsAwesome').to.be.true;
            done();
        }, function (err) {
            console.log(err);
        });
    });
});
//# sourceMappingURL=le-data-service.spec.js.map