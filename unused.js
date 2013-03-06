  var keysSharp = [ "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" ], keysFlat = [ "C", "D♭", "D",
      "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B" ], modes = [ "Ionian", "Dorian", "Phrygian", "Lydian",
      "Mixolydian", "Aeolian", "Locrian" ], modeIntervals = [ 0, 2, 4, 5, 7, 9, 11 ];
  var keys = keysFlat;

  function setOptions( select, collection, transformer )
  {
    var selected = select[0].selectedIndex;
    if ( selected === -1 )
    {
      selected = 0;
    }
    select.empty();
    $( collection ).each( function( index, value )
    {
      if ( typeof ( transformer ) === "function" )
      {
        value = transformer( index, value );
      }
      $( "<option />" ).attr( "value", index ).text( value ).appendTo( select );
    } );
    select.val( selected );
  }

  function setEquivalentOptions( select, keyIndex, modeIndex )
  {
    setOptions( select, modes, function( index, value )
    {
      var interval = modeIntervals[index] - modeIntervals[modeIndex] + keyIndex + 12;
      interval %= 12;
      return value + " " + keys[interval];
    } );
  }

  function createItem( status )
  {
    if ( status.length === 3 )
    {
      createChord( status );
    }
    else
    {
      var wrapper = createWrapper( "symbol" ).append( status );
      var getStatus = function()
      {
        return status;
      };
      wrapper[0]["getStatus"] = getStatus;
    }
  }

  function createWrapper( className )
  {
    var parent = $( "#items" );
    var wrapper = $( "<li style='border-radius: 4px;' />" )
        .addClass( className )
        .append(
            "<div class='handle' style='border-top-left-radius: 4px; border-bottom-left-radius: 4px;'><i class='icon-move'></i></div>" );
    wrapper.appendTo( parent );
    return wrapper;
  }

  function createChord( status )
  {
    var wrapper = createWrapper( "item" );
    var key = $( "<select class='key'/>" );
    key.appendTo( wrapper );
    var mode = $( "<select class='mode'/>" );
    mode.appendTo( wrapper );
    setOptions( mode, modes );
    var equivalent = $( "<select class='equivalent'/>" );
    equivalent.appendTo( wrapper );

    function update()
    {
      setOptions( key, keys );
      setEquivalentOptions( equivalent, $( key )[0].selectedIndex, $( mode )[0].selectedIndex );
    }
    update();
    key.change( update );
    mode.change( update );

    var getStatus = function()
    {
      return Number( $( key )[0].selectedIndex ).toString( 16 ) + $( mode )[0].selectedIndex
          + $( equivalent )[0].selectedIndex;
    };

    var setStatus = function( status )
    {
      $( key ).val( parseInt( status.charAt( 0 ), 16 ) );
      $( mode ).val( status.charAt( 1 ) );
      update();
      $( equivalent ).val( status.charAt( 2 ) );
    };

    if ( typeof ( status ) === "string" && status.length === 3 )
    {
      setStatus( status );
    }

    wrapper[0]["update"] = update;
    wrapper[0]["getStatus"] = getStatus;
    wrapper[0]["setStatus"] = setStatus;
  }

  function sharpFlatChange( mode )
  {
    keys = mode.data === FLAT ? keysFlat : keysSharp;
    $( ".item" ).each( function()
    {
      this.update();
    } );
  }

  $( "#sharp" ).click( SHARP, sharpFlatChange );
  $( "#flat" ).click( FLAT, sharpFlatChange );

  function initializeState()
  {
    $( "#items" ).empty();
    return;
    var hash = decodeURIComponent( window.location.hash.substring( 1 ) );
    var pos = hash.indexOf( "?" );
    if ( pos !== -1 )
    {
      window.document.title = hash.substring( pos + 1 );
      $( "#title" ).val( window.document.title );
      hash = hash.substring( 0, pos );
    }
    var states = hash.match( /(\w{1,3}|\W)/g );
    $( states ).each( function()
    {
      createItem( this.toString() );
    } );
  }

  prepareCpanel( $( "#cpanel" ) );

