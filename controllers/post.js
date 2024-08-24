const cloudinary = require('cloudinary');
const formidable = require('formidable');

const { dbConfig } = require('../db/db');
const { Post } = require('../models/post.model');
const { where } = require('sequelize');
const { User } = require('../models/user.model');
const { Comment } = require('../models/comment.model');

cloudinary.v2.config({
    cloud_name: 'dyqqhepm4',
    api_key: '269486766159385',
    api_secret: 'S2ldqsCEvZqpoA7axVs5-2JSPfc',
    secure: true,
});

const addPost = (req, res) => {
    try {
        let body = req.body;
        let form = new formidable.IncomingForm();
        console.log(body);

        form.parse(req, async (err, fields, files) => {
            console.log(err);
            console.log(fields.hasFile);
            console.log(files);
            var has_file = fields.hasFile[0];
            console.log(has_file);
            console.log(typeof (has_file));
            if (err) {
                console.log(err);
                res.send({ status: false, payload: "Something went wrong. Please try again." + err });
                // throw new Error(err);
            } else if (has_file == 'true') {
                await cloudinary.v2.uploader.upload(files.image[0].filepath, {

                }, async (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ status: false, payload: "Something went wrong. Please try again." })
                    } else {
                        console.log(result);
                        User.findOne({
                            where: {
                                uid: fields.uid
                            }
                        }).then(async (user) => {
                            console.log(user);
                            if (user) {
                                let parsedLeaderBoard = JSON.parse(user.leader_board);
                                let currentLeaderBoard = parsedLeaderBoard[parsedLeaderBoard.length - 1];

                                var has_file = fields.hasFile[0];
                                var content = fields.content[0];
                                var timestamp = fields.timestamp[0];

                                await Post.create({
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    uid: user.uid,
                                    has_file: has_file,
                                    content: content,
                                    post_image_URL: result.secure_url,
                                    username: user.username,
                                    leader_board: currentLeaderBoard.leader_board,
                                    image_URL: user.image_URL,
                                    timestamp: timestamp,
                                    likes: 0,
                                    comments: JSON.stringify([]),
                                    shares: 0,
                                });
                                res.send({ status: true, payload: "Post added successfully." })
                            } else {
                                res.send({ status: false, payload: "User not found" })

                            }
                        })
                    }
                });
            } else {
                // await Post.create({
                //     first_name: fields.firstName,
                //     last_name: fields.lastName,
                //     uid: fields.uid,
                //     content: fields.content[0],
                //     has_file: fields.hasFile[0],
                //     username: fields.username,
                //     leader_board: fields.leaderboard,
                //     image_URL: fields.image_url,
                //     timestamp: fields.timestamp[0],
                //     likes: JSON.stringify([]),
                //     comments: JSON.stringify([]),
                //     share: 0,
                // })
                User.findOne({
                    where: {
                        uid: fields.uid
                    }
                }).then(async (user) => {
                    console.log(user);
                    if (user) {
                        let parsedLeaderBoard = JSON.parse(user.leader_board);
                        let currentLeaderBoard = parsedLeaderBoard[parsedLeaderBoard.length - 1];
                        var has_file = fields.hasFile[0];
                        var content = fields.content[0];
                        var timestamp = fields.timestamp[0];

                        await Post.create({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            uid: user.uid,
                            has_file: has_file,
                            content: content,
                            // post_image_URL: result.secure_url,
                            username: user.username,
                            leader_board: currentLeaderBoard.leader_board,
                            image_URL: user.image_URL,
                            timestamp: timestamp,
                            likes: 0,
                            comments: JSON.stringify([]),
                            shares: 0,
                        });
                        res.send({ status: true, payload: "Post added successfully." })
                    } else {
                        res.send({ status: false, payload: "User not found" })

                    }
                })

            }
        });
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong." })
    }
}

const getPost = (req, res) => {
    try {
        let body = req.body;
        if (body.id) {
            Post.findOne({
                where: {
                    id: body.id,
                }
            }).then((post) => {
                if (post) {
                    Comment.findAll({
                        where: {
                            post_id: post.id,
                        }
                    }).then((comment) => {
                        res.send({ status: true, payload: { ...post.dataValues, comments: comment ?? [] } })

                    })
                    // res.send({ status: true, payload: post })
                } else {
                    res.send({ status: false, payload: "Post not found." })

                }
            })
        } else {
            Post.findAll().then(async (post) => {
                if (post) {
                    // Comment.findAll({
                    //     where: {
                    //         post_id: post.id,
                    //     }
                    // }).then((comment) => {
                    //     res.send({ status: true, payload: {...post, comments: comment ?? []} })

                    // })
                    let allPosts = [];
                    for (let i = 0; i < post.length; i++) {
                        const element = post[i].dataValues;
                        let comment = await Comment.findAll({
                            where: {
                                post_id: element.id,
                            }
                        });

                        allPosts.push({ ...element, comments: comment })

                    }
                    console.log(allPosts);
                    res.send({status: true,payload: allPosts})
                    
                } else {
                    res.send({ status: false, payload: "Something went wrong." })

                }
            })

        }
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong." })

    }
}

const like = (id) => {
    try {
        Post.findOne({
            where: { id: id }
        }).then(async (post) => {
            if (post) {
                await Post.update({ likes: post.likes += 1 }, {
                    where: { id: post.id }
                })
            } else {

            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong." })
    }
}
const share = (id) => {
    try {
        Post.findOne({
            where: { id: id }
        }).then(async (post) => {
            if (post) {
                await Post.update({ share: post.share += 1 }, {
                    where: { id: post.id }
                })
            } else {

            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong." })
    }
}

const comment = (data) => {
    try {
        Post.findOne({
            where: { id: data.id }
        }).then(async (post) => {
            if (post) {
                await Comment.create({
                    post_id: data.id,
                    uid: data.userID,
                    comment: data.comment,
                    username: data.username,
                    image_URL: data.image,
                    timestamp: Date.now().toString(),
                })
            } else {

            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong." })
    }
}

module.exports = { addPost, getPost, like, comment, share };