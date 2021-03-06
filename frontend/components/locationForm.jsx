var React = require('react');
var ReactDOM = require('react-dom');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var History = require('react-router').History;
var ApiUtil = require('../util/api_util');
var MapStyle = require('../style_docs/maps_stylesheet');

var Geosuggest = require('react-geosuggest');

var LocationForm = React.createClass({

  mixins: [LinkedStateMixin, History],

  getInitialState: function() {
    // debugger;
    this.defaultSFLocation = new google.maps.LatLng({lat: 38, lng: -122});
    return {
      title: "",
      full_address: "",
      lat: 38,
      lng: -122,
      description: null,
      occupancy: 1,
      link: "",
      price: 35,
      image: ""
    };
  },

  render: function() {
    // debugger;
    // For some reason, adding a mdl-card className
    //to LocationForm
    //removes ALL CSS from the form.
    return(
      <div className="mui-container-fluid">
      <div className="mui-panel">
        <form id="LocationForm" onSubmit={this.submitLocation}>


          <legend className="form_legend">Post your location!</legend>
          <div className="mui-textfield mui-textfield--float-label">
            <input type="text" className="title"

              valueLink={this.linkState("title")}
              required
              />
            <label>Title of Place</label>
          </div>
          <div className="mui-textfield" id="geo_locator_field">
            <div className="geo_input">
              <Geosuggest
                location={this.defaultSFLocation}
                radius = "50"
                onSuggestSelect={this.onSuggestSelect}
                onChange = {this.geoChange}
                valueLink={this.linkState("full_address")}
                required
              />
            </div>
          </div>

          <div id="mapAddress" className='mapAddress' ref='mapAddress'/>
          <div id="addressDisplay" />

          <div className="mui-textfield mui-textfield--float-label" id="location_description_container">
            <textarea className="locationdescription"
              valueLink={this.linkState("description")}
              required
            />
          <label className="location_description_text">Describe your place: What is so haunted about it?</label>
          </div>
            <label className="locOccupancy">
                <div className="form_text">
                  How many people can stay at this location?
                </div>
                <select
                  className="occupancy_select"
                  valueLink={this.linkState("occupancy")}
                >
                  {this.oneThroughTen()}
                </select>
            </label>
          <br/>
          <div className="uploadArea">
            <button className="mui-btn mui-btn--raised" onClick={this.uploadImage}>
              Upload picture!</button>
            <div className="form_text">Be sure to include a picture of your place!</div>
          </div>

          <div>
            <h2>
              {this.showImage()}
            </h2>
          </div>

          <div>
            <input type="submit" className="mui-btn mui-btn--raised"
              value="Post Location!" onClick={this.submitLocation}
            />
          </div>
          <br/><br/>
        </form>
      </div>
    </div>
    );
  },


  showImage: function() {
    var image = this.state.image;
    if (image === "") {return;}
    var imageShow = <img src={image.secure_url}/>;
    // debugger;
    return (<div className="form_text">Here is your image: <br/>{imageShow}</div>);
  },

  oneThroughTen: function() {
    var oTT = [1,2,3,4,5,6,7,8,9,10];
    var list = oTT.map(function(num) {
      return(
        <option className="occ_select_nums" value={num} key={num}>{num}</option>
      );
    });
    return list;
  },

  geoChange: function() {
    if (this.mapAddressMarker) {
      this.mapAddressMarker.setMap(null);
      delete this.mapAddressMarker;
    }
    // this.mapAddressMarker = null;
  },

  onSuggestSelect: function(suggest) {
    // debugger;
    if (this.mapAddressMarker !== undefined)
      {this.mapAddressMarker.setMap(null);}

    var ghost = "https://49.media.tumblr.com/cf07c4116283d8b2a71326ed4fc4cb2c/tumblr_o3hr8mRRGS1v497yzo1_75sq.gif";

    this.mapAddressMarker = new google.maps.Marker({
      position: suggest.location,
      map: this.mapAddress,
      animation: google.maps.Animation.DROP,
      title: suggest.label,
      icon: ghost,
      opacity: 0.5
    });
    this.mapAddress.setCenter(suggest.location);
    // debugger;

    this.setState({
      lat: suggest.location.lat,
      lng: suggest.location.lng,
      full_address: suggest.label
    });
    // ReactDOM.render(
    //   <div>
    //     {suggest.label}
    //   </div>
    //   , {},
    //   document.getElementById('addressDisplay')
    // );

  },


  uploadImage: function(event) {
    event.preventDefault();
    var self = this;
    var image = cloudinary.openUploadWidget(
      {
        cloud_name: 'dazguin0y', upload_preset: "sppqijhu", multiple: false,
        theme: "minimal", show_powered_by: false, stylesheet: ""
      },
      function(error, result) {
        if (result) {
          self.setState({image: result[0]});
        }
      }
    );
  },


  submitLocation: function(event) {
    event.preventDefault();
    ApiUtil.createLocation({
      title: this.state.title,
      lat: this.state.lat,
      lng: this.state.lng,
      full_address: this.state.full_address,
      description: this.state.description,
      occupancy: this.state.occupancy,
      link: this.state.link,
      price: this.state.price,
      image: this.state.image.secure_url
    }, this.creationSuccess);
  },

  creationSuccess: function(id) {
    ApiUtil.showLocation(id);
    // this.setState({images: })
    this.history.push("location_screen");
  },

  componentDidMount: function() {
    this.geocoder = new google.maps.Geocoder;

    var mapDOMNode = this.refs.mapAddress;
    var mapOptions = {
      center: {lat: 37.7758, lng: -122.435},
      zoom: 15,
      backgroundColor: "#000000",
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.DARK, "scaremap"]
      }
    };
    // debugger;
    if (mapDOMNode !== undefined){
      this.mapAddress = new google.maps.Map(mapDOMNode, mapOptions);
      this.mapAddress.mapTypes.set("scaremap", MapStyle);
      this.mapAddress.setMapTypeId("scaremap");
    }
  }

});

// window.LocationForm = LocationForm;
module.exports = LocationForm;
