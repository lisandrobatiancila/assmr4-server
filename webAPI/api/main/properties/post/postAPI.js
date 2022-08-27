const express = require('express')
const router = express.Router()
const postController = require('../../../../controller/main/properties/post/postController')


router.route('/post/vehicle')
    .post(postController.postVehicle)
    
router.route('/post/real-estate')
    .post(postController.postRealestates)
    
router.route('/post/jewelry')
    .post(postController.postJewelries)

module.exports = router