const fs = require('fs');
const zlib = require('zlib');

const readStream = fs.createReadStream('./readme3.txt', { highWaterMark: 16 });
const zlibStream = zlib.createGzip();
const writeStream = fs.createWriteStream('./writeme4.txt.gz');
// readStream에서 readme3.txt를 읽는데, readme3.txt를 읽을 때 16byte씩 나눠서 읽음
// 그럼 그 16byte씩 나눠서 읽은 것이 writeStream에(writeme3.txt) 조금씩 들어가는 것(파이프로)
// readStream과 writeStream을 파이프로 연결했으니 16byte씩 읽어서 보내면 writeStream에서도 16byte씩 읽어서 받을 것임
// 읽어서 받은 것을 다시 writeme3.txt로 16byte씩 쓰는 것
// 결국 readme3.txt를 16byte씩 읽어서 writeme3.txt에 쓰는 파일 복사라고 보면 됨
// readStream.pipe(writeStream);
readStream.pipe(zlibStream).pipe(writeStream);