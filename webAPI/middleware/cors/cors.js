const allowedDomain = require('./allowedDomain')
const logs = require('../logs/logs')

const corsOrigin = {
    origin: (origin, cb) =>{
        if(allowedDomain.includes(origin))
            cb(null, true)
        else{
            logs.logActions(`cross origin resource error cors.js ${origin}`)
            cb(new Error('Invalid cors options'))
        }
    }
}

module.exports = corsOrigin