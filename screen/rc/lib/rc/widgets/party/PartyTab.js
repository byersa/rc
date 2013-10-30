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
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
    'dijit/layout/BorderContainer',
    'dojo/text!./templates/PartyTab.html',
    'rc/modules/BasicStore',
    'rc/modules/RWStore',
    'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dgrid/editor',
        'dojo/store/Memory',
    'dijit/form/ValidationTextBox',
    'dijit/form/TextBox',
    'dijit/form/Select',
    'dojox/validate',
    'dojox/validate/web',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/layout/ContentPane',
    'dijit/form/RadioButton',
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, 
            array, request, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            BasicStore, RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, ValidationTextBox, TextBox, Select, validate, webValidate
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

            this.postalStore = new Observable(new Memory({idProperty:'contactMechId'}));
            this.postalGrid = new comboGrid({store: this.postalStore, subRows: this.getPostalColumns()}, this.postalGridNode);
            query("#postalGridAdd").on("click", lang.hitch(_this, "addPostalRow"));

            this.phoneStore = new Observable(new Memory({idProperty:'contactMechId'}));
            this.phoneGrid = new comboGrid({store: this.phoneStore, columns: this.getPhoneColumns()}, this.phoneGridNode);
            query("#phoneGridAdd").on("click", lang.hitch(_this, "addPhoneRow"));

            this.emailStore = new Observable(new Memory({idProperty:'contactMechId'}));
            this.emailGrid = new comboGrid({store: this.emailStore, columns: this.getEmailColumns()}, this.emailGridNode);
            query("#emailGridAdd").on("click", lang.hitch(_this, "addEmailRow"));
            query("input[name=saveDetail]").on("click", lang.hitch(_this, "submitDetailForm"));
            
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
            
            this.addPartyData();
            return;
        },
        
        addPartyData: function() {
            var partyTypeEnumId =  ["PtyPerson", "PtyOrganization"][Math.floor(Math.random() * 2)];
            var firstName =  "First_" + Math.floor(Math.random() * 2000);
            var lastName =  "Last_" + Math.floor(Math.random() * 2000);
            var orgName =  "Org_" + Math.floor(Math.random() * 2000);
            this.detailForm.set("value", {
                partyTypeEnumId: partyTypeEnumId,
                firstName: firstName,
                lastName: lastName,
                organizationName: orgName
            });
            console.log("form values: " + JSON.stringify(this.detailForm.get("value")));
            return;
        },
        
        addPhoneRow: function(evt) {
            this.phoneGrid.store.put({
                contactNumber: Math.floor(Math.random() * 10) + "01-45"  + Math.floor(Math.random() * 10) + "-123" + Math.floor(Math.random() * 10)
                });
        },
        
        addPostalRow: function(evt) {
            this.postalGrid.store.put({
                address1: Math.round(Math.random() * 1000) +  " Addres's Street",
                postalCode: "1234" + Math.floor(Math.random() * 10),
                city: ["NYC", "Orem", "Pittsburgh", "Mt. Lebanon"][Math.round(Math.random() * 4)],
                stateProvinceGeoId: 'USA_PA'
                });
        },
        
        addEmailRow: function(evt) {
            this.emailGrid.store.put({
                emailAddress: "email." + Math.round(Math.random() * 1000) + "@nomail.com"
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
							editor({field:'address1', label:'Address 1', sortable: true, autoSave: true, 
							     canEdit: this.canEdit}, TextBox),
							editor({field:'city', label:'City', sortable: true, autoSave: true, canEdit: this.canEdit}, TextBox),
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true,  autoSave: true,
							        editorArgs:
							            {
							                options: [
							                     { label: "Shipping", value: "PostalShippingDest" },
							                     { label: "FOB", value: "PostalShippingOrigin" },
							                     { label: "Primary", value: "PostalPrimary" }
							                     ]
							            }
							        }, 
							        Select),
							{field:'contactMechId', label:'', rowSpan: 2, sortable: false, formatter: this.formatAddButton}
						],
						[
							editor({field:'address2', label:'Address 2', sortable: true, autoSave: true,
							     canEdit: this.canEdit}, TextBox),
							editor({field:'stateProvinceGeoId', label:'State', sortable: true, autoSave: true, 
							        editorArgs:
							            {
							                options: [
							                     { label: "PA", value: "USA_PA" },
							                     { label: "UT", value: "USA_UT" }
							                     ]
							            }
							        }, 
							        Select),
							editor({field:'postalCode', label:'Zip', sortable: true, autoSave: true, 
							     canEdit: this.canEdit,
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
		
		canEdit: function(object, value) { if (object.thruDate) {return false; } else {return true;}},
		
        getPhoneColumns: function() {
            return [
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true,  autoSave: true,
							        editorArgs:
							            {
							                options: [
							                     { label: "Primary", value: "PhonePrimary" },
							                     { label: "Fax", value: "PhoneFax" }
							                     ]
							            }
							        }, 
							        Select),
							editor({field:'contactNumber', label:'Number', sortable: true, autoSave: true, 
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
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true, autoSave: true, 
							        editorArgs:
							            {
							                options: [
							                     { label: "Primary", value: "EmailPrimary" },
							                     { label: "Support", value: "EmailSupport" }
							                     ]
							            }
							        }, 
							        Select),
							editor({field:'emailAddress', label:'Email', sortable: true, autoSave: true, 
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
                         case "PtyPerson":
                             returnString = "Person";
                             break;
                         case "PtyOrganization":
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
        },
        
        submitDetailForm: function(evt) {
            var detailValues = this.detailForm.get("value");
            var submitValues = {partyTypeEnumId: detailValues.partyTypeEnumId};
            if (detailValues.partyTypeEnumId == "PtyPerson") {
                submitValues["firstName"] = detailValues.firstName;
                submitValues["middleName"] = detailValues.middleName;
                submitValues["lastName"] = detailValues.lastName;
            } else {
                submitValues["organizationName"] = detailValues.organizationName;
            }
            var postalData = array.map(this.postalGrid.store.data, function(row) {
                if (!row.fromDate) {
                    delete row.contactMechId;
                }
                return row;
            }, this);
            var emailData = array.map(this.emailGrid.store.data, function(row) {
                if (!row.fromDate) {
                    delete row.contactMechId;
                }
                return row;
            }, this);
            var phoneData = array.map(this.phoneGrid.store.data, function(row) {
                if (!row.fromDate) {
                    delete row.contactMechId;
                }
                return row;
            }, this);
            submitValues["postalData"] = postalData;
            submitValues["emailData"] = emailData;
            submitValues["phoneData"] = phoneData;
            var submitValuesStr = encodeURI(JSON.stringify(submitValues));
            var xhrDeferred = request("party/addNewParty",{
                data: {data: submitValuesStr},
                handleAs: "json",
                method: "POST",
                timeout: 10000
            });
            xhrDeferred.then(function(data) {
                return;
            },
            function(err) {
                console.log("err: " + err.toString());
            });
            return;
        }

        
    });
    
    return partyTab;
});