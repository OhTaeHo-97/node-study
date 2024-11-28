const fs = require('fs');

// 비동기 콜백 안에서 다음 것, 다음 것,...
// 콜백 헬이 발생
fs.readFile('./readme.txt', (err, data) => {
    if (err) {
        throw err;
    }
    console.log('1번', data.toString());

    fs.readFile('./readme.txt', (err, data) => {
        if (err) {
            throw err;
        }
        console.log('2번', data.toString());

        fs.readFile('./readme.txt', (err, data) => {
            if (err) {
                throw err;
            }
            console.log('3번', data.toString());

            fs.readFile('./readme.txt', (err, data) => {
                if (err) {
                    throw err;
                }
                console.log('4번', data.toString());
            })
        })
    })
})