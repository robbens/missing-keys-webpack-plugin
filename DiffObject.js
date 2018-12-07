const _ = require('lodash');
const fs = require('fs');

fs.readdirAsync = function(dirname) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dirname, function(err, filenames){
            if (err)
                reject(err);
            else
                resolve(filenames);
        });
    });
};

// make Promise version of fs.readFile()
fs.readFileAsync = function(filename, enc) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, enc, function(err, data){
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};

class DiffObject {

    constructor(dir, originalFile) {
        this.result = [];
        this.originalFile = originalFile;
        this.dir = dir;
    }

    run() {
        return this.map()
    }

    map() {
        return fs.readdirAsync(this.dir).then((filenames) => {
            // Remove the json file to compare against
            filenames.splice(filenames.indexOf(this.originalFile), 1);

            // Get files and map the filename as key
            const files = filenames.map(fileName => {
                return this.getFile(fileName).then(file => {
                    return {fileName: fileName, file};
                });
            });

            // Return all files as a promise
            return Promise.all(files);
        }).then((files) => {

            return this.getFile(this.originalFile).then(en => {
                const flatEn = this.flatten(JSON.parse(en));
                let missingKeys = [];

                // Find all keys that are not present in the original
                files.forEach((file) => {
                    const flatFile = this.flatten(JSON.parse(file.file));

                    // Diff the current file to the original file
                    missingKeys.push({
                        fileName: file.fileName,
                        keys: _.difference(flatEn, flatFile),
                    });
                });

                return Promise.all(missingKeys);
            });
        });
    }

    // Flatten an object to dot notation
    flatten(obj, prefix = null) {
        let keys = [];
        prefix = prefix? prefix + '.' : '';
        for(let key in obj) {
            if(typeof obj[key] === 'object') {
                const subKeys = this.flatten(obj[key], prefix + key);
                keys = keys.concat(subKeys);
            } else {
                keys.push(prefix + key);
            }
        }
        return keys;
    }

    getFile(filename) {
        return fs.readFileAsync(this.dir + '/' + filename, 'utf8');
    }
}

module.exports = DiffObject;
