
import { Color } from '../color.js';
import { Vector3 } from '../vector3.js';
import { Light } from './light.js';

/**
 * Represents the directional light, which is light coming from one direction.
 */
class DirectionalLight extends Light
{
    #direction = null;

    constructor(direction, color = Color.WHITE, intensity = 0.1)
    {
        super(color, intensity);
        this.direction = this.direction = direction;
    }

    /**
     * Returns the point the light is coming from.
     */
    get direction() {
        return this.#direction;
    }

    /**
     * Returns the point the light is coming from.
     */
    set direction(direction)
    {
        Vector3.validateInstance(direction);

        this.#direction = direction;
    }

    /**
     * Returns the storage layout of a directional light.
     */
    static get LAYOUT()
    {
        return {
            direction: 'vec3<f32>',
            color: 'vec3<f32>',
            intensity: 'f32'
        }
    }
}

export {
    DirectionalLight
};