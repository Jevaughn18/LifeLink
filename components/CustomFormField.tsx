/* eslint-disable no-unused-vars */
"use client";

import { E164Number } from "libphonenumber-js/core";
import Image from "next/image";
import ReactDatePicker from "react-datepicker";
import { Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { useTheme } from "next-themes";

import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
}

const RenderInput = ({ field, props, isLightMode }: { field: any; props: CustomProps; isLightMode: boolean }) => {
  
  const inputClass = isLightMode
    ? "h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 shadow-sm px-4"
    : "h-12 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800 shadow-sm px-4";

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <FormControl>
          <Input
            placeholder={props.placeholder}
            {...field}
            disabled={props.disabled}
            className={inputClass}
          />
        </FormControl>
      );
    case FormFieldType.PASSWORD:
      return (
        <FormControl>
          <Input
            type="password"
            placeholder={props.placeholder}
            {...field}
            className="h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm px-4"
          />
        </FormControl>
      );
    case FormFieldType.TEXTAREA:
      const textareaClass = isLightMode
        ? "rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 min-h-[120px] resize-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 px-4 py-3 shadow-sm disabled:opacity-50 disabled:bg-gray-100"
        : "rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-200 placeholder:text-gray-400 min-h-[100px] resize-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 px-4 py-3 shadow-sm disabled:opacity-50 disabled:bg-gray-800";
      
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className={textareaClass}
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldType.PHONE_INPUT:
      return (
        <PhoneInput
          defaultCountry="US"
          placeholder={props.placeholder}
          international
          withCountryCallingCode
          value={field.value as E164Number | undefined}
          onChange={field.onChange}
          disabled={props.disabled}
          className="input-phone !h-12 !rounded-lg !border-2 !border-gray-300 !bg-white !text-gray-900 focus-within:!ring-2 focus-within:!ring-blue-500 focus-within:!border-blue-500 disabled:!opacity-100 disabled:!cursor-not-allowed"
        />
      );
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-start gap-3">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label htmlFor={props.name} className="text-gray-200 text-sm leading-relaxed cursor-pointer">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    case FormFieldType.DATE_PICKER:
      const datePickerContainerClass = isLightMode
        ? "flex rounded-lg border-2 border-gray-300 bg-white h-12 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm"
        : "flex rounded-lg border-2 border-gray-600 bg-gray-700 h-12 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm";
      const datePickerInputClass = isLightMode
        ? "w-full bg-transparent text-gray-900 h-12 px-3 focus:outline-none font-medium"
        : "w-full bg-transparent text-gray-200 h-12 px-3 focus:outline-none font-medium";
      
      return (
        <div className={datePickerContainerClass}>
          <Image
            src="/assets/icons/calendar.svg"
            height={20}
            width={20}
            alt="calendar"
            className={`ml-3 opacity-60 ${isLightMode ? '' : 'invert'}`}
          />
          <FormControl>
            <ReactDatePicker
              showTimeSelect={props.showTimeSelect ?? false}
              selected={field.value}
              onChange={(date: Date) => field.onChange(date)}
              timeInputLabel="Time:"
              dateFormat={props.dateFormat ?? "MM/dd/yyyy"}
              wrapperClassName="date-picker"
              className={datePickerInputClass}
            />
          </FormControl>
        </div>
      );
    case FormFieldType.SELECT:
      const selectTriggerClass = isLightMode
        ? "h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 shadow-sm"
        : "h-12 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 shadow-sm";
      const selectContentClass = isLightMode
        ? "bg-white border-2 border-gray-200 rounded-lg shadow-lg"
        : "bg-gray-800 border-2 border-gray-600 rounded-lg shadow-lg";
      
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder={props.placeholder} className={isLightMode ? "text-gray-900" : "text-gray-200"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={selectContentClass}>
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;
  const { theme } = useTheme();
  
  // Check if we're in light mode - use theme from next-themes or fallback to DOM check
  const isLightMode = theme === 'light' || (typeof window !== 'undefined' && 
    (document.querySelector('[data-light-mode="true"]') !== null ||
     document.querySelector('.bg-white, .bg-gray-50')?.closest('form') !== null));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex-1 ${props.fieldType === FormFieldType.PHONE_INPUT ? 'relative' : ''}`}>
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className={`${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium text-sm mb-2 block ${props.fieldType === FormFieldType.PHONE_INPUT ? 'relative z-0' : ''}`}>
              {label}
            </FormLabel>
          )}
          <RenderInput field={field} props={props} isLightMode={isLightMode} />

          <FormMessage className="text-red-600 dark:text-red-400 text-sm mt-1.5" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
