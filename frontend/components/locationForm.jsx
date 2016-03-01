var React = require('react');
var ReactDOM = require('react-dom');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var History = require('react-router').History;
var ApiActions = require('../actions/api_actions');
var LocationStore = require('../stores/location');
var ApiUtil = require('../util/api_util');

var Geosuggest = require('react-geosuggest');


var LocationForm = React.createClass({

  mixins: [LinkedStateMixin],

  getInitialState: function() {
    this.defaultSFLocation = new google.maps.LatLng({lat: 38, lng: -122});
    return {
      fullAddress: "",
      address: "160 Spear Street",
      city: "San Francisco",
      state: "CA",
      zip_code: "94105",
      lat: 38,
      lng: -122,
      description: null,
      occupancy: 1,
      images: []
    };
  },

  render: function() {
    // debugger;
    return(
      <div className="LocationForm">
        <h2 className="Add a location">Post your location!</h2>
        <form className="LocationForm" onSubmit={this.submitLocation}>
          <div>
            <Geosuggest
              location={this.defaultSFLocation}
              radius = "50"
              onSuggestSelect={this.onSuggestSelect}
              valueLink={this.linkState("fullAddress")}
            />
          </div>

          <div id="mapAddress" className='mapAddress' ref='mapAddress'/>
          <br/>
          <div id="addressDisplay" />

          <label>Describe your place: What is so haunted about it?<br/><br/>
            <textarea className="locationdescription"
              valueLink={this.linkState("description")}
            />
          </label>
          <br/>
          <label>How many people can stay at this location?
            <select name="Max Occupancy" valueLink={this.linkState("occupancy")}>
              {this.oneThroughTen()}
            </select>
          </label>
          <br/>
          <div>
            Be sure to include some pictures of your place!
            <button className="upload" onClick={this.uploadImage}>Upload picture!</button>
          </div>

          <div>
            <h2>Here are your images:{this.showImages()}</h2>
          </div>

          <div>
            <input type="submit" className="CreateLocation"
              value="Post Location!" onClick={this.submitLocation}
            />
          </div>

        </form>
      </div>
    );
  },

  oneThroughTen: function() {
    var oTT = [1,2,3,4,5,6,7,8,9,10];
    var list = oTT.map(function(num) {
      return(
        <option value={num} key={num}>{num}</option>
      );
    });
    return list;
  },

  onSuggestSelect: function(suggest) {
    if (this.mapAddressMarker !== undefined)
      {this.mapAddressMarker.setMap(null);}

    this.mapAddressMarker = new google.maps.Marker({
      position: suggest.location,
      map: this.mapAddress,
      title: suggest.label
    });
    this.mapAddress.setCenter(suggest.location);
    // debugger;

    this.setState({
      lat: suggest.location.lat,
      lng: suggest.location.lng,
      fullAddress: suggest.label
    })
    // ReactDOM.render(
    //   <div>
    //     {suggest.label}
    //   </div>
    //   , {},
    //   document.getElementById('addressDisplay')
    // );

  },

  showImages: function() {
    var images = this.state.images;
    var allImages = images.map(function(image, index) {
      return <img key={index} src={image.secure_url}/>;
    });
    return allImages;
  },

  uploadImage: function(event) {
    event.preventDefault();
    var self = this;
    var images = cloudinary.openUploadWidget({

      cloud_name: 'dazguin0y', upload_preset: "jfqawmvc", multiple: true
    },
    function(error, result) {
      self.setState({images: self.state.images.concat(result)});
    });
  },


  submitLocation: function(event) {
    event.preventDefault();
    ApiUtil.createLocation({
      lat: this.state.lat,
      lng: this.state.lng,
      fullAddress: this.state.fullAddress,
      description: this.state.description,
      occupancy: this.state.occupancy,
      images: this.state.images
    });
  },

  // componentDidUpdate: function() {
  //   var self = this;
  //   this.geocoder.geocode(
  //     { 'address': this.state.address },
  //     function(results, status) {
  //       if (status === google.maps.GeocoderStatus.OK) {
  //         self.mapAddress.setCenter(results[0].geometry.location);
  //         var marker = new google.maps.Marker({
  //           map: self.mapAddress,
  //           position: results[0].geometry.location
  //         });
  //       } else {
  //     alert('Geocode was not successful for the following reason: ' + status);
  //     }
  //   });
  // },

  componentDidMount: function() {
    this.geocoder = new google.maps.Geocoder;
    // var self = this;

    var mapDOMNode = this.refs.mapAddress;
    var mapOptions = {
      center: {lat: 37.7758, lng: -122.435},
      zoom: 15
    };
    // debugger;
    this.mapAddress = new google.maps.Map(mapDOMNode, mapOptions);
    // debugger;
    // this.state.mapAddress = this.mapAddress;
    // this.setState({mapAddress: this.mapAddress});
    // debugger;
  }

});

window.LocationForm = LocationForm;
module.exports = LocationForm;






// <label>Address
//   <input type="text" className="locationaddress"
//     valueLink={this.linkState("address")}
//     />
// </label>
//
// <label>City
//   <input type="text" className="locationcity"
//     valueLink={this.linkState("city")}
//     />
// </label>
//
// <label>State
//   <input type="text" className="locationstate"
//     valueLink={this.linkState("state")}
//     />
// </label>
//
// <label>Zip Code
//   <input type="text" className="locationzipcode"
//     valueLink={this.linkState("zip_code")}
//     />
// </label>
//
// <label>Latitude
//   <input type="text" className="locationlat"
//     valueLink={this.linkState("lat")}
//     />
// </label>
//
// <label>Longitude
//   <input type="text" className="locationlng"
//     valueLink={this.linkState("lng")}
//     />
// </label>
