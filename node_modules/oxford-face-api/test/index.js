'use strict'

var Face = require('../index.js');

var assert = require('assert');
var should = require('should');

describe('init', function(){
  var primary_key = "ABCDEFGHIJKLMN";

  it('not set primary key', function(){
    var face = new Face();
    assert.equal(face.API_PRIMARY_KEY, undefined);
  })

  it('set primary key', function(){
    var face = new Face(primary_key);
    face.API_PRIMARY_KEY.should.equal(primary_key);
  })
})
