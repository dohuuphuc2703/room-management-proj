const userReducer = (state={}, action) => {
  switch (action.type) {
    case "LOGIN":
      return action.payload;
    case "LOGOUT":
      return {};
    case "SET_ADMIN_INFO":
      return action.payload;
    case "SET_TENANT_INFO":
      return action.payload;
    case "SET_LANDLORD_INFO":
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;