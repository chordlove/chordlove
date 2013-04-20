function Title( $, plugins )
{
  if ( Title.prototype._instance )
  {
    return Title.prototype._instance;
  }
  Title.prototype._instance = this;

  var PLUGIN_ID = "00";
  var DEFAULT_FORMAT = "0";

  var format = DEFAULT_FORMAT;
  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function update( inputFormat, inputData )
  {
    if ( inputFormat )
    {
      format = inputFormat;
    }
    if ( inputData )
    {
      data = inputData;
    }
    window.document.title = data;
    $( "#title" ).val( data );
  }

  function serialize()
  {
    return PLUGIN_ID + DEFAULT_FORMAT + sanitizedTitle();
  };

  function sanitizedTitle()
  {
    return $( "#title" ).val().replace( "_", "-" );
  }

  $( "#title" ).keydown( function( event )
  {
    if ( event.which === 13 || event.which === 9 )
    {
      event.preventDefault();
      $( this ).blur();
      $( "#save" ).focus();
    }
  } );

  return {
    "update" : update,
    "serialize" : serialize,
    "setData" : setData
  };
}

define( "title", [ "plugins", "jquery" ], function( plugins, $ )
{
  plugins.register( new plugins.PluginInfo( {
    "name" : "title",
    "instance" : new Title( $, plugins ),
    "alwaysRun" : true,
    "serialize" : true
  } ) );
} );
