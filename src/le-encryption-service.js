var crypto_js_1 = require('crypto-js');
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
        return crypto_js_1.AES.encrypt(data, this.encryptionKey);
    };
    LeEncryptionService.prototype.decrypt = function (data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
        }
        return crypto_js_1.AES.decrypt(data, this.encryptionKey);
    };
    return LeEncryptionService;
}());
exports.LeEncryptionService = LeEncryptionService;
exports.__esModule = true;
exports["default"] = LeEncryptionService;
//# sourceMappingURL=le-encryption-service.js.map