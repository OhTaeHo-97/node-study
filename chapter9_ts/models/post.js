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
const hashtag_1 = __importDefault(require("./hashtag"));
const user_1 = __importDefault(require("./user"));
class Post extends sequelize_1.Model {
    static initiate(sequelize) {
        Post.init({
            content: {
                type: sequelize_1.default.STRING(140),
                allowNull: false,
            },
            img: {
                // 이미지를 여러 개 올리고 싶다면 이미지도 별도의 테이블로 분리해서 서로간의 관계를 맺어줘야 함
                type: sequelize_1.default.STRING(200),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            paranoid: true,
            modelName: 'Post',
            tableName: 'posts',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate() {
        Post.belongsTo(user_1.default);
        // 게시글 - 해시태그도 다대다 관계
        // 왜 이 둘은 as, foreignKey를 안 적나?
        //  - 서로 테이블 이름이 달라서 헷갈릴 염려가 거의 없어서 안 적음
        Post.belongsToMany(hashtag_1.default, { through: 'PostHashtag' });
    }
}
exports.default = Post;
