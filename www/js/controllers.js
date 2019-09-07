
angular.module('starter.controllers', ['ngCordova'])

.controller('loginCtrl', ['$scope','$rootScope','$interval','$http','$state','$ionicLoading',function($scope,$rootScope,$interval,$http,$state,$ionicLoading){

	$scope.listpadding = {
		'padding-left':'0',
		'padding-right':'0'
	}

	$scope.data = {userPhone:'',usercode:''}

	$scope.codes = "获取验证码";

	$scope.logincode = false;

	$scope.code = function(){
		$scope.logincode = true;
		if($scope.codes){
			var count = 60;
			$scope.codes = count+'s';
			var timer = $interval(function(){
				count--;
				$scope.codes = count+'s';
				if(count <=0){
					$interval.cancel(timer);
					$scope.codes = '重发验证码';
					$scope.logincode = false;
					count = 60;
				} 
			},1000);

			let url ="http://192.168.10.17:81/Smartbj/ykdl!dx.action?jsoncallback=?";

			$.ajax(url,{
				data:{
					"phone": $scope.data.userPhone
				},
				type:'get',
				dataType:"jsonp",
				success:function(ret){
					ret = eval(ret);
				},
				error: function(ret, ret1, ret2) {
					debugger;
				}
			});

		}
	}

	//提交
	$scope.subForm = function(isValid){
		if(isValid){
			let url = "http://192.168.10.17:81/Smartbj/userLogin!logon.action?jsoncallback=?";
			$.ajax(url,{
				type: "get",
				data: { 
					"phone":$scope.data.userPhone,
					'yzm':$scope.data.usercode
				},
				dataType: "jsonp",
				success: function(ret) {
					ret = eval(ret);
					if(ret.result == 1){
						$ionicLoading.show({
							template: '手机号码不匹配',
							animation: 'fade-in',
							showBackdrop: true,
							maxWidth: 500,
							showDelay: 100,
							duration :2000
						});
					}else if(ret.result == 2){
						$ionicLoading.show({
							template: '验证码输入错误',
							animation: 'fade-in',
							showBackdrop: true,
							maxWidth: 500,
							showDelay: 100,
							duration :2000
						});
					}else{
						$ionicLoading.show({
							template: '登录成功',
							animation: 'fade-in',
							showBackdrop: true,
							maxWidth: 500,
							showDelay: 100,
							duration :1000
						});
						$state.go('map');
						$rootScope.tel=ret.result;
					}
				},
				error: function(ret, ret1, ret2) {
					debugger;
				}
			});
		}
	}
}])

.controller('mapCtrl', ['$scope','$rootScope' ,'$cordovaGeolocation','$state','$ionicActionSheet','$cordovaCamera','$cordovaImagePicker',function($scope,$rootScope,$cordovaGeolocation,$state,$ionicActionSheet,$cordovaCamera,$cordovaImagePicker){
	var ownr = $(".toolbar-right");
	$rootScope.rHeight = -(ownr.height()/2)+'px';

	$scope.ctrlLat = "39.984256";
	$scope.ctrlLng = "116.320542";
	//获取地理位置
	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
		var lat  = position.coords.latitude;
		var long = position.coords.longitude;
		var time = position.timestamp;

		var gpsPoint = new BMap.Point(long,lat);
		translateCallback = function (point){
			lats = point.lat;
			lngs = point.lng;

			//普通跨域请求
			var url = "http://api.map.baidu.com/geocoder/v2/?callback=JSON_CALLBACK";
			$.ajax(url,{
				data:{
					"location":lats+','+lngs,
					"output":"json",
					"ak":"NFzwQSR7FlNsPgGXNQFBM9XwV4rrH1Uy",
					"pois":1
				},
				type:'post',
				dataType:"jsonp",
				beforeSend: function () {
					$("#loc").html("<img src='./img/loading.gif' />");
				},
				success:function(ret){
					ret = eval(ret);
					$rootScope.address = ret.result.formatted_address;
				},
				error:function(){

				}
			});
		};
		BMap.Convertor.translate(gpsPoint,0,translateCallback);

		//获取时间
		let date = new Date(time);
		Y = date.getFullYear() + '-';
		M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
		D = date.getDate();
		H = (date.getHours()<10 ? '0'+date.getHours() : date.getHours())+ ':';
		I = (date.getMinutes() <10 ? '0'+date.getMinutes() : date.getMinutes())+ ':';
		S = (date.getSeconds() <10 ? '0'+date.getSeconds() : date.getSeconds());

		$rootScope.time = Y+M+D+'  '+H+I+S;
	}, function(err) {
		// error
	});
	

	var watchOptions = {
		timeout : 3000,
		enableHighAccuracy: false // may cause errors if true
	};
	var watch = $cordovaGeolocation.watchPosition(watchOptions);
	watch.then(
		null,
		function(err) {
			// error
		},
		function(position) {
			var lat  = position.coords.latitude;
			var long = position.coords.longitude;
			var time = position.timestamp;	
	});
	watch.clearWatch();

	//调用照相机
	$scope.photo = function(){
		var options = {
			quality: 100,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: false,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 100,
			targetHeight: 100,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: true,
			correctOrientation:true
		};

		$cordovaCamera.getPicture(options).then(function(imageData) {
			$rootScope.camera = "data:image/jpeg;base64," + imageData;
		}, function(err) {
			// error
		});

		$state.go('edit',{},{reload:true});
	};


	//选择照片
	var  imgList=[],a=true;
	$scope.picture = function(){
		var options = {
			maximumImagesCount: 10, //最大选择图片数量
			width: 800, //筛选宽度：如果宽度为0，返回所有尺寸的图片
			height: 800, //筛选高度：如果高度为0，返回所有尺寸的图片
			quality: 80 //图像质量的大小，默认为100
		};
		
		$cordovaImagePicker.getPictures(options).then(function (results) {
			if(a){
				imgList= results;
				a=false;
			}else{
				imgList =  imgList.concat(results);
			}
			$rootScope.pictures = imgList;
			
			

		},function(error) {
			// error
		});
		$state.go('edit',{},{reload:true});
	};

	// 显示上拉菜单
	$rootScope.upshow = function() {
		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: '拍摄'},
				{ text: '从相册中选择' }
			],
			cancelText: '取消',
			cancel: function() {
					// 这里添加取消代码
				},
			buttonClicked: function(index) {
				switch (index) {  
					case 0:  
						$scope.photo();
						break;  

					case 1:  
						$scope.picture();
						break;  

					default:  
						break;  
				}  
				return true;
			}
		});
	};
	
}])

