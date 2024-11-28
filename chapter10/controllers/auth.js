const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

// passport와 아무 관련이 없음
// 회원 가입은 단순히 회원 정보를 DB에만 넣으면 됨
exports.join = async (req, res, next) => {
    // 프론트에서 요청이 오면 join.html에서 /auth/join으로 POST 요청을 보냄
    // 그러면 이메일(email), 닉네임(nick), 비밀번호(password) 3개가 req.body에 담김
    //  - form이기 때문에 app.js의 app.use(express.urlencoded({ extended: false }));가 req.body를 만들어줌
    //  - app.js의 app.use(express.json());은 req.body를 ajax json 요청으로부터
    const { nick, email, password } = req.body;
    try {
        // 회원가입이라고 다짜고짜 DB에 넣는게 아니라 먼저 기존에 회원가입한 사람이 있나 검사
        //  - 해당 이메일로 가입한 유저가 있나 먼저 찾음
        const exUser = await User.findOne({ where: { email }});
        if(exUser) { // 같은 이메일로 이미 가입한 유저가 있다면
            // 이미 유저가 있다라고 에러를 보냄
            // 그러면 join.html에서 script 부분이 실행되면서 이미 존재하는 이메일입니다.라는 alert를 띄움
            return res.redirect('/join?error=exist');
        }

        // 같은 이메일로 가입한 유저가 없다면 회원가입
        // bcrypt로 비밀번호 암호화
        //  - hash()의 두 번째 인자는 높을수록 보안에 좋기는 하지만 높을수록 느림
        const hash = await bcrypt.hash(password, 12);
        // 유저 등록
        await User.create({
            email,
            nick,
            password: hash,
        });
        // 메인 화면으로 돌려보내서 로그인 할 수 있게 해줌
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// POST /auth/login
//  - 로그인은 여기로 form 요청을 할 것임
exports.login = (req, res, next) => {
    // passport.authenticate('local')를 호출해서 localStrategy를 사용해볼 것임
    //  - localStrategy를 호출함
    //  - 그럼 우리가 passport/index.js에서 localStrategy를 등록해놨기 때문에 local()을 통해 localStrategy가 호출됨
    passport.authenticate('local', (authError, user, info) => {
        if(authError) { // 서버에서 문제가 생겼을 경우(서버 실패)
            console.error(authError);
            return next(authError);
        }
        if(!user) { // 서버 에러도 아닌데 유저가 없다면 => 로직 실패
            // 에러 메시지를 띄워줌(실패 메시지가 그대로 전달됨)
            return res.redirect(`/?loginError=${info.message}`);
        }

        // 로그인 성공인 경우 user 안에 값이 들어있음
        return req.login(user, (loginError) => { // 로그인 성공
            // 로그인 과정에도 에러가 발생할 수 있음
            //  - 많이 일어나지는 않음
            //  - 그러나 노드는 사소한 에러에도 서버가 죽어버릴 수 있으니 에러 처리를 잘 해줘야 함
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        })
    })(req, res, next);
}

exports.logout = (req, res, next) => {
    req.logout(() => {
        // 로그아웃 성공시
        res.redirect('/');
    })
}