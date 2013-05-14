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
  var FILTER = 'input.resize-trigger';

  /**
   * Prepare input elements for resizing.
   * 
   * @method
   * @name module:resizer.prepareResize
   * @param {HTMLElement}
   *          wrapper The container which will be later resized.
   */
  function prepareResize( wrapper )
  {
    $( FILTER, wrapper ).each( function()
    {
      var input = $( this );
      if ( !input.data( 'testSubject' ) )
      {
        var testSubject = $( '<div/>' ).css( {
          position : 'absolute',
          top : -9999,
          left : -9999,
          width : 'auto',
          fontSize : input.css( 'fontSize' ),
          fontFamily : input.css( 'fontFamily' ),
          fontWeight : input.css( 'fontWeight' ),
          letterSpacing : input.css( 'letterSpacing' ),
          whiteSpace : 'nowrap'
        } );
        testSubject.insertAfter( input );
        input.data( 'testSubject', testSubject );
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
  function performResize( wrapper )
  {
    var minWidth = MIN_WIDTH;
    $( FILTER, wrapper ).each( function()
    {
      var input = $( this );
      if ( input.data( 'testSubject' ) )
      {
        var otherMinWidth = calculateResize( input );
        if ( otherMinWidth > minWidth )
        {
          minWidth = otherMinWidth;
        }
      }
    } );
    wrapper.width( minWidth + WRAPPER_MARGIN );
  }

  function calculateResize( input )
  {
    var val = '';
    if ( val === ( val = input.val() ) )
    {
      return MIN_WIDTH;
    }

    var testSubject = input.data( "testSubject" );

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
