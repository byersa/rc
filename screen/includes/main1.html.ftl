<!DOCTYPE HTML>
<html>
    <head>
	<title>RidgeCrest Herbals</title>
	
    <script src="/dojo/dojo/dojo.js" type="text/javascript"
            data-dojo-config="locale: 'en', parseOnLoad: true, async: true"></script>
			
	<link href="/themes/rc.less" type="text/css" rel="stylesheet/less"/>
    <script src="/js/less-1.3.1.js" type="text/javascript"></script>
    
	<!-- dojo nihilo theme -->
    <link href="/dojo/dijit/themes/dijit.css" type="text/css" rel="stylesheet"/>
	
	<link href="/dojo/dijit/themes/claro/claro.css" type="text/css" rel="stylesheet"/>


    <link href="/themes/default.css" type="text/css" rel="stylesheet"/>

    
    <!-- application main file -->
         <script type="text/javascript">
                require({
                     trace:{
                        "loader-circular-dependency": 0,
                        "loader-define": 0,
                        "loader-define-module": 0,
                        "loader-exec-module": 0,
                        "loader-finish-exec": 0,
                        "loader-inject": 0,
                        "loader-run-factory": 0                      
                      },                       
                      packages:[
                                {
                                        location:'/lib/rc',
                                        name:'rc'
                                }
                        ]
                },
                [
                    'rc/widgets/main/MainContainer'
                ]);
        </script>
    </head>
    <body class="claro rc">
        <!--div id="startScreen">
            <div id="loaderImg"></div>
        </div-->
        <div id="main-container" data-dojo-type="rc.widgets.main.MainContainer">
