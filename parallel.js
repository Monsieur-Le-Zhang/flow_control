/**
 * Created by le on 04/03/15.
 */

// the simple application by using nimble module
/*
var flow = require('nimble')
var exec = require('child_process').exec;
function downloadNodeVersion(version, destination, callback) {
    var url = 'http://nodejs.org/dist/node-v' + version + '.tar.gz';
    var filepath = destination + '/' + version + '.tgz';
    exec('curl ' + url + ' >' + filepath, callback);
    flow.series([
        function (callback) {
            flow.parallel([
                function (callback) {
                    console.log('Downloading Node v0.4.6...');
                    downloadNodeVersion('0.4.6', '/tmp', callback);
                },
                function (callback) {
                    console.log('Downloading Node v0.4.7...');
                    downloadNodeVersion('0.4.7', '/tmp', callback);
                }
            ], callback);
        },
        function (callback) {
            console.log('Creating archive of downloaded files...');
            exec(
                'tar cvf node_distros.tar /tmp/0.4.6.tgz /tmp/0.4.7.tgz',
                function (error, stdout, stderr) {
                    console.log('All done!');
                    callback();
                }
            );
        }
    ]);
}
 */


// self creation parallel program

var fs = require('fs');
var tasks = [];
var completedTasks = 0;
var wordCounts = {};
var filesDir = './parallel_text';

function checkIfComplete () {
    completedTasks ++;
    if (completedTasks == tasks.length) {
        for (var word in wordCounts) {
            console.log(word + ': ' + wordCounts[word]);
        }
    }
}

function countWordsInText (text) {
    var words = text.toString().toLowerCase().split(/\W+/g).sort();
    for (var i in words) {
        var word = words[i];
        if (word) {
            wordCounts[word] = wordCounts[word] ? wordCounts[word] + 1 : 1;
        }
    }
}

fs.readdir(filesDir, function (err, files) {
    if (err) {
        throw err;
    } else {
        for (var i in files) {
            var task = (function (file) {
                return function () {
                    fs.readFile(file, function (err, data) {
                        if (err) {
                            throw err;
                        } else {
                            countWordsInText(data);
                            checkIfComplete();
                        }
                    });
                };
            })(filesDir + '/' + files[i]);
            tasks.push(task);
        }

        for (var task in tasks) {
            tasks[task]();
        }
    }
});