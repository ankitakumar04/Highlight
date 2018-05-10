var vParam = '?utm_campaign=addon&utm_source=webstore';
var lastNewsTm = 0;
var clickedNews = [];
var scrolled = false;
var stoped = {pic:false, list:false};
var isCitrio = false;
var citrioExtensionId = "dcagnhpbnggmbihndfkkhfjojgbaaedo";
var global = {};


chrome.storage.sync.set({pauseInterval:false}, function () {
});

chrome.runtime.sendMessage(citrioExtensionId, {getTargetData:true},
    function (response) {
        if (response) {
            if (response.targetData) {
                vParam = '?utm_campaign=addon&utm_source=citrio';
                isCitrio = true;
                sendStats('opennewshubext');
                console.log('stats: open ext');
            }
        }
    });

function getMenuItems(code, cat) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/getMenuItems?accessToken=ec5e7622a39ba5a09e87fabcce102851&countryCode=' + code;
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            var list = document.getElementById('categories');
            list.innerHTML = '';
            for (var i = 0; i < data.menu_items.length; i++) {
                var li = document.createElement('li');
                var u = document.createElement('a');
                var str = data.menu_items[i].url.replace(/.*org\//, '').replace(/\//,'');
                addHandler(str, u, 'cat');
                u.innerHTML = data.menu_items[i].name;
                u.name = data.menu_items[i].url.replace(/.*org\//, '').replace(/\//,'');
                li.appendChild(u);
                list.appendChild(li);
            }
            document.getElementsByName(cat)[0].parentNode.classList.add('active');
            getLocalizationBundleByCountry(code);
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);

}

function getCountriesList(cur) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/getCountriesList?accessToken=ec5e7622a39ba5a09e87fabcce102851';
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            var list = document.getElementById('countries');
            list.innerHTML = '';
            for (var i = 0; i < data.countries.length; i++) {
                var li = document.createElement('li');
                var u = document.createElement('a');
                var str = data.countries[i].code;
                addHandler(str, u, 'country');
                u.setAttribute('name', data.countries[i].code);
                u.innerHTML = data.countries[i].name;
                if (data.countries[i].code == cur) {
                    li.classList.add('active');
                    document.getElementById('current-country').innerHTML = data.countries[i].name;
                    document.getElementById('all').href = data.countries[i].url + vParam;
                    document.getElementById('logo').href = data.countries[i].url + vParam;
                }
                li.appendChild(u);
                list.appendChild(li);
            }
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}

function getNewsByCat(cat, code, second) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var userOffset = -(new Date().getTimezoneOffset());
    var trackUrl = 'http://newshub.org/api/listNewsByMenuItem?accessToken=ec5e7622a39ba5a09e87fabcce102851&pageID=1&fullContent=NO&newsAmount=30&offsetInMinutes=' + userOffset + '&menuItem=' + cat + '&countryCode=' + code;
    console.log(trackUrl);
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            clearTimeout(timeout);
            data = JSON.parse(xmlhttp.responseText);
            if (data.menu_news.length) {
                var last = 0;
                var last_news = 'last_news_tm_' + code + '_' + cat;
                var new_obj = {};
                var n = (data.menu_news.length < 15) ? data.menu_news.length : 15;
                var m = (data.menu_news.length < 30) ? data.menu_news.length : 30;
                new_obj[last_news] = data.menu_news[0].date_updated_timestamp;
                chrome.storage.sync.get(last_news, function (obj) {
                    if (obj['last_news_tm_' + code + '_' + cat] != undefined) {
                        last = parseInt(obj['last_news_tm_' + code + '_' + cat]);
                        lastNewsTm = parseInt(obj['last_news_tm_' + code + '_' + cat]);
                    } else {
                        lastNewsTm = 0;
                    }
                    chrome.storage.sync.set(new_obj, function () {
                    });
                    addNewsByCat(data.menu_news, 'pic', n, last, false);
                    addNewsByCat(data.menu_news, 'list', m, last, false);
                });
                if (second) showNoNewsInCat();
                checkForRating();
                console.log(m);
                chrome.storage.sync.set({last_updated:getNewDate(data.menu_news[0].date_updated_timestamp), last_list_news:data.menu_news[m - 1].date_updated_timestamp, last_pic_news:data.menu_news[n - 1].date_updated_timestamp}, setNewsAmount(0));
            } else {
                getNewsByCat('news', code, true);
            }
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
    var timeout = setTimeout(function () {
        xmlhttp.abort();
        getNewsByCat('news',code, true);
    },5000);
}

