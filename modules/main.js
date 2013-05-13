define( 'jquery', [], function()
{
  'use strict';
  return jQuery;
} );

require( [ 'jquery', 'plugins', 'share', 'plugins/title', 'plugins/chords','plugins/lyrics' ], function( $, plugins, share )
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
