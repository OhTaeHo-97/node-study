import express from 'express';
import { renderProfile, renderJoin, renderMain, renderHashtag } from '../controllers/page';
import {isLoggedIn, isNotLoggedIn} from "../middlewares";
const router = express.Router();

// 지금은 필요치 않음
// 라우터들에서 공통적으로 쓸 수 있는 변수를 선언하는 자리
//  - 즉, 이 라우터들에서 공통적으로 쓰길 원하는 데이터를 넣을 수 있음
// 미들웨어는 항상 next()를 호출해줘야 함!
//  - 아까 404 NOT FOUND 미들웨어에서도 next(error)를 호출해서 에러처리 미들웨어로 보냄
//  - 404 미들웨어에서 error.status를 404로 넣어줬기 때문에 에러 미들웨어의 err.status가 404가 됨
//  - 미들웨어끼리는 서로 next()를 해줘야지만 다음 미들웨어로 넘어간다!
// 다른 라우터들이 쓸 수 있는 공통값을 정의해놓고 next()를 호출하지 않으면 아래 라우터들이 실행도 안됨
router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user?.Followers?.length || 0;
    res.locals.followingCount = req.user?.Followings?.length || 0;
    res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
    next();
});

// 프로필 보기 화면
router.get('/profile', isLoggedIn, renderProfile);
// 회원 가입 화면
router.get('/join', isNotLoggedIn, renderJoin);
// 메인 화면
router.get('/', renderMain);
// 해시태그 검색
router.get('/hashtag', renderHashtag); // hashtag?hashtag=고양이

export default router;