function addNewsByCat(data, view, amount, last, more) {
    var news = document.getElementById('news-' + view);
    if (!more) news.innerHTML = '';
    for (var i = 0; i < amount; i++) {
        var newsItem = document.createElement('div');
        var tl = document.createElement('a');
        var tm = document.createElement('time');
        var p = document.createElement('p');
        newsItem.classList.add('news-item');
        newsItem.setAttribute('id', view + data[i].news_id);
        if (last != 0 && last >= data[i].date_updated_timestamp) {
            newsItem.classList.add('old');
        }
        for (var k = 0; k < clickedNews.length; k++) {
            if (data[i].news_id == clickedNews[k]) newsItem.classList.add('old');
        }
        tl.classList.add('news-title');
        tl.target = '_blank';
        if (parseInt(data[i].embeds_type) != 0) {
            tl.innerHTML = '<img src="images/icon_' + data[i].embeds_type + '.png"/><br/>' + data[i].news_title;
        } else {
            tl.innerHTML = data[i].news_title;
        }
        var tlUrl = data[i].newshubNewsUrl + vParam;
        addHandler(tlUrl, tl, view, data[i].news_id);
        p.innerHTML = data[i].news_content;

        if (view == 'pic') {
            var wrap = document.createElement('div');
            var img = document.createElement('a');
            wrap.classList.add('news-wrap');
            if (!data[i].is_img_default) {
                var imgUrl = data[i].newshubNewsUrl + vParam;
                addHandler(imgUrl, img, view, data[i].news_id);
                img.target = '_blank';
                img.innerHTML = '<img src="' + data[i].img_src + '"/><br/>';
            } else {
                img.style.display = 'none';
            }
            if (new Date(data[i].date_updated_timestamp).toLocaleDateString() == new Date().toLocaleDateString()) {
                tm.innerHTML = convertTime(data[i].date_updated_timestamp);
            } else {
                tm.innerHTML = data[i].date_updated;
            }
            wrap.appendChild(img);
            tl.appendChild(tm);
            wrap.appendChild(tl);
            wrap.appendChild(p);
            newsItem.appendChild(wrap);
        } else {
            tm.innerHTML = convertTime(data[i].date_updated_timestamp);
            if (new Date(data[i].date_updated_timestamp).toLocaleDateString() != new Date().toLocaleDateString()) {
                var day = document.createElement('time');
                day.innerHTML = data[i].local_date;
                tl.appendChild(day);
            }
            newsItem.appendChild(tm);
            newsItem.appendChild(tl);
        }
        if (more) {
            var load = document.getElementById('loader-' + view);
            news.insertBefore(newsItem, load);
        } else {
            news.appendChild(newsItem);
        }
    }

    if (!more) {
        var view_loader = document.createElement('div');
        var loader = new Image();
        loader.onload = function () {
            view_loader.classList.add('news-item');
            view_loader.id = 'loader-' + view;
            view_loader.appendChild(loader);
            news.appendChild(view_loader);
        };
        loader.src = 'images/loader.svg';
    }
}

function getMoreNews(cat, code, tm, view, amount) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var userOffset = -(new Date().getTimezoneOffset());
    var trackUrl = 'http://newshub.org/api/categoryNewsWithTimeOffset?countryCode=' + code + '&category=' + cat + '&offsetInMinutes=' + userOffset + '&lastArticleTimestamp=' + tm + '&newsAmount=15&accessToken=ec5e7622a39ba5a09e87fabcce102851';
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            var last = lastNewsTm;
            if (data.category_news.length) {
                var m = (data.category_news.length < amount) ? data.category_news.length : amount;
                addNewsByCat(data.category_news, view, m, last, true);
                scrolled = false;
                if (view == 'pic') {
                    chrome.storage.sync.set({last_pic_news:data.category_news[m - 1].date_updated_timestamp}, setNewsAmount(0));
                } else {
                    chrome.storage.sync.set({last_list_news:data.category_news[m - 1].date_updated_timestamp}, setNewsAmount(0));
                }
            } else {
                document.getElementById('loader-' + view).style.display = 'none';
                stoped[view]=true;
                scrolled = false;
            }
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}

function getCountryUrl(cur) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/getCountriesList?accessToken=ec5e7622a39ba5a09e87fabcce102851';
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            for (var i = 0; i < data.countries.length; i++) {
                if (data.countries[i].code == cur) {
                    document.getElementById('all').setAttribute('href', data.countries[i].url + vParam);
                    document.getElementById('logo').setAttribute('href', data.countries[i].url + vParam);
                    break;
                }
            }
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}

function getLocalizationBundleByCountry(code) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/getLocalizationBundleByCountry?accessToken=ec5e7622a39ba5a09e87fabcce102851&countryCode=' + code;
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            document.getElementById('all').innerHTML = data["display.name.all.news"];
            document.getElementById('categories').getElementsByTagName('a')[0].innerHTML = document.getElementById('current-country').innerHTML;
            document.getElementById('view').innerHTML = data["extension.view.display.name"] + ':';
            global.nonews = data["extension.no.news.msg"];
            global.checkanother = data["extension.another.news.msg"];
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}


