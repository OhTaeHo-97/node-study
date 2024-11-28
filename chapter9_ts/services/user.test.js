jest.mock('../models/user');
const User = require('../models/user');
const { follow } = require('./user');

// 실무에서 컨트롤러, 서비스 하나씩 만들 때마다 테스트를 전부 해줌
describe('follow', () => {
    test('사용자를 찾아 팔로잉을 추가하고 ok를 반환함', async () => {
        User.findOne.mockReturnValue({
            addFollowing(id) {
                return Promise.resolve(true);
            }
        });
        const result = await follow(1, 2);
        expect(result).toEqual('ok');
    });
    test('사용자를 못 찾으면 no user를 반환함', async () => {
        User.findOne.mockReturnValue(null);
        const result = await follow(1, 2);
        expect(result).toEqual('no user');
    });
    test('DB에서 에러가 발생하면 throw', async () => {
        const message = 'DB에러';
        User.findOne.mockReturnValue(Promise.reject(message));
        try {
            await follow(1, 2);
        } catch (err) {
            expect(err).toEqual(message);
        }
    })
});