/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var cloneDeep = require('lodash/cloneDeep');
var filter = require('lodash/filter');
var map = require('lodash/map');

/**
 * Represents an email of fragments
 * @licence MIT License
 */
class Email {

    /**
     * Creates a new Email from a collection of Fragments
     * @param {Array<Fragment>} fragments the fragments that complete this email
     */
    constructor(fragments) {
        this._fragments = fragments;
    }

    /**
     * Gets all of the fragments for this email
     * @returns {Array<Fragment>} the fragments of this Email
     */
    getFragments() {
        return cloneDeep(this._fragments);
    }

    /**
     * Gets a string that represents the visible text of this Email
     * @returns {string} the visible text
     */
    getVisibleText() {
        var visibleFragments = filter(this._fragments, f => !f.isHidden());
        var fragmentBodies = map(visibleFragments, f => f.getContent());
        return fragmentBodies.join("\n");
    }
}

module.exports = Email;
