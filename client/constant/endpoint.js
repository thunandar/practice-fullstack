//auth
export const api = {
  registerAPI: "/auth/user_register",
  loginAPI: "/auth/user_login",
  adminLoginAPI: "/auth/admin_login",
  authUserAPI: "/auth/auth_user",
  userResetPasswordAPI: "/auth/user_reset_password",
  userVerifyCodeAPI: "/auth/user_verify_code",
  userNewPasswordUpdateAPI: "/auth/user_update_password",

  adminListAPI: "/admin/list",
  adminCreateAPI: "/admin/create",
  adminUpdateAPI: "/admin/update",
  adminDetailAPI: "/admin/detail",
  adminDeleteAPI: "/admin/delete",

  sportTypesListAPI: "/sport_types/list",
  sportTypesCreateAPI: "/sport_types/create",
  sportTypesUpdateAPI: "/sport_types/update",
  sportTypesDetailAPI: "/sport_types/detail",
  sportTypesDeleteAPI: "/sport_types/delete",

  ownerCreate: "/auth/owner_register",
  ownerList: "/owner/list",
  ownerDelete: "/owner/delete",
  ownerUpdate: "/owner/update",
  ownerUpdateStatus: "/owner/status/update",

  regionListAPI: "/region/list",
  regionCreateAPI: "/region/create",
  regionUpdateAPI: "/region/update",
  regionDeleteAPI: "/region/delete",

  bannerListAPI: "/banner/list",
  bannerCreateAPI: "/banner/create",
  bannerUpdateAPI: "/banner/update",
  bannerDeleteAPI: "/banner/delete",

  townshipListAPI: "/township/list",
  townshipCreateAPI: "/township/create",
  townshipUpdateAPI: "/township/update",
  townshipDeleteAPI: "/township/delete",

  bookingListAPI: "/booking/admin/list",
  bookingUpdateAPI: "/booking/change/status",

  // for pricing crud
  pricingListAPI: "/pricing/list",
  pricingCreateAPI: "/pricing/create",
  pricingUpdateAPI: "/pricing/update",
  pricingDeleteAPI: "/pricing/delete",
  pricingDetailAPI: "/pricing/detail",

  userListAPI: "/user/list",
  userSearchAPI: "/user/search",

  contactListAPI: "/contact/list",
  contactDeleteAPI: "/contact/delete",
};
