var path = require('path');
var fs = require('fs');

if (!process.env.BACKEND_URL) {
  throw new Error(`
Please run the following before running webpack:

$ export BACKEND_URL=<something>

<something> is one of:
1. https://api.beeline.sg (LIVE)
2. https://beeline-server-dev.herokuapp.com (STAGING)
`)
}

var env = {
    BACKEND_URL: process.env.BACKEND_URL,
}
fs.writeFileSync(`${__dirname}/beeline/env.json`, JSON.stringify(env))

module.exports = {
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html',
        exclude: /node_modules/,
        include: path.resolve('.'),
        query: {
          attrs: false,
        },
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: path.resolve('.'),
      },
    ],
  },
  entry: [
    path.resolve('beeline-driver/app.js'),
  ],
  output: {
    path: path.resolve('www/js'),
    filename: 'bundle.js'
  },
  babel: {
    presets: ['es2015', 'stage-3']
  },
};
