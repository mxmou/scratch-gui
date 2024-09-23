import {EditorView, Decoration, WidgetType} from '@codemirror/view';
import {StateField, StateEffect} from '@codemirror/state';

import styles from '../../components/code-editor/code-editor.css';

class ErrorWidget extends WidgetType {
    constructor (message) {
        super();
        this.message = message;
    }

    eq (other) {
        return this.message === other.message;
    }

    toDOM () {
        return Object.assign(document.createElement('div'), {
            className: styles.errorWidget,
            textContent: this.message
        });
    }
}

const setErrorWidget = StateEffect.define();

const errorWidget = StateField.define({
    create: () => Decoration.none,
    update: (value, transaction) => {
        value = value.map(transaction.changes);
        for (const effect of transaction.effects) {
            if (effect.is(setErrorWidget)) {
                if (effect.value) {
                    const line = transaction.state.doc.line(effect.value.lineNumber);
                    value = Decoration.set(Decoration.widget({
                        widget: new ErrorWidget(effect.value.message),
                        block: true,
                        side: 1
                    }).range(line.to));
                } else {
                    value = Decoration.none;
                }
            }
        }
        return value;
    },
    provide: field => EditorView.decorations.from(field)
});

export {
    setErrorWidget,
    errorWidget
};
