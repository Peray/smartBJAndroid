﻿var arraysp=[];//绘制的点
var arraysp_2=[];//绘制的点
var drawEntity;//绘制的线
var drawPolygon;
var drawPolygon2;
var drawEntity2;
var _tmpDrawEntity;
var _tmpDrawEntityPOINT;
var acceptLeftClick=true;
var globeRadiu=[];
var drawPoint=[];
var shapeType=1;
var yyt;//鹰眼
var delay=0;
var preRectangle;//上一个rectangle
var exportPoint=new Object();
var exportLine=new Object();
var exportpolygon=new Object();
var infoboxs ;
var saveGeoJsonData=new Object();
var singleDataSource;
var tableTopName=[];
viewer2ImageLayers.push(new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
        layer: "tdtVectLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false
    }));
viewer2ImageLayers.push(new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
    layer: "tdtAnnoLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible"
}));
var viewer2 = new Cesium.Viewer("infoboxce", {
    timeline: false,
    animation: false,
    baseLayerPicker: false, // Only showing one layer in this demo
    //useDefaultRenderLoop : false,
    homeButton:false,
    fullscreenButton: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
	sceneMode : Cesium.SceneMode.SCENE2D,
	imageryProvider :viewer2ImageLayers[0]
});
viewer2.imageryLayers.addImageryProvider(viewer2ImageLayers[1]);
viewer2.scene.globe.enableLighting = false;
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url: '//assets02.agi.com/stk-terrain/world',
    credit: '',
    requestWaterMask: true
});
viewer2.terrainProvider = terrainProvider;
viewer2.scene.globe.depthTestAgainstTerrain = false;
viewer2.scene.frameState.creditDisplay._imageContainer.style.display = 'none';
viewer2.scene.frameState.creditDisplay._textContainer.style.display = 'none';
viewer2.scene.skyBox.show = false;
viewer2.scene.sun.show = false;
viewer2.scene.moon.show = false;
viewer2.scene.skyAtmosphere.show = false;

var startPos = {
    "duration": 1,
     "direction":{"x":0,"y":0,"z":-1},
	 "up":{"x":0,"y":1,"z":0},
	 "destination":{"x":-1053157.0375716842,"y":5060273.457827258,"z":3802864.9210234336}
};
viewer2.camera.flyTo({
    destination: startPos.destination,
    duration: startPos.duration
});
window.document.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
        var saveCamPos = {
            direction: viewer2.camera._direction,
            up: viewer2.camera._up,
            position: viewer2.camera._position
        }
        console.log(JSON.stringify(saveCamPos));
    }
});
viewer.scene.preRender.addEventListener(function(scene, time) {
	if(oprMaxMap)
	{
		var _rect;
		if(!doubleCompareGlobe)
		{
			if(viewer_2D)
			{
				var ellipsoid = viewer.scene.globe.ellipsoid;
				var cer1 = new Cesium.Cartesian2(0,0);
				var cartesian1= viewer.camera.pickEllipsoid(cer1, ellipsoid);
				if(cartesian1)
				{
					var cartographic1 = ellipsoid.cartesianToCartographic(cartesian1);
					var longitudeString = Cesium.Math.toDegrees(cartographic1.longitude);
					var latitudeString = Cesium.Math.toDegrees(cartographic1.latitude);
					var haiba =viewer.scene.globe.getHeight(cartographic1);
					var cer2 = new Cesium.Cartesian2($('#cesiumContainer').width(),$('#cesiumContainer').height());
					var cartesian2= viewer.camera.pickEllipsoid(cer2, ellipsoid);
					if(cartesian2)
					{
						var cartographic2 = ellipsoid.cartesianToCartographic(cartesian2);
						var longitudeString2 = Cesium.Math.toDegrees(cartographic2.longitude);
						var latitudeString2 = Cesium.Math.toDegrees(cartographic2.latitude);
						var haiba2 =viewer.scene.globe.getHeight(cartographic2);
						_rect=Cesium.Rectangle.fromDegrees(longitudeString,latitudeString2,longitudeString2,latitudeString);
					}
					
				}
				
			}
			else
			{
				_rect = viewer.camera.computeViewRectangle();	
			}
			if(_rect)
			{
				if(preRectangle)
				{
					delay++;
					if(Cesium.Rectangle.equals(_rect,preRectangle))
					{
						
					}
					else
					{
						if(delay>3)
						{
							delay=0;
							var west,south,east,north;
							if(_rect)
							{
								
								 west = Cesium.Math.toDegrees(_rect.west);
								 south = Cesium.Math.toDegrees(_rect.south);
								 east = Cesium.Math.toDegrees(_rect.east);
								 north = Cesium.Math.toDegrees(_rect.north);
								 if(yyt)
								 {
									 var ents=viewer2.entities.getById(yyt.id);
									 viewer2.entities.remove(ents);
								 }
								 var redPolygon = viewer2.entities.add({  
										name : 'tt',  
										polyline : { 
											positions : Cesium.Cartesian3.fromDegreesArray([west, south,  
																							east, south,  
																							east, north,  
																							west, north,
																							west, south,
																							east, south
																							]),  
											 width : 5,
											material : Cesium.Color.RED  
										}  
									});  
								yyt=redPolygon;
							}
						}
						
					}
				}
				preRectangle=_rect;
			}
			
			var ellipsoid = viewer.scene.globe.ellipsoid;
			var wgs84 = viewer.camera.positionCartographic;
			var _lon=Cesium.Math.toDegrees(wgs84.longitude);
			var _lat=Cesium.Math.toDegrees(wgs84.latitude);
			//console.log(wgs84.height);
			viewer2.camera.setView({
				destination : Cesium.Cartesian3.fromDegrees(_lon, _lat, wgs84.height+(30000+wgs84.height*3)),
				orientation: {
					up: viewer2.camera._up,
					direction: viewer2.camera._direction
				},
				duration: 1
			});	
		}
		else
		{
			if(yyt)
			 {
				 var ents=viewer2.entities.getById(yyt.id);
				 viewer2.entities.remove(ents);
			 }
			 yyt=null;
			if(viewer_2D)
			{
				var ellipsoid = viewer.scene.globe.ellipsoid;
				var wgs84 = viewer.camera.positionCartographic;
				
				var _lon=Cesium.Math.toDegrees(wgs84.longitude);
				var _lat=Cesium.Math.toDegrees(wgs84.latitude);
				viewer2.camera.setView({
					destination : Cesium.Cartesian3.fromDegrees(_lon, _lat, wgs84.height),
					orientation: {
						up: viewer2.camera._up,
						direction: viewer2.camera._direction
					},
					duration: 1
				});
				
			}
			else
			{
				viewer2.camera.setView({
					destination: viewer.camera._position,
					orientation: {
						up: viewer2.camera._up,
						direction: viewer2.camera._direction

					},
					duration: startPos.duration
				});
			}
		}
		
		
	}
});
var preheight=2000;
viewer2.scene.preRender.addEventListener(function(scene, time) {
	if(!oprMaxMap)
	{
		if(!doubleCompareGlobe)
		{
			
		}
		else
		{
			if(viewer2_2D)
			{
				var ellipsoid = viewer2.scene.globe.ellipsoid;
				var wgs84 = viewer2.camera.positionCartographic;
				var haiba =viewer.scene.globe.getHeight(wgs84);
				var _lon=Cesium.Math.toDegrees(wgs84.longitude);
				var _lat=Cesium.Math.toDegrees(wgs84.latitude);
				var sheight =0;
				if(wgs84.height>haiba)
				{
					sheight=wgs84.height;
					preheight=wgs84.height;
				}
				else
				{
					sheight=haiba+10;
				}
				viewer.camera.setView({
					destination : Cesium.Cartesian3.fromDegrees(_lon, _lat, sheight),
					orientation: {
						up: viewer.camera._up,
						direction: viewer.camera._direction
					},
					duration: 1
				});
				
				
			}
			else
			{
				viewer.camera.setView({
					destination: viewer2.camera._position,
					orientation: {
						up: viewer.camera._up,
						direction: viewer.camera._direction
					},
					duration: startPos.duration
				});
				
			}
		}
		
		
	}
});
handler1 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var handler_1 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var handler2 = new Cesium.ScreenSpaceEventHandler(viewer2.scene.canvas);


