
const fs = require('fs');
const path = require('path');

// Container for this module

const dataStorage = {};

dataStorage.baseDir = path.join(__dirname, '..', '.data');

dataStorage.create = function(dir, file, data, callback)
{
    filepath = path.join(dataStorage.baseDir, dir, file + '.json');
    console.log('attempting to create', filepath);
    const closeFile = function(fd){
        fs.close(fd, function(err){
            if(err){
                callback('Error closing new file');
            } else {
                callback(false);
            }
        });
    };
    const writeFile = function(fd, data){
        dataString = JSON.stringify(data);
        fs.writeFile(fd, dataString, function(err){
            if(err){
                callback('Error writing to new file');
            } else {
                closeFile(fd);
            }
        });
    };

    fs.open(filepath, 'wx', function(err, fd){
        if(err || !fd){
            callback('Could not create new file, it may already exist');
        } else {
            writeFile(fd, data);
        }
    });
};


dataStorage.read = function(dir, file, callback)
{
    filepath = path.join(dataStorage.baseDir, dir, file+'.json');
    fs.readFile(filepath, 'utf8', function(err, data){
        callback(err,data);
    });
};
module.exports = dataStorage;
