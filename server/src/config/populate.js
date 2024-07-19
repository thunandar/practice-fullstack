module.exports = {
  userPopulate: [
    {
      path: "region",
      model: "Region",
      select: "region_id name -_id",
    },
    {
      path: "township",
      model: "Township",
      select: "township_id name -_id",
    },
    {
      path: "sport_type_data",
      ref: "SportType",
      select: "name sport_type_id -_id",
    },
  ],
  bookingPopulate: [
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
    {
      path: "user",
      model: "User",
      select: "user_id name email phone -_id",
    },
    {
      path: "court",
      model: "Court",
      select: "court_id name phone -_id",
    },
    {
      path: "employee",
      model: "Employee",
      select: "employee_id name email phone -_id",
    },
  ],

  courtPopulate: [
    {
      path: "sport_type",
      model: "SportType",
      select: "sport_type_id name -_id",
    },
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
    {
      path: "region",
      model: "Region",
      select: "region_id name -_id",
    },
    {
      path: "township",
      model: "Township",
      select: "township_id name -_id",
    },
  ],

  employeePopulate: [
    {
      path: "court",
      model: "Court",
      select: "court_id name -_id",
    },
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
  ],

  reviewPopulate: [
    {
      path: "court",
      model: "Court",
      select: "court_id name -_id",
    },
    {
      path: "user",
      model: "User",
      select: "user_id name email avatar -_id",
    },
  ],

  ownerPopulate: [
    {
      path: "sport_type_data",
      ref: "SportType",
      select: "name sport_type_id -_id",
    },
  ],

  planPopulate: [
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
  ],

  subscriptionPopulate: [
    {
      path: "owner",
      model: "Owner",
      select: "owner_id email phone -_id",
    },
  ],

  townshipPopulate: [
    {
      path: "region",
      model: "Region",
      select: "region_id name -_id",
    },
  ],
  contactPopulate: [
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
    {
      path: "user",
      model: "User",
      select: "user_id name email phone -_id",
    },
    {
      path: "employee",
      model: "Employee",
      select: "employee_id name email phone -_id",
    },
  ],
  notificationPopulate: [
    {
      path: "owner",
      model: "Owner",
      select: "owner_id name email phone -_id",
    },
    {
      path: "user",
      model: "User",
      select: "user_id name email phone -_id",
    },
    {
      path: "employee",
      model: "Employee",
      select: "employee_id name email phone -_id",
    },
  ],
  loginAttemptPopulate: [
    {
      path: "user",
      model: "User",
      select: "user_id name email phone -_id",
    }
  ],
};