handler2.setInputAction(function (movement) {
	oprMaxMap=false;
},Cesium.ScreenSpaceEventType.MOUSE_MOVE );
handler2.setInputAction(function (movement) {
	middleDown2=true;
},Cesium.ScreenSpaceEventType.MIDDLE_DOWN );
handler2.setInputAction(function (movement) {
	middleDown2=false;
},Cesium.ScreenSpaceEventType.MIDDLE_UP );
// handler2.setInputAction(function (movement) {
	// if(viewer2_2D)
	// {
		// viewer2.scene.morphTo3D(0);
	// }
	// else
	// {
		// viewer2.scene.morphTo2D(0);
	// }
	// viewer2_2D=!viewer2_2D;
// },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );
function to3D()
{
	viewer.scene.morphTo3D(0);
	viewer_2D=false;
}
function to2D()
{
	viewer.scene.morphTo2D(0);
	viewer_2D=true;
}
handler_1.setInputAction(function (movement) {
	oprMaxMap=true;
},Cesium.ScreenSpaceEventType.MOUSE_MOVE ); 
var needGhost=false;
var isLoadviewer2=false;
infoboxs =$('#infobox')[0].innerHTML;
handler_1.setInputAction(function (movement) {
	debugger;
	var pickedObjects = viewer.scene.drillPick(movement.position);
	if(pickedObjects.length>0){
		var properties =pickedObjects[0].id.properties;
		selectedTarget(properties['CUSTOMID'].getValue());
		var inner="";

		for(var i=0;i<properties.propertyNames.length;i++){
			
			console.log(properties.propertyNames[i]+":"+properties[properties.propertyNames[i]].getValue());
			//inner+=properties.propertyNames[i]+":"+properties[properties.propertyNames[i]].getValue();

			inner+=`<tr><td>${properties.propertyNames[i]}</td><td>${properties[properties.propertyNames[i]].getValue()}</td></tr>`;

		}
		Main.s.Toggles(true);
		$('#infoboxce').hide();
		$('#infoboxinfo').show();
		//$('#infoboxinfo')[0].innerHTML =inner;
		$("#tbr").html(inner);
	}
	else
	{
		if(singleDataSource)
		{
			var s=viewer.dataSources.remove(singleDataSource);
			singleDataSource=null;
		}
		Main.s.Toggles(false);
		$('#infoboxce').show();
		$('#infoboxinfo').hide();
	}
},Cesium.ScreenSpaceEventType.LEFT_CLICK);
handler1.setInputAction(function (movement) {
	handler1.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	handler1.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	if(_tmpDrawEntity)
	{
		var isEntity=viewer.entities.getById(_tmpDrawEntity.id);
		viewer.entities.remove(isEntity);
	}
	if(_tmpDrawEntityPOINT)
	{
		var isEntity=viewer.entities.getById(_tmpDrawEntityPOINT.id);
		viewer.entities.remove(isEntity);
	}
	var ellipsoid = viewer2.scene.globe.ellipsoid;
	//var wgs84 = ellipsoid.cartesianToCartographic(viewer2.camera.positionCartographic);
	var wgs84 = viewer.camera.positionCartographic;
	var _lon=Cesium.Math.toDegrees(wgs84.longitude);
	var _lat=Cesium.Math.toDegrees(wgs84.latitude);
	var _up =viewer.camera._up;
	var _direction =viewer.camera._direction;
	if(needGhost)
	{
		viewer.scene.morphTo3D(0);
		viewer_2D=false;
		needGhost=false;
	}
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(_lon, _lat, wgs84.height),
		orientation: {
			up:_up,
			direction: _direction
		},
		duration: 1
	});
	
	
	if(!isLoadviewer2)
	{
		if(doubleCompareGlobe)
		{
			if(arraysp_2.length>0 && shapeType==1)
			{
				var _drawEntity = viewer2.entities.add({  
					name : '画线', 
					polyline : {
						positions :Cesium.Cartesian3.fromDegreesArrayHeights(arraysp_2),  
						width : 1,
						material : Cesium.Color.RED 
					}
				}); 
				drawEntity2=_drawEntity;
			}
			
			if(arraysp_2.length>0 && shapeType==2)
			{
				var _drawPolygon = viewer2.entities.add({  
						name : '贴着地表的多边形',  
						polygon : {  
							hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(arraysp_2),
							material : new Cesium.Color(1.0,0.0,0.0,0.5)  
						}
					});
				drawPolygon2 =_drawPolygon;
			}
			for(var i=0;i<drawPoint.length;i++)
			{
				var isEntity=viewer.entities.getById(drawPoint[i].id);
				viewer2.entities.add(isEntity);
			}
			
			
			isLoadviewer2=true;
		}
		
	}
	
},Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );
function clearT()
{
	handler1.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	handler1.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	if(_tmpDrawEntity)
	{
		var isEntity=viewer.entities.getById(_tmpDrawEntity.id);
		viewer.entities.remove(isEntity);
	}
	if(_tmpDrawEntityPOINT)
	{
		var isEntity=viewer.entities.getById(_tmpDrawEntityPOINT.id);
		viewer.entities.remove(isEntity);
	}
	areaAll=0;
	for(var i=0;i<drawPoint.length;i++)
	{
		var isEntity=viewer.entities.getById(drawPoint[i].id);
		viewer.entities.remove(isEntity);
		isEntity=viewer2.entities.getById(drawPoint[i].id);
		viewer2.entities.remove(isEntity);
	}
	drawPoint=[];
	arraysp=[];//绘制的点
	arraysp_2=[];
	if(drawEntity)
	{
		var isEntity=viewer.entities.getById(drawEntity.id);
		viewer.entities.remove(isEntity);
	}
	drawEntity=null;//绘制的线
	_tmpDrawEntity=null;
	_tmpDrawEntityPOINT=null;
	globeRadiu=[];
	if(drawPolygon)
	{
		var isEntitys=viewer.entities.getById(drawPolygon.id);
		viewer.entities.remove(isEntitys);
	}
	if(drawPolygon2)
	{
		var isEntitys=viewer2.entities.getById(drawPolygon2.id);
		viewer2.entities.remove(isEntitys);
	}
	drawPolygon2=null;
	if(drawEntity2)
	{
		var isEntity=viewer2.entities.getById(drawEntity2.id);
		viewer2.entities.remove(isEntity);
	}
	drawEntity2=null;
	drawPolygon=null;

	if(needGhost)
	{
		viewer.scene.morphTo3D(0);
		viewer_2D=false;
		needGhost=false;
	}
	
}
viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
function exchangeMap()
{
	if((viewer_2D && viewer2_2D) || (!viewer_2D && !viewer2_2D))
	{
		secondExchangeMap();
		return;
	}
	if((!viewer_2D && viewer2_2D) || (viewer_2D && !viewer2_2D))
	{
		viewer_2D=!viewer_2D;
		viewer2_2D=!viewer2_2D;
		secondExchangeMap();
		return;
	}
}
function secondExchangeMap()
{

	var wgs84 = viewer2.camera.positionCartographic;
	var _lon=Cesium.Math.toDegrees(wgs84.longitude);
	var _lat=Cesium.Math.toDegrees(wgs84.latitude);
	var _up =viewer2.camera._up;
	var _direction =viewer2.camera._direction;
	var _heading=viewer2.camera.heading;
	var _pitch=viewer2.camera.pitch;
	var _roll=viewer2.camera.roll;
	

	var wgs842 = viewer.camera.positionCartographic;
	var _lon2=Cesium.Math.toDegrees(wgs842.longitude);
	var _lat2=Cesium.Math.toDegrees(wgs842.latitude);
	var _up2 =viewer.camera._up;
	var _direction2 =viewer.camera._direction;
	var _heading2=viewer.camera.heading;
	var _pitch2=viewer.camera.pitch;
	var _roll2=viewer.camera.roll;
	
	if(viewer.scene.mode ==3)
	{
		if(viewer_2D)
		{
			viewer.scene.morphTo2D(0);
			
		}
		else
		{
			
		}
	}
	else
	{
		if(viewer_2D)
		{
			
		}
		else
		{
			viewer.scene.morphTo3D(0);
		}
	}
	
	
	if(viewer2.scene.mode ==3)
	{
		if(viewer2_2D)
		{
			viewer2.scene.morphTo2D(0);
		}
		else
		{
			
		}
	}
	else
	{
		if(viewer2_2D)
		{
			
		}
		else
		{
			viewer2.scene.morphTo3D(0);
		}
	}
	viewer.camera.flyTo({
		destination : Cesium.Cartesian3.fromDegrees(_lon, _lat, wgs84.height),
		orientation: {
			heading :_heading,
			pitch : _pitch,
			roll : _roll
		},
		duration: 1
	});
	viewer2.camera.flyTo({
		destination : Cesium.Cartesian3.fromDegrees(_lon2, _lat2, wgs842.height),
		orientation: {
			heading :_heading2,
			pitch : _pitch2,
			roll : _roll2
		},
		duration: 1
	});
	//更换图层信息
	//viewer.imageryLayers.destroy();
	//viewer2.imageryLayers.destroy();
	for(var i=0;i<viewer2ImageLayers.length;i++)
	{
		if(!changeArray)
			viewer.imageryLayers.addImageryProvider(viewer2ImageLayers[i]);
		else
			viewer2.imageryLayers.addImageryProvider(viewer2ImageLayers[i]);	
	}
	for(var i=0;i<viewerImageLayers.length;i++)
	{
		
		if(!changeArray)
			viewer2.imageryLayers.addImageryProvider(viewerImageLayers[i]);
		else
			viewer.imageryLayers.addImageryProvider(viewerImageLayers[i]);

	}
	//开始移除
	var _len=0;
	if(!changeArray)
		_len=viewer2ImageLayers.length;
	else
		_len=viewerImageLayers.length;
	//console.log(viewer.imageryLayers._layers.length);
	for(var i=0;i<((viewer.imageryLayers._layers.length)-_len-1);i++)
	{
		viewer.imageryLayers.remove(viewer.imageryLayers._layers[i]);
		i = i-1;
	}
	if(!changeArray)
		_len=viewerImageLayers.length;
	else
		_len=viewer2ImageLayers.length;
	for(var i=0;i<((viewer2.imageryLayers._layers.length)-_len-1);i++)
	{
		viewer2.imageryLayers.remove(viewer2.imageryLayers._layers[i]);
		i = i-1;
	}
	changeArray=!changeArray;

}
var indexqq=0;
var areaAll=0;

