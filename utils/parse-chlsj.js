const fs = require("fs");
const load = require("./load");

const BAD_HEADER = [":status"];

let recordJsonArray = [];

async function getRecordsFromFile(filePath) {
  if (!filePath) {
    return;
  }

  let loadRes;
  try {
    loadRes = await load(filePath);
  } catch (error) {
    return console.error("getRecordsFromFile, error", error);
  }
  console.log('loadRes',filePath, loadRes.getState().length);
  recordJsonArray = (loadRes.getState() || []).map((item) => {
    const { request, response, host, query, path, method } = item;

    const headers =
      response.header &&
      response.header.headers &&
      response.header.headers.filter(
        (h) => BAD_HEADER.indexOf(h.name.toLowerCase()) === -1
      );
    response.header = { headers: headers || [] };

    return { request, response, host, query, path, method };
  });
}

function findRecord(host, path, query, method) {
  console.log("findRecord", host, path, query, method);
  console.log('recordJsonArray.length', recordJsonArray.length);
  const target = recordJsonArray.find((item) => {
    // if (item.host !== host) return false;
    if (item.method !== method) return false;
    if (!!path && item.path !== path) return false;
    if (!!query && item.query !== query) return false;
    return true;
  });
  // console.log('findRecord, target', target);

  return target || {};
}

module.exports = {
  getRecordsFromFile,
  findRecord,
};
