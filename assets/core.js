// JavaScript Document

var IMGPATH_DRESSICON = "Dress\\{id}-{sid}.png";
var IMGPATH_DRESS = "Dress\\{id}-{sid}.png";
var IMGPATH_DRESSICON_NET = "http://image2.nuan.wan.liebao.cn/v1/dress/ipadmini/{id}-{sid}.png"
var IMGPATH_DRESS_NET = "http://image2.nuan.wan.liebao.cn/v1/dress/ipadmini/{id}-{sid}.png"
//var IMGPATH_DRESS = "http://image2.nuan.wan.liebao.cn/v1/dress/ipad/{id}-{sid}.png"
var IMGPATH_BACKGROUND = "ccbg\\ccbg{id}.png";
var IMGPATH_DEFAULTDRESS = "assets\\defaultdress.png";
var IMGPATH_HEART = "assets\\xin.png";
var IMGPATH_TRANSPARENT = "assets\\Transparent.png";
var IMGPATH_SELECTED = "assets\\itemselected.png";
var IMGPATH_FAVOUR = "assets\\star.png"
var JSONPATH_IOS = "assets\\db_ios.json";
var JSONPATH_AND = "assets\\db_and.json";
var JSONCONFIGPATH = "config.json";
var CANVAS_WIDTH = 1536;
var CANVAS_HEIGHT = 2048;
var BACKGROUND_COUNT = 7;
var MODEL_CHANGE_OFFX = -233.;
var MODEL_CHANGE_OFFY = 71.;
var MODEL_SHARE_OFFX = 126;
var MODEL_SHARE_OFFY = -26.;
var SOUNDPATH_CLICK = ""//var SOUNDPATH_CLICK = "assets\\tongyongyin.mp3"

var initEnd = false;
var currentBackground = 0;
var zoomRate = 0.25;
var zoomRatePreview = 0.5;
var modelOffX = MODEL_SHARE_OFFX;
var modelOffY = MODEL_SHARE_OFFY;

var DEFAULTHAIR = 10842;

var jsonpath = JSONPATH_IOS;
var json;
var dressed = [];
var dressRecord = [];
var clothesType = [100, 200, 300, 400, 500, 600, 700, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810];
var clothesTypeName = [];
var listItems = new Array;
var frameFunc = [
	function(itemid){return json.typeid[itemid] == 100;},
	function(itemid){return json.typeid[itemid] == 200;},
	function(itemid){return json.typeid[itemid] == 300;},
	function(itemid){return json.typeid[itemid] == 400;},
	function(itemid){return json.typeid[itemid] == 500;},
	function(itemid){return json.typeid[itemid] == 600;},
	function(itemid){return json.typeid[itemid] == 700;},
	function(itemid){return json.typeid[itemid] == 801;},
	function(itemid){return json.typeid[itemid] == 802;},
	function(itemid){return json.typeid[itemid] == 803;},
	function(itemid){return json.typeid[itemid] == 804;},
	function(itemid){return json.typeid[itemid] == 805;},
	function(itemid){return json.typeid[itemid] == 806;},
	function(itemid){return json.typeid[itemid] == 807 || json.typeid[itemid] == 808;},
	function(itemid){return json.typeid[itemid] == 810;},
	function(itemid){return json.typeid[itemid] == 809;},
];
var currentFrame = 0;
var currentSortMode;
var listScrollTop = [];
var fullDesc = [];
var searchSplit;
var bShowBackground = true;
var cursorItemId = 0;
var favourite = [];
var cfg_fso;

function _log(s)
{
	if(window.console)
		console.log(s);
}

$(window).load(function()
{
	try
	{
		cfg_fso = new ActiveXObject("Scripting.FileSystemObject");
	}
	catch(err)
	{
		alert("无法建立文件，这将不能保存收藏衣柜和一些个人设置，请选择允许ActiveX控件");
	}
	refreshLoading(0);
	$.getJSON(JSONCONFIGPATH, function(data)
	{
		jsonpath = data.jsonpath;
		currentBackground = parseInt(data.background);
		favourite = data.favorite;
		if(jsonpath == "" || jsonpath == null)
			jsonpath = JSONPATH_IOS;
		if(isNaN(currentBackground))
			currentBackground = 0;
		startLoad();
	}).error(function(x, e)
	{
		if(e == "parsererror")
			alert("配置文件格式错误，无法加载个人配置");
		startLoad();
	})
})

