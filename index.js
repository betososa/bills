// import node dependencies
var Moment = require('moment'),
    MomentRange = require('moment-range'),
    request = require('request'),
    async = require('async'),
    _ = require('lodash');

const moment = MomentRange.extendMoment(Moment);

// declare vars that will be in the scope of our functions
var api = 'add api url here',
    start = moment('2017-1-1', 'YYYY-MM-DD').format('YYYY-MM-DD'),
    end   = moment('2017-12-31', 'YYYY-MM-DD').format('YYYY-MM-DD'),
    id = '717f076e-e13c-45b4-bcc4-51c229e1b326',
    range = moment.range(start, end),
    someNewIntervals = [];

// global counters to return
var unitCounter = 0,
    globalTries = 0;


// this function will generate intervals of `units` from our start date to end date
// units is one [ months, weeks, days ]
function getInterval(unit, range) {
    var intervals = [];
    for (let x of range.by(unit)) {
        intervals.push(x.format('YYYY-MM-DD'));
    }
    return intervals;
}

// call service
function getBills(start, end) {
  callService(start, end, function(err, response) {
    if (err) {
      return console.log(err);
    }
    if (isBig(response.body)) {
        var newIntervals = createSubintervals(start, end, 'months');
        doSomething(newIntervals, function(err) {
            if (err) {
                return console.log(err);
            }
            return console.log('999999999999999')
        });
    } else {
      return { tries: globalTries, bills: response }
    }
  })
}

// know if we need to split intervals again
function isBig(message) {
    return !!~message.indexOf('100 resultados')
}

function doSomething(collection, cb) {
    async.eachSeries(collection, countBills, function(err) {
        return cb();
    });
}

// async call to service
function countBills(interval, callback) {
    callService(interval[0], interval[1], function(err, response) {
        if (err) {
            return callback(err);
        }
        console.log(response.body);
        if (isBig(response.body)) {
            var y = createSubintervals(interval[0], interval[1], 'weeks');
            doSomething(y, function() {
                console.log('=0')
                // return callback();
            })
        }
        callback();
    })
}

// create intervals is response isBig
function createSubintervals(start, end, unit) {
    let ints = makeIntervals(start, end, unit);
    let collection = toPairs(ints);
    completeInterval(collection, end);
    return collection;
}


// sometimes our interval need some logic to contain all values, or the last set will be incomplete
function completeInterval(x, end) {
    let lastElement = x[x.length - 1];
    if (typeof lastElement[1] === 'undefined') {
        lastElement.push(moment(end).format('YYYY-MM-DD'));
    }
    if (lastElement[1] !== end) {
        let lastSet = [];
        lastSet.push(moment(lastElement[1]).add(1, 'day').format('YYYY-MM-DD'));
        lastSet.push(moment(end).format('YYYY-MM-DD'));
        x.push(lastSet);
    }
}

// call moment function to split
function makeIntervals(start, end, unit) {
    let r = moment.range(start, end);
    return getInterval(unit, r);
}

// take the interval and create something useful to make the call
// https://stackoverflow.com/questions/31352141/how-do-you-split-an-array-into-array-pairs-in-javascript
function toPairs(array) {
    const evens = array.filter((o, i) => i % 2);
    const odds = array.filter((o, i) => !(i % 2));
    return _.zipWith(evens, odds, (e, o) => e ? [o, e] : [o]);
}

// actual call and increment globalTries
function callService(start, end, callback) {
    console.log('calling', start, end);
    globalTries++;
    request(`http://34.209.24.195/facturas?id=${id}&start=${start}&finish=${end}`, function (error, response, body) {
        return callback(error, response);
    });
}

console.log('x')
getBills(start, end);
