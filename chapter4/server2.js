const http = require('http');
const fs = require('fs').promises;

const server = http.createServer(async (req, res) => {
    try {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        const data = await fs.readFile('./server2.html');
        res.end(data);
    } catch (error) {
        console.error(error);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }) // 일반 문자열
        res.end(err.message); // 에러 메시지가 전송될 것임
    }
})
    .listen(8080);

server.on('listening', () => {
    console.log('8080번 포트에서 서버 대기 중입니다.');
})

server.on('error', (error) => {
    console.error(error);
})