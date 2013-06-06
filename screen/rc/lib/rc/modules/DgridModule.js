define([
        'dojo/_base/declare',
        'dojo/string',
        'dojo/query',
        'dijit/registry',
	    "dojo/_base/lang",
        'dojo/on',
        'dojo/request',
        'dojo/store/Observable',
        'dgrid/GridFromHtml',
        'dgrid/OnDemandList',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dojox/html/_base',
    'dojox/layout/ContentPane',
    'rc/modules/DetailModule',
    'rc/modules/BasicStore',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/TextBox',
    'dijit/form/FilteringSelect'
], function(declare, string, query, registry, lang, on, request, Observable, GridFromHtml, OnDemandList, Selection, Keyboard, selector, htmlUtil, ContentPane, DetailModule, BasicStore) {
   
   var comboGrid = declare([GridFromHtml, OnDemandList, Selection, Keyboard]);

   var container = declare('rc.modules.DgridModule', [ContentPane], {
        
        storeId: '',
        detailViewUrl: '',
        store: null,
        grid: null,
        queryForm: null,
        queryUrl: '',
        
        constructor: function(params) {
            return;
        },
        
        postMixInProperties: function() {
            this.inherited(arguments);
            this.preload = true;
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            return;
        },
        
        
        // Intercept the _setContent call to substitute data from this object
        // into the template (ie. cont)
        _setContent: function(cont, isFakeContent) {
            var newCont = cont;
            if (!lang.isObject(cont)) {
                newCont = string.substitute(cont, this);
            }
            ContentPane.prototype._setContent.call(this, newCont, isFakeContent);
            
            var scriptNode = query("script", this.domNode)[0];
            console.log("scriptNode: " + scriptNode);
            if (scriptNode) {
                var txt = "";
                dojo.forEach(scriptNode.childNodes, function(nd) {
                    if (nd.nodeType == 3) {
                        txt += nd.nodeValue;
                    }
                }, this);
                console.log("txt: " + txt);
                htmlUtil.evalInGlobal(txt, this.domNode);
            }
            var gridNode = query("table", this.domNode)[0];
            if (gridNode) {
                console.log("gridNode: " + gridNode);
                var parentContainer = this.getParent();
                this.store = parentContainer.getStore();
                this.grid = new comboGrid({store: this.store}, gridNode);
                var selectorColumn = selector({grid: this});
                selectorColumn.init();
                this.grid.subRows[0].unshift(selectorColumn);
                this.grid.set("subRows", this.grid.subRows);
                var _this = this;
                this.grid.on(".dgrid-cell:click", this.handleActions);  
                this.grid.startup();
            }
            var formNode = query("form", this.domNode)[0];
            if (formNode) {
                console.log("formNode: " + gridNode);
                this.queryForm = registry.getEnclosingWidget(formNode);
                console.log("this.queryForm: " + this.queryForm);
                on(this.queryForm, "submit", this.submitQuery);
            }
            return;
        },
        
        submitQuery: function(evt) {
            var values = this.get("value");
            var dgridContainer = this.getParent();
            var thisGrid = dgridContainer.grid;
            var queryDeferred = request.post(dgridContainer.queryUrl, {
                        handleAs: "json",
                    data: values
                }).then(function(result) {
                    var tabContainer = dgridContainer.getParent();
                    var basicStore = new BasicStore({
                        data: result.items
                    });
                
                    var newStore = new Observable(basicStore);
                    tabContainer.setStore(newStore);
                    thisGrid.setStore(newStore);
                    return;
                    }, function(err) {
                        //console.log(err);
                        return;
                    });
            return;
        },
        
        create: function(params, srcNodeRef) {
            this.inherited(arguments);
            return;
        },
        
        postCreate: function() {
            this.inherited(arguments);
            return;
        },
        
        handleActions: function(evt) {
            var cell = grid.cell(evt);
            return;
        }
    });
    return container;
});

