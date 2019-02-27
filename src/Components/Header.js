import React from 'react'
import { Link } from 'react-router-dom'
import NavDropdown from 'react-bootstrap/NavDropdown'

const HEIGHT = "8vh"

const headerStyle = {
    height: HEIGHT,
    width: "90vw",
    position: "fixed",
    backgroundColor: "white",
    zIndex: 100,
    borderBottom: "1px solid #666",
    display: "flex",
    justifyContent: "space-between"
}

const wrapperStyle = {
    height: HEIGHT
}

const logoStyle = {
    width: HEIGHT,
    height: HEIGHT
}

const titleStyle = {
    textAlign: "center",
    fontSize: "4vh",
    position: "absolute",
    top: 0,
    width: "100%",
    lineHeight: HEIGHT,
    zIndex: -1
}

const dropdownStyle = {
    fontSize: "6vh",
    lineHeight: "6vh"
}

export default function Header() {
    return (
        <div>
            <div style={headerStyle}>
                <Link to="/">
                    <img src="/bigLogo.png" alt="*" style={logoStyle} />
                </Link>
                <div style={titleStyle}>Warehouse</div>
                <NavDropdown title="☰" id="basic-nav-dropdown" style={dropdownStyle}>
                    <NavDropdown.Item href="/shipments">Shipments</NavDropdown.Item>
                </NavDropdown>
            </div>
            <div style={wrapperStyle} />

        </div>
    );
}