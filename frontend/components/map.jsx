var React = require('react');

var History = require('react-router').History;
var ApiActions = require('../actions/api_actions');
var LocationStore = require('../stores/location');
var ApiUtil = require('../util/api_util');
var MapStyle = require('../style_docs/maps_stylesheet');

var Map = React.createClass({
  getInitialState: function() {
    //markerIndex is a means of indexing all markers for locations in the store.
    //locationId = markerIndex key
    //It also keeps track of markers that were on the screen before onChange.
    this.markerIndex = {};

    //Used to update the markerIndex
    this.newMarkerIndex = {};
    //locations is the locations in the store
    //markers are the markers on the map.
    //We'll set state with

    //If a location was just created, we want it centered on the map.


    return {locations: LocationStore.all(), markers: this.markerIndex};
  },

  render: function() {
    return(
      <div className='map' ref='map'/>
    );
  },

  //Called when the Store changes
  onChange: function(){
    var self = this;

    //Bounce animation
    if (self.markerIndex !== undefined && self.markerIndex[1] !== undefined && LocationStore.lastLocation() !== undefined) {
      self.markerIndex[LocationStore.lastLocation().id].setAnimation(null);
    }
    if (LocationStore.selectedLocation() !== null && LocationStore.selectedLocation() !== undefined) {
      if (self.markerIndex[LocationStore.selectedLocation().id] !== undefined) {
        self.markerIndex[LocationStore.selectedLocation().id].
          setAnimation(google.maps.Animation.BOUNCE);
          //Stop animation after 2 seconds.
          window.setTimeout(function(){
            self.markerIndex[LocationStore.selectedLocation().id].
              setAnimation(null);
          }, 1475);
      }
    }
    //End Bounce animation

    self.markerUpdate();
    Map.theMap = self;
    this.refreshBandM();
  },

  //reRender
  refreshBandM: function(){
    this.setState({locations: LocationStore.all(),
      markers: this.allMarkersInIndex()});


  },

  //Adds a marker to the map
  addMarker: function(location) {
    var self = this;
    var image = "https://49.media.tumblr.com/cf07c4116283d8b2a71326ed4fc4cb2c/tumblr_o3hr8mRRGS1v497yzo1_75sq.gif";
    var marker = new google.maps.Marker(
      {
        position: {lat: location.lat, lng: location.lng},
        map: self.map,
        // animation: google.maps.Animation.DROP,
        title: location.title,
        icon: image,
        opacity: 0.5
      }
    );
    //Clicking a marker changes the Show
    marker.addListener('click', function() {
      ApiActions.receiveLocation(location);
    });
    self.newMarkerIndex[location.id] = marker;
    return marker;
  },

  //Removes marker from map
  removeMarker: function(marker) {
    var locationId = this.findLocationIdByMarker(marker);
    delete this.markerIndex[locationId];
    marker.setMap(null);
    marker = null;
  },


  markerUpdate: function() {
    var self = this;

    //If there's a location in the store that isn't in the markerIndex,
    //create a marker for it.
    LocationStore.all().forEach(function(location) {
      if (self.markerIndex[location.id] === undefined) {
        self.newMarkerIndex[location.id] = self.addMarker(location);
      } else {
        self.newMarkerIndex[location.id] = self.markerIndex[location.id];
        delete self.markerIndex[location.id];
      }
    });

    //
    self.removeOldMarkers();

    self.markerIndex = self.newMarkerIndex;
    self.newMarkerIndex = {};

    this.refreshBandM();
  },

  removeOldMarkers: function() {
    var self = this;
    Object.keys(self.markerIndex).forEach(function(markerId) {
      self.removeMarker(self.markerIndex[markerId]);
    });
  },

  allMarkersInIndex: function() {
    var arr = [];
    for(var marker in this.markerIndex) {
      arr.push(this.markerIndex[marker]);
    }
    return arr;
  },

  findLocationIdByMarker: function(marker) {
    var markerIndex = this.markerIndex;
    // debugger;
    for(var locationId in markerIndex) {
      if(markerIndex.hasOwnProperty(locationId)) {
        if(markerIndex[locationId] === marker) {
          return locationId;
        }
      }
    }
    return -1;
  },



  onIdle: function() {
    var boundaries = this.map.getBounds();
    var northEast = boundaries.getNorthEast();
    var southWest = boundaries.getSouthWest();
    this.bounds = {northEast: {
      lat: northEast.lat(), lng: northEast.lng()
    }, southWest: {
      lat: southWest.lat(), lng: southWest.lng()
    }};
    ApiUtil.fetchLocations(this.bounds);
  },

  componentDidMount: function(){
    this.locationListener = LocationStore.addListener(this.onChange);
    // this.showListener = LocationStore.addListener(this.onChange);
    var mapDOMNode = this.refs.map;
    var defaultCenter = {lat: 37.7758, lng: -122.435};
    // debugger;
    // if (LocationStore.selectedLocation !== null)
    //   {defaultCenter = LocationStore.selectedLocation.location;}
    var mapOptions = {
      center: defaultCenter,
      zoom: 11,
      backgroundColor: "#000000",
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.DARK, "scaremap"]
      }

    };
    // debugger;
    this.map = new google.maps.Map(mapDOMNode, mapOptions);

    this.map.mapTypes.set("scaremap", MapStyle);
    this.map.setMapTypeId("scaremap");

    var self = this;

    this.map.addListener('idle', this.onIdle);
  },

  componentWillUnmount: function() {
    this.locationListener.remove();
  }


});
window.Map = Map;
module.exports = Map;
