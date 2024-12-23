import { useEffect, Fragment, useState } from "react";
import { assert } from "keycloakify/tools/assert";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import {
    useUserProfileForm,
    // getButtonToDisplayForMultivaluedAttributeField,
    type FormAction,
    type FormFieldError
} from "keycloakify/login/lib/useUserProfileForm";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import { FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loadOrganizationOptions, OrganizationOption } from "./pages/organizations";

export default function UserProfileFormFields(props: UserProfileFormFieldsProps<KcContext, I18n>) {
    const { kcContext, i18n, kcClsx, onIsFormSubmittableValueChange, doMakeUserConfirmPassword, BeforeField, AfterField } = props;

    const { advancedMsg } = i18n;

    const {
        formState: { formFieldStates, isFormSubmittable },
        dispatchFormAction
    } = useUserProfileForm({
        kcContext,
        i18n,
        doMakeUserConfirmPassword
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    const groupNameRef = { current: "" };

    return (
        <>
            {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }, indexField) => {
                return (
                    <Fragment key={attribute.name}>
                        <GroupLabel attribute={attribute} groupNameRef={groupNameRef} i18n={i18n} kcClsx={kcClsx} />
                        {BeforeField !== undefined && (
                            <BeforeField
                                attribute={attribute}
                                dispatchFormAction={dispatchFormAction}
                                displayableErrors={displayableErrors}
                                valueOrValues={valueOrValues}
                                kcClsx={kcClsx}
                                i18n={i18n}
                            />
                        )}
                        <div
                            className={kcClsx("kcFormGroupClass")}
                            style={{
                                display: attribute.name === "password-confirm" && !doMakeUserConfirmPassword ? "none" : undefined
                            }}
                        >
                            <div className={kcClsx("kcInputWrapperClass")}>
                                {attribute.annotations.inputHelperTextBefore !== undefined && (
                                    <Typography variant="caption" id={`form-help-text-before-${attribute.name}`} aria-live="polite">
                                        {advancedMsg(attribute.annotations.inputHelperTextBefore)}
                                    </Typography>
                                )}
                                <InputFieldByType
                                    first={indexField === 0}
                                    attribute={attribute}
                                    valueOrValues={valueOrValues}
                                    displayableErrors={displayableErrors}
                                    dispatchFormAction={dispatchFormAction}
                                    kcClsx={kcClsx}
                                    i18n={i18n}
                                />
                                {/* <FieldErrors attribute={attribute} displayableErrors={displayableErrors} kcClsx={kcClsx} fieldIndex={undefined} /> */}
                                {attribute.annotations.inputHelperTextAfter !== undefined && (
                                    <div
                                        className={kcClsx("kcInputHelperTextAfterClass")}
                                        id={`form-help-text-after-${attribute.name}`}
                                        aria-live="polite"
                                    >
                                        {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                                    </div>
                                )}

                                {AfterField !== undefined && (
                                    <AfterField
                                        attribute={attribute}
                                        dispatchFormAction={dispatchFormAction}
                                        displayableErrors={displayableErrors}
                                        valueOrValues={valueOrValues}
                                        kcClsx={kcClsx}
                                        i18n={i18n}
                                    />
                                )}
                                {/* NOTE: Downloading of html5DataAnnotations scripts is done in the useUserProfileForm hook */}
                            </div>
                        </div>
                    </Fragment>
                );
            })}
        </>
    );
}

function GroupLabel(props: {
    attribute: Attribute;
    groupNameRef: {
        current: string;
    };
    i18n: I18n;
    kcClsx: KcClsx;
}) {
    const { attribute, groupNameRef, i18n, kcClsx } = props;

    const { advancedMsg } = i18n;

    if (attribute.group?.name !== groupNameRef.current) {
        groupNameRef.current = attribute.group?.name ?? "";

        if (groupNameRef.current !== "") {
            assert(attribute.group !== undefined);

            return (
                <div
                    className={kcClsx("kcFormGroupClass")}
                    {...Object.fromEntries(Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]))}
                >
                    {(() => {
                        const groupDisplayHeader = attribute.group.displayHeader ?? "";
                        const groupHeaderText = groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

                        return (
                            <div className={kcClsx("kcContentWrapperClass")}>
                                <label id={`header-${attribute.group.name}`} className={kcClsx("kcFormGroupHeader")}>
                                    {groupHeaderText}
                                </label>
                            </div>
                        );
                    })()}
                    {(() => {
                        const groupDisplayDescription = attribute.group.displayDescription ?? "";

                        if (groupDisplayDescription !== "") {
                            const groupDescriptionText = advancedMsg(groupDisplayDescription);

                            return (
                                <div className={kcClsx("kcLabelWrapperClass")}>
                                    <label id={`description-${attribute.group.name}`} className={kcClsx("kcLabelClass")}>
                                        {groupDescriptionText}
                                    </label>
                                </div>
                            );
                        }

                        return null;
                    })()}
                </div>
            );
        }
    }

    return null;
}

