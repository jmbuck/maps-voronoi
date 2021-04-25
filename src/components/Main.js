import '../css/Main.css'
import { key, id } from '../secret'

import React from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { GoogleMap, Marker, useJsApiLoader, Polygon, Circle } from '@react-google-maps/api'
import { Delaunay } from 'd3-delaunay'

const containerStyle = {
    width: '800px',
    height: '800px'
};
  
const center = {
    lat: 40.4286588,
    lng: -86.8987302
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

const circleOptions = {
    fillColor: "red",
    fillOpacity: 1,
    strokeColor: "red",
    strokeOpacity: 1,
    strokeWeight: 1,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}

/* TODO Friday:
    Sort out bug with odd diagram for subsequent requests
    Clean up console prints
    Add geometric representation
    Add city support
    Improve UI/UX
    Get more results (?)
    Etc etc




*/
function Main() {

    const { isLoaded } = useJsApiLoader({
        id: id,
        googleMapsApiKey: key,
        libraries: libraries
    })

    const [map, setMap] = React.useState(null)
    const [value, setValue] = React.useState('')
    const [places, setPlaces] = React.useState(null)
    const [markers, setMarkers] = React.useState([])
    const [points, setPoints] = React.useState([])
    const [voronoi_bounds, setVoronoiBounds] = React.useState([])
    const [circles, setCircles] = React.useState([])
    const [polygons, setPolygons] = React.useState([])
    const [showMarkers, setShowMarkers] = React.useState(true)
    const [showDiagram, setShowDiagram] = React.useState(true)

    const onLoad = React.useCallback((map) => {
      const service = new window.google.maps.places.PlacesService(map)
      setPlaces(service)
      setMap(map)
    }, [])
  
    const onUnmount = React.useCallback(() => {
      setMap(null)
      setPlaces(null)
      setValue('')
      resetMap()
    }, [])

  const fetchNearby = (type) => {
    if(map.zoom >= 12) {
        resetMap()
        console.log("Fetching for places of type ", type);
        console.log(map.center.lat(), map.center.lng())
        console.log(map.zoom)
        const request = {
            location: map.center,
            radius: 3000,
            type: [type],
            rankby: 'distance'
        }
        
        places.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                createMarkers(results)
            } else {
                console.error("There was a problem with the places request");
                alert("There was a problem with the places request")
            }           
        })

    } else {
        console.error("Map is not zoomed in enough to fetch nearby places!");
        alert("Map is not zoomed in enough to fetch nearby places!");
    }
  }

  const createMarkers = (results) => {
    
    resetMarkers()
    const new_markers = []

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

  const resetMap = () => {
    resetDiagram()
    resetMarkers()
  }

  const resetDiagram = () => {
    setPolygons([])
    setCircles([])
    setPoints([])
    setShowDiagram(true)
  }

  const resetMarkers = () => {
    setMarkers([])
    setPoints([])
    setShowMarkers(true)
  }

  const generateVoronoi = () => {
      console.log(map)
      if(markers.length == 0) {
          console.error("Must generate some markers on the graph first!")
          alert("Must generate some markers on the graph first!")
          return;
      }

      resetDiagram()

      const delaunay = Delaunay.from(points)
      const voronoi = delaunay.voronoi(voronoi_bounds)

      const cell_polygons = voronoi.cellPolygons();
      const new_polygons = []
      const new_circles = []
      let i = 0
      for(const polygon of cell_polygons) {
          new_polygons.push(createPolygon(polygon, i))
          new_circles.push(<Circle 
                                key={i} 
                                radius={3} 
                                center={{ lat: points[i][1], lng: points[i][0]}} 
                                options={circleOptions}
                            />)
          i++
      }

      setPolygons(new_polygons)
      setCircles(new_circles)
  }

  return (
    <div className="Main">
        <div className="Map">
        {
           isLoaded && 
           <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
           >
           { markers.length > 0 && showMarkers ? markers.map(el => el) : [] }
           { circles.length > 0 && showDiagram ? circles.map(el => el) : [] }
           { polygons.length > 0 && showDiagram ? polygons.map(el => el) : [] }
           </GoogleMap>
        }

        <Form onSubmit={(ev) => {
            ev.preventDefault();
            fetchNearby(value);
        }}
        className="search-form" inline>
            <FormControl onChange={(ev) => {setValue(ev.target.value)}} name="type" type="text" placeholder="Enter a place type (e.g. hospitals)" className="search-box mr-sm-2" />
            <Button type="submit" variant="info">Find Places</Button>
        </Form>
        </div>

        <ButtonGroup>
            <Button onClick={generateVoronoi} variant="primary">Generate Voronoi Diagram</Button>
            <Button onClick={() => setShowMarkers(!showMarkers)} variant="secondary">
                {showMarkers ? 'Hide Markers' : 'Show Markers'}
            </Button>
            <Button onClick={() => setShowDiagram(!showDiagram)} variant="secondary">
                {showDiagram ? 'Hide Voronoi Diagram' : 'Show Voronoi Diagram'}
            </Button>
            <Button onClick={resetMap} variant="danger">Reset Map</Button>
        </ButtonGroup>
    </div>
  );
}

export default Main;