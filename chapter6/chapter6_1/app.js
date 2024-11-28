const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');

const app = express();

app.set('port', process.env.PORT || 8080);

app.use(morgan('dev'));
// app.use(morgan('combined'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('zerochopassword'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'zerochopassword',
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: "session-cookie",
}));

// app.use((req, res, next) => {
//     console.log('1 요청에 실행하고 싶어요.');
//     next();
// }, (req, res, next) => {
//     try {
//         console.log(variable);
//     } catch (error) {
//         next(error);
//     }
// }
// //     (req, res, next) => {
// //     console.log('2 요청에 실행하고 싶어요.');
// //     next();
// // }, (req, res, next) => {
// //     console.log('3 요청에 실행하고 싶어요.');
// //     next();
// // },
// //     (req, res) => {
// //     throw new Error('에러가 났어요.');
// // }
// )

app.get('/', (req, res) => {
    req.cookies // { mycookie: 'test' }
    // 'Set-Cookie': `name=${encodeURIComponent(name)}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`
    res.cookies('name', encodeURIComponent(name), {
        expires: new Date(),
        httpOnly: true,
        path: '/',
    })
    res.clearCookie('name', encodeURIComponent(name), {
        httpOnly: true,
        path: '/',
    });
    // res.send('hello express');
    res.sendFile(path.join(__dirname, 'indexWs.html'));
    // res.send('안녕하세요.');
    // res.json({ hello: 'zerocho' });
});

app.get('/category/Javascript', (req, res) => {
    res.send('hello Javascript');
})

app.get('/category/:name', (req, res) => {
    res.send(`hello ${req.params.name}`);
})

app.post('/', (req, res) => {
    res.send('hello express');
});

app.get('/about', (req, res) => {
    res.send('hello express');
});

// app.get('*', (req, res) => {
//     res.send('hello everybody');
// });

app.use((req, res, next) => {
    res.send('404지롱');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.send('에러났지롱. 근데 안 알려주지롱');
})

app.listen(app.get('port'), () => {
    console.log('익스프레스 서버 실행');
});