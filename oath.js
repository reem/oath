var oath = {};

(function (exports) {
  var future = {}, rejected = {}, resolved = {}, waiting  = {};

  var Promise = function () {
    this.value  = future;
    this.status = waiting;
    _.bindAll(this, 'then', 'fail', 'fulfill', 'abandon');
  };

  Promise.prototype.then = function (success) {
    if (this.owed) {
      throw new Error("Tried to then a promise twice.");
    }

    this.owed = success;
    this.next = defer();

    if (this.status === resolved) {
      this.next.resolve(this.owed(this.value));
    }

    return this.next.promise;
  };

  Promise.prototype.fail = function (failure) {
    if (this.onFail) {
      throw new Error("Tried to fail a promise twice.");
    }

    this.onFail = failure;

    if (this.status === rejected) {
      this.onFail(this.value);
    }
  };

  Promise.prototype.fulfill = function (data) {
    if (this.status !== waiting) {
      throw new Error("Tried to fulfill a promise twice.");
    }

    this.status = resolved;
    if (this.owed) {
      this.value = this.owed(data);
      if (this.value && this.value.then) {

        this.value.then(this.next.resolve);
        // Interrupt a success chain with a failure.
        this.value.fail(this.next.reject);
      }
    }
  };

  Promise.prototype.abandon = function (error) {
    this.status = rejected;
    if (this.onFail) {
      this.value = error;
      this.onFail(error);
    } else {
      if (this.next) {
        // Propagate failure
        this.next.reject(error);
      }
    }
  };

  var Deferred = function (promise) {
    this.promise = promise;
    _.bindAll(this, 'resolve', 'reject');
  };

  Deferred.prototype.resolve = function (data) {
    this.promise.fulfill(data);
  };

  Deferred.prototype.reject = function (error) {
    this.promise.abandon(error);
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
