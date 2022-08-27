const jwt = require('jsonwebtoken')
const logs = require('../../../middleware/logs/logs')
const { Users } = require('../../../../model/DBModel')

const usersDB = new Users()

const refreshToken = (req, res) => {
    const cookies = req.cookies

    if(!cookies.userRefToken){
        logs.logActions('persistentController.js: a 401 Unauthorized / cookies mistake / expire cookies')
        return res.sendStatus(401)
    }
    
    const userRefToken = cookies.userRefToken
    
    usersDB.verifyUser(userRefToken)
        .then(response => {
            const { email } = response

            jwt.verify(
                userRefToken,
                process.env.REFRESH_TOKEN,
                (err, decoded) => {
                    if(err || decoded.email !== email)
                        return res.sendStatus(404)
                    
                    const accessToken = jwt.sign(
                        {email},
                        process.env.PUBLIC_TOKEN,
                        {expiresIn: '5s'}
                    )

                    res.json({
                        accessToken
                    })
                }
            )
        })
        .catch(err => {
            logs.logActions(`persistentController.js catch: ${JSON.stringify(err)}`)
            console.log(err)
        })
    
}

module.exports = { refreshToken }