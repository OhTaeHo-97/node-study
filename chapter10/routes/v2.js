const express = require('express');
const { verifyToken, apiLimiter, corsWhenDomainMatches } = require("../middlewares");
const { createToken, tokenTest, getMyPosts, getPostsByHashtag } = require('../controllers/v2');
const cors = require('cors');

const router = express.Router();

router.use(corsWhenDomainMatches);

// /v1/token
// 토큰 발급
router.post('/token', apiLimiter, createToken);
// /v1/test
// 토큰 테스트
router.get('/test', verifyToken, apiLimiter, tokenTest);

// 나의 게시글들 가져갈 수 있게 해주는 라우터
router.get('/posts/my', verifyToken, apiLimiter, getMyPosts);
// 해시태그 검색해서 관련 게시글 가져갈 수 있게 해주는 기능
router.get('/posts/hashtag/:title', verifyToken, apiLimiter, getPostsByHashtag);

module.exports = router;