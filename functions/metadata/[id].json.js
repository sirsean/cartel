export const onRequestGet = async ({ params, request, env }) => {
    const { id } = params;
    const obj = await env.CARTEL_NFT.get(`${id}.json`)
    if (!obj) {
        // if the metadata is not found, generate the unrevealed metadata
        return new Response(JSON.stringify({
            name: `Cartel #${id}`,
            description: `No metadata found for Cartel #${id}, this is unrevealed!`,
            image: `https://cartel.sirsean.me/images/${id}.png`,
        }), {
            headers: { 'content-type': 'application/json' },
        })
    }
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('content-type', 'application/json');
    return new Response(obj.body, {
        headers,
    })
}