.controller('editCtrl', ['$scope','$http','$rootScope','$cordovaFileTransfer','$ionicLoading','$state',function($scope,$http,$rootScope,$cordovaFileTransfer,$ionicLoading,$state){
	//设置缩略图高度
	let screenw = document.body.clientWidth;
	$scope.imgheight = (screenw-10)/4-10+"px";

	//picStyle
	$scope.picheight = $(".scroll").height()-$(".foot").height();
	//textareaStyle
	$scope.awidth=$(".item").width()-$(".xq").width()-24;

	$scope.data = {content:''}

	//照片上传
	$scope.upload = function(){
		var resultes = [],
		ase=new Image();
		function getBase64Image(img) {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
			var dataURL = canvas.toDataURL("image/"+ext);
			return dataURL;
		}

		// ase.src = $scope.pictures;
		// var fileUpload = getBase64Image(ase);


		// let url = "http://192.168.10.17:81/Smartbj/wb!add.action";
		// let trustHosts = true;
		// let options = {};

		for(var i=0;i<$scope.pictures.length;i++){
			// fileUpload = $scope.pictures[i];
			ase.src = $scope.pictures[i];
			fileUpload = getBase64Image(ase);
			resultes.push(fileUpload)

			// document.addEventListener('deviceready', function () {
			// 	$cordovaFileTransfer.upload(url, fileUpload, options,trustHosts)
			// 		.then(function(result) {
			// 			alert(result)
			// 		}, function(err) {
			// 			alert('Error status: ' + err.http_status);
			// 		}, function (progress) {
			// 			$timeout(function () {
			// 				$scope.upProgress = Math.round((progress.loaded / progress.total) * 100)+'%';
			// 			},100);
			// 		});

			// }, false);
		}	

		// $.ajax("http://192.168.10.17:81/Smartbj/wb!add.action?jsoncallback=?",{
		// 	//url:"http://192.168.10.17:81/Smartbj/wb!add.action?jsoncallback=?",
		// 	data:{
		// 		wbTitle:'pic',
		// 		wbContent:$scope.data.content,
		// 		userName:$rootScope.tel,
		// 		lat:$rootScope.lat,
		// 		lng:$rootScope.lng,
		// 		arlt:resultes
		// 	},
		// 	type:'get',
		// 	traditional: true,
		// 	dataType:"jsonp",
		// 	success:function(ret){
		// 		ret = eval(ret);
		// 		alert(1);
		// 	},
		// 	error: function(ret, ret1, ret2) {
		// 		debugger;
		// 	}
		// });	

		$.ajax({
			url:"http://192.168.10.20:81/Smartbj/wb!add.action",
			data:{
				wbTitle:'',
				wbContent:$scope.data.content,
				userName:$rootScope.tel,
				lat:$rootScope.lat,
				lng:$rootScope.lng,
				address:$rootScope.address,
				arlt:resultes
			},
			type:'post',
			traditional: true,
			dataType:"json",
			beforeSend: function () {
				$ionicLoading.show({
					template: '<ion-spinner icon="spiral"></ion-spinner>',
					animation: 'fade-in',
					showBackdrop: true,
					maxWidth: 200,
					showDelay: 0
				});
			},
			success:function(ret){
				$ionicLoading.show({
					template: '提交成功',
					animation: 'fade-in',
					showBackdrop: true,
					maxWidth: 500,
					showDelay: 100,
					duration :1000
				});
				
				$state.go('map',{},{reload:true});
				viewer.dataSources.remove(clusterData);
				addpic();
			},
			error: function(ret, ret1, ret2) {
				debugger;
			}
		});
	};
	
}])
.controller('detailsCtrl', ['$scope','$stateParams',function($scope,$stateParams){
	let data = JSON.parse($stateParams.relicId);
	$scope.imgSrc = data.icon;
	$scope.content = data.wbContent;
	$scope.address = data.address;

	var date = new Date(data.time);
		Y = date.getFullYear() ;
		M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) ;
		D = date.getDate();
		
		H = (date.getHours()<10 ? '0'+date.getHours() : date.getHours())+ ':';
		F = (date.getMinutes() <10 ? '0'+date.getMinutes() : date.getMinutes());

	$scope.time = Y+'年'+M+'月'+D+'日'+'    '+H+F;
}])

