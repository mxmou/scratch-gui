import {Tag, tags} from '@lezer/highlight';

export default {
    's-number': Tag.define(tags.number),
    's-menu': Tag.define(tags.string),
    's-escape': Tag.define(tags.escape),
    's-color': Tag.define(tags.color),
    's-comment': Tag.define(tags.comment),
    's-false': Tag.define(tags.bool),
    's-zero': Tag.define(),
    's-empty': Tag.define(),
    's-ellipsis': Tag.define(),

    's-motion': Tag.define(),
    's-looks': Tag.define(),
    's-sound': Tag.define(),
    's-events': Tag.define(),
    's-control': Tag.define(),
    's-sensing': Tag.define(),
    's-pen': Tag.define(),
    's-operators': Tag.define(),
    's-variable': Tag.define(),
    's-list': Tag.define(),
    's-custom': Tag.define(),
    's-extension': Tag.define(),

    's-green': Tag.define(),
    's-parameter': Tag.define(),
    's-error': Tag.define(),
    's-grey': Tag.define()
};
