import { RequestHandler } from "express";

// 로그인 했는지 판단하는 미들웨어
const isLoggedIn: RequestHandler = (req, res, next) => {
    // isAuthenticated() => 패스포트 통해서 로그인 했는지 여부를 알려줌
    if (req.isAuthenticated()) {
        // passport 통해서 로그인 했으면 다음으로 넘어감
        next();
    } else {
        // passport 통해서 로그인 안 했으면 로그인 해달라 에러 메시지가 전송됨
        res.status(403).send('로그인 필요');
    }
};

// 로그인 안 했는지 판단하는 미들웨어
const isNotLoggedIn: RequestHandler = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // passport 통해서 로그인 안 했으면 다음으로 넘어감
        next();
    } else {
        // passport 통해서 이미 로그인을 했다면 이미 로그인한 상태라는 에러 메시지 띄워줌
        const message = encodeURIComponent('로그인한 상태입니다.');
        // localhost:8080?error=message 이런 식으로 되어 있으면 에러 메시지가 나가도록 프론트에 작성해놨음
        //  - script 부분에 new URL(location.href).searchParams.get('error') 부분을 의미
        res.redirect(`/?error=${message}`);
    }
}

export { isLoggedIn, isNotLoggedIn };