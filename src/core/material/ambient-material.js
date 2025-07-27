
import { Engine } from '../../engine.js';
import { Material } from './material.js';
import { ShaderLoader } from '../shader-loader.js';

/**
 * Ambient material implementation with simple uniform color support.
 * Only reacts to ambient lights.
 */
class AmbientMaterial extends Material
{
    constructor(settings = {})
    {
        if (settings.name) {
            super(settings.name);
        } else {
            super('AmbientMaterial');
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
        const material = new AmbientMaterial(settings);

        const shader = await ShaderLoader.loadShader(
            'ambient',
            Engine.getRootPath() + 'core/material/shaders/'
        );

        material.setShader(shader);
        return material;
    }
}

export {
    AmbientMaterial
};