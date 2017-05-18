const { Component, h } = require('preact') /** @jsx h */
const throttle = require('throttleit')

const store = require('../store')
const { getControlsVisible } = require('../store-getters')
const config = require('../../config')

// const Footer = require('./Footer') TODO
const Controls = require('./Controls')
const Header = require('./Header')
const Player = require('./Player')
const Title = require('../components/Title')

// Pages
const HomePage = require('./HomePage')
const SearchPage = require('./SearchPage')
const ArtistPage = require('./ArtistPage')
const TrackPage = require('./TrackPage')
const AlbumPage = require('./AlbumPage')
const NotFoundPage = require('./NotFoundPage')

const PAGES = {
  'home': HomePage,
  'search': SearchPage,
  'artist': ArtistPage,
  'track': TrackPage,
  'album': AlbumPage,
  'not-found': NotFoundPage
}

const APP_IDLE_TIMEOUT = 2500

class App extends Component {
  constructor (props) {
    super(props)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this._onResizeThrottled = throttle(this._onResize.bind(this), 500)
    this._onMouseMoveThrottled = throttle(this._onMouseMove.bind(this), 500)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onKeyPress = this._onKeyPress.bind(this)
  }

  componentWillMount () {
    this._onVisibilityChange()
    this._onResize()
    this._onMouseMove()
  }

  componentDidMount () {
    window.addEventListener('visibilitychange', this._onVisibilityChange)
    window.addEventListener('resize', this._onResizeThrottled)
    window.addEventListener('mousemove', this._onMouseMoveThrottled)
    window.addEventListener('keyup', this._onKeyUp)
    window.addEventListener('keypress', this._onKeyPress)
  }

  componentWillUnmount () {
    window.removeEventListener('visibilitychange', this._onVisibilityChange)
    window.removeEventListener('resize', this._onResizeThrottled)
    window.removeEventListener('mousemove', this._onMouseMoveThrottled)
    window.removeEventListener('keyup', this._onKeyUp)
    window.removeEventListener('keypress', this._onKeyPress)
  }

  render (props) {
    const { location, entity } = store

    const Page = PAGES[location.name] || PAGES['not-found']

    const title = store.app.title
      ? store.app.title + ' – ' + config.name
      : config.name

    const cursor = getControlsVisible()
      ? 'auto'
      : 'none'

    return (
      <div
        style={{
          userSelect: 'none',
          cursor
        }}
      >
        <Title title={title} />
        <Player />
        <Header />
        <Controls />
        <Page entity={entity} />
      </div>
    )
  }

  _onVisibilityChange () {
    const hidden = document.hidden
    store.dispatch('APP_HIDDEN', hidden)
  }

  _onResize () {
    const width = window.innerWidth
    const height = window.innerHeight
    store.dispatch('APP_RESIZE', { width, height })
  }

  _onMouseMove () {
    if (store.app.idle) {
      store.dispatch('APP_IDLE', false)
    }

    clearInterval(this._inactiveTimeout)
    this._inactiveTimeout = setTimeout(() => this._onInactive(), APP_IDLE_TIMEOUT)
  }

  _onInactive () {
    store.dispatch('APP_IDLE', true)
  }

  _onKeyUp (e) {
    const { location, currentTrackUrl } = store
    if (e.key === 'Escape' && currentTrackUrl && location.name !== 'track') {
      store.dispatch('LOCATION_PUSH', currentTrackUrl)
    }
  }

  _onKeyPress (e) {
    const { player, currentTrackUrl } = store
    if (e.key === ' ' && currentTrackUrl) {
      e.preventDefault() // prevent default page scroll
      store.dispatch('PLAYER_PLAYING', !player.playing)
    }
  }
}

module.exports = App
