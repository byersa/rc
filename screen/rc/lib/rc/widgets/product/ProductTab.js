define([
        'dojo/_base/declare',
        'dojo/string',
        'dojo/query',
        'dijit/registry',
	    "dojo/_base/lang",
        'dojo/on',
        'dojo/request',
        'dojo/html',
        'dojo/dom',
        'dojo/dom-attr',
        'dojox/html/_base',
        'dojo/json',
        'dojo/_base/array',
        'dojo/request',
        'dojo/dom-style',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
    'dijit/layout/BorderContainer',
    'dojo/text!./templates/ProductTab.html',
    'rc/modules/BasicStore',
    'rc/modules/RWStore',
    'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dgrid/editor',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
    'dijit/form/ValidationTextBox',
    'dijit/form/TextBox',
    'dijit/form/Select',
    'dijit/form/FilteringSelect',
    'dojox/validate',
    'dojox/validate/web',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/layout/ContentPane',
    'dijit/form/RadioButton',
    'dijit/Dialog',
    'dijit/form/Textarea'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, 
            array, request, domStyle, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            BasicStore, RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, ObjectStore, ValidationTextBox, TextBox, Select, FilteringSelect, validate, webValidate
            ) {
                
    var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
    
    var productTab = declare("rc.widgets.product.ProductTab", [BorderContainer, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        templateString: template,
        design: 'headline',
        storeUrl: '',
        store: null,
        idProperty: '',
        detailMode: 'create',
						
        constructor: function() {
            return;
        },
        
        postCreate: function() {
            this.inherited(arguments);
            var _this = this;
            var basicStore = new BasicStore({
                id: this.id + '-store',
                //target: this.storeUrl,
                idProperty: this.idProperty
                });
            this.store = new Observable(basicStore);
            
            console.log("gridNode: " + this.gridNode);
            this.grid = new comboGrid({store: this.store, columns: this.getMainColumns()}, this.gridNode);
            var dblClickHndl = this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            console.log("dblClickHndl: " + dblClickHndl);

            query("input[name=saveDetail]").on("click", lang.hitch(_this, "submitDetailForm"));
            query("input[name=showCreateButton]").on("click", lang.hitch(_this, "showCreateForm"));
            
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            return;
        },
        
        showCreateForm: function() {
            return;
        },
        
        showEditForm: function(data) {
            return;
        },
        
        getMainColumns: function() {
            return [
							{field: 'productId', label:'Name', sortable: true},
							{field: 'productName', label: 'Product Name', sortable: true},
							{field: 'description', label: 'Email', sortable: false, formatter: this.descriptionFormatter},
							{field: 'price', label: 'Phone', sortable: false}
						];
			},
			
        getStore: function() {
            return this.store;
        },
        
        setStore: function(aStore) {
            this.store = aStore;
        },
        
        handleDblClick: function(evt) {
            var row = this.grid.row(evt);
            this.detailMode = 'edit';
            if(this.origEdit) {
                if (!agutils.isEqual(this.origEdit, row)) {
                    this.handleDirty("Edit", function() {
                        this.setEditFormData(row.data);
                    });
                }
            } else {
                this.setEditFormData(row.data);
            }
            return;
        },
        
        setEditFormData: function(data) {
                this.editForm.set("value", {productId: data.productId, productName: data.productName, price: data.price, description: data.description});
            domStyle.set(this.createForm.domNode, "display", "none");
            domStyle.set(this.editForm.domNode, "display", "block");
            
            this.detailMode = 'edit';
            return;
        },
        
        
        descriptionFormatter: function(value, object) {
            var returnVal = value;
            return returnVal;
        },
        
        formatAddButton: function(data, object) {
            return "X";
        },
        
        submitDetailForm: function(evt) {
            
            var _this = this;
            window.setTimeout(function() {
                _this.postalGrid.save();
                _this.phoneGrid.save();
                _this.emailGrid.save();
                
                var detailForm = _this.detailMode==='create' ? _this.createForm : _this.editForm;
                var postUrl = _this.detailMode==='create' ? "product/addNewProduct" : "product/updateProduct";
                
                var submitValues = detailForm.get("value");
                var xhrDeferred = request(postUrl,{
                    data: submitValuesStr,
                    handleAs: "json",
                    method: "POST",
                    timeout: 10000
                });
                xhrDeferred.then(function(data) {
                    _this.store.put(data.items[0]);
                    _this.setEditFormData(data.items[0]);
                    return;
                },
                function(err) {
                    console.log("err: " + err.toString());
                });
                return;
            }, 50);
            return;
        }

        
    });
    
    return productTab;
});