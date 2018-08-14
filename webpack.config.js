var path = require('path');
var fs = require('fs');

const production = process.env.NODE_ENV === 'production'

let env

if (production) {
  env = {
    BACKEND_URL: 'https://api.beeline.sg',
    TRACKING_URL: 'https://tracking.beeline.sg',
  }
} else {
  env = {
    BACKEND_URL: process.env.BACKEND_URL || 'https://api-staging.beeline.sg',
    TRACKING_URL: process.env.TRACKING_URL || 'https://tracking-staging.beeline.sg'
  }
}

console.log(`
BACKEND_URL is ${env.BACKEND_URL}
`)

console.log(`
TRACKING_URL is ${env.TRACKING_URL}
`)

fs.writeFileSync(`${__dirname}/beeline-driver/env.json`, JSON.stringify(env))

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
      {
        test: /\.json$/,
        loader: 'json',
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
