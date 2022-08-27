const { Users } = require('../../../../model/DBModel')

const userDB = new Users()

const registerUser = async (req, res) => {
    const { firstname, middlename, lastname, contactno, address, email, password, retypePassword } = req.body
    const { province, municipality, barangay } = req.body

    const isValid = {
        has_error: /[^\s]/.test(firstname)?/[^\s]/.test(middlename)?/[^\s]/.test(lastname)?
            /[^\s]/.test(contactno)?/[^\s]/.test(email)?/[^\s]/.test(password)?/[^\s]/.test(retypePassword)?
            password === retypePassword?false:true:true:true:true:true:true:true:true,
        firstname_err: /[^\s]/.test(firstname)?false:true,
        middlename_err: /[^\s]/.test(middlename)?false:true,
        lastname_err: /[^\s]/.test(lastname)?false:true,
        contactno_err: /[^\s]/.test(contactno)?false:true,
        email_err: /[^\s]/.test(email)?false:true,
        password_err: /[^\s]/.test(password)?false:true,
        retypePassword_err: /[^\s]/.test(retypePassword)?false:true,
        pass_is_same_err: {
            message: password === retypePassword?"":"passwords are not the same",
            is_err: password === retypePassword?false:true
        }
    }
    if (isValid.has_error)
        return res.json(isValid)

    if(await userDB.userIsAlreadyExist(email))
        return res.json({
            message: 'User already exists', has_error: true
        })

    userDB.signupUser(req.body)
        .then(response => res.json(response))
        .catch(err => console.log(`signup: ${err}`))
}

module.exports = { registerUser }