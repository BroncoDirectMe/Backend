var fs = require('fs');
var readline = require('readline');

readline
  .createInterface({
    input: fs.createReadStream('./scraper/professors/professors.txt'),
  })
  .on('line', (line) => {
    if (line.includes('//')) return; //lines in professor.txt marked with a '//' will be skipped
    var name = line.split(/[\s,]/);
    name = name.filter((a) => a.length > 1 && !a.match(/[.(]/));
    console.log(name);
  });
