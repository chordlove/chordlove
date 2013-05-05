function Lyrics( $, functions, save, toolbar, resizer )
{
  if ( Lyrics.prototype._instance )
  {
    return Lyrics.prototype._instance;
  }
  Lyrics.prototype._instance = this;

  var PLUGIN_ID = '02', DEFAULT_FORMAT = 0;

  var CONFIG = {
    CHORDS_COUNT_LENGTH : 1,
    CHORD_BEAT_COUNT_LENGTH : 1,
    CHORDITEMS_COUNT_LENGTH : 1,
    TEXTITEMS_COUNT_LENGTH : 1,
    TIME_SIGNATURE_LENGTH : 1,
    DEFAULT_TIME_SIGNATURE : 4
  };

  var PARENT = $( '#items' );
  var VIEW_BUTTON = $( '#view-lyrics' );

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

  var data = null;

  function setData( inputFormat, inputData )
  {
    format = inputFormat;
    data = inputData;
  }

  function render()
  {
  }

  function serialize()
  {
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
  plugins.register( new plugins.PluginInfo( {
    'name' : 'lyrics',
    'instance' : new Lyrics( $, functions, save, toolbar, resizer ),
    'render' : false,
    'serialize' : true
  } ) );
} );
