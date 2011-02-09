JS.ENV.Test = this.Test || {}

Test.UnitSpec = JS.Test.describe(JS.Test.Unit, function() {
  include(JS.Test.Helpers)
  include(TestSpecHelpers)
  before(function() { createTestEnvironment() })
  
  describe("empty TestCase", function() {
    before(function(resume) {
      this.runTests({}, resume)
    })
    
    it("passes with no assertions, failures or errors", function() {
      assertTestResult( 0, 0, 0, 0 )
    })
  })
  
  describe("when an error is thrown", function() {
    it("catches and reports the error", function(resume) {
      runTests({
        testError: function() { throw new TypeError("derp") }
      }, function() { resume(function() {
        assertTestResult( 1, 0, 0, 1 )
        assertMessage( 1, "Error:\n" +
                          "testError(TestedSuite):\n" +
                          "TypeError: derp" )
      })})
    })
  })
  
  describe("#assertBlock", function() {
    it("passes when the block returns true", function(resume) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock("some message", function() { return true })
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 0, 0 )
      })})
    })
    
    it("fails with the given message when the block returns false", function(resume) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock("some message", function() { return false })
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( "Failure:\n" +
                       "testAssertBlock(TestedSuite):\n" +
                       "some message." )
      })})
    })
    
    it("fails with a default message when the block returns false", function(resume) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock(function() { return false })
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( "Failure:\n" +
                       "testAssertBlock(TestedSuite):\n" +
                       "assertBlock failed." )
      })})
    })
  })
  
  describe("#flunk", function() {
    it("fails with the given message", function(resume) {
      runTests({
        testFlunk: function() { with(this) {
          flunk("some message")
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( "Failure:\n" +
                       "testFlunk(TestedSuite):\n" +
                       "some message." )
      })})
    })
    
    it("fails with a default message", function(resume) {
      runTests({
        testFlunk: function() { with(this) {
          flunk()
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( "Failure:\n" +
                       "testFlunk(TestedSuite):\n" +
                       "Flunked." )
      })})
    })
  })
  
  describe("#assert", function() {
    it("passes when passed truthy values", function(resume) {
      runTests({
        testAssert: function() { with(this) {
          assert( true )
          assert( 1 )
          assert( "word" )
          assert( {} )
          assert( [] )
          assert( function() {} )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 6, 0, 0 )
      })})
    })
    
    it("fails when passed false", function(resume) {
      runTests({
        testAssert: function() { with(this) {
          assert( false, "It's not true" )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( "Failure:\n" +
                       "testAssert(TestedSuite):\n" +
                       "It's not true.\n" +
                       "<false> is not true." )
      })})
    })
  })
  
  describe("#assertEqual", function() {
    it("passes when given equal values", function(resume) {
      runTests({
        testAssertEqual: function() { with(this) {
          assertEqual( true, true )
          assertEqual( false, false )
          assertEqual( null, null )
          assertEqual( 0, 0.0 )
          assertEqual( 3.14, 3.14 )
          assertEqual( "foo", "foo" )
          assertEqual( [], [] )
          assertEqual( [1,2], [1,2] )
          assertEqual( [1, {foo: 2}], [1, {foo: 2}] )
          assertEqual( {}, {} )
          assertEqual( {foo: 2}, {foo: 2} )
          assertEqual( {foo: 2}, {foo: 2} )
          assertEqual( new JS.SortedSet([1,2]), new JS.SortedSet([2,1]) )
          
          assertNotEqual( true, false )
          assertNotEqual( false, null )
          assertNotEqual( 3, 0.3 )
          assertNotEqual( "foo", "bar" )
          assertNotEqual( [], [2,1] )
          assertNotEqual( [2,1], [] )
          assertNotEqual( {foo: 2}, {foo: 3} )
          assertNotEqual( {foo: 2}, {foo: 2, bar: 1} )
          assertNotEqual( {foo: 2, bar: 1}, {foo: 2} )
          assertNotEqual( new JS.SortedSet([3,2]), new JS.SortedSet([2,1]) )
          assertNotEqual( function() {}, function() {} )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 24, 0, 0 )
      })})
    })
    
    describe("with booleans", function() {
      it("fails when given different values", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( true, false )
          }},
          
          test2: function() { with(this) {
            assertEqual( false, null, "false and null are not equal" )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<true> expected but was\n" +
                            "<false>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "false and null are not equal.\n" +
                            "<false> expected but was\n" +
                            "<null>." )
        })})
      })
    })
    
    describe("with numbers", function() {
      it("fails when given unequal numbers", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( 3, 4 )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( 4, 4, "four is the same as itself" )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<3> expected but was\n" +
                            "<4>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "four is the same as itself.\n" +
                            "<4> expected not to be equal to\n" +
                            "<4>." )
        })})
      })
    })
    
    describe("with strings", function() {
      it("fails when given unequal strings", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( "foo", "bar" )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( "foo", "foo" )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<\"foo\"> expected but was\n" +
                            "<\"bar\">." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<\"foo\"> expected not to be equal to\n" +
                            "<\"foo\">." )
        })})
      })
    })
    
    describe("with arrays", function() {
      it("fails when given unequal arrays", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( [1,2], [2,1] )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( [9], [9] )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<[1,2]> expected but was\n" +
                            "<[2,1]>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<[9]> expected not to be equal to\n" +
                            "<[9]>." )
        })})
      })
    })
    
    describe("with objects", function() {
      it("fails when given unequal objects", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( {foo: 2}, {foo: 2, bar: 3} )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( {foo: [3,4]}, {foo: [3,4]} )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<{\"foo\":2}> expected but was\n" +
                            "<{\"bar\":3,\"foo\":2}>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<{\"foo\":[3,4]}> expected not to be equal to\n" +
                            "<{\"foo\":[3,4]}>." )
        })})
      })
      
      describe("with custom equality methods", function() {
        it("fails when given unequal objects", function(resume) {
          runTests({
            test1: function() { with(this) {
              assertEqual( new JS.SortedSet([1,2]), new JS.SortedSet([3,2]) )
            }},
            
            test2: function() { with(this) {
              assertNotEqual( new JS.SortedSet([2,1]), new JS.SortedSet([1,2]) )
            }}
          }, function() { resume(function() {
            assertTestResult( 2, 2, 2, 0 )
            
            // TODO stub Set#toString
            assertMessage( 1, "Failure:\n" +
                              "test1(TestedSuite):\n" +
                              "<SortedSet:{1,2}> expected but was\n" +
                              "<SortedSet:{2,3}>." )

            assertMessage( 2, "Failure:\n" +
                              "test2(TestedSuite):\n" +
                              "<SortedSet:{1,2}> expected not to be equal to\n" +
                              "<SortedSet:{1,2}>." )
          })})
        })
      })
    })
    
    describe("with functions", function() {
      it("fails when passed non-identical functions", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertEqual( function() {}, function() {} )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( JS.SortedSet, JS.SortedSet )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<#function> expected but was\n" +
                            "<#function>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<SortedSet> expected not to be equal to\n" +
                            "<SortedSet>." )
        })})
      })
    })
  })
  
  describe("#assertNull", function() {
    it("passes when given null", function(resume) {
      runTests({
        testAssertNull: function() { with(this) {
          assertNull( null )
          assertNotNull( false )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 2, 0, 0 )
      })})
    })
    
    it("fails when not given null", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertNull( false )
        }},
        
        test2: function() { with(this) {
          assertNotNull( null, "it's null" )
        }}
      }, function() { resume(function() {
        assertTestResult( 2, 2, 2, 0 )

        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "<null> expected but was\n" +
                          "<false>." )

        assertMessage( 2, "Failure:\n" +
                          "test2(TestedSuite):\n" +
                          "it's null.\n" +
                          "<null> expected not to be null." )
      })})
    })
  })
  
  describe("#assertKindOf", function() {
    describe("with string types", function() {
      it("passes when the object is of the named type", function(resume) {
        runTests({
          testAssertKindOf: function() { with(this) {
            assertKindOf( "string", "foo" )
            assertKindOf( "number", 9 )
            assertKindOf( "boolean", true )
            assertKindOf( "undefined", undefined )
            assertKindOf( "object", null )
            assertKindOf( "object", {} )
            assertKindOf( "object", [] )
            assertKindOf( "function", function() {} )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 8, 0, 0 )
        })})
      })
      
      it("fails when the object is not of the named type", function(resume) {
        runTests({
          test1: function() { with(this) { assertKindOf( "string",    67 )        }},
          test2: function() { with(this) { assertKindOf( "number",    "four" )    }},
          test3: function() { with(this) { assertKindOf( "boolean",   undefined ) }},
          test4: function() { with(this) { assertKindOf( "undefined", null )      }},
          test5: function() { with(this) { assertKindOf( "object",    "string" )  }},
          test6: function() { with(this) { assertKindOf( "array",     [] )        }}
        }, function() { resume(function() {
          assertTestResult( 6, 6, 6, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<67> expected to be an instance of\n" +
                            "<\"string\"> but was\n" +
                            "<\"number\">." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<\"four\"> expected to be an instance of\n" +
                            "<\"number\"> but was\n" +
                            "<\"string\">." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<undefined> expected to be an instance of\n" +
                            "<\"boolean\"> but was\n" +
                            "<\"undefined\">." )

          assertMessage( 4, "Failure:\n" +
                            "test4(TestedSuite):\n" +
                            "<null> expected to be an instance of\n" +
                            "<\"undefined\"> but was\n" +
                            "<\"object\">." )

          assertMessage( 5, "Failure:\n" +
                            "test5(TestedSuite):\n" +
                            "<\"string\"> expected to be an instance of\n" +
                            "<\"object\"> but was\n" +
                            "<\"string\">." )

          assertMessage( 6, "Failure:\n" +
                            "test6(TestedSuite):\n" +
                            "<[]> expected to be an instance of\n" +
                            "<\"array\"> but was\n" +
                            "<\"object\">." )
        })})
      })
    })
    
    describe("with functional types", function() {
      it("passes when the object is of the referenced type", function(resume) {
        runTests({
          testAssertKindOf: function() { with(this) {
            assertKindOf( Object, {} )
            assertKindOf( Array, [] )
            assertKindOf( Function, function() {} )
            assertKindOf( Object, [] )
            assertKindOf( Object, function() {} )
            assertKindOf( String, "foo" )
            assertKindOf( Number, 9 )
            assertKindOf( Boolean, false )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 8, 0, 0 )
        })})
      })
      
      it("fails when the object is not of the referenced type", function(resume) {
        runTests({
          test1: function() { with(this) { assertKindOf( Object,    "foo" )     }},
          test2: function() { with(this) { assertKindOf( Array,     {} )        }},
          test3: function() { with(this) { assertKindOf( Function,  [] )        }},
          test4: function() { with(this) { assertKindOf( String,    true )      }},
          test5: function() { with(this) { assertKindOf( Array,     undefined ) }}
        }, function() { resume(function() {
          assertTestResult( 5, 5, 5, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<\"foo\"> expected to be an instance of\n" +
                            "<Object> but was\n" +
                            "<String>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<{}> expected to be an instance of\n" +
                            "<Array> but was\n" +
                            "<Object>." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<[]> expected to be an instance of\n" +
                            "<Function> but was\n" +
                            "<Array>." )

          assertMessage( 4, "Failure:\n" +
                            "test4(TestedSuite):\n" +
                            "<true> expected to be an instance of\n" +
                            "<String> but was\n" +
                            "<Boolean>." )

          assertMessage( 5, "Failure:\n" +
                            "test5(TestedSuite):\n" +
                            "<undefined> expected to be an instance of\n" +
                            "<Array> but was\n" +
                            "<\"undefined\">." )
        })})
      })
    })
    
    describe("with modular types", function() {
      it("passes when the object's inheritance chain includes the given module", function(resume) {
        runTests({
          testAssertKindOf: function() { with(this) {
            var set = new JS.SortedSet([1,2])
            
            assertKindOf( JS.Module,  JS.SortedSet )
            assertKindOf( JS.Class,   JS.SortedSet )
            assertKindOf( JS.Kernel,  JS.SortedSet )
            
            assertKindOf( JS.Set,         set )
            assertKindOf( JS.SortedSet,   set )
            assertKindOf( JS.Kernel,      set )
            assertKindOf( JS.Enumerable,  set )
            
            set.extend(JS.Observable)
            assertKindOf( JS.Observable,  set )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 8, 0, 0 )
        })})
      })
      
      it("fails when the object's inheritance chain does not include the given module", function(resume) {
        runTests({
          test1: function() { with(this) { assertKindOf( Array,         JS.SortedSet ) }},
          test2: function() { with(this) { assertKindOf( JS.Enumerable, JS.SortedSet ) }},
          test3: function() { with(this) { assertKindOf( JS.Observable, JS.SortedSet ) }},
          test4: function() { with(this) { assertKindOf( JS.Module,     new JS.SortedSet([1,2]) ) }},
          test5: function() { with(this) { assertKindOf( JS.Class,      new JS.SortedSet([1,2]) ) }},
          test6: function() { with(this) { assertKindOf( JS.Observable, new JS.SortedSet([1,2]) ) }}
        }, function() { resume(function() {
          assertTestResult( 6, 6, 6, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<SortedSet> expected to be an instance of\n" +
                            "<Array> but was\n" +
                            "<Class>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<SortedSet> expected to be an instance of\n" +
                            "<Enumerable> but was\n" +
                            "<Class>." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<SortedSet> expected to be an instance of\n" +
                            "<Observable> but was\n" +
                            "<Class>." )

          assertMessage( 4, "Failure:\n" +
                            "test4(TestedSuite):\n" +
                            "<SortedSet:{1,2}> expected to be an instance of\n" +
                            "<Module> but was\n" +
                            "<SortedSet>." )

          assertMessage( 5, "Failure:\n" +
                            "test5(TestedSuite):\n" +
                            "<SortedSet:{1,2}> expected to be an instance of\n" +
                            "<Class> but was\n" +
                            "<SortedSet>." )

          assertMessage( 6, "Failure:\n" +
                            "test6(TestedSuite):\n" +
                            "<SortedSet:{1,2}> expected to be an instance of\n" +
                            "<Observable> but was\n" +
                            "<SortedSet>." )
        })})
      })
    })
  })
  
  describe("#assertRespondTo", function() {
    it("passes when the object responds to the named message", function(resume) {
      runTests({
        testAssertRespondTo: function() { with(this) {
          assertRespondTo( Object, "prototype" )
          assertRespondTo( [], "length" )
          assertRespondTo( "foo", "toUpperCase" )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 3, 0, 0 )
      })})
    })
    
    it("fails when the object does not respond to the named message", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertRespondTo( Object, "foo" )
        }},
        
        test2: function() { with(this) {
          assertRespondTo( "foo", "downcase" )
        }},
        
        test3: function() { with(this) {
          assertRespondTo( undefined, "downcase" )
        }},
        
        test4: function() { with(this) {
          assertRespondTo( JS.Class, "nomethod" )
        }}
      }, function() { resume(function() {
        assertTestResult( 4, 4, 4, 0 )

        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "<Object>\n" +
                          "of type <Function>\n" +
                          "expected to respond to <\"foo\">." )

        assertMessage( 2, "Failure:\n" +
                          "test2(TestedSuite):\n" +
                          "<\"foo\">\n" +
                          "of type <String>\n" +
                          "expected to respond to <\"downcase\">." )

        assertMessage( 3, "Failure:\n" +
                          "test3(TestedSuite):\n" +
                          "<undefined>\n" +
                          "of type <\"undefined\">\n" +
                          "expected to respond to <\"downcase\">." )

        assertMessage( 4, "Failure:\n" +
                          "test4(TestedSuite):\n" +
                          "<Class>\n" +
                          "of type <Class>\n" +
                          "expected to respond to <\"nomethod\">." )
      })})
    })
  })
  
  describe("#assertMatch", function() {
    describe("with regular expressions", function() {
      it("passes if the string matches the pattern", function(resume) {
        runTests({
          testAssertMatch: function() { with(this) {
            assertMatch( /Foo/i, "food" )
            assertNoMatch( /Foo/, "food" )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails if the string does not match the pattern", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertMatch( /Foo/, "food" )
          }},
          
          test2: function() { with(this) {
            assertNoMatch( /Foo/i, "food" )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<\"food\"> expected to match\n" +
                            "</Foo/>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<\"food\"> expected not to match\n" +
                            "</Foo/i>." )
        })})
      })
      
      it("fails if the string is undefined", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertMatch( /[a-z]+/, undefined )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<undefined> expected to match\n" +
                            "</[a-z]+/>." )
        })})
      })
    })
    
    describe("with modules", function() {
      it("passes if the object is of the given type", function(resume) {
        runTests({
          testAssertMatch: function() { with(this) {
            assertMatch( JS.Module, JS.Enumerable )
            assertNoMatch( JS.Class, new JS.SortedSet([1,2]) )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails if the object is not of the given type", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertMatch( JS.Class, new JS.SortedSet([1,2]) )
          }},
          
          test2: function() { with(this) {
            assertNoMatch( JS.Module, JS.Enumerable )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<SortedSet:{1,2}> expected to match\n" +
                            "<Class>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<Enumerable> expected not to match\n" +
                            "<Module>." )
        })})
      })
    })
    
    describe("with ranges", function() {
      it("passes if the object is in the given range", function(resume) {
        runTests({
          testAssertMatch: function() { with(this) {
            assertMatch( new JS.Range(1,10), 10 )
            assertNoMatch( new JS.Range(1,10,true), 10 )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails if the object is not in the given range", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertMatch( new JS.Range(1,10,true), 10 )
          }},
          
          test2: function() { with(this) {
            assertNoMatch( new JS.Range(1,10), 10 )
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<10> expected to match\n" +
                            "<1...10>." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<10> expected not to match\n" +
                            "<1..10>." )
        })})
      })
    })
  })
  
  describe("#assertSame", function() {
    it("passes when the objects are identical", function(resume) {
      runTests({
        testAssertSame: function() { with(this) {
          var obj = {}, arr = [], fn = function() {}, set = new JS.SortedSet([1,2])
          
          assertSame( obj, obj )
          assertSame( arr, arr )
          assertSame( fn,  fn  )
          assertSame( set, set )
          
          assertNotSame( obj, {} )
          assertNotSame( arr, [] )
          assertNotSame( fn,  function() {}  )
          assertNotSame( set, new JS.SortedSet([1,2]) )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 8, 0, 0 )
      })})
    })
    
    it("fails when the objects are not identical", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertSame( {}, {} )
        }},
        test2: function() { with(this) {
          assertSame( [], [], "custom message" )
        }},
        test3: function() { with(this) {
          assertNotSame( Object, Object )
        }},
        test4: function() { with(this) {
          assertSame( new JS.SortedSet([2,1]), new JS.SortedSet([2,1]) )
        }}
      }, function() { resume(function() {
        assertTestResult( 4, 4, 4, 0 )

        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "<{}> expected to be the same as\n" +
                          "<{}>." )

        assertMessage( 2, "Failure:\n" +
                          "test2(TestedSuite):\n" +
                          "custom message.\n" +
                          "<[]> expected to be the same as\n" +
                          "<[]>." )

        assertMessage( 3, "Failure:\n" +
                          "test3(TestedSuite):\n" +
                          "<Object> expected not to be the same as\n" +
                          "<Object>." )

        assertMessage( 4, "Failure:\n" +
                          "test4(TestedSuite):\n" +
                          "<SortedSet:{1,2}> expected to be the same as\n" +
                          "<SortedSet:{1,2}>." )
      })})
    })
  })
  
  describe("#assertInDelta", function() {
    it("passes when the value is within delta of the expected result", function(resume) {
      runTests({
        testAssertInDelta: function() { with(this) {
          assertInDelta(5, 4, 1)
          assertInDelta(5, 2, 3)
          assertInDelta(-3, 4, 7)
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 3, 0, 0 )
      })})
    })
    
    it("fails when the value differs from the expected result by more than delta", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertInDelta(5, 3.9, 1, "out by 0.1")
        }},
        test2: function() { with(this) {
          assertInDelta(5, 1, 3)
        }},
        test3: function() { with(this) {
          assertInDelta(-3, 5, 7)
        }}
      }, function() { resume(function() {
        assertTestResult( 3, 3, 3, 0 )

        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "out by 0.1.\n" +
                          "<5> and\n" +
                          "<3.9> expected to be within\n" +
                          "<1> of each other." )

        assertMessage( 2, "Failure:\n" +
                          "test2(TestedSuite):\n" +
                          "<5> and\n" +
                          "<1> expected to be within\n" +
                          "<3> of each other." )

        assertMessage( 3, "Failure:\n" +
                          "test3(TestedSuite):\n" +
                          "<-3> and\n" +
                          "<5> expected to be within\n" +
                          "<7> of each other." )
      })})
    })
  })
  
  describe("#assertSend", function() {
    it("passes when the constructed method call returns true", function(resume) {
      runTests({
        testAssertSend: function() { with(this) {
          assertSend( [JS.SortedSet, 'includes', JS.Enumerable] )
          assertSend( [JS.SortedSet, 'isA', JS.Class] )
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 2, 0, 0 )
      })})
    })
    
    it("fails when the constructed method call returns false", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertSend( [JS.SortedSet, 'isA', JS.Enumerable], "classes are not enumerable" )
        }},
        test2: function() { with(this) {
          assertSend( [JS.SortedSet, 'includes', JS.Class] )
        }}
      }, function() { resume(function() {
        assertTestResult( 2, 2, 2, 0 )

        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "classes are not enumerable.\n" +
                          "<SortedSet> expected to respond to\n" +
                          "<isA(Enumerable)> with a true value." )

        assertMessage( 2, "Failure:\n" +
                          "test2(TestedSuite):\n" +
                          "<SortedSet> expected to respond to\n" +
                          "<includes(Class)> with a true value." )
      })})
    })
  })
  
  describe("#assertThrow", function() {
    before(function() {
      var isOpera = (typeof MemoryError !== "undefined")
      forEach($w("TypeError RangeError ReferenceError SyntaxError"), function(type) {
        this["__" + type] = isOpera ? "MemoryError" : type
      }, this)
    })
    
    describe("with one exception type", function() {
      it("passes when the block throws the referenced exception type", function(resume) {
        runTests({
          testAssertThrow: function() { with(this) {
            assertThrow(TypeError,  function() { throw new TypeError() })
            assertThrow(String,     function() { throw "a string" })
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails when the block does not throw any exceptions", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertThrow(TypeError,  function() {  })
          }},
          test2: function() { with(this) {
            assertThrow(String,     function() {  })
          }}
        }, function() { resume(function() {
          assertTestResult( 2, 2, 2, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<["+__TypeError+"]> exception expected but none was thrown." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<[String]> exception expected but none was thrown." )
        })})
      })
      
      it("fails when the block throws the wrong type of exception", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertThrow(TypeError,  function() { throw new RangeError("this is the wrong type") })
          }},
          test2: function() { with(this) {
            assertThrow(String,     function() { throw TypeError })
          }},
          test3: function() { with(this) {
            assertThrow(TypeError,  function() { throw "string error" })
          }}
        }, function() { resume(function() {
          assertTestResult( 3, 3, 3, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<["+__TypeError+"]> exception expected but was\n" +
                            "RangeError: this is the wrong type." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<[String]> exception expected but was\n" +
                            __TypeError+"." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<["+__TypeError+"]> exception expected but was\n" +
                            "\"string error\"." )
        })})
      })
    })
    
    describe("with several exception types", function() {
      it("passes when the block throws one of the referenced exception types", function(resume) {
        runTests({
          testAssertThrow: function() { with(this) {
            assertThrow(TypeError, RangeError, function() { throw new RangeError() })
            assertThrow(SyntaxError, String, function() { throw "a string" })
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails when the block does not throw an exception", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertThrow(TypeError, RangeError, function() {  })
          }},
          test2: function() { with(this) {
            assertThrow(ReferenceError, SyntaxError, function() {  })
          }},
          test3: function() { with(this) {
            assertThrow(SyntaxError, String, function() {  })
          }}
        }, function() { resume(function() {
          assertTestResult( 3, 3, 3, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<["+__TypeError+","+__RangeError+"]> exception expected but none was thrown." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<["+__ReferenceError+","+__SyntaxError+"]> exception expected but none was thrown." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<["+__SyntaxError+",String]> exception expected but none was thrown." )
        })})
      })
      
      it("fails when the block throws the wrong type of exception", function(resume) {
        runTests({
          test1: function() { with(this) {
            assertThrow(TypeError, RangeError, function() { throw "a string" })
          }},
          test2: function() { with(this) {
            assertThrow(ReferenceError, SyntaxError, function() { throw TypeError })
          }},
          test3: function() { with(this) {
            assertThrow(SyntaxError, String, function() { throw new TypeError("a type error") })
          }}
        }, function() { resume(function() {
          assertTestResult( 3, 3, 3, 0 )

          assertMessage( 1, "Failure:\n" +
                            "test1(TestedSuite):\n" +
                            "<["+__TypeError+","+__RangeError+"]> exception expected but was\n" +
                            "\"a string\"." )

          assertMessage( 2, "Failure:\n" +
                            "test2(TestedSuite):\n" +
                            "<["+__ReferenceError+","+__SyntaxError+"]> exception expected but was\n" +
                            __TypeError+"." )

          assertMessage( 3, "Failure:\n" +
                            "test3(TestedSuite):\n" +
                            "<["+__SyntaxError+",String]> exception expected but was\n" +
                            "TypeError: a type error." )
        })})
      })
    })
  })
  
  describe("#assertNothingThrown", function() {
    it("passes when the block throws no exceptions", function(resume) {
      runTests({
        testAssertNothingThrown: function() { with(this) {
          assertNothingThrown(function() {})
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 0, 0 )
      })})
    })
    
    it("fails and reports the exception when the block throws an exception", function(resume) {
      runTests({
        test1: function() { with(this) {
          assertNothingThrown("but there was an error", function() { throw new TypeError("the wrong type") })
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( 1, "Failure:\n" +
                          "test1(TestedSuite):\n" +
                          "but there was an error.\n" +
                          "Exception thrown:\n" +
                          "TypeError: the wrong type." )
      })})
    })
  })
  
})

