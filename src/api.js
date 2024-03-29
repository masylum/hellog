var fs = require('fs');

function API(config) {
  var api = {};

  // Errors
  api.UNAUTHORIZED = 1;
  api.BAD_REQUEST = 2;

  /**
   * Returns wether the API user
   * is authorized to user it or not.
   *
   * TODO: Implement better security
   *
   * @param {Object} options
   * @return {Boolean}
   */
  function authorize(options) {
    return config.password === options.password;
  }

  /**
   * Streams the contents of the log
   *
   * Options:
   *   - tail: Starts from the bottom
   *   - count: Number of records to stream
   *   - grep: Terms to filter the logs
   *   - password: A password that will be used to authorize the current user
   *
   * Callbacks:
   *   - error {Error}: Any error happened on the stream creation
   *   - stream {ReadStream}: A log readable stream
   *
   * @param {Object} options
   * @param {Function} callback
   */
  api.stream = function stream(options, callback) {
    if (!authorize(options)) {
      return callback(api.UNAUTHORIZED);
    }

    var stream_options = {encoding: 'utf-8'}
      , fs_stream;

    // if (options.tail) {
    // }

    // if (options.count) {
    // }

    // if (options.grep) {
    // }

    function createStream() {
      fs_stream = require('growing-file').open(config.log_path, {
        timeout: config.timeout || Infinity
      , interval: config.interval || 100
      });
      callback(null, fs_stream);
    }

    function touchFile() {
      fs.writeFile(config.log_path, '', function (error) {
        if (error) {
          return callback(error);
        }
        createStream();
      });
    }

    fs.stat(config.log_path, function (error, stats) {
      if (error) {
        if (error.code === 'ENOENT') {
          touchFile();
        } else {
          callback(error);
        }
      } else {
        createStream();
      }
    });
  };

  /**
   * Appends a given message to the log
   *
   * Options:
   *   - password: A password that will be used to authorize the current user
   *
   * Callbacks:
   *   - error {Error}: Any error happened on the stream creation
   *
   * @param {String} body
   * @param {Object} options
   * @param {Function} callback
   */
  api.append = function append(body, options, callback) {
    if (!authorize(options)) {
      return callback(api.UNAUTHORIZED);
    }

    if (!body.length) {
      return callback(api.BAD_REQUEST);
    }

    function onOpen(err, fd) {
      if (err) {
        console.log(err); // TODO: Handle!
        return callback(err);
      }

      fs.write(fd, body + '\n', null, 'utf8', function onWrite() {
        fs.close(fd, callback);
      });
    }

    fs.open(config.log_path, 'a', onOpen);
  };

  /**
   * Truncates the contents of the log
   *
   * Options:
   *   - password: A password that will be used to authorize the current user
   *
   * Callbacks:
   *   - error {Error}: Any error happened on the stream creation
   *
   * @param {String} body
   * @param {Object} options
   * @param {Function} callback
   */
  api.truncate = function truncate(options, callback) {
    if (!authorize(options)) {
      return callback(api.UNAUTHORIZED);
    }

    fs.writeFile(config.log_path, '', function onWrite(err) {
      if (err) {
        console.log(err); // TODO: Handle!
      }
      callback(err);
    });
  };

  return api;
}

module.exports = API;
