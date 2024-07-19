import { GetBookingListsTypes } from "@/src/lib/bookingLists";
import { DateTimeFormat } from "@/src/utils";
import { formattedDate } from "@/src/utils/checkStatus";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  credentialObj: GetBookingListsTypes;
  setCredentialObj: (value: any) => void;
}

const DateRangePicker = ({
  credentialObj,
  setCredentialObj,
}: DatePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleDateChange = (dates: [Date, Date]) => {
    const [start, end] = dates;
    const formattedStartedDate = formattedDate(start);
    const formattedEndDate = formattedDate(end);

    setStartDate(start);
    setEndDate(end);
    setCredentialObj({
      ...credentialObj,
      from: formattedStartedDate,
      to: formattedEndDate,
    });
  };

  return (
    <div className="react-datepicker-wrapper">
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange={true}
        isClearable={true}
        placeholderText="Select Date Range"
        className="react-datepicker__input-container"
      />
    </div>
  );
};

export default DateRangePicker;
