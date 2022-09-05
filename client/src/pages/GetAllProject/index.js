import React from 'react';
import { Section } from '@exxonmobil/react-unity';

/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const GetAllProject = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/get-all-project")
        .then((res) => res.json())
        .then((data) => setData(data));
    }, []);

    return <Section title="Get All Project">
        <div><pre>Data from server: {!data ? "No data" : JSON.stringify(data, null, 4)}</pre></div>
    </Section>
}

export default GetAllProject;