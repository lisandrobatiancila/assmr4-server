const { Users } = require('../../../../model/DBModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const users = new Users()

const signinController = (req, res) => {
    const { email, password } = req.body

    const validate = {
        email: /[^\s]/.test(email),
        password: /[^\s]/.test(password)
    }
    
    if(!Object.values(validate).every(val => val))
        return res.json({
            message: 'empty fields',
            isPassed: false
        })
    
    users.signinUser(req.body)
        .then(response => {
            const accessToken = jwt.sign({email},
                process.env.PUBLIC_TOKEN,
                {expiresIn: '120s'}
            )

            const refreshToken = response.refreshToken

            res.cookie('userRefToken', refreshToken, {
                maxAge: 24*60*60*1000, httpOnly: true
            })
            
            res.json({message: response.message, accessToken, isPassed: true, user: response.user})
        })
        .catch(err => res.json(err))
}

module.exports = { signinController }