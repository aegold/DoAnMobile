import { FONTS } from '../context/FontContext';

export const typography = {
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 32,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  h3: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
  },
  h4: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  subtitle1: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  subtitle2: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  body1: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  body2: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  button: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  overline: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
}; 