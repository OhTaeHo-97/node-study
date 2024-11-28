const Sequelize = require('sequelize');

class Post extends Sequelize.Model {
    static initiate(sequelize) {
        Post.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },
            img: {
                // 이미지를 여러 개 올리고 싶다면 이미지도 별도의 테이블로 분리해서 서로간의 관계를 맺어줘야 함
                type: Sequelize.STRING(200),
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
        })
    }

    static associate(db) {
        db.Post.belongsTo(db.User);
        // 게시글 - 해시태그도 다대다 관계
        // 왜 이 둘은 as, foreignKey를 안 적나?
        //  - 서로 테이블 이름이 달라서 헷갈릴 염려가 거의 없어서 안 적음
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    }
}

module.exports = Post;