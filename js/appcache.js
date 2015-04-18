/*window.applicationCache.addEventListener('updateready', onUpdateReady);
if (window.applicationCache.status === window.applicationCache.UPDATEREADY)
    onUpdateReady();
function onUpdateReady(e) {
    alert('???');
};*/

/*var appCache = window.applicationCache;
appCache.update();

appCache.addEventListener('cached', cacheEvent, false);
appCache.addEventListener('checking', cacheEvent, false);
appCache.addEventListener('downloading', cacheEvent, false);
appCache.addEventListener('error', cacheError, false);
appCache.addEventListener('noupdate', cacheEvent, false);
appCache.addEventListener('obsolete', cacheEvent, false);
appCache.addEventListener('progress', cacheEvent, false);
appCache.addEventListener('updateready', cacheEvent, false);

function cacheEvent(e) {
    var str;
    switch (appCache.status) {
        case appCache.UNCACHED: // UNCACHED == 0
            str = 'UNCACHED';
            break;
        case appCache.IDLE: // IDLE == 1
            str = 'IDLE';
            break;
        case appCache.CHECKING: // CHECKING == 2
            str = 'CHECKING';
            break;
        case appCache.DOWNLOADING: // DOWNLOADING == 3
            str = 'DOWNLOADING';
            break;
        case appCache.UPDATEREADY:  // UPDATEREADY == 4
            str = 'UPDATEREADY';
            break;
        case appCache.OBSOLETE: // OBSOLETE == 5
            str = 'OBSOLETE';
            break;
        default:
            str = 'UKNOWN CACHE STATUS';
            break;
    }
    alert(str);
};
function cacheError(e) {
    alert('Cache Error');
};*/