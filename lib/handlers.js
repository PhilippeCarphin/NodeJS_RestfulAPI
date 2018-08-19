
const dataStore = require('./data.js');
const helpers = require('./helpers.js');

var handlers = {};
/**
 * @param data : The data from the request
 * @param endCallback : function to call when the handling is finished
 */
handlers.root = function(data, endCallback)
{
    console.log('handler for path \'\' called with data:', data);
    endCallback(200, {'name' : 'root handler'});
};

handlers.ping = function(data, endCallback)
{
    endCallback(200, {});
};

/**
 * @param data : The data from the request
 * @param endCallback : function to call when the handling is finished
 */
handlers.notFound = function(data, endCallback)
{
    endCallback(404, {'path': data.path });
};

/**
 *
 */
handlers.users = function(data, endCallback)
{
    if(['POST', 'GET', 'PUT', 'DELETE'].includes(data.method)){
        handlers.userHandlers[data.method.toLowerCase()](data, endCallback);
    } else {
        console.log('Illegal method:', data.method);
        endCallback(405, {'error': 'Method must be one of POST, GET, PUT, DELETE'});
    };
};

handlers.userHandlers = {};
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

/**
 * @TODO Only give data on user if this same user is authenticated.
 */
handlers.userHandlers.get = function(data, callback)
{
    const phone = ('phone' in data.query ? data.query.phone : false);
    if(!phone){
        callback(400, {'Error': 'Payload must contain key "phone"'});
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

/**
 * Update a user's data
 * @TODO Only update user if this same user is authenticated
 */
handlers.userHandlers.put = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    if(!phone)
        return callback(400, {'Error': 'Missing phone in payload'});

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
};

/**
 * @TODO Clean up user's other things
 */
handlers.userHandlers.delete = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    if(!phone){
        callback(400, {'Error': 'Phone must be in query string for method DELETE of route /users'});
        return;
    }

    dataStore.delete('users', phone, function(err){
        if(err){
            callback(500, {'Error': 'Could not delete user'});
            return;
        }

        callback(200);
    });
};

routeMethod = function(handlerGroup, method, data, callback){
    return handlerGroup[method.toLowerCase()](data, callback);
};

handlers.tokensHandlers = {};
handlers.tokens = function(data, callback)
{
    const allowedMethods = ['POST'];
    if(allowedMethods.includes(data.method)){
        console.log('handlers.tokens(): data.method =', data.method);
        handlers.tokensHandlers[data.method.toLowerCase()](data, callback);
    } else {
        console.log('Illegal method:', data.method, 'for route', data.path);
        endCallback(405, {'error': 'Method must be one of'}, allowedMethods);
    };
};

handlers.tokensHandlers.post = function(data, callback)
{
    const phone = 'phone' in data.payload ? data.payload.phone : false;
    const password = 'password' in data.payload ? data.payload.password : false;

    if(!(phone && password)){
        callback(400, {'Error': 'Payload for /tokens GET must contain password and phone'});
        return;
    }

    const afterLookupUser = function(err, userData)
    {
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

        const tokenId = helpers.generateTokenId(32);
        if(!tokenId){
            callback(500, {'Error': 'Error generating token'});
            return;
        }

        const token = {
            'tokenId': tokenId,
            'expires': Date.now() + 1000 * 3600,
            'phone': phone
        };

        const afterSaveToken = function(err)
        {
            if(err){
                callback(500, {'Error': 'Could not save token server side'});
                return;
            }
            callback(200, token);
        };
        dataStore.create('tokens', token.tokenId, token, afterSaveToken);
    };
    dataStore.read('users', phone, afterLookupUser);
};


module.exports = handlers;
