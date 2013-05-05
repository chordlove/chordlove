function Title( $, plugins, save, functions )
{
  if ( Title.prototype._instance )
  {
    return Title.prototype._instance;
  }
  Title.prototype._instance = this;

  var PLUGIN_ID = '00';
  var DEFAULT_FORMAT = '0';
  var SITE_TITLE = 'Chordlove.com';

  var format = DEFAULT_FORMAT;
  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = functions.decode( inputData );
  }

  function update()
  {
    setPageTitle( data );
    $( '#title' ).val( data );
  }

  function serialize()
  {
    return PLUGIN_ID + DEFAULT_FORMAT + getTitle();
  }

  function getTitle()
  {
    return functions.encode( $( '#title' ).val() );
  }

  $( '#title' ).keydown( function( event )
  {
    if ( event.which === 13 || event.which === 9 )
    {
      event.preventDefault();
      $( this ).blur();
      $( '#share' ).focus();
      var title = sanitizedTitle();
      setPageTitle( title );
    }
  } ).change( function()
  {
    save.changedText( 'title' );
  } );

  function setPageTitle( title )
  {
    if ( title )
    {
      window.document.title = title + ' - ' + SITE_TITLE;
    }
    else
    {
      window.document.title = SITE_TITLE;
    }
  }

  return {
    'update' : update,
    'serialize' : serialize,
    'setData' : setData
  };
}

define( 'title', [ 'plugins', 'jquery', 'save', 'functions' ], function( plugins, $, save, functions )
{
  plugins.register( new plugins.PluginInfo( {
    'name' : 'title',
    'instance' : new Title( $, plugins, save, functions ),
    'alwaysRun' : true,
    'serialize' : true
  } ) );
} );
