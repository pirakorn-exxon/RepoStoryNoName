import React from "react";
import { shallow } from "enzyme";
import Select from "./Select";
it("Should render Select component correctly", () => {
  const wrapper = shallow(<Select></Select>);
  expect(wrapper).toMatchSnapshot();
});