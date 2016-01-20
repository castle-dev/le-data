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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LeIDGenerator;
//# sourceMappingURL=le-id-generator.js.map