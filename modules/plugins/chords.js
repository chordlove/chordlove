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
 * Render and serialize chords together with beats per chord and time signature. <i>The core</i> of the whole
 * application.
 * <p>
 * There's three classes at play here, the core Chords class, the separate Beats class to manage beat counts and the
 * CopyPaste class to handle copy/paste actions.
 * 
 * @module plugins/chords
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires beats
 */

function Chords( $, functions, share, toolbar, resizer, beatsHandler )
{
  'use strict';
  if ( Chords.prototype._instance )
  {
    return Chords.prototype._instance;
  }
  Chords.prototype._instance = this;

  var PLUGIN_ID = '01', DEFAULT_FORMAT = 0;

  var DEFAULT_TIME_SIGNATURE = 4;
  var CHORDS_COUNT_LENGTH = 2;
  var CHORDITEMS_COUNT_LENGTH = 2;
  var TIME_SIGNATURE_LENGTH = 1;
  var CHORD_SIZE = 1;
  var BEAT_SIZE = 1;

  var START_OF_LINE = 'start-of-line'; // duplicated in structure.js

  var $SINGLE_BARLINE = $( '<dd class="symbol item-barline"><img class="barline" src="http://cdn.chordlove.com/images/symbols/single-barline.svg" alt="|"></dd>' );
  var $PARENT = $( '#items' );
  var $DD = $( '<dd class="item" />' );
  var $HANDLE = $( '<div class="handle"><i class="fa fa-arrows" title="move"></i><i class="fa fa-thumb-tack pin" title="select/unselect"></i></div>' );
  var $MENU = $( '<div class="btn-group chord-menu"><a class="btn dropdown-toggle" data-toggle="dropdown" href="#" title="More …"><i class="fa fa-cog"></i></a><ul class="dropdown-menu"></ul></div>' );
  var $MENU_LI = $( '<li />' );
  var $MENU_A = $( '<a href="#"/>' );
  var MENU_PASTE_BEFORE = '<i class="fa fa-fw fa-paste"></i> Paste before';
  var MENU_LABEL = '<i class="fa fa-fw fa-tag"></i> Label';
  var $INPUT = $( '<input class="chord-text resize-trigger empty-input form-control" type="text" title="Add a chord" placeholder="Chord…" />' );
  var $CHORD = $( '<div class="chord"/>' );
  var $LABEL = $( '<dt><input class="label-text form-control" type="text" title="Add a label" placeholder="Label…" /></dt>' );

  var postRenderers = [];
  var initialPostRenderingPerformed = false;
  var contentExtractors = [];
  var chordMenuMembers = [];

  var format = DEFAULT_FORMAT;
  var data = null;

  registerContentExtractor( extract );

  registerChordMenuMember( pasteBeforeMenu );
  registerChordMenuMember( labelMenu );

  var copyPaste = new CopyPaste( {
    'getExtracts' : getExtracts,
    'createItem' : createItem
  }, $, share, functions, resizer, $PARENT );

  functions.bindButton( '#add-chord', createItem );

  share.addStructureChangeListener( handleStructureChange );

  share.addTextChangeListener( function( event )
  {
    if ( event !== undefined && typeof event === 'object' && 'data' in event && 'item' in event.data )
    {
      resizer.performResize( $( event.data.item ) );
    }
  } );

  /**
   * Set format version and data to render.
   * 
   * @param {integer}
   *          inputFormat The format version.
   * @param {string}
   *          inputData The data.
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * Add a renderer to be executed after the chords have been rendered.
   * 
   * @method
   * @name module:plugins/chords.addPostRenderer
   * @param {Function}
   *          renderer The renderer to execute.
   */
  function addPostRenderer( renderer )
  {
    postRenderers.push( renderer );
    if ( initialPostRenderingPerformed )
    {
      renderer();
    }
  }

  /**
   * Render data. Kicked off by the {@link module:plugins} module.
   * 
   * @method
   * @name module:plugins/chords.render
   */
  function render()
  {
    $PARENT.empty();
    if ( !data )
    {
      return;
    }
    if ( format !== DEFAULT_FORMAT )
    {
      throw 'Unknown chords data format.';
    }
    var deserializedData = deserialize( data );
    var chords = deserializedData.chords;
    var chordItems = deserializedData.chordItems;
    var timeSignature = deserializedData.timeSignature;
    var hasText = chordItems && chordItems[0] && chordItems[0].lyrics !== undefined;
    if ( hasText )
    {
      $PARENT.addClass( 'has-text' );
    }
    var beatsSum = 0;
    beatsHandler.setTimeSignature( deserializedData.timeSignature );
    $.each( chordItems, function()
    {
      createItem( {
        'chordData' : this
      } );
      beatsSum += this.beats;
      if ( beatsSum % timeSignature === 0 )
      {
        $SINGLE_BARLINE.clone().appendTo( $PARENT );
      }
    } );
    $.each( postRenderers, function()
    {
      this( chords );
    } );
    initialPostRenderingPerformed = true;
    $PARENT.children( 'dd.item' ).each( function()
    {
      resizer.performResize( $( this ) );
    } );
  }

  function deserialize( input )
  {
    var chords = [];
    var chordItems = [];
    var timeSignature = DEFAULT_TIME_SIGNATURE;
    var currentPos = 0;
    try
    {
      timeSignature = functions.getNumber( input.substr( currentPos++, TIME_SIGNATURE_LENGTH ) );

      var read = functions.readStringArray( {
        'data' : input,
        'currentPos' : currentPos,
        'countSize' : CHORDS_COUNT_LENGTH
      } );
      chords = read.array;
      currentPos = read.position;

      var chordBeatChunks = functions.readChunkArray( {
        'data' : input,
        'currentPos' : currentPos,
        'countSize' : CHORDITEMS_COUNT_LENGTH,
        'chunkSize' : CHORD_SIZE + BEAT_SIZE
      } );
      $.each( chordBeatChunks, function()
      {
        var chordText = chords[functions.getNumber( this.charAt( 0 ) )];
        var chordBeat = functions.getNumber( this.charAt( 1 ) );
        chordItems.push( new ChordBeat( chordText, chordBeat ) );
      } );
    }
    catch ( err )
    {
      console.log( err );
    }
    return {
      'chordItems' : chordItems,
      'timeSignature' : timeSignature,
      'chords' : chords
    };
  }

  function clear()
  {
    $PARENT.empty();
  }

  function ChordBeat( chord, beats )
  {
    this.chord = chord;
    this.beats = beats;
  }

  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT;
    var state = getData();
    var chords = state.chords;
    var chordItems = state.chordItems;

    result += functions.getCharacters( state.timeSignature, TIME_SIGNATURE_LENGTH );

    result += functions.getCharacters( chords.length, CHORDS_COUNT_LENGTH );
    for ( var i = 0; i < chords.length; i++ )
    {
      var serializedChord = functions.encode( chords[i] );
      result += functions.getCharacters( serializedChord.length, 1 );
      result += serializedChord;
    }

    result += functions.getCharacters( chordItems.length, CHORDITEMS_COUNT_LENGTH );
    result += chordItems.join( '' );

    return result.length > 8 ? result : '';
  }

  function getData()
  {
    var chords = {}, chordNo = 0;
    var chordValues = [];
    var chordItems = [];
    var timeSignature = beatsHandler.getTimeSignatureAsInt();
    $PARENT.children( 'dd.item' ).each( function( index )
    {
      var chordData = getChordData( this );
      var val = chordData.chord;
      if ( !( val in chords ) )
      {
        chords[val] = functions.getCharacters( chordNo, CHORD_SIZE );
        chordNo++;
        chordValues.push( val );
      }
      chordItems.push( chords[val] + functions.getCharacters( chordData.beats, BEAT_SIZE ) );
    } );
    return {
      'chords' : chordValues,
      'chordItems' : chordItems,
      'timeSignature' : timeSignature
    };
  }

  function handleStructureChange( event )
  {
    updateBarlines();
  }

  function updateBarlines()
  {
    $PARENT.children( 'dd.item-barline' ).remove();
    var timeSignature = beatsHandler.getTimeSignatureAsInt();
    var beatsSum = 0;
    $PARENT.children( 'dd.item' ).each( function( index )
    {
      beatsSum += beatsHandler.getBeats( this ).length;
      if ( beatsSum % timeSignature === 0 )
      {
        $SINGLE_BARLINE.clone().insertAfter( this );
      }
    } );
  }

  /**
   * Register an extractor that extracts data for copy/paste operations.
   * <p>
   * The registered function will be provided a <code>LI</code> element and should return a new function which
   * processes a different <code>LI</code> element and applies the stored data to it. Something along the lines of:
   * 
   * <pre><code>
   * function extract( li )
   * {
   *   var data = getData( li );
   *   return function( newLi )
   *   {
   *     setData( newLi, data );
   *   }
   * }
   * </code></pre>
   * 
   * @method
   * @name module:plugins/chords.registerContentExtractor
   * @param {Function}
   *          extractor The extractor to register.
   */
  function registerContentExtractor( extractor )
  {
    contentExtractors.push( extractor );
  }

  function extract( li )
  {
    var chord = getChord( li );
    var beats = beatsHandler.getBeats( li );
    return function( theItem )
    {
      var $element = $( 'input.chord-text', theItem );
      $element.val( chord );
      functions.emptyOrNot( $element, chord );
      $( 'div.duration > a', theItem ).text( beats );
    };
  }

  /**
   * Get contents of items. Only made available to the {@link module:toolbar} for copy operations.
   * 
   * @method
   * @name module:plugins/chords.getExtracts
   * @param {HTMLLIElement}
   *          li The element to extract data from.
   * @returns {Array} Extracted data from different extractors.
   */
  function getExtracts( li )
  {
    var extracts = [];
    for ( var i = 0; i < contentExtractors.length; i++ )
    {
      extracts.push( contentExtractors[i]( li ) );
    }
    return extracts;
  }

  function getChord( li )
  {
    return $( 'input.chord-text', li ).val();
  }

  function getChordData( li )
  {
    var chordText = getChord( li );
    var beatCount = beatsHandler.getBeats( li ).length;
    return new ChordBeat( chordText, beatCount );
  }

  function createItem( inputData )
  {
    var chordText = undefined;
    var beats = undefined;
    var before = undefined;
    if ( inputData !== undefined )
    {
      if ( 'chordData' in inputData )
      {
        chordText = inputData.chordData.chord;
        beats = inputData.chordData.beats;
      }
      if ( 'before' in inputData )
      {
        before = inputData.before;
      }
    }
    var $handle = $HANDLE.clone();
    var $wrapper = $DD.clone().append( $handle );
    var $menu = $MENU.clone();
    var $menuList = $( 'ul', $menu );
    addChordMenuItems( $menuList, $wrapper );
    $handle.append( $menu );
    var $input = $INPUT.clone();
    if ( chordText )
    {
      $input.val( chordText );
      functions.emptyOrNot( $input, chordText );
    }
    var div = $CHORD.clone();
    $input.appendTo( div );
    $wrapper.append( div );
    if ( before )
    {
      $wrapper.insertBefore( before );
    }
    else
    {
      $wrapper.appendTo( $PARENT );
    }

    beatsHandler.createBeats( beats, $wrapper );

    $( $input ).keydown( functions.handleInputKeyEvent ).blur( {
      'item' : $wrapper
    }, function( event )
    {
      $input.val( transformChordString( $input.val() ) );
      share.changedText( event );
    } ).bind( 'input', functions.handleInputChangeEvent );

    addPinEvents( $wrapper );

    resizer.prepareResize( $wrapper );
    if ( inputData === undefined )
    {
      // create a blank item
      $input.focus();
      share.changedStructure( 'chords/new' );
    }

    return $wrapper;
  }

  function addPinEvents( $wrapper )
  {
    $( 'i.pin', $wrapper ).mousedown( function( event )
    {
      event.stopImmediatePropagation();
      $wrapper.toggleClass( 'ui-selected' );
      return false;
    } );
  }

  /**
   * Register a member in the chord menu.
   * <p>
   * The registered function will be provided the chord item wrapping <code>LI</code> element and the <code>LI</code>
   * and <code>A</code> element going into the menu, all wrapped as jQuery objects. Manipulate the menu elements as
   * needed. Something along the lines of:
   * 
   * <pre><code>
   * function menuMember( $wrapper, $li, $a )
   * {
   *   $a.html( '&lt;i class=&quot;fa-paste&quot;&gt;&lt;/i&gt; Paste before' ).click( {
   *     'li' : $wrapper.get( 0 )
   *   }, function( event )
   *   {
   *     event.preventDefault();
   *     // the real work happens elsewhere in this case
   *     copyPaste.pasteItems( event.data.li );
   *   } );
   * }
   * </code></pre>
   * 
   * @method
   * @name module:plugins/chords.registerChordMenuMember
   * @param {Function}
   *          menuMember The menu member function to register.
   */
  function registerChordMenuMember( menuMember )
  {
    chordMenuMembers.push( menuMember );
  }

  function addChordMenuItems( $menuList, $wrapper )
  {
    for ( var i = 0; i < chordMenuMembers.length; i++ )
    {
      var menuMember = chordMenuMembers[i];
      var $menuLi = $MENU_LI.clone();
      var $menuA = $MENU_A.clone();
      menuMember( $wrapper, $menuLi, $menuA );
      $menuLi.append( $menuA );
      $menuList.append( $menuLi );
    }
  }

  function pasteBeforeMenu( $wrapper, $li, $a )
  {
    $a.html( MENU_PASTE_BEFORE ).click( {
      'dd' : $wrapper.get( 0 )
    }, function( event )
    {
      event.preventDefault();
      copyPaste.pasteItems( event.data.dd );
    } );
  }

  function labelMenu( $wrapper, $li, $a )
  {
    $a.html( MENU_LABEL ).click( {
      'dd' : $wrapper.get( 0 )
    }, function( event )
    {
      event.preventDefault();
      var $dd = $( event.data.dd );
      var $dt = $dd.prev( 'dt' ).first();
      if ( $dt.length === 0 )
      {
        $dt = $LABEL.clone();
        $dt.insertBefore( $dd );
        $dt.keydown( functions.handleInputKeyEvent );
        if ( $dd.hasClass( START_OF_LINE ) )
        {
          $dd.removeClass( START_OF_LINE );
          $dt.addClass( START_OF_LINE );
        }
      }
      var $input = $dt.children( 'input' );
      $input.focus();
    } );
  }

  function setCharAt( str, index, chr )
  {
    if ( index > str.length - 1 )
    {
      return str;
    }
    return str.substr( 0, index ) + chr + str.substr( index + 1 );
  }

  function transformChordString( string )
  {
    var inputContent = $.trim( string );
    if ( inputContent.length > 1 )
    {
      var secondChar = inputContent.charAt( 1 );
      if ( secondChar === 'b' )
      {
        inputContent = setCharAt( inputContent, 1, '♭' );
      }
      else if ( secondChar === '#' )
      {
        inputContent = setCharAt( inputContent, 1, '♯' );
      }
    }
    return inputContent;
  }

  function checkAbsentKey( key )
  {
    return key !== undefined && key == false;
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear,
    'registerContentExtractor' : registerContentExtractor,
    'addPostRenderer' : addPostRenderer,
    'registerChordMenuMember' : registerChordMenuMember
  };
}

