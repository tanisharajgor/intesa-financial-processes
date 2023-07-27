export const naColor = 0x777777;
export const naColorHex = '#777777';

export const primaryLabelColor = 0xffffff;

export const lightGreyColor = 0xCBCBCB;
export const lightGreyColorRGB = 'rgb(203, 203, 203)';
export const lightGreyColorHex = '#CBCBCB';

export const darkGreyColor = 0x929295;
export const darkGreyColorRGB = 'rgb(145, 146, 149)';
export const darkGreyColorHex = '#929295';

export const extraDarkGreyColor = 0x4e5155;
export const extraDarkGreyHex = '#4e5155';
export const extraDarkGreyRGB = 'rgb(78, 81, 85)';

export const primaryColor = 0x03afbf;
export const primaryColorHex = '#03afbf';

export const tooltipStyles = {
  fontFamily: '"IBM Plex", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '13px',
  fontColor: lightGreyColorHex,
  lineHeight: '130%'
};

export const labelStyles = {
  fontFamily: '"IBM Plex", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '13px',
  fontColor: darkGreyColorHex
};

export const GlobalTheme = {
    color: {
      main: '#ffffff',
      secondary: darkGreyColorHex,
      mainDark: '#08090b',
      focus: primaryColorHex,
      border: extraDarkGreyHex
    },
    backgroundColor: {
      main: '#21252b',
    },
    font: {
      family: 'Plex, Tahoma, Verdana, Geneva, sans-serif',
      heading: '',
      subHeading: '',
      baseSize: '14px',
      lineHeight: '1.4rem',
    },
    headerWeight: "48px",
    padding: '0.625rem',
    viewColWidth: '17rem'
  }

export const labelZAxisDefault = 100;
export const nonHighlightOpacity = .15;

export const labelStylePrimary = {
  align: "center",
  fill: primaryLabelColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 13,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 120,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}
  
export const labelStyleSecondary = {
  align: "center",
  fill: lightGreyColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 6,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 140,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 1,
  dropShadowColor: 0x21252b
}
  
export const labelStyleTertiary = {
  align: "center",
  fill: primaryLabelColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 5,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 50,
  leading: -1,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}
  
export const labelStyleQuartiary = {
  align: "center",
  fill: primaryLabelColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 3,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 30,
  leading: -1,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}
