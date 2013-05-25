/* 
 * Chordlove is a tool for sharing song chords and verses.
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
 * Module to add verses to the song. Hooks into the {@link module:plugins/chords} module to get rendering executed and
 * adds its own copy/paste extractor as well.
 * 
 * @module plugins/verses
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires plugins
 */

function Verses( $, functions, share, toolbar, resizer, plugins )
{
  'use strict';
  if ( Verses.prototype._instance )
  {
    return Verses.prototype._instance;
  }
  Verses.prototype._instance = this;

  var PLUGIN_ID = '04', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var PARENT = $( '#verses-items' );

  /**
   * @method
   * @name module:plugins/verses.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/verses.render
   */
  function render()
  {
  }

  /**
   * @method
   * @name module:plugins/verses.serialize
   */
  function serialize()
  {
    var result = '';
    return result;
  }

  function load()
  {
    console.log( 'LOADING!' );
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'load' : load
  };
}

define( 'plugins/verses', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer' ], function( plugins, $,
    functions, share, toolbar, resizer )
{
  'use strict';
  var instance = new Verses( $, functions, share, toolbar, resizer, plugins );
  plugins.register( {
    'name' : 'verses',
    'instance' : instance,
    'render' : true,
    'serialize' : true
  } );
  return instance;
} );
