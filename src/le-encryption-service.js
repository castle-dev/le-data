/**
 * The object used to configure a field on a type of data
 *
 * @class LeEncryptionService
 *
 */
var LeEncryptionService = (function () {
    function LeEncryptionService() {
    }
    LeEncryptionService.prototype.setEncryptionKey = function (key) {
        this.encryptionKey = key;
    };
    LeEncryptionService.prototype.encrypt = function (data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
        }
        return data;
    };
    LeEncryptionService.prototype.decrypt = function (data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
        }
        return data;
    };
    return LeEncryptionService;
}());
exports.LeEncryptionService = LeEncryptionService;
exports.__esModule = true;
exports["default"] = LeEncryptionService;
//# sourceMappingURL=le-encryption-service.js.map