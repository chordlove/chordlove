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
 * Creates sharable URLs and manages events connected to this.
 * 
 * @module share
 * @requires jquery
 * @requires plugins
 * @requires functions
 * @requires toolbar
 */

function Share( $, plugins, functions, toolbar )
{
  'use strict';
  if ( Share.prototype._instance )
  {
    return Share.prototype._instance;
  }
  Share.prototype._instance = this;

  var $SHARE_LINK = $( '#share-link' );
  var $SHARE_TWITTER = $( '#share-twitter' );
  var $SHARE_FACEBOOK = $( '#share-facebook' );
  var $SHARE_GOOGLEPLUS = $( '#share-google-plus' );
  var $DROPDOWN_LINK = $( '#share-dropdown' );
  var $DROPDOWN = $DROPDOWN_LINK.parent();

  var previousHash = '';
  var shortUrlHistory = {
    'longUrl' : -1,
    'shortUrl' : ''
  };

  var textChangeListeners = [];
  var structureChangeListeners = [];

  toolbar.setClearFunction( clear );

  functions.dialog( false, 'share-form', 'share', function( form )
  {
    var $shareUrl = $( '#share-url' );

    $shareUrl.click( function()
    {
      this.select();
    } );

    $SHARE_LINK.click( function( event )
    {
      event.preventDefault();
      var href = this.href;
      this.blur();
      $shareUrl.val( href );
      if ( href.indexOf( 'http://goo.gl/' ) !== 0 )
      {
        getShortUrl( href, function( shortUrl )
        {
          $shareUrl.val( shortUrl );
          $shareUrl.select();
        } );
      }

      $( form ).modal().on( 'shown.bs.modal', function()
      {
        $shareUrl.select();
      } );
    } );
  } );

  $DROPDOWN_LINK.click( function()
  {
    if ( $DROPDOWN.hasClass( 'open' ) === false )
    {
      var href = getHref();
      var title = document.title;
      initSocialLinks( href, title );
      getShortUrl( href, function( shortUrl )
      {
        initSocialLinks( shortUrl, title );
      } );
    }
  } );

  function initSocialLinks( href, title )
  {
    var encodedHref = encodeURIComponent( href );
    $SHARE_TWITTER.attr( 'href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent( title ) + '&url='
        + encodedHref );
    $SHARE_FACEBOOK.attr( 'href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodedHref );
    $SHARE_GOOGLEPLUS.attr( 'href', 'https://plus.google.com/share?url=' + encodedHref );
    $SHARE_LINK.attr( 'href', href );
  }

  function getHref()
  {
    return window.location.href.replace( '|', '%7C' ).replace( '—', '%E2%80%94' );
  }

  function getShortUrl( href, success )
  {
    if ( href === shortUrlHistory.longUrl )
    {
      success( shortUrlHistory.shortUrl );
      return;
    }
    if ( !gapi || !( 'client' in gapi ) || !( 'load' in gapi.client ) )
    {
      return;
    }
    var hostname = window.location.hostname;
    if ( hostname === 'alpha.chordlove.com' || hostname === 'chordlove.com' || hostname === 'master.chordlove.com' )
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
            var shortUrl = response.id;
            shortUrlHistory.longUrl = href;
            shortUrlHistory.shortUrl = shortUrl;
            success( shortUrl );
          }
        } );
      } );
    }
  }

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
    window.history.pushState( '', window.document.title, '#' );
    previousHash = '#';
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

define( 'share', [ 'plugins', 'jquery', 'functions', 'toolbar' ], function( plugins, $, functions, toolbar )
{
  'use strict';
  return new Share( $, plugins, functions, toolbar );
} );
