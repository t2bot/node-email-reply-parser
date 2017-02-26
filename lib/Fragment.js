/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */


/**
 * Represents an email fragment (part of the email)
 * @licence MIT License
 */
class Fragment {

    /**
     * Creates a new email fragment
     * @param {string} content the content for the fragment
     * @param {boolean} isHidden true if hidden, false otherwise
     * @param {boolean} isSignature true if this is a signature, false otherwise
     * @param {boolean} isQuoted true if this is quoted, false otherwise
     */
    constructor(content, isHidden, isSignature, isQuoted) {
        this._content = content;
        this._isHidden = isHidden;
        this._isSignature = isSignature;
        this._isQuoted = isQuoted;
    }

    /**
     * Gets the content of the fragment
     * @returns {string} the content
     */
    getContent() {
        return this._content;
    }

    /**
     * Gets whether or not this fragment is considered hidden
     * @returns {boolean} true if considered hidden, false otherwise
     */
    isHidden() {
        return this._isHidden;
    }

    /**
     * Gets whether or not this is a signature element
     * @returns {boolean} true if a signature element, false otherwise
     */
    isSignature() {
        return this._isSignature;
    }

    /**
     * Gets whether or not this is a quoted element
     * @returns {boolean} true if this is a quoted element, false otherwise
     */
    isQuoted() {
        return this._isQuoted;
    }

    /**
     * Gets whether or no this element is considered empty
     * @returns {boolean} true if empty, false otherwise
     */
    isEmpty() {
        return this.getContent().replace('\n', '').length === 0;
    }
}

module.exports = Fragment;