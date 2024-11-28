"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan")); // 요청과 응답에 대한 로깅
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session")); // 로그인의 세션을 사용하기 위함
const nunjucks_1 = __importDefault(require("nunjucks")); // 화면 그릴 때 필요한 것
const dotenv_1 = __importDefault(require("dotenv")); // 환경변수를 위한 것(설정 파일).env 파일을 불러오는 모듈)
const passport_1 = __importDefault(require("passport"));
const models_1 = require("./models");
// 아래와 같이 설정하여 .env 파일에 있는 값들이 process.env 안에 들어가도록 함
dotenv_1.default.config();
// 노드버드 서비스의 페이지들을 page.js routes 안에 넣어둘 것임
const page_1 = __importDefault(require("./routes/page"));
const auth_1 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const user_1 = __importDefault(require("./routes/user"));
const passport_2 = __importDefault(require("./passport"));
const app = (0, express_1.default)();
(0, passport_2.default)();
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'html'); // 페이지 확장자는 html
// 다만 html은 nunjucks를 통해서 렌더링
nunjucks_1.default.configure('views', {
    express: app,
    watch: true,
});
models_1.sequelize.sync({ force: false })
    .then(() => {
    console.log('데이터베이스 연결 성공');
})
    .catch((err) => {
    console.error(err);
});
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/img', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, express_session_1.default)({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET, // secret은 쿠키 파서의 secret과 일치하게!
    cookie: {
        httpOnly: true, // js에서 접근 못하도록 함
        secure: false, // HTTPS 적용할 때 true로 변경(개발시에는 HTTPS를 안쓰니 false)
    },
}));
app.use(passport_1.default.initialize()); // req.user, req.login, req.isAuthenticated, req.logout
app.use(passport_1.default.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저로 전송
app.use('/', page_1.default);
app.use('/auth', auth_1.default);
app.use('/post', post_1.default);
app.use('/user', user_1.default);
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
