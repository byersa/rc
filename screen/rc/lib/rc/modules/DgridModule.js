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
    'dijit/form/FilteringSelect',
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, Observable, GridFromHtml, OnDemandList, Selection, Keyboard, selector, htmlUtil, ContentPane, DetailModule, BasicStore) {
   
   var comboGrid = declare([GridFromHtml, OnDemandList, Selection, Keyboard]);

   var container = declare('rc.modules.DgridModule', [ContentPane], {
        
        storeId: '',
        detailViewUrl: '',
        store: null,
        grid: null,
        queryForm: null,
        queryUrl: '',
        createUrl: '',
        scriptHasHooks: true,
        
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
            /*
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
            */
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
                this.grid.startup();
                var dblClickHndl = this.grid.on(".dgrid-row:dblclick", this.handleDblClick);  
                console.log("dblClickHndl: " + dblClickHndl);
            }
            var formNode = query("form", this.domNode)[0];
            if (formNode) {
                console.log("formNode: " + formNode);
                this.queryForm = registry.getEnclosingWidget(formNode);
                console.log("this.queryForm: " + this.queryForm);
                on(this.queryForm, "submit", this.submitQuery);
            }
            var dialogNode = query("[id=createDialog]")[0];
            if (dialogNode) {
                console.log("dialogNode: " + dialogNode);
                //this.createDialog = registry.getEnclosingWidget(dialogNode);
                this.createDialog = registry.byId("createDialog");
                console.log("this.createDialog: " + this.createDialog);
                var formNode2 = query("form", dialogNode)[0];
                if (formNode2) {
                    var createForm = registry.getEnclosingWidget(formNode2);
                    on(createForm, "submit", this.submitCreate);
                }
            }
            var showDialogButton = query('input[name="showDialogButton"]', this.domNode)[0];
            if (showDialogButton) {
                console.log("showDialogButton: " + showDialogButton);
                this.showDialogButton = registry.getEnclosingWidget(showDialogButton);
                console.log("this.showDialogButton: " + this.showDialogButton);
                on(this.showDialogButton, "click", this.showDialog);
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
        
        showDialog: function() {
            var dialog = registry.byId("createDialog");
            dialog.opener = this;
            dialog.show();
            return;
        },
        
        submitCreate: function(evt) {
            var values = this.get("value");
            var dgridContainer = this.getParent();
            var thisGrid = dgridContainer.grid;
            var queryDeferred = request.post(dgridContainer.createUrl, {
                        handleAs: "json",
                    data: values
                }).then(function(result) {
                    var row, list;
                    if(dojo.isArray(result) ) {
                        list = result;
                    } else {
                        list = result.items;
                    }
                    if (list.length) {
                        thisGrid.put(list[0]);
                    }
                        
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

