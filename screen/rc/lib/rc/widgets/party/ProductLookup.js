define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dijit/registry',
        'dojo/query',
        'dojo/on',
        'dojo/request',
        'dojo/_base/array',
        'dijit/Dialog',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
        'rql/js-array',
        'dgrid/selector',
        'dojo/text!./templates/ProductLookup.html'

        ], function(declare, lang, domStyle, domConstruct, registry, query, on, request, array,
            Dialog, _TemplatedMixin, _WidgetsInTemplateMixin,
            Observable, OnDemandGrid, Selection, Keyboard, selector,
            Memory, ObjectStore, jsArray, selector,
            template
        ) {
            
        var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
       
        var wid = declare("rc.widgets.party.ProductLookup", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString: template,
        storeUrl: '/product/queryProduct',
        callback: null,
        idProperty: "productId",
        
        postCreate: function() {
            this.inherited(arguments);
            var _this = this;
                var xhrDeferred = request(this.storeUrl,{
                    handleAs: "json",
                    method: "POST",
                    timeout: 10000
                });
                xhrDeferred.then(function(data) {
                    console.log("success: " + JSON.stringify(data.items));
                    _this.productRows = data.items;
                    var basicStore = new BasicStore({
                        id: _this.id + '-store',
                        data: data.items,
                        idProperty: _this.idProperty
                        });
                    _this.store = new Observable(basicStore);
                    _this.grid = new comboGrid({store: _this.store, columns: _this.getProductColumns()}, _this.gridNode);
                    return;
                },
                function(err) {
                    console.log("err: " + err.toString());
                });
            return;
        },
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            return;
        },
        
        getMainColumns: function() {
            return [
							selector({field: 'selectorCheckbox', label:'Select'}, "checkbox"),
							{field: 'productName', label:'Name', sortable: true, formatter: this.fullNameFormatter}
					];
			},
			
		init: function(selectedArray, callback) {
		    var idPrefix = this.id + "-row-";
		    var row;
		    array.forEach(selectedArray, function(productId) {
		        row = this.grid.row(productId);
		        this.grid.select(row);
		    }, this);
		    this.callback = callback;
		    return;
		},
		
        eof: function() {
        }

       });
       return wid;
});
