const fs = require("fs");
const path = require("path");
const os = require("os");
const argObj = require('../utils/parse-arg');

module.exports = function(req, res, next) {
  
  console.log('handle-local-map-file');

  if (req.method === 'OPTIONS') {
    return res.status(200).send(Buffer.from('OPTIONS returns OK', 'utf8'));
  }

  let fileQueryStr = Object.keys(req.query)
  .filter(key => key !== '_t')
  .reduce((prev, current) => {
    const value = req.query[current];
    if (!!prev) prev += "&";
    return `${prev}${current}=${value}`;
  }, "");

  let reqPath = req.path;
  if (os.platform() === "win32") {
    reqPath = reqPath.replace(/\\/g, "/");
  }

  let filePath;
  if (!!fileQueryStr) {
    fileQueryStr = "?" + fileQueryStr;
    filePath = reqPath + encodeURIComponent(fileQueryStr);
  } else {
    filePath = reqPath;
  }
  filePath = argObj['--path'] + filePath;
  console.log('filePath', filePath);

  let fileDir, fileName;
  const lastSlashIndex = filePath.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    fileDir = filePath.slice(0, lastSlashIndex);
    fileName = filePath.slice(lastSlashIndex, -1);
  }
  // console.log('fileDir', fileDir, fileName);

  fs.readdir(fileDir, 'utf8', (err, files) => {
    if (err) {
      return res.end();
    }
    if (!files.length) {
      return res.end(); 
    }
    const f = files.find( f => f.indexOf(fileName));
    if (!f) {
      return res.end();
    } else {
      readFile( fileDir + '/' + f);
    }
  });

  const readFile = (path) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (!err) {
        try {
          res.status(200).json(JSON.parse(data));
        } catch(e) {
          res.status(200).send(data);
        }
      } else {
        res.end();
        // console.log('read', err, data);
      }
    });
  }

}