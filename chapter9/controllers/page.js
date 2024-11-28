const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');

exports.renderProfile = (req, res, next) => {
    // 서비스를 호출
    res.render('profile', { title: '내 정보 - NodeBird' });
};

exports.renderJoin = (req, res, next) => {
    res.render('join', { title: '회원 가입 - NodeBird' });
};

exports.renderMain = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'], // 비밀번호는 프론트로 보내면 안되므로 아이디, 닉네임만 추려서 보냄
            },
            order: [['createdAt', 'DESC']]
        });
        res.render('main', {
            title: 'NodeBird',
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderHashtag = async (req, res, next) => {
    // 프론트(클라이언트)로부터 요청에 어떤 정보가 들어있는지 req.query인지, req.body인지, req.params인지 그런 것을 미리 생각해놓고 그렇게 받은 정보들로 서버에서 처리하면 됨
    const query = req.query.hashtag;
    if (!query) { // 만약 query가 없다면
        // 메인으로 보냄
        return res.redirect('/');
    }

    try {
        // 해시태그 조회
        const hashtag = await Hashtag.findOne({ where: { title: query }});
        let posts = [];
        if(hashtag) {
            // 해시태그와 게시물을 관계를 맺어놨기 때문에 해시태그에 속해있는 게시물들을 아래처럼 get으로 가져올 수 있음!
            posts = await hashtag.getPosts({
                include: [{ model: User, attributes: ['id', 'nick'] }],
                order: [['createdAt', 'DESC']]
            });
        }
        res.render('main', {
            // 타이틀 : 문자열 (제목에 띄울 것)
            title: `${query} | NodeBird`,
            twits: posts,
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}