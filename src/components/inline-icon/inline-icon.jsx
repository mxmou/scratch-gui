import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';

import styles from './inline-icon.css';

class InlineIcon extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setElement'
        ]);
        this.element = null;
        this.svgElement = null;
    }
    componentDidMount () {
        this.updateIcon();
    }
    componentDidUpdate (prevProps) {
        if (
            this.props.alt !== prevProps.alt
            || this.props.className !== prevProps.className
            || this.props.src !== prevProps.src
            || this.props.title !== prevProps.title
        ) {
            this.updateIcon();
        }
    }
    setElement (element) {
        this.element = element;
    }
    updateIcon () {
        fetch(this.props.src).then(response => {
            response.text().then(responseText => {
                if (this.svgElement) {
                    this.svgElement.remove();
                }
                const svgDocument = new DOMParser().parseFromString(responseText, 'image/svg+xml');
                if (this.props.title) {
                    svgDocument.title = this.props.title;
                } else if (svgDocument.querySelector("title")) {
                    svgDocument.querySelector("title").remove();
                }
                this.svgElement = svgDocument.documentElement;
                if (this.props.className) {
                    this.svgElement.setAttribute('class', this.props.className);
                }
                if (this.props.alt) {
                    this.svgElement.setAttribute('role', 'img');
                    this.svgElement.setAttribute('aria-label', this.props.alt);
                } else {
                    this.svgElement.setAttribute('aria-hidden', true);
                }
                this.element.appendChild(this.svgElement);
            })
        });
    }
    render () {
        return (
            <span
                className={styles.container}
                ref={this.setElement}
            />
        );
    }
}

InlineIcon.propTypes = {
    alt: PropTypes.string,
    className: PropTypes.string,
    src: PropTypes.string.isRequired,
    title: PropTypes.string
};

export default InlineIcon;
