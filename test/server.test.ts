
import { expect,use,request }  from 'chai'; 
import chaiHttp from 'chai-http';

use(chaiHttp);

const server = 'localhost:3000';

describe('basic test', function () {
  it('should return true', function () {
    expect(true).to.equal(true);
  });
});

describe('[Professor] 3 test cases:', function () {
  it('No name property', async function () {
    const nameSend = {
      test: 'val',
    };
    const res = await request(server).post('/professor').send(nameSend);
    // console.log(res)
    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'name of professor needs to be specified' });
  });
  it('Empty object', async function () {
    const nameSend = {};
    const res = await request(server).post('/professor').send(nameSend);

    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'empty json not accepted' });
  });
  it('correct ', async function () {
    const nameSend = {
      name: 'val',
    };
    const res = await request(server).post('/professor').send(nameSend);
    const keys = [
      'broncoDirectName',
      'name',
      'rmpName',
      'rmp',
      'difficulty',
      'takeAgain',
    ];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
    keys.forEach((element) => {
      if (element === 'difficulty' || element === 'takeAgain') {
        expect(res.body[element]).to.be.an('number');
      } else {
        expect(res.body[element]).to.be.a('string');
      }
    });
  });
});
