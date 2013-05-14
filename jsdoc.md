Chordlove documentation
=======================

Chordlove is client-side application written in JavaScript (and HTML5 + CSS).
The source code is found at [GitHub](https://github.com/chordlove/chordlove).

Overview
--------

The core code is contained in modules loaded by [Inject](http://www.injectjs.com/).
This code mostly handles the infrastructure of the application.
All modules are singletons.

Most funcionality lives in plugins, handled by the [plugins module](module-plugins.html).
Technically the plugins are modules as well, just loaded and accessed in a different way.

Building
--------

There's no build process, the source code equals the application.

To build the documentation, install `jsdoc` on the system, and execute the `document` script in the project root.

Dependencies
------------

* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
* [Inject](http://www.injectjs.com/)
* [JQuery](http://jquery.com/)
* [JQuery UI](http://jqueryui.com/)
* [Twitter Bootstrap](http://twitter.github.io/bootstrap/)

Fonts
-----

* [DejaVu Font](http://dejavu-fonts.org/wiki/Main_Page)
* [Neuton Cursive Font](https://edgewebfonts.adobe.com/)

Tools
-----

* [JSDoc 3](https://github.com/jsdoc3/jsdoc)