function CopyPaste( chords, $, share, functions, resizer, $PARENT )
{
  'use strict';
  var copiedItems = [];

  functions.bindButton( '#cut', cutItems );
  functions.bindButton( '#copy', copyItems );
  functions.bindButton( '#paste', pasteItems );
  functions.bindButton( '#delete', deleteItems );

  function getSelectedItems()
  {
    return $( 'dd.ui-selected', $PARENT );
  }

  function deleteItems()
  {
    getSelectedItems().remove();
    share.changedStructure( 'chords/CopyPaste/delete' );
  }

  function cutItems()
  {
    copyItems();
    getSelectedItems().remove();
    share.changedStructure( 'chords/CopyPaste/cut' );
  }

  function copyItems()
  {
    copiedItems = [];
    getSelectedItems().each( function()
    {
      copiedItems.push( chords.getExtracts( this ) );
    } );
  }

  function pasteItems( beforeElement )
  {
    var before = beforeElement ? {
      'before' : beforeElement
    } : undefined;
    var $lastLi = undefined;
    $( copiedItems ).each( function()
    {
      var $li = chords.createItem( before );
      for ( var i = 0; i < this.length; i++ )
      {
        this[i]( $li );
        resizer.performResize( $li );
        $lastLi = $li;
      }
    } );
    $( 'dd.ui-selected', $PARENT ).removeClass( 'ui-selected' );
    share.changedStructure( 'chords/CopyPaste/paste' );
    $lastLi.find( 'input' ).blur();
  }

  return {
    'pasteItems' : pasteItems
  };
}

define( 'plugins/chords', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer', 'plugins/beats' ],
    function( plugins, $, functions, share, toolbar, resizer, beats )
    {
      'use strict';
      var instance = new Chords( $, functions, share, toolbar, resizer, beats );
      plugins.register( {
        'name' : 'chords',
        'instance' : instance,
        'render' : true,
        'serialize' : true
      } );
      return instance;
    } );
