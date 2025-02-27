import { APIError, Filter, Linode } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Autocomplete } from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';

import {
  CustomPopper,
  SelectedIcon,
} from 'src/components/Autocomplete/Autocomplete.styles';
import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { mapIdsToLinodes } from 'src/utilities/mapIdsToLinodes';

interface LinodeSelectProps {
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Filter sent to the API when retrieving account Linodes. */
  filter?: Filter;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** The ID of the input. */
  id?: string;
  /** Override the default "Linode" or "Linodes" label */
  label?: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Optionally disable top margin for input label */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /* The options to display in the select. */
  options?: Linode[];
  /** Determine which Linodes should be available as options. */
  optionsFilter?: (linode: Linode) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* Render a custom option. */
  renderOption?: (linode: Linode, selected: boolean) => JSX.Element;
  /* Render a custom option label. */
  renderOptionLabel?: (linode: Linode) => string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps;
}

export interface LinodeMultiSelectProps extends LinodeSelectProps {
  /* Enable multi-select. */
  multiple: true;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode[]) => void;
  /* An array of `id`s of Linodes that should be selected or a function that should return `true` if the Linode should be selected. */
  value: ((linode: Linode) => boolean) | null | number[];
}

export interface LinodeSingleSelectProps extends LinodeSelectProps {
  /* Enable single-select. */
  multiple?: false;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode | null) => void;
  /* The `id` of the selected Linode or a function that should return `true` if the Linode should be selected. */
  value: ((linode: Linode) => boolean) | null | number;
}

/**
 * A select input allowing selection between account Linodes.
 */
export const LinodeSelect = (
  props: LinodeMultiSelectProps | LinodeSingleSelectProps
) => {
  const {
    clearable = true,
    disabled,
    errorText,
    filter,
    helperText,
    id,
    label,
    loading,
    multiple,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    onSelectionChange,
    options,
    optionsFilter,
    placeholder,
    renderOption,
    renderOptionLabel,
    sx,
    value,
  } = props;

  const { data, error, isLoading } = useAllLinodesQuery({}, filter);

  const [inputValue, setInputValue] = React.useState('');

  const linodes = optionsFilter ? data?.filter(optionsFilter) : data;

  React.useEffect(() => {
    /** We want to clear the input value when the value prop changes to null.
     * This is for use cases where a user changes their region and the Linode
     * they had selected is no longer available.
     */
    if (value === null) {
      setInputValue('');
    }
  }, [value]);

  return (
    <Autocomplete
      getOptionLabel={(linode: Linode) =>
        renderOptionLabel ? renderOptionLabel(linode) : linode.label
      }
      noOptionsText={
        noOptionsMessage ?? (
          <i>{getDefaultNoOptionsMessage(error, isLoading, linodes)}</i>
        )
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      renderInput={(params) => (
        <TextField
          placeholder={
            placeholder
              ? placeholder
              : multiple
              ? 'Select Linodes'
              : 'Select a Linode'
          }
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          inputId={params.id}
          label={label ? label : multiple ? 'Linodes' : 'Linode'}
          loading={isLoading}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props} data-qa-linode-option>
            {renderOption ? (
              renderOption(option, selected)
            ) : (
              <>
                <Box
                  sx={{
                    flexGrow: 1,
                  }}
                >
                  {option.label}
                </Box>
                <SelectedIcon visible={selected} />
              </>
            )}
          </li>
        );
      }}
      value={
        typeof value === 'function'
          ? multiple && Array.isArray(value)
            ? linodes?.filter(value) ?? null
            : linodes?.find(value) ?? null
          : mapIdsToLinodes(value, linodes)
      }
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={false}
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      id={id}
      inputValue={inputValue}
      loading={isLoading || loading}
      multiple={multiple}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={options || (linodes ?? [])}
      popupIcon={<KeyboardArrowDownIcon />}
      sx={sx}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean,
  filteredLinodes: Linode[] | undefined
) => {
  if (error) {
    return 'An error occured while fetching your Linodes';
  } else if (loading) {
    return 'Loading your Linodes...';
  } else if (!filteredLinodes?.length) {
    return 'You have no Linodes to choose from';
  } else {
    return 'No options';
  }
};
