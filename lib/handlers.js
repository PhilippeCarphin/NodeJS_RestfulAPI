
const dataStore = require('./data.js');
const helpers = require('./helpers.js');
const config = require('../config.js');

var handlers = {};
handlers.tokensHandlers = {};
handlers.userHandlers = {};

/*******************************************************************************
 * Verify if tokenid is valid for user specified by phone
 ******************************************************************************/
const tokenIsValid = function(tokenid, phone, callback){

    dataStore.read('tokens', tokenid, function(err, token){
        if(err){
            callback(false, {'Error': 'Token not found'});
            return;
        }

        if(token.phone != phone){
            callback(false, {'Error': 'You are not authorized on this token'});
            return;
        }

        if(token.expires < Date.now()){
            callback(false, {'Error': 'Token is expired'});
            return;
        }

        callback(true);
    });
};


/*******************************************************************************
 * @param data : The data from the request
 * @param endCallback : function to call when the handling is finished
 ******************************************************************************/
handlers.root = function(data, endCallback)
{
    console.log('handler for path \'\' called with data:', data);
    endCallback(200, {'name' : 'root handler'});
};

/*******************************************************************************
 * /ping (any method) handler
 ******************************************************************************/
handlers.ping = function(data, endCallback)
{
    endCallback(200, {});
};

/*******************************************************************************
 * Handler for unknown path
 * @param data : The data from the request
 * @param endCallback : function to call when the handling is finished
 ******************************************************************************/
handlers.notFound = function(data, endCallback)
{
    endCallback(404, {'path': data.path });
};

/*******************************************************************************
 * /users request dispatcher
 ******************************************************************************/
handlers.users = function(data, endCallback)
{
    if(['POST', 'GET', 'PUT', 'DELETE'].includes(data.method)){
        handlers.userHandlers[data.method.toLowerCase()](data, endCallback);
    } else {
        console.log('Illegal method:', data.method);
        endCallback(405, {'error': 'Method must be one of POST, GET, PUT, DELETE'});
    };
};

/*******************************************************************************
 * /users POST handler
 ******************************************************************************/
handlers.userHandlers.post = function(data, callback)
{
    const processString = (key, minLength) => {
        if(!(key in data.payload))
            return false;

        const trimmed = data.payload[key].trim();
        if(trimmed.length < minLength)
            return false;

        return trimmed;
    };

    const processPhone = (key) => {
        // TODO Make a better check
        return processString(key, 7);
    };

    const processBool = (key) => {
        if(!(key in data.payload))
            return false;

        if(typeof(data.payload[key]) != 'boolean')
            return false;

        return data.payload[key];
    };

    const firstName = processString('firstName', 1);
    const lastName = processString('lastName', 1);
    const phone = processPhone('phone');
    const password = processString('password', 1);
    const tosAgreement = processBool('tosAgreement', 1);

    if(!(firstName && lastName && phone && password && tosAgreement)){
        callback(400, {'Error': 'missing key in payload'});
        return;
    }

    dataStore.read('users', phone, function(err, data){
        if(!err){
            callback(400, {'Error': 'A user with this phone number already exists'});
            return;
        }

        const hashedPassword = helpers.hash(password);

        const newUser = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
        };

        dataStore.create('users', phone, newUser, function(err){
            if(err){
                callback(500, {'Error': 'Could not create new user'});
            }

            console.log("Created user:", newUser);
            callback(200, {'hashedPass': hashedPassword, 'phone':phone});
        });
    });
};

/*******************************************************************************
 * /users GET handler
 ******************************************************************************/
handlers.userHandlers.get = function(data, callback)
{
    const phone = ('phone' in data.query ? data.query.phone : false);
    const tokenid = ('tokenid' in data.query ? data.query.tokenid : false);
    if(!( phone && tokenid )){
        callback(400, {'Error': 'This request requires phone and tokenid'});
        return;
    }

    const afterValidateToken = function(valid, extra)
    {
        if(!valid){
            callback(401, extra);
            return;
        }
        dataStore.read('users', phone, function(err, data){
            if(err){
                callback(404, {'Error': 'User not found'});
                return;
            }

            console.log('Calling back with data:', data);
            callback(200, data);
        });
    };
    tokenIsValid(tokenid, phone, afterValidateToken);
};

/*******************************************************************************
 * /users PUT handler : Update a user's data with data from payload
 ******************************************************************************/
