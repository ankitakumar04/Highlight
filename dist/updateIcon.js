! function() {
    var n = function(n, e, a) {
        var t = "http://api.openweathermap.org/data/2.5/weather?id=" + n.id + "&APPID=1ef0ce4e8b21c0a827f07386ab22a757",
            o = new XMLHttpRequest;
        o.open("GET", t, !0), o.onload = function() {
            this.status >= 200 && this.status < 400 ? e(this) : a(this)
        }, o.onerror = function() {
            a(this)
        }, o.send()
    }, e = function(n) {
            var e, a = n.weather[0].icon.substr(0, 2) + ".png";
            try {
                e = {
                    19: "icons/favicons19/" + a,
                    38: "icons/favicons38/" + a
                }
            } catch (t) {
                e = {
                    19: "icons/favicons19/02.png",
                    38: "icons/favicons38/02.png"
                }
            }
            chrome.browserAction.setIcon({
                path: e
            })
        }, a = function() {
            src = {
                19: "icons/favicons19/02.png",
                38: "icons/favicons38/02.png"
            }, chrome.browserAction.setIcon({
                path: src
            })
        }, t = function(n) {
            chrome.storage.sync.get("loc", function(e) {
                e = e.loc && JSON.parse(e.loc);
                var a = {
                    id: e && e.id ? e.id : null,
                    name: e && e.name ? e.name : null
                };
                n(a)
            })
        }, o = function(e) {
            console.log("updating!"), t(function(e) {
                e && e.id && e.name && n(e, function(n) {
                    var e = JSON.parse(n.response);
                    e.setAt = Date.now(), chrome.storage.local.set({
                        currentWeatherData: JSON.stringify(e)
                    })
                }, a)
            })
        }, r = function() {
            chrome.alarms.create("updateIcon", {
                periodInMinutes: 60
            }), chrome.alarms.onAlarm.addListener(o), o()
        };
    chrome.runtime.onInstalled.addListener(r), chrome.runtime.onStartup.addListener(r), chrome.storage.onChanged.addListener(function(n, a) {
        "local" == a && "currentWeatherData" in n && (console.log("data changed!"), n.currentWeatherData.newValue && (data = JSON.parse(n.currentWeatherData.newValue), e(data), chrome.alarms.create("updateIcon", {
            periodInMinutes: 60
        })))
    })
}();