/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013-2014 NA Konsult AB
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Utility functions, mostly for handling strings.
 *
 * @module functions
 * @requires jquery
 */
define('functions', [ 'jquery' ], functions);

function functions($) {
  'use strict';
  var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.!~*'()?", CHARACTERS_LEN = CHARACTERS.length;
  var $DIV = $('<div/>');
  var $DIALOGS = $('#dialogs');

  /**
   * Get a number encoded as characters.
   *
   * @method
   * @name module:functions.getNumber
   * @param {string}
   *          characters The characters to decode as a number.
   */
  function getNumber(characters) {
    var sum = 0, len = characters.length;
    for (var i = 0, character; character = characters.charAt(i), i < len; i++) {
      var pos = CHARACTERS.indexOf(character);
      if (pos === -1) {
        throw "Can't parse this character: " + character;
      }
      if (len - i === 1) {
        sum += pos;
      }
      else {
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
  function getCharacters(number, charNo) {
    var characters = '';
    var num = number;
    for (var i = 0; i < charNo; i++) {
      var reminder = num % CHARACTERS_LEN;
      characters = CHARACTERS.charAt(reminder) + characters;
      num = ( num - reminder ) / CHARACTERS_LEN;
    }
    if (num != 0) {
      throw new EncodingError("Couldn't encode " + number + " using only " + charNo + " characters.");
    }
    return characters;
  }

  function EncodingError(message) {
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
  function bindButton(selector, func) {
    return $(selector).click(function () {
      func();
    });
  }

  function getValueWithDefault(value, standard) {
    if (value !== undefined) {
      return value;
    }
    else {
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
  function writeStringArray(data) {
    if (!data.items.length) {
      return '';
    }
    var items = data.items;
    var itemLengthSize = getValueWithDefault(data.itemLengthSize, 1);
    var countSize = getValueWithDefault(data.countSize, 1);
    var result = '';
    if (countSize) {
      result += getCharacters(items.length, countSize);
    }
    if (items.length) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item === undefined) {
          result += getCharacters(0);
        }
        else {
          var encodedItem = encode(item);
          result += getCharacters(encodedItem.length, itemLengthSize);
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
   *          input An object containing the mandatory <code>data</code> key. Optional keys: <code>currentPos</code>,
   *          <code>transformer</code>, <code>size</code>, <code>countSize</code>.
   * @returns {Object} An object with the keys <code>array</code> and <code>position</code>.
   */
  function readStringArray(input) {
    var array = [];
    var data = input.data;
    var currentPos = getValueWithDefault(input.currentPos, 0);
    var transformer = getValueWithDefault(input.transformer, false);
    var itemLengthSize = getValueWithDefault(input.itemLengthSize, 1);
    var numInfo = getNumberOfItems(input, currentPos);
    currentPos = numInfo.position;
    var numberOfItems = numInfo.numberOfItems;
    for (var i = 0; i < numberOfItems; i++) {
      var len = getNumber(data.substr(currentPos, itemLengthSize));
      currentPos += itemLengthSize;
      if (len) {
        var string = decode(data.substr(currentPos, len));
        if (transformer) {
          string = transformer(string);
        }
        array.push(string);
        currentPos += len;
      }
      else {
        array.push('');
      }
    }
    return {
      'array': array,
      'position': currentPos
    };
  }

  /**
   * Transforms a string into an array of equal sized chunks.
   *
   * @method
   * @name module:functions.readChunkArray
   * @param {Object}
   *          input An object with the mandatory keys <code>data<code> and <code>chunkSize</code>.
   *          Optional keys: <code>currentPos</code>, <code>size</code>, <code>countSize</code>.
   * @returns {Array} An array of string chunks.
   */
  function readChunkArray(input) {
    var chunks = [];
    var data = input.data;
    var chunkSize = input.chunkSize;
    var currentPos = getValueWithDefault(input.currentPos, 0);
    var numInfo = getNumberOfItems(input, currentPos);
    var numberOfItems = numInfo.numberOfItems;
    currentPos = numInfo.position;
    for (var i = 0; i < numberOfItems; i++) {
      var chunk = data.substr(currentPos, chunkSize);
      chunks.push(chunk);
      currentPos += chunkSize;
    }
    return chunks;
  }

  function getNumberOfItems(input, currentPos) {
    var pos = currentPos;
    var numberOfItems;
    if ('size' in input) {
      numberOfItems = input.size;
    }
    else if ('countSize' in input) {
      numberOfItems = getNumber(input.data.substr(pos, input.countSize));
      pos += input.countSize;
    }
    else {
      throw "Can't load string array size due to missing configuration.";
    }
    return {
      'numberOfItems': numberOfItems,
      'position': pos
    };
  }

  var ESCAPE_CHARACTER = '~', ESCAPES = {};
  ESCAPES[ESCAPE_CHARACTER] = ESCAPE_CHARACTER;
  ESCAPES[' '] = '0';
  ESCAPES['\n'] = '1';
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
  function encode(stringToEncode) {
    var string = stringToEncode;
    $.each(ESCAPES, function (index, value) {
      string = string.split(index).join(ESCAPE_CHARACTER + value);
    });
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
  function decode(stringToDecode) {
    var string = stringToDecode;
    $.each(ESCAPES, function (index, value) {
      string = string.split(ESCAPE_CHARACTER + value).join(index);
    });
    return string;
  }

  function handleInputChangeEvent(event) {
    var $target = $(event.target);
    emptyOrNot($target, $target.val() !== '');
  }

  function emptyOrNot($input, content) {
    if (content) {
      $input.removeClass('empty-input');
    }
    else {
      $input.addClass('empty-input');
    }
  }

  /**
   * Event handler for handling key events in <code>input</code> elements. It makes sure the <kbd>TAB</kbd> key works
   * correctly.
   *
   * @method
   * @name module:functions.handleInputKeyEvent
   * @param {Object}
   *          event A jQuery event object.
   */
  function handleInputKeyEvent(event) {
    var $target = $(event.target);
    if (event.which === 13 || event.which === 9) {
      event.preventDefault();
      $target.blur();
      // $target.val( $target.val().replace( / /g, '\u2009' ) );
      if (event.which === 9) {
        var backwards = 'shiftKey' in event && event.shiftKey === true;
        var $siblings = $target[backwards ? 'prevAll' : 'nextAll']('input').filter(noHiddenElements);
        if ($siblings.length) {
          $siblings.first().focus();
          return;
        }
        else {
          var $wrapper = $target.parents('dd.item').first();
          var $next = $wrapper[backwards ? 'prevAll' : 'nextAll']('dd.item');
          if ($next.length) {
            var $input = $next.first().find('input').filter(noHiddenElements);
            if ($input.length) {
              $input[backwards ? 'last' : 'first']().focus();
              return;
            }
          }
        }
        $(backwards ? '#title' : '#edit').focus();
      }
    }
  }

  function noHiddenElements() {
    return $(this).css('visibility') !== 'hidden';
  }

  var queuedDialogs = {};

  /**
   * Helper function to add dialogs to the page. The init function will be called with the form HTMLElement as
   * parameter. Note that the init function is only called once, and only intended for initializing the form. Use
   * executeFunc to perform other actions.
   *
   * @param {Function}
   *          executeFunc A function to execute which depends on the dialog being loaded.
   * @param {String}
   *          elementId The id of an element in the dialog, so we can check if it's loaded using it.
   * @param {String}
   *          name of the dialog to load.
   * @param {Function}
   *          initFunc Function used to initialize the dialog after load.
   */
  function dialog(executeFunc, elementId, name, initFunc) {
    if (name in queuedDialogs) {
      if (executeFunc) {
        queuedDialogs[name].push(executeFunc);
      }
      return;
    }
    var $element = $('#' + elementId);
    if ($element.length === 0) {
      queuedDialogs[name] = [];
      $DIV.clone().appendTo($DIALOGS).load('modules/dialogs/' + name + '.html', function () {
        if (initFunc) {
          initFunc(this.firstChild);
        }
        if (name in queuedDialogs) {
          for (var i = 0; i < queuedDialogs[name].length; i++) {
            queuedDialogs[name][i]();
          }
          delete queuedDialogs[name];
        }
        if (executeFunc) {
          executeFunc();
        }
      });
    }
    else {
      if (executeFunc) {
        executeFunc();
      }
    }
  }

  /**
   * Print exceptions to the console.
   *
   * @param {Error}
   *          ex Error to print.
   * @param {String}
   *          [message] Optional message to print before the error.
   *
   */
  function printError(ex, message) {
    if (typeof message === 'string') {
      console.log(message);
    }
    if (typeof ex === 'string') {
      console.log(ex);
    }
    else if ('name' in ex && 'message' in ex) {
      console.log(ex.name, ex.message);
      if ('fileName' in ex && 'lineNumber' in ex) {
        console.log(ex.fileName, ex.lineNumber);
      }
    }
    else {
      console.log(ex);
    }
  }

  /**
   * Show an alert.
   *
   * @param {String}
   *          type One of 'error', 'success', 'info', 'warning'.
   * @param {String}
   *          heading Heading of the message.
   * @param {String}
   *          text Text for the message.
   * @param {String}
   *          [icon] Class name of Font Awesome icon o use.
   */
  function alert(type, heading, text, icon) {
    var typeClass = 'alert-' + type;
    var $alert = $('#alert');
    var iconText = icon === undefined ? '' : '<i class="fa ' + icon + '"></i> ';
    if (!$alert.length) {
      $alert = $('<div id="alert" class="alert fade in" data-alert="alert"/>').appendTo('body');
    }
    $alert.addClass(typeClass);
    $alert.html(iconText + '<strong>' + heading + ':</strong> ' + text);
    $alert.css('opacity', 1);
    window.setTimeout(function () {
      $alert.css('opacity', 0);
      $alert.removeClass(typeClass);
    }, 5000);
  }

  var hasLocalStore = undefined;

  /**
   * Check if browser has Local Storage accessible.
   *
   * @returns {Boolean} Is local storage working?
   */
  function hasLocalStorage() {
    if (hasLocalStore === undefined) {
      var key = '_local_storage_test_';
      try {
        window.localStorage.setItem(key, key);
        window.localStorage.removeItem(key);
        hasLocalStore = true;
      }
      catch (e) {
        hasLocalStore = false;
      }
    }
    return hasLocalStore;
  }

  /**
   * Move the caret position to the beginning.
   *
   * @param {HTMLInputElement}
   *          input Input element to change the caret position in.
   */
  function setCaretPositionToBeginning(input) {
    input.focus();
    if (typeof input.selectionStart === 'number') {
      input.selectionStart = 0;
      input.selectionEnd = 0;
    }
    else if (typeof input.createTextRange !== 'undefined') {
      var range = input.createTextRange();
      range.collapse(true);
      range.select();
    }
  }

  /**
   * Compare two strings using the current locale.
   *
   * @param {string} a The first string to compare.
   * @param {string} b The second string to compare.
   * @returns {integer} A number indicating the sorting order of the strings.
   */
  function localeComparer (a, b) {
    return a.localeCompare(b);
  }

  return {
    'getNumber': getNumber,
    'getCharacters': getCharacters,
    'bindButton': bindButton,
    'writeStringArray': writeStringArray,
    'readStringArray': readStringArray,
    'readChunkArray': readChunkArray,
    'encode': encode,
    'decode': decode,
    'handleInputChangeEvent': handleInputChangeEvent,
    'handleInputKeyEvent': handleInputKeyEvent,
    'emptyOrNot': emptyOrNot,
    'dialog': dialog,
    'printError': printError,
    'alert': alert,
    'hasLocalStorage': hasLocalStorage,
    'setCaretPositionToBeginning': setCaretPositionToBeginning,
    'localeComparer': localeComparer
  };
}
