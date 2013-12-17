define([
        'dojo/_base/declare',
        'dojo/string',
        'dojo/_base/lang',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dijit/registry',
        'dojo/query',
        'dojo/on',
        'dojo/request',
        'dojo/json',
        'dojo/Deferred',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/form/Select',
        'dojo/store/Observable',
        'dgrid/OnDemandGrid',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
        'dojox/validate',
        'dojox/validate/web',
        'dojo/text!./templates/LocatorTab.html',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane',
        'dijit/form/ValidationTextBox',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'dijit/form/FilteringSelect',
        'dijit/form/DropDownButton',
        'dijit/TooltipDialog',
        'dijit/form/Form'

        ], function(declare, string, lang, domStyle, domConstruct, registry, query, on, request,
                JSON, Deferred, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Select,
              Observable, OnDemandGrid, Selection, Keyboard, selector,
              Memory, ObjectStore,
              //ValidationTextBox, TextBox, Select, Button, FilteringSelect, Form,
              validate, validateWeb, template
        ) {
            
       var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);  
       var ZOOM_SIZE = 9; 
       var LOCATE_DISTANCE = 50; 
       
       var wid = declare("rc.widgets.web.LocatorTab", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
           map: null,
           markers: null,
           infoWindows: null,
           
           buildRendering: function() {
               this.inherited(arguments);
               return;
           },
           
           postCreate: function() {
               this.inherited(arguments);
               var _this = this;
               this.bContainer.startup();
                this.matchStore = new Observable(new Memory({idProperty:'partyId', data: null}));
                this.matchGrid = new comboGrid({store: this.matchStore, subRows: this.getMatchColumns(), showHeader: false}, this.locatorMatchGridDiv);
                this.matchGrid.startup();
                //query("input[name=locatorSubmit]", this.domNode).on("click", lang.hitch(_this, "submitLocatorForm"));
                this.locatorSubmit.on("click", lang.hitch(_this, "submitLocatorForm"));
                var stateStore = registry.byId("stateStore");
                var cntrl = new Select({
                               name: "stateProvinceGeoId",
                               label: "State",
                               labelAttr: "geoName",
                               sortByLabel: false,
                               store: stateStore
                           });
                domConstruct.place(cntrl.domNode, this.locatorSelect);
                return;
            },
           
           makeMap: function(data) {
               var bBox = this.getBoundingBox(data);
                var ctr = bBox.getCenter();
                var mapOptions = {
                    center: ctr,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoom: ZOOM_SIZE
                };
                this.map = new google.maps.Map(this.mapDiv,
                    mapOptions);   
                // window.setTimeout(function() {
                //     google.maps.event.trigger(_this.map, 'resize');
                //     _this.map.panTo(_this.map.getCenter());
                //     }, 1000);
                // google.maps.event.addListener(this.map, 'zoom_changed', function() {
                //     _this.map.setCenter(_this.map.getCenter());
                //     google.maps.event.trigger(_this.map, 'resize');
                //     _this.map.panTo(_this.map.getCenter());
                //     return;
                // });
                // var marker = new google.maps.Marker({
                //     position: new google.maps.LatLng(40.374, -80.033),
                //     map: _this.map,
                //     title:"RCHerbals Store One"
                // });                
                dojo.subscribe("work-selectChild", function(selected){
                    if(selected.id === "locatorTab") {
                        //window.setTimeout(function() {
                        //_this.map.setCenter(ctr);
                        google.maps.event.trigger(_this.map, 'resize');
                        _this.map.panTo(ctr);
                        //}, 200);
                    }
                    return;
                });         
                this.addMarkers(this.map, data);
                return;
           }, 
           
           addMarkers: function(map, data) {
               this.markers = {};
               this.infoWindows = {};
               
               dojo.forEach(data, function(row) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(row.latitude, row.longitude),
                    map: map,
                    title: row.organizationName
                });             
                this.markers[row.partyId] = marker;
                var postalRow = (row.postalData && row.postalData.length) ? row.postalData[0] : {};
                var emailRow = (row.emailData && row.emailData.length) ? row.emailData[0] : {infoString: 'N/A'};
                var phoneRow = (row.phoneData && row.phoneData.length) ? row.phoneData[0] : {contactNumber: 'N/A'};

                var contentString = '<div class="infowindow">'
                    + '<b>' + row.organizationName + '</b><br/>'
                    + postalRow.address1 + '<br/>'
                    + postalRow.city + ', ' + postalRow.stateProvinceGeoId.substring(4) + ' ' + postalRow.postalCode + '<br/>'
                    + phoneRow.contactNumber + ' - ' + emailRow.infoString
                    ;

                var infoWindow = new google.maps.InfoWindow({
                    content: contentString
                });
                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.open(this.map,marker);
                });
               }, this);
               return;
           },
           
           getBoundingBox: function(data) {
               var sw = [200,0];
               var ne = [0,-200];
               dojo.forEach(data, function(row) {
                   if(row.latitude < sw[0]) { sw[0] = row.latitude;}
                   if(row.latitude > ne[0]) { ne[0] = row.latitude;}
                   if(row.longitude < sw[1]) { sw[1] = row.longitude;}
                   if(row.longitude > ne[1]) { ne[1] = row.longitude;}
               }, this);
               var swLLB = new google.maps.LatLng(sw[0], sw[1]);
               var neLLB = new google.maps.LatLng(ne[0], ne[1]); 
               var bBox = new google.maps.LatLngBounds(swLLB,neLLB);
               return bBox;
           },
           
           getMatchColumns: function() {
            return [
                        [
							{field:'organizationName', colSpan:"4"},
						],
						[
						    {field:'postalData', colSpan:"4", formatter: lang.hitch(this, "addressFormatter")},
						],
						[
							{field:'postalData', colSpan:"4", formatter: lang.hitch(this, "cityStateFormatter")},
						],
						[
							{field:'emailData', colSpan:"2", formatter: lang.hitch(this, "emailDataFormatter")},
						    {field:'phoneData', colSpan:"2", formatter: lang.hitch(this, "phoneDataFormatter")}
						],
						[
							{field:'partyId', colSpan:"4", formatter: lang.hitch(this, "partyFormatter")}
						]
					];
           },
           
           rads2dist: function() {
           },
           
           submitLocatorForm: function() {
                var _this = this;
                var values = this.locatorForm.get("value");
                var productValues = this.locatorProductForm.get("value");
                var queryContent = {}
                if (values.postalCode) {
                    queryContent.postalCode = values.postalCode;
                }
                if (values.stateProvinceGeoId && values.stateProvinceGeoId != "USA_DUMMY") {
                        queryContent.state = values.stateProvinceGeoId.substring(4);
                        queryContent.city = values.city;
                }
                var productIds = [];
                for (var prodId in productValues) {
                    if(productValues[prodId].length) {
                        productIds.push(prodId);
                    }
                }
                queryContent.productIdList = JSON.stringify(productIds);
                queryContent.distance = LOCATE_DISTANCE;
                var xhrDeferred = request("party/getLocalResellers",{
                    data: queryContent,
                    handleAs: "json",
                    method: "POST",
                    timeout: 10000
                }).then(function(data) {
                    var matchStore = new Observable(new Memory({idProperty:'partyId', data: data.items}));
                    _this.matchGrid.setStore(matchStore); 
                    _this.makeMap(data.items);
                    return;
                });
                _this.locatorDropDown.closeDropDown();
               return;
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
        
        cityStateFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var postalRow = value[0];
                var state = postalRow.stateProvinceGeoId.substring(4);
                returnVal = postalRow.city + ", " + state + " " + postalRow.postalCode;
            }
            return returnVal;
        },
        
        addressFormatter: function(value, object) {
            var returnVal = "";
            if (dojo.isArray(value) && value.length) {
                var postalRow = value[0];
                returnVal = postalRow.address1 + " " + postalRow.address2;
            }
            return returnVal;
        },
        
        partyFormatter: function(value, object) {
            var returnVal = "&nbsp;";
            return returnVal;
        },
        
           eof: function() {
               return;
           }
       });
       return wid;
});
