function setNewsAmount(n) {
    if (n > 0) {
        if (n >= 500) {
            chrome.storage.sync.set({pauseInterval:true}, function () {
                console.log('News Amount = ' + n);
            });
        }
        chrome.browserAction.setBadgeText({text:n + ''});
        chrome.browserAction.setBadgeBackgroundColor({color:"#000"});
    } else {
        chrome.browserAction.setBadgeText({text:''});
    }
}

function setServiceUnavailable() {
    var er = document.getElementById('error');
    if (er) {
        document.getElementById('er-img').src = 'images/503.gif';
        er.style.display = 'block';
    }
}

function addRankUs() {
    var pic = document.getElementById('news-pic');
    var rn = document.createElement('div');
    var rw = document.createElement('div');
    var first = document.createElement('div');
    var second = document.createElement('div');
    rw.id = 'rate-wrap';
    rn.id = 'rate-us';
    first.innerHTML = '<img src="images/19.png"/><h3>Rate us in Chrome Web Store</h3><span></span><div class="clear"></div>';
    var text1 = document.createElement('p');
    var text2 = document.createElement('p');
    var link1 = document.createElement('a');
    var link2 = document.createElement('a');
    text1.innerHTML = 'If you enjoy using NewsHub Extension, would you mind rating it positively on the Chrome Web Store? It won’t take more than a minute.';
    text2.innerHTML = 'Thank you for your support!';
    link1.innerHTML = 'Rate NewsHub Extension';
    link1.classList.add('rate');
    link1.addEventListener('click', function () {
        var d = new Date().getTime();
        chrome.storage.sync.set({rate_us:true, rate_date:d}, function () {
            chrome.tabs.create({active:true, url:'https://chrome.google.com/webstore/detail/newshub/jnoejnlbkbnckikbkmnpippafneemknp/reviews'});
            closeRankUs();
        });
    });
    link2.innerHTML = 'No, thanks';
    link2.classList.add('cancel');
    link2.addEventListener('click', function () {
        var d = new Date().getTime();
        chrome.storage.sync.set({rate_us:false, rate_date:d}, function () {
            closeRankUs();
        });
    });
    second.appendChild(text1);
    second.appendChild(text2);
    second.appendChild(link1);
    second.appendChild(link2);
    rn.appendChild(first);
    rn.appendChild(second);
    rw.appendChild(rn);
    pic.insertBefore(rw, pic.childNodes[0]);
}

function showRankUs() {
    var rn = document.getElementById('rate-wrap');
    if (rn) {
        rn.style.display = 'block';
        setTimeout(function () {
            rn.style.height = '220px';
        }, 50);
    }
}

function closeRankUs() {
    var rn = document.getElementById('rate-us');
    if (rn) {
        rn.style.height = 0;
        setTimeout(function () {
            rn.style.display = 'none';
        }, 1000);

    }
}


function checkForRating() {
    chrome.storage.sync.get(["ext_date", "clicked_news_amount", "rate_us"], function (obj) {
        if (obj.ext_date != undefined) {
            var hours = (new Date().getTime() - obj.ext_date)/(1000*60*60);
            if (obj.clicked_news_amount > 29 && obj.rate_us == undefined && hours > 48) {
                setTimeout(function () {
                    addRankUs();
                    showRankUs();
                }, 1000);
            }
        } else {
            var d = new Date().getTime();
            chrome.storage.sync.set({ext_date:d}, function () {});
        }
    });
}






