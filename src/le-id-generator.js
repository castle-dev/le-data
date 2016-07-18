/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 * @param type string - the LeData configured type to start the query from
 * @param id? string - The id of the individual record to serve as the root of the query
 */
var LeIDGenerator = (function () {
    function LeIDGenerator() {
    }
    LeIDGenerator.generateID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    return LeIDGenerator;
})();
exports.LeIDGenerator = LeIDGenerator;
exports.__esModule = true;
exports["default"] = LeIDGenerator;
