import { ethers } from 'ethers';
import { CloudflareStableDiffusionImageGenerator } from '../../src/lib/image_generator.js';
import { PromptFactory } from '../../src/lib/prompt.js';
import CARTEL_ABI from '../../src/assets/Cartel.json';
import { CARTEL_ADDRESS } from '../../src/address.js';

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

    if (!id) {
        return new Response('Missing ID', { status: 422 })
    }

    // check to make sure the ID has been minted, which does not work locally
    if (env.APP_ENV != 'local') {
        const provider = new ethers.JsonRpcProvider('https://ethereum.sirsean.me/v1/mainnet');
        const contract = new ethers.Contract(CARTEL_ADDRESS, CARTEL_ABI, provider);
        try {
            const owner = await contract.ownerOf(id);
            if (owner == ethers.ZeroAddress) {
                return new Response('Cannot reveal a burned token', { status: 422 })
            }
        } catch (err) {
            return new Response('Not minted', { status: 422 })
        }
    }

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