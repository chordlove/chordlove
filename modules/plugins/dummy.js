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
function Dummy() {
  'use strict';
  if (Dummy.prototype._instance) {
    return Dummy.prototype._instance;
  }
  Dummy.prototype._instance = this;

  function blah() {
    return "new dummy text";
  }

  function serialize() {
    return "0serialized-dummy";
  }

  function setData(format, data) {
    console.log("dummy data", format, data);
  }

  return {
    "bleh": blah,
    "serialize": serialize,
    "setData": setData
  };
}

define("dummy", [ "plugins" ], function (plugins) {
  'use strict';
  plugins.register({
    "name": "dummy",
    "instance": new Dummy(),
    "alywaysRun": true,
    "serialize": true
  });
});
