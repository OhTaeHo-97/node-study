const express = require('express');
const User = require('../schemas/user');
const Comment = require('../schemas/comment');

const router = express.Router();

router.route('/')
    .get(async (req, res, next) => {
        try {
            const users = await User.find({});
            res.json(users);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const user = await User.create({
                name: req.body.name,
                age: req.body.age,
                married: req.body.married,
            });
            // const user = new User({
            //     name: req.body.name,
            //     age: req.body.age,
            //     married: req.body.married,
            // });
            // await user.save();

            console.log(user);
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

router.get('/:id/comments', async (req, res, next) => {
    try {
        const comments = await Comment.find({
            commenter: req.params.id,
        })
            .populate('commenter');
        console.log(comments);
        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;