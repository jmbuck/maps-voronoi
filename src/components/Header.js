import Navbar from 'react-bootstrap/Navbar'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import '../css/Header.css';

function Header() {
  return (
    <Navbar bg="dark" variant="dark">
        <Navbar.Brand>Voronoi Maps</Navbar.Brand>
        <Form className="search-form" inline>
        <FormControl type="text" placeholder="Enter a place type (e.g. hospitals)" className="search-box mr-sm-2" />
        <Button variant="outline-info">Find Places</Button>
        </Form>
    </Navbar>
  );
}

export default Header;