/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013 NA Konsult AB
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

// shield from missing console.log().
( function()
{
  try
  {
    if ( typeof window.console.log !== 'function' )
    {
      replaceConsole();
    }
  }
  catch ( e )
  {
    replaceConsole();
  }

  function replaceConsole()
  {
    window.console = {};
    window.console.log = function()
    {
      // do nothing
    };
  }
} )();

/**
 * Main module to bootstrap the application. Loads core plugins which should always be present.
 * 
 * @module main
 * @requires jquery
 * @requires plugins
 * @requires share
 * @requires plugins/title
 * @requires plugins/chords
 * @requires plugins/lyrics
 * @requires plugins/structure
 * @requires plugins/addons
 * @requires plugins/tools
 * @requires storage
 */
require(
    [ 'jquery', 'plugins', 'share', 'plugins/title', 'plugins/chords', 'plugins/lyrics', 'plugins/structure',
        'plugins/addons', 'plugins/tools', 'storage' ],
    function( $, plugins, share )
    {
      'use strict';
      $( function()
      {
        $.ajaxSetup( {
          cache : true
        } );

        $( '#items' ).sortable( {
          'revert' : true,
          'handle' : '.handle',
          'stop' : function( event )
          {
            share.changedStructure( event );
          }
        } );

        ( function()
        {
          if ( window.self === window.top )
          {
            $( '#intro' ).load( 'intro.html' );
            $( '#spinner' ).remove();
            $.each( [ 'navbar', 'title', 'footer' ], function()
            {
              document.getElementById( this ).style.visibility = 'visible';
            } );
            plugins.init();
          }
          else
          {
            $( 'body' )
                .html(
                    '<div id="framed" class="alert alert-error"><h4>The page can not be loaded!</h4><p>Use this link to open the page in a tab or new window: <a href=" '
                        + window.location.href
                        + '" target="_blank">'
                        + window.location.hostname
                        + ' <i class="icon-external-link"></i></a>.</p></div>' );
          }
          $( '#chordlove-navbar-icon' ).click( function()
          {
            $( '#help' ).modal();
          } );
        } )();
      } );
    } );
