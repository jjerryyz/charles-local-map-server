const arg = require("arg");
const {parse} = require('url');

// Reference from https://github.com/vercel/serve/blob/master/bin/serve.js
const parseEndpoint = (str) => {
  if (!isNaN(str)) {
    return [str];
  }

  // We cannot use `new URL` here, otherwise it will not
  // parse the host properly and it would drop support for IPv6.
  const url = parse(str);

  switch (url.protocol) {
  case 'pipe:': {
    // some special handling
    const cutStr = str.replace(/^pipe:/, '');

    if (cutStr.slice(0, 4) !== '\\\\.\\') {
      throw new Error(`Invalid Windows named pipe endpoint: ${str}`);
    }

    return [cutStr];
  }
  case 'unix:':
    if (!url.pathname) {
      throw new Error(`Invalid UNIX domain socket endpoint: ${str}`);
    }

    return [url.pathname];
  case 'tcp:':
    url.port = url.port || '5000';
    return [parseInt(url.port, 10), url.hostname];
  default:
    throw new Error(`Unknown --listen endpoint scheme (protocol): ${url.protocol}`);
  }
};

const args = arg({ 
  "--path": String,
  "--no-header": Boolean,
  "--type": String,
  '--listen': [parseEndpoint],

  // align
  '-l': '--listen',
  '-p': '--listen'
});

// console.log('args',args);

const cwd = process.cwd();
args["--path"] = args["--path"] || args["_"].shift() || cwd;

if (!args["--path"]) {
  console.error("please specific local map files");
}

// console.log('args',args);

module.exports = args;
