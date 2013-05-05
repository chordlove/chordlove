window.chords = ( typeof window.chords !== 'undefined' ) ? window.chords : {};

define( "jquery", [], function()
{
  return jQuery;
} );

require( [ "jquery", "plugins", "save", "plugins/title", "plugins/chords" ], function( $, plugins, save )
{
  $( function()
  {
    $.ajaxSetup( {
      cache : true
    } );

    $( '#items' ).sortable( {
      "revert" : true,
      "handle" : ".handle",
      "stop" : function( event )
      {
        save.changedStructure( event );
      }
    } );

    plugins.init();

  } );
} );
