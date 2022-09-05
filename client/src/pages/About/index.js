import React from 'react';
import { Section, Pullquote, TextPassage, BulletedList, Table, Container, Tabs, Button } from '@exxonmobil/react-unity';

/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const About = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/get-all-project")
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);


    return (
        <div>
            <TextPassage>
                <h2>About RepoStory</h2>
                <p>
                    <b>RepoStory</b> is a dashboard where you can explore your code story in one place.
                    This dashboard can show every activities that happened in your repository including basic information (How many commits/ branches?).
                    Moreover, it can provide branch latest update as an indicator of inactive branch which recommend to be deleted.
                    Aim to get rid of unused branch to make our Azure DevOps environment more streamline and manageable.
                </p>

            </TextPassage>
            <Section title="How does it work?" variant="expandable">
                <p>
                    There are two main point of views <b>Table and Graph.</b> In each point of view, it will provide different information per below.
                    You can choose display mode at the top of the menu.
                </p>
                <Tabs>
                    <Tabs.Item title="Table">
                        <p>
                            <b>Table view</b>
                        </p>
                        <p>
                            <BulletedList>
                                <BulletedList.Item>
                                    Table view is provide overall information within selected branch.
                                    The information is including list of all commits within branch, Branch creator, Branch latest update, and etc.
                                </BulletedList.Item>
                            </BulletedList>
                        </p>
                        <p>
                            <b><u>Steps</u></b>
                        </p>
                        <Container>
                            <p>
                                1. Select your <b>Project > Repository > Branch</b>that you would like to explore.
                            </p>
                        </Container>
                        <Container>
                            <p>
                                2. The interesting information will come up which is <b>Branch Latest Update</b>.
                            </p>
                            <p>
                                <Container>
                                    <BulletedList>
                                        <BulletedList.Item>
                                            <Button className="em-u-margin-half" variant="primary" color="positive" style={{ width: '220px' }}>Recently Update</Button>
                                            : Latest commit to this branch is <b>less than 6 months ago</b>
                                        </BulletedList.Item>
                                        <BulletedList.Item>
                                            <Button className="em-u-margin-half" variant="primary" color="accent" style={{ width: '220px' }}>Inactive</Button>
                                            : Latest commit to this branch is <b>more than 6 months ago</b>
                                        </BulletedList.Item>
                                    </BulletedList>
                                </Container>
                            </p>
                        </Container>
                        <Container>
                            <p>
                                3. In table, it will show list of commits in your selected branch.
                                Start from latest date that you commit code along with committer and comments.
                            </p>
                            <picture>
                                <img src={require('./image/table.png')} width="1000" height="900" />
                            </picture>
                        </Container>
                    </Tabs.Item>
                    <Tabs.Item title="Graph">
                        <p>
                            <b>Graph view</b>
                        </p>
                        <p>
                            <BulletedList>
                                <BulletedList.Item>
                                    Graph view is provide big picture of relationship between Master and Children branches to observe and understand developer behavior.
                                    The information is including list of all commits within branch, Branch creator, Branch latest update, and etc.
                                </BulletedList.Item>
                            </BulletedList>
                        </p>
                        <p>
                            <b><u>Steps</u></b>
                        </p>
                        <Container>
                            <p>
                                1. Select your <b>Project and Repository</b> that you would like to explore.
                            </p>
                        </Container>
                        <Container>
                            2. Graph view will show relationship of master and children branches. To give you a big picture of commit journey.
                        </Container>
                        <Container>
                            <p style={{ padding: 20 }}>
                                <picture>
                                    <img src={require('./image/graph.png')} width="1000" height="900" />
                                </picture>
                            </p>
                        </Container>
                    </Tabs.Item>
                </Tabs>
            </Section>
            <Section title="Developed by" variant="expandable">
                <picture>
                    <img src={require('./image/team.png')} width="1000" height="900" />
                </picture>
            </Section>



        </div>

    )
}

export default About;