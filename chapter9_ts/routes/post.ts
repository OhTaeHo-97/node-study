import express from 'express';
import { isLoggedIn, isNotLoggedIn } from '../middlewares';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { afterUploadImage, uploadPost } from '../controllers/post';
const router = express.Router();

// 서버를 재시작하면 uploads 폴더가 생성될 것임
try {
    // 우선 uploads라는 폴더가 있나 검사
    fs.readdirSync('uploads');
} catch (err) { // 폴더가 없다면
    // uploads 폴더를 생성
    fs.mkdirSync('uploads');
}

const upload = multer({
    // 사용자가 업로드한 것을 disk(저장 공간)에 저장한다
    storage: multer.diskStorage({
        // 파일을 어디다 저장할 것인지 -> uploads 폴더에 저장하겠다!
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        // 파일 이름을 어떻게 저장할 것인가
        filename(req, file, cb) {
            // file을 직접 콘솔로 찍어보면서 어떤 구조로 되어있는지 파악하자!
            console.log('file', file);
            // 이미지.png -> 이미지{날짜}.png로 할 것임
            //  - 단순히 이미지.png로 하면 수많은 사용자가 이미지를 업로드하며 이미지 이름이 같은 경우가 생김
            //  - 업로드하는데 이름이 같으면 최신 것이 이전 것을 덮어씌움
            //  - 그럼 이전 사람의 이미지가 없어져버릴 것임
            //  - 그래서 이미지 중복을 막기 위해 뒤에 날짜/시간을 붙여서 서로 겹치지 않게끔 해줌
            const ext = path.extname(file.originalname); // 확장자 추출
            // path.basename(file.originalname, ext) -> 이미지 이름 추출(확장자를 제외한 이름만)
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), afterUploadImage);

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), uploadPost);

export default router;