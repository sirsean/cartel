export const Start = {
    ONE_BUTTERFLY: 'one butterfly',
}

export const Vibe = {
    DARK: 'dark',
    GRITTY: 'gritty',
    RETROFUTURISTIC: 'retrofuturistic',
    MINIMALIST: 'minimalist',
    FLAT: 'flat',
    ANGULAR: 'angular',
    ORIGAMI: 'origami',
    DIGITAL: 'digital',
    SHAKY: 'shaky',
    VIBRANT: 'vibrant',
    FABULOUS: 'fabulous',
    CURIOUS: 'curious',
    BOLD: 'bold',
    SCARED: 'scared',
    SCARY: 'scary',
}

export const Color = {
    WHITE: 'white',
    BLACK: 'black',
    GREY: 'grey',
    RED: 'red',
    ORANGE: 'orange',
    YELLOW: 'yellow',
    GREEN: 'green',
    BLUE: 'blue',
    PURPLE: 'purple',
    PINK: 'pink',
}

export class Prompt {
    constructor({ id, start, vibes, colors }) {
        this.id = id;
        this.start = start;
        this.vibes = vibes;
        this.colors = colors;
    }

    get text() {
        return [
            this._start,
            this._vibe,
            this._colors,
            this._end,
        ].join('; ');
    }

    get _start() {
        return `centered as a PFP, ${this.start}`;
    }

    get _end() {
        return `token: ${this.id}`;
    }

    get _vibe() {
        return this.vibes.join(', ');
    }

    get _colors() {
        return this.colors.join('/');
    }

    get metadata() {
        const attributes = [];
        attributes.push({
            trait_type: 'start',
            value: this.start,
        });
        this.vibes.forEach(vibe => {
            attributes.push({
                trait_type: 'vibe',
                value: vibe,
            });
        });
        this.colors.forEach(color => {
            attributes.push({
                trait_type: 'color',
                value: color,
            });
        });
        return {
            name: `Cartel #${this.id}`,
            description: this.text,
            image: `https://cartel.sirsean.me/images/${this.id}.png`,
            attributes,
        }
    }
}

export class PromptFactory {
    constructor({ start, vibes, colors }) {
        this.start = start;
        this.vibes = vibes;
        this.colors = colors;
    }

    create(id) {
        return new Prompt({
            id,
            start: this.pick(Start, this.start)[0],
            vibes: this.pick(Vibe, this.vibes),
            colors: this.pick(Color, this.colors),
        });
    }

    pick(category, weights) {
        const keys = Object.keys(category);
        return weights.map((weight, index) => ({
            isIncluded: Math.random() < weight,
            index,
        })).filter(({ isIncluded }) => isIncluded)
            .map(({ index }) => keys[index])
            .map(key => category[key])
    }
}