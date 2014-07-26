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
 * Export all songs.
 *
 * @module plugins/export
 * @requires jquery
 * @requires functions
 */

function Export($, functions) {
  'use strict';
  if (Export.prototype._instance) {
    return Export.prototype._instance;
  }
  Export.prototype._instance = this;

  var $form = undefined;
  var $link = undefined;
  var icon = undefined;
  var link = undefined;
  var mimeType = 'application/octet-stream';

  // var PLUGIN_ID = '08', DEFAULT_FORMAT = 0;

  /**
   * @method
   * @name module:plugins/export.setData
   */
  function setData(inputFormat, inputData) {
    // just act as a plugin
  }

  function init() {
    functions.dialog(showForm, 'storage-export-form', 'export', function (form) {
      $form = $(form);
      $link = $('#storage-export-link');
      link = $link[0];
      icon = $('#storage-export-download-type')[0];

      $link.click(function (event) {
        if (link.href === '#') {
          // safety net
          event.preventDefault();
        }
        else {
          $form.modal('hide').on('hidden.bs.modal', function () {
            $link.addClass('disabled');
            icon.className = '';
          });
        }
      });

      $('#storage-export-backup').click(function (event) {
        createClick(event, 'songs.chordlove', 'text/plain', buildExportData, 'fa-suitcase');
      });

      $('#storage-export-markdown').click(function (event) {
        createClick(event, 'songs.md', 'text/plain', buildMarkdownData, 'fa-file-text');
      });

      $('#storage-export-asciidoc').click(function (event) {
        createClick(event, 'songs.adoc', 'text/plain', buildAsciiDocData, 'fa-file-text');
      });
    });
  }

  function createClick(event, filename, mime, generator, iconName) {
    event.preventDefault();
    if (link.href !== '#') {
      window.URL.revokeObjectURL(link.href);
    }
    if ('download' in link) {
      link.download = filename;
      mimeType = mime;
    }
    var blob = new window.Blob(generator(), {
      'type': mimeType
    });
    var url = window.URL.createObjectURL(blob);
    link.href = url;
    $link.removeClass('disabled');
    icon.className = 'fa ' + iconName;
  }

  function showForm() {
    $form.modal('show').on('shown.bs.modal', function () {
      if (link.href !== '#') {
        window.URL.revokeObjectURL(link.href);
      }
    });
  }

  function buildExportData() {
    var strings = [];
    for (var key in window.localStorage) {
      if (key.indexOf('lscache-INJECT') !== 0) {
        strings.push(key);
        strings.push('\n');
        strings.push(window.localStorage[key]);
        strings.push('\n');
      }
    }
    return strings;
  }

  function buildMarkdownData() {
    return buildTextData(function markdownLineFormatter( key, url) {
      return '* [' + key + '](' + url + ')';
    });
  }

  function buildAsciiDocData() {
    return buildTextData(function asciiDocLineFormatter(key, url) {
      return '* link:pass:[' + url + '][' + key + ']';
    });
  }

  function buildTextData(lineFormatter) {
    var loc = window.location;
    var baseUrl = loc.protocol + '//' + loc.hostname + loc.pathname;
    var keys = [];
    var strings = [];
    for (var key in window.localStorage) {
      if (key.indexOf('lscache-INJECT') !== 0) {
        keys.push(key);
      }
    }
    keys.sort(functions.localeComparer);
    for (var i = 0; i < keys.length; i++) {
      var currentKey = keys[i];
      var line = lineFormatter(currentKey, baseUrl + window.localStorage[currentKey]);
      strings.push(line);
      strings.push('\n');
    }
    return strings;
  }

  return {
    'setData': setData,
    'init': init
  };
}

define('plugins/export', [ 'plugins', 'jquery', 'functions' ], function (plugins, $, functions) {
  'use strict';
  var instance = new Export($, functions);
  plugins.register({
    'name': 'export',
    'instance': instance,
    'render': false,
    'serialize': false
  });
});
