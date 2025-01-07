import codeIconDefault from '../../../components/gui/icon--code-gray.svg';
import deleteIconDefault from '../../../components/delete-button/icon--delete-gray.svg';
import dontRotateIconDefault from '../../../components/direction-picker/icon--dont-rotate-gray.svg';
import editIcon from '../../../components/menu-bar/icon--edit-gray.svg';
import exitFullScreenIcon from '../../../components/stage-header/icon--unfullscreen.svg';
import fullScreenIcon from '../../../components/stage-header/icon--fullscreen.svg';
import hideIconDefault from '../../../components/sprite-info/icon--hide-gray.svg';
import largeStageIconDefault from '../../../components/stage-header/icon--large-stage-gray.svg';
import paintIconDefault from '../../../components/gui/icon--costumes-gray.svg';
import rotateAllAroundIconDefault from '../../../components/direction-picker/icon--all-around-gray.svg';
import rotateLeftRightIconDefault from '../../../components/direction-picker/icon--left-right-gray.svg';
import showIconDefault from '../../../components/sprite-info/icon--show-gray.svg';
import smallStageIconDefault from '../../../components/stage-header/icon--small-stage-gray.svg';
import soundIconDefault from '../../../components/gui/icon--sounds-gray.svg';
import xPositionIcon from '../../../components/sprite-info/icon--x.svg';
import yPositionIcon from '../../../components/sprite-info/icon--y.svg';

import clearIcon from '../../../components/filter/icon--x.svg';
import codeIconAccent from '../../../components/gui/icon--code.svg';
import copyIcon from '../../../components/sound-editor/icon--copy.svg';
import copyToNewIcon from '../../../components/sound-editor/icon--copy-to-new.svg';
import dialFace from '../../../components/direction-picker/icon--dial.svg';
import dialHandle from '../../../components/direction-picker/icon--handle.svg';
import dontRotateIconAccent from '../../../components/direction-picker/icon--dont-rotate.svg';
import filterIcon from '../../../components/filter/icon--filter.svg';
import hideIconAccent from '../../../components/sprite-info/icon--hide.svg';
import largeStageIconAccent from '../../../components/stage-header/icon--large-stage.svg';
import paintIconAccent from '../../../components/gui/icon--costumes.svg';
import pasteIcon from '../../../components/sound-editor/icon--paste.svg';
import redoIcon from '../../../components/sound-editor/icon--redo.svg';
import rotateAllAroundIconAccent from '../../../components/direction-picker/icon--all-around.svg';
import rotateLeftRightIconAccent from '../../../components/direction-picker/icon--left-right.svg';
import selectionHandle from '../../../components/audio-trimmer/icon--handle.svg';
import showIconAccent from '../../../components/sprite-info/icon--show.svg';
import smallStageIconAccent from '../../../components/stage-header/icon--small-stage.svg';
import soundIconAccent from '../../../components/gui/icon--sounds.svg';
import trimIcon from '../../../components/sound-editor/icon--delete.svg';
import undoIcon from '../../../components/sound-editor/icon--undo.svg';

import checkIcon from '../../../components/data-panel/icon--check.svg';
import deleteIconOnAccent from '../../../components/delete-button/icon--delete.svg';
import newBackdropIcon from '../../../components/action-menu/icon--backdrop.svg';
import newSoundIcon from '../../../components/asset-panel/icon--add-sound-lib.svg';
import newSpriteIcon from '../../../components/action-menu/icon--sprite.svg';
import paintIconOnAccent from '../../../components/action-menu/icon--paint.svg';
import playIcon from '../../../components/sound-editor/icon--play.svg';
import recordIcon from '../../../components/asset-panel/icon--add-sound-record.svg';
import searchIcon from '../../../components/action-menu/icon--search.svg';
import stopIcon from '../../../components/sound-editor/icon--stop.svg';
import surpriseIcon from '../../../components/action-menu/icon--surprise.svg';
import uploadIcon from '../../../components/action-menu/icon--file-upload.svg';

