function Plugins( $, pluginlist, functions, toolbar )
{
  if ( Plugins.prototype._instance )
  {
    return Plugins.prototype._instance;
  }
  Plugins.prototype._instance = this;

  var FORMAT = '0';
  var PLUGIN_END_MARKER = '_';

  var plugins = {};
  var loading = {};

  $( window ).hashchange( function()
  {
    parseHash();
  } );

  function register( pluginInfo )
  {
    plugins[pluginInfo.name] = pluginInfo;
  }

  function list()
  {
    return plugins.slice( 0 );
  }

  function PluginInfo( info )
  {
    this.name = info.name;
    this.instance = info.instance;
    this.render = info.render;    
    this.serialize = info.serialize;
  }

  function executeByName( name, func )
  {
    if ( plugins[name] )
    {
      func( plugins[name].instance, plugins[name] );
    }
    else
    {
      if ( typeof loading[name] !== 'undefined' )
      {
        // Store function to execute after load.
        loading[name].push( func );
      }
      else
      {
        loading[name] = [];
        require( [ 'plugins/' + name ], function()
        {
          var instance = plugins[name].instance;
          func( instance );
          for ( var i = 0, len = loading[name].length; i < len; i++ )
          {
            loading[name][i]( instance, plugins[name] );
          }
          loading[name] = undefined;
        } );
      }
    }
  }

  function render( name, format, data )
  {
    executeByName( name, function( instance )
    {
      instance.render( format, data );
    } );
  }

  function setData( id, format, data )
  {
    executeByName( pluginlist.idToName( id ), function( instance )
    {
      instance.setData( format, data );
    } );
  }

  function setDataAndRender( id, format, data )
  {
    executeByName( pluginlist.idToName( id ), function( instance, info )
    {
      instance.setData( format, data );
      if ( info.render === true )
      {
        instance.render();
      }
    } );
  }

  function parseHash()
  {
    var PLUGIN_END_MARKER = '_';
    var hash = window.location.hash;
    var readMode = false;
    if ( hash.length > 0 )
    {
      var topLevelFormat = hash.charAt( 2 );
      if ( topLevelFormat !== '0' )
      {
        // we'll handle this better when we're actually at format
        // version 1.
        throw 'Unknown URL format.';
      }
      var pluginSections = decodeURIComponent( hash.substring( 3 ) ).split( PLUGIN_END_MARKER );
      for ( var i = 0; i < pluginSections.length; i++ )
      {
        var plugin = pluginSections[i];
        var pluginId = functions.getNumber( plugin.substr( 0, 2 ) );
        var pluginFormat = functions.getNumber( plugin.substr( 2, 1 ) );
        var pluginData = plugin.substr( 3 );
        setDataAndRender( pluginId, pluginFormat, pluginData );
      }
      readMode = true;
    }
    else
    {
      toolbar.setEditMode( true );
      $( '#help' ).modal();
    }
    if ( readMode )
    {
      toolbar.hideOrShow( 'hide' );
    }
  }

  function serialize()
  {
    var data = [];
    $.each( plugins, function( name, pluginInfo )
    {
      if ( pluginInfo.serialize )
      {
        var serialized = pluginInfo.instance.serialize();
        if ( serialized )
        {
          data.push( serialized );
        }
      }
    } );
    return '!' + FORMAT + data.join( PLUGIN_END_MARKER );
  }

  return {
    'PluginInfo' : PluginInfo,
    'register' : register,
    'serialize' : serialize,
    'init' : parseHash
  };
}

define( 'plugins', [ 'jquery', 'pluginlist', 'functions', 'toolbar' ], function( $, pluginlist, functions, toolbar )
{
  return new Plugins( $, pluginlist, functions, toolbar );
} );