function getWeather(code) {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    var trackUrl = 'http://newshub.org/api/getWeatherByIp?accessToken=ec5e7622a39ba5a09e87fabcce102851&countryCode=' + code;
    xmlhttp.onload = function () {
        if (xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            document.getElementById('weather-icon').src = data.img_url;
            document.getElementById('location').innerHTML = data.location;
            document.getElementById('location').title = data.location;
            document.getElementById('degree').innerHTML = (data.degrees > 0 ? '+' : '') + data.degrees + ' &deg;C';
        } else if (xmlhttp.status == 503) {
            setServiceUnavailable();
        }
    };
    xmlhttp.open("GET", trackUrl, true);
    xmlhttp.send(null);
}


function getNewDate(tm) {
    var d = new Date(tm);
    var n = d.toJSON();
    return n.slice(8, 10) + '-' + n.slice(5, 7) + '-' + n.slice(0, 4) + ' ' + n.slice(11, -5);
}

function addHandler(s, el, c, id) {
    var out = s;
    var handler;
    if (c == 'cat') {
        if (id) {
            handler = function () {
                document.getElementById('categories').childNodes[0].classList.add('active');
                changeCategory(out, this);
            };
        } else {
            handler = function () {
                changeCategory(out, this);
            };
        }

    } else if (c == 'country') {
        handler = function () {
            changeCountry(out, this);
        };
    } else if (c == 'pic') {
        handler = function () {
            var newsId = 'list' + id;
            if (document.getElementById(newsId)) {
                document.getElementById(newsId).classList.add('old');
            }
            if (isCitrio) {
                sendStats('clicknewsnewshubext');
                console.log('stats: news click');
            }
            clickedNews.push(id);
            iterateNews();
            el.parentNode.parentNode.classList.add('old');
            chrome.tabs.create({active:false, url:s});
        }
    } else if (c == 'list') {
        handler = function () {
            var newsId = 'pic' + id;
            if (document.getElementById(newsId)) {
                document.getElementById(newsId).classList.add('old');
            }
            if (isCitrio) {
                sendStats('clicknewsnewshubext');
                console.log('stats: news click');
            }
            clickedNews.push(id);
            iterateNews();
            el.parentNode.classList.add('old');
            chrome.tabs.create({active:false, url:s});
        }
    }
    el.onclick = handler;
}

function changeCountry(code, el) {
    getMenuItems(code, 'news');
    getNewsByCat('news', code);
    stoped['pic'] = false;
    stoped['list'] = false;
    getCountryUrl(code);
    chrome.storage.sync.get(['country_code'], function (obj) {
        document.getElementsByName(obj.country_code)[0].parentNode.classList.remove('active');
        getWeather(code);
    });
    document.getElementById('current-country').innerHTML = el.innerHTML;
    document.getElementsByName(code)[0].parentNode.classList.add('active');
    getLocalizationBundleByCountry(code);
    chrome.storage.sync.set({country_code:code, current_category:'news', last_news_amount:0 });
}

function changeCategory(cat, el) {
    stoped['pic'] = false;
    stoped['list'] = false;
    chrome.storage.sync.get(['country_code', 'current_category'], function (obj) {
        document.getElementsByName(obj.current_category)[0].parentNode.classList.remove('active');
        getNewsByCat(cat, obj.country_code);
    });
    chrome.storage.sync.set({current_category:cat, last_news_amount:0}, function () {
    });
    el.parentNode.classList.add('active');
}

function toggleCategoryList(e) {
    e = e || window.event;
    var list = document.getElementById('cat-list');
    var sl = document.getElementById('sl-cat');
    if (e.target == sl) {
        if (list.style.display == 'none') {
            list.style.display = 'block';
            sl.setAttribute('class', 'active');
        } else {
            list.style.display = 'none';
            sl.removeAttribute('class');
        }
    } else if (e.target.tagName != 'SPAN') {
        list.style.display = 'none';
        sl.removeAttribute('class');
    }
}

function toggleCountryList(e) {
    e = e || window.event;
    var list = document.getElementById('country-list');
    var sl = document.getElementById('sl-country');
    var cur = document.getElementById('current-country');
    var arr = sl.getElementsByClassName('arr')[0];
    if (e.target == sl || e.target == arr || e.target == cur) {
        if (list.style.display == 'none') {
            list.style.display = 'block';
            sl.classList.add('active')
        } else {
            list.style.display = 'none';
            sl.classList.remove('active');
        }
    } else {
        list.style.display = 'none';
        sl.classList.remove('active');
    }
}

