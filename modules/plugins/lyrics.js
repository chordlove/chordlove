function Lyrics( $, functions, save, toolbar, resizer, plugins )
{
  'use strict';
  if ( Lyrics.prototype._instance )
  {
    return Lyrics.prototype._instance;
  }
  Lyrics.prototype._instance = this;

  var PLUGIN_ID = '02', DEFAULT_FORMAT = 0;
  var data = null;
  var format = DEFAULT_FORMAT;

  var PARENT = $( '#items' );
  var VIEW_BUTTON = $( '#view-lyrics' );

  plugins.exec( 'chords', function( chords )
  {
    chords.registerContentExtractor( extract );
  } );

  var visibleText = false;
  var hasText = false;

  functions.bindButton( '#view-lyrics', visibleLyrics );

  save.addStructureChangeListener( addTextInput );

  function visibleLyrics()
  {
    if ( visibleText )
    {
      PARENT.removeClass( 'has-text' );
      VIEW_BUTTON.removeClass( 'active' );
      visibleText = false;
      return;
    }
    else
    {
      PARENT.addClass( 'has-text' );
      if ( !hasText )
      {
        hasText = true;
        addTextInput();
      }
      visibleText = true;
      VIEW_BUTTON.addClass( 'active' );
    }
  }

  function getLyrics( item )
  {
    return $( 'input.song-text', item ).val();
  }

  function setLyrics( item, text )
  {
    $( 'input.song-text', item ).val( text );
  }

  function extract( item )
  {
    var text = getLyrics( item );
    return function( theItem )
    {
      if ( typeof text !== 'undefined' )
      {
        setLyrics( theItem, text );
      }
    };
  }

  function addTextInput()
  {
    if ( !hasText )
    {
      return;
    }
    $( 'div.chord input.chord-text' )
        .each(
            function()
            {
              var chordInput = $( this );
              var wrapper = chordInput.parents( 'li.item' ).first();
              if ( chordInput.siblings( 'input.song-text' ).length > 0 )
              {
                return;
              }
              var textInput = $( '<input class="song-text resize-trigger" type="text" id="song-text" title="Add song text" placeholder="Text…" />' );
              textInput.appendTo( chordInput.parent() ).keydown( functions.handleInputKeyEvent ).blur( {
                'item' : wrapper
              }, function( event )
              {
                save.changedText( event );
              } );
              resizer.prepareResize( wrapper );
            } );
  }

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function render()
  {
    var lyrics = functions.readStringArray( {
      'data' : data,
      'countSize' : 1
    } ).array;
    hasText = true;
    visibleText = true;
    PARENT.addClass( 'has-text' );
    VIEW_BUTTON.addClass( 'active' );
    addTextInput();
    $( '#items > li.item' ).each( function()
    {
      setLyrics( this, lyrics.shift() );
    } );
  }

  function serialize()
  {
    var result = '';
    if ( hasText )
    {
      result += PLUGIN_ID + DEFAULT_FORMAT;
      var items = [];
      $( '#items > li.item' ).each( function()
      {
        items.push( getLyrics( this ) );
      } );
      result += functions.writeStringArray( {
        'items' : items
      } );
      if ( result.length < 4 )
      {
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

define( 'lyrics', [ 'plugins', 'jquery', 'functions', 'save', 'toolbar', 'resizer' ], function( plugins, $, functions,
    save, toolbar, resizer )
{
  'use strict';
  var instance = new Lyrics( $, functions, save, toolbar, resizer, plugins );
  plugins.register( {
    'name' : 'lyrics',
    'instance' : instance,
    'render' : false,
    'serialize' : true,
    'config' : [ {
      'plugin' : 'chords',
      'method' : 'addPostRenderer',
      'args' : [ instance.render ]
    } ]
  } );
} );
