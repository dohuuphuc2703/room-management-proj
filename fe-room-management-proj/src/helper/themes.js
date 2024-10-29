const primaryColor = "#00b14f";
const bgBlur = "#00b14f0a";

export const themes = {
  components: {
    Checkbox: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryColor,
    },
    Radio: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryColor,
    },
    Menu: {
      itemSelectedBg: bgBlur,
      itemHoverBg: bgBlur,
      itemActiveBg: bgBlur,
      itemSelectedColor: primaryColor,
    },
    Select: {
      optionSelectedBg: bgBlur,
      fontSizeLG: "14px",
      optionActiveBg: bgBlur,
      optionSelectedColor: primaryColor,
    },
    message: {
      maxCount: 3,
    },
    Tabs: {
      inkBarColor: primaryColor,
      itemActiveColor: "#00be55",
      itemHoverColor: primaryColor,
      itemSelectedColor: primaryColor,
    },
    Spin: {
      colorBgMask: "#FFF",
    },
    Dropdown: {
      controlItemBgHover: bgBlur,
    }
  }
};

export const adminTableThemes = {
  components: {
    Table: {
      colorPrimary: primaryColor,
      cellFontSizeMD: "13px",
      rowHoverBg: bgBlur,
      headerBorderRadius: 0,
      rowSelectedBg: "#00b1501f",
      rowSelectedHoverBg: "#00b15048"
    },
    Button: {
      colorPrimary: primaryColor,
      colorLink: primaryColor,
      colorPrimaryActive: "#02b050",
      colorLinkActive: "#02b050",
      colorPrimaryHover: "#04df67",
      colorLinkHover: "#04df67",
    },
    Link: {
      colorPrimary: primaryColor,
    },
    Pagination: {
      colorPrimary: primaryColor,
    },
    Select: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryColor,
    },
    Dropdown: {
      colorPrimary: primaryColor,
      controlItemBgActive: "#00b15018",
      controlItemBgActiveHover: "#00b1503c",
    },
    Input: {
      activeBorderColor: primaryColor,
      hoverBorderColor: "#04df67",
    }
  }
}