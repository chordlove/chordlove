function Toolbar( $, functions, share )
{
  'use strict';
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
      share.changedStructure( "toolbar/delete" );
    }

    var copiedItems = [];

    function cutItems()
    {
      copyItems();
      getSelectedItems().remove();
      share.changedStructure( "toolbar/cut" );
    }

    function copyItems()
    {
      copiedItems = [];
      getSelectedItems().each( function()
      {
        copiedItems.push( chords.getExtracts( this ) );
      } );
    }

    function pasteItems()
    {
      $( copiedItems ).each( function()
      {
        chords.createFromExtracts( this );
      } );
      share.changedStructure( "toolbar/paste" );
      $( "li.ui-selected", PARENT ).removeClass( "ui-selected" );
    }

    function editMode()
    {
      var currentState = $( '#edit' ).hasClass( 'active' );
      setEditMode( !currentState );
    }

    function clear()
    {
      PARENT.empty();
      PARENT.removeClass( 'has-text' );
      $( '#title' ).val( '' ).focus();
      share.changedStructure( "toolbar/clear" );
      return false;
    }

    bindButton( "#cut", cutItems );
    bindButton( "#copy", copyItems );
    bindButton( "#paste", pasteItems );
    bindButton( "#delete", deleteItems );
    bindButton( "#edit", editMode );
    bindButton( "#clear", clear );

    $( '#time-signature' ).change( function()
    {
      share.changedStructure( "toolbar/timesignature" );
    } );
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

define( "toolbar", [ "jquery", "functions", "share" ], function( $, functions, share )
{
  'use strict';
  return new Toolbar( $, functions, share );
} );
