const _ = require('lodash');

let user = {id: '1b111d1d13f41gf1v1rg', name: 'James', age: 23};

let shallow = _.clone(user);
let deep = _.cloneDeep(user);

console.log(user);
console.log(shallow);
console.log(deep);

console.log(user === shallow);
console.log(user === deep);
console.log(deep === shallow);

console.log(_.isEqual(user, shallow));
console.log(_.isEqual(user, deep));
console.log(_.isEqual(deep, shallow));

user.age = 25;


console.log(_.isEqual(user, shallow));
console.log(_.isEqual(user, deep));
console.log(_.isEqual(deep, shallow));