#!/usr/bin/env node

const { describe, it, stub, mock, expect, assert, onTestResult } = require('./taste.js');

describe("basic", function() {
  it("can test basic values", function() {
    assert(12,12);
  });

  it("can assert with explicit pass & fail", function(pass, fail) {
    assert("Hello", "Hello", pass, fail);
  });
});

describe("expect", function() {
  it("can use expect", function() {
    expect(12).to_equal(12);
  });
});

describe("Test promise", function() {

  it("can test promise", function() {
    var prom = Promise.resolve(12);
    expect(prom).to_resolve();
  });
  it("can test promise result", function() {
    var prom = Promise.resolve(12);
    expect(prom).to_resolve_with(12);
  });
  it("can test promise rejection", function(pass, fail) {
    var prom = Promise.reject("meh");
    prom.then(fail).catch(pass);
    // expect(prom).to_reject();
  });

  it("can test promise rejection error", function(pass, fail) {
      var prom = Promise.reject("meh")
        .then(fail).catch(pass);
      // expect(prom).to_reject_with("meh");
  });

  it("can handle long promise", function () {
    var prom = new Promise((resolve, reject) => {
      setTimeout(() => { resolve(42) }, 2000);
    });
    expect(prom).to_resolve_with(42);
  });

  it("can test long rejected promise", function(pass, fail) {
    var prom = new Promise((resolve, reject) => {
      setTimeout(() => { reject("arh") }, 2000);
    }).then(fail).catch(pass);
    // expect(prom).to_reject_with("arh");
  });

});
