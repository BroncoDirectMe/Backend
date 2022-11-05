// file system package
const fs = require('fs');
// selenium package
const { By, Builder } = require('selenium-webdriver');
require('chromedriver');

/*

PLEASE READ
The code is super messy...
We are testing concept then will solidify

We have all the code it is just translating it to selenium
and making sure that all of the code is automated

SORRY THIS IS IN JS HAHA

*/

async function main() {
  // builds and launchs browser
  var driver = await new Builder().forBrowser('chrome').build();

  // laods data
  let settingData = fs.readFileSync('settings.json');
  let settings = JSON.parse(settingData);
  let urlData = fs.readFileSync('urls.json');
  let urls = JSON.parse(urlData);

  // navigates to the main site
  await driver.get(urls['cpp']);

  // logs in the user
  await driver.sleep(500);
  await driver
    .findElement(By.name('j_username'))
    .sendKeys(settings['username']);
  await driver
    .findElement(By.name('j_password'))
    .sendKeys(settings['password']);
  await driver.findElement(By.name('_eventId_proceed')).click();
  // time to manually approve DUO security
  // no way to avoid this unless we can inject a cookie to stay logged in for 14 hours
  await driver.sleep(10000);

  // nav search
  await driver.get(urls['navSearch']);
  // time to get to the search page
  // planned to fix this so you do not have to do this manually!!
  await driver.sleep(10000);

  // switches the driver to iframe because CPP IS DUMB
  const iframe = await driver.findElement(By.id('ptifrmtgtframe'));
  await driver.switchTo().frame(iframe);

  // selects undergraduate classes
  await driver
    .findElement(By.name('SSR_CLSRCH_WRK_ACAD_CAREER$2'))
    .sendKeys('UGRD');
  // selects option to view all classes (open, waitlisted, and filled)
  await driver.findElement(By.name('SSR_CLSRCH_WRK_SSR_OPEN_ONLY$3')).click();
  // selects the prof last name
  // testing with 'a'
  // this will be changed in the future to a loop so it can all be automated
  await driver.findElement(By.name('SSR_CLSRCH_WRK_LAST_NAME$7')).sendKeys('A');
  // clicks the search bar
  await driver.sleep(1000);
  await driver.executeScript(
    'submitAction_win0(document.win0,"CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH",event)'
  );
  // clicks the button which allows the page to load more than 50 professors at once
  await driver.sleep(5000);
  await driver.executeScript(
    "javascript:submitAction_win0(document.win0, '#ICSave')"
  );
  // THIS PART IS STILL BEING FIGURED OUT
  // ALL OF THE CODE EXISTS TO SCRAPE PROFESSORS NAME 
  // THE CODE IS BEING TRANSLATED TO WORK WITH SELENIUM NOW
//   await driver.sleep(10000);
//   await driver.executeScript(
//     'iframe.querySelectorAll(\'*[id^="MTG_INSTR$"]\')'
//   );

  // browser quit
  await driver.quit();
}

main();
