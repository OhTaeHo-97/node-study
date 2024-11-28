import express, {ErrorRequestHandler} from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan'; // 요청과 응답에 대한 로깅
import path from 'path';
import session from 'express-session'; // 로그인의 세션을 사용하기 위함
import nunjucks from 'nunjucks'; // 화면 그릴 때 필요한 것
import dotenv from 'dotenv'; // 환경변수를 위한 것(설정 파일).env 파일을 불러오는 모듈)
import passport from 'passport';
import { sequelize } from './models';

// 아래와 같이 설정하여 .env 파일에 있는 값들이 process.env 안에 들어가도록 함
dotenv.config();
// 노드버드 서비스의 페이지들을 page.ts routes 안에 넣어둘 것임
import pageRouter from './routes/page';
import authRouter from './routes/auth';
import postRouter from './routes/post';
import userRouter from './routes/user';
import passportConfig from './passport';

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
    secret: process.env.COOKIE_SECRET!, // secret은 쿠키 파서의 secret과 일치하게!
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

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

// 익명 함수가 그대로 들어있어서 타이핑을 어떻게 해야하나 할 때는 변수로 분리를 해서 타이핑을 해주면 됨!
//  - 변수로 분리해서 그 변수에 타이핑을 하고 타이핑이 된 변수를 다시 쓰면 됨
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
};
app.use(errorHandler);

export default app;