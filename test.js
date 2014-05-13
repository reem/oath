var expect = chai.expect;
var assert = chai.assert;

var promiseTimeout = function (func, time) {
  var defer = oath.defer();
  setTimeout(function () {
    defer.resolve(func());
  }, time);
  return defer.promise;
};

describe('Oath', function () {
  describe('then', function () {
    it('Should call then on a promise resolution.', function (done) {
      promiseTimeout(function () {}, 5)
        .then(done);
    });

    it('Should pass a resolved value to then.', function (done) {
      var makePromise = function (num) {
        return promiseTimeout(function () {
          return num;
        });
      };
      makePromise(6)
        .then(function (num) {
          expect(num).to.equal(6);
          done();
        });
    });
  });

  describe('fail', function () {
    it('Should call fail on a rejection.', function (done) {
      var failingPromise = function () {
        var defer = oath.defer();
        setTimeout(function () {
          defer.reject();
        }, 5);
        return defer.promise;
      };
      failingPromise()
        .fail(function () {
          done();
        });
    });

    it('Should call fail with the error passed to .reject.', function (done) {
      var failingPromise = function () {
        var defer = oath.defer();
        setTimeout(function () {
          defer.reject("Oh no!");
        }, 5);
        return defer.promise;
      };
      failingPromise()
        .fail(function (err) {
          expect(err).to.equal("Oh no!");
          done();
        });
    });
  });

  describe('promisify', function () {
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
    it('Should call then on success.', function (done) {
      promised(bigEnough)
        .then(function (message) {
          expect(message).to.equal("That's a big number!");
          done();
        });
    });

    it('Should call fail on error.', function (done) {
      promised(tooSmall)
        .fail(function (message) {
          expect(message).to.equal("Not big enough!");
          done();
        });
    });
  });

  describe('chaining', function () {
    it('Should allow you to chain promises using then.', function (done) {
      var step1 = function (num) {
        return promiseTimeout(function () {
          return num + 10;
        }, 5);
      };

      var step2 = function (num) {
        return promiseTimeout(function () {
          return num + 20;
        }, 5);
      };

      step1(100).then(step2).then(function (num) {
        expect(num).to.equal(130);
        done();
      });
    });

    it('Should jump directly to fail if an error is thrown during chaining.', function (done) {
      var step1 = function (num) {
        return promiseTimeout(function () {
          return num + 10;
        }, 5);
      };

      var failingStep = function (num) {
        var defer = oath.defer();
        setTimeout(function () {
          defer.reject("Oops!");
        }, 5);
        return defer.promise;
      };

      var didItRun = false;
      var shouldntRun = function (num) {
        var defer = oath.defer();
        didItRun = true;
        setTimeout(_.partial(defer.resolve.bind(defer), num), 5);
        return defer.promise;
      };

      step1(100).then(failingStep).then(shouldntRun).fail(function errorOut(err) {
        expect(err).to.equal("Oops!");
        expect(didItRun).to.equal(false);
        done();
      });
    });
  });
});
