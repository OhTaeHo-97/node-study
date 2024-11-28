const Sequelize = require('sequelize');
const fs = require('fs'); // 폴더나 파일을 읽을 수 있는 모듈
const path = require('path'); // 읽을 파일 경로 가져와야 하니 필요
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

const basename = path.basename(__filename); // index.ts
// 폴더를 읽음(models를 읽음)
// path는 직접 경로를 적는 것보다 path.join(), __dirname, __filename 같은 것을 활용하는 것이 좋음!
//  - 직접 적으면 오타날 수 있음
// fs.readdirSync()를 통해 models를 읽으면 models 안에 있는 파일들이 모두 적힘
//  - index.ts, hastag.js, post.ts, user.ts
//  - 여기서 index.js는 제외해야 함 -> 이것은 모델이 아님!
//  -
fs.readdirSync(__dirname)
    .filter(file => {
        // 리눅스에서는 앞에 .이 붙으면 숨김 파일
        //  - ex. .env -> 앞에 .이 붙어있으니 숨김 파일
        // file.index('.') !== 0을 통해 .으로 시작하는 파일이 있으면 숨김 파일이니 그런 것은 걸러내기
        // js 확장자가 아닌 다른 파일이 있다면 그것도 file.slice(-3) === '.js'로 걸러내기
        //  - 파일 이름의 마지막 3자리는 항상 .js여야 한다는 것을 의미
        return file.indexOf('.') !== 0 && !file.includes('test') && file !== basename && file.slice(-3) === '.js';
    })
    .forEach((file) => {
        // models 폴더 안에 있는 hashtag.ts, post.ts, user.js를 읽음
        //  - common js는 다이나믹 import 가능!
        const model = require(path.join(__dirname, file));
        // model.name -> 클래스 이름이 됨
        console.log(file, model.name);
        // 쉽게 쓸 수 있게 db 객체에 모델들을 다 넣어줬는데 그걸 위해 아래 코드 만듬
        db[model.name] = model;
        // initiate()를 해줌
        model.initiate(sequelize);
        // models 폴더에 파일들이 몇 개가 있건간에 불필요한 파일을 제외하고 모델 파일들만 불러와서 db에도 넣어주고 initiate()도 한 번씩 다 호출했음
    });

// db 객체에 있는 것들을 다시 불러와서 associate()가 있다면 호출
//  - 위에서 initiate()한 모델들을 associate해주고 있음
// 왜 위에서 associate()를 같이 호출하지 않았나?
//  - 순서가 있음!
//  - initiate를 전부 다 하고 나서 associate를 해야 함
//  - 그래서 어쩔 수 없이 initiate를 먼저 다 하게 만든 다음 그것들을 다시 associate 시켜줌
Object.keys(db).forEach(modelName => {
    // console.log(db, modelName);
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// db.User = User;
// db.Post = Post;
// db.Hashtag = Hashtag;

// User.initiate(sequelize);
// Post.initiate(sequelize);
// Hashtag.initiate(sequelize);
//
// User.associate(db);
// Post.associate(db);
// Hashtag.associate(db);

module.exports = db;