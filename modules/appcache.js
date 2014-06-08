/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013-2014 NA Konsult AB
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Store files in browser appcache.
 *
 * @module appcache
 * @requires jquery
 * @requires functions
 */
function AppCache($, functions) {
  'use strict';
  if (AppCache.prototype._instance) {
    return AppCache.prototype._instance;
  }
  AppCache.prototype._instance = this;

  if (!( 'applicationCache' in window )) {
    return exports;
  }

  var UPDATE_CHECK_DELAY = 60000; // 1m
  var UPDATE_CHECK_INTERVAL = 864000; // 4h

  var appCache = window.applicationCache;
  var $appCache = $(appCache);
  var $window = $(window);

  var onlineEventListeners = [];
  var offlineEventListeners = [];
  var runOnceWhenOnlineListeners = [];

  init();

  function init() {
    $appCache.bind('updateready', function () {
      swapCache();
    });

    $window.bind('online', function () {
      for (var i = 0; i < onlineEventListeners.length; i++) {
        onlineEventListeners[i]();
      }
      while (runOnceWhenOnlineListeners.length > 0) {
        runOnceWhenOnlineListeners.pop()();
      }
    });

    $window.bind('offline', function () {
      for (var i = 0; i < offlineEventListeners.length; i++) {
        offlineEventListeners[i]();
      }
    });

    registerOnlineEventListener(function () {
      // wait a bit after coming online, then check for updates
      window.setTimeout(function () {
        if (!window.navigator.onLine) {
          return;
        }
        appCache.update();
      }, UPDATE_CHECK_DELAY);
    });

    window.setInterval(function () {
      appCache.update();
    }, UPDATE_CHECK_INTERVAL);

    // check update status on page load as well
    if (appCache.status === appCache.UPDATEREADY) {
      swapCache();
    }
  }

  function isOnline() {
    return 'onLine' in window.navigator ? window.navigator.onLine : true;
  }

  function swapCache() {
    appCache.swapCache();
    var $form = null;
    functions.dialog(function () {
      $form.modal('show');
    }, 'appcache-form', 'appcache', function (form) {
      $form = $(form);
      $('#appcache-button').click(function () {
        window.location.reload();
      });
    });
  }

  /**
   * Register a listener to be executed when the browser goes online. The event will fire once at page load, if the
   * browser is online.
   *
   * @method
   * @name module:appcache.registerOnlineEventListener
   * @param {Function}
   *          listener Listener to execute when coming online.
   */
  function registerOnlineEventListener(listener) {
    onlineEventListeners.push(listener);
    if (isOnline()) {
      listener();
    }
  }

  /**
   * Register a listener to be executed when the browser goes offline. The event will fire once at page load, if the
   * browser is offline.
   *
   * @method
   * @name module:appcache.registerOfflineEventListener
   * @param {Function}
   *          listener Listener to execute when going offline.
   */
  function registerOfflineEventListener(listener) {
    offlineEventListeners.push(listener);
    if (!isOnline()) {
      listener();
    }
  }

  /**
   * Register a listener to be executed when the browser comes online for the first time. The listener will be executed
   * right away if the browser is online. The listener will not be executed for any subsequent offline/online cycles.
   *
   * @method
   * @name module:appcache.runOnceWhenOnline
   * @param {Function}
   *          listener Listener to execute once when coming online.
   */
  function runOnceWhenOnline(listener) {
    if (isOnline()) {
      listener();
    }
    else {
      runOnceWhenOnlineListeners.push(listener);
    }
  }

  return {
    'registerOnlineEventListener': registerOnlineEventListener,
    'registerOfflineEventListener': registerOfflineEventListener,
    'runOnceWhenOnline': runOnceWhenOnline
  };
}

define('appcache', [ 'jquery', 'functions' ], function (jquery, functions) {
  'use strict';
  return new AppCache(jquery, functions);
});
