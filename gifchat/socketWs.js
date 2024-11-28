const WebSocket = require('ws'); // 웹 소켓 모듈 통해서 WebSocket 가져옴

// app.js에서 webSocket(server)로 서버와 연결해줬음
//  - webSocket 함수에 server가 들어감
//  - 그 server가 아래 server 변수에 들어감
module.exports = (server) => {
    // 이렇게 하면 웹 소켓과 express 서버가 연결됨!
    const wss = new WebSocket.Server({ server });

    // 웹 소켓 연결을 맺을 때 처음 한 번은 클라이언트에서 서버로 연결을 맺어줘야 함
    wss.on('connection', (ws, req) => {
        // 처음 한 번 연결을 맺을 때 이 부분이 실행됨

        // 웹 소켓 연결을 맺을 때 서버의 ip 같은 것을 찾을 수 있음
        // ip를 가져오는 유명한 방법이 아래와 같음
        //  - 예전에는 req.socket.remoteAddress 이 부분이 req.connection.remoteAddress였음
        //  - connection은 옛날 코드!
    // 이렇게 하면 클라이언트의 IP를 가져올 수 있음!
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log('새로운 클라이언트 접속', ip);

        // 클라이언트로부터 메시지가 오면
        ws.on('message', (message) => {
            // message는 buffer이기 때문에 toString() 해줘야 우리가 읽을 수 있는 문자열이 됨
            //  - 웹 소켓 7버전에서는 message가 string이었는데 8버전에서 buffer로 바뀜
            console.log(message.toString());
        })

        // 에러 발생하면 에러 표시
        ws.on('error', console.error);

        // 웹 소켓이 종료된다면(클라이언트가 연결을 끊었다면)
        ws.on('close', () => {
            // 누가 끊었는지 확인
            console.log('클라이언트 접속 해제', ip);
            // 클라이언트와 연결이 끊어졌으면 3초마다 보내는 행동을 중단해야 함
            //  - 그래야 setInterval()이 메모리를 차지하고 있지 않을 것임
            clearInterval(ws.interval);
        })

        // 3초마다 클라이언트로 실시간 데이터 전송을 해볼 것임
        ws.interval = setInterval(() => {
            // 연결을 맺자마자 바로 서버에서 클라이언트로 데이터를 보내는게 안 보내질 수도 있음
            // 그래서 웹 소켓에서 쓰는 readyState를 체크해주면 됨
            //  - readyState가 OPEN 상태일 때 보내주는 걸로 하면 됨
            // 웹 소켓은 HTTP 서버와 포트를 공유하기 때문에 웹 소켓도 8085에서 돌아가고 HTTP도 8085에서 돌아감
            //  - 다른 점은 HTTP는 HTTP 프로토콜이고 웹 소켓은 WS 프로토콜을 사용
            //      - 접속 주소가 다르다!
            if(ws.readyState === ws.OPEN) {
                ws.send('서버에서 클라이언트로 메시지를 보냅니다');
            }
        }, 3000);
    })
}