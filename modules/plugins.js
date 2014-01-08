/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013-2014 NA Konsult AB
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    'exec' : exec,
    'clear' : clear
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
    if ( 'name' in pluginInfo && typeof pluginInfo.name === 'string' )
    {
      plugins[pluginInfo.name] = pluginInfo;
    }
    else
    {
      console.log( 'Could not register plugin.', pluginInfo );
    }
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
      try
      {
        func( plugins[name].instance, plugins[name], exports );
      }
      catch ( ex )
      {
        functions.printError( ex, 'Could not execute function on plugin "' + name + '".' );
        throw ex;
      }
    }
    else
    {
      // Start loading the script.
      loading[name] = [];
      require( [ 'plugins/' + name, 'plugins' ], function( dontUse, pluginsModule )
      {
        var instance = plugins[name].instance;
        try
        {
          func( instance, plugins[name], pluginsModule );
        }
        catch ( ex )
        {
          functions.printError( ex, 'Could not execute function on plugin "' + name + '".' );
          throw ex;
        }
        $.each( loading[name], function()
        {
          try
          {
            this( instance, plugins[name], pluginsModule );
          }
          catch ( ex )
          {
            functions.printError( ex, 'Could not execute function on plugin "' + name + '".' );
            throw ex;
          }
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
    if ( hash.length > 3 )
    {
      var topLevelFormat = hash.charAt( 2 );
      if ( topLevelFormat !== '0' )
      {
        // we'll handle this better when we're actually at format
        // version 1.
        // this is fatal, so let's just throw it for now.
        throw 'Error in address, can not render page.';
      }
      var pluginSections = decodeURIComponent( hash.substring( 3 ) ).split( PLUGIN_END_MARKER );
      var plugins = [];
      $.each( pluginSections, function()
      {
        if ( this.length > 2 )
        {
          var pluginId = undefined;
          try
          {
            pluginId = functions.getNumber( this.substr( 0, 2 ) );
            var pluginFormat = functions.getNumber( this.substr( 2, 1 ) );
            var pluginData = this.substr( 3 );
            var pluginInput = new PluginInput( pluginId, pluginFormat, pluginData );
            plugins.push( pluginInput );
            setData( pluginInput );
          }
          catch ( ex )
          {
            functions.printError( ex, 'Could not set data on plugin with id ' + pluginId + '.' );
          }
        }
      } );
      $.each( plugins, function()
      {
        render( this );
      } );
      readMode = true;
    }
    else
    {
      clear();
      toolbar.setEditMode( true );
      if ( document.cookie.replace( /(?:(?:^|.*;\s*)SPLASH\s*\=\s*([^;]*).*$)|^.*$/, "$1" ) !== 'true' )
      {
        $( '#help' ).modal();
        document.cookie = 'SPLASH=true; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/; domain=chordlove.com';
      }
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
      try
      {
        if ( 'serialize' in pluginInfo && pluginInfo['serialize'] === true )
        {
          var serialized = pluginInfo.instance.serialize();
          if ( serialized )
          {
            data.push( serialized );
          }
        }
      }
      catch ( ex )
      {
        functions.printError( ex, 'Could not serialize output from plugin ' + name + '.' );
      }
    } );
    // TODO remove the sorting?
    data.sort( compare );
    var result = '!' + FORMAT + data.join( PLUGIN_END_MARKER );
    return result.length < 3 ? '' : result;
  }

  function performOnAll( func )
  {
    $.each( plugins, function( name, pluginInfo )
    {
      func( pluginInfo.instance, pluginInfo );
    } );
  }

  function clear()
  {
    performOnAll( function( instance )
    {
      if ( 'clear' in instance )
      {
        try
        {
          instance.clear();
        }
        catch ( ex )
        {
          functions.printError( ex, 'Could not perform clear operation on plugin.' );
        }
      }
    } );
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
  var plugins = new Plugins( $, pluginlist, functions, toolbar );
  return plugins;
} );
