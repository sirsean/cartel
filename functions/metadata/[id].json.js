export const onRequestGet = async ({ params, request, env }) => {
    const { id } = params;
    const obj = await env.CARTEL_NFT.get(`${id}.json`)
    if (!obj) {
        return new Response('Not found', { status: 404 })
    }
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('content-type', 'application/json');
    return new Response(obj.body, {
        headers,
    })
}