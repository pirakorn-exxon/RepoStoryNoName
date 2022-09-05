import React from 'react';
import { Fieldset, Grid, Button, Container, Toggle, ProgressBar } from '@exxonmobil/react-unity';
import '../../index.css'
import { useHistory, useParams } from "react-router-dom";
//Custom Select
import Select from '../../components/Select'

//Api Callers
import { getProjectApi } from "../../apis/projectApi"
import { getRepoApi } from "../../apis/repoApi"
import { getBranchApi } from "../../apis/branchApi"
import { getGraphReportApi } from "../../apis/graphReportApi"

//React Helper Tools
import Graph from '../../components/Graph'

/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const GraphDetails = () => {
    const [projects, setProjects] = React.useState([]);
    const [project, setProject] = React.useState("");
    const [repos, setRepos] = React.useState([]);
    const [repo, setRepo] = React.useState("");
    const [branches, setBranches] = React.useState([]);
    const [branch, setBranch] = React.useState("");
    const [display, setDisplay] = React.useState("graph");
    const [reportGraph, setReportGraph] = React.useState([]);

    const [internalRun, setInternalRun] = React.useState(false);

    const { param_projectid, param_repoid } = useParams();

    const history = useHistory();
    const navigateToDetail = (e, projectid, repoid, branch) => {
        e.preventDefault();

        let path = "/adodetails/projectid/" + projectid + "/repoid/" + repoid + "/branch/" + encodeURIComponent(branch);
        history.push(path);

    };

    const searchGraph = (e, projectid, repoid) => {
        setReportGraph([]);
        getGraphReportApi(projectid, repoid).then(_reportData => {
            if (_reportData.length > 0) {
                setReportGraph(_reportData);
            }

        });
    }

    const getDefaultBranch = (branches) => {
        let defaultBranch = branches[0];
        
        branches.map((data) => {
            if (data.name === 'refs/heads/main' || data.name === 'refs/heads/master') {
                defaultBranch = data;
            }
        })
        return defaultBranch.name.replace("refs/heads/", "");
    }
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

                });
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
                    setBranch(getDefaultBranch(_brachLists.Branches))
                    // setBranch(_brachLists.Branches[0].name.replace("refs/heads/", ""));
                }

            })

        }
    }
    /** Mock up data */
    const mockupData = [
        {
            "Action": "Branch",
            "BranchName": "Master",
            "CommitName": "",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Commit",
            "BranchName": "Master",
            "CommitName": "Initial commit",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Branch",
            "BranchName": "Develop",
            "CommitName": "",
            "Parent": "Master",
            "Tag": ""
        },
        {
            "Action": "Commit",
            "BranchName": "Develop",
            "CommitName": "Make it work",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Commit",
            "BranchName": "Develop",
            "CommitName": "Make it right",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Commit",
            "BranchName": "Develop",
            "CommitName": "Make it fast",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Branch",
            "BranchName": "A-feature",
            "CommitName": "",
            "Parent": "Develop",
            "Tag": ""
        },
        {
            "Action": "Commit",
            "BranchName": "A-feature",
            "CommitName": "Prepare v1",
            "Parent": "",
            "Tag": ""
        },
        {
            "Action": "Merge",
            "BranchName": "A-feature",
            "CommitName": "",
            "Parent": "Develop",
            "Tag": ""
        },
        {
            "Action": "Merge",
            "BranchName": "Develop",
            "CommitName": "",
            "Parent": "Master",
            "Tag": "v1.0.0"
        },
        {
            "Action": "Commit",
            "BranchName": "A-feature",
            "CommitName": "Hotfix-Extended feature",
            "Parent": "",
            "Tag": ""
        }
    ];

    React.useEffect(() => {
        //Display Project
        if (internalRun === false) {
            if (projects.length <= 0 && internalRun === false) {
                getProjectApi().then(_projectData => {
                    setProjects(_projectData.Projects);
                    if (param_projectid !== '') {
                        setProject(param_projectid);
                    } else {
                        setProject(_projectData.Projects[0].id);
                    }

                }, [projects]);
            }

            //Display Repository
            if (repos.length <= 0 && internalRun === false) {
                getRepoApi(param_projectid).then(_repoData => {
                    setRepos(_repoData.Repos);
                    if (param_repoid !== '') {
                        setRepo(param_repoid);
                    } else {
                        setRepo(_repoData.Repos[0].id);
                    }

                }, [repos]);
            }

            //Display Branch
            if (branches.length <= 0 && internalRun === false) {
                getBranchApi(param_projectid, param_repoid).then(_branchData => {
                    // setBranch(_branchData.Branches[0].name.replace("refs/heads/", ""));
                    setBranch(getDefaultBranch(_branchData.Branches))
                }, [branch]);
            }

            if (param_projectid !== '' && param_repoid !== '') {
                getGraphReportApi(param_projectid, param_repoid).then(_reportData => {
                    setReportGraph(_reportData);
                }, [reportGraph]);
            }

        }

        setInternalRun(true);
    })

    return (
        <div>
            {/* Search Section */}
            <Container>
                <Fieldset>
                    <Fieldset.Legend>Search:</Fieldset.Legend>
                    <Grid variant="2-up">
                        <Grid.Item>
                            {
                                repos.length === 0
                                    ? <Toggle label="Display mode" disabled>
                                        <Toggle.Item
                                            id="table"
                                            key="table"
                                            name="table"
                                            value="table"
                                            onClick={(e) => navigateToDetail(e, project, repo, branch)}
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
                                    : <Toggle label="Display mode" >
                                        <Toggle.Item
                                            id="table"
                                            key="table"
                                            name="table"
                                            value="table"
                                            onClick={(e) => navigateToDetail(e, project, repo, branch)}
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

                            }
                        </Grid.Item>
                    </Grid>
                    <Grid variant="2-up">
                        <Grid.Item>
                            {

                                projects.length === 0
                                    ? <Select label="Project Name:" value={project} selectWidth='250px' disabled>
                                        <option value="">loading...</option>
                                    </Select>
                                    : <Select
                                        label="Project Name:"
                                        value={project}
                                        onChange={(e) => fetchDataFromProject(e)}
                                        selectWidth='100%'
                                    >
                                        <optgroup>
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
                            {
                                repos.length === 0
                                    ? <Select label="Repository Name:" value={repo} selectWidth='250px' disabled>
                                        <option value="">loading...</option>
                                    </Select>
                                    : <Select
                                        label="Repository Name:"
                                        value={repo}
                                        onChange={(e) => fetchDataFromRepository(project, e)}
                                        selectWidth='100%'
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

                    </Grid>
                    <Button
                        className="em-u-margin-half"
                        variant="primary"
                        onClick={(e) => searchGraph(e, project, repo)}
                        style={{ width: '220px' }}>
                        Search
                            </Button>
                </Fieldset>
            </Container>
            <Container>
                {
                    reportGraph.length === 0
                        ? <ProgressBar label="Loading..." indeterminate hideValueLabel />
                        : <div style={{ textAlign: 'center' }}><Graph data={reportGraph} /></div>

                }
            </Container>

        </div>

    )
}

export default GraphDetails;