type InputFieldByTypeProps = {
    first?: boolean;
    attribute: Attribute;
    valueOrValues: string | string[];
    displayableErrors: FormFieldError[];
    dispatchFormAction: React.Dispatch<FormAction>;
    i18n: I18n;
    kcClsx: KcClsx;
};

function InputFieldByType(props: InputFieldByTypeProps) {
    const { attribute, valueOrValues } = props;

    switch (attribute.annotations.inputType) {
        case "textarea":
            return <TextareaTag {...props} />;
        case "select":
        case "multiselect":
            return <SelectTag {...props} />;
        case "select-radiobuttons":
        case "multiselect-checkboxes":
            return <InputTagSelects {...props} />;
        default: {
            if (valueOrValues instanceof Array) {
                return (
                    <>
                        {valueOrValues.map((...[, i]) => (
                            <InputTag key={i} {...props} fieldIndex={i} />
                        ))}
                    </>
                );
            }

            const inputNode = <InputTag {...props} fieldIndex={undefined} />;

            if (attribute.name === "password" || attribute.name === "password-confirm") {
                return <PasswordWrapper {...props} kcClsx={props.kcClsx} i18n={props.i18n} passwordInputId={attribute.name} />;
            }

            return inputNode;
        }
    }
}

function PasswordWrapper(props: InputFieldByTypeProps & { kcClsx: KcClsx; i18n: I18n; passwordInputId: string; children?: JSX.Element }) {
    const { i18n, displayableErrors, dispatchFormAction, attribute, valueOrValues } = props;

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(show => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const { advancedMsgStr, advancedMsg } = i18n;

    const displayableError = displayableErrors.filter(({ fieldIndex }) => fieldIndex === undefined);

    return (
        <div>
            <FormControl variant="outlined" sx={{ width: "100%", minWidth: "80%", pb: 0.5 }}>
                <InputLabel htmlFor={attribute.name} required={attribute.required}>
                    {advancedMsg(attribute.displayName ?? "")}
                </InputLabel>
                <OutlinedInput
                    id={attribute.name}
                    type={showPassword ? "text" : "password"}
                    error={displayableError.length > 0}
                    name={attribute.name}
                    required={attribute.required}
                    disabled={attribute.readOnly}
                    readOnly={attribute.readOnly}
                    value={valueOrValues}
                    autoComplete={attribute.autocomplete}
                    placeholder={
                        attribute.annotations.inputTypePlaceholder === undefined
                            ? undefined
                            : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
                    }
                    onChange={event =>
                        dispatchFormAction({
                            action: "update",
                            name: attribute.name,
                            valueOrValues: (() => {
                                return event.target.value;
                            })()
                        })
                    }
                    onBlur={() =>
                        dispatchFormAction({
                            action: "focus lost",
                            name: attribute.name,
                            fieldIndex: undefined
                        })
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={showPassword ? "hide the password" : "display the password"}
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    label={advancedMsg(attribute.displayName ?? "")}
                />
                {displayableError
                    .filter(error => error.fieldIndex === undefined)
                    .map(({ errorMessage }, i, arr) => (
                        <FormHelperText key={i} error>
                            {errorMessage}
                            {arr.length - 1 !== i && <br />}
                        </FormHelperText>
                    ))}
            </FormControl>
        </div>
    );
}

function InputTag(props: InputFieldByTypeProps & { fieldIndex: number | undefined }) {
    const { first, attribute, fieldIndex, dispatchFormAction, valueOrValues, i18n, displayableErrors } = props;

    const { advancedMsgStr } = i18n;

    const displayableError = displayableErrors.filter(({ fieldIndex: fE }) => fieldIndex === fE);

    if (attribute.name === "timbre") {
        return <SelectTimbre {...props} />;
    }

    return (
        <TextField
            autoFocus={first}
            sx={{ width: "100%", minWidth: "80%", pb: 0.5 }}
            error={displayableError.length > 0}
            value={(() => {
                if (fieldIndex !== undefined) {
                    assert(valueOrValues instanceof Array);
                    return valueOrValues[fieldIndex];
                }

                assert(typeof valueOrValues === "string");

                return valueOrValues;
            })()}
            helperText={displayableError
                .filter(error => error.fieldIndex === undefined)
                .map(({ errorMessage }, i, arr) => (
                    <Fragment key={i}>
                        {errorMessage}
                        {arr.length - 1 !== i && <br />}
                    </Fragment>
                ))}
            label={advancedMsgStr(attribute.displayName ?? "")}
            id={attribute.name}
            name={attribute.name}
            required={attribute.required}
            disabled={attribute.readOnly}
            autoComplete={attribute.autocomplete}
            placeholder={
                attribute.annotations.inputTypePlaceholder === undefined ? undefined : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
            }
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: (() => {
                        if (fieldIndex !== undefined) {
                            assert(valueOrValues instanceof Array);

                            return valueOrValues.map((value, i) => {
                                if (i === fieldIndex) {
                                    return event.target.value;
                                }

                                return value;
                            });
                        }

                        return event.target.value;
                    })()
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: fieldIndex
                })
            }
        />
        // <>
        //     <input
        //         type={(() => {
        //             const { inputType } = attribute.annotations;

        //             if (inputType?.startsWith("html5-")) {
        //                 return inputType.slice(6);
        //             }

        //             return inputType ?? "text";
        //         })()}
        //         id={attribute.name}
        //         name={attribute.name}
        //         value={(() => {
        //             if (fieldIndex !== undefined) {
        //                 assert(valueOrValues instanceof Array);
        //                 return valueOrValues[fieldIndex];
        //             }

        //             assert(typeof valueOrValues === "string");

        //             return valueOrValues;
        //         })()}
        //         className={kcClsx("kcInputClass")}
        //         aria-invalid={displayableErrors.find(error => error.fieldIndex === fieldIndex) !== undefined}
        //         disabled={attribute.readOnly}
        //         autoComplete={attribute.autocomplete}
        //         placeholder={
        //             attribute.annotations.inputTypePlaceholder === undefined ? undefined : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
        //         }
        //         pattern={attribute.annotations.inputTypePattern}
        //         size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
        //         maxLength={
        //             attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
        //         }
        //         minLength={
        //             attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMinlength}`)
        //         }
        //         max={attribute.annotations.inputTypeMax}
        //         min={attribute.annotations.inputTypeMin}
        //         step={attribute.annotations.inputTypeStep}
        //         {...Object.fromEntries(Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]))}
        //         onChange={event =>
        //             dispatchFormAction({
        //                 action: "update",
        //                 name: attribute.name,
        //                 valueOrValues: (() => {
        //                     if (fieldIndex !== undefined) {
        //                         assert(valueOrValues instanceof Array);

        //                         return valueOrValues.map((value, i) => {
        //                             if (i === fieldIndex) {
        //                                 return event.target.value;
        //                             }

        //                             return value;
        //                         });
        //                     }

        //                     return event.target.value;
        //                 })()
        //             })
        //         }
        //         onBlur={() =>
        //             dispatchFormAction({
        //                 action: "focus lost",
        //                 name: attribute.name,
        //                 fieldIndex: fieldIndex
        //             })
        //         }
        //     />
        //     {(() => {
        //         if (fieldIndex === undefined) {
        //             return null;
        //         }

        //         assert(valueOrValues instanceof Array);

        //         const values = valueOrValues;

        //         return (
        //             <>
        //                 <FieldErrors attribute={attribute} kcClsx={kcClsx} displayableErrors={displayableErrors} fieldIndex={fieldIndex} />
        //                 <AddRemoveButtonsMultiValuedAttribute
        //                     attribute={attribute}
        //                     values={values}
        //                     fieldIndex={fieldIndex}
        //                     dispatchFormAction={dispatchFormAction}
        //                     i18n={i18n}
        //                 />
        //             </>
        //         );
        //     })()}
        // </>
    );
}

