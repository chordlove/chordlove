/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013 NA Konsult AB
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
 * Store URLs in local storage.
 * 
 * @module storage
 * @requires jquery
 * @requires functions
 * @requires share
 */

function Storage( $, functions, share )
{
  'use strict';
  if ( Storage.prototype._instance )
  {
    return Storage.prototype._instance;
  }
  Storage.prototype._instance = this;

  if ( !hasLocalStorage() )
  {
    return;
  }

  var $OPTION = $( '<option/>' );

  $( '#save-load' ).removeClass( 'NIY' );

  init();

  function init( func )
  {
    functions.dialog( func, 'storage-save-form', 'storage', function()
    {
      var $saveName = $( '#storage-save-name' );
      $( '#save' ).click( function()
      {
        $saveName.val( $( '#title' ).val() );
        $saveName.data( 'hash', window.location.hash );
        $( '#storage-save-form' ).modal().on( 'shown', function()
        {
          $saveName.focus();
        } );
      } );

      $( '#storage-save-ok' ).click( function()
      {
        window.localStorage[$saveName.val()] = $saveName.data( 'hash' );
      } );

      var $openSelect = $( '#storage-open-select' );
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

        $( '#storage-open-form' ).modal().on( 'shown', function()
        {
          $openSelect.focus();
          $openSelect.children( 'option:first' ).attr( 'selected', 'selected' );
        } );

        $( '#storage-open-ok' ).click( function()
        {
          share.changed(); // this stores the current location in history
          var selectedKey = $openSelect.val();
          var hash = window.localStorage[selectedKey];
          window.location.hash = hash;
        } );

        $( '#storage-open-delete' ).click( function( event )
        {
          event.preventDefault();
          var selectedKey = $openSelect.val();
          delete window.localStorage[selectedKey];
          $( 'option:selected', $openSelect ).remove();
        } );
      } );
    } );
  }

  function hasLocalStorage()
  {
    var key = '_local_storage_test_';
    try
    {
      window.localStorage.setItem( key, key );
      window.localStorage.removeItem( key );
      return true;
    }
    catch ( e )
    {
      return false;
    }
  }

  return {};
}

define( 'storage', [ 'jquery', 'functions', 'share' ], function( $, functions, share )
{
  'use strict';
  return new Storage( $, functions, share );
} );
