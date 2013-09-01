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
  var MENU_START_OF_LINE = '<i class="icon-arrow-left"></i> Put on new line / back';

  var START_OF_LINE = 'start-of-line';
  var INDIVIDUAL_BAR_BREAK = 'inidividual-bar-break';

  var $form = undefined;

  var $barBreakNumberSelect = undefined;
  var barBreakNumberSelect = undefined;

  initForm();

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
    performRendering();
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
    var currentBreakBarNumber = $barBreakNumberSelect.val();
    var timeSig = currentBreakBarNumber ? functions.getCharacters( currentBreakBarNumber, 1 ) : '0';
    var startOfLineItems = '';
    $PARENT.children( 'li.item' ).each( function( ix, li )
    {
      if ( $( li ).data( INDIVIDUAL_BAR_BREAK ) )
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
    return timeSig + count + startOfLineItems;
  }

  function parseInput( input )
  {
    barBreakNumberSelect.value = functions.getNumber( input.charAt( 0 ) );

    return functions.readChunkArray( {
      'data' : input,
      'currentPos' : 1,
      'chunkSize' : 2,
      'countSize' : 1
    } );
  }

  function startOfLineMenu( $wrapper, $li, $a )
  {
    $a.html( MENU_START_OF_LINE ).click( {
      'li' : $wrapper
    }, function( event )
    {
      event.preventDefault();
      var $item = event.data.li;
      if ( $item.hasClass( START_OF_LINE ) )
      {
        $item.removeClass( START_OF_LINE ).data( INDIVIDUAL_BAR_BREAK, false );
      }
      else
      {
        $item.addClass( START_OF_LINE ).data( INDIVIDUAL_BAR_BREAK, true );
      }
      share.changedStructure( 'plugins/structure/individualBreak' );
    } );
  }

  function setBarBreaks()
  {
    $form.modal( 'show' );
  }

  function getBeats( li )
  {
    return $( 'div.duration > a', li ).text();
  }

  function performOnForm( func )
  {
    functions.dialog( func, 'structure-barbreak', 'structure', function( form )
    {
      $barBreakNumberSelect = $( '#structure-barbreak' );
      barBreakNumberSelect = $barBreakNumberSelect[0];
      $form = $( form ).on( 'shown', function()
      {
        $barBreakNumberSelect.focus();
      } );
      $( '#structure-barbreak-ok' ).click( function()
      {
        performRendering();
        share.changedStructure( 'plugins/structure/breakbars' );
      } );
    } );
  }

  function initForm()
  {
    performOnForm( null );
  }

  function performRendering()
  {
    performOnForm( function()
    {
      var startOfLineItems = undefined;
      if ( data )
      {
        startOfLineItems = parseInput( data );
        data = null;
      }
      var items = $PARENT.children( 'li.item' ).toArray();
      var currentBreakBarNumber = $barBreakNumberSelect.val();
      if ( currentBreakBarNumber )
      {
        var timeSignature = $TIME_SIGNATURE.val();
        var beatsToBreakAfter = currentBreakBarNumber * timeSignature;
        var beatsSum = 0;
        for ( var i = 0; i < items.length; i++ )
        {
          var item = items[i];
          var $item = $( item );
          if ( beatsSum !== 0 && ( beatsSum % beatsToBreakAfter === 0 ) || $item.data( INDIVIDUAL_BAR_BREAK ) )
          {
            $item.addClass( START_OF_LINE );
          }
          else
          {
            $item.removeClass( START_OF_LINE );
          }
          beatsSum += getBeats( item ).length;
        }
      }
      if ( startOfLineItems )
      {
        $.each( startOfLineItems, function()
        {
          var position = functions.getNumber( this );
          $( items[position] ).addClass( START_OF_LINE ).data( INDIVIDUAL_BAR_BREAK, true );
        } );
      }
    } );
  }

  function structureChanged( event )
  {
    if ( event && typeof event === 'string'
        && ( event === 'plugins/structure/breakbars' || event === 'plugins/structure/individualBreak' ) )
    {
      return;
    }
    performRendering();
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'startOfLineMenu' : startOfLineMenu,
    'setBarBreaks' : setBarBreaks,
    'structureChanged' : structureChanged
  };
}

define( 'plugins/structure', [ 'plugins', 'jquery', 'share', 'functions', 'plugins/chords' ], function( plugins, $,
    share, functions, chords )
{
  'use strict';
  var instance = new Structure( $, share, functions );
  chords.registerChordMenuMember( instance.startOfLineMenu );
  chords.addPostRenderer( instance.render );
  share.addStructureChangeListener( instance.structureChanged );
  plugins.register( {
    'name' : 'structure',
    'instance' : instance,
    'render' : false,
    'serialize' : true
  } );
} );
