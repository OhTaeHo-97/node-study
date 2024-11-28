// let a: boolean = true;
// const b: { hello: string } = { hello: 'world' };
// function add(x: number, y: number): number { return x + y };
// const minus = (x: number, y: number): number => x - y;
//
// // type alias
// type Func = (x: number) => string;
// const func: Func = (x) => x.toString();

// let a = true;
// const b = { hello: 'world' };
// function add(x: number, y: number) { return x + y };
// const minus = (x: number, y: number) => x - y;

let a: string | number = 'hello'; // 유니언 타이핑
a = 123;

let arr: string[] = []; // 배열 타이핑
arr.push('hello');

interface Inter {
    hello: string;
    world?: number; // 있어도 그만 없어도 그만인 속성
} // 객체를 인터페이스로 타이핑할 수 있음
const b: Inter = { hello: 'interface' };

type Type = {
    hello: string;
    func?: (param?: boolean) => void; // 함수는 이런 식으로 타이핑함
}
const c: Type = { hello: 'type' };

interface Merge {
    x: number,
}
interface Merge {
    y: number,
}
const m: Merge = { x: 1, y: 2 };

import 'a';
export { a };