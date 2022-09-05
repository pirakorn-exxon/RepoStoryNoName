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
import { getReportApi } from "../../apis/reportApi"

//React Helper Tools
import Graph from '../../components/Graph'
import DataTable from 'react-data-table-component';
/**
 * 
 * A simple homepage component.
 * 
 * For more information on Sections in React Unity, see: https://reactunity.azurewebsites.net/#/Sections?id=section
 * 
 */

const ADODetails = () => {
    //Param State
    const { param_projectid, param_repoid, param_branchname } = useParams();

    //Search State
    const [projects, setProjects] = React.useState([]);
    const [project, setProject] = React.useState("");
    const [repos, setRepos] = React.useState([]);
    const [repo, setRepo] = React.useState("");
    const [branches, setBranches] = React.useState([]);
    const [branch, setBranch] = React.useState("");
    const [display, setDisplay] = React.useState("table");
    const [internalRun, setInternalRun] = React.useState(false);

    //Report State
    const [reportCommit, setReportCommit] = React.useState([]);
    const [totalCommit, setTotalCommit] = React.useState(0);
    const [createdBy, setCreatedBy] = React.useState("");
    const [latestSync, setLatestSync] = React.useState("");
    const [branchStatus, setBranchStatus] = React.useState("");
    const [branchLatestUpdate, setBranchLatestUpdate] = React.useState(-1);
    const [reportLoading, setReportLoading] = React.useState(false);

    //Internal function
    const history = useHistory();

    const getDefaultBranch = (branches) => {
        let defaultBranch = branches[0];
        console.log(branches);
        branches.map((data) => {
            if (data.name == 'refs/heads/main' || data.name == 'refs/heads/master') {
                defaultBranch = data;
            }
        })
        return defaultBranch.name.replace("refs/heads/", "");
    }

    const getReport = (e, projectid, repoid, branchname) => {
        e.preventDefault();
        setReportCommit([]);
        setTotalCommit(0);
        setCreatedBy("");
        setLatestSync("");
        setBranchStatus("");
        setBranchLatestUpdate(-1);

        setReportLoading(true);

        getReportApi(projectid, repoid, branchname).then(_reports => {
            console.log(_reports);
            let textBranchStatus = "ahead-" + _reports.AheadCount + " behind-" + _reports.BehindCount;

            let tempLatestCommitDate = new Date(_reports.LatestCommitDate);
            let Difference_In_Time = new Date() - tempLatestCommitDate;
            let diff_In_Month = Difference_In_Time / (1000 * 3600 * 24 * 30);

            setTotalCommit(_reports.TotalCommit);
            setCreatedBy(_reports.CreatedBy);
            setLatestSync(_reports.LatestSyncWithDefaultBranch);
            setReportCommit(_reports.Commits);
            setBranchStatus(textBranchStatus);
            setBranchLatestUpdate(diff_In_Month.toFixed());
            setReportLoading(false);

        });

    }

    const conditionalRowStyles = [
        {
            when: row => 1===1,
            style: {
                fontSize: '15px'
            }
        },
        {
            when: row => row.date === latestSync,
            style: {
                backgroundColor: "#d4f3e6",
                fontSize: '15px'
            }
        }
        
    ]


    {/* Display Result */ }
    const columns = [
        {
            name: 'Date',
            selector: row => DateReformat(row.date),
            format: row => row.date,
            "columnDefs": [
                {
                    "type": "date"
                }
            ],
            sortable: true,
            reorder: true
        },
        {
            name: 'Committer',
            selector: row => row.committer,
            sortable: true,
            reorder: true
        },
        {
            name: 'Comment',
            selector: row => row.comment,
            sortable: true,
            reorder: true
        }
    ];

    const DateReformat = (date) => {
        let d = new Date(date);
        let month = (d.getMonth() + 1).toString();
        let day = d.getDate().toString();
        let year = d.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
    }

    const navigateToDetail = (e, projectid, repoid) => {
        e.preventDefault();

        let path = "/graphdetails/projectid/" + projectid + "/repoid/" + repoid + "/display/" + display;
        history.push(path);

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
                        // setBranch(_brachLists.Branches[0].name.replace("refs/heads/", ""));
                        setBranch(getDefaultBranch(_brachLists.Branches));
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
                console.log(_brachLists.Branches);
                if (_brachLists.Branches.length > 0) {
                    setBranches(_brachLists.Branches);
                    // setBranch(_brachLists.Branches[0].name.replace("refs/heads/", ""));

                    setBranch(getDefaultBranch(_brachLists.Branches));
                }

            })

        }
    }


    //End internal function


    //Before renders

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
                    setBranches(_branchData.Branches);
                    if (decodeURIComponent(param_branchname) !== '') {
                        setBranch(decodeURIComponent(param_branchname));
                    } else {
                        // setBranch(_branchData.Branches[0].name.replace("refs/heads/", ""));
                        setBranch(getDefaultBranch(_branchData.Branches));
                    }

                }, [branches]);
            }

            if (param_projectid !== '' && param_repoid !== '' && param_branchname !== '') {

                if (createdBy === '') {
                    setReportLoading(true);
                    getReportApi(param_projectid, param_repoid, decodeURIComponent(param_branchname)).then(_reports => {
                        let textBranchStatus = "ahead-" + _reports.AheadCount + " behind-" + _reports.BehindCount;

                        let tempLatestCommitDate = new Date(_reports.LatestCommitDate);
                        let Difference_In_Time = new Date() - tempLatestCommitDate;
                        let diff_In_Month = Difference_In_Time / (1000 * 3600 * 24 * 30);

                        setTotalCommit(_reports.TotalCommit);
                        setCreatedBy(_reports.CreatedBy);
                        setLatestSync(_reports.LatestSyncWithDefaultBranch);
                        setReportCommit(_reports.Commits);
                        setBranchStatus(textBranchStatus);
                        setBranchLatestUpdate(diff_In_Month.toFixed());
                        setReportLoading(false);

                    }, [totalCommit], [createdBy], [latestSync], [reportCommit], [branchStatus], [branchLatestUpdate], [reportLoading]);
                }

            }
        }


        setInternalRun(true);
    })



    //End before renders


    return (
        <div>
            {/* Search Section */}
            <Container>
                <Fieldset>
                    <Fieldset.Legend>Search:</Fieldset.Legend>
                    <Grid variant="2-up">
                        <Grid.Item>
                            {
                                reportLoading === true
                                    ? <Toggle label="Display mode" disabled>
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
                                            onClick={(e) => navigateToDetail(e, project, repo, display)}
                                            checked={display === "graph"}
                                        >
                                            Graph
                                        </Toggle.Item>
                                    </Toggle>
                                    : <Toggle label="Display mode">
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
                                            onClick={(e) => navigateToDetail(e, project, repo, display)}
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
                        <Grid.Item>
                            {
                                branches.length === 0
                                    ? <Select label="Branch Name:" value='' selectWidth='250px' disabled>
                                        <option value=""></option>
                                    </Select>
                                    : <Select
                                        label="Branch Name:"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        selectWidth='100%'
                                    >
                                        <optgroup>
                                            {
                                                branches.map((branch) => (
                                                    <option key={branch.name.replace("refs/heads/", "")} value={branch.name.replace("refs/heads/", "")}>{branch.name.replace("refs/heads/", "")}</option>
                                                ))
                                            }
                                        </optgroup>
                                    </Select>

                            }

                        </Grid.Item>
                        <Grid.Item>
                            <div>
                                <label>Branch latest update:</label>
                            </div>
                            <div>
                                {
                                    branchLatestUpdate === -1
                                        ? <Button className="em-u-margin-half" variant="primary" color="main" style={{ width: '220px' }}></Button>
                                        : branchLatestUpdate > 6
                                            ? <Button className="em-u-margin-half" variant="primary" color="accent" style={{ width: '220px' }}>Inactive: {branchLatestUpdate} months</Button>
                                            : <Button className="em-u-margin-half" variant="primary" color="positive" style={{ width: '220px' }}>Active: {branchLatestUpdate} month(s)</Button>
                                }

                            </div>
                        </Grid.Item>
                        <Grid.Item>
                            <Button
                                className="em-u-margin-half"
                                variant="primary"
                                onClick={e => getReport(e, project, repo, branch)}
                                style={{ width: '220px' }}>
                                Search
                            </Button>

                        </Grid.Item>
                    </Grid>
                </Fieldset>
            </Container>
            <Container>
                {
                    reportLoading === false
                        ? <div>
                            <div>
                                <Fieldset>
                                    <Grid variant="4-up">
                                        <Grid.Item>
                                            <label>Total Commit:</label> {totalCommit}
                                        </Grid.Item>
                                        <Grid.Item>
                                            <label>Created by:</label> {createdBy}
                                        </Grid.Item>
                                        <Grid.Item>
                                            <label>Latest Sync to default:</label> {latestSync}
                                        </Grid.Item>
                                        <Grid.Item>
                                            <label>Branch Status:</label> {branchStatus}
                                        </Grid.Item>
                                    </Grid>
                                </Fieldset>
                            </div>
                            <div>
                                <DataTable
                                    columns={columns}
                                    data={reportCommit}
                                    pagination
                                    paginationPerPage={10}
                                    rowStyleField="datatableStyle"
                                    conditionalRowStyles={conditionalRowStyles}
                                />
                            </div>
                        </div>
                        : <ProgressBar label="Loading..." indeterminate hideValueLabel />

                }
            </Container>
        </div>
    )



}





export default ADODetails;