$(window).unload(function()
{
	saveConfig();
})

function startLoad()
{
	$.getJSON(jsonpath, function(data)
	{
		json = data;
		initAll();
	}).error(function(x, e)
	{
		if(e == "parsererror")
			alert("数据库错误！");
		else
			alert("无法读取数据库！请使用ie浏览器（推荐ie9.0以上）");
		return;
	})
}

function initAll()
{
	_log("init 0")
	$("#databaseVersion").text("数据库版本：" + json.dbver).append([
		$("<a>").text("[切换]").attr("href", "javascript:void(0)").click(switchDatabase).attr("title", "会重新加载页面"),
		$("<a>").text("[更新数据包]").attr("href", "javascript:void(0)").click(updateDatabase).attr("title", "解压缩后替换同名文件"),
	]);
	refreshLoading(1);
	_log("init 1")
	$.each(clothesType, function(index, value){
		dressed[value] = "";
	});
	$("img").attr({
		"show" : 0,
		"zi" : 0,
	})
	_log("init 2")
	clothesTypeName[100] = "发型";
	clothesTypeName[200] = "连衣裙";
	clothesTypeName[300] = "外套";
	clothesTypeName[400] = "上衣";
	clothesTypeName[500] = "下装";
	clothesTypeName[600] = "袜子";
	clothesTypeName[700] = "鞋子";
	clothesTypeName[801] = "头饰";
	clothesTypeName[802] = "耳饰";
	clothesTypeName[803] = "颈饰";
	clothesTypeName[804] = "手饰";
	clothesTypeName[805] = "腰饰";
	clothesTypeName[806] = "腿饰";
	clothesTypeName[807] = "特殊";
	clothesTypeName[808] = "特殊";
	clothesTypeName[809] = "提包";
	clothesTypeName[810] = "妆容";
	initAllInterval();
	_log("init 3")
}

function initAllInterval()
{
	var maxtime = 50;
	var restDelay = 2;
	var endtime = new Date() + maxtime;
	do{
		if(initClothes())
		{
			initAllEnd();
			return;
		}
	}while(endtime > new Date()); 
	setTimeout(initAllInterval, restDelay);
}

function initAllEnd()
{
	_log("init 4")
	$("#main").focus();
	_log("init 5")
	initFrames();
	_log("init 6")
	initFavour();
	_log("init 7")
	dressOnRecord(DEFAULTHAIR, 100);
	_log("init 8")
	setFrame(0);
	_log("init 9")
	refreshViewer();
	_log("init 10")
	refreshLoading(100);
	$(".loadingbar").fadeOut(500);
	$("#loading").delay(500).fadeOut(500);
	_log("init 11")
	initEnd = true;
}

function refreshLoading(percentage)
{
	var width = $("#loadingbarfill").css("width").replace(/px/, "");
	if(percentage <= 0)
		width = 0;
	else if(percentage >= 100)
		;
	else
		width = (width - 10) * percentage / 100 + 5;
	$("#loadingbarfillbox").animate({
		"width" : width + "px"
	}, 0);
}

var initClothesDivTemplate;
var initClothesImgHearts = [];
var initClothesStep = 0;

function initClothes()
{
	if(initClothesStep == 0)
	{
		$(".clothes").error(toErrSrc);
		currentSortMode = "id";
		var imgHeart = '<img class="listItemHeart" src="' + IMGPATH_HEART + '">';
		for(var i = 0; i < 8; ++i)
			initClothesImgHearts[i] = new Array(i + 1).join(imgHeart);
		initClothesDivTemplate = $("<div>").attr({
			//"id" : "item" + itemId,
			//"itemid" : itemId,
			//"title" : desc,
		}).addClass("listItem").append(
			$("<img>").attr({
				"src" : IMGPATH_TRANSPARENT,
			}).addClass("listItemClick"),
			$("<img>").attr({
				"src" : IMGPATH_TRANSPARENT,
			}).addClass("listItemFavour"),
			$("<img>").attr({
				//"src" : clothesImg(itemId, 0, false),
				//"errsrc" : clothesImg(itemId, 0, true),
			}).addClass("listItemThumbnail"),
			$("<div>").addClass("listItemContent").append([
				//$("<p>").html(initClothesImgHearts[json.level[itemId]]),
				//$("<p>").text(json.name[itemId]),
			])
		);
	}
	refreshLoading(1 + initClothesStep / json.length * 98);
	if(initClothesStep >= json.length)
	{
		$(initClothesDivTemplate).remove();
		return true;
	}
	initClothesHandle(initClothesStep);
	++initClothesStep;
	return false;
}

