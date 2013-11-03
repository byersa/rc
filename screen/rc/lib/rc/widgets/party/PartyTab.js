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
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, 
            array, request, domStyle, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            BasicStore, RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, ObjectStore, ValidationTextBox, TextBox, Select, FilteringSelect, validate, webValidate
            ) {
                
    var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
    
    var partyTab = declare("rc.widgets.party.PartyTab", [BorderContainer, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
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
                data: [],
                idProperty: this.idProperty
                });
            this.store = new Observable(basicStore);
            
            this.createContactStores(null);
            
            console.log("gridNode: " + this.gridNode);
            this.grid = new comboGrid({store: this.store, columns: this.getMainColumns()}, this.gridNode);
            var dblClickHndl = this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            console.log("dblClickHndl: " + dblClickHndl);

            this.postalGrid = new comboGrid({store: this.postalStore, subRows: this.getPostalColumns()}, this.postalGridNode);
            query("#postalGridAdd").on("click", lang.hitch(_this, "addPostalRow"));

            this.phoneGrid = new comboGrid({store: this.phoneStore, columns: this.getPhoneColumns()}, this.phoneGridNode);
            query("#phoneGridAdd").on("click", lang.hitch(_this, "addPhoneRow"));

            this.emailGrid = new comboGrid({store: this.emailStore, columns: this.getEmailColumns()}, this.emailGridNode);
            query("#emailGridAdd").on("click", lang.hitch(_this, "addEmailRow"));
            query("input[name=saveDetail]").on("click", lang.hitch(_this, "submitDetailForm"));
            query("input[name=showCreateButton]").on("click", lang.hitch(_this, "showCreateForm"));
            
            var postalPurposeMemoryStore = new Memory({data: [
							                     { name: "Shipping", id: "PostalShippingDest" },
							                     { name: "FOB", id: "PostalShippingOrigin" },
							                     { name: "Primary", id: "PostalPrimary" }
                ]});
            this.postalPurposeStore =   new ObjectStore({ objectStore: postalPurposeMemoryStore });
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
        
        showCreateForm: function() {
            return;
        },
        
        showEditForm: function(data) {
            return;
        },
        
        createContactStores: function(data) {
            var postalData = [], emailData = [], phoneData = [];
            if (data && data.postalData) {
                postalData = data.postalData;
            }
            if (data && data.emailData) {
                emailData = data.emailData;
            }
            if (data && data.phoneData) {
                phoneData = data.phoneData;
            }
            this.postalStore = new Observable(new Memory({idProperty:'contactMechId', data: postalData}));
            this.phoneStore = new Observable(new Memory({idProperty:'contactMechId', data: phoneData}));
            this.emailStore = new Observable(new Memory({idProperty:'contactMechId', data: emailData}));
            return;
        },
        
        setContactStores: function() {
            this.postalGrid.setStore(this.postalStore);
            this.emailGrid.setStore(this.emailStore);
            this.phoneGrid.setStore(this.phoneStore);
            return;
        },
        
        addPartyData: function() {
            var partyTypeEnumId =  ["PtyPerson", "PtyOrganization"][Math.floor(Math.random() * 2)];
            var firstName =  "First_" + Math.floor(Math.random() * 2000);
            var lastName =  "Last_" + Math.floor(Math.random() * 2000);
            var orgName =  "Org_" + Math.floor(Math.random() * 2000);
            this.createForm.set("value", {
                partyTypeEnumId: partyTypeEnumId,
                firstName: firstName,
                lastName: lastName,
                organizationName: orgName
            });
            console.log("form values: " + JSON.stringify(this.createForm.get("value")));
            return;
        },
        
        addPhoneRow: function(evt) {
            this.phoneGrid.store.put({
                contactNumber: Math.floor(Math.random() * 10) + "01-45"  + Math.floor(Math.random() * 10) + "-123" + Math.floor(Math.random() * 10)
                });
        },
        
        addPostalRow: function(evt) {
            var contactMechId = this.postalGrid.store.put({
                address1: Math.round(Math.random() * 1000) +  " Address Street",
                postalCode: "1234" + Math.floor(Math.random() * 10),
                city: 'Provo', //["NYC", "Orem", "Pittsburgh", "Mt. Lebanon"][Math.floor(Math.random() * 4)],
                stateProvinceGeoId: 'USA_PA'
                });
        },
        
        addEmailRow: function(evt) {
            this.emailGrid.store.put({
                emailAddress: "email." + Math.round(Math.random() * 1000) + "@nomail.com"
                });
        },
        
        getMainColumns: function() {
            return [
							{field: 'partyId', label:'Name', sortable: true, formatter: this.fullNameFormatter},
							{field: 'partyTypeEnumId', label: 'Party Type', sortable: true, formatter: this.partyTypeFormatter},
							{field: 'emailData', label: 'Email', sortable: false, formatter: this.emailDataFormatter},
							{field: 'phoneData', label: 'Phone', sortable: false, formatter: this.phoneDataFormatter},
							{field: 'postalData', label: 'City', formatter: this.cityFormatter},
							{field: 'postalData', label: 'State', formatter: this.stateFormatter}
						];
			},
        getPostalColumns: function() {
            return [
                        [
							editor({field:'address1', label:'Address 1', sortable: true, autoSave: true, 
							     canEdit: this.canEdit}, TextBox),
							editor({field:'city', label:'City', sortable: true, autoSave: true, canEdit: this.canEdit}, TextBox),
							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true,  autoSave: true,
							        editor: Select,
							        editorArgs:
							            {
							                required: true,
							                placeholder: "Must select a purpose",
							                //store: this.postalPurposeStore
							                options: [
							                     { label: " - ", value: "" },
							                     { label: "Shipping", value: "PostalShippingDest" },
							                     { label: "FOB", value: "PostalShippingOrigin" },
							                     { label: "Primary", value: "PostalPrimary" }
							                     ]
							            }
							        }),
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
            if (data.partyTypeEnumId == 'PtyPerson') {
                this.editForm.set("value", {lastName: data.lastName, middleName: data.middleName, firstName: data.firstName, partyTypeEnumId: data.partyTypeEnumId, partyId: data.partyId});
            } else {
                this.editForm.set("value", {organizationName: data.organizationName, partyTypeEnumId: data.partyTypeEnumId, partyId: data.partyId});
            }
            domStyle.set(this.createForm.domNode, "display", "none");
            domStyle.set(this.editForm.domNode, "display", "block");
            
            this.createContactStores(data);
            this.setContactStores(data);
            this.detailMode = 'edit';
            return;
        },
        
        fullNameFormatter: function (value, item) {
                     var returnString = "";
                     switch (item.partyTypeEnumId) {
                         case "PtyPerson":
                             returnString = item.firstName + " " + item.lastName;
                             break;
                         case "PtyOrganization":
                             returnString = item.organizationName;
                             break;
                         default:
                             returnString = "";
                             break;
                     }
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
        
        emailDataFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var emailRow = value[0];
                returnVal = emailRow.emailAddress;
            }
            return returnVal;
        },
        
        phoneDataFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var phoneRow = value[0];
                returnVal = phoneRow.contactNumber;
            }
            return returnVal;
        },
        
        cityFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var postalRow = value[0];
                returnVal = postalRow.city;
            }
            return returnVal;
        },
        
        stateFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var postalRow = value[0];
                returnVal = postalRow.stateProvinceGeoId;
            }
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
                var postUrl = _this.detailMode==='create' ? "party/addNewParty" : "party/updateParty";
                
                var detailValues = detailForm.get("value");
                var submitValues = {partyTypeEnumId: detailValues.partyTypeEnumId, partyId:detailValues.partyId};
                if (detailValues.partyTypeEnumId == "PtyPerson") {
                    submitValues["firstName"] = detailValues.firstName;
                    submitValues["middleName"] = detailValues.middleName;
                    submitValues["lastName"] = detailValues.lastName;
                } else {
                    submitValues["organizationName"] = detailValues.organizationName;
                }
                var postalData = array.map(_this.postalGrid.store.data, function(row) {
                    if (row.contactMechId >= 0 && row.contactMechId < 1.0) {
                        delete row.contactMechId;
                    }
                    return row;
                }, _this);
                var emailData = array.map(_this.emailGrid.store.data, function(row) {
                    if (row.contactMechId >= 0 && row.contactMechId < 1.0) {
                        delete row.contactMechId;
                    }
                    return row;
                }, _this);
                var phoneData = array.map(_this.phoneGrid.store.data, function(row) {
                    if (row.contactMechId >= 0 && row.contactMechId < 1.0) {
                        delete row.contactMechId;
                    }
                    return row;
                }, _this);
                submitValues["postalData"] = _this.postalGrid.store.data;
                submitValues["emailData"] = _this.emailGrid.store.data;
                submitValues["phoneData"] = _this.phoneGrid.store.data;
                var submitValuesStr = encodeURI(JSON.stringify(submitValues));
                var xhrDeferred = request(postUrl,{
                    data: {data: submitValuesStr},
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
    
    return partyTab;
});