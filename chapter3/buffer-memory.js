// 메모리 체크
const fs = require('fs')

// rss를 통해 메모리 체크를 할 수 있음
console.log('before:', process.memoryUsage().rss);

const data1 = fs.readFileSync('./big.txt');
fs.writeFileSync('./big2.txt', data1);
console.log('buffer:', process.memoryUsage().rss);