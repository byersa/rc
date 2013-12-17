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
        'dijit/popup',
        'dojo/_base/array',
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
    'rc/widgets/common/AssocProduct',
    'rc/modules/BasicStore',
    'rc/modules/RWStore',
    'rc/modules/util/agutils',
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
    'dojox/validate/regexp',
    'dijit/layout/ContentPane',
    'dijit/_WidgetBase',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/RadioButton',
    'dijit/Dialog',
    'rc/widgets/party/ProductLookup',
    'dojox/form/Manager'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, popup,
            array, domStyle, domGeometry, domConstruct, when, Deferred, 
            _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            AssocWidget, AssocProduct, BasicStore, RWStore, agutils, Observable, OnDemandGrid, Selection, 
            Keyboard, selector, editor,
            Memory, JsonRest, ValidationTextBox, TextBox, Select, FilteringSelect, validate, 
            webValidate, regexpValidate, ContentPane, WidgetBase
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
        productStoreUrl: '/product/queryProduct',
        allProductRows: null,
        productRows: null,
        createForm: null,
        editForm: null,
						
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
                this.webPurposeStore = new Memory({idProperty: "id",
                        id: "webPurposeStore",
                        data: [
	                     { name: "Primary", id: "WebUrlPrimary" },
                        ]});
                registry.add(this.webPurposeStore);
            this.stateStore = registry.byId("stateStore");
            if(!this.stateStore) {
                this.stateStore = new BasicStore({idProperty: "geoId",
                        id: "stateStore",
                        target: "party/getStateLookup"
                        });
                registry.add(this.stateStore);
            }
            console.log("gridNode: " + this.gridNode);
            this.grid = new comboGrid({store: this.store, columns: this.getMainColumns(), id: "MainPartyGrid"}, this.gridNode);

            this.postalGrid = new AssocWidget({columnDef: this.getPostalColumns(), assocTitle: "POSTAL ADDRESS",
                                idProperty: "contactMechId"}, this.postalGridNode);
            
            this.phoneGrid = new AssocWidget({columnDef: this.getPhoneColumns(), assocTitle: "PHONE NUMBER",
                                idProperty: "contactMechId"}, this.phoneGridNode);
            
            this.emailGrid = new AssocWidget({columnDef: this.getEmailColumns(), assocTitle: "EMAIL ADDRESS",
                                idProperty: "contactMechId"}, this.emailGridNode);
            
            this.webGrid = new AssocWidget({columnDef: this.getWebColumns(), assocTitle: "WEB SITE",
                                idProperty: "contactMechId"}, this.webGridNode);
            
            // _this.productGrid = new comboGrid({columns: _this.getProductColumns()}, _this.productGridNode);
            // _this.productGrid.startup();
            // _this.productQueryGrid = new comboGrid({columns: _this.getProductColumns()}, _this.productQueryGridNode);
            // _this.productQueryGrid.startup();
            _this.productGrid = new AssocProduct({}, this.productContainer);
            _this.productQueryGrid = new AssocProduct({}, this.productQueryContainer);
            
            this.resizeGrids();
            
           var cntrl = new Select({
               name: "stateProvinceGeoId",
               labelAttr: "geoName",
               sortByLabel: false,
               store: this.stateStore
           });
           domConstruct.place(cntrl.domNode, this.queryStateProvinceGeoId);
           
            query("input[name=saveDetail]", this.domNode).on("click", lang.hitch(_this, "submitDetailForm"));
            query("input[name=cancelDetail]", this.domNode).on("click", lang.hitch(_this, "cancelDetailForm"));
            query("input[name=showCreateButton]", this.domNode).on("click", lang.hitch(_this, "showCreateForm"));
            this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            query("input[name=queryButton]", this.domNode).on("click", lang.hitch(_this, "showQueryForm"));
            query("input[name=querySubmit]", this.domNode).on("click", lang.hitch(_this, "submitQueryForm"));
            query("input[name=queryCancel]", this.domNode).on("click", lang.hitch(_this, function(evt) {
                    this.displayScreen("center");
                }));
            
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
            
            this.postalGrid.startup();
            this.phoneGrid.startup();
            this.emailGrid.startup();
            this.webGrid.startup();
            return;
        },
        
        showCreateForm: function() {
            this.detailMode = "create";
            domStyle.set(this.createForm.domNode, "display", "block");
            domStyle.set(this.editForm.domNode, "display", "none");
            this.displayScreen("bottom");
            this.productGrid.resize();
            this.clearDetailScreen();
            return;
        },
        
        clearDetailScreen: function() {
            this.productGrid.clearSelection();
            this.postalGrid.set("value", []);
            this.emailGrid.set("value", []);
            this.phoneGrid.set("value", []);
            this.webGrid.set("value", []);
            return;
        },
        
        cancelDetailForm: function() {
            if (this.detailMode == "create") {
                this.createForm.reset();
            } else {
                this.editForm.reset();
            }
            this.displayScreen("center");
            return;
        },
        
        showQueryForm: function(evt) {
            this.displayScreen("top");
            this.productQueryGrid.resize();
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
            var submitValues = this.queryForm.get("value");
            if (submitValues.partyTypeEnumId == 'PtyPerson') {
                if (submitValues.firstName) { submitValues.firstName += "%"; }
                if (submitValues.lastName) { submitValues.lastName += "%"; }
                delete submitValues.organizationName;
            } else {
                if (submitValues.organizationName) { submitValues.organizationName += "%"; }
                delete submitValues.firstName;
                delete submitValues.lastName;
            }
            if (submitValues.contactNumber) { submitValues.contactNumber += "%"; }
            if (submitValues.emailAddress) { submitValues.emailAddress += "%"; }
            if (submitValues.address1) { submitValues.address1 += "%"; }
            if (submitValues.city) { submitValues.city += "%"; }
            if (submitValues.stateProvinceGeoId === "USA_DUMMY") {
                delete submitValues.stateProvinceGeoId
            }
            // handle products
            var productArray2 = this.productQueryGrid.get("value");
            var productArray = array.map(productArray2, function(productEntity) {
                return productEntity.productId;
            }, this);
            submitValues.productIdList = JSON.stringify(productArray);
            submitValues.toPartyId = "RCHERBALS";
            console.log("PartyTab (query), submitValues: " + JSON.stringify(submitValues));
            var store = new BasicStore({
                target: "/party/queryParty",
                content: submitValues,
                idProperty: this.idProperty
                });
            var basicStore = new Observable(store);
            this.grid.setStore(basicStore);
            this.displayScreen("center");
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
            this.postalGrid.setStore( this.postalStore);
            this.emailGrid.setStore( this.emailStore);
            this.phoneGrid.setStore( this.phoneStore);
            this.webGrid.setStore( this.webStore);
            return;
        },
        
        resizeGrids: function() {
            this.postalGrid.resize();
            this.emailGrid.resize();
            this.phoneGrid.resize();
            this.webGrid.resize();
            return;
        },
        
        getMainColumns: function() {
            return [
                            selector({label:'Select'}, "checkbox"),
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
							{field:'address1', label:'Address 1', width: "180"},
						    {field:'address2', label:'Address 2', width: "180"},
							{field:'city', label:'City', width: "180"},
						    {field:'stateProvinceGeoId', label:'State', control: "select", storeId: "stateStore",labelAttr: "geoName", renderCell: lang.hitch(this, "stateRenderer"), width: "80"},
						    {field:'postalCode', label:'Zip', width: "120", validator: dojox.validate.isNumberFormat, constraints: {format:['#####', '#####-####']},
						                         invalidMessage: "Zip code must be in one of these formats: '#####' or '#####-####'.",
						                         placeholder: "##### or #####-####"},
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "postalPurposeStore", labelAttr: "name", width: "80"}
						]
					];
			},
			
        getPhoneColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "phonePurposeStore",labelAttr: "name", width: "80"},
						    {field:'contactNumber', label:'Phone Number', width: "180", validator: dojox.validate.isNumberFormat, constraints: {format:['###-###-####']},
						                         invalidMessage: "Phone number must be in one of this format: '###-###-####'.",
						                         placeholder: "###-###-####"}
						]
					];
			},
			
        getWebColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "webPurposeStore", labelAttr: "name", width: "80"},
						    {field:'infoString', label:'Web Url', width: "180", 
						                    regExp:'(https?|ftp)://[A-Za-z0-9-_]+\.[A-Za-z0-9-_%&\?\/\.=]+',
						                         invalidMessage: "Must be in url format.",
						                         placeholder: "webaddress.com"}
						]
					];
			},
			
        getEmailColumns: function() {
            return [
                        [
							{field:'contactMechPurposeId', label:'Purpose', control: "select", storeId: "emailPurposeStore", labelAttr: "name", width: "80"},
						    {field:'infoString', label:'Email', width: "180", validator: dojox.validate.isEmailAddress, constraints: {format:['###-###-####']},
						                         invalidMessage: "Must be in email format.",
						                         placeholder: "name@email.com"}
						]
					];
			},
			
			
                        getStore: function() {
            return this.store;
        },
        
        getProductColumns: function() {
            return [
						selector({label:'Select'}, "checkbox"),
						{field: 'productName', label:'Product Name', sortable: true}
					];
			},
			
        setStore: function(aStore) {
            this.store = aStore;
        },
        
        showEditForm: function(data) {
            domStyle.set(this.createForm.domNode, "display", "none");
            if(data.partyTypeEnumId == "PtyPerson") {
                domStyle.set(this.editFormPerson, "display", "block");
                domStyle.set(this.editFormOrg, "display", "none");
            } else {
                domStyle.set(this.editFormPerson, "display", "none");
                domStyle.set(this.editFormOrg, "display", "block");
            }
            this.displayScreen("bottom");
            this.productGrid.resize();
            return;
        },
        
        handleDblClick: function(evt) {
            var row = this.grid.row(evt);
            var _this = this;
            _this.productRows = [];
            this.showEditForm(row.data);
            this.detailMode = 'edit';
            this.setEditFormData(row.data);
            _this.productGrid.set("value", row.data.partyId);
            this.currentRow = row.data;
            return;
        },
        
        setEditFormData: function(data) {
            if (data.partyTypeEnumId == 'PtyPerson') {
                this.editForm.set("value", {lastName: data.lastName, middleName: data.middleName, firstName: data.firstName, partyTypeEnumId: data.partyTypeEnumId,
                    partyId: data.partyId, partyRelationshipId: data.partyRelationshipId, parentPartyId: data.parentPartyId, relationshipTypeEnumId: data.relationshipTypeEnumId,
                    thruDate: data.thruDate});
            } else {
                this.editForm.set("value", {organizationName: data.organizationName, partyTypeEnumId: data.partyTypeEnumId, 
                    partyId: data.partyId, partyRelationshipId: data.partyRelationshipId, parentPartyId: data.parentPartyId, relationshipTypeEnumId: data.relationshipTypeEnumId,
                    thruDate: data.thruDate});
            }
            this.setContactGrids(data);
            return;
        },
        
        setContactGrids: function(data) {
            //this.createContactStores(data);
           // this.setContactStores(data);
            this.postalGrid.set("value", data.postalData);
            this.phoneGrid.set("value", data.phoneData);
            this.emailGrid.set("value", data.emailData);
            this.webGrid.set("value", data.webData);
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
        
        validate: function() {
            var isValid = true;
            var validResponse, widgetErrMsgs;
            var errorMsgs = [];
            array.forEach([this.postalGrid, this.emailGrid, this.phoneGrid], function(assocWidget) {
                validResponse = assocWidget.validate();
                if (!validResponse) {
                    isValid = false;
                    widgetErrMsgs = assocWidget.getErrorMessages();
                    errorMsgs = errorMsgs.concat(widgetErrMsgs);
                };
            }, this);
            if(!isValid) {
                var tooltip = registry.byId("ErrorTooltip");
                tooltip.set("content", errorMsgs.join("<br/>"));
                var aroundWid = registry.byId("main-container-header");
               popup.open({
                    parent: this,
                    popup: tooltip,
                    around: aroundWid.domNode,
                    orient: ["below-centered"],
                    onExecute: function(){
                        popup.close(tooltip);
                    },
                    onCancel: function(){
                        popup.close(tooltip);
                    },
                    onClose: function(){
                    }
                });
            }
            return isValid;
        },
        
        submitDetailForm: function(evt) {
            
            if (!this.validate()) {
                return;
            }
            
            var _this = this;
            // this setTimeout is needed to capture the entered values in the dgrid editor fields
            window.setTimeout( function() {
                
                var postalData = _this.postalGrid.get("value");
                var phoneData = _this.phoneGrid.get("value");
                var emailData = _this.emailGrid.get("value");
                var webData = _this.webGrid.get("value");
                var detailForm, editValues, submitValues;
                var postUrl = _this.detailMode==='create' ? "party/updateParty" : "party/updateParty";
                if ( _this.detailMode==='create') {
                    //var detailValues = _this.createForm.get("value");
                    var detailValues = _this.createForm.get("value");
                    submitValues = {partyTypeEnumId: detailValues.partyTypeEnumId};
                    if (detailValues.partyTypeEnumId == "PtyPerson") {
                        submitValues["firstName"] = detailValues.firstName;
                        submitValues["middleName"] = detailValues.middleName;
                        submitValues["lastName"] = detailValues.lastName;
                    } else {
                        submitValues["organizationName"] = detailValues.organizationName;
                    }
                } else {
                    var detailValues = _this.editForm.get("value");
                        submitValues = {partyTypeEnumId: detailValues.partyTypeEnumId, partyId:detailValues.partyId, relationshipTypeEnumId: detailValues.relationshipTypeEnumId,
                                        partyRelationshipId: detailValues.partyRelationshipId, parentPartyId: detailValues.parentPartyId, thruDate: detailValues.thruDate};
                    if (detailValues.partyTypeEnumId == "PtyPerson") {
                        submitValues["firstName"] = detailValues.firstName;
                        submitValues["middleName"] = detailValues.middleName;
                        submitValues["lastName"] = detailValues.lastName;
                    } else {
                        submitValues["organizationName"] = detailValues.organizationName;
                    }
                }
                submitValues["postalData"] = JSON.stringify(postalData);
                submitValues["emailData"] = JSON.stringify(emailData);
                submitValues["phoneData"] = JSON.stringify(phoneData);
                submitValues["webData"] = JSON.stringify(webData);
                //var submitValuesStr = encodeURI(JSON.stringify(submitValues));
                
                // handle products
                var productArray = _this.productGrid.get("value");
                submitValues["productData"] = JSON.stringify(productArray);
                console.log("PartyTab, submitValues: " + JSON.stringify(submitValues));
                    
                var xhrDeferred = request(postUrl,{
                    data: submitValues,
                    handleAs: "json",
                    method: "POST",
                    timeout: 10000
                });
                xhrDeferred.then(function(data) {
                    console.log("success: " + JSON.stringify(data.items));
                    var row = data.items[0];
                    _this.store.put(row);
                    //_this.setEditFormData(row);
                    _this.displayScreen("center");
                    window.setTimeout(function() {
                        _this.grid.refresh();
                        var id = _this.gridNode.id + "-row-" + row.partyId;
                        var rowList = query("#" + id, _this.gridNode);
                        if (rowList.length) {
                            var rowDiv = rowList[0];
                            _this.grid.select({element: rowDiv});
                            if ( _this.detailMode==='create') {
                                _this.grid.bodyNode.scrollTop = _this.grid.bodyNode.scrollHeight;
                            } else {
                                _this.grid.bodyNode.scrollTop = rowDiv.offsetTop;
                            }
                        }
                    }, 100);
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
            domGeometry.setMarginBox(this.topRegion.domNode, dim);
            dim.h -= 30;
            domGeometry.setMarginBox(this.grid.domNode, dim);
            this.grid.resize();
            return;
        },
        
        handleDirty: function() {
            return;
        },
        
        eof: function() {
            return;
        }

        
    });
    
    return partyTab;
});