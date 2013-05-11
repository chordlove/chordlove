function Plugins( $, pluginlist, functions, toolbar )
{
  if ( Plugins.prototype._instance )
  {
    return Plugins.prototype._instance;
  }
  Plugins.prototype._instance = this;

  var pub = {
    'PluginInfo' : PluginInfo,
    'register' : register,
    'serialize' : serialize,
    'init' : parseHash,
    'exec' : executeByName
  };

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
    if ( typeof loading[name] !== 'undefined' )
    {
      // Store function to execute after load.
      loading[name].push( func );
    }
    else if ( plugins[name] )
    {
      // The script has been loaded and batched executions run.
      func( plugins[name].instance, plugins[name], pub );
    }
    else
    {
      // Start loading the script.
      loading[name] = [];
      require( [ 'plugins/' + name, 'plugins' ], function( dontUse, pluginsModule )
      {
        var instance = plugins[name].instance;
        func( instance, plugins[name], pluginsModule );
        for ( var i = 0, len = loading[name].length; i < len; i++ )
        {
          loading[name][i]( instance, plugins[name], pluginsModule );
        }
        delete loading[name];
      } );
    }
  }

  function render( name, format, data )
  {
    executeByName( name, function( instance )
    {
      if ( info.render === true )
      {
        instance.render( format, data );
      }
    } );
  }

  function setData( id, format, data )
  {
    executeByName( pluginlist.idToName( id ), function( instance )
    {
      instance.setData( format, data );
    } );
  }

  function setDataAndConfigure( input )
  {
    executeByName( input.name, function( instance, info, pluginsModule )
    {
      instance.setData( input.format, input.data );
      if ( 'postRender' in info )
      {
        pluginsModule.executeByName( info.postRender.module, function( moduleInstance )
        {
          moduleInstance.addPostRenderer( info.postRender.func );
        } );
      }
    } );
  }

  function setDataAndRender( input )
  {
    executeByName( input.name, function( instance, info, pluginsModule )
    {
      instance.setData( input.format, input.data );
      if ( info.render === true )
      {
        instance.render();
      }
    } );
  }

  function PluginInput( pluginId, pluginFormat, pluginData )
  {
    this.id = pluginId;
    this.format = pluginFormat;
    this.data = pluginData;
    this.name = pluginlist.idToName( pluginId );
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
      var plugins = [];
      for ( var i = 0; i < pluginSections.length; i++ )
      {
        var plugin = pluginSections[i];
        var pluginId = functions.getNumber( plugin.substr( 0, 2 ) );
        var pluginFormat = functions.getNumber( plugin.substr( 2, 1 ) );
        var pluginData = plugin.substr( 3 );
        var pluginInput = new PluginInput( pluginId, pluginFormat, pluginData );
        plugins.push( pluginInput );
        setDataAndRender( pluginInput );
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
    data.sort( compare );
    var result = '!' + FORMAT + data.join( PLUGIN_END_MARKER );
    return result.length < 3 ? '' : result;
  }

  function compare( a, b )
  {
    var aNum = functions.getNumber( a.substr( 0, 2 ) );
    var bNum = functions.getNumber( b.substr( 0, 2 ) );
    return aNum - bNum;
  }

  return pub;
}

define( 'plugins', [ 'jquery', 'pluginlist', 'functions', 'toolbar' ], function( $, pluginlist, functions, toolbar )
{
  return new Plugins( $, pluginlist, functions, toolbar );
} );
