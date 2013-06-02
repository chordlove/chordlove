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

function Beats( $, functions, share )
{
  'use strict';
  var MAX_BULLETS = 16;
  var $PARENT = $( '#items' );
  var $TIME_SIGNATURE = $( '#time-signature' );
  var $BEATS_WRAPPER = $( '<div class="btn-group duration">' );
  var $BEATS_LINK = $( '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#"/>' );
  var $BEATS_LIST = $( '<ul class="dropdown-menu"/>' );
  var BULLET_STRING = '••••••••••••••••';
  var BULLETS = [];
  for ( var len = 0; len <= MAX_BULLETS; len++ )
  {
    BULLETS.push( BULLET_STRING.substr( 0, len ) );
  }

  $TIME_SIGNATURE.data( 'previous', parseInt( $TIME_SIGNATURE.val() ) ).change( function()
  {
    timeSignatureChanged();
  } );

  function timeSignatureChanged()
  {
    if ( $PARENT.children( 'li.item' ).length > 0 )
    {
      createTimeSignatureDialog();
    }
    else
    {
      // keep the "previous" data in sync.
      $TIME_SIGNATURE.data( 'previous', parseInt( $TIME_SIGNATURE.val() ) );
    }
  }

  function createTimeSignatureDialog()
  {
    var canTransform = canBeatsBeTransformed();
    functions.dialog( function()
    {
      openTimeSignatureDialog( canTransform );
    }, 'time-signature-form', 'time-signature', function()
    {
      initializeTimeSignatureDialog();
    } );
  }

  function initializeTimeSignatureDialog()
  {
    var $modal = $( '#time-signature-form' );
    $( '#time-signature-ok' ).click( function()
    {
      $modal.data( 'saved', true );
      var transform = $( '#time-signature-actions-transform' ).prop( 'checked' );
      var previous = $TIME_SIGNATURE.data( 'previous' );
      var current = parseInt( $TIME_SIGNATURE.val() );
      var multiplier = current / previous;
      $TIME_SIGNATURE.data( 'previous', current );
      $PARENT.children( 'li.item' ).each( function( index )
      {
        var beats = getBeats( this ).length;
        if ( transform )
        {
          beats *= multiplier;
        }
        $( 'div.duration', this ).remove();
        createBeats( beats, this );
      } );
      share.changedStructure( 'toolbar/timesignature' );
    } );
    $modal.on( 'hidden', function()
    {
      if ( !$modal.data( 'saved' ) )
      {
        $TIME_SIGNATURE.val( $TIME_SIGNATURE.data( 'previous' ) );
      }
    } );
    $( '#time-signature-close,#time-signature-close-header' ).click( function()
    {
      $TIME_SIGNATURE.val( $TIME_SIGNATURE.data( 'previous' ) );
    } );
  }

  function openTimeSignatureDialog( canTransform )
  {
    var $modal = $( '#time-signature-form' );
    $( '#time-signature-actions-default' ).prop( 'checked', true );
    var $transformInput = $( '#time-signature-actions-transform' );
    var $transformLabel = $( '#time-signature-actions-transform-label' );
    var $transformAlert = $( '#time-signature-alert' );
    var $transformAlertYes = $( '#time-signature-alert-yes' );
    var $transformAlertNo = $( '#time-signature-alert-no' );
    if ( canTransform )
    {
      $transformInput.removeAttr( 'disabled' );
      $transformLabel.removeClass( 'disabled' );
      $transformAlert.removeClass( 'alert-block' );
      $transformAlert.addClass( 'alert-success' );
      $transformAlertYes.show();
      $transformAlertNo.hide();
    }
    else
    {
      $transformInput.attr( 'disabled', 'disabled' );
      $transformLabel.addClass( 'disabled' );
      $transformAlert.removeClass( 'alert-success' );
      $transformAlert.addClass( 'alert-block' );
      $transformAlertNo.show();
      $transformAlertYes.hide();
    }
    $modal.modal().data( 'saved', false );
  }

  function canBeatsBeTransformed()
  {
    var previous = $TIME_SIGNATURE.data( 'previous' );
    var current = parseInt( $TIME_SIGNATURE.val() );
    var multiplier = current / previous;
    var canTransform = true;
    $PARENT.children( 'li.item' ).each( function( index )
    {
      var beats = getBeats( this ).length;
      var result = beats * multiplier;
      var isInt = result % 1 === 0;
      if ( !isInt )
      {
        canTransform = false;
        return false;
      }
    } );
    return canTransform;
  }

  function getBeats( li )
  {
    return $( 'div.duration > a', li ).text();
  }

  function createBeats( beats, wrapper )
  {
    var defaultBeats = parseInt( $TIME_SIGNATURE.val() );
    var num = defaultBeats;
    if ( beats !== undefined )
    {
      num = beats;
    }
    var $beatsWrapper = $BEATS_WRAPPER.clone();
    var $currentBeats = $BEATS_LINK.clone().attr( 'title', 'Beats for this chord. (' + num + ')' );
    $currentBeats.appendTo( $beatsWrapper );
    $currentBeats.text( BULLETS[num] );
    $currentBeats.dropdown();

    var list = $BEATS_LIST.clone();
    list.appendTo( $beatsWrapper );

    for ( var len = defaultBeats; len > 0; len-- )
    {
      var beatString = BULLETS[len];
      var $option = $( '<li><a href="#" title="' + len + '">' + beatString + '</a></li>' );
      $option.appendTo( list );
      $option.click( {
        'beatString' : beatString
      }, function( event )
      {
        $currentBeats.dropdown( 'toggle' );
        if ( $currentBeats.text() !== event.data.beatString )
        {
          $currentBeats.text( event.data.beatString );
          $currentBeats.blur();
          share.changedStructure( 'beats/create-beats' );
        }
        return false;
      } );
    }

    $beatsWrapper.appendTo( wrapper );
  }

  return {
    'createBeats' : createBeats,
    'getBeats' : getBeats
  };
}

define( 'plugins/beats', [ 'plugins', 'jquery', 'functions', 'share' ], function( plugins, $, functions, share )
{
  'use strict';
  var instance = new Beats( $, functions, share );
  plugins.register( {
    'name' : 'beats',
    'instance' : instance,
    'render' : false,
    'serialize' : false
  } );
  return instance;
} );
