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
require( [ 'jquery', 'plugins', 'share', 'plugins/title', 'plugins/chords', 'plugins/lyrics' ], function( $, plugins,
    share )
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
