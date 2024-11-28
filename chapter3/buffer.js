const buffer = Buffer.from('저를 버퍼로 바꿔주세요');
console.log(buffer);
console.log(buffer.length); // 32바이트
console.log(buffer.toString());// 다시 문자열로

// 버퍼 여러개가 배열에 들어있음
const array = [Buffer.from('띄엄 '), Buffer.from('띄엄 '), Buffer.from('띄어쓰기')]
// Buffer.concat()으로 조각나있는 버퍼를 합칠 수 있음
// 버퍼를 합친 다음 문자열로 바꿔준 것
console.log(Buffer.concat(array).toString());

// 데이터는 없는데 빈 버퍼를 만들 때가 있음
// 아무 데이터 없이 alloc()을 통해 5바이트짜리 버퍼를 만듬
console.log(Buffer.alloc(5));