const initialState = JSON.parse(localStorage.getItem('user')) || {};

const userReducer = (state=initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem('user', JSON.stringify(action.payload));
      return action.payload;
    case "LOGOUT":
      localStorage.removeItem('user');
      return {};
    case "SET_ADMIN_INFO":
      localStorage.setItem('user', JSON.stringify(action.payload));
      return action.payload;
    case "SET_TENANT_INFO":
      localStorage.setItem('user', JSON.stringify(action.payload));
      return action.payload;
    case "SET_LANDLORD_INFO":
      localStorage.setItem('user', JSON.stringify(action.payload));
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;