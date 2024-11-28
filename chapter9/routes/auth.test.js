const app = require('../app');
const request = require('supertest');
// 단위 테스트에서는 sequelize를 mocking했었는데 이번에는 sequelize를 직접 불러와서 연결해줌
// 아예 DB쪽까지 제대로 동작하는지 확인하는 테스트
const { sequelize } = require('../models');

// 문제가 우리가 서버를 실행한게 아니기 때문에 DB와 연결이 안되어 있을 수 있음
//  - 그래서 테스트하기 전에 DB와 연결해주고 싶다면 beforeAll()을 활용
// beforeAll() => 이 파일에 적혀있는 모든 테스트가 실행하기 전에 딱 한 번만 하는 것
// afterAll() => 모든 테스트가 끝나고 난 후 한 번만 호출되는 함수
// 각 테스트를 수행하기 전에 DB와 연결을 맺고 테스트를 수행하도록 코드를 짤 수 있음
// beforeEach() => 각각의 테스트가 실행되기 전에 실행되는 함수
// afterEach() => 각각의 테스트가 끝나고 난 후 실행되는 함수
// beforeAll, afterAll, beforeEach, afterEach 등을 조절해서 테스트 하기 전, 테스트 끝나고 난 후 뭔가를 해야한다고 하면 이런 함수들을 활용해 할 수 있음
beforeAll(async () => {
    await sequelize.sync({ force: true });
})

describe('POST /join', () => {
    test('로그인 안 했으면 가입', (done) => {
        request(app).post('/auth/join')
            .send({
                email: 'dhxogh123123@naver.com',
                nick: 'zerocho',
                password: 'test1111!'
            })
            .expect('Location', '/')
            .expect(302, done);
    })

    test('회원가입 이미 했는데 또 하는 경우', (done) => {
        request(app).post('/auth/join')
            .send({
                email: 'dhxogh123123@naver.com',
                nick: 'zerocho',
                password: 'test1111!'
            })
            .expect('Location', '/join?error=exist')
            .expect(302, done);
    })

    // 로그인한 상태에서 회원가입을 하는 경우
    //  - isNotLoggedIn에 걸릴 것임
    // 조심해야할 점
    //  - 테스트 하기 전에 로그인을 시켜야 하는데 테스트 진행하기 전에 이 describe 블럭에 beforeEach()를 쓸 수도 있지만 그럼 위에 다른 테스트들에도 모두 영향을 미침
    //  - 우리는 로그인한 상태에서 회원가입을 하는 경우 테스트에 대해서만 로그인을 시켜야 함!
    //  - 그래서 이러한 것을 막아주려면 테스트를 분리해주면 됨!
})

describe('POST /join', () => {
    const agent = request.agent(app);
    // beforeEach도 beforeEach가 언제 끝났는지 알아야 그 다음에 테스트로 넘어감
    // 그래서 done이 필요!
    //  - send() 뒤에 done()을 호출해줄 end(done)을 붙여줌!
    beforeEach((done) => {
        agent.post('/auth/login')
            .send({
                email: 'dhxogh123123@naver.com',
                password: 'test1111!'
            })
            .end(done);
    });

    // 이 테스트가 실행되기 전에 로그인을 시킨 다음 다시 회원가입
    test('로그인했으면 회원가입 진행이 안 되어야 함', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent.post('/auth/join')
            .send({
                email: 'dhxogh123123@naver.com',
                nick: 'zerocho',
                password: 'test1111!'
            })
            .expect('Location', `/?error=${message}`)
            .expect(302, done);
    })
})

describe('POST /login', () => {
    test('로그인 수행', (done) => {
        // supertest는 기본적으로 request(app)을 함
        //  - express app을 request의 인수로 넣어줌
        // .post('/auth/login')
        //  - 우리가 post /auth/login 요청을 함
        //  - 위 코드처럼 작성하면 우리가 app에 실제 /auth/login 요청을 날리는 셈이 됨
        // 로그인 하면서 아아디와 비밀번호를 req.body로 전달해줘야 함
        //  - send()라는 메서드에서 req.body를 넣어줄 수 있음
        //  - 나중에 게시글 업로드 같은 것도 게시글을 send()에 담아서 전송해줄 수 있음
        // 요청을 제대로 보내면 우리는 로그인이 제대로 되었다는 가정 하에 res.redirect('/')가 실행되기를 기대함
        //  - res.redirect('/')가 실행됐다는 뜻은 응답 헤더에 Location: /이 있다는 뜻
        //  - 그리고 redirect()를 하면 HTTP 상태코드가 302가 됨
        // request는 비동기!
        //  - 그러므로 이 함수가 진짜 언제 끝나는지를 jest에게 알려줘야 함
        //  - 우리가 비동기 테스트를 한 적이 있음
        //      - service 테스트하는 데에서도 했었음
        //      - 그런데 service에서는 done이 없었던 이유가 async await으로 함수를 만들면 await 걸린 함수가 다 끝나는 순간에 expect가 실행됨
        //      - 그러면 jest가 test가 끝났다는 것을 알아차릴 수 있음
        //  - 그런데 문제가 Promise를 사용하지 않고 async 함수 이런 것이 아닌 경우에는 비동기일 때 jest가 비동기 함수가 언제 끝나는지를 모르는 상황이 발생
        //      - done()을 호출해주면 테스트가 끝났다는 것을 jest가 알아차림!
        //      - done()을 호출하지 않으면 jest가 하염없이 기다리다가 이 테스트를 실패로 처리해버림
        //      - 그래서 done()을 어딘가에서 호출해줘야 하는데 done()은 보통 status code 뒷 부분에 done을 넣어주면 expect() 메서드가 알아서 테스트 끝나고 나서 done()을 호출
        //  - 그래서 비동기인데 Promise가 아닌 것들은 done() 함수를 마지막에 호출해줘야 jest가 이 테스트가 끝났는지를 알게 됨!
        request(app).post('/auth/login')
            .send({
                email: 'dhxogh123123@naver.com',
                password: 'test1111!'
            })
            .expect('Location', '/')
            .expect(302, done);
    });

    test('가입되지 않은 회원', (done) => {
        const message = '가입되지 않은 회원입니다.';
        request(app).post('/auth/login')
            .send({
                email: 'dhxogh125@gmail.com',
                password: 'test1111!'
            })
            .expect('Location', `/?loginError=${encodeURIComponent(message)}`)
            .expect(302, done);
    })

    test('비밀번호 틀림', (done) => {
        const message = '비밀번호가 일치하지 않습니다.';
        request(app).post('/auth/login')
            .send({
                email: 'dhxogh123123@naver.com',
                password: 'test2222!'
            })
            .expect('Location', `/?loginError=${encodeURIComponent(message)}`)
            .expect(302, done);
    })
})

describe('GET /logout', () => {
    test('로그인되어 있지 않으면 403', (done) => {
        request(app).get('/auth/logout')
            .expect(403, done);
    });

    const agent = request.agent(app);
    beforeEach((done) => {
        agent.post('/auth/login')
            .send({
                email: 'dhxogh123123@naver.com',
                password: 'test1111!'
            })
            .end(done);
    })

    test('로그아웃 수행', (done) => {
        agent.get('/auth/logout')
            .expect('Location', '/')
            .expect(302, done);
    })
})