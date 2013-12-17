define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dijit/registry',
        'dojo/query',
        'dojo/on',
        'dojo/_base/array',
        "dojo/dom-class",
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
        'dojo/text!./templates/AssocWidget.html'

        ], function(declare, lang, domStyle, domConstruct, registry, 
            query, on, array, domClass,
            WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
              Observable, OnDemandGrid, Selection, Keyboard, selector,
              BasicStore, ObjectStore, jsArray,
              ValidationTextBox, TextBox, Select, Button, FilteringSelect, Form,
              validate, validateWeb, template
        ) {
            
       var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
       var INVALID_MESSAGE = "Entry is invalid.";
       
       var wid = declare("rc.widgets.common.AssocWidget", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
           store: null,
           columns: null,
           idProperty: "",
           data: null,
           origData: null,
           fieldStores: null,
           assocTitle: "",
           inactivesVisible: false,
           columnDef: null,
           errorMsgs: null,
           
           postMixInProperties: function() {
               this.inherited(arguments);
               return;
           },
           
           postCreate: function() {
               this.inherited(arguments);
               domClass.add(this.domNode, "dojoFormValue");
               this.origData = dojo.clone(this.data);
               this.store = new Observable(new BasicStore({idProperty:this.idProperty, 
                    queryEngine: jsArray.query, data: this.data, timestamps: ['fromDate', 'thruDate']}));
               //this.loadFieldStores(this.fieldStoreIds);
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
              //options.query = '(thruDate=null|thruDate=)';
              options.query = 'or(eq(thruDate,null),eq(thruDate,))';
               this.grid = new comboGrid(options, this.gridContainer);
               this.styleColumns(this.columnDef);
               domConstruct.place(this.form.domNode, this.formContainer);
               this.grid.on(".dgrid-cell:click", lang.hitch(this, "handleGridClick"));
               
               query("input[name=addAssocButton]", this.domNode).on("click", lang.hitch(this, "showEditForm"));
               this.showInactiveButton.on("click", lang.hitch(this, "showInactives"));
               query("input[name=assocSaveBtn]", this.formContainer).on("click", lang.hitch(this, "saveEditForm"));
               query("input[name=assocCancelBtn]", this.formContainer).on("click", lang.hitch(this, "resetEditForm"));
               return;
           },
           
           _setValueAttr: function(data) {
               this.data = data;
               this.origData = dojo.clone(this.data);
               var _this = this;
               this.store = new Observable(new BasicStore({idProperty:this.idProperty, 
                queryEngine: jsArray.query, data: this.data, timestamps: ['fromDate', 'thruDate']}));
               this.grid.setStore(this.store, null, null);
               window.setTimeout(function() {
                    _this.grid.resize();
               }, 1000);
               return;
           },
           
           showEditForm: function() {
               //this.editForm.reset();
               domStyle.set(this.gridContainer, "display", "none");
               domStyle.set(this.formContainer, "display", "block");
               return;
           },
           
           saveEditForm: function() {
               var values = this.editForm.get("value");
               if(!values[this.idProperty]) {
                   delete values[this.idProperty]; //Remove so store will generate id
               }
               this.grid.store.put(values);
               domStyle.set(this.gridContainer, "display", "block");
               domStyle.set(this.formContainer, "display", "none");
               this.grid.resize();
               
               return;
           },
           
           resetEditForm: function() {
               domStyle.set(this.gridContainer, "display", "block");
               domStyle.set(this.formContainer, "display", "none");
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
                       if (fieldDef.formatter) {
                           fieldStruct.formatter = fieldDef.formatter;
                       }
                       if (fieldDef.renderCell) {
                           fieldStruct.renderCell = fieldDef.renderCell;
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
           
           styleColumns: function(columnDef) { 
               dojo.forEach(columnDef, function(defList, idx) {
                   dojo.forEach(defList, function(fieldDef) {
                       this.grid.addCssRule(".field-" + fieldDef.field, "width: " + fieldDef.width + "px;");
                   }, this);
               }, this);
                this.grid.addCssRule(".field-" + this.idProperty, "width: 80px;");
               return;
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
                //var header = domConstruct.create("div");
                var form = this.editForm = new Form({name: "editForm", action: "javascript:void(0)"});
                domConstruct.place(form.domNode, this.formContainer);               
                var table = domConstruct.create("table", null, form.domNode);
                var tbody = domConstruct.create("tbody", null, table);
                // build header
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
               //build form
               dojo.forEach(columnDef, function(defList, idx) {
                   var row = domConstruct.create("tr", null, tbody);
                   dojo.forEach(defList, function(fieldDef) {
                       var fld = domConstruct.create("td", null, row);
                       var cntrl;
                       if (fieldDef.control === "select") {
                           var aStore = registry.byId(fieldDef.storeId);
                           cntrl = new Select({
                               name: fieldDef.field,
                               label: fieldDef.label,
                               labelAttr: fieldDef.labelAttr,
                               sortByLabel: !!fieldDef.sortField,
                               store: aStore
                           });
                           domConstruct.place(cntrl.domNode, fld);
                       } else if (fieldDef.control === "button") {
                           cntrl = new Button({
                               name: fieldDef.field,
                               label: fieldDef.label
                           });
                           domConstruct.place(cntrl.domNode, fld);
                       } else {
                           var options = {
                               name: fieldDef.field,
                               placeHolder: fieldDef.placeholder ? fieldDef.placeholder : fieldDef.label
                           };
                           if (fieldDef.validator) {
                               options.validator = fieldDef.validator;
                           }
                           if (fieldDef.constraints) {
                               options.constraints = fieldDef.constraints;
                           }
                           if (fieldDef.invalidMessage) {
                               options.invalidMessage = fieldDef.invalidMessage;
                           }
                           cntrl = new ValidationTextBox(options);
                           domConstruct.place(cntrl.domNode, fld);
                       }
                   }, this);
                   // save/cancel buttons in body
                   if(idx === 0) {
                       var fld = domConstruct.create("td", null, row);
                       var btn = new Button({name: "assocSaveBtn", label: "OK"});
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

                    var cntrl1 = new TextBox({
                               name: "fromDate",
                               type: "hidden"
                           });
                           domConstruct.place(cntrl1.domNode, form.domNode);
                    var cntrl2 = new TextBox({
                               name: "thruDate",
                               type: "hidden"
                           });
                           domConstruct.place(cntrl2.domNode, form.domNode);
                    var cntrlKey = new TextBox({
                               name: this.idProperty,
                               type: "hidden"
                           });
                           domConstruct.place(cntrlKey.domNode, form.domNode);
               }, this);
               return form;
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
           
           showInactives: function() {
               if (this.inactivesVisible) {
                   this.inactivesVisible = false;
                   this.showInactiveButton.set("label", "SHOW INACTIVES");
                   this.grid.setQuery('or(eq(thruDate,null),eq(thruDate,))', {});
               } else {
                   this.inactivesVisible = true;
                   this.showInactiveButton.set("label", "HIDE INACTIVES");
                   this.grid.setQuery("", {});
               }
           },
           
           handleGridClick: function(evt) {
               var cell = this.grid.cell(evt);
               if(cell.column.label === "Edit") {
                   this.editForm.set("value", cell.row.data);
                   this.showEditForm();
               }
               if(cell.column.label === "Cancel") {
                   cell.row.data.thruDate = new Date();
                   this.grid.store.put(cell.row.data);
               }
               return;
           },
           
           getErrorMessages: function() {
               return this.errorMsgs;
           },
           
           _getValueAttr: function() {
               var dataResults = this.store.query(null, {});
               returnArray = [];
               dataResults.forEach(function(row) {
                   var origRow = this.getOrigRow(row);
                   if(!origRow) {
                       if (!row.thruDate) {
                           row[this.store.idProperty] = null
                           returnArray.push(row);
                       }
                   } else {
                       if (this.isRowChanged(origRow, row)) {
                           returnArray.push(row);
                       }
                   }
               }, this);
               return returnArray;
           },
           
           isRowChanged: function(origRow, targRow) {
               var origVal, targVal, isChanged = false;
               array.forEach(this.columnDef[0], function(fld) {
                   origVal = origRow[fld.field];
                   targVal = targRow[fld.field];
                   if ((origVal && !targVal) ||
                        (!origVal && targVal) ||
                        (origVal !== targVal)) {
                            isChanged = true;
                    }
               }, this);
               if(!isChanged) {
                   origVal = origRow["thruDate"];
                   targVal = targRow["thruDate"];
                   if ((origVal && !targVal) ||
                        (!origVal && targVal) ||
                        (origVal !== targVal)) {
                            isChanged = true;
                    }
               }
               return isChanged;
           },
           
           getOrigRow: function(row) {
               var returnRow = null
               array.forEach(this.origData, function(targRow) {
                   if (targRow[this.store.idProperty] == row[this.store.idProperty]) {
                       returnRow = targRow;
                   }
               }, this);
               return returnRow;
           },
           
           validate: function() {
               var displayStyle = domStyle.get(this.formContainer, "display");
               if (displayStyle != "hidden") {
                   return true;
               }
               this.errorMsgs = [];
               var isValid = true;
               var textBox, validResponse, errMsg;
               var validationTextBoxes = query(".dijitValidationTextBox", this.formContainer);
               validationTextBoxes.forEach(function(nd) {
                   textBox = registry.getEnclosingWidget(nd);
                   if (textBox) {
                       validResponse = textBox.validate();
                       if (!validResponse) {
                           isValid = false;
                           errMsg = textBox.getErrorMessage();
                           this.errorMsgs.push(errMsg);
                       }
                   }
               }, this);
               return isValid;
           },
           
           eof: function() {
               return;
           }
       });
       return wid;
});            
