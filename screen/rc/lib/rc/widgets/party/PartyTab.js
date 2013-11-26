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
        'dojo/dom-geometry',
        'dojo/dom-construct',
        'dojo/when',
        "dojo/_base/Deferred",
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
    'dijit/layout/BorderContainer',
    'dojo/text!./templates/PartyTab.html',
    'rc/widgets/common/AssocWidget',
    'rc/modules/BasicStore',
    'rc/modules/RWStore',
    'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dgrid/editor',
        'dojo/store/Memory',
        'dojo/store/JsonRest',
    'dijit/form/ValidationTextBox',
    'dijit/form/TextBox',
    'dijit/form/Select',
    'dijit/form/FilteringSelect',
    'dojox/validate',
    'dojox/validate/web',
    'dijit/layout/ContentPane',
    'dijit/_WidgetBase',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/RadioButton',
    'dijit/Dialog'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, 
            array, request, domStyle, domGeometry, domConstruct, when, Deferred, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            AssocWidget, BasicStore, RWStore, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
            Memory, JsonRest, ValidationTextBox, TextBox, Select, FilteringSelect, validate, webValidate, ContentPane, WidgetBase
            ) {
                
    var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);
    
    var partyTab = declare("rc.widgets.party.PartyTab", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        templateString: template,
        design: 'headline',
        storeUrl: '/party/queryParty',
        store: null,
        idProperty: '',
        detailMode: 'create',
        liveSplitters: false,
        gutters: false,
						
        constructor: function() {
            return;
        },
        
        buildRendering: function() {
            this.inherited(arguments);
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
            
                this.postalPurposeStore = new Memory({idProperty: "id",
                        id: "postalPurposeStore",
                        data: [
    	                     { name: "Shipping", id: "PostalShippingDest" },
    	                     { name: "FOB", id: "PostalShippingOrigin" },
    	                     { name: "Primary", id: "PostalPrimary" }
                        ]});
                registry.add(this.postalPurposeStore);
                this.emailPurposeStore = new Memory({idProperty: "id",
                        id: "emailPurposeStore",
                        data: [
                             { name: "Primary", id: "EmailPrimary" },
                             { name: "Support", id: "EmailSupport" }
                        ]});
                registry.add(this.emailPurposeStore);
                this.phonePurposeStore = new Memory({idProperty: "id",
                        id: "phonePurposeStore",
                        data: [
	                     { name: "Primary", id: "PhonePrimary" },
	                     { name: "Fax", id: "PhoneFax" }
                        ]});
                registry.add(this.phonePurposeStore);
            //this.createContactStores(null);
                this.stateStore = new BasicStore({idProperty: "geoId",
                        id: "stateStore",
                        target: "party/getStateLookup"
                        });
                registry.add(this.stateStore);
            
            console.log("gridNode: " + this.gridNode);
            this.grid = new comboGrid({store: this.store, columns: this.getMainColumns()}, this.gridNode);

            this.postalGrid = new AssocWidget({columnDef: this.getPostalColumns(), assocTitle: "POSTAL ADDRESS",
                                idProperty: "contactMechId"}, this.postalGridNode);
            
            this.phoneGrid = new AssocWidget({columnDef: this.getPhoneColumns(), assocTitle: "PHONE NUMBER",
                                idProperty: "contactMechId"}, this.phoneGridNode);
            
            this.emailGrid = new AssocWidget({columnDef: this.getEmailColumns(), assocTitle: "EMAIL ADDRESS",
                                idProperty: "contactMechId"}, this.emailGridNode);
            
            this.webGrid = new AssocWidget({columnDef: this.getWebColumns(), assocTitle: "WEB SITE",
                                idProperty: "contactMechId"}, this.webGridNode);
            
            this.resizeGrids();
            
            query("#emailGridAdd").on("click", lang.hitch(_this, "addEmailRow"));
            query("input[name=saveDetail]").on("click", lang.hitch(_this, "submitDetailForm"));
            query("input[name=cancelDetail]").on("click", lang.hitch(_this, "cancelDetailForm"));
            query("input[name=showCreateButton]").on("click", lang.hitch(_this, "showCreateForm"));
            this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            query("input[name=queryButton]").on("click", lang.hitch(_this, "showQueryForm"));
            query("input[name=querySubmit]").on("click", lang.hitch(_this, "submitQueryForm"));
            
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            
            this.postalGrid.startup();
            //this.addPostalRow();
            
            this.phoneGrid.startup();
            //this.addPhoneRow();
            
            this.emailGrid.startup();
            //this.addEmailRow();
            
            //this.addPartyData();
            return;
        },
        
        showCreateForm: function() {
            domStyle.set(this.createForm.domNode, "display", "block");
            domStyle.set(this.editFormPerson.domNode, "display", "none");
            domStyle.set(this.editFormOrg.domNode, "display", "none");
            this.displayScreen("bottom");
            this.detailMode = "create";
            // var data = {
            //     phoneData: [{contactNumber: ""}],
            //     emailData: [{infoString: ""}],
            //     postalData: [{address1: "", city:""}]
            // };
            // this.setContactGrids(data);
            return;
        },
        
        cancelDetailForm: function() {
            if (this.detailMode == "create") {
                this.createForm.reset();
            } else {
                if (this.currentRow.partyTypeEnumId == "PtyPerson") {
                    this.editFormPerson.reset();
                } else {
                    this.editFormOrg.reset();
                }
            }
            this.displayScreen("center");
            return;
        },
        
        showQueryForm: function(evt) {
            this.displayScreen("top");
            return;
        },
        
        displayScreen: function(region) {
            if (region == "top") {
                domStyle.set(this.bottomRegion.domNode, "display", "none");
                domStyle.set(this.centerRegion.domNode, "display", "none");
                domStyle.set(this.topRegion.domNode, "display", "block");
            } else if (region == "bottom") {
                domStyle.set(this.bottomRegion.domNode, "display", "block");
                domStyle.set(this.centerRegion.domNode, "display", "none");
                domStyle.set(this.topRegion.domNode, "display", "none");
            } else if (region == "center") {
                domStyle.set(this.bottomRegion.domNode, "display", "none");
                domStyle.set(this.centerRegion.domNode, "display", "block");
                domStyle.set(this.topRegion.domNode, "display", "none");
            }
            return;
        },
        
        makeBasicStore: function(content, isObservable) {
            var basicStore = new BasicStore({
                id: this.id + '-store',
                target: this.storeUrl,
                content: content,
                idProperty: this.idProperty
                });
            if (isObservable) {
                basicStore = new Observable(basicStore);
            }
            return basicStore;
        },
        
        submitQueryForm: function(evt) {
            var cnt = {city: "One%"};
            var store = this.makeBasicStore(cnt, true);
            this.grid.setStore(store);
            domStyle.set(this.bottomRegion.domNode, "display", "none");
            domStyle.set(this.centerRegion.domNode, "display", "block");
            domStyle.set(this.topRegion.domNode, "display", "none");
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
        
        resizeGrids: function() {
            this.postalGrid.resize();
            this.emailGrid.resize();
            this.phoneGrid.resize();
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
            this.phoneGrid.resize();
        },
        
        addPostalRow: function(evt) {
            var contactMechId = this.postalGrid.store.put({
                address1: Math.round(Math.random() * 1000) +  " Address Street",
                postalCode: "1234" + Math.floor(Math.random() * 10),
                city: 'Provo', //["NYC", "Orem", "Pittsburgh", "Mt. Lebanon"][Math.floor(Math.random() * 4)],
                stateProvinceGeoId: 'USA_PA'
                });
            this.postalGrid.resize();
        },
        
        addEmailRow: function(evt) {
            this.emailGrid.store.put({
                infoString: "email." + Math.round(Math.random() * 1000) + "@nomail.com"
                });
            this.emailGrid.resize();
        },
        
        getMainColumns: function() {
            return [
							{field: 'partyId', label:'Name', sortable: true, formatter: this.fullNameFormatter},
							{field: 'partyTypeEnumId', label: 'Party Type', sortable: true, formatter: this.partyTypeFormatter},
							{field: 'emailData', label: 'Email', sortable: false, formatter: this.emailDataFormatter},
							{field: 'phoneData', label: 'Phone', sortable: false, formatter: this.phoneDataFormatter},
							{field: 'postalData', label: 'City', formatter: this.cityFormatter},
							{field: 'postalData', label: 'State', renderCell: lang.hitch(this, "stateRenderer")}
					];
			},
        getPostalColumns: function() {
            return [
                        [
							{field:'address1', label:'Address 1', width: "36"},
						    {field:'address2', label:'Address 2', width: "36"},
							{field:'city', label:'City', width: "36"},
						    {field:'stateProvinceGeoId', label:'State', control: "select", storeId: "stateStore",labelAttr: "geoName", renderCell: lang.hitch(this, "stateFormatter"), width: "36"},
						    {field:'postalCode', label:'Zip', width: "36"},
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "postalPurposeStore", labelAttr: "name", width: "36"}
						]
					];
			},
			
        getPhoneColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "phonePurposeStore",labelAttr: "name", width: "36"},
						    {field:'contactNumber', label:'Phone Number', width: "36"}
						]
					];
			},
			
        getWebColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', width: "36"},
						    {field:'infoString', label:'Email', width: "36"}
						]
					];
			},
			
        getEmailColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "emailPurposeStore", labelAttr: "name", width: "36"},
						    {field:'infoString', label:'Email', width: "36"}
						]
					];
			},
			
