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

  var list = [ 'title', 'chords', 'lyrics' ];

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
