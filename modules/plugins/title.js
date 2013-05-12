function Title( $, plugins, save, functions )
{
  'use strict';
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

  function render()
  {
    setPageTitle( data );
    $( '#title' ).val( data );
  }

  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT + getTitle();
    if ( result.length < 4 )
    {
      result = '';
    }
    return result;
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
      setPageTitle( $( '#title' ).val() );
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
    'render' : render,
    'serialize' : serialize,
    'setData' : setData
  };
}

define( 'title', [ 'plugins', 'jquery', 'save', 'functions' ], function( plugins, $, save, functions )
{
  'use strict';
  plugins.register( {
    'name' : 'title',
    'instance' : new Title( $, plugins, save, functions ),
    'render' : true,
    'serialize' : true
  } );
} );
