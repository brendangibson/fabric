import React from 'react'
import { Link } from 'react-router-dom'
const HEIGHT = "5vh"

const headerStyle = {
    height: HEIGHT,
    width: "100vw",
    position: "fixed",
    backgroundColor: "white"
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
    lineHeight: HEIGHT
}

export default function Header() {
    return (
        <div>
            <div style={headerStyle}>
                <Link to="/">
                    <img src="/logo.png" alt="*" style={logoStyle} />
                </Link>
                <div style={titleStyle}>Warehouse</div>
            </div>
            <div style={wrapperStyle} />

        </div>
    );
}