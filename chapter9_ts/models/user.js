"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importStar(require("sequelize"));
const post_1 = __importDefault(require("./post"));
class User extends sequelize_1.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: sequelize_1.default.STRING(40),
                allowNull: true,
                unique: true, // email이 필수는 아니지만 있으면 고유해야 함
            },
            nick: {
                type: sequelize_1.default.STRING(15),
                allowNull: false,
            },
            password: {
                type: sequelize_1.default.STRING(100), // 비밀번호는 암호화되기 때문에 길어져서 훨씬 더 많은 글자수를 차지함
                allowNull: true,
            },
            provider: {
                // Sequelize.STRING -> 사용자가 자유롭게 아무거나 입력 가능
                // Sequelize.ENUM -> 사람들이 local 혹은 kakao 둘 중 하나만 적게끔 제한을 두는 것
                type: sequelize_1.default.ENUM('local', 'kakao'),
                allowNull: false,
                defaultValue: 'local'
            },
            snsId: {
                // 소셜 로그인을 할 때 SNS ID라는 것을 줌
                // SNS 통해서 로그인하면 그 ID를 여기에 기록할 것임
                // 그러면 이것이 이메일 같은 역할을 수행할 수 있음
                //  - 만약 email이 없으면 snsId라도 있어야 로그인이 됨
                //  - snsId도 없으면 이메일로 가입한 사람
                //      - 그런 사람은 provider가 local일 것임
                // email도, snsId도 allowNull이 true면 둘 다 없어도 되는 것 아닌가?
                //  - 구조상은 그렇지만 로그인이 안 됨 -> 그러나 그런 것은 여기서 표현하기 애매함
                //  - Sequelize에서는 검사해주는 기능이 있음
                //      - 회원가입 전에 이메일이나 snsId 둘 중 하나는 존재하는지 검사할 수 있음
                //      - 그런 기능도 추가적으로 제공함 -> Sequelize에서 validation 키워드로 검색해보면 됨
                //          - 저장하기 전에 검사하는 기능을 어떻게 쓰는지 한 번 보면 좋음
                type: sequelize_1.default.STRING(30),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true, // createdAt(생성일), updatedAt(마지막 수정 시간) 컬럼을 자동으로 만들어줌
            underscored: false, // true면 created_at, updated_at 이렇게 됨
            modelName: 'User', // JS에서 쓰이는 이름
            tableName: 'users', // DB의 테이블 이름
            paranoid: true, // deletedAt 컬럼이 생김(유저 삭제 시간을 저장)
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate() {
        // 사용자 - 게시글 관계는 1대다 관계
        User.hasMany(post_1.default);
        // 팔로잉, 팔로워 -> 다대다 관계
        //  - 한 사람이 여러 명을 팔로잉 할 수 있고
        //  - 그 사람이 다른 사람에게 여러 번 팔로잉 당할 수도 있음
        // 다대다 관계 -> 중간 테이블이 하나 생김
        User.belongsToMany(User, {
            // 내가 팔로잉 하고 있는 사람을 찾으려면 내 아이디를 팔로워 아이디에서 찾아야 함
            //  - 내 아이디를 찾아야지만 내가 팔로잉하고 있는 사람을 찾을 수 있음
            //  - 그래서 foreignKey와 as가 반대인 것!
            // 유명 연예인의 팔로워를 찾고 싶으면 유명 연예인의 아이디를 찾아야 그 사람의 팔로워들을 찾을 수 있음
            // 나를 먼저 찾아야 다른 관계를 갖고 있는 사람들을 찾을 수 있다!
            foreignKey: 'followingId', // 누구를 찾는가(유명 연예인의 아이디를 찾아야지만)
            as: 'Followers', // (팔로워들을 찾을 수 있다)
            through: 'Follow'
        });
        User.belongsToMany(User, {
            foreignKey: 'followerId', // 내 아이디를 찾아야지만
            as: 'Followings', // 내가 팔로잉하는 사람을 찾을 수 있다
            through: 'Follow'
        });
    }
}
exports.default = User;
