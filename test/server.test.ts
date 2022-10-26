import express from 'express';
import {expect} from "chai";
import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const app = express();
const should = chai.should()
const server = 'localhost:3000'


describe("basic test", function() {
    it("should return true", function() {
        expect(true).to.equal(true);
    });
})

// // testing the professors hard coded into the mapping
// describe("check professor data", function() {
//     it("should get professor data", function(done) {
//         let data = app.post('Hao Ji');
//         expect(data).to.have.property('Hao Ji');
//         done();
//     });
// })

// describe("check professor data", function() {
//     it("should get professor data", function(done) {
//         let data = app.post('Ben Steichen');
//         expect(data).to.have.property('Ben Steichen');
//         done();
//     });
// })
describe("[Professor] checks if error handling is in check",function(){
    it("should safely handle the error and return a message",async function(done){
        const nameSend = {
            "name":"test"

        }
        const res = await chai.request(server).post('/professor').send(nameSend)
        expect(res.body).to.have.property("name")
        
        done()
        
        
    })
    it("should safely handle the error and return a message",async function(done){
        const nameSend = {
            "name":"test"

        }
        const res = await chai.request(server).post('/professor').send(nameSend)
            
                
                
                
            
        expect(res.body).to.have.property("name")
                
        done()
            
        
        
    })

})
// describe("[Professor] checks if error handling is in check",async function(){
//     it("should safely handle the error and return a message",async function(){
//         const nameSend = {
//             "name":"test"

//         }
//         const result = await chai.request(server).post('/professor').send(nameSend)
            
        
        
//     })

// })