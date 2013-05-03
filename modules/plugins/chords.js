function Chords( $, functions, save, toolbar )
{
  if ( Chords.prototype._instance )
  {
    return Chords.prototype._instance;
  }
  Chords.prototype._instance = this;

  var PLUGIN_ID = "01", DEFAULT_FORMAT = 0;

  var CONFIG = {
    CHORDS_COUNT_LENGTH : 1,
    CHORD_BEAT_COUNT_LENGTH : 1,
    CHORDITEMS_COUNT_LENGTH : 1,
    TEXTITEMS_COUNT_LENGTH : 1,
    TIME_SIGNATURE_LENGTH : 1,
    DEFAULT_TIME_SIGNATURE : 4
  };

  var ESCAPE_CHARACTER = '~', ESCAPES = {};
  ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;
  ESCAPES['♭'] = 'b';
  ESCAPES['♯'] = 's';
  ESCAPES['_'] = '-';

  var BULLETS = '••••••••••••••••';

  var SINGLE_BARLINE = $( '<li class="symbol"><img class="barline" src="images/single-barline.svg"  alt="|"></li>' );

  var MIN_WIDTH = 100;
  var MAX_WIDTH = 1000;
  var WRAPPER_MARGIN = 7;

  var PARENT = $( '#items' );

  toolbar.registerChordsModule( {
    'getChordData' : getChordData,
    'createItem' : createItem
  } );

  functions.bindButton( "#add-chord", createItem );

  var format = DEFAULT_FORMAT;
  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function update()
  {
    PARENT.empty();
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
      PARENT.addClass( 'has-text' );
    }
    var beatsSum = 0;
    for ( var i = 0; i < chordItems.length; i++ )
    {
      var chordItem = chordItems[i];
      createItem( chordItem );
      beatsSum += chordItem.beats;
      if ( beatsSum % timeSignature === 0 )
      {
        SINGLE_BARLINE.clone().appendTo( PARENT );
      }
    }
    $( '#time-signature' ).val( "" + deserializedData.timeSignature );
  }

  function deserialize( data )
  {
    var chords = [];
    var chordBeats = [];
    var chordItems = [];
    var timeSignature = CONFIG.DEFAULT_TIME_SIGNATURE;
    try
    {
      var currentPos = 0;

      timeSignature = functions.getNumber( data.substr( currentPos++, CONFIG.TIME_SIGNATURE_LENGTH ) );

      var read = functions.readStringArray( {
        'data' : data,
        'currentPos' : currentPos,
        'countSize' : CONFIG.CHORDS_COUNT_LENGTH,
        'transformer' : deserializeChord
      } );
      chords = read.array;
      currentPos = read.position;

      var numberOfChordBeats = functions.getNumber( data.substr( currentPos++, CONFIG.CHORD_BEAT_COUNT_LENGTH ) );
      for ( var i = 0; i < numberOfChordBeats; i++ )
      {
        var chord = functions.getNumber( data.charAt( currentPos++ ) );
        var beats = functions.getNumber( data.charAt( currentPos++ ) );
        chordBeats.push( new ChordBeat( chord, beats ) );
      }

      var numberOfChordItems = functions.getNumber( data.substr( currentPos++, CONFIG.CHORDITEMS_COUNT_LENGTH ) );
      for ( var i = 0; i < numberOfChordItems; i++ )
      {
        var chordBeat = chordBeats[functions.getNumber( data.charAt( currentPos++ ) )];
        var chordText = chords[chordBeat.chord];
        chordItems.push( new ChordData( chordText, chordBeat.beats ) );
      }

      if ( data.length > currentPos )
      {
        var read = functions.readStringArray( {
          'data' : data,
          'currentPos' : currentPos,
          'size' : numberOfChordItems
        } );
        var items = read.array;

        for ( var i = 0; i < numberOfChordItems; i++ )
        {
          chordItems[i].lyrics = items[i];
        }
      }
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

  function ChordData( chord, beats, lyrics )
  {
    this.chord = chord;
    this.beats = beats;
    this.lyrics = lyrics;
  }

  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT;
    var state = getData();
    var chordItems = state.chordItems;
    var chordBeatsItems = state.chordBeatsItems;
    var chordBeatsCollection = state.chordBeatsCollection;
    var textItems = state.textItems;

    result += functions.getCharacters( state.timeSignature, CONFIG.TIME_SIGNATURE_LENGTH );

    result += functions.getCharacters( chordItems.length, CONFIG.CHORDS_COUNT_LENGTH );
    for ( var i = 0; i < chordItems.length; i++ )
    {
      var serializedChord = serializeChord( chordItems[i] );
      result += functions.getCharacters( serializedChord.length, 1 );
      result += serializedChord;
    }

    result += functions.getCharacters( chordBeatsItems.length, CONFIG.CHORDITEMS_COUNT_LENGTH );
    for ( var i = 0; i < chordBeatsItems.length; i++ )
    {
      var chordBeatsItem = chordBeatsItems[i];
      result += functions.getCharacters( chordBeatsItem.chord, 1 );
      result += functions.getCharacters( chordBeatsItem.beats, 1 );
    }

    result += functions.getCharacters( chordBeatsCollection.length, CONFIG.CHORDITEMS_COUNT_LENGTH );
    for ( var i = 0; i < chordBeatsCollection.length; i++ )
    {
      result += functions.getCharacters( chordBeatsCollection[i], 1 );
    }

    if ( textItems.length > 0 )
    {
      for ( var i = 0; i < textItems.length; i++ )
      {
        result += functions.getCharacters( textItems[i].length, 1 );
        result += textItems[i];
      }
    }
    return result.length > 3 ? result : '';
  }

  function getData()
  {
    var chords = {}, chordNo = 0;
    var chordDataItems = [];
    var chordValues = [];
    var chordBeatsKeys = {}, chordBeatsNo = 0;
    var chordBeatsValues = [];
    var chordBeatsCollection = [];
    var textItems = [];
    var hasTextItems = false;
    var timeSignature = $( '#time-signature' ).val();
    $( '#items > li.item' ).each( function( index )
    {
      var chordData = getChordData( this );
      chordDataItems.push( chordData );
      var val = chordData.chord;
      if ( typeof ( chords[val] ) === 'undefined' )
      {
        chords[val] = chordNo;
        chordNo++;
        chordValues.push( val );
      }
      var beatsVal = chordData.beats;
      var chordBeatsLookup = "" + chords[val] + "=" + beatsVal;
      if ( typeof ( chordBeatsKeys[chordBeatsLookup] ) === 'undefined' )
      {
        chordBeatsKeys[chordBeatsLookup] = chordBeatsNo;
        chordBeatsNo++;
        chordBeatsValues.push( new ChordBeat( chords[val], beatsVal ) );
      }
      chordBeatsCollection.push( chordBeatsKeys[chordBeatsLookup] );
      if ( chordData.lyrics != "" )
      {
        hasTextItems = true;
      }
    } );
    if ( hasTextItems )
    {
      $( chordDataItems ).each( function()
      {
        textItems.push( this.lyrics );
      } );
    }
    return {
      'chordItems' : chordValues,
      'chordBeatsItems' : chordBeatsValues,
      'chordBeatsCollection' : chordBeatsCollection,
      'textItems' : textItems,
      'timeSignature' : timeSignature
    };
  }

  function getChordData( li )
  {
    var wrapper = $( li );
    var chord = $( 'input.chord-text', wrapper ).get( 0 );
    var beats = $( 'div.duration > a', wrapper ).get( 0 );
    var chordText = $( chord ).val();
    var beatCount = $( beats ).text().length;
    var lyrics = undefined;
    if ( PARENT.hasClass( 'has-text' ) )
    {
      lyrics = $( $( 'input.song-text', wrapper ).get( 0 ) ).val() || '';
    }
    return new ChordData( chordText, beatCount, lyrics );
  }

  function serializeChord( chord )
  {
    var string = chord;
    $.each( ESCAPES, function( index, value )
    {
      string = string.split( index ).join( ESCAPE_CHARACTER + value );
    } );
    return string;
  }

  function deserializeChord( chord )
  {
    var string = chord;
    $.each( ESCAPES, function( index, value )
    {
      string = string.split( ESCAPE_CHARACTER + value ).join( index );
    } );
    return string;
  }

  function createItem( chordData )
  {
    var chordText = undefined;
    var lyrics = undefined;
    var beats = undefined;
    if ( typeof chordData !== 'undefined' )
    {
      chordText = chordData.chord;
      lyrics = chordData.lyrics;
      beats = chordData.beats;
    }
    var wrapper = $( '<li class="item" />' )
        .append(
            '<div class="handle"><i class="icon-move" title="move"></i><i class="icon-pushpin" title="select/unselect"></i></div>' );
    var input = $( '<input class="chord-text" type="text" title="Add a chord" placeholder="Chord…" />' );
    if ( chordText )
    {
      input.val( chordText );
    }
    var textInput = false;
    var div = $( '<div class="chord"/>' );
    var more = $( '<i class="icon-double-angle-down" title="Add song text"></i>' );
    input.appendTo( div );
    wrapper.append( div );
    wrapper.append( more );
    wrapper.appendTo( PARENT );

    createBeats( beats, wrapper );

    $( input ).keydown( {
      "next" : true
    }, function( event )
    {
      handleKeyEvent( event );
    } );

    $( more ).mousedown( function( event )
    {
      event.stopImmediatePropagation();
      PARENT.addClass( 'has-text' );
      addTextInput();
      textInput = $( this ).siblings( 'div.chord' ).children( 'input.song-text' ).first();
    } );

    addPinEvents( wrapper );

    if ( PARENT.hasClass( 'has-text' ) )
    {
      addTextInput();
      textInput = input.siblings( 'input.song-text' ).first();
    }

    if ( lyrics !== undefined )
    {
      textInput.val( lyrics );
    }

    prepareResize( input, wrapper );
    performResize( input, textInput, wrapper );

    if ( chordText === undefined && lyrics === undefined )
    {
      // create a blank item
      input.focus();
    }

    function createBeats( beats, wrapper )
    {
      var defaultBeats = parseInt( $( '#time-signature' ).val() );
      var num = defaultBeats;
      if ( typeof beats !== 'undefined' )
      {
        num = beats;
      }
      var beatsWrapper = $( '<div class="btn-group duration">' );
      var currentBeats = $( '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" title="Beats for this chord"/>' );
      currentBeats.appendTo( beatsWrapper );
      currentBeats.text( beatsToString( num ) );
      currentBeats.dropdown();
      var list = $( '<ul class="dropdown-menu"/>' );
      list.appendTo( beatsWrapper );

      for ( var i = defaultBeats; i > 0; i-- )
      {
        var beatString = beatsToString( i );
        var option = $( '<li><a href="#">' + beatString + '</a></li>' );
        option.appendTo( list );
        option.click( function( event )
        {
          currentBeats.dropdown( 'toggle' );
          // TODO check if there is actually a change
          currentBeats.text( $( 'a', this ).text() );
          save.changed();
          return false;
        } );
      }

      beatsWrapper.appendTo( wrapper );

      function beatsToString( num )
      {
        return BULLETS.substr( 0, num );
      }
    }

    function addPinEvents( wrapper )
    {
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

    function addTextInput()
    {
      $( 'div.chord input.chord-text' )
          .each(
              function()
              {
                if ( $( this ).siblings( 'input.song-text' ).length > 0 )
                {
                  return;
                }
                var textInput = $( '<input class="song-text" type="text" id="song-text" title="Add song text" placeholder="Text…" />' );
                textInput.appendTo( $( this ).parent() ).keydown( {
                  "next" : false
                }, function( event )
                {
                  handleKeyEvent( event );
                } ).blur( function( event )
                {
                  handleBlurEvent( event );
                } ).change( function()
                {
                  save.changed();
                } );
                prepareResize( textInput, wrapper );
              } );
    }

    function handleBlurEvent( event )
    {
      // TODO
      // console.log( 'blur event!' );
    }

    function handleKeyEvent( event )
    {
      var target = $( event.target );
      if ( event.which === 13 || event.which === 9 )
      {
        event.preventDefault();
        target.blur();
        if ( event.data.next && event.which === 9 )
        {
          target.siblings( 'input' ).focus();
        }
        performResize( input, textInput, wrapper );
        save.changed();
      }
      else if ( event.which === 189 && event.shiftKey === true && checkAbsentKey( event.altKey )
          && checkAbsentKey( event.ctrlKey ) && checkAbsentKey( event.metaKey ) )
      {
        // TODO: error dialog or workaround
        event.preventDefault();
      }
    }

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
    // var newContent = '';
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
  }

  function performResize( input, textInput, wrapper )
  {
    var inputContent = $.trim( input.val() );
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
    input.val( inputContent );
    var minWidth = calculateResize( input );
    if ( textInput )
    {
      var textMinWidth = calculateResize( textInput );
      if ( textMinWidth > minWidth )
      {
        minWidth = textMinWidth;
      }
    }
    wrapper.width( minWidth + WRAPPER_MARGIN );
  }

  function checkAbsentKey( key )
  {
    return key !== undefined && key == false;
  }

  function prepareResize( input, wrapper )
  {
    var testSubject = $( '<div/>' ).css( {
      position : 'absolute',
      top : -9999,
      left : -9999,
      width : 'auto',
      fontSize : input.css( 'fontSize' ),
      fontFamily : input.css( 'fontFamily' ),
      fontWeight : input.css( 'fontWeight' ),
      letterSpacing : input.css( 'letterSpacing' ),
      whiteSpace : 'nowrap'
    } );
    testSubject.insertAfter( input );
    input.data( "testSubject", testSubject );
  }

  function calculateResize( input )
  {
    var val = '';
    if ( val === ( val = input.val() ) )
    {
      return MIN_WIDTH;
    }

    var testSubject = input.data( "testSubject" );

    // Enter new content into testSubject
    var escaped = val.replace( /&/g, '&amp;' ).replace( /\s/g, '&nbsp;' ).replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' );
    testSubject.html( escaped );

    // Calculate new width, check min/max values.
    var testerWidth = testSubject.width();
    var newWidth = testerWidth > MIN_WIDTH ? testerWidth : MIN_WIDTH;
    newWidth = newWidth > MAX_WIDTH ? MAX_WIDTH : newWidth;

    return newWidth;
  }

  return {
    "update" : update,
    "serialize" : serialize,
    "setData" : setData,
    "ChordData" : ChordData
  };
}

define( "chords", [ "plugins", "jquery", "functions", "save", "toolbar" ], function( plugins, $, functions, save,
    toolbar )
{
  plugins.register( new plugins.PluginInfo( {
    "name" : "chords",
    "instance" : new Chords( $, functions, save, toolbar ),
    "alwaysRun" : true,
    "serialize" : true
  } ) );
} );
