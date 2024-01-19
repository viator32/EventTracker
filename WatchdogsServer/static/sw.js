const cacheName = 'v1';

const permanentCacheAssets = ["./images/Logo.png",
    "./images/Logo_resize.png",
    "./images/heatmap-icon.png",
    "./images/label-icon.png",
    "./images/plus-icon.png"];

const changingCacheAssets = [
    "./",
    "./js/main.js",
    "./js/ScriptCreateCalendar.js",
    "./js/Darkmode.js",
    "./css/darkmode-switch.css",
    "./css/header.css",
    "./css/icon-library.css",
    "./css/popup.css",
    "./css/style.css",
    "./css/UnderCalendarSpace.css",];

//Service Worker Install Event
self.addEventListener("install", e => {
    console.log('Service Worker Installed');
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([...permanentCacheAssets, ...changingCacheAssets]);
        } )
    );
});



//Service Worker Activate Event
self.addEventListener('activate', e=> {
    console.log('Service Worker Activated');
});


//Fetch Event
self.addEventListener('fetch', e => {
    console.log("fetch Event");
    e.respondWith(
        caches.open('v2').then(cache => {
            return cache.match(e.request).then(response => {
                if (response) {
                    console.log("found in v2");
                    // v2 im Cache gefunden
                    return response;
                } else {
                    // suche in v1, weil nicht in v2 gefunden
                    return caches.open('v1').then(cache => {
                        return cache.match(e.request).then(response => {
                            if (response) {
                                console.log("found in v1");
                                // v1 wird verwendet
                                return response;
                            } else {
                                console.log("needed network");
                                // nicht gefunden wird vom Netzwerk geholt
                                return fetch(e.request);
                            }
                        });
                    });
                }
            });
        })
    );
});





self.addEventListener('message', event => {
    console.log("got message");
    if (event.data.command === 'updateCache') {
        console.log("updated Cache");
        caches.open('v2').then(cache => {
            return cache.addAll(changingCacheAssets);
        });
    }
});
