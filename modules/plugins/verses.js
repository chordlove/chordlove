/* 
 * Chordlove is a tool for sharing song chords and verses.
 * Copyright (C) 2013 NA Konsult AB
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
 * Module to add verses to the song. Hooks into the {@link module:plugins/chords} module to get rendering executed and
 * adds its own copy/paste extractor as well.
 * 
 * @module plugins/verses
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires plugins
 */

function Verses( $, functions, share, toolbar, resizer, plugins )
{
  'use strict';
  if ( Verses.prototype._instance )
  {
    return Verses.prototype._instance;
  }
  Verses.prototype._instance = this;

  var PLUGIN_ID = '04', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var $ADDONS = $( '#addons' );

  /**
   * @method
   * @name module:plugins/verses.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/verses.render
   */
  function render()
  {
    var blocks = functions.readStringArray( {
      'data' : data,
      'countSize' : 1,
      'itemLengthSize' : 2
    } ).array;
    var maxBlockLength = 0;
    $.each( blocks, function()
    {
      var len = this.split( '\n' ).length - 1;
      if ( len > maxBlockLength )
      {
        maxBlockLength = len;
      }
    } );
    renderBlocks( blocks, maxBlockLength );
  }

  /**
   * @method
   * @name module:plugins/verses.serialize
   */
  function serialize()
  {
    var content = getContentFromContainer();
    return PLUGIN_ID + DEFAULT_FORMAT + functions.writeStringArray( {
      'items' : content,
      'countSize' : 1,
      'itemLengthSize' : 2
    } );
  }

  function getContentFromForm()
  {
    var lines = $( '#verses-content' ).val().split( "\n" );
    lines.push( "" ); // ensure last block gets added
    var blocks = [];
    var maxBlockLength = 0;
    var blockLength = 0;
    var block = "";
    $.each( lines, function( index, line )
    {
      if ( $.trim( this ).length === 0 )
      {
        if ( block.length > 0 )
        {
          blocks.push( block );
          if ( blockLength > maxBlockLength )
          {
            maxBlockLength = blockLength;
          }
          block = "";
          blockLength = 0;
        }
        else
        {
          // ignore multiple blank lines
        }
      }
      else
      {
        block += line + "\n";
        blockLength++;
      }
    } );
    return {
      'blocks' : blocks,
      'maxBlockLength' : maxBlockLength
    };
  }

  function getContentFromContainer()
  {
    var $container = $( '#verses-blocks' );
    var blocks = [];
    if ( $container.length === 0 )
    {
      return blocks;
    }
    $container.children( 'p' ).each( function()
    {
      blocks.push( $( this ).text() );
    } );
    return blocks;
  }

  function renderBlocks( blocks, maxBlockLength )
  {
    init( function()
    {
      var height = 20 * maxBlockLength;
      var $container = $( '#verses-blocks' );
      $container.empty();
      $.each( blocks, function()
      {
        $container.append( $( '<p/>' ).text( this ).height( height ) );
      } );
    } );
  }

  function init( func )
  {
    var $verses = $( '#verses' );
    if ( $verses.length === 0 )
    {
      $verses = $( '<li id="verses"/>' ).load( 'modules/plugins/verses.html', function()
      {
        $verses.appendTo( $ADDONS );
        $( '<div id="verses-blocks"/>' ).appendTo( $verses ).click( load );
        $( '#verses-ok' ).click( function()
        {
          var content = getContentFromForm();
          renderBlocks( content.blocks, content.maxBlockLength );
          share.changedText( 'plugins/verses' );
        } );
        if ( func )
        {
          func();
        }
      } );
    }
    else
    {
      if ( func )
      {
        func();
      }
    }
  }

  function load()
  {
    init( function()
    {
      $( '#verses-content' ).val( getContentFromContainer().join( '\n' ) );
      $( '#verses-form' ).modal().on( 'shown', function()
      {
        $( '#verses-content' ).focus();
      } );
    } );
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'load' : load
  };
}

define( 'plugins/verses', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer' ], function( plugins, $,
    functions, share, toolbar, resizer )
{
  'use strict';
  var instance = new Verses( $, functions, share, toolbar, resizer, plugins );
  plugins.register( {
    'name' : 'verses',
    'instance' : instance,
    'render' : true,
    'serialize' : true
  } );
  return instance;
} );
