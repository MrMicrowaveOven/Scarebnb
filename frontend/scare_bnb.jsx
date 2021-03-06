var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var root = document.getElementById('content');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var IndexRedirect = ReactRouter.IndexRedirect;
var ApiUtil = require('./util/api_util');
var Search = require('./components/search');
var LocationForm = require('./components/locationForm');
var NavBar = require('./components/nav_bar');
var Show = require('./components/show');
var LocationScreen = require('./components/location_screen');
var FullPage = require('./components/full_page');


window.ApiUtil = ApiUtil;

var App = React.createClass({

    render: function(){
      return (
          <div>
            <div><NavBar selected="1"/></div>
            <header></header>
            {this.props.children}
          </div>
      );
    }
});

// {this.props.children}
var routes = (
  <Route path="/" component={App}>
          <IndexRedirect to="location_screen"/>
          <Route path="location_screen" component={LocationScreen}/>
          <Route path="locations/new" component={LocationForm}/>
  </Route>
);


document.addEventListener("DOMContentLoaded", function() {
  var content = document.getElementById("content");
  if (content) {ReactDOM.render(<Router>{routes}</Router>, content);}
});
