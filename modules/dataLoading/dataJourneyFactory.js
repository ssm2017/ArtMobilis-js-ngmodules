/**
 * @class dataJourneyFactory
 * @memberOf angular_module.dataLoading
 */
//

angular.module('dataLoading')

.factory('dataJourneyFactory', ['markerFactory', 'contentFactory',
  'channelFactory', 'poiFactory', 'journeyFactory', 'dataArrayFactory', 'objectFactory',
  function(markerFactory, contentFactory, channelFactory,
    poiFactory, journeyFactory, dataArrayFactory, objectFactory) {


  /**
  * @typedef {object} DataJourney
  * @property {Journey} journey
  * @property {Object.<POI>} pois
  * @property {Object.<Channel>} channels
  * @property {Object.<Marker>} markers
  * @property {Object.<Content>} contents
  * @property {Object.<THREE.Object3D>} objects
  */

  /*
  * A string, id of a data type
  * @typedef {('data_journey'|'journey'|'poi'|'poi_array'|'channel'|'channel_array'|'marker'|'marker_array'|'content'|'content_array'|'object'|'object_array')} DataType
  */

  var data_types = [
  'data_journey',
  'journey',
  'poi',
  'poi_array',
  'channel',
  'channel_array',
  'marker',
  'marker_array',
  'content',
  'content_array',
  'object',
  'object_array'
  ]


  function ArraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function ObjectToArray(obj) {
    var ar = [];

    for (key in obj)
      ar.push(obj[key]);

    return ar;
  }

  function InsertArrayToObject(obj, arr) {
    if (arr) {
      for (var i = 0, c = arr.length; i < c; ++i) {
        var elem = arr[i];
        obj[elem.uuid] = elem;
      }
    }
  }

  function Concat(dst, src) {
    for (key in src) {
      dst[key] = src[key];
    }
  }

  function DeleteMetadata(object) {
    for (var key in object) {
      delete object[key].metadata;
    }
  }

  function TraverseObject3DArrayJson(array, fun) {
    if (!array)
      return;

    for (var i = 0; i < array.length; ++i) {
      fun(array[i]);
      TraverseObject3DArrayJson(array[i].children, fun);
    }
  }

  function ObjectsToJson(objects) {
    var matrix4_identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    var meta = {
      geometries: {},
      materials : {},
      textures  : {},
      images    : {},
      videos    : {}
    }

    var object_jsons = [];

    for (id in objects) {
      var elem = objects[id];
      var json = elem.toJSON(meta);

      object_jsons.push(json.object);
    }


    TraverseObject3DArrayJson(object_jsons, function(object) {
      if (ArraysEqual(object.matrix, matrix4_identity))
        delete object.matrix;
    });
    DeleteMetadata(meta.geometries);
    DeleteMetadata(meta.materials);
    DeleteMetadata(meta.textures);
    DeleteMetadata(meta.images);

    return {
      objects:    object_jsons,
      geometries: ObjectToArray(meta.geometries),
      materials:  ObjectToArray(meta.materials),
      textures:   ObjectToArray(meta.textures),
      images:     ObjectToArray(meta.images),
      videos:     ObjectToArray(meta.videos),
      constants: {
        image_path: AMTHREE.IMAGE_PATH,
        model_path: AMTHREE.MODEL_PATH,
        video_path: AMTHREE.VIDEO_PATH,
        sound_path: AMTHREE.SOUND_PATH,
        asset_path: AMTHREE.ASSET_PATH
      }
    };
  }

  function toJSON() {
    return {
      journey:  this.journey,
      pois:     ObjectToArray(this.pois),
      channels: ObjectToArray(this.channels),
      markers:  ObjectToArray(this.markers),
      contents: ObjectToArray(this.contents),
      objects:  ObjectsToJson(this.objects),
    }
  }

  function Create() {
    return {
      journey:  journeyFactory.Create(),
      pois:     {},
      channels: {},
      markers:  {},
      contents: {},
      objects:  {},
      toJSON:   toJSON
    }
  }

  function Init(data_journey) {
    data_journey = data_journey || Create();

    if (!data_journey.pois)     data_journey.pois     = {};
    if (!data_journey.channels) data_journey.channels = {};
    if (!data_journey.markers)  data_journey.markers  = {};
    if (!data_journey.contents) data_journey.contents = {};
    if (!data_journey.objects)  data_journey.objects  = {};
    if (!data_journey.journey)  data_journey.journey  = journeyFactory.Create();
    if (!data_journey.toJSON)   data_journey.toJSON   = toJSON;

    return data_journey;
  }

  function InsertElem(elem, object) {
    object[elem.uuid] = elem;
  }

  function InsertArray(array, object) {
    for (var i = 0, c = array.length; i < c; ++i) {
      InsertElem(array[i], object);
    }
  }

  var insert_fctns = {};
  insert_fctns[data_types[0]]  = function(elem, data) { return elem; };
  insert_fctns[data_types[1]]  = function(elem, data) { data.journey = elem;              return data; };
  insert_fctns[data_types[2]]  = function(elem, data) { InsertElem (elem, data.pois);     return data; };
  insert_fctns[data_types[3]]  = function(elem, data) { InsertArray(elem, data.pois);     return data; };
  insert_fctns[data_types[4]]  = function(elem, data) { InsertElem (elem, data.channels); return data; };
  insert_fctns[data_types[5]]  = function(elem, data) { InsertArray(elem, data.channels); return data; };
  insert_fctns[data_types[6]]  = function(elem, data) { InsertElem (elem, data.markers);  return data; };
  insert_fctns[data_types[7]]  = function(elem, data) { InsertArray(elem, data.markers);  return data; };
  insert_fctns[data_types[8]]  = function(elem, data) { InsertElem (elem, data.contents); return data; };
  insert_fctns[data_types[9]]  = function(elem, data) { InsertArray(elem, data.contents); return data; };
  insert_fctns[data_types[10]] = function(elem, data) { InsertElem (elem, data.objects);  return data; };
  insert_fctns[data_types[11]] = function(elem, data) { InsertArray(elem, data.objects);  return data; };

  var load_fctns = {};
  load_fctns[data_types[0]]  = Load;
  load_fctns[data_types[1]]  = journeyFactory.Load;
  load_fctns[data_types[2]]  = poiFactory.Load;
  load_fctns[data_types[3]]  = poiFactory.LoadArray;
  load_fctns[data_types[4]]  = channelFactory.Load;
  load_fctns[data_types[5]]  = channelFactory.LoadArray;
  load_fctns[data_types[6]]  = markerFactory.Load;
  load_fctns[data_types[7]]  = markerFactory.LoadArray;
  load_fctns[data_types[8]]  = contentFactory.Load;
  load_fctns[data_types[9]]  = contentFactory.LoadArray;
  load_fctns[data_types[10]] = objectFactory.Load;
  load_fctns[data_types[11]] = objectFactory.LoadArray;

  var parse_fctns = {};
  parse_fctns[data_types[0]]  = Parse;
  parse_fctns[data_types[1]]  = journeyFactory.Parse;
  parse_fctns[data_types[2]]  = poiFactory.Parse;
  parse_fctns[data_types[3]]  = poiFactory.ParseArray;
  parse_fctns[data_types[4]]  = channelFactory.Parse;
  parse_fctns[data_types[5]]  = channelFactory.ParseArray;
  parse_fctns[data_types[6]]  = markerFactory.Parse;
  parse_fctns[data_types[7]]  = markerFactory.ParseArray;
  parse_fctns[data_types[8]]  = contentFactory.Parse;
  parse_fctns[data_types[9]]  = contentFactory.ParseArray;
  parse_fctns[data_types[10]] = objectFactory.Parse;
  parse_fctns[data_types[11]] = objectFactory.ParseArray;


  function LoadData(url, type, data_journey) {
    data_journey = Init(data_journey);

    var loader = load_fctns[type];
    if (loader) {
      var promise = loader(url).then(function(data) {

        data_journey = insert_fctns[type](data, data_journey);
        return data_journey;

      });

      return promise;
    }
    else
      return Promise.reject('failed to load data: unknown type ' + type);
  }

  function Load(url, data_journey) {
    return new Promise(function(resolve, reject) {

      var loader = new AM.JsonLoader();

      loader.Load(url, function() {
        Parse(loader.json, data_journey).then(resolve, reject);
      }, function() {
        reject('failed to load channel: ' + url);
      });

    });
  }

  function ParseData(json, type, data_journey) {
    data_journey = Init(data_journey);

    var parser = parse_fctns[type];
    if (parser) {
      var promise = parser(json).then(function(data) {

        data_journey = insert_fctns[type](data, data_journey);
        return data_journey;

      })
      return promise;
    }
    else
      return Promise.reject('failed to parse data: unknown type ' + type);
  }

  function Parse(json, data_journey) {
    data_journey = Init(data_journey);

    if (typeof json === 'object') {

      var promises = [];
      if (json.journey) {
        promises.push(journeyFactory.Parse(json.journey).then(function(journey) {
          data_journey.journey = journey;
        }));
      }
      if (json.pois) {
        promises.push(poiFactory.ParseArray(json.pois).then(function(pois) {
          InsertArray(pois, data_journey.pois);
        }));
      }
      if (json.channels) {
        promises.push(channelFactory.ParseArray(json.channels).then(function(channels) {
          InsertArray(channels, data_journey.channels);
        }));
      }
      if (json.markers) {
        promises.push(markerFactory.ParseArray(json.markers).then(function(markers) {
          InsertArray(markers, data_journey.markers);
        }));
      }
      if (json.contents) {
        promises.push(contentFactory.ParseArray(json.contents).then(function(contents) {
          InsertArray(contents, data_journey.contents);
        }));
      }
      if (json.objects) {
        promises.push(objectFactory.ParseArray(json.objects).then(function(objects) {
          InsertArray(objects, data_journey.objects);
        }));
      }

      var promise = Promise.all(promises).then(function() {
        return data_journey;
      });

      return promise;
    }
    else
      return Promise.reject('failed to parse DataJourney json: not an object');
  }

  return {
    Load: Load,
    LoadData: LoadData,
    Parse: Parse,
    ParseData: ParseData,
    Create: Create,
    journeyFactory: journeyFactory,
    poiFactory: poiFactory,
    channelFactory: channelFactory,
    markerFactory: markerFactory,
    contentFactory: contentFactory,
    objectFactory: objectFactory
  };


}])