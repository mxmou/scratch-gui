import codeIconDefault from '../../../components/gui/icon--code-white.svg';
import deleteIconDefault from '../../../components/delete-button/icon--delete.svg';
import dontRotateIconDefault from '../../../components/direction-picker/icon--dont-rotate-white.svg';
import editIcon from '../../../components/menu-bar/icon--edit.svg';
import exitFullScreenIcon from '../../../components/stage-header/icon--unfullscreen-white.svg';
import fullScreenIcon from '../../../components/stage-header/icon--fullscreen-white.svg';
import hideIconDefault from '../../../components/sprite-info/icon--hide-white.svg';
import largeStageIconDefault from '../../../components/stage-header/icon--large-stage-white.svg';
import paintIconDefault from '../../../components/action-menu/icon--paint.svg';
import rotateAllAroundIconDefault from '../../../components/direction-picker/icon--all-around-white.svg';
import rotateLeftRightIconDefault from '../../../components/direction-picker/icon--left-right-white.svg';
import showIconDefault from '../../../components/sprite-info/icon--show-white.svg';
import smallStageIconDefault from '../../../components/stage-header/icon--small-stage-white.svg';
import soundIconDefault from '../../../components/gui/icon--sounds-white.svg';
import xPositionIcon from '../../../components/sprite-info/icon--x-white.svg';
import yPositionIcon from '../../../components/sprite-info/icon--y-white.svg';

import clearIcon from '../../../components/filter/icon--x-dark-mode.svg';
import codeIconAccent from '../../../components/gui/icon--code-dark-mode.svg';
import copyIcon from '../../../components/sound-editor/icon--copy-dark-mode.svg';
import copyToNewIcon from '../../../components/sound-editor/icon--copy-to-new-dark-mode.svg';
import dontRotateIconAccent from '../../../components/direction-picker/icon--dont-rotate-dark-mode.svg';
import filterIcon from '../../../components/filter/icon--filter-dark-mode.svg';
import hideIconAccent from '../../../components/sprite-info/icon--hide-dark-mode.svg';
import largeStageIconAccent from '../../../components/stage-header/icon--large-stage-dark-mode.svg';
import paintIconAccent from '../../../components/gui/icon--costumes-dark-mode.svg';
import pasteIcon from '../../../components/sound-editor/icon--paste-dark-mode.svg';
import redoIcon from '../../../components/sound-editor/icon--redo-dark-mode.svg';
import rotateAllAroundIconAccent from '../../../components/direction-picker/icon--all-around-dark-mode.svg';
import rotateLeftRightIconAccent from '../../../components/direction-picker/icon--left-right-dark-mode.svg';
import showIconAccent from '../../../components/sprite-info/icon--show-dark-mode.svg';
import smallStageIconAccent from '../../../components/stage-header/icon--small-stage-dark-mode.svg';
import soundIconAccent from '../../../components/gui/icon--sounds-dark-mode.svg';
import trimIcon from '../../../components/sound-editor/icon--delete-dark-mode.svg';
import undoIcon from '../../../components/sound-editor/icon--undo-dark-mode.svg';

import checkIcon from '../../../components/data-panel/icon--check-black.svg';
import deleteIconOnAccent from '../../../components/delete-button/icon--delete-black.svg';
import newBackdropIcon from '../../../components/action-menu/icon--backdrop-black.svg';
import newSoundIcon from '../../../components/asset-panel/icon--add-sound-lib-black.svg';
import newSpriteIcon from '../../../components/action-menu/icon--sprite-black.svg';
import paintIconOnAccent from '../../../components/action-menu/icon--paint-black.svg';
import playIcon from '../../../components/sound-editor/icon--play-black.svg';
import recordIcon from '../../../components/asset-panel/icon--add-sound-record-black.svg';
import searchIcon from '../../../components/action-menu/icon--search-black.svg';
import stopIcon from '../../../components/sound-editor/icon--stop-black.svg';
import surpriseIcon from '../../../components/action-menu/icon--surprise-black.svg';
import uploadIcon from '../../../components/action-menu/icon--file-upload-black.svg';

import fasterIcon from '../../../components/sound-editor/icon--faster-dark-mode.svg';
import slowerIcon from '../../../components/sound-editor/icon--slower-dark-mode.svg';
import louderIcon from '../../../components/sound-editor/icon--louder-dark-mode.svg';
import softerIcon from '../../../components/sound-editor/icon--softer-dark-mode.svg';
import muteIcon from '../../../components/sound-editor/icon--mute-dark-mode.svg';
import fadeInIcon from '../../../components/sound-editor/icon--fade-in-dark-mode.svg';
import fadeOutIcon from '../../../components/sound-editor/icon--fade-out-dark-mode.svg';
import reverseIcon from '../../../components/sound-editor/icon--reverse-dark-mode.svg';
import robotIcon from '../../../components/sound-editor/icon--robot-dark-mode.svg';

