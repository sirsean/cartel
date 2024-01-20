import { CloudflareStableDiffusionImageGenerator } from '../../src/lib/image_generator.js';
import { PromptFactory } from '../../src/lib/prompt.js';

class JsonResponse extends Response {
	constructor(body, init) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		super(jsonBody, init);
	}
}

const promptFactory = new PromptFactory({
    start: [1],
    vibes: [1, 1, 1, 1, 1, 0.5, 0.7, 0.4, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2, 0.2],
    colors: [0.9, 0.9, 0.8, 0.3, 0.6, 0.4, 0.2, 0.8, 0.2, 0.1],
})

export const onRequestPost = async ({ request, env }) => {
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get('id');

    // TODO: check to make sure the ID has been minted

    // check to make sure this NFT has not already been revealed
    const obj = await env.CARTEL_NFT.get(`${id}.json`)
    if (obj) {
        return new Response('Already revealed', { status: 422 })
    }

    const prompt = promptFactory.create(id);

    const ig = new CloudflareStableDiffusionImageGenerator({
        accountId: env.ACCOUNT_ID,
        apiKey: env.API_TOKEN,
    });
    const image = await ig.generate(prompt.text);

    await env.CARTEL_NFT.put(`${id}.png`, image);
    await env.CARTEL_NFT.put(`${id}.json`, JSON.stringify(prompt.metadata));

    return new JsonResponse(prompt.metadata)
}