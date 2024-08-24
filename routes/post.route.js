const express = require('express');
const { addPost, getPost } = require('../controllers/post');
const router = express.Router();

router.post("/post/add_post", addPost);
router.post("/post/get_post", getPost);

module.exports = router;