function InputTagSelects(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, kcClsx, i18n, valueOrValues } = props;

    const { classDiv, classInput, classLabel, inputType } = (() => {
        const { inputType } = attribute.annotations;

        assert(inputType === "select-radiobuttons" || inputType === "multiselect-checkboxes");

        switch (inputType) {
            case "select-radiobuttons":
                return {
                    inputType: "radio",
                    classDiv: kcClsx("kcInputClassRadio"),
                    classInput: kcClsx("kcInputClassRadioInput"),
                    classLabel: kcClsx("kcInputClassRadioLabel")
                };
            case "multiselect-checkboxes":
                return {
                    inputType: "checkbox",
                    classDiv: kcClsx("kcInputClassCheckbox"),
                    classInput: kcClsx("kcInputClassCheckboxInput"),
                    classLabel: kcClsx("kcInputClassCheckboxLabel")
                };
        }
    })();

    const options = (() => {
        walk: {
            const { inputOptionsFromValidation } = attribute.annotations;

            if (inputOptionsFromValidation === undefined) {
                break walk;
            }

            const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

            if (validator === undefined) {
                break walk;
            }

            if (validator.options === undefined) {
                break walk;
            }

            return validator.options;
        }

        return attribute.validators.options?.options ?? [];
    })();

    return (
        <>
            {options.map(option => (
                <div key={option} className={classDiv}>
                    <input
                        type={inputType}
                        id={`${attribute.name}-${option}`}
                        name={attribute.name}
                        value={option}
                        className={classInput}
                        aria-invalid={props.displayableErrors.length !== 0}
                        disabled={attribute.readOnly}
                        checked={valueOrValues instanceof Array ? valueOrValues.includes(option) : valueOrValues === option}
                        onChange={event =>
                            dispatchFormAction({
                                action: "update",
                                name: attribute.name,
                                valueOrValues: (() => {
                                    const isChecked = event.target.checked;

                                    if (valueOrValues instanceof Array) {
                                        const newValues = [...valueOrValues];

                                        if (isChecked) {
                                            newValues.push(option);
                                        } else {
                                            newValues.splice(newValues.indexOf(option), 1);
                                        }

                                        return newValues;
                                    }

                                    return event.target.checked ? option : "";
                                })()
                            })
                        }
                        onBlur={() =>
                            dispatchFormAction({
                                action: "focus lost",
                                name: attribute.name,
                                fieldIndex: undefined
                            })
                        }
                    />
                    <label
                        htmlFor={`${attribute.name}-${option}`}
                        className={`${classLabel}${attribute.readOnly ? ` ${kcClsx("kcInputClassRadioCheckboxLabelDisabled")}` : ""}`}
                    >
                        {inputLabel(i18n, attribute, option)}
                    </label>
                </div>
            ))}
        </>
    );
}