import fasterIcon from '../../../components/sound-editor/icon--faster.svg';
import slowerIcon from '../../../components/sound-editor/icon--slower.svg';
import louderIcon from '../../../components/sound-editor/icon--louder.svg';
import softerIcon from '../../../components/sound-editor/icon--softer.svg';
import muteIcon from '../../../components/sound-editor/icon--mute.svg';
import fadeInIcon from '../../../components/sound-editor/icon--fade-in.svg';
import fadeOutIcon from '../../../components/sound-editor/icon--fade-out.svg';
import reverseIcon from '../../../components/sound-editor/icon--reverse.svg';
import robotIcon from '../../../components/sound-editor/icon--robot.svg';

const blockColors = {
    motion: {
        primary: '#4C97FF',
        secondary: '#4280D7',
        tertiary: '#3373CC',
        quaternary: '#3373CC',
        code: '#3373CC'
    },
    looks: {
        primary: '#9966FF',
        secondary: '#855CD6',
        tertiary: '#774DCB',
        quaternary: '#774DCB',
        code: '#774DCB'
    },
    sounds: {
        primary: '#CF63CF',
        secondary: '#C94FC9',
        tertiary: '#BD42BD',
        quaternary: '#BD42BD',
        code: '#BD42BD'
    },
    control: {
        primary: '#FFAB19',
        secondary: '#EC9C13',
        tertiary: '#CF8B17',
        quaternary: '#CF8B17',
        code: '#CF8B17'
    },
    event: {
        primary: '#FFBF00',
        secondary: '#E6AC00',
        tertiary: '#CC9900',
        quaternary: '#CC9900',
        code: '#CC9900'
    },
    sensing: {
        primary: '#5CB1D6',
        secondary: '#47A8D1',
        tertiary: '#2E8EB8',
        quaternary: '#2E8EB8',
        code: '#2E8EB8'
    },
    pen: {
        primary: '#0fBD8C',
        secondary: '#0DA57A',
        tertiary: '#0B8E69',
        quaternary: '#0B8E69',
        code: '#0B8E69'
    },
    operators: {
        primary: '#59C059',
        secondary: '#46B946',
        tertiary: '#389438',
        quaternary: '#389438',
        code: '#389438'
    },
    data: {
        primary: '#FF8C1A',
        secondary: '#FF8000',
        tertiary: '#DB6E00',
        quaternary: '#DB6E00',
        code: '#DB6E00'
    },
    // This is not a new category, but rather for differentiation
    // between lists and scalar variables.
    data_lists: {
        primary: '#FF661A',
        secondary: '#FF5500',
        tertiary: '#E64D00',
        quaternary: '#E64D00',
        code: '#E64D00'
    },
    more: {
        primary: '#FF6680',
        secondary: '#FF4D6A',
        tertiary: '#FF3355',
        quaternary: '#FF3355',
        code: '#FF6680'
    },
    text: '#FFFFFF',
    workspace: '#F9F9F9',
    toolboxHover: '#4C97FF',
    toolboxSelected: '#E9EEF2',
    toolboxText: '#575E75',
    toolbox: '#FFFFFF',
    flyout: '#F9F9F9',
    scrollbar: '#CECDCE',
    scrollbarHover: '#CECDCE',
    textField: '#FFFFFF',
    textFieldText: '#575E75',
    insertionMarker: '#000000',
    insertionMarkerOpacity: 0.2,
    dragShadowOpacity: 0.6,
    stackGlow: '#FFF200',
    stackGlowSize: 4,
    stackGlowOpacity: 1,
    replacementGlow: '#FFFFFF',
    replacementGlowSize: 2,
    replacementGlowOpacity: 1,
    colourPickerStroke: '#FFFFFF',
    // CSS colours: support RGBA
    fieldShadow: 'rgba(255, 255, 255, 0.3)',
    dropDownShadow: 'rgba(0, 0, 0, .3)',
    numPadBackground: '#547AB2',
    numPadBorder: '#435F91',
    numPadActiveBackground: '#435F91',
    numPadText: 'white', // Do not use hex here, it cannot be inlined with data-uri SVG
    valueReportBackground: '#FFFFFF',
    valueReportBorder: '#AAAAAA',
    menuHover: 'rgba(0, 0, 0, 0.2)',
    codeTransparentText: 'hsla(225, 15%, 40%, 0.75)',
    customBlockParameter: '#FF3355',
    error: '#E60000'
};

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
    dial: {
        accent: dialFace
    },
    dialHandle: {
        accent: dialHandle
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
    selectionHandle: {
        accent: selectionHandle
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
    icons
};
