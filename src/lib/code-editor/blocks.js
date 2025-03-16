const blocks = [
    // Motion
    {
        selector: 'motion_movesteps',
        spec: 'move %n steps',
        inputNames: ['STEPS']
    },
    {
        selector: 'motion_turnright',
        spec: 'turn @turnRight %n degrees',
        inputNames: ['DEGREES']
    },
    {
        selector: 'motion_turnleft',
        spec: 'turn @turnLeft %n degrees',
        inputNames: ['DEGREES']
    },

    {
        selector: 'motion_goto',
        spec: 'go to %m.motion_goto_menu',
        inputNames: ['TO']
    },
    {
        selector: 'motion_gotoxy',
        spec: 'go to x:%n y:%n',
        inputNames: ['X', 'Y']
    },
    {
        selector: 'motion_glideto',
        spec: 'glide %n secs to %m.motion_glideto_menu',
        inputNames: ['SECS', 'TO']
    },
    {
        selector: 'motion_glidesecstoxy',
        spec: 'glide %n secs to x:%n y:%n',
        inputNames: ['SECS', 'X', 'Y']
    },

    {
        selector: 'motion_pointindirection',
        spec: 'point in direction %n',
        inputNames: ['DIRECTION']
    },
    {
        selector: 'motion_pointtowards',
        spec: 'point towards %m.motion_pointtowards_menu',
        inputNames: ['TOWARDS']
    },

    {
        selector: 'motion_changexby',
        spec: 'change x by %n',
        inputNames: ['DX']
    },
    {
        selector: 'motion_setx',
        spec: 'set x to %n',
        inputNames: ['X']
    },
    {
        selector: 'motion_changeyby',
        spec: 'change y by %n',
        inputNames: ['DY']
    },
    {
        selector: 'motion_sety',
        spec: 'set y to %n',
        inputNames: ['Y']
    },

    {
        selector: 'motion_ifonedgebounce',
        spec: 'if on edge, bounce'
    },

    {
        selector: 'motion_setrotationstyle',
        spec: 'set rotation style %m.rotationStyle',
        inputNames: ['STYLE']
    },

    {
        selector: 'motion_xposition',
        spec: 'x position',
        shape: 'reporter'
    },
    {
        selector: 'motion_yposition',
        spec: 'y position',
        shape: 'reporter'
    },
    {
        selector: 'motion_direction',
        spec: 'direction',
        shape: 'reporter'
    },

    // Looks
    {
        selector: 'looks_sayforsecs',
        spec: 'say %s for %n seconds',
        inputNames: ['MESSAGE', 'SECS']
    },
    {
        selector: 'looks_say',
        spec: 'say %s',
        inputNames: ['MESSAGE']
    },
    {
        selector: 'looks_thinkforsecs',
        spec: 'think %s for %n seconds',
        inputNames: ['MESSAGE', 'SECS']
    },
    {
        selector: 'looks_think',
        spec: 'think %s',
        inputNames: ['MESSAGE']
    },

    {
        selector: 'looks_switchcostumeto',
        spec: 'switch costume to %m.looks_costume',
        inputNames: ['COSTUME']
    },
    {
        selector: 'looks_nextcostume',
        spec: 'next costume'
    },
    {
        selector: 'looks_switchbackdropto',
        spec: 'switch backdrop to %m.looks_backdrops',
        inputNames: ['BACKDROP']
    },
    {
        selector: 'looks_switchbackdroptoandwait',
        spec: 'switch backdrop to %m.looks_backdrops and wait',
        inputNames: ['BACKDROP']
    },
    {
        selector: 'looks_nextbackdrop',
        spec: 'next backdrop'
    },

    {
        selector: 'looks_changesizeby',
        spec: 'change size by %n',
        inputNames: ['CHANGE']
    },
    {
        selector: 'looks_setsizeto',
        spec: 'set size to %n%',
        inputNames: ['SIZE']
    },

    {
        selector: 'looks_changeeffectby',
        spec: 'change %m.effect effect by %n',
        inputNames: ['EFFECT', 'CHANGE']
    },
    {
        selector: 'looks_seteffectto',
        spec: 'set %m.effect effect to %n',
        inputNames: ['EFFECT', 'VALUE']
    },
    {
        selector: 'looks_cleargraphiceffects',
        spec: 'clear graphic effects'
    },

    {
        selector: 'looks_show',
        spec: 'show'
    },
    {
        selector: 'looks_hide',
        spec: 'hide'
    },

    {
        selector: 'looks_gotofrontback',
        spec: 'go to %m.frontBack layer',
        inputNames: ['FRONT_BACK']
    },
    {
        selector: 'looks_goforwardbackwardlayers',
        spec: 'go %m.forwardBackward %n layers',
        inputNames: ['FORWARD_BACKWARD', 'NUM']
    },

    {
        selector: 'looks_costumenumbername',
        spec: 'costume %m.numberName',
        inputNames: ['NUMBER_NAME'],
        shape: 'reporter'
    },
    {
        selector: 'looks_backdropnumbername',
        spec: 'backdrop %m.numberName',
        inputNames: ['NUMBER_NAME'],
        shape: 'reporter'
    },
    {
        selector: 'looks_size',
        spec: 'size',
        shape: 'reporter'
    },

    // Sound
    {
        selector: 'sound_playuntildone',
        spec: 'play sound %m.sound_sounds_menu until done',
        inputNames: ['SOUND_MENU']
    },
    {
        selector: 'sound_play',
        spec: 'start sound %m.sound_sounds_menu',
        inputNames: ['SOUND_MENU']
    },
    {
        selector: 'sound_stopallsounds',
        spec: 'stop all sounds'
    },

    {
        selector: 'sound_changeeffectby',
        spec: 'change %m.soundEffect effect by %n',
        inputNames: ['EFFECT', 'VALUE']
    },
    {
        selector: 'sound_seteffectto',
        spec: 'set %m.soundEffect effect to %n',
        inputNames: ['EFFECT', 'VALUE']
    },
    {
        selector: 'sound_cleareffects',
        spec: 'clear sound effects'
    },

    {
        selector: 'sound_changevolumeby',
        spec: 'change volume by %n',
        inputNames: ['VOLUME']
    },
    {
        selector: 'sound_setvolumeto',
        spec: 'set volume to %n%',
        inputNames: ['VOLUME']
    },
    {
        selector: 'sound_volume',
        spec: 'volume',
        shape: 'reporter'
    },

    // Events
    {
        selector: 'event_whenflagclicked',
        spec: 'when @greenFlag clicked',
        shape: 'hat'
    },
    {
        selector: 'event_whenkeypressed',
        spec: 'when %m.key key pressed',
        inputNames: ['KEY_OPTION'],
        shape: 'hat'
    },
    {
        selector: 'event_whenthisspriteclicked',
        spec: 'when this sprite clicked',
        shape: 'hat'
    },
    {
        selector: 'event_whenbackdropswitchesto',
        spec: 'when backdrop switches to %m.backdrop',
        inputNames: ['BACKDROP'],
        shape: 'hat'
    },

    {
        selector: 'event_whengreaterthan',
        spec: 'when %m.triggerSensor > %n',
        inputNames: ['WHENGREATERTHANMENU', 'VALUE'],
        shape: 'hat'
    },

    {
        selector: 'event_whenbroadcastreceived',
        spec: 'when I receive %m.broadcast',
        inputNames: ['BROADCAST_OPTION'],
        shape: 'hat'
    },
    {
        selector: 'event_broadcast',
        spec: 'broadcast %m.event_broadcast_menu',
        inputNames: ['BROADCAST_INPUT']
    },
    {
        selector: 'event_broadcastandwait',
        spec: 'broadcast %m.event_broadcast_menu and wait',
        inputNames: ['BROADCAST_INPUT']
    },

    // Control
    {
        selector: 'control_wait',
        spec: 'wait %n seconds',
        inputNames: ['DURATION']
    },

    {
        selector: 'control_repeat',
        spec: 'repeat %n',
        inputNames: ['TIMES'],
        shape: 'c-block'
    },
    {
        selector: 'control_forever',
        spec: 'forever',
        shape: 'c-block cap'
    },

    {
        selector: 'control_if',
        spec: 'if %b then',
        inputNames: ['CONDITION'],
        shape: 'c-block'
    },
    {
        selector: 'control_if_else',
        spec: 'if %b then',
        inputNames: ['CONDITION'],
        shape: 'if-block'
    },
    {
        selector: 'control_wait_until',
        spec: 'wait until %b',
        inputNames: ['CONDITION']
    },
    {
        selector: 'control_repeat_until',
        spec: 'repeat until %b',
        inputNames: ['CONDITION'],
        shape: 'c-block'
    },
    {
        selector: 'control_stop',
        spec: 'stop %m.stop',
        inputNames: ['STOP_OPTION'],
        shape: 'cap'
    },

    {
        selector: 'control_start_as_clone',
        spec: 'when I start as a clone',
        shape: 'hat'
    },
    {
        selector: 'control_create_clone_of',
        spec: 'create clone of %m.control_create_clone_of_menu',
        inputNames: ['CLONE_OPTION']
    },
    {
        selector: 'control_delete_this_clone',
        spec: 'delete this clone',
        shape: 'cap'
    },

    {
        category: 'control',
        selector: 'else',
        spec: 'else',
        shape: 'else'
    },
    {
        category: 'control',
        selector: 'end',
        spec: 'end',
        shape: 'end'
    },

    // Sensing
    {
        selector: 'sensing_touchingobject',
        spec: 'touching %m.sensing_touchingobjectmenu?',
        inputNames: ['TOUCHINGOBJECTMENU'],
        shape: 'predicate'
    },
    {
        selector: 'sensing_touchingcolor',
        spec: 'touching color %c?',
        inputNames: ['COLOR'],
        shape: 'predicate'
    },
    {
        selector: 'sensing_coloristouchingcolor',
        spec: 'color %c is touching %c?',
        inputNames: ['COLOR', 'COLOR2'],
        shape: 'predicate'
    },
    {
        selector: 'sensing_distanceto',
        spec: 'distance to %m.sensing_distancetomenu',
        inputNames: ['DISTANCETOMENU'],
        shape: 'reporter'
    },

    {
        selector: 'sensing_askandwait',
        spec: 'ask %s and wait',
        inputNames: ['QUESTION']
    },
    {
        selector: 'sensing_answer',
        spec: 'answer',
        shape: 'reporter'
    },

    {
        selector: 'sensing_keypressed',
        spec: 'key %m.sensing_keyoptions pressed?',
        inputNames: ['KEY_OPTION'],
        shape: 'predicate'
    },
    {
        selector: 'sensing_mousedown',
        spec: 'mouse down?',
        shape: 'predicate'
    },
    {
        selector: 'sensing_mousex',
        spec: 'mouse x',
        shape: 'reporter'
    },
    {
        selector: 'sensing_mousey',
        spec: 'mouse y',
        shape: 'reporter'
    },

    {
        selector: 'sensing_setdragmode',
        spec: 'set drag mode %m.dragMode',
        inputNames: ['DRAG_MODE']
    },

    {
        selector: 'sensing_loudness',
        spec: 'loudness',
        shape: 'reporter'
    },

    {
        selector: 'sensing_timer',
        spec: 'timer',
        shape: 'reporter'
    },
    {
        selector: 'sensing_resettimer',
        spec: 'reset timer'
    },

    {
        selector: 'sensing_of',
        spec: '%m.attribute of %m.sensing_of_object_menu',
        inputNames: ['PROPERTY', 'OBJECT'],
        shape: 'reporter'
    },

    {
        selector: 'sensing_current',
        spec: 'current %m.timeAndDate',
        inputNames: ['CURRENTMENU'],
        shape: 'reporter'
    },
    {
        selector: 'sensing_dayssince2000',
        spec: 'days since 2000',
        shape: 'reporter'
    },

    {
        selector: 'sensing_username',
        spec: 'username',
        shape: 'reporter'
    },

    // Operators
    {
        selector: 'operator_add',
        spec: '%n + %n',
        inputNames: ['NUM1', 'NUM2'],
        shape: 'reporter'
    },
    {
        selector: 'operator_subtract',
        spec: '%n - %n',
        inputNames: ['NUM1', 'NUM2'],
        shape: 'reporter'
    },
    {
        selector: 'operator_multiply',
        spec: '%n * %n',
        inputNames: ['NUM1', 'NUM2'],
        shape: 'reporter'
    },
    {
        selector: 'operator_divide',
        spec: '%n / %n',
        inputNames: ['NUM1', 'NUM2'],
        shape: 'reporter'
    },

    {
        selector: 'operator_random',
        spec: 'pick random %n to %n',
        inputNames: ['FROM', 'TO'],
        shape: 'reporter'
    },

    {
        selector: 'operator_gt',
        spec: '%s > %s',
        inputNames: ['OPERAND1', 'OPERAND2'],
        shape: 'predicate'
    },
    {
        selector: 'operator_lt',
        spec: '%s < %s',
        inputNames: ['OPERAND1', 'OPERAND2'],
        shape: 'predicate'
    },
    {
        selector: 'operator_equals',
        spec: '%s = %s',
        inputNames: ['OPERAND1', 'OPERAND2'],
        shape: 'predicate'
    },

    {
        selector: 'operator_and',
        spec: '%b and %b',
        inputNames: ['OPERAND1', 'OPERAND2'],
        shape: 'predicate'
    },
    {
        selector: 'operator_or',
        spec: '%b or %b',
        inputNames: ['OPERAND1', 'OPERAND2'],
        shape: 'predicate'
    },
    {
        selector: 'operator_not',
        spec: 'not %b',
        inputNames: ['OPERAND'],
        shape: 'predicate'
    },

    {
        selector: 'operator_join',
        spec: 'join %s %s',
        inputNames: ['STRING1', 'STRING2'],
        shape: 'reporter'
    },
    {
        selector: 'operator_letter_of',
        spec: 'letter %n of %s',
        inputNames: ['LETTER', 'STRING'],
        shape: 'reporter'
    },
    {
        selector: 'operator_length',
        spec: 'length of %s',
        inputNames: ['STRING'],
        shape: 'reporter'
    },
    {
        selector: 'operator_contains',
        spec: '%s contains %s?',
        inputNames: ['STRING1', 'STRING2'],
        shape: 'predicate'
    },

    {
        selector: 'operator_mod',
        spec: '%n mod %n',
        inputNames: ['NUM1', 'NUM2'],
        shape: 'reporter'
    },
    {
        selector: 'operator_round',
        spec: 'round %n',
        inputNames: ['NUM'],
        shape: 'reporter'
    },

    {
        selector: 'operator_mathop',
        spec: '%m.mathOp of %n',
        inputNames: ['OPERATOR', 'NUM'],
        shape: 'reporter'
    },

    // Variables
    {
        selector: 'data_variable',
        spec: '%m.var',
        inputNames: ['VARIABLE'],
        shape: 'reporter'
    },
    {
        selector: 'data_setvariableto',
        spec: 'set %m.var to %s',
        inputNames: ['VARIABLE', 'VALUE']
    },
    {
        selector: 'data_changevariableby',
        spec: 'change %m.var by %n',
        inputNames: ['VARIABLE', 'VALUE']
    },
    {
        selector: 'data_showvariable',
        spec: 'show variable %m.var',
        inputNames: ['VARIABLE']
    },
    {
        selector: 'data_hidevariable',
        spec: 'hide variable %m.var',
        inputNames: ['VARIABLE']
    },

    // Lists
    {
        category: 'list',
        selector: 'data_listcontents',
        spec: '%m.list',
        inputNames: ['LIST'],
        shape: 'reporter'
    },
    {
        category: 'list',
        selector: 'data_addtolist',
        spec: 'add %s to %m.list',
        inputNames: ['ITEM', 'LIST']
    },

    {
        category: 'list',
        selector: 'data_deleteoflist',
        spec: 'delete %n of %m.list',
        inputNames: ['INDEX', 'LIST']
    },
    {
        category: 'list',
        selector: 'data_deletealloflist',
        spec: 'delete all of %m.list',
        inputNames: ['LIST']
    },
    {
        category: 'list',
        selector: 'data_insertatlist',
        spec: 'insert %s at %n of %m.list',
        inputNames: ['ITEM', 'INDEX', 'LIST']
    },
    {
        category: 'list',
        selector: 'data_replaceitemoflist',
        spec: 'replace item %n of %m.list with %s',
        inputNames: ['INDEX', 'LIST', 'ITEM']
    },

    {
        category: 'list',
        selector: 'data_itemoflist',
        spec: 'item %n of %m.list',
        inputNames: ['INDEX', 'LIST'],
        shape: 'reporter'
    },
    {
        category: 'list',
        selector: 'data_itemnumoflist',
        spec: 'item # of %s in %m.list',
        inputNames: ['ITEM', 'LIST'],
        shape: 'reporter'
    },
    {
        category: 'list',
        selector: 'data_lengthoflist',
        spec: 'length of %m.listNonempty',
        inputNames: ['LIST'],
        shape: 'reporter'
    },
    {
        category: 'list',
        selector: 'data_listcontainsitem',
        spec: '%m.listNonempty contains %s?',
        inputNames: ['LIST', 'ITEM'],
        shape: 'predicate'
    },

    {
        category: 'list',
        selector: 'data_showlist',
        spec: 'show list %m.list',
        inputNames: ['LIST']
    },
    {
        category: 'list',
        selector: 'data_hidelist',
        spec: 'hide list %m.list',
        inputNames: ['LIST']
    },

    // Pen
    {
        selector: 'pen_clear',
        spec: 'erase all'
    },

    {
        selector: 'pen_stamp',
        spec: 'stamp'
    },
    {
        selector: 'pen_penDown',
        spec: 'pen down'
    },
    {
        selector: 'pen_penUp',
        spec: 'pen up'
    },

    {
        selector: 'pen_setPenColorToColor',
        spec: 'set pen color to %c',
        inputNames: ['COLOR']
    },
    {
        selector: 'pen_changePenColorParamBy',
        spec: 'change pen %m.pen_menu_colorParam by %n',
        inputNames: ['COLOR_PARAM', 'VALUE']
    },
    {
        selector: 'pen_setPenColorParamTo',
        spec: 'set pen %m.pen_menu_colorParam to %n',
        inputNames: ['COLOR_PARAM', 'VALUE']
    },

    {
        selector: 'pen_changePenSizeBy',
        spec: 'change pen size by %n',
        inputNames: ['SIZE']
    },
    {
        selector: 'pen_setPenSizeTo',
        spec: 'set pen size to %n',
        inputNames: ['SIZE']
    },

    // Music
    {
        selector: 'music_playDrumForBeats',
        spec: 'play drum %m.music_menu_DRUM for %n beats',
        inputNames: ['DRUM', 'BEATS']
    },
    {
        selector: 'music_restForBeats',
        spec: 'rest for %n beats',
        inputNames: ['BEATS']
    },
    {
        selector: 'music_playNoteForBeats',
        spec: 'play note %n for %n beats',
        inputNames: ['NOTE', 'BEATS']
    },
    {
        selector: 'music_setInstrument',
        spec: 'set instrument to %m.music_menu_INSTRUMENT',
        inputNames: ['INSTRUMENT']
    },

    {
        selector: 'music_setTempo',
        spec: 'set tempo to %n',
        inputNames: ['TEMPO']
    },
    {
        selector: 'music_changeTempo',
        spec: 'change tempo by %n',
        inputNames: ['TEMPO']
    },
    {
        selector: 'music_getTempo',
        spec: 'tempo',
        shape: 'reporter'
    },

    // Video Sensing
    {
        selector: 'videoSensing_whenMotionGreaterThan',
        spec: 'when video motion > %n',
        inputNames: ['REFERENCE'],
        shape: 'hat'
    },
    {
        selector: 'videoSensing_videoOn',
        spec: 'video %m.videoSensing_menu_ATTRIBUTE on %m.videoSensing_menu_SUBJECT',
        inputNames: ['ATTRIBUTE', 'SUBJECT'],
        shape: 'reporter'
    },
    {
        selector: 'videoSensing_videoToggle',
        spec: 'turn video %m.videoSensing_menu_VIDEO_STATE',
        inputNames: ['VIDEO_STATE']
    },
    {
        selector: 'videoSensing_setVideoTransparency',
        spec: 'set video transparency to %n',
        inputNames: ['TRANSPARENCY']
    },

    // Text to Speech
    {
        selector: 'text2speech_speakAndWait',
        spec: 'speak %s',
        inputNames: ['WORDS']
    },
    {
        selector: 'text2speech_setVoice',
        spec: 'set voice to %m.text2speech_menu_voices',
        inputNames: ['VOICE']
    },
    {
        selector: 'text2speech_setLanguage',
        spec: 'set language to %m.text2speech_menu_languages',
        inputNames: ['LANGUAGE']
    },

    // Translate
    {
        selector: 'translate_getTranslate',
        spec: 'translate %s to %m.translate_menu_languages',
        inputNames: ['WORDS', 'LANGUAGE'],
        shape: 'reporter'
    },
    {
        selector: 'translate_getViewerLanguage',
        spec: 'language',
        shape: 'reporter'
    },

    // Makey Makey
    {
        selector: 'makeymakey_whenMakeyKeyPressed',
        spec: 'makey makey: when %m.key key pressed',
        inputNames: ['KEY'],
        shape: 'hat'
    },
    {
        selector: 'makeymakey_whenCodePressed',
        spec: 'makey makey: when %s pressed in order',
        inputNames: ['SEQUENCE'],
        shape: 'hat'
    },

    // micro:bit
    {
        selector: 'microbit_whenButtonPressed',
        spec: 'microbit: when %m.microbit_menu_buttons button pressed',
        inputNames: ['BTN'],
        shape: 'hat'
    },
    {
        selector: 'microbit_isButtonPressed',
        spec: 'microbit: %m.microbit_menu_buttons button pressed?',
        inputNames: ['BTN'],
        shape: 'predicate'
    },
    {
        selector: 'microbit_whenGesture',
        spec: 'microbit: when %m.microbit_menu_gestures',
        inputNames: ['GESTURE'],
        shape: 'hat'
    },

    {
        selector: 'microbit_displaySymbol',
        spec: 'microbit: display %s',
        inputNames: ['MATRIX']
    },
    {
        selector: 'microbit_displayText',
        spec: 'microbit: display text %s',
        inputNames: ['TEXT']
    },
    {
        selector: 'microbit_displayClear',
        spec: 'microbit: clear display'
    },

    {
        selector: 'microbit_whenTilted',
        spec: 'microbit: when tilted %m.microbit_menu_tiltDirectionAny',
        inputNames: ['DIRECTION'],
        shape: 'hat'
    },
    {
        selector: 'microbit_isTilted',
        spec: 'microbit: tilted %m.microbit_menu_tiltDirectionAny?',
        inputNames: ['DIRECTION'],
        shape: 'predicate'
    },
    {
        selector: 'microbit_getTiltAngle',
        spec: 'microbit: tilt angle %m.microbit_menu_tiltDirection',
        inputNames: ['DIRECTION'],
        shape: 'reporter'
    },

    {
        selector: 'microbit_whenPinConnected',
        spec: 'microbit: when pin %m.microbit_menu_touchPins connected',
        inputNames: ['PIN'],
        shape: 'hat'
    },

    // EV3
    {
        selector: 'ev3_motorTurnClockwise',
        spec: 'ev3: motor %m.ev3_menu_motorPorts turn this way for %n seconds',
        inputNames: ['PORT', 'TIME']
    },
    {
        selector: 'ev3_motorTurnCounterClockwise',
        spec: 'ev3: motor %m.ev3_menu_motorPorts turn that way for %n seconds',
        inputNames: ['PORT', 'TIME']
    },
    {
        selector: 'ev3_motorSetPower',
        spec: 'ev3: motor %m.ev3_menu_motorPorts set power %n%',
        inputNames: ['PORT', 'POWER']
    },
    {
        selector: 'ev3_getMotorPosition',
        spec: 'ev3: motor %m.ev3_menu_motorPorts position',
        inputNames: ['PORT'],
        shape: 'reporter'
    },

    {
        selector: 'ev3_whenButtonPressed',
        spec: 'ev3: when button %m.ev3_menu_sensorPorts pressed',
        inputNames: ['PORT'],
        shape: 'hat'
    },
    {
        selector: 'ev3_whenDistanceLessThan',
        spec: 'ev3: when distance < %n',
        inputNames: ['DISTANCE'],
        shape: 'hat'
    },
    {
        selector: 'ev3_whenBrightnessLessThan',
        spec: 'ev3: when brightness < %n',
        inputNames: ['DISTANCE'],
        shape: 'hat'
    },

    {
        selector: 'ev3_buttonPressed',
        spec: 'ev3: button %m.ev3_menu_sensorPorts pressed?',
        inputNames: ['PORT'],
        shape: 'predicate'
    },
    {
        selector: 'ev3_getDistance',
        spec: 'ev3: distance',
        shape: 'reporter'
    },
    {
        selector: 'ev3_getBrightness',
        spec: 'ev3: brightness',
        shape: 'reporter'
    },

    {
        selector: 'ev3_beep',
        spec: 'ev3: beep note %n for %n secs',
        inputNames: ['NOTE', 'TIME']
    },

    // Boost
    {
        selector: 'boost_motorOnFor',
        spec: 'boost: turn motor %m.boost_menu_MOTOR_ID for %n seconds',
        inputNames: ['MOTOR_ID', 'DURATION']
    },
    {
        selector: 'boost_motorOnForRotations',
        spec: 'boost: turn motor %m.boost_menu_MOTOR_ID for %n rotations',
        inputNames: ['MOTOR_ID', 'ROTATION']
    },
    {
        selector: 'boost_motorOn',
        spec: 'boost: turn motor %m.boost_menu_MOTOR_ID on',
        inputNames: ['MOTOR_ID']
    },
    {
        selector: 'boost_motorOff',
        spec: 'boost: turn motor %m.boost_menu_MOTOR_ID off',
        inputNames: ['MOTOR_ID']
    },
    {
        selector: 'boost_setMotorPower',
        spec: 'boost: set motor %m.boost_menu_MOTOR_ID speed to %n%',
        inputNames: ['MOTOR_ID', 'POWER']
    },
    {
        selector: 'boost_setMotorDirection',
        spec: 'boost: set motor %m.boost_menu_MOTOR_ID direction to %m.boost_menu_MOTOR_DIRECTION',
        inputNames: ['MOTOR_ID', 'MOTOR_DIRECTION']
    },
    {
        selector: 'boost_getMotorPosition',
        spec: 'boost: motor %m.boost_menu_MOTOR_REPORTER_ID position',
        inputNames: ['MOTOR_REPORTER_ID'],
        shape: 'reporter'
    },

    {
        selector: 'boost_whenColor',
        spec: 'boost: when %m.boost_menu_COLOR brick seen',
        inputNames: ['COLOR'],
        shape: 'hat'
    },
    {
        selector: 'boost_seeingColor',
        spec: 'boost: seeing %m.boost_menu_COLOR brick?',
        inputNames: ['COLOR'],
        shape: 'predicate'
    },

    {
        selector: 'boost_whenTilted',
        spec: 'boost: when tilted %m.boost_menu_TILT_DIRECTION_ANY',
        inputNames: ['TILT_DIRECTION_ANY'],
        shape: 'hat'
    },
    {
        selector: 'boost_getTiltAngle',
        spec: 'boost: tilt angle %m.boost_menu_TILT_DIRECTION',
        inputNames: ['TILT_DIRECTION'],
        shape: 'reporter'
    },

    {
        selector: 'boost_setLightHue',
        spec: 'boost: set light color to %n',
        inputNames: ['HUE']
    },

    // WeDo
    {
        selector: 'wedo2_motorOnFor',
        spec: 'wedo: turn %m.wedo2_menu_MOTOR_ID on for %n seconds',
        inputNames: ['MOTOR_ID', 'DURATION']
    },
    {
        selector: 'wedo2_motorOn',
        spec: 'wedo: turn %m.wedo2_menu_MOTOR_ID on',
        inputNames: ['MOTOR_ID']
    },
    {
        selector: 'wedo2_motorOff',
        spec: 'wedo: turn %m.wedo2_menu_MOTOR_ID off',
        inputNames: ['MOTOR_ID']
    },
    {
        selector: 'wedo2_startMotorPower',
        spec: 'wedo: set %m.wedo2_menu_MOTOR_ID power to %n',
        inputNames: ['MOTOR_ID', 'POWER']
    },
    {
        selector: 'wedo2_setMotorDirection',
        spec: 'wedo: set %m.wedo2_menu_MOTOR_ID direction to %m.wedo2_menu_MOTOR_DIRECTION',
        inputNames: ['MOTOR_ID', 'MOTOR_DIRECTION']
    },
    {
        selector: 'wedo2_setLightHue',
        spec: 'wedo: set light color to %n',
        inputNames: ['HUE']
    },
    {
        // This block exists in Scratch but isn't visible in the palette
        selector: 'wedo2_playNoteFor',
        spec: 'wedo: play note %n for %n seconds',
        inputNames: ['NOTE', 'DURATION']
    },

    {
        selector: 'wedo2_whenDistance',
        spec: 'wedo: when distance %m.wedo2_menu_OP %n',
        inputNames: ['OP', 'REFERENCE'],
        shape: 'hat'
    },
    {
        selector: 'wedo2_whenTilted',
        spec: 'wedo: when tilted %m.wedo2_menu_TILT_DIRECTION_ANY',
        inputNames: ['TILT_DIRECTION_ANY'],
        shape: 'hat'
    },

    {
        selector: 'wedo2_getDistance',
        spec: 'wedo: distance',
        shape: 'reporter'
    },
    {
        selector: 'wedo2_isTilted',
        spec: 'wedo: tilted %m.wedo2_menu_TILT_DIRECTION_ANY?',
        inputNames: ['TILT_DIRECTION_ANY'],
        shape: 'predicate'
    },
    {
        selector: 'wedo2_getTiltAngle',
        spec: 'wedo: tilt angle %m.wedo2_menu_TILT_DIRECTION',
        inputNames: ['TILT_DIRECTION'],
        shape: 'reporter'
    },

    // Force and Acceleration
    {
        selector: 'gdxfor_whenGesture',
        spec: 'force: when %m.gdxfor_menu_gestureOptions',
        inputNames: ['GESTURE'],
        shape: 'hat'
    },
    {
        selector: 'gdxfor_whenForcePushedOrPulled',
        spec: 'force: when force sensor %m.gdxfor_menu_pushPullOptions',
        inputNames: ['PUSH_PULL'],
        shape: 'hat'
    },
    {
        selector: 'gdxfor_getForce',
        spec: 'force',
        shape: 'reporter'
    },

    {
        selector: 'gdxfor_whenTilted',
        spec: 'force: when tilted %m.gdxfor_menu_tiltAnyOptions',
        inputNames: ['TILT'],
        shape: 'hat'
    },
    {
        selector: 'gdxfor_isTilted',
        spec: 'force: is tilted %m.gdxfor_menu_tiltAnyOptions?',
        inputNames: ['TILT'],
        shape: 'predicate'
    },
    {
        selector: 'gdxfor_getTilt',
        spec: 'force: tilt angle %m.gdxfor_menu_tiltOptions',
        inputNames: ['TILT'],
        shape: 'reporter'
    },

    {
        selector: 'gdxfor_isFreeFalling',
        spec: 'force: falling?',
        shape: 'predicate'
    },
    {
        selector: 'gdxfor_getSpinSpeed',
        spec: 'force: spin speed %m.gdxfor_menu_axisOptions',
        inputNames: ['DIRECTION'],
        shape: 'reporter'
    },
    {
        selector: 'gdxfor_getAcceleration',
        spec: 'force: acceleration %m.gdxfor_menu_axisOptions',
        inputNames: ['DIRECTION'],
        shape: 'reporter'
    },

    // Custom block parameters
    {
        selector: 'argument_reporter_string_number',
        spec: '%m.param',
        inputNames: ['VALUE'],
        shape: 'reporter'
    },
    {
        selector: 'argument_reporter_boolean',
        spec: '%m.param',
        inputNames: ['VALUE'],
        shape: 'predicate'
    },

    // Ellipsis
    {
        category: 'grey',
        selector: 'ellips',
        spec: '...',
        shape: 'ellips'
    }
];

for (const block of blocks) {
    if (!block.category) {
        const opcodePrefix = block.selector.split('_')[0];
        block.category = {
            event: 'events',
            data: 'variable',
            operator: 'operators',
            music: 'extension',
            videoSensing: 'extension',
            text2speech: 'extension',
            translate: 'extension',
            makeymakey: 'extension',
            microbit: 'extension',
            ev3: 'extension',
            boost: 'extension',
            wedo2: 'extension',
            gdxfor: 'extension',
            argument: 'parameter'
        }[opcodePrefix] || opcodePrefix;
    }
    if (!block.inputNames) block.inputNames = [];
    if (!block.shape) block.shape = 'stack';
}

export default blocks;
