import React from 'react';
import { Section } from '@exxonmobil/react-unity';

/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const GetAllRepo = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/get-all-repo?projectid=4cd92f5c-4d71-418f-841b-de2516cc9005")
        .then((res) => res.json())
        .then((data) => setData(data));
    }, []);

    return <Section title="Get All Repo">
        <div><pre>Data from server: {!data ? "No data" : JSON.stringify(data, null, 4)}</pre></div>
    </Section>
}

export default GetAllRepo;