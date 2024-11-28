const SSE = require('sse');

module.exports = (server) => {
    // 이렇게 하면 sse(server sent event)와 연결이 됨!
    const sse = new SSE(server);

    // 클라이언트와 서버가 서버센트 이벤트가 연결되었다면 connection 이벤트가 실행됨
    sse.on('connection', (client) => {
        // 매 초마다 서버 시간 전송
        //  - send()를 통해서는 String을 보내줘야 해서 toString()을 사용
        setInterval(() => {
            client.send(Date.now().toString());
        }, 1000);
    })
}