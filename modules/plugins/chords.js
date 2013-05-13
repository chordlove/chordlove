function Chords( $, functions, share, toolbar, resizer )
{
  'use strict';
  if ( Chords.prototype._instance )
  {
    return Chords.prototype._instance;
  }
  Chords.prototype._instance = this;

  var PLUGIN_ID = "01", DEFAULT_FORMAT = 0;

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
  var $INPUT = $( '<input class="chord-text resize-trigger" type="text" title="Add a chord" placeholder="Chord…" />' );
  var $CHORD = $( '<div class="chord"/>' );

  var beatsHandler = new Beats( $TIME_SIGNATURE, share );

  var postRenderers = [];
  var contentExtractors = [];

  var format = DEFAULT_FORMAT;
  var data = null;

  registerContentExtractor( extract );

  toolbar.registerChordsModule( {
    "getExtracts" : getExtracts,
    "createFromExtracts" : createFromExtracts
  } );

  functions.bindButton( "#add-chord", createItem );

  share.addStructureChangeListener( handleStructureChange );

  share.addTextChangeListener( function( event )
  {
    if ( event.data && event.data.item )
    {
      resizer.performResize( $( event.data.item ) );
    }
  } );

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function addPostRenderer( renderer )
  {
    postRenderers.push( renderer );
  }

  function render()
  {
    $PARENT.empty();
    if ( !data )
    {
      return;
    }
    if ( format !== DEFAULT_FORMAT )
    {
      throw "Unknown chords data format.";
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
      createItem( this );
      beatsSum += this.beats;
      if ( beatsSum % timeSignature === 0 )
      {
        $SINGLE_BARLINE.clone().appendTo( $PARENT );
      }
    } );
    $TIME_SIGNATURE.val( "" + deserializedData.timeSignature );
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
      "chordItems" : chordItems,
      "timeSignature" : timeSignature
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

    return result.length > 7 ? result : '';
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

  function getExtracts( li )
  {
    var extracts = [];
    for ( var i = 0; i < contentExtractors.length; i++ )
    {
      extracts.push( contentExtractors[i]( li ) );
    }
    return extracts;
  }

  function createFromExtracts( extracts )
  {
    var li = createItem();
    for ( var i = 0; i < extracts.length; i++ )
    {
      extracts[i]( li );
    }
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

  function createItem( chordData )
  {
    var chordText = undefined;
    var beats = undefined;
    if ( chordData !== undefined )
    {
      chordText = chordData.chord;
      beats = chordData.beats;
    }
    var wrapper = $LI.clone().append( $HANDLE.clone() );
    var input = $INPUT.clone();
    if ( chordText )
    {
      input.val( chordText );
    }
    var div = $CHORD.clone();
    input.appendTo( div );
    wrapper.append( div );
    // wrapper.append( more );
    wrapper.appendTo( $PARENT );

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
    if ( chordData === undefined )
    {
      // create a blank item
      input.focus();
      share.changedStructure( 'chords/new' );
    }

    return wrapper;
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
    "render" : render,
    "serialize" : serialize,
    "setData" : setData,
    "registerContentExtractor" : registerContentExtractor,
    "addPostRenderer" : addPostRenderer
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
          share.changedStructure( "chords/beats" );
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

function addPinEvents( wrapper )
{
  'use strict';
  $( '.icon-pushpin', wrapper ).mousedown( function( event )
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

define( "chords", [ "plugins", "jquery", "functions", "share", "toolbar", "resizer" ], function( plugins, $, functions,
    share, toolbar, resizer )
{
  'use strict';
  plugins.register( {
    "name" : "chords",
    "instance" : new Chords( $, functions, share, toolbar, resizer ),
    "render" : true,
    "serialize" : true
  } );
} );
