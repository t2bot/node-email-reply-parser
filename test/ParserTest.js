/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var util = require("./utils");
//var describe = require("mocha").describe;
//var it = require("mocha").it;
var assert = require("assert");
var _ = require("lodash");
var Parser = require("../lib/Parser");

const COMMON_FIRST_FRAGMENT = "Fusce bibendum, quam hendrerit sagittis tempor, dui turpis tempus erat, pharetra sodales ante sem sit amet metus.\n" +
    "Nulla malesuada, orci non vulputate lobortis, massa felis pharetra ex, convallis consectetur ex libero eget ante.\n" +
    "Nam vel turpis posuere, rhoncus ligula in, venenatis orci. Duis interdum venenatis ex a rutrum.\n" +
    "Duis ut libero eu lectus consequat consequat ut vel lorem. Vestibulum convallis lectus urna,\n" +
    "et mollis ligula rutrum quis. Fusce sed odio id arcu varius aliquet nec nec nibh.";

const DATE_FORMATS = [
    'On Tue, 2011-03-01 at 18:02 +0530, Abhishek Kona wrote:',
    '2014-03-20 8:48 GMT+01:00 Rémi Dolan <do_not_reply@dolan.com>:', // Gmail
    '2014-03-20 20:48 GMT+01:00 Rémi Dolan <do_not_reply@dolan.com>:', // Gmail
    '2014-03-09 20:48 GMT+01:00 Rémi Dolan <do_not_reply@dolan.com>:', // Gmail
    'Le 19 mars 2014 10:37, Cédric Lombardot <cedric.lombardot@gmail.com> a écrit :', // Gmail
    'El 19/03/2014 11:34, Juan Pérez <juan.perez@mailcatch.com> escribió:', // Gmail in spanish
    'Em ter., 01 de mar. de 2011 às 18:02, Abhishek <juan.perez@mailcatch.com> escreveu:', // Gmail in PT-BR
    'W dniu 7 stycznia 2015 15:24 użytkownik Paweł Brzoski <pbrzoski91@gmail.com> napisał:', //Gmail in polish
    'Le 19/03/2014 11:34, Georges du chemin a écrit :', // Thunderbird
    'W dniu 2015-01-07 14:23, pbrzoski91@gmail.com pisze: ', // Thunderbird in polish
    'Den 08/06/2015 kl. 21.21 skrev Test user <test@example.com>:', // Danish
    'Am 25.06.2015 um 10:55 schrieb Test user:', // German 1
    'Test user <test@example.com> schrieb:', // German 2
    '在 2016年11月8日，下午2:23，Test user <test@example.com> 写道：', // Chinese Apple Mail iPhone parsed html
    '2016. 11. 8. 오후 12:39 Test user <test@example.com> 작성:', // Korean Apple Mail iPhone
    '2016/11/08 14:26、Test user <test@example.com> のメッセージ:', // Japanese Apple Mail iPhone
    "tir. 18. apr. 2017 kl. 13:09 skrev Test user <test@example.com>:", // Norwegian Gmail
];

const FROM_HEADERS = [
    'From: foo@example.com <foo@example.com>',
    'De: foo@example.com <foo@example.com>',
    'Van: foo@example.com <foo@example.com>',
    'Da: foo@example.com <foo@example.com>',
];

