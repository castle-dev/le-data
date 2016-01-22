var LeDataQuery = require('./le-data-query.js').LeDataQuery;
var LeDataServiceProviderFirebase = require('./providers/le-data-service-provider-firebase.js').LeDataServiceProviderFirebase;
var LeDataService = require('./le-data-service.js').LeDataService;
var LeTypeConfig = require('./le-type-config.js').LeTypeConfig;
var exportObject = {};
exportObject.service = LeDataService;
exportObject.providerFirebase = LeDataServiceProviderFirebase;
exportObject.query = LeDataQuery;
exportObject.typeConfig = LeTypeConfig;

module.exports = exportObject;
