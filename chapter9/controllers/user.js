const User = require('../models/user');
const { follow } = require('../services/user');

exports.follow = async (req, res, next) => {
    // req.params.id, req.user.id
    try {
        // const user = await User.findOne({ where: { id: req.user.id }});
        // if (user) {
        //     await user.addFollowing(parseInt(req.params.id, 10));
        //     res.send('success');
        // } else {
        //     res.status(404).send('no user');
        // }
        const result = await follow(req.user.id, req.params.id);
        if (result === 'ok') {
            res.send('success');
        } else if(result === 'no user') {
            res.status(404).send('no user');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.unfollow = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }, include: [{ model: User, as: 'Followings' }] });
        if(user) {
            if(user.Followings && user.Followings.includes(parseInt(req.params.id, 10))) {
                await User.removeFollowing(parseInt(req.params.id, 10));
                res.send('success');
            } else {
                res.status(400).send('not following');
            }
        } else {
            res.status(404).send('no user');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}