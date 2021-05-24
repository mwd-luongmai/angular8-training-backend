const expressJwt = require('express-jwt');
const config = require('../config.json');
const userService = require('../users/user.service');
const pathToRegexp = require('path-to-regexp');
const blacklist = require('express-jwt-blacklist');

module.exports = jwt;

function jwt() {
  const secret = config.secret;
  return expressJwt({ secret, isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      '/users/authenticate',
      '/users/register',
      '/users/forgot-password',
      '/users/reset-password',
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await userService.getById(payload.sub);
  blacklist.isRevoked(req, payload, function(_, revoked) {
    if (revoked) {
      // revoke token if user no longer exists
      return done(null, true);
    } else {
      // revoke token if user no longer exists
      if (!user) {
        return done(null, true);
      }
      if (!user.active) {
        const errObj = {
          name: 'DeactivedAccount',
          message: 'The account is inactive. Please contact to system administrator.',
        };
        return done(errObj);
      }
      done();
    }
  });
}

