module.exports.parseQueryToStr = function(reqQuery) {
  let queryStr = Object.keys(reqQuery)
  .filter(key => key !== '_t')
  .reduce((prev, current) => {
    const value = reqQuery[current];
    if (!!prev) prev += "&";
    return `${prev}${current}=${value}`;
  }, "");
  return queryStr;
}