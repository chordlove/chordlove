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
 * Manages the song title.
 * 
 * @module plugins/title
 * @requires jquery
 * @requires plugins
 * @requires share
 * @requires functions
 */

function Title( $, plugins, share, functions )
{
  'use strict';
  if ( Title.prototype._instance )
  {
    return Title.prototype._instance;
  }
  Title.prototype._instance = this;

  var PLUGIN_ID = '00';
  var DEFAULT_FORMAT = '0';
  var SITE_TITLE = 'Chordlove.com';

  var format = DEFAULT_FORMAT;
  var data = null;

  /**
   * @method
   * @name module:plugins/title.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = functions.decode( inputData );
  }

  /**
   * @method
   * @name module:plugins/title.render
   */
  function render()
  {
    setPageTitle( data );
    $( '#title' ).val( data );
  }

  /**
   * @method
   * @name module:plugins/title.serialize
   */
  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT + getTitle();
    if ( result.length < 4 )
    {
      result = '';
    }
    return result;
  }

  function clear()
  {
    $( '#title' ).val( '' ).focus();
  }

  function getTitle()
  {
    var val = $.trim( $( '#title' ).val() );
    $( '#title' ).val( val );
    return functions.encode( val );
  }

  $( '#title' ).keydown( function( event )
  {
    if ( event.which === 13 || event.which === 9 )
    {
      event.preventDefault();
      $( this ).blur();
      setPageTitle( $( '#title' ).val() );
      if ( event.which === 9 )
      {
        var backwards = 'shiftKey' in event && event.shiftKey === true;
        if ( backwards )
        {
          $( '#help-btn' ).focus();
        }
        else
        {
          $( '#items input' ).first().focus();
        }
      }
    }
  } ).change( function()
  {
    share.changedText( 'title' );
  } );

  function setPageTitle( title )
  {
    if ( title )
    {
      window.document.title = title + ' - ' + SITE_TITLE;
    }
    else
    {
      window.document.title = SITE_TITLE;
    }
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear
  };
}

define( 'plugins/title', [ 'plugins', 'jquery', 'share', 'functions' ], function( plugins, $, share, functions )
{
  'use strict';
  var instance = new Title( $, plugins, share, functions );
  plugins.register( {
    'name' : 'title',
    'instance' : instance,
    'render' : true,
    'serialize' : true
  } );
  return instance;
} );
