const fs = require('fs')

// readFileSync() => 동기
//  - 콜백이나 프로미스가 아님!
// 콜백을 쓰지 않아도 되어서 코드가 깔끔
let data = fs.readFileSync('./readme.txt')
console.log('1번', data.toString())
data = fs.readFileSync('./readme.txt')
console.log('2번', data.toString())
data = fs.readFileSync('./readme.txt')
console.log('3번', data.toString())
data = fs.readFileSync('./readme.txt')
console.log('4번', data.toString())
