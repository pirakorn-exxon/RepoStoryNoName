import React  from "react";
import { Route, Switch } from "react-router-dom";
import Layout from 'components/Layout';
import Home from 'pages/Home';
import ADODetails from "pages/ADODetails";
import GraphDetails from "pages/GraphDetails";
import GetAllProject from "pages/GetAllProject"
import GetAllRepo from "pages/GetAllRepo"
import GetAllBranch from 'pages/GetAllBranch';
import About from "pages/About";
import GetBranchInfo from 'pages/GetBranchInfo';
import GetGraph from 'pages/GetGraph';

/**
 * 
 * This component defines the definiton of all the routes used by this application. If you need
 * to add new pages to your application, this is where you would do so. 
 * 
 * Remember to add a way to navigate to any new pages. Currently, there is some navigation logic setup
 * in src/components/Header/index.js
 * 
 * This relies on "react-router-dom". For more information and documentation, see: https://reactrouter.com/web/api
 * 
 */

const App = () => (
    <Layout>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/adodetails/projectid/:param_projectid/repoid/:param_repoid/branch/:param_branchname" component={ADODetails} />
            <Route path="/graphdetails/projectid/:param_projectid/repoid/:param_repoid/display/:param_display" component={GraphDetails} />
            <Route path="/get-all-project" component={GetAllProject} />
            <Route path="/get-all-repo" component={GetAllRepo} />
            <Route path="/get-all-branch" component={GetAllBranch} />
            <Route path="/about" component={About} />
            <Route path="/get-branch-info" component={GetBranchInfo} />
            <Route path="/get-graph" component={GetGraph} />
        </Switch>
    </Layout>
);

export default App