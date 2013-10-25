define(["dojo/_base/xhr", "dojo/json", "dojo/_base/declare", "dojo/store/util/QueryResults",
        "dojo/_base/Deferred", "rc/modules/BasicStore", 
        "dojo/when",
        'rc/modules/util/agutils'

], function(xhr, JSON, declare, QueryResults, Deferred, BasicStore, when, agutils) {

/** RWStore is an extension of BasicStore store that is designed to allow both reading and writing of data.
  */
var NEW = "new", REMOVED = "removed", MODIFIED = "modified"; //, INPROCESS = "inprocess";

    var rwStore = declare("rc.modules.RWStore", BasicStore, {
        
    nextPK: 0,

    postMixinProperties: function() {
        this.inherited(arguments);
        this.nextPK = 0;
        return;
    },
    
	put: function(object, options){
		// summary:
		//		Stores an object
		// object: Object
		//		The object to store.
		// options: dojo/store/api/Store.PutDirectives?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		// returns: Number
		var data = this.data,
			index = this.index,
			idProperty = this.idProperty;
		var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
		if(id in index){
			// object exists
			if(options && options.overwrite === false){
				throw new Error("Object already exists");
			}
			var existingObject = dojo.mixin({},data[index[id]]);
			delete existingObject[idProperty];
			delete existingObject.rwStoreStatus;
			if (agutils.isEqual(existingObject, object)) {
    			// replace the entry in data
    			//data[index[id]] = object;
			} else {
			    object[idProperty] = existingObject[idProperty];
			    object.rwStoreStatus = MODIFIED;
			}
		}else{
			// add the new object
			    object[idProperty] = --this.nextPK;
			    object.rwStoreStatus = NEW;
			index[id] = data.push(object) - 1;
		}
		return id;
	},
	
	getPKIndex: function() {
	    return this.nextPK;
	}
    });
    
    return rwStore;
});

    
    