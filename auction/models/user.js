const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            money: {
                // 그 사람이 돈을 얼마나 갖고 있는지에 대한 정보
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            }
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 사용자가 입찰을 여러 번 할 수 있기 때문에 1:N 관계
        db.User.hasMany(db.Auction);
    }
}

module.exports = User;