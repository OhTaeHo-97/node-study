const Sequelize = require('sequelize');
const User = require('./user');
const Comment = require('./comment');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// mysql2 드라이버 사용해서 mysql, sequelize, node를 연결해주는 코드
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

db.User = User;
db.Comment = Comment;

User.initiate(sequelize);
Comment.initiate(sequelize);

User.associate(db);
Comment.associate(db);

module.exports = db;