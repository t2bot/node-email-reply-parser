/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var Parser = require("./lib/Parser");

/**
 * Parses the given text into an email
 * @param {string} text the email text to parse
 * @param {boolean} [visibleTextOnly] if true, the visible text will be returned instead of an Email
 * @returns {Email|string} the parsed Email or visible text, depending on the second argument
 */
function parse(text, visibleTextOnly) {
    var parser = new Parser();
    var email = parser.parse(text);

    if (visibleTextOnly) {
        if (!email) return '';
        else return email.getVisibleText();
    } else return email;
}

module.exports = parse;

// Only run this code if we're the main entry point (useful for quick testing locally)
if (require.main === module) {
    // we only import fs and path here because it is bloat to the library otherwise
    var fs = require('fs');
    var path = require('path');

    if (process.argv.length != 3) {
        console.error("Invalid argument. Syntax: node index.js <file path>");
        process.exit(1);
    }

    var fileContents = fs.readFileSync(process.argv[2], 'utf8');
    var text = parse(fileContents, true);

    console.log(text);
}