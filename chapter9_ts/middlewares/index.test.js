const { isLoggedIn, isNotLoggedIn } = require('./');

// 이렇게 우리가 시나리오를 세우는 것
// isLoggedIn은 로그인 되어있으면 next()를 호출하고, 로그인 되어있지 않으면 403 에러를 응답해야 함
// 보통 단위 테스트에 대한 시나리오는 if문을 기점으로 생긴다고 보면 됨
describe('isLoggedIn', () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함', () => {
        // next라는 함수가 있고, next를 호출하는가를 테스트하고 싶음
        // next가 호출되었는지 테스트해보고 싶을 때는 아래와 같이 작성하면 됨
        //  - toBeCalled() -> 호출되었는지 알고 싶을 때 이용
        //  - toBeCalledTimes(1) -> 몇 번 호출되었는지까지 더 구체적으로 테스트하고 싶을 때 이용
        //      - 우리 코드를 보면 next가 딱 한 번만 호출되어서 이를 이용
        // 대신 isLoggedIn을 먼저 호출해주어야 함
        //  - isLoggedIn이 호출되어야 next가 호출되었는지 알 수 있음
        //  - isLoggedIn 함수가 먼저 실행되어야지만 그 안에 next가 한 번만 호출되는지 알 수 있음
        //  - 그런데 isLoggedIn은 req, res, next를 매개변수로 받음
        //  - 그럼 여기서 req, res, next를 어떻게 만들어줄까?
        //      - mocking이라는 개념이 나옴!
        //      - express의 req, res, next가 원래는 express 것이어야 하는데 express 것이 뭔지 우리가 모름
        //      - 그렇기 때문에 req, res, next를 테스트 통과할 정도로만 우리가 가짜로 만드는 것!
        // 그러나 문제는 일반 함수들은 toBeCalledTimes가 인식이 안됨
        //  - jest에서는 호출 횟수를 기록해주는 함수가 있음 -> jest.fn();
        // const res = {
        //     status: jest.fn(() => res),
        //     send: jest.fn(),
        // };
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        // const next = function () {};
        // 이렇게 하면 next는 jest가 추적하는 함수가 됨
        //  - 이제 isLoggedIn에서 이 next가 호출되면 횟수를 셀 수 있음
        // const next = jest.fn();
        isLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1)
    });

    test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함', () => {
        // 에러를 응답한다는 것은 res.status(), res.send()가 호출됐다는 것!
        // const res = {
        //     status: jest.fn(() => res),
        //     send: jest.fn(),
        // };
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        // const next = jest.fn();

        isLoggedIn(req, res, next);
        // 매개변수도 추적할 수 있음! -> toBeCalledWith()
        //  - 우리가 로그인 되어있지 않을 때 res.status()가 403과 함께 호출되는 것을 볼 수 있음
        expect(res.status).toBeCalledWith(403);
        // res.send()는 '로그인 필요'와 함께 호출되는 것을 볼 수 있음
        expect(res.send).toBeCalledWith('로그인 필요');
    });
})

// isNotLoggedIn도 if문을 기점으로 보면 로그인 되어있지 않으면 next() 호출, 로그인 되어있으면 res.redirect() 호출
//  - 이런 식으로 시나리오를 세워볼 수 있음
describe('isNotLoggedIn', () => {
    const res = {
        redirect: jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };

        isNotLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인한 상태입니다.');
        expect(res.redirect).toBeCalledWith(`/?error=${message}`);
    });

    test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };

        isNotLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });
})