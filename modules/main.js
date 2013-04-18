window.chords = ( typeof window.chords !== 'undefined' ) ? window.chords : {};

define( "jquery", [], function()
{
  return jQuery;
} );

require(
    [ "jquery", "functions" ],
    function( $, functions )
    {
      $( function()
      {
        $.ajaxSetup( {
          cache : true
        } );
        // var SHARP = true, FLAT = false;

        window.chords.getNumberFromChars = functions.getNumber;
        window.chords.getCharsFromNumber = functions.getCharacters;

        var pluginHandler = new PluginHandler();

        function prepareCpanel()
        {
          function bindButton( selector, func )
          {
            return $( selector ).click( function()
            {
              func();
            } );
          }

          window.chords.bindButton = bindButton;

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
          var plugins = {};
          var loading = {};
          var undefined;
          var PRIO_PLUGINS = [ 0, 1 ];
          var activePlugins = [];

          $( PRIO_PLUGINS ).each( function()
          {
            getPlugin( this, function()
            {
            } );
          } );

          function getActivePlugins()
          {
            return activePlugins.slice( 0 );
          }

          function addActivePlugin( plugin )
          {
            var newId = plugin.id;
            for ( var i = 0; i < activePlugins.length; i++ )
            {
              if ( activePlugins[i].id === newId )
              {
                return false;
              }
            }
            activePlugins.push( plugin );
            return true;
          }

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
              var pluginsWithData = [];
              for ( var i = 0; i < plugins.length; i++ )
              {
                var plugin = plugins[i];
                var pluginId = functions.getNumber( plugin.substr( 0, 2 ) );
                var pluginFormat = functions.getNumber( plugin.substr( 2, 1 ) );
                var pluginData = plugin.substr( 3 );
                var pluginWithData = new PluginData( pluginId, pluginFormat, pluginData );
                pluginsWithData.push( pluginWithData );
                addActivePlugin( pluginWithData );
              }
            }
            // add prio plugins even though they aren't in the hash.
            for ( var i = 0; i < PRIO_PLUGINS.length; i++ )
            {
              addActivePlugin( new PluginData( PRIO_PLUGINS[i] ) );
            }

            var result = separatePrioPlugins( getActivePlugins() );
            var prioPlugins = result.prio;
            pluginsWithData = result.other;

            executePlugins( prioPlugins );
            executePlugins( pluginsWithData );
          }
          this.initialize = function()
          {
            parseHash();
          };

          function separatePrioPlugins( pluginsWithData )
          {
            var prioPlugins = [];
            for ( var j = 0; j < PRIO_PLUGINS.length; j++ )
            {
              var prioPlugin = PRIO_PLUGINS[j];
              for ( var i = 0; i < pluginsWithData.length; i++ )
              {
                var pluginWithData = pluginsWithData[i];
                if ( pluginWithData.id === prioPlugin )
                {
                  prioPlugins.push( pluginWithData );
                  pluginsWithData.splice( i, 1 );
                  i--;
                }
              }
            }
            return {
              "prio" : prioPlugins,
              "other" : pluginsWithData
            };
          }

          function executePlugins( plugins )
          {
            for ( var i = 0; i < plugins.length; i++ )
            {
              plugins[i].run();
            }
          }

          function getDataFromPlugins( pluginArray, data )
          {
            for ( var i = 0; i < pluginArray.length; i++ )
            {
              var serialized = plugins[pluginArray[i].id].serialize();
              if ( serialized )
              {
                data.push( serialized );
              }
            }
          }

          function PluginData( id, format, data )
          {
            this.id = id;

            function exec()
            {
              runPluginUsingCallback( id, format, data );
            }
            this.run = exec;
          }
          this.createPluginData = function( id, format, data )
          {
            return new PluginData( id, format, data );
          };

          function getPlugin( id, func )
          {
            // Run from plugin store if possible.
            if ( plugins[id] )
            {
              func( plugins[id] );
            }
            else
            {
              if ( typeof loading[id] !== "undefined" )
              {
                // Store function to execute after load.
                loading[id].push( func );
              }
              else
              {
                // Load script from file.
                loading[id] = [];
                var pluginName = window.chords.pluginlist[id];
                var fileName = "modules/" + pluginName + ".js";
                $.getScript( fileName, function()
                {
                  var fn = window["chords_" + pluginName];
                  if ( typeof fn === 'function' )
                  {
                    var instance = new fn();
                    plugins[id] = instance;
                    func( instance );
                    for ( var i = 0, len = loading[id].length; i < len; i++ )
                    {
                      loading[id][i]( instance );
                    }
                    loading[id] = undefined;
                  }
                } );
              }
            }
          }

          function runPluginUsingCallback( id, format, data )
          {
            getPlugin( id, function( plugin )
            {
              plugin.run( format, data );
            } );
          }

          function getPluginData()
          {
            var FORMAT = "0";
            var PLUGIN_END_MARKER = "_";

            var plugins = separatePrioPlugins( getActivePlugins() );
            var data = [];
            getDataFromPlugins( plugins.prio, data );
            getDataFromPlugins( plugins.other, data );
            return "!" + FORMAT + data.join( PLUGIN_END_MARKER );
          }
          this.hash = getPluginData;
        }

        pluginHandler.initialize();
        window.chords.getHash = pluginHandler.hash;
      } );
    } );
