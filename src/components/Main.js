import '../css/Main.css'
import { key, id } from '../secret'
import usCSV from '../data/uscities.csv'
import worldCSV from '../data/worldcities.csv'

import React from 'react'
import { readString } from 'react-papaparse';
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

  /* TODO:
  Add world city support
  Add footer
  */

/* US Cities CSV Columns Reference:
    Index 0: city unicode
    Index 1: city ascii
    Index 2: state id
    Index 3: state_name
    Index 4: country_fips
    Index 5: county_name
    Index 6: lat
    Index 7: lng
    Index 8: population
*/

/* World Cities CSV Columns Reference:
    Index 0: city unicode
    Index 1: city ascii
    Index 2: lat
    Index 3: lng
    Index 4: country
    Index 5: iso2
    Index 6: iso3
    Index 9: population
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
    const [geocoder, setGeocoder] = React.useState(null)
    const [markers, setMarkers] = React.useState([])
    const [points, setPoints] = React.useState([])
    const [voronoi_bounds, setVoronoiBounds] = React.useState([])
    const [circles, setCircles] = React.useState([])
    const [polygons, setPolygons] = React.useState([])
    const [showMarkers, setShowMarkers] = React.useState(true)
    const [showDiagram, setShowDiagram] = React.useState(true)
    const [isNearbySearch, setIsNearbySearch] = React.useState(true)
    const [usData, setUsData] = React.useState(null)
    const [worldData, setWorldData] = React.useState(null)


    React.useEffect(() => {
    
        console.log("Loading US Cities database...")
        const usConfig = {
            complete: (results) => {
                console.log('US Cities parsing complete')
                results.data.shift()
                setUsData(results.data)
            },
            download: true,
            error: (error, file) => {
                console.error('Error parsing US cities:', error, file);
            },
            };
        
        readString(usCSV, usConfig);
    
        console.log("Loading World Cities database...")
        const worldConfig = {
            complete: (results) => {
                console.log('World cities parsing complete')
                results.data.shift()
                setWorldData(results.data)
            },
            download: true,
            error: (error, file) => {
                console.error('Error parsing world cities:', error, file);
            },
            };
        
        readString(worldCSV, worldConfig);

    }, [])

    const onLoad = React.useCallback((map) => {
      const places_service = new window.google.maps.places.PlacesService(map)
      const geocoder_service = new window.google.maps.Geocoder()
      setPlaces(places_service)
      setGeocoder(geocoder_service)
      setMap(map)
    }, [])
  
    const onUnmount = React.useCallback(() => {
      setMap(null)
      setPlaces(null)
      setValue('')
      setGeocoder(null)
      setMarkers([])
      setPoints([])
      setVoronoiBounds([])
      setCircles([])
      setPolygons([])
      setShowMarkers(true)
      setShowDiagram(true)
      setIsNearbySearch(true)
      setUsData(null)
    }, [])

  const fetchNearby = (type) => {
    if(map.zoom >= 12) {
        resetMap()
        console.log("Fetching for places of type ", type);
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

  const fetchKeyword = (keyword) => {
    if(map.zoom >= 12) {
        resetMap()
        console.log("Fetching for places with keyword ", keyword);
        const request = {
            query: keyword,
            location: map.center,
            radius: 3000
        }
        
        places.textSearch(request, (results, status) => {
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

        points.push([lng, lat])
    }

    setMarkers(new_markers)
    setPoints(points)
    setVoronoiBounds([min_lng - 0.01, min_lat - 0.01, max_lng + 0.01, max_lat + 0.01])
  }

  const createCitiesMarkers = (cities, isWorld) => {
    resetMarkers()
    const new_markers = []

    //lat is considered y coord, lng is x coord
    let min_lat = null;
    let max_lat = null;
    let min_lng = null;
    let max_lng = null;
    let i = 0;
    for(const city of cities) {
        let lat;
        let lng;
        if(isWorld) {
            lat = parseFloat(city[2])
            lng = parseFloat(city[3])

            new_markers.push(<Marker key={i} position={{ lat, lng }} />)
        } else {
            lat = parseFloat(city[6])
            lng = parseFloat(city[7])
    
            new_markers.push(<Marker key={i} position={{ lat, lng }} />)
        }

        if(!min_lat || lat < min_lat) min_lat = lat;
        if(!max_lat || lat > max_lat) max_lat = lat;
        if(!min_lng || lng < min_lng) min_lng = lng;
        if(!max_lng || lng > max_lng) max_lng = lng;

        points.push([lng, lat])
        i++
    }

    setMarkers(new_markers)
    setPoints(points)
    setVoronoiBounds([min_lng - 0.1, min_lat - 0.1, max_lng + 0.1, max_lat + 0.1])   
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

  const getCities = (isState) => {
      if(map.zoom < (isState ? 7 : 4)) {
          const word = isState ? "state" : "country"
          console.error(`Map is not zoomed in enough to fetch cities for current ${word}.`);
          alert(`Map is not zoomed in enough to fetch cities for current ${word}.`);
          return;
      }

      // Reverse Geocoding to find state name
      resetMap()
      console.log("Reverse geocoding...");
      const request = {
          location: map.center
      }
      
      geocoder.geocode(request, (results, status) => {
          if (status === "OK") {
            let state;
            let country;
            for(const area of results) {
                if(area.types.includes("administrative_area_level_1")) {
                    state = area.address_components[0].long_name
                  
                }
                if(area.types.includes("country")) {
                    country = {
                        short: area.address_components[0].short_name,
                        long: area.address_components[0].long_name
                    }
                }
            }

            if(state && isState) {
                if(country.short !== "US") {
                    console.error("Cannot add state markers outside the US")
                    alert("Cannot add state markers outside the US")
                }
                const state_cities = usData.filter(city => city[3] === state && parseInt(city[8]) >= 1000 )
    
                createCitiesMarkers(state_cities, false)
            } else if (country && !isState) {
                let country_cities = []
                if(country.short === "US") {
                    country_cities = usData.filter(city => parseInt(city[8]) >= 5000 )
                    createCitiesMarkers(country_cities, false)
                } else {
                    country_cities = worldData.filter(city => city[4] === country.long || city[5] === country.short || city[6] === country.short)
                    createCitiesMarkers(country_cities, true)
                } 
            } else {
                console.error("Cannot add city markers here")
                alert("Cannot add city markers here")
            }
          } else {
              console.error("There was a problem with the geocoding request: ", status);
              alert("There was a problem with the geocoding request: ", status)
          }           
      })

  }

  const generateVoronoi = () => {
      if(markers.length === 0) {
          console.error("Must generate some markers on the graph first!")
          alert("Must generate some markers on the graph first!")
          return;
      }

      console.log("Generating Voronoi diagram...")

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
                                radius={markers.length > 100 ? 10 : 3} 
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

        <ButtonGroup className="search-buttons">
            <Button 
                onClick={() => {
                    if(!isNearbySearch) setIsNearbySearch(true)
                }}
                variant={isNearbySearch ? "success" : "outline-success"}
            >Search By Type</Button>
            <Button 
                onClick={() => {
                    if(isNearbySearch) setIsNearbySearch(false)
                }}
                variant={!isNearbySearch ? "success" : "outline-success"}
            >Search By Keyword</Button>
        </ButtonGroup>

        <Form onSubmit={(ev) => {
            ev.preventDefault();
            if(isNearbySearch) {
                fetchNearby(value);
            } else {
                fetchKeyword(value);
            }
            
        }}
        className="search-form" inline>
            <FormControl 
                onChange={(ev) => {setValue(ev.target.value)}} 
                name="type" 
                type="text" 
                placeholder={isNearbySearch ? "Enter a place type (e.g. hospital)" : "Enter a keyword or query to search with"} 
                className="search-box mr-sm-2" />
            <Button type="submit" variant="info">Find Places</Button>
        </Form>
        
        <ButtonGroup className="cities-buttons">
            <Button onClick={() => getCities(true)} variant="info">Add State Cities Markers</Button>
            <Button onClick={() => getCities(false)} variant="info">Add Country Cities Markers</Button> 
        </ButtonGroup>

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