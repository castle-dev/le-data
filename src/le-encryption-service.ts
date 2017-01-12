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
    return data;
  }
  decrypt(data:string) {
    if(!this.encryptionKey) {
      throw new Error('Encryption key not set. Call setEncryptionKey before encrypting or decrypting data');
    }
    return data;
  }
}

export default LeEncryptionService;
