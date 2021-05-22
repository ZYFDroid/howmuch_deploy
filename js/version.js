var versionKey="_version";
var versionName = "2.0.0.2";
var versionCode=2000002;
var cacheName="howmuch_v1";

var devMode = false;
if(devMode){
    versionCode =Math.floor(Math.random() * 999999);
}


if(localStorage.getItem(versionKey)!=null){
    var currentVersion =parseInt(localStorage.getItem(versionKey));
    if(isNaN(currentVersion) || !isFinite(currentVersion) || currentVersion !=versionCode){
        if('serviceWorker' in navigator){
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }
    }
}

localStorage.setItem(versionKey,versionCode);