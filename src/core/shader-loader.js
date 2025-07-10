
import { Loader } from './loader.js';
import { Shader } from './shader.js';

/**
 * Loads WGSL vertex and fragment shader files for WebGPU and creates a Shader
 * instance from them.
 */
class ShaderLoader
{
    /**
     * Load the shader files and create a new Shader instance using their
     * content.
     */
    static async loadShader(name, path = './')
    {
        const vertexFile = name + '.vertex.wgsl';
        const fragmentFile = name + '.fragment.wgsl';

        const vertexSource = await Loader.loadFile(vertexFile, path);
        const fragmentSource = await Loader.loadFile(fragmentFile, path);

        return new Shader(vertexSource, fragmentSource);
    }
}

export {
    ShaderLoader
};