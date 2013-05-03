function Toolbar( $, functions, save )
{
  if ( Toolbar.prototype._instance )
  {
    return Toolbar.prototype._instance;
  }
  Toolbar.prototype._instance = this;

  var PARENT = $( '#items' );
  var chords = null;

  function registerChordsModule( chordsModule )
  {
    chords = chordsModule;
  }

  function prepareCpanel()
  {
    // TODO this is a backwards compat hack.
    var bindButton = functions.bindButton;

    function getSelectedItems()
    {
      return $( "li.ui-selected", PARENT );
    }

    function deleteItems()
    {
      getSelectedItems().remove();
      save.changed();
    }

    var copiedItems = [];

    function cutItems()
    {
      copyItems();
      deleteItems();
      save.changed();
    }

    function copyItems()
    {
      copiedItems = [];
      getSelectedItems().each( function()
      {
        copiedItems.push( chords.getChordData( this ) );
      } );
    }

    function pasteItems()
    {
      $( copiedItems ).each( function()
      {
        chords.createItem( this );
      } );
      save.changed();
    }

    function editMode()
    {
      var currentState = $( '#edit' ).hasClass( 'active' );
      setEditMode( !currentState );
    }

    function clearAll()
    {
      PARENT.empty();
      $( '#title' ).val( '' ).focus();
      save.changed();
      return false;
    }

    bindButton( "#cut", cutItems );
    bindButton( "#copy", copyItems );
    bindButton( "#paste", pasteItems );
    bindButton( "#delete", deleteItems );
    bindButton( "#edit", editMode );
    bindButton( "#clear", clearAll );
  }

  prepareCpanel();

  function setEditMode( mode )
  {
    if ( mode === true )
    {
      $( 'body' ).addClass( 'edit-mode' );
      $( '#edit' ).addClass( 'active' );
      hideOrShow( "show" );
    }
    else
    {
      $( 'body' ).removeClass( 'edit-mode' );
      $( '#edit' ).removeClass( 'active' );
      hideOrShow( "hide" );
    }
  }

  function hideOrShow( action )
  {
    $( '#items input, #title' ).each( function()
    {
      var element = $( this );
      if ( element.val() === "" )
      {
        element[action]();
      }
      else
      {
        element.prop( 'readonly', action === "hide" );
      }
    } );
  }

  return {
    "hideOrShow" : hideOrShow,
    "setEditMode" : setEditMode,
    "registerChordsModule" : registerChordsModule
  };
}

define( "toolbar", [ "jquery", "functions", "save" ], function( $, functions, save )
{
  return new Toolbar( $, functions, save );
} );
