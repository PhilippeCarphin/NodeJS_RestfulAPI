
const fs = require('fs');
const path = require('path');

const dataStorage = {};

/*******************************************************************************
 * Creates cannonical paths for data storage from dir and file.
 ******************************************************************************/
const makePath = (dir, file) => path.join(
    __dirname, '..', '.data', dir, file+'.json'
);

/*******************************************************************************
 * Closes the file descriptor fd
 ******************************************************************************/
const closeFile = function(fd, callback){
    fs.close(fd, function(err){
        if(err){
            callback('Error closing file');
        } else {
            callback(false);
        }
    });
};

/*******************************************************************************
 * Writes a json dump of data to the file descriptor fd
 ******************************************************************************/
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

/*******************************************************************************
 * Creates the file .data/dir/file with data
 ******************************************************************************/
dataStorage.create = function(dir, file, data, callback)
{
    filepath = makePath(dir, file);
    fs.open(filepath, 'wx', function(err, fd){
        if(err || !fd){
            callback('Could not create new file, it may already exist');
        } else {
            writeFile(fd, data, callback);
        }
    });
};

/*******************************************************************************
 * Reads and returns .data/dir/file.json
 ******************************************************************************/
dataStorage.read = function(dir, file, callback)
{
    const filepath = makePath(dir, file);
    fs.readFile(filepath, 'utf8', function(err, data){
        if(err)
            callback(err, false);
        else
            callback(err, JSON.parse(data));
    });
};

/*******************************************************************************
 * Updates .data/dif/file.json with data
 ******************************************************************************/
dataStorage.update = function(dir, file, data, callback){
    filepath = makePath(dir, file);
    fs.open(filepath, 'r+', function(err, fd){
        if(err){
            callback('error opening file' + filepath + 'for writing');
        } else {
            writeFile(fd, data, callback);
        }
    });
};

/*******************************************************************************
 * Deletes .data/dir/file.json
 ******************************************************************************/
dataStorage.delete = function(dir, file, callback){
    fs.unlink(makePath(dir, file), function(err){
        if(err){
            callback("Could not delete file");
        } else {
            callback(false);
        }
    });
};


module.exports = dataStorage;
