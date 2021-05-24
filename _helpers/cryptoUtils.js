const config = require('../config.json');
const crypto = require('crypto');

module.exports = {
  encrypt,
  decrypt,
};

function encrypt(text) {
  let cipher = crypto.createCipher(config.crypto.algorithm, config.crypto.password);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  let decipher = crypto.createDecipher(config.crypto.algorithm, config.crypto.password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
