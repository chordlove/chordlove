/* 
 * Chordlove is a tool for sharing song chords and lyrics.
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

  var PARENT = $( '#verses-items' );

  functions.bindButton( '#view-lyrics', visibleVerses );

  /**
   * @method
   * @name module:plugins/lyrics.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/lyrics.render
   */
  function render()
  {
    var lyrics = functions.readStringArray( {
      'data' : data,
      'countSize' : 2
    } ).array;
    hasText = true;
    visibleText = true;
    PARENT.addClass( 'has-text' );
    VIEW_BUTTON.addClass( 'active' );
    addTextInput();
    $( '#items > li.item' ).each( function()
    {
      setVerses( this, lyrics.shift() );
    } );
  }

  /**
   * @method
   * @name module:plugins/lyrics.serialize
   */
  function serialize()
  {
    var result = '';
    if ( hasText )
    {
      result += PLUGIN_ID + DEFAULT_FORMAT;
      var items = [];
      $( '#items > li.item' ).each( function()
      {
        items.push( getVerses( this ) );
      } );
      result += functions.writeStringArray( {
        'items' : items,
        'countSize' : 2
      } );
      if ( result.length < 6 + items.length )
      {
        // all items have zero length
        result = '';
      }
    }
    return result;
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData
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
