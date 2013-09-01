/* 
 * Chordlove is a tool for sharing song chords and guitarchords.
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
 * Module to add guitar chords to a song. Hooks into the {@link module:plugins/chords} module to get rendering executed.
 * 
 * @module plugins/guitar-chords
 * @requires jquery
 * @requires chorddata
 * @requires plugins/chords
 * @requires functions
 */

function GuitarChords( $, chorddata, share, functions )
{
  'use strict';
  if ( GuitarChords.prototype._instance )
  {
    return GuitarChords.prototype._instance;
  }
  GuitarChords.prototype._instance = this;

  var PLUGIN_ID = '07', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var $PARENT = $( '#items' );
  var $GUITAR_CHORDS = $( '<li id="guitarchords"/>' );
  var $CHORD_WRAPPER = $( '<div class="guitarchord"/>' );
  var $INNER_CHORD_WRAPPER = $( '<div class="guitarchord-inner"/>' );
  var $NEXT_BTN = $( '<i class="icon-chevron-sign-right guitarchord-next"></i>' );
  var $PREVIOUS_BTN = $( '<i class="icon-chevron-sign-left guitarchord-previous"></i>' );
  var $CHORD_LABEL = $( '<p class="guitarchord"/>' );

  var chordsPluginInitialized = false;
  var previousSeen = undefined;

  $( '#addons-core' ).append( $GUITAR_CHORDS );

  share.addStructureChangeListener( changeListener );
  share.addTextChangeListener( changeListener );

  function changeListener( event )
  {
    if ( event !== 'guitarchords/renderChord' && event !== 'chords/new' )
    {
      render();
    }
  }

  /**
   * @method
   * @name module:plugins/guitarchords.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
    previousSeen = undefined;
    if ( chordsPluginInitialized )
    {
      render();
    }
  }

  function renderGuitarChords()
  {
    if ( data !== null )
    {
      render();
    }
    else
    {
      chordsPluginInitialized = true;
    }
  }

  /**
   * @method
   * @name module:plugins/guitarchords.render
   */
  function render()
  {
    var chordNumbers = undefined;
    if ( data !== null && data.length > 1 )
    {
      var ln = functions.getNumber( data.substr( 0, 2 ) );
      if ( ln > 0 )
      {
        chordNumbers = [];
        for ( var i = 0; i < ln; i++ )
        {
          chordNumbers.push( functions.getNumber( data.substr( i + 2, 1 ) ) );
        }
      }
      data = null; // only read data once
    }
    var seen = {};
    $GUITAR_CHORDS.empty();
    var chordNumberIndex = 0;
    $PARENT.children( 'li.item' ).each( function()
    {
      var chord = $( 'input.chord-text', this ).val();
      if ( !( chord in seen ) )
      {
        if ( chordNumbers )
        {
          var currentChordNumber = chordNumbers[chordNumberIndex];
          chordNumberIndex++;
          seen[chord] = prepareChord( chord, currentChordNumber );
        }
        else
        {
          seen[chord] = prepareChord( chord );
        }
      }
    } );
    previousSeen = seen;

    function prepareChord( chord, currentChordNumber )
    {
      var result = true;
      if ( chord.length )
      {
        var chordMemory = getChordMemory( chord, currentChordNumber );
        if ( chordMemory && chordMemory !== true )
        {
          result = chordMemory;
          var $wrapper = $CHORD_WRAPPER.clone().mousedown( function( event )
          {
            event.preventDefault();
          } );
          $CHORD_LABEL.clone().text( chord ).appendTo( $wrapper );
          var $innerWrapper = $INNER_CHORD_WRAPPER.clone().appendTo( $wrapper );
          // make the wrapper visible here because of:
          // https://github.com/DmitryBaranovskiy/raphael/issues/491
          $wrapper.appendTo( $GUITAR_CHORDS );
          seen[chord] = chordMemory;
          renderChord( chordMemory, $innerWrapper, $wrapper );
        }
      }
      return result;
    }

    function getChordMemory( chord, currentChordNumber )
    {
      var chordMemory = undefined;
      if ( previousSeen && chord in previousSeen )
      {
        chordMemory = previousSeen[chord];
      }
      else
      {
        var note = chord.charAt( 0 );
        var chordName = '';
        if ( chord.length > 1 )
        {
          var secondChar = chord.charAt( 1 );
          if ( secondChar === '♯' || secondChar === '♭' )
          {
            note += secondChar;
          }
        }
        if ( chord.length > note.length )
        {
          chordName = $.trim( chord.substr( note.length ) );
        }
        var chordRenderers = chorddata.get( chordName );
        if ( chordRenderers.length > 0 )
        {
          var noteRenderers = [];
          var currentIndex = 0;
          for ( var rendererIndex = 0; rendererIndex < chordRenderers.length; rendererIndex++ )
          {
            var noteRenderer = chordRenderers[rendererIndex].getChordForNote( note );
            noteRenderers.push( noteRenderer );
          }
          noteRenderers.sort( compareChords );
          if ( currentChordNumber !== undefined )
          {
            for ( rendererIndex = 0; rendererIndex < noteRenderers.length; rendererIndex++ )
            {
              var noteRenderer = noteRenderers[rendererIndex];
              if ( noteRenderer.getChordNumber() === currentChordNumber )
              {
                currentIndex = rendererIndex;
              }
            }
          }
          chordMemory = new ChordMemory( noteRenderers, currentIndex );
        }
      }
      return chordMemory;
    }

    function ChordMemory( renderers, currentIndex )
    {
      this.renderers = renderers;
      this.currentIndex = currentIndex;
    }

    function renderChord( chordMemory, $wrapper, $outerWrapper )
    {
      var noteRenderers = chordMemory.renderers;
      var index = chordMemory.currentIndex;
      var $previous = $PREVIOUS_BTN.clone().appendTo( $wrapper ).click( function()
      {
        if ( index === 0 )
        {
          return;
        }
        index--;
        update();
        share.changedText( 'guitarchords/renderChord' );
      } );
      var $next = $NEXT_BTN.clone().appendTo( $wrapper ).click( function()
      {
        if ( index === noteRenderers.length - 1 )
        {
          return;
        }
        index++;
        update();
        share.changedText( 'guitarchords/renderChord' );
      } );

      var paper = Raphael( $wrapper[0], 110, 116 );
      update();

      function renderChordBox()
      {
        paper.clear();
        var chordbox = new ChordBox( paper, 25, 14, 80, 80 );
        chordbox.num_frets = 6;
        var richChord = noteRenderers[index];
        var tuning = richChord.render( chordbox );
        chordbox.tuning = tuning;
        chordbox.draw();
      }

      function muteIcons()
      {
        if ( index === 0 )
        {
          $previous.addClass( 'icon-muted' );
        }
        else
        {
          $previous.removeClass( 'icon-muted' );
        }
        if ( index === noteRenderers.length - 1 )
        {
          $next.addClass( 'icon-muted' );
        }
        else
        {
          $next.removeClass( 'icon-muted' );
        }
      }

      function updateChordNumber()
      {
        chordMemory.currentIndex = index;
        $outerWrapper.data( 'chordNumber', noteRenderers[index].getChordNumber() );
      }

      function update()
      {
        renderChordBox();
        muteIcons();
        updateChordNumber();
      }
    }
  }

  function compareChords( a, b )
  {
    return a.rank() - b.rank();
  }

  /**
   * @method
   * @name module:plugins/guitarchords.serialize
   */
  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT;
    var chords = '';
    $( 'div.guitarchord' ).each( function()
    {
      var $wrapper = $( this );
      chords += functions.getCharacters( $wrapper.data( 'chordNumber' ), 1 );
    } );
    result += functions.getCharacters( chords.length, 2 );
    result += chords;
    return result;
  }

  function clear()
  {
    $GUITAR_CHORDS.empty();
  }

  function dbToVexChords( db )
  {
    var vex = [];
    for ( var i = 0; i < db.length; i++ )
    {
      var fret = db[i];
      vex.push( [ 6 - i, fret === -1 ? 'x' : fret ] );
    }
    return vex;
  }

  function load()
  {
    render();
    share.changed();
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear,
    'load' : load,
    'renderGuitarChords' : renderGuitarChords
  };
}

define( 'plugins/guitarchords', [ 'plugins', 'jquery', 'chorddata', 'share', 'plugins/chords', 'functions' ], function(
    plugins, $, chorddata, share, chords, functions )
{
  'use strict';
  var instance = new GuitarChords( $, chorddata, share, functions );
  chords.addPostRenderer( instance.renderGuitarChords );
  plugins.register( {
    'name' : 'guitarchords',
    'instance' : instance,
    'render' : false,
    'serialize' : true
  } );
  return instance;
} );
