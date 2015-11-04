/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../node_modules/ts-promise/dist/ts-promise.d.ts" />

import Promise from "ts-promise";
import chai = require('chai');

import data = require("../../src/le-data-service");

import LeTypeConfig from "../../src/le-type-config";
import LeTypeFieldConfig from "../../src/le-type-field-config";

import MockLeDataServiceProvider from "../mock-le-data-service-provider/mock-le-data-service-provider";

var expect = chai.expect;

describe('LeDataService', ()=>{
  var dataService;
  var mockProvider = new MockLeDataServiceProvider();
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
    });

    describe('deleteData', ()=>{
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
    it('should throw an error if the type is not configured', (done)=>{
      dataService.createData({_type:'Cat'}).then(undefined, (err)=>{
        expect(err.message).to.equal('Invalid _type set on data: {"_type":"Cat"}');
        done();
      });
    });
    it('should successfully create a configured type',(done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      dataService.configureType(dogTypeConfig).then(()=>{
        return dataService.createData({_type:'Dog'});
      }).then((returnedData)=>{
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData._createdAt instanceof Date).to.be.true;
        expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
        done();
      });
    });
});
