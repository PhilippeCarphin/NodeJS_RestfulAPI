const crypto = require('crypto');
const config = require('../config.js');


helpers = {};

helpers.hash = function(password){
    if(typeof(password) != 'string')
        return false;

    // const salt = 'asdf';
    // const saltedPassword =

    const passwordHash = crypto.createHmac('sha256', config.environment.hashSecret)
          .update(password)
          .digest('hex');

    // const saltedPasswordHash = ...

    return passwordHash;
    // return 'sha256' + '$' + salt + '$' + saltedPasswordHash
};


helpers.verify = function(user, submittedPassword){
    // Lookup users userHashString

    // Take the salt from said string

    // if(hash(salt + submittedPassword) == userHashString){
    //      return true;
    // else
    //      return false;
};

module.exports = helpers;
