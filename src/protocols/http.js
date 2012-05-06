function HTTP(program) {
  var http = require('http')
    , querystring = require('querystring')
    , clc = require('cli-color')
    , api;

  if (!program.httpPort) {
    throw Error('No HTTP port given!');
  }

  api = require('../api')({
    password: program.httpPassword
  , log_path: program.args[0]
  });

  /**
   * Writes the response to the Response Stream
   *
   * @param {http.ServerResponse} res
   * @param {Number} status_code
   * @param {String} body
   */
  function respond(res, status_code, body) {
    body = typeof body === 'string' ? body : JSON.stringify(body);

    res.writeHead(status_code, {
      'Content-Type': 'application/json'
    , 'Content-Length': body.length
    });
    res.end(body);
  }

  /**
   * Buffers a request and callbacks
   *
   * @param {http.ServerRequest} req
   * @param {Function} callback
   */
  function bufferRequest(req, callback) {
    var data = '';

    req.setEncoding('utf-8');
    req.on('data', function onData(chunk) {
      data += chunk;
    });

    req.on('end', function onEnd() {
      callback(querystring.parse(data));
    });
  }

  /**
   * Response to a truncate request
   *
   * @param {http.ServerResponse} res
   * @param {Object} options
   */
  function truncate(res, options) {
    api.truncate(options, function (err) {
      if (err) {
        if (api.UNAUTHORIZED) {
          respond(res, 401, {error: 'Unauthorized: Unknown HTTP route'});
        } else {
          respond(res, 500, {error: 'Internal server error'});
        }
      } else {
        respond(res, 200, '{}');
      }
    });
  }

  /**
   * Response to an append request
   *
   * @param {http.ServerResponse} res
   * @param {String} body
   * @param {Object} options
   */
  function append(res, body, options) {
    api.append(body, options, function (err) {
      if (err) {
        switch (err) {
        case api.UNAUTHORIZED:
          return respond(res, 401, {error: 'Unauthorized: Unknown HTTP route'});
        case api.BAD_REQUEST:
          return respond(res, 400, {error: 'Bad request: The provided log was either incorrect or too big'});
        default:
          return respond(res, 500, {error: 'Internal server error'});
        }
      } else {
        respond(res, 201, '{}');
      }
    });
  }

  /**
   * Streams the log stream to the HTTP response
   *
   * @param {http.ServerResponse} res
   */
  function stream(res, options) {
    api.stream(options, function (error, stream) {
      if (error) {
        console.log(error); // TODO: Implement a internal logger
        return respond(res, 500, {error: 'Internal server error: ' + error.message });
      }

      res.writeHead(200, {'Content-Type': 'application/json'});

      stream.pipe(res, {end: false});
    });
  }

  /**
   * Response to an unknown HTTP route
   *
   * @param {http.ServerResponse} res
   */
  function unknownHttpRoute(res) {
    respond(res, 404, {error: 'Unknown HTTP route'});
  }

  /**
   * HTTP listener
   *
   * @param {http.ServerRequest} req
   * @param {http.ServerResponse} res
   */
  function requestListener(req, res) {
    var method_and_url = [req.method, req.url].join(' ')
      , options = require('url').parse(req.url, true).query;

    switch (method_and_url) {
    case 'POST /':
      bufferRequest(req, function (data) {
        append(res, data.message, options);
      });
      break;
    case 'PUT /':
      truncate(res, options);
      break;
    case 'GET /':
      stream(res, options);
      break;
    case 'GET /tail':
      options.tail = true;

      stream(res, options);
      break;
    default:
      unknownHttpRoute(res);
    }
  }

  http.createServer(requestListener).listen(program.httpPort);
  console.log(clc.green('HTTP protocol enabled at port: ' + clc.yellow(program.httpPort)));
}

module.exports = HTTP;
