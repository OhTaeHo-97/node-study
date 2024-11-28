const express = require('express');
const { isLoggedIn } = require('../middlewares');
const { renderLogin, createDomain } = require('../controllers');
const router = express.Router();

// 메인 페이지
router.get('/', renderLogin);
// 도메인 등록하는 라우터
//  - 로그인한 사용자만 등록 가능
router.post('/domain', isLoggedIn, createDomain);

module.exports = router;