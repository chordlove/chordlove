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
function AppCache( $, functions )
{
  'use strict';
  if ( AppCache.prototype._instance )
  {
    return AppCache.prototype._instance;
  }
  AppCache.prototype._instance = this;

  if ( !( 'applicationCache' in window ) )
  {
    return exports;
  }

  console.log( 'initializing appcache events' );

  var appCache = window.applicationCache;
  var $appCache = $( appCache );
  var $window = $( window );

  init();

  function init()
  {
    $appCache.bind( 'updateready', function()
    {
      console.log( 'update ready event, reloading page!' );
      swapCache();
    } );

    $window.bind( 'online', function()
    {
      // wait a bit after coming online, then check for updates
      window.setTimeout( function()
      {
        if ( !window.navigator.onLine )
        {
          return;
        }
        appCache.update();
      }, 5000 );
    } );

    window.setInterval( function()
    {
      appCache.update();
    }, 864000 ); // check for updates every 4h

    // check update status on page load as well
    if ( appCache.status === appCache.UPDATEREADY )
    {
      console.log( 'update ready status, reloading page!' );
      swapCache();
    }
  }

  function isOnline()
  {
    return 'onLine' in window.navigator ? window.navigator.onLine : true;
  }

  function swapCache()
  {
    appCache.swapCache();
    location.reload();
  }

  return;
}

define( 'appcache', [ 'jquery', 'functions' ], function( jquery, functions )
{
  'use strict';
  return new AppCache( jquery, functions );
} );
