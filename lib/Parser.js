/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var Email = require("./Email");
var Fragment = require("./Fragment");
var reverse = require("lodash/reverse");
var filter = require("lodash/filter");
var esrever = require("esrever");

/**
 * Regular Expression to match signatures
 * @type {RegExp}
 */
const SIGNATURE_REGEX = /(?:^\s*--|^\s*__|^-\w|^-- $)|(?:^Sent from my (?:\s*\w+){1,4}$)|(?:^={30,}$)$/;

/**
 * Regular Expression to match quoted material
 * @type {RegExp}
 */
const QUOTE_REGEX = />+$/;

/**
 * Regular Expressions for quoted reply headers ("On <date>, <someone> wrote:")
 * @type {RegExp[]}
 */
const QUOTE_HEADERS_REGEX = [
    /^\s*(On(?:(?!.*On\b|\bwrote:)[\s\S])+wrote:)$/m, // On DATE, NAME <EMAIL> wrote:
    /^\s*(Le(?:(?!.*Le\b|\bécrit:)[\s\S])+écrit :)$/m, // On DATE, NAME <EMAIL> wrote:
    /^\s*(El(?:(?!.*El\b|\bescribió:)[\s\S])+escribió:)$/m, // On DATE, NAME <EMAIL> wrote:
    /^\s*(Il(?:(?!.*Il\b|\bscritto:)[\s\S])+scritto:)$/m, // On DATE, NAME <EMAIL> wrote:
    /^\s*(Op\s[\S\s]+?schreef[\S\s]+:)$/m, // Il DATE, schreef NAME <EMAIL>:
    /^\s*(Em(?:(?!.*Em\b|\bescreveu:)[\s\S])+escreveu:)$/m, // Em DATE, NAME <EMAIL> escreveu:
    /^\s*((W\sdniu|Dnia)\s[\S\s]+?(pisze|napisał(\(a\))?):)$/mu, // W dniu DATE, NAME <EMAIL> pisze|napisał:
    /^\s*(Den\s.+\sskrev\s.+:)$/m, // Den DATE skrev NAME <EMAIL>:
    /^\s*(Am\s.+\sum\s.+\sschrieb\s.+:)$/m, // Am DATE um TIME schrieb NAME:
    /^(在[\S\s]+写道：)$/m, // > 在 DATE, TIME, NAME 写道：
    /^(20[0-9]{2}\..+\s작성:)$/m, // DATE TIME NAME 작성:
    /^(20[0-9]{2}\/.+のメッセージ:)$/m, // DATE TIME、NAME のメッセージ:
    /^(.+\s<.+>\sschrieb:)$/m, // NAME <EMAIL> schrieb:
    /^\s*(From\s?:.+\s?(\[|<).+(\]|>))/mu, // "From: NAME <EMAIL>" OR "From : NAME <EMAIL>" OR "From : NAME<EMAIL>"(With support whitespace before start and before <)
    /^\s*(De\s?:.+\s?(\[|<).+(\]|>))/mu, // "De: NAME <EMAIL>" OR "De : NAME <EMAIL>" OR "De : NAME<EMAIL>"  (With support whitespace before start and before <)
    /^\s*(Van\s?:.+\s?(\[|<).+(\]|>))/mu, // "Van: NAME <EMAIL>" OR "Van : NAME <EMAIL>" OR "Van : NAME<EMAIL>"  (With support whitespace before start and before <)
    /^\s*(Da\s?:.+\s?(\[|<).+(\]|>))/mu, // "Da: NAME <EMAIL>" OR "Da : NAME <EMAIL>" OR "Da : NAME<EMAIL>"  (With support whitespace before start and before <)
    /^(20[0-9]{2}-(?:0?[1-9]|1[012])-(?:0?[0-9]|[1-2][0-9]|3[01]|[1-9])\s[0-2]?[0-9]:\d{2}\s[\S\s]+?:)$/m, // 20YY-MM-DD HH:II GMT+01:00 NAME <EMAIL>:
    /^\s*([a-z]{3,4}\.[\s\S]+\sskrev[\s\S]+:)$/m, // DATE skrev NAME <EMAIL>:
];

/**
 * Represents a fragment that hasn't been constructed (yet)
 * @license MIT License
 */
class FragmentDto {

    /**
     * Creates a new fragment DTO
     */
    constructor() {
        this.lines = [];
        this.isHidden = false;
        this.isSignature = false;
        this.isQuoted = false;
    }

    /**
     * Converts this container to a real fragment
     * @returns {Fragment} the created fragment
     */
    toFragment() {
        var content = esrever.reverse(this.lines.join('\n')).replace(/^\n/, '');
        return new Fragment(content, this.isHidden, this.isSignature, this.isQuoted);
    }
}

