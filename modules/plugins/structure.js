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
 * Manages the song structure.
 *
 * @module plugins/structure
 * @requires jquery
 * @requires share
 * @requires functions
 * @requires plugins/beats
 */

function Structure($, share, functions, beatsHandler) {
  'use strict';
  if (Structure.prototype._instance) {
    return Structure.prototype._instance;
  }
  Structure.prototype._instance = this;

  var PLUGIN_ID = '03';
  var DEFAULT_FORMAT = '0';

  var format = DEFAULT_FORMAT;
  var data = null;

  var $PARENT = $('#items');
  var MENU_START_OF_LINE = '<i class="fa fa-fw fa-arrow-left"></i> Put on new line';

  var START_OF_LINE = 'start-of-line'; // duplicated in chords.js
  var INDIVIDUAL_BAR_BREAK = 'inidividual-bar-break';
  var CHORD_INDEX = 'chord-item-index';

  var MENU_LABEL = '<i class="fa fa-fw fa-tag"></i> Label';
  var $LABEL = $('<dt><input class="label-text form-control" type="text" title="Add a label" placeholder="Label…" /></dt>');

  var $SINGLE_BARLINE = $('<dd class="symbol icon-barline"/>');

  var MENU_LEFT_SINGLE_BAR = '<i class="symbol-icon icon-barline"></i> Single bar before';
  var MENU_LEFT_DOUBLE_BAR = '<i class="symbol-icon icon-double-barline"></i> Double bar before';
  var MENU_RIGHT_SINGLE_BAR = '<i class="symbol-icon icon-barline"></i> Single bar after';
  var MENU_RIGHT_DOUBLE_BAR = '<i class="symbol-icon icon-double-barline"></i> Double bar after';
  var MENU_LEFT_REPEAT_BAR = '<i class="symbol-icon left-repeat-bar-icon"></i> Left repeat bar before';
  var MENU_RIGHT_REPEAT_BAR = '<i class="symbol-icon right-repeat-bar-icon"></i> Right repeat bar after';

  // note: never remove, just add/change here -- the serializatin depends on the order.
  var SYMBOLS = ['icon-double-barline', 'left-repeat-bar-icon', 'right-repeat-bar-icon'];

  var $form = undefined;

  var $barBreakNumberSelect = undefined;
  var barBreakNumberSelect = undefined;

  initForm();

  /**
   * @method
   * @name module:plugins/structure.setData
   */
  function setData(inputFormat, inputData) {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/structure.render
   */
  function render() {
    performRendering();
  }

  /**
   * @method
   * @name module:plugins/structure.serialize
   */
  function serialize() {
    if (!$barBreakNumberSelect) {
      return '';
    }
    var structure = getStructure();
    var result = PLUGIN_ID + DEFAULT_FORMAT + structure;
    if (result.length < 4 || structure === '0') {
      result = '';
    }
    return result;
  }

  function getStructure() {
    var currentBreakBarNumber = $barBreakNumberSelect.val();
    var barBreakNUmber = currentBreakBarNumber ? functions.getCharacters(currentBreakBarNumber, 1) : '0';
    var startOfLineItems = '';
    var labelData = '';
    var labelCount = 0;
    $PARENT.children('dd.item').each(function (ix, dd) {
      var $dd = $(dd);
      $dd.data(CHORD_INDEX, ix);
      if ($dd.data(INDIVIDUAL_BAR_BREAK)) {
        var item = functions.getCharacters(ix, 2);
        startOfLineItems += item;
      }
      var $dt = $dd.prev('dt');
      if ($dt.length > 0) {
        var $labelInput = $dt.children('input.label-text');
        if ($labelInput.length > 0) {
          var labelText = functions.encode($($labelInput[0]).val());
          labelData += functions.getCharacters(labelText.length + 2, 1);
          labelData += functions.getCharacters(ix, 2);
          labelData += labelText;
          labelCount++;
        }
      }
    });
    var startOfLineData = functions.getCharacters(startOfLineItems.length / 2, 1) + startOfLineItems;
    labelData = functions.getCharacters(labelCount, 1) + labelData;

    var firstSymbol = '0';
    var symbols = '';
    $PARENT.children('dd.symbol').each(function (ix, dd) {
      var $dd = $(dd);
      var symbol = getSymbol($dd);
      if (symbol === 0) {
        return true;
      }
      var symbolChar = functions.getCharacters(symbol, 1);
      if (ix === 0) {
        firstSymbol = symbolChar;
      } else {
        var $prev = $dd.prev('dd.item');
        var index = $prev.data(CHORD_INDEX);
        symbols += symbolChar + functions.getCharacters(index, 2);
      }
    });
    var symbolData = firstSymbol + functions.getCharacters(symbols.length / 3, 1) + symbols;

    return barBreakNUmber + startOfLineData + labelData + symbolData;
  }

  function getSymbol($dd) {
    for (var i = 0; i < SYMBOLS.length; i++) {
      if ($dd.hasClass(SYMBOLS[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  function parseInput(input) {
    barBreakNumberSelect.value = functions.getNumber(input.charAt(0));

    var startOfLineItems = functions.readChunkArray({
      'data': input,
      'currentPos': 1,
      'chunkSize': 2,
      'countSize': 1
    });
    var labels = {'array': []};
    var symbolData = {'first': 0, 'symbols': []};
    var currentPos = 2 + 2 * startOfLineItems.length;
    if (input.length > currentPos + 4) {
      labels = functions.readStringArray({
        'data': input,
        'currentPos': currentPos,
        'countSize': 1,
        'transformer': function (string) {
          if (string.length < 3) {
            throw new functions.EncodingError('Can not decode label data: "' + string + '".');
          }
          var position = functions.getNumber(string.substr(0, 2));
          var text = string.substring(2);
          return {'position': position, 'text': text};
        }});
      currentPos = labels.position;
      if (input.length > currentPos + 3) {
        var firstSymbol = functions.getNumber(input.charAt(currentPos));
        currentPos++;
        var symbolChunks = functions.readChunkArray({
          'data': input,
          'currentPos': currentPos,
          'chunkSize': 3,
          'countSize': 1
        });
        var symbols = [];
        for (var i = 0; i < symbolChunks.length; i++) {
          var chunk = symbolChunks[i];
          var symbol = functions.getNumber(chunk.charAt(0));
          var index = functions.getNumber(chunk.substr(1,2));
          symbols.push({'symbol': symbol, 'index': index});
        }
        symbolData = {'first': firstSymbol, 'symbols': symbols};
      }
    }
    return {'startOfLineItems': startOfLineItems, 'labels': labels.array, 'symbols': symbolData};
  }

  function labelMenu($wrapper, $li, $a) {
    $a.html(MENU_LABEL).click({
      'dd': $wrapper.get(0)
    }, function (event) {
      event.preventDefault();
      var $dd = $(event.data.dd);
      setLabel($dd);
    });
  }

  function setLabel($dd, text) {
    var $dt = $dd.prev('dt').first();
    var created = false;
    if ($dt.length === 0) {
      $dt = $LABEL.clone();
      $dt.insertBefore($dd);
      $dt.keydown(functions.handleInputKeyEvent);
      if ($dd.hasClass(START_OF_LINE)) {
        $dd.removeClass(START_OF_LINE);
        $dt.addClass(START_OF_LINE);
      }
      created = true;
    }
    var $input = $dt.children('input');
    if (text) {
      $input.val(text);
    } else {
      $input.focus();
    }
    if (created) {
      $input.change(function () {
        var val = $.trim($input.val());
        if (val.length === 0) {
          // remove the empty label
          if ($dt.hasClass(START_OF_LINE)) {
            $dt.removeClass(START_OF_LINE);
            $dd.addClass(START_OF_LINE);
          }
          $dt.remove();
          share.changedText('plugins/structure/label-remove-empty');
        } else {
          share.changedText('plugins/structure/label-added-or-updated');
        }
      });
    }
  }

  function startOfLineMenu($wrapper, $li, $a) {
    $a.html(MENU_START_OF_LINE).click({
      'li': $wrapper
    }, function (event) {
      event.preventDefault();
      var $item = event.data.li;
      if ($item.hasClass(START_OF_LINE) || $item.prev('dt.' + START_OF_LINE).length > 0) {
        setStartOfLine($item, false, true);
      }
      else {
        setStartOfLine($item, true, true);
      }
      share.changedStructure('plugins/structure/individualBreak');
    });
  }

  var leftSingleBarMenu = symbolMenu(MENU_LEFT_SINGLE_BAR, 'icon-barline', 'before');
  var leftDoubleBarMenu = symbolMenu(MENU_LEFT_DOUBLE_BAR, 'icon-double-barline', 'before');
  var rightSingleBarMenu = symbolMenu(MENU_RIGHT_SINGLE_BAR, 'icon-barline', 'after');
  var rightDoubleBarMenu = symbolMenu(MENU_RIGHT_DOUBLE_BAR, 'icon-double-barline', 'after');
  var leftRepeatBracketMenu = symbolMenu(MENU_LEFT_REPEAT_BAR, 'left-repeat-bar-icon', 'before');
  var rightRepeatBracketMenu = symbolMenu(MENU_RIGHT_REPEAT_BAR, 'right-repeat-bar-icon', 'after');

  function symbolMenu(menu, iconToKeep, beforeOrAfter) {
    return function ($wrapper, $li, $a) {
      $a.html(menu).click({
        'li': $wrapper
      }, function (event) {
        event.preventDefault();
        var $item = event.data.li;
        var $symbol = undefined;
        if (beforeOrAfter === 'before') {
          $symbol = $item.prev('dd.symbol');
        } else if (beforeOrAfter === 'after') {
          $symbol = $item.next('dd.symbol');
        } else {
          // TODO generate error message
        }
        for (var i = 0; i < SYMBOLS.length; i++) {
          var icon = SYMBOLS[i];
          if (icon === iconToKeep) {
            $symbol.addClass(iconToKeep);
          } else {
            $symbol.removeClass(icon);
          }
        }
        share.changedStructure('plugins/structure/symbols');
      });
    };
  }

  function setBarBreaks() {
    $form.modal('show');
  }

  function getBeats(li) {
    return $('div.duration > a', li).text();
  }

  function performOnForm(func) {
    functions.dialog(func, 'structure-barbreak', 'structure', function (form) {
      $barBreakNumberSelect = $('#structure-barbreak');
      barBreakNumberSelect = $barBreakNumberSelect[0];
      $form = $(form).on('shown.bs.modal', function () {
        $barBreakNumberSelect.focus();
      });
      $('#structure-barbreak-ok').click(function () {
        performRendering();
        share.changedStructure('plugins/structure/breakbars');
      });
    });
  }

  function initForm() {
    performOnForm(null);
  }

  function setStartOfLine($item, isStartOfLine, isSetData) {
    var $prev = $item.prev('dt');
    var $elementForStart = $prev.length > 0 ? $prev : $item;
    if (isStartOfLine) {
      $elementForStart.addClass(START_OF_LINE);
    }
    else {
      $elementForStart.removeClass(START_OF_LINE);
    }
    if (isSetData === true) {
      $item.data(INDIVIDUAL_BAR_BREAK, isStartOfLine);
    }
  }

  function performRendering() {
    performOnForm(function () {
        var startOfLineItems = undefined;
        var labels = undefined;
        var symbols = undefined;
        if (data) {
          var parsedData = parseInput(data);
          startOfLineItems = parsedData.startOfLineItems;
          labels = parsedData.labels;
          symbols = parsedData.symbols;
          data = null;
        }
        var items = $PARENT.children('dd.item').toArray();
        if (items.length === 0) {
          return;
        }
        var currentBreakBarNumber = $barBreakNumberSelect.val();
        if (currentBreakBarNumber) {
          var timeSignature = beatsHandler.getTimeSignatureAsInt();
          var beatsToBreakAfter = currentBreakBarNumber * timeSignature;
          var beatsSum = 0;
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var $item = $(item);
            if (beatsSum !== 0 && ( beatsSum % beatsToBreakAfter === 0 ) || $item.data(INDIVIDUAL_BAR_BREAK)) {
              setStartOfLine($item, true);
            }
            else {
              setStartOfLine($item, false);
            }
            beatsSum += getBeats(item).length;
          }
        }
        if (startOfLineItems) {
          $.each(startOfLineItems, function () {
            var position = functions.getNumber(this);
            var $item = $(items[position]);
            setStartOfLine($item, true, true);
          });
        }
        if (labels) {
          $.each(labels, function () {
            var position = this.position;
            var text = this.text;
            var $item = $(items[position]);
            setLabel($item, text);
          });
        }
        if (symbols) {
          var first = symbols.first;
          var symbolData = symbols.symbols;
          if (first > 0) {
            $(items[0]).prev('dd.symbol').addClass(SYMBOLS[first - 1]);
          }
          for (var ix = 0; ix < symbolData.length; ix++) {
            var symbol = symbolData[ix];
            $(items[symbol.index]).next('dd.symbol').addClass(SYMBOLS[symbol.symbol - 1]);
          }
        }
      }
    );
  }

  function structureChanged(event) {
    if (event && typeof event === 'string'
      && ( event === 'plugins/structure/breakbars' || event === 'plugins/structure/individualBreak' || event === 'plugins/structure/symbols')) {
      return;
    }
    //console.log('structure event: ', event);
    performRendering();
    updateBarlines();
  }

  function updateBarlines() {
    var timeSignature = beatsHandler.getTimeSignatureAsInt();
    var beatsSum = 0;
    $PARENT.children('dd.item').each(function (index) {
      beatsSum += beatsHandler.getBeats(this).length;
      var $item = $(this);
      var $symbol = $item.next('dd.symbol');
      if (beatsSum % timeSignature === 0) {
        // should have barline after
        if ($symbol.length === 0) {
          $SINGLE_BARLINE.clone().insertAfter(this);
        }
      } else {
        // should not have barline after
        $symbol.remove();
      }
    });
  }


  return {
    'render': render,
    'serialize': serialize,
    'setData': setData,
    'startOfLineMenu': startOfLineMenu,
    'setBarBreaks': setBarBreaks,
    'structureChanged': structureChanged,
    'labelMenu': labelMenu,
    'leftRepeatBracketMenu': leftRepeatBracketMenu,
    'rightRepeatBracketMenu': rightRepeatBracketMenu,
    'leftSingleBarMenu': leftSingleBarMenu,
    'leftDoubleBarMenu': leftDoubleBarMenu,
    'rightSingleBarMenu': rightSingleBarMenu,
    'rightDoubleBarMenu': rightDoubleBarMenu
  };
}

define('plugins/structure', [ 'plugins', 'jquery', 'share', 'functions', 'plugins/chords', 'plugins/beats' ],
  function (plugins, $, share, functions, chords, beats) {
    'use strict';
    var instance = new Structure($, share, functions, beats);
    chords.registerChordMenuMember(instance.labelMenu);
    chords.registerChordMenuMember(instance.startOfLineMenu);
    chords.registerChordMenuMember(instance.leftSingleBarMenu);
    chords.registerChordMenuMember(instance.leftDoubleBarMenu);
    chords.registerChordMenuMember(instance.leftRepeatBracketMenu);
    chords.registerChordMenuMember(instance.rightRepeatBracketMenu);
    chords.registerChordMenuMember(instance.rightDoubleBarMenu);
    chords.registerChordMenuMember(instance.rightSingleBarMenu);
    chords.addPostRenderer(instance.render);
    share.addStructureChangeListener(instance.structureChanged);
    plugins.register({
      'name': 'structure',
      'instance': instance,
      'render': false,
      'serialize': true
    });
  });
