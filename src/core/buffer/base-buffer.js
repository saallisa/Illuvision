
/**
 * Base class for WebGPU buffer management with common functionality.
 */
class BaseBuffer
{
    constructor()
    {
        if (this.constructor === BaseBuffer) {
            throw new Error('BaseBuffer cannot be instantiated directly.');
        }
    }

    /**
     * Compiles the buffer. Must be implemented in a child class.
     */
    compile(device) {
        throw new Error('Method compile not implemented!');
    }

    /**
     * Destroys the WebGPU buffer. Must be implemented in a child class.
     */
    destroy() {
        throw new Error('Method destroy not implemented!');
    }

    /**
     * Validates that a buffer value's type is a valid WGSL type.
     */
    static validateBufferValueType(type)
    {
        const validTypes = [
            // Scalar types
            'f32', 'i32', 'u32', 'bool',

            // Vector types
            'vec2<f32>', 'vec2<i32>', 'vec2<u32>', 'vec2<bool>',
            'vec3<f32>', 'vec3<i32>', 'vec3<u32>', 'vec3<bool>',
            'vec4<f32>', 'vec4<i32>', 'vec4<u32>', 'vec4<bool>',

            // Matrix types
            'mat2x2<f32>', 'mat2x3<f32>', 'mat2x4<f32>',
            'mat3x2<f32>', 'mat3x3<f32>', 'mat3x4<f32>',
            'mat4x2<f32>', 'mat4x3<f32>', 'mat4x4<f32>',

            // Common shorthand aliases
            'float', 'int', 'uint',
            'vec2', 'vec3', 'vec4',
            'mat2', 'mat3', 'mat4',
            'mat2x2', 'mat3x3', 'mat4x4'
        ];

        if (!validTypes.includes(type)) {
            throw new TypeError(
                `Invalid type '${type}'. Must be a valid WGSL type.`
            );
        }
    }
}

export {
    BaseBuffer
};