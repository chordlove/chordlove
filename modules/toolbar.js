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
 * Behavior of the toolbar.
 *
 * @module toolbar
 * @requires jquery
 * @requires functions
 * @requires appcache
 */

function Toolbar($, functions, appcache) {
  'use strict';
  if (Toolbar.prototype._instance) {
    return Toolbar.prototype._instance;
  }
  Toolbar.prototype._instance = this;

  var $ADDONS_MENU = $('#addons-list');
  var $TOOLS_MENU = $('#tools-list');
  var $MENU_LI = $('<li />');
  var $MENU_A = $('<a href="#"/>');

  var $body = $('body');
  var $edit = $('#edit');
  var $navbar = $('#navbar');

  var clearFunction = null;

  appcache.registerOnlineEventListener(function () {
    $('a[href^="http"]').parent('li').removeClass('disabled');
  });

  appcache.registerOfflineEventListener(function () {
    $('a[href^="http"]').parent('li').addClass('disabled');
  });

  function prepareCpanel() {
    function editMode() {
      var currentState = $('#edit').hasClass('active');
      setEditMode(!currentState);
    }

    function clear() {
      if (clearFunction) {
        clearFunction();
      }
      return false;
    }

    function goBack() {
      if ('history' in window && 'back' in window.history) {
        window.history.back();
      }
    }

    function goForward() {
      if ('history' in window && 'forward' in window.history) {
        window.history.forward();
      }
    }

    functions.bindButton('#navigation-back', goBack);
    functions.bindButton('#navigation-forward', goForward);

    functions.bindButton('#edit', editMode);
    functions.bindButton('#clear', clear);

    $(window).resize(refreshNavbarMargin);
    refreshNavbarMargin();
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
  function setEditMode(mode) {
    if (mode === true) {
      $body.addClass('edit-mode');
      $edit.addClass('active');
      hideOrShow('show');
    }
    else {
      $body.removeClass('edit-mode');
      $edit.removeClass('active');
      hideOrShow('hide');
    }
    $edit.blur();
    refreshNavbarMargin();
  }

  function refreshNavbarMargin() {
    var height = $navbar.height();
    $body.css('margin-top', height);
  }

  /**
   * Hide or show the empty title input elements. Make the title input element read-only in the case of hiding.
   *
   * @method
   * @name module:toolbar.hideOrShow
   * @param {string}
   *          action Choose action by using <code>show</code> or <code>hide</code> as the value.
   */
  function hideOrShow(action) {
    $('#title').each(function () {
      var $element = $(this);
      if ($element.val() === '') {
        $element[action]();
      }
    });
  }

  /**
   * Register a member in the addons menu.
   * <p>
   * The registered function will be provided the <code>LI</code> and <code>A</code> element going into the menu,
   * both wrapped as jQuery objects. Manipulate the menu elements as needed. Something along the lines of:
   *
   * <pre><code>
   * </code></pre>
   *
   * @method
   * @name module:toolbar.registerAddonsMenuMember
   * @param {Function}
   *          menuMember The menu member function to register.
   */
  function registerAddonsMenuMember(menuMember) {
    registerMenuMember($ADDONS_MENU, menuMember);
  }

  /**
   * Register a member in the tools menu.
   * <p>
   * The registered function will be provided the <code>LI</code> and <code>A</code> element going into the menu,
   * both wrapped as jQuery objects. Manipulate the menu elements as needed. Something along the lines of:
   *
   * <pre><code>
   * </code></pre>
   *
   * @method
   * @name module:toolbar.registerAddonsMenuMember
   * @param {Function}
   *          menuMember The menu member function to register.
   */
  function registerToolsMenuMember(menuMember) {
    registerMenuMember($TOOLS_MENU, menuMember);
  }

  function registerMenuMember($menu, menuMember) {
    var $menuLi = $MENU_LI.clone();
    var $menuA = $MENU_A.clone();
    menuMember($menuLi, $menuA);
    $menuLi.append($menuA);
    $menu.append($menuLi);
  }

  /**
   * Set clear function.
   * <p>
   * This was introduced to fix circular dependencies.
   *
   * @method
   * @name module:toolbar.setClearFunction
   * @param {Function}
   *          func The function to call to perform a clear operation.
   */
  function setClearFunction(func) {
    clearFunction = func;
  }

  return {
    'hideOrShow': hideOrShow,
    'setEditMode': setEditMode,
    'registerAddonsMenuMember': registerAddonsMenuMember,
    'registerToolsMenuMember': registerToolsMenuMember,
    'setClearFunction': setClearFunction
  };
}

define('toolbar', [ 'jquery', 'functions', 'appcache' ], function ($, functions, appcache) {
  'use strict';
  return new Toolbar($, functions, appcache);
});
