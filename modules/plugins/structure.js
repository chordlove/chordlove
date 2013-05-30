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
 * Manages the song structure.
 * 
 * @module plugins/structure
 * @requires jquery
 * @requires share
 * @requires functions
 */

function Structure( $, share, functions )
{
  'use strict';
  if ( Structure.prototype._instance )
  {
    return Structure.prototype._instance;
  }
  Structure.prototype._instance = this;

  var PLUGIN_ID = '03';
  var DEFAULT_FORMAT = '0';

  var format = DEFAULT_FORMAT;
  var data = null;

  var $PARENT = $( '#items' );
  var $TIME_SIGNATURE = $( '#time-signature' );
  var MENU_START_OF_LINE = '<i class="icon-hand-left"></i> Line break (toggle)';

  /**
   * @method
   * @name module:plugins/structure.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/structure.render
   */
  function render()
  {
    if ( data === null )
    {
      return;
    }
    setStructure( data );
  }

  /**
   * @method
   * @name module:plugins/structure.serialize
   */
  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT + getStructure();
    if ( result.length < 4 )
    {
      result = '';
    }
    return result;
  }

  function getStructure()
  {
    var startOfLineItems = '';
    $PARENT.children( 'li.item' ).each( function( ix, li )
    {
      if ( $( li ).hasClass( 'start-of-line' ) )
      {
        var item = functions.getCharacters( ix, 2 );
        startOfLineItems += item;
      }
    } );
    var count = functions.getCharacters( startOfLineItems.length / 2, 1 );
    if ( count === '0' )
    {
      count = '';
    }
    return count + startOfLineItems;
  }

  function setStructure( input )
  {
    var startOfLineItems = functions.readChunkArray( {
      'data' : input,
      'chunkSize' : 2,
      'countSize' : 1
    } );
    var items = $PARENT.children( 'li.item' ).toArray();
    $.each( startOfLineItems, function()
    {
      var position = functions.getNumber( this );
      $( items[position] ).addClass( 'start-of-line' );
    } );
  }

  function startOfLineMenu( $wrapper, $li, $a )
  {
    $a.html( MENU_START_OF_LINE ).click( {
      'li' : $wrapper
    }, function( event )
    {
      event.preventDefault();
      event.data.li.toggleClass( 'start-of-line' );
      share.changed();
    } );
  }

  function setBarBreaks()
  {
    init( function()
    {
      $( '#structure-barbreak-form' ).modal().on( 'shown', function()
      {
        $( '#structure-barbreak' ).focus();
      } );
    } );
  }

  function getBeats( li )
  {
    return $( 'div.duration > a', li ).text();
  }

  function init( func )
  {
    functions.dialog( func, 'structure-barbreak', 'structure', function()
    {
      $( '#structure-barbreak-ok' ).click( function()
      {
        var breakAfterBars = $( '#structure-barbreak' ).val();
        var timeSignature = $TIME_SIGNATURE.val();
        var beatsToBreakAfter = breakAfterBars * timeSignature;
        var beatsSum = 0;
        $PARENT.children( 'li.item' ).each( function()
        {
          if ( beatsSum !== 0 && ( beatsSum % beatsToBreakAfter === 0 ) )
          {
            $( this ).addClass( 'start-of-line' );
          }
          else
          {
            $( this ).removeClass( 'start-of-line' );
          }
          beatsSum += getBeats( this ).length;
        } );
        share.changedStructure( 'plugins/structure' );
      } );
    } );
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'startOfLineMenu' : startOfLineMenu,
    'setBarBreaks' : setBarBreaks
  };
}

define( 'plugins/structure', [ 'plugins', 'jquery', 'share', 'functions', 'plugins/chords' ], function( plugins, $,
    share, functions, chords )
{
  'use strict';
  var instance = new Structure( $, share, functions );
  chords.registerChordMenuMember( instance.startOfLineMenu );
  chords.addPostRenderer( instance.render );
  plugins.register( {
    'name' : 'structure',
    'instance' : instance,
    'render' : false,
    'serialize' : true
  } );
} );
