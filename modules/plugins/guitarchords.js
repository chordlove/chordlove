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
 */

function GuitarChords( $, chorddata, share )
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
  var $GUITAR_CHORDS = $( '<div id="guitarchords"/>' );
  var $CHORD_WRAPPER = $( '<div class="guitarchord"/>' );
  var $CHORD_LABEL = $( '<p class="guitarchord"/>' );
  $( '#addons' ).append( $GUITAR_CHORDS );

  var renderOnce = true;

  share.addStructureChangeListener( changeListener );
  share.addTextChangeListener( changeListener );

  if ( renderOnce )
  {
    render();
  }

  function changeListener()
  {
    render();
  }

  /**
   * @method
   * @name module:plugins/guitarchords.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/guitarchords.render
   */
  function render()
  {
    renderOnce = false;
    var seen = {};
    $GUITAR_CHORDS.empty();
    $PARENT.children( 'li.item' ).each( function()
    {
      var chord = $( 'input.chord-text', this ).val();
      if ( !( chord in seen ) )
      {
        seen[chord] = true;
        if ( chord.length )
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
          if ( chordRenderers.length )
          {
            var $wrapper = $CHORD_WRAPPER.clone();
            // make the wrapper visible here because of:
            // https://github.com/DmitryBaranovskiy/raphael/issues/491
            $wrapper.appendTo( $GUITAR_CHORDS );
            var paper = Raphael( $wrapper[0], 110, 120 ); // height 102 -> 120
            var chordbox = new ChordBox( paper, 25, 20, 80, 80 );
            var tuning = [];
            chordbox.num_frets = 6;
            if ( chordRenderers.length )
            {
              var noteRenderers = [];
              for ( var rendererIndex = 0; rendererIndex < chordRenderers.length; rendererIndex++ )
              {
                noteRenderers.push( chordRenderers[rendererIndex].getChordForNote( note ) );
              }
              noteRenderers.sort( compareChords );
              var richChord = noteRenderers[0];
              tuning = richChord.render( chordbox );
            }
            chordbox.tuning = tuning;
            chordbox.draw();
            $CHORD_LABEL.clone().text( chord ).appendTo( $wrapper );
          }
        }
      }
    } );
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
    return result;
  }

  function clear()
  {
    // not yet
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
    if ( renderOnce )
    {
      render();
    }
    share.changed();
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear,
    'load' : load
  };
}

define( 'plugins/guitarchords', [ 'plugins', 'jquery', 'chorddata', 'share', 'plugins/chords' ], function( plugins, $,
    chorddata, share, chords )
{
  'use strict';
  var instance = new GuitarChords( $, chorddata, share );
  chords.addPostRenderer( instance.render );
  plugins.register( {
    'name' : 'guitarchords',
    'instance' : instance,
    'render' : false,
    'serialize' : true
  } );
  return instance;
} );
