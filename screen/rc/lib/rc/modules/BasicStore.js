define(["dojo/_base/xhr", "dojo/json", "dojo/_base/declare", "dojo/store/util/QueryResults",
        "dojo/_base/Deferred", "dojo/store/Memory", "dojo/when", "dojo/_base/lang"

], function(xhr, JSON, declare, QueryResults, Deferred, Memory, when, lang) {

/** BasicStore is an extension of Memory store that is designed to allow both retrieval of initial data and use of
  * the queryEngine for filtering data within the same query call.
  */
return declare("rc.modules.BasicStore", Memory, {
    
    loadComplete: false,
    isLoading: false,
    dataDeferred: null,
    target: "",
    content: null,
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
        if (this.target) {
            this.dataDeferred = xhr("POST", {
                url: this.target,
                handleAs: "json",
                content: this.content,
                headers: headers
            });
        } else {
            this.dataDeferred = [];
        }
        var _this = this;
        Deferred.when(this.dataDeferred, function(results) {
            var data = results.items ? results.items : results;
            _this.setData(data);
            if (results.identifier && !_this.idProperty) {
                _this.idProperty = results.identifier;
            }
            _this.loadComplete = true;
            _this.isLoading = false;
        });
        return this.dataDeferred;
    },
    
    get: function(id) {
        if (this.loadComplete) {
            return this.inherited(arguments);
        } else {
            var _this = this;
            var def = new Deferred();
            if (!this.dataDeferred) {
                this.loadData();
            }
            this.dataDeferred.then(function(data) {
                var val = _this.data[_this.index[id]];
                // var f = lang.hitch(def, "resolve");
                // f.call(def, val);
                def.resolve(val);
                return;
            });
            return def;
        }
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
        
        var returnDeferred = when(mainData, function(data) {
            var dataRows = data.items ? data.items : data;
            if (query && query.hasOwnProperty()) {
                return _this.queryEngine(query, null)(dataRows);
            } else {
                return dataRows;
            }
        });
        
        return QueryResults(returnDeferred);
    }
});

});
