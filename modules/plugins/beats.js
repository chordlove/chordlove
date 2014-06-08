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
 * Render and serialize chords together with beats per chord and time signature. <i>The core</i> of the whole
 * application.
 * <p>
 * There's three classes at play here, the core Chords class, the separate Beats class to manage beat counts and the
 * CopyPaste class to handle copy/paste actions.
 *
 * @module plugins/beats
 * @requires jquery
 * @requires functions
 * @requires share
 */

function Beats($, functions, share) {
  'use strict';
  var MAX_BULLETS = 16;
  var $PARENT = $('#items');
  var $TIME_SIGNATURE = null;
  var $BEATS_WRAPPER = $('<div class="btn-group duration">');
  var $BEATS_LINK = $('<a class="btn dropdown-toggle" data-toggle="dropdown" href="#"/>');
  var $BEATS_LIST = $('<ul class="dropdown-menu"/>');
  var BULLET_STRING = '••••••••••••••••';
  var BULLETS = [];
  for (var len = 0; len <= MAX_BULLETS; len++) {
    BULLETS.push(BULLET_STRING.substr(0, len));
  }
  var currentTimeSignature = null;
  var previousTimeSignature = null;
  var $timeSignatureForm = null;

  createTimeSignatureDialog();

  function timeSignatureChanged() {
    if ($PARENT.children('dd.item').length > 0) {
      showDialog();
    }
    else {
      previousTimeSignature = getTimeSignatureAsInt();
    }
  }

  /**
   * Get the current time signature.
   *
   * @method
   * @name module:plugins/beats.getTimeSignature
   * @returns {string} The current time signature.
   */
  function getTimeSignature() {
    if ($TIME_SIGNATURE !== null) {
      currentTimeSignature = $TIME_SIGNATURE.val();
    }
    return currentTimeSignature;
  }

  /**
   * Get the current time signature as integer.
   *
   * @method
   * @name module:plugins/beats.getTimeSignatureAsInt
   * @returns {integer} The current time signature.
   */
  function getTimeSignatureAsInt() {
    return parseInt(getTimeSignature());
  }

  /**
   * Set the current time signature.
   *
   * @method
   * @name module:plugins/beats.setTimeSignature
   * @param {integer}
   *          val The current time signature to set.
   */
  function setTimeSignature(val) {
    currentTimeSignature = '' + val;
    previousTimeSignature = val;
    createTimeSignatureDialog(function () {
      $TIME_SIGNATURE.val(currentTimeSignature);
    });
  }

  function showDialog() {
    var canTransform = canBeatsBeTransformed();
    openTimeSignatureDialog(canTransform);
  }

  function createTimeSignatureDialog(execute) {
    return functions.dialog(execute, 'time-signature-form', 'time-signature', function (form) {
      $timeSignatureForm = $(form);
      initializeTimeSignatureDialog();
      $TIME_SIGNATURE = $('#time-signature');
      $TIME_SIGNATURE.change(function () {
        timeSignatureChanged();
      });
    });
  }

  function initializeTimeSignatureDialog() {
    $('#time-signature-ok').click(function () {
      $timeSignatureForm.data('saved', true);
      var transform = $('#time-signature-actions-transform').prop('checked');
      var current = getTimeSignatureAsInt();
      var multiplier = current / previousTimeSignature;
      $TIME_SIGNATURE.data('previous', current);
      $PARENT.children('dd.item').each(function (index) {
        var beats = getBeats(this).length;
        if (transform) {
          beats *= multiplier;
        }
        $('div.duration', this).remove();
        createBeats(beats, this);
      });
      share.changedStructure('toolbar/timesignature');
    });
    $timeSignatureForm.on('hidden.bs.modal', function () {
      if (!$timeSignatureForm.data('saved')) {
        setTimeSignature(previousTimeSignature);
      }
    }).on('shown.bs.modal', function () {
      previousTimeSignature = getTimeSignatureAsInt();
    });
  }

  function openTimeSignatureDialog(canTransform) {
    $('#time-signature-actions-default').prop('checked', true);
    var $transformInput = $('#time-signature-actions-transform');
    var $transformLabel = $('#time-signature-actions-transform-label');
    var $transformAlert = $('#time-signature-alert');
    var $transformAlertYes = $('#time-signature-alert-yes');
    var $transformAlertNo = $('#time-signature-alert-no');
    if (canTransform) {
      $transformInput.removeAttr('disabled');
      $transformLabel.removeClass('disabled');
      $transformAlert.removeClass('alert-info');
      $transformAlert.addClass('alert-success');
      $transformAlertYes.show();
      $transformAlertNo.hide();
    }
    else {
      $transformInput.attr('disabled', 'disabled');
      $transformLabel.addClass('disabled');
      $transformAlert.removeClass('alert-success');
      $transformAlert.addClass('alert-info');
      $transformAlertNo.show();
      $transformAlertYes.hide();
    }
    $timeSignatureForm.modal().data('saved', false);
  }

  function canBeatsBeTransformed() {
    var current = getTimeSignatureAsInt();
    var multiplier = current / previousTimeSignature;
    var canTransform = true;
    $PARENT.children('dd.item').each(function (index) {
      var beats = getBeats(this).length;
      var result = beats * multiplier;
      var isInt = result % 1 === 0;
      if (!isInt) {
        canTransform = false;
        return false;
      }
    });
    return canTransform;
  }

  function getBeats(li) {
    return $('div.duration > a', li).text();
  }

  function createBeats(beats, wrapper) {
    var defaultBeats = getTimeSignatureAsInt();
    var num = defaultBeats;
    if (beats !== undefined) {
      num = beats;
    }
    var $beatsWrapper = $BEATS_WRAPPER.clone();
    var $currentBeats = $BEATS_LINK.clone().attr('title', 'Beats for this chord. (' + num + ')');
    $currentBeats.appendTo($beatsWrapper);
    $currentBeats.text(BULLETS[num]);
    $currentBeats.dropdown();

    var list = $BEATS_LIST.clone();
    list.appendTo($beatsWrapper);

    for (var len = defaultBeats; len > 0; len--) {
      var beatString = BULLETS[len];
      var $option = $('<li><a href="#" title="' + len + '">' + beatString + '</a></li>');
      $option.appendTo(list);
      $option.click({
        'beatString': beatString
      }, function (event) {
        $currentBeats.dropdown('toggle');
        if ($currentBeats.text() !== event.data.beatString) {
          $currentBeats.text(event.data.beatString);
          $currentBeats.blur();
          share.changedStructure('beats/create-beats');
        }
        return false;
      });
    }

    $beatsWrapper.appendTo(wrapper);
  }

  return {
    'createBeats': createBeats,
    'getBeats': getBeats,
    'showDialog': showDialog,
    'getTimeSignature': getTimeSignature,
    'getTimeSignatureAsInt': getTimeSignatureAsInt,
    'setTimeSignature': setTimeSignature
  };
}

define('plugins/beats', [ 'plugins', 'jquery', 'functions', 'share' ], function (plugins, $, functions, share) {
  'use strict';
  var instance = new Beats($, functions, share);
  plugins.register({
    'name': 'beats',
    'instance': instance,
    'render': false,
    'serialize': false
  });
  return instance;
});
