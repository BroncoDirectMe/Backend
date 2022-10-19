import express from 'express';
import {expect} from "chai";
const chai = require('chai');
const app = express();

describe("basic test", function() {
    it("should return true", function() {
        expect(true).to.equal(true);
    });
})

//testing the professors hard coded into the mapping
describe("check professor data", function() {
    it("should get professor data", function(done) {
        let data = app.post('Hao Ji');
        expect(data).to.have.property('Hao Ji');
        done();
    });
})

describe("check professor data", function() {
    it("should get professor data", function(done) {
        let data = app.post('Ben Steichen');
        expect(data).to.have.property('Ben Steichen');
        done();
    });
})