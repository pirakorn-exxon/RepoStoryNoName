import * as React from "react";
import { FieldProps } from "../Field/index";

export interface SelectProps extends FieldProps {
  /** Label for checkbox list*/
  label?: any;
  /** note shown*/
  note?: any;
  /** value is the value currently chosen of the select*/
  value?: any;
  /** If the Select is valid or not*/
  valid?: boolean;
  /** If the Select is error state or not*/
  error?: boolean;
  /** If the select are disabled or not*/
  disabled?: boolean;
  /** If the selec is read only or not*/
  readOnly?: boolean;
  /** Function triggered by changes to the checkbox*/
  onChange?: (...args: any[]) => any;
  /** Name for accessibility*/
  name?: string;
  /** id for accessibility*/
  id?: string;
  /** Props to send to the select element */
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  /** Additional css classes to append to the outer element*/
  className?: string;
  /** React component children, in this case Radios*/
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps>;
