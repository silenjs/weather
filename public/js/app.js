define(function(require){
    var mapUrl = 'http://webapi.amap.com/maps?v=1.3&key=d06e335a59eabcc27ae1028844b5b8c8';
    var suixMap=null,mapContainer='mapContainer',mapConfig={resizeEnable: true};




    var main=require('app/main'),map=require('app/map'),weather=require('app/weather');


    var initMapHandler = function(smap){
        suixMap = smap;
        map.getCurrentPosition(getPosHandler)
    }
    var getPosHandler = function(status,pos){
        var forecastCfig = {
            method:'city',
            data:'ShenZhen',
        }
        if(status=='success'){
            forecastCfig.method = 'lnglat';
            forecastCfig.data = {lat:pos.position.lat,lng:pos.position.lng};
        }
        getForecast(forecastCfig);
    }
    var getForecast = function(cfig){
        weather.getForecast('hourly',cfig,function(hourly,daily){
            main.render.apply(null,arguments);
        })();
        weather.getForecast('daily',cfig,function(hourly,daily){
            main.render.apply(null,arguments);
        })();
    };

    ;+function(){
        main.init();
        map.initMap(mapUrl,mapContainer,mapConfig,initMapHandler);
    }();
})