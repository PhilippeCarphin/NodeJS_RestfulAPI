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

helpers.generateTokenId = function(stringLenght)
{
    if(typeof(stringLenght) != 'number' || stringLenght <= 0){
        return false;
    }

    hexChars = '0123456789abcdef';
    token = '';
    for(var i = 0; i < stringLenght; ++i){
        token += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return token;
}

module.exports = helpers;
