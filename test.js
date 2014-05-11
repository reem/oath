var oath = require('./oath.js');

var chai = require('chai');
var expect = chai.expect();
var assert = chai.asser();

describe('Oath', function () {
  it('Should call then with the right value when a promise is resolved.', function () {
    it('Should call then on a promise resolution.', function (done) {
      var makePromise = function () {
        var defer = oath.defer();
        setTimeout(function () {
          defer.resolve();
        }, 50);
        return defer;
      };
      makePromise()
        .then(done());
    });

    it('Should pass a resolved value to then.', function (done) {
      var makePromise = function (num) {
        var defer = oath.defer();
        setTimeout(function () {
          defer.resolve(num);
        }, 50);
        return defer;
      };
      makePromise(6)
        .then(function (num) {
          expect(num).to.equal(6);
          done();
        });
    });  
  });

  it('Should call fail with the error if a promise is rejected.', function (done) {
    it('Should call fail on a rejection.', function () {
      var failingPromise = function () {
        var defer = oath.defer();
        setTimeout(function () {
          defer.reject();
        }, 50);
        return defer;
      };
      failingPromise()
        .fail(function () {
          done();
        });
    });

    it('Should call fail with the error passed to .reject.', function () {
      var failingPromise = function () {
        var defer = oath.defer();
        setTimeout(function () {
          defer.reject("Oh no!");
        }, 50);
        return defer;
      };
      failingPromise()
        .fail(function (err) {
          expect(err).to.equal("Oh no!");
          done();
        });
    });
  });

  it('Should promisifiy functions with node-style callbacks.', function () {
    var bigEnough = 100;
    var tooSmall = 10;
    var nodeStyle = function (num, callback) {
      setTimeout(function () {
        if (num > 50) {
          callback(null, "That's a big number!");
        } else {
          callback("Not big enough!", null);
        }
      });
    };

    var promised = oath.promisify(nodeStyle);
    describe("promised", function () {
      it('Should call then on success.', function (done) {
        promised(bigEnough)
          .then(function (message) {
            expect(message).to.equal("That's a big number!");
            done();
          });
      });

      it('Should call fail on error.', function (done) {
        promised(tooSmall)
          .then(function (message) {
            expect(message).to.equal("Not big enough!");
          });
      });
    });
  });

  it('Should allow you to chain promises using then.', function (done) {
    var step1 = function (num) {
      var defer = oath.defer();
      setTimeout(function () {
        defer.resolve(num + 10);
      }, 50);
      return defer.promise;
    };

    var step2 = function (num) {
      var defer = oath.defer();
      setTimeout(function () {
        defer.resolve(num + 20);
      }, 50);
      return defer.promise;
    };

    step1(100).then(step2).then(function (num) {
      expect(num).to.equal(130);
      done();
    });
  });

  it('Should jump directly to fail if an error is thrown during chaining.', function (done) {
    var step1 = function (num) {
      var defer = oath.defer();
      setTimeout(function () {
        defer.resolve(num + 10);
      }, 50);
      return defer.promise;
    };

    var failingStep = function (num) {
      var defer = oath.defer();
      setTimeout(function () {
        defer.reject("Oops!");
      }, 50);
      return defer.promise;
    };

    var didItRun = false;
    var shouldntRun = function (num) {
      var defer = oath.defer();
      didItRun = true;
      setTimeout(_.partial(defer.resolve.bind(defer), num), 50);
      return defer.promise;
    };

    step1(100).then(failingStep).then(shouldntRun).fail(function (err) {
      expect(err).to.equal("Oops!");
      expect(didItRun).to.equal(false);
      done();
    });
  });
});