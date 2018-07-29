var addressArray = null;
var manageStatus = 1;
var blindStatus = 1;
var address = null;

$.post("/AddressController/getArea",{},function(data){
	addressArray = data;
})

var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT});// 左上角，添加比例尺
var top_left_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT});  //左上角，添加默认缩放平移控件
var map = new BMap.Map("container",{minZoom:11,maxZoom:19});          // 创建地图实例  
map.centerAndZoom("汕头",11);  
map.addControl(top_left_control);        
map.addControl(top_left_navigation);
map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
var bdary = new BMap.Boundary();
bdary.get("汕头市", function(rs){       //获取行政区域
	//map.clearOverlays();        //清除地图覆盖物       
	var count = rs.boundaries.length; //行政区域的点有多少个
	if (count === 0) {
		alert('未能获取当前输入行政区域');
		return ;
	}
  	var pointArray = [];
	for (var i = 0; i < count; i++) {
		var ply = new BMap.Polygon(rs.boundaries[i], { strokeColor: "#ff0000",fillColor:""}); //建立多边形覆盖物
		ply.disableMassClear();
		map.addOverlay(ply);  //添加覆盖物
		pointArray = pointArray.concat(ply.getPath());
	}    
	map.setViewport(pointArray);    //调整视野  
});


//搜索地址
$("#search").click(function(){
	var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++){
        if(allOverlay[i] == "[object Marker]"){
        	 map.removeOverlay(allOverlay[i]);
        }
    }
	address = $("#address").val();
	if(address!=""){
		$.post("/AddressController/searchAddress",{
			"address":address,
			"pageNum":0
		},function(data){
			$("#prompt").show();
			if(data.status==0){
				var ol = "<ol style='color:#4CAF50;padding-top:0' id='place'></ol>";
				$("#prompt").html(ol);
				var points = [];
				for(var i=0;i<data.place.results.length;i++){
					var li = "<li><a onclick='getManageAddress(" + JSON.stringify(data.place.results[i]) + ")' style='color:#4CAF50' href='#'>" + data.place.results[i].name + "</a></li>";
					$("#place").append(li);
					var point = new BMap.Point(data.place.results[i].location.lng,data.place.results[i].location.lat);
					var marker = new BMap.Marker(point);  // 创建标注
					marker.disableMassClear();
					if(i+1>=10){
						var label = new BMap.Label(i+1, {
			                offset : new BMap.Size(1, 4)
			            }); 
					}else{
						var label = new BMap.Label(i+1, {
			                offset : new BMap.Size(5, 4)
			            }); 
					}
					label.setStyle({
			           background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
			        });
					marker.setLabel(label);//显示地理名称 a
			       	map.addOverlay(marker);              // 将标注添加到地图中
			       	points.push(data.place.results[i].location);
				}
				var view = map.getViewport(eval(points));
				var mapZoom = view.zoom; 
				var centerPoint = view.center; 
				map.centerAndZoom(centerPoint,mapZoom);
				if(data.place.total>10){	
					$("#prompt").append("<div style='margin-left:260px'><a href='#' onclick='paging(0,true," + data.place.total + ")'>下一页></a></div>");
				}
			}else{
				$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.info + "</div>");
			}
		},"json");
	}else{
		$("#prompt").hide();
	}
})

