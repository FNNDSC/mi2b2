require.config({baseUrl:"js/components",paths:{jquery:["https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min","jquery/dist/jquery.min"],jquery_ui:["https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min","jquery-ui/jquery-ui.min"],gapi:"https://apis.google.com/js/api",jszip:"jszip/dist/jszip",dicomParser:"dicomParser/dist/dicomParser.min",utiljs:"utiljs/src/js/utiljs",fmjs:"fmjs/src/js/fmjs",gcjs:"gcjs/src/js/gcjs",xtk:"rboxjs/src/js/lib/xtk",rboxjs:"rboxjs/src/js/rboxjs",thbarjs:"thbarjs/src/js/thbarjs",toolbarjs:"toolbarjs/src/js/toolbarjs",jqdlgext:"chatjs/src/js/lib/jquery.dialogextend",chatjs:"chatjs/src/js/chatjs",viewerjs:"viewerjs/src/js/viewerjs",mi2b2:"../mi2b2"}}),require(["mi2b2"],function(a){a.app=new a.App});