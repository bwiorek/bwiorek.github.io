"use strict";

function setCookie(_name, _value, _expDays) {
    var now = new Date(),
        expiryDate;

    now.setTime(now.getTime() + (_expDays * 24 * 60 * 60 * 1000));
    expiryDate = "expires="+ now.toUTCString();
    document.cookie = _name + "=" + _value + ";" + expiryDate + ";path=/";
}

function getCookie(_name) {
    var name = _name + "=",
        decodedCookie = decodeURIComponent(document.cookie),
        cookiesArr = decodedCookie.split(';');

    if(!cookiesArr)
        return;

    for(var index = 0; index < cookiesArr.length; index++) {
        var cookie = cookiesArr[index];
        
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}