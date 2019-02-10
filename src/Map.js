import React, { Component } from 'react';
import EscapeRegExp from 'escape-string-regexp'

class Map extends Component {
    state = {
        mapLoaded: false,
        filter: '',
        locations: [
            {name: 'Mom\'s House', latlng: {lat: 43.3007, lng: -87.9874}, address: 'W62N688 Riveredge Dr', detail: 'Mom\'s House', marker: null},
            {name: 'Amy\'s Candy Kitchen', latlng: {lat: 43.2967, lng: -87.9877}, address: 'W62N579 Washington Ave', detail: 'Amy\'s Candy Kitchen', marker: null},
            {name: 'Cedar Creek Winery', latlng: {lat: 43.3014, lng: -87.9888}, address: 'N70W6340 Bridge Rd', detail: 'Cedar Creek Winery', marker: null},
            {name: 'Rivoli Theater', latlng: {lat: 43.2962, lng: -87.9876}, address: 'W62N567 Washington Ave', detail: 'Rivoli Theater', marker: null},
            {name: 'Cedarburg Coffee Roastery', latlng: {lat: 43.2975, lng: -87.9882}, address: 'W62N603 Washington Ave', detail:'Cedarburg Coffee Roastery', marker: null},
            {name: 'Fiddleheads Coffee', latlng: {lat: 43.2976, lng: -87.9881}, address: 'W62N605 Washington Ave', detail: 'Fiddleheads Coffee', marker: null},
            {name: 'Penzey\'s Spices', latlng: {lat: 43.2976, lng: -87.9875}, address:'W62N604 Washington Ave', detail: 'Penzey\'s Spices', marker: null},
            {name: 'Tomaso\'s', latlng: {lat: 43.3007, lng: -87.9889}, address:'W63N688 Washington Avenue', detail: 'Tomaso\'s', marker: null},
            {name: 'Cedarburg Art Museum', latlng: {lat: 43.3, lng: -87.9896}, address: 'W63N675 Washington Ave', detail: 'Cedarburg Art Museum', marker: null},
            {name: 'Java House', latlng: {lat: 43.2994, lng: -87.9888}, address:'W63N653 Washington Ave', detail: 'Java House', marker: null}
        ],
        showingLocations: [],
        map: null
    }

    //Update the location list based on a change in the entered filter string
    updateFilter(filter) {
        if (filter) {
            const match = new RegExp(EscapeRegExp(filter, 'i'))
            const matchedLocations = this.state.locations.filter((location) => match.test(location.name))
            this.setState({showingLocations: matchedLocations})
            this.updateMarkers(matchedLocations)
        } else {
            this.setState({showingLocations: this.state.locations.slice()})
            this.updateMarkers(this.state.locations)
        }
        this.setState({filter})
    }

    //Update which markers are visible based on the entered filter string
    updateMarkers(matchedLocations) {
        this.state.locations.map(location => {
            location.marker.setVisible(false)
            return location
        })
        matchedLocations.map(location => {
            location.marker.setVisible(true)
            return location
        })
    }

    //The 'load' listener idea for the map came from https://stackoverflow.com/questions/48493960/using-google-map-in-react-component - Michael Yurin
    componentDidMount() {
        var script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDbfFqK-dDZbL3htfXi-jQIh7_vrUzusLU&v=3`;
        script.onerror = function(){window.alert('Map failed to load. Please refresh the page to try again.')};
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => {
            this.setState({ mapLoaded: true });
        });
        document.body.appendChild(script);

        script = document.createElement('script');
        script.src = 'jquery-3.3.1.min.js'
        document.body.appendChild(script);
    }
    

    //Foursquare client ID: EAZQFJ5KGSFIPLJUVAPC1SK50YXUZVBRSFL3413M4FR3N1QH
    //Foursquare client Secret: HOJMM5F2BEY0F3P4R24IVYRSEHK1UO3OL2G4QX424G04VVWA

    componentDidUpdate() {
        //Load the map and create the markers only 1 time
        if ((this.state.mapLoaded) && (this.state.map === null)) {
            var map = new window.google.maps.Map(document.getElementById('neighborhood'), {
                center: {lat: 43.2994, lng: -87.9884231},
                zoom: 16,
                clickableIcons: false
            })

            //Get current date for Foursquare v parameter
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) {dd = '0' + dd}
            if (mm < 10) {mm = '0' + mm}
            today = yyyy + mm + dd;

            this.setState({locations:
                this.state.locations.map(location => {
                    var marker = new window.google.maps.Marker({
                        position: location.latlng,
                        map: map,
                        title: location.name
                    });
                    //Find venue id
                    fetch(`https://api.foursquare.com/v2/venues/search?ll=${location.latlng.lat},${location.latlng.lng}&client_id=EAZQFJ5KGSFIPLJUVAPC1SK50YXUZVBRSFL3413M4FR3N1QH&client_secret=HOJMM5F2BEY0F3P4R24IVYRSEHK1UO3OL2G4QX424G04VVWA?v=${today}`, {
                        method: 'GET',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    })
                    .then(res => {console.log(res)})   //;return res.json()})
                    //.then(res => {
                    //})
                    .catch(function(error) {
                        console.log(error)
                    })
                    marker.addListener('click', function() {
                        document.getElementsByClassName('detail-container')[0].innerHTML = location.detail
                    })
                    location.marker = marker
                    return location
                })
            })
            this.setState({showingLocations: this.state.locations.slice()})
            this.setState({map})
        }
    }

    //Populate the selected location's details and bounce it's marker twice
    showLocation(button) {
        this.state.showingLocations.map(location => {
            if (location.marker.title === button.innerHTML) {
                document.getElementsByClassName('detail-container')[0].innerHTML = location.detail
                location.marker.setAnimation(window.google.maps.Animation.BOUNCE)
                setTimeout(function(){ location.marker.setAnimation(null); }, 1400)
            }
            return location
        })
    }

    render() {
        const style = {
            width: '80vw',
            height: '100vh',
            position: 'absolute',
            right: 0
          }

        return (
            <div>
                <div className='marker-container'>
                    <div className='neighborhood-title'>Cedarburg, WI</div>
                    <div className='filter-input-container'>
                        <input
                            className='filter-input'
                            type="text"
                            placeholder="Filter Locations"
                            value={this.state.filter}
                            onChange={(event) => this.updateFilter(event.target.value)}
                        />
                    </div>
                    <div className='location-container'>
                        {this.state.showingLocations.map(location => (
                            <button key={location.name} onClick={(event) => this.showLocation(event.target)}>{location.name}</button>
                        ))}
                    </div>
                    <hr></hr>
                    <div className='detail-container'>Details from Yelp</div>
                </div>
                <div id='neighborhood' style={style}></div>
            </div>
        );
    }
}

export default Map;