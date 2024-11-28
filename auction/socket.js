const SocketIO = require('socket.io');
module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);

    io.on('connection', (socket) => {
        const req = socket.request;
        // 방 아이디 추출
        //  - 여기서의 방은 경매 진행 중인 경매방이 될 것임
        const { headers: { referer } } = req;
        // roomId가 결국 상품 아이디가 될 것임
        //  - 방의 제목이자 상품의 아이디! => 둘이 같은 역할!
        const roomId = new URL(referer).pathname.split('/').at(-1);
        // 경매방에 소켓을 참여시켜서 방 안에서만 실시간으로 서로 채팅과 경매를 주고받을 수 있게끔 세팅
        socket.join(roomId);
        socket.on('disconnect', () => {
            socket.leave(roomId);
        });
    })
}