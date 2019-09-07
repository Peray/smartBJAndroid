/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2017-09-21 11:01:25
 * @version $Id$
 */

//控制
var isMiddleOrPinchPressed = false;
var isScreenTilt = false;
var drawLineCount = 0;
var drawAreaCount = 0;
var intervalNum = 0;
var clusterData;


function InitRotate(){       

	handler.setInputAction(function(click){
		isMiddleOrPinchPressed = true;
		$('#qw')[0].style.transition="";
	}, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
	handler.setInputAction(function(click){
		isMiddleOrPinchPressed = false;
		$('#qw')[0].style.transition="transform 2000ms ease-out";
	}, Cesium.ScreenSpaceEventType.MIDDLE_UP);
	handler.setInputAction(function(move){
		if(isMiddleOrPinchPressed){
			var currentHeading = Cesium.Math.toDegrees(viewer.camera.heading);
			referToDirection(currentHeading);
			var currentPitch = Cesium.Math.toDegrees(viewer.camera.pitch) + 90;
			if(currentPitch<=10){
				$('#sightControl').text('3D');
				isScreenTilt = false;
			}else{
				$('#sightControl').text('2D');
				isScreenTilt = true;
			}
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	handler.setInputAction(function(click){
		isMiddleOrPinchPressed = true;
		$('#qw')[0].style.transition="";
	}, Cesium.ScreenSpaceEventType.PINCH_START);
	handler.setInputAction(function(click){
		isMiddleOrPinchPressed = false;
		$('#qw')[0].style.transition="transform 2000ms ease-out";
		if(intervalNum!=0){
			window.clearInterval(intervalNum);
			intervalNum = 0;
		}
	}, Cesium.ScreenSpaceEventType.PINCH_END);
	handler.setInputAction(function(move){
		if(isMiddleOrPinchPressed){
			var currentHeading = Cesium.Math.toDegrees(viewer.camera.heading);
			referToDirection(currentHeading);
			var currentPitch = Cesium.Math.toDegrees(viewer.camera.pitch) + 90;
			if(currentPitch<=10){
				$('#sightControl').text('3D');
				isScreenTilt = false;
			}else{
				$('#sightControl').text('2D');
				isScreenTilt = true;
			}
		}
	}, Cesium.ScreenSpaceEventType.PINCH_MOVE);

}

//控制视角
function sightControl(){
	var carto = viewer.camera.positionCartographic.clone();
	var lon = Cesium.Math.toDegrees(carto.longitude);
	var lat = Cesium.Math.toDegrees(carto.latitude);
	var range = viewer.camera.positionCartographic.height;

	var heading = viewer.camera.heading;
	//true倾斜 false还原
	if(isScreenTilt){
		var range = carto.height/Math.sin(Cesium.Math.toRadians(45))-carto.height;
		var height = carto.height;
		viewer.camera.moveUp(height + range);
		carto = viewer.camera.positionCartographic.clone();
		lon = Cesium.Math.toDegrees(carto.longitude);
		lat = Cesium.Math.toDegrees(carto.latitude);

		var positionWithoutHeight = new Cesium.Cartesian3.fromDegrees(lon,lat,height);
		var bound = new Cesium.BoundingSphere(positionWithoutHeight);
		var pitch = Cesium.Math.toRadians(-90);

		viewer.camera.flyToBoundingSphere(bound,{
			offset : new Cesium.HeadingPitchRange(heading, pitch, range),
			duration : 0
		});
		$('#sightControl').text('3D');
	}
	else{
		var range = carto.height;
		var positionWithoutHeight = new Cesium.Cartesian3.fromDegrees(lon,lat,0);
		var bound = new Cesium.BoundingSphere(positionWithoutHeight);
		var pitch = Cesium.Math.toRadians(-45);
		viewer.camera.flyToBoundingSphere(bound,{
			offset : new Cesium.HeadingPitchRange(heading, pitch, range),
			duration : 2
		});
		$('#sightControl').text('2D');
	}
	isScreenTilt = !isScreenTilt;
}


//放大缩小
function changeCamera(c){
	var height = viewer.camera.positionCartographic.height;
	var speed = height / 200.0;
	if(c == '+')
		intervalNum = setInterval(function(){
			viewer.camera.moveForward(speed);
		},10);
	if(c == '-')
		intervalNum = setInterval(function(){
			viewer.camera.moveBackward(speed);
		},10);
}
function stopChange(c){
	window.clearInterval(intervalNum);
}



//指南针图标旋转
function referToDirection(d){
	$('#qw')[0].style.transform = 'rotate('+(-d)+'deg)';
}


//指北
function LocateDirection(direction){
	var pitch = viewer.camera.pitch;
	var degree;
	if(direction == 'north')
		degree = 0;

	var heading = Cesium.Math.toRadians(degree);
	var carto = viewer.camera.positionCartographic.clone();
	var lon = Cesium.Math.toDegrees(carto.longitude);
	var lat = Cesium.Math.toDegrees(carto.latitude);
	var range = viewer.camera.positionCartographic.height;

	var positionWithoutHeight = new Cesium.Cartesian3.fromDegrees(lon,lat,0);
	var bound = new Cesium.BoundingSphere(positionWithoutHeight);
	viewer.camera.flyToBoundingSphere(bound,{
		offset : new Cesium.HeadingPitchRange(heading, pitch, range),
		duration : 2
	});
	referToDirection(degree);
}

//划线
function DrawLine(){
	var distPosCarte = [];
	var distLine = viewer.entities.add({
		id : 'polyline' + drawLineCount,
		polyline : {
			positions : [], 
			width: 2,
			material: new Cesium.PolylineOutlineMaterialProperty({
				color: Cesium.Color.YELLOW,
				outlineWidth: 0
			})
		}
	});
	var lastTime;
	var scene = viewer.scene; 
	var ellipsoid = scene.globe.ellipsoid; 
	var drawFlag = true;
	var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	
	handler.setInputAction(function(click) {
		var currentTime = new Date().getTime();
		//判断是否连续点击
		if(lastTime != undefined)
			if((currentTime - lastTime)<200){
				handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
				drawFlag = false;
			}
		
		if(drawFlag){
			var cartesian = viewer.camera.pickEllipsoid(click.position, ellipsoid); 
			if (cartesian) {
				var pointCarto = ellipsoid.cartesianToCartographic(cartesian);
				pointCarto.height+=2.0;
				var pointCarte = ellipsoid.cartographicToCartesian(pointCarto);
				viewer.entities.add({
					id : 'polylinePoint' + drawLineCount,
					position : pointCarte,
					point : {
						pixelSize : 8,
						outlineWidth : 0,
						color :  Cesium.Color.WHITE.withAlpha(1)
					}
				});
				distPosCarte.push(pointCarte);
				var leng = distPosCarte.length;
				drawLineCount++;
				if(leng >= 2) {
					var distance = Cesium.Cartesian3.distance(distPosCarte[leng-1], distPosCarte[leng-2]).toFixed(2);
					if(distance != 0.0){
						distLine.polyline.positions = distPosCarte; 
						
						var entity = viewer.entities.add({
							id : 'polylineLabel' + drawLineCount,
							label : {
								show : false,
								outlineWidth : 4,
								fillColor : Cesium.Color.YELLOW.withAlpha(1),
								outlineColor : Cesium.Color.BLACK.withAlpha(1),
								font : '15px sans-serif',
								style : Cesium.LabelStyle.FILL_AND_OUTLINE
							}
						});
						
						var loPosition = new Cesium.Cartesian3();
						//使长度显示在线中间
						loPosition.x = (distPosCarte[leng-1].x + distPosCarte[leng-2].x)/2.0;
						loPosition.y = (distPosCarte[leng-1].y + distPosCarte[leng-2].y)/2.0;
						loPosition.z = (distPosCarte[leng-1].z + distPosCarte[leng-2].z)/2.0;
						entity.position = loPosition;
						entity.label.show = true;					
						entity.label.text = distance +'m' ;
					}
				}
			}
			//记录点击事件
			lastTime = currentTime;
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

//划面
function DrawArea(){
	var distPosCarte = [];
	var distArea = viewer.entities.add({
		id : 'polygon' + drawAreaCount,
		polygon : {
			hierarchy : [], 
			extrudedHeight : 0,
			material : Cesium.Color.YELLOW.withAlpha(0.5),
			outline:true,
			outlineColor:Cesium.Color.BLACK,
			outlineWidth:2.0
		}
	});
	var distLabel = viewer.entities.add({
		id : 'polygonLabel' + drawAreaCount,
		label : {
			show : false,
			outlineWidth : 4,
			fillColor : Cesium.Color.YELLOW.withAlpha(1),
			outlineColor : Cesium.Color.BLACK.withAlpha(1),
			font : '15px sans-serif',
			style : Cesium.LabelStyle.FILL_AND_OUTLINE
		}
	});
	var lastTime;
	var scene = viewer.scene; 
	var ellipsoid = scene.globe.ellipsoid; 
	var drawFlag = true;
	var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	
	handler.setInputAction(function(click) {
		var currentTime = new Date().getTime();
		//判断是否连续点击
		if(lastTime != undefined)
			if((currentTime - lastTime)<200){
				handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
				drawFlag = false;
			}
		
		if(drawFlag){
			var cartesian = viewer.camera.pickEllipsoid(click.position, ellipsoid); 
			if (cartesian) {
				var pointCarto = ellipsoid.cartesianToCartographic(cartesian);
				pointCarto.height+=2.0;
				var pointCarte = ellipsoid.cartographicToCartesian(pointCarto);
				viewer.entities.add({
					id : 'polygonPoint' + drawAreaCount,
					position : pointCarte,
					point : {
						pixelSize : 8,
						outlineWidth : 0,
						color :  Cesium.Color.WHITE.withAlpha(1)
					}
				});
				distPosCarte.push(pointCarte);
				var leng = distPosCarte.length;
				drawAreaCount++;
				if(leng >= 3) {
					distArea.polygon.hierarchy = distPosCarte; 
					var loPosition = new Cesium.Cartesian3();
					var distPosCarteTotalX = 0;
					var distPosCarteTotalY = 0;
					var distPosCarteTotalZ = 0;
					//使面积显示在中间
					for(var j=0;j<distPosCarte.length;j++){
						distPosCarteTotalX = distPosCarteTotalX + distPosCarte[j].x;
						distPosCarteTotalY = distPosCarteTotalY + distPosCarte[j].y;
						distPosCarteTotalZ = distPosCarteTotalZ + distPosCarte[j].z;
					}
					loPosition.x = (distPosCarteTotalX)/distPosCarte.length;
					loPosition.y = (distPosCarteTotalY)/distPosCarte.length;
					loPosition.z = (distPosCarteTotalZ)/distPosCarte.length;
					distLabel.position = loPosition;
					distLabel.label.show = true;					
					var area = CalculateArea(distPosCarte);
					distLabel.label.text = area + '㎡' ;
				}
			}
			//记录点击事件
			lastTime = currentTime;
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function CalculateArea(vectorPoints){  
	// 用两点间的距离公式算出三边长a,b,c,再用海伦公式计算.
	// 面积S=根号(p*(p-a)*(p-b)*(p-c)) 其中p=(a+b+c)/2.
	var s = 0;
	for(var i=0;i<vectorPoints.length-2;i++){
		var va = Cesium.Cartesian3.distance(vectorPoints[i], vectorPoints[i+1]);
		var vb = Cesium.Cartesian3.distance(vectorPoints[i], vectorPoints[i+2]);
		var vc = Cesium.Cartesian3.distance(vectorPoints[i+1], vectorPoints[i+2]);
		var vp =(va+vb+vc)/2;
		var vpa=(vp-va);
		var vpb =(vp-vb);
		var vpc =(vp-vc);
		var s3 = Math.sqrt(vp*vpa*vpb*vpc);
		s = s + s3;
	}
	s = s.toFixed(4);
	return s;
}  

//清除
function CleanUpDraws(){
	var entities = viewer.entities.values;
	for(var t=0;t<10;t++){//多次清除
		for(var i=0;i<entities.length;i++){
			var id = entities[i].id;
			if(id!=undefined){
				if(id.indexOf('polyline')>=0||id.indexOf('polygon')>=0)
					viewer.entities.removeById(id);
			}
		}
	}
	drawLineCount = 0;
	drawAreaCount = 0;
}








function loadGeojsonWithCluster(url){
		var dataSourcePromise = viewer.dataSources.add(Cesium.GeoJsonDataSource.load(url));
		dataSourcePromise.then(function(dataSource) {
			clusterData = dataSource;
			
			var entities = dataSource.entities.values;
			for(var o = 0;o < entities.length; o++){
				//loading图标
				entities[o].billboard.image = './img/loading.png';
			}
			
			var pixelRange = 20;//设置聚合距离
			var minimumClusterSize = 2;//聚合起始数
			var enabled = true;
			
			dataSource.clustering.enabled = enabled;
			dataSource.clustering.pixelRange = pixelRange;
			dataSource.clustering.minimumClusterSize = minimumClusterSize;
			
			//聚合图标
			var pinBuilder = new Cesium.PinBuilder();
			var pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
			var pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
			var pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
			var pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
			var pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();
			var singleDigitPins = new Array(10 - minimumClusterSize);
			for (var i = minimumClusterSize; i < 10; i++) {
				singleDigitPins[i] = pinBuilder.fromText('' + i, Cesium.Color.VIOLET, 48).toDataURL();
			}
			
			//聚合后改变图标
			dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
				cluster.label.show = false;
				cluster.billboard.show = true;
				cluster.billboard.id = cluster.label.id;
				cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
	
				if (clusteredEntities.length >= 50) {
					cluster.billboard.image = pin50;
				} else if (clusteredEntities.length >= 40) {
					cluster.billboard.image = pin40;
				} else if (clusteredEntities.length >= 30) {
					cluster.billboard.image = pin30;
				} else if (clusteredEntities.length >= 20) {
					cluster.billboard.image = pin20;
				} else if (clusteredEntities.length >= 10) {
					cluster.billboard.image = pin10;
				} else if(clusteredEntities.length >= minimumClusterSize){
					cluster.billboard.image = singleDigitPins[clusteredEntities.length];
				}
			});
		});
	}
	function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL // return dataURL.replace("data:image/png;base64,", ""); 
    } 
	function refreshDataSourcesImage(){
		var entities = clusterData.entities.values;
		var load = [];
		entities.forEach(function(value,index,array){
			load.push(Cesium.loadImage(value.properties.icon.getValue()));
		});
		Cesium.when.all(load).then(function(images) {
			images.forEach(function(value,index,array){
				value.width = 50;
				value.height = 50;
				var base64 = getBase64Image(value);
				entities[index].billboard.image = base64;
			});
		});
	}


function addpic(){
	var picjson = {
		"type": "FeatureCollection",
		"features": [ ]
	}
	$.ajax('http://192.168.10.17:81/Smartbj/wb!mapWbAll.action?jsoncallback=?',{
		data:{},
		type:'get',
		dataType:"jsonp",
		success:function(ret){
			ret = eval(ret);
			var value=[];
			for(var i=0; i<ret.result.list.length; i++){
				value.push({
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [
						ret.result.list[i].lng,
						ret.result.list[i].lat
						]
					},
					"properties": {
						"title": "pic",
						"wbContent":ret.result.list[i].wbContent,
						"userName":ret.result.list[i].userName,
						"address":ret.result.list[i].address,
						"time":ret.result.list[i].fbTime.time,
						"icon": "http://192.168.10.20:81/Smartbj/share"+ret.result.list[i].onlinePath.split(',')[0]
					}
				})
			}
			picjson.features=value;
			loadGeojsonWithCluster(picjson);
			refreshDataSourcesImage();
		},
		error: function(ret, ret1, ret2) {
			debugger;
		}
	});
}