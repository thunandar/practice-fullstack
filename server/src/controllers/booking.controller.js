const courtModel = require("../models/court.model");
const dayjs = require("dayjs");
const {
  timeTo24HrFormat,
  primaryDateTimeFormat,
  utcToTimeFormat,
  primaryDateFormat,
  primaryTimeFormat,
  getDayByDate,
  changeDateTimeFormat,
} = require("../utils/date-time");
const { validationResponse } = require("../utils/validationResponse");
const { BookingSchema } = require("../validators/booking.validate");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const ownerModel = require("../models/owner.model");
const employeeModel = require("../models/employee.model");
const { bookingStatus } = require("../config/vars");
const bookingModel = require("../models/booking.model");
const offTimeModel = require("../models/offTime.model");
const { bookingPopulate } = require("../config/populate");
const CsvParser = require("json2csv").Parser;
const moment = require("moment");

exports.checkBookingTime = async (req, res) => {
  try {
    const { court_id = 0, times = [], date = "" } = req.body;

    const result = await checkAvaliableDateTime(court_id, times, date);

    return res.send(result);
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.book = async (req, res) => {
  try {
    const {
      court_id = 0,
      booking_time = [],
      booking_date = "",
      discount_amount = 0,
    } = req.body;

    const result = await checkAvaliableDateTime(
      court_id,
      booking_time,
      booking_date
    );

    if (result.status == 1) {
      return res.send(result);
    }

    const { error, value } = BookingSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const court = await courtModel.findOne({ court_id: value.court_id });

      value.court_id = court.court_id;

      value.owner_id = court.owner_id;

      if (booking_time.length > court.booking_limit) {
        return res.send({
          status: 1,
          message: "Please Book under " + court.booking_limit + " times",
        });
      }

      if (value.is_manual) {
        // something
        value.status = bookingStatus.booked;
      } else {
        // TODO: payment transaction
        value.status = bookingStatus.booked;
      }

      let user;
      let uid;

      if (value.user_id) {
        user = await userModel.findOne({ user_id: value.user_id });

        if (!user) {
          return res.send({
            status: 1,
            message: "User Not Found",
          });
        }

        uid = user.user_id;
      } else {
        if (
          !value.customer_name ||
          !value.customer_email ||
          !value.customer_phone
        ) {
          return res.send({
            status: 1,
            message: "User Info is required",
          });
        }

        const oldUser = await userModel.findOne({
          email: value.customer_email,
        });

        if (oldUser) {
          uid = oldUser.user_id;
        } else {
          const encryptedPassword = await bcrypt.hash("password", 10);

          let avatar = gravatar.url(
            value.name,
            { s: "100", r: "x", d: "retro" },
            true
          );

          user = new userModel({
            name: value.customer_name,
            email: value.customer_email,
            phone: value.customer_phone,
            avatar,
            password: encryptedPassword,
          });

          await user.save();

          uid = user.user_id;
        }
      }

      value.user_id = uid;

      let totalPrice = 0;

      const day = getDayByDate(booking_date);

      const isSpecialDay = court.special_day_prices.some(
        (obj) => obj.day == day
      );
      if (isSpecialDay) {
        const specialDay = court.special_day_prices.find(
          (obj) => obj.day == day
        );
        booking_time.map((time) => {
          time = utcToTimeFormat(time);
          if (time.slice(-2) == "am") {
            totalPrice += specialDay.am_fee;
          } else {
            totalPrice += specialDay.pm_fee;
          }
        });
      } else {
        const bookLength = booking_time.length;
        let amFee = court.price[0].am_fee;
        let pmFee = court.price[0].pm_fee;
        let isDiscount = false;

        court.price.map((price, index) => {
          if (price.hour == bookLength) {
            amFee = court.price[index].am_fee;
            pmFee = court.price[index].pm_fee;
            isDiscount = true;
          }
        });

        booking_time.map((time) => {
          time = utcToTimeFormat(time);
          if (time.slice(-2) == "am") {
            if (isDiscount) {
              totalPrice = amFee;
            } else {
              totalPrice += amFee;
            }
          } else {
            if (isDiscount) {
              totalPrice = pmFee;
            } else {
              totalPrice += pmFee;
            }
          }
        });
      }

      value.booking_time = booking_time.map((time) => primaryTimeFormat(time));

      value.total_amount = totalPrice - discount_amount;

      const booking = new bookingModel(value);

      await booking.save();

      return res.send({
        status: 0,
        message: "Booked Successfully !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { page, per_page, from, to, exportcsv, owner_id, court_id, status } =
      req.body;

    let bookings = [];

    let dateFilter = {};

    if (from && to) {
      dateFilter = bookingDateFilter(status, owner_id, court_id, from, to);
    }

    bookings = await bookingModel
      .find(dateFilter)
      .populate(bookingPopulate)
      .sort({ updatedAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
 
    const total_count = await bookingModel.find(dateFilter).countDocuments();
    const { totalManualCount, notTotalManualCount } =
      getTotalManualCountAndNotTotalManualCount(bookings);

    let transformedData = [];

    if (bookings.length > 0) {
      transformedData = bookings.map((data) => data.transform(data));
    }

    if (exportcsv) {
      const csvData = await exportingBookingHistoryCSV(dateFilter);

      if (csvData.status === 1) {
        return res.send(csvData);
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment: filename=booking-history.csv"
      );
      return res.status(200).end(csvData);
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
      total_manual_count: totalManualCount,
      not_total_manual_count: notTotalManualCount,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.search = async (req, res) => {
  try {
    const {
      court_id,
      owner_id,
      booking_id,
      booking_date,
      status,
      page,
      per_page,
    } = req.body;

    let filter = {};

    if (court_id != null) {
      filter = { court_id: court_id };
    }

    if (booking_date != null) {
      filter = { ...filter, booking_date };
    }

    if (status != null) {
      filter = { ...filter, status };
    }

    if (booking_id != null) {
      filter = { ...filter, booking_id };
    }

    if (owner_id != null) {
      filter = { ...filter, owner_id: owner_id };
    }

    console.log(filter, "filter");

    const bookings = await bookingModel
      .find(filter)
      .populate(bookingPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    const total_count = await bookingModel.find(filter).countDocuments();

    let transformedData = [];

    if (bookings.length > 0) {
      transformedData = bookings.map((data) => data.transform(data));
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.ownerBookingList = async (req, res) => {
  try {
    const { page, per_page, from, to, exportcsv, owner_id, court_id, status } =
      req.body;

    let bookings = [];
    let transformedData = [];

    const dateFilter = bookingDateFilter(status, owner_id, court_id, from, to);

    bookings = await bookingModel
      .find(dateFilter)
      .populate(bookingPopulate)
      .sort({ updatedAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    if (bookings.length > 0) {
      transformedData = bookings.map((data) => data.transform(data));
    }
    const total_count = await bookingModel.find(dateFilter).countDocuments();
    const { totalManualCount, notTotalManualCount } =
      getTotalManualCountAndNotTotalManualCount(bookings);

    if (exportcsv) {
      const csvData = await exportingBookingHistoryCSV(dateFilter);

      if (csvData.status === 1) {
        return res.send(csvData);
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment: filename=booking-history.csv"
      );
      return res.status(200).end(csvData);
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
      total_manual_count: totalManualCount,
      not_total_manual_count: notTotalManualCount,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.employeeBookingList = async (req, res) => {
  try {
    const employee = await employeeModel.findOne({
      access_token: req.body.access_token,
    });

    let { status, employee_id, court_id, page, per_page, from, to, exportcsv } =
      req.body;

    if (!employee) {
      return res.send({
        status: 1,
        message: "Invalid token",
        is_login: true,
      });
    }
    employee_id = employee.employee_id;

    status = status ? status : "all";
    employee_id = employee_id ? employee_id : "all";
    court_id = court_id ? court_id : "all";

    let filter = {};
    let bookings = [];
    let transformedData = [];

    const { startDate, endDate } = changeDateTimeFormat(from, to);

    if (status !== "all") {
      filter = { status: status };
    }

    if (employee_id !== "all") {
      filter = {
        ...filter,
        employee_id: employee_id,
      };
    }

    if (court_id !== "all") {
      filter = {
        ...filter,
        court_id: court_id,
      };
    }

    if (court_id === "all") {
      let courtsFromEmployee = employee.courts;
      filter = {
        ...filter,
        court_id: { $in: courtsFromEmployee },
      };
    }

    if (startDate !== null && endDate !== null) {
      filter = {
        ...filter,
        booking_date: { $gte: startDate, $lte: endDate },
      };
    }

    bookings = await bookingModel
      .find(filter)
      .populate(bookingPopulate)
      .sort({ booking_date: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    if (bookings.length > 0) {
      transformedData = bookings.map((data) => data.transform(data));
    }
    const total_count = await bookingModel.find(filter).countDocuments();
    const { totalManualCount, notTotalManualCount } =
      getTotalManualCountAndNotTotalManualCount(bookings);

    if (exportcsv) {
      const csvData = await exportingBookingHistoryCSV(filter);

      if (csvData.status === 1) {
        return res.send(csvData);
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment: filename=booking-history.csv"
      );
      return res.status(200).end(csvData);
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
      total_manual_count: totalManualCount,
      not_total_manual_count: notTotalManualCount,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.userBookingList = async (req, res) => {
  try {

    let { page, per_page, access_token } = req.body;

    const user = await userModel.findOne({
      access_token: access_token,
    });

    if (!user) {
      return res.send({
        status: 1,
        message: "Invalid token",
        is_login: true,
      });
    }

    let filter = {
      user_id: user.user_id
    };

    let bookings = [];
    let transformedData = [];

    bookings = await bookingModel
      .find(filter)
      .populate(bookingPopulate)
      .sort({ booking_date: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    if (bookings.length > 0) {
      transformedData = bookings.map((data) => data.transform(data));
    }
    const total_count = await bookingModel.find(filter).countDocuments();

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.getTimeListByDate = async (req, res) => {
  try {
    const result = await getTimeList(req.body.date, req.body.court_id);

    return res.send(result);
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.changeBookingStatus = async (req, res) => {
  try {
    const { booking_id, access_token, status } = req.body;

    const book = await bookingModel.findOne({ booking_id: booking_id });

    if (!book) {
      return res.send({
        status: 1,
        message: "Booking Not Found !",
      });
    }

    // let updater = await checkAccess(access_token,book)

    // if(updater.status == 1){
    //     return res.send(updater)
    // }

    await bookingModel.findOneAndUpdate(
      { booking_id },
      { status },
      { returnOriginal: false }
    );

    return res.send({
      status: 0,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

async function checkAvaliableDateTime(court_id = 0, times = [], date = "") {
  if (court_id == 0 || times?.length == 0 || date == "") {
    return {
      status: 1,
      message: "Please Fill All Data !",
    };
  }

  const court = await courtModel.findOne({ court_id });

  if (!court) {
    return {
      status: 1,
      message: "There is no court!",
    };
  }

  const bookDate = dayjs(date);
  const today = dayjs(new Date());
  const currentTime = dayjs(new Date()).format("h:mm a");

  const getDate = bookDate.format("dddd");

  if (
    primaryDateFormat(bookDate) < primaryDateFormat(today) &&
    primaryDateFormat(bookDate) != primaryDateFormat(today)
  ) {
    return {
      status: 1,
      message: "Please booking start from today",
    };
  }

  for (let t = 0; t < times.length; t++) {
    times[t] = new Date(`${bookDate.format("YYYY-MM-DD")} ${times[t]}`);
    let current = new Date(`${bookDate.format("YYYY-MM-DD")} ${currentTime}`);

    if (primaryDateFormat(bookDate) == primaryDateFormat(today)) {
      if (times[t] < current) {
        return {
          status: 1,
          message: "this time is gone",
        };
      }
    }
  }

  if (court.off_day.includes(getDate)) {
    return {
      status: 1,
      message: getDate + " is off day !",
    };
  }

  if (!court.is_24_hr) {
    let open_time = timeTo24HrFormat(court.open_hour);
    let close_time = timeTo24HrFormat(court.close_hour);

    if (open_time.status == 1) {
      return open_time;
    }

    if (close_time.status == 1) {
      return close_time;
    }

    let open_hour = new Date(`${bookDate.format("YYYY-MM-DD")} ${open_time}`);
    let close_hour = new Date(`${bookDate.format("YYYY-MM-DD")} ${close_time}`);

    for (let i = 0; i < times.length; i++) {
      times[i] = timeTo24HrFormat(primaryTimeFormat(times[i]));

      if (times[i].status == 1) {
        return times[i];
      }

      times[i] = new Date(`${bookDate.format("YYYY-MM-DD")} ${times[i]}`);

      if (!(times[i] >= open_hour && times[i] <= close_hour)) {
        return {
          status: 1,
          message: primaryDateTimeFormat(times[i]) + " is off time !",
        };
      }
    }
  }

  const is_off_time = times.some((value) => court.off_time.includes(value));

  if (is_off_time) {
    return {
      status: 1,
      message: "There is off time !",
    };
  }

  let books = await bookingModel.bookByCourtAndDate(
    bookDate.format("YYYY-MM-DD"),
    court_id
  );

  if (books.length > 0) {
    for (let i = 0; i < books.length; i++) {
      const is_booked_time = times.some((value) =>
        books[i].booking_time.includes(utcToTimeFormat(value))
      );

      if (is_booked_time) {
        return {
          status: 1,
          message: "This time is booked by other !",
        };
      }
    }
  }

  return {
    status: 0,
    message: "Avaliable",
  };
}

async function getTimeList(date, court_id = 0) {
  const court = await courtModel.findOne({ court_id: court_id });

  date = primaryDateFormat(date);

  if (!court) {
    return {
      status: 1,
      message: "Court not found",
    };
  }

  let timelist = [
    "12:00 am",
    "1:00 am",
    "2:00 am",
    "3:00 am",
    "4:00 am",
    "5:00 am",
    "6:00 am",
    "7:00 am",
    "8:00 am",
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:00 pm",
    "5:00 pm",
    "6:00 pm",
    "7:00 pm",
    "8:00 pm",
    "9:00 pm",
    "10:00 pm",
    "11:00 pm",
  ];

  if (!court.is_24_hr) {
    let openIndex = timelist.indexOf(court.open_hour);
    let closeIndex = timelist.indexOf(court.close_hour) + 1;
    timelist = timelist.slice(openIndex, closeIndex);
  }

  const getDate = dayjs(date).format("dddd");

  if (court.off_day.includes(getDate)) {
    return {
      status: 1,
      message: getDate + " is off date",
    };
  }

  timelist = timelist.filter((time) => !court.off_time.includes(time));

  let offTime = await offTimeModel.findOne({ court_id: court_id, date: date });

  if (offTime) {
    timelist = timelist.filter((time) => !offTime.times.includes(time));
  }

  let bookedTimes = await bookingModel
    .find({ court_id: court_id, booking_date: date })
    .select("booking_time -_id");

  bookedTimes = bookedTimes
    .map((item) => item.booking_time)
    .reduce((a, b) => a.concat(b), []);

  timelist = timelist.filter((time) => !bookedTimes.includes(time));

  return {
    status: 0,
    avaliable_times: timelist,
    bookedTimes,
  };
}

exports.detail = async (req, res) => {
  try {
    let booking = await bookingModel.findOne({ booking_id: req.body.id });

    if (!booking) {
      return res.send({
        status: 1,
        message: "Booking not found",
      });
    }

    // let updater = await checkAccess(req.body.access_token,booking)

    // if(updater.status == 1){
    //     return res.send(updater)
    // }

    booking = await bookingModel
      .findOne({ booking_id: req.body.id })
      .populate(bookingPopulate);

    if (booking) {
      return res.send({
        status: 0,
        data: booking.transform(booking),
      });
    } else {
      return res.send({
        status: 1,
        message: "Booking Not Found !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

async function checkAccess(access_token, book) {
  let updater;

  updater = await ownerModel.findOne({ access_token });

  if (updater) {
    if (updater._id.toString() != book?.owner.toString()) {
      return {
        status: 1,
        message: "You don't have access for this court",
      };
    }
  } else {
    updater = await employeeModel.findOne({ access_token: access_token });
    if (!updater.courts.includes(book.court.toString())) {
      return {
        status: 1,
        message: "you don't have access for this booking",
      };
    }
  }

  return {
    status: 0,
    updater,
  };
}

function bookingDateFilter(status, owner_id, court_id, from, to) {
  let filter = {};

  const { startDate, endDate } = changeDateTimeFormat(from, to);

  status = status ? status : "all";
  court_id = court_id ? court_id : "all";

  if (status !== "all") {
    filter = { status: status };
  }

  if (owner_id) {
    filter = { ...filter, owner_id: owner_id };
  }

  if (court_id !== "all") {
    filter = { ...filter, court_id: court_id };
  }

  if (startDate !== null && endDate !== null) {
    filter = {
      ...filter,
      booking_date: { $gte: startDate, $lte: endDate },
    };
  }
  return filter;
}

async function exportingBookingHistoryCSV(dateFilter) {
  let csvData;

  bookings = await bookingModel
    .find(dateFilter)
    .populate(bookingPopulate)
    .sort({ updatedAt: -1 })
    .exec();

  let exportData = [];

  if (bookings.length > 0) {
    bookings.map((booking) => {
      const owner = booking.owner || {};
      const court = booking.court || {};
      const employee = booking.employee || {};
      const user = booking.user || {};

      exportData.push({
        owner: owner.name || "",
        owner_phone_number: owner.phone || "",
        owner_email: owner.email || "",
        court: court.name || "",
        court_phone_number: court.phone || "",
        employee: employee.name || "",
        employee_phone_number: employee.phone || "",
        employee_email: employee.email || "",
        user: user.name || "",
        user_phone_number: user.phone || "",
        user_email: user.email || "",
        status: booking.status || 0,
        is_manual: booking.is_manual || false,
        discount_amount: booking.discount_amount || "",
        total_amount: booking.total_amount || "",
        booking_date: primaryDateFormat(booking.booking_date)
          ? primaryDateFormat(booking.booking_date)
          : "",
        booking_time: booking.booking_time.join(" , ")
          ? booking.booking_time.join(" , ")
          : "",
      });
    });
  } else {
    return {
      status: 1,
      message: "There was no data!",
    };
  }
  const csvFields = [
    "Owner Name",
    "Owner Phone Number",
    "Owner Email",
    "Court Name",
    "Court Phone Number",
    "Employee Name",
    "Employee Phone Number",
    "Employee Email",
    "User Name",
    "User Phone Number",
    "User Email",
    "Status",
    "Is Manual",
    "Discount Amount",
    "Total Amount",
    "Booking Date",
    "Booking Time",
  ];

  const csvparser = new CsvParser({ csvFields });
  csvData = csvparser.parse(exportData);
  return csvData;
}

function getTotalManualCountAndNotTotalManualCount(bookings) {
  let totalManualCount = 0;
  let notTotalManualCount = 0;

  bookings.forEach((booking) => {
    if (booking.is_manual === true) {
      totalManualCount += 1;
    } else {
      notTotalManualCount += 1;
    }
  });

  return {
    totalManualCount,
    notTotalManualCount,
  };
}
