const Sequelize = require('sequelize');
const User = require('./user');
const config = require('../config/config')['test'];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe('User 모델', () => {
    test('static initiate 메서드 호출', () => {
        // User 모델에서 initiate 메서드를 호출시킨 것
        //  - 테스트하지 않았다고 뜨기 때문에 호출시킨 것
        //  - 사실 의미 없는 테스트!
        //      - 이건 테스트 커버리지를 올리기 위한 테스트일 뿐, 의미있는 테스트는 아님!
        //      - 그냥 initiate() 함수를 한 번 호출해서 이거 테스트 했다고 표시해주는 것
        //      - initiate() 함수는 return이 없기 때문에 undefined가 나옴
        //      - 그래도 한 번 호출했기 때문에 테스트가 된걸로 침
        //  - 테스트는 의미있게 하지 않으면 이런 식으로 꼼수가 난무하게 됨
        //      - 그래서 테스트를 의미있게 하는 것이 중요!
        //      - 안그럼 이렇게 테스트 커버리지만 올리고 있을 수 있음
        expect(User.initiate(sequelize)).toBe(undefined);
    })

    test('static associate 메서드 호출', () => {
        const db = {
            User: {
                hasMany: jest.fn(),
                belongsToMany: jest.fn(),
            },
            Post: {}
        }
        User.associate(db);
        // toHaveBeenCalledWith()
        //  - toBeCalledWith와 같은 기능인데 문법상 이게 더 맞음
        expect(db.User.hasMany).toHaveBeenCalledWith(db.Post);
        expect(db.User.belongsToMany).toHaveBeenCalledTimes(2);
    })
})