function initClothesHandle(index)
{
	var itemId = json.id[index];
	var div = $(initClothesDivTemplate).clone();
	var desc = json.desc[itemId];
	if(json.ptype[itemId] == 8)
		desc += "\n饰品" + "No." + json.pedia[itemId] + " " + clothesTypeName[json.typeid[itemId]];
	else
		desc += "\n" + clothesTypeName[json.typeid[itemId]] + "No." + json.pedia[itemId];
	desc += json.suit[itemId].replace(/</g, "\n<");
	desc += "\n获得方法：" + json.acquire[itemId];
	fullDesc[itemId] = json.name[itemId] + "\n" + desc;
	//desc += "\nid：" + itemId;
	$(div).attr({
		"id" : "item" + itemId,
		"itemid" : itemId,
		"title" : desc,
	}).click(function(){
		playSound(SOUNDPATH_CLICK);
		cursorItemId = this.getAttribute("itemid");
		showDetial(cursorItemId);
		selectClothes(cursorItemId);
	});
	$(div).children("img.listItemThumbnail").attr({
		"src" : clothesImg(itemId, 0, false),
		"errsrc" : clothesImg(itemId, 0, true),
	}).error(toErrSrc);
	$(div).children("div.listItemContent").append([
		$("<p>").html(initClothesImgHearts[json.level[itemId]]),
		$("<p>").text(json.name[itemId]),
	]);
	$("#list").append(div);
	listItems[itemId] = div;
}

function initFrames()
{
	var frameOrder = [0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 12, 6, 13, 15, 14];
	for(var i in frameOrder)
	{
		$("#frameList").append(
			$("<div>").attr({
				"id" : "frame" + frameOrder[i],
				"class" : "frameItem",
				"frameid" : frameOrder[i],
			}).click(function(){playSound(SOUNDPATH_CLICK);setFrame(this.getAttribute("frameid"));})
		);
	}
}

function initFavour()
{
	$("#list").children().each(function(index, ele)
	{
		if(favourite[ele.getAttribute("itemid")])
			$(ele).find(".listItemFavour").attr("src", IMGPATH_FAVOUR);
	});
}

function changeItemOrder(mode)
{
	if(mode == currentSortMode)
		return;
	currentSortMode = mode;
	$(".listItem").detach();
	for(var i = 0; i < json.length; ++i)
		$("#list").append(listItems[json[mode][i]]);
}

function refreshViewer()
{
	$("#viewer").css({
		"width" : CANVAS_WIDTH * zoomRate + "px",
		"height" : CANVAS_HEIGHT * zoomRate + "px"
	});
	showBackground();
	showModel();
	showClothes();
}

function clothesImg(id, sid, net)
{
	var path;
	if(sid == 0)
	{
		if(net)
			path = IMGPATH_DRESSICON_NET;
		else
			path = IMGPATH_DRESSICON;
	}
	else
	{
		if(net)
			path = IMGPATH_DRESS_NET;
		else
			path = IMGPATH_DRESS;
	}
	return path.replace(/{id}/, id).replace(/{sid}/, sid);
}

function clothesConvX(x, width)
{
	return x - width / 2;
	return 0;
}

function clothesConvY(y, height)
{
	return CANVAS_HEIGHT - y - height / 2;
}

function resetErrSrc(img)
{
	img.setAttribute();
}

