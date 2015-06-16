var iconMap = (function(){
    var map={
        // 500 小雨 501 中雨 502 大雨
        '500':'rain_s',
        '501':'rain_m',
        '502':'rain_h',
        '800':'sun',
        '801':'sun_cloudy',
        '802':'cloudy',
        '803':'cloudy',
        '804':'day_cloudy',
        //Object {id: 800, main: "Clear", description: "晴", icon: "01d"}
        '01d':'sun',
        //Object {id: 800, main: "Clear", description: "晴", icon: "02d"}
        '02d':'sun',
        //{id: 802, main: "Clouds", description: "多云", icon: "03n"}
        '03n':'cloudy',
        '04n':'cloudy',
        //Object {id: 802, main: "Clouds", description: "多云", icon: "03d"}
        '03d':'cloudy',
        '04d':'day_cloudy',
    }
    return function(code){
        return map[code]||'cloudy';
    }
})();
var dayMap = (function () {
    var map = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
    return function (index) {
        return map[index];
    };
})();

//   .ico_sun:before {content: "\e600";}
//    .ico_cloudy:before {content: "\e609";}
//    .ico_day_cloudy:before {content: "\e605";}
//    .ico_night_cloudy:before {content: "\e602";}
//    .ico_rain_s:before {content: "\e601";}
//    .ico_rain_m:before {content: "\e604";}
//    .ico_rain_h:before {content: "\e603";}
//    .ico_thunder:before {content: "\e606";}
//    .ico_thunder_rain:before {content: "\e607";}
//    .ico_thunder_rain_h:before {content: "\e608";}

+function init(){
    if(navigator.standalone||!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
        var script = document.createElement('script');
        script.src = "http://api.openweathermap.org/data/2.5/forecast/daily?q=Shenzhen,CN&cnt=7&mode=json&lang=zh_cn&callback=parse";
        document.body.appendChild(script);
    }else{
        document.querySelector('.adddesk').style.display="";
    }

}();

function parse(data){
    var list = data.list,dataArr=[];
    list.forEach(function(item){
        dataArr.push({
            'date':item.dt*1000,
            'label':dayMap(new Date(item.dt*1000).getDay()),
            'temp':item.temp,
            'icon':item.weather[0].id,
            'main':item.weather[0].main,
            'desc':item.weather[0].description
        })
    })
    render(dataArr);
    setTimeout(function(){
        document.querySelector('.loading').classList.add('loadover');
    },2000)
}

function render(data){
    renderToday(data[0]);
    renderFuture(data);
}

function renderToday(today){
    var dateStr=new Date(today.date).toUTCString().split(' ').slice(0,3).join(' '),
        descStr=today.desc,
        tempStr=(today.temp.day-273.15).toFixed(1);
    document.querySelector('#today').innerHTML = 'Shenzhen '+dateStr+'<strong>'+ descStr +' '+ tempStr +'℃</strong>';
    document.querySelector('#today_weather').innerHTML = '<i class="ico ico_'+iconMap(today.icon)+'"></i>';
}

function renderFuture(data){
    console.log(data);
    var fHtml = '';
    data.forEach(function(item){
        fHtml += '<dl>';
        fHtml += '<dt>'+item.label+'</dt>';
        fHtml += '<dd>'
        fHtml += '<i class="ico ico_'+iconMap(item.icon)+'"></i>';
        fHtml += '<em>'+Math.round(item.temp.day-273.15)+'℃</em>';
        fHtml += '<span><em>'+Math.round(item.temp.night-273.15)+'℃</em><i class="ico ico_'+iconMap(item.icon)+'"></i><br/>'+(new Date(item.date).getMonth()+1)+'/'+new Date(item.date).getDate()+'</span>'
        fHtml += '</dd>';
        fHtml += '</dl>';
    })
    document.querySelector('.future').innerHTML = fHtml;
}