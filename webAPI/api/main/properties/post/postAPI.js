const express = require('express')
const router = express.Router()
const postController = require('../../../../controller/main/properties/post/postController')

router.route('/post/active-user-info')
    .get(postController.getNaCoLo)  // this will only get the [name, contactno, location]

router.route('/post/vehicle')
    .post(postController.postVehicle)
    
router.route('/post/real-estate')
    .post(postController.postRealestates)
    
router.route('/post/jewelry')
    .post(postController.postJewelries)

module.exports = router