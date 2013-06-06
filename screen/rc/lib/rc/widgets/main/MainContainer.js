// rc/widgets/navigation/MainContainer;
//noinspection JSUnresolvedFunction
/**
 * @fileOverview file for describing Container and adding additional elements(links) in its top
 */
define(
    [
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Evented',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dojo/text!./templates/MainContainer.html',
        'dojox/layout/ContentPane',
        'dijit/layout/ContentPane',
        'dijit/layout/TabContainer',
        'dijit/Dialog',
        'dijit/form/Form',
        'dijit/form/ValidationTextBox',
        'dojo/Deferred',
        'dojo/DeferredList',
        'dojo/promise/all'
    ],

    function (declare, lang, Evented, _TemplatedMixin, _WidgetsInTemplateMixin, BorderContainer, template) {

        var SIGN_IN_MEVENT = 'sign-in',
            SIGN_OUT_MEVENT = 'sign-out',
            REGISTER_MEVENT = 'register',
            MYACCOUNT_MEVENT = 'my-account',
            HELP_MEVENT = 'help';
        var SIGN_OUT_URL = '/Login/logout';

        return declare('rc.widgets.main.MainContainer', [BorderContainer, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

            templateString:template,

            buildRendering: function(){
		        this.inherited(arguments);
                return;
            },

            startup: function() {
		        this.inherited(arguments);
                return;
            },
            
            _onSignIn:function (e) {
                //noinspection JSUnresolvedFunction
                this.emit(SIGN_IN_MEVENT, e);
            },
            
            _onSignOut:function (e) {
                //noinspection JSUnresolvedFunction
                //this.emit(SIGN_OUT_MEVENT, e)
               // var url = "http://" + window.location.host + SIGN_OUT_URL;
                var url = SIGN_OUT_URL;
                window.location = url;
                return;
            },
            
            _onHelp:function (e) {
                //noinspection JSUnresolvedFunction
                this.emit(HELP_MEVENT, e);
            }
        });
    }
);
