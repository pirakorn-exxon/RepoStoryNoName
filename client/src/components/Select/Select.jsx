import React from "react";
import PropTypes, { oneOfType } from "prop-types";
import clsx from "clsx";
import { Field } from '@exxonmobil/react-unity';

/** Allows a user to select a value from a series of options */
const Select = props => {
  const {
    label,
    id,
    note,
    value,
    valid,
    error,
    disabled,
    onChange,
    readOnly,
    name,
    className,
    children,
    selectProps,
    selectWidth,
    ...other
  } = props;

  const { className: selectClassName = "", ...otherSelectProps } = selectProps;

  return (
    <Field
      className={clsx("em-c-field--date-picker", className)}
      error={error}
      valid={valid}
      disabled={disabled}
      readOnly={readOnly}
      {...other}
    >
      {label && <Field.Label>{label}</Field.Label>}
      <Field.Body>
        <select
          className={clsx("em-c-select", selectClassName)}
          id={id}
          onChange={onChange}
          value={value}
          disabled={disabled}
          name={name}
          style={{width: selectWidth}}
          {...otherSelectProps}
        >
          {children}
        </select>
      </Field.Body>
      {note && <Field.Note>{note}</Field.Note>}
    </Field>
  );
};

Select.propTypes = {
  /** Label for checkbox list */
  label: oneOfType([PropTypes.string, PropTypes.number]),
  /** note shown */
  note: oneOfType([PropTypes.string, PropTypes.number]),
  /** value is the value currently chosen of the select */
  value: oneOfType([PropTypes.string, PropTypes.number]),
  /** If the Select is valid or not */
  valid: PropTypes.bool,
  /** If the Select is error state or not */
  error: PropTypes.bool,
  /** If the select are disabled or not */
  disabled: PropTypes.bool,
  /** If the selec is read only or not */
  readOnly: PropTypes.bool,
  /** Function triggered by changes to the checkbox */
  onChange: PropTypes.func,
  /** Name for accessibility */
  name: PropTypes.string,
  /** id for accessibility */
  id: PropTypes.string,
  /** Props to send to the select element */
  selectProps: PropTypes.object,
  /** Additional css classes to append to the outer element */
  className: PropTypes.string,
  /** React component children, in this case Radios */
  children: PropTypes.node,
  /** Custom Select Width */
  selectWidth: PropTypes.string
};

Select.defaultProps = {
  label: "",
  note: "",
  value: undefined,
  valid: false,
  error: false,
  disabled: false,
  readOnly: false,
  onChange: () => {},
  name: "",
  id: "",
  className: "",
  selectProps: {},
  children: null,
  selectWidth: ""
};

export default Select;
