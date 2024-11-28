const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); // 요청과 응답에 대한 로깅
const path = require('path');
const session = require('express-session'); // 로그인의 세션을 사용하기 위함
const nunjucks = require('nunjucks'); // 화면 그릴 때 필요한 것
const dotenv = require('dotenv'); // 환경변수를 위한 것(설정 파일)(.env 파일을 불러오는 모듈)
const passport = require('passport');
const { sequelize } = require('./models');

// 아래와 같이 설정하여 .env 파일에 있는 값들이 process.env 안에 들어가도록 함
dotenv.config();
// 노드버드 서비스의 페이지들을 page.ts routes 안에 넣어둘 것임
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const passportConfig = require('./passport');

const app = express();
passportConfig();
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'html'); // 페이지 확장자는 html
// 다만 html은 nunjucks를 통해서 렌더링
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({ force: false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET, // secret은 쿠키 파서의 secret과 일치하게!
    cookie: {
        httpOnly: true, // js에서 접근 못하도록 함
        secure: false, // HTTPS 적용할 때 true로 변경(개발시에는 HTTPS를 안쓰니 false)
    },
}));
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticated, req.logout
app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저로 전송

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

// 404(프론트에서 요청 보냈는데 pageRouter에 안 걸리는 경우)
//   없는 페이지에 온 경우에는 404 NOT FOUND 응답해주기 위함
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

// 에러처리 미들웨어
//  - 함수 안에 4개의 매개변수
//  - 서버는 최소 두 개로 나뉨(테스트 모드까지 추가되어 3개가 될 수 있음, 물론 더 있을 수 있음)
//      - 배포 모드일 때와 아닐 때
//      - 배포 모드가 아닐 때 -> 개발 모드
//      - 일반적으로 배포 모드, 개발 모드로 나뉨
//  - 에러 처리 미들웨어에서 배포 모드가 아닐 때는 에러를 넣어주는데 배포 모드일 때는 에러를 넣지 않음
//      - 에러 메시지를 그대로 노출하는 것도 보안에 위협이 될 수 있음 -> 그래서 배포 모드일 때는 오히려 에러를 숨김(화면에 에러가 안 뜨게 함)
//      - 개발 모드일 때만 에러가 뜨게 만듬
//  - 운영시에도 에러를 보고 문제를 해결할 수 있는데 그걸 어떻게 해야 하나?
//      - 보통 여기서 에러만 전문적으로 로깅해주는 서비스가 있음
//      - 나중에 운영하다가 에러만 모아서 볼 수 있게 해주는 서비스가 있는데 그런 서비스에 넘김
//      - 그래서 보통 그런 서비스에 넘기고 사용자 화면에다가 에러를 표시하는 것은 안 좋음 -> 해커들이 그걸 보고 거꾸로 서버를 유추해 공격할 수 있음
//      - 그래서 개발 모드일 때는 에러를 표시하지만 배포 모드에서는 에러를 화면에 표시하지 않음
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// app.listen(app.get('port'), () => {
//     console.log(app.get('port'), '번 포트에서 대기 중');
// });

module.exports = app;