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