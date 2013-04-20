function Chords( $, functions )
{
  if ( Chords.prototype._instance )
  {
    return Chords.prototype._instance;
  }
  Chords.prototype._instance = this;

  var PLUGIN_ID = "01", DEFAULT_FORMAT = "0";

  var CONFIG = {
    CHORDS_COUNT_LENGTH : 1,
    CHORDITEMS_COUNT_LENGTH : 1
  };

  var ESCAPE_CHARACTER = '~', ESCAPES = {};
  ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;
  ESCAPES['♭'] = 'b';
  ESCAPES['♯'] = 's';

  var MIN_WIDTH = 100;
  var MAX_WIDTH = 1000;
  var WRAPPER_MARGIN = 7;

  functions.bindButton( "#add-chord", createItem );

  var format = DEFAULT_FORMAT;
  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function update( inputFormat, inputData )
  {
    if ( inputFormat )
    {
      format = inputFormat;
    }
    if ( inputData )
    {
      data = inputData;
    }
    $( '#items' ).empty();
    if ( !data )
    {
      return;
    }
    var chordItems = deserialize( data ).chordItems;
    for ( var i = 0; i < chordItems.length; i++ )
    {
      createItem( chordItems[i] );
    }
  }

  function deserialize( data )
  {
    var chords = [];
    var chordItems = [];
    try
    {
      var currentPos = 0;
      var numberOfChords = functions.getNumber( data.substr( currentPos++, CONFIG.CHORDS_COUNT_LENGTH ) );
      for ( var i = 0; i < numberOfChords; i++ )
      {
        var length = functions.getNumber( data.charAt( currentPos++ ) );
        chords.push( deserializeChord( data.substr( currentPos, length ) ) );
        currentPos += length;
      }
      var numberOfChordItems = functions.getNumber( data.substr( currentPos++,
          CONFIG.CHORDITEMS_COUNT_LENGTH ) );
      for ( var i = 0; i < numberOfChordItems; i++ )
      {
        var chordText = chords[functions.getNumber( data.charAt( currentPos++ ) )];
        chordItems.push( chordText );
      }
    }
    catch ( err )
    {
      console.log( err );
    }
    return {
      "chords" : chords,
      "chordItems" : chordItems
    };
  }
  ;

  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT;
    var state = getData();
    var chords = state.chords;
    var chordItems = state.chordItems;

    result += functions.getCharacters( chords.length, CONFIG.CHORDS_COUNT_LENGTH );
    for ( var i = 0; i < chords.length; i++ )
    {
      var serializedChord = serializeChord( chords[i] );
      result += functions.getCharacters( serializedChord.length, 1 );
      result += serializedChord;
    }

    result += functions.getCharacters( chordItems.length, CONFIG.CHORDITEMS_COUNT_LENGTH );
    for ( var i = 0; i < chordItems.length; i++ )
    {
      result += functions.getCharacters( chordItems[i], 1 );
    }
    return result.length > 3 ? result : '';
  }

  function getData( selector )
  {
    var sel = selector || '';
    var query = '#items ' + sel + ' input.chord-text';
    var chords = {}, chordNo = 0;
    var chordValues = [];
    $( query ).each( function()
    {
      var val = $( this ).val();
      if ( typeof ( chords[val] ) === 'undefined' )
      {
        chords[val] = chordNo;
        chordNo++;
        chordValues.push( val );
      }
    } );
    var chordItems = [];
    $( query ).each( function()
    {
      var val = $( this ).val();
      chordItems.push( chords[val] );
    } );
    return {
      'chords' : chordValues,
      'chordItems' : chordItems
    };
  }
  ;

  function serializeChord( chord )
  {
    var string = chord;
    $.each( ESCAPES, function( index, value )
    {
      string = string.replace( index, ESCAPE_CHARACTER + value );
    } );
    return string;
  }

  function deserializeChord( chord )
  {
    var string = chord;
    $.each( ESCAPES, function( index, value )
    {
      string = string.replace( ESCAPE_CHARACTER + value, index );
    } );
    return string;
  }

  function createItem( chordText )
  {
    var parent = $( "#items" );
    var wrapper = $( "<li />" )
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
    wrapper.appendTo( parent );

    $( input ).keydown( {
      "next" : true
    }, function( event )
    {
      handleKeyEvent( event );
    } );

    $( more ).mousedown( function( event )
    {
      event.stopImmediatePropagation();
      parent.addClass( 'has-text' );
      addTextInput();
      textInput = $( this ).siblings( 'div.chord' ).children( 'input.song-text' ).first();
    } );

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
    } );

    if ( parent.hasClass( 'has-text' ) )
    {
      addTextInput();
      textInput = input.siblings( 'input.song-text' ).first();
    }
    prepareResize( input, wrapper );
    performResize( input, textInput, wrapper );

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
    "setData" : setData
  };
}

define( "chords", [ "plugins", "jquery", "functions" ], function( plugins, $, functions )
{
  plugins.register( new plugins.PluginInfo( {
    "name" : "chords",
    "instance" : new Chords( $, functions ),
    "alwaysRun" : true,
    "serialize" : true
  } ) );
} );
