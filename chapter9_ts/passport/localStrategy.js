"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.default = () => {
    // passport에 LocalStrategy라는 것을 미리 등록해놓는 것
    //  LocalStrategy - 이메일 로그인 했을 때 어떻게 할지
    passport_1.default.use(new passport_local_1.Strategy({
        // 즉, req.body.email을 username으로 치고, req.body.password를 password로 치겠다라고 하는 뜻
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
        passReqToCallback: false // true로 하면 다음 인자인 함수의 시작이 req가 됨
        //  - 즉, async (req, email, password, done) 이렇게 됨
        // false로 한다면 req가 빠짐
        //  - 우리는 request가 필요없기 때문에 false로 함
    }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        // 로그인 전략에서는 이 사람을 로그인을 시켜야하는지 아닌지 판단
        try {
            // 우선 그 사람(이메일)이 있는지 판단
            const exUser = yield user_1.default.findOne({ where: { email } });
            if (exUser) { // 이메일 있으면
                // 비밀번호 비교
                // bcrypt를 이용하여 비교하는 것은 compare()를 이용
                //  - bcrypt : 암호화, 비교 모두 해줌
                // 사용자가 입력한 비밀번호와 DB에 저장된 비밀번호가 일치하는지 확인
                const result = yield bcrypt_1.default.compare(password, exUser.password);
                if (result) { // 일치한다면
                    // done(서버 실패, 성공유저, 로직실패)
                    //  - 서버 실패 : DB에 요청을 보냈는데 DB에서 실패하거나, 문법이 틀렸거나 하는 경우
                    //      - 애초에 시스템이 망가질 정도의 에러가 발생했을 때 서버 실패를 전달해줌
                    //  - 성공 유저 : 사용자 이메일도 있고 그 이메일 비밀번호를 비교했을 때 그것도 통과됐다면 로그인 된 것이니 로그인 시켜줘야 함
                    //      - 그럴 때는 두 번째 정보에 사용자 정보를 넣어줌
                    //      - 즉, 아래 써놓은 done(null, exUser);는 성공인 것
                    //  - 로직 실패 : 서버에 에러도 없는데 로그인은 시켜주면 안 되는 경우
                    //      - 세 번째 인자에 실패 이유를 적어줌
                    done(null, exUser);
                }
                else {
                    // 로직 실패를 전달해줌
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            }
            else {
                // 로직 실패를 전달해줌
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        }
        catch (error) {
            console.error(error);
            // 서버 실패를 전달해준 것
            done(error);
        }
    })));
};
// LocalStrategy에서는 실제로 로직을 수행해서 성공시킬지 실패시킬지, 예상치 못한 에러로 서버가 죽을 것 같을 때 done(error)를 통해 알려줌
// 서버 실패, 성공 유저, 로직 실패를 done()에 적어줌
// done()이 호출되는 순간 controllers/auth.js의 login의 passport.authenticate()의 두 번째 인자인 함수 부분으로 감
//  - 그래서 해당 함수를 보면 authError, user, info 세 개의 인자가 있는데 각각이 서버 실패, 성공 유저, 로직 실패를 나타냄
//  - done에 넣었던 3개가 그대로 이 함수를 호출하는 것!
