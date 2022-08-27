const logoutUser = (req, res) => {
    console.log(req.body)
    res.clearCookie('userRefToken', {httpOnly: true, sameSite: 'none', secure: true})
    res.sendStatus(401)
}

module.exports = { logoutUser }