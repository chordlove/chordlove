/* 
 * Chordlove is a tool for sharing song chords and lyrics.
 * Copyright (C) 2013-2014 NA Konsult AB
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Module to handle the tools menu. It contains a list of tools (including icon, menu text, plugin name and method to
 * execute), but not their code.
 * 
 * @module plugins/tools
 * @requires jquery
 * @requires functions
 * @requires toolbar
 * @requires plugins
 */

function Tools( $, toolbar, plugins )
{
  'use strict';
  if ( Tools.prototype._instance )
  {
    return Tools.prototype._instance;
  }
  Tools.prototype._instance = this;

  // var PLUGIN_ID = '06', DEFAULT_FORMAT = 0;

  var tools = [
      new ToolInfo( 'transpose', 'init', 'fa-arrows-v', 'Transpose song …', true ),
      new ToolInfo( 'structure', 'setBarBreaks', 'fa-th', 'Organize bars …', true ),
      new ToolInfo( 'export', 'init', 'fa-download', 'Export songs …', window.Blob && window.URL
          && window.URL.createObjectURL ),
      new ToolInfo( 'import', 'init', 'fa-upload', 'Import songs …', window.FileReader ) ];

  function ToolInfo( name, method, icon, text, test )
  {
    this.test = test;
    if ( !test )
    {
      return;
    }
    this.menuHtml = '<i class="fa fa-fw ' + icon + '"></i> ' + text;
    this.func = function( event )
    {
      event.preventDefault();
      plugins.exec( name, function( instance )
      {
        instance[method]();
      } );
    };
  }

  function load()
  {
    for ( var i = 0; i < tools.length; i++ )
    {
      if ( !tools[i].test )
      {
        continue;
      }
      toolbar.registerToolsMenuMember( function( $li, $a )
      {
        $a.html( tools[i].menuHtml ).click( tools[i].func );
      } );
    }
  }

  return {
    'load' : load
  };
}

define( 'plugins/tools', [ 'plugins', 'jquery', 'toolbar', ], function( plugins, $, toolbar )
{
  'use strict';
  var instance = new Tools( $, toolbar, plugins );
  plugins.register( {
    'name' : 'tools',
    'instance' : instance,
    'render' : false,
    'serialize' : false
  } );
  instance.load();
  return instance;
} );