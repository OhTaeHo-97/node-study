const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');

dotenv.config();
const indexRouter = require('./routes');
const userRouter = require('./routes/user');

const app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
// app.use(morgan('combined'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: "session-cookie",
}));

app.use('/', indexRouter);
app.use('/user', userRouter);

// app.get('/upload', (req, res) => {
//     res.sendFile(path.join(__dirname, 'multipart.html'));
// });
//
// app.post('/upload', upload.single('image'), (req, res) => {
//     console.log(req.file);
//     res.send('ok');
// });
//
// app.get('/', (req, res, next) => {
//     console.log('GET / 요청에서만 실행됩니다.');
//     next();
// }, (req, res) => {
//     throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
// });

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use((err
         , req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log('익스프레스 서버 실행');
});