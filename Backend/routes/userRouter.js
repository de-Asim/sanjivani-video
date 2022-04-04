const express = require('express')
const router = express.Router();
const { createUser, loginUser, logout, userDetails, logoutAll, forgot, reset, updatePassword, getAllUser, getSingleUser, updateUserRole, deleteUser} = require('../controllers/userController.js');
const { isAuth, isAdmin } = require('../middleware/auth')

router.route('/register').post(createUser);

router.route('/login').post(loginUser)

router.route('/logout').get(isAuth,logout)

router.route('/logoutAll').get(isAuth,logoutAll)

router.route('/userDetails').get(isAuth,userDetails)

router.route('/password/forgot').post(forgot)

router.route('/password/reset/:token').put(reset)

router.route('/password/change').put(isAuth,updatePassword)


// admin

router.route('/admin/user/all').get(isAuth,isAdmin,getAllUser)

router.route('/admin/user/:id').get(isAuth,isAdmin,getSingleUser)

router.route('/admin/user/update/:id').put(isAuth,isAdmin,updateUserRole)

router.route('/admin/user/delete/:id').delete(isAuth,isAdmin,deleteUser)

module.exports=router;