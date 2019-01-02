
var path = require('path');
// load default variables for testing
require('dotenv').config({ path: path.join(__dirname, '../../.env.example') });

var app = require('../../app');
var request = require('supertest');

describe('express', function() {
  it('load home page when GET /', function() {
    request(app).get('/').expect(200);
  });

  it('404 when page not found', function() {
    request(app).get('/foo/bar').expect(404);
  });

});
