export class ImageGenerator {
    constructor({ accountId, apiKey }) {
        this.accountId = accountId;
        this.apiKey = apiKey;
    }

    async generate(prompt) {
        return fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(this.requestBody(prompt)),
        }).then(res => res.body);
    }

    get url() {
        throw new Error('Not implemented: url');
    }

    requestBody(prompt) {
        throw new Error('Not implemented: requestBody');
    }
}

export class CloudflareStableDiffusionImageGenerator extends ImageGenerator {
    get url() {
        return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;
    }

    requestBody(prompt) {
        return {
            prompt,
            num_steps: 20,
        };
    }
}