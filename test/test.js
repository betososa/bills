/*globals describe, it*/
var assert = require('assert'),
    sinon = require('sinon'),
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
    
});
