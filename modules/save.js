function Save( plugins )
{
  if ( Save.prototype._instance )
  {
    return Save.prototype._instance;
  }
  Save.prototype._instance = this;

  var previousHash = "";

  function changed()
  {
    writeUri();
  }

  $( "#share-url" ).click( function()
  {
    this.select();
  } );

  $( "#share" ).click( function()
  {
    var href = window.location.href.replace( "|", "%7C" ).replace( "—", "%E2%80%94" );
    this.blur();
    $( "#share-url" ).val( href );
    $( "#share-form" ).modal().on( 'shown', function()
    {
      $( "#share-url" ).select();
    } );
  } );

  function writeUri()
  {
    var status = plugins.serialize();
    var hash = "#" + encodeURIComponent( status );
    if ( hash !== previousHash )
    {
      window.history.pushState( status, window.document.title, hash );
      previousHash = hash;
    }
  }

  return {
    "changed" : changed
  };
}

define( "save", [ "plugins" ], function( plugins )
{
  return new Save( plugins );
} );
