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
  var mockProvider:any = new MockLeDataServiceProvider();
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
    it('should throw an error if there is an unconfigured field',(done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      dataService.configureType(dogTypeConfig).then(()=>{
        return dataService.createData({_type:'Dog', badField: 'thisFieldIsTrash'});
      }).then(undefined, (err)=>{
        expect(err.message).to.equal('An additional field was set on the data object.\nthe field "badField" is not configured on objects of type Dog\ndata: {"_type":"Dog","badField":"thisFieldIsTrash"}');
        done();
      });
    });
    it('should successfully create if there is a configured field',(done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      var goodFieldConfig = dogTypeConfig.addField('goodField', 'string');
      dataService.configureType(dogTypeConfig).then(()=>{
        return dataService.createData({_type:'Dog', goodField: 'thisfieldIsAwesome'});
      }).then((returnedData)=>{
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData._createdAt instanceof Date).to.be.true;
        expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData._type === 'Dog').to.be.true;
        expect(returnedData.goodField === 'thisfieldIsAwesome').to.be.true;
        done();
      }, (err)=>{
        console.log(err);
      });
    });
    it('should throw an error on create create if the field is the wrong type',(done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      var goodFieldConfig = dogTypeConfig.addField('goodField', 'string');
      dataService.configureType(dogTypeConfig).then(()=>{
        return dataService.createData({_type:'Dog', goodField: 74});
      }).then(undefined, (err)=>{
        done()
      });
    });
    it('should correctly configure and save custom type fields', (done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      var goodFieldConfig = dogTypeConfig.addField('catField', 'Cat');
      dataService.configureType(dogTypeConfig).then(()=>{
        var catTypeConfig = new LeTypeConfig('Cat');
        return dataService.configureType(catTypeConfig);
      }).then(()=>{
        return dataService.createData({_type:'Dog', catField: {_type:"Cat"}});
      }).then((returnedData)=>{
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData._createdAt instanceof Date).to.be.true;
        expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData._type === 'Dog').to.be.true;
        expect(returnedData.catField._type === 'Cat').to.be.true;
        expect(typeof returnedData.catField._id === 'string').to.be.true;
        expect(returnedData.catField._createdAt instanceof Date).to.be.true;
        expect(returnedData.catField._lastUpdatedAt instanceof Date).to.be.true;
        done();
      }, (err)=>{
        console.log(err);
      });
    });

    it('should correctly configure and save object type fields', (done)=>{
      var dogTypeConfig = new LeTypeConfig('Dog');
      dogTypeConfig.addField('name', 'string');
      var myJsonConfig = dogTypeConfig.addField('myJson', 'object');
      myJsonConfig.addField('theStringField', 'string');
      myJsonConfig.addField('theDogField', 'Dog');
      dataService.configureType(dogTypeConfig).then(()=>{
        return dataService.createData({
          _type:'Dog',
          name:'Goofy',
          myJson: {
            theStringField:'testString',
            theDogField:{
              _type:'Dog',
              name:'Pluto'
            }
          }
        });
      }).then((returnedData)=>{
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData._createdAt instanceof Date).to.be.true;
        expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData._type === 'Dog').to.be.true;
        expect(returnedData.name === 'Goofy').to.be.true;
        expect(returnedData.myJson.theStringField === 'testString').to.be.true;
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData.myJson.theDogField._createdAt instanceof Date).to.be.true;
        expect(returnedData.myJson.theDogField._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData.myJson.theDogField._type === 'Dog').to.be.true;
        expect(returnedData.myJson.theDogField.name === 'Pluto').to.be.true;
        done();
      }, (err)=>{
        console.log(err);
      });
    });
    it('should correctly configure and save custom type array fields', (done)=>{
      mockProvider.remoteStoredData = {};
      var dogTypeConfig = new LeTypeConfig('Dog');
      var goodFieldConfig = dogTypeConfig.addField('catsField', 'Cat[]');
      dataService.configureType(dogTypeConfig).then(()=>{
        var catTypeConfig = new LeTypeConfig('Cat');
        catTypeConfig.addField('name', 'string');
        return dataService.configureType(catTypeConfig);
      }).then(()=>{
        return dataService.createData({_type:'Dog', catsField: [{_type:'Cat', name:'Pickle'}, {_type:'Cat', name:'Oliver'}]});
      }).then((returnedData)=>{
        expect(typeof returnedData._id === 'string').to.be.true;
        expect(returnedData._createdAt instanceof Date).to.be.true;
        expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData._type === 'Dog').to.be.true;
        expect(returnedData.catsField[0]._type === 'Cat').to.be.true;
        expect(returnedData.catsField[0].name === 'Pickle').to.be.true;
        expect(typeof returnedData.catsField[0]._id === 'string').to.be.true;
        expect(returnedData.catsField[0]._createdAt instanceof Date).to.be.true;
        expect(returnedData.catsField[0]._lastUpdatedAt instanceof Date).to.be.true;
        expect(returnedData.catsField[1]._type === 'Cat').to.be.true;
        expect(returnedData.catsField[1].name === 'Oliver').to.be.true;
        expect(typeof returnedData.catsField[1]._id === 'string').to.be.true;
        expect(returnedData.catsField[1]._createdAt instanceof Date).to.be.true;
        expect(returnedData.catsField[1]._lastUpdatedAt instanceof Date).to.be.true;
        done();
      }, (err)=>{
        console.log(err);
      });
    });
});
