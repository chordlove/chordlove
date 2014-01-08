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
 * Import all songs.
 * 
 * @module plugins/import
 * @requires jquery
 */

function Import( $, functions )
{
  'use strict';
  if ( Import.prototype._instance )
  {
    return Import.prototype._instance;
  }
  Import.prototype._instance = this;

  var $form = undefined;
  var $file = undefined;
  var file = undefined;
  var $importButton = undefined;
  var importButton = undefined;
  var currentResult = undefined;

  // var PLUGIN_ID = '09', DEFAULT_FORMAT = 0;

  /**
   * @method
   * @name module:plugins/import.setData
   */
  function setData( inputFormat, inputData )
  {
    // just act as a plugin
  }

  function init()
  {
    functions.dialog( showForm, 'storage-import-form', 'import', function( form )
    {
      $form = $( form );
      $file = $( '#import-file' ).change( function( event )
      {
        updateState( true );
      } );
      file = $file[0];
      $importButton = $( '#import-button' ).click( function()
      {
        if ( !importButton.disabled && currentResult.length )
        {
          var success = true;
          var strings = currentResult.split( "\n" );
          var max = strings.length - 1;
          for ( var i = 0; i < max; i += 2 )
          {
            var key = strings[i];
            var value = strings[i + 1];
            if ( key.length && value.length )
            {
              window.localStorage[key] = value;
            }
            else
            {
              success = false;
              break;
            }
          }
          if ( success )
          {
            functions.alert( 'success', 'Import', 'All songs have been imported.', 'icon-upload-alt' );
          }
          else
          {
            functions.alert( 'warning', 'Import', 'Some songs may not have been imported.', 'icon-upload-alt' );
          }
        }
        else
        {
          functions.alert( 'error', 'Import', 'There were no songs to import.', 'icon-upload-alt' );
        }
      } );
      importButton = $importButton[0];
    } );
  }

  function showForm()
  {
    currentResult = undefined;
    updateState( false );
    $form.modal( 'show' );
  }

  function updateState( checkFile )
  {
    if ( file.files.length )
    {
      if ( checkFile )
      {
        var f = file.files[0];
        var reader = new window.FileReader();
        reader.addEventListener( 'load', function( event )
        {
          currentResult = reader.result;
          importButton.disabled = false;
          $importButton.removeClass( 'disabled' );
        } );
        reader.readAsText( f );
      }
    }
    else
    {
      importButton.disabled = true;
      $importButton.addClass( 'disabled' );
    }
  }

  return {
    'setData' : setData,
    'init' : init
  };
}

define( 'plugins/import', [ 'plugins', 'jquery', 'functions' ], function( plugins, $, functions )
{
  'use strict';
  var instance = new Import( $, functions );
  plugins.register( {
    'name' : 'import',
    'instance' : instance,
    'render' : false,
    'serialize' : false
  } );
} );
