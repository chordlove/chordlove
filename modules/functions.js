define(
    'functions',
    [ 'jquery' ],
    function( $ )
    {
      var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.!~*'()?", CHARACTERS_LEN = CHARACTERS.length;

      function getNumberFromCharacters( characters )
      {
        var sum = 0, len = characters.length;
        for ( var i = 0; character = characters.charAt( i ), i < len; i++ )
        {
          var pos = CHARACTERS.indexOf( character );
          if ( pos === -1 )
          {
            throw "Can't parse this character: " + character;
          }
          if ( len - i === 1 )
          {
            sum += pos;
          }
          else
          {
            sum += ( len - i - 1 ) * CHARACTERS_LEN * pos;
          }
        }
        return sum;
      }

      function getCharactersFromNumber( number, charNo )
      {
        var characters = '';
        var num = number;
        for ( var i = 0; i < charNo; i++ )
        {
          var reminder = num % CHARACTERS_LEN;
          characters = CHARACTERS.charAt( reminder ) + characters;
          num = ( num - reminder ) / CHARACTERS_LEN;
        }
        if ( num != 0 )
        {
          throw "Couldn't encode " + number + " using only " + charNo + " characters.";
        }
        return characters;
      }

      function bindButton( selector, func )
      {
        return $( selector ).click( function()
        {
          func();
        } );
      }

      function readStringArray( input )
      {
        var data = input.data, currentPos = input.currentPos;
        var transformer = false;
        if ( typeof input.transformer === 'function' )
        {
          transformer = input.transformer;
        }
        var numberOfItems;
        if ( typeof input.size !== 'undefined' )
        {
          numberOfItems = input.size;
        }
        else if ( typeof input.countSize !== 'undefined' )
        {
          numberOfItems = getNumberFromCharacters( data.substr( currentPos++, input.countSize ) );
        }
        else
        {
          throw "Can't load string array size due to missing configuration.";
        }
        var array = [];
        for ( var i = 0; i < numberOfItems; i++ )
        {
          var length = getNumberFromCharacters( data.charAt( currentPos++ ) );
          if ( length > 0 )
          {
            var string = data.substr( currentPos, length );
            if ( transformer )
            {
              string = transformer( string );
            }
            array.push( string );
            currentPos += length;
          }
          else
          {
            array.push( '' );
          }
        }
        return {
          'array' : array,
          'position' : currentPos
        };
      }

      var ESCAPE_CHARACTER = '~', ESCAPES = {};
      ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;
      ESCAPES['♭'] = 'b';
      ESCAPES['♯'] = 's';
      ESCAPES['_'] = '-';

      function encode( stringToEncode )
      {
        var string = stringToEncode;
        $.each( ESCAPES, function( index, value )
        {
          string = string.split( index ).join( ESCAPE_CHARACTER + value );
        } );
        return string;
      }

      function decode( stringToDecode )
      {
        var string = stringToDecode;
        $.each( ESCAPES, function( index, value )
        {
          string = string.split( ESCAPE_CHARACTER + value ).join( index );
        } );
        return string;
      }

      return {
        'getNumber' : getNumberFromCharacters,
        'getCharacters' : getCharactersFromNumber,
        'bindButton' : bindButton,
        'readStringArray' : readStringArray,
        'encode' : encode,
        'decode' : decode
      };
    } );
