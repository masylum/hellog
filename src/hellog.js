#!/usr/bin/env node

var fs = require('fs')
  , clc = require('cli-color')
  , _ = require('underscore')
  , program = require('commander')

  , VERSION = '0.0.1'
  , PROTOCOL_DIR = __dirname + '/protocols';

/**
 * Gets the available protocols names
 *
 * @return {Array<String>}
 */
function getAvailableProtocolNames() {
  return fs.readdirSync(PROTOCOL_DIR).map(function (file) {
    return file.replace('.js', '');
  });
}

/**
 * Gets the available protocols names
 *
 * TODO: This is hardcode
 *
 * @return {Array<String>}
 */
function getEnabledProtocolNames() {
  return ['http'];
}

/**
 * Requires a given protocol executing the exported protocol
 *
 * @param {String} protocol
 */
function enableProtocol(protocol) {
  try {
    require(PROTOCOL_DIR + '/' + protocol)(program);
  } catch (e) {
    console.log(clc.red.bold('Error enabling the protocol "' + protocol + '": ') + e.message);
    process.exit(1);
  }
}

/**
 * Starts the program
 */
function main() {
  var available_protocols = getAvailableProtocolNames()
    , enabled_protocols = getEnabledProtocolNames();

  _.intersection(available_protocols, enabled_protocols).forEach(enableProtocol);
}

program
  .version(VERSION)
  .usage('[options] [log_path]')
  .option('--http-port <port>', 'Enables HTTP protocol on the given port')
  .option('--http-password <password>', 'Protects the HTTP protocol with a password')
  .parse(process.argv);

main();
