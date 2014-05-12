var oath = {};

(function (exports) {
  var Promise = function () {

  };

  Promise.prototype.then = function () {

  };

  Promise.prototype.fail = function () {

  };

  var Deferred = function () {

  };

  Deferred.prototype.reject = function(error) {
    
  };

  Deferred.prototype.resolve = function(value) {
    
  };

  var defer = function () {
    return new Deferred(new Promise());
  };

  var failable = function (nodeStyle, error, success) {
    nodeStyle(function (err, data) {
      if (err) {
        error(err);
      } else {
        success(data);
      }
    });
  };

  var promisify = function (nodeStyle, context) {
    return function () {
      var args = _.toArray(arguments);
      var deferred = defer();
      failable(
        function (cb) { nodeStyle.apply(context, args.concat([cb])); },
        deferred.reject,
        deferred.resolve
      );
      return deferred.promise;
    };
  };

  _.extend(exports, {
    defer: defer,
    promisify: promisify
  });
}(oath));
