// Filename: ./middleware/xssSanitizer.js (or similar)
const xss = require('xss');

// Helper function to recursively sanitize an object or array
const sanitizeData = (data) => {
    if (data === null || typeof data === 'undefined') {
        return data;
    }

    if (typeof data === 'string') {
        // Apply XSS filtering to strings
        return xss(data);
    }

    if (Array.isArray(data)) {
        // If it's an array, sanitize each element
        return data.map(sanitizeData);
    }

    if (typeof data === 'object') {
        // If it's an object, sanitize each value
        const sanitizedObject = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObject[key] = sanitizeData(data[key]);
            }
        }
        return sanitizedObject;
    }

    // Return other data types as is (numbers, booleans)
    return data;
};

const xssSanitizerMiddleware = (req, res, next) => {
    // Sanitize req.body
    if (req.body) {
        req.body = sanitizeData(req.body);
    }

    // Sanitize req.query
    // IMPORTANT: To avoid the "Cannot set property query... which has only a getter" error,
    // we must modify the properties of req.query in place, not reassign req.query itself.
    if (req.query) {
        for (const key in req.query) {
            if (Object.prototype.hasOwnProperty.call(req.query, key)) {
                // req.query[key] will typically be a string or array of strings
                if (typeof req.query[key] === 'string') {
                    req.query[key] = xss(req.query[key]);
                } else if (Array.isArray(req.query[key])) {
                    req.query[key] = req.query[key].map(item => (typeof item === 'string' ? xss(item) : item));
                }
                // If query parameters can be more complex objects (less common),
                // the sanitizeData helper might need to be adapted or used here carefully.
            }
        }
    }

    // Sanitize req.params
    // req.params is usually an object with string values, similar to req.query properties.
    if (req.params) {
        for (const key in req.params) {
            if (Object.prototype.hasOwnProperty.call(req.params, key) && typeof req.params[key] === 'string') {
                req.params[key] = xss(req.params[key]);
            }
        }
    }

    next();
};

module.exports = xssSanitizerMiddleware;
