define(function(require){
    var mapUrl = 'http://webapi.amap.com/maps?v=1.3&key=d06e335a59eabcc27ae1028844b5b8c8';
    var suixMap=null,mapContainer='mapContainer',mapConfig={resizeEnable: true};
    var suixCity = '深圳';
    var citylist = ['北京市','上海市','广州市','深圳市','杭州市','东莞市'];




    var $=require('jquery'),
        fc=require('fastclick'),
        util=require('app/util'),
        map=require('app/map'),
        weather=require('app/weather');

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

    var initPage = function(){
        if(!navigator.standalone&&navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
            document.querySelector('.loading').style.display="none";
            document.querySelector('.adddesk').style.display="";
        }
    }

    var attachEvent = function(){
        $(document).ready(function(){
            var citylistFragment = document.createDocumentFragment();
            citylist.forEach(function(item){
                var liStr = '</i>'+item+'<a href="javascript:void(0);" class="del"><i class="ico ico_del"></i></a>'
                var li = $('<li></li>').html(liStr)[0];
                citylistFragment.appendChild(li);
            })
            $('#citylist').append(citylistFragment);
            $('#citylist').on('click',function(evt){
                $(this).children().each(function(index,item){
                    $(item).removeClass('cur');
                })
                $(evt.target).addClass('cur');
                suixCity = $(evt.target).text();
                getForecast({
                    method:'city',
                    data:suixCity
                })
            })
            $('#slidebarTrigger').on('click',function(evt){
                evt.stopPropagation();
                $('#slidebar').toggleClass('slidebarIn');
            })
            $('.slidebar_tt').on('click',function(){
                $('#slidebarCity').toggleClass('selectcityIn');
            })
            $(document).on('click',function(evt){
                $('#slidebar').removeClass('slidebarIn');
                $('#slidebarCity').removeClass('selectcityIn');
            })
            $('#slidebar').on('click',function(evt){
                evt.stopPropagation();
            })
        })
    }

    var render = function(type,data){
        (type=='hourly'?renderToday:renderFuture)(data);
        $('#slidebar').removeClass('slidebarIn');
        $('#slidebarCity').removeClass('selectcityIn');
    }
    var renderToday = function(data){
        var current = data.list.filter(function(item){
                return Date.now()>=item.dt*1000&&Date.now()-item.dt*1000<1000*60*60*3;
            })[0]||data.list[0];
        var hours = data.list.filter(function(item){
            return item.dt*1000>Date.now()&&item.dt*1000-Date.now()<1000*60*60*3*7;
        })
        var dateStr=new Date().toUTCString().split(' ').slice(0,3).join(' '),
            descStr=current.weather[0].description,
            tempStr=(current.main.temp-273.15).toFixed(1);
        var hoursStr = (function(hours){
            var str = [];
            hours.forEach(function(item){
                str.push('<dl><dt>'+util.formatHour(new Date(item.dt*1000).getHours())+'</dt><dd><i class="ico ico_'+iconMap(item.weather[0].id,item.weather[0].icon)+'"></i><em>'+Math.round(item.main.temp-273.15)+'℃</em></dd></dl>')
            })
            return str;
        })(hours).join(' ');
        document.body.classList.add('body_'+iconMap(current.weather[0].id,current.weather[0].icon).split('_')[0]);
        document.querySelector('.today').innerHTML = suixCity+' '+dateStr+'<strong>'+ descStr +' '+ tempStr +'℃</strong>';
        document.querySelector('.today_weather').innerHTML = '<i class="ico ico_'+iconMap(current.weather[0].id,current.weather[0].icon)+'"></i>';
        document.querySelector('.future24').innerHTML=hoursStr;

        setTimeout(function(){
            document.querySelector('.loading').classList.add('loadover');
        },2000)
    }
    var renderFuture = function(data){
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
        weather.getForecast('hourly',cfig,function(type,data){
            render.apply(null,arguments);
        })();
        weather.getForecast('daily',cfig,function(type,data){
            render.apply(null,arguments);
        })();
    };

    ;+function(){
        initPage();
        attachEvent();
        map.initMap(mapUrl,mapContainer,mapConfig,initMapHandler);
    }();
})