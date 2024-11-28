const Room = require('../schemas/room');
const Chat = require('../schemas/chat');
const { removeRoom: removeRoomService } = require('../services');

exports.renderMain = async (req, res, next) => {
    // 메인 화면에서는 방 목록을 보여줌
    try {
        const rooms = await Room.find({});
        res.render('main', { rooms, title: 'GIF 채팅방' });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.renderRoom = (req, res, next) => {
    // 방 생성화면에서는 room.html 렌더링
    res.render('room', { title: 'GIF 채팅방 생성' });
}

exports.createRoom = async (req, res, next) => {
    // 방 생성
    // form으로 넘어온 데이터를 이용하여 방 생성
    try {
        const newRoom = await Room.create({
            title: req.body.title,
            max: req.body.max,
            // color가 사용자 아이디 역할을 하는 것!
            // color-hash 통해서 부여했던게 사용자의 아이디가 되는 것!
            owner: req.session.color,
            password: req.body.password,
        })
        // 우리가 socket.js에서 app.set('io', io)를 했었음
        // 이걸 이제 여기서 써보자!
        //  - 새로운 방을 만들었으면 실시간으로 /room 네임스페이스에 들어있는 사람들에게 실시간으로 알려줘야 함!
        const io = req.app.get('io'); // 이렇게 해서 우리가 만들어준 io를 가져올 수 있음
        // /room에 들어있는 사람들에게 newRoom으로 새로운 방 데이터 전송해줄 수 있음!
        // 그럼 브라우저(main.html)에서 socket.on('newRoom') 부분이 실행됨
        //  - 화면에 새로운 방이 뜰 것임!
        //  - 이걸 노리고 io를 저장해둔 것!
        io.of('/room').emit('newRoom', newRoom);
        if(req.body.password) {// 혹시 방에 비밀번호가 있으면
            // 방을 생성했으니 생성한 사람도 그 방에 들어가야 함!
            // 비밀번호가 있으면 방 아이디 뒤에 비밀번호를 붙여줄 것임!
            //  - 혹시 비밀번호를 까먹었을 수도 있으니 주소를 보고 비밀번호를 알 수 있도록 주소 뒤에 비밀번호를 붙여놓은 것
            res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
        } else {
            res.redirect(`/room/${newRoom._id}`);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.enterRoom = async (req, res, next) => {
    // 채팅방 들어가는 것
    try {
        // 방에 들어갈 때는 여러가지 검사를 해줘야 함!
        const room = await Room.findOne({ _id: req.params.id });
        if(!room) {
            // 방이 있는지부터 보자!
            //  - 혹시 아이디 잘못 입력한 방일 수도 있으니
            return res.redirect('/?error=존재하지 않는 방입니다.');
        }
        if(room.password && room.password !== req.query.password) {
            // 방의 비밀번호와 입력한 비밀번호가 서로 다르다면
            return res.redirect('/?error=비밀번호가 틀렸습니다.');
        }

        // 인원수 검사
        //  - max가 있기 때문에 인원수 검사를 해줘야 함
        //  - socket 연결 개수를 세어보면 됨
        const io = req.app.get('io');
        // 특정 방을 아래처럼 조회할 수 있음
        const { rooms } = io.of('/chat').adapter;
        // rooms.get(방 아이디)?.size -> 그 방에 들어있는 소켓 개수를 가져오는 것
        //  - socket.join()을 하면 rooms.get() 부분에서 하나씩 추가됨
        //      - socket id들이 하나씩 추가되어서 그 사이즈가 이 방에 들어있는 connection 개수가 되는 것
        //      - 즉, 실제 방에 들어가있는 참가자 인원이 되는 것!
        // TODO: 내가 이해한 바(나중에 확인 요함)
        //  - rooms => io.of('/chat').adapter를 통해 만들어진 채팅방들을 모두 가져옴
        //  - rooms.get(방 아이디)를 통해 특정 방을 가져옴
        //  - socket.join()을 하면 해당 방에 소켓 아이디가 추가될 것임
        //  - 그래서 rooms.get(방 아이디)를 통해 가져온 특정 방의 사이즈를 확인하면 join()한 소켓의 개수가 되니까 총 참여한 인원이 되는 것
        if(room.max <= rooms.get(req.params.id)?.size) {
            return res.redirect('/?error=허용 인원을 초과했습니다.');
        }

        // chat.html 렌더링
        // chats : 채팅 목록 -> 아직 비었음
        // user : 자기 자신
        const chats = await Chat.find({ room: room._id }).sort('createdAt'); // 시간순으로 정렬된 채팅
        res.render('chat', { title: 'GIF 채팅방 생성', chats, room, user: req.session.color });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.removeRoom = async (req, res, next) => {
    // 방 삭제
    try {
        // // 방부터 삭제
        // await Room.remove({ _id: req.params.id });
        // // 그 방에 속한 모든 채팅들을 지움
        // await Chat.remove({ room: req.params.id });
        await removeRoomService(req.params.id);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.sendChat = async (req, res, next) => {
    try {
        const chat = await Chat.create({
            room: req.params.id,
            user: req.session.color,
            chat: req.body.chat,
        })
        // 실시간으로 전송
        //  - req.app.get('io').of('/chat') : /chat 네임스페이스로 이동
        //  - .to(req.params.id) : 해당 방에 있는 소켓들에게만 전송
        //  - .emit('chat', chat) : chat이라는 이름으로 채팅 내용 전송
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// DB에는 파일을 저장하는 것이 아닌 파일 이름을 저장하면 됨
//  - 이름만 저장하면 uploads 폴더에 있는 파일을
exports.sendGif = async (req, res, next) => {
    try {
        const chat = await Chat.create({
            room: req.params.id,
            user: req.session.color,
            gif: req.file.filename,
        })
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
}