describe('the Parser', function () {
    it('should parse a simple body', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_1.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 3, 'Wrong number of fragments');

        for (var fragment of fragments) {
            assert.equal(fragment.isQuoted(), false, 'Fragment should not be quoted');
        }

        assert.equal(fragments[0].isSignature(), false, 'First fragment is not supposed to be a signature');
        assert.equal(fragments[1].isSignature(), true, 'Second fragment is supposed to be a signature');
        assert.equal(fragments[2].isSignature(), true, 'Third fragment is supposed to be a signature');

        assert.equal(fragments[0].isHidden(), false, 'First fragment should be visible');
        assert.equal(fragments[1].isHidden(), true, 'Second fragment should not be visible');
        assert.equal(fragments[2].isHidden(), true, 'Third fragment should not be visible');

        var fragMessage =
            "Hi folks\n\n" +
            "What is the best way to clear a Riak bucket of all key, values after\n" +
            "running a test?\n" +
            "I am currently using the Java HTTP API.\n";
        var fragSignature =
            "_______________________________________________\n" +
            "riak-users mailing list\n" +
            "riak-users@lists.basho.com\n" +
            "http://lists.basho.com/mailman/listinfo/riak-users_lists.basho.com\n";

        assert.equal(fragments[0].getContent(), fragMessage, 'First fragment has the wrong content');
        assert.equal(fragments[1].getContent(), "-Abhishek Kona\n\n", 'Second fragment has the wrong content');
        assert.equal(fragments[2].getContent(), fragSignature, 'Third fragment has the wrong content');
    });

    it('should not hang on to email instances', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_1.txt");

        var email1 = parser.parse(fixture);
        var email2 = parser.parse(fixture);

        assert.notStrictEqual(email1, email2, 'Email instances should not be the same');
        assert.deepEqual(email1, email2, 'Email instances should have been the same'); // should be same content
    });

    it('should read the first post in a message', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_3.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 5, 'Wrong number of fragments');

        assert.equal(fragments[0].isQuoted(), false, 'First fragment should not be quoted');
        assert.equal(fragments[1].isQuoted(), false, 'Second fragment should not be quoted');
        assert.equal(fragments[2].isQuoted(), true, 'Third fragment should be quoted');
        assert.equal(fragments[3].isQuoted(), false, 'Fourth fragment should not be quoted');
        assert.equal(fragments[4].isQuoted(), false, 'Fifth fragment should not be quoted');

        assert.equal(fragments[0].isSignature(), false, 'First fragment should not be a signature');
        assert.equal(fragments[1].isSignature(), true, 'Second fragment should be a signature');
        assert.equal(fragments[2].isSignature(), false, 'Third fragment should not be a signature');
        assert.equal(fragments[3].isSignature(), false, 'Fourth fragment should not be a signature');
        assert.equal(fragments[4].isSignature(), true, 'Fifth fragment should be a signature');

        assert.equal(fragments[0].isHidden(), false, 'First fragment should not be hidden');
        assert.equal(fragments[1].isHidden(), true, 'Second fragment should be hidden');
        assert.equal(fragments[2].isHidden(), true, 'Third fragment should be hidden');
        assert.equal(fragments[3].isHidden(), true, 'Fourth fragment should be hidden');
        assert.equal(fragments[4].isHidden(), true, 'Fifth fragment should be hidden');

        assert.equal(/^Oh thanks.\n\nHaving/.test(fragments[0].getContent()), true, 'First fragment has wrong content match');
        assert.equal(/^-A/.test(fragments[1].getContent()), true, 'Second fragment has wrong content match');
        assert.equal(/^On [^:]+:/.test(fragments[2].getContent()), true, 'Third fragment has wrong content match');
        assert.equal(/^_/.test(fragments[4].getContent()), true, 'Fifth fragment has wrong content match');
    });

    it('should read the last post', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_2.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 6, 'Wrong number of fragments');

        assert.equal(fragments[0].getContent(), 'Hi,', 'First fragment has the wrong content');
        assert.equal(/^On [^:]+:/.test(fragments[1].getContent()), true, 'Second fragment has the wrong content');
        assert.equal(/^You can list/.test(fragments[2].getContent()), true, 'Third fragment has the wrong content');
        assert.equal(/^>/.test(fragments[3].getContent()), true, 'Fourth fragment has the wrong content');
        assert.equal(/^_/.test(fragments[5].getContent()), true, 'Sixth fragment has the wrong content');
    });

    it('should recognize date strings above quotes', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_4.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/^Awesome/.test(fragments[0].getContent()), true, 'First fragment has the wrong content');
        assert.equal(/^On/.test(fragments[1].getContent()), true, 'Second fragment has the wrong content');
        assert.equal(/Loader/.test(fragments[1].getContent()), true, 'Second fragment has the wrong content');
    });

    it('should not modify the input string', function () {
        var parser = new Parser();
        var input = 'The Quick Brown Fox Jumps Over The Lazy Dog';
        var email = parser.parse(input);

        assert.strictEqual('The Quick Brown Fox Jumps Over The Lazy Dog', input);
    });

    it('should correctly handle complex bodies with only one fragment', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_5.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(1, fragments.length, 'Wrong number of fragments');
    });

    it('should deal with multiline reply headers', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_6.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/^I get/.test(fragments[0].getContent()), true, 'First fragment has the wrong content');
        assert.equal(/^On/.test(fragments[1].getContent()), true, 'Second fragment has the wrong content');
        assert.equal(/Was this/.test(fragments[1].getContent()), true, 'Second fragment has the wrong content');
    });

    it('should handle Italian emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_7.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle Dutch emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_8.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle signatures with equal signs', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_9.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle hotmail emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_10.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle whitespace before the reply header', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_11.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle square brackets in emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_12.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle da into Italian', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_13.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle Polish email headers', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_14.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle "sent from my" signatures', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_15.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle Polish email headers with Dnia and Napisala', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_16.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle Polish email headers with date in ISO8061', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_17.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle English Outlook emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_18.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should handle Norwegian Gmail emails', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_norwegian_gmail.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments[0].getContent().trim(), COMMON_FIRST_FRAGMENT, "Doesn't match common fragment");
    });

    it('should return only visible fragments in getVisibleText()', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_2_1.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        var visibleFragments = _.filter(fragments, f => !f.isHidden());
        var visibleText = _.map(visibleFragments, f => f.getContent()).join('\n');

        assert.equal(email.getVisibleText(), visibleText, "Visible text doesn't match");
    });

    it('should read email with correct signature', function () {
        var parser = new Parser();
        var fixture = util.getFixture("correct_sig.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        assert.equal(fragments[0].isQuoted(), false, "First fragment is not supposed to be quoted");
        assert.equal(fragments[1].isQuoted(), false, "Second fragment is not supposed to be quoted");

        assert.equal(fragments[0].isSignature(), false, "First fragment is not supposed to be a signature");
        assert.equal(fragments[1].isSignature(), true, "Second fragment is supposed to be a signature");

        assert.equal(fragments[0].isHidden(), false, "First fragment is not supposed to be hidden");
        assert.equal(fragments[1].isHidden(), true, "Second fragment is supposed to be hidden");

        assert.equal(/^--\nrick/.test(fragments[1].getContent()), true, "Second fragment has wrong signature");
    });

    it('should read email with correct signature with no empty line above it', function () {
        var parser = new Parser();
        var fixture = util.getFixture("sig_no_empty_line.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        assert.equal(fragments[0].isQuoted(), false, "First fragment is not supposed to be quoted");
        assert.equal(fragments[1].isQuoted(), false, "Second fragment is not supposed to be quoted");

        assert.equal(fragments[0].isSignature(), false, "First fragment is not supposed to be a signature");
        assert.equal(fragments[1].isSignature(), true, "Second fragment is supposed to be a signature");

        assert.equal(fragments[0].isHidden(), false, "First fragment is not supposed to be hidden");
        assert.equal(fragments[1].isHidden(), true, "Second fragment is supposed to be hidden");

        assert.equal(/^--\nrick/.test(fragments[1].getContent()), true, "Second fragment has wrong signature");
    });

    it('should read email with correct signature with whitespace', function () {
        var parser = new Parser();
        var fixture = util.getFixture("correct_sig.txt").replace(/--/g, '-- '); // we add the space here so that IDEs don't remove it accidentally
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        assert.equal(fragments[0].isQuoted(), false, "First fragment is not supposed to be quoted");
        assert.equal(fragments[1].isQuoted(), false, "Second fragment is not supposed to be quoted");

        assert.equal(fragments[0].isSignature(), false, "First fragment is not supposed to be a signature");
        assert.equal(fragments[1].isSignature(), true, "Second fragment is supposed to be a signature");

        assert.equal(fragments[0].isHidden(), false, "First fragment is not supposed to be hidden");
        assert.equal(fragments[1].isHidden(), true, "Second fragment is supposed to be hidden");

        assert.equal(/^-- \nrick/.test(fragments[1].getContent()), true, "Second fragment has wrong signature");
    });

    it('should read email with correct signature with no empty line above it and whitespace', function () {
        var parser = new Parser();
        var fixture = util.getFixture("correct_sig.txt").replace(/--/g, '-- '); // we add the space here so that IDEs don't remove it accidentally
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        assert.equal(fragments[0].isQuoted(), false, "First fragment is not supposed to be quoted");
        assert.equal(fragments[1].isQuoted(), false, "Second fragment is not supposed to be quoted");

        assert.equal(fragments[0].isSignature(), false, "First fragment is not supposed to be a signature");
        assert.equal(fragments[1].isSignature(), true, "Second fragment is supposed to be a signature");

        assert.equal(fragments[0].isHidden(), false, "First fragment is not supposed to be hidden");
        assert.equal(fragments[1].isHidden(), true, "Second fragment is supposed to be hidden");

        assert.equal(/^-- \nrick/.test(fragments[1].getContent()), true, "Second fragment has wrong signature");
    });

    it('should not handle "one" as "on"', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_one_is_not_on.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/One outstanding question/.test(fragments[0].getContent()), true, "First fragment has wrong content");
        assert.equal(/^On Oct 1, 2012/.test(fragments[1].getContent()), true, "Second fragment has wrong content");
    });

    it('should use custom quote header regex when given', function () {
        var regex = [/^(\d{4}([\S\s]*)rta:)$/m];
        var parser = new Parser(null, null, regex);
        var fixture = util.getFixture("email_custom_quote_header.txt");
        var email = parser.parse(fixture);

        assert.equal(email.getVisibleText(), "Thank you!\n", "Visible text is incorrect");
    });

    it('should use custom quote header regex when given (second)', function () {
        var regex = [/^(From: [\S\s]+ [\S\s]+test@webdomain\.com[\S\s]+)/m];
        var parser = new Parser(null, null, regex);
        var fixture = util.getFixture("email_customer_quote_header_2.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        assert.equal(email.getVisibleText(), "Thank you very much.\n\n\n", "Visible text is incorrect");
        assert.equal(fragments[1].isHidden(), true, "Second fragment should be hidden");
        assert.equal(fragments[1].isQuoted(), true, "Second fragment should be quoted");
    });

    it('should use custom quote header regex when given (third)', function () {
        var regex = [/^(De : .+ .+someone@yahoo\.fr[\S\s]+)/m];
        var parser = new Parser(null, null, regex);
        var fixture = util.getFixture("email_customer_quote_header_3.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(fragments.length, 2, 'Wrong number of fragments');

        var visibleText = "bonjour,\n" +
            "je n'ai pas eu de retour sur ma précision..\n" +
            "merci d'avance\n";

        assert.equal(email.getVisibleText(), visibleText, "Visible text is incorrect");
        assert.equal(fragments[1].isHidden(), true, "Second fragment should be hidden");
        assert.equal(fragments[1].isQuoted(), true, "Second fragment should be quoted");
    });

    it('should parse visible text that looks like a quote header', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_19.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/^On Thursday/.test(fragments[0].getContent()), true, "First fragment has wrong content");
        assert.equal(/^On Dec 16/.test(fragments[1].getContent()), true, "Second fragment has wrong content");
        assert.equal(/Was this/.test(fragments[1].getContent()), true, "Second fragment has wrong content");
    });

    it('should parse visible text that looks like a quote header (second)', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_20.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/^On Thursday/.test(fragments[0].getContent()), true, "First fragment has wrong content");
        assert.equal(/> On May 17/.test(fragments[1].getContent()), true, "Second fragment has wrong content");
        assert.equal(/fix this parsing/.test(fragments[1].getContent()), true, "Second fragment has wrong content");
    });

    it('should not fail with lots of content to parse', function () {
        var parser = new Parser();
        var fixture = util.getFixture("email_21.txt");
        var email = parser.parse(fixture);
        var fragments = email.getFragments();

        assert.equal(/^On Thursday/.test(fragments[0].getContent()), true, "First fragment has wrong content");
    });

    function testFromQuoteHeader(from) {
        it('should handle quoted headers with the From address: ' + from, function () {
            var parser = new Parser();
            var fixture = util.getFixture("email_with_from_headers.txt").replace("[FROM]", from);
            var email = parser.parse(fixture);
            var fragments = email.getFragments();

            assert.equal(fragments[1].getContent(), from + "\n\nMy email is <foo@example.com>", "From header not correctly matched");
        });
    }

    for (var from of FROM_HEADERS) {
        testFromQuoteHeader(from);
    }

    function testDateFormat(format) {
        it('should handle date format: ' + format, function () {
            var parser = new Parser();
            var fixture = util.getFixture("email_with_date_headers.txt").replace('[DATE]', format);
            var email = parser.parse(fixture);

            assert.equal(email.getVisibleText(), "Thank you very much.\n", "Visible text is incorrect");
        });
    }

    for (var format of DATE_FORMATS) {
        testDateFormat(format);
    }
});