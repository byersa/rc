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
    'dijit/layout/ContentPane',
    'dijit/_WidgetBase',
    'dijit/Toolbar',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/RadioButton',
    'dijit/Dialog',
    'rc/widgets/party/ProductLookup'
], function(declare, string, query, registry, lang, on, request, html, dom, domAttr, htmlUtil, JSON, 
            array, domStyle, domGeometry, domConstruct, when, Deferred, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template,
            AssocWidget, BasicStore, RWStore, agutils, Observable, OnDemandGrid, Selection, Keyboard, selector, editor,
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
        productStoreUrl: '/product/queryProduct',
        allProductRows: null,
        productRows: null,
						
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
            this.stateStore = registry.byId("stateStore");
            if(!this.stateStore) {
                this.stateStore = new BasicStore({idProperty: "geoId",
                        id: "stateStore",
                        target: "party/getStateLookup"
                        });
                registry.add(this.stateStore);
            }
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
            
            _this.productGrid = new comboGrid({columns: _this.getProductColumns()}, _this.productGridNode);
            _this.productGrid.startup();
            _this.productQueryGrid = new comboGrid({columns: _this.getProductColumns()}, _this.productQueryGridNode);
            _this.productQueryGrid.startup();
            
            this.resizeGrids();
            
                var xhrDeferred = request(this.productStoreUrl,{
                    handleAs: "json",
                    method: "POST",
                    timeout: 10000
                });
                xhrDeferred.then(function(data) {
                    console.log("success: " + JSON.stringify(data.items));
                    _this.productRows = [];
                    _this.allProductRows = data.items;
                    var basicStore = new BasicStore({
                        id: _this.id + '-productStore',
                        data: data.items,
                        idProperty: "productId",
                        timestamps: ['fromDate', 'thruDate']
                        });
                    _this.productStore = new Observable(basicStore);
                    _this.productGrid.startup();
                    _this.productGrid.setStore(_this.productStore);
                    _this.productQueryGrid.startup();
                    _this.productQueryGrid.setStore(_this.productStore);
                    window.setTimeout(function() {
                        _this.productGrid.resize();
                        _this.productQueryGrid.resize();
                    }, 1000);
                    return;
                },
                function(err) {
                    console.log("err: " + err.toString());
                });
            query("#emailGridAdd", this.domNode).on("click", lang.hitch(_this, "addEmailRow"));
            query("input[name=saveDetail]", this.domNode).on("click", lang.hitch(_this, "submitDetailForm"));
            query("input[name=cancelDetail]", this.domNode).on("click", lang.hitch(_this, "cancelDetailForm"));
            query("input[name=showCreateButton]", this.domNode).on("click", lang.hitch(_this, "showCreateForm"));
            this.grid.on(".dgrid-row:dblclick", lang.hitch(this, "handleDblClick"));  
            query("input[name=queryButton]", this.domNode).on("click", lang.hitch(_this, "showQueryForm"));
            query("input[name=querySubmit]", this.domNode).on("click", lang.hitch(_this, "submitQueryForm"));
            
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
            this.postalGrid.setData([]);
            this.emailGrid.setData([]);
            this.phoneGrid.setData([]);
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
            // handle products
            var productArray = [];
            for (var prodId in this.productQueryGrid.selection) {
                productArray.push(prodId);
            }
            if (productArray.length) {
                submitValues["productIdList"] = JSON.stringify(productArray);
            }
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
						    {field:'stateProvinceGeoId', label:'State', control: "select", storeId: "stateStore",labelAttr: "geoName", renderCell: lang.hitch(this, "stateRenderer"), width: "36"},
						    {field:'postalCode', label:'Zip', width: "36", validator: dojox.validate.isNumberFormat, constraints: {format:['#####', '#####-####']},
						                         invalidMessage: "Zip code must be in one of these formats: '#####' or '#####-####'."},
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
            return;
        },
        
        handleDblClick: function(evt) {
            var row = this.grid.row(evt);
            var _this = this;
            _this.productRows = [];
            this.showEditForm(row.data);
            this.detailMode = 'edit';
            // if(this.currentRow) {
            //     if (!agutils.isEqual(this.currentRow, row)) {
            //         this.handleDirty("Edit", function() {
            //             this.setEditFormData(row.data);
            //         });
            //     }
            // } else {
                 this.setEditFormData(row.data);
            // }
            var xhrDeferred = request(this.productStoreUrl,{
                handleAs: "json",
                data: {partyId: row.data.partyId},
                method: "POST",
                timeout: 10000
            });
            xhrDeferred.then(function(data) {
                console.log("success: " + JSON.stringify(data.items));
                _this.productRows = data.items;
    		    array.forEach(_this.productRows, function(row) {
    		        if (row.fromDate && typeof row.fromDate == "string") {
    		            row.fromDate = new Date(row.fromDate);
    		        }
    		        if (row.thruDate && typeof row.thruDate == "string") {
    		            row.thruDate = new Date(row.thruDate);
    		        }
    		    }, this);
                var productIdList = array.map(data.items, function(row) {
                    return row.productId;
                });
                _this.productGrid.clearSelection();
	            var idPrefix = _this.productGrid.id + "-row-";
                array.forEach(productIdList, function(id) {
                    _this.productGrid.select(id);
                });
                _this.productGrid.resize();
                return;
            },
            function(err) {
                console.log("err: " + err.toString());
            });
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
            this.postalGrid.setData(data.postalData);
            this.phoneGrid.setData(data.phoneData);
            this.emailGrid.setData(data.emailData);
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
                var postalData = _this.postalGrid.get("value");
                var phoneData = _this.phoneGrid.get("value");
                var emailData = _this.emailGrid.get("value");
                var detailForm, editValues, submitValues;
                var postUrl = _this.detailMode==='create' ? "party/updateParty" : "party/updateParty";
                if ( _this.detailMode==='create') {
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
                //var submitValuesStr = encodeURI(JSON.stringify(submitValues));
                
                // handle products
                var productArray = [];
                array.forEach(_this.productRows, function(product) {
                    if(!_this.productGrid.selection[product.productId]) {
                        productArray.push({productId: product.productId, fromDate:product.fromDate, 
                         roleTypeId: product.roleTypeId, thruDate: new Date()});
                    } else {
                        delete _this.productGrid.selection[product.productId];
                    }
                });
                for (var prodId in _this.productGrid.selection) {
                    productArray.push({productId: prodId, fromDate: new Date()});
                }
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
                            _this.grid.bodyNode.scrollTop = _this.grid.bodyNode.scrollHeight;
                            _this.grid.select({element: rowDiv});
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