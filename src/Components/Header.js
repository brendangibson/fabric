import React from 'react'
import { Link } from 'react-router-dom'
const HEIGHT = "8vh"

const headerStyle = {
    height: HEIGHT,
    width: "90vw",
    position: "fixed",
    backgroundColor: "white",
    zIndex: 100,
    borderBottom: "1px solid #666"
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

export default function Header() {
    return (
        <div>
            <div style={headerStyle}>
                <Link to="/">
                    <img src="/bigLogo.png" alt="*" style={logoStyle} />
                </Link>
                <div style={titleStyle}>Warehouse</div>
            </div>
            <div style={wrapperStyle} />

        </div>
    );
}