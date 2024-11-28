const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;
const chatSchema = new Schema({
    room: { // 방의 아이디
        //  - 그래야 이 대화가 어떤 방에 속한건지 알 수 있음
        type: ObjectId,
        required: true,
        ref: 'Room', // Room 스키마와 연결
    },
    user: { // 누가 보냈는지
        // 익명이지만 id 역할은 있다!
        type: String,
        required: true,
    },
    // gif를 보내거나 chat을 보내거나 둘 중 하나를 할 수 있음
    //  - 채팅을 보내면 일반 채팅이고
    //  - gif(사진)를 보내면 사진 채팅이 될 것임
    // -> 채팅의 종류가 2가지!
    chat: String,
    gif: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Chat', chatSchema);