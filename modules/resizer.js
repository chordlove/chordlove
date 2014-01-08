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
 * Resize wrapper based on text length in input box(es).
 * 
 * @module resizer
 * @requires jquery
 */

define( 'resizer', [ 'jquery' ], function( $ )
{
  'use strict';
  var MIN_WIDTH = 100;
  var MAX_WIDTH = 1000;
  var WRAPPER_MARGIN = 7;
  var WRAPPER_EXTRA_PERCENTAGE = 1.03;
  var FILTER = 'input.resize-trigger';

  var isReadyToResize = false;
  var resizeQueue = [];

  function fontListener( result )
  {
    // we'll resize anyhow, even if the font wasn't loaded.
    isReadyToResize = true;
    var i = resizeQueue.length;
    while ( --i >= 0 )
    {
      try
      {
        performResize( resizeQueue[i] );
      }
      catch ( e )
      {
        // could fail if the object was removed from the DOM,
        // but we don't care enough to check.
        // otherwise this could be used:
        // if( $queuedWrapper.closest('body').length > 0 )
      }
    }
  }

  window.ChordloveFontLoading.addListener( 'DejaVuSerifBook', fontListener );

  function getSafeWidth( width )
  {
    return Math.floor( WRAPPER_EXTRA_PERCENTAGE * width ) + WRAPPER_MARGIN;
  }

  /**
   * Prepare input elements for resizing.
   * 
   * @method
   * @name module:resizer.prepareResize
   * @param {HTMLElement}
   *          $wrapper The container which will be later resized.
   */
  function prepareResize( $wrapper )
  {
    $( FILTER, $wrapper ).each( function()
    {
      var $input = $( this );
      if ( !$input.data( 'testSubject' ) )
      {
        var $testSubject = $( '<div/>' ).css( {
          position : 'absolute',
          top : -9999,
          left : -9999,
          width : 'auto',
          fontSize : $input.css( 'fontSize' ),
          fontFamily : $input.css( 'fontFamily' ),
          fontWeight : $input.css( 'fontWeight' ),
          letterSpacing : $input.css( 'letterSpacing' ),
          whiteSpace : 'nowrap'
        } );
        $testSubject.insertAfter( $input );
        $input.data( 'testSubject', $testSubject );
      }
    } );
  }

  /**
   * Perform resizing based on the text value of the input elements.
   * 
   * @method
   * @name module:resizer.performResize
   * @param {HTMLElement}
   *          wrapper The container which will be resized as needed.
   */
  function performResize( $wrapper )
  {
    if ( !isReadyToResize )
    {
      resizeQueue.push( $wrapper );
      return;
    }
    var minWidth = MIN_WIDTH;
    $( FILTER, $wrapper ).each( function()
    {
      var $input = $( this );
      if ( $input.data( 'testSubject' ) )
      {
        var otherMinWidth = calculateResize( $input );
        if ( otherMinWidth > minWidth )
        {
          minWidth = otherMinWidth;
        }
      }
    } );
    $wrapper.width( getSafeWidth( minWidth ) );
  }

  function calculateResize( $input )
  {
    var val = '';
    if ( val === ( val = $input.val() ) )
    {
      return MIN_WIDTH;
    }

    var testSubject = $input.data( "testSubject" );

    // Enter new content into testSubject
    var escaped = val.replace( /&/g, '&amp;' ).replace( /\s/g, '&nbsp;' ).replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' );
    testSubject.html( escaped );

    // Calculate new width, check min/max values.
    var testerWidth = testSubject.width();
    var newWidth = testerWidth > MIN_WIDTH ? testerWidth : MIN_WIDTH;
    newWidth = newWidth > MAX_WIDTH ? MAX_WIDTH : newWidth;

    return newWidth;
  }

  return {
    'prepareResize' : prepareResize,
    'performResize' : performResize
  };
} );
