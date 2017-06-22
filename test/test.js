/*globals describe, it*/
var assert = require('assert'),
    sinon = require('sinon'),
    request = require('request'),
    moment = require('moment'),
    bill = require('../index');

describe('lib functions', function() {
    describe('isBig', function() {
        it('should return isBig when response includes "mas de 100"', function() {
            assert.equal(bill.isBig('mas de 100 resultados'), true);
        });
        it('should return false isBig when response does not include "mas de 100"', function() {
            assert.equal(bill.isBig('something else'), false);
        });
    });
    describe('toPairs', function() {
        it('should create arrays of 2 elements', function() {
            var source = [1, 2, 3, 4],
                target = [[1, 2], [3, 4]];
            assert.deepEqual(bill.toPairs(source), target);
        });
    });
    describe('callService', function() {
        it('should call the endpoint and run callback', function() {
            var stubGet = sinon.stub(request, 'get'),
                callback = sinon.spy();
            stubGet.onCall(0).yields(null, 'response');
            bill.callService('2017-01-01', '2017-01-02', callback);
            stubGet.restore();
            assert.equal(callback.calledOnce, true);
        });
    });
});

