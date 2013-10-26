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
    'rc/modules/BasicStore',
    'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dgrid/editor',
        'dojo/store/Memory',
    'dijit/form/ValidationTextBox',
    'dijit/form/Select',
    'dojox/validate',
    'dojox/validate/web',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/TextBox',
    'dijit/layout/ContentPane',
    'dijit/form/RadioButton',
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, html, dom, htmlUtil, 
            _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            BasicStore, RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, ValidationTextBox, Select, validate, webValidate
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
            var basicStore = new BasicStore({
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
            this.postalGrid = new comboGrid({store: this.postalStore, subRows: this.getPostalColumns()}, this.postalGridNode);
            query("#postalGridAdd").on("click", lang.hitch(_this, "addPostalRow"));

            this.phoneStore = new Observable(new RWStore({idProperty:'contactMechId'}));
            this.phoneGrid = new comboGrid({store: this.phoneStore, columns: this.getPhoneColumns()}, this.phoneGridNode);
            query("#phoneGridAdd").on("click", lang.hitch(_this, "addPhoneRow"));

            this.emailStore = new Observable(new RWStore({idProperty:'contactMechId'}));
            this.emailGrid = new comboGrid({store: this.emailStore, columns: this.getEmailColumns()}, this.emailGridNode);
            query("#emailGridAdd").on("click", lang.hitch(_this, "addEmailRow"));
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            
            this.postalGrid.startup();
            this.addPostalRow();
            
            this.phoneGrid.startup();
            this.addPhoneRow();
            
            this.emailGrid.startup();
            this.addEmailRow();
            
            return;
        },
        
        addPhoneRow: function(evt) {
            this.phoneGrid.store.put({
                fromDate: new Date().getTime()
                });
        },
        
        addPostalRow: function(evt) {
            this.postalGrid.store.put({
                fromDate: new Date().getTime()
                });
        },
        
        addEmailRow: function(evt) {
            this.emailGrid.store.put({
                fromDate: new Date().getTime()
                });
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
							                canEdit: function(object, value) {
							                    if (object.thruDate) {
							                        return false;
							                    } else {
							                        return true;
							                    }
							                },
							        editorArgs:
							            {
							                placeholder: '##### or #####-####',
							                validator: function(value) {
							                    return validate.isNumberFormat(value, {format: ['#####', '#####-####']});
							                }
							            }
							        }, 
							        ValidationTextBox)
						]
					];
			},
			
        getPhoneColumns: function() {
            return [
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true, 
							        editorArgs:
							            {
							                options: [
							                     { label: "Primary", value: "PhonePrimary" },
							                     { label: "Fax", value: "PhoneFax" }
							                     ]
							            }
							        }, 
							        Select),
							editor({field:'contactNumber', label:'Number', sortable: true, 
							        editorArgs:
							            {
							                placeholder: '###-###-####',
							                validator: function(value) {
							                    return validate.isNumberFormat(value, {format: ['###-###-####']});
							                }
							            }
							        }, 
							        ValidationTextBox)
					];
			},
			
        getEmailColumns: function() {
            return [
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true, 
							        editorArgs:
							            {
							                options: [
							                     { label: "Primary", value: "EmailPrimary" },
							                     { label: "Support", value: "EmailSupport" }
							                     ]
							            }
							        }, 
							        Select),
							editor({field:'infoString', label:'Email', sortable: true, 
							        editorArgs:{
							                placeholder: 'email address',
							                validator: function(value) {
							                    return webValidate.isEmailAddress(value);
							                }
							        }}, 
							        ValidationTextBox)
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
            return "X";
        }

        
    });
    
    return partyTab;
});