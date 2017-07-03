const fs = require('fs');
const cityString = fs.readFileSync('./city', 'utf8');
const citArray = cityString.split('\n');
const cityObj = {};
citArray.forEach((city) => {
	cityObj[city.toLowerCase()] = true;
});

fs.writeFileSync('./output',JSON.stringify(cityObj,null,4));