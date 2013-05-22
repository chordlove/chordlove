/**
 * Load and execute operations from plugins.
 * 
 * @module plugins
 * @requires jquery
 * @requires pluginlist
 * @requires functions
 * @requires toolbar
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
    'exec' : exec
  };

  var FORMAT = '0';
  var PLUGIN_END_MARKER = '_';

  var plugins = {};
  var loading = {};
  var configItems = [];

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
    if ( 'config' in pluginInfo )
    {
      var config = pluginInfo.config;
      for ( var i = 0; i < config.length; i++ )
      {
        configItems.push( config[i] );
      }
    }
    plugins[pluginInfo.name] = pluginInfo;
  }

  function list()
  {
    return plugins.slice( 0 );
  }

  /**
   * Execute operations against a plugin by providing a function. The function gets the plugin instance, plugin metadata
   * and the plugins module provided as arguments. <i>Note that this method does not return anything.</i>
   * 
   * @method
   * @name module:plugins.exec
   * @param {String}
   *          name The name of the plugin to use.
   * @param {Function}
   *          func Function that uses the plugin. Typically:
   *          <code>function(plugin, pluginMetaData, pluginsModule){...}</code>
   */
  function exec( name, func )
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
    exec( input.name, function( instance, info, pluginsModule )
    {
      if ( 'render' in info && info['render'] === true )
      {
        instance.render();
      }
    } );
  }

  function configure( config )
  {
    var method = config.method;
    var args = config.args;
    exec( config.plugin, function( moduleInstance )
    {
      moduleInstance[method].apply( null, args );
    } );
  }

  function setData( input )
  {
    exec( input.name, function( instance, info, pluginsModule )
    {
      instance.setData( input.format, input.data );
    } );
  }

  function setDataAndRender( input )
  {
    exec( input.name, function( instance, info, pluginsModule )
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
        setData( pluginInput );
      } );
      while ( configItems.length )
      {
        configure( configItems.pop() );
      }
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
    while ( configItems.length )
    {
      configure( configItems.pop() );
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
