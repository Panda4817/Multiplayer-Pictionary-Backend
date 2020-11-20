const chai = require('chai');
const assert = chai.assert;
const server = require('../index')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

describe('Router functional tests', function() {
    it('GET / => Server up and running', function(done) {
        chai.request(server)
          .get('/')
          .end(function(err, res){
            assert.equal(res.status, 200)
            assert.equal(res.text, 'Server is up and running')
            done()
          })
    })

    it('GET /room => JSON{room: room_name}', function(done) {
        chai.request(server)
          .get('/room')
          .end(function(err, res){
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.hasAllDeepKeys(res.body, ['room'])
            assert.isString(res.body['room'])
            assert.equal(res.body['room'].split('-').length, 3)
            done()
          })
    })
})