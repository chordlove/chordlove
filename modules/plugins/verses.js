/**
 * Module to add verses to the song. Hooks into the {@link module:plugins/chords} module to get rendering executed and
 * adds its own copy/paste extractor as well.
 * 
 * @module plugins/verses
 * @requires jquery
 * @requires functions
 * @requires share
 * @requires toolbar
 * @requires resizer
 * @requires plugins
 */

function Verses( $, functions, share, toolbar, resizer, plugins )
{
  'use strict';
  if ( Verses.prototype._instance )
  {
    return Verses.prototype._instance;
  }
  Verses.prototype._instance = this;

  var PLUGIN_ID = '04', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var PARENT = $( '#verses-items' );

  functions.bindButton( '#view-lyrics', visibleVerses );

  /**
   * @method
   * @name module:plugins/lyrics.setData
   */
  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  /**
   * @method
   * @name module:plugins/lyrics.render
   */
  function render()
  {
    var lyrics = functions.readStringArray( {
      'data' : data,
      'countSize' : 2
    } ).array;
    hasText = true;
    visibleText = true;
    PARENT.addClass( 'has-text' );
    VIEW_BUTTON.addClass( 'active' );
    addTextInput();
    $( '#items > li.item' ).each( function()
    {
      setVerses( this, lyrics.shift() );
    } );
  }

  /**
   * @method
   * @name module:plugins/lyrics.serialize
   */
  function serialize()
  {
    var result = '';
    if ( hasText )
    {
      result += PLUGIN_ID + DEFAULT_FORMAT;
      var items = [];
      $( '#items > li.item' ).each( function()
      {
        items.push( getVerses( this ) );
      } );
      result += functions.writeStringArray( {
        'items' : items,
        'countSize' : 2
      } );
      if ( result.length < 6 + items.length )
      {
        // all items have zero length
        result = '';
      }
    }
    return result;
  }

  return {
    'render' : render,
    'serialize' : serialize,
    'setData' : setData
  };
}

define( 'verses', [ 'plugins', 'jquery', 'functions', 'share', 'toolbar', 'resizer' ], function( plugins, $, functions,
    share, toolbar, resizer )
{
  'use strict';
  var instance = new Verses( $, functions, share, toolbar, resizer, plugins );
  plugins.register( {
    'name' : 'verses',
    'instance' : instance,
    'render' : true,
    'serialize' : true
  } );
} );
