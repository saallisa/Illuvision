
/**
 * Loads a file from the given path.
 */
class Loader
{
    static #cache = new Map();

    /**
     * Loads a files content and returns it as a string.
     */
    static async loadFile(name, path = './')
    {
        this.#validateFileName(name);
        this.#validateFilePath(path);

        const fullPath = this.#normalizePath(path) + name;

        // Try to get from cache
        if (this.#cache.has(fullPath)) {
            return this.#cache.get(fullPath);
        }

        // Otherwise load from server
        const file = await this.#loadFile(fullPath);
        this.#cache.set(fullPath, file);
        return file;
    }

    /**
     * Validates that the file name is a non-empty string.
     */
    static #validateFileName(name)
    {
        if (typeof name !== 'string') {
            throw new TypeError('File name must be a string.');
        }

        if (name.trim().length === 0) {
            throw new Error('File name cannot be empty.');
        }
    }

    /**
     * Validates that the file path is a string.
     */
    static #validateFilePath(path)
    {
        if (typeof path !== 'string') {
            throw new TypeError('Path must be a string.');
        }
    }

    /**
     * Normalizes the path to always end with one trailing slash.
     * Also fills an empty path to load from current directory.
     */
    static #normalizePath(path)
    {
        if (path.length === 0) {
            return './';
        }

        if (path.endsWith('/')) {
            return path;
        }

        return path + '/';
    }

    /**
     * Loads a file from the given full file path.
     */
    static async #loadFile(filePath)
    {
        try {
            const response = await fetch(filePath);
        
            if (!response.ok) {
                const status = response.status;
                const message = response.statusText;

                throw new Error(
                    'Failed to load file: ' 
                    + `${filePath} (HTTP ${status}: ${message})`
                );
            }
            
            return await response.text();
        }
        catch (error) {
            if (error instanceof TypeError) {
                throw new Error(
                    'Network error loading file: '
                    + `${filePath}. ${error.message}`
                );
            }

            throw error;
        }
    }
}

export {
    Loader
};