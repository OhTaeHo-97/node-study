"use strict";
// import fs from 'fs';
//
// // (err: NodeJS.ErrnoException | null, data: Buffer) => void
// // fs.readFile('package.json', (err, data) => {});
// fs.readFile('package.json', () => {});
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
promises_1.default.readFile('package.json')
    .then((result) => {
    console.log(result);
})
    .catch(console.error);
