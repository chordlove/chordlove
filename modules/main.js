define( 'jquery', [], function()
{
  return jQuery;
} );

require( [ 'jquery', 'plugins', 'save', 'plugins/title', 'plugins/chords','plugins/lyrics' ], function( $, plugins, save )
{
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
        save.changedStructure( event );
      }
    } );

    plugins.init();

  } );
} );
