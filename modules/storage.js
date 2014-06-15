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
 * Store hashes in local storage.
 *
 * @module storage
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires plugins
 */

function Storage($, functions, share, plugins) {
  'use strict';
  if (Storage.prototype._instance) {
    return Storage.prototype._instance;
  }
  Storage.prototype._instance = this;

  if (!functions.hasLocalStorage()) {
    return;
  }

  var $OPTION = $('<option/>');
  $('#archive-menu').removeClass('NIY');

  init();

  function initSaveForm(form) {
    var $form = $(form);
    var $save = $('#save');
    var $saveOk = $('#storage-save-ok');
    var $status = $('#storage-save-status');
    var $help = $('#storage-save-help');
    var $saveName = $('#storage-save-name');
    var saveName = $saveName[0];

    $saveName.keyup(function () {
      setSaveNameStatus();
    }).keypress(function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        $saveOk.click();
      }
    });

    function setSaveNameStatus() {
      var value = $.trim($saveName.val());
      $status.removeClass('has-error has-warning');
      if (value.length === 0) {
        $status.addClass('has-error');
        $help.text("The name can't be empty!");
        $saveOk.prop('disabled', true);
      }
      else if (value in window.localStorage) {
        $status.addClass('has-warning');
        $help.text("The existing song will be overwritten.");
        $saveOk.prop('disabled', false);
      }
      else {
        $help.text('');
        $saveOk.prop('disabled', false);
      }
    }

    $save.click(function () {
      $saveName.val($('#title').val());
      $saveName.data('hash', window.location.hash);
      setSaveNameStatus();
      $form.modal();
      $('#archive-menu').addClass('always-visible');
    });

    $form.on('shown.bs.modal', function () {
      functions.setCaretPositionToBeginning(saveName);
    });

    $saveOk.click(function () {
      if ($status.hasClass('has-error')) {
        return false;
      }
      window.localStorage[$.trim($saveName.val())] = $saveName.data('hash');
      functions.alert('success', 'Save', '"' + $saveName.val() + '" has been saved.', 'fa fa-save');
    });
  }

  function initOpenForm(form) {
    var $openSelect = $('#storage-open-select');
    var openSelect = $openSelect[0];
    var $okButton = $('#storage-open-ok');
    var $openForm = $(form);

    $('#open').click(function () {
      populateSelect($openSelect);

      $openForm.modal().on('shown.bs.modal', function () {
        $openSelect.focus();
        $openSelect.children('option:first').attr('selected', 'selected');
        updateButtons();
      });

      $okButton.click(function () {
        if (openSelect.selectedIndex === -1) {
          return;
        }
        share.changed(true); // this stores the current location in history
        var selectedKey = $openSelect.val();
        var hash = window.localStorage[selectedKey];
        share.clear();
        functions.alert('success', 'Open', '"' + selectedKey + '" has been opened.', 'fa-folder-open-o');
        window.location.hash = hash;
      });

      $openSelect.change(updateButtons).keypress(function (event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          $okButton.click();
        }
      }).dblclick(function (event) {
        event.stopImmediatePropagation();
        $okButton.click();
      });

      function updateButtons() {
        var somethingIsSelected = openSelect.selectedIndex !== -1;
        $okButton.prop('disabled', !somethingIsSelected);
      }
    });
  }

  function populateSelect($select) {
    var items = [];
    for (var key in window.localStorage) {
      if (key.indexOf('lscache-INJECT') !== 0) {
        items.push(key);
      }
    }
    items.sort();
    $select.empty();
    for (var i = 0; i < items.length; i++) {
      $select.append($OPTION.clone().text(items[i]));
    }
  }

  function initDeleteForm(form) {
    var $deleteGroup = $('#storage-delete-group');
    var $deleteConfirm = $('#storage-delete-confirm');
    var deleteConfirm = $deleteConfirm[0];
    var $deleteButton = $('#storage-delete');
    var $deleteSelect = $('#storage-delete-select');
    var deleteSelect = $deleteSelect[0];
    var $deleteForm = $(form);

    $('#delete-song').click(function () {
      populateSelect($deleteSelect);

      $deleteForm.modal().on('shown.bs.modal', function () {
        $deleteSelect.focus();
        $deleteSelect.children('option:first').attr('selected', 'selected');
        updateButtons();
      }).on('hidden.bs.modal', function () {
        deleteConfirm.checked = false;
        $deleteButton.prop('disabled', true);
      });

      $deleteButton.click(function (event) {
        event.preventDefault();
        var selectedKey = $deleteSelect.val();
        delete window.localStorage[selectedKey];
        var selected = deleteSelect.selectedIndex;
        if (selected !== -1) {
          deleteSelect.remove(selected);
          functions.alert('success', 'Delete', '"' + selectedKey + '" has been deleted.', 'fa-times-circle');
          if (deleteSelect.length === 0) {
            $deleteForm.modal('hide');
          }
        }
        updateButtons();
      });

      $deleteConfirm.change(updateButtons);

      $deleteSelect.change(updateButtons).keypress(function (event) {
        if (event.keyCode === 46 || event.keyCode === 127) {
          event.preventDefault();
          $deleteButton.click();
        }
      });

      function updateButtons() {
        var somethingIsSelected = deleteSelect.selectedIndex !== -1;
        var doNotDelete = !deleteConfirm.checked;
        $deleteButton.prop('disabled', doNotDelete || !somethingIsSelected);
        $deleteGroup.toggleClass('has-error', doNotDelete);
      }
    });
  }

  function init(func) {
    functions.dialog(func, 'storage-save-form', 'save', function (form) {
      initSaveForm(form);
    });
    functions.dialog(func, 'storage-open-form', 'open', function (form) {
      initOpenForm(form);
    });
    functions.dialog(func, 'storage-delete-form', 'delete', function (form) {
      initDeleteForm(form);
    });
  }

  return {};
}

define('storage', [ 'jquery', 'functions', 'share', 'plugins' ], function ($, functions, share, plugins) {
  'use strict';
  return new Storage($, functions, share, plugins);
});
