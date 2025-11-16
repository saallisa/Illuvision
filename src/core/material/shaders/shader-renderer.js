
import { Shader } from '../../shader.js';

/**
 * This is an abstract class that crenders the vertex and fragment shader code
 * for a material and creates a Shader from it.
 */
class ShaderRenderer
{
    constructor()
    {
        if (this.constructor === ShaderRenderer) {
            throw new Error('ShaderRenderer cannot be instantiated directly.');
        }
    }

    /**
     * Renders the vertex shader WGSL code.
     */
    renderVertexCode() {
        throw new Error('Method renderVertexCode not implemented!');
    }

    /**
     * Renders the fragment shader WGSL code.
     */
    renderFragmentCode() {
        throw new Error('Method renderFragmentCode not implemented!');
    }

    /**
     * Creates a shader object from the vertex and fragment shader code
     * rendered by this class.
     */
    getShader()
    {
        return new Shader(
            this.renderVertexCode(),
            this.renderFragmentCode()
        );
    }
}

export {
    ShaderRenderer
};