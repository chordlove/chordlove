function chords_title()
{
  var PLUGIN_ID = "00";
  var DEFAULT_FORMAT = "0";
  this.name = "Title plugin";

  this.run = function run( format, data )
  {
    window.document.title = data;
    $( "#title" ).val( data );
  };

  this.serialize = function()
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
}