function getPosition(shape) {
		isLoadviewer2=false;
		if(drawPolygon2)
		{
			var isEntitys=viewer2.entities.getById(drawPolygon2.id);
			viewer2.entities.remove(isEntitys);
		}
		drawPolygon2=null;
		if(drawEntity2)
		{
			var isEntity=viewer2.entities.getById(drawEntity2.id);
			viewer2.entities.remove(isEntity);
		}
		drawEntity2=null;
		// if(!viewer_2D)
		// {
			// viewer.scene.morphTo2D(0);
			// needGhost=true;
			// viewer_2D=true;
		// }
		shapeType=shape;
		areaAll=0;
		for(var i=0;i<drawPoint.length;i++)
		{
			var isEntity=viewer.entities.getById(drawPoint[i].id);
			viewer.entities.remove(isEntity);
		}
		drawPoint=[];
		arraysp=[];//绘制的点
		arraysp_2=[];
		if(drawEntity)
		{
			var isEntity=viewer.entities.getById(drawEntity.id);
			viewer.entities.remove(isEntity);
		}
		drawEntity=null;//绘制的线
		_tmpDrawEntity=null;
		_tmpDrawEntityPOINT=null;
		globeRadiu=[];
		
		if(drawPolygon)
		{
			var isEntitys=viewer.entities.getById(drawPolygon.id);
			viewer.entities.remove(isEntitys);
		}
		drawPolygon=null;
        //得到当前三维场景
        var scene = viewer.scene;
        //得到当前三维场景的椭球体
        var ellipsoid = scene.globe.ellipsoid;
        var entity = viewer.entities.add({
            label : {
                show : false
            }
        });
        var longitudeString = null;
        var latitudeString = null;
        var height = null;
		var haiba=null;
        var cartesian = null;
		viewerDrawStart=true;//绘制开始
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        handler1.setInputAction(function(movement) {
			if(acceptLeftClick)
			{
				//console.log(scene.pickTranslucentDepth);
				var pickedObjects = scene.drillPick(movement.position)
				//通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
				cartesian2 = viewer.camera.pickEllipsoid(movement.position, ellipsoid);//scene.pickPosition(movement.position)
				cartesian2 =scene.pickPosition(movement.position);
				var smp= viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
				if(smp)
				{
					cartesian2=smp;
				}
				var cartographic2 = ellipsoid.cartesianToCartographic(cartesian2);
				
				longitudeString = Cesium.Math.toDegrees(cartographic2.longitude);
				latitudeString = Cesium.Math.toDegrees(cartographic2.latitude);
				haiba =viewer.scene.globe.getHeight(cartographic2);
				globeRadiu.push(cartesian2);
				
				arraysp.push(longitudeString);
				arraysp.push(latitudeString);
				arraysp.push(haiba);
				arraysp_2.push(longitudeString);
				arraysp_2.push(latitudeString);
				arraysp_2.push(haiba);
				var _drawEntity;
				if(arraysp.length>0 && shape==1)
				{
					_drawEntity = viewer.entities.add({  
						name : '画线', 
						polyline : {
							positions :Cesium.Cartesian3.fromDegreesArrayHeights(arraysp),  
							width : 1,
							material : Cesium.Color.RED 
						}
					}); 
					
				}
				if(globeRadiu.length>=3)
				{
					areaAll +=getcos();
				}
				if(arraysp.length>0 && shape==2)
				{
					if(drawPolygon)
					{
						var isEntitys=viewer.entities.getById(drawPolygon.id);
						viewer.entities.remove(isEntitys);
					}
					var _drawPolygon = viewer.entities.add({  
							name : '贴着地表的多边形',  
							polygon : {  
								hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(arraysp),
								material : new Cesium.Color(1.0,0.0,0.0,0.5)  
							}
						});   
					drawPolygon=_drawPolygon;
				}
				if(drawEntity)
				{
					viewer.entities.remove(drawEntity);
				}
				var textContext="";
				if(shapeType==1)
				{
					textContext=" "+getDistance().toFixed(2)+"米";
				}
				else
				{
					if(arraysp.length/3>2)
						textContext=" "+areaAll.toFixed(2)+"平方米";
				}
				drawEntity=_drawEntity;
				var drawPoint_s={
					name : 'Citizens Bank Park',  
					position : Cesium.Cartesian3.fromDegrees( longitudeString,latitudeString,haiba ),  
					point : { //点  
						pixelSize : 5,  
						color : Cesium.Color.RED,  
						outlineColor : Cesium.Color.ORANGE,  
						outlineWidth : 2  
					},  
					label : { //文字标签  
						text : textContext,  
						fillColor:Cesium.Color.ORANGERED,
						outlineColor:Cesium.Color.WHITE,
						font : '10pt monospace',  
						backgroundColor:new Cesium.Color(0.165, 0.165, 0.165, 0.1),
						style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
						outlineWidth : 2,  
						verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
						pixelOffset : new Cesium.Cartesian2( 0, -9 )   //偏移量  
					}
				};
				var drawPoint_=viewer.entities.add(drawPoint_s); 
				drawPoint.push(drawPoint_);
				
				//获取相机高度
				// height = Math.ceil(viewer.camera.positionCartographic.height);
				// entity.position = cartesian;
				// entity.label.show = false;
				// entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + haiba + ')' ;
					//console.log(entity.label.text);

			}
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		handler1.setInputAction(function (movement) {
			oprMaxMap=true;
			var scene = viewer.scene;
			var ellipsoid = scene.globe.ellipsoid;
			 if(viewerDrawStart)//实时绘制
			 {
				//console.log("绘制");
				//console.log(scene.pickTranslucentDepth);
				
				var pickedObjects = scene.drillPick(movement.endPosition)
				cartesian2 = viewer.camera.pickEllipsoid(movement.startPosition, ellipsoid);
				
				var smp= viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);
				if(smp)
				{
					cartesian2=smp;
				}
				
				var cartographic2 = ellipsoid.cartesianToCartographic(cartesian2);
				longitudeString = Cesium.Math.toDegrees(cartographic2.longitude);
				latitudeString = Cesium.Math.toDegrees(cartographic2.latitude);
				haiba =viewer.scene.globe.getHeight(cartographic2);
				var drawArray=[];
				if(arraysp.length>0 && shape==1)
				{
					drawArray.push(arraysp[arraysp.length-3]);
					drawArray.push(arraysp[arraysp.length-2]);
					drawArray.push(arraysp[arraysp.length-1]);
					drawArray.push(longitudeString);
					drawArray.push(latitudeString);
					drawArray.push(haiba);
					if(_tmpDrawEntity)
					{
						var isEntity=viewer.entities.getById(_tmpDrawEntity.id);
						var getvalues=isEntity.polyline.positions=Cesium.Cartesian3.fromDegreesArrayHeights(drawArray);
						//console.log();
					}
					else
					{
						var sdrawEntity = viewer.entities.add({  
							name : '画线', 
							polyline : {
								positions :Cesium.Cartesian3.fromDegreesArrayHeights(drawArray),  
										width : 1,
										material : Cesium.Color.RED 
							}  
						});
						_tmpDrawEntity=sdrawEntity;
					}
				}
				if(arraysp.length>0 && shape==2)
				{
					var testArray=[];
					testArray = arraysp.slice();
					testArray.push(longitudeString);
					testArray.push(latitudeString);
					testArray.push(haiba);
					if(drawPolygon)
					{
						var isEntitys=viewer.entities.getById(drawPolygon.id);
						viewer.entities.remove(isEntitys);
					}
					var _drawPolygon = viewer.entities.add({  
							name : '贴着地表的多边形',  
							polygon : {  
								hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(testArray),
								material : new Cesium.Color(1.0,0.0,0.0,0.5)  
							}  
						});   
					drawPolygon=_drawPolygon;
				}
				if(shapeType==1)
				{
					textContext=""+arraysp.length>0?getCurDistance(longitudeString,latitudeString,haiba,cartesian2).toFixed(2)+"米":getCurDistance(longitudeString,latitudeString,haiba,cartesian2)+"米";
				}
				else
				{
					textContext=" "+(getcosTemp(longitudeString,latitudeString,haiba,cartesian2).toFixed(2))+"平方米";
				}
				
				if(_tmpDrawEntityPOINT)
				{
					var isEntity=viewer.entities.getById(_tmpDrawEntityPOINT.id);
					viewer.entities.remove(isEntity);
				}
				var sdrawEntityPOINT=viewer.entities.add( {  
					name : 'Citizens Bank Park',  
					position : Cesium.Cartesian3.fromDegrees( longitudeString,latitudeString,haiba ),  
					point : { //点  
						pixelSize : 5,  
						color : Cesium.Color.RED,  
						outlineColor : Cesium.Color.ORANGE,  
						outlineWidth : 2  
					},  
					label : { //文字标签  
						text : textContext,  
						fillColor:Cesium.Color.ORANGERED,
						outlineColor:Cesium.Color.WHITE,
						font : '10pt monospace',  
						backgroundColor:new Cesium.Color(0.165, 0.165, 0.165, 0.1),
						style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
						outlineWidth : 2,  
						verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
						pixelOffset : new Cesium.Cartesian2( 0, -9 )   //偏移量  
					}   
				} ); 
				_tmpDrawEntityPOINT=sdrawEntityPOINT;
				
				
				
			 }
		},Cesium.ScreenSpaceEventType.MOUSE_MOVE ); 
}
//获取两点之间的长度
function getDistance()
{
	var dis=0;
	for(var i=0;i<(arraysp.length/3-1);i++)
	{
		dis+=twoDistance(arraysp[3*i],arraysp[3*i+1],arraysp[3*i+2],globeRadiu[i],arraysp[3*(i+1)],arraysp[3*(i+1)+1],arraysp[3*(i+1)+2],globeRadiu[i+1]);
	}
	return dis;
}
function getCurDistance(x,y,z,zz)
{
	var dis=0;
	if(arraysp.length>0)
	{
		for(var i=0;i<(arraysp.length/3-1);i++)
		{
			dis+=twoDistance(arraysp[3*i],arraysp[3*i+1],arraysp[3*i+2],globeRadiu[i],arraysp[3*(i+1)],arraysp[3*(i+1)+1],arraysp[3*(i+1)+2],globeRadiu[i+1]);
		}
		dis+=twoDistance(arraysp[3*i],arraysp[3*i+1],arraysp[3*i+2],globeRadiu[i],x,y,z,zz);
	}
	else
	{
		dis ="点击开始测距";
	}
	
	return dis;
}
function twoDistance(x1,y1,z1,zz1,x2,y2,z2,zz2)
{
	// 假设XY平面是赤道平面，X轴经过0度，则任意一点可以投影出三维空间中的坐标

	// x = h * cos(la) * cos(lo)
	// y = h * cos(la) * sin(lo)
	// z = h * sin(la)

	// h = 海拔高度 + 地球半径
	// la = 纬度 （弧度）
	// lo = 经度 （弧度）

	// 然后计算两点间的距离即可 L = sqrt( pow(x1-x2,2) + pow(y1-y2,2) + pow(z1-z2,2) );
	var res =0;
	var h1=z1,h2=z2;
	var rad1 =0.0174533;
	var lo1 = x1*rad1,lo2=x2*rad1;
	var la1=y1*rad1,la2=y2*rad1;
	h1 +=Math.sqrt(zz1.x*zz1.x +zz1.y*zz1.y+zz1.z*zz1.z);
	h2 +=Math.sqrt(zz2.x*zz2.x +zz2.y*zz2.y+zz2.z*zz2.z);
	var _x1 =h1*Math.cos(lo1)*Math.cos(la1);
	var _y1 =h1*Math.sin(lo1)*Math.cos(la1);
	var _z1 =h1*Math.sin(la1);
	
	
	var _x2 =h2*Math.cos(lo2)*Math.cos(la2);
	var _y2 =h2*Math.sin(lo2)*Math.cos(la2);
	var _z2 =h2*Math.sin(la2);
	
	res =Math.sqrt((_x1-_x2)*(_x1-_x2) + (_y1-_y2)*(_y1-_y2) + (_z1-_z2)*(_z1-_z2) );
	return res;
	
}
/// <summary>  
/// 计算多边形面积的函数  
/// (以原点为基准点,分割为多个三角形)  
/// 定理：任意多边形的面积可由任意一点与多边形上依次两点连线构成的三角形矢量面积求和得出。矢量面积=三角形两边矢量的叉乘。  
/// </summary>  
/// <param name="vectorPoints"></param>  
/// <returns></returns>  
function CalculateArea(vectorPoints)  
{  
  //vectorPoints=globeRadiu
  var  iCycle, iCount;  
  iCycle = 0;  
  var  iArea = 0;  
  iCount = vectorPoints.length;  

  for (iCycle = 0; iCycle < iCount; iCycle++)  
  {  
	  iArea = iArea + (vectorPoints[iCycle].X * vectorPoints[(iCycle + 1) % iCount].Y - vectorPoints[(iCycle + 1) % iCount].X * vectorPoints[iCycle].Y);  
  }  

  return Math.Abs(0.5 * iArea);  
}  
setTimeout(function() {
    onCollapse()
}, 50);
function getcos()
{
	// 用两点间的距离公式算出三边长a,b,c,再用海伦公式计算.
	// 面积S=根号(p*(p-a)*(p-b)*(p-c)) 其中p=(a+b+c)/2.
	
	var va =twoDistance(arraysp[(3*(arraysp.length/3-1)+0)],arraysp[(3*(arraysp.length/3-1)+1)],arraysp[(3*(arraysp.length/3-1)+2)],globeRadiu[(arraysp.length/3-1)], arraysp[(3*(arraysp.length/3-2)+0)],arraysp[(3*(arraysp.length/3-2)+1)],arraysp[(3*(arraysp.length/3-2)+2)],globeRadiu[(arraysp.length/3-2)]);
	var vb =twoDistance(arraysp[(3*(arraysp.length/3-1)+0)],arraysp[(3*(arraysp.length/3-1)+1)],arraysp[(3*(arraysp.length/3-1)+2)],globeRadiu[(arraysp.length/3-1)], arraysp[0],arraysp[1],arraysp[2],globeRadiu[0]);
	var vc =twoDistance(arraysp[(3*(arraysp.length/3-2)+0)],arraysp[(3*(arraysp.length/3-2)+1)],arraysp[(3*(arraysp.length/3-2)+2)],globeRadiu[(arraysp.length/3-2)], arraysp[0],arraysp[1],arraysp[2],globeRadiu[0]);
	var vp =(va+vb+vc)/2;
	var vpa=(vp-va);
	var vpb =(vp-vb);
	var vpc =(vp-vc);
	var s3 = Math.sqrt(vp*vpa*vpb*vpc);
	//console.log(s3);
	//a.b=|a||b|cosβ
	// var va ={};
	// va.x=vec1.x- vec2.x;
	// va.y=vec1.y- vec2.y;
	// va.z=vec1.z- vec2.z;
	
	// var vb ={};
	// vb.x=vec3.x- vec2.x;
	// vb.y=vec3.y- vec2.y;
	// vb.z=vec3.z- vec2.z;
	
	// vectMuplty = va.x*vb.x +va.y*vb.y +va.z*vb.z;
	// vaAbs =Math.sqrt(va.x*va.x + va.y*va.y + va.z*va.z);
	// vbAbs =Math.sqrt(vb.x*vb.x + vb.y*vb.y + vb.z*vb.z);
	// var cosb = vectMuplty/(vaAbs*vbAbs);
	// console.log(cosb/3.1415926*180);
	return s3;
}
function getcosTemp(x,y,z,zz)
{
	// 用两点间的距离公式算出三边长a,b,c,再用海伦公式计算.
	// 面积S=根号(p*(p-a)*(p-b)*(p-c)) 其中p=(a+b+c)/2.
	if(arraysp.length/3<2)
		return 0;
	var va =twoDistance(x,y,z,zz, arraysp[(3*(arraysp.length/3-1)+0)],arraysp[(3*(arraysp.length/3-1)+1)],arraysp[(3*(arraysp.length/3-1)+2)],globeRadiu[(arraysp.length/3-1)]);
	var vb =twoDistance(x,y,z,zz,arraysp[0],arraysp[1],arraysp[2],globeRadiu[0]);
	var vc =twoDistance(arraysp[(3*(arraysp.length/3-1)+0)],arraysp[(3*(arraysp.length/3-1)+1)],arraysp[(3*(arraysp.length/3-1)+2)],globeRadiu[(arraysp.length/3-1)], arraysp[0],arraysp[1],arraysp[2],globeRadiu[0]);
	var vp =(va+vb+vc)/2;
	var vpa=(vp-va);
	var vpb =(vp-vb);
	var vpc =(vp-vc);
	var s3 = Math.sqrt(vp*vpa*vpb*vpc);
	//console.log(s3);
	//a.b=|a||b|cosβ
	// var va ={};
	// va.x=vec1.x- vec2.x;
	// va.y=vec1.y- vec2.y;
	// va.z=vec1.z- vec2.z;
	
	// var vb ={};
	// vb.x=vec3.x- vec2.x;
	// vb.y=vec3.y- vec2.y;
	// vb.z=vec3.z- vec2.z;
	
	// vectMuplty = va.x*vb.x +va.y*vb.y +va.z*vb.z;
	// vaAbs =Math.sqrt(va.x*va.x + va.y*va.y + va.z*va.z);
	// vbAbs =Math.sqrt(vb.x*vb.x + vb.y*vb.y + vb.z*vb.z);
	// var cosb = vectMuplty/(vaAbs*vbAbs);
	// console.log(cosb/3.1415926*180);
	return s3+areaAll;
}
getCustomID();
function getCustomID()
{
	$.ajax({
		type:'post',
		url: 'session!execute.action',
		dataType: 'json',
		success:function(ret){
			ret = eval(ret);
			var userId = ret.user.userId;
			getUseService(userId);
			if(ret.user.level == "1"){
				$('#menus').hide();
				$('.dr').hide();
			}else{
				$('#menus').show();
				$('.dr').show();

			}
		}
	});
}
function getUseService(id)
{
	$.ajax({
		type:'post',
		url: 'myService!loadService.action',
		dataType: 'json',
		data: {userId:id},
		success:function(ret){
			ret = eval(ret);
			debugger;
			
			test_service(ret.list);
		}
	});
}

function test_service(ret)
{
	
	var indexImage_ =0;
	var serviceArray=[];
	for(var i =0;i<ret.length;i++)
	{
		var _obj1 =new Object();
		_obj1.layersName = ret[i].serviceName+"_"+(indexImage_++);
		_obj1.type = ret[i].fwxl=="Geojson"?"geojson":"ams";
		_obj1.url =ret[i].address;	
		serviceArray.push(_obj1);
	}
//	var _obj1 =new Object();
//	_obj1.layersName = "天地图_"+(indexImage_++);
//	_obj1.type = 'wmts';
//	_obj1.url ="http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles";
//	//http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer
//	var _obj2 =new Object();
//	_obj2.layersName = "arcgis交通图_"+(indexImage_++);
//	_obj2.type = 'ams';
//	_obj2.url ="http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer";
//	serviceArray.push(_obj1);
//	serviceArray.push(_obj2);
//	var _obj3 = new Object();
//	_obj3.layersName = "geojson_"+(indexImage_++);
//	_obj3.type='geojson';
//	_obj3.url ='data/point.json';
//	serviceArray.push(_obj3);
	for(var i=0;i<serviceArray.length;i++)
	{debugger
		if(serviceArray[i].type=='wmts')
		{
			createWMTS(serviceArray[i].url,serviceArray[i].layersName);
		}
		if(serviceArray[i].type=='ams')
		{
			createAMS(serviceArray[i].url,serviceArray[i].layersName);
		}
		if(serviceArray[i].type=='geojson')
		{
			loadGeojsonUrl(serviceArray[i].url,serviceArray[i].layersName);
		}
	}
	startCustomizedServer();
}
function createWMTS(url,layersName)
{
	var create_wmts =new Cesium.WebMapTileServiceImageryProvider({
		url: url,
		layer: layersName,
		style: "default",
		format: "image/jpeg",
		tileMatrixSetID: "GoogleMapsCompatible"
	});
	var _obj = new Object();
	_obj.name =layersName;
	_obj.service = create_wmts;
	customizedServer.push(_obj);
}
function createAMS(url,layersName)
{
	var create_ams =new Cesium.ArcGisMapServerImageryProvider( {  
         url : url,
		 layer: layersName
		 });
	var _obj = new Object();
	_obj.name =layersName;
	_obj.service = create_ams;
	customizedServer.push(_obj);
}
function startCustomizedServer()
{
	for(var i=0;i<customizedServer.length;i++)
	{
		//viewer.imageryLayers.addImageryProvider(customizedServer[i].service);
		$('#list_service').append("<li><input type='checkbox' name="+customizedServer[i].name+" value='' onclick='getCheckBoxState(this)'/>"+customizedServer[i].name.split("_")[0]+"<img src='img/test.png' name="+customizedServer[i].name+" onclick='addProperty(this)' style='float:right;width:30px;height:30px;margin-top:5.5px;' /></li>");
	}
	
}
function addProperty(s)
{
	$("#page_info").hide();
	$("#filmstrip").show();
	var getObj=saveGeoJsonData[s.name];
	var tables="<table>"
				+"<thead>"
				+"	<tr>";
	var toptableIndex=false;
	tableTopName=[];
	for(var i=0;i<getObj.features.length;i++)
	{
		if(typeof(getObj.features[i].properties)!='undefined')
		{
			//拼出表头
			if(!toptableIndex)
			{
				for(var tabletop in getObj.features[i].properties )
				{
					tableTopName.push(tabletop);
					tables += "<th>"+tabletop+"</th>";
				}
				tables += "</tr>"
					+"</thead>"
					+"<tbody>";
				toptableIndex=true;
			}
			tables +="<tr>";
			for(var tabletop in getObj.features[i].properties )
			{
				tables +="<td>"+getObj.features[i].properties[tabletop]+"</td>";
			}	
		}
	}
	tables +="</tr>"
					 +"</tbody>"
				     +"</table>";
	$('#dateTable').empty();
	$('#dateTable').append(tables);
	detailsshow();
	// $("tr:odd").css("background-color","#eeeeee");  
	// $("tr:even").css("background-color","#ffffff"); 
	//$("table tr:nth-child(odd)").css("background-color","#eeeeee");  
	$("tr").bind("mouseover",function(){  
		$(this).css("background-color","rgba(1,0,0,0.75)");  
	});  
	$("tr").bind("mouseout",function(){  
		$(this).css("background-color","rgba(1,0,0,0)");  
	});  
	$("table tr").dblclick(function(){
			var me = $(this),
				tds = me.find("td");
			for(var s =0;s<tableTopName.length;s++)
			{
				if(tableTopName[s]=='CUSTOMID')
				{
					break;
				}
			}
			selectedTarget(tds[s].innerText,true);
		});
}
function getCheckBoxState(box)
{
	if(box.checked)
	{
		addService(box.name);
	}
	else
	{
		removeService(box.name);
	}
}
function addService(name)
{
	removeService(name);
	for(var i=0;i<customizedServer.length;i++)
	{
		if(name == customizedServer[i].name)
		{
			var _imageLayers=viewer.imageryLayers.addImageryProvider(customizedServer[i].service);
			var _obj = new Object();
			_obj.name =customizedServer[i].name;
			_obj.img = _imageLayers;
			imageProviderCustom.push(_obj);
			break;
		}
	}
}
function removeService(name)
{
	for(var i=0;i<customizedServer.length;i++)
	{
		var isb=false;
		if(name == customizedServer[i].name)
		{
			for(var j=0;j<imageProviderCustom.length;j++)
			{
				if(name == imageProviderCustom[j].name)
				{
					viewer.imageryLayers.remove(imageProviderCustom[j].img);
					imageProviderCustom.splice(j,1);
					isb=true;
					break;
				}
			}
		}
		if(isb)
			break;
	}
}
function to2D3DViewer2(r)
{
	if(viewer2_2D)
	{
		viewer2_2D=false;
		viewer2.scene.morphTo3D(0);
		r.innerHTML="3D";
	}
	else
	{
		viewer2_2D=true;
		viewer2.scene.morphTo2D(0);
		r.innerHTML="2D";
	}
	//viewer2_2D=!viewer2_2D;
}
function GenNonDuplicateID(randomLength){
	debugger;
  return Number(Math.random().toString().substr(3,randomLength) + Date.now()).toString(36)
}
var setclear=false;
//加载图形数据
function loadGeojsonFile(file){
	loadName = file.name;
	$('#sjshow').val(loadName);
	var reader = new FileReader();	
	//reader.readAsDataURL(file);
	reader.readAsText(file);
	reader.onload = function(e){
			
			var json = e.target.result;
			json =eval("("+json+")");
			if(typeof(json.features)=="undefined")
			{
				for(var singleO in json)
				{
					var features = json[singleO].features;
					json=json[singleO];
					break;
				}
			}
			saveGeoJsonData[loadName] = json;
			for(var i=0;i<saveGeoJsonData[loadName].features.length;i++)
			{
				saveGeoJsonData[loadName].features[i].properties.CUSTOMID=GenNonDuplicateID(64);
			}
			var test =Cesium.GeoJsonDataSource.load(json, {
					stroke: Cesium.Color.RED,
					fill: Cesium.Color.RED.withAlpha(0.5),
					strokeWidth: 10,
					clampToGround: true,
					markerSymbol: '',
					markerSize: 25,
					markerColor: Cesium.Color.RED.withAlpha(0.5)
				});
			test.then(function(dataSource) {
				debugger;
				if(!setclear)
				{
					$('#list_ul').empty();
					setclear=true;
				}
					
				$('#list_ul').append("<li ondblclick='alert()'><input type='checkbox' name='"+loadName+"' value='' checked=true onclick='contrlShow(this)'/><a href='#' name='"+loadName+"'  onclick='flyObject(this)'>"+loadName+"</a><img src='img/test.png' name='"+loadName+"' onclick='addProperty(this)'  style='width:30px;height:30px;float:right;margin-top:5.5px;' /></li>");
				exportpolygon[loadName]=dataSource;
				for(var i=0;i<saveGeoJsonData[loadName].features.length;i++)
				{
					saveGeoJsonData[loadName].features[i].ids=dataSource.entities.values[i].id;
				}
				debugger;
			});
				
			viewer.flyTo(	
				viewer.dataSources.add(test)
			);
			
	}
}
function loadGeojsonUrl(url,_name)
{
	$('#list_service').append("<li><input type='checkbox' name='"+url+"' value='' onclick='contrlLoadShow(this)'/><a href='#' name='"+url+"'  onclick='flyObjectService(this)'>"+_name.split("_")[0]+"</a><img src='img/test.png' name='"+url+"' onclick='addProperty(this)'  width='30px' height='30px' /></li>");
}
function contrlLoadShow(o)
{
	debugger; 
	var isEx =false;
	for(var url in geojsonDatas)
	{
		if(o.name == url)
		{
			isEx=true;
			geojsonDatas[url].show = !geojsonDatas[url].show;
		}
	}
	if(!isEx)
	{
		loadName = o.name;
			$.ajax({
             type: "GET",
             url: loadName,
             data: '',
             dataType: "json",
             success: function(json){
						if(typeof(json.features)=="undefined")
						{
							for(var singleO in json)
							{
								var features = json[singleO].features;
								json=json[singleO];
								break;
							}
						}
						saveGeoJsonData[loadName] = json;
						debugger;
						for(var i=0;i<saveGeoJsonData[loadName].features.length;i++)
						{
							if(saveGeoJsonData[loadName].features[i].properties)
							{
								
							}
							else
							{
								saveGeoJsonData[loadName].features[i].properties=new Object();
							}
							saveGeoJsonData[loadName].features[i].properties.CUSTOMID=GenNonDuplicateID(64);
						}
						var test =Cesium.GeoJsonDataSource.load(json, {
								stroke: Cesium.Color.RED,
								fill: Cesium.Color.RED.withAlpha(0.5),
								strokeWidth: 10,
								clampToGround: true,
								markerSymbol: '',
								markerSize: 25,
								markerColor: Cesium.Color.RED.withAlpha(0.5)
							});
						test.then(function(dataSource) {
							geojsonDatas[loadName]=dataSource;
							for(var i=0;i<saveGeoJsonData[loadName].features.length;i++)
							{
								saveGeoJsonData[loadName].features[i].ids=dataSource.entities.values[i].id;
							}
							debugger;
						});
						viewer.flyTo(	
							viewer.dataSources.add(test)
						);
                      }
			});
	}
}

function selectedTarget(ids,isfly)
{
	debugger;
	//geojsonDatas  exportpolygon
	//saveGeoJsonData[loadName] = json;  geojsonDatas[cur].entities.values[0]
	for(var selectd in saveGeoJsonData)
	{
		for(var i=0;i<saveGeoJsonData[selectd].features.length;i++)
		{
			if(ids == saveGeoJsonData[selectd].features[i].properties.CUSTOMID)
			{
				var tmpgeojson = new Object();
				var tmpArray = [];
				tmpgeojson.type="FeatureCollection";
				tmpArray.push(saveGeoJsonData[selectd].features[i]);
				tmpgeojson.features =tmpArray;
				var test =Cesium.GeoJsonDataSource.load(tmpgeojson, {
						stroke: Cesium.Color.ORANGE,
						fill: Cesium.Color.ORANGE.withAlpha(1),
						strokeWidth: 13,
						clampToGround: true,
						markerSymbol: '',
						markerSize: 26,
						markerColor: Cesium.Color.ORANGE.withAlpha(1)
					});
				test.then(function(dataSource) {
					if(singleDataSource)
					{
						var s=viewer.dataSources.remove(singleDataSource);
					}
					singleDataSource=dataSource;
					var ss=viewer.dataSources.add(singleDataSource)
					if(isfly)
					{
						viewer.flyTo(	
								ss,
								{
									offset:new Cesium.HeadingPitchRange(-1, -1, 6000)
								}
							);
					}
				});
				
				
				
				
			}
		}
	}
}
function flyObject(o)
{
	for(var cur in exportpolygon)
	{
		if(cur == o.name)
		{
			viewer.flyTo(	
				exportpolygon[cur]
			);
		}
	}

}
function flyObjectService(o)
{
	for(var cur in geojsonDatas)
	{
		if(cur == o.name)
		{
			debugger;
			viewer.flyTo(	
				geojsonDatas[cur]//geojsonDatas[cur].entities.values[0]
			);
		}
	}

}
function contrlShow(o)
{
	for(var cur in exportpolygon)
	{
		if(cur == o.name)
		{
			exportpolygon[cur].show = !exportpolygon[cur].show;
		}
	}

}
function exportInfo(geo)
{
	
	var type =geo.geometry.type;
	switch(type)
	{
		case "LineString":
			var drawArray=[];
			var coordinates =geo.geometry.coordinates;
			for(var i=0;i<coordinates.length;i++)
			{
				var cartographic2 = Cesium.Cartographic.fromDegrees(coordinates[i][0],coordinates[i][1]);
				var haiba =viewer.scene.globe.getHeight(cartographic2);
				drawArray.push(coordinates[i][0]);
				drawArray.push(coordinates[i][1]);
				drawArray.push(haiba);
			}
			var sdrawEntity = viewer.entities.add({  
				name : '画线', 
				polyline : {
					positions :Cesium.Cartesian3.fromDegreesArrayHeights(drawArray),  
							width : 10,
							clampToGround: true,
							material : Cesium.Color.RED 
				}  
			});
		break;
		case "MultiLineString":
		break;
		case "Polygon":
		break;
		case "MultiPolygon":
		break;
		
	}
}
var full=false;
function compareDouble(){
	if(!full){
		Cesium.Fullscreen.requestFullscreen(document.body);
		$("#fullScreen").children("img").attr("src","img/i5_05.png")
	}else{
		Cesium.Fullscreen.exitFullscreen();
		$("#fullScreen").children("img").attr("src","img/i3_05.png")
	}
	full = !full;
	// if($('.Ldown').length>0)
	// {
		// $('.Spscreen').parents("#infobox").removeClass("collapsed").addClass("uncollapsed").animate({'width': Rscreenw,'height': '100%','bottom':'0'},1000);
		// $("#cesiumContainer").animate({'width': Rscreenw},1000);
		// $('.Spscreen').children("img").removeClass('Ldown').addClass('Lup');
		// $(".caf-toggle-flow").hide();
		// doubleCompareGlobe=true;//双屏开启
		// $('.Spscreen').show();
		// //$("#infobox").append("<span class='Spscreen'><img src='img/arrow229.png' class='Ldown' disabled /></span>");
	// }
	// else
	// {
		// $('.Spscreen').parents("#infobox").removeClass("uncollapsed").addClass("collapsed").animate({'width': '400px','height': '400px','bottom':'198px'},1000);
		// $("#cesiumContainer").animate({'width': '100%'},1000);
		// $('.Spscreen').children("img").removeClass('Lup').addClass('Ldown');
		// $(".caf-toggle-flow").show();
		// doubleCompareGlobe=false;//双屏关闭
		// $('.Spscreen').hide();
	// }
	

}
//http://192.168.10.17:81/3DProduc/searchAll!execute.action?name=青海湖&start=0
var preSearch;
var onlyoneShow=true;
var curpage=1;
var totalpage=1;
var totalrecoder=0;
var searchName;
function detailsshow(){
	$("#collapse").click();
}
function testApps()
{
	curpage=1;
	var inkey = $('#searchkey').val();
	searchName=inkey;
	debugger;
	if(inkey!="")
	{
		if(preSearch != inkey)
		{
			requestSearch(searchName,curpage-1);
		}
	}
	
}
function searchNextpage()
{
	if(curpage+1<=totalpage)
	{
		curpage +=1;
		requestSearch(searchName,curpage-1);
	}
	setHeight();
}
function searchPrepage()
{
	if(curpage-1>=1)
	{
		curpage -=1;
		requestSearch(searchName,curpage-1);
	}
	
}
function showSearch(arr)
{
	$("#page_info").show();
	var tables="<table>"
				+"<thead>"
				+"	<tr>";
	var toptableIndex=false;
	tableTopName=[];
	for(var i=0;i<arr.length;i++)
	{
		//拼出表头
		if(!toptableIndex)
		{
			for(var tabletop in arr[i] )
			{
				if(tabletop =='source' || tabletop =='point')
				{
					tableTopName.push(tabletop);
					tables += "<th style='display:none'>"+tabletop+"</th>";
				}
				else
				{
					tableTopName.push(tabletop);
					tables += "<th>"+tabletop+"</th>";
				}
				
			}
			tables += "</tr>"
				+"</thead>"
				+"<tbody>";
			toptableIndex=true;
		}
		tables +="<tr>";
		for(var tabletop in arr[i] )
		{
			if(tabletop =='source' || tabletop =='point')
			{
				tables +="<td style='display:none'>"+arr[i][tabletop]+"</td>";
			}
			else
			{
				tables +="<td>"+arr[i][tabletop]+"</td>";
			}
			
		}	
	}
	tables +="</tr>"
					 +"</tbody>"
				     +"</table>";
	$('#dateTable').empty();
	$('#dateTable').append(tables);
	if(onlyoneShow)
	{
		detailsshow();
		onlyoneShow=false;
	}
	$("tr").bind("mouseover",function(){  
		$(this).css("background-color","rgba(1,0,0,0.75)");  
	})  
	$("tr").bind("mouseout",function(){  
		$(this).css("background-color","rgba(38, 38, 38, 0)");  
	})  
	$("table tr").dblclick(function(){
			var me = $(this),
				tds = me.find("td");
			var fidindex,sourceindex;
			for(var s =0;s<tableTopName.length;s++)
			{
				if(tableTopName[s]=='source')
				{
					sourceindex=s;
				}
				if(tableTopName[s]=='FId')
				{
					fidindex=s;
				}
			}
			//alert(tds[s].innerText);
			requestInfo(tds[fidindex].innerText,tds[sourceindex].innerText);
		});
}
function requestSearch(name,start)
{
	$.ajax({
		 type: "GET",
		 url: '/3DProduc/searchAll!execute.action',
		 data: {name:name,statr:start},
		 dataType: "json",
		 success: function(json){
		 		$("#filmstrip").show();
		 		detailsshow();
				$("#page_info").show();
				totalrecoder=json.num;
				$("#totalrecoder").text("共"+totalrecoder+"条记录");
				$("#curpage").text("当前第"+curpage+"页");
				totalpage =((totalrecoder/10)-parseInt(totalrecoder/10))>0?(parseInt(totalrecoder/10)+1):parseInt(totalrecoder/10); 
				$("#totalpage").text("共"+totalpage+"页")
				if(totalrecoder>0)
					showSearch(json.list);
				
		}
		});
}
function requestInfo(fid,source)
{
	$.ajax({
		 type: "GET",
		 url: '/3DProduc/searchAll!detail.action',
		 data: {fId:fid,source:source},
		 dataType: "json",
		 success: function(json){
				var inner="";
				for(var tring in json.list[0])
				{
					if(tring != "geometry")
						inner+=`<tr><td>${tring}</td><td>${json.list[0][tring]}</td></tr>`;
				}
				Main.s.Toggles(true);
				$('#infoboxce').hide();
				$('#infoboxinfo').show();
				//$('#infoboxinfo')[0].innerHTML =inner;
				$("#tbr").html(inner);
				redraw(json);
				
		}
		});
}
function redraw(json)
{
	debugger;
	var tmpgeojson = new Object();
	var tmpfeatures = new Object();
	tmpfeatures.geometry=eval("("+json.list[0].geometry+")");
	tmpfeatures.type="Feature";
	var festring = new Object();
	for(var tring in json.list[0])
	{
		if(tring != "type" && tring != "geometry")
		festring[tring] = json.list[0][tring];
	}
	tmpfeatures.properties = festring;
	var tmpArray = [];
	tmpgeojson.type="FeatureCollection";
	tmpArray.push(tmpfeatures);
	tmpgeojson.features =tmpArray;
	var test =Cesium.GeoJsonDataSource.load(tmpgeojson, {
			stroke: Cesium.Color.ORANGE,
			fill: Cesium.Color.ORANGE.withAlpha(1),
			strokeWidth: 13,
			clampToGround: true,
			markerSymbol: '',
			markerSize: 26,
			markerColor: Cesium.Color.ORANGE.withAlpha(1)
		});
	test.then(function(dataSource) {
		if(singleDataSource)
		{
			var s=viewer.dataSources.remove(singleDataSource);
		}
		singleDataSource=dataSource;
		var ss=viewer.dataSources.add(singleDataSource)

		viewer.flyTo(	
				ss,
				{
					offset:new Cesium.HeadingPitchRange(-1, -1, 6000)
				}
			);
		
	});
}