const http = require('http'); // 노드가 http 서버 쉽게 만들 수 있도록 제공

// 클라이언트가 누가 될지는 모르지만 우리가 만들고 실행한 서버로 요청이 올 것임
// 요청이 오면 아래 함수가 실행되고 이 함수에서 응답을 어떻게 보내줄지 작성
// 응답을 거부할 수도 있음
//  - 요청을 보낸 사람이 해커(악성 유저)로 판단되면 응답을 거부할 수 있음
//  - 여기서 판단해서 코딩하면 되는데 문제는 판단을 우리가 직접 해야 함
http.createServer((req, res) => {
    res.write('<h1>Hello Node!</h1>');
    res.write('<p>Hello Server</p>');
    res.end('<p>Hello ZeroCho</p>');
})
    .listen(8080, () => {
        console.log('8080번 포트에서 서버 대기 중입니다.');
    });