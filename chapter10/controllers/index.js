const { User, Domain } = require('../models');
// uuid를 랜덤하게 생성해주는 라이브러리
const { v4: uuidv4 } = require('uuid');

// 로그인 화면
exports.renderLogin = async (req, res, next) => {
    try {
        // 우선 나를 찾기
        // 내 정보를 찾으면서 도메인도 같이 가져오기
        //  - 이렇게 매번 찾기 싫다면 passport/index.js의 deserializeUser에서 include에 { model: Domain } 이렇게 해도 req.user.domains에 들어있을 것임
        //  - deserializeUser에서 안하면 매번 그때그때 include해서 가져오면 됨
        // 혹시나 로그인을 하지 않았을 때 req.user?.id가 undefined가 될 수 있음
        //  - where에는 undefined가 들어가면 안됨
        //  - 그래서 혹시나 undefined 상황에는 null로 바꿔줘야 함
        // Sequelize 쓸 때의 조심할 점 -> where에는 undefined가 들어가면 안 돼서 혹시나 undefined가 나올 것 같다면 null로 바꿔줘야 함
        //  - 로그인을 안한 상태로 login.html을 렌더링하는 경우에는 req.user?.id가 undefined가 될 수 있기 때문에 null로 바꿔주자!
        const user = await User.findOne({ where: { id: req.user?.id || null }, include: { model: Domain } });
        console.log('user', user);
        // login.html 렌더링
        res.render('login', {
            user,
            domains: user?.Domains,
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.createDomain = async (req, res, next) => {
    try {
        await Domain.create({
            // 로그인한 사용자만 할 수 있으니 req.user가 있을 것임
            UserId: req.user.id,
            host: req.body.host,
            type: req.body.type,
            // uuidv4 함수를 사용해서 도메인 생성하면서 랜덤한 uuid를 이 도메인에 부여해줌
            // 그러면 이 사용자는 도메인 생성할 때 clientSecret을 랜덤한 것으로 발급받을 수 있음
            clientSecret: uuidv4()
        })
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
};