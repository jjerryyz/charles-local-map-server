const chalk = require('chalk');
const arg = require("arg");
const readPkgUp = require('read-pkg-up');
const {parse} = require('url');
const path = require('path');
const parentDir = path.dirname(module.parent && module.parent.filename ? module.parent.filename : '.');

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
// Reference from https://github.com/vercel/serve/blob/master/bin/serve.js
const getHelp = () => chalk`
  {bold.cyan charles-mock-server} - Mock server for charles files
  {bold USAGE}
      {bold $} {cyan charles-mock-server} --help
      {bold $} {cyan charles-mock-server} --version
      {bold $} {cyan charles-mock-server} [-p {underline listen_port}] [{underline file path}]
      By default, {cyan charles-mock-server} will listen on {bold 0.0.0.0:5000} and serve the
      current working directory on that address.
      Specifying a single {bold --listen} argument will overwrite the default, not supplement it.
  {bold OPTIONS}
      --help                              Shows this help message
      -v, --version                       Displays the current version of serve
      -p, --listen {underline listen_uri}             Specify a URI endpoint on which to listen (see below) -
                                          more than one may be specified to listen in multiple places
      --type                              Choose charles file type, current support .chlsj file, json request file path
  {bold TYPE}
    Support two file formats.
    {underline JSON REQUEST FILE PATH}, Request file exported using save as in charles, see example for more.
    {underline CHLSJ} = JSON Session File, which contains all necessary info about request/response.
  {bold ENDPOINTS}
      Listen endpoints (specified by the {bold --listen} or {bold -l} options above) instruct {cyan charles-mock-server}
      to listen on one or more interfaces/ports, UNIX domain sockets, or Windows named pipes.
      For TCP ports on hostname "localhost":
          {bold $} {cyan charles-mock-server} -l {underline 1234}
      For TCP (traditional host/port) endpoints:
          {bold $} {cyan charles-mock-server} -l tcp://{underline hostname}:{underline 1234}
      For UNIX domain socket endpoints:
          {bold $} {cyan charles-mock-server} -l unix:{underline /path/to/socket.sock}
      For Windows named pipe endpoints:
          {bold $} {cyan charles-mock-server} -l pipe:\\\\.\\pipe\\{underline PipeName}
`;

const getVersion = () => {
  const foundPkg = readPkgUp.sync({
    cwd: parentDir,
    normalize: false
  });
  return foundPkg.packageJson.version || '';
}

const args = arg({ 
  "--path": String,
  "--no-header": Boolean,
  "--type": String,
  '--listen': [parseEndpoint],
  '--help': Boolean,
  '--version': Boolean,

  // align
  '-h': '--help',
  '-v': '--version',
  '-l': '--listen',
  '-p': '--listen'
});

// console.log('args',args);

if(args['--help']) {
  console.log(getHelp());
}

if(args['--version']) {
  console.log(getVersion())
}

const cwd = process.cwd();
args["--path"] = args["--path"] || args["_"].shift() || cwd;

if (!args['--type']) {
  args['--type'] = 'chlsj';
}

// console.log('args',args);

module.exports = args;
