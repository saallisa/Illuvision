
import { LambertShader } from './shaders/lambert-shader.js';
import { Color } from '../color.js';
import { Material } from './material.js';

/**
 * Lambert material implementation with vertex and uniform color support.
 * Diffuse lighting calculations.
 */
class LambertMaterial extends Material
{
    constructor(settings = {})
    {
        if (settings.name) {
            super(settings.name);
        } else {
            super('LambertMaterial');
        }

        const mode = settings.colorMode ?? Material.UNIFORM_COLOR;

        if (mode === Material.VERTEX_COLOR ||
            mode === Material.COLOR_BLEND
        ) {
            this.setUseVertexColor(true);
        }

        const shader = LambertShader.createShader(settings.colorMode);
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
    LambertMaterial
};