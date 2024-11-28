const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const { Domain } = require('../models');

// 로그인 했는지 판단하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
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
exports.isNotLoggedIn = (req, res, next) => {
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

exports.verifyToken = (req, res, next) => {
    try {
        // 토큰을 검사 -> jwt.verify()를 사용
        // 토큰은 보통 req.headers.authorization에 들어있음
        //  - 토큰이라고 무조건 여기 들어있는 것이 아니라 우리가 사용자에게 토큰을 authorization 헤더에 넣어달라고 요청할 것임
        //  - 그러면 사용자들이 authorization 헤더에 토큰을 넣으면 우리가 서버에서 검사를 해줌
        // JWT_SECRET을 통해서 발급도 하고 검사도 하기 때문에 JWT_SECRET이 털리면 JWT 토큰이 다 털렸다고 보면 됨
        //  - 인감 도장을 빼앗긴 것이나 마찬가지
        // res.locals.decoded
        //  - jwt 토큰에는 내용물이 들어있다고 했는데, 검사가 끝나면 그 내용물을 decoded 안에 넣는 것
        res.locals.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        // 다음 미들웨어로 넘어감
        return next();
    } catch (error) {
        // 토큰이 유효성 검사가 틀렸거나 만료기간이 넘어가면 여러 에러들이 뜸
        //  - JWT는 만료기간을 설정할 수 있음
        if(error.name === 'TokenExpiredError') { // 유효기간 초과
            res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.',
            });
        }

        // 유효기간 초과가 아닌 이상 대부분은 토큰이 위조된 경우
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.',
        });
    }
}

// 요청에 횟수 제한을 두는 미들웨어
exports.apiLimiter = async (req, res, next) => {
    // let user;
    // if(res.locals.decoded.id) {
    //     user = await User.findOne({ where: { id: res.locals.decoded.id } });
    // }
    rateLimit({
        windowMs: 60 * 1000, // 밀리초 단위라서 이게 1분
        // max: user?.type === 'premium' ? 100 : 10, // windowMs 동안 1번 보낼 수 있음
        max: 10, // windowMs 동안 1번 보낼 수 있음
        // handler 부분 -> 제한을 초과하면 어떤 응답을 보내줄지 정하는 미들웨어
        handler(req, res) {
            res.status(this.statusCode).json({
                code: this.statusCode,
                message: '1분에 열 번만 요청할 수 있습니다'
            });
        }
    })(req, res, next);
}

// deprecated 미들웨어
//  - API에 버전을 붙여놨음
//  - 지금은 v1인데 버전 2가 나오면 웬만하면 사람들이 최신 버전으로 쓰는 것이 좋음
//      - 새로운 버전이 나왔다는 것은 예전 버전에 뭔가 쓰면 안되는 기능이나 버그가 있다는 것이니
//  - 그래서 v2를 냈으면 v1은 쓰지 말라고 안내를 해줘야 하는데, deprecated 미들웨어가 그렇게 안내해주는 역할을 함
exports.deprecated = (req, res) => {
    // deprecated의 코드는 410으로 우리가 정함
    res.status(410).json({
        code: 410,
        message: '새로운 버전 나왔습니다. 새로운 버전을 사용하세요.',
    })
}

// corsWhenDomainMatches는 모든 라우터에서 이용하기 때문에 router.use()를 통해 등록해놨음
// 그런데 이게 verifyToken 이런 것보다 먼저 있기 때문에 사용자가 누군지 알 수 없을 것 같다고 할 수 있음
// 그러나 알 수 있다!
//  - 브라우저에서 clientSecret도 보내고 이걸 보낸 도메인이 있을 것임
//      - 브라우저에서 자동으로 요청에 Origin이라는 헤더를 넣어줌
//  - 그래서 오리진과 clientSecret으로 검사를 하면 됨!
exports.corsWhenDomainMatches = async (req, res, next) => {
    const domain = await Domain.findOne({
        // origin 헤더를 가져와서 URL 분석을 통해 host만 추출
        where: { host: new URL(req.get('origin')).host },
    });
    // 도메인이 칠하는 경우에는 cors가 적용되고
    // 아니면 next()
    //  - next() 하면 cors 적용 없이 다음으로 넘어가버리면 cors 에러가 뜰 것임
    if(domain) {
        cors({
            origin: req.get('origin'), // 모든 요청을 받는 것
            // origin: 'http://localhost:8080' -> 특정 주소로 고정해놔도 됨
            credentials: true, // 쿠키 요청까지 같이 받을거라면 true로 해둬야 함
            // credentials: true일 경우 origin: '*' 이렇게 하는 경우도 있음
            //  - origin의 *은 모든 요청을 허용하겠다는 뜻
            //  - credentials가 true인 경우에는 origin에 *을 쓸 수 없음
            //  - 그럴 때는 직접 origin을 넣어주거나 true로 해서 모든 요청을 받을 수 있음
            //  - credentials는 쿠키 요청을 허용하는 것인데 origin이 *일 때는 credentials를 true로 수 없다!
        })(req, res, next);
    } else {
        next();
    }
}
// 왜 cors 설정에서는 req.get('origin')으로 했는데 domain 조회할 때는 new URL()로 감쌌을까/
//  - req.get('origin')은 앞에 http까지 붙어있음
//  - http를 떼고 싶어서 new URL()로 한 번 감싼 다음 host를 꺼내면 http가 떨어짐