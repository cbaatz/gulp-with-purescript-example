Usage
=====

This repository contains an example of how to set up a build infrastructure for
PureScript, React, and ES6 (Babel) with live reload using Gulp. To use:

    npm install .
    bower install
    gulp watch

This writes the result to the `public/` folder. You will most likely want to
serve this from some kind of proxy server, but you can just open
public/index.html to test it.

To build distribution files (into `dist/`):

    gulp build

For convenience, you might want to install the [Livereload Chrome
extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)
to get the browserpage to refresh automatically when files change. (This works
when using gulp watch, which is set up to work with that extension.)

If you're on a Mac and want error notifications you can `brew install
terminal-notifier`.

END
