import React from 'react';
import { Fieldset, Grid, LineLengthContainer, Button, Toggle } from '@exxonmobil/react-unity';
import '../../index.css';
import { useHistory } from "react-router-dom";
import { getProjectApi } from "../../apis/projectApi";
import { getRepoApi } from "../../apis/repoApi";
import { getBranchApi } from "../../apis/branchApi";
//Custom Component
import Select from '../../components/Select';

const Home = () => {
    const [projects, setProjects] = React.useState([]);
    const [project, setProject] = React.useState("");
    const [repos, setRepos] = React.useState([]);
    const [repo, setRepo] = React.useState("");
    const [branches, setBranches] = React.useState([]);
    const [branch, setBranch] = React.useState("");
    const [display, setDisplay] = React.useState("table");

    //Custom Style
    const divStyle = {
        margin: 'auto',
        width: '50 %',
        padding: '10px'
    }
    const textMargin = {
        marginTop: '4rem'
    }
    const formContainer = {
        padding: '3rem',
        border: '1px solid rgba(0, 0, 0, 0.05)'
    }
    //End custom style

    //Internal function

    const history = useHistory();
    const navigateToDetail = (e, projectid, repoid, branchname, display) => {
        e.preventDefault();
        if (display === 'table') {
            let path = "/adodetails/projectid/" + projectid + "/repoid/" + repoid + "/branch/" + encodeURIComponent(branchname);
            history.push(path);
        }
        else if (display === 'graph') {
            let path = "/graphdetails/projectid/" + projectid + "/repoid/" + repoid + "/display/" + display;
            history.push(path);
        }

    };


    const fetchDataFromProject = (e) => {
        setProject(e.target.value);

        if (e.target.value !== '') {
            setRepos([]);
            getRepoApi(e.target.value).then(_repoLists => {
                setRepos(_repoLists.Repos)
                setRepo(_repoLists.Repos[0].id)

                setBranches([]);
                getBranchApi(e.target.value, _repoLists.Repos[0].id).then(_brachLists => {
                    if (_brachLists.Branches.length > 0) {
                        setBranches(_brachLists.Branches);
                        setBranch(_brachLists.Branches[0].name.replace("refs/heads/", ""));
                    }

                })
            });
        }
    }

    const fetchDataFromRepository = (project, e) => {
        setRepo(e.target.value);

        if (e.target.value !== '') {
            setBranches([]);
            getBranchApi(project, e.target.value).then(_brachLists => {
                if (_brachLists.Branches.length > 0) {
                    setBranches(_brachLists.Branches);
                    setBranch(_brachLists.Branches[0].name.replace("refs/heads/", ""));
                }

            })

        }
    }
    //End internal function


    //Before render

    React.useEffect(() => {
        if (projects.length <= 0) {
            // setProjects(mockupProject.Projects);
            getProjectApi().then(_projectData => {
                setProjects(_projectData.Projects);

            }, [projects])
        }

    })
    //End before render

    return (
        <div>
            <LineLengthContainer style={divStyle}>
                <center><h1>Welcome to Repo Story</h1> </center>
                <Fieldset style={textMargin}>
                    <div style={formContainer}>
                        <Grid variant="2-up">
                            <Grid.Item>
                                <h3>Display Mode:</h3>
                            </Grid.Item>
                            <Grid.Item>
                                <Toggle>
                                    <Toggle.Item
                                        id="table"
                                        key="table"
                                        name="table"
                                        value="table"
                                        onChange={e => setDisplay(e.target.value)}
                                        checked={display === "table"}
                                    >
                                        Table
                                    </Toggle.Item>
                                    <Toggle.Item
                                        id="graph"
                                        key="graph"
                                        name="graph"
                                        value="graph"
                                        onChange={e => setDisplay(e.target.value)}
                                        checked={display === "graph"}
                                    >
                                        Graph
                                    </Toggle.Item>
                                </Toggle>
                            </Grid.Item>
                            <Grid.Item>
                                <h3>Project Name:</h3>
                            </Grid.Item>
                            <Grid.Item>
                                {
                                    projects.length === 0
                                        ? <Select value={repo} selectWidth='250px' disabled>
                                            <option value="">loading...</option>
                                        </Select>
                                        : <Select
                                            value={project}
                                            onChange={(e) => fetchDataFromProject(e)}
                                            selectWidth='250px'
                                        >
                                            <optgroup>
                                                <option value="">Select</option>
                                                {
                                                    projects.map((project) => (
                                                        <option key={project.id} value={project.id}>{project.name}</option>
                                                    ))
                                                }
                                            </optgroup>
                                        </Select>

                                }

                            </Grid.Item>
                            <Grid.Item>
                                <h3>Repository Name:</h3>
                            </Grid.Item>
                            <Grid.Item>
                                {
                                    repos.length === 0
                                        ? <Select value={repo} selectWidth='250px' disabled></Select>
                                        : <Select
                                            value={repo}
                                            onChange={(e) => fetchDataFromRepository(project, e)}
                                            selectWidth='250px'
                                        >
                                            <optgroup>
                                                {
                                                    repos.map((repo) => (
                                                        <option key={repo.id} value={repo.id}>{repo.name}</option>
                                                    ))
                                                }
                                            </optgroup>
                                        </Select>
                                }
                            </Grid.Item>
                            <Grid.Item>
                                {
                                    display === 'table'
                                        ? <h3>Branch Name:</h3>
                                        : ''
                                }

                            </Grid.Item>
                            <Grid.Item>
                                {
                                    display === 'table'
                                        ? branches.length <= 0
                                            ? <Select value='' selectWidth='250px' disabled />
                                            : <Select
                                                value={branch}
                                                onChange={(e) => setBranch(e.target.value)}
                                                selectWidth='250px'
                                            >
                                                <optgroup>
                                                    {
                                                        branches.map((branch) => (
                                                            <option key={branch.name.replace("refs/heads/", "")} value={branch.name.replace("refs/heads/", "")}>{branch.name.replace("refs/heads/", "")}</option>
                                                        ))
                                                    }
                                                </optgroup>
                                            </Select>
                                        : ''
                                }

                            </Grid.Item>
                        </Grid>

                        <center>
                            {
                                repos.length === 0
                                    ? <Button className="em-u-margin-half" variant="primary" disabled>Search</Button>
                                    : <Button
                                        className="em-u-margin-half"
                                        variant="primary"
                                        onClick={(e) => navigateToDetail(e, project, repo, branch, display)}>
                                        Search
                                    </Button>
                            }
                        </center>

                    </div>
                </Fieldset>
            </LineLengthContainer>
        </div>

    )
}

export default Home;