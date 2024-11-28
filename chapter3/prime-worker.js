const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const min = 2;
let primes = [];

function findPrimes(start, range) {
    let isPrime = true;
    const end = start + range;

    for(let num = start; num < end; num++) {
        for(let divisor = min; divisor <= Math.sqrt(num); divisor++) {
            if(num !== divisor && num % divisor === 0) {
                isPrime = false;
                break;
            }
        }

        if(isPrime) {
            primes.push(num);
        }
        isPrime = true;
    }
}

if(isMainThread) {
    const max = 10_000_000;
    const threadCount = 8;
    const threads = new Set();
    const range = Math.ceil((max - min) / threadCount);
    let start = min;
    console.time('prime');
    for(let i = 0; i < threadCount - 1; i++) {
        const wStart = start;
        threads.add(new Worker(__filename, { workerData : { start : wStart, range}}))
        start += range;
    }
    threads.add(new Worker(__filename, { workerData : { start, range : range + ((max - min + 1) % threadCount) }}))

    for(let worker of threads) {
        // 워커가 에러를 읽히기도 하기 때문에 복구 로직도 필요!
        //  - 'error' 부분에서 워커에서 에러났을 떄 어떻게 대처할지도 적어줘야 함!
        worker.on('error', (err) => {
            throw err;
        })
        worker.on('exit', () => {
            threads.delete(worker);
            if(threads.size === 0) {
                console.timeEnd('prime');
                console.log(primes.length);
            }
        })

        // 워커 스레드들이 구한 소수들 -> msg
        // 8개의 워커들의 결과들을 직접 합쳐줘야 함!
        worker.on('message', (msg) => {
            primes = primes.concat(msg);
        })
    }
} else {
    findPrimes(workerData.start, workerData.range)
    parentPort.postMessage(primes)
}