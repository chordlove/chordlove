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
/**
 * Wraps jQuery as a module manually.
 * 
 * @module jquery
 */
define( 'jquery', [], function()
{
  'use strict';
  return jQuery;
} );

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
 */
require( [ 'jquery', 'plugins', 'share', 'plugins/title', 'plugins/chords', 'plugins/lyrics', 'plugins/structure' ],
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

        plugins.init();

      } );
    } );
