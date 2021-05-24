module.exports = {
  saltHashPassword,
  hashCompare,
};

('use strict');
const crypto = require('crypto');

function genRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
}

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
function sha512(password, salt) {
  let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  return hash.digest('hex');
}

/**
 * Generate salt and hash the `password`
 * @param {string} password password to be hashed
 * @returns {} the generated `salt` and hashed `password`
 */
function saltHashPassword(password) {
  const salt = genRandomString(16);
  const hash = sha512(password, salt);
  return { salt, hash };
}

/**
 * Compare the `password` to `hash` with `salt`
 * @param {string} password password to compare
 * @param {string} salt hashed salt
 * @param {string} hash hashed password
 */
function hashCompare(password, salt, hash) {
  const passwordHash = sha512(password, salt);
  return passwordHash === hash;
}
