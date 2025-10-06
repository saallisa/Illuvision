
import { Engine } from '../../engine.js';
import { Material } from './material.js';
import { ShaderLoader } from '../shader-loader.js';

/**
 * Lambert material implementation with simple uniform color support.
 * Reacts to all types of lights.
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

        if (settings.color) {
            this.setColor(settings.color);
        }
    }

    /**
     * Initializes the lambert material.
     */
    static async init(settings = {})
    {
        const material = new LambertMaterial(settings);

        const shader = await ShaderLoader.loadShader(
            'lambert',
            Engine.getRootPath() + 'core/material/shaders/'
        );

        material.setShader(shader);
        return material;
    }
}

export {
    LambertMaterial
};