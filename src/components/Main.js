import '../css/Main.css'
import { key, id } from '../secret'

import React from 'react'
import Button from 'react-bootstrap/Button'

import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { GoogleMap, Marker, useJsApiLoader, Polygon } from '@react-google-maps/api'
import { Delaunay } from 'd3-delaunay'

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

const options = {
    fillColor: "lightblue",
    fillOpacity: 0,
    strokeColor: "red",
    strokeOpacity: 1,
    strokeWeight: 1,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}

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
    const [points, setPoints] = React.useState([]);
    const [voronoi_bounds, setVoronoiBounds] = React.useState([]);
    const [polygons, setPolygons] = React.useState([]);

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
    const new_points = []
    //lat is considered y coord, lng is x coord
    let min_lat = null;
    let max_lat = null;
    let min_lng = null;
    let max_lng = null;
    for(const place in results) {
        new_markers.push(<Marker key={place} position={results[place].geometry.location} />)
        const lat = results[place].geometry.location.lat()
        const lng = results[place].geometry.location.lng()

        if(!min_lat || lat < min_lat) min_lat = lat;
        if(!max_lat || lat > max_lat) max_lat = lat;
        if(!min_lng || lng < min_lng) min_lng = lng;
        if(!max_lng || lng > max_lng) max_lng = lng;

        console.log(results[place].name, lng, lat)
        points.push([lng, lat])
    }
    setMarkers(new_markers)
    setPoints(points)
    setVoronoiBounds([min_lng - 0.01, min_lat - 0.01, max_lng + 0.01, max_lat + 0.01])
  }

  const createPolygon = (polygon, key) => {
        const paths = []
        for(const point of polygon) {
            paths.push({lat: point[1], lng: point[0] })
        }
        return <Polygon key={key} paths={paths} options={options} />
  }

  const generateVoronoi = () => {
      if(markers.length == 0) {
          console.log("Must generate some markers on the graph first!")
          return;
      }

      console.log("Generating voronoi diagram...")
      const delaunay = Delaunay.from(points)
      const voronoi = delaunay.voronoi(voronoi_bounds)
      console.log(voronoi)
      const cell_polygons = voronoi.cellPolygons();
      const new_polygons = []
      let i = 0
      for(const polygon of cell_polygons) {
          new_polygons.push(createPolygon(polygon, i))
          i++
      }
      setPolygons(new_polygons)
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
           { polygons.length > 0 ? polygons.map(el => el) : [] }
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
        <Button onClick={generateVoronoi} variant="outline-info">Generate Voronoi Diagram</Button>
    </div>
  );
}

export default Main;