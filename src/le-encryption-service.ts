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
    let value = AES.encrypt(data, this.encryptionKey).toString();
    console.log('encrypting', data, value);
    return value;
  }
  decrypt(data:string) {
    if(!this.encryptionKey) {
      throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
    }
    let value = AES.decrypt(data, this.encryptionKey).toString(enc.Utf8);
    console.log('decrypting', data, value)
    return value;
  }
}

export default LeEncryptionService;
