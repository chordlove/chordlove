define(
    "functions",
    [ "jquery" ],
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
          throw "Couldn't encode " + number + " using only " + charNo + " characters .";
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

      return {
        "getNumber" : getNumberFromCharacters,
        "getCharacters" : getCharactersFromNumber,
        "bindButton" : bindButton
      };
    } );
