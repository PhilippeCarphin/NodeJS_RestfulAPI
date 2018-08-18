
const fs = require('fs');
const path = require('path');

// Container for this module

const dataStorage = {};

dataStorage.baseDir = path.join(__dirname, '..', '.data');

const makePath = (dir, file) => path.join(dataStorage.baseDir, dir, file+'.json');

const closeFile = function(fd, callback){
    fs.close(fd, function(err){
        if(err){
            callback('Error closing file');
        } else {
            callback(false);
        }
    });
};

const writeFile = function(fd, data, callback){
    dataString = JSON.stringify(data);
    fs.writeFile(fd, dataString, function(err){
        if(err){
            callback('Error writing to file');
        } else {
            closeFile(fd, callback);
        }
    });
};

dataStorage.create = function(dir, file, data, callback)
{
    filepath = makePath(dir, file);
    console.log('attempting to create', filepath);
    fs.open(filepath, 'wx', function(err, fd){
        if(err || !fd){
            callback('Could not create new file, it may already exist');
        } else {
            writeFile(fd, data, callback);
        }
    });
};


dataStorage.read = function(dir, file, callback)
{
    const filepath = makePath(dir, file);
    fs.readFile(filepath, 'utf8', function(err, data){
        callback(err,data);
    });
};


dataStorage.update = function(dir, file, data, callback){
    filepath = makePath(dir, file);
    fs.open(filepath, 'r+', function(err, fd){
        if(err){
            callback('error opening file', filepath, 'for writing');
        } else {
            writeFile(fd, data, callback);
        }
    });
};
module.exports = dataStorage;
