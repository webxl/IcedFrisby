var frisby = require('../lib/icedfrisby');
var mockRequest = require('mock-request');

// Mock API

var mockFn1 = mockRequest.mock()
    .get('/1')
    .respond({ statusCode: 200, body: { i: 1 } })
    .run();

var mockFn2 = mockRequest.mock()
    .get('/2')
    .respond({ statusCode: 200, body: { i: 5 } })
    .run();

var mockFn3 = mockRequest.mock()
    .get('/3')
    .respond({ statusCode: 200, body: { i: 3 } })
    .run();

function addFn(prev, curr) {
  return (prev || 0) + curr;
}
function subtractFn(prev, curr) {
  return (prev || 0) - curr;
}

frisby.create("Get data from route #1")
    .get('http://mock-request/1', {mock: mockFn1})
    .expectStatus(200)
    .afterJSON(function (json) {
      return json.i;
    })
    .chain()
    .create("Add data from route #2", addFn)
    .get('http://mock-request/2', {mock: mockFn2})
    .expectStatus(200)
    .afterJSON(function (json) {
      return json.i;
    })
    .chain()
    .create("Subtract data from route #3", subtractFn)
    .get('http://mock-request/3', {mock: mockFn3})
    .expectStatus(200)
    .afterJSON(function (json) {
      return json.i;
    })
    .tossChain()
    .then(function (testResults) {
      describe("Frisby chain test", function () {
        it('should run chained tests sequentially and return results from each', function () {

          var finalVal = testResults[2];

          expect(testResults.length).to.equal(3);
          expect(finalVal).to.equal(3);

        });
      });
    });

/*

// alternate ("unchained") deferred syntax

var reduceFn = function (prev, curr) {
  if (!curr) return prev;
  return (prev || 0) + curr;
};

var t1 = frisby.create(" #1")
  .get('http://mock-request/1', {mock: mockFn1})
  .expectStatus(200)
  .afterJSON(function (json) {
    return json.i;
  })
  .deferredToss(reduceFn);

var t2 = frisby.create(" #2")
  .get('http://mock-request/2', {mock: mockFn2})
  .expectStatus(200)
  .afterJSON(function (json) {
    return json.i;
  })
  .deferredToss(reduceFn);

frisby.tossAll([t1, t2], function (val) {
  // console.log('cb val:' + val);
}).then(function (finalVal) {
  describe("Frisby wait test", function () {
    it('should wait between tests using deferredToss', function () {
      
      //console.log('it cb final:' + finalVal);
      
      expect(finalVal.join(',')).to.equal('1,6');

      // chai-as-promised, use this above describe: var result = frisby.tossAll(...
      //return result.should.eventually.equal([ 1, 6]);

    });
  });
});
*/
