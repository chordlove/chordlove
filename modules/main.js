window.chords = ( typeof window.chords !== 'undefined' ) ? window.chords : {};

define( "jquery", [], function()
{
  return jQuery;
} );

require( [ "jquery", "functions", "plugins", "plugins/title", "plugins/chords" ], function( $, functions, thePlugins )
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
      window.chords.bindButton = functions.bindButton;

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
        if ( currentState === true )
        {
          $( 'body' ).removeClass( 'edit-mode' );
          $( '#edit' ).removeClass( 'active' );
        }
        else
        {
          $( 'body' ).addClass( 'edit-mode' );
          $( '#edit' ).addClass( 'active' );
        }
      }

      bindButton( "#cut", cutItems );
      bindButton( "#copy", copyItems );
      bindButton( "#paste", pasteItems );
      bindButton( "#delete", deleteItems );
      bindButton( "#edit", editMode );

      $( "#save" ).click( function()
      {
        var status = thePlugins.serialize();
        var hash = "#" + encodeURIComponent( status );
        window.history.pushState( status, window.document.title, hash );
        setLink( hash );
        this.blur();
      } );

      function setLink( hash )
      {
        var href = hash.replace( "|", "%7C" ).replace( "—", "%E2%80%94" );
        var link = $( "#link" ).empty();
        var a = $( '<a>', {
          'title' : 'Copy the link address to share this page.',
          'href' : href,
          'class' : 'btn'
        } );
        a.append( '<i class="icon-link"> </i>' );
        a.appendTo( link ).click( function()
        {
          window.location.assign( hash );
          $( window ).hashchange();
        } );
        link.children().focus();
        a.effect( "highlight", null, 2000 );
      }
    }

    prepareCpanel();

    $( "#items" ).sortable( {
      "revert" : true,
      handle : ".handle"
    } ).selectable();

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
        }
        else
        {
          $("#help").modal();
        }
        thePlugins.updateAll();
      }

      this.initialize = function()
      {
        parseHash();
      };
    }

    pluginHandler.initialize();
  } );
} );
