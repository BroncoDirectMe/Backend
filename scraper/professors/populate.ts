export async function readFile(): Promise<string[]> {
  const readline = require('readline');
  const fs = require('fs');
  const nameArray = [];
  const readStream = fs.createReadStream('./scraper/professors/professors.txt');
  const rl = readline.createInterface({
    input: readStream,
  });

  /* 
  Manual editing is required
  Some professors have full middle names or middle initials which is impossible to differentiate
  so some names will be very inaccurate and will need to be edited in the database
  */

  for await (const line of rl) {
    if (line.includes('//')) continue; // lines in professor.txt marked with a '//' will be skipped
    const titles = ['Mr', 'Ms', 'Mrs', 'PhD', 'II', 'III', 'IV'];
    const specialChars = /[.(]/;
    let name = line.split(/[\s,]/);
    name = name.filter(
      (a: string) =>
        !titles.includes(a) && a.length > 1 && !a.match(specialChars)
    );

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    nameArray.push(name[1] + ' ' + name[0]);
  }
  console.log(nameArray);
  return nameArray;
}
