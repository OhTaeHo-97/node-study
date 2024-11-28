import Sequelize from 'sequelize';
import User from "./user";
import Post from "./post";
import Hashtag from "./hashtag";
const env = process.env.NODE_ENV as 'production' | 'test' || 'development';
import configObj from '../config/config';
const config = configObj[env];
const sequelize = new Sequelize.Sequelize(
    config.database, config.username, config.password, config,
);

User.initiate(sequelize);
Post.initiate(sequelize);
Hashtag.initiate(sequelize);

User.associate();
Post.associate();
Hashtag.associate();

export { User, Post, Hashtag, sequelize };