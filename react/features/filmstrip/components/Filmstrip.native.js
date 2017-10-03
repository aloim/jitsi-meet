/* @flow */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';

import { Container } from '../../base/react';

import Thumbnail from './Thumbnail';
import { styles } from './_';
import {PORTRAIT} from '../../mobile/orientation/constants';

import { MediaQuerySelector, responsive } from 'react-native-responsive-ui';

/**
 * Implements a React {@link Component} which represents the filmstrip on
 * mobile/React Native.
 *
 * @extends Component
 */
class Filmstrip extends Component {
    /**
     * Filmstrip component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         *
         */
        _orientation: React.PropTypes.symbol,
        /**
         * The participants in the conference.
         *
         * @private
         * @type {Participant[]}
         */
        _participants: PropTypes.array,

        /**
         * The indicator which determines whether the filmstrip is visible.
         *
         * @private
         * @type {boolean}
         */
        _visible: PropTypes.bool.isRequired
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Container
                style = { this._getStyle() }
                visible = { this.props._visible }>
                <ScrollView

                    // eslint-disable-next-line react/jsx-curly-spacing
                    contentContainerStyle = {
                        this.props._orientation === PORTRAIT
                            ? styles.filmstripScrollViewContentContainer
                            : styles.landscapeFilmstripScrollViewContentContainer
                    } // eslint-disable-line react/jsx-curly-spacing
                    horizontal = { Boolean(this.props._orientation === PORTRAIT) }
                    showsHorizontalScrollIndicator = { false }
                    showsVerticalScrollIndicator = { false }>
                    {
                        this._sort(this.props._participants)
                            .map(p =>
                                <Thumbnail
                                    key = { p.id }
                                    participant = { p } />)
                    }
                </ScrollView>
            </Container>
        );
    }

    _getStyle() {
        const { width, height } = this.state.window;
        const query = MediaQuerySelector.query(
            { orientation: 'portrait' },
            width, height);

        console.info('QUERY', width, height, query);

        return query
            ? styles.filmstrip
            : styles.landscapeFilmstrip;
    }

    /**
     * Sorts a specific array of {@code Participant}s in display order.
     *
     * @param {Participant[]} participants - The array of {@code Participant}s
     * to sort in display order.
     * @private
     * @returns {Participant[]} A new array containing the elements of the
     * specified {@code participants} array sorted in display order.
     */
    _sort(participants) {
        // XXX Array.prototype.sort() is not appropriate because (1) it operates
        // in place and (2) it is not necessarily stable.

        const sortedParticipants = [];

        // Group the remote participants so that the local participant does not
        // appear in between remote participants. Have the remote participants
        // from right to left with the newest added/joined to the leftmost side.
        for (let i = participants.length - 1; i >= 0; --i) {
            const p = participants[i];

            p.local || sortedParticipants.push(p);
        }

        // Have the local participant at the rightmost side.
        for (let i = participants.length - 1; i >= 0; --i) {
            const p = participants[i];

            p.local && sortedParticipants.push(p);
        }

        return sortedParticipants;
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {{
 *     _participants: Participant[],
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const { orientation } = state['features/mobile/orientation'];

    return {
        /**
         * The participants in the conference.
         *
         * @private
         * @type {Participant[]}
         */
        _participants: state['features/base/participants'],

        /**
         * The indicator which determines whether the filmstrip is visible.
         *
         * XXX The React Component Filmstrip is used on mobile only at the time
         * of this writing and on mobile the filmstrip is visible when the
         * toolbar is not.
         *
         * @private
         * @type {boolean}
         */
        _visible: true,

        /**
         *
         */
        _orientation: orientation
    };
}

export default connect(_mapStateToProps)(responsive(Filmstrip));
