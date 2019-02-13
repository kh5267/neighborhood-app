import React, { Component } from 'react';
import EscapeRegExp from 'escape-string-regexp'
import Axios from 'axios'

class Map extends Component {
    state = {
        mapLoaded: false,
        filter: '',
        locations: [
            {name: 'Mom\'s House', latlng: {lat: 43.3007, lng: -87.9874}, address: 'W62N688 Riveredge Dr', detail: 'Mom\'s House', marker: null, id: ''},
            {name: 'Amy\'s Candy Kitchen', latlng: {lat: 43.2967, lng: -87.9877}, address: 'W62N579 Washington Ave', detail: 'Amy\'s Candy Kitchen', marker: null, id: '4d3f572746775481f4c34df4'},
            {name: 'Cedar Creek Winery', latlng: {lat: 43.3014, lng: -87.9888}, address: 'N70W6340 Bridge Rd', detail: 'Cedar Creek Winery', marker: null, id: '4dc5b87a2271f270513516f3'},
            {name: 'Rivoli Theater', latlng: {lat: 43.2962, lng: -87.9876}, address: 'W62N567 Washington Ave', detail: 'Rivoli Theater', marker: null, id: '4b5129fcf964a5207e4527e3'},
            {name: 'Cedarburg Coffee Roastery', latlng: {lat: 43.2975, lng: -87.9882}, address: 'W62N603 Washington Ave', detail:'Cedarburg Coffee Roastery', marker: null, id: '4b11bd0ef964a5207f8323e3'},
            {name: 'Fiddleheads Coffee', latlng: {lat: 43.2976, lng: -87.9881}, address: 'W62N605 Washington Ave', detail: 'Fiddleheads Coffee', marker: null, id: '4bd313d0046076b056157571'},
            {name: 'Penzey\'s Spices', latlng: {lat: 43.2976, lng: -87.9875}, address:'W62N604 Washington Ave', detail: 'Penzey\'s Spices', marker: null, id: '50410d5ee4b00690ba1607c5'},
            {name: 'Tomaso\'s', latlng: {lat: 43.3007, lng: -87.9889}, address:'W63N688 Washington Avenue', detail: 'Tomaso\'s', marker: null, id: '4b6dcbb0f964a52094902ce3'},
            {name: 'Cedarburg Art Museum', latlng: {lat: 43.3, lng: -87.9896}, address: 'W63N675 Washington Ave', detail: 'Cedarburg Art Museum', marker: null, id: '5298eb8e498e23d3c660cabe'},
            {name: 'Java House', latlng: {lat: 43.2994, lng: -87.9888}, address:'W63N653 Washington Ave', detail: 'Java House', marker: null, id: '4b8a7777f964a520fc6d32e3'}
        ],
        showingLocations: [],
        map: null
    }

    //Update the location list based on a change in the entered filter string
    updateFilter(filter) {
        if (filter) {
            const match = new RegExp(EscapeRegExp(filter), 'i')
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

            this.setState({locations:
                this.state.locations.map(location => {
                    var marker = new window.google.maps.Marker({
                        position: location.latlng,
                        map: map,
                        title: location.name
                    });

                    //Pull the location details from the Foursquare API - default to the location name if the API request fails
                    Axios.get('https://api.foursquare.com/v2/venues/' + location.id, {
                      params: {
                        client_id: 'EAZQFJ5KGSFIPLJUVAPC1SK50YXUZVBRSFL3413M4FR3N1QH',
                        client_secret: 'HOJMM5F2BEY0F3P4R24IVYRSEHK1UO3OL2G4QX424G04VVWA',
                        v: 20190212
                      }
                    }).then((response) => {
                      if (response.data.meta.code === 200) {
                        if (response.data.response.venue !== undefined) {
                          let venue = response.data.response.venue;
                          console.log(venue);
                          var phone = (venue.contact.formattedPhone === undefined) ? '': venue.contact.formattedPhone;
                          var address = (venue.location.address === undefined) ? '': venue.location.address;
                          var url = (venue.url === undefined) ? '': venue.url;
                          location.detail = 'Category:' + venue.categories[0].name + '<p>Phone: ' + phone + '</p><p>Address:</br>' + address + '</p><p>Website:</br>' + url + '</p>';
                        }
                      }
                    }).catch((error) => {
                      console.log(error)
                    });

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
            width: '75vw',
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
                    <div className='detail-container'></div>
                </div>
                <div id='neighborhood' style={style}></div>
            </div>
        );
    }
}

export default Map;