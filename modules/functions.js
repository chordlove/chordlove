/**
 * Utility functions, mostly for handling strings.
 * 
 * @module functions
 * @requires jquery
 */
define(
    'functions',
    [ 'jquery' ],
    function( $ )
    {
      'use strict';
      var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.!~*'()?", CHARACTERS_LEN = CHARACTERS.length;

      /**
       * Get a number encoded as characters.
       * 
       * @method
       * @name module:functions.getNumber
       * @param {string}
       *          characters The characters to decode as a number.
       */
      function getNumber( characters )
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

      /**
       * Encode a number as characters.
       * 
       * @method
       * @name module:functions.getCharacters
       * @param {integer}
       *          number The number to encode.
       * @param {integer}
       *          charNo The number of characters to use.
       * @throws {EncodingError}
       *           Typically if the number of characters is too small.
       */
      function getCharacters( number, charNo )
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
          throw new EncodingError( "Couldn't encode " + number + " using only " + charNo + " characters." );
        }
        return characters;
      }

      function EncodingError( message )
      {
        this.message = message;
      }

      EncodingError.prototype = new Error;

      /**
       * Bind an elements click event to a function.
       * 
       * @method
       * @name module:functions.bindButton
       * @param {string}
       *          selector JQuery selector for the element to bind.
       * @param {Function}
       *          func The function to use as event handler.
       * @returns {jQuery} The jQuery object for the selector.
       */
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

      /**
       * Transforms an array of strings to a single string suitable for inclusion in URLs.
       * 
       * @method
       * @name module:functions.writeStringArray
       * @param {Object}
       *          data An object containing the mandatory <code>items</code> key. Optional keys:
       *          <code>itemLengthSize</code>, <code>countSize</code>.
       */
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
        if ( countSize )
        {
          result += getCharacters( items.length, countSize );
        }
        if ( items.length )
        {
          for ( var i = 0; i < items.length; i++ )
          {
            var item = items[i];
            if ( item === undefined )
            {
              result += getCharacters( 0 );
            }
            else
            {
              var encodedItem = encode( item );
              result += getCharacters( encodedItem.length, itemLengthSize );
              result += encodedItem;
            }
          }
        }
        return result;
      }

      /**
       * Transforms a string representation of an array into an array of strings.
       * 
       * @method
       * @name functions.readStringArray
       * @param {Object}
       *          input An object containing the mandatory <code>data</code> key. Optional keys:
       *          <code>currentPos</code>, <code>transformer</code>, <code>size</code>, <code>countSize</code>.
       * @returns {Object} An object with the keys <code>array</code> and <code>position</code>.
       */
      function readStringArray( input )
      {
        var array = [];
        var data = input.data;
        var currentPos = getValueWithDefault( input.currentPos, 0 );
        var transformer = getValueWithDefault( input.transformer, false );
        var numInfo = getNumberOfItems( input, currentPos );
        currentPos = numInfo.position;
        var numberOfItems = numInfo.numberOfItems;
        for ( var i = 0; i < numberOfItems; i++ )
        {
          var len = getNumber( data.charAt( currentPos++ ) );
          if ( len )
          {
            var string = decode( data.substr( currentPos, len ) );
            if ( transformer )
            {
              string = transformer( string );
            }
            array.push( string );
            currentPos += len;
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

      /**
       * Transforms a string into an array of equal sized chunks.
       * 
       * @method
       * @name module:functions.readChunkArray
       * @param {Object}
       *          input An object with the mandatory key <code>data<code>.
       *          Optional keys: <code>currentPos</code>, <code>size</code>, <code>countSize</code>.
       * @returns {Array} An array of string chunks.
       */
      function readChunkArray( input )
      {
        var chunks = [];
        var data = input.data;
        var chunkSize = input.chunkSize;
        var currentPos = getValueWithDefault( input.currentPos, 0 );
        var numInfo = getNumberOfItems( input, currentPos );
        var numberOfItems = numInfo.numberOfItems;
        currentPos = numInfo.position;
        for ( var i = 0; i < numberOfItems; i++ )
        {
          var chunk = data.substr( currentPos, chunkSize );
          chunks.push( chunk );
          currentPos += chunkSize;
        }
        return chunks;
      }

      function getNumberOfItems( input, currentPos )
      {
        var pos = currentPos;
        var numberOfItems;
        if ( 'size' in input )
        {
          numberOfItems = input.size;
        }
        else if ( 'countSize' in input )
        {
          numberOfItems = getNumber( input.data.substr( pos, input.countSize ) );
          pos += input.countSize;
        }
        else
        {
          throw "Can't load string array size due to missing configuration.";
        }
        return {
          'numberOfItems' : numberOfItems,
          'position' : pos
        };
      }

      var ESCAPE_CHARACTER = '~', ESCAPES = {};
      ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;
      ESCAPES['♭'] = 'b';
      ESCAPES['♯'] = 's';
      ESCAPES['_'] = '-';

      /**
       * Encodes a string altering some characters with special meaning to Chordlove.
       * 
       * @method
       * @name module:functions.encode
       * @param {string}
       *          stringToEncode
       * @returns {string} The encoded string.
       */
      function encode( stringToEncode )
      {
        var string = stringToEncode;
        $.each( ESCAPES, function( index, value )
        {
          string = string.split( index ).join( ESCAPE_CHARACTER + value );
        } );
        return string;
      }

      /**
       * Decodes a string from a Chordlove URL.
       * 
       * @method
       * @name module:functions.decode
       * @param {string}
       *          stringToDecode
       * @returns {string} The decoded string.
       */
      function decode( stringToDecode )
      {
        var string = stringToDecode;
        $.each( ESCAPES, function( index, value )
        {
          string = string.split( ESCAPE_CHARACTER + value ).join( index );
        } );
        return string;
      }

      /**
       * Event handler for handling key events in <code>input</code> elements. It makes sure the <kbd>TAB</kbd> key
       * works correctly.
       * 
       * @method
       * @name module:functions.handleInputKeyEvent
       * @param {Object}
       *          event A jQuery event object.
       */
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
        'getNumber' : getNumber,
        'getCharacters' : getCharacters,
        'bindButton' : bindButton,
        'writeStringArray' : writeStringArray,
        'readStringArray' : readStringArray,
        'readChunkArray' : readChunkArray,
        'encode' : encode,
        'decode' : decode,
        'handleInputKeyEvent' : handleInputKeyEvent
      };
    } );
