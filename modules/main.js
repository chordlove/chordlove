window.chords = ( typeof window.chords !== 'undefined' ) ? window.chords : {};

define( "jquery", [], function()
{
  return jQuery;
} );

require( [ "jquery", "functions", "plugins", "save", "toolbar", "plugins/title", "plugins/chords" ], function( $,
    functions, thePlugins, save, toolbar )
{
  $( function()
  {
    $.ajaxSetup( {
      cache : true
    } );
    // var SHARP = true, FLAT = false;

    var PARENT = $( '#items' );
    var pluginHandler = new PluginHandler();

    PARENT.sortable( {
      "revert" : true,
      "handle" : ".handle",
      "stop" : function()
      {
        save.changed();
      }
    } );

    $( window ).hashchange( function()
    {
      pluginHandler.initialize();
    } );

    function PluginHandler()
    {
      function parseHash()
      {
        var PLUGIN_END_MARKER = "_";
        var hash = window.location.hash;
        var readMode = false;
        if ( hash.length > 0 )
        {
          var topLevelFormat = hash.charAt( 2 );
          if ( topLevelFormat !== "0" )
          {
            // we'll handle this better when we're actually at format
            // version 1.
            throw "Unknown URL format.";
          }
          var plugins = decodeURIComponent( hash.substring( 3 ) ).split( PLUGIN_END_MARKER );
          for ( var i = 0; i < plugins.length; i++ )
          {
            var plugin = plugins[i];
            var pluginId = functions.getNumber( plugin.substr( 0, 2 ) );
            var pluginFormat = functions.getNumber( plugin.substr( 2, 1 ) );
            var pluginData = plugin.substr( 3 );
            thePlugins.setData( pluginId, pluginFormat, pluginData );
          }
          readMode = true;
        }
        else
        {
          toolbar.setEditMode( true );
          $( "#help" ).modal();
        }
        thePlugins.updateAll();
        if ( readMode )
        {
          toolbar.hideOrShow( "hide" );
        }
      }

      this.initialize = function()
      {
        parseHash();
      };
    }

    pluginHandler.initialize();
  } );
} );
