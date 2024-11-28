const fs = require('fs').promises;

// 콜백 형식을 갖고 있음
// 노드에서는 콜백이 대부분 err, data 순으로 감
// fs.readFile('./readme.txt', (err, data) => {
//     if (err) {
//         console.log(data)
//         console.log(data.toString())
//     }
// })

fs.readFile('./readme.txt')
    .then((data) => {
        console.log(data)
        console.log(data.toString())
    })
    .catch((err) => {
        throw err;
    })