//         getPostalColumns: function() {
//             return [
//                         [
// 							editor({field:'address1', label:'Address 1', sortable: true, autoSave: true, 
// 							     canEdit: this.canEdit}, TextBox),
// 							editor({field:'city', label:'City', sortable: true, autoSave: true, canEdit: this.canEdit}, TextBox),
// 							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true,  autoSave: true,
// 							        editor: Select,
// 							        editorArgs:
// 							            {
// 							                required: true,
// 							                placeholder: "Must select a purpose",
// 							                //store: this.postalPurposeStore
// 							                options: [
// 							                     { label: " - ", value: "" },
// 							                     { label: "Shipping", value: "PostalShippingDest" },
// 							                     { label: "FOB", value: "PostalShippingOrigin" },
// 							                     { label: "Primary", value: "PostalPrimary" }
// 							                     ]
// 							            }
// 							        }),
// 							{field:'contactMechId', label:'', rowSpan: 2, sortable: false, formatter: this.formatAddButton}
// 						],
// 						[
// 							editor({field:'address2', label:'Address 2', sortable: true, autoSave: true,
// 							     canEdit: this.canEdit}, TextBox),
// 							editor({field:'stateProvinceGeoId', label:'State', sortable: true, autoSave: true, 
// 							        editorArgs:
// 							            {
// 							                options: [
// 							                     { label: "PA", value: "USA_PA" },
// 							                     { label: "UT", value: "USA_UT" }
// 							                     ]
// 							            }
// 							        }, 
// 							        Select),
// 							editor({field:'postalCode', label:'Zip', sortable: true, autoSave: true, 
// 							     canEdit: this.canEdit,
// 							        editorArgs:
// 							            {
// 							                placeholder: '##### or #####-####',
// 							                validator: function(value) {
// 							                    return validate.isNumberFormat(value, {format: ['#####', '#####-####']});
// 							                }
// 							            }
// 							        }, 
// 							        ValidationTextBox)
// 						]
// 					];
// 			},
		
