const { Domain, User, Post, Hashtag }  = require('../models');
const jwt = require('jsonwebtoken');

// 토큰 발급
exports.createToken = async (req, res) => {
    // req.body.clientSecret을 통해 JWT 토큰을 발급받아 그 토큰으로 다시 요청을 보냄
    // 그러므로 토큰 발급을 하려면 req.body.clientSecret이 필요
    //  - 프론트에서 req.body로 전달해달라고 한 상태
    const { clientSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
            }]
        });
        // 도메인이 없을 경우
        if(!domain) {
            return res.status(401).json({
                status: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.',
            });
        }

        // 토큰 발급 -> jwt.sign() 이용
        const token = jwt.sign({
            // 토큰 내용물
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            // 추가 옵션
            //  - 옵션들이 아주 많음 -> 이는 공식문서에서 한 번 살펴보자!
            expiresIn: '1m', // 유효기간 -> 1분
            issuer: 'nodebird', // 발급자
        });

        return res.json({
            code: 200,
            message: '토큰 발급되었습니다',
            token,
        })
    } catch (error) {
        console.error(error);
        // 무슨 에러가 날지는 모르지만 어떤 에러가 나든 서버 에러로 응답해주면 됨
        // 이런 에러를 응답해주지 않으면 브라우저는 하염없이 기다리게 됨
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        })
    }
}

// 토큰 테스트
exports.tokenTest = (req, res) => {
    // 토큰 내용물들 그대로 다시 프론트로 돌려주는 역할만 할 것임
    res.json(res.locals.decoded);
}

// 나의 게시글들 가져갈 수 있게 해주는 컨트롤러
exports.getMyPosts = (req, res) => {
    // res.locals.decoded
    //  - middlewares/index.js의 verifyToken 부분에서 jwt.verify()를 통해 검증 후에 res.locals.decoded에 데이터가 들어감
    //  - 여기에 사용자 아이디가 들어있음
    Post.findAll({ where: { userId: res.locals.decoded.id } })
        .then((posts) => {
            res.json({
                code: 200,
                payload: posts,
            })
        })
        .catch((error) => {
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            })
        })
}

// 해시태그 검색해서 관련 게시글 가져갈 수 있게 해주는 컨트롤러
exports.getPostsByHashtag = async (req, res) => {
    try {
        // 해시태그를 먼저 찾음
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if(!hashtag) { // 해시태그가 한 번도 쓰인적이 없다면
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            })
        }
        // 해시태그에 딸린 게시글들 가져옴
        const posts = await hashtag.getPosts();
        if(posts.length === 0) { // 해시태그에 해당하는 게시물이 없다면
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        return res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        })
    }
}