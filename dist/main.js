var components=function()
	{var e=function(e,t,n)
		{var a=document.createElement(e);
		for(var r in t)a.setAttribute(r,t[r]);	
		return a.innerHTML=n||null,a},
		t=function(t){this.attrs=t,
		this.render=function(){var t=e("div",{"class":"current"}),
		n=e("img",{"class":"current-img",src:this.attrs.img,alt:"icon"}),
		a=e("div",{"class":"weather"});
		
		return a.appendChild(e("span",{},this.attrs.temp+"&deg")),
		a.appendChild(e("span",{},this.attrs.desc)),
		t.appendChild(n),t.appendChild(a),t}},
		n=function(t){
		this.attrs=t,
		this.render=function(){
		var t=e("div",{"class":"period"});
		return t.appendChild(e("span",{"class":"time"},this.attrs.time)),
		t.appendChild(e("img",{src:this.attrs.img,alt:"icon"})),
		t.appendChild(e("span",{"class":"temp"},
		this.attrs.temp+"&deg")),
		t.appendChild(e("span",{"class":"precip"},
		this.attrs.precip+this.attrs.length_unit)),t}},
		a=function(t){this.attrs=t,
		this.render=function(){
		for(var t=e("div",{"class":"today"}),
		a=new n,
		r=this.attrs.today.length,i=0;r>i;i++)a.attrs=this.attrs.today[i],
		t.appendChild(a.render());return t}},
		r=function(t){this.attrs=t,
		this.render=function(){
		var t=e("div",{"class":"weather"},
		'<span class="temp">'+this.attrs.temp+'&deg</span><span class="description">'+this.attrs.desc+"</span>"),
		n=e("div",{"class":"date"},'<p class="weekday">'+this.attrs.weekday+'</p><p class="month">'+this.attrs.month+"</p>"),
		a=e("div",{"class":"img-wrapper"});
		a.appendChild(e("img",{src:this.attrs.img,alt:"icon"}));
		var r=e("div",{"class":"day"});
		return r.appendChild(a),
		r.appendChild(t),
		r.appendChild(n),r}},
		i=function(t){
		this.attrs=t,
		this.render=function(){
		for(var t=e("div",{"class":"forecast"}),
		n=new r,a=this.attrs.days.length,i=0;a>i;i++)n.attrs=this.attrs.days[i],
		t.appendChild(n.render());return t}
		},
		s=function(t){this.attrs=t,
		this.render=function(){
		var t=e("span",{"data-id":this.attrs.id},
		this.attrs.name),
		n=e("span",{},this.attrs.temp+"&deg;"),
		a=e("div",{"class":"location"});
		return a.appendChild(t),a.appendChild(n),a}},
		o=function(t){this.atts=t,
		this.render=function(){
		return e("div",{id:"location-spinner","class":"spinner",style:"display: block;"},"<div></div><div></div><div></div>")}};
		return{Current:t,Period:n,Today:a,Day:r,Forecast:i,Location:s,LocationSpinner:o}}(),
		helpers=function(){
		var e=function(e,t,n,a){var r=new XMLHttpRequest;r.open(t,e,!0),
		r.onload=function(){this.status>=200&&this.status<400?n(this):a(this)},
		r.onerror=function(){a(this)},r.send()},t=function(e){for(var t=e.length,n=0;t>n;n++)if(!e[n])return!1;return!0},
		n=function(e){
		var t=18e5;
		return Date.now()-e>t},
		a=function(e,t){return e-=273.15,"imperial"==t&&(e=1.8*e+32),
		Math.round(e)},r=function(e,t){
		return"imperial"==t&&(e=.03937*e),e};
		return{ajax:e,arrayAllTrue:t,cacheExpired:n,convertTemp:a,convertLength:r}}(),
		main=function(){
		var e=function(e){
		var t=new components.Current(e.current),
		n=new components.Today({today:e.today}),
		a=new components.Forecast({days:e.forecast}),
		r=document.getElementById("main");
		r.innerHTML="",
		r.appendChild(t.render()),
		r.appendChild(document.createElement("hr")),
		r.appendChild(n.render()),
		r.appendChild(document.createElement("hr")),
		r.appendChild(a.render()),document.getElementById("no-location").style.display="none"},
		t=function(e,t){
		chrome.storage.sync.get("units",function(n){var a,r,i=n.units||"metric",
		s=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
		o=["January","February","March","April","May","June","July","August","September","October","November","December"],
		c={img:"icons/"+e[0].weather[0].icon.substr(0,2)+".png",temp:helpers.convertTemp(e[0].main.temp,i),desc:e[0].weather[0].main},l=[];
		for(a=0;5>a;a++){
		r=new Date(1e3*e[1].list[a].dt);
		var d="0"+r.getHours();
		d=d.substr(d.length-2);
		var p="0"+r.getMinutes();
		p=p.substr(p.length-2);
		var u=0;
		e[1].list[a].rain?u=+e[1].list[a].rain["3h"]||0:e[1].list[a].snow&&(u=+e[1].list[a].snow["3h"]||0),
		u=helpers.convertLength(u,i).toFixed(2),
		length_unit="imperial"==i?"in":"mm",
		l.push({img:"icons/"+e[1].list[a].weather[0].icon.substr(0,2)+".png",temp:helpers.convertTemp(e[1].list[a].main.temp,i),
			precip:u,length_unit:length_unit,time:d+":"+p})}
			var m=[];
			for(a=0;5>a;a++)
			r=new Date(1e3*e[2].list[a].dt),
			m.push({img:"icons/"+e[2].list[a].weather[0].icon.substr(0,2)+".png",temp:helpers.convertTemp(e[2].list[a].temp.max,i),
			desc:e[2].list[a].weather[0].main,weekday:s[r.getDay()],month:o[r.getMonth()]+" "+r.getDate()});t({current:c,today:l,forecast:m})})},
			n=function(e,t,n,a,r){
			chrome.storage.local.get(e,function(i){if(i[e]&&!helpers.cacheExpired(JSON.parse(i[e]).setAt))n[a]=JSON.parse(i[e]),
			helpers.arrayAllTrue(n)&&r(n);else{var s=document.getElementById("spinner");
			s.style.display="block",helpers.ajax(t,"GET",function(t){var i=JSON.parse(t.response);n[a]=i;
			var o={};i.setAt=Date.now(),o[e]=JSON.stringify(i),chrome.storage.local.set(o),helpers.arrayAllTrue(n)&&(r(n),s.style.display="none",document.getElementById("error-message").style.display="none")},function(){console.log("error"),s.style.display="none",document.getElementById("error-message").style.display="block"})}})},a=function(){chrome.storage.sync.get("loc",function(a){if(a=a.loc&&JSON.parse(a.loc),!(a&&a.id&&a.name))return document.getElementById("sidebar").style.display="block",void(document.getElementById("no-location").style.display="block");var r={id:a.id,name:a.name},i=[null,null,null],s=function(n){t(n,e)};n("currentWeatherData","http://api.openweathermap.org/data/2.5/weather?id="+r.id+"&APPID=1ef0ce4e8b21c0a827f07386ab22a757",i,0,s),n("todayWeatherData","http://api.openweathermap.org/data/2.5/forecast?id="+r.id+"&APPID=1ef0ce4e8b21c0a827f07386ab22a757",i,1,s),n("forecastWeatherData","http://api.openweathermap.org/data/2.5/forecast/daily?id="+r.id+"&APPID=1ef0ce4e8b21c0a827f07386ab22a757",i,2,s),document.getElementById("location").innerText=r.name.substr(0,1).toUpperCase()+r.name.substr(1)}),chrome.storage.sync.get("units",function(e){for(var t=e.units||"metric",n=document.getElementsByClassName("units-btn"),a=n.length,r=0;a>r;r++)n[r].dataset.units==t?n[r].setAttribute("class","units-btn active"):n[r].setAttribute("class","units-btn")})};return{init:a}}(),interactions=function(){var e=function(){var e=document.getElementById("sidebar");"block"===e.style.display?e.style.display="none":e.style.display="block"},t=function(){chrome.storage.local.clear(),main.init()},n=function(e,n,a){chrome.storage.sync.set({units:e.target.dataset.units});for(var r=a.length,i=0;r>i;i++)a[i].setAttribute("class","units-btn");a[n].setAttribute("class","units-btn active"),t()},a=function(n){var a=n.target.dataset.id;chrome.storage.local.get("locNames",function(n){if(n&&n.locNames){var r=JSON.parse(n.locNames)[a];chrome.storage.sync.set({loc:JSON.stringify({name:r,id:a})},function(n){t(),e();var a=document.getElementById("locations");a.innerHTML="",document.getElementById("location-input").value="",chrome.storage.local.remove("locNames")})}})},r=function(e){var t=document.getElementById("locations");t.innerHTML="",t.appendChild((new components.LocationSpinner).render());var n=document.getElementById("location-input").value;helpers.ajax("http://api.openweathermap.org/data/2.5/find?&q="+n+"&type=like&sort=population&APPID=1ef0ce4e8b21c0a827f07386ab22a757","GET",function(e){chrome.storage.sync.get("units",function(n){var r=n.units||"metric",i=JSON.parse(e.response),s={};t.innerHTML="";var o=new components.Location;i.list.map(function(e){var n=e.name+", "+e.sys.country,i=e.id,c=helpers.convertTemp(e.main.temp,r);o.attrs={name:n,id:i,temp:c};var l=o.render();l.children[0].onclick=a,t.appendChild(l),s[e.id]=e.name}),chrome.storage.local.set({locNames:JSON.stringify(s)})})},function(e){console.log("error"),t.innerHTML="";var n=document.createElement("p");n.setAttribute("id","locations-error"),n.innerText="Unable to search for locations.",t.appendChild(n)})},i=function(e){e.stopPropagation()},s=function(e){var t=document.getElementById("sidebar");"block"===t.style.display&&(t.style.display="none")};
			document.getElementById("menu-icon").onclick=e,document.getElementById("refresh").onclick=t,
			document.getElementById("search").onclick=r,document.getElementById("menu").onclick=i,document.getElementById("main").onclick=s,document.getElementById("location-input").onkeypress=function(e){13==e.keyCode&&r(e)};
			var o=document.getElementsByClassName("units-btn");
			Array.prototype.forEach.call(o,function(e,t,a){e.onclick=function(e){n(e,t,a)}})}();
			main.init();