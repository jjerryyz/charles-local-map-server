const express = require("express");
const router = express.Router();
const { getRecordsFromFile } = require("../utils/parse-chlsj");
const handleChlsj = require("../service/handle-chlsj");
const handleLocalMapFile = require('../service/handle-local-map-file');
const argObj = require("../utils/parse-arg");

if (argObj['--type'] === 'chlsj') {
  getRecordsFromFile(argObj['--path']);
}

router.all("/*", function (req, res, next) {
  if (argObj['--type'] === 'localMapFile') {
    handleLocalMapFile(req,res,next);
  } else {
    handleChlsj(req,res,next);
  }
});

module.exports = router;
