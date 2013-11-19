define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dijit/registry',
        'dojo/query',
        'dojo/on',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
        'dijit/form/ValidationTextBox',
        'dijit/form/TextBox',
        'dijit/form/Select',
        'dijit/form/Button',
        'dijit/form/FilteringSelect',
        'dijit/form/Form',
        'dojox/validate',
        'dojox/validate/web',
        'dojo/text!./templates/AssocWidget.html'

        ], function(declare, lang, domStyle, domConstruct, registry, query, on,
                WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
              Observable, OnDemandGrid, Selection, Keyboard, selector,
              Memory, ObjectStore,
              ValidationTextBox, TextBox, Select, Button, FilteringSelect, Form,
              validate, validateWeb, template
        ) {
            
       var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
       
       var wid = declare("rc.widgets.common.AssocWidget", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
           store: null,
           columns: null,
           idProperty: "",
           data: null,
           fieldStores: null,
           assocTitle: "",
           
           postMixInProperties: function() {
               this.inherited(arguments);
               return;
           },
           
           postCreate: function() {
               this.inherited(arguments);
               this.store = new Observable(new Memory({idProperty:this.idProperty, data: this.data}));
               this.loadFieldStores(this.fieldStoreIds);
               this.columns = this.buildColumns(this.columnDef);
               //this.header = this.buildHeader(this.columnDef);
               this.form = this.buildForm(this.columnDef);
               var options = {store: this.store};
              var columnKey = "columns";
              if (this.columns.length >= 2) {
                  options["subRows"] = this.columns;
              } else if (this.columns.length === 1) {
                  options["columns"] = this.columns[0];
              } else {
                  options["columns"] = this.columns;
              }
               this.grid = new comboGrid(options, this.gridContainer);
               domConstruct.place(this.form, this.formContainer);
               
               query("input[name=addAssocButton]", this.domNode).on("click", lang.hitch(this, "showEditForm"));
               query("input[name=assocSaveBtn]", this.formContainer).on("click", lang.hitch(this, "saveEditForm"));
               query("input[name=assocCancelBtn]", this.formContainer).on("click", lang.hitch(this, "resetEditForm"));
               return;
           },
           
           showEditForm: function() {
               domStyle.set(this.gridContainer, "display", "none");
               domStyle.set(this.formContainer, "display", "block");
               return;
           },
           
           saveEditForm: function() {
               var values = this.editForm.get("value");
               this.grid.store.put(values);
               domStyle.set(this.gridContainer, "display", "block");
               domStyle.set(this.formContainer, "display", "none");
               this.grid.resize();
               
               return;
           },
           
           resetEditForm: function() {
               return;
           },
           
           loadFieldStores: function(fieldStoreIds) {
               for (var key in fieldStoreIds) {
                   var store = registry.byId(fieldStoreIds[key]);
                   if (store) {
                       this.fieldStores[key] = store;
                   }
               }
               return;
           },
           
           buildColumns: function(columnDef) { 
               var columnStruct = [];
               dojo.forEach(columnDef, function(defList, idx) {
                   var rowStruct = [];
                   columnStruct.push(rowStruct);
                   dojo.forEach(defList, function(fieldDef) {
                       var fieldStruct = {};
                       rowStruct.push(fieldStruct);
                       fieldStruct.field = fieldDef.field;
                       fieldStruct.label = fieldDef.label;
                       fieldStruct.colspan = fieldDef.colspan;
                       fieldStruct.rowspan = fieldDef.rowspan;
                       fieldStruct.sortable = fieldDef.sortable;
                       if (fieldDef.lookupField) {
                           fieldStruct.formatter = lang.hitch(this, "lookupFieldValue", this.fieldStores[fieldDef.lookupField]);
                       }
                   }, this);
                   if(idx === 0) {
                       var fieldStruct = {};
                       rowStruct.push(fieldStruct);
                       fieldStruct.field = this.idProperty;
                       fieldStruct.label = "Edit";
                       fieldStruct.formatter = lang.hitch(this, "renderEditButton");
                       if (columnDef.length === 1 ) {
                           var fieldStruct2 = {};
                           rowStruct.push(fieldStruct2);
                           fieldStruct2.field = this.idProperty;
                           fieldStruct2.label = "Cancel";
                           fieldStruct2.formatter = lang.hitch(this, "renderCancelButton");
                       }
                   }
                   if(idx === 1) {
                           var fieldStruct2 = {};
                           rowStruct.push(fieldStruct2);
                           fieldStruct2.field = this.idProperty;
                           fieldStruct2.label = "Cancel";
                           fieldStruct2.formatter = lang.hitch(this, "renderCancelButton");
                   }
               }, this);
               return columnStruct;
           },
           
           buildHeader: function(columnDef) { 
               var header = domConstruct.create("div");
               var table = domConstruct.create("table", null, header);
               var tbody = domConstruct.create("tbody", null, table);
               dojo.forEach(columnDef, function(defList) {
                   var row = domConstruct.create("tr", null, tbody);
                   dojo.forEach(defList, function(fieldDef) {
                       var fld = domConstruct.create("td", null, row);
                       var tnode = dojo.doc.createTextNode(fieldDef.label);
                   }, this);
               }, this);
               return header;
           },
           
           buildForm: function(columnDef) { 
                var header = domConstruct.create("div");
                var form = this.editForm = new Form({name: "editForm", action: "javascript:void(0)"});
                domConstruct.place(form.domNode, header);               
                var table = domConstruct.create("table", null, form.domNode);
                var tbody = domConstruct.create("tbody", null, table);
               dojo.forEach(columnDef, function(defList, idx) {
                   var row = domConstruct.create("tr", null, tbody);
                   dojo.forEach(defList, function(fieldDef) {
                       var fld = domConstruct.create("td", null, row);
                       var tnode = dojo.doc.createTextNode(fieldDef.label);
                       domConstruct.place(tnode, fld);
                       domStyle.set(fld, "width", fieldDef.width + "px");
                   }, this);
                   //leave blank columns in header for save/cancel buttons in body
                   if(idx === 0) {
                       var fld = domConstruct.create("td", null, row);
                       var tnode = dojo.doc.createTextNode(" ");
                       domConstruct.place(tnode, fld);
                       if (columnDef.length === 1 ) {
                           var fld2 = domConstruct.create("td", null, row);
                           var tnode2 = dojo.doc.createTextNode(" ");
                           domConstruct.place(tnode2, fld2);
                       }
                   }
                   if(idx === 1) {
                       var fld = domConstruct.create("td", null, row);
                       var tnode = dojo.doc.createTextNode(" ");
                       domConstruct.place(tnode, fld);
                   }
               }, this);
               dojo.forEach(columnDef, function(defList, idx) {
                   var row = domConstruct.create("tr", null, tbody);
                   dojo.forEach(defList, function(fieldDef) {
                       var fld = domConstruct.create("td", null, row);
                       var cntrl;
                       if (fieldDef.control === "select") {
                       } else if (fieldDef.control === "button") {
                           cntrl = new Button({
                               name: fieldDef.field,
                               label: fieldDef.label
                           });
                           domConstruct.place(cntrl.domNode, fld);
                       } else {
                           cntrl = new TextBox({
                               name: fieldDef.field,
                               placeHolder: fieldDef.placeholder ? fieldDef.placeholder : fieldDef.label
                           });
                           domConstruct.place(cntrl.domNode, fld);
                       }
                   }, this);
                   // save/cancel buttons in body
                   if(idx === 0) {
                       var fld = domConstruct.create("td", null, row);
                       var btn = new Button({name: "assocSaveBtn", label: "Save"});
                       domConstruct.place(btn.domNode, fld);
                       if (columnDef.length === 1 ) {
                           var fld2 = domConstruct.create("td", null, row);
                           var btn2 = new Button({name: "assocCancelBtn", label: "Cancel"});
                           domConstruct.place(btn2.domNode, fld2);
                       }
                   }
                   if(idx === 1) {
                           var fld2 = domConstruct.create("td", null, row);
                           var btn2 = new Button({name: "assocCancelBtn", label: "Cancel"});
                           domConstruct.place(btn2.domNode, fld2);
                   }
               }, this);
               return header;
           },
           
			renderEditButton: function (object, data, td, options){
    //             var btn = new Button({name: "assocEditBtn", label: "Edit"});
    //             domConstruct.place(btn.domNode, td);
				// return btn.domNode;
				return "Edit";
			},
			
			renderCancelButton: function (object, data, td, options){
    //             var btn = new Button({name: "assocCancelBtn", label: "Cancel"});
    //             domConstruct.place(btn.domNode, td);
				// return btn.domNode;
				return "Remove";
			},
			
           resize: function() {
               this.grid && this.grid.resize();
               return;
           },
           
           eof: function() {
               return;
           }
       });
       return wid;
});            
