define([
        'dojo/_base/declare',
        'dojo/string',
        'dojo/query',
        'dijit/registry',
        'dgrid/GridFromHtml',
        'dgrid/OnDemandList',
        'dojox/html/_base',
    'dojox/layout/ContentPane',
    'rc/modules/BasicStore'
], function(declare, string, query, registry, GridFromHtml, OnDemandList, htmlUtil, ContentPane, BasicStore) {
   
   var container = declare('rc.modules.DetailModule', [ContentPane], {
        
        viewUrl: '',
        
        constructor: function() {
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            return;
        }
        
    });
    return container;
});
