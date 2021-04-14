import '../css/Main.css'
import { key, id } from '../secret'

import React from 'react'
import Button from 'react-bootstrap/Button'

import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'


const containerStyle = {
    width: '800px',
    height: '800px'
};
  
const center = {
    lat: -40.425,
    lng: -86.908
};

function Main() {

    const { isLoaded } = useJsApiLoader({
        id: id,
        googleMapsApiKey: key
    })

    const [map, setMap] = React.useState(null)
    const [value, setValue] = React.useState(null);

    const onLoad = React.useCallback(function callback(map) {
      const bounds = new window.google.maps.LatLngBounds();
      map.fitBounds(bounds);
      setMap(map)
    }, [])
  
    const onUnmount = React.useCallback(function callback(map) {
      setMap(null)
    }, [])


  const fetchNearby = (type) => {
    if(map.zoom >= 12) {
        const lat = map.center.lat();
        const lng = map.center.lng();
    } else {
        console.log("Map is not zoomed in enough to fetch nearby places! TODO: implemented easy error alert");
    }
  }

  return (
    <div className="Main">
        {
           isLoaded && 
           <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
           >
           { /* Child components, such as markers, info windows, etc. */ }
           <></>
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