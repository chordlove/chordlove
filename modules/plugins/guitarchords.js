/* 
 * Chordlove is a tool for sharing song chords and guitarchords.
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
 * Module to add guitarchords to the chord items. Hooks into the {@link module:plugins/chords} module to get rendering
 * executed and adds its own copy/paste extractor as well.
 * 
 * @module plugins/guitar-chords
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires plugins
 */

function GuitarChords( $, functions, share, toolbar, resizer, plugins )
{
  'use strict';
  if ( GuitarChords.prototype._instance )
  {
    return GuitarChords.prototype._instance;
  }
  GuitarChords.prototype._instance = this;

  var PLUGIN_ID = '07', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  /**
   * @method
   * @name module:plugins/guitarchords.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/guitarchords.render
   */
  function render()
  {
    if ( data === null )
    {
      return;
    }
  }

  /**
   * @method
   * @name module:plugins/guitarchords.serialize
   */
  function serialize()
  {
    var result = '';
    return result;
  }

  function clear()
  {
    // not yet
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'clear' : clear
  };
}

define( 'plugins/guitarchords', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer', 'plugins/chords' ],
    function( plugins, $, functions, share, toolbar, resizer, chords )
    {
      'use strict';
      var instance = new GuitarChords( $, functions, share, toolbar, resizer, plugins );
      chords.addPostRenderer( instance.render );
      plugins.register( {
        'name' : 'guitarchords',
        'instance' : instance,
        'render' : false,
        'serialize' : true
      } );
      return instance;
    } );
