const argObj = require("../utils/parse-arg");
const { findRecord } = require("../utils/parse-chlsj");
const { parseQueryToStr } = require("../utils/utils");

module.exports = function(req, res, next) {
  const record = findRecord(
    req.hostname,
    req.path,
    parseQueryToStr(req.query),
    req.method
  );
  // console.log('record', record);
  if (!record) return res.end();

  const recordResponse = record.response || {};

  if (!argObj['--no-header']) {
    const headers =
      (recordResponse.header && recordResponse.header.headers) || [];
    if (headers.length > 0) {
      headers.forEach((h) => {
        res.setHeader(h.name, h.value);
      });
    }
  }

  const mimeType = recordResponse.mimeType;
  const body = recordResponse.body || {};

  if (Object.keys(body).length == 0) return res.end();

  if (mimeType === "application/json") {
    res.status(200).send(JSON.parse(body.text));
  } else if (mimeType === 'image/jpeg') {
    res.status(200).send(Buffer.from(body.encoded, body))
  } else {
    res.status(200).send(body.text);
  }
}