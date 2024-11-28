#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// process.argv의 첫 번째, 두 번째는 node와 파일 경로
// 그러므로 우리가 입력하는 것은 실질적으로 세 번째부터 들어감
// ex. npx cli html main . -> ./ 디렉토리에 main.html 파일이 생성되도록 되게 할 것임!
// const type = process.argv[2];
// const name = process.argv[3];
// const directory = process.argv[4] || '.';

let rl;
let type = process.argv[2];
let name = process.argv[3];
let directory = process.argv[4] || '.';

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Template</title>
</head>
<body>
    <h1>Hello</h1>
    <p>CLI</p>
</body>
</html>
`;

const routerTemplate = `
const express = require('express');
const router = express.Router();
router.get('/', (req, res, next) => {
    try {
        res.send("ok");
    } catch (error) {
        console.error(error);
        next(error);
    }
});
module.exports = router;
`;

// 특정 폴더 안에 파일이 있는지 없는지 판단하는 함수
// fs.accessSync() 이용!
const exist = (dir) => {
    try {
        // 특정 경로에 파일이 있는지 없는지 검사하는 코드
        // F_OK -> 파일 존재 여부(숨김 파일이 아닌지(?)), R_OK -> 읽기 권한 여부, W_OK -> 쓰기 권한 여부
        fs.accessSync(dir, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
}

// 경로가 a/b/c라면 a 폴더를 먼저 만들고 그 다음 b 폴더 만들고 그 다음 c 폴더 만들고
// 이런 복잡한 경로까지 분석해서 폴더를 만들어주는 함수!
const mkdirp = (dir) => { // 경로 생성 함수
    const dirname = path
        .relative('.', path.normalize(dir))
        .split(path.sep)
        .filter(p => !!p);
    dirname.forEach((d, idx) => {
        const pathBuilder = dirname.slice(0, idx + 1).join(path.sep);
        if(!exist(pathBuilder)) {
            fs.mkdirSync(pathBuilder);
        }
    })
}

const makeTemplate = () => {
    // mkdirp => mkdir -p 명령어 역할
    //  - directory가 없으면 directory를 생성하라는 의미!
    mkdirp(directory);
    if(type === 'html') {
        const pathToFile = path.join(directory, `${name}.html`);
        if(exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);
            console.log(pathToFile, ' 생성 완료');
        }
    } else if(type === 'express-router') {
        const pathToFile = path.join(directory, `${name}.js`);
        if(exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, routerTemplate);
            console.log(pathToFile, ' 생성 완료');
        }
    } else {
        console.error('html 또는 express-router 둘 중 하나를 입력하세요.');
    }
}

const dirAnswer = (answer) => { // 경로 설정
    directory = answer?.trim() || '.';
    rl.close();
    makeTemplate();
}

const nameAnswer = (answer) => { // 파일명 설정
    if(!answer || !answer.trim()) {
        console.clear();
        console.log('name을 반드시 입력하셔야 합니다.');
        return rl.question('파일명을 설정하세요. ', nameAnswer);
    }

    name = answer;
    return rl.question('저장할 경로를 설정하세요.(설정하지 않으면 현재경로) ', dirAnswer);
}

const typeAnswer = (answer) => { // 템플릿 종류 설정
    if(answer !== 'html' && answer !== 'express-router') {
        console.clear();
        console.log('html 또는 express-router만 지원합니다.');
        return rl.question('어떤 템플릿이 필요하십니까?', typeAnswer);
    }
    type = answer;
    return rl.question('파일명을 설정하세요. ', nameAnswer);
};

const program = () => {
    if(!type || !name) {
        console.error('사용 방법: cli html|express-router 파일명 [생성 경로]');
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        console.clear();
        rl.question('어떤 템플릿이 필요하십니까?', typeAnswer);
    } else {
        makeTemplate();
    }
}
program();