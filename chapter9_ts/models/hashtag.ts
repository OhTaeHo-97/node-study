import Sequelize, {BelongsToManyGetAssociationsMixin, CreationOptional, Model} from 'sequelize';
import Post from './post';

class Hashtag extends Model {
    declare id: CreationOptional<number>;
    declare title: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    declare getPosts: BelongsToManyGetAssociationsMixin<Post>;

    static initiate(sequelize: Sequelize.Sequelize) {
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

    static associate() {
        // User와 User는 둘 다 똑같이 이름이 User
        //  - 둘이 뭐가 뭐인지 모를 수 있으니 foreignKey, as를 적어주는 것
        Hashtag.belongsToMany(Post, { through: 'PostHashtag' })
    }
}

export default Hashtag;