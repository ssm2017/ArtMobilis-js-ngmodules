/**
 * @class markerFactory
 * @memberOf angular_module.dataLoading
 */

angular.module('dataLoading')

.factory('markerFactory', ['dataArrayFactory', function(dataArrayFactory) {

  /**
   * @typedef {object} Marker
   * @property {value} uuid
   * @property {string} name
   * @property {string} type - 'img' or 'tag'
   * @property {string} url - url of the image
   * @property {number} tag_id - 0 - 1023 - necessary if type == "tag"
   */

  function GetFilename(path) {
    if (path)
      return path.split('/').pop().split('\\').pop();
  }

  function toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      type: this.type,
      url: AMTHREE.ASSET_PATH + AMTHREE.IMAGE_PATH + GetFilename(this.url),
      tag_id: this.tag_id
    };
  }

  function Create(id, name, type, url, tag_id) {
    if (typeof id === 'undefined')
      return;

    var marker = {
      uuid: id,
      name: name || 'unnamed marker',
      type: type || 'img',
      url: url || '',
      tag_id: tag_id,
      toJSON: toJSON
    };

    return marker;
  }

  function Load(url) {
    return new Promise(function(resolve, reject) {

      var loader = new AM.JsonLoader();

      loader.Load(url, function() {
        Parse(loader.json).then(resolve, reject);
      }, function() {
        reject('failed to load marker: ' + url);
      });

    });
  }

  function Parse(json) {
    return new Promise(function(resolve, reject) {
      if (typeof json === 'object') {
        var result = Create(json.uuid, json.name, json.type, json.url, json.tag_id);
        if (result)
          resolve(result);
        else
          reject('failed to create marker: id undefined');
      }
      else
        reject('failed to parse marker json: not an object');
    });
  }

  var LoadArray = function(url) { return dataArrayFactory.Load(url, Parse); };
  var ParseArray = function(json) { return dataArrayFactory.Parse(json, Parse); };

  return {
    Create: Create,
    Load: Load,
    Parse: Parse,
    LoadArray: LoadArray,
    ParseArray: ParseArray
  };


}]);