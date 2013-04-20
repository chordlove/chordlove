function Title( $, plugins )
{
  if ( Title.prototype._instance )
  {
    return Title.prototype._instance;
  }
  Title.prototype._instance = this;

  var PLUGIN_ID = "00";
  var DEFAULT_FORMAT = "0";
  var SITE_TITLE = "Chordlove.com";

  var format = DEFAULT_FORMAT;
  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function update()
  {
    setPageTitle( data );
    $( "#title" ).val( data );
  }

  function serialize()
  {
    return PLUGIN_ID + DEFAULT_FORMAT + sanitizedTitle();
  }
  ;

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
      var title = sanitizedTitle();
      setPageTitle( title );
    }
  } );

  function setPageTitle( title )
  {
    if ( title )
    {
      window.document.title = title + " - " + SITE_TITLE;
    }
    else
    {
      window.document.title = SITE_TITLE;
    }
  }

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
