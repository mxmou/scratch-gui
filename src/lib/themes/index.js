import defaultsDeep from 'lodash.defaultsdeep';
import {defineMessages} from 'react-intl';

import {
    blockColors as darkModeBlockColors,
    extensions as darkModeExtensions,
    icons as darkModeIcons
} from './dark';
import {
    blockColors as highContrastBlockColors,
    extensions as highContrastExtensions
} from './high-contrast';
import {
    blockColors as defaultColors,
    icons as defaultIcons
} from './default';

import defaultIcon from './default/icon.svg';
import highContrastIcon from './high-contrast/icon.svg';
import darkIcon from './dark/icon.svg';

const DEFAULT_THEME = 'default';
const HIGH_CONTRAST_THEME = 'high-contrast';
const DARK_THEME = 'dark';

const mergeWithDefaults = colors => defaultsDeep({}, colors, defaultColors);
const mergeIconsWithDefaults = icons => defaultsDeep({}, icons, defaultIcons);

const messages = defineMessages({
    [DEFAULT_THEME]: {
        id: 'gui.theme.default',
        defaultMessage: 'Original',
        description: 'label for original theme'
    },
    [DARK_THEME]: {
        id: 'gui.theme.dark',
        defaultMessage: 'Dark',
        description: 'label for dark mode theme'
    },
    [HIGH_CONTRAST_THEME]: {
        id: 'gui.theme.highContrast',
        defaultMessage: 'High Contrast',
        description: 'label for high theme'
    }
});

const themeMap = {
    [DEFAULT_THEME]: {
        colors: defaultColors,
        extensions: {},
        icons: defaultIcons,
        dark: false,
        label: messages[DEFAULT_THEME],
        icon: defaultIcon
    },
    [DARK_THEME]: {
        colors: mergeWithDefaults(darkModeBlockColors),
        extensions: darkModeExtensions,
        icons: mergeIconsWithDefaults(darkModeIcons),
        dark: true,
        label: messages[DARK_THEME],
        icon: darkIcon
    },
    [HIGH_CONTRAST_THEME]: {
        colors: mergeWithDefaults(highContrastBlockColors),
        extensions: highContrastExtensions,
        icons: defaultIcons,
        dark: false,
        label: messages[HIGH_CONTRAST_THEME],
        icon: highContrastIcon
    }
};

const getThemeInfo = theme => {
    const themeInfo = themeMap[theme];

    if (!themeInfo) {
        throw new Error(`Undefined theme ${theme}`);
    }

    return themeInfo;
};

const getColorsForTheme = theme => {
    const themeInfo = getThemeInfo(theme);
    return themeInfo.colors;
};

const getIconsForTheme = theme => {
    const themeInfo = getThemeInfo(theme);
    return themeInfo.icons;
};

export {
    DEFAULT_THEME,
    DARK_THEME,
    HIGH_CONTRAST_THEME,
    defaultColors,
    getColorsForTheme,
    getIconsForTheme,
    themeMap
};
