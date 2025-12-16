
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

        const mode = settings.colorMode ?? Material.UNIFORM_COLOR;

        if (mode === Material.VERTEX_COLOR ||
            mode === Material.COLOR_BLEND
        ) {
            this.setUseVertexColor(true);
        }

        const shader = BasicShader.createShader(settings.colorMode);
        this.setShader(shader);

        if (mode === Material.COLOR_BLEND) {
            this.setColorBlend(settings.colorBlend ?? 0.5);
        }

        if (mode === Material.COLOR_BLEND ||
            mode === Material.UNIFORM_COLOR
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
            Material.VERTEX_COLOR,
            Material.UNIFORM_COLOR,
            Material.COLOR_BLEND
        ];

        if (!validModes.includes(mode)) {
            throw new Error(`Invalid color: ${mode}.`);
        }
    }
}

export {
    BasicMaterial
};