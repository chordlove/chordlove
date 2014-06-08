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
 * Transpose the song.
 *
 * @module plugins/transpose
 * @requires jquery
 * @requires functions
 * @requires share
 */

function Transpose($, functions, chorddata, share) {
  'use strict';
  if (Transpose.prototype._instance) {
    return Transpose.prototype._instance;
  }
  Transpose.prototype._instance = this;

  var $PARENT = $('#items');
  var $form = undefined;
  var $transposeShift = undefined;

  // var PLUGIN_ID = '0b', DEFAULT_FORMAT = 0;

  /**
   * @method
   * @name module:plugins/transpose.setData
   */
  function setData(inputFormat, inputData) {
    // just act as a plugin
  }

  function init() {
    functions.dialog(showForm, 'transpose-form', 'transpose', function (form) {
      $form = $(form);
      $transposeShift = $('#transpose-shift');
      $('#transpose-ok').click(function () {
        var shift = parseInt($transposeShift.val());
        if (shift === 0) {
          return;
        }
        var $chords = $PARENT.children('dd.item').children('div.chord').children('input.chord-text');
        if ($chords.length === 0) {
          return;
        }
        var chords = [];
        $chords.each(function (ix, input) {
          var $input = $(input);
          var currentChord = $input.val();
          chords.push(currentChord);
        });
        var transposed = chorddata.getTransposed(chords, shift);
        $chords.each(function (ix, input) {
          $(input).val(transposed[ix]);
        });
        share.changedText('transpose');
      });
    });
  }

  function showForm() {
    $form.modal('show').on('shown.bs.modal', function () {
      $transposeShift.focus();
    });
  }

  return {
    'setData': setData,
    'init': init
  };
}

define('plugins/transpose', [ 'plugins', 'jquery', 'functions', 'chorddata', 'share' ], function (plugins, $, functions, chorddata, share) {
  'use strict';
  var instance = new Transpose($, functions, chorddata, share);
  plugins.register({
    'name': 'transpose',
    'instance': instance,
    'render': false,
    'serialize': false
  });
});
