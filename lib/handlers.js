

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

module.exports = handlers;
