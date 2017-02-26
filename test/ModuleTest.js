/**
 * This file is part of node-email-reply-parser.
 * For the full license information, please see the LICENSE file distributed with this package.
 */

var util = require("./utils");
//var describe = require("mocha").describe;
//var it = require("mocha").it;
var assert = require("assert");
var _ = require("lodash");
var replyParser = require("../index");

describe('index.js', function () {
    it('should return a defined email object with no visible text when given null', function () {
        //noinspection JSCheckFunctionSignatures
        var email = replyParser(null);

        assert.equal(email.getVisibleText(), '', 'Visible text not empty');
    });

    it('should return a defined email object with no visible text when given an empty string', function () {
        var email = replyParser('');

        assert.equal(email.getVisibleText(), '', 'Visible text not empty');
    });

    it('should process sent from iPhone messages', function () {
        var fixture = util.getFixture('email_iphone.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'Here is another email', 'Visible text is incorrect');
    });

    it('should process sent from Blackberry messages', function () {
        var fixture = util.getFixture('email_blackberry.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'Here is another email', 'Visible text is incorrect');
    });

    it('should process sent from multiword device messages', function () {
        var fixture = util.getFixture('email_multi_word_sent_from_my_mobile_device.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'Here is another email', 'Visible text is incorrect');
    });

    it('should process sent from not a signature message', function () {
        var fixture = util.getFixture('email_sent_from_my_not_signature.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'Here is another email\n\nSent from my desk, is much easier then my mobile phone.', 'Visible text is incorrect');
    });

    it('should find just the top part of an Outlook message', function () {
        var fixture = util.getFixture('email_2_1.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'Outlook with a reply', 'Visible text is incorrect');
    });

    it('should retain bullets', function () {
        var fixture = util.getFixture('email_bullets.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'test 2 this should list second\n\nand have spaces\n\nand retain this formatting\n\n\n   - how about bullets\n   - and another', 'Visible text is incorrect');
    });

    it('should parse unquoted reply', function () {
        var fixture = util.getFixture('email_unquoted_reply.txt');
        var email = replyParser(fixture, true);

        assert.equal(email, 'This is my reply.', 'Visible text is incorrect');
    });

    it('should preserve newlines in email threads', function () {
        var fixture = util.getFixture('email_thread.txt');
        var email = replyParser(fixture);

        var expectedText =
            "On Nov 21, 2014, at 10:18, John Doe <john@doe123.com> wrote:\n" +
            "> Ok. Thanks.\n" +
            ">\n" +
            "> On Nov 21, 2014, at 9:26, Jim Beam <jim@beam123.com> wrote:\n" +
            ">\n" +
            ">>> On Nov 20, 2014, at 11:03 AM, John Doe <john@doe123.com> wrote:\n" +
            ">>>\n" +
            ">>> if you take a look at a short video from attachment, why full-typed filename does not stay in CMD+T pane?\n" +
            ">>> When I type last character, it is not shown anymore.\n" +
            ">>\n" +
            ">> We think we’ve tracked down the cause of this issue, write back if you see the issue after the next update. (Which will be out shortly.)\n" +
            ">>\n" +
            ">> --\n" +
            ">> Jim Beam – Acme Corp\n" +
            ">>\n" +
            ">\n";

        assert.equal(email.getFragments()[1].getContent(), expectedText, 'Second fragment is incorrect');
    });

    it('should parse a reply', function () {
        var fixture = util.getFixture('email_2.txt');
        var email = replyParser(fixture);

        var expectedText =
            "Hi,\n" +
            "You can list the keys for the bucket and call delete for each. Or if you\n" +
            "put the keys (and kept track of them in your test) you can delete them\n" +
            "one at a time (without incurring the cost of calling list first.)\n" +
            "Something like:\n" +
            "        String bucket = \"my_bucket\";\n" +
            "        BucketResponse bucketResponse = riakClient.listBucket(bucket);\n" +
            "        RiakBucketInfo bucketInfo = bucketResponse.getBucketInfo();\n" +
            "        for(String key : bucketInfo.getKeys()) {\n" +
            "            riakClient.delete(bucket, key);\n" +
            "        }\n" +
            "would do it.\n" +
            "See also\n" +
            "http://wiki.basho.com/REST-API.html#Bucket-operations\n" +
            "which says\n" +
            "\"At the moment there is no straightforward way to delete an entire\n" +
            "Bucket. There is, however, an open ticket for the feature. To delete all\n" +
            "the keys in a bucket, you’ll need to delete them all individually.\"\n";

        assert.equal(email.getVisibleText(), expectedText, 'Did not get expected visible body');
    });

    it('should parse a reply as text only when asked', function () {
        var fixture = util.getFixture('email_2.txt');
        var email = replyParser(fixture, true);

        var expectedText =
            "Hi,\n" +
            "You can list the keys for the bucket and call delete for each. Or if you\n" +
            "put the keys (and kept track of them in your test) you can delete them\n" +
            "one at a time (without incurring the cost of calling list first.)\n" +
            "Something like:\n" +
            "        String bucket = \"my_bucket\";\n" +
            "        BucketResponse bucketResponse = riakClient.listBucket(bucket);\n" +
            "        RiakBucketInfo bucketInfo = bucketResponse.getBucketInfo();\n" +
            "        for(String key : bucketInfo.getKeys()) {\n" +
            "            riakClient.delete(bucket, key);\n" +
            "        }\n" +
            "would do it.\n" +
            "See also\n" +
            "http://wiki.basho.com/REST-API.html#Bucket-operations\n" +
            "which says\n" +
            "\"At the moment there is no straightforward way to delete an entire\n" +
            "Bucket. There is, however, an open ticket for the feature. To delete all\n" +
            "the keys in a bucket, you’ll need to delete them all individually.\"\n";

        assert.equal(email, expectedText, 'Did not get expected visible body');
    });
});