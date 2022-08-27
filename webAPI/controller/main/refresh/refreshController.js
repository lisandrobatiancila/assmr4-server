const jwt = require('jsonwebtoken')

const refreshToken = (req, res) => {
    const cookies = req.cookies

    if (!cookies.userRefToken)
        return res.sendStatus(401)
    const verify = new Promise((resolve, reject) => {
        jwt.verify(cookies.userRefToken, process.env.REFRESH_TOKEN, (err, decoded) => {
            if(err)
                reject({message: 'expired token'})
            
            resolve(decoded)
        })
    })

    verify
        .then(response => {
            const accessToken = jwt.sign({email: response.email}, process.env.PUBLIC_TOKEN, {expiresIn: '1d'})

            res.json({
                email: response.email,
                accessToken
            })
        })
        .catch(err => {
            res.sendStatus(401)
        })
}

module.exports = { refreshToken }