function showClothesImage(path, patherr, id, zindex, width, height, left, top)
{
	var img = $("#clothes" + id);
	if(path == "")
	{
		img.attr("show", 0).css("visibility", "hidden");
		return;
	}
	if(img.attr("src") != path)
	{
		img.attr("src", IMGPATH_TRANSPARENT);
		img.attr("errsrc", patherr);
		img.attr("err", 0);
		img.attr("src", path);
		if(initEnd)
			_log(path);
	}
	img.attr({
		"px" : (clothesConvX(left, width) + modelOffX) * zoomRatePreview,
		"py" : (clothesConvY(top, height) + modelOffY) * zoomRatePreview,
		"pw" : width * zoomRatePreview,
		"ph" : height * zoomRatePreview,
		"show" : 1,
		"zi" : zindex,
	}).css({
		"visibility" : "visible",
		"left" : (clothesConvX(left, width) + modelOffX) * zoomRate + "px",
		"top" : (clothesConvY(top, height) + modelOffY) * zoomRate + "px",
		"zIndex" : zindex,
		"width" : width * zoomRate + "px",
		"height" : height * zoomRate + "px",
	});
}

function hideClothes(typeid)
{
	for(var i = 0; i < 2; ++i)
		showClothesImage("", "", typeid * 100 + i + 1, 0, 0, 0, 0, 0)
}

function showClothesById(itemId, typeid)
{
	var width = json.width[itemId];
	var height = json.height[itemId];
	var left = json.posx[itemId];
	var top = json.posy[itemId];
	var zi = Array();
	zi[0] = json.zindex1[itemId];
	zi[1] = json.zindex2[itemId];
	$.each([0, 1], function(index, value){
		if(value < json.part[itemId])
			showClothesImage(clothesImg(itemId, value + 1, false), clothesImg(itemId, value + 1, true), typeid * 100 + value + 1, zi[value], width, height, left, top);
		else
			showClothesImage("", "", typeid * 100 + value + 1, 0, 0, 0, 0, 0);
	});
}

function dressOnRecord(itemId, typeid)
{
	if(itemId == "")
		return;
	if(dressed[typeid] == itemId)
		return;
	else
		dressOffRecord(typeid, true);
	if(typeid == 200)
	{
		dressOffRecord(400, true);
		dressOffRecord(500, true);
	}
	if(typeid == 400 || typeid == 500)
		dressOffRecord(200, true);
	$("#item" + itemId).css("backgroundImage", toUrl2(IMGPATH_SELECTED));
	dressed[typeid] = itemId;
}

function dressOffRecord(typeid, force)
{
	if(dressed[typeid] == "")
		return;
	if(typeid == 100 && dressed[100] == DEFAULTHAIR && !force)
		return;
	$("#item" + dressed[typeid]).css("backgroundImage", "");
	dressed[typeid] = "";
	if(typeid == 100 && !force)
		dressOnRecord(DEFAULTHAIR, 100);
}

function showClothes()
{
	for(var tid in clothesType)
	{
		if(dressed[clothesType[tid]] != "")
			showClothesById(dressed[clothesType[tid]], clothesType[tid]);
		else
			hideClothes(clothesType[tid]);
	}
	$("#defaultdress").attr({
		"px" : (475 + modelOffX) * zoomRatePreview,
		"py" : (603 + modelOffY) * zoomRatePreview,
		"pw" : 158 * 2 * zoomRatePreview,
		"ph" : 258 * 2 * zoomRatePreview,
		"zi" : 200,
		}).css({
		"left" : (475 + modelOffX) * zoomRate + "px",
		"top" : (603 + modelOffY) * zoomRate + "px",
		"width" : 158 * 2 * zoomRate + "px",
		"height" : 258 * 2 * zoomRate + "px",
	});
	$(".nake").attr({
		"px" : (0 + modelOffX) * zoomRatePreview,
		"py" : (140 + modelOffY) * zoomRatePreview,
		"pw": 1384 * zoomRatePreview,
		"ph": 1911 * zoomRatePreview,
		"zi" : 131,
	}).css({
		"left" : (0 + modelOffX) * zoomRate + "px",
		"top" : (140 + modelOffY) * zoomRate + "px",
		"width": 1384 * zoomRate + "px",
		"height": 1911 * zoomRate + "px",
	});
	var show = dressed[200] == "" && dressed[300] == "" && dressed[400] == "" && dressed[500] == "";
	$("#defaultdress").attr("show", ((show) ? 1 : 0)).css("visibility" , ((show) ? "visible" : "hidden"));
	show = dressed[200] != "" || dressed[400] != "";
	$("#nake1").attr("show", ((show) ? 1 : 0)).css("visibility" , ((show) ? "visible" : "hidden"));
	show = dressed[200] != "" || dressed[500] != "";
	$("#nake2").attr("show", ((show) ? 1 : 0)).css("visibility" , ((show) ? "visible" : "hidden"));
}

