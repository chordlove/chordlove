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

  this.data = function()
  {
    return {
      "title" : sanitizedTitle()
    };
  };

  function sanitizedTitle()
  {
    return $( "#title" ).val().replace( "_", "-" );
  }

  $( "#save" ).click( function()
  {
    var status = window.chords.getHash();
    var hash = "#" + encodeURIComponent( status );
    window.history.pushState( status, window.document.title, hash );
    setLink( hash );
    this.blur();
    console.log(plugins.serialize());
  } );

  function setLink( hash )
  {
    var href = hash.replace( "|", "%7C" ).replace( "—", "%E2%80%94" );
    var link = $( "#link" ).empty();
    var a = $( '<a>', {
      'title' : 'Copy the link address to share this page.',
      'href' : href,
      'class' : 'btn'
    } );
    a.append( '<i class="icon-link"> </i>' );
    a.appendTo( link ).click( function()
    {
      window.location.assign( hash );
      $( window ).hashchange();
    } );
    link.children().focus();
    a.effect( "highlight", null, 2000 );
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
