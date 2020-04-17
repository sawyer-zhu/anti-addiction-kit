/**
 * 仅作为示例
 * 加密方法可自行实现
 * @type {string}
 */
var key = 'xxxxxxxxxxxxxxxx'//自行修改
var crypto = require('crypto');
var iv = '';

function encryption(data) {
    if(data.length == 0){
        return data;
    }
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var cipher = crypto.createCipheriv('aes-128-ecb', key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}

function decryption(data){
    if(data.length == 0){
        return data;
    }
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
    return cipherChunks.join('');
}
module.exports = {
    encrypt:encryption,
    decrypt:decryption,
};