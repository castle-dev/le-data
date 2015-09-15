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
      it('should reject if data is invalid', (done)=>{
        mockProvider.dataExists = function (type, id) {
          return Promise.resolve(false);
        };
        mockProvider.validateData = function (data) {
          var errorMessage = 'Error message returned from validateData';
          var error = new Error(errorMessage);
          return Promise.reject(error);
        };
        var returnedPromise = dataService.createData({
          _id: 'existingDataID',
          _type: 'ExampleType'
        });
        returnedPromise.then(undefined, (err)=> {
          expect(err.message).to.equal('Error message returned from validateData');
          done();
        });
      });
    });
});
