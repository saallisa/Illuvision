
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
     * Validates a buffer value to ensure it is only a finite number or an
     * array of finite numbers.
     */
    static validateBufferValue(value)
    {
        if (value === null || value === undefined) {
            throw new TypeError('Buffer value may not be empty!');
        }

        if (typeof value === 'number') {
            if (!isFinite(value)) {
                throw new TypeError('Buffer number value must be finite!');
            }
            return;
        }

        if (Array.isArray(value)) {
            for (const element of value.values()) {
                if (element === null || element === undefined) {
                    throw new TypeError(
                        'Buffer array value may not contain empty values!'
                    );
                }

                if (typeof element === 'number') {
                    if (!isFinite(element)) {
                        throw new TypeError(
                            'Buffer array value must be a finite number!'
                        );
                    }
                }
            }
            return;
        }

        throw new TypeError(
            'Buffer value must be a finite number or array!'
        );
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

    /**
     * Gets the size (number of components) for a given WGSL type.
     */
    static getBufferTypeSize(type)
    {
        const typeSizes = {
            // Scalar types
            'f32': 1, 'i32': 1, 'u32': 1, 'bool': 1,
            'float': 1, 'int': 1, 'uint': 1,

            // Vector types
            'vec2<f32>': 2, 'vec2<i32>': 2, 'vec2<u32>': 2, 'vec2<bool>': 2,
            'vec3<f32>': 3, 'vec3<i32>': 3, 'vec3<u32>': 3, 'vec3<bool>': 3,
            'vec4<f32>': 4, 'vec4<i32>': 4, 'vec4<u32>': 4, 'vec4<bool>': 4,
            'vec2': 2, 'vec3': 3, 'vec4': 4,

            // Matrix types
            'mat2x2<f32>': 4, 'mat2x3<f32>': 6, 'mat2x4<f32>': 8,
            'mat3x2<f32>': 6, 'mat3x3<f32>': 9, 'mat3x4<f32>': 12,
            'mat4x2<f32>': 8, 'mat4x3<f32>': 12, 'mat4x4<f32>': 16,
            'mat2': 4, 'mat3': 9, 'mat4': 16,
            'mat2x2': 4, 'mat3x3': 9, 'mat4x4': 16
        };

        return typeSizes[type] || 1;
    }
}

export {
    BaseBuffer
};