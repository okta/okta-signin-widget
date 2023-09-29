export const DESIGN_TOKENS = {
  // BorderColor
  BorderColorControl: "#8d8d8d",
  BorderColorDisplay: "#e1e1e1",
  BorderColorDisabled: "#e1e1e1",
  BorderColorDangerLight: "#fe8f7a",
  BorderColorDangerControl: "#e72500",
  BorderColorDangerDark: "#951800",
  BorderColorPrimaryControl: "#546be7",
  BorderColorPrimaryDark: "#2e40a5",

  // BorderRadius
  BorderRadiusTight: "4px",
  BorderRadiusMain: "6px", // theme.mixins.borderRadius
  BorderRadiusOuter: "12px",
  BorderRadiusRound: "1.5em",

  // BorderStyle
  BorderStyleMain: "solid", // theme.mixins.borderStyle

  // BorderWidth
  BorderWidthMain: "1px", // theme.mixins.borderWidth
  BorderWidthHeavy: "1.5px",

  // FocusOutlineColor
  FocusOutlineColorPrimary: "#546be7",
  FocusOutlineColorDanger: "#e72500",

  // FocusOutlineOffset
  FocusOutlineOffsetMain: "2px",
  FocusOutlineOffsetTight: "0",

  // FocusOutlineStyle
  FocusOutlineStyle: "solid",

  // FocuOutlineWidth
  FocusOutlineWidthMain: "2px",
  FocusOutlineWidthTight: "1px",

  // HueNeutral
  HueNeutral50: "#f4f4f4",
  HueNeutral100: "#ededed",
  HueNeutral200: "#e1e1e1",
  HueNeutral300: "#cbcbcb",
  HueNeutral400: "#aeaeae",
  HueNeutral500: "#8d8d8d",
  HueNeutral600: "#6e6e6e",
  HueNeutral700: "#4b4b4b",
  HueNeutral800: "#383838",
  HueNeutral900: "#272727",
  HueNeutralWhite: "#ffffff",

  // HueBlue
  HueBlue50: "#f2f3fd",
  HueBlue100: "#dbe0fa",
  HueBlue200: "#c1c9f6",
  HueBlue300: "#9daaf1",
  HueBlue400: "#7286eb",
  HueBlue500: "#546be7",
  HueBlue600: "#4c64e1",
  HueBlue700: "#2e40a5",
  HueBlue800: "#22307c",
  HueBlue900: "#182257",

  // HueGreen
  HueGreen50: "#defae7",
  HueGreen100: "#94f5b3",
  HueGreen200: "#7be09e",
  HueGreen300: "#59c282",
  HueGreen400: "#31a061",
  HueGreen500: "#16884a",
  HueGreen600: "#197f48",
  HueGreen700: "#0e562f",
  HueGreen800: "#0a4023",
  HueGreen900: "#072e19",

  // HueRed
  HueRed50: "#fff0ee",
  HueRed100: "#ffd8d1",
  HueRed200: "#febbae",
  HueRed300: "#fe8f7a",
  HueRed400: "#fd4e2d",
  HueRed500: "#e72500",
  HueRed600: "#d92300",
  HueRed700: "#951800",
  HueRed800: "#711200",
  HueRed900: "#500d00",

  // HueYellow
  HueYellow50: "#fcf6ac",
  HueYellow100: "#fce101",
  HueYellow200: "#f9c503",
  HueYellow300: "#eb9e05",
  HueYellow400: "#bf8004",
  HueYellow500: "#a16c03",
  HueYellow600: "#966603",
  HueYellow700: "#664402",
  HueYellow800: "#4c3302",
  HueYellow900: "#352401",

  // PalettePrimary
  PalettePrimaryLighter: "#f2f3fd", // theme.palette.primary.lighter
  PalettePrimaryLight: "#9daaf1", // theme.palette.primary.light
  PalettePrimaryMain: "#546be7", // theme.palette.primary.main
  PalettePrimaryDark: "#2e40a5", // theme.palette.primary.dark
  PalettePrimaryDarker: "#22307c",
  PalettePrimaryText: "#4c64e1",
  PalettePrimaryHeading: "#182257",
  PalettePrimaryHighlight: "#dbe0fa",

  // PaletteDanger
  PaletteDangerLighter: "#fff0ee", // theme.palette.error.lighter
  PaletteDangerLight: "#fe8f7a", // theme.palette.error.light
  PaletteDangerMain: "#e72500", // theme.palette.error.main
  PaletteDangerDark: "#951800", // theme.palette.error.dark
  PaletteDangerDarker: "#711200",
  PaletteDangerText: "#d92300",
  PaletteDangerHeading: "#500d00",
  PaletteDangerHighlight: "#ffd8d1",

  // PaletteWarning
  PaletteWarningLighter: "#fcf6ac", // theme.palette.warning.lighter
  PaletteWarningLight: "#eb9e05", // theme.palette.warning.light
  PaletteWarningMain: "#a16c03", // theme.palette.warning.main
  PaletteWarningDark: "#664402", // theme.palette.warning.dark
  PaletteWarningDarker: "#4c3302",
  PaletteWarningText: "#966603",
  PaletteWarningHeading: "#352401",
  PaletteWarningHighlight: "#fce101",

  // PaletteSuccess
  PaletteSuccessLighter: "#defae7", // theme.palette.success.lighter
  PaletteSuccessLight: "#59c282", // theme.palette.success.light
  PaletteSuccessMain: "#16884a", // theme.palette.success.main
  PaletteSuccessDark: "#0e562f", // theme.palette.success.dark
  PaletteSuccessDarker: "#0a4023",
  PaletteSuccessText: "#197f48",
  PaletteSuccessHeading: "#072e19",
  PaletteSuccessHighlight: "#94f5b3",

  // PaletteNeutral
  PaletteNeutralMain: "#6e6e6e",
  PaletteNeutralDark: "#272727",

  // PaletteAlpha
  PaletteAlphaOpaque: "FF",
  PaletteAlphaSemi: "BF",

  // ShadowScale
  ShadowScale0: "0px 1px 4px rgba(29, 29, 33, 0.08), 0px 4px 6px rgba(29, 29, 33, 0.01), 0px 5px 15px rgba(29, 29, 33, 0.05)", // theme.shadows[1]
  ShadowScale1: "0px 1px 4px rgba(29, 29, 33, 0.08), 0px 4px 10px rgba(29, 29, 33, 0.08), 0px 8px 30px rgba(29, 29, 33, 0.1)", // theme.shadows[2]

  // Spacing
  Spacing0: "0",
  Spacing1: "0.28571429rem",
  Spacing2: "0.57142857rem",
  Spacing3: "0.85714286rem",
  Spacing4: "1.14285714rem",
  Spacing5: "1.71428571rem",
  Spacing6: "2.28571429rem",
  Spacing7: "2.85714286rem",
  Spacing8: "3.42857143rem",
  Spacing9: "4rem",

  // Transition
  TransitionDurationMain: "100ms",
  TransitionTimingMain: "linear",

  // TypographyColor
  TypographyColorBody: "#272727", // theme.palette.text.primary
  TypographyColorHeading: "#272727", // theme.typography.h1.color
  TypographyColorInverse: "#ffffff",
  TypographyColorSupport: "#4b4b4b",
  TypographyColorSubordinate: "#6e6e6e", // theme.typography.caption.color
  TypographyColorDisabled: "#aeaeae", // theme.palette.text.disabled
  TypographyColorAction: "#4c64e1",
  TypographyColorDanger: "#d92300",
  TypographyColorSuccess: "#197f48",
  TypographyColorWarning: "#966603",

  // TypographyFamily
  TypographyFamilyBody: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif", // theme.typography.fontFamily
  TypographyFamilyHeading: "'Aeonik', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif", // theme.typography.h1.fontFamily
  TypographyFamilyButton: "'Aeonik', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif", // theme.typography.button.fontFamily
  TypographyFamilyMono: "'Roboto Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace", // theme.typography.kbd.fontFamily

  // TypographyScale
  TypographyScale0: "0.857rem",
  TypographyScale1: "1rem",
  TypographyScale2: "1.143rem",
  TypographyScale3: "1.286rem",
  TypographyScale4: "1.429rem",
  TypographyScale5: "1.571rem",
  TypographyScale6: "1.786rem",
  TypographyScale7: "2rem",
  TypographyScale8: "2.286rem",
  TypographyScale9: "2.571rem",
  TypographyScale10: "2.857rem",
  TypographyScale11: "3.214rem",
  TypographyScale12: "3.643rem",

  // TypographySize
  TypographySizeBase: "87.5%", // theme.typography.body1.fontSize
  TypographySizeSubordinate: "0.857rem", // theme.typography.caption.fontSize
  TypographySizeBody: "1rem", // theme.typography.body1.fontSize
  TypographySizeHeading6: "1.143rem", // theme.typography.h6.fontSize
  TypographySizeHeading5: "1.286rem", // theme.typography.h5.fontSize
  TypographySizeHeading4: "1.571rem", // theme.typography.h4.fontSize
  TypographySizeHeading3: "2.000rem", // theme.typography.h3.fontSize
  TypographySizeHeading2: "2.286rem", // theme.typography.h2.fontSize
  TypographySizeHeading1: "2.571rem", // theme.typography.h1.fontSize

  // TypographyStyle
  TypographyStyleNormal: "normal", // theme.typography.body1.fontStyle

  // TypographyWeight
  TypographyWeightBody: "400", // theme.typography.fontWeightMedium
  TypographyWeightBodyBold: "600", // theme.typography.fontWeightBold
  TypographyWeightHeading: "500", // theme.typography.h1.fontWeight
  TypographyWeightHeadingBold: "700",

  // TypographyLineHeight
  TypographyLineHeightBody: 1.5, // theme.typography.body1.lineHeight
  TypographyLineHeightUi: 1.2,
  TypographyLineHeightOverline: 1.3, // theme.typography.overline.lineHeight
  TypographyLineHeightHeading6: 1.3, // theme.typography.h6.lineHeight
  TypographyLineHeightHeading5: 1.3, // theme.typography.h5.lineHeight
  TypographyLineHeightHeading4: 1.25, // theme.typography.h4.lineHeight
  TypographyLineHeightHeading3: 1.25, // theme.typography.h3.lineHeight
  TypographyLineHeightHeading2: 1.2, // theme.typography.h2.lineHeight
  TypographyLineHeightHeading1: 1.2, // theme.typography.h1.lineHeight

  // TypographyLineLength
  TypographyLineLengthMax: "55ch",
};

export type DesignTokensType = typeof DESIGN_TOKENS;
