const DiffObject = require('./DiffObject');

function FindMissingKeys(options) {
    // Setup the plugin instance with options...
    this.dir = options.dir;
    this.originalFile = options.original;
    this.result = [];
}

FindMissingKeys.prototype.apply = function(compiler) {
    new DiffObject(this.dir, this.originalFile).run().then(res => {
        res.forEach((obj) => {
            obj.keys.forEach(item => {
                this.result.push({
                    fileName: obj.fileName,
                    message: item + ' is missing in ' + obj.fileName
                })
            })
        });
    });

    compiler.plugin('done', () => {
        this.result.forEach(item => {
            console.log(item.message);
        })
    });
};

module.exports = FindMissingKeys;
