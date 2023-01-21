/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck
// import { addProf } from '../../api/sql';

const fs = require('fs');
const readline = require('readline');

readline
  .createInterface({
    input: fs.createReadStream('./scraper/professors/professors.txt'),
  })

  /* 
  Manual editing is required
  Some professors have full middle names or middle initials which is impossible to differentiate
  so some names will be very inaccurate and will need to be edited in the database
  */

  .on('line', (line) => {
    if (line.includes('//')) return; // lines in professor.txt marked with a '//' will be skipped
    const titles = ['Mr', 'Ms', 'Mrs', 'PhD', 'II', 'III', 'IV'];
    const specialChars = /[.(]/;
    let name = line.split(/[\s,]/);
    name = name.filter(
      (a) => !titles.includes(a) && a.length > 1 && !a.match(specialChars)
    );

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    // addProf(name[1] + ' ' + name[0])  // addProf function not yet updated to new schema

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log(name[1] + ' ' + name[0]);
  });
