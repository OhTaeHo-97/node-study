import express from 'express';
import passport from 'passport';
import { isLoggedIn, isNotLoggedIn } from '../middlewares';
import { join, login, logout } from "../controllers/auth";
const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join);
// POST /auth/login
router.post('/login', isNotLoggedIn, login);
// GET /auth/logout
router.get('/logout', isLoggedIn, logout);

// /auth/kakao
router.get('/kakao', passport.authenticate('kakao')); // 카카오톡 로그인 화면으로 redirect

// /auth/kakao/callback
router.get('/kakao/callback', passport.authenticate('kakao', {
    // passport-kakao 공식문서에 있기 때문에 그걸 보고 확인하자!
    failureRedirect: '/?loginError=카카오로그인 실패',
}), (req, res) => {
    res.redirect('/');
});

export default router;