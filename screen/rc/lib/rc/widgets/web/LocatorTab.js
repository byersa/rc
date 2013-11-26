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
        'dojo/Deferred',
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
        'dojox/validate',
        'dojox/validate/web',
        'dojo/text!./templates/LocatorTab.html',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane',
        'dijit/form/ValidationTextBox',
        'dijit/form/TextBox',
        'dijit/form/Select',
        'dijit/form/Button',
        'dijit/form/FilteringSelect',
        'dijit/form/DropDownButton',
        'dijit/TooltipDialog',
        'dijit/form/Form'

        ], function(declare, string, lang, domStyle, domConstruct, registry, query, on, request,
                Deferred, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
              Observable, OnDemandGrid, Selection, Keyboard, selector,
              Memory, ObjectStore,
              //ValidationTextBox, TextBox, Select, Button, FilteringSelect, Form,
              validate, validateWeb, template
        ) {
            
       var comboGrid = declare([OnDemandGrid, Selection, Keyboard]);     
       
       var wid = declare("rc.widgets.web.LocatorTab", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
           map: null,
           
           buildRendering: function() {
               this.inherited(arguments);
               return;
           },
           
           postCreate: function() {
               this.inherited(arguments);
               var _this = this;
               this.bContainer.startup();
                // this.map = new Map("rcMap", {
                //     baseLayerType : dojox.geo.openlayers.BaseLayerType.GOOGLE
                // });
                // this.map.fitTo([ -160, 70, 160, -70 ]);
                this.matchStore = new Observable(new Memory({idProperty:'partyId', data: null}));
                this.matchGrid = new comboGrid({store: this.matchStore, subRows: this.getMatchColumns(), showHeader: false}, this.locatorMatchGridDiv);
                this.matchGrid.startup();
                //query("input[name=locatorSubmit]", this.domNode).on("click", lang.hitch(_this, "submitLocatorForm"));
                this.locatorSubmit.on("click", lang.hitch(_this, "submitLocatorForm"));
                return;
            },
           
           makeMap: function(data) {
               var bBox = this.getBoundingBox(data);
                var ctr = bBox.getCenter();
                var mapOptions = {
                    center: ctr,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoom: 12
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
               dojo.forEach(data, function(row) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(row.latitude, row.longitude),
                    map: map,
                    title: row.organizationName
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
							{field:'partyId', colSpan:"4"}
						]
					];
           },
           
           rads2dist: function() {
           },
           
           submitLocatorForm: function() {
                var _this = this;
                var values = this.locatorForm.get("value");
                var queryContent = {}
                if (values.postalCode) {
                    queryContent.postalCode = values.postalCode;
                } else {
                    if (values.stateProvinceGeoId) {
                        queryContent.state = values.stateProvinceGeoId.substring(4);
                        queryContent.city = values.city;
                    }
                }
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
        
           eof: function() {
               return;
           }
       });
       return wid;
});