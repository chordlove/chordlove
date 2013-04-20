function Dummy()
{
  if ( Dummy.prototype._instance )
  {
    return Dummy.prototype._instance;
  }
  Dummy.prototype._instance = this;

  function blah()
  {
    return "new dummy text";
  }

  function serialize()
  {
    return "0serialized-dummy";
  }

  function setData( format, data )
  {
    console.log( "dummy data", format, data );
  }

  return {
    "bleh" : blah,
    "serialize" : serialize,
    "setData" : setData
  };
}

define( "dummy", [ "plugins" ], function( plugins )
{
  plugins.register( new plugins.PluginInfo( {
    "name" : "dummy",
    "instance" : new Dummy(),
    "alywaysRun" : true,
    "serialize" : true
  } ) );
} );
