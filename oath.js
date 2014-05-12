var oath = {};

(function (exports) {
  var future = {}, rejected = {}, resolved = {}, waiting  = {};

  var Promise = function (value, status) {

  };

  Promise.prototype.then = function (success, optFailure) {

  };

  Promise.prototype.fail = function (failure) {

  };

  Promise.prototype.fulfill = function (data, force) {

  };

  Promise.prototype.abandon = function (error, force) {

  };

  var Deferred = function (promise) {

  };

  Deferred.prototype.resolve = function (data) {

  };

  Deferred.prototype.reject = function (error) {

  };

  var defer = function () {

  };

  var failable = function (nodeStyle, error, success) {

  };

  var promisify = function (nodeStyle, context) {

  };

  Promise.resolved = function (value) {

  };

  Promise.rejected = function (value) {

  };

  _.extend(exports, {
    defer: defer,
    promisify: promisify,
    resolved: Promise.resolved,
    rejected: Promise.rejected
  });
}(oath));
