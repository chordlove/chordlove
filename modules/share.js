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
 * @requires jquery
 * @requires plugins
 * @requires functions
 */

function Share( $, plugins, functions )
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

  functions.dialog( false, 'share-form', 'share', function( form )
  {
    var $shareUrl = $( '#share-url' );

    $shareUrl.click( function()
    {
      this.select();
    } );

    $( '#share' ).click( function()
    {
      var href = window.location.href.replace( '|', '%7C' ).replace( '—', '%E2%80%94' );
      this.blur();
      $shareUrl.val( href );
      if ( window.location.hostname === 'alpha.chordlove.com' || window.location.hostname === 'chordlove.com' )
      {
        gapi.client.load( 'urlshortener', 'v1', function()
        {
          gapi.client.urlshortener.url.insert( {
            'resource' : {
              'longUrl' : href
            }
          } ).execute( function( response )
          {
            if ( !response.error && response.id )
            {
              $shareUrl.val( response.id );
              $shareUrl.select();
            }
          } );
        } );
      }

      $( form ).modal().on( 'shown', function()
      {
        $shareUrl.select();
      } );
    } );

    gapi.client.setApiKey( 'AIzaSyCTT5Hmfs--UxZWAUf2M4xWAPXhwK-Q6WI' );
  } );

  function writeUri( force )
  {
    var status = plugins.serialize();
    var hash = '#' + encodeURIComponent( status );
    if ( force === true || hash !== previousHash )
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
   *          The event object which listeners will receive.
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
   *          The event object which listeners will receive.
   */
  function changedStructure( event )
  {
    for ( var i = 0; i < structureChangeListeners.length; i++ )
    {
      structureChangeListeners[i]( event );
    }
    writeUri();
  }

  /**
   * Tells the share module that there has been some change.
   * 
   * @method
   * @name module:share.changed
   * @param {boolean}
   *          [force] Force a URI rewrite (this is useful for making sure the current state will be preserved in
   *          history).
   */
  function changed( force )
  {
    writeUri( force );
  }

  /**
   * Kicks off a clear command to all plugins.
   */
  function clear()
  {
    plugins.clear();
    changedStructure( 'share/clear' );
  }

  return {
    'addTextChangeListener' : addTextChangeListener,
    'addStructureChangeListener' : addStructureChangeListener,
    'changedText' : changedText,
    'changedStructure' : changedStructure,
    'changed' : changed,
    'clear' : clear
  };
}

define( 'share', [ 'plugins', 'jquery', 'functions' ], function( plugins, $, functions )
{
  'use strict';
  return new Share( $, plugins, functions );
} );
