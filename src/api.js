import { AlphaTabApi, synth, model, ScrollMode, TabRhythmMode } from '@coderline/alphatab'
import "./api.css"

const MAX_STRING_COUNT = 6

const TabState = Object.freeze({
    Empty: 0,
    Loading: 1,
    Loaded: 2
});

class TabTrack {
    static _nextTrackId = 0;

    constructor(tabEngine, trackIndex, name, mute, solo, volume) {
        this._id = TabTrack._nextTrackId++;
        this._engine = tabEngine;
        this._index = trackIndex;
        this._name = name;
        this._mute = mute;
        this._solo = solo;
        this._volume = volume;
    }

    get name() { return this._name; }
    get id() { return this._id; }
    get index() { return this._index; }

    get isMute() { return this._mute; }
    toggleMute() {
        this._engine._changeTrackMute(this._index, !this._mute);
        this._mute = !this._mute;
    }

    get isSolo() { return this._solo; }
    toggleSolo() {
        this._engine._changeTrackSolo(this._index, !this._solo);
        this._solo = !this._solo;
    }

    get volume() { return this._volume; } // 0 - 16
    set volume(value) {
        this._volume = value;
        this._engine._changeTrackVolume(this._index, value);
    }

    get isSelected() {
        return this._engine.isSelected(this._index);
    }
}

export class TabEngine {
    _api = null;
    _onChange = null;
    _sfontLoaded = false;
    _tracks = [];

    constructor() {
        this._initVars();
    }

    init(element, onChange) {
        if (this._api) return;

        this._api = new AlphaTabApi(element, {
            core: {
                fontDirectory: 'assets/font/',
                useWorkers: true // async.render
            },
            player: {
                enablePlayer: true,
                enableCursor: true,
                scrollMode: ScrollMode.OffScreen,
                scrollElement: element.parentElement,
                enableElementHighlighting: false,
                soundFont: 'assets/cgm.sf2'
            },
            notation: {
                rhythmMode: TabRhythmMode.Hidden,
                elements: {
                    effectDynamics: false
                }
            },
            display: {
                resources: {
                    tablatureFont: "bold 14px Arial, sans-serif",
                    barNumberColor: "rgba(121, 121, 121, 1)",
                    barNumberFont: "bold 11px Arial, sans-serif",
                    markerFont: "italic bold 14px Georgia, serif",
                    staffLineColor: "rgba(183, 183, 183, 1)",
                    barSeparatorColor: "rgba(176, 176, 176, 1)",
                    mainGlyphColor: "rgba(0,0,0, 1)",
                    secondaryGlyphColor: "rgba(0,0,0, 0.4)"
                }
            }
        });

        this.setOnChange(onChange);

        this._api.scoreLoaded.on((score) => {
            score.stylesheet.bracketExtendMode = model.BracketExtendMode.NoBrackets;

            for (let track of score.tracks) {
                if (!track.isPercussion) {
                    for (let staff of track.staves) {
                        if (staff.showTablature)
                            staff.showStandardNotation = false;
                    }
                }
            }
        });

        this._api.midiLoaded.on(e => {
            this._loadSuccess();
        });

        this._api.error.on((error) => {
            this._loadFail();
        });

        this._api.playerReady.on(() => {
        });

        this._api.playerFinished.on((args) => {
            this._fireOnChange();
        });

        this._api.playerStateChanged.on((args) => {
            this._fireOnChange();
        });

        this._api.soundFontLoaded.on(() => {
            this._sfontLoaded = true;
            console.log("sound font loaded");
            this._fireOnChange();
        });

        this._api.playbackRangeChanged.on((args) => {
            if (args.playbackRange) {
                this._api.isLooping = true;
                this._fireOnChange();
            } else {
                this._api.isLooping = false;
                this._fireOnChange();
            }
        });
    }

    get tracks() { return this._tracks; }

    setOnChange(onChange) {
        this._onChange = onChange;
    }

    get isEmpty() {
        return this._state == TabState.Empty;
    }

    get isLoaded() {
        return this._state == TabState.Loaded && this._sfontLoaded;
    }

    get isLoading() {
        return this._state == TabState.Loading || !this._sfontLoaded;
    }

    get speed() {
        if (!this._api) return 1;
        return this._api.playbackSpeed;
    }

    set speed(value) {
        if (!this._api || value < 0.5 || value > this.maxSpeed) return;
        this._api.playbackSpeed = value;
        this._fireOnChange();
    }

    get maxSpeed() {
        return 1;
    }

    get isPlaying() {
        if (!this._api) return false;
        return this._api.playerState == synth.PlayerState.Playing;
    }

    playPause() {
        if (this._api && this._api.isReadyForPlayback)
            this._api.playPause();
    }

    rewind() {
        if (this._api && this._api.isReadyForPlayback) {
            this._api.stop();
            this._api.scrollToCursor();
        }
    }

