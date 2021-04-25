import Navbar from 'react-bootstrap/Navbar'
import '../css/Footer.css';

function Footer() {
  return (
    <Navbar className="Footer" bg="dark" variant="dark">
        <Navbar.Text>Created by Jordan Buckmaster for CS 531: Computational Geometry</Navbar.Text>
        <Navbar.Text><a href="https://github.com/jmbuck/maps-voronoi">View the Repository</a></Navbar.Text>
        <Navbar.Text>US Cities and World Cities data provided at <a href="https://simplemaps.com/data/us-cities">simplemaps.com/data/us-cities</a></Navbar.Text>
    </Navbar>
  );
}

export default Footer;