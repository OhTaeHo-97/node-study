const fs = require('fs');
const file = fs.createWriteStream('./big.txt');

// 아래 문자열을 1000만번 반복해서 big.txt에 씀
//  - 대략 1GB 정도의 파일 크기가 됨
for (let i = 0; i < 10_000_000; i++) {
    file.write('안녕하세요. 엄청나게 큰 파일을 만들어 볼 것입니다. 각오 단단히 하세요!\n');
}
file.end();