const express = require('express');
const { uploadVideo, getAllVideos, getVideo, likeVideo, dislikeVideo, subscribeChannel, totalSubscribers, postComment, getComment } = require('../controllers/videoController');
const { isAuth } = require('../middleware/auth');
const {videoUpload } = require('../middleware/upload');
const router = express.Router();

router.route('/getAllVideos').get(getAllVideos) // query: c for category, s for search , p for page

router.route('/uploadVideo').post(isAuth,videoUpload.fields([{name:'video'},{name:"thumbnail"}]),uploadVideo);

router.route('/video/like/:videoId').put(isAuth,likeVideo);

router.route('/video/dislike/:videoId').put(isAuth,dislikeVideo);

router.route('/video/:videoId').get(isAuth,getVideo);

router.route('/subscribe/:channelId').put(isAuth,subscribeChannel)

router.route('/subscriberCount/:channelId').get(isAuth,totalSubscribers)

router.route('/comment/:videoId').get(isAuth,getComment)

router.route('/comment').post(isAuth,postComment) //query: v for videoId, r for replying to


module.exports=router