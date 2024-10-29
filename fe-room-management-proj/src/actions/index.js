export const login = (payload) => ({
    type: "LOGIN",
    payload,
  });
  
  export const logout = () => ({
    type: "LOGOUT",
  });
  
  export const setAdminInfo = (payload) => ({
    type: "SET_ADMIN_INFO",
    payload,
  });
  
  export const setTenantInfo = (payload) => ({
    type: "SET_TENANT_INFO",
    payload,
  });
  
  export const setLandlordInfo = (payload) => ({
    type: "SET_LANDLORD_INFO",
    payload,
  });