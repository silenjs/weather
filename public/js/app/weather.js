define(function(require,exports,module){
    var $ = require('jquery');
    var hourlyUrl = 'http://api.openweathermap.org/data/2.5/forecast?';
    var dailyUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?'
        //?&mode=json&lang=zh_cn
    var packUrl = function (config,type) {
        url = type=='hourly'?hourlyUrl:dailyUrl;
        url += config.method=='city'?('&q='+config.data):('&lat='+config.data.lat+'&lon='+config.data.lng);
        url += '&mode=json&lang=zh_cn';
        return url;
    }

    var weather ={
        getForecast: function(type,config,callback){
            //$.when(
            //    $.getJSON(packUrl(config,'hourly')),
            //    $.getJSON(packUrl(config,'daily'))
            //).done(function(hourly,daily){
            //    callback(hourly,daily);
            //})

            var cfg = config,url=packUrl(config,type),cb=callback;
            return function(){
                $.getJSON(url).done(function(data){
                    cb(type,data);
                }).fail(function(){
                    cb(type,null);
                })
            }
        },
        hourlyForecast:function(type,callback){
            //$.getJSON(wUrl)
        },
        dailyForecast:function(type){

        }
    }

    module.exports = weather;
})