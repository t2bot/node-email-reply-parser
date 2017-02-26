/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var fs = require('fs');
var path = require('path');

/**
 * Gets the content of a fixture
 * @param {string} name the name of the fixture to load
 * @returns {string} the fixture contents
 */
function getFixture(name) {
    return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
}

module.exports = {
    getFixture: getFixture
};