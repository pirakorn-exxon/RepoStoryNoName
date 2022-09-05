```jsx
const [value, setValue] = React.useState("");
const [errorValue, setErrorValue] = React.useState("");
const [validValue, setValidValue] = React.useState("");

<Fieldset>
  <Grid variant="2-up">
    <Grid.Item>
      <Select
        label="Default"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <optgroup label="Option Group">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
        </optgroup>
      </Select>
    </Grid.Item>
    <Grid.Item>
      <Select label="Disabled" disabled>
        <optgroup label="Option Group">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
        </optgroup>
      </Select>
    </Grid.Item>
    <Grid.Item>
      <Select
        label="Error"
        value={errorValue}
        error
        note="Invalid State"
        onChange={(e) => setErrorValue(e.target.value)}
      >
        <optgroup label="Option Group">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
        </optgroup>
      </Select>
    </Grid.Item>
    <Grid.Item>
      <Select
        label="Valid"
        value={validValue}
        valid
        note="Perfect selection"
        onChange={(e) => setValidValue(e.target.value)}
      >
        <optgroup label="Option Group">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
        </optgroup>
      </Select>
    </Grid.Item>
  </Grid>
</Fieldset>
```
