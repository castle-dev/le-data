import {AES, enc} from 'crypto-js';
/**
 * The object used to configure a field on a type of data
 *
 * @class LeEncryptionService
 *
 */
export class LeEncryptionService {
  private encryptionKey:string;
  constructor() {
  }
  setEncryptionKey(key:string) {
    this.encryptionKey = key;
  }
  encrypt(data:string) {
    if(!this.encryptionKey) {
      throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
    }
    return AES.encrypt(data, this.encryptionKey).toString();
  }
  decrypt(data:string) {
    if(!this.encryptionKey) {
      throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
    }
    return AES.decrypt(data, this.encryptionKey).toString(enc.Utf8);
  }
}

export default LeEncryptionService;
