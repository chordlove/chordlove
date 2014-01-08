/* 
 * Chordlove is a tool for sharing song chords and embed.
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
 * Module to add embed to the song. Hooks into the {@link module:plugins/chords} module to get rendering executed and
 * adds its own copy/paste extractor as well.
 * 
 * @module plugins/embed
 * @requires jquery
 * @requires functions
 * @requires share
 */

function Embed( $, functions, share )
{
  'use strict';
  if ( Embed.prototype._instance )
  {
    return Embed.prototype._instance;
  }
  Embed.prototype._instance = this;

  var PLUGIN_ID = '0a', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var $ADDONS = $( '#addons' );

  var $form = undefined;
  var $embedWrapper = undefined;
  var $embed = undefined;
  var $links = undefined;

  /**
   * @method
   * @name module:plugins/embed.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/embed.render
   */
  function render()
  {
    renderContent();
  }

  /**
   * @method
   * @name module:plugins/embed.serialize
   */
  function serialize()
  {
    var lines = $( '#embed-content' ).val().split( "\n" );
    var serialized = PLUGIN_ID + DEFAULT_FORMAT + functions.writeStringArray( {
      'items' : lines,
      'countSize' : 1,
      'itemLengthSize' : 2
    } );
    return serialized.length > 4 ? serialized : '';
  }

  function init( func )
  {
    functions.dialog( func, 'embed', 'embed', function( form )
    {
      $form = $( form );
      $embedWrapper = $( '<li id="embed"/>' );
      $embed = $( '<div/>' ).appendTo( $embedWrapper );
      $embedWrapper.appendTo( $ADDONS );
      $links = $( '#embed-content' );
      $( '#embed-ok' ).click( function()
      {
        renderContent();
        share.changedText( 'plugins/embed' );
      } );
    } );
  }

  function showForm()
  {
    $form.modal().on( 'shown', function()
    {
      $links.focus();
    } );
  }

  function load()
  {
    init( showForm );
  }

  function parseInput( inputData )
  {
    return functions.readStringArray( {
      'data' : inputData,
      'countSize' : 1,
      'itemLengthSize' : 2
    } ).array;
  }

  function renderContent()
  {
    init( function()
    {
      var lines = [];
      if ( data )
      {
        lines = parseInput( data );
        data = null;
        $links.val( lines.join( '\n' ) );
      }
      else
      {
        lines = $links.val().split( '\n' );
      }
      $embedWrapper.empty();
      $embed = $( '<div/>' ).appendTo( $embedWrapper );
      for ( var i = 0; i < lines.length; i++ )
      {
        var url = $.trim( lines[i] );
        if ( url.length === 0 )
        {
          continue;
        }
        try
        {
          var $div = $( '<div/>' ).appendTo( $embed );
          $div.oembed( url, {
            includeHandle : false,
            embedMethod : "append",
            apikeys : {
              soundcloud : '11ff8985d647e9561c7881d1e3b0baee'
            }
          } );
        }
        catch ( ex )
        {
          // TODO: handle exception
        }
      }
    } );
  }

  function clear()
  {
    $links.val( '' );
    $embed.empty();
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'load' : load,
    'clear' : clear
  };
}

define( 'plugins/embed', [ 'plugins', 'jquery', 'functions', 'share' ], function( plugins, $, functions, share )
{
  'use strict';
  var instance = new Embed( $, functions, share );
  plugins.register( {
    'name' : 'embed',
    'instance' : instance,
    'render' : true,
    'serialize' : true
  } );
  return instance;
} );