//翻页
function paging(pageNum,status,total){
	if(status){
		pageNum = pageNum + 1;
	}else{
		pageNum = pageNum - 1;
	}
	$.post("/AddressController/searchAddress",{
		"address":address,
		"pageNum":pageNum
	},function(data){
		$("#prompt").html("");
		if(data.status==0){
			var allOverlay = map.getOverlays();
	        for (var i = 0; i < allOverlay.length; i++){
	            if(allOverlay[i] == "[object Marker]" ){
	            	 map.removeOverlay(allOverlay[i]);
	            }
	        }
			var ol = "<ol style='color:#4CAF50;padding-top:0' id='place'></ol>";
			$("#prompt").html(ol);
			var points = [];
			for(var i=0;i<data.place.results.length;i++){
				var li = "<li><a onclick='getManageAddress(" + JSON.stringify(data.place.results[i]) + ")' style='color:#4CAF50' href='#'>" + data.place.results[i].name + "</a></li>";
				$("#place").append(li);
				var point = new BMap.Point(data.place.results[i].location.lng,data.place.results[i].location.lat);
				var marker = new BMap.Marker(point);  // 创建标注
				marker.disableMassClear();
				var label = null;
				if(i+1>=10){
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(1, 4)
		            }); 
				}else{
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(5, 4)
		            }); 
				}
				label.setStyle({
		           background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
		        });
				marker.setLabel(label);//显示地理名称 a
				map.addOverlay(marker);              // 将标注添加到地图中
				points.push(data.place.results[i].location);
			}
			var view = map.getViewport(eval(points));
			var mapZoom = view.zoom; 
			var centerPoint = view.center; 
			map.centerAndZoom(centerPoint,mapZoom);
			if(pageNum==0){	
				$("#prompt").append("<div style='margin-left:260px'><a href='#' onclick='paging(0,true," + data.place.total + ")'>下一页></a></div>");
			}else if(pageNum+1>total/10){
				$("#prompt").append("<div style='margin-left:260px'><a href='#' onclick='paging(" + pageNum + ",false," + total + " )'><上一页</a></div>");
			}else{
				$("#prompt").append("<div style='margin-left:200px'><a href='#' onclick='paging(" + pageNum + ",false," + total + " )'><上一页</a>&nbsp;&nbsp;&nbsp;<a href='#' onclick='paging(" + pageNum + ",true," + total + ")'>下一页></a></div>");
			}
		}else {
			$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.info + "</div>");
		}
	},"json");
}	

//获取周边的管线地址
function getManageAddress(place){
	var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++){
        if(allOverlay[i] == "[object Marker]"){
        	 map.removeOverlay(allOverlay[i]);
        }
    }
    var points = [];
    var point = new BMap.Point(place.location.lng,place.location.lat);
    var marker = new BMap.Marker(point);  // 创建标注
	marker.disableMassClear();
	map.addOverlay(marker);// 将标注添加到地图中
	var json ='{"lat":' + place.location.lat + ',"lng":' + place.location.lng + '}' ;
	points.push(JSON.parse(json));
	$.post("/AddressController/getManageAddress",{
		"name":place.name,
		"lat":place.location.lat,
		"lng":place.location.lng,
		"pageNum":0
	},function(data){
		if(data.status==0){
			$("#prompt").html('<input id="five" onkeyup="updateStatus()" style="box-sizing:border-box;margin:10px 0 0 15px;padding-left:10px;font-size:15px;height:30px;width:300px;" type="text" placeholder="请输入前五级地址">');
			$("#prompt").append('<div style="margin:10px 0 0 15px;"><input id="six" onkeyup="updateStatus()" style="box-sizing:border-box;padding-left:10px;font-size:15px;height:30px;width:100px;" type="text" placeholder="六级地址">' +
					'<input id="seven" onkeyup="updateStatus()" style="box-sizing:border-box;margin-left:15px;padding-left:10px;font-size:15px;height:30px;width:100px;" type="text" placeholder="七级地址">' + 
					'<button id="submit" onclick="submit()" disabled style="margin-left:15px;height:30px;width:60px;background-color:#A9A9A9;border:none;color:white;font-size:15px;">判断</button></div>');
			$("#five").val(data.address);
			var ol = "<ol style='color:#4CAF50;padding-top:0' id='place'></ol>";
			$("#prompt").append(ol);
			for(var i=0;i<data.list.length;i++){
				var li = "<li><a style='color:#4CAF50' href='#'>" + data.list[i].address + "</a></li>";
				$("#place").append(li);
				var point = new BMap.Point(data.list[i].lng,data.list[i].lat);
				var marker = new BMap.Marker(point);  // 创建标注
				marker.disableMassClear();
				var label = null;
				if(i+1>=10){
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(1, 4)
		            }); 
				}else{
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(5, 4)
		            }); 
				}
				label.setStyle({
		           background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
		        });
				marker.setLabel(label);//显示地理名称 a
				map.addOverlay(marker);              // 将标注添加到地图中
				var json ='{"lat":' + data.list[i].lat + ',"lng":' + data.list[i].lng + '}' ;
				points.push(JSON.parse(json));
			}
			var view = map.getViewport(eval(points));
			var mapZoom = view.zoom; 
			var centerPoint = view.center; 
			map.centerAndZoom(centerPoint,mapZoom);
		}else{
			$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.info + "</div>");
		}
	},"json");
}

