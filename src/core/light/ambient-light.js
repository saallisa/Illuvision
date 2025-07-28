
import { Color } from '../color.js';
import { Light } from './light.js';

/**
 * Represents the ambient light, which is light coming from every direction.
 */
class AmbientLight extends Light
{
    constructor(color = Color.WHITE, intensity = 0.1) {
        super(color, intensity);
    }
}

export {
    AmbientLight
};