.directive("appMap", ['$state',function ($state) {
	return {
		restrict: "AE",
		replace: true,
		scope: {
			lat:"@",
			lng:"@"
		},
		template: "<div id='cesiumContainer'></div>",
		link: function (scope, element, attrs) {
			console.log(scope)
			viewerImageLayers.push(new Cesium.ArcGisMapServerImageryProvider( {  
				url : 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
				layer: "arcgisImgLayer"
			} ));
			viewerImageLayers.push(new Cesium.WebMapTileServiceImageryProvider({
				url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
				layer: "tdtVectLayer",
				style: "default",
				format: "image/jpeg",
				tileMatrixSetID: "GoogleMapsCompatible",
				show: false
			}));
			viewerImageLayers.push(new Cesium.WebMapTileServiceImageryProvider({
				url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
				layer: "tdtAnnoLayer",
				style: "default",
				format: "image/jpeg",
				tileMatrixSetID: "GoogleMapsCompatibles"
			}));
			terrainProvider=new Cesium.CesiumTerrainProvider({
				url: '//assets02.agi.com/stk-terrain/world',
				credit: '',
				requestWaterMask: true
			})


			viewer = new Cesium.Viewer("cesiumContainer", {
				timeline: false,
				animation: false,
				baseLayerPicker: false,
				//useDefaultRenderLoop : false,
				homeButton:false,
				fullscreenButton: false,
				geocoder: false,
				selectionIndicator: false,
				infoBox: true,
				sceneModePicker: false,
				navigationHelpButton: false,
				navigationInstructionsInitiallyVisible: false,
				sceneMode : Cesium.SceneMode.SCENE3D,
				imageryProvider :viewerImageLayers[0]
			});
			
			handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
			addpic();

				

			handler.setInputAction(function(click){
				var pickedObject = viewer.scene.pick(click.position);
				if(Cesium.defined(pickedObject)){
					var selectObject = pickedObject.id ;//聚合状态下为数组
					if(selectObject.length==undefined){
						var properties = selectObject.properties;

						var icon = properties.icon.getValue();
						var wbContent = properties.wbContent.getValue();
						var address = properties.address.getValue();
						var time = properties.time.getValue();

						var param = { address:address, wbContent:wbContent, time:time,icon:icon };
						$state.go('details',{relicId:JSON.stringify(param)},{reload:true});
					}
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
			


			// viewer.imageryLayers.addImageryProvider(viewerImageLayers[1],1);
			// viewer.imageryLayers.addImageryProvider(viewerImageLayers[2],2);
			InitRotate();

			viewer.camera.flyTo({
				// destination : Cesium.Cartesian3.fromDegrees(116.320542,39.984256,500),
				destination : Cesium.Cartesian3.fromDegrees(scope.lng,scope.lat,500),
				orientation : {
					heading : Cesium.Math.toRadians(0),
					pitch : Cesium.Math.toRadians(-90),
					roll : Cesium.Math.toRadians(0)
				},
				duration : 1
			});
		}
	};
}])

