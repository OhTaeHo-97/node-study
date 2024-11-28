// import fs from 'fs';
//
// // (err: NodeJS.ErrnoException | null, data: Buffer) => void
// // fs.readFile('package.json', (err, data) => {});
// fs.readFile('package.json', () => {});

import fs from 'fs/promises';

fs.readFile('package.json')
    .then((result) => { // result는 Buffer 타입입니다
        console.log(result);
    })
    .catch(console.error);