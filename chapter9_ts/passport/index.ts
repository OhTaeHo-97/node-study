import passport from 'passport';
import local from './localStrategy'; // 이메일 로그인
import kakao from './kakaoStrategy'; // 카카오 로그인
// 회원가입을 시킬 것이니 유저 테이블에 데이터를 저장해야 함
import User from '../models/user';

// passport 설정
// 이 함수가 app.js의 passportConfig 쪽으로 불러와져서 실행됨
//  - app.js -> 우주선의 관제실(몸통)
//      - 그래서 각각의 모듈들(route 모듈, sequelize 모듈, passport 모듈)을 만들어서 그 모듈들을 가져다 app.js에 붙이고 있음
//      - app.js가 몸통이고 우리는 각각의 기능들을 모듈로 만들어서 app.js에 붙이고 있음
export default () => {
    passport.serializeUser((user, done) => { // user == exUser
        done(null, user.id); // user id만 추출
    });

    passport.deserializeUser((id: number, done) => {
        User.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'nick'],
                    as: 'Followers',
                }, // 팔로잉
                {
                    model: User,
                    attributes: ['id', 'nick'],
                    as: 'Followings',
                }, // 팔로워
            ],
        })
            .then((user) => done(null, user))
            .catch(err => done(err));
    });

    local();
    kakao();
}
