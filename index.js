// import node dependencies
var Moment = require('moment'),
    MomentRange = require('moment-range'),
    request = require('request'),
    async = require('async'),
    _ = require('lodash'),
    inquirer = require('inquirer');

var moment = MomentRange.extendMoment(Moment);

// declare vars that will be in the scope of our functions
var start = moment('2017-1-1', 'YYYY-MM-DD').format('YYYY-MM-DD'),
    end   = moment('2017-12-31', 'YYYY-MM-DD').format('YYYY-MM-DD'),
    id = '717f076e-e13c-45b4-bcc4-51c229e1b326',
    someNewIntervals = [];

// global counters to return
var globalBills = 0,
    globalTries = 0;


// read input from user
var prompt = [
    {
        type: 'input',
        name: 'start',
        message: 'From: ',
        default: '2017-01-01',
        validate: function(value) {
            if (moment(value, 'YYYY-MM-DD').isValid()) {
                return true;
            }
            return 'Please enter a valid date';
        }
    },
    {
        type: 'input',
        name: 'end',
        message: 'To: ',
        default: '2017-12-31',
        validate: function(value) {
            if (moment(value, 'YYYY-MM-DD').isValid()) {
                return true;
            }
            return 'Please enter a valid date';
        }
    }
];

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
            callSubintervals(someNewIntervals, function() {
                return console.log({ tries: globalTries, bills: globalBills })
            })
        });
    } else {
      return { tries: globalTries, bills: response }
    }
  })
}

function callSubintervals(ints, callback) {
    doSomething(ints, function() {
        callback();
    })
}

// know if we need to split intervals again
function isBig(message) {
    return !!~message.indexOf('100 resultados')
}

function doSomething(collection, cb) {
    async.each(collection, countBills, function(err) {
        return cb();
    });
}

// async call to service
function countBills(interval, callback) {
    callService(interval[0], interval[1], function(err, response) {
        if (err) {
            return callback(err);
        }
        if (isBig(response.body)) {
            var y = createSubintervals(interval[0], interval[1], 'weeks');
            someNewIntervals = someNewIntervals.concat(y);
        }
        callback();
    })
}

// create intervals is response isBig
function createSubintervals(start, end, unit) {
    var ints = makeIntervals(start, end, unit);
    var collection = toPairs(ints);
    completeInterval(collection, end);
    collection = collection.concat(addLostIntervals(collection));
    return collection;
}

function addLostIntervals(intervals) {
    var lostIntervals = []
    for (var i = 0; i <= intervals.length -2; i++) {
        var diff = findDateDiff(intervals[i][1], intervals[i+1][0]);
        if (diff) {
            lostIntervals.push(findMissingInterval(intervals[i][1], diff));
        }
    }
    return lostIntervals;
}

function findDateDiff(a, b) {
    return moment(b).diff(moment(a), 'days');
}

function findMissingInterval(a, b) {
    var interval = [];
    interval.push(moment(a).add(1, 'days').format('YYYY-MM-DD'));
    interval.push(moment(a).add(b - 1, 'days').format('YYYY-MM-DD'));
    return interval;
}

// sometimes our interval need some logic to contain all values, or the last set will be incomplete
function completeInterval(x, end) {
    var lastElement = x[x.length - 1];
    if (typeof lastElement[1] === 'undefined') {
        lastElement.push(moment(end).format('YYYY-MM-DD'));
    }
    if (lastElement[1] !== end) {
        var lastSet = [];
        lastSet.push(moment(lastElement[1]).add(1, 'day').format('YYYY-MM-DD'));
        lastSet.push(moment(end).format('YYYY-MM-DD'));
        x.push(lastSet);
    }
}

// call moment function to split
function makeIntervals(start, end, unit) {
    var r = moment.range(start, end);
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
        if (Number.isInteger(parseInt(response.body))) {
            globalBills = globalBills + parseInt(response.body);
        }
        return callback(error, response);
    });
}

inquirer.prompt(prompt).then(function(answers) {
    var startDate = moment(answers.start, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        endDate = moment(answers.end, 'YYYY-MM-DD').format('YYYY-MM-DD');
        getBills(startDate, endDate);
})


module.exports = {
    toPairs: toPairs,
    makeIntervals: makeIntervals,
    completeInterval: completeInterval,
    findMissingInterval: findMissingInterval,
    findDateDiff: findDateDiff,
    createSubintervals: createSubintervals,
    isBig: isBig,
    doSomething: doSomething,
    getInterval: getInterval
}
