import React, { Component } from 'react';
import EscapeRegExp from 'escape-string-regexp'

class Map extends Component {
    state = {
        mapLoaded: false,
        filter: '',
        locations: [
            {name: 'Mom\'s House', latlng: {lat: 43.3007, lng: -87.9874}, address: '', detail: '', marker: null},
            {name: 'Amy\'s Candy Kitchen', latlng: {lat: 43.2967, lng: -87.9877}, address: 'W62N579 Washington Ave', detail: '', marker: null},
            {name: 'Cedar Creek Winery', latlng: {lat: 43.3014, lng: -87.9888}, address: '', detail: '', marker: null},
            {name: 'Rivoli Theater', latlng: {lat: 43.2962, lng: -87.9876}, address: '', detail: '', marker: null},
            {name: 'Cedarburg Coffee Roastery', latlng: {lat: 43.2975, lng: -87.9882}, address: '', detail:'', marker: null},
            {name: 'Fiddleheads Coffee', latlng: {lat: 43.2976, lng: -87.9881}, address: '', detail: '', marker: null},
            {name: 'Penzey\'s Spices', latlng: {lat: 43.2976, lng: -87.9875}, address:'', detail: '', marker: null},
            {name: 'Tomaso\'s', latlng: {lat: 43.3007, lng: -87.9889}, address:'', detail: '', marker: null},
            {name: 'Cedarburg Art Museum', latlng: {lat: 43.3, lng: -87.9896}, address: '', detail: '', marker: null},
            {name: 'Java House', latlng: {lat: 43.2994, lng: -87.9888}, address:'', detail: '', marker: null}
        ],
        showingLocations: [],
        markers: [],
        map: null
    }

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

    //Yelp key: wzDYtdVDfqlygupomw4fwYxWkA7NlAsf1BH3wfxh3jvO8Cz8ahRSH1w7Dl5SoclwN4AJ9nxiGOBgRgcO0f4YVLdxsSbEp2YzoWxOEbBZUCjEsWQ421CrzdbdrHFPXHYx
    //Yelp client ID: Y-7rnYtiTgXR01V02AgvDQ

    //The 'load' listener idea for the map came from https://stackoverflow.com/questions/48493960/using-google-map-in-react-component - Michael Yurin
    componentDidMount() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDbfFqK-dDZbL3htfXi-jQIh7_vrUzusLU&v=3`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => {
            this.setState({ mapLoaded: true });
        });
        document.body.appendChild(script);
    }
    
    componentDidUpdate() {
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
                    fetch(`https://api.yelp.com/v3/businesses/matches?name=${location.name}&address1=${location.address}&city=Cedarburg&state=WI&country=US`, {
                        method: 'GET',
                        mode: 'no-cors',
                        headers: {
                            'Authorization': 'Bearer wzDYtdVDfqlygupomw4fwYxWkA7NlAsf1BH3wfxh3jvO8Cz8ahRSH1w7Dl5SoclwN4AJ9nxiGOBgRgcO0f4YVLdxsSbEp2YzoWxOEbBZUCjEsWQ421CrzdbdrHFPXHYx', 
                            'Content-Type': 'application/json'
                        }
                    })
                    //.then(res => res.json())
                    .then(function(data) {
                        if (data.length > 0) {
                            var id = data[0].id
                            fetch(`https://api.yelp.com/v3/businesses/${id}/reviews`, {
                                method: 'GET',
                                mode: 'no-cors',
                                headers: new Headers({
                                    'Authorization': 'Bearer wzDYtdVDfqlygupomw4fwYxWkA7NlAsf1BH3wfxh3jvO8Cz8ahRSH1w7Dl5SoclwN4AJ9nxiGOBgRgcO0f4YVLdxsSbEp2YzoWxOEbBZUCjEsWQ421CrzdbdrHFPXHYx', 
                                    'Content-Type': 'application/json'
                                })
                            })
                            .then(res1 => location.detail = res1.json())
                        }
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
                    marker.addListener('click', function() {
                        document.getElementsByClassName('detail-container')[0].innerHTML = location.detail
                    });
                    location.marker = marker;
                    return location
                })
            })
            this.setState({showingLocations: this.state.locations.slice()})
            this.setState({map})
        }
    }

    showLocation(button) {
        this.state.showingLocations.map(location => {
            if (location.marker.title === button.innerHTML) {
                document.getElementsByClassName('detail-container')[0].innerHTML = location.name
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