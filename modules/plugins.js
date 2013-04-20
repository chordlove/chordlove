function Plugins( $ )
{
  if ( Plugins.prototype._instance )
  {
    return Plugins.prototype._instance;
  }
  Plugins.prototype._instance = this;

  var FORMAT = "0";
  var PLUGIN_END_MARKER = "_";

  var plugins = {};
  var loading = {};

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
    this.alwaysRun = info.alwaysRun;
    this.serialize = info.serialize;
  }

  function idToName( id )
  {
    return window.chords.pluginlist[id];
  }

  function executeByName( name, func )
  {
    if ( plugins[name] )
    {
      func( plugins[name].instance );
    }
    else
    {
      if ( typeof loading[name] !== "undefined" )
      {
        // Store function to execute after load.
        loading[name].push( func );
      }
      else
      {
        loading[name] = [];
        require( [ "plugins/" + name ], function()
        {
          var instance = plugins[name].instance;
          func( instance );
          for ( var i = 0, len = loading[name].length; i < len; i++ )
          {
            loading[name][i]( instance );
          }
          loading[name] = undefined;
        } );
      }
    }
  }

  function update( name, format, data )
  {
    executeByName( name, function( instance )
    {
      instance.update( format, data );
    } );
  }

  function updateAll()
  {
    $.each( plugins, function( name, pluginInfo )
    {
      pluginInfo.instance.update();
    } );
  }

  function setData( id, format, data )
  {
    executeByName( idToName( id ), function( instance )
    {
      instance.setData( format, data );
    } );
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
    return "!" + FORMAT + data.join( PLUGIN_END_MARKER );
  }

  return {
    "PluginInfo" : PluginInfo,
    "register" : register,
    "list" : list,
    "exec" : executeByName,
    "serialize" : serialize,
    "setData" : setData,
    "updateAll" : updateAll
  };
}

define( "plugins", [ "jquery" ], function( $ )
{
  return new Plugins( $ );
} );
