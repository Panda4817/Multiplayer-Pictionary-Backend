const whitelist = [...process.env.CLIENT.split(",")]
if (process.env.TEST == true) {
    whitelist.push("http://localhost:5000");
}
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = {
    whitelist, corsOptions
}