//修改“判断”按钮的状态
function updateStatus(){
	var five = $("#five").val();
	var six = $("#six").val();
	var seven = $("#seven").val();
	if(five!="" && six!="" && seven!=""){
		$("#submit").css("background-color","#4CAF50");
		$("#submit").removeAttr("disabled");
	}else{
		$("#submit").css("background-color","#A9A9A9");
		$("#submit").attr("disabled","true");
	}
}

//判断地址是否覆盖
function submit(){
	var address = $("#five").val() + $("#six").val() + $("#seven").val();
	var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++){
        if(allOverlay[i] == "[object Marker]"){
        	 map.removeOverlay(allOverlay[i]);
        }
    }
	$.post("/AddressController/checkAddress",{
		"address":address
	},function(data){
		if(data.status==0){
			$("#prompt").html("");
			$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.possibility + "</div>");
			var points = [];
			var point = new BMap.Point(data.address.result.location.lng,data.address.result.location.lat);
			var marker = new BMap.Marker(point);  // 创建标注
			marker.disableMassClear();
			var label = null;
			label = new BMap.Label("",{
                offset : new BMap.Size(5, 4)
            }); 
			label.setStyle({
	           background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
	        });
			marker.setLabel(label);//显示地理名称 a
			map.addOverlay(marker);     
			points.push(data.address.result.location);
			var view = map.getViewport(eval(points));
			var mapZoom = view.zoom; 
			var centerPoint = view.center; 
			map.centerAndZoom(centerPoint,mapZoom);
		}else{
			$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.info + "</div>");
		}
	},"json");
}

//显示盲区
$("#blind").click(function(){
	if(blindStatus == 1){
		if (document.createElement('canvas').getContext) {  // 判断当前浏览器是否支持绘制海量点
	        var points = [];  //盲区
	        for (var i = 0; i < addressArray.blindList.length; i++) {
	        	var point = new BMap.Point(addressArray.blindList[i].lng, addressArray.blindList[i].lat);
	        	point.name = addressArray.blindList[i].name;
	        	point.address = addressArray.blindList[i].address;
	        	points.push(point);
	        }
	        var options = {
	            size: BMAP_POINT_SIZE_BIG,
	            shape: BMAP_POINT_SHAPE_STAR,
	            color: '#00008B'
	        }
	        var pointCollection = new BMap.PointCollection(points, options);  // 初始化PointCollection
	        map.addOverlay(pointCollection);  // 添加Overlay
	        pointCollection.addEventListener('click', function (e) {
	        	var p=e.point;
	            var point = new BMap.Point(e.point.lng, e.point.lat);
	            var opts = {
	                width: 200,     // 信息窗口宽度
	                height: 150,     // 信息窗口高度
	                enableMessage: false//设置允许信息窗发送短息
	            };
	            var infowindow = new BMap.InfoWindow("名称：" + p.name + '<br>地址：' + p.address, opts);
	            map.openInfoWindow(infowindow, point);
	        });
	        $("#blind").text("隐藏");
	        blindStatus = 0;
	    } else {
	        alert('请在chrome、safari、IE8+以上浏览器查看本示例');
	    }
	}else{
		map.clearOverlays();
		$("#blind").text("显示盲区");
		$("#manage").text("显示管辖区域");
		blindStatus = 1;
		manageStatus = 1;
	}
})

