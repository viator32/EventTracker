const cacheName = 'v1';

const cacheAssets = [
    "./",
    "./js/main.js",
    "./js/ScriptCreateCalendar.js",
    "./js/Darkmode.js",
    "./css/darkmode-switch.css",
    "./css/header.css",
    "./css/icon-library.css",
    "./css/popup.css",
    "./css/style.css",
    "./css/UnderCalendarSpace.css",
    "./images/Logo.png",
    "./images/Logo_resize.png",
    "./images/heatmap-icon.png",
    "./images/label-icon.png",
    "./images/plus-icon.png",
    "./images/delete-icon.png",
    "./images/dropdown_arrow-grey.png",
    "./images/dropdown_arrow.png",
    "./images/heatmap-icon-grey.png",
    "./images/label-icon-grey.png",
    "./images/plus-icon-grey.png",
    "./images/progress-icon.png",
    "./images/progress-icon-grey.png",
    "./images/settings-icon.png",
    "./images/settings-icon-grey.png"
];



//Service Worker Install Event
self.addEventListener("install", e => {
    console.log('Service Worker Installed');
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(cacheAssets);
        } )
    );
});


//Service Worker Activate Event
self.addEventListener('activate', e=> {
    console.log('Service Worker Activated');
    //Remove old caches
    e.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cache => {
                if(cache !== cacheName){
                    console.log('Service Worker cleanes old cache');
                    return caches.delete(cache);
                }
            })
        )
    }))
});


//Fetch Event
self.addEventListener('fetch', e => {
    console.log("fetch Event");
    caches.match(e.request).then(response => {
        return response || fetch(e.request);
    })
});