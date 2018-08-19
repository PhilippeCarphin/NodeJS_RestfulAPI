
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

handlers.userHandlers.put = function(data, callback)
{
    callback(501, {});
};

handlers.userHandlers.delete = function(data, callback)
{
    callback(501, {});
};
module.exports = handlers;
