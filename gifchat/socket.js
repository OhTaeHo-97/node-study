const SocketIO = require('socket.io');
const { removeRoom } = require('./services');

module.exports = (server, app, sessionMiddleware) => {
    // ws와 라이브러리가 다르기 때문에 조금씩 사용 방법이 다름
    // 클라이언트에서 연결을 맺을 때 뒤에 path까지 붙여야 서버로 연결이 됨
    //  - path가 추가가 됐음
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    chat.use(wrap(sessionMiddleware));

    room.on('connection', (socket) => {
        console.log('room 네임 스페이스 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        })
    });

    chat.on('connection', (socket) => {
        console.log('chat 네임 스페이스 접속');

        socket.on('join', (data) => {
            // data가 방(room)의 ObjectId가 될 것임!
            socket.join(data); // 방에 참가
            // socket.leave(data); // 방 나가기

            // 방에 속해있는 사람들에게만 메시지를 보내는 것!
            socket.to(data).emit('join', {
                user: 'system', // system 메시지이기 때문에 user는 system
                chat: `${socket.request.session.color}님이 입장하셨습니다.` // req.session.color를 쓸 수 있게 됨!
            });
        })

        socket.on('disconnect', async () => {
            console.log('chat 네임스페이스 접속 해제');
            // referer라는 헤더 안에 방 아이디가 포함되어 있는 전체 주소가 들어있음!
            const { referer } = socket.request.headers;
            // 주소(path) 부분만 떼서 /로 나눈 가장 마지막 요소를 가져오면 방 아이디를 가져올 수 있음
            const roomId = new URL(referer).pathname.split('/').at(-1);
            // 방의 참가자가 0명이면 방을 삭제시켜야 함!
            const currentRoom = chat.adapter.rooms.get(roomId);
            const userCount = currentRoom?.size || 0; // 현재 방에 있는 인원 수를 의미
            if(userCount === 0) { // 참가 인원수가 0이면
                // 방을 제거
                // removeRoom은 서비스를 하나 만들 것임!
                await removeRoom(roomId);
                // /room 네임스페이스에 이 방이 제거되었다고 알려서 실시간으로 그 방을 없애줄 것임
                setTimeout(() => room.emit('removeRoom', roomId), 1);
                console.log('방 제거 요청 성공');
            } else {
                // 방 인원이 0명이 되면 메시지 보낼 이유가 없으니
                socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat: `${socket.request.session.color}님이 퇴장하셨습니다.`
                })
            }
        })
    });

    // 웹 소켓 연결을 맺을 때 처음 한 번은 클라이언트에서 서버로 연결을 맺어줘야 함
    // 처음 한 번 연결을 맺을 때 이 부분이 실행됨
    // io.on('connection', (socket) => {
    //     // req(request)를 어떻게 꺼내오나?
    //     //  - socket 안에 request가 들어있음
    //     const req = socket.request;
    //     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    //     console.log('새로운 클라이언트 접속', ip);
    //
    //     // 이게 ws에서의 ws.on('close')와 대응된다고 보면 됨
    //     socket.on('disconnect', () => {
    //         // socketIO는 웹 소켓 연결을 할 때마다 각 소켓에(연결에) id를 하나씩 부여해줌
    //         // 나중에 id를 통해 특정인에게 메시지를 보낼 수도 있고 아니면 특정인의 연결을 끊어버릴 수도 있음
    //         // 연결에 id가 붙어있다고 생각하면 됨!
    //         // req.ip는 undefined
    //         console.log('클라이언트 접속 해제', ip, socket.id, req.ip);
    //         clearInterval(socket.interval);
    //     })
    //
    //     // 클라이언트에서 reply를 emit 헀으니 서버쪽에서 받을 때는 socket.on('reply')로 받으면 됨
    //     //  - 이런 식으로 socket.IO에서는 주고받는 데이터에 이벤트 이름을 달아줄 수 있다!
    //     socket.on('reply', (data) => {
    //         // Socket.IO에서는 toString()도 붙여주지 않아도 된다!
    //         console.log(data);
    //     })
    //
    //     // ws에서의 ws.on('error')와 대응된다고 보면 됨
    //     socket.on('error', console.error);
    //     socket.interval = setInterval(() => {
    //         // 우리가 ws에서는 readyState가 OPEN인지 체크한 후에 그렇다면 데이터를 보내줬음
    //         // 그러나 Socket.IO에서는 체크하지 않아도 됨!
    //         //  - Socket.IO에서 이 부분을 알아서 체크해줌!
    //         // 개발자가 불편하지 않도록 편의 기능들을 미리 갖춰놓은게 Socket.IO다!
    //         // socket.emit('이벤트 이름', '데이터');
    //         //  - {이벤트 이름}이라는 이벤트로 {데이터}를 보냄
    //         //  - 그럼 브라우저에서는 socket.on('news') 이런 식으로 받음
    //         socket.emit('news', 'Hello Socket.IO');
    //     }, 3000);
    // })
}