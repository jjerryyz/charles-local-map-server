const express = require("express");
const handleChlsj = require("../service/handle-chlsj");
const handleLocalMapFile = require('../service/handle-local-map-file');
const router = express.Router();
const argObj = require("../utils/parse-arg");

router.all("/*", function (req, res, next) {
  console.log('path', argObj['--path']);
  if (!argObj['--path']) {
    return;
  }
  if (argObj['--type'] === 'localMapFile') {
    handleLocalMapFile(req,res,next);
  } else {
    handleChlsj(req,res,next);
  }
});

module.exports = router;
