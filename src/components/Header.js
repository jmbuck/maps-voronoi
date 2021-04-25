import Navbar from 'react-bootstrap/Navbar'
import '../css/Header.css';

function Header() {
  return (
    <Navbar className="Header" bg="dark" variant="dark">
        <Navbar.Brand>Voronoi Maps</Navbar.Brand>

    </Navbar>
  );
}

export default Header;