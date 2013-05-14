/**
 * Load and execute operations from plugins.
 * 
 * @module plugins
 */

function Plugins( $, pluginlist, functions, toolbar )
{
  'use strict';
  if ( Plugins.prototype._instance )
  {
    return Plugins.prototype._instance;
  }
  Plugins.prototype._instance = this;

  var exports = {
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

  /**
   * Register a plugin when it's loaded.
   * 
   * @method
   * @name module:plugins.register
   * @param {Object}
   *          pluginInfo Metadata about the plugin.
   */
  function register( pluginInfo )
  {
    plugins[pluginInfo.name] = pluginInfo;
  }

  function list()
  {
    return plugins.slice( 0 );
  }

  /**
   * Execute operations against a plugin by providing a function. The function gets the plugin instance, plugin metadata
   * and the plugins module provided as arguments.
   * 
   * @method
   * @name module:plugins.exec
   * @param {String}
   *          name The name of the plugin to use.
   * @param {Function}
   *          Function that uses the plugin. Typically:
   *          <code>function(plugin, pluginMetaData, pluginsModule){...}</code>
   */
  function executeByName( name, func )
  {
    if ( name in loading )
    {
      // Store function to execute after load.
      loading[name].push( func );
    }
    else if ( plugins[name] )
    {
      // The script has been loaded and batched executions run.
      func( plugins[name].instance, plugins[name], exports );
    }
    else
    {
      // Start loading the script.
      loading[name] = [];
      require( [ 'plugins/' + name, 'plugins' ], function( dontUse, pluginsModule )
      {
        var instance = plugins[name].instance;
        func( instance, plugins[name], pluginsModule );
        $.each( loading[name], function()
        {
          this( instance, plugins[name], pluginsModule );
        } );
        delete loading[name];
      } );
    }
  }

  function render( input )
  {
    executeByName( input.name, function( instance, info, pluginsModule )
    {
      instance.setData( input.format, input.data );
      if ( 'render' in info && info['render'] === true )
      {
        instance.render();
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
      if ( 'config' in info )
      {
        $.each( info['config'], function()
        {
          var method = this.method;
          var args = this.args;
          pluginsModule.exec( this.plugin, function( moduleInstance )
          {
            moduleInstance[method].apply( null, args );
          } );
        } );
      }
    } );
  }

  function setDataAndRender( input )
  {
    executeByName( input.name, function( instance, info, pluginsModule )
    {
      instance.setData( input.format, input.data );
      if ( 'render' in info && info['render'] === true )
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
    if ( hash.length )
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
      $.each( pluginSections, function()
      {
        var pluginId = functions.getNumber( this.substr( 0, 2 ) );
        var pluginFormat = functions.getNumber( this.substr( 2, 1 ) );
        var pluginData = this.substr( 3 );
        var pluginInput = new PluginInput( pluginId, pluginFormat, pluginData );
        plugins.push( pluginInput );
        setDataAndConfigure( pluginInput );
      } );
      $.each( plugins, function()
      {
        render( this );
      } );
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
      if ( 'serialize' in pluginInfo && pluginInfo['serialize'] === true )
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

  return exports;
}

define( 'plugins', [ 'jquery', 'pluginlist', 'functions', 'toolbar' ], function( $, pluginlist, functions, toolbar )
{
  'use strict';
  return new Plugins( $, pluginlist, functions, toolbar );
} );