function TextareaTag(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, kcClsx, displayableErrors, valueOrValues } = props;

    assert(typeof valueOrValues === "string");

    const value = valueOrValues;

    return (
        <textarea
            id={attribute.name}
            name={attribute.name}
            className={kcClsx("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            cols={attribute.annotations.inputTypeCols === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeCols}`)}
            rows={attribute.annotations.inputTypeRows === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeRows}`)}
            maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)}
            value={value}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: event.target.value
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined
                })
            }
        />
    );
}

function SelectTag(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, displayableErrors, i18n, valueOrValues } = props;

    const isMultiple = attribute.annotations.inputType === "multiselect";

    const { advancedMsgStr } = i18n;

    return (
        <TextField
            sx={{ width: "100%", minWidth: "80%", pb: 2 }}
            error={displayableErrors.length > 0}
            id={attribute.name}
            name={attribute.name}
            value={valueOrValues}
            select
            required={attribute.required}
            disabled={attribute.readOnly}
            helperText={displayableErrors.map(({ errorMessage }, i, arr) => (
                <Fragment key={i}>
                    {errorMessage}
                    {arr.length - 1 !== i && <br />}
                </Fragment>
            ))}
            label={advancedMsgStr(attribute.displayName ?? "")}
            slotProps={{
                select: { native: true, value: valueOrValues }
            }}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: (() => {
                        return event.target.value;
                    })()
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined
                })
            }
        >
            {!isMultiple && <option value=""></option>}
            {(() => {
                const options = (() => {
                    walk: {
                        const { inputOptionsFromValidation } = attribute.annotations;

                        if (inputOptionsFromValidation === undefined) {
                            break walk;
                        }

                        assert(typeof inputOptionsFromValidation === "string");

                        const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

                        if (validator === undefined) {
                            break walk;
                        }

                        if (validator.options === undefined) {
                            break walk;
                        }

                        return validator.options;
                    }

                    return attribute.validators.options?.options ?? [];
                })();

                return options.map(option => (
                    <option key={option} value={option}>
                        {inputLabel(i18n, attribute, option, false)}
                    </option>
                ));
            })()}
        </TextField>
    );

    // return (
    //     <select
    //         id={attribute.name}
    //         name={attribute.name}
    //         className={kcClsx("kcInputClass")}
    //         aria-invalid={displayableErrors.length !== 0}
    //         disabled={attribute.readOnly}
    //         multiple={isMultiple}
    //         size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
    //         value={valueOrValues}
    //         onChange={event =>
    //             dispatchFormAction({
    //                 action: "update",
    //                 name: attribute.name,
    //                 valueOrValues: (() => {
    //                     if (isMultiple) {
    //                         return Array.from(event.target.selectedOptions).map(option => option.value);
    //                     }

    //                     return event.target.value;
    //                 })()
    //             })
    //         }
    //         onBlur={() =>
    //             dispatchFormAction({
    //                 action: "focus lost",
    //                 name: attribute.name,
    //                 fieldIndex: undefined
    //             })
    //         }
    //     >
    //         {!isMultiple && <option value=""></option>}
    //         {(() => {
    //             const options = (() => {
    //                 walk: {
    //                     const { inputOptionsFromValidation } = attribute.annotations;

    //                     if (inputOptionsFromValidation === undefined) {
    //                         break walk;
    //                     }

    //                     assert(typeof inputOptionsFromValidation === "string");

    //                     const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

    //                     if (validator === undefined) {
    //                         break walk;
    //                     }

    //                     if (validator.options === undefined) {
    //                         break walk;
    //                     }

    //                     return validator.options;
    //                 }

    //                 return attribute.validators.options?.options ?? [];
    //             })();

    //             return options.map(option => (
    //                 <option key={option} value={option}>
    //                     {inputLabel(i18n, attribute, option)}
    //                 </option>
    //             ));
    //         })()}
    //     </select>
    // );
}

function SelectTimbre(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, displayableErrors, i18n, valueOrValues } = props;

    const isMultiple = attribute.annotations.inputType === "multiselect";

    const { advancedMsgStr } = i18n;

    const [organizations, setOrganizations] = useState([] as OrganizationOption[]);

    useEffect(() => {
        const loadData = async () => {
            setOrganizations(await loadOrganizationOptions());
        };
        loadData();
    }, []);

    return (
        <TextField
            sx={{ width: "100%", minWidth: "80%", pb: 2 }}
            error={displayableErrors.length > 0}
            id={attribute.name}
            name={attribute.name}
            value={valueOrValues}
            select
            required={attribute.required}
            disabled={attribute.readOnly}
            helperText={displayableErrors.map(({ errorMessage }, i, arr) => (
                <Fragment key={i}>
                    {errorMessage}
                    {arr.length - 1 !== i && <br />}
                </Fragment>
            ))}
            label={advancedMsgStr(attribute.displayName ?? "")}
            slotProps={{
                select: { native: true, value: valueOrValues }
            }}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: (() => {
                        return event.target.value;
                    })()
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined
                })
            }
        >
            {!isMultiple && <option value=""></option>}
            {organizations.map(({ name, options }) => {
                return (
                    <optgroup key={name} label={name}>
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </optgroup>
                );
            })}
        </TextField>
    );
}

function inputLabel(i18n: I18n, attribute: Attribute, option: string, withJsx = true) {
    const { advancedMsg, advancedMsgStr } = i18n;

    const interpret = withJsx ? advancedMsg : advancedMsgStr;

    if (attribute.annotations.inputOptionLabels !== undefined) {
        const { inputOptionLabels } = attribute.annotations;

        return interpret(inputOptionLabels[option] ?? option);
    }

    if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
        return interpret(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
    }

    return option;
}
