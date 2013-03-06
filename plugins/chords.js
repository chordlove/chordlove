function chords_chords()
{
  var PLUGIN_ID = "01";
  var DEFAULT_FORMAT = "0";

  var ESCAPE_CHARACTER = '~';
  var CHORD_DELIMITER = '.';
  var CHORD_ITEMS_DELIMITER = '!';

  var ESCAPES = {
    '♭' : 'b',
    '♯' : 's'
  };
  ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;

  var MIN_WIDTH = 100;
  var MAX_WIDTH = 1000;
  var WRAPPER_MARGIN = 7;

  window.chords.bindButton( "#add-chord", createItem );

  this.name = "Chords plugin";
  this.run = function run( format, data )
  {
    $( '#items' ).empty();
    if ( !data )
    {
      return;
    }
    var state = data.split( CHORD_ITEMS_DELIMITER );
    if ( state.length < 2 )
    {
      throw "Incomplete data for chords: " + data;
    }
    var chords = state[0].split( CHORD_DELIMITER );
    for ( var i = 0; i < chords.length; i++ )
    {
      chords[i] = deserializeChord( chords[i] );
    }
    var chordItems = state[1];
    for ( var i = 0; i < chordItems.length; i++ )
    {
      var chordText = chords[window.chords.getNumberFromChars( chordItems.charAt( i ) )];
      createItem( chordText );
    }
  };

  this.serialize = function()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT;
    var state = this.data();
    console.log( state );
    var chords = state.chords;
    var chordItems = state.chordItems;
    for ( var i = 0; i < chords.length; i++ )
    {
      chords[i] = serializeChord( chords[i] );
    }
    for ( var i = 0; i < chordItems.length; i++ )
    {
      chordItems[i] = window.chords.getCharsFromNumber( chordItems[i], 1 );
    }
    result += chords.join( CHORD_DELIMITER );
    result += CHORD_ITEMS_DELIMITER;
    result += chordItems.join( '' );
    return result.length > 3 ? result : '';
  };

  this.data = function( selector )
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
  };

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
      console.log( 'blur event!' );
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
  
  function transformChordString(string)
  {
    var inputContent = $.trim( string );
    //var newContent = '';
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
}