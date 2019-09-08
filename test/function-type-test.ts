import { genFunctionType } from '../src/function-type';

function test(func: Function | string, fields: string[]) {
  let functionType = genFunctionType(func);
  let groundTruth = `(${fields.join(',')}) => any`;
  if (functionType !== groundTruth) {
    console.error("reflected field doesn't match");
    console.error('ground truth:', groundTruth);
    console.error('reflected:', functionType);
    console.error('function:', func.toString());
    process.exit(1);
  }
  console.log('passed:', func.toString());
}

test(`function f(a, b) { }`, ['a', 'b']);
test(`function (a, b) { }`, ['a', 'b']);
test(`function(a, b) { }`, ['a', 'b']);
test(`(a, b) => a + b`, ['a', 'b']);
test(`function(a) { }`, ['a']);
test(`(a) => { }`, ['a']);
test(`(a)=>{}`, ['a']);
test(`a => {}`, ['a']);
test(`a=>{}`, ['a']);
test(`function() { }`, []);
test(`function () { }`, []);
test(`() => {}`, []);
test(`()=>{}`, []);
