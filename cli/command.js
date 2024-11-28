#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

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

const makeTemplate = (type, name, directory) => {
    // mkdirp => mkdir -p 명령어 역할
    //  - directory가 없으면 directory를 생성하라는 의미!
    mkdirp(directory);
    if(type === 'html') {
        const pathToFile = path.join(directory, `${name}.html`);
        if(exist(pathToFile)) {
            // 에러인데 색깔이 검정색으로 나오면 에러같아 보이지 않을 수 있음!
            // chalk.red('이미 해당 파일이 존재합니다.') 이런 식으로 하면 에러 메시지가 빨간색이 됨!
            //  - 굵은 글씨의 빨간색 글씨라면 chalk.bold.red('이미 해당 파일이 존재합니다.')
            console.error(chalk.bold.red('이미 해당 파일이 존재합니다.'));
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);
            console.log(chalk.green(pathToFile, ' 생성 완료'));
        }
    } else if(type === 'express-router') {
        const pathToFile = path.join(directory, `${name}.js`);
        if(exist(pathToFile)) {
            console.error(chalk.bold.red('이미 해당 파일이 존재합니다.'));
        } else {
            fs.writeFileSync(pathToFile, routerTemplate);
            console.log(chalk.green(pathToFile, ' 생성 완료'));
        }
    } else {
        console.error(chalk.bold.red('html 또는 express-router 둘 중 하나를 입력하세요.'));
    }
}

// program.version('0.0.1', '-v', '--version')
//  - npx cli -v 하면 버전이 표시가 됨!
// program.name('cli')
//  - 프로그램 이름 설정
//  - 편의 기능들이 이미 다 들어있다!
program
    .version('0.0.1', '-v', '--version')
    .name('cli');

// program.command() : 명령어 만드는 코드
//  - <>로 되어있는 부분은 필수값이라는 뜻
//  - []로 되어있는 부분은 선택값이라는 뜻
// program.usage('<type> --filename [filename] --path [path]')
//  - 명령어에 대한 설명
//  - filename, path는 선택값이고 type은 필수값이다!
// program.description('템플릿을 생성합니다.')
//  - 한글로 설명하는 것
//  - program.usage()는 명령어를 이런 식으로 사용한다 설명하는 것
// program.alias('tmpl')
//  - 별칭 설정
//  - template이라는 것을 쓰기 귀찮거나 힘든 사람들을 위해서 tmpl로 쓸 수 있게 template 명령어에 별칭을 달아주는 것!
//  - 필수는 아님
// program.option()
//  - 우리가 usage() 쪽을 보면 옵션 두 개를 줬음(filname, path)
//  - 그 옵션 두 개에 대한 설정
// program.option('-f, --filename [filename]', '파일명을 입력하세요', 'index')
//  - 두 번째 인자 : 해당 옵션에 대한 설명
//  - 세 번째 인자 : 기본값
//      - 옵션값들이기 때문에 안 넣었을 때의 기본값을 설정
// program.action(() => {})
//  - 해당 명령어의 실제 동작
//  - 필수값은 매개변수로 들어오고
//  - 옵션값들은 options 객체로 들어옴
program
    .command('template <type>')
    .usage('<type> --filename [filename] --path [path]')
    .description('템플릿을 생성합니다.')
    .alias('tmpl')
    .option('-f, --filename [filename]', '파일명을 입력하세요', 'index')
    .option('-d, --directory [path]', '생성 경로를 입력하세요', '.')
    .action((type, options, command) => {
        console.log(type, options.filename, options.directory);
        makeTemplate(type, options.filename, options.directory);
    });

// 아무 것도 안 입력했을 때
//  - 즉, 위에서 우리가 정의한 template이 아닌 다른 명령어
//  - 우리가 등록한 명령어가 아니므로 해당 명령어를 찾을 수 없다는 로그와 함께 프로그램 사용 설명서를 띄워줌
//  - 프로그램 사용 설명서는 우리가 위에 작성한 내용을 바탕으로 자동으로 만들어줌
// program
//     .command('*', { noHelp: true })
//     .action(() => {
//         console.log('해당 명령어를 찾을 수 없습니다.');
//         program.help();
//     })

// 위 코드에서 변경사항 => 명령어를 찾을 수 없으면 바로 inquirer를 호출할 것임!!
program
    .action((options, command) => { // 필수값이 없으니 매개변수 순서가 options, command
        if(command.args.length !== 0) {
            // npx cli copy를 하면 copy가 command.args에 배열로 들어감
            //  - 그럼 이 경우 length가 1이 될 것임
            console.log('해당 명령어를 찾을 수 없습니다.');
            program.help();
        } else {
            // npx cli만 입력했을 때에는 이 부분이 실행되는 것!
            // prompt에서 질문 목록을 받을 수 있음!
            //  - name 값으로 결과물이 생성됨
            //  - 선택지(입력)이 name값 안에 들어있다고 생각하면 됨!
            inquirer.prompt([{
                // list => 목록
                //  - 선택지 중 고르라는 뜻
                type: 'list',
                name: 'type',
                message: '템플릿 종류를 선택하세요.',
                choices: ['html', 'express-router'],
            }, {
                // input => 직접 입력, 직접 입력하지 않으면 기본값
                type: 'input',
                name: 'name',
                message: '파일의 이름을 입력하세요.',
                default: 'index',
            }, {
                type: 'input',
                name: 'directory',
                message: '파일이 위치할 폴더의 경로를 입력하세요.',
                default: '.'
            }, {
                // confirm -> yes or no (생성할 것인지 아닌지)
                type: 'confirm',
                name: 'confirm',
                message: '생성하시겠습니까?',
            }])
                .then((answers) => {
                    // prompt에서 질문 목록을 받을 수 있음!
                    //  - name 값으로 결과물이 생성됨
                    //  - 선택지(입력)이 name값 안에 들어있다고 생각하면 됨!
                    //  - ex. answers.type, answers.name, answers.directory 등으로 받을 수 있다!
                    if(answers.confirm) {
                        makeTemplate(answers.type, answers.name, answers.directory);
                        console.log(chalk.hex('#123fff')('터미널을 종료합니다.'));
                    }
                })
        }
    })

program.parse(process.argv);