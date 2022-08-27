const allowedOrigin = require('./allowedDomain')

const setHeaders = (req, res, next) => {
    const origin = req.headers.origin
    
    if(allowedOrigin.includes(origin)){
        res.header('Access-Control-Allow-Credentials', true)
        res.header('Access-Control-Allow-Origin', origin)
        // else{
        //     console.log(origin)
        //     console.log('---origin----')
        //     res.header('Access-Control-Allow-Credentials', true)
        //     res.header('Access-Control-Allow-Origin', origin)//'kivy-mobile'
        // }
    }
    next()
}

module.exports = setHeaders