const mongoose = require('mongoose');

const { Schema } = mongoose;
const roomSchema = new Schema({
    title: { // 방 제목
        type: String,
        required: true,
    },
    max: { // 최대 인원
        type: Number,
        required: true,
        default: 10,
        min: 2, // 채팅방이니까 최소 2명은 있어야 함
    },
    owner: { // 방장
        // 익명이어도 사용자가 서로 구분은 되어야 함
        //  - 그래야 여러 명이 채팅방에 들어있으면 누군가가 계속 이야기하는지 알 수 있음
        //  - 매번 채팅을 할 때마다 그 채팅이 누군지 모르면 대화가 이어지기 어려움
        //  - 그래서 익명이지만 아이디 역할을 하는 것이 있기는 함
        //  - 그래서 그 아이디 역할을 하는 것이 또 다시 방장이 될 것임
        type: String,
        required: true,
    },
    password: String, // 비밀번호는 있을 수도 없을 수도 있음
    createdAt: { // 방 생성일
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Room', roomSchema);