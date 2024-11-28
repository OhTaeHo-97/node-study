const Room = require('../schemas/room');
const Chat = require('../schemas/chat');

exports.removeRoom = async (roomId) => {
    try {
        await Room.deleteOne({ _id: roomId });
        await Chat.deleteMany({ room: roomId });
    } catch (error) {
        // 에러가 발생하면 controller로 에러를 넘겨줌
        throw error;
    }
}