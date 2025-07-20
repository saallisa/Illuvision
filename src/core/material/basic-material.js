
import { Engine } from '../../engine.js';
import { Material } from './material.js';
import { ShaderLoader } from '../shader-loader.js';

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

        if (settings.color) {
            this.setColor(settings.color);
        }
    }

    /**
     * Initializes the basic material.
     */
    static async init(settings = {})
    {
        const material = new BasicMaterial(settings);

        const shader = await ShaderLoader.loadShader(
            'basic',
            Engine.getRootPath() + 'core/material/shaders/'
        );

        material.setShader(shader);
        return material;
    }
}

export {
    BasicMaterial
};