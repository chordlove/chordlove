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

function Export( $, functions )
{
  'use strict';
  if ( Export.prototype._instance )
  {
    return Export.prototype._instance;
  }
  Export.prototype._instance = this;

  var $form = undefined;
  var $link = undefined;
  var link = undefined;
  var $adocLink = undefined;
  var adocLink = undefined;
  var mimeType = 'application/octet-stream';
  var adocMimeType = 'application/octet-stream';

  // var PLUGIN_ID = '08', DEFAULT_FORMAT = 0;

  /**
   * @method
   * @name module:plugins/export.setData
   */
  function setData( inputFormat, inputData )
  {
    // just act as a plugin
  }

  function init()
  {
    functions.dialog( showForm, 'storage-export-form', 'export', function( form )
    {
      $form = $( form );
      $link = $( '#storage-export-link' );
      link = $link[0];
      if ( 'download' in link )
      {
        link.download = 'songs.cdlv';
        mimeType = 'text/plain';
      }
      $link.click( function( event )
      {
        if ( link.href === '#' )
        {
          // TODO error message + don't hide.
          // also make the btn look disabled in advance
          event.preventDefault();
        }
        else
        {
          $form.modal( 'hide' );
        }
      } );
      $adocLink = $( '#storage-export-asciidoc-link' );
      adocLink = $adocLink[0];
      if ( 'download' in adocLink )
      {
        adocLink.download = 'songs.adoc';
        adocMimeType = 'text/plain';
      }
      $adocLink.click( function( event )
      {
        if ( adocLink.href === '#' )
        {
          // TODO error message + don't hide.
          // also make the btn look disabled in advance
          event.preventDefault();
        }
        else
        {
          $form.modal( 'hide' );
        }
      } );
    } );
  }

  function showForm()
  {
    $form.modal( 'show' ).on( 'shown.bs.modal', function()
    {
      $link.focus();
    } );
    if ( link.href !== '#' )
    {
      window.URL.revokeObjectURL( link.href );
    }
    var blob = new window.Blob( buildExportData(), {
      'type' : mimeType
    } );
    var url = window.URL.createObjectURL( blob );
    link.href = url;
    $link.removeClass( 'disabled' );

    if ( adocLink.href !== '#' )
    {
      window.URL.revokeObjectURL( adocLink.href );
    }
    var adocBlob = new window.Blob( buildAsciidocData(), {
      'type' : adocMimeType
    } );
    var adocUrl = window.URL.createObjectURL( adocBlob );
    adocLink.href = adocUrl;
    $adocLink.removeClass( 'disabled' );
  }

  function buildExportData()
  {
    var strings = [];
    for ( var key in window.localStorage )
    {
      if ( key.indexOf( 'lscache-INJECT' ) !== 0 )
      {
        strings.push( key );
        strings.push( "\n" );
        strings.push( window.localStorage[key] );
        strings.push( "\n" );
      }
    }
    return strings;
  }

  function buildAsciidocData()
  {
    var loc = window.location;
    var baseUrl = loc.protocol + '//' + loc.hostname + loc.pathname;
    var strings = [];
    for ( var key in window.localStorage )
    {
      if ( key.indexOf( 'lscache-INJECT' ) !== 0 )
      {
        var line = '* ' + baseUrl + window.localStorage[key].replace( /~/g, '\\~' ) + '[' + key + ']';
        strings.push( line );
        strings.push( "\n" );
      }
    }
    return strings;
  }

  return {
    'setData' : setData,
    'init' : init
  };
}

define( 'plugins/export', [ 'plugins', 'jquery', 'functions' ], function( plugins, $, functions )
{
  'use strict';
  var instance = new Export( $, functions );
  plugins.register( {
    'name' : 'export',
    'instance' : instance,
    'render' : false,
    'serialize' : false
  } );
} );
