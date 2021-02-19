module.exports = {
  FILE,
  JS,
  URL,
}

function FILE(s) {
  return !URL(s) && /\.chlsj$/.test(s)
}

function JS(s) {
  return !URL(s) && /\.js$/.test(s)
}

function URL(s) {
  return /^(http|https):/.test(s)
}