function changeView(v) {
    var list = document.getElementById('news-list');
    var pic = document.getElementById('news-pic');
    var picBtn = document.getElementById('pic-view');
    var listBtn = document.getElementById('list-view');
    if (v == 'list' && !listBtn.classList.contains('active')) {
        pic.classList.remove('current');
        pic.classList.add('left-p');
        list.classList.remove('right-p');
        list.classList.add('current');
        listBtn.classList.toggle('active');
        picBtn.classList.toggle('active');
        chrome.storage.sync.set({current_view:'list'}, function () {
        });
    } else if (v == 'pic' && !picBtn.classList.contains('active')) {
        list.classList.remove('current');
        list.classList.add('right-p');
        pic.classList.remove('left-p');
        pic.classList.add('current');
        listBtn.classList.toggle('active');
        picBtn.classList.toggle('active');
        chrome.storage.sync.set({current_view:'pic'}, function () {
        });
    }
}

function elementInViewport(el) {
    if (el) return ((el.offsetTop + el.offsetHeight - el.offsetParent.offsetHeight - el.offsetParent.scrollTop) < 40);
}

function convertTime(tm) {
    var date = new Date(tm);
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var mins = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return hours + ':' + mins;
}

function addToggle(el) {
    el.addEventListener('click', function () {
        el.parentNode.classList.toggle('open');
    });
}

function sendStats(counter) {
    chrome.runtime.sendMessage(citrioExtensionId, {message:'STATISTICS_incrementCounter', counterName:counter, incrementValue:1});
}

function iterateNews() {
    chrome.storage.sync.get(['clicked_news_amount'], function (obj) {
        if (obj.clicked_news_amount != undefined) {
            var n = parseInt(obj.clicked_news_amount) + 1;
            chrome.storage.sync.set({clicked_news_amount:n}, function () {
            });
        } else {
            chrome.storage.sync.set({clicked_news_amount:1}, function () {
            });
        }
    });
}

function showNoNewsInCat() {
    stoped['pic'] = true;
    stoped['list'] = true;
    var interval = setInterval(function () {
        if(document.getElementById('news-list').getElementsByClassName('news-item').length) {
            addNoNewsInCat('pic');
            addNoNewsInCat('list');
            clearInterval(interval);
        }
    },50);
}

function addNoNewsInCat(view) {
    var news = document.getElementById('news-'+view);
    var noNews = document.createElement('div');
    var img = document.createElement('img');
    var p = document.createElement('p');
    var a = document.createElement('a');
    noNews.id = 'no-news';
    img.src = '';
    p.innerHTML = global.nonews;
    a.innerHTML = global.checkanother;
    addHandler('news', a, 'cat',true);
    noNews.appendChild(img);
    noNews.appendChild(p);
    noNews.appendChild(a);
    news.insertBefore(noNews,news.childNodes[0]);
    setTimeout(function (){noNews.style.height = '190px'},500);
}

window.addEventListener('click', function (e) {
    toggleCategoryList(e);
    toggleCountryList(e);
}, false);

document.getElementById('pic-view').addEventListener('click', function () {
    changeView('pic');
});

document.getElementById('list-view').addEventListener('click', function () {
    changeView('list');
});


chrome.storage.sync.get(["country_code", "current_category", "current_view"], function (obj) {
    getMenuItems(obj.country_code, obj.current_category);
    getCountriesList(obj.country_code);
    getNewsByCat(obj.current_category, obj.country_code);
    getWeather(obj.country_code);
    if (obj.current_view == 'pic') {
        document.getElementById('news-pic').classList.add('current');
        document.getElementById('news-list').classList.add('right-p');
        document.getElementById('pic-view').classList.add('active');
    } else if (obj.current_view == 'list') {
        document.getElementById('news-pic').classList.add('left-p');
        document.getElementById('news-list').classList.add('current');
        document.getElementById('list-view').classList.add('active');
    }
});


document.getElementById('news-pic').addEventListener('scroll', function (e) {
    checkMoreNews('pic');

});

document.getElementById('news-list').addEventListener('scroll', function (e) {
    checkMoreNews('list');
});

function checkMoreNews(view) {
    if (!scrolled) {
        if (!stoped[view]) {
            if (elementInViewport(document.getElementById('loader-' + view))) {
                chrome.storage.sync.get(["country_code", "current_category", "last_" + view + "_news"], function (obj) {
                    var m = (view == 'pic' ? 15 : 30);
                    getMoreNews(obj.current_category, obj.country_code, obj['last_' + view + '_news'], view, m);
                    scrolled = true;
                });
            }
        } else {
            document.getElementById('loader-'+view).style.display = 'none';
        }
    }
}



