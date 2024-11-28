// jest.mock('../models/user');
// const User = require('../models/user');
// const { follow } = require('./user');
//
// describe('follow', () => {
//     test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함', async () => {
//         const res = {
//             send: jest.fn(),
//         }
//         const req = {
//             user: { id: 1 },
//             params: { id: 2 },
//         };
//         const next = jest.fn();
//         User.findOne.mockReturnValue({
//             addFollowing(id) {
//                 return Promise.resolve(true);
//             }
//         })
//         await follow(req, res, next);
//         expect(res.send).toBeCalledWith('success');
//     });
//
//     test('사용자를 못 찾으면 res.status(404).send(no user)를 호출함', async () => {
//         const res = {
//             status: jest.fn(() => res),
//             send: jest.fn(),
//         }
//         const req = {
//             user: { id: 1 },
//             params: { id: 2 },
//         };
//         const next = jest.fn();
//         User.findOne.mockReturnValue(null);
//         await follow(req, res, next);
//         expect(res.status).toBeCalledWith(404);
//         expect(res.send).toBeCalledWith('no user');
//     });
//
//     test('DB에서 에러가 발생하면 next(error)를 호출함', async () => {
//         const req = {
//             user: { id: 1 },
//             params: { id: 2 },
//         };
//         const res = {};
//         const next = jest.fn();
//         const message = 'DB에러';
//         await User.findOne.mockReturnValue(Promise.reject(message));
//         // follow는 Promise 함수
//         //  - async가 Promise이기 때문에
//         await follow(req, res, next);
//         // 에러를 직접 만들어줘야 함
//         expect(next).toBeCalledWith(message);
//     });
// })

jest.mock('../services/user');
const { follow } = require('./user');
const { follow: followService } = require('../services/user');

describe('follow', () => {
    const req = {
        user: { id: 1 },
        params: {id: 2 },
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함', async () => {
        followService.mockReturnValue('ok');
        await follow(req, res, next);
        expect(res.send).toBeCalledWith('success');
    });
    test('사용자를 못 찾으면 res.status(404).send(no user)를 호출함', async () => {
        followService.mockReturnValue('no user');
        await follow(req, res, next);
        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith('no user');
    })
    test('DB에서 에러가 발생하면 next(error)를 호출함', async () => {
        const message = 'DB에러';
        followService.mockReturnValue(Promise.reject(message));
        await follow(req, res, next);
        expect(next).toBeCalledWith(message);
    })
})