//显示管辖区域
$("#manage").click(function(){
	if(manageStatus == 1){
		if (document.createElement('canvas').getContext) {  // 判断当前浏览器是否支持绘制海量点
	        var points = [];  // 管辖区域
	        for (var i = 0; i < addressArray.manageList.length; i++) {
	        	var point = new BMap.Point(addressArray.manageList[i].lng, addressArray.manageList[i].lat);
	        	point.name = addressArray.manageList[i].name;
	        	point.address = addressArray.manageList[i].address;
	        	points.push(point);
	        }
	        var options = {
	            size: BMAP_POINT_SIZE_BIG,
	            shape: BMAP_POINT_SHAPE_STAR,
	            color: '#4CAF50'
	        }
	        var pointCollection = new BMap.PointCollection(points, options);  // 初始化PointCollection
	        map.addOverlay(pointCollection);  // 添加Overlay
	        pointCollection.addEventListener('click', function (e) {
	        	var p=e.point;
	            var point = new BMap.Point(e.point.lng, e.point.lat);
	            var opts = {
	                width: 200,     // 信息窗口宽度
	                height: 150,     // 信息窗口高度
	                enableMessage: false//设置允许信息窗发送短息
	            };
	            var infowindow = new BMap.InfoWindow("名称：" + p.name + '<br>地址：' + p.address, opts);
	            map.oxpenInfoWindow(infowindow, point);
	        });
	        $("#manage").text("隐藏");
	        manageStatus = 0;
	    } else {
	        alert('请在chrome、safari、IE8+以上浏览器查看本示例');
	    }
	}else{
		map.clearOverlays();
		$("#manage").text("显示管辖区域");
		$("#blind").text("显示盲区");
		manageStatus = 1;
		blindStatus = 1;
	}
})

//单击获取点击的经纬度
map.addEventListener("click",function(e){
	var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++){
        if(allOverlay[i] == "[object Marker]"){
        	 map.removeOverlay(allOverlay[i]);
        }
    }
    var points = [];
    var point = new BMap.Point(e.point.lng,e.point.lat);
    var marker = new BMap.Marker(point);  // 创建标注
	marker.disableMassClear();
	map.addOverlay(marker);// 将标注添加到地图中
	var json ='{"lat":' + e.point.lat + ',"lng":' + e.point.lng + '}' ;
	points.push(JSON.parse(json));
	$.post("/AddressController/clickAddress",{
		"lat":e.point.lat,
		"lng":e.point.lng
	},function(data){
		$("#prompt").show();
		if(data.status==0){
			$("#prompt").html('<input id="five" onkeyup="updateStatus()" style="box-sizing:border-box;margin:10px 0 0 15px;padding-left:10px;font-size:15px;height:30px;width:300px;" type="text" placeholder="请输入前五级地址">');
			$("#prompt").append('<div style="margin:10px 0 0 15px;"><input id="six" onkeyup="updateStatus()" style="box-sizing:border-box;padding-left:10px;font-size:15px;height:30px;width:100px;" type="text" placeholder="六级地址">' +
					'<input id="seven" onkeyup="updateStatus()" style="box-sizing:border-box;margin-left:15px;padding-left:10px;font-size:15px;height:30px;width:100px;" type="text" placeholder="七级地址">' + 
					'<button id="submit" onclick="submit()" disabled style="margin-left:15px;height:30px;width:60px;background-color:#A9A9A9;border:none;color:white;font-size:15px;">判断</button></div>');
			$("#five").val(data.address);
			var ol = "<ol style='color:#4CAF50;padding-top:0' id='place'></ol>";
			$("#prompt").append(ol);
			for(var i=0;i<data.list.length;i++){
				var li = "<li><a style='color:#4CAF50' href='#'>" + data.list[i].address + "</a></li>";
				$("#place").append(li);
				var point = new BMap.Point(data.list[i].lng,data.list[i].lat);
				marker = new BMap.Marker(point);  // 创建标注
				marker.disableMassClear();
				var label = null;
				if(i+1>=10){
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(1, 4)
		            }); 
				}else{
					label = new BMap.Label(i+1, {
		                offset : new BMap.Size(5, 4)
		            }); 
				}
				label.setStyle({
		           background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
		        });
				marker.setLabel(label);//显示地理名称 a
				map.addOverlay(marker);              // 将标注添加到地图中
				var json ='{"lat":' + data.list[i].lat + ',"lng":' + data.list[i].lng + '}' ;
				points.push(JSON.parse(json));
			}
		}else{
			$("#prompt").html("<div style='height:100px;padding:10px 0 0 10px'>" + data.info + "</div>");
		}
		var view = map.getViewport(eval(points));
		var mapZoom = view.zoom; 
		var centerPoint = view.center; 
		map.centerAndZoom(centerPoint,mapZoom);
	},"json");
});