const blockColors = {
    motion: {
        primary: '#0F1E33',
        secondary: '#4C4C4C',
        tertiary: '#4C97FF',
        quaternary: '#4C97FF',
        code: '#80B5FF'
    },
    looks: {
        primary: '#1E1433',
        secondary: '#4C4C4C',
        tertiary: '#9966FF',
        quaternary: '#9966FF',
        code: '#CCB3FF'
    },
    sounds: {
        primary: '#291329',
        secondary: '#4C4C4C',
        tertiary: '#CF63CF',
        quaternary: '#CF63CF',
        code: '#E19DE1'
    },
    control: {
        primary: '#332205',
        secondary: '#4C4C4C',
        tertiary: '#FFAB19',
        quaternary: '#FFAB19',
        code: '#FFBE4C'
    },
    event: {
        primary: '#332600',
        secondary: '#4C4C4C',
        tertiary: '#FFBF00',
        quaternary: '#FFBF00',
        code: '#FFD966'
    },
    sensing: {
        primary: '#12232A',
        secondary: '#4C4C4C',
        tertiary: '#5CB1D6',
        quaternary: '#5CB1D6',
        code: '#85C4E0'
    },
    pen: {
        primary: '#03251C',
        secondary: '#4C4C4C',
        tertiary: '#0fBD8C',
        quaternary: '#0fBD8C',
        code: '#13ECAF'
    },
    operators: {
        primary: '#112611',
        secondary: '#4C4C4C',
        tertiary: '#59C059',
        quaternary: '#59C059',
        code: '#7ECE7E'
    },
    data: {
        primary: '#331C05',
        secondary: '#4C4C4C',
        tertiary: '#FF8C1A',
        quaternary: '#FF8C1A',
        code: '#FFA54C'
    },
    data_lists: {
        primary: '#331405',
        secondary: '#4C4C4C',
        tertiary: '#FF661A',
        quaternary: '#FF661A',
        code: '#FF9966'
    },
    more: {
        primary: '#331419',
        secondary: '#4C4C4C',
        tertiary: '#FF6680',
        quaternary: '#FF6680',
        code: '#FFCCD5'
    },
    text: 'rgba(255, 255, 255, .7)',
    textFieldText: '#E5E5E5',
    workspace: '#121212',
    toolboxSelected: '#4C4C4C',
    toolboxText: '#E5E5E5',
    toolbox: '#121212',
    flyout: '#121212',
    textField: '#4C4C4C',
    menuHover: 'rgba(255, 255, 255, 0.3)',
    codeTransparentText: 'rgba(255, 255, 255, 0.75)',
    customBlockParameter: '#FF99AA',
    error: '#FF9999'
};

const extensions = {};

const icons = {
    check: {
        onAccent: checkIcon
    },
    clear: {
        accent: clearIcon
    },
    code: {
        default: codeIconDefault,
        accent: codeIconAccent
    },
    copy: {
        accent: copyIcon
    },
    copyToNew: {
        accent: copyToNewIcon
    },
    delete: {
        default: deleteIconDefault,
        onAccent: deleteIconOnAccent
    },
    dontRotate: {
        default: dontRotateIconDefault,
        accent: dontRotateIconAccent
    },
    edit: {
        default: editIcon
    },
    exitFullScreen: {
        default: exitFullScreenIcon
    },
    filter: {
        accent: filterIcon
    },
    fullScreen: {
        default: fullScreenIcon
    },
    hide: {
        default: hideIconDefault,
        accent: hideIconAccent
    },
    largeStage: {
        default: largeStageIconDefault,
        accent: largeStageIconAccent
    },
    newBackdrop: {
        onAccent: newBackdropIcon
    },
    newSound: {
        onAccent: newSoundIcon
    },
    newSprite: {
        onAccent: newSpriteIcon
    },
    paint: {
        default: paintIconDefault,
        accent: paintIconAccent,
        onAccent: paintIconOnAccent
    },
    paste: {
        accent: pasteIcon
    },
    play: {
        onAccent: playIcon
    },
    record: {
        onAccent: recordIcon
    },
    redo: {
        accent: redoIcon
    },
    rotateAllAround: {
        default: rotateAllAroundIconDefault,
        accent: rotateAllAroundIconAccent
    },
    rotateLeftRight: {
        default: rotateLeftRightIconDefault,
        accent: rotateLeftRightIconAccent
    },
    search: {
        onAccent: searchIcon
    },
    show: {
        default: showIconDefault,
        accent: showIconAccent
    },
    smallStage: {
        default: smallStageIconDefault,
        accent: smallStageIconAccent
    },
    sound: {
        default: soundIconDefault,
        accent: soundIconAccent
    },
    stop: {
        onAccent: stopIcon
    },
    surprise: {
        onAccent: surpriseIcon
    },
    trim: {
        accent: trimIcon
    },
    undo: {
        accent: undoIcon
    },
    upload: {
        onAccent: uploadIcon
    },
    xPosition: {
        default: xPositionIcon
    },
    yPosition: {
        default: yPositionIcon
    },
    // Sound effects
    faster: fasterIcon,
    slower: slowerIcon,
    louder: louderIcon,
    softer: softerIcon,
    mute: muteIcon,
    fadeIn: fadeInIcon,
    fadeOut: fadeOutIcon,
    reverse: reverseIcon,
    robot: robotIcon
};

export {
    blockColors,
    extensions,
    icons
};
