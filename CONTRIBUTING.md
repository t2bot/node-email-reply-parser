# Contributing

Thank you so much for contributing! Having help working on projects is always appreciated.

Before submitting your change for review, please consider the following:
* Use the [node-style-guide](https://github.com/felixge/node-style-guide) where it makes sense. Some exceptions are:
  * This project doesn't use a line limit. Please break your lines where it adds clarity instead.
  * The ternary operator is permitted on a single line. Eg: `var result = condition ? 'a' : 'b';`
  * Closures can be without a name if the closure is obvious. For example, `req.on('end', function() { // ...`
  * Nested closures are permitted so long as promises can't be used in place
* **Run the tests** before submitting a pull request
* **Write/update tests** for your changes
* **Write documentation** where possible
* Use [descriptive commit messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
* [Rebase your branch](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) before opening a pull request
* Make your changes against the `main` branch (and open your pull request against this branch)
* Squashing your commits is optional
* Please add a description to your pull request to better explain the changes made

Thank you for contributing!