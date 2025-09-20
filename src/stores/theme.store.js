import create from 'zustand';
import { lime, magenta, red } from '@ant-design/colors';

export const themes = [
  {
    id: 0,
    fontColor: 'black',
    backgroundColor: 'white',
    primaryColor: '#1890ff',
    secondaryColor: 'yellowgreen',
  },
  {
    id: 1,
    fontColor: magenta[8],
    backgroundColor: 'white',
    primaryColor: lime[9],
    secondaryColor: 'burlywood',
  },
  {
    id: 2,
    fontColor: 'black',
    backgroundColor: 'white',
    primaryColor: 'green',
    secondaryColor: red[3],
  },
];

export const customTheme = {
  fontColor: 'white',
  backgroundColor: 'black',
  primaryColor: 'yellow',
  secondaryColor: lime[6],
};

export const useThemes = create((set) => ({
  theme: themes[0],
  customTheme,

  chooseTheme: (index) => set({ theme: themes[index] }),
  chooseCustomTheme: () =>
    set((state) => ({
      theme: state.customTheme,
    })),

  setCustomTheme: (color, type) =>
    set((state) => {
      const userTheme = { ...state.customTheme, [type]: color };
      return { theme: userTheme, customTheme: userTheme };
    }),
}));
