# Hellog

Hellog is a centralized log server that supports different protocols.

Use it to store, grep and stream the contents of your logs.

## Installation

You must have node and npm installed.

```
npm install -g hellog
```

## Usage

To start hellog just run

```
hellog [options] log-path
```

### Core API

Hellog contains a core API that is used by the protocol implementations.

  - `truncate(options, callback)`: Truncates the contents of the log

    Options:
      - password: A password that will be used to authorize the current user

    Callbacks:
      - error {Error}: Any error happened while truncating the logs content

  - `append(body, options, callback)`: Appends a message to the log

    Options:
      - password: A password that will be used to authorize the current user

    Callbacks:
      - error {Error}: Any error happened on the stream creation

  - `stream(options, callback)`: Streams the contents of the log

    Options:
      - tail: Starts from the bottom
      - count: Number of records to stream
      - grep: Terms to filter the logs
      - password: A password that will be used to authorize the current user

    Callbacks:
      - error {Error}: Any error happened on the stream creation
      - stream {ReadStream}: The logs readable stream

Hellog currently supports HTTP, TCP and Websockets protocols:

### HTTP

To enable HTTP your just need to pass the option `--http-port` and it will starting listening HTTP messages on that port.
You can secure your HTTP communications by using the option `--http-password`

#### HTTP API

  - `POST /`

    Appends a log message.

    Parameters:
      - `message`: The message you want to append

    Response Codes:
      - `201` The log was appended correctly.
      - `401` A password is needed and it was not provided or incorrect.
      - `400` The log was either empty or too big (TODO: maximum size?).
      - `500` There was some problem with hellog. You should report those.

  - `GET /?[grep=]`

    Streams the contents of the log.

    Response Codes:
      - `200` The log was retrieved succesfully
      - `401` A password is needed and it was not provided or incorrect.
      - `500` There was some problem with hellog. You should report those.

  - `GET /tail?[count=][&grep=]`

    Streams the contents of the log starting from the bottom.

    Response Codes:
      - `200` The log was retrieved succesfully
      - `401` A password is needed and it was not provided or incorrect.
      - `500` There was some problem with hellog. You should report those.

  - `PUT /`

    Truncates the log file contents.

    Response Codes:
      - `200` The log was truncated correctly.
      - `401` A password is needed and it was not provided or incorrect.
      - `500` There was some problem with hellog. You should report those.

### TCP

To enable TCP you just need to pass the option `--tcp-port` and it will starting listening messages on that port.

#### TCP API

### Websocket

To enable the Websocket protocol you just need to pass the option `--websocket-port` and it will starting listening messages on that port.

#### Websockets API
