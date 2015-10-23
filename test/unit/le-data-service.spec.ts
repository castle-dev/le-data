/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />

import Promise from "ts-promise";
import chai = require('chai');

import data = require("../../src/le-data-service");

var expect = chai.expect;

describe('LeDataService', ()=>{
  var dataService;
  var mockProvider = new function(){
  };
    before(()=>{
        dataService = new data.LeDataService(mockProvider);
    });
    it('Should set up the tests', ()=>{
      expect(dataService).to.exist;
    });
    describe('createData', ()=>{
      it('should return a promise', ()=>{
        var returnedObject = dataService.createData({_type:'exampleType'});
        expect(returnedObject instanceof Promise).to.be.true;
      });
      it('should reject if there is no type specified in the data', (done)=>{
        var returnedPromise = dataService.createData({});
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('No _type specified in LeData object passed to createData, object: {}');
          done();
        });
      });
      it('should reject if no data is passed to the function', (done)=>{
        var returnedPromise = dataService.createData();
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('No data passed to createData function');
          done();
        });
      });
      it('should reject if data with the set _id and type exists remotely', (done)=>{
        mockProvider.dataExists = function (type, id) {
          return Promise.resolve(true);
        };
        var returnedPromise = dataService.createData({
          _id: 'existingDataID',
          _type: 'ExampleType'
        });
        returnedPromise.then(undefined, (err)=> {
          expect(err.message).to.equal('Attempted to create data with an id and type that already exists, _id: existingDataID, _type: ExampleType');
          done();
        });
      });
      // it('should reject if data is invalid', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(false);
      //   };
      //   mockProvider.validateData = function (data) {
      //     var errorMessage = 'Error message returned from validateData';
      //     var error = new Error(errorMessage);
      //     return Promise.reject(error);
      //   };
      //   var returnedPromise = dataService.createData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then(undefined, (err)=> {
      //     expect(err.message).to.equal('Error message returned from validateData');
      //     done();
      //   });
      // });
      // it('should reject if unable to save data', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(false);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var errorMessage = 'Error message returned from save';
      //     var error =  new Error(errorMessage);
      //     return Promise.reject(error);
      //   }
      //   var returnedPromise = dataService.createData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then(undefined, (err)=> {
      //     expect(err.message).to.equal('Error message returned from save');
      //     done();
      //   });
      // });
      // it('should return the data that was returned from the save', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(false);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var objectReturnedFromSave = {
      //       returnedField: '1234'
      //     };
      //     return Promise.resolve(objectReturnedFromSave);
      //   }
      //   var returnedPromise = dataService.createData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then((returnedData)=> {
      //     expect(returnedData.returnedField).to.equal('1234');
      //     done();
      //   });
      // });
      // it('should return the data that was returned from the save if _id was not set', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(false);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var objectReturnedFromSave = {
      //       returnedField: '1234'
      //     };
      //     return Promise.resolve(objectReturnedFromSave);
      //   }
      //   var returnedPromise = dataService.createData({
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then((returnedData)=> {
      //     expect(returnedData.returnedField).to.equal('1234');
      //     done();
      //   });
      // });
      // it('should reject if unable to save data without _id', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(false);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var errorMessage = 'Error message returned from save';
      //     var error =  new Error(errorMessage);
      //     return Promise.reject(error);
      //   }
      //   var returnedPromise = dataService.createData({
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then(undefined, (err)=> {
      //     expect(err.message).to.equal('Error message returned from save');
      //     done();
      //   });
      // });
    });


    describe('updateData', ()=>{
      it('should return a promise', ()=>{
        var returnedObject = dataService.updateData({_type:'exampleType'});
        expect(returnedObject instanceof Promise).to.be.true;
      });
      it('should reject if no data is passed to the function', (done)=>{
        var returnedPromise = dataService.updateData();
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('No data passed to updateData function');
          done();
        });
      });
      it('should reject if there is no _type specified in the data', (done)=>{
        var returnedPromise = dataService.updateData({
          _id: 'exampleID',
          exampleField: 'exampleFieldData'
        });
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('No _type specified in LeData object passed to updateData, object: {"_id":"exampleID","exampleField":"exampleFieldData"}');
          done();
        });
      });
      it('should reject if there is no _id specified in the data', (done)=>{
        var returnedPromise = dataService.updateData({
          _type: 'ExampleType',
          exampleField: 'exampleFieldData'
        });
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('No _id specified in LeData object passed to updateData, object: {"_type":"ExampleType","exampleField":"exampleFieldData"}');
          done();
        });
      });
      it('should reject if the data does not exist remotely', (done)=>{
        mockProvider.dataExists = function (type, id) {
          return Promise.resolve(false);
        };
        var returnedPromise = dataService.updateData({
          _id: 'dataID',
          _type: 'ExampleType'
        });
        returnedPromise.then(undefined, (err)=> {
          expect(err.message).to.equal('Attempted to update data that does not exist, object:{"_id":"dataID","_type":"ExampleType"}');
          done();
        });
      });
      // it('should reject if the data is invalid', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(true);
      //   };
      //   mockProvider.validateData = function (data) {
      //     var errorMessage = 'Error message returned from validateData';
      //     var error = new Error(errorMessage);
      //     return Promise.reject(error);
      //   };
      //   var returnedPromise = dataService.updateData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then(undefined, (err)=> {
      //     expect(err.message).to.equal('Error message returned from validateData');
      //     done();
      //   });
      // });
      // it('should reject if unable to save data', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(true);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var errorMessage = 'Error message returned from save';
      //     var error =  new Error(errorMessage);
      //     return Promise.reject(error);
      //   }
      //   var returnedPromise = dataService.updateData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then(undefined, (err)=> {
      //     expect(err.message).to.equal('Error message returned from save');
      //     done();
      //   });
      // });
      // it('should return the data that was returned from the save', (done)=>{
      //   mockProvider.dataExists = function (type, id) {
      //     return Promise.resolve(true);
      //   };
      //   mockProvider.validateData = function (data) {
      //     return Promise.resolve();
      //   };
      //   mockProvider.saveData = function (data) {
      //     var objectReturnedFromSave = {
      //       returnedField: '1234'
      //     };
      //     return Promise.resolve(objectReturnedFromSave);
      //   }
      //   var returnedPromise = dataService.updateData({
      //     _id: 'existingDataID',
      //     _type: 'ExampleType'
      //   });
      //   returnedPromise.then((returnedData)=> {
      //     expect(returnedData.returnedField).to.equal('1234');
      //     done();
      //   });
      // });
    });

    describe('deleteData', ()=>{
      it('should call deleteData on the provider and return a promise', ()=>{
        var didCallDeleteData = false;
        mockProvider.deleteData = function (type, id) {
          didCallDeleteData = true;
          return Promise.resolve();
        };
        var returnedObject = dataService.deleteData('exampleType', 'exampleID');
        expect(returnedObject instanceof Promise).to.be.true;
        expect(didCallDeleteData).to.be.true;
      });
      it('should reject if no _type is passed in parameters', (done)=>{
        var returnedPromise = dataService.deleteData(undefined, 'exampleID');
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('Undefined type passed to deleteData.\ntype: undefined id: exampleID');
          done();
        });
      });
      it('should reject if no _id is passed in parameters', (done)=>{
        var returnedPromise = dataService.deleteData('ExampleType', undefined);
        returnedPromise.then(undefined, (err)=>{
          expect(err.message).to.equal('Undefined id passed to deleteData.\ntype: ExampleType id: undefined');
          done();
        });
      });
    });


    describe('sync', ()=>{
    });
});
