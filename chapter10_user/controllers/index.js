const axios = require('axios');

// localhost:8080 서버에서 localhost:8081 API 서버로 요청을 보냄
// exports.test = async (req, res, next) => {
//     try {
//         if(!req.session.jwt) { // jwt 토큰이 없는 경우
//             // 토큰 발급
//             //  - 토큰 발급 주소가 http://localhost:8081/v1/token
//             //  - request body -> clientSecret
//             // 이렇게 하면 clientSecret이 올바르다는 전재 하에 토큰이 발급받아질 것임
//             const tokenResult = await axios.post('http://localhost:8081/v1/token', {
//                 clientSecret: process.env.CLIENT_SECRET
//             });
//
//             // 응답 코드가 200이라면
//             //  - 우리가 API 서버에서 토큰 발급 라우터에 응답으로 code, message, token을 보내주고 있음
//             if(tokenResult.data?.code === 200) { // 토큰 발급 성공시
//                 // 매번 토큰을 발급받는 것은 너무 낭비!
//                 // 이걸 session에 저장할 것임
//                 //  - 세션에 토큰이 있으면 굳이 새로 발급받지 않아도 됨
//                 req.session.jwt = tokenResult.data.token;
//             } else { // 토큰 발급 실패시
//                 // 실패 사유를 브라우저로 응답
//                 return res.status(tokenResult.data?.code).json(tokenResult.data);
//             }
//         }
//
//         // 세션에 jwt 토큰이 있는 경우 세션에 저장된 토큰을 쓰면 됨
//         // 세션에 jwt 토큰이 저장됐으면 발급받은 토큰이 제대로 발급받은 것인지 테스트
//         const result = await axios.get('http://localhost:8081/v1/test', {
//             headers: { authorization: req.session.jwt }
//         });
//         return res.json(result.data);
//     } catch (error) {
//         console.error(error);
//         if(error.response?.status === 419) { // 토큰 만료
//             return res.json(error.response.data);
//         }
//
//         // 토큰이 위조되었을 때 혹은 다른 에러들은 그냥 바로 에러로 처리
//         return next(error);
//     }
// }

// 자주 쓰이는 값이라 상단에 분리
const URL = process.env.API_URL;
// origin은 내 주소
//  - API 서버에 도메인을 등록해놨는데 이것이 그 도메인
//  - 우리가 API 서버에서 origin header를 보고 어떤 도메인에서 왔는지 판단하기 때문에 요청 보낼 때마다 헤더에 origin 값을 요청 보내는 주소로 넣어줘야 함
//  - 이렇게 하면 앞으로 axios 헤더 보낼 때마다 다 이 값이 들어감
axios.defaults.headers.common.origin = process.env.ORIGIN;

// 여기서 토큰 발급하고 토큰 유효기간 지났으면 재발급하고 API 요청도 하고 이런 것을 다 해볼 것임
// getMyPosts. searchByHashtag 컨트롤러 2개를 만들었는데 그럼 이 request 함수는 무엇인가?
//  - getMyPosts. searchByHashtag 이 두개에서 공통적으로 쓰이는 것들을 함수로 추출해낸 것
//  - 토큰 발급받고, 만료되었으면 갱신하고, API 요청하고 하는 작업이 똑같이 들어가기 때문에 request로 뺀 것
const request = async (req, api) => {
    try {
        if (!req.session.jwt) { // 세션에 토큰이 없으면 토큰을 발급받음
            // 토큰 발급 API 호출
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET,
            });
            // 세션에 토큰 저장
            req.session.jwt = tokenResult.data.token;
        }
        // api 주소부를 이 함수의 api 인자에 넣어줄 것임
        //  - 그래서 API 주소가 URL과 합쳐져서 완성됨
        // 토큰 발급 받고 요청을 한 번 실제로 보내봄
        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch (error) {
        if (error.response?.status === 419) { // 토큰이 유효기간이 지났다면
            // 세션에서 지움
            //  - 만료된 토큰을 굳이 메모리에 저장하고 있을 필요가 없음
            delete req.session.jwt;
            // 재귀함수로 다시 호출
            //  - 토큰이 만료되었으면 세션에서 지워버리고 재귀함수로 다시 호출하면 처음으로 돌아감
            //  - 그런데 세션에 있는 토큰을 지워버렸으니 세션에 토큰이 없고 그래서 토큰을 다시 발급받음
            //  - 토큰을 다시 발급받자마자 다시 요청을 보내면 그게 만료되어있지는 않을 것임
            // 처음에는 세션에 들어있는 토큰 사용해서 API 요청을 보내는데 혹시나 만료되었다면 한 번 더 request를 재귀적으로 호출
            // 그러면 결국에는 새로 발급받아서 새로 요청하게 됨
            return request(req, api);
        }
        // 토큰이 위조되었거나 다른 오류들
        // 에러가 발생했다고 해서 무조건 에러를 throw만 하는게 아니라 에러가 났을 때 해결을 할 수도 있음
        //  - 유효기간 지났다는 에러는 토큰을 한 번 더 발급받으면서 해결함 -> 그런 경우에는 해결한 그대로 넘어가면 됨
        // 토큰이 위조되었거나 서버 오류가 발생한 에러들은 throw 해서 다시 한 번 에러처리 미들웨어로 전달
        return error.response;
    }
}

exports.getMyPosts = async (req, res, next) => {
    try {
        // 그럼 여기에는 API 호출에 대한 결과가 들어있을 것임(결과이거나 에러이거나)
        const result = await request(req, '/posts/my');
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.searchByHashtag = async (req, res, next) => {
    try {
        const result = await request(req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.renderMain = (req, res) => {
    res.render('main', { key: process.env.CLIENT_SECRET });
}