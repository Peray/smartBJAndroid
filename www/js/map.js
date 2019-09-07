
var	onOff0 = false,
	onOff1 = false,
	onOff2 = false;
var on0  = true,
	on1 = true;



// viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
//     var startPos = {
//         "duration": 1,
//        "direction":{"x":0.1254135815065776,"y":-0.9808049862957621,"z":0.14930844728635803},
// 	   "up":{"x":-0.10750057635221513,"y":0.13617603326381653,"z":0.9848348663854635},
// 	   "destination":{"x":-1049107.5584428532,"y":5046465.784400398,"z":3803350.1052727373}
//     };
//     viewer.camera.flyTo({
//         destination: startPos.destination,
//         orientation: {
//             up: startPos.up,
//             direction: startPos.direction
//         },
//         duration: startPos.duration
//     });

//     commandInfo.cancel = true;
// });












function layer(index,ele){
	switch (index) {
		case 0:
			if(onOff0){
				$(ele).removeClass('activ');
				viewer.terrainProvider=new Cesium.EllipsoidTerrainProvider();
			}else{
				$(ele).addClass('activ');
				viewer.terrainProvider = terrainProvider; 
			}
			onOff0 = !onOff0;
		break;

		case 1:
			if(onOff1){
				$(ele).removeClass('activ');
				for(var i=0;i<viewer.imageryLayers._layers.length;i++){
					if(viewer.imageryLayers._layers[i]._imageryProvider ==viewerImageLayers[1]){
						viewer.imageryLayers.remove(viewer.imageryLayers._layers[i]);
					}
				}	
			}else{
				$(ele).addClass('activ');
				viewer.imageryLayers.addImageryProvider(viewerImageLayers[1]);
			}
			onOff1 = !onOff1;
		break;

		case 2:
			if(onOff2){
				$(ele).removeClass('activ');
				for(var i=0;i<viewer.imageryLayers._layers.length;i++){
					if(viewer.imageryLayers._layers[i]._imageryProvider ==viewerImageLayers[2]){
						viewer.imageryLayers.remove(viewer.imageryLayers._layers[i]);
					}
				}	
			}else{
				$(ele).addClass('activ');
				viewer.imageryLayers.addImageryProvider(viewerImageLayers[2]);
			}
			onOff2 = !onOff2;
		break;

		default:
		break;
        }
        
}



function tabs(index,ele){
	switch (index) {
		case 0:
			if(on0){
				$(ele).addClass('activ');
				$(ele).children('.uls').show();
			}else{
				$(ele).removeClass('activ');
				$(ele).children('.uls').hide();
			}
			on0 = !on0;
		break;

		case 1:
			if(on1){
				$(ele).addClass('activ');
				$(ele).children('.uls').show();
			}else{
				$(ele).removeClass('activ');
				$(ele).children('.uls').hide();
			}
			on1 = !on1;
		break;

		default:
		break;
        }
        
}









