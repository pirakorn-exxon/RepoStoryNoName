import React from 'react';
import { Section } from '@exxonmobil/react-unity';

/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const GetBranchInfo = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/get-branch-info?projectid=4cd92f5c-4d71-418f-841b-de2516cc9005&repositoryid=97286a02-cd61-40a8-90e6-ab830cc2deba&branchid=features%2FTest-API")
        .then((res) => res.json())
        .then((data) => setData(data));
    }, []);

    return <Section title="Get Branch Info">
        <div><pre>Data from server: {!data ? "No data" : JSON.stringify(data, null, 4)}</pre></div>
    </Section>
}

export default GetBranchInfo;