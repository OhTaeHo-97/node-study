const min = 2;
const max = 10_000_000;
const primes = [];

function generatePrimes(start, range) {
    let isPrime = true;
    const end = start + range;

    for(let num = start; num < end; num++) {
        for(let divisor = start; divisor <= Math.sqrt(end); divisor++) {
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

console.time('prime');
generatePrimes(min, max);
console.timeEnd('prime');
console.log(primes.length);