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
        'dojo/store/Observable',
        'dgrid/GridFromHtml',
        'dgrid/OnDemandList',
        'dgrid/Selection',
        'dgrid/Keyboard',
        'dgrid/selector'
], function(declare, string, query, registry, lang, on, request, html, dom, htmlUtil, 
            Observable, GridFromHtml, OnDemandList, Selection, Keyboard, selector) {
                
    var addEditGrid = declare("rc.modules.AddEditGrid", [GridFromHtml, OnDemandList, Selection, Keyboard], {
    });
    return addEditGrid;
});