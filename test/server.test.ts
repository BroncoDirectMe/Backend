import { expect, use, request } from 'chai';
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
      'takeClassAgain',
    ];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
    keys.forEach((element) => {
      if (element === 'difficulty' || element === 'takeClassAgain') {
        expect(res.body[element]).to.be.an('number');
      } else {
        expect(res.body[element]).to.be.a('string');
      }
    });
  });
});

describe('[Search] 3 test cases', function () {
  it('Empty array', async function () {
    const nameSend = {};
    const res = await request(server).post('/search').send(nameSend);

    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'please provide a json with key of count' });
  });
  it('No count property', async function () {
    const nameSend = {
      test: 'val',
    };
    const res = await request(server).post('/search').send(nameSend);
    expect(res.body)
      .to.be.an('object')
      .that.includes({ err: 'must specify the amount of professors needed' }) ||
      expect(res.body)
        .to.be.an('object')
        .that.includes({ err: 'please specify a number' });
  });
  it('correct ', async function () {
    const nameSend = {
      count: 1,
    };
    const res = await request(server).post('/search').send(nameSend);
    const keys = ['profs'];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
    expect(res.body.profs).to.be.a('array');
    res.body.profs.forEach((element: any) => {
      expect(element).to.be.a('number');
    });
  });
});

describe('[Majors] GET and POST test cases:', function () {
  // Test for GET /majors/:schoolYear
  it('GET valid school years', async function () {
    const schoolYear = '2022-2023';
    const res = await request(server).get(`/majors/${schoolYear}`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  it('GET invalid school year', async function () {
    const schoolYear = '1999-2000';
    const res = await request(server).get(`/majors/${schoolYear}`);
    expect(res).to.have.status(404);
    expect(res.text).to.equal('School year not found or data unavailable.');
  });

  // Test for POST /majors with optional school year
  it('POST with specified school year and major name', async function () {
    const payload = {
      schoolYear: '2022-2023',
      majorName: 'Computer Science, B.S.',
    };
    const res = await request(server).post('/majors').send(payload);
    expect(res).to.have.status(200);
    const keys = ['name', 'requirements', 'required', 'electives', 'units'];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
  });

  it('POST without school year (uses most recent year)', async function () {
    const payload = { majorName: 'Computer Science, B.S.' };
    const res = await request(server).post('/majors').send(payload);
    expect(res).to.have.status(200);
    const keys = ['name', 'requirements', 'required', 'electives', 'units'];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
  });

  it('POST with invalid school year', async function () {
    const payload = {
      schoolYear: '1999-2000',
      majorName: 'Computer Science, B.S.',
    };
    const res = await request(server).post('/majors').send(payload);
    expect(res).to.have.status(404);
    expect(res.text).to.equal('Invalid school year.');
  });
});

describe('[Courses] GET and POST test cases', function () {
  // Test for GET /courses/:schoolYear
  it('GET valid school year', async function () {
    const schoolYear = '2022-2023';
    const res = await request(server).get(`/courses/${schoolYear}`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  it('GET invalid school year', async function () {
    const schoolYear = '1999-2000';
    const res = await request(server).get(`/courses/${schoolYear}`);
    expect(res).to.have.status(404);
    expect(res.text).to.equal('Invalid school year.');
  });

  // Test for POST /courses with optional school year
  it('POST with specified school year and course ID', async function () {
    const payload = {
      schoolYear: '2022-2023',
      courseId: 'CS 1300',
    };
    const res = await request(server).post('/courses').send(payload);
    expect(res).to.have.status(200);
    const keys = ['id', 'name', 'units', 'prerequesites', 'corequesites'];
    expect(res.body).to.be.an('object').to.have.all.keys(keys);
  });

  it('POST without school year (uses most recent year)', async function () {
    const payload = { courseId: 'CS 1300' };
    const res = await request(server).post('/courses').send(payload);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
  });

  it('POST with invalid school year', async function () {
    const payload = {
      schoolYear: '1999-2000',
      courseId: 'CS 1300',
    };
    const res = await request(server).post('/courses').send(payload);
    expect(res).to.have.status(404);
    expect(res.text).to.equal('Invalid school year.');
  });
});
