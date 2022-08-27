const { MobileUsers } = require('../../../../model/DMMobileModel')

const mobileUserDB = new MobileUsers()

const signUp = (req, res) => {
    const { firstname, middlename, lastname, contactno, gender, 
        province, municipality, barangay,
        username, password, retypePassword } = req.body

    const isvalidationPass = {
        firstname: {isPassed: /[^\s]/.test(firstname), message: /[^\s]/.test(firstname)?'': 'empty firstname'},
        middlename: {isPassed: /[^\s]/.test(middlename), message: /[^\s]/.test(middlename)?'': 'empty middlename'},
        lastname: {isPassed: /[^\s]/.test(lastname), message: /[^\s]/.test(lastname)?'': 'empty lastname'},
        contactno: {isPassed: /[^\s]/.test(contactno), message: /[^\s]/.test(contactno)?'': 'empty contactno'},
        gender: {isPassed: /[^\s]/.test(gender), message: /[^\s]/.test(gender)?'': 'no gender choosen'},
        province: {isPassed: /[^\s]/.test(province), message: /[^\s]/.test(province)?'': 'no province selected'},
        municipality: {isPassed: /[^\s]/.test(municipality), message: /[^\s]/.test(municipality)?'': 'no municipality selected'},
        barangay: {isPassed: /[^\s]/.test(barangay), message: /[^\s]/.test(barangay)?'': 'no barangay selected'},
        username: {isPassed: /[^\s]/.test(username), message: /[^\s]/.test(username)?'': 'empty username'},
        password: {isPassed: /[^\s]/.test(password), message: /[^\s]/.test(password)?'': 'empty password'},
        retypePassword: {isPassed: /[^\s]/.test(retypePassword), message: /[^\s]/.test(retypePassword)?'': 'empty retypePasswprd'}
    }
    if(!Object.values(isvalidationPass).every(vPass => vPass.isPassed))
        return res.json({
            message: isvalidationPass
        })
    else if(password !== retypePassword)
        return res.json({
            message: 'passwords are not the same'
        })

    mobileUserDB.signupUser(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
        })

}

module.exports = { signUp }