// 		canEdit: function(object, value) { if (object.thruDate) {return false; } else {return true;}},
		
//         getPhoneColumns: function() {
//             return [
// 							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true,  autoSave: true,
// 							        editorArgs:
// 							            {
// 							                options: [
// 							                     { label: "Primary", value: "PhonePrimary" },
// 							                     { label: "Fax", value: "PhoneFax" }
// 							                     ]
// 							            }
// 							        }, 
// 							        Select),
// 							editor({field:'contactNumber', label:'Number', sortable: true, autoSave: true, 
// 							        editorArgs:
// 							            {
// 							                placeholder: '###-###-####',
// 							                validator: function(value) {
// 							                    return validate.isNumberFormat(value, {format: ['###-###-####']});
// 							                }
// 							            }
// 							        }, 
// 							        ValidationTextBox)
// 					];
// 			},
			
//         getEmailColumns: function() {
//             return [
// 							editor({field:'contactMechPurposeId', label:'Purpose', sortable: true, autoSave: true, 
// 							        editorArgs:
// 							            {
// 							                options: [
// 							                     { label: "Primary", value: "EmailPrimary" },
// 							                     { label: "Support", value: "EmailSupport" }
// 							                     ]
// 							            }
// 							        }, 
// 							        Select),
// 							editor({field:'infoString', label:'Email', sortable: true, autoSave: true, 
// 							        editorArgs:{
// 							                placeholder: 'email address',
// 							                validator: function(value) {
// 							                    return webValidate.isEmailAddress(value);
// 							                }
// 							        }}, 
// 							        ValidationTextBox)
// 					];
// 			},
			
        getStore: function() {
            return this.store;
        },
        
        setStore: function(aStore) {
            this.store = aStore;
        },
        
        showEditForm: function(data) {
            domStyle.set(this.createForm.domNode, "display", "none");
            if(data.partyTypeEnumId == "PtyPerson") {
                domStyle.set(this.editFormPerson.domNode, "display", "block");
                domStyle.set(this.editFormOrg.domNode, "display", "none");
            } else {
                domStyle.set(this.editFormPerson.domNode, "display", "none");
                domStyle.set(this.editFormOrg.domNode, "display", "block");
            }
            this.displayScreen("bottom");
            return;
        },
        
        handleDblClick: function(evt) {
            var row = this.grid.row(evt);
            this.showEditForm(row);
            this.detailMode = 'edit';
            if(this.currentRow) {
                if (!agutils.isEqual(this.currentRow, row)) {
                    this.handleDirty("Edit", function() {
                        this.setEditFormData(row.data);
                    });
                }
            } else {
                this.setEditFormData(row.data);
            }
            this.currentRow = row.data;
            return;
        },
        
        setEditFormData: function(data) {
            if (data.partyTypeEnumId == 'PtyPerson') {
                this.editFormPerson.set("value", {lastName: data.lastName, middleName: data.middleName, firstName: data.firstName, partyTypeEnumId: data.partyTypeEnumId, partyId: data.partyId});
            } else {
                this.editFormOrg.set("value", {organizationName: data.organizationName, partyTypeEnumId: data.partyTypeEnumId, partyId: data.partyId});
            }
            this.setContactGrids(data);
            return;
        },
        
        setContactGrids: function(data) {
            this.createContactStores(data);
            this.setContactStores(data);
            this.postalGrid.resize();
            this.phoneGrid.resize();
            this.emailGrid.resize();
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
                returnVal = emailRow.infoString;
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
            return value;
        },
        
        stateRenderer: function(value, object, td, options) {
            var returnVal = "";
            var postalData = value.postalData;
            if (postalData && dojo.isArray(postalData) && postalData.length) {
                var postalRow = postalData[0];
                var stateId = postalRow.stateProvinceGeoId;
                var deferredRow = new Deferred();
                var stateRow = this.stateStore.get(stateId);
                when(stateRow, function(row) {
                    //deferredRow.resolve( row.geoCodeAlpha2);
                    var tnode = dojo.doc.createTextNode(row.geoCodeAlpha2);
                    domConstruct.place(tnode, td);
                });
                return null;
            }
            return returnVal;
        },
        
        formatAddButton: function(data, object) {
            return "X";
        },
        
        submitDetailForm: function(evt) {
            
            var _this = this;
            // this setTimeout is needed to capture the entered values in the dgrid editor fields
            window.setTimeout( function() {
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
                submitValues["postalData"] = JSON.stringify(_this.postalGrid.store.data);
                submitValues["emailData"] = JSON.stringify(_this.emailGrid.store.data);
                submitValues["phoneData"] = JSON.stringify(_this.phoneGrid.store.data);
                var submitValuesStr = encodeURI(JSON.stringify(submitValues));
                var xhrDeferred = request(postUrl,{
                    data: submitValues,
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
        },
      
        onResize: function(evt) {
            return;
        },
        
        resize: function(dim) {
            this.inherited(arguments);
            domGeometry.setMarginBox(this.grid.domNode, dim);
            this.grid.resize();
            return;
        },
        
        eof: function() {
            return;
        }

        
    });
    
    return partyTab;
});