import React from 'react';
import { Footer as Foot } from "@exxonmobil/react-unity";

/**
 * 
 * The main application Footer. For more information on Footers in React Unity,
 * see: https://reactunity.azurewebsites.net/#/Headers%20and%20footers?id=footer
 * 
 */

const Footer = ({ ...props }) => {
    return (
        <Foot className="Foot">
            <Foot.Link><a href="https://goto/reactunity" target="_blank" rel="noopener noreferrer">Powered By Shared Services</a></Foot.Link>
            { /* Add additional links below */ }
        </Foot>
    )
}

export default Footer;