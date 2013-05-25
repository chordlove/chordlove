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
 * Creates sharable URLs and manages events connected to this.
 * 
 * @module share
 * @requires plugins
 */

function Share( plugins )
{
  'use strict';
  if ( Share.prototype._instance )
  {
    return Share.prototype._instance;
  }
  Share.prototype._instance = this;

  var previousHash = '';

  var textChangeListeners = [];
  var structureChangeListeners = [];

  $( '#share-url' ).click( function()
  {
    this.select();
  } );

  $( '#share' ).click( function()
  {
    var href = window.location.href.replace( '|', '%7C' ).replace( '—', '%E2%80%94' );
    this.blur();
    $( '#share-url' ).val( href );
    $( '#share-form' ).modal().on( 'shown', function()
    {
      $( '#share-url' ).select();
    } );
  } );

  function writeUri()
  {
    var status = plugins.serialize();
    var hash = '#' + encodeURIComponent( status );
    if ( hash !== previousHash )
    {
      window.history.pushState( status, window.document.title, hash );
      previousHash = hash;
    }
  }

  /**
   * Register a listener for events altering text-level content but not the structure of the content.
   * 
   * @method
   * @name module:share.addTextChangeListener
   * @param {Function}
   *          listener Receiver of the events.
   */
  function addTextChangeListener( listener )
  {
    textChangeListeners.push( listener );
  }

  /**
   * Register a listener for events altering the structure of the content.
   * 
   * @method
   * @name module:share.addStructureChangeListener
   * @param {Function}
   *          listener Receiver of the events.
   */
  function addStructureChangeListener( listener )
  {
    structureChangeListeners.push( listener );
  }

  /**
   * Tells the share module that there has been a text-level change.
   * 
   * @method
   * @name module:share.changedText
   * @param event
   *          The event object wich listeners will receive.
   */
  function changedText( event )
  {
    for ( var i = 0; i < textChangeListeners.length; i++ )
    {
      textChangeListeners[i]( event );
    }
    writeUri();
  }

  /**
   * Tells the share module that there has been a structure-level change.
   * 
   * @method
   * @name module:share.changedStructure
   * @param event
   *          The event object wich listeners will receive.
   */
  function changedStructure( event )
  {
    for ( var i = 0; i < structureChangeListeners.length; i++ )
    {
      structureChangeListeners[i]( event );
    }
    writeUri();
  }

  function changed()
  {
    writeUri();
  }

  return {
    'addTextChangeListener' : addTextChangeListener,
    'addStructureChangeListener' : addStructureChangeListener,
    'changedText' : changedText,
    'changedStructure' : changedStructure,
    'changed' : changed
  };
}

define( 'share', [ 'plugins' ], function( plugins )
{
  'use strict';
  return new Share( plugins );
} );
