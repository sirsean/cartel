export const onRequestGet = async ({ params, request, env }) => {
    const { id } = params;
    const obj = await env.CARTEL_NFT.get(`${id}.png`)
    if (!obj) {
        // if the image is not found, redirect to the unrevealed image
        const url = new URL(request.url);
        url.pathname = '/img/unrevealed.png';
        return new Response(null, {
            status: 302,
            headers: {
                'Location': url.href,
            },
        })
    }
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('content-type', 'image/png');
    return new Response(obj.body, {
        headers,
    })
}