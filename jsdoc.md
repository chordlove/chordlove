Chordlove documentation
=======================

Chordlove is client-side application written in JavaScript (and HTML5 + CSS).
The source code is found at [GitHub](https://github.com/chordlove/chordlove).

Overview
--------

The core code is contained in modules loaded by [Inject](http://www.injectjs.com/).
This code mostly handles the infrastructure of the application.
All modules are singletons.

Most functionality lives in plugins, handled by the [plugins module](module-plugins.html).
Technically the plugins are modules as well, just loaded and accessed in a different way.

Building
--------

There's no build process, the source code equals the application.
Still, to try it out locally, you'll need a web server running.

To build the documentation, install `jsdoc` on the system, and execute the `document` script in the project root.

Plugins
-------

Plugins provide the actual functionality of the application.

All plugins can implement these actions:

1. Receive data (`setData` method).
2. Render data (`render` method).
3. Write data (`serialize` method).

The data received is the one emitted by the plugin at an earlier point (unless it's damaged somehow, that can also be the case). The data is transparently added to the URL of the page and received from there as well.

The actions are opt-in, there's flags in the plugin metadata to control this.

Plugins register themselves with the [plugins module](module-plugins.html) at load time.

PLugins can keep an internal state, but the general advice is to not do so. Other plugins my alter the DOM so that the internal state is out of sync with the page. Instead, read the state from the DOM as needed.

Dependencies
------------

* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
* [Inject](http://www.injectjs.com/)
* [jQuery](http://jquery.com/)
* [jQuery hashchange event](https://github.com/GerHobbelt/jquery-hashchange)
* [jQuery UI](http://jqueryui.com/)
* [Twitter Bootstrap](http://twitter.github.io/bootstrap/)

Fonts
-----

* [DejaVu Font](http://dejavu-fonts.org/wiki/Main_Page)
* [Neuton Cursive Font](https://edgewebfonts.adobe.com/)

Tools
-----

* [JSDoc 3](https://github.com/jsdoc3/jsdoc)

Tests
-----

* [Main Tests Page](../tests/)