handlers.userHandlers.put = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    const tokenid = ('tokenid' in data.headers ? data.headers.tokenid : false);
    if(!( phone && tokenid )){
        callback(400, {'Error': 'This request requires phone and tokenid'});
        return;
    }
 
    tokenIsValid(tokenid, phone, function(valid, extra){
        if(!valid){
            callback(401, extra);
            return;
        }

        dataStore.read('users', phone, function(err, userData){
            if(err){
                callback(400, {'Error': 'User to update does not exist'});
                return;
            }

            for(key in data.payload){
                userData[key] = data.payload[key];
            }

            dataStore.update('users', phone, userData, function(err){
                if(err){
                    callback(500, {'Error': 'Could not write back updated data'});
                    return;
                }
                callback(200, userData);
            });
        });
    });
};

/*******************************************************************************
 * /users DELETE handler.
 * @TODO Clean up user's other things
 ******************************************************************************/
handlers.userHandlers.delete = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    const tokenid = ('tokenid' in data.headers ? data.headers.tokenid : false);
    if(!( phone && tokenid )){
        callback(400, {'Error': 'This request requires phone and tokenid'});
        return;
    }

    tokenIsValid(tokenid, phone, function(valid, extra){
        if(!valid){
            callback(401, extra);
            return;
        }
        dataStore.delete('users', phone, function(err){
            if(err){
                callback(500, {'Error': 'Could not delete user'});
                return;
            }

            callback(200, {'Message': 'Deleted user', 'deletedUser': phone});
        });
    });
};


/*******************************************************************************
 * /tokens method dispatcher
 ******************************************************************************/
handlers.tokens = function(data, callback)
{
    const allowedMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if(allowedMethods.includes(data.method)){
        handlers.tokensHandlers[data.method.toLowerCase()](data, callback);
    } else {
        callback(405, {'error': 'Method must be one of'}, allowedMethods);
    };
};

/*******************************************************************************
 * /tokens POST handler
 ******************************************************************************/
handlers.tokensHandlers.post = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    const password = 'password' in data.payload ? data.payload.password : false;

    if(!(phone && password)){
        callback(400, {'Error': 'Payload for /tokens GET must contain password and phone'});
        return;
    }

    dataStore.read('users', phone, function(err, userData) {
        if(err){
            callback(400, {'Error': 'User does not exist'});
            return;
        }

        const hashedPassword = userData.hashedPassword;
        const phone = userData.phone;
        const hashedSubmittedPassword = helpers.hash(password);
        if(hashedSubmittedPassword != hashedPassword){
            callback(401, {'Error': 'Could not authenticate'});
            return;
        }

        const tokenid = helpers.generateTokenId(32);
        if(!tokenid){
            callback(500, {'Error': 'Error generating token'});
            return;
        }

        const token = {
            'tokenid': tokenid,
            'expires': Date.now() + 1000 * 3600,
            'phone': phone
        };

        dataStore.create('tokens', token.tokenid, token, function(err)
        {
            if(err){
                callback(500, {'Error': 'Could not save token server side'});
                return;
            }
            callback(200, token);
        });
    });
};

/*******************************************************************************
 * /tokens GET handler
 ******************************************************************************/
handlers.tokensHandlers.get = function(data, callback)
{
    const tokenid = 'tokenid' in data.query ? data.query.tokenid : false;

    if(!tokenid){
        callback(404, {'Error': "Query must contain 'tokenid'."});
        return;
    }

    const afterFindToken = function(err, token)
    {
        if(err)
            callback(404, {'Error': 'Token not found', 'tokenid': tokenid});
        else
            callback(200, token);
    };
    dataStore.read('tokens', tokenid, afterFindToken);
};

/*******************************************************************************
 * /tokens PUT handler
 ******************************************************************************/
handlers.tokensHandlers.put = function(data, callback)
{
    const tokenid = 'tokenid' in data.query ? data.query.tokenid : false;

    if(!tokenid){
        callback(400, {'Error': 'Missing parameter tokenid'});
        return;
    }

    const afterFindToken = function(err, token)
    {
        if(err){
            callback(404, {'Error': 'Token not found', 'tokenid': tokenid});
            return;
        }

        if(token.expires <= Date.now()){
            callback(400, {'Error': 'Token is already expired'});
            return;
        }

        token.expires = Date.now() + 1000 * 3600;

        dataStore.update('tokens', tokenid, token, function(err){
            if(err)
                callback(500, {'Error': 'Could not update token', 'token': token});
            else
                callback(200, token);
        });
    };
    dataStore.read('tokens', tokenid, afterFindToken);
};

/*******************************************************************************
 * /tokens DELETE handler
 ******************************************************************************/
