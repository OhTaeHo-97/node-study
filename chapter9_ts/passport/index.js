"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const localStrategy_1 = __importDefault(require("./localStrategy")); // 이메일 로그인
const kakaoStrategy_1 = __importDefault(require("./kakaoStrategy")); // 카카오 로그인
// 회원가입을 시킬 것이니 유저 테이블에 데이터를 저장해야 함
const user_1 = __importDefault(require("../models/user"));
// passport 설정
// 이 함수가 app.js의 passportConfig 쪽으로 불러와져서 실행됨
//  - app.js -> 우주선의 관제실(몸통)
//      - 그래서 각각의 모듈들(route 모듈, sequelize 모듈, passport 모듈)을 만들어서 그 모듈들을 가져다 app.js에 붙이고 있음
//      - app.js가 몸통이고 우리는 각각의 기능들을 모듈로 만들어서 app.js에 붙이고 있음
exports.default = () => {
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id); // user id만 추출
    });
    passport_1.default.deserializeUser((id, done) => {
        user_1.default.findOne({
            where: { id },
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'nick'],
                    as: 'Followers',
                }, // 팔로잉
                {
                    model: user_1.default,
                    attributes: ['id', 'nick'],
                    as: 'Followings',
                }, // 팔로워
            ],
        })
            .then((user) => done(null, user))
            .catch(err => done(err));
    });
    (0, localStrategy_1.default)();
    (0, kakaoStrategy_1.default)();
};
