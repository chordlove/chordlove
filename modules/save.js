function Save( plugins )
{
  'use strict';
  if ( Save.prototype._instance )
  {
    return Save.prototype._instance;
  }
  Save.prototype._instance = this;

  var previousHash = "";

  var textChangeListeners = [];
  var structureChangeListeners = [];

  function addTextChangeListener( listener )
  {
    textChangeListeners.push( listener );
  }

  function addStructureChangeListener( listener )
  {
    structureChangeListeners.push( listener );
  }

  function changedText( event )
  {
    for ( var i = 0; i < textChangeListeners.length; i++ )
    {
      textChangeListeners[i]( event );
    }
    writeUri();
  }

  function changedStructure( event )
  {
    for ( var i = 0; i < structureChangeListeners.length; i++ )
    {
      structureChangeListeners[i]( event );
    }
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
    "addTextChangeListener" : addTextChangeListener,
    "addStructureChangeListener" : addStructureChangeListener,
    "changedText" : changedText,
    "changedStructure" : changedStructure
  };
}

define( "save", [ "plugins" ], function( plugins )
{
  'use strict';
  return new Save( plugins );
} );
