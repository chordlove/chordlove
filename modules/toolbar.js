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
 * Behavior of the toolbar.
 * 
 * @module toolbar
 * @requires jquery
 * @requires functions
 * @requires share
 */

function Toolbar( $, functions, share )
{
  'use strict';
  if ( Toolbar.prototype._instance )
  {
    return Toolbar.prototype._instance;
  }
  Toolbar.prototype._instance = this;

  var $ADDONS_MENU = $( '#addons-list' );
  var $MENU_LI = $( '<li />' );
  var $MENU_A = $( '<a href="#"/>' );

  function prepareCpanel()
  {
    // TODO this is a backwards compat hack.
    var bindButton = functions.bindButton;

    function editMode()
    {
      var currentState = $( '#edit' ).hasClass( 'active' );
      setEditMode( !currentState );
    }

    function clear()
    {
      share.clear();
      return false;
    }

    bindButton( '#edit', editMode );
    bindButton( '#clear', clear );

    $( '#time-signature' ).change( function()
    {
      share.changedStructure( 'toolbar/timesignature' );
    } );
  }

  prepareCpanel();

  /**
   * Set the edit mode to use.
   * 
   * @method
   * @name module:toolbar.setEditMode
   * @param {boolean}
   *          mode Set to <code>true</code> to enable editing.
   */
  function setEditMode( mode )
  {
    if ( mode === true )
    {
      $( 'body' ).addClass( 'edit-mode' );
      $( '#edit' ).addClass( 'active' );
      hideOrShow( 'show' );
    }
    else
    {
      $( 'body' ).removeClass( 'edit-mode' );
      $( '#edit' ).removeClass( 'active' );
      hideOrShow( 'hide' );
    }
  }

  /**
   * Hide or show empty input elements. Make all input elements read-only in the case of hiding.
   * 
   * @method
   * @name module:toolbar.hideOrShow
   * @param {string}
   *          action Choose action by using <code>show</code> or <code>hide</code> as the value.
   */
  function hideOrShow( action )
  {
    $( '#items input, #title' ).each( function()
    {
      var $element = $( this );
      if ( $element.val() === '' )
      {
        $element[action]();
      }
      else
      {
        $element.prop( 'readonly', action === 'hide' );
      }
    } );
  }

  /**
   * Register a member in the addons menu.
   * <p>
   * The registered function will be provided the <code>LI</code> and <code>A</code> element going into the menu,
   * bot wrapped as jQuery objects. Manipulate the menu elements as needed. Something along the lines of:
   * 
   * <pre><code>
   * </code></pre>
   * 
   * @method
   * @name module:toolbar.registerAddonsMenuMember
   * @param {Function}
   *          menuMember The menu member function to register.
   */
  function registerAddonsMenuMember( menuMember )
  {
    var $menuLi = $MENU_LI.clone();
    var $menuA = $MENU_A.clone();
    menuMember( $menuLi, $menuA );
    $menuLi.append( $menuA );
    $ADDONS_MENU.append( $menuLi );
  }

  return {
    'hideOrShow' : hideOrShow,
    'setEditMode' : setEditMode,
    'registerAddonsMenuMember' : registerAddonsMenuMember,
    'clear' : clear
  };
}

define( 'toolbar', [ 'jquery', 'functions', 'share' ], function( $, functions, share )
{
  'use strict';
  return new Toolbar( $, functions, share );
} );
