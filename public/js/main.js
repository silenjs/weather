var iconMap = (function(){
    var map={
        // 500 小雨 501 中雨 502 大雨
        '500d':'rain_s',
        '501d':'rain_m',
        '502d':'rain_h',
        '500n':'night_rain',
        '501n':'night_rain',
        '502n':'night_rain',
        '800d':'sun',
        '801d':'sun_cloudy',
        '802d':'cloudy',
        '803d':'cloudy',
        '804d':'sun_cloudy',
        '800n':'night',
        '801n':'night_cloudy',
        '802n':'night_cloudy',
        '803n':'night_cloudy',
        '804n':'night_cloudy',
    }
    return function(code,type){
        return map[code+type.slice(-1)]||(type.slice(-1)=='n'?'night':'sun');
    }
})();
var dayMap = (function () {
    var map = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
    return function (index) {
        return map[index];
    };
})();

function formatHour(hour){
    return hour>10?hour:'0'+hour;
}

+function() {
    var map = document.createElement('script');
    map.src = 'http://webapi.amap.com/maps?v=1.3&key=d06e335a59eabcc27ae1028844b5b8c8&callback=initMap';
    document.body.appendChild(map);
}();

var suixMap = null;
var initMap = function(){
    suixMap = new AMap.Map('mapContainer',{resizeEnable: true});
    getLngLat()
}

function getLngLat(){
    var geolocation;
    suixMap.plugin('AMap.Geolocation',function(){
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        suixMap.addControl(geolocation);
        AMap.event.addListener(geolocation, 'complete', geoSuccess);//返回定位信息
        AMap.event.addListener(geolocation, 'error', geoErr);      //返回定位出错信息
    })
    geolocation.getCurrentPosition();
}

function geoSuccess(pos){
    console.log(pos);
    var lnglatXY = new AMap.LngLat(pos.position.lng,pos.position.lat);
    AMap.service(["AMap.Geocoder"], function() {
        MGeocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
        });
        //逆地理编码
        MGeocoder.getAddress(lnglatXY, function(status, result){
            if(status === 'complete' && result.info === 'OK'){
                formatAddr(result)
            }
        });
    });

}
function geoErr(err){
    console.log(err);
}

function formatAddr(res){
    console.log(res);
    alert(res.regeocode.formattedAddress);
    alert(res.regeocode.addressComponent.province);
    alert(res.regeocode.addressComponent.city);
    alert(res.regeocode.addressComponent.district);
}

+function init(){
    if(navigator.standalone||!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
        window.slogan&&(document.querySelector('.oneday').innerHTML=slogan[Math.floor(Math.random()*slogan.length)]);
        document.querySelector('.loading').style.display="";
        var script = document.createElement('script');
        script.src = "http://api.openweathermap.org/data/2.5/forecast?q=Shenzhen,CN&mode=json&lang=zh_cn&callback=parse";
        document.body.appendChild(script);
    }else{
        document.querySelector('.adddesk').style.display="";
    }

}();

function parse(data){
    var current = data.list.filter(function(item){
        return Date.now()>=item.dt*1000&&Date.now()-item.dt*1000<1000*60*60*3;
    })[0];
    var hours = data.list.filter(function(item){
        return item.dt*1000>Date.now()&&item.dt*1000-Date.now()<1000*60*60*3*7;
    })
    renderToday(current,hours);
    var script = document.createElement('script');
    script.src="http://api.openweathermap.org/data/2.5/forecast/daily?q=Shenzhen,CN&cnt=7&mode=json&lang=zh_cn&callback=renderFuture";
    document.body.appendChild(script);
    setTimeout(function(){
        document.querySelector('.loading').classList.add('loadover');
    },2000)
}

function renderToday(current,hours){
    console.log(arguments);
    var dateStr=new Date().toUTCString().split(' ').slice(0,3).join(' '),
        descStr=current.weather[0].description,
        tempStr=(current.main.temp-273.15).toFixed(1);
    var hoursStr = (function(hours){
        var str = [];
        hours.forEach(function(item){
            str.push('<dl><dt>'+formatHour(new Date(item.dt*1000).getHours())+'</dt><dd><i class="ico ico_'+iconMap(item.weather[0].id,item.weather[0].icon)+'"></i><em>'+Math.round(item.main.temp-273.15)+'℃</em></dd></dl>')
        })
        return str;
    })(hours).join(' ');
    document.body.classList.add('body_'+iconMap(current.weather[0].id,current.weather[0].icon).split('_')[0]);
    document.querySelector('.today').innerHTML = 'Shenzhen '+dateStr+'<strong>'+ descStr +' '+ tempStr +'℃</strong>';
    document.querySelector('.today_weather').innerHTML = '<i class="ico ico_'+iconMap(current.weather[0].id,current.weather[0].icon)+'"></i>';
    document.querySelector('.future24').innerHTML=hoursStr;

}

function renderFuture(data){
    console.log(data);
    var fHtml = '';
    data.list.forEach(function(item){
        fHtml += '<dl>';
        fHtml += '<dt>'+dayMap(new Date(item.dt*1000).getDay())+'</dt>';
        fHtml += '<dd>'
        fHtml += '<i class="ico ico_'+iconMap(item.weather[0].id,'d')+'"></i>';
        fHtml += '<em>'+Math.round(item.temp.day-273.15)+'℃</em>';
        fHtml += '<span>'+(new Date(item.dt*1000).getMonth()+1)+'/'+new Date(item.dt*1000).getDate()+'</span>'
        fHtml += '</dd>';
        fHtml += '</dl>';
    })
    document.querySelector('.future').innerHTML = fHtml;
}