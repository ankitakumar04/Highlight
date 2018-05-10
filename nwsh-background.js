var firstBrowserOpen = true;

function getCountryCode() {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/countryCodeByIp?accessToken=ec5e7622a39ba5a09e87fabcce102851';
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            chrome.storage.sync.set({country_code:data.countryCode, current_category:'news', last_updated:getNewCurrentDate()},getLastNewsAmount());
        } else if (xmlhttp.status == 503) {
                setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}

function getLastNewsAmount() {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl,last_updated,current_code,current_cat;
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            var amount = parseInt(data.amount);
            setNewsAmount(amount);
	    } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    chrome.storage.sync.get(['last_updated','country_code','current_category', 'pauseInterval'],function (obj){
        last_updated = obj.last_updated;
        current_code = obj.country_code;
        current_cat = obj.current_category;
        trackUrl = 'http://'+current_code+'.newshub.org/api/amount?accessToken=ec5e7622a39ba5a09e87fabcce102851&lastNewsTime='+encodeURIComponent(last_updated)+'&category='+current_cat;
        if (firstBrowserOpen || !obj.pauseInterval) {
            xmlhttp.open("GET", trackUrl, true);
            xmlhttp.send(null);
            firstBrowserOpen = false;
            console.log('Request send');
        } else {
            console.log('Request not send');
        }
    });
}

function setNewsAmount(n) {
    if (n > 0) {
        if (n >= 500) {
            chrome.storage.sync.set({pauseInterval:true},function(){
                console.log('News Amount = ' + n);
            });
        }
        chrome.browserAction.setBadgeText({text: n+''});
        chrome.browserAction.setBadgeBackgroundColor({color:"#000"});
    } else {
        chrome.browserAction.setBadgeText({text: ''});
    }
}

function getNewCurrentDate() {
    var d = new Date();
    var n = d.toJSON();
    return n.slice(8,10)+'-'+n.slice(5,7)+'-'+n.slice(0,4)+ ' ' + n.slice(11,-5);
}

function setServiceUnavailable() {
    var er = document.getElementById('error');
    if(er) {
        document.getElementById('er-img').src = 'images/503.gif';
        er.style.display = 'block';
    }
}

chrome.storage.sync.get(["country_code","current_view"],function (obj){
    if(obj.country_code == undefined) {
        getCountryCode();
    } else {
        getLastNewsAmount();
    }
    if (obj.current_view == undefined) {
        chrome.storage.sync.set({current_view:'pic'},function(){});
    }
});

setInterval(function () {
	getLastNewsAmount();
},30000);

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    var path = 'path=/';
    var domain = 'domain=.newshub.org';
    document.cookie = cname + "=" + cvalue + "; " + expires + '; ' + path + '; ' + domain;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

if (!getCookie('NWSH_EXT')) {
    setCookie('NWSH_EXT',true,1);
}
