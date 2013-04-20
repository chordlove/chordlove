function PluginList()
{
  if ( PluginList.prototype._instance )
  {
    return PluginList.prototype._instance;
  }
  PluginList.prototype._instance = this;

  var list = [ "title", "chords" ];

  function getNameFromId( id )
  {
    return list[id];
  }

  return {
    "idToName" : getNameFromId
  };
}

define( "pluginlist", [], function()
{
  return new PluginList();
} );
