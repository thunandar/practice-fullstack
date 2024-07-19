const dayjs = require("dayjs");
const moment = require("moment");

exports.timeTo24HrFormat = (time) => {
  let hour = "";
  let minute = "";
  const timeComponents = time.match(/(\d+):(\d+) ([APap][Mm])/);
  if (timeComponents) {
    hour = Number(timeComponents[1]);
    minute = timeComponents[2].toString().padStart(2, "0");
    const meridiem = timeComponents[3].toLowerCase();
    if (meridiem === "pm" && hour !== 12) {
      hour += 12;
    } else if (meridiem === "am" && hour === 12) {
      hour = 0;
    }
    return hour.toString().padStart(2, "0") + ":" + minute + ":00";
  } else {
    return {
      status: 1,
      message: "Invalid Time Format",
    };
  }
};

exports.primaryTimeFormat = (datetime) => {
  return dayjs(datetime).format("h:mm a");
};

exports.primaryDateTimeFormat = (datetime) => {
  return dayjs(datetime).format("DD-MM-YYYY h:mm a");
};

exports.primaryDateFormat = (date) => {
  return dayjs(date).format("YYYY-MM-DD");
};

exports.utcToTimeFormat = (datetime) => {
  return dayjs(datetime).format("h:mm a");
};

exports.getDayByDate = (date) => {
  const myDate = new Date(date);
  const dayOfWeek = myDate.getDay();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = daysOfWeek[dayOfWeek];

  return day;
};

exports.changeDateTimeFormat = (from, to) => {
  const startDate = from
    ? moment.utc(from).startOf("day").format()
    : moment().startOf("day").format();
  const endDate = to
    ? moment.utc(to).endOf("day").format()
    : moment.utc().endOf("day").format();
  return { startDate: new Date(startDate), endDate: new Date(endDate) };
};
