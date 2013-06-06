define(["dojo/_base/xhr", "dojo/json", "dojo/_base/declare", "dojo/store/util/QueryResults",
        "dojo/_base/Deferred", "dojo/store/Memory", "dojo/when"
], function(xhr, JSON, declare, QueryResults, Deferred, Memory, when) {

/** BasicStore is an extension of Memory store that is designed to allow both retrieval of initial data and use of
  * the queryEngine for filtering data within the same query call.
  */
return declare("rc.modules.BasicStore", Memory, {
    
    loadComplete: false,
    isLoading: false,
    dataDeferred: null,
    target: "",
    accepts: "application/javascript, application/json", 
    
    
    constructor: function(/*dojo.store.JsonRest*/ options){
    	declare.safeMixin(this, options);
        if (options.data) {
            this.loadComplete = true;
        }
        return;
    },
    
    loadData: function() {
    	var headers = {};
    	headers.Accept = this.accepts;
        this.loadComplete = false;
        this.isLoading = true;
        this.dataDeferred = xhr("POST", {
                url: this.target,
                handleAs: "json",
                headers: headers
            });
        var _this = this;
        Deferred.when(this.dataDeferred, function(results) {
            _this.setData(results);
            _this.loadComplete = true;
            _this.isLoading = false;
        });
        return this.dataDeferred;
    },
    
    query: function(query, options){
        
        var mainData;
        var _this = this;
        if (_this.loadComplete) {
            mainData = {items:_this.data};
        } else {
            if (_this.isLoading) {
                mainData = _this.dataDeferred;
            } else {
                mainData = _this.loadData();
            }
        }
        
        var returnDeferred = when(mainData, function(dataRows) {
            if (query.hasOwnProperty()) {
                return _this.queryEngine(query, null)(dataRows.items);
            } else {
                return dataRows.items;
            }
        });
        
        return QueryResults(returnDeferred);
    }
});

});
