import {getTsType} from "../src/ts-type";

console.log(getTsType({user: 'Alice', friends: [{user: 'Bob', since: new Date()}]}, {format: true}));
