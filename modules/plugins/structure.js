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

  var $form = undefined;

  var currentBreakBarNumber = undefined;
  var startOfLineItems = [];

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
    if ( data )
    {
      setStructure( data );
    }
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
    var timeSig = currentBreakBarNumber ? functions.getCharacters( currentBreakBarNumber, 1 ) : '0';
    var startOfLineItems = '';
    var timeSignature = $TIME_SIGNATURE.val();
    var beatsToBreakAfter = currentBreakBarNumber * timeSignature;
    var beatsSum = 0;
    $PARENT.children( 'li.item' ).each( function( ix, li )
    {
      if ( beatsSum % beatsToBreakAfter !== 0 && $( li ).hasClass( 'start-of-line' ) )
      {
        var item = functions.getCharacters( ix, 2 );
        startOfLineItems += item;
      }
      beatsSum += getBeats( li ).length;
    } );
    var count = functions.getCharacters( startOfLineItems.length / 2, 1 );
    if ( count === '0' )
    {
      count = '';
    }
    return timeSig + count + startOfLineItems;
  }

  function setStructure( input )
  {
    currentBreakBarNumber = functions.getNumber( input.charAt( 0 ) );
    startOfLineItems = functions.readChunkArray( {
      'data' : input,
      'currentPos' : 1,
      'chunkSize' : 2,
      'countSize' : 1
    } );
    data = null;
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
    $form.modal( 'show' );
  }

  function getBeats( li )
  {
    return $( 'div.duration > a', li ).text();
  }

  function init()
  {
    functions.dialog( setBarBreaks, 'structure-barbreak', 'structure', function( form )
    {
      $form = $( form ).modal().on( 'shown', function()
      {
        $( '#structure-barbreak' ).focus();
      } );
      $( '#structure-barbreak-ok' ).click( function()
      {
        currentBreakBarNumber = $( '#structure-barbreak' ).val();
        performRendering();
        share.changedStructure( 'plugins/structure/breakbars' );
      } );
    } );
  }

  function performRendering()
  {
    var items = $PARENT.children( 'li.item' ).toArray();
    if ( currentBreakBarNumber )
    {
      var timeSignature = $TIME_SIGNATURE.val();
      var beatsToBreakAfter = currentBreakBarNumber * timeSignature;
      var beatsSum = 0;
      for ( var i = 0; i < items.length; i++ )
      {
        var item = items[i];
        if ( beatsSum !== 0 && ( beatsSum % beatsToBreakAfter === 0 ) )
        {
          $( item ).addClass( 'start-of-line' );
        }
        else
        {
          $( item ).removeClass( 'start-of-line' );
        }
        beatsSum += getBeats( item ).length;
      }
    }
    $.each( startOfLineItems, function()
    {
      var position = functions.getNumber( this );
      $( items[position] ).addClass( 'start-of-line' );
    } );
  }

  function structureChanged( event )
  {
    performRendering();
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'startOfLineMenu' : startOfLineMenu,
    'init' : init,
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
