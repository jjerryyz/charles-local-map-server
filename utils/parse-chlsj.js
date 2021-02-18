
const argObj = require('../utils/parse-arg');
const chlsjFilePath = argObj['--path'];

const fs = require("fs");
const path = require("path");

const BAD_HEADER = [':status']

let recordJsonArray = [];
if (!!chlsjFilePath) {
  fs.readFile(chlsjFilePath, "utf8", (err, data) => {
    if (!err) {
      recordJsonArray = JSON.parse(data) || [];
      recordJsonArray = recordJsonArray.map(item => {
        const {request, response, host, query, path, method} = item;
  
        const headers = response.header && response.header.headers && response.header.headers.filter( h => BAD_HEADER.indexOf(h.name.toLowerCase()) === -1) || [];
        response.header = {headers}
  
        return {request, response, host, query, path, method};
      })
      // console.log('recordJsonArray[0', recordJsonArray.find( r => r.path === '/app-web/pnshk/decorate/home'));
    } else {
      console.error('read chlsj fail', err);
    }
  });
}

function findRecord(host, path, query, method) {
  console.log('findRecord', host, path, query, method);
  const target = recordJsonArray.find( item => {
    // if (item.host !== host) return false;
    if (item.method !== method) return false;
    if (!!path && item.path !== path) return false;
    if (!!query && item.query !== query) return false;
    return true;
  });
  return target || {};
}

module.exports = {
  findRecord
}