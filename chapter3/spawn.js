const { spawn } = require('child_process');

// 파이썬을 노드로 실행할 수 있음
// 새로운 프로세스를 띄워서 파이썬을 실행하는 것
const process = spawn('Java', ['Test.java'])

process.stdout.on('data', function (data) {
    console.log(data.toString());
});

process.stderr.on('data', function (data) {
    console.error(data.toString());
})