function selectClothes(itemId)
{
	dressRecordSet();
	var typeid = json.typeid[itemId];
	if(dressed[typeid] == itemId)
		dressOffRecord(typeid, false);
	else
		dressOnRecord(itemId, typeid);
	showClothes();
}

function removeAllClothes()
{
	dressRecordSet();
	for(var tid in clothesType)
		dressOffRecord(clothesType[tid]);
	showClothes();
}

function dressRecordSet()
{
	dressRecord.push(dressed.slice(0));
	while(dressRecord.length > 100)
		dressRecord.shift();
}

function dressRecordGet()
{
	if(dressRecord.length <= 0)
		return;
	var record = dressRecord.pop();
	for(var tid in clothesType)
		if(record[clothesType[tid]] != "")
			dressOnRecord(record[clothesType[tid]], clothesType[tid]);
		else
			dressOffRecord(clothesType[tid], true);
}

function filterClothes(filter)
{
	$("#list").children().each(function(index, ele)
	{
		if(filter(ele.getAttribute("itemid")))
			ele.style.display = "inline-block";
		else
			ele.style.display = "none";
	});
}

function setFrame(i)
{
	if(currentFrame >= 0)
		listScrollTop[currentFrame] = document.getElementById("list").scrollTop;
	currentFrame = i;
	filterClothes(frameFunc[i]);
	if(currentFrame >= 0)
		document.getElementById("list").scrollTop = listScrollTop[currentFrame];
	else
		document.getElementById("list").scrollTop = 0;
}

function showBackground()
{
	currentBackground = (currentBackground + BACKGROUND_COUNT) % BACKGROUND_COUNT;
	$("#background").attr({
		"src" : IMGPATH_BACKGROUND.replace(/{id}/, currentBackground),
		"px" : 0,
		"py" : 0,
		"pw" : CANVAS_WIDTH * zoomRatePreview,
		"ph" : CANVAS_HEIGHT * zoomRatePreview,
		"show" : ((bShowBackground) ? 1 : 0),
		"zi" : 0,
	}).css({
		"visibility" : ((bShowBackground) ? "visible" : "hidden"),
		"left" : "0px",
		"top" : "0px",
		"width" : CANVAS_WIDTH * zoomRate + "px",
		"height" : CANVAS_HEIGHT * zoomRate + "px"
	});
}

function showModel()
{
	$("#model").attr({
		"px" : (453 + modelOffX) * zoomRatePreview,
		"py" : (325 + modelOffY) * zoomRatePreview,
		"pw" : 194 * 2 * zoomRatePreview,
		"ph" : 812 * 2 * zoomRatePreview,
		"show" : 1,
		"zi" : 130,
	}).css({
		"visibility" : "visible",
		"left" : (453 + modelOffX) * zoomRate + "px",
		"top" : (325 + modelOffY) * zoomRate + "px",
		"width" : 194 * 2 * zoomRate + "px",
		"height" : 812 * 2 * zoomRate + "px"
	});
}

