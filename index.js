#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const package_json = path.resolve('./package.json');
const tsconfig_json = path.resolve('./tsconfig.json');
const webpack_config_js = path.resolve('./webpack.config.js');
const execSync = require('child_process').execSync;

// webpack 1.x
const webpack_config = `module.exports = {
  entry: './index.ts',
  output: {
    filename: './app.[hash].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}`;

if (!fs.existsSync(package_json)) {
  console.log('Initializing package.json');
  execSync('npm init -y');
}

console.log('Installing packages. This might take a couple minutes.');
execSync('npm install webpack webpack-dev-server ts-loader typescript --save-dev');

if (!fs.existsSync(tsconfig_json)) {
  console.log('Creating tsconfig.json');
  execSync('tsc --init');
}

const tsconfig = require(tsconfig_json);
if (!tsconfig.compilerOptions || ! tsconfig.compilerOptions.lib) {
  tsconfig["compilerOptions"]["lib"] = ["dom", "es2015.promise", "es5"];
}

console.log('Updating tsconfig.json');
fs.writeFileSync(
  tsconfig_json,
  JSON.stringify(tsconfig, null, 2)
);

RegExp.prototype.toJSON = RegExp.prototype.toString;
if (!fs.existsSync(webpack_config_js)) {
  console.log('Creating webpack.config.js');
  fs.writeFileSync(
    webpack_config_js,
    webpack_config
  );
}

console.log('Adding npm scripts');
const package_info = require(package_json);
if (!package_info.scripts || ! package_info.scripts['dev']) {
  package_info["scripts"]["dev"] = 'webpack-dev-server --inline --hot';
}
if (!package_info.scripts || ! package_info.scripts['build:prod']) {
  package_info["scripts"]["build:prod"] = 'webpack -p';
}

fs.writeFileSync(
  package_json,
  JSON.stringify(package_info, null, 2)
);