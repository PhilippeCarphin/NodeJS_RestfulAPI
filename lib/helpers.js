const crypto = require('crypto');
const config = require('../config.js');
const https = require('https');
const querystring = require('querystring');


helpers = {};

/*******************************************************************************
 *
 ******************************************************************************/
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

/*******************************************************************************
 *
 ******************************************************************************/
helpers.verify = function(user, submittedPassword){
    // Lookup users userHashString

    // Take the salt from said string

    // if(hash(salt + submittedPassword) == userHashString){
    //      return true;
    // else
    //      return false;
};

/*******************************************************************************
 *
 ******************************************************************************/
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
};

/*******************************************************************************
 *
 ******************************************************************************/
helpers.sendTwilioSms = function(phone, msg, callback){
    if(typeof(phone) != 'string' || phone.length == 0){
        callback(1, {'Error': 'Parameter phone must be a non-empty string'});
        return;
    }

    if(typeof(msg) != 'string' || msg.length == 0){
        callback(1, {'Error': 'Parameter msg must be a non-empty string'});
        return;
    }

    const payload = {
        'From': config.twilio.fromPhone,
        'To': '+1' + phone,
        'Body': msg,
    };

    const stringPayload = querystring.stringify(payload);

    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.twilio.com',
        'method': 'POST',
        'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
        'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload),
        }
    };
    // console.log('Making twilio request with details ', requestDetails);

    const request = https.request(requestDetails, function(response){
        const status = response.statusCode;
        if(status == 200 || status == 201){
            callback(false);
        } else {
            callback(status, {'Error': 'status code is different than 200 or 201', 'Response': response});
        }
    });

    request.on('error', function(err){
        callback(err);
    });

    request.write(stringPayload);

    request.end();
};

module.exports = helpers;
