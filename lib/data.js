
const fs = require('fs');
const path = require('path');

// Container for this module

const lib = {};

lib.baseDir = path.join(__dirname, '..', '.data');

lib.create = function(dir, file, data, callback)
{
    filepath = path.join(lib.baseDir, dir, file + '.json');
    console.log('attempting to create', filepath);
    fs.open(filepath, 'wx', function(err, fd){
        if(err || !fd){
            callback('Could not create new file, it may already exist');
            return;
        }
        dataString = JSON.stringify(data);
        fs.writeFile(fd, dataString, function(err){
            if(err){
                callback('Error writing to new file');
                return;
            }
            fs.close(fd, function(err){
                if(err){
                    callback('Error closing new file');
                    return;
                }
                callback(false);
            });
        });
    });
};

module.exports = lib;
