
import { BasicShader } from './shaders/basic-shader.js';
import { Color } from '../color.js';
import { Material } from './material.js';

/**
 * Basic material implementation with simple uniform color support.
 * No lighting calculations - uses flat uniform color.
 */
class BasicMaterial extends Material
{
    constructor(settings = {})
    {
        if (settings.name) {
            super(settings.name);
        } else {
            super('BasicMaterial');
        }

        const mode = settings.colorMode ?? BasicMaterial.UNIFORM_COLOR;

        if (mode === BasicMaterial.VERTEX_COLOR ||
            mode === BasicMaterial.COLOR_BLEND
        ) {
            this.setUseVertexColor(true);
        }

        const shader = BasicShader.createShader(settings.colorMode);
        this.setShader(shader);

        if (mode === BasicMaterial.COLOR_BLEND) {
            this.setColorBlend(settings.colorBlend ?? 0.5);
        }

        if (mode === BasicMaterial.COLOR_BLEND ||
            mode === BasicMaterial.UNIFORM_COLOR
        ) {
            this.setColor(settings.color ?? Color.GREY);
        }
    }

    /**
     * Ensure that the color mode is a valid option.
     */
    static validateColorMode(mode)
    {
        const validModes = [
            BasicMaterial.VERTEX_COLOR,
            BasicMaterial.UNIFORM_COLOR,
            BasicMaterial.COLOR_BLEND
        ];

        if (!validModes.includes(mode)) {
            throw new Error(`Invalid color: ${mode}.`);
        }
    }

    // A list of color modes
    static get VERTEX_COLOR() {
        return 'vertex_color';
    }

    static get UNIFORM_COLOR() {
        return 'uniform_color';
    }

    static get COLOR_BLEND() {
        return 'color_blend';
    }
}

export {
    BasicMaterial
};