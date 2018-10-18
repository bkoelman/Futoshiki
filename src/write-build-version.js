var fs = require('fs');

const date = new Date();
const timestamp = date.getSeconds() + 60 * date.getMinutes() + 60 * 60 * date.getHours();
const version = `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}.${timestamp}`;

const path = __dirname + '/app/build-version.ts';
console.log(`Writing build version '${version}' to ${path}`);
fs.writeFileSync(path, `export const buildVersion = '${version}';\n`);
