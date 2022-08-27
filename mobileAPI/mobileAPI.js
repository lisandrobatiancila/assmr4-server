const express = require('express')
const app = express()
const signupAPI = require('./api/index/signup/signupAPI')
const signinAPI = require('./api/index/signin/signinAPI')
const toAssumePropAPI = require('./api/main/properties/get/getPropertiesAPI')
const assumptionForm = require('./api/main/assumption/assumptionAPI')
const userPostedProperties = require('./api/main/properties/post/postedPropertiesAPI')
const assmrPropertiesChartAPI = require('./api/main/assmr-charts/assmr_chartsAPI')
const userFeedbacksAPI = require('./api/main/feedbacks/feedbacksAPI')
const userchatroomAPI = require('./api/main/chatrooms/chatroomsAPI')

app.use('/mobile-signup', signupAPI)
app.use('/mobile-signin', signinAPI)

app.use('/mobile-to-assume', toAssumePropAPI) //ready to assume properties
app.use('/mobile-assumption-form', assumptionForm) //assumptions informations
app.use('/mobile-posted-properties', userPostedProperties)
app.use('/mobile-assmr-properties-chart', assmrPropertiesChartAPI)
app.use('/mobile-user-feedbacks', userFeedbacksAPI)
app.use('/mobile-user-chatrooms', userchatroomAPI)

module.exports = app