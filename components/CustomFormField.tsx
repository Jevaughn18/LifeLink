/* eslint-disable no-unused-vars */
import { E164Number } from "libphonenumber-js/core";
import Image from "next/image";
import ReactDatePicker from "react-datepicker";
import { Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";

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

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <FormControl>
          <Input
            placeholder={props.placeholder}
            {...field}
            disabled={props.disabled}
            className="h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-white shadow-sm px-4"
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
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className="rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 px-4 py-3 shadow-sm"
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
      return (
        <div className="flex rounded-lg border-2 border-gray-300 bg-white h-12 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
          <Image
            src="/assets/icons/calendar.svg"
            height={20}
            width={20}
            alt="calendar"
            className="ml-3 opacity-60"
          />
          <FormControl>
            <ReactDatePicker
              showTimeSelect={props.showTimeSelect ?? false}
              selected={field.value}
              onChange={(date: Date) => field.onChange(date)}
              timeInputLabel="Time:"
              dateFormat={props.dateFormat ?? "MM/dd/yyyy"}
              wrapperClassName="date-picker"
              className="w-full bg-transparent text-gray-900 h-12 px-3 focus:outline-none font-medium"
            />
          </FormControl>
        </div>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 shadow-sm">
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex-1 ${props.fieldType === FormFieldType.PHONE_INPUT ? 'relative' : ''}`}>
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className={`text-gray-700 font-medium text-sm mb-2 block ${props.fieldType === FormFieldType.PHONE_INPUT ? 'relative z-0' : ''}`}>
              {label}
            </FormLabel>
          )}
          <RenderInput field={field} props={props} />

          <FormMessage className="text-red-600 text-sm mt-1.5" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
