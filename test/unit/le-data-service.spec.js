var ts_promise_1 = require("ts-promise");
var chai = require('chai');
var data = require("../../src/le-data-service");
var le_type_config_1 = require("../../src/le-type-config");
var le_data_query_1 = require("../../src/le-data-query");
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
    it('should throw an error on create create if the field is the wrong type', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        var goodFieldConfig = dogTypeConfig.addField('goodField', 'string');
        dataService.configureType(dogTypeConfig).then(function () {
            return dataService.createData({ _type: 'Dog', goodField: 74 });
        }).then(undefined, function (err) {
            done();
        });
    });
    it('should correctly configure and save custom type fields', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        var goodFieldConfig = dogTypeConfig.addField('catField', 'Cat');
        dataService.configureType(dogTypeConfig).then(function () {
            var catTypeConfig = new le_type_config_1.default('Cat');
            return dataService.configureType(catTypeConfig);
        }).then(function () {
            return dataService.createData({ _type: 'Dog', catField: { _type: "Cat" } });
        }).then(function (returnedData) {
            expect(typeof returnedData._id === 'string').to.be.true;
            expect(returnedData._createdAt instanceof Date).to.be.true;
            expect(returnedData._lastUpdatedAt instanceof Date).to.be.true;
            expect(returnedData._type === 'Dog').to.be.true;
            expect(returnedData.catField._type === 'Cat').to.be.true;
            expect(typeof returnedData.catField._id === 'string').to.be.true;
            expect(returnedData.catField._createdAt instanceof Date).to.be.true;
            expect(returnedData.catField._lastUpdatedAt instanceof Date).to.be.true;
            done();
        }, function (err) {
            console.log(err);
        });
    });
    it('should correctly configure and save object type fields', function (done) {
        var dogTypeConfig = new le_type_config_1.default('Dog');
        dogTypeConfig.addField('name', 'string');
        var myJsonConfig = dogTypeConfig.addField('myJson', 'object');
        myJsonConfig.addField('theStringField', 'string');
        myJsonConfig.addField('theDogField', 'Dog');
        dataService.configureType(dogTypeConfig).then(function () {
            return dataService.createData({
                _type: 'Dog',
                name: 'Goofy',
                myJson: {
                    theStringField: 'testString',
                    theDogField: {
                        _type: 'Dog',
                        name: 'Pluto'
                    }
                }
            });
        }).then(function (returnedData) {
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
        }, function (err) {
            console.log(err);
        });
    });
    it('should correctly configure and save custom type array fields', function (done) {
        mockProvider.remoteStoredData = {};
        var dogTypeConfig = new le_type_config_1.default('Dog');
        var goodFieldConfig = dogTypeConfig.addField('catsField', 'Cat[]');
        dataService.configureType(dogTypeConfig).then(function () {
            var catTypeConfig = new le_type_config_1.default('Cat');
            catTypeConfig.addField('name', 'string');
            return dataService.configureType(catTypeConfig);
        }).then(function () {
            return dataService.createData({ _type: 'Dog', catsField: [{ _type: 'Cat', name: 'Pickle' }, { _type: 'Cat', name: 'Oliver' }] });
        }).then(function (returnedData) {
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
        }, function (err) {
            console.log(err);
        });
    });
    describe('queries', function () {
        beforeEach(function (done) {
            var ownerConfig = new le_type_config_1.default('Owner');
            ownerConfig.saveAt('owners');
            ownerConfig.addField('properties', 'Property[]').saveAt('property_ids');
            ownerConfig.addField('bankAccount', 'BankAccount').saveAt('bankAccount_id');
            ownerConfig.addField('createdAt', 'Date').saveAt('_times/createdAt');
            var propertyConfig = new le_type_config_1.default('Property');
            propertyConfig.saveAt('properties');
            propertyConfig.addField('tenants', 'Tenant[]').saveAt('tenant_ids');
            propertyConfig.addField('units', 'Unit[]').saveAt('unit_ids');
            var tenantConfig = new le_type_config_1.default('Tenant');
            tenantConfig.saveAt('tenants');
            var unitConfig = new le_type_config_1.default('Unit');
            unitConfig.saveAt('units');
            var bankAccountConfig = new le_type_config_1.default('BankAccount');
            bankAccountConfig.saveAt('bankAccounts');
            mockProvider.remoteStoredData = {
                owners: {
                    owner_id1: {
                        _times: {
                            createdAt: 1452575643030
                        },
                        firstName: 'Joe',
                        lastName: 'Black',
                        bankAccount_id: 'bankAccount_id1',
                        property_ids: {
                            property_id1A: true,
                            property_id1B: true,
                        }
                    },
                    owner_id2: {
                        firstName: 'owner2FirstName',
                        lastName: 'owner2LastName',
                        bankAccount_id: 'bankAccount_id2',
                        property_ids: {
                            property_id2A: true,
                            property_id2B: true,
                        }
                    }
                },
                bankAccounts: {
                    bankAccount_id1: {
                        bankName: 'BankOfAmerica'
                    },
                    bankAccount_id2: {
                        bankName: 'Chase'
                    }
                },
                properties: {
                    property_id1A: {
                        propertyName: 'p1A',
                        unit_ids: {
                            unit_id1Aa: true,
                            unit_id1Ab: true
                        },
                        tenant_ids: {
                            tenant_id1Aa: true,
                            tenant_id1Ab: true
                        }
                    },
                    property_id1B: {
                        propertyName: 'p1B',
                        unit_ids: {
                            unit_id1Ba: true,
                            unit_id1Bb: true
                        },
                        tenant_ids: {
                            tenant_id1Ba: true,
                            tenant_id1Bb: true
                        }
                    },
                    property_id2A: {
                        propertyName: 'p2A',
                        unit_ids: {
                            unit_id2Aa: true,
                            unit_id2Ab: true
                        },
                        tenant_ids: {
                            tenant_id2Aa: true,
                            tenant_id2Ab: true
                        }
                    },
                    property_id2B: {
                        propertyName: 'p1B',
                        unit_ids: {
                            unit_id1Ba: true,
                            unit_id1Bb: true
                        },
                        tenant_ids: {
                            tenant_id1Ba: true,
                            tenant_id1Bb: true
                        }
                    }
                },
                units: {
                    unit_id1Aa: {
                        unitName: 'u1Aa'
                    },
                    unit_id1Ab: {
                        unitName: 'u1Ab'
                    },
                    unit_id1Ba: {
                        unitName: 'u1Ba'
                    },
                    unit_id1Bb: {
                        unitName: 'u1Bb'
                    },
                    unit_id2Aa: {
                        unitName: 'u2Aa'
                    },
                    unit_id2Ab: {
                        unitName: 'u2Ab'
                    },
                    unit_id2Ba: {
                        unitName: 'u2Ba'
                    },
                    unit_id2Bb: {
                        unitName: 'u2Bb'
                    }
                },
                tenants: {
                    tenant_id1Aa: {
                        tenantName: 't1Aa'
                    },
                    tenant_id1Ab: {
                        tenantName: 't1Ab'
                    },
                    tenant_id1Ba: {
                        tenantName: 't1Ba'
                    },
                    tenant_id1Bb: {
                        tenantName: 't1Bb'
                    },
                    tenant_id2Aa: {
                        tenantName: 't2Aa'
                    },
                    tenant_id2Ab: {
                        tenantName: 't2Ab'
                    },
                    tenant_id2Ba: {
                        tenantName: 't2Ba'
                    },
                    tenant_id2Bb: {
                        tenantName: 't2Bb'
                    }
                }
            };
            var promises = [];
            promises.push(dataService.configureType(ownerConfig));
            promises.push(dataService.configureType(propertyConfig));
            promises.push(dataService.configureType(tenantConfig));
            promises.push(dataService.configureType(unitConfig));
            promises.push(dataService.configureType(bankAccountConfig));
            ts_promise_1.default.all(promises).then(function () {
                done();
            });
        });
        it('should error if invalid', function (done) {
            var myQuery = new le_data_query_1.default('Owner', 'owner_id1');
            myQuery.include('bankAccount');
            var propertySubQuery = myQuery.include('properties');
            propertySubQuery.include('dfj');
            dataService.search(myQuery).then(undefined, function (err) {
                done();
            });
        });
        it('should fetch the data correctly', function (done) {
            var myQuery = new le_data_query_1.default('Owner', 'owner_id1');
            myQuery.include('bankAccount');
            var propertySubQuery = myQuery.include('properties');
            propertySubQuery.include('units');
            dataService.search(myQuery).then(function (ownerObject) {
                expect(ownerObject.createdAt instanceof Date).to.be.true;
                expect(ownerObject.bankAccount.bankName).to.equal('BankOfAmerica');
                expect(ownerObject.firstName).to.equal('Joe');
                expect(ownerObject.lastName).to.equal('Black');
                expect(ownerObject.bankAccount._type).to.equal('BankAccount');
                expect(ownerObject.bankAccount._id).to.equal('bankAccount_id1');
                expect(ownerObject.properties.length).to.equal(2);
                expect(ownerObject.properties[0].units[0]._id).to.equal('unit_id1Aa');
                expect(ownerObject.properties[1].tenants[1]._id).to.equal('tenant_id1Bb');
                expect(ownerObject.properties[1].tenants[1].tenantName).to.equal('t1Bb');
                done();
            }, function (err) {
                console.log(err);
                console.log(err.stack);
            });
        });
    });
});
//# sourceMappingURL=le-data-service.spec.js.map