function showDetial(itemId)
{
	var arr = [];
	var desc = json.desc[itemId];
	desc += "<br><br><b>图鉴：</b>";
	if(json.ptype[itemId] == 8)
		desc += "<br>饰品" + "No." + json.pedia[itemId] + " " + clothesTypeName[json.typeid[itemId]];
	else
		desc += "<br>" + clothesTypeName[json.typeid[itemId]] + "No." + json.pedia[itemId];
	arr = json.suit[itemId].replace(/</g, "\n<").split("\n").slice(1);
	if(arr.length > 0)
	{
		desc += "<br><br><b>套装：</b>";
		for(var i in arr)
			if(arr[i] != "")
				desc += '<br><a href="javascript:void(0)" onClick=\'searchSuit("' + arr[i] + '")\'>' + arr[i] + '</a>';
	}
	desc += "<br><br><b>获得方法：</b>";
	arr = json.acquire[itemId].split("，");
	var regPur = /.*购买$/gi;
	var regCft = /图纸制作/gi;
	for(var i in arr)
	{
		if(arr[i] != "")
			desc += '<br>' + arr[i];
		if(regPur.test(arr[i]))
		{
			if(json.taskid[itemId] > 0)
				desc += '<br>->需要完成任务' + json.taskid[itemId];
			if(json.favor[itemId] > 0)
				desc += '<br>->需要好感度达到' + json.favor[itemId] + '级';
		}
		if(regCft.test(arr[i]))
		{
			for(var i in json.material[itemId])
				desc += '<br>->' + json.material[itemId][i][0] + '*' + json.material[itemId][i][1];
		}
	}
	desc += "<br><br><b>回收价格：</b>";
	if(json.sprice[itemId] <= 0)
		desc += "<br>无法出售";
	else
		desc += "<br>" + json.sprice[itemId] + "金币";
	//desc += "\nid：" + itemId;
	$("#detialText").empty();
	$("#detialText").html(desc);
}

function playSound(path)
{
	document.getElementById("sound").innerHTML = '<embed src="' + toUrl(path) + '" autostart=true></embed>';
}

function nextBackground()
{
	++currentBackground;
	bShowBackground = true;
	showBackground();
}

function prevBackground()
{
	--currentBackground;
	bShowBackground = true;
	showBackground();
}

function hideBackground()
{
	bShowBackground = !bShowBackground;
	showBackground();
}

function toUrl(str)
{
	return str.replace(/\\/, "/");
}

function toUrl2(str)
{
	return "url(" + toUrl(str) + ")";
}

function testZoom(r)
{
	if(zoomRate == 0.25)
		zoomRate = r;
	else
		zoomRate = 0.25;
	refreshViewer();
}

function searchName()
{
	currentFrame = -1;
	var value = $("#searchBox").val();
	searchSplit = value.toLowerCase().split(" ");
	filterClothes(function(itemid){
		for(var i in searchSplit)
			if(json.name[itemid].toLowerCase().indexOf(searchSplit[i]) < 0)
				return false;
		return true;
	});
}

function searchDetial()
{
	currentFrame = -1;
	var value = $("#searchBox").val();
	searchSplit = value.toLowerCase().split(" ");
	filterClothes(function(itemid){
		for(var i in searchSplit)
			if(fullDesc[itemid].toLowerCase().indexOf(searchSplit[i]) < 0)
				return false;
		return true;
	});
}

function searchSuit(suitname)
{
	$("#main").focus();
	currentFrame = -1;
	searchSplit = [suitname.toLowerCase()];
	filterClothes(function(itemid){
		return json.suit[itemid].toLowerCase().indexOf(searchSplit[0]) >= 0;
	});
}

function searchDressed()
{
	currentFrame = -1;
	filterClothes(function(itemid){return itemid != DEFAULTHAIR && dressed[json.typeid[itemid]] == itemid;});
}

function setFavour(itemId, invert)
{
	if(itemId <= 0)
		return;
	if(!favourite[itemId])
	{
		$("#item" + itemId + " .listItemFavour").attr("src", IMGPATH_FAVOUR);
		favourite[itemId] = true;
	}
	else if(favourite[itemId] && invert)
	{
		$("#item" + itemId + " .listItemFavour").attr("src", IMGPATH_TRANSPARENT);
		favourite[itemId] = false;
	}
}

function setFavourCursor()
{
	setFavour(cursorItemId, true);
}

function setFavourDressed()
{
	for(var tid in clothesType)
		if(dressed[clothesType[tid]] != DEFAULTHAIR)
			setFavour(dressed[clothesType[tid]], false);
}

function searchFavour()
{
	currentFrame = -1;
	filterClothes(function(itemid){return favourite[itemid];});
}

function forwardStat()
{
	dressRecordGet();
	showClothes();
}

function changeItemOrderChange()
{
	changeItemOrder("id");
}

function changeItemOrderPedia()
{
	changeItemOrder("oid");
}

function musicStop()
{
	document.getElementById("bgmplayer").stop();
}

function sortByZIndex(a, b)
{
	return a.getAttribute("zi") - b.getAttribute("zi");
}

function exportImage()
{
	var canvas = document.getElementById("preview");
	if(!canvas.getContext)
	{
		alert("当前IE版本不支持预览功能，请升级至IE9.0");
		return;
	}
	canvas.width = CANVAS_WIDTH * zoomRatePreview;
	canvas.height = CANVAS_HEIGHT * zoomRatePreview;
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = "#808080";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var imgs = $("#viewer img");
	imgs.sort(sortByZIndex);
	$.each(imgs, function(index, ele){
		if(ele.getAttribute("show") > 0)
			ctx.drawImage(ele, ele.getAttribute("px"), ele.getAttribute("py"), ele.getAttribute("pw"), ele.getAttribute("ph"));
	});
	//ctx.drawImage(document.getElementById("share1"), 0, 0, canvas.width, canvas.height);
	ctx.drawImage(document.getElementById("share2"), 0, 0, canvas.width, canvas.height);
	var image = canvas.toDataURL("image/png");
	var w = window.open("", "newwindow");
	w.document.title = "预览";
	w.document.body.innerHTML = "<img src='" + image + "'/>";
}

function gohp()
{
	window.open("http://nuan.wan.liebao.cn/", "newwindow");
}

function switchDatabase()
{
	if(jsonpath == JSONPATH_IOS)
		jsonpath = JSONPATH_AND;
	else
		jsonpath = JSONPATH_IOS;
	window.location.reload();
}

function updateDatabase()
{
	window.open("https://github.com/NikkiLite/NikkiLite/archive/master.zip", "newwindow");
}

function saveConfig()
{
	var tf;
	tf = cfg_fso.CreateTextFile(decodeURI(window.location.pathname.substr(1)).replace(/[^\/]*.htm/gi, "config.json"), true);
	var data = {
		"jsonpath" : jsonpath,
		"background" : currentBackground,
		"favorite" : favourite,
		}
	tf.Write($.toJSON(data));
	tf.Close();
}

function toErrSrc()
{
	if(this.getAttribute("err") <= 0)
	{
		this.src = this.getAttribute("errsrc");
		if(initEnd)
			_log(this.getAttribute("errsrc"));
		this.setAttribute("err", 1);
	}
}

$("#searchBox").attr("title", "输入搜索关键词，多个关键词用空格分隔")
$("#prevBackground").click(prevBackground).attr("title", "切换到上一个背景")
$("#nextBackground").click(nextBackground).attr("title", "切换到下一个背景")
$("#exportImage").click(exportImage).attr("title", "在新窗口中浏览图片，可以复制或保存")
$("#searchName").click(searchName).attr("title", "(Enter)搜索衣服的名字")
$("#searchDetial").click(searchDetial).attr("title", "(Ctrl+Enter)搜索衣服的名字、说明、类型、套装、来源等详细信息")
$("#setFavourCursor").click(setFavourCursor).attr("title", "把上一件试穿的衣服加入收藏或取消收藏")
$("#setFavourDressed").click(setFavourDressed).attr("title", "把身上穿着的所有衣服加入收藏")
$("#searchFavour").click(searchFavour).attr("title", "查看收藏的衣服")
$("#searchDressed").click(searchDressed).attr("title", "查看身上穿着的衣服")
$("#removeAllClothes").click(removeAllClothes).attr("title", "脱掉身上所有的衣服")
$("#forwardStat").click(forwardStat).attr("title", "撤销上一个换装操作，最多撤销100步")
$("#changeItemOrderChange").click(changeItemOrderChange).attr("title", "按照游戏内衣柜更衣的顺序排列衣服")
$("#changeItemOrderPedia").click(changeItemOrderPedia).attr("title", "按照游戏内图鉴显示的顺序排列衣服")
$("#musicStop").click(musicStop).attr("title", "停止播放背景音乐")
$("#gohp").click(gohp).attr("title", "访问游戏本体《暖暖环游世界》的官方网站")
$("#searchBox").bind("keypress", function(event){
	if(event.keyCode == "10" || (event.ctrlKey && event.keyCode == "13"))
	{
		searchDetial();
		$("#main").focus();
	}
	else if(event.keyCode == "13")    
	{
		searchName();
		$("#main").focus();
	}
});