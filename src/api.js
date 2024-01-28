export function workerUrl(url) {
    if (__APP_ENV__ == 'local') {
        // force API requests to go to the local server
        url = url.replace('https://cartel.sirsean.me', 'http://localhost:8788');
        // force relative URLs to go to the local server
        if (url.startsWith('/')) {
            url = 'http://localhost:8788' + url;
        }
    }
    return url;
}

export async function workerFetch(url, options) {
    return fetch(workerUrl(url), options);
}