/**
 * Created by le on 04/03/15.
 */

// 1. the simple serial flow example by using nimble external module.

/*
var flow = require('nimble');

flow.series([
    function (cb) {
        console.log('First execution');
        cb();
    },
    function (cb) {
        console.log('Second execution');
        cb();
    },
    function (cb) {
        console.log('Last execution');
        cb();
    }
]);

 */

// 2. realize the serial flow by using my own serial flow control
var fs = require('fs');
var request = require('request');
var htmlParser = require('htmlparser');
var configFilename = './rss_feeds.txt';

function checkForRSSFile () {
    fs.exists(configFilename, function (exists) {
        if (!exists) {
            next(new Error('The config file (RSS feeds file) is missing'));
        } else {
            next(null, configFilename);
        }
    });
}

function readRSSFile (configFilename) {
    fs.readFile(configFilename, function (err, feedList) {
        if (err) {
            next(err);
        } else {
            feedList = feedList.toString().split('\n');
            var random = Math.floor(Math.random() * feedList.length);
            next(null, feedList[random]);
        }
    });
}

function downloadRSSFeed (feedURL) {
    request({uri: feedURL}, function (err, res, body) {
        if (err) {
            next(err);
        } else if (res.statusCode != 200) {
            next(new Error('Abnormal response status code'));
        } else {
            next(null, body);
        }
    });
}

function parseRSSFeed (rss) {
    var handler = new htmlParser.RssHandler();
    var parser = new htmlParser.Parser(handler);

    parser.parseComplete(rss);

    if (!handler.dom.items.length) {
        next(new Error('No RSS items found'));
    } else {
        var item = handler.dom.items.shift();
        console.log(item.title);
        console.log(item.link);
    }
}

var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
];

function next (err, result) {
    if (err) {
        throw err;
    } else {
        var currentTask = tasks.shift();
        if (currentTask) {
            currentTask(result);
        }
    }
}

next();