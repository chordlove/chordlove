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
 * Module to add addons to the song. Hooks into the {@link module:plugins/chords} module to get rendering executed and
 * adds its own copy/paste extractor as well.
 * 
 * @module plugins/addons
 * @requires jquery
 * @requires functions
 * @requires toolbar
 * @requires plugins
 */

function Addons( $, toolbar, plugins )
{
  'use strict';
  if ( Addons.prototype._instance )
  {
    return Addons.prototype._instance;
  }
  Addons.prototype._instance = this;

  // var PLUGIN_ID = '05', DEFAULT_FORMAT = 0;

  var addons = [ new AddonInfo( 'verses', 'fa-align-left', 'Add more verses' ),
      new AddonInfo( 'guitarchords', 'fa-table', 'Show guitar chords' ),
      new AddonInfo( 'embed', 'fa-link', 'Add content from link' ) ];

  function AddonInfo( name, icon, text )
  {
    this.menuHtml = '<i class="fa ' + icon + '"></i> ' + text;
    this.func = function( event )
    {
      event.preventDefault();
      plugins.exec( name, function( instance )
      {
        instance.load();
      } );
    };
  }

  function load()
  {
    for ( var i = 0; i < addons.length; i++ )
    {
      toolbar.registerAddonsMenuMember( function( $li, $a )
      {
        $a.html( addons[i].menuHtml ).click( addons[i].func );
      } );
    }
  }

  return {
    'load' : load
  };
}

define( 'plugins/addons', [ 'plugins', 'jquery', 'toolbar', ], function( plugins, $, toolbar )
{
  'use strict';
  var instance = new Addons( $, toolbar, plugins );
  plugins.register( {
    'name' : 'addons',
    'instance' : instance,
    'render' : false,
    'serialize' : false
  } );
  instance.load();
  return instance;
} );