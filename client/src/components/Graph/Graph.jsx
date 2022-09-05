import React from "react";
import PropTypes from "prop-types";
import { Gitgraph, Orientation, templateExtend, TemplateName } from '@gitgraph/react'


/** Allows a user to select a value from a series of options */
const Graph = props => {
  const {
    data,
    selectProps,
    ...other
  } = props;

  const { className: selectClassName = "", ...otherSelectProps } = selectProps;

  const withoutAuthor = templateExtend(TemplateName.Metro, {
    colors: [
      "#001219",
      "#005F73",
      "#0A9396",
      "#94D2BD",
      "#E9D8A6",
      "#EE9B00",
      "#CA6702",
      "#BB3E03",
      "#AE2012",
      "#9B2226"
    ],
    branch: {
      lineWidth: 2,
      label: {
        font: "normal 10pt Calibri"
      },
      spacing: 18
    },
    commit: {
      spacing: 44,
      dot: {
        size: 4
      },
      message: {
        displayAuthor: false,
        displayHash: false,
        font: "normal 10pt",
      }
    }
  });

  let branchObjList = {};
  return (
    <Gitgraph
      options={{
        // orientation: Orientation.Horizontal,
        template: withoutAuthor,
        responsive: true
      }}
    >
      {(gitgraph) => {
        // console.log(mockupData);
        data.map(data => {
          // console.log(data);
          if(data.Action === "Branch"){
            if(data.Parent === ""){
              branchObjList[data.BranchName] = gitgraph.branch(data.BranchName);
            } else {
              const tempParent = branchObjList[data.Parent];
              branchObjList[data.BranchName] = tempParent.branch(data.BranchName);
            }
          } else if(data.Action === "Commit"){
            const tempBranch = branchObjList[data.BranchName];
            tempBranch.commit(data.CommitName);
          } else if(data.Action === "Merge"){
            const tempParent = branchObjList[data.Parent];
            const tempCurrentBranch = branchObjList[data.BranchName];

            if(data.Tag !== ""){
              tempParent.merge(tempCurrentBranch).tag(data.Tag);
            } else {
              tempParent.merge(tempCurrentBranch);
            }
            
          }

        });
       
      }}
    </Gitgraph>
  );
};

Graph.propTypes = {
  /** If the select are disabled or not */
  data: PropTypes.array,
  selectProps: PropTypes.object,
};

Graph.defaultProps = {
 data: [],
 selectProps: {}
};

export default Graph;
