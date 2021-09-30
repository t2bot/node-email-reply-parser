# node-email-reply-parser

[![npm version](https://badge.fury.io/js/node-email-reply-parser.svg)](https://www.npmjs.com/package/node-email-reply-parser)

A port of willdurand/EmailReplyParser (which is a port of github/email_reply_parser) to nodejs

willdurand's port of the Github library supports multiple spoken languages and has some enhanced parsing and therefore was used as a template for this library.


# Installing

This package can be found on [npm](https://www.npmjs.com/):
```
npm install node-email-reply-parser
```

**Note**: This package is ES6 compatible and does *not* transpile automatically.


# Usage

```
var replyParser = require("node-email-reply-parser");

var email = replyParser(emailContent);
```

`email` has two primary methods:
* `getFragments()`: returns all the fragments of the email
* `getVisibleText()`: returns the text that is considered 'visible'

`getVisibleText()` accepts an optional options object:

```
getVisibleText({aggressive: true})
```

Setting `aggressive` to true will make the parser assume that any fragment which is not hidden, but which is both preceded and followed by a hidden fragment, should not be visible. This works around the issue of clients breaking quoted text into multiple lines (e.g. Gmail).

Using aggressive mode runs the risk of losing visible lines which are interspersed with quoted lines, but is useful when parsing e.g. emails from a 'reply by email' feature which contain a large block of quoted text.

A fragment has the following functions:
* `getContent()`: returns the content of the fragment
* `isSignature()`: returns whether or not the fragment is likely a signature
* `isQuoted()`: returns whether or not the fragment is likely a quote
* `isHidden()`: returns whether or not the text is considered 'hidden'
* `isEmpty()`: returns whether or not the fragment has any content

Passing `true` as the second argument to `replyParser` will have the return value be just the visible text:
```
$visibleText = replyParser($emailContent, true);
```

# Known Issues

The parser is not able to pick up some of the edge cases. They are outlined below.

## Quoted Headers

Quoted headers aren't picked up if there's an extra line break:
```
On <date>, <author> wrote:

> blah
```

They also aren't picked up if the email client breaks it up into multiple lines, like gmail and it's 80 column automatic limit:
```
On <date>, <author>
wrote:
> blah
```

## Weird Signatures

Lines starting with `-` or `_` sometimes mark the beginning of signatures:
```
Hello

--
Rick
```

Not everyone follows this convention:
```
Hello

Mr Rick Olson
Galactic President Superstar Mc Awesomeville
GitHub

**********************DISCLAIMER***********************************
* Note: blah blah blah                                            *
**********************DISCLAIMER***********************************
```

## Strange Quoting

Apparently, prefixing lines with `>` isn't universal either:

```
Hello

--
Rick

________________________________________
From: Bob [reply@reply.github.com]
Sent: Monday, March 14, 2011 6:16 PM
To: Rick
```


# Unit Tests

Install the required dependencies:
```
npm install --dev
```

Run the tests:
```
npm test
```


# Contributing

Please see the CONTRIBUTING.md file.


# Credits

* GitHub - Amazing Ruby gem for parsing emails
* William Durand [william.durand1@gmail.com](mailto:william.durand1@gmail.com) - Extensive PHP version of GitHub's library


# License

node-email-reply-parser is released under the MIT Licenses. Please see the bundled LICENSE file for details.
