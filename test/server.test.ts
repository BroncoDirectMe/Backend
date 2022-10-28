import express from 'express';
import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const app = express();
const should = chai.should();
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
    const res = await chai.request(server).post('/professor').send(nameSend);
    // console.log(res)
    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'name of professor needs to be specified' });
  });
  it('Empty object', async function () {
    const nameSend = {};
    const res = await chai.request(server).post('/professor').send(nameSend);

    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'empty json not accepted' });
  });
  it('correct ', async function () {
    const nameSend = {
      name: 'val',
    };
    const res = await chai.request(server).post('/professor').send(nameSend);
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
