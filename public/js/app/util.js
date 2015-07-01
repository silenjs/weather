define(function(require,exports,module){
    module.exports = {
        formatHour:function(hour){
            return hour>10?hour:'0'+hour;
        },
    }
})