import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import User from '../models/user';

export default () => {
    // passport.authenticate('kakao', () => {})를 호출하면 여기서 passport에 등록하는 KakaoStrategy가 호출됨
    // localStrategy에서는 email, password, done을 인자로 하는 함수를 생성했었음
    // 카카오에서는 accessToken, refreshToken, profile, done으로 나뉨
    passport.use(new KakaoStrategy({
        // 이건 passport-kakao 공식 문서를 보는 것이 좋다!
        //  - 원리에 대한 이해가 필요함
        // 여기에 설정들을 해줌
        clientID: process.env.KAKAO_ID!,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => { // 콜백
        // accessToken, refreshToken은 카카오에서 보내주기는 하는데 쓰지는 않을 것임
        //  - accessToken, refreshToken은 카카오 API를 호출하는 데에 사용됨
        //  - 카카오 API를 호출할거면 API를 호출하면서 accessToken을 넣으라는 부분이 있을텐데 거기에 accessToken을 같이 넣어주면 됨
        // profile : 여기에 보통 사용자 정보가 들어있음
        //  - 이 정보가 카카오톡 마음대로 계속 바뀜
        //  - 그래서 항상 console.log()를 찍어보며 어떻게 바뀌는지 추적해보는 것이 좋음!
        console.log('profile', profile);
        try {
            // 기존 유저를 찾음
            // 카카오 로그인에서는 이메일이 없고 snsId를 대신해서 사용
            //  - profile.id가 snsId 역할을 해줌
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: 'kakao' }
            });

            console.log('exUser:', exUser);

            // strategy에서 회원가입과 로그인을 동시에 해줌!
            if(exUser) { // 사용자가 있다면 로그인
                done(null, exUser);
            } else { // 사용자가 없다면 회원가입
                const newUser = await User.create({
                    // 우선 강의를 찍었을 때의 상황은 여기에 이메일이 들어있는데
                    // 만약 오류가 난다면 console.log()를 찍은 것을 보고 찾아보자!
                    email: profile._json?.kakao_account?.email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                // 회원가입을 시킨 다음에도 done()으로, 로그인할 때에도 done()
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }))
};