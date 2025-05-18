import React from "react";
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/LightWeight_logo.png';

export default function Header() {
    return (
        <Navbar bg="white" variant="light" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img src={logo} alt="LightWeight Logo" height={40} className="me-2"/>
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}