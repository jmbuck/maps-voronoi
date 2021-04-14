import '../css/Main.css'
import { key, id } from '../secret'

import React from 'react'
import Button from 'react-bootstrap/Button'

import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'


const containerStyle = {
    width: '800px',
    height: '800px'
};
  
const center = {
    lat: -40.425,
    lng: -86.908
};


//const center = new window.google.maps.LatLngBounds(-40.425, -86.908);

const libraries = ["places"]
function Main() {

    const { isLoaded } = useJsApiLoader({
        id: id,
        googleMapsApiKey: key,
        libraries: libraries
    })

    const [map, setMap] = React.useState(null)
    const [value, setValue] = React.useState('');
    const [places, setPlaces] = React.useState(null);
    const [nearby, setNearby] = React.useState(null);
    const [markers, setMarkers] = React.useState([]);

    const onLoad = React.useCallback(function callback(map) {
      const bounds = new window.google.maps.LatLngBounds();
      map.fitBounds(bounds);

      const service = new window.google.maps.places.PlacesService(map)
      setPlaces(service)
      setMap(map)
    }, [])
  
    const onUnmount = React.useCallback(function callback(map) {
      setMap(null)
    }, [])


  const fetchNearby = (type) => {
    if(map.zoom >= 12) {
        console.log("Fetching for places of type ", type);
        const request = {
            location: map.center,
            radius: 3000,
            type: [type]
        }
        
        places.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                console.log(results)
                setNearby(results)
                createMarkers(results)
            } else {
                console.error("There was a problem with the places request");
            }           
        })

    } else {
        console.log("Map is not zoomed in enough to fetch nearby places! TODO: implemented easy error alert");
    }
  }

  const createMarkers = (results) => {
    const new_markers = []
    for(const place in results) {
        new_markers.push(<Marker key={place} position={results[place].geometry.location} />)
    }
    setMarkers(new_markers)
  }

  return (
    <div className="Main">
        {
           isLoaded && 
           <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={3}
                onLoad={onLoad}
                onUnmount={onUnmount}
           >
           { markers.length > 0 ? markers.map(el => el) : [] }
           </GoogleMap>
        }
        <Form onSubmit={(ev) => {
            ev.preventDefault();
            fetchNearby(value);
            
        }}
        className="search-form" inline>
            <FormControl onChange={(ev) => {setValue(ev.target.value)}} name="type" type="text" placeholder="Enter a place type (e.g. hospitals)" className="search-box mr-sm-2" />
            <Button type="submit" variant="outline-info">Find Places</Button>
        </Form>
        <Button onClick={() => {
            console.log(map);
        }}variant="outline-info">Generate Voronoi Diagram</Button>
    </div>
  );
}

export default Main;