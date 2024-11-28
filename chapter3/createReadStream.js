const fs = require('fs');
// readme3.txt 파일을 조각조각 내서 조금씩 전달해줌
//  - 대신 조각냈으면 받을 때는 그 조각들을 합쳐줘야 할 것임
const readStream = fs.createReadStream('./readme3.txt', { highWaterMark: 16 });

// 빈 배열을 하나 만듬
const data = [];
// 파일을 조금씩 조각내서 읽기 때문에 그 조각조각이 chunk로 옴
// chunk로 올 때마다 data.push(chunk)를 통해 위에서 만든 빈 배열에 모아줌
readStream.on('data', (chunk) => {
    data.push(chunk);
    console.log('data:', chunk, chunk.length);
})

// 다 됐다는 것도 알려줌
readStream.on('end', () => {
   console.log('end:', Buffer.concat(data).toString());
});

readStream.on('error', (err) => {
    console.error('error:', err);
})