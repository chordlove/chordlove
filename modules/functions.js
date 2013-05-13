define(
    'functions',
    [ 'jquery' ],
    function( $ )
    {
      'use strict';
      var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.!~*'()?", CHARACTERS_LEN = CHARACTERS.length;

      function getNumberFromCharacters( characters )
      {
        var sum = 0, len = characters.length;
        for ( var i = 0, character; character = characters.charAt( i ), i < len; i++ )
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

      function getValueWithDefault( value, standard )
      {
        if ( value !== undefined )
        {
          return value;
        }
        else
        {
          return standard;
        }
      }

      function writeStringArray( data )
      {
        if ( !data.items.length )
        {
          return '';
        }
        var items = data.items;
        var itemLengthSize = getValueWithDefault( data.itemLengthSize, 1 );
        var countSize = getValueWithDefault( data.countSize, 1 );
        var result = '';
        if ( countSize > 0 )
        {
          result += getCharactersFromNumber( items.length, countSize );
        }
        if ( items.length )
        {
          for ( var i = 0; i < items.length; i++ )
          {
            var item = items[i];
            if ( item === undefined )
            {
              result += getCharactersFromNumber( 0 );
            }
            else
            {
              result += getCharactersFromNumber( item.length, itemLengthSize );
              result += encode( item );
            }
          }
        }
        return result;
      }

      function readStringArray( input )
      {
        var data = input.data;
        var currentPos = getValueWithDefault( input.currentPos, 0 );
        var transformer = getValueWithDefault( input.transformer, false );
        var numberOfItems;
        if ( 'size' in input )
        {
          numberOfItems = input.size;
        }
        else if ( 'countSize' in input )
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
          if ( length )
          {
            var string = decode( data.substr( currentPos, length ) );
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

      function handleInputKeyEvent( event )
      {
        var target = $( event.target );
        if ( event.which === 13 || event.which === 9 )
        {
          event.preventDefault();
          target.blur();
          // TODO handle tab + shift
          if ( event.which === 9 )
          {
            var siblings = target.nextAll( 'input' );
            if ( siblings.length )
            {
              siblings.first().focus();
            }
            else
            {
              var wrapper = target.parents( 'li.item' ).first();
              var next = wrapper.nextAll( 'li.item' );
              if ( next.length )
              {
                var input = next.first().find( 'input' );
                if ( input.length )
                {
                  input.first().focus();
                }
              }
            }
          }
        }
      }

      return {
        'getNumber' : getNumberFromCharacters,
        'getCharacters' : getCharactersFromNumber,
        'bindButton' : bindButton,
        'writeStringArray' : writeStringArray,
        'readStringArray' : readStringArray,
        'encode' : encode,
        'decode' : decode,
        'handleInputKeyEvent' : handleInputKeyEvent
      };
    } );
