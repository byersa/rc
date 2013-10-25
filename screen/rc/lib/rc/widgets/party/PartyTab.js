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
        'dojox/html/_base',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
    'dijit/layout/BorderContainer',
    'dojo/text!./templates/PartyTab.html',
    'rc/modules/RWStore',
    'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dgrid/editor',
        'dojo/store/Memory',
    'dijit/form/ValidationTextBox',
    'dojox/validate',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/TextBox',
    'dijit/form/FilteringSelect',
    'dijit/layout/ContentPane',
    'dijit/form/RadioButton',
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, html, dom, htmlUtil, 
            _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, ValidationTextBox, validate
            ) {
                
    var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
    
    var partyTab = declare("rc.widgets.party.PartyTab", [BorderContainer, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        templateString: template,
        design: 'headline',
        storeUrl: '',
        store: null,
        idProperty: '',
						
        constructor: function() {
            return;
        },
        
        postCreate: function() {
            this.inherited(arguments);
            var _this = this;
            var basicStore = new RWStore({
                id: this.id + '-store',
                target: this.storeUrl,
                idProperty: this.idProperty
                });
            this.store = new Observable(basicStore);
            
            console.log("gridNode: " + this.gridNode);
            this.grid = new comboGrid({store: this.store, columns: this.getMainColumns()}, this.gridNode);
            var dblClickHndl = this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            console.log("dblClickHndl: " + dblClickHndl);

            this.postalStore = new Observable(new RWStore({idProperty:'contactMechId'}));
            this.postalGrid = new comboGrid({store: this.postalStore, subRows: this.getPostalColumns()}, this.postalNode);
            this.postalGrid.on(".dgrid-cell:click", lang.hitch(this, "handleAddClick"));
            this.postalGrid.on(".dgrid-cell:mouseover", lang.hitch(this, "handleAddMouseover"));
            return;
        },
        
        handleAddClick: function(evt) {
            var cell = this.postalGrid.cell(evt);
            var row = this.postalGrid.row(evt);
            return;
        },
        
        handleAddMouseover: function(evt) {
            evt.preventDefault();
            var cell = this.postalGrid.cell(evt);
            var row = this.postalGrid.row(evt);
            return;
        },
        
        getMainColumns: function() {
            return {
							fullName: {label:'Name', sortable: true},
							partyTypeEnumId: {label: 'Party Type', sortable: true, formatter: this.partyTypeFormatter},
							email: {label: 'Email', sortable: false},
							phone: {label: 'Phone', sortable: false},
							city: 'City',
							state: 'State'
						};
			},
        getPostalColumns: function() {
            return [
                        [
							{field:'address1', label:'Address 1', sortable: true},
							{field:'city', label:'City', colSpan: 2, sortable: true},
							{field:'contactMechId', label:'', rowSpan: 2, sortable: false, formatter: this.formatAddButton}
						],
						[
							{field:'address2', label:'Address 2', sortable: true},
							{field:'stateProvidenceGeoId', label:'State', sortable: true},
							editor({field:'postalCode', label:'Zip', sortable: true, 
							        editorArgs:{validator: function(value) {
							                    return validate.isNumberFormat(value, {format: ['#####', '#####-####']});
							                }
							            }
							        }, 
							        ValidationTextBox)
						]
					];
			},
			
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            this.postalGrid.startup();
            this.postalGrid.store.put({
                address1:'809 Ellison Lane',
                address2:'suite 2',
                postalCode:'22980',
                stateProvidenceGeoId:'VA',
                city:'Waynesboro'
                });
            //registry.add(this.store);
                /*
            var dgridContainer = new DgridModule({
                href: this.dgridViewUrl,
                detailViewUrl: this.detailViewUrl,
                store: this.store
                });
            this.addChild(dgridContainer, "before");
            */
            return;
        },
        
        getStore: function() {
            return this.store;
        },
        
        setStore: function(aStore) {
            this.store = aStore;
        },
        
        handleDblClick: function(evt) {
            var row = this.grid.row(evt);
            if(this.origEdit) {
                if (!agutils.isEqual(this.origEdit, row)) {
                    this.handleDirty("Edit", function() {
                            this.editForm.set("value", row);
                            this.origEdit = this.editForm.set("value");
                        });
                }
            } else {
                this.editForm.set("value", row);
                this.origEdit = this.editForm.set("value");
            }
            return;
        },
        
        partyFullNameFormatter: function (item) {
                     var returnString = item.firstName + " " + item.lastName;
                     return returnString
                 },
                 
        partyTypeFormatter: function (value, item) {
                     var returnString = "";
                     switch (item.partyTypeEnumId) {
                         case "PERSON":
                             returnString = "Person";
                             break;
                         case "ORGANIZATION":
                             returnString = "Organization";
                             break;
                         default:
                             returnString = "UNKNOWN";
                             break;
                     }
                     return returnString
                 },
                 
        formatAddButton: function(data, object) {
            var pk = this.grid.store.getPKIndex();
            if (data == pk ) {
                return "New";
            } else {
                return "Remove";
            }
        }

        
    });
    
    return partyTab;
});