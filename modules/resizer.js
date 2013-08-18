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
  var $FONT_SPAN = $( '<span>BESbswy</span>' );
  var $FONT_ROOT = $( '#fontsizer' );
  var FONT_POLL_INTERVAL = 50;
  var FONT_POLL_MAX_SECONDS = 10;
  var FONT_POLL_COUNTER_MAX = Math.floor( FONT_POLL_MAX_SECONDS * 1000 / FONT_POLL_INTERVAL );
  var FONT_POLL_RESIZE_INTERVAL = 5;

  var isReadyToResize = false;
  var resizeQueue = [];

  function getSafeWidth( width )
  {
    return Math.floor( WRAPPER_EXTRA_PERCENTAGE * width ) + WRAPPER_MARGIN;
  }

  function detectFontLoading()
  {
    var span1 = $FONT_SPAN.clone().attr( 'id', 'fontsize1' ).appendTo( $FONT_ROOT );
    var span2 = $FONT_SPAN.clone().attr( 'id', 'fontsize2' ).appendTo( $FONT_ROOT );
    var span3 = $FONT_SPAN.clone().attr( 'id', 'fontsize3' ).appendTo( $FONT_ROOT );
    var span4 = $FONT_SPAN.clone().attr( 'id', 'fontsize4' ).appendTo( $FONT_ROOT );
    var counter = 0;
    var avoidWidth = 0;

    if ( navigator.userAgent.toLowerCase().indexOf( 'safari/' ) > -1 )
    {
      var initialWidth1 = span1.width();
      var initialWidth2 = span2.width();
      var initialWidth3 = span3.width();
      var initialWidth4 = span4.width();
      if ( initialWidth4 === initialWidth3 && initialWidth3 === initialWidth2 && initialWidth2 === initialWidth1 )
      {
        // this is probably just an old webkit version spooking us, see:
        // http://blog.typekit.com/2013/02/05/more-reliable-font-events/
        avoidWidth = initialWidth1;
      }
    }

    var callId = window.setInterval( checkIfFontIsUsed, FONT_POLL_INTERVAL );

    function checkIfFontIsUsed()
    {
      var width1 = span1.width();
      var width2 = span2.width();
      var width3 = span3.width();
      console.log( width1, width2, width3, initialWidth4 );
      counter++;

      if ( counter > FONT_POLL_COUNTER_MAX || ( width1 === width2 && width2 === width3 ) )
      {
        if ( width3 !== avoidWidth || counter > FONT_POLL_COUNTER_MAX )
        {
          // only stop if we think it's the real deal
          // or we are timing out.
          window.clearInterval( callId );
          isReadyToResize = true;
          $FONT_ROOT.remove();
        }
        else if ( counter % FONT_POLL_RESIZE_INTERVAL )
        {
          return;
        }
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
    }
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
    'detectFontLoading' : detectFontLoading,
    'prepareResize' : prepareResize,
    'performResize' : performResize
  };
} );
