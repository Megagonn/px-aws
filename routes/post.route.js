const express = require('express');
const { addPost, getPost, deletePost } = require('../controllers/post');
const router = express.Router();

router.post("/post/add_post", addPost);
router.post("/post/get_post", getPost);
router.post("/post/delete_post", deletePost);

module.exports = router;