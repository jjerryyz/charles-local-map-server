const e = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const arg = require('arg');
const os = require('os');

const args = arg({'--path': String});

const MOCK_LOCAL_FILES_PATH = args['--path'] || args['_'].shift() || '';

if (!MOCK_LOCAL_FILES_PATH) {
  console.error('please specific local map files');
}

router.all('/*', function(req, res, next) {

  // console.log('req', req.query, req.path);
  let fileQueryStr = Object.keys(req.query).reduce((prev, current) => {
    const value = req.query[current];
    if (!!prev) prev += '&'
    return `${prev}${current}=${value}`;
  }, '');

  let reqPath = req.path;
  if (os.platform() === 'win32') {
    reqPath = reqPath.replace(/\\/g, '\/');
  }

  let filePath;
  if (!!fileQueryStr) {
    fileQueryStr = '?' + fileQueryStr;
    filePath = reqPath + encodeURIComponent(fileQueryStr);
  } else {
    filePath = reqPath;
  }
  filePath = MOCK_LOCAL_FILES_PATH + filePath
  // console.log('filePath', filePath);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (!err) {
      res.status(200).json(JSON.parse(data));
    } else {
      res.end();
      // console.log('read', err, data);
    }
  })
});

module.exports = router;
