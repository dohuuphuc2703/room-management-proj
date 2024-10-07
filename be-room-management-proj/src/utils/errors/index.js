module.exports.getErrorMessage = (error) => {
    const fields = new Map([["phone", "Số điện thoại"], ["email", "Email"]]);
      switch (error.code) {
        case 11000:
          const fieldDuplicate = Object.keys(error.keyPattern).join("");
          return `${fields.get(fieldDuplicate)} đã tồn tại!`;
  
        default:
          return "An unknown error";
      }
  }