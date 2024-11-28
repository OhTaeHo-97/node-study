const express = require('express');
const { verifyToken, deprecated } = require("../middlewares");
const { createToken, tokenTest, getMyPosts, getPostsByHashtag } = require('../controllers/v1');

const router = express.Router();

router.use(deprecated);

// /v1/token
// 토큰 발급
router.post('/token', createToken);
// /v1/test
// 토큰 테스트
router.get('/test', verifyToken, tokenTest);

// 나의 게시글들 가져갈 수 있게 해주는 라우터
router.get('/posts/my', verifyToken, getMyPosts);
// 해시태그 검색해서 관련 게시글 가져갈 수 있게 해주는 기능
router.get('/posts/hashtag/:title', verifyToken, getPostsByHashtag);

module.exports = router;