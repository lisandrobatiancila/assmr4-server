const express = require('express')
const webAPI = express()

const signUPAPI = require('./api/index/signup/signupAPI')
const signinAPI = require('./api/index/signin/signinAPI')
const persistAPI = require('./api/index/persistent/persistentAPI')
const logoutAPI = require('./api/main/account/logout/logoutAPI')

const postPropertiesAPI = require('./api/main/properties/post/postAPI')
const retrievePropertiesAPI = require('./api/main/properties/get/getAPI')
const dashboardAPI = require('./api/main/account/dashboard/dashboardAPI')
const refreshAPI = require('./api/refresh/refreshAPI')
const profileAPI = require('./api/main/account/profile/profileAPI')
const chatroomAPI = require('./api/main/account/chatroom/chatroomAPI')
const assumptionAPI = require('./api/main/assumptions/assumptionAPI')

// const imageProvider = require('./controller/image/imageController')

webAPI.use('/signup', signUPAPI)
webAPI.use('/signin', signinAPI)
webAPI.use('/auth', persistAPI)
webAPI.use('/logout', logoutAPI)

// webAPI.get('/images/:folder', imageProvider)

webAPI.use('/properties', retrievePropertiesAPI)
// MAIN side :=> if user is authenticated
webAPI.use('/refresh', refreshAPI)
webAPI.use('/main', postPropertiesAPI)  // to post a properties
webAPI.use('/main/dashboard', dashboardAPI)
webAPI.use('/main/profile', profileAPI)
webAPI.use('/main/chatrooms', chatroomAPI)
webAPI.use('/assumptions', assumptionAPI)

module.exports = webAPI