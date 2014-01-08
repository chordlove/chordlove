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
 * Module to add lyrics to the chord items. Hooks into the {@link module:plugins/chords} module to get rendering
 * executed and adds its own copy/paste extractor as well.
 * 
 * @module plugins/lyrics
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires plugins
 */

function Lyrics( $, functions, share, toolbar, resizer, plugins )
{
  'use strict';
  if ( Lyrics.prototype._instance )
  {
    return Lyrics.prototype._instance;
  }
  Lyrics.prototype._instance = this;

  var PLUGIN_ID = '02', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var $PARENT = $( '#items' );
  var $VIEW_BUTTON = $( '#view-lyrics' );
  var $TEXT_INPUT = $( '<input class="song-text resize-trigger empty-input" type="text" id="song-text" title="Add song text" placeholder="Text…" />' );

  plugins.exec( 'chords', function( chords )
  {
    chords.registerContentExtractor( extract );
  } );

  functions.bindButton( '#view-lyrics', visibleLyrics );

  share.addStructureChangeListener( addTextInput );

  function visibleLyrics()
  {
    if ( $PARENT.hasClass( 'has-text' ) )
    {
      $PARENT.removeClass( 'has-text' );
      $VIEW_BUTTON.removeClass( 'active' );
    }
    else
    {
      $PARENT.addClass( 'has-text' );
      addTextInput();
      $VIEW_BUTTON.addClass( 'active' );
    }
  }

  function getLyrics( item )
  {
    return $( 'input.song-text', item ).val();
  }

  function setLyrics( item, text )
  {
    var $element = $( 'input.song-text', item );
    $element.val( text );
    functions.emptyOrNot( $element, text );
  }

  function extract( item )
  {
    var text = getLyrics( item );
    return function( theItem )
    {
      if ( text !== undefined )
      {
        setLyrics( theItem, text );
      }
    };
  }

  function addTextInput()
  {
    if ( !$PARENT.hasClass( 'has-text' ) )
    {
      return;
    }
    $( 'div.chord input.chord-text' ).each( function()
    {
      var $chordInput = $( this );
      var $wrapper = $chordInput.parents( 'li.item' ).first();
      if ( $chordInput.siblings( 'input.song-text' ).length )
      {
        return;
      }
      var $textInput = $TEXT_INPUT.clone();
      $textInput.appendTo( $chordInput.parent() ).keydown( functions.handleInputKeyEvent ).blur( {
        'item' : $wrapper
      }, function( event )
      {
        share.changedText( event );
      } ).bind( 'input', functions.handleInputChangeEvent );
      resizer.prepareResize( $wrapper );
    } );
  }

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
    if ( data === null )
    {
      return;
    }
    var lyrics = functions.readStringArray( {
      'data' : data,
      'countSize' : 2
    } ).array;
    $PARENT.addClass( 'has-text' );
    $VIEW_BUTTON.addClass( 'active' );
    addTextInput();
    $PARENT.children( 'li.item' ).each( function()
    {
      setLyrics( this, lyrics.shift() );
    } );
  }

  /**
   * @method
   * @name module:plugins/lyrics.serialize
   */
  function serialize()
  {
    var result = '';
    result += PLUGIN_ID + DEFAULT_FORMAT;
    var items = [];
    $PARENT.children( 'li.item' ).each( function()
    {
      items.push( getLyrics( this ) );
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
    return result;
  }

  function clear()
  {
    $PARENT.removeClass( 'has-text' );
    $VIEW_BUTTON.removeClass( 'active' );
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear
  };
}

define( 'plugins/lyrics', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer', 'plugins/chords' ],
    function( plugins, $, functions, share, toolbar, resizer, chords )
    {
      'use strict';
      var instance = new Lyrics( $, functions, share, toolbar, resizer, plugins );
      chords.addPostRenderer( instance.render );
      plugins.register( {
        'name' : 'lyrics',
        'instance' : instance,
        'render' : false,
        'serialize' : true
      } );
      return instance;
    } );
