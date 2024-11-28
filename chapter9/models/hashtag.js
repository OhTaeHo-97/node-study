const Sequelize = require('sequelize');

class Hashtag extends Sequelize.Model {
    static initiate(sequelize) {
        Hashtag.init({
            title: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            paranoid: true,
            modelName: 'Hashtag',
            tableName: 'hashtags',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        // User와 User는 둘 다 똑같이 이름이 User
        //  - 둘이 뭐가 뭐인지 모를 수 있으니 foreignKey, as를 적어주는 것
        db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' })
    }
}

module.exports = Hashtag;