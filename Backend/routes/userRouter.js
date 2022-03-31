const express = require('express')
const router = express.Router();
const { createUser, loginUser, logout, userDetails, logoutAll, forgot, reset} = require('../controllers/userController.js');
const { isAuth, isAdmin } = require('../middleware/auth')

router.route('/register').post(createUser);

router.route('/login').post(loginUser)

router.route('/logout').get(isAuth,logout)

router.route('/logoutAll').get(isAuth,logoutAll)

router.route('/userDetails').get(isAuth,userDetails)

router.route('/password/forgot').post(forgot)

router.route('/password/reset/:token').put(reset)

module.exports=router;