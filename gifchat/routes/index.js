const express = require('express');
const { renderMain, renderRoom, createRoom, enterRoom, removeRoom, sendChat, sendGif } = require('../controllers');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// 메인 라우터에서는 index.html을 렌더링
router.get('/', renderMain);
// 채팅방 생성 화면
router.get('/room', renderRoom);
// 채팅방 생성 요청
router.post('/room', createRoom);
// 특정 방에 들어가기
router.get('/room/:id', enterRoom);
// 특정 방을 삭제하기
router.delete('/room/:id', removeRoom);
// 채팅 전송
router.post('/room/:id/chat', sendChat);
// uploads 폴더가 없을 때 uploads 폴더 생성하는 코드
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}
const upload = multer({
    // multer 미들웨어 작성
    storage: multer.diskStorage({ // 디스크에 저장
        destination(req, file, done) { // 파일을 어디에 저장할지
            done(null, 'uploads/');
        },
        filename(req, file, done) { // 파일 이름을 어떻게 할지
            // multer는 이름이 겹치면 앞에 것을 덮어씌우니 덮어씌우지 않도록 중간에 날짜/시간 넣어줌
            const ext = path.extname(file.originalname); // 확장자
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
})
// GIF 전송
// upload.single() 파라미터는 프론트에서 보내는 name과 일치해야 함
router.post('/room/:id/gif', upload.single('gif'), sendGif);

module.exports = router;