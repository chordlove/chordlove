window.chords = ( typeof window.chords !== 'undefined' ) ? window.chords : {};

define( "jquery", [], function()
{
  return jQuery;
} );

require( [ "jquery", "functions", "plugins", "save", "plugins/title", "plugins/chords" ], function( $, functions,
    thePlugins, save )
{
  $( function()
  {
    $.ajaxSetup( {
      cache : true
    } );
    // var SHARP = true, FLAT = false;

    var pluginHandler = new PluginHandler();

    function prepareCpanel()
    {
      // TODO this is a backwards compat hack.
      var bindButton = functions.bindButton;

      function getSelectedItems()
      {
        return $( "#items li.ui-selected" );
      }

      function deleteItems()
      {
        getSelectedItems().remove();
      }

      var copiedItems = [];

      function cutItems()
      {
        copyItems();
        deleteItems();
      }

      function copyItems()
      {
        copiedItems = [];
        getSelectedItems().each( function()
        {
          copiedItems.push( this.getStatus() );
        } );
      }

      function pasteItems()
      {
        $( copiedItems ).each( function( ix, value )
        {
          createItem( value );
        } );
      }

      function editMode()
      {
        var currentState = $( '#edit' ).hasClass( 'active' );
        setEditMode( !currentState );
      }

      bindButton( "#cut", cutItems );
      bindButton( "#copy", copyItems );
      bindButton( "#paste", pasteItems );
      bindButton( "#delete", deleteItems );
      bindButton( "#edit", editMode );
    }

    prepareCpanel();

    function setEditMode( mode )
    {
      if ( mode === true )
      {
        $( 'body' ).addClass( 'edit-mode' );
        $( '#edit' ).addClass( 'active' );
        hideOrShow( "show" );
      }
      else
      {
        $( 'body' ).removeClass( 'edit-mode' );
        $( '#edit' ).removeClass( 'active' );
        hideOrShow( "hide" );
      }
    }

    function hideOrShow( action )
    {
      $( '#items input' ).each( function()
      {
        var element = $( this );
        if ( element.val() === "" )
        {
          element[action]();
        }
        else
        {
          element.prop( 'readonly', action === "hide" );
        }
      } );
    }

    $( "#items" ).sortable( {
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
          setEditMode( true );
          $( "#help" ).modal();
        }
        thePlugins.updateAll();
        if ( readMode )
        {
          hideOrShow( "hide" );
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
