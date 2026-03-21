var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
function getQueryObj() {
	var obj = {};
	var query = window.location.search.substring(1);
	var pair, parts = query.split("&");
	var i, n = parts.length;
	for (i=0; i<n; i++) {
		pair = parts[i].split("=");
		obj[pair[0]] = pair[1] || "1";
	}
	return obj;
}
function getBadgeParams(){
	return {
		appname:	"My Avatar Editor",
		appurl:		"http://" + window.location.hostname + "/downloads/MyAvatarEditor.air",
		airversion:	1.5,
		imageurl:	"images/badge_preview.jpg"
	}
}
}