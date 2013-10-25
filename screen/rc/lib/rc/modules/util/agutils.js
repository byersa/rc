define( ["dojo/_base/lang"], function(lang){
    

    return {
        isEqual: function(/*Object*/ expected, /*Object*/ actual){
            // summary:
            //        are the passed expected and actual objects/values deeply
            //        equivalent?
        
            // Compare undefined always with three equal signs, because undefined==null
            // is true, but undefined===null is false.
            if((expected === undefined)&&(actual === undefined)){
                return true;
            }
            if(arguments.length < 2){
                return false;
            }
            if((expected === actual)||(expected == actual)||
                        ( typeof expected == "number" && typeof actual == "number" && isNaN(expected) && isNaN(actual) )){
        
                return true;
            }
            if( (lang.isArray(expected) && lang.isArray(actual))&&
                (this.arrayEq(expected, actual)) ){
                return true;
            }
            if( ((typeof expected == "object")&&((typeof actual == "object")))&&
                (this.objPropEq(expected, actual)) ){
                return true;
            }
            return false;
        },
    
        //objPropEq - taken from doh/runner.js
        objPropEq: function(expected, actual){
            // Degenerate case: if they are both null, then their "properties" are equal.
            if(expected === null && actual === null){
                return true;
            }
            // If only one is null, they aren't equal.
            if(expected === null || actual === null){
                return false;
            }
            if(expected instanceof Date){
                return actual instanceof Date && expected.getTime()==actual.getTime();
            }
            var x;
            // Make sure ALL THE SAME properties are in both objects!
            for(x in actual){ // Lets check "actual" here, expected is checked below.
                if(!(x in expected)){
                    return false;
                }
            }
        
            for(x in expected){
                if(!(x in actual)){
                    return false;
                }
                if(!doh.assertEqual(expected[x], actual[x], 0, true)){
                    return false;
                }
            }
            
            return true;
        },
    
        arrayEq: function(expected, actual){
            if(expected.length != actual.length){ return false; }
            // FIXME: we're not handling circular refs. Do we care?
            for(var x=0; x<expected.length; x++){
                if(!doh.assertEqual(expected[x], actual[x], 0, true)){ return false; }
            }
            return true;
        }

    }
});