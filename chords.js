$( function()
{
  $.ajaxSetup( {
    cache : true
  } );
  var keysSharp = [ "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" ], keysFlat = [ "C", "D♭", "D",
      "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B" ], modes = [ "Ionian", "Dorian", "Phrygian", "Lydian",
      "Mixolydian", "Aeolian", "Locrian" ], modeIntervals = [ 0, 2, 4, 5, 7, 9, 11 ];
  var keys = keysFlat;

  var SHARP = true, FLAT = false;

  function setOptions(select, collection, transformer)
  {
    var selected = select[0].selectedIndex;
    if ( selected === -1 )
    {
      selected = 0;
    }
    select.empty();
    $( collection ).each( function(index, value)
    {
      if ( typeof ( transformer ) === "function" )
      {
        value = transformer( index, value );
      }
      $( "<option />" ).attr( "value", index ).text( value ).appendTo( select );
    } );
    select.val( selected );
  }

  function setEquivalentOptions(select, keyIndex, modeIndex)
  {
    setOptions( select, modes, function(index, value)
    {
      var interval = modeIntervals[index] - modeIntervals[modeIndex] + keyIndex + 12;
      interval %= 12;
      return value + " " + keys[interval];
    } );
  }

  function createItem(status)
  {
    if ( status.length === 3 )
    {
      createChord( status );
    }
    else
    {
      var wrapper = createWrapper( "symbol" ).append( status );
      var getStatus = function()
      {
        return status;
      };
      wrapper[0]["getStatus"] = getStatus;
    }
  }

  function createWrapper(className)
  {
    var parent = $( "#items" );
    var wrapper = $( "<li class='ui-corner-all ui-widget-content'/>" ).addClass( className ).append(
        "<div class='handle ui-corner-tl ui-corner-bl'><span class='ui-icon ui-icon-arrow-4'></span></div>" );
    wrapper.appendTo( parent );
    return wrapper;
  }

  function createChord(status)
  {
    var wrapper = createWrapper( "item" );
    var key = $( "<select class='key'/>" );
    key.appendTo( wrapper );
    var mode = $( "<select class='mode'/>" );
    mode.appendTo( wrapper );
    setOptions( mode, modes );
    var equivalent = $( "<select class='equivalent'/>" );
    equivalent.appendTo( wrapper );

    function update()
    {
      setOptions( key, keys );
      setEquivalentOptions( equivalent, $( key )[0].selectedIndex, $( mode )[0].selectedIndex );
    }
    update();
    key.change( update );
    mode.change( update );

    var getStatus = function()
    {
      return Number( $( key )[0].selectedIndex ).toString( 16 ) + $( mode )[0].selectedIndex
          + $( equivalent )[0].selectedIndex;
    };

    var setStatus = function(status)
    {
      $( key ).val( parseInt( status.charAt( 0 ), 16 ) );
      $( mode ).val( status.charAt( 1 ) );
      update();
      $( equivalent ).val( status.charAt( 2 ) );
    };

    if ( typeof ( status ) === "string" && status.length === 3 )
    {
      setStatus( status );
    }

    wrapper[0]["update"] = update;
    wrapper[0]["getStatus"] = getStatus;
    wrapper[0]["setStatus"] = setStatus;
  }

  function prepareCpanel(parent)
  {
    function bindButton(selector, func)
    {
      return $( selector ).click( function()
      {
        func();
      } );
    }

    function addBar()
    {
      createItem( "|" );
    }

    function addDash()
    {
      createItem( "—" );
    }

    function getSelectedItems()
    {
      return $( "#items li.ui-selected" );
    }

    function deleteItems()
    {
      getSelectedItems().remove();
    }

    var copiedItems = [];

    function cutItems()
    {
      copyItems();
      deleteItems();
    }

    function copyItems()
    {
      copiedItems = [];
      getSelectedItems().each( function()
      {
        copiedItems.push( this.getStatus() );
      } );
    }

    function pasteItems()
    {
      $( copiedItems ).each( function(ix, value)
      {
        createItem( value );
      } );
    }

    bindButton( "#add-chord", createChord );
    bindButton( "#add-bar", addBar );
    bindButton( "#add-dash", addDash );
    bindButton( "#cut", cutItems );
    bindButton( "#copy", copyItems );
    bindButton( "#paste", pasteItems );
    bindButton( "#delete", deleteItems );

    function sharpFlatChange(mode)
    {
      keys = mode.data === FLAT ? keysFlat : keysSharp;
      $( ".item" ).each( function()
      {
        this.update();
      } );
    }

    $( "#sharp" ).click( SHARP, sharpFlatChange );
    $( "#flat" ).click( FLAT, sharpFlatChange );

    $( "#save" ).click( function()
    {
      var status = "";
      $( "#items li" ).each( function()
      {
        status += this.getStatus();
      } );
      var hash = "#" + encodeURIComponent( status );
      var title = $( "#title" ).val();
      if ( title.length > 0 )
      {
        hash += "?" + encodeURIComponent( title );
        window.document.title = title;
      }
      window.history.pushState( status, window.document.title, hash );
      setLink( hash );
      this.blur();
    } );
  }

  function setLink(hash)
  {
    var link = $( "#link" ).empty();
    $( '<a>', {
      text : 'link',
      title : 'Copy the link address to share this page.',
      href : hash.replace( "|", "%7C" ).replace( "—", "%E2%80%94" )
    } ).appendTo( link ).click( function()
    {
      window.location.assign( hash );
      $( window ).hashchange();
    } );
    link.children().focus();
    link.effect( "highlight", null, 2000 );
  }

  function initializeState()
  {
    $( "#items" ).empty();
    if ( window.location.hash.length <= 2 )
    {
      return;
    }
    var hash = decodeURIComponent( window.location.hash.substring( 1 ) );
    setLink( "#" + encodeURIComponent( hash ) );
    var pos = hash.indexOf( "?" );
    if ( pos !== -1 )
    {
      window.document.title = hash.substring( pos + 1 );
      $( "#title" ).val( window.document.title );
      hash = hash.substring( 0, pos );
    }
    var states = hash.match( /(\w{1,3}|\W)/g );
    $( states ).each( function()
    {
      createItem( this.toString() );
    } );
  }

  prepareCpanel( $( "#cpanel" ) );

  $( "#items" ).sortable( {
    "revert" : true,
    handle : ".handle"
  } ).selectable();

  $( window ).hashchange( function()
  {
    initializeState();
  } );

  $( window ).hashchange();

  $( "#title" ).keydown( function(event)
  {
    if ( event.which === 13 || event.which === 9 )
    {
      event.preventDefault();
      $( "#save" ).focus();
    }
  } );

  function PluginHandler()
  {
    var plugins = {};
    var loading = {};
    var undefined;

    function getPlugin(id, func)
    {
      // Run from plugin store if possible.
      if ( plugins[id] )
      {
        func( plugins[id] );
      }
      else
      {
        if ( typeof loading[id] !== "undefined" )
        {
          // Store function to execute after load.
          loading[id].push( func );
        }
        else
        {
          // Load script from file.
          loading[id] = [];
          var fileName = "plugins/" + id + ".js";
          $.getScript( fileName, function()
          {
            var fn = window["chords_" + id];
            if ( typeof fn === 'function' )
            {
              var instance = new fn();
              plugins[id] = instance;
              func( instance );
              for ( var i = 0, len = loading[id].length; i < len; i++ )
              {
                loading[id][i]( instance );
              }
              loading[id] = undefined;
            }
          } );
        }
      }
    }

    function runPluginUsingCallback(id, data)
    {
      getPlugin( id, function(plugin)
      {
        plugin.run( data );
      } );
    }
    this.runPlugin = runPluginUsingCallback;
  }

  var pluginHandler = new PluginHandler();
  pluginHandler.runPlugin( 0, 1 );
  pluginHandler.runPlugin( 0, 2 );
  pluginHandler.runPlugin( 0, 3 );
  pluginHandler.runPlugin( 0, 4 );
} );
