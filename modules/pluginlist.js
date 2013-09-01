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
 * Maps plugin id:s to plugin names.
 * 
 * @module pluginlist
 */
function PluginList()
{
  'use strict';
  if ( PluginList.prototype._instance )
  {
    return PluginList.prototype._instance;
  }
  PluginList.prototype._instance = this;

  var list = [ 'title', 'chords', 'lyrics', 'structure', 'verses', 'addons', 'tools', 'guitarchords', 'export',
      'import', 'embed' ];

  /**
   * Get plugin name from id.
   * 
   * @method
   * @name module:pluginlist.idToName
   * @param {integer}
   *          id The id to map.
   * @returns {string} The corresponding plugin name.
   */
  function idToName( id )
  {
    return list[id];
  }

  return {
    'idToName' : idToName
  };
}

define( 'pluginlist', [], function()
{
  'use strict';
  return new PluginList();
} );
