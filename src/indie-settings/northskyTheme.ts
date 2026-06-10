export const northskyDarkTheme = {
  palette: {
    primary_25: 'red',
    primary_50: 'yellow',
    primary_100: '#38175A', // Hover background icons
    primary_200: '#7780DC', // Disabled button background
    primary_300: '#59B2CF', // Hover language selector
    primary_500: '#9A45EC', // Primary button background, link texts
    primary_600: '#59B2CF', // Hover background primary button
  },
  atoms: {
    bg: {
      backgroundColor: '#1F0B35',
    },
    bg_contrast_25: {
      backgroundColor: '#38175A', // hover on clickable items
    },
    bg_contrast_50: {
      backgroundColor: 'blue', // form background, hover clickable areas, secondary button
    },
  },
}

// #122136 is new notficaitions background

export const northskyLightTheme = {
  palette: {
    primary_500: '#9A45EC', // Primary button background, link texts
    primary_600: '#59B2CF',
  },
  atoms: {
    bg: {
      backgroundColor: '#DFE1E3',
    },
  },
}

export const themes = {
  dark: northskyDarkTheme,
  dim: northskyDarkTheme,
  light: northskyLightTheme,
}
