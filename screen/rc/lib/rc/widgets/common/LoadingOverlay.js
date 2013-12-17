define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/text!./templates/LoadingOverlay.html'

        ], function(declare, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {
            
       var wid = declare("rc.widgets.common.LoadingOverlay", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
           
           templateString: template,
            
            eof: function() {
                return;
            }
       });
       return wid;
});            
