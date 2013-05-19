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
 */

function Chords( $, functions, share, toolbar, resizer )
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

  var $SINGLE_BARLINE = $( '<li class="symbol item-barline"><img class="barline" src="images/single-barline.svg" alt="|"></li>' );
  var $PARENT = $( '#items' );
  var $TIME_SIGNATURE = $( '#time-signature' );
  var $LI = $( '<li class="item" />' );
  var $HANDLE = $( '<div class="handle"><i class="icon-move" title="move"></i><i class="icon-pushpin" title="select/unselect"></i></div>' );
  var $MENU = $( '<div class="btn-group chord-menu"><a class="btn dropdown-toggle" data-toggle="dropdown" href="#" title="More …"><i class="icon-cog"></i></a><ul class="dropdown-menu"></ul></div>' );
  var $MENU_LI = $( '<li />' );
  var $MENU_A = $( '<a href="#"/>' );
  var MENU_PASTE_BEFORE = '<i class="icon-paste"></i> Paste before';
  var $INPUT = $( '<input class="chord-text resize-trigger" type="text" title="Add a chord" placeholder="Chord…" />' );
  var $CHORD = $( '<div class="chord"/>' );

  var beatsHandler = new Beats( $TIME_SIGNATURE, share );

  var postRenderers = [];
  var contentExtractors = [];

  var format = DEFAULT_FORMAT;
  var data = null;

  registerContentExtractor( extract );

  var copyPaste = new CopyPaste( {
    'getExtracts' : getExtracts,
    'createItem' : createItem
  }, share, functions, $PARENT );

  functions.bindButton( '#add-chord', createItem );

  share.addStructureChangeListener( handleStructureChange );

  share.addTextChangeListener( function( event )
  {
    if ( event.data && event.data.item )
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
    var chordItems = deserializedData.chordItems;
    var timeSignature = deserializedData.timeSignature;
    var hasText = chordItems && chordItems[0] && chordItems[0].lyrics !== undefined;
    if ( hasText )
    {
      $PARENT.addClass( 'has-text' );
    }
    var beatsSum = 0;
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
    $TIME_SIGNATURE.val( '' + deserializedData.timeSignature );
    $.each( postRenderers, function()
    {
      this();
    } );
    $PARENT.children( 'li.item' ).each( function()
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
      'timeSignature' : timeSignature
    };
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
    var timeSignature = $TIME_SIGNATURE.val();
    $PARENT.children( 'li.item' ).each( function( index )
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
    $PARENT.children( 'li.item-barline' ).remove();
    var timeSignature = $TIME_SIGNATURE.val();
    var beatsSum = 0;
    $PARENT.children( 'li.item' ).each( function( index )
    {
      beatsSum += getBeats( this ).length;
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
    var beats = getBeats( li );
    return function( theItem )
    {
      $( 'input.chord-text', theItem ).val( chord );
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

  function getBeats( li )
  {
    return $( 'div.duration > a', li ).text();
  }

  function getChord( li )
  {
    return $( 'input.chord-text', li ).val();
  }

  function getChordData( li )
  {
    var chordText = getChord( li );
    var beatCount = getBeats( li ).length;
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
    var handle = $HANDLE.clone();
    var wrapper = $LI.clone().append( handle );
    var menu = $MENU.clone();
    var menuList = $( 'ul', menu );
    addChordMenuItems( menuList, wrapper );
    handle.append( menu );
    var input = $INPUT.clone();
    if ( chordText )
    {
      input.val( chordText );
    }
    var div = $CHORD.clone();
    input.appendTo( div );
    wrapper.append( div );
    if ( before )
    {
      wrapper.insertBefore( before );
    }
    else
    {
      wrapper.appendTo( $PARENT );
    }

    beatsHandler.createBeats( beats, wrapper );

    $( input ).keydown( functions.handleInputKeyEvent ).blur( {
      'item' : wrapper
    }, function( event )
    {
      input.val( transformChordString( input.val() ) );
      share.changedText( event );
    } );

    addPinEvents( wrapper );

    resizer.prepareResize( wrapper );
    if ( inputData === undefined )
    {
      // create a blank item
      input.focus();
      share.changedStructure( 'chords/new' );
    }

    return wrapper;
  }

  function addChordMenuItems( menuList, wrapper )
  {
    var li = $MENU_LI.clone();
    var a = $MENU_A.clone().html( MENU_PASTE_BEFORE );
    a.click( {
      'li' : wrapper.get( 0 )
    }, function( event )
    {
      event.preventDefault();
      copyPaste.pasteItems( event.data.li );
    } );
    li.append( a );
    menuList.append( li );
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
    'registerContentExtractor' : registerContentExtractor,
    'addPostRenderer' : addPostRenderer
  };
}

function Beats( $TIME_SIGNATURE, share )
{
  'use strict';
  var MAX_BULLETS = 16;
  var $BEATS_WRAPPER = $( '<div class="btn-group duration">' );
  var $BEATS_LINK = $( '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" title="Beats for this chord"/>' );
  var $BEATS_LIST = $( '<ul class="dropdown-menu"/>' );
  var BULLET_STRING = '••••••••••••••••';
  var BULLETS = [];
  for ( var len = 0; len <= MAX_BULLETS; len++ )
  {
    BULLETS.push( BULLET_STRING.substr( 0, len ) );
  }

  function createBeats( beats, wrapper )
  {

    var defaultBeats = parseInt( $TIME_SIGNATURE.val() );
    var num = defaultBeats;
    if ( beats !== undefined )
    {
      num = beats;
    }
    var beatsWrapper = $BEATS_WRAPPER.clone();
    var currentBeats = $BEATS_LINK.clone();
    currentBeats.appendTo( beatsWrapper );
    currentBeats.text( BULLETS[num] );
    currentBeats.dropdown();
    var list = $BEATS_LIST.clone();
    list.appendTo( beatsWrapper );

    for ( var len = defaultBeats; len > 0; len-- )
    {
      var beatString = BULLETS[len];
      var option = $( '<li><a href="#">' + beatString + '</a></li>' );
      option.appendTo( list );
      option.click( {
        'beatString' : beatString
      }, function( event )
      {
        currentBeats.dropdown( 'toggle' );
        if ( currentBeats.text() !== event.data.beatString )
        {
          currentBeats.text( event.data.beatString );
          currentBeats.blur();
          share.changedStructure( 'chords/beats' );
        }
        return false;
      } );
    }

    beatsWrapper.appendTo( wrapper );
  }

  return {
    'createBeats' : createBeats
  };
}

function CopyPaste( chords, share, functions, $PARENT )
{
  'use strict';
  var copiedItems = [];

  functions.bindButton( '#cut', cutItems );
  functions.bindButton( '#copy', copyItems );
  functions.bindButton( '#paste', pasteItems );
  functions.bindButton( '#delete', deleteItems );

  function getSelectedItems()
  {
    return $( 'li.ui-selected', $PARENT );
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
    $( copiedItems ).each( function()
    {
      var li = chords.createItem( before );
      for ( var i = 0; i < this.length; i++ )
      {
        this[i]( li );
      }
    } );
    $( 'li.ui-selected', $PARENT ).removeClass( 'ui-selected' );
    share.changedStructure( 'chords/CopyPaste/paste' );
  }

  return {
    'pasteItems' : pasteItems
  };
}

function addPinEvents( wrapper )
{
  'use strict';
  $( 'i.icon-pushpin', wrapper ).mousedown( function( event )
  {
    event.stopImmediatePropagation();
    if ( wrapper.hasClass( 'ui-selected' ) )
    {
      wrapper.removeClass( 'ui-selected' );
    }
    else
    {
      wrapper.addClass( 'ui-selected' );
    }
    return false;
  } );
}

define( 'chords', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer' ], function( plugins, $, functions,
    share, toolbar, resizer )
{
  'use strict';
  plugins.register( {
    'name' : 'chords',
    'instance' : new Chords( $, functions, share, toolbar, resizer ),
    'render' : true,
    'serialize' : true
  } );
} );
