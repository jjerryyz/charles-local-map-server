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

const getHelp = () => chalk`
  {bold.cyan serve} - Static file serving and directory listing
  {bold USAGE}
      {bold $} {cyan serve} --help
      {bold $} {cyan serve} --version
      {bold $} {cyan serve} folder_name
      {bold $} {cyan serve} [-l {underline listen_uri} [-l ...]] [{underline directory}]
      By default, {cyan serve} will listen on {bold 0.0.0.0:5000} and serve the
      current working directory on that address.
      Specifying a single {bold --listen} argument will overwrite the default, not supplement it.
  {bold OPTIONS}
      --help                              Shows this help message
      -v, --version                       Displays the current version of serve
      -l, --listen {underline listen_uri}             Specify a URI endpoint on which to listen (see below) -
                                          more than one may be specified to listen in multiple places
      -d, --debug                         Show debugging information
      -s, --single                        Rewrite all not-found requests to \`index.html\`
      -c, --config                        Specify custom path to \`serve.json\`
      -C, --cors						  Enable CORS, sets \`Access-Control-Allow-Origin\` to \`*\`
      -n, --no-clipboard                  Do not copy the local address to the clipboard
      -u, --no-compression                Do not compress files
      --no-etag                           Send \`Last-Modified\` header instead of \`ETag\`
      -S, --symlinks                      Resolve symlinks instead of showing 404 errors
      --ssl-cert                          Optional path to an SSL/TLS certificate to serve with HTTPS
      --ssl-key                           Optional path to the SSL/TLS certificate\'s private key
  {bold ENDPOINTS}
      Listen endpoints (specified by the {bold --listen} or {bold -l} options above) instruct {cyan serve}
      to listen on one or more interfaces/ports, UNIX domain sockets, or Windows named pipes.
      For TCP ports on hostname "localhost":
          {bold $} {cyan serve} -l {underline 1234}
      For TCP (traditional host/port) endpoints:
          {bold $} {cyan serve} -l tcp://{underline hostname}:{underline 1234}
      For UNIX domain socket endpoints:
          {bold $} {cyan serve} -l unix:{underline /path/to/socket.sock}
      For Windows named pipe endpoints:
          {bold $} {cyan serve} -l pipe:\\\\.\\pipe\\{underline PipeName}
`;

const args = arg({ 
  "--path": String,
  "--no-header": Boolean,
  "--type": String,
  '--listen': [parseEndpoint],
  '--help': Boolean,

  // align
  '-h': '--help',
  '-l': '--listen',
  '-p': '--listen'
});

// console.log('args',args);

if(args['--help']) {
  console.log(getHelp());
  return;
}

const cwd = process.cwd();
args["--path"] = args["--path"] || args["_"].shift() || cwd;
if (!args["--path"]) {
  console.error("please specific local map files");
}

if (!args['--type']) {
  args['--type'] = 'chlsj';
}

// console.log('args',args);

module.exports = args;
