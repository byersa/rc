define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dijit/registry',
        'dojo/query',
        'dojo/on',
        'dojo/_base/array',
        'dojo/request',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'rc/modules/BasicStore',
        'dojo/data/ObjectStore',
        'rql/js-array',
        'dijit/form/ValidationTextBox',
        'dijit/form/TextBox',
        'dijit/form/Select',
        'dijit/form/Button',
        'dijit/form/FilteringSelect',
        'dijit/form/Form',
        'dojox/validate',
        'dojox/validate/web',
        'dojo/text!./templates/AssocProduct.html'

        ], function(declare, lang, domStyle, domConstruct, registry, query, on, array, request,
                WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
              Observable, OnDemandGrid, Selection, Keyboard, selector,
              BasicStore, ObjectStore, jsArray,
              ValidationTextBox, TextBox, Select, Button, FilteringSelect, Form,
              validate, validateWeb, template
        ) {
            
       var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
       var INVALID_MESSAGE = "Entry is invalid.";
       
       var wid = declare("rc.widgets.common.AssocProduct", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
           store: null,
           grid: null,
           columns: null,
           idProperty: "productId",
           storeUrl: "/product/queryProduct",
           data: null,
           origData: null,
           fieldStores: null,
           assocTitle: "",
           inactivesVisible: false,
           columnDef: null,
           errorMsgs: null,
           productRows: null,
           
            postCreate: function() {
                this.inherited(arguments);
                this.productRows = [];
                this.store = new Observable(new BasicStore({target: this.storeUrl, idProperty:this.idProperty, 
                    queryEngine: jsArray.query, data: this.data, timestamps: ['fromDate', 'thruDate']}));
                this.columns = this.buildColumns();
                this.grid = new comboGrid({columns: this.columns, store: this.store}, this.gridNode);
                this.grid.addCssRule(".dgrid-selector", "width: 60px;");
                this.grid.startup();
                this.grid.resize();
               return;
            },
           
           buildColumns: function() {
                return [
                            selector({label:'Select'}, "checkbox"),
                            {field: 'productName', label:'Product Name', sortable: true}
                    ];
            },
            
            _getValueAttr: function() {
                // handle products
                var productArray = [];
                array.forEach(this.productRows, function(product) {
                    if(!this.grid.selection[product.productId]) {
                        productArray.push({productId: product.productId, fromDate:product.fromDate, 
                         roleTypeId: product.roleTypeId, thruDate: new Date()});
                    } else {
                        delete this.grid.selection[product.productId];
                    }
                }, this);
                for (var prodId in this.grid.selection) {
                    productArray.push({productId: prodId, fromDate: new Date()});
                }
                return productArray;
            },
            
            _setValueAttr: function(partyId) {
               var _this = this;
                var xhrDeferred = request(this.storeUrl,{
                    handleAs: "json",
                    data: {partyId: partyId},
                    method: "POST",
                    timeout: 10000
                });
                xhrDeferred.then(function(data) {
                    console.log("success: " + JSON.stringify(data.items));
                    _this.productRows = data.items;
                    array.forEach(_this.productRows, function(row) {
                        if (row.fromDate && typeof row.fromDate === "string") {
                            row.fromDate = new Date(row.fromDate);
                        }
                        if (row.thruDate && typeof row.thruDate === "string") {
                            row.thruDate = new Date(row.thruDate);
                        }
                    }, this);
                    var productIdList = array.map(data.items, function(row) {
                        return row.productId;
                    });
                    _this.grid.clearSelection();
                    var idPrefix = _this.grid.id + "-row-";
                    array.forEach(productIdList, function(id) {
                        _this.grid.select(id);
                    });
                    _this.grid.resize();
                    return;
                });
               return;
           },
           
            clearSelection: function() {
                this.grid.clearSelection();
            },
            
            resize: function() {
                this.grid.resize();
            },
            
            eof: function() {
                return;
            }
       });
       return wid;
});            