handlers.tokensHandlers.delete = function(data, callback)
{
    const tokenid = 'tokenid' in data.query ? data.query.tokenid : false;

    if(!tokenid){
        callback(400, {'Error': 'Missing parameter tokenid'});
        return;
    }

    const afterFindToken = function(err, token)
    {
        if(err){
            callback(404, {'Error': 'Token not found', 'tokenid': tokenid});
            return;
        }

        dataStore.delete('tokens', tokenid, function(err){
            if(err){
                callback(500, {'Error': 'Could not delete token', 'token':token});
                return;
            }

            callback(200);
        });
    };
    dataStore.read('tokens', tokenid, afterFindToken);
};

handlers.checks = function(data, callback)
{
    const allowedMethods = ['POST', 'PUT'];
    if(allowedMethods.includes(data.method)){
        handlers.checksHandlers[data.method.toLowerCase()](data, callback);
    } else {
        console.log('Illegal method:', data.method);
        callback(405, {'error': 'Method must be one of ' + allowedMethods.toString()});
    };
};

handlers.checksHandlers = {};

handlers.checksHandlers.post = function(data, callback)
{
    const protocol = 'protocol' in data.payload ? data.payload.protocol : false;
    const url = 'url' in data.payload ? data.payload.url : false;
    const method = 'method' in data.payload ? data.payload.method : false;
    const successCodes = 'successCodes' in data.payload ? data.payload.successCodes : false;
    const timeoutSeconds = 'timeoutSeconds' in data.payload ? data.payload.timeoutSeconds : false;

    if(!(protocol && url && method && successCodes && timeoutSeconds)){
        callback(400, {'Error': 'Missing parameters in request'});
        return;
    }

    const tokenid = 'tokenid' in data.headers ? data.headers.tokenid : false;

    if(!(tokenid)){
        callback(400, {'Error': 'Header must contain tokenid', 'headers': data.headers});
        return;
    }

    dataStore.read('tokens', tokenid, function(err, token){
        if(err){
            callback(403, {'Error': 'Could not find token with ID ' + tokenid});
            return;
        }
        const phone = token.phone;

        console.log("token = ", token);
        console.log("phone = ", phone);
        dataStore.read('users', phone, function(err, user){
            if(err){
                callback(500, {'Error': 'Could not find user associated with token ' + tokenid});
                return;
            }

            userChecks = ('checks' in user ? user.checks : []);

            if(userChecks.length >= config.environment.maxChecks){
                callback(400, {'Error': 'User already has the maximum number of checks'});
                return;
            }

            check = {
                'checkId': helpers.generateTokenId(15),
                'userPhone': phone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds,
            };

            dataStore.create('checks', check.checkId, check, function(err){
                if(err){
                    callback(500, 'Could not save check object to database');
                    return;
                }

                userChecks.push(check.checkId);
                user.checks = userChecks;
                dataStore.update('users', phone, user, function(err){
                    if(err){
                        callback(500, {'Error': 'Could not update user (add checkId to checks)'});
                        return;
                    }

                    callback(200, check);
                });
            });
        });
    });
};

handlers.checksHandlers.put = function(data, callback)
{
    const checkId = 'checkid' in data.payload ? data.payload.checkid : false;

    if(!checkId){
        callback(400, {'Error': 'Request requires checkid'});
        return;
    }

    const tokenid = 'tokenid' in data.headers ? data.headers.tokenid : false;

    if(!tokenid){
        callback(400, {'Error': 'Header must contain tokenid'});
        return;
    }


    dataStore.read('checks', checkId, function(err, check){
        if(err){
            callback(500, {'Error': 'Could not find check with id ' + checkId});
            return;
        }

        userPhone = 'userPhone' in check ? check.userPhone : false;

        if(!userPhone){
            callback(500, {'Error': 'Could not find user owning check ' + checkId});
            return;
        }

        tokenIsValid(tokenid, userPhone, function(valid, extra){

            if(!valid){
                callback(403, extra);
                return;
            }

            const input = {
                'protocol': 'protocol' in data.payload ? data.payload.protocol : false,
                'url' : 'url' in data.payload ? data.payload.url : false,
                'method' : 'method' in data.payload ? data.payload.method : false,
                'successCodes' : 'successCodes' in data.payload ? data.payload.successCodes : false,
                'timeoutSeconds' : 'timeoutSeconds' in data.payload ? data.payload.timeoutSeconds : false,
            };

            for(key in input){
                if(input[key]){
                    check[key] = input[key];
                }
            }

            dataStore.update('checks', checkId, check, function(err){
                if(err){
                    callback(500, {'Error': 'Could not update check (checkId = ' + checkId + ')'});
                    return;
                }

                callback(200, check);
            });
        });
    });
};

module.exports = handlers;
