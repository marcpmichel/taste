#!/usr/bin/env node

const { describe, it, stub, mock, expect, assert, Taste } = require('./taste.js');

Taste.onTestResult((type, name, message)  => {
  switch(type) {
    case 'group': console.log(`\n===== ${name} =====`); break;
    case 'pass':  console.log(`\t(OK) ${name}`); break;
    case 'fail':  console.log(`\t(EE) ${name} : ${this.$message}`); break;
    case 'debug': console.log(`\t(DD) ${message}`); break;
  }
});

console.log("hello");

describe("it works", function() {
  it("is successful", function() {
    assert(true, true);
  });

  it("can fail", function() {
    assert(false, true);
  });
});

describe("basic", function() {
  const A = {
    x: 1,
    s: "hello",
    f: function() { return 12; }
  };

  // it("has a property s", function() {
  //   expect(A).to_have_property("s");
  // });

  it("has a number property", function() {
    assert(A.x, 1);
  });

  it("object has a string property", function() {
    assert(A.s, "hello");
  });

  it("has a f function which returns 12", function() {
    assert(A.f(), 12);
  });

  it("can compare arrays", function() {
    var a = [ 1, 2, 3 ];
    var b = [ 1, 2, 3 ];
    assert(a, b);
  });
});



describe("Stubbing", function() {
  const Obj = { a: function() { return 0; }, }
  function b() { return 1; }

  it("can stub an object' method", function() {
    stub(Obj, 'a', b);
    assert(Obj.a(), 1);
  });
});

describe("Unstubbing", function() {
  const testObj = {
    f: function() { return 123; }
  }

  it("can unstub a stubbed function", function() {
    const s = stub(testObj, 'f', function() { return 666; });
    assert(testObj.f(), 666);
    s.unstub();
    assert(testObj.f(), 123);
  });
});


describe("Test Mock", function() {
  const testMock = {
    n: 1,
    s: "test",
    f: function() { return "function"; },
    o: { x: 1.2, y: 3.4 },
    a: [ 1, 2, 3 ]
  };

  it("can mock and unmock an object", function() {
    const m = mock(testMock, { n: 2, s: "mock" }); 
    assert(testMock.n, 2);
    assert(testMock.s, "mock");
    m.unmock();
    assert(testMock.n, 1);
    assert(testMock.s, "test");
  });

  const noUnmockObj = { n: 1 };
  it("*cannot* automatically unmock", function() {
    mock(noUnmockObj, { n: 2 });
    assert(noUnmockObj.n, 2);
  });
  it("*cannot* automatically unmock", function() {
    assert(noUnmockObj.n, 2);
  });

  it("can mock obj", function() {
    const xobj = { n: 1, s: "test", o: { x: 1 }, a: [1,2,3] }; 
    const m = mock(xobj, { n: 2, s: "hello", o: { x: 2 }, a: [4,5,6] });
    assert(xobj.n, 2);
  });

});


describe("Test expect", function() {
  var testValue = 12;
  it("can test expect : basic", function() {
    expect(testValue).to_equal(12);
  });

  var testFalsy = "";
  it("can test expect : falsy", function() {
    expect(testFalsy).to_be_falsy();
    expect(0).to_be_falsy();
    expect(null).to_be_falsy();
    expect(undefined).to_be_falsy();
  });

  it("can test truthy", function() {
    expect("hello").to_be_truthy();
    expect(1).to_be_truthy();
  });

  it("can compare numbers", function() {
    expect(12).to_be_greater_than(8);
  });

  it("can compare strings length", function() {
    expect("abc").same_length_as("def");
  });

});


describe("Test promise", function() {
  it("can test promise", function() {
    var prom = Promise.resolve(12);
    expect(prom).to_resolve();
  });

  it("can test promise reject", function(pass, fail) {
    var prom = Promise.reject().then(fail).catch(pass);
    // expect(prom).to_reject();
  });

  it("can test promise with assert", function(pass, fail) {
    var prom = Promise.reject("meh").then(fail).catch((res) => {
      res == "meh" ? pass() : fail();
    });
    // assert(prom, "meh", fail, pass);
  });

  it("can test promise with asser_resolve", function() {
    var prom = Promise.resolve(66);
    Taste.assert_resolve(prom);
  });
/*
  it("can test promise result", async function() {
    var prom = Promise.resolve(12);
    expect(prom).to_resolve_with(12);
  });
  it("can test promise rejection", async function() {
    var prom = Promise.reject("meh").catch(()=>{});;
    expect(prom).to_reject();
  });
  it("can test promise rejection error", async function() {
    var prom = Promise.reject("meh").catch(()=>{});;
    expect(prom).to_reject_with("ko");
  });
  it("can handle long promise", async function() {
    var prom = new Promise((resolve, reject) => {
      setTimeout(() => resolve(42), 2000);
    });
    expect(prom).to_reject();
  });
*/
});

