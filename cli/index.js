#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// 기존 내용이 지워지고 빈칸에서 질문을 물어봄
console.clear();
const answerCallback = (answer) => {
    if(answer === 'y') {
        console.log('감사합니다!');
        rl.close();
    } else if(answer === 'n') {
        console.log('죄송합니다!');
        rl.close();
    } else {
        console.clear();
        console.log('y 또는 n만 입력하세요.');
        rl.question('예제가 재미있습니까? (y/n)', answerCallback);
    }};

rl.question('예제가 재미있습니까? (y/n)', answerCallback);
// console.log('Hello CLI', process.argv);