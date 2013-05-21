/**
 * Manages the song structure.
 * 
 * @module plugins/structure
 * @requires jquery
 * @requires share
 * @requires functions
 */

function Structure( $, share, functions )
{
  'use strict';
  if ( Structure.prototype._instance )
  {
    return Structure.prototype._instance;
  }
  Structure.prototype._instance = this;

  var PLUGIN_ID = '03';
  var DEFAULT_FORMAT = '0';

  var format = DEFAULT_FORMAT;
  var data = null;

  var $PARENT = $( '#items' );
  var MENU_START_OF_LINE = '<i class="icon-hand-left"></i> Put on new line (toggle)';

  /**
   * @method
   * @name module:plugins/structure.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/structure.render
   */
  function render()
  {
    setStructure( data );
  }

  /**
   * @method
   * @name module:plugins/structure.serialize
   */
  function serialize()
  {
    var result = PLUGIN_ID + DEFAULT_FORMAT + getStructure();
    if ( result.length < 4 )
    {
      result = '';
    }
    return result;
  }

  function getStructure()
  {
    var startOfLineItems = '';
    $PARENT.children( 'li.item' ).each( function( ix, li )
    {
      if ( $( li ).hasClass( 'start-of-line' ) )
      {
        var item = functions.getCharacters( ix, 2 );
        startOfLineItems += item;
      }
    } );
    var count = functions.getCharacters( startOfLineItems.length / 2, 1 );
    if ( count === '0' )
    {
      count = '';
    }
    return count + startOfLineItems;
  }

  function setStructure( input )
  {
    var startOfLineItems = functions.readChunkArray( {
      'data' : input,
      'chunkSize' : 2,
      'countSize' : 1
    } );
    var items = $PARENT.children( 'li.item' ).toArray();
    $.each( startOfLineItems, function()
    {
      var position = functions.getNumber( this );
      $( items[position] ).addClass( 'start-of-line' );
    } );
  }

  function startOfLineMenu( wrapper, li, a )
  {
    a.html( MENU_START_OF_LINE ).click( {
      'li' : wrapper
    }, function( event )
    {
      event.preventDefault();
      event.data.li.toggleClass( 'start-of-line' );
      share.changed();
    } );
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData,
    'startOfLineMenu' : startOfLineMenu
  };
}

define( 'structure', [ 'plugins', 'jquery', 'share', 'functions' ], function( plugins, $, share, functions )
{
  'use strict';
  var instance = new Structure( $, share, functions );
  plugins.register( {
    'name' : 'structure',
    'instance' : instance,
    'render' : false,
    'serialize' : true,
    'config' : [ {
      'plugin' : 'chords',
      'method' : 'addPostRenderer',
      'args' : [ instance.render ]
    }, {
      'plugin' : 'chords',
      'method' : 'registerChordMenuMember',
      'args' : [ instance.startOfLineMenu ]
    } ]
  } );
} );
