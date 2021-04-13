import '../css/Main.css';
import Button from 'react-bootstrap/Button'

function Main() {
  return (
    <div className="Main">
        <div className="map"></div>
        <Button variant="outline-info">Generate Voronoi Diagram</Button>
    </div>
  );
}

export default Main;