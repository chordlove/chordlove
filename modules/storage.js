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

function Storage( $, functions, share, plugins )
{
  'use strict';
  if ( Storage.prototype._instance )
  {
    return Storage.prototype._instance;
  }
  Storage.prototype._instance = this;

  if ( !functions.hasLocalStorage() )
  {
    return;
  }

  $( '#save-load' ).removeClass( 'NIY' );

  init();

  function initSaveForm( form )
  {
    var $form = $( form );
    var $save = $( '#save' );
    var $saveOk = $( '#storage-save-ok' );
    var $status = $( '#storage-save-status' );
    var $help = $( '#storage-save-help' );
    var $saveName = $( '#storage-save-name' );
    var saveName = $saveName[0];

    $saveName.keyup( function()
    {
      setSaveNameStatus();
    } ).keypress( function( event )
    {
      if ( event.keyCode === 13 )
      {
        event.preventDefault();
        $saveOk.click();
      }
    } );

    function setSaveNameStatus()
    {
      var value = $.trim( $saveName.val() );
      $status.removeClass( 'error info' );
      if ( value.length === 0 )
      {
        $status.addClass( 'error' );
        $help.text( "The name can't be empty!" );
        $saveOk.addClass( 'disabled' );
      }
      else if ( value in window.localStorage )
      {
        $status.addClass( 'info' );
        $help.text( "The existing song will be overwritten." );
        $saveOk.removeClass( 'disabled' );
      }
      else
      {
        $help.text( '' );
        $saveOk.removeClass( 'disabled' );
      }
    }

    $save.click( function()
    {
      $saveName.val( $( '#title' ).val() );
      $saveName.data( 'hash', window.location.hash );
      setSaveNameStatus();
      $form.modal();
    } );

    $form.on( 'shown', function()
    {
      functions.setCaretPositionToBeginning( saveName );
    } );

    $saveOk.click( function()
    {
      if ( $status.hasClass( 'error' ) )
      {
        return false;
      }
      window.localStorage[$.trim( $saveName.val() )] = $saveName.data( 'hash' );
      functions.alert( 'success', 'Save', '"' + $saveName.val() + '" has been saved.', 'icon-save' );
    } );
  }

  function initOpenDeleteForm( form )
  {
    var $OPTION = $( '<option/>' );

    var $deleteGroup = $( '#storage-delete-group' );
    var $deleteConfirm = $( '#storage-delete-confirm' );
    var deleteConfirm = $deleteConfirm[0];
    var $deleteButton = $( '#storage-open-delete' );
    var $openSelect = $( '#storage-open-select' );
    var openSelect = $openSelect[0];
    var $okButton = $( '#storage-open-ok' );
    var $openForm = $( form );

    $( '#open' ).click( function()
    {
      var items = [];
      for ( var key in window.localStorage )
      {
        if ( key.indexOf( 'lscache-INJECT' ) !== 0 )
        {
          items.push( key );
        }
      }
      items.sort();
      $openSelect.empty();
      for ( var i = 0; i < items.length; i++ )
      {
        $openSelect.append( $OPTION.clone().text( items[i] ) );
      }

      $openForm.modal().on( 'shown', function()
      {
        $openSelect.focus();
        $openSelect.children( 'option:first' ).attr( 'selected', 'selected' );
        updateButtons();
      } );

      $okButton.click( function()
      {
        if ( openSelect.selectedIndex === -1 )
        {
          return;
        }
        share.changed( true ); // this stores the current location in history
        var selectedKey = $openSelect.val();
        var hash = window.localStorage[selectedKey];
        plugins.clear();
        window.location.hash = hash;
        functions.alert( 'success', 'Open', '"' + selectedKey + '" has been opened.', 'icon-folder-open-alt' );
      } );

      $deleteButton.click( function( event )
      {
        event.preventDefault();
        var selectedKey = $openSelect.val();
        delete window.localStorage[selectedKey];
        var selected = openSelect.selectedIndex;
        if ( selected !== -1 )
        {
          openSelect.remove( selected );
        }
        updateButtons();
      } );

      $deleteConfirm.change( updateButtons );

      $openSelect.change( updateButtons ).keypress( function( event )
      {
        if ( event.keyCode === 13 )
        {
          event.preventDefault();
          $okButton.click();
        }
      } ).dblclick( function( event )
      {
        event.stopImmediatePropagation();
        $okButton.click();
      } );

      function updateButtons()
      {
        var somethingIsSelected = openSelect.selectedIndex !== -1;
        var doNotDelete = !deleteConfirm.checked;
        $deleteButton.toggleClass( 'disabled', doNotDelete || !somethingIsSelected );
        if ( doNotDelete || !somethingIsSelected )
        {
          $deleteButton.attr( 'disabled', 'disabled' );
        }
        else
        {
          $deleteButton.removeAttr( 'disabled' );
        }
        $deleteGroup.toggleClass( 'error', doNotDelete );
        $okButton.toggleClass( 'disabled', !somethingIsSelected );
        if ( somethingIsSelected )
        {
          $okButton.removeAttr( 'disabled' );
        }
        else
        {
          $okButton.attr( 'disabled', 'disabled' );
        }
      }
    } );
  }

  function init( func )
  {
    functions.dialog( func, 'storage-save-form', 'save', function( form )
    {
      initSaveForm( form );
    } );
    functions.dialog( func, 'storage-open-form', 'open', function( form )
    {
      initOpenDeleteForm( form );
    } );
  }

  return {};
}

define( 'storage', [ 'jquery', 'functions', 'share', 'plugins' ], function( $, functions, share, plugins )
{
  'use strict';
  return new Storage( $, functions, share, plugins );
} );