    get isLoop() {
        return !!this._api?.isLooping && this._api.playbackRange;
    }

    toggleLoop() {
        if (!this._api) return;
        if (this.isLoop) this._api.playbackRange = null;
        this._api.isLooping = !this._api.isLooping;
        this._fireOnChange();
    }

    get isSolo() {
        if (!this.hasTracks) return false;
        return this._tracks[this._selectedTrack].isSolo;
    }
    toggleSolo() {
        if (!this.hasTracks) return;
        this._tracks[this._selectedTrack].toggleSolo();
    }

    get isMute() {
        if (!this.hasTracks) return false;
        return this._tracks[this._selectedTrack].isMute;
    }
    toggleMute() {
        if (!this.hasTracks) return;
        this._tracks[this._selectedTrack].toggleMute();
    }

    get volume() {
        if (!this._api) return 1;
        return this._api.masterVolume;
    }

    set volume(value) {
        if (!this._api || value < 0 || value > 1) return;
        this._api.masterVolume = value;
        this._fireOnChange();
    }

    loadTab(source) {
        if (!this._api) return;

        this.closeTab();
        this._state = TabState.Loading;
        try {
            this._api.load(source);
        } catch {
            this._state = TabState.Empty;
        }
    }

    closeTab() {
        if (!this._api) return;

        this._api.stop();
        this._api.player?.resetChannelStates();
        if (this._api.score) this._api.changeTrackVolume(this._api.score.tracks, 1);
        this._api.isLooping = false;
        this._api.playbackSpeed = 1;
        this._initVars();
        this._fireOnChange();
    }

    // tracks
    get hasTracks() {
        return (this._api && this._tracks.length > 0 && this.isLoaded);
    }

    get selectedTrackName() {
        if (!this.hasTracks) return "";
        return this._tracks[this._selectedTrack].name;
    }

    get selectedTrackIndex() {
        if (!this.hasTracks) return -1;
        return this._selectedTrack;
    }

    selectTrack(index) {
        if (!this.hasTracks ||
            index < 0 || index >= this._tracks.length)
            return;

        this._selectedTrack = index;
        this._api.renderTracks(this._buildTracksList());
        this._fireOnChange();
    }

    get tabTitle() {
        if (!this.hasTracks) return "";
        return this._api.score.title;
    }

    get tabTitleArtistString() {
        if (!this.hasTracks) return "";
        return this._api.score.title + " " + this._api.score.artist;
    }

    get position() {
        if (!this.hasTracks) return 0;
        return this._api.tickPosition;
    }

    isSelected(index) {
        return this._selectedTrack == index;
    }

    // returns TabNote[] or null
    getNotesInPlaybackRange() {
        if (!this.hasTracks || !this._api.playbackRange) return null;
        return this._getNotesInRange(this._api.playbackRange);
    }

    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    _initVars() {
        this._initTracks();
        this._state = TabState.Empty;
        this._tracks = [];
        this._selectedTrack = -1;
        this._speed = 1;
        this._startPosition = 0;
    }

    _loadSuccess() {
        if (this._state == TabState.Loaded) return;

        console.log("loadSuccess");
        this._api.playbackSpeed = 1;
        this._speed = 1;
        this._state = TabState.Loaded;
        this._reloadTracks();
        this._api.tickPosition = this._startPosition;
        this._api.scrollToCursor();
        this._fireOnChange();
    }

    _loadFail() {
        this._state = TabState.Empty;
        this._fireOnChange();
    }

    _initTracks() {
        this._tracks = [];
        this._selectedTrack = -1;
    }

    _reloadTracks() {
        this._initTracks();
        const tracks = this._api.score.tracks;

        for (let i = 0; i < tracks.length; i++) {
            const track = this._apiTrack(i);

            this._tracks.push(new TabTrack(this, i, track.name,
                track.playbackInfo.isMute,
                track.playbackInfo.isSolo,
                track.playbackInfo.volume));
        }

        if (this._tracks.length > 0) {
            this._selectedTrack = 0;
        }
    }

    _changeTrackMute(index, mute) {
        if (!this.hasTracks) return false;
        this._api.changeTrackMute([this._apiTrack(index)], mute);
        this._fireOnChange();
    }

    _changeTrackSolo(index, solo) {
        if (!this.hasTracks) return false;
        this._api.changeTrackSolo([this._apiTrack(index)], solo);
        this._fireOnChange();
    }

    _changeTrackVolume(index, volume) {
        if (!this.hasTracks) return false;
        const track = this._apiTrack(index);
        this._api.changeTrackVolume([track], volume / 16);
        this._fireOnChange();
    }

    _fireOnChange(args) {
        if (this._onChange) {
            this._onChange(args);
        }
    }

    _apiTrack(index) {
        return this._api.score.tracks[index];
    }

    _buildTracksList() {
        let list = [];
        if (this._selectedTrack >= 0)
            list.push(this._apiTrack(this._selectedTrack));
        return list;
    }
}
