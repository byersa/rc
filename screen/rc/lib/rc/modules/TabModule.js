define([
        'dojo/_base/declare',
        'dijit/registry',
    'dijit/layout/TabContainer',
    'rc/modules/DgridModule',
    'rc/modules/DetailModule',
    'rc/modules/BasicStore',
    'dojo/store/Observable'
], function(declare, registry, TabContainer, DgridModule, DetailModule, BasicStore, Observable) {
    var container = declare('rc.modules.TabModule', [TabContainer], {
        
        dgridViewUrl: '',
        detailViewUrl: '',
        storeUrl: '',
        store: null,
        idProperty: '',
        
        constructor: function(params) {
            return;
        },
        
        startup: function() {
            this.inherited(arguments);
            var basicStore = new BasicStore({
                id: this.id + '-store',
                target: this.storeUrl,
                idProperty: this.idProperty
                });
                
            this.store = new Observable(basicStore);
            //registry.add(this.store);
                /*
            var dgridContainer = new DgridModule({
                href: this.dgridViewUrl,
                detailViewUrl: this.detailViewUrl,
                store: this.store
                });
            this.addChild(dgridContainer, "before");
            */
            return;
        },
        
        getStore: function() {
            return this.store;
        },
        
        setStore: function(aStore) {
            this.store = aStore;
        }
    });
    return container;
});

