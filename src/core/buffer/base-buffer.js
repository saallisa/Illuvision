
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

    /**
     * Gets the alignment requirement for a given WGSL type in bytes.
     * This follows WGSL memory layout rules.
     */
    static getBufferTypeAlignment(type)
    {
        const alignments = {
            // Scalar types
            'f32': 4, 'i32': 4, 'u32': 4, 'bool': 4,
            'float': 4, 'int': 4, 'uint': 4,

            // Vector types
            'vec2<f32>': 8, 'vec2<i32>': 8, 'vec2<u32>': 8, 'vec2<bool>': 8,
            'vec3<f32>': 16, 'vec3<i32>': 16, 'vec3<u32>': 16, 'vec3<bool>': 16,
            'vec4<f32>': 16, 'vec4<i32>': 16, 'vec4<u32>': 16, 'vec4<bool>': 16,
            'vec2': 8, 'vec3': 16, 'vec4': 16,

            // Matrix types
            'mat2x2<f32>': 8, 'mat2x3<f32>': 16, 'mat2x4<f32>': 16,
            'mat3x2<f32>': 8, 'mat3x3<f32>': 16, 'mat3x4<f32>': 16,
            'mat4x2<f32>': 8, 'mat4x3<f32>': 16, 'mat4x4<f32>': 16,
            'mat2': 8, 'mat3': 16, 'mat4': 16,
            'mat2x2': 8, 'mat3x3': 16, 'mat4x4': 16
        };

        return alignments[type] || 4;
    }

    /**
     * Gets the stride (padded size) for a given WGSL type in bytes.
     * This accounts for alignment padding.
     */
    static getBufferTypeStride(type)
    {
        const strides = {
            // Scalar types
            'f32': 4, 'i32': 4, 'u32': 4, 'bool': 4,
            'float': 4, 'int': 4, 'uint': 4,

            // Vector types
            'vec2<f32>': 8, 'vec2<i32>': 8, 'vec2<u32>': 8, 'vec2<bool>': 8,
            'vec3<f32>': 16, 'vec3<i32>': 16, 'vec3<u32>': 16, 'vec3<bool>': 16,
            'vec4<f32>': 16, 'vec4<i32>': 16, 'vec4<u32>': 16, 'vec4<bool>': 16,
            'vec2': 8, 'vec3': 16, 'vec4': 16,

            // Matrix types
            'mat2x2<f32>': 16, 'mat2x3<f32>': 32, 'mat2x4<f32>': 32,
            'mat3x2<f32>': 24, 'mat3x3<f32>': 48, 'mat3x4<f32>': 48,
            'mat4x2<f32>': 32, 'mat4x3<f32>': 64, 'mat4x4<f32>': 64,
            'mat2': 16, 'mat3': 48, 'mat4': 64,
            'mat2x2': 16, 'mat3x3': 48, 'mat4x4': 64
        };

        return strides[type] || 4;
    }

    /**
     * Calculates the total struct size including alignment padding.
     */
    static calculateStructSize(layout)
    {
        let offset = 0;
        let minAlignment = 4;

        for (const [name, type] of Object.entries(layout)) {
            const alignment = this.getBufferTypeAlignment(type);
            const stride = this.getBufferTypeStride(type);
            
            minAlignment = Math.max(minAlignment, alignment);
            
            // Align current offset to field requirement
            offset = Math.ceil(offset / alignment) * alignment;
            offset += stride;
        }

        // Align final struct size to largest member alignment
        return Math.ceil(offset / minAlignment) * minAlignment;
    }

    /**
     * Calculates field offsets within a struct considering WGSL
     * alignment rules.
     */
    static calculateFieldOffsets(layout)
    {
        const offsets = new Map();
        let offset = 0;

        for (const [name, type] of Object.entries(layout)) {
            const alignment = this.getBufferTypeAlignment(type);
            const stride = this.getBufferTypeStride(type);
            
            // Align offset to field requirement
            offset = Math.ceil(offset / alignment) * alignment;
            offsets.set(name, offset);
            offset += stride;
        }

        return offsets;
    }

    /**
     * Validates that a buffer value with a specific type has the right size.
     */
    static validateBufferValueSize(value, type)
    {
        const expectedSize = BaseBuffer.getBufferTypeSize(type);

        if (typeof value === 'number') {
            if (expectedSize !== 1) {
                throw new TypeError(
                    `Expected array of ${expectedSize} elements for ` +
                    `type '${type}', got single number.`
                );
            }
        } else if (Array.isArray(value)) {
            if (value.length !== expectedSize) {
                throw new TypeError(
                    `Expected array of ${expectedSize} elements for ` +
                    `type '${type}', got ${value.length}.`
                );
            }
        } else {
            throw new TypeError(
                `Field value must be a number or array for type '${type}'.`
            );
        }
    }

    /**
     * Flattens values into a Float32Array.
     */
    static flattenValues(values)
    {
        const flatValues = [];

        for (const value of values) {
            if (Array.isArray(value)) {
                flatValues.push(...value);
            } else {
                flatValues.push(value);
            }
        }

        return new Float32Array(flatValues);
    }

    /**
     * Pads a vec3 value to vec4 for proper alignment.
     */
    static padVec3ToVec4(value, paddingValue = 0)
    {
        if (Array.isArray(value) && value.length === 3) {
            return [...value, paddingValue];
        }

        return value;
    }
}

export {
    BaseBuffer
};