/**
 * Represents a parser to get fragments out of an email
 * @licence MIT License
 */
class Parser {

    /**
     * Creates a new parser. If any of the parameters are not given then the defaults will be used
     * @param {RegExp} [signatureRegex] the regular expression used to match signatures
     * @param {RegExp} [quotedLineRegex] the regular expression used to match quoted lines
     * @param {RegExp[]} [quoteHeadersRegex] the regular expressions used to find quoted sections based on the header
     */
    constructor(signatureRegex, quotedLineRegex, quoteHeadersRegex) {
        this._signatureRegex = signatureRegex || SIGNATURE_REGEX;
        this._quotedLineRegex = quotedLineRegex || QUOTE_REGEX;
        this._quoteHeadersRegex = quoteHeadersRegex || QUOTE_HEADERS_REGEX;
    }

    /**
     * Parses an email body and converts it to Fragments.
     * @param {string} text the input text to parse
     * @returns {Email} the parsed email
     */
    parse(text) {
        if (typeof(text) !== "string") return new Email([]);

        var fragments = [];

        text = text.replace("\r\n", "\n");

        // Clean up quoted headers
        for (var exp of this._quoteHeadersRegex) {
            var matches = text.match(exp);
            if (matches && matches.length >= 2) {
                text = text.replace(matches[1], matches[1].replace(/\n/g, ' '));
            }
        }

        var fragment = null;
        for (var line of esrever.reverse(text).split('\n')) {
            line = line.replace(/\n+$/, ''); // trim excess newlines from end of line

            if (!this._isSignature(line)) {
                line = line.replace(/^\s+/, ''); // left trim whitespace from line
            }

            if (fragment) {
                var lastLine = fragment.lines[fragment.lines.length - 1];

                if (this._isSignature(lastLine)) {
                    fragment.isSignature = true;
                    this._addFragment(fragment, fragments);

                    fragment = null;
                } else if (line.length === 0 && this._isQuoteHeader(lastLine)) {
                    fragment.isQuoted = true;
                    this._addFragment(fragment, fragments);

                    fragment = null;
                }
            }

            var isQuoted = this._isQuote(line);

            if (fragment === null || !this._isFragmentLine(fragment, line, isQuoted)) {
                if (fragment) {
                    this._addFragment(fragment, fragments);
                }

                fragment = new FragmentDto();
                fragment.isQuoted = isQuoted;
            }

            fragment.lines.push(line);
        }

        if (fragment) {
            this._addFragment(fragment, fragments);
        }

        var emailFragments = [];
        for (var frag of fragments) {
            emailFragments.push(frag.toFragment());
        }

        return new Email(reverse(emailFragments));
    }

    /**
     * Adds a fragment to the given collection, doing some basic state processing on it before pushing
     * @param {FragmentDto} fragment the fragment to add and update the state of
     * @param {FragmentDto[]} collection the collection to add the fragment to
     * @private
     */
    _addFragment(fragment, collection) {
        if (fragment.isQuoted || fragment.isSignature || fragment.lines.join('').length === 0) {
            fragment.isHidden = true;
        }

        collection.push(fragment);
    }

    /**
     * Determines if the given line is part of the given fragment
     * @param {FragmentDto} fragment the fragment to check
     * @param {string} line the line to check
     * @param {boolean} isQuoted true if the line is quoted, false otherwise
     * @returns {boolean} true if the line belongs to the fragment
     * @private
     */
    _isFragmentLine(fragment, line, isQuoted) {
        if (fragment.isQuoted === isQuoted) return true;

        if (fragment.isQuoted) {
            return this._isQuoteHeader(line) || line.length === 0;
        }

        return false;
    }

    /**
     * Determines if the given line is a signature
     * @param {string} text the text to check
     * @returns {boolean} true if the line is a signature
     * @private
     */
    _isSignature(text) {
        return this._signatureRegex.test(esrever.reverse(text));
    }

    /**
     * Determines if the given line is a quoted line
     * @param {string} text the text to check
     * @returns {boolean} true if the line is a quoted line
     * @private
     */
    _isQuote(text) {
        return this._quotedLineRegex.test(text);
    }

    /**
     * Determines if the given line is a quote header
     * @param {string} text the text to check
     * @returns {boolean} true if the line is a quote header
     * @private
     */
    _isQuoteHeader(text) {
        return filter(this._quoteHeadersRegex, exp => exp.test(esrever.reverse(text))).length > 0;
